import { LIMITES_LEGAIS, chamarIA, extrairJSON } from "./base.jsx";
import { resumoCampo } from "./campo.jsx";
import { blocoCCT } from "./cct.jsx";
import { GRAVIDADES, TABELA_MAE, uid } from "../nucleo/base.jsx";

// ─── IA: Tabela Disciplinar ─────────────────────────────────────

export async function gerarInfracoes(cliente, cctPontos, registrosCampo) {
  const praticasVistas = resumoCampo(registrosCampo, "geral").slice(0, 700);
  const maeNumerada = TABELA_MAE.map(
    (m, idx) => `${idx + 1}. [${m.setor}] ${m.infracao} (${m.gravidade})`
  ).join("\n");

  const prompt = `Você é especialista em governança para pequenas e médias empresas brasileiras. Abaixo está a TABELA-MÃE de infrações disciplinares (catálogo de referência da consultora, base restaurante). Adapte-a ao cliente descrito.

TABELA-MÃE
${maeNumerada}

CLIENTE
Negócio: ${cliente.negocio}
Segmento: ${cliente.segmento}
Setores/áreas: ${cliente.setores || "não informado"}
Regras próprias da casa: ${cliente.regras || "não informado"}
Contexto e dores relatadas: ${cliente.contexto || "não informado"}
${praticasVistas ? `Práticas observadas em campo pela consultora (infrações que existem na prática merecem entrada na tabela): ${praticasVistas}` : ""}

TAREFA — responda APENAS com as ADAPTAÇÕES necessárias, em JSON compacto de uma linha:
{"rm":[números de itens que NÃO se aplicam a este cliente],"ed":[{"n":número,"i":"novo texto curto"} para itens que precisam de reescrita ao contexto],"add":[{"s":"Setor","i":"infração curta (máx 10 palavras)","g":"leve|media|grave|gravissima"} para infrações específicas deste cliente que faltam]}

Regras de adaptação:
- Adapte e crie livremente: remova o que não se aplica, reescreva ao contexto e adicione quantas infrações específicas deste cliente forem necessárias (descrições curtas, máx 10 palavras).
- Converta regras próprias e dores do cliente em itens "add".

${LIMITES_LEGAIS}
${blocoCCT(cctPontos)}
- "gravissima" apenas para condutas enquadráveis nas hipóteses de justa causa do art. 482 da CLT.
- Sem markdown, sem texto fora do JSON.`;

  const texto = await chamarIA(prompt);

  let diff = { rm: [], ed: [], add: [] };
  try {
    const obj = extrairJSON(texto, "{", "}");
    diff = { rm: obj.rm || [], ed: obj.ed || [], add: obj.add || [] };
  } catch {
    // resposta ilegível — segue com a tabela-mãe sem adaptações
  }

  const remover = new Set((diff.rm || []).map(Number));
  const edicoes = {};
  for (const e of diff.ed || []) {
    if (e && e.n) edicoes[Number(e.n)] = e;
  }

  const base = TABELA_MAE.map((m, idx) => {
    const n = idx + 1;
    if (remover.has(n)) return null;
    const ed = edicoes[n];
    return {
      id: uid(),
      setor: m.setor,
      infracao: ed && ed.i ? ed.i : m.infracao,
      gravidade: ed && GRAVIDADES.includes(ed.g) ? ed.g : m.gravidade,
    };
  }).filter(Boolean);

  const extras = (diff.add || [])
    .filter((it) => it && it.i && GRAVIDADES.includes(it.g))
    .map((it) => ({ id: uid(), setor: it.s || "Regras da Casa", infracao: it.i, gravidade: it.g }));

  return [...base, ...extras];
}
