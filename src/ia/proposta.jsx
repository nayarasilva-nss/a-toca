import { chamarIA, extrairJSON } from "./base.jsx";
import { metaFoco, PROMPT_SEM_FOCO } from "../nucleo/focos.jsx";
import { resumoCampo } from "./campo.jsx";
import { FRAMEWORK_DIAG, percentualArea } from "./diagnostico.jsx";
import { TEMPERAMENTOS } from "./documentos.jsx";

// ─── IA: Proposta Comercial ─────────────────────────────────────

export async function gerarProposta(cliente, prop, gestao, diags, pessoas, registrosCampo, mentoria) {
  const achadosCampo = resumoCampo(registrosCampo || [], "geral").slice(0, 500);

  if (cliente.tipo === "pessoa") {
    const mentorado = (pessoas || []).find((p) => p.contratante && p.dominante && TEMPERAMENTOS[p.dominante]);
    const jornada = ((mentoria && mentoria.encontros) || []).map((e, i) => `${i + 1}. ${e.tema}${e.objetivo ? ` - ${e.objetivo}` : ""}`).join("\n");
    const focoP = metaFoco(mentoria);
    const promptMentoria = `Voce e mentora de desenvolvimento humano, especialista em temperamentos e ${focoP ? focoP.especialidade : "crescimento pessoal"}.
${focoP ? focoP.prompt : PROMPT_SEM_FOCO} Escreva a PROPOSTA DE MENTORIA INDIVIDUAL abaixo - calorosa, profissional e direta, falando COM a pessoa (nao sobre uma empresa). Adapte o conteudo ao PAPEL REAL do mentorado - nunca presuma que e dono nem que almeja lideranca.${focoAutoP ? " FOCO DA MENTORIA: autoconhecimento e crescimento pessoal - a promessa e uma pessoa que se sustenta sem o mentor." : ""}

MENTORADO
Nome: ${cliente.negocio}
Atuacao: ${cliente.segmento}
Contexto e objetivos: ${cliente.contexto || "nao informado"}
${mentoria && mentoria.objetivos ? `Objetivos declarados: ${mentoria.objetivos}` : ""}
${mentoria && mentoria.briefing ? `Briefing da conversa inicial: ${mentoria.briefing}` : ""}
${mentorado ? `Temperamento mapeado: ${TEMPERAMENTOS[mentorado.dominante].rotulo} - calibre o TOM da proposta a esse perfil sem citar temperamentos.` : ""}
${jornada ? `Jornada ja desenhada (use como estrutura das fases):\n${jornada}` : ""}

PARAMETROS DEFINIDOS PELA MENTORA (use exatamente, nunca invente valores)
Duracao: ${prop.duracao || "a definir"}
Investimento: ${prop.investimento || "a definir"}
Condicoes de pagamento: ${prop.condicoesPagamento || "a combinar"}
Validade da proposta: ${prop.validade || "15 dias"}
Observacoes: ${prop.obs || "nenhuma"}

Responda APENAS com JSON compacto de uma linha:
{"ap":"apresentacao pessoal da mentoria em 2-3 frases","obj":"objetivo da mentoria para ESTE mentorado em 2-3 frases","fa":"fases/encontros da jornada, um por linha","en":"o que o mentorado leva (entregaveis e ganhos), um por linha","me":"metodologia em 2-3 frases citando a ciencia dos temperamentos","cg":"condicoes gerais em 2-4 frases usando os parametros"}
Sem markdown, sem texto fora do JSON.`;
    const textoM = await chamarIA(promptMentoria);
    const objM = extrairJSON(textoM, "{", "}");
    return {
      apresentacao: objM.ap || "",
      objetivo: objM.obj || "",
      fases: objM.fa || "",
      entregaveis: objM.en || "",
      metodologia: objM.me || "",
      condicoesGerais: objM.cg || "",
    };
  }

  const frentes = (gestao && gestao.frentes) || [];
  const listaFrentes = frentes.map((f) => `${f.nome}${f.escopo ? ` (${f.escopo})` : ""}`).join("; ") || "não mapeadas";

  const ultimoDiag = (diags || []).length ? diags[diags.length - 1] : null;
  let blocoDiag = "Diagnóstico de maturidade: ainda não realizado.";
  if (ultimoDiag) {
    const areas = FRAMEWORK_DIAG.map((a, i) => {
      const p = percentualArea(ultimoDiag.notas, i);
      return p === null ? null : `${a.area}: ${p}%`;
    }).filter(Boolean).join("; ");
    blocoDiag = `Diagnóstico de maturidade (${ultimoDiag.data}): ${areas || "sem notas"}.${ultimoDiag.criticos ? ` Pontos críticos: ${ultimoDiag.criticos.split("\n").join("; ")}` : ""}`;
  }

  const dono = (pessoas || []).find((p) => p.contratante && p.dominante && TEMPERAMENTOS[p.dominante]);
  const blocoDono = dono
    ? `Temperamento do contratante: dominante ${TEMPERAMENTOS[dono.dominante].rotulo}${dono.secundario && TEMPERAMENTOS[dono.secundario] ? `, secundário ${TEMPERAMENTOS[dono.secundario].rotulo}` : ""}. Calibre o TOM do texto para esse temperamento (colérico: direto e focado em resultado; melancólico: método e detalhamento; sanguíneo: visão e entusiasmo; fleumático: segurança e passo a passo) — sem citar temperamentos no texto.`
    : "Temperamento do contratante não mapeado — use tom equilibrado.";

  const prompt = `Você é especialista em consultoria de governança para PMEs brasileiras, redigindo a proposta comercial da consultora Nayara Silva para o cliente abaixo. Texto profissional, confiante e sem promessas irreais.

CLIENTE
Negócio: ${cliente.negocio}
Segmento: ${cliente.segmento}
Contexto e dores: ${cliente.contexto || "não informado"}
Briefing: ${(gestao && gestao.briefing) || "não registrado"}
Frentes identificadas: ${listaFrentes}
${blocoDiag}
${blocoDono}

PARÂMETROS DA PROPOSTA
Duração prevista: ${prop.duracao || "a definir"}
Observações da consultora: ${prop.obs || "nenhuma"}

${achadosCampo ? `ACHADOS DE CAMPO (se houver, cite 1-2 achados concretos na apresentação/objetivo como evidência do diagnóstico — sem citar nomes de pessoas): ${achadosCampo}` : ""}
Responda APENAS com JSON compacto de uma linha:
{"ap":"apresentação — leitura do momento do cliente conectada às dores/diagnóstico (2-3 frases)","ob":"objetivo do trabalho (1-2 frases)","fa":["fases no formato 'Fase N — nome — o que inclui — duração estimada' (2 a 4 fases coerentes com as frentes)"],"en":["5 a 9 entregáveis concretos (documentos, estruturas, treinamentos)"],"me":"metodologia de trabalho, incluindo a ciência dos temperamentos como diferencial (2-3 frases)","cg":"condições gerais — o que a proposta não inclui e premissas de trabalho (2-3 frases)"}
Sem markdown, sem texto fora do JSON.`;

  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  const linhas = (v) => (Array.isArray(v) ? v.join("\n") : v || "");
  return {
    apresentacao: obj.ap || "",
    objetivo: obj.ob || "",
    fases: linhas(obj.fa),
    entregaveis: linhas(obj.en),
    metodologia: obj.me || "",
    condicoesGerais: obj.cg || "",
  };
}

