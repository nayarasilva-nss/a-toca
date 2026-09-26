import { LIMITES_LEGAIS, chamarIA, extrairJSON } from "./base.jsx";
import { blocoCCT } from "./cct.jsx";
import { Organograma } from "../modulos/estrutura.jsx";

// ─── IA: Descrição de Cargo ─────────────────────────────────────

export async function gerarDescricaoCargo(cliente, cargo, cargosExistentes, cctPontos, posicoes, entrevistas) {
  const entrevistasDoCargo = (entrevistas || []).filter(
    (e) => e.funcao && cargo.nome && (e.funcao.toLowerCase().includes(cargo.nome.toLowerCase()) || cargo.nome.toLowerCase().includes(e.funcao.toLowerCase()))
  );
  const blocoEntrevistas = entrevistasDoCargo.length
    ? `ENTREVISTAS DE FUNÇÃO REALIZADAS EM CAMPO (FONTE PRIMÁRIA — o que o ocupante relata pesa mais que suposição):
${entrevistasDoCargo.map((e) => `- ${e.entrevistado || "colaborador"} (${e.data}): faz: ${e.atividades || "—"}${e.fazNaoDeveria ? `; faz sem ser da função: ${e.fazNaoDeveria}` : ""}${e.deveriaNaoFaz ? `; deveria e não faz: ${e.deveriaNaoFaz}` : ""}${e.dores ? `; dores: ${e.dores}` : ""}`).join("\n")}
Use os relatos para escrever atividades REAIS; o que ele faz e não deveria vai para o cargo certo (não para este); o que deveria e não faz entra nas atividades como responsabilidade explícita.`
    : "";
  const listaCargos = cargosExistentes.map((c) => c.nome).join(", ") || "nenhum ainda";
  const posicao = (posicoes || []).find((p) => p.nome.toLowerCase() === (cargo.nome || "").toLowerCase());
  const superior = posicao && posicao.superiorId ? (posicoes || []).find((p) => p.id === posicao.superiorId) : null;
  const blocoOrg = (posicoes || []).length
    ? `Organograma do cliente: ${(posicoes || []).map((p) => p.nome).join(", ")}.${superior ? ` Segundo o organograma, este cargo responde a: ${superior.nome} — use isso no campo de supervisão.` : ""}`
    : "";
  const prompt = `Você é especialista em estruturação de cargos para pequenas e médias empresas brasileiras. Escreva a descrição do cargo abaixo, personalizada para o cliente.

CLIENTE
Negócio: ${cliente.negocio}
Segmento: ${cliente.segmento}
Setores/áreas: ${cliente.setores || "não informado"}
Contexto: ${cliente.contexto || "não informado"}
Outros cargos já cadastrados: ${listaCargos}
${blocoOrg}
${blocoEntrevistas}

CARGO
Nome: ${cargo.nome}
Setor: ${cargo.setor || "não informado"}
Observações da consultora: ${cargo.obs || "nenhuma"}

${LIMITES_LEGAIS}
${blocoCCT(cctPontos)}
Responda APENAS com JSON compacto de uma linha, campos em texto corrido curto e direto:
{"su":"descrição sumária (2-3 frases)","at":["8 a 12 atividades, frases curtas iniciadas por verbo"],"re":"requisitos: escolaridade, experiência e competências (3-4 frases)","co":"condições de trabalho: ambiente, esforço físico, jornada (2-3 frases)","sv":"supervisão: de quem recebe e sobre quem exerce (1-2 frases)","pa":"patrimônio sob responsabilidade (1-2 frases)","cf":"informações confidenciais que acessa (1 frase)"}
Sem markdown, sem texto fora do JSON.`;

  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  return {
    sumaria: obj.su || "",
    atividades: Array.isArray(obj.at) ? obj.at.join("\n") : obj.at || "",
    requisitos: obj.re || "",
    condicoes: obj.co || "",
    supervisao: obj.sv || "",
    patrimonio: obj.pa || "",
    confidenciais: obj.cf || "",
  };
}
