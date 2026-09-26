import { chamarIA, extrairJSON } from "./base.jsx";
import { TEMPERAMENTOS } from "./documentos.jsx";
import { STATUS_FRENTE, uid } from "../nucleo/base.jsx";

// ─── Trabalho de Campo: modelo e resumos ────────────────────────

export const MARCAS_TURNO = {
  processo: { rotulo: "Processo", cor: "#9A6A2F", fundo: "#F5E6C8" },
  pessoa: { rotulo: "Pessoa", cor: "#4A6B8A", fundo: "#DCE8F0" },
  risco: { rotulo: "Risco", cor: "#8A3A2E", fundo: "#F0DCD2" },
  oportunidade: { rotulo: "Oportunidade", cor: "#4F6B3A", fundo: "#E3EBD8" },
};

export const TIPOS_CAMPO = {
  visita: { rotulo: "Visita Técnica", curto: "Visita" },
  entrevista: { rotulo: "Entrevista de Função", curto: "Entrevista" },
  turno: { rotulo: "Acompanhamento de Turno", curto: "Turno" },
};

export function campoVazio(tipo) {
  const base = { id: uid(), tipo, data: new Date().toLocaleDateString("pt-BR"), titulo: "" };
  if (tipo === "visita") return { ...base, roteiro: "", observado: "", informalidades: "", riscos: "", pontosFortes: "" };
  if (tipo === "entrevista") return { ...base, entrevistado: "", funcao: "", roteiro: "", atividades: "", fazNaoDeveria: "", deveriaNaoFaz: "", dores: "" };
  return { ...base, setor: "", linhas: [] };
}

export function resumoCampo(registros, foco) {
  if (!registros || !registros.length) return "";
  const partes = [];
  for (const r of registros) {
    if (r.tipo === "visita") {
      if (foco !== "riscos" && (r.observado || r.informalidades)) partes.push(`Visita ${r.data}${r.titulo ? ` (${r.titulo})` : ""}: ${[r.observado, r.informalidades && `informalidades: ${r.informalidades}`].filter(Boolean).join("; ")}`);
      if (foco !== "processos" && r.riscos) partes.push(`Riscos vistos em visita ${r.data}: ${r.riscos}`);
      if (foco === "geral" && r.pontosFortes) partes.push(`Pontos fortes (${r.data}): ${r.pontosFortes}`);
    }
    if (r.tipo === "entrevista" && foco !== "riscos") {
      const linha = [r.atividades && `faz: ${r.atividades}`, r.fazNaoDeveria && `faz sem ser da função: ${r.fazNaoDeveria}`, r.deveriaNaoFaz && `deveria e não faz: ${r.deveriaNaoFaz}`, r.dores && `dores: ${r.dores}`].filter(Boolean).join("; ");
      if (linha) partes.push(`Entrevista ${r.entrevistado || "colaborador"} (${r.funcao || "função não informada"}, ${r.data}): ${linha}`);
    }
    if (r.tipo === "turno") {
      const relevantes = (r.linhas || []).filter((l) => l.texto && (foco === "geral" || (foco === "riscos" ? l.marca === "risco" : l.marca === "processo" || l.marca === "oportunidade")));
      if (relevantes.length) partes.push(`Turno ${r.data}${r.setor ? ` (${r.setor})` : ""}: ${relevantes.map((l) => `${l.hora ? l.hora + " " : ""}[${(MARCAS_TURNO[l.marca] || {}).rotulo || l.marca}] ${l.texto}`).join("; ")}`);
    }
  }
  const texto = partes.join("\n");
  return texto.length > 1600 ? texto.slice(0, 1600) + " (...)" : texto;
}


// ─── IA: roteiros de campo ──────────────────────────────────────

export async function gerarRoteiroVisita(cliente, frentes, cctPontos, reg, anteriores) {
  const historicoVisitas = (anteriores || [])
    .filter((r) => r.tipo === "visita" && r.id !== reg.id && (r.observado || r.riscos))
    .map((r) => `${r.data}: ${[r.observado && `visto: ${r.observado}`, r.riscos && `riscos: ${r.riscos}`].filter(Boolean).join("; ")}`)
    .join("\n")
    .slice(0, 600);
  const listaFrentes = (frentes || []).map((f) => `${f.nome} (${f.escopo || "sem escopo"})`).join("; ") || "nenhuma";
  const listaCCT = (cctPontos || []).slice(0, 10).map((p) => `${p.tema}: ${p.exigencia}`).join("; ") || "não analisada";
  const prompt = `Você é consultora de governança de PMEs brasileiras preparando uma VISITA TÉCNICA de observação in loco. Gere o roteiro de observação — o que olhar, onde, e que evidências buscar. Observação real, não checklist genérico.

CLIENTE
Negócio: ${cliente.negocio} (${cliente.segmento})
Setores: ${cliente.setores || "não informado"}
Frentes abertas da consultoria: ${listaFrentes}
Pontos da CCT a verificar na prática: ${listaCCT}
Foco desta visita (se definido pela consultora): ${reg.titulo || "geral"}
${historicoVisitas ? `VISITAS ANTERIORES (não repita o que já foi visto; inclua follow-up: verificar se os riscos apontados persistem):\n${historicoVisitas}` : ""}

Regras:
- 8 a 14 pontos de observação, concretos e verificáveis a olho (ex.: "cronometrar intervalo real de almoço de 2 colaboradores", não "verificar clima organizacional").
- Se há frente de Processos, inclua fluxo real de produção, gargalos e retrabalho. Se a CCT regula intervalos/jornada/EPIs, inclua verificação prática.
- Inclua ao menos 1 ponto de informalidade documental (quadro de avisos, controles em papel, combinados verbais).

Responda APENAS com JSON compacto de uma linha:
{"r":["um ponto de observação por item"]}
Sem markdown, sem texto fora do JSON.`;
  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  return (obj.r || []).filter(Boolean).join("\n");
}