// ─── IA: Proposta de desenvolvimento de sistema ─────────────────

export async function gerarPropostaSistema(cliente, prop, sistema) {
  const escopo = (sistema.escopo || []).map((i) => i.texto).filter(Boolean);
  const fora = String(sistema.foraEscopo || "").split("\n").map((l) => l.trim()).filter(Boolean);
  const fornecido = (sistema.fornecidoCliente || []).map((i) => i.texto).filter(Boolean);
  const prompt = `Você é Nayara Silva, que desenvolve sistemas personalizados para pequenos negócios brasileiros (stack web moderna, entrega rápida, licença de uso ao cliente). Redija a proposta comercial abaixo: direta, concreta, em português claro, sem jargão técnico desnecessário e sem promessas vagas. O cliente é dono de negócio, não programador.

CLIENTE
Negócio: ${cliente.negocio}
Segmento: ${cliente.segmento}
Contexto: ${cliente.contexto || "não informado"}

SISTEMA
Nome: ${sistema.nome || prop.titulo || "a definir"}
Briefing (o problema a resolver): ${sistema.briefing || "não registrado"}
Escopo definido pela desenvolvedora (NÃO invente itens além destes; pode detalhar cada um em uma frase):
${escopo.map((e) => `- ${e}`).join("\n") || "- (vazio — sugira 4 a 7 itens coerentes com o briefing, marcando-os como sugestão)"}
Fora do escopo: ${fora.join("; ") || "não informado"}
Fornecido pelo cliente: ${fornecido.join("; ") || "não informado"}
Stack: ${sistema.stack || "não informada"}
Prazo: ${prop.duracao || (sistema.prazoSemanas ? `${sistema.prazoSemanas} semanas` : "a definir")}
${(prop.opcoes || []).length ? `OPÇÕES OFERECIDAS (o cliente escolhe uma; a apresentação deve mencionar que há mais de um caminho):\n${prop.opcoes.map((o) => `- ${o.nome}: ${o.titulo || ""} — ${o.descricao || ""} · ${o.investimento || "valor a definir"}${o.mensalidade ? ` + R$ ${o.mensalidade}/mês` : ""}${o.prazo ? ` · ${o.prazo}` : ""}`).join("\n")}` : `Implantação + desenvolvimento: ${prop.investimento || "a definir"} · Mensalidade: ${prop.mensalidade ? `R$ ${prop.mensalidade}/mês` : "a definir"}`}
Condições de pagamento: ${prop.condicoesPagamento || "50% no aceite e 50% na entrega"}
Observações: ${prop.obs || "nenhuma"}

Responda APENAS com JSON compacto de uma linha:
{"ap":"apresentação em 2-3 frases: o que o cliente vive hoje e o que muda com o sistema","ob":"objetivo em 1-2 frases","es":["escopo, um item por linha, cada um nomeado e explicado em até 15 palavras"],"fe":["fora do escopo, um por linha, só o que foi informado ou é implicação direta dele"],"fc":["fornecido pelo cliente, um por linha"],"cg":["condições gerais, 3 a 5 linhas: licença de uso (código permanece com a desenvolvedora), o que a mensalidade cobre, uma rodada de ajustes, prazo conta a partir do material do cliente"]}
Sem markdown, sem texto fora do JSON.`;
  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  const linhas = (v) => (Array.isArray(v) ? v.join("\n") : v || "");
  return {
    apresentacao: obj.ap || "",
    objetivo: obj.ob || "",
    entregaveis: linhas(obj.es),
    foraEscopo: linhas(obj.fe),
    fornecidoCliente: linhas(obj.fc),
    condicoesGerais: linhas(obj.cg),
  };
}
