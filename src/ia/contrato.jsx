import { chamarIA, extrairJSON } from "./base.jsx";

// ─── IA: contrato a partir da proposta aceita ───────────────────

const TIPO_ROTULO = {
  consultoria: "consultoria em desenvolvimento organizacional (Método Enraizar)",
  mentoria: "mentoria individual (Método Enraizar)",
  sistema: "desenvolvimento de sistema personalizado, com licença de uso e manutenção mensal",
};

export function tipoContratoDe(cliente, prop) {
  if (prop && prop.tipo === "sistema") return "sistema";
  return cliente && cliente.tipo === "pessoa" ? "mentoria" : "consultoria";
}

export async function gerarContrato(cliente, prop, tipo, partes, sistema) {
  const opcao = prop.opcaoEscolhida && (prop.opcoes || []).find((o) => o.id === prop.opcaoEscolhida);
  const escopo = opcao ? opcao.escopo : prop.entregaveis;
  const valor = opcao ? opcao.investimento : prop.investimento;
  const mensalidade = opcao ? opcao.mensalidade : prop.mensalidade;
  const prazo = opcao ? opcao.prazo : prop.duracao;
  const prompt = `Você redige contratos de prestação de serviços para a profissional autônoma Nayara Silva (Brasil). Escreva o CONTRATO abaixo em português claro, cláusulas numeradas, objetivo e sem juridiquês desnecessário — válido entre particulares, equilibrado, sem promessas de resultado. Use APENAS os dados fornecidos; onde faltar dado, escreva o campo entre colchetes para preenchimento (ex.: [CPF]).

TIPO DE SERVIÇO: ${TIPO_ROTULO[tipo] || tipo}

CONTRATADA: ${partes.contratada.nome || "[nome]"}, ${partes.contratada.documento || "[CPF/CNPJ]"}, ${partes.contratada.endereco || "[endereço]"}
CONTRATANTE: ${partes.contratante.nome || cliente.negocio}, ${partes.contratante.documento || "[CPF/CNPJ]"}, ${partes.contratante.endereco || "[endereço]"}${partes.contratante.representante ? `, representada por ${partes.contratante.representante}` : ""}

PROPOSTA ACEITA (base do contrato)
Título: ${prop.titulo || prop.rotulo || "Proposta de " + prop.data}
Objetivo: ${prop.objetivo || "não informado"}
Escopo / entregáveis:
${String(escopo || "").split("\n").filter(Boolean).map((l) => "- " + l).join("\n") || "- conforme proposta"}
${prop.fases ? `Etapas:\n${String(prop.fases).split("\n").filter(Boolean).map((l) => "- " + l).join("\n")}` : ""}
Fora do escopo: ${prop.foraEscopo ? String(prop.foraEscopo).split("\n").filter(Boolean).join("; ") : "não informado"}
Fornecido pelo contratante: ${prop.fornecidoCliente ? String(prop.fornecidoCliente).split("\n").filter(Boolean).join("; ") : "não informado"}
Prazo: ${prazo || "a definir"}
Valor: ${valor || "a definir"}${mensalidade ? ` · Mensalidade: R$ ${mensalidade}/mês (hospedagem, manutenção e pequenas alterações)` : ""}
Condições de pagamento: ${prop.condicoesPagamento || "a combinar"}
Condições gerais da proposta: ${prop.condicoesGerais ? String(prop.condicoesGerais).split("\n").filter(Boolean).join("; ") : "nenhuma"}
${tipo === "sistema" ? `Stack: ${(sistema && sistema.stack) || "não informada"}. Regra da casa: o código-fonte permanece com a contratada; o contratante recebe licença de uso não exclusiva, por prazo indeterminado enquanto a mensalidade estiver em dia; dados do contratante pertencem ao contratante e podem ser exportados ao fim.` : ""}
${tipo === "mentoria" ? "Regra da casa: encontros com data combinada; reagendamento com 24 h de antecedência; faltas sem aviso contam como realizadas; conteúdo pessoal do mentorado é confidencial." : ""}
${tipo === "consultoria" ? "Regra da casa: a contratada orienta e documenta; a execução e as decisões (inclusive trabalhistas) são do contratante, que deve validar medidas disciplinares com contador/advogado; documentos entregues são de uso interno do contratante." : ""}

Estrutura obrigatória (uma cláusula por item, podendo ter subitens): 1 Objeto; 2 Escopo e entregas; 3 Prazo e etapas; 4 Valor e forma de pagamento; 5 Obrigações da contratada; 6 Obrigações do contratante; 7 ${tipo === "sistema" ? "Propriedade intelectual, licença de uso e dados" : "Propriedade dos materiais e uso"}; 8 Confidencialidade; 9 Alterações de escopo; 10 Rescisão; 11 Disposições gerais e foro (comarca do contratante, salvo indicação).

Responda APENAS com JSON compacto de uma linha:
{"t":"título do contrato","c":[{"n":"1","t":"Objeto","x":"texto da cláusula, com subitens separados por \\n quando houver"}],"obs":"1 frase: o que a Nay deve conferir antes de enviar"}
Sem markdown, sem texto fora do JSON.`;
  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  return {
    titulo: obj.t || "Contrato de prestação de serviços",
    clausulas: (obj.c || []).filter((c) => c && c.x).map((c) => ({ n: String(c.n || ""), titulo: c.t || "", texto: c.x })),
    obs: obj.obs || "",
  };
}
