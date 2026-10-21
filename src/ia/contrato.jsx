import { chamarIA, extrairJSON } from "./base.jsx";
import { REGIMES, ROTEIRO_REDACAO, CHECKLIST_REVISAO, regimeDe } from "./contratoRegras.jsx";

// ─── IA: contrato a partir da proposta aceita, pela teoria geral dos contratos ──

const TIPO_ROTULO = {
  consultoria: "consultoria em desenvolvimento organizacional (Método Enraizar) — obrigação de meio",
  mentoria: "mentoria individual (Método Enraizar) — obrigação de meio, execução continuada por encontros",
  sistema: "desenvolvimento de sistema personalizado — obrigação de entrega do escopo, com licença de uso e manutenção mensal (execução continuada após a entrega)",
};

export function tipoContratoDe(cliente, prop) {
  if (prop && prop.tipo === "sistema") return "sistema";
  return cliente && cliente.tipo === "pessoa" ? "mentoria" : "consultoria";
}

function blocoProposta(cliente, prop, sistema) {
  const opcao = prop.opcaoEscolhida && (prop.opcoes || []).find((o) => o.id === prop.opcaoEscolhida);
  const escopo = opcao ? opcao.escopo : prop.entregaveis;
  const valor = opcao ? opcao.investimento : prop.investimento;
  const mensalidade = opcao ? opcao.mensalidade : prop.mensalidade;
  const prazo = opcao ? opcao.prazo : prop.duracao;
  const linhas = (t) => String(t || "").split("\n").map((l) => l.trim()).filter(Boolean);
  return `PROPOSTA ACEITA (anexo e base do contrato)
Título: ${prop.titulo || prop.rotulo || "Proposta de " + prop.data}${opcao ? ` — ${opcao.nome}: ${opcao.titulo}` : ""}
Objetivo: ${prop.objetivo || "não informado"}
Escopo / entregáveis:
${linhas(escopo).map((l) => "- " + l).join("\n") || "- conforme proposta"}
${prop.fases ? `Etapas:\n${linhas(prop.fases).map((l) => "- " + l).join("\n")}` : ""}
Fora do escopo: ${linhas(prop.foraEscopo).join("; ") || "não informado"}
Fornecido pelo contratante: ${linhas(prop.fornecidoCliente).join("; ") || "não informado"}
Prazo: ${prazo || "a definir"}
Valor: ${valor || "a definir"}${mensalidade ? ` · Mensalidade: R$ ${mensalidade}/mês (hospedagem, manutenção e pequenas alterações)` : ""}
Condições de pagamento: ${prop.condicoesPagamento || "a combinar"}
Condições gerais da proposta: ${linhas(prop.condicoesGerais).join("; ") || "nenhuma"}
${sistema && sistema.stack ? `Stack: ${sistema.stack}.` : ""}`;
}

const REGRAS_DA_CASA = {
  sistema: "REGRAS DA CASA (sistema): o código-fonte e a estrutura permanecem com a contratada; o contratante recebe licença de uso não exclusiva e intransferível, por prazo indeterminado enquanto a mensalidade estiver em dia; os dados inseridos pertencem ao contratante e podem ser exportados ao fim; a mensalidade cobre hospedagem, manutenção corretiva e pequenas alterações (até [2] horas/mês); novas funções são orçadas à parte; garantia de correção de defeitos do escopo entregue por 90 dias; o prazo de entrega conta a partir do recebimento do material do contratante; uma rodada de ajustes incluída após a primeira versão.",
  mentoria: "REGRAS DA CASA (mentoria): encontros com data combinada; reagendamento com 24 horas de antecedência; encontro não reagendado nesse prazo conta como realizado; conteúdo pessoal do mentorado é confidencial; a mentora não substitui acompanhamento psicológico ou médico; o pra casa é compromisso do mentorado; pacote de encontros com validade de [6] meses.",
  consultoria: "REGRAS DA CASA (consultoria): a contratada diagnostica, orienta e documenta; a execução e as decisões — inclusive trabalhistas e disciplinares — são do contratante, que deve validá-las com contador e/ou advogado; documentos entregues são de uso interno do contratante e podem ser adaptados por ele; a contratada precisa de acesso às pessoas, locais e informações combinados, em prazos razoáveis, para cumprir o cronograma.",
};

