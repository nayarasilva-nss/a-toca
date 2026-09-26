import { mentoriaVazia } from "../modulos/treinamentos.jsx";

// Coleções guardadas por cliente: nome no estado → chave no storage e valor-padrão
export const COLECOES = {
  tabelas: { chave: "tabela", padrao: () => null },
  cargos: { chave: "cargos", padrao: () => [] },
  gestao: { chave: "gestao", padrao: () => ({ briefing: "", frentes: [] }) },
  estrutura: { chave: "estrutura", padrao: () => [] },
  manual: { chave: "manual", padrao: () => [] },
  cct: { chave: "cct", padrao: () => ({ nomeArquivo: "", dataAnalise: "", pontos: [] }) },
  penseira: { chave: "penseira", padrao: () => [] },
  pops: { chave: "pops", padrao: () => [] },
  fluxos: { chave: "fluxos", padrao: () => [] },
  campo: { chave: "campo", padrao: () => [] },
  treinamentos: { chave: "treinamentos", padrao: () => [] },
  mentoria: { chave: "mentoria", padrao: () => mentoriaVazia(), normalizar: (m) => ({ ...mentoriaVazia(), ...(m || {}) }) },
  diagsLider: { chave: "diagslider", padrao: () => [] },
  anomalias: { chave: "anomalias", padrao: () => [] },
  painel: { chave: "painel", padrao: () => ({}) },
  alcadas: { chave: "alcadas", padrao: () => ({ obs: "", itens: [] }) },
  ritos: { chave: "ritos", padrao: () => ({ obs: "", itens: [] }) },
  indicadores: { chave: "indicadores", padrao: () => ({ obs: "", itens: [] }) },
  pessoas: { chave: "temperamentos", padrao: () => [] },
  diags: { chave: "diagnosticos", padrao: () => [] },
  propostas: { chave: "propostas", padrao: () => [] },
  relatorios: { chave: "relatorios", padrao: () => [] },
  financeiro: { chave: "financeiro", padrao: () => ({ parcelas: [] }) },
};

export const COLECOES_INICIAIS = Object.fromEntries(Object.keys(COLECOES).map((k) => [k, {}]));

export function reduzirColecoes(estado, acao) {
  switch (acao.tipo) {
    case "atualizar": {
      const atual = estado[acao.colecao];
      const novo = typeof acao.valor === "function" ? acao.valor(atual) : acao.valor;
      return novo === atual ? estado : { ...estado, [acao.colecao]: novo };
    }
    case "removerCliente": {
      const novo = {};
      for (const colecao of Object.keys(estado)) {
        const { [acao.clienteId]: _removido, ...resto } = estado[colecao];
        novo[colecao] = resto;
      }
      return novo;
    }
    default:
      return estado;
  }
}
