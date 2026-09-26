import { chamarIA, extrairJSON } from "./base.jsx";
import { TEMPERAMENTOS } from "./documentos.jsx";
import { STATUS_FRENTE, uid } from "../nucleo/base.jsx";

// ─── IA: Ritos de Gestão ────────────────────────────────────────

export async function gerarRitos(cliente, obs, cargos, indicadores) {
  const listaCargos = cargos.map((c) => c.nome).filter(Boolean).join(", ") || "nenhum cadastrado";
  const listaInd = (indicadores || []).map((i) => `${i.nome} (${i.area}, ${i.frequencia})`).join("; ") || "ainda não definidos";
  const prompt = `Você é especialista em governança de pequenas e médias empresas brasileiras. Defina a cadência de RITOS DE GESTÃO do cliente: as reuniões fixas que fazem a gestão acontecer sem depender do dono lembrar.

CLIENTE
Negócio: ${cliente.negocio}
Segmento: ${cliente.segmento}
Setores: ${cliente.setores || "não informado"}
Cargos: ${listaCargos}
Indicadores definidos (cite-os nas pautas quando fizer sentido): ${listaInd}
Observações da consultora: ${obs || "nenhuma"}

Regras:
- 3 a 5 ritos, do operacional ao estratégico (ex.: alinhamento diário rápido, semanal de líderes, mensal de resultados).
- Duração realista e curta — PME não tem gordura de agenda.
- Pauta padrão de 3 a 6 itens por rito, sempre os mesmos itens, para virar hábito.
- Nos ritos semanais/mensais, um dos itens da pauta DEVE ser "Anomalias da semana: relatadas, causas e ações".

Responda APENAS com JSON compacto de uma linha:
{"r":[{"n":"nome do rito","f":"frequência e momento (ex.: diária, 15h, antes do turno)","d":"duração","p":"participantes","pa":["itens da pauta padrão"]}]}
Sem markdown, sem texto fora do JSON.`;

  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  return (obj.r || [])
    .filter((x) => x && x.n)
    .map((x) => ({
      id: uid(),
      nome: x.n,
      frequencia: x.f || "",
      duracao: x.d || "",
      participantes: x.p || "",
      pauta: Array.isArray(x.pa) ? x.pa.join("\n") : x.pa || "",
    }));
}

export async function gerarAtualizacaoPlano(cliente, gestao, ultimaAta, pessoas, riscosCampo) {
  const frentes = gestao.frentes || [];
  const linhasFrentes = frentes
    .map((f, i) => {
      const acoes = (f.acoes || [])
        .map((a) => `${a.feita ? "[feita]" : "[pendente]"} ${a.texto}`)
        .join("; ");
      return `${i + 1}. ${f.nome} (status: ${STATUS_FRENTE[f.status] ? STATUS_FRENTE[f.status].rotulo : f.status}) — ações: ${acoes || "nenhuma"}`;
    })
    .join("\n");

  const blocoAta = ultimaAta
    ? `\nÚLTIMA ATA DE ALINHAMENTO (${ultimaAta.data || "sem data"} — ${ultimaAta.nome || "reunião"}):
Resumo: ${ultimaAta.resumo || "—"}
Decisões: ${(ultimaAta.decisoes || "").split("\n").join("; ") || "—"}
Ações acordadas: ${(ultimaAta.acoes || "").split("\n").join("; ") || "—"}\n`
    : "\n(nenhuma ata de alinhamento registrada)\n";

  const dono = (pessoas || []).find((p) => p.contratante && p.dominante && TEMPERAMENTOS[p.dominante]);
  const blocoDono = dono
    ? `Contratante: dominante ${TEMPERAMENTOS[dono.dominante].rotulo} — molde novas ações a esse perfil sem citar temperamentos (colérico: resultado rápido; melancólico: método explícito; sanguíneo: marcos celebráveis; fleumático: passos graduais).`
    : "";

  const prompt = `Você é especialista em governança de PMEs brasileiras. A consultora fez uma REUNIÃO DE ALINHAMENTO e precisa ATUALIZAR o plano de ação do cliente — preservando todo o progresso já registrado.

CLIENTE
Negócio: ${cliente.negocio} (${cliente.segmento})
Briefing original: ${gestao.briefing || "não registrado"}
${blocoDono}

PLANO ATUAL (frentes numeradas, com status e ações)
${linhasFrentes || "nenhuma frente"}
${blocoAta}${riscosCampo ? `RISCOS OBSERVADOS EM CAMPO (transforme os relevantes em ações, sem duplicar as existentes):\n${riscosCampo}\n` : ""}
Responda APENAS com as MUDANÇAS, em JSON compacto de uma linha:
{"na":[{"f":número da frente,"a":["novas ações curtas a acrescentar nessa frente"]}],"st":[{"f":número,"s":"nao_iniciada|em_andamento|formalizada"} apenas se a ata evidenciar mudança de status],"nf":[{"n":"nome de frente NOVA que a ata revelou","s":"nao_iniciada|em_andamento|formalizada","e":"escopo em 1 frase","a":["2 a 5 ações"]}]}
Regras: nunca remova nem reescreva ações existentes; não repita ação que já existe; se nada mudou em uma frente, não a mencione; máximo 3 frentes novas.
Sem markdown, sem texto fora do JSON.`;

  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");

  const novasFrentes = frentes.map((f, i) => {
    const n = i + 1;
    const st = (obj.st || []).find((x) => Number(x.f) === n);
    const na = (obj.na || []).find((x) => Number(x.f) === n);
    const existentes = new Set((f.acoes || []).map((a) => a.texto.trim().toLowerCase()));
    const acrescimos = na && Array.isArray(na.a)
      ? na.a.filter((t) => t && !existentes.has(String(t).trim().toLowerCase())).map((t) => ({ id: uid(), texto: t, feita: false }))
      : [];
    return {
      ...f,
      status: st && STATUS_FRENTE[st.s] ? st.s : f.status,
      acoes: [...(f.acoes || []), ...acrescimos],
    };
  });

  const inéditas = (obj.nf || [])
    .filter((f) => f && f.n)
    .slice(0, 3)
    .map((f) => ({
      id: uid(),
      nome: f.n,
      status: STATUS_FRENTE[f.s] ? f.s : "nao_iniciada",
      escopo: f.e || "",
      acoes: (Array.isArray(f.a) ? f.a : []).map((a) => ({ id: uid(), texto: a, feita: false })),
    }));

  return [...novasFrentes, ...inéditas];
}
