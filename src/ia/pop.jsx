import { LIMITES_LEGAIS, chamarIA, extrairJSON } from "./base.jsx";
import { resumoCampo } from "./campo.jsx";
import { blocoCCT } from "./cct.jsx";

// ─── IA: POP (Processo Operacional Padrão) ──────────────────────

export async function gerarPOP(cliente, pop, cargos, cctPontos, fluxos, registrosCampo) {
  const vistoEmCampoPop = resumoCampo(registrosCampo, "processos");
  const listaCargos = cargos.map((c) => c.nome).filter(Boolean).join(", ") || "nenhum cadastrado";
  const fluxoIgual = (fluxos || []).find(
    (f) => f.nome && pop.nome && (f.nome.toLowerCase().includes(pop.nome.toLowerCase()) || pop.nome.toLowerCase().includes(f.nome.toLowerCase()))
  );
  const blocoFluxo = fluxoIgual && (fluxoIgual.etapas || []).length
    ? `FLUXO JÁ DESENHADO deste processo (use como espinha dorsal do passo a passo, detalhando cada etapa):
${(fluxoIgual.etapas || []).map((e, i) => `${i + 1}. ${e.texto}${e.tipo === "decisao" ? ` [decisão${e.seNao ? `; se não: ${e.seNao}` : ""}]` : ""}${e.responsavel ? ` (${e.responsavel})` : ""}`).join("\n")}`
    : "";
  const prompt = `Você é especialista em processos operacionais de pequenas e médias empresas brasileiras. Escreva o POP (Procedimento Operacional Padrão) abaixo, personalizado para o cliente — instruções que um colaborador novo consegue executar sem ajuda.

CLIENTE
Negócio: ${cliente.negocio}
Segmento: ${cliente.segmento}
Setores/áreas: ${cliente.setores || "não informado"}
Contexto: ${cliente.contexto || "não informado"}
Cargos existentes (use um deles como responsável quando couber): ${listaCargos}

PROCESSO
Nome: ${pop.nome}
Setor: ${pop.setor || "não informado"}
Observações da consultora: ${pop.obs || "nenhuma"}
${vistoEmCampoPop ? `VISTO EM CAMPO (considere a prática real e corrija-a onde for informalidade): ${vistoEmCampoPop.slice(0, 700)}` : ""}
${blocoFluxo}

${LIMITES_LEGAIS}
${blocoCCT(cctPontos)}
Responda APENAS com JSON compacto de uma linha:
{"ob":"objetivo do processo (1-2 frases)","ma":["materiais/recursos necessários, itens curtos"],"pa":["6 a 12 passos numeráveis, frases curtas iniciadas por verbo, em ordem de execução"],"at":["2 a 5 pontos de atenção/qualidade/segurança"],"fr":"frequência de execução (1 frase curta)","rs":"cargo responsável pela execução"}
Sem markdown, sem texto fora do JSON.`;

  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  const linhas = (v) => (Array.isArray(v) ? v.join("\n") : v || "");
  return {
    objetivo: obj.ob || "",
    materiais: linhas(obj.ma),
    passos: linhas(obj.pa),
    atencao: linhas(obj.at),
    frequencia: obj.fr || "",
    responsavel: obj.rs || "",
  };
}