export async function gerarContrato(cliente, prop, tipo, partes, sistema) {
  const regime = regimeDe(cliente, tipo);
  const prompt = `Você redige contratos de prestação de serviços para a profissional autônoma Nayara Silva (Brasil), aplicando a teoria geral dos contratos do direito brasileiro (CC/2002 e, quando for o caso, CDC). O texto será revisado por ela e, se necessário, por advogado — não é parecer jurídico, mas deve nascer correto.

TIPO DE SERVIÇO: ${TIPO_ROTULO[tipo] || tipo}
${REGIMES[regime].texto}

CONTRATADA: ${partes.contratada.nome || "[nome]"}, ${partes.contratada.documento || "[CPF/CNPJ]"}, ${partes.contratada.endereco || "[endereço]"}
CONTRATANTE: ${partes.contratante.nome || cliente.negocio}, ${partes.contratante.documento || "[CPF/CNPJ]"}, ${partes.contratante.endereco || "[endereço]"}${partes.contratante.representante ? `, representada por ${partes.contratante.representante}` : ""}

${blocoProposta(cliente, prop, sistema)}

${REGRAS_DA_CASA[tipo] || ""}

${ROTEIRO_REDACAO}

Estrutura obrigatória, nesta ordem (uma cláusula por item, com subitens quando precisar):
1 Objeto e natureza da obrigação; 2 Escopo, entregas e o que fica de fora; 3 Prazo, etapas e condições de início; 4 Valor, forma de pagamento, atraso (multa, juros e atualização) e suspensão por inadimplemento; 5 Obrigações da contratada; 6 Obrigações do contratante (materiais, acessos, prazos de resposta); 7 Alterações de escopo e alocação de riscos; 8 ${tipo === "sistema" ? "Propriedade intelectual, licença de uso, dados e garantia de correção" : "Propriedade dos materiais, uso e garantia"}; 9 Confidencialidade; 10 Vigência, renovação e denúncia com aviso prévio; 11 Rescisão por inadimplemento (cláusula resolutiva expressa, prazo de cura, notificação); 12 Disposições gerais: boa-fé, interpretação e prevalência (contrato > proposta > mensagens), comunicações, foro.

Responda APENAS com JSON compacto de uma linha:
{"t":"título do contrato","c":[{"n":"1","t":"Objeto e natureza da obrigação","x":"texto da cláusula, subitens separados por \\n (1.1., 1.2.)"}],"obs":"2-3 frases: o regime aplicado, o que a Nay deve conferir antes de enviar e se vale levar a advogado (valor alto, prazo longo ou cláusula sensível)"}
Sem markdown, sem texto fora do JSON.`;
  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  return {
    titulo: obj.t || "Contrato de prestação de serviços",
    regime,
    clausulas: (obj.c || []).filter((c) => c && c.x).map((c) => ({ n: String(c.n || ""), titulo: c.t || "", texto: c.x })),
    obs: obj.obs || "",
    revisao: null,
  };
}

export async function revisarContrato(cliente, prop, tipo, contrato) {
  const regime = contrato.regime || regimeDe(cliente, tipo);
  const texto = (contrato.clausulas || []).map((c) => `Cláusula ${c.n} — ${c.titulo}\n${c.texto}`).join("\n\n");
  const prompt = `Você revisa contratos pelo direito brasileiro (CC/2002, CDC, Jornadas de Direito Civil), pelo lado de quem vai assinar como CONTRATADA (Nayara Silva). Não é parecer jurídico: aponte riscos, lacunas e o artigo que fundamenta cada ponto; separe lei de doutrina quando a posição for doutrinária.

TIPO: ${TIPO_ROTULO[tipo] || tipo}
${REGIMES[regime].texto}

CONTRATO A REVISAR
${texto}

${CHECKLIST_REVISAO}

Responda APENAS com JSON compacto de uma linha:
{"ok":["itens do checklist atendidos, em 1 linha cada"],"riscos":[{"g":"alto|medio|baixo","t":"o problema em 1 frase","f":"artigo/enunciado","s":"como corrigir, em 1 frase"}],"advogado":"sim|nao","motivo":"1 frase"}
Sem markdown, sem texto fora do JSON.`;
  const resposta = await chamarIA(prompt);
  const obj = extrairJSON(resposta, "{", "}");
  return {
    em: new Date().toLocaleDateString("pt-BR"),
    ok: obj.ok || [],
    riscos: (obj.riscos || []).filter((r) => r && r.t),
    advogado: obj.advogado === "sim",
    motivo: obj.motivo || "",
  };
}