export async function gerarRoteiroEntrevista(cliente, reg, cargos) {
  const cargoRef = (cargos || []).find((cg) => cg.nome && reg.funcao && (cg.nome.toLowerCase().includes(reg.funcao.toLowerCase()) || reg.funcao.toLowerCase().includes(cg.nome.toLowerCase())));
  const blocoCargo = cargoRef
    ? `Já existe descrição em rascunho deste cargo — use-a para confrontar papel × realidade:
Sumária: ${cargoRef.sumaria || "—"}
Atividades descritas: ${cargoRef.atividades || "—"}`
    : "A função ainda não foi mapeada — roteiro aberto de descoberta.";
  const prompt = `Você é consultora de governança de PMEs brasileiras preparando uma ENTREVISTA DE FUNÇÃO — conversa com um colaborador para entender o que ele REALMENTE faz (não o que o papel diz).

CLIENTE
Negócio: ${cliente.negocio} (${cliente.segmento})
Função a entrevistar: ${reg.funcao || "não informada"}
${blocoCargo}

Regras:
- 8 a 12 perguntas abertas, em linguagem simples de chão de operação (o entrevistado pode ter baixa escolaridade).
- Cubra: rotina real do dia, o que faz que não deveria ser dele, o que deveria fazer e não consegue, de quem recebe ordem na prática, o que trava o trabalho dele, o que ele faria diferente.
- Nada de pergunta que induza resposta ou soe como auditoria — tom de escuta.

Responda APENAS com JSON compacto de uma linha:
{"p":["uma pergunta por item"]}
Sem markdown, sem texto fora do JSON.`;
  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  return (obj.p || []).filter(Boolean).join("\n");
}

export async function gerarPlanoAcao(cliente, briefing, pessoas, riscosCampo) {
  const dono = (pessoas || []).find((p) => p.contratante && p.dominante && TEMPERAMENTOS[p.dominante]);
  const blocoDono = dono
    ? `\nCONTRATANTE (temperamento mapeado pela consultora): dominante ${TEMPERAMENTOS[dono.dominante].rotulo}${dono.secundario && TEMPERAMENTOS[dono.secundario] ? `, secundário ${TEMPERAMENTOS[dono.secundario].rotulo}` : ""}.
Molde o plano a esse perfil SEM jamais citar temperamentos no texto: colérico → comece cada frente por ações de resultado visível e rápido, passos curtos e objetivos; melancólico → comece pela estruturação e método, explicite a lógica da sequência; sanguíneo → inclua marcos visíveis e celebráveis ao longo do caminho, varie o tipo de ação; fleumático → mudanças graduais, um passo consolidado antes do próximo, sem rupturas bruscas.\n`
    : "";

  const prompt = `Você é especialista em governança e estruturação de pequenas e médias empresas brasileiras. A consultora fez uma reunião de briefing com o cliente. A partir das anotações, identifique as FRENTES DE TRABALHO da consultoria e o plano de ação de cada uma.

CLIENTE
Negócio: ${cliente.negocio}
Segmento: ${cliente.segmento}
Setores/áreas: ${cliente.setores || "não informado"}
${blocoDono}${riscosCampo ? `\nRISCOS OBSERVADOS EM CAMPO (transforme os relevantes em ações nas frentes correspondentes):\n${riscosCampo}\n` : ""}
ANOTAÇÕES DO BRIEFING
${briefing}

Frentes típicas (use apenas as que o briefing sustenta; renomeie ou crie outras se fizer sentido): Pessoas, Processos Operacionais, Governança e Papéis, Financeiro, Cultura e Disciplina.

Responda APENAS com JSON compacto de uma linha:
{"f":[{"n":"nome da frente","s":"nao_iniciada|em_andamento|formalizada (maturidade ATUAL do cliente nessa frente)","e":"escopo do trabalho em 1 frase","a":[{"t":"ação concreta e curta","pq":"justificativa em poucas palavras (por que esta ação importa)"}] com 3 a 6 ações em ordem de execução}]}
Sem markdown, sem texto fora do JSON.`;

  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  return (obj.f || [])
    .filter((f) => f && f.n)
    .map((f) => ({
      id: uid(),
      nome: f.n,
      status: STATUS_FRENTE[f.s] ? f.s : "nao_iniciada",
      escopo: f.e || "",
      acoes: (Array.isArray(f.a) ? f.a : []).map((a) =>
        typeof a === "string"
          ? { id: uid(), texto: a, feita: false }
          : { id: uid(), texto: a.t || "", porque: a.pq || "", feita: false }
      ),
    }));
}
