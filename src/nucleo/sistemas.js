// Vários sistemas por cliente (checklist, ERP, reservas…): helpers puros, sem JSX.

const uid = () => Math.random().toString(36).slice(2, 9);

export function sistemaVazio() {
  return { id: uid(), nome: "", briefing: "", escopo: [], foraEscopo: "", fornecidoCliente: [], stack: "", prazoSemanas: "", inicio: "", entregueEm: "", implantacao: "", mensalidade: "", mensalidadeAtiva: false, cobranca: "unica", unidadesIds: [], diaVencimento: "", mensalidadeDesde: "", status: "levantamento", obs: "", notaIA: "", registros: [] };
}

const temConteudo = (s) => (s.nome || "").trim() || (s.escopo || []).length || (s.briefing || "").trim() || (s.registros || []).length;

// aceita o formato antigo (um objeto) e o novo (lista)
export function normalizarSistemas(v) {
  if (Array.isArray(v)) return v.map((s) => ({ ...sistemaVazio(), ...s, id: s.id || uid() }));
  if (v && typeof v === "object") { const s = { ...sistemaVazio(), ...v, id: v.id || uid() }; return temConteudo(s) ? [s] : []; }
  return [];
}

export const listaSistemas = (sistemasPorCliente, clienteId) => normalizarSistemas((sistemasPorCliente || {})[clienteId]);
export const sistemaPorId = (lista, id) => (lista || []).find((s) => s.id === id) || null;

// a proposta aponta para um sistema; sem apontar, vale o único (ou o primeiro)
export const sistemaDaProposta = (lista, prop) => (prop && prop.sistemaId && sistemaPorId(lista, prop.sistemaId)) || (lista || [])[0] || null;

// parcela pertence ao sistema: pelo id, ou, nas antigas sem id, quando o cliente tem um sistema só
export const parcelaDoSistema = (p, sistema, lista) => !!p && (p.sistemaId ? p.sistemaId === sistema.id : (lista || []).length <= 1);

// o sistema que mais pede atenção hoje (para o próximo passo do hub)
const ORDEM_ATENCAO = ["construcao", "proposta", "levantamento", "entregue", "sustentacao", "encerrado"];
export function sistemaPrincipal(lista) {
  const l = lista || [];
  for (const st of ORDEM_ATENCAO) { const s = l.find((x) => (x.status || "levantamento") === st); if (s) return s; }
  return l[0] || null;
}

// unidades (CNPJs) do cliente que pagam este sistema; lista vazia em "por unidade" = todas
export function unidadesCobradas(sistema, cliente) {
  if (!sistema || sistema.cobranca !== "unidade") return [];
  const todas = (cliente && cliente.unidades) || [];
  const ids = sistema.unidadesIds || [];
  return ids.length ? todas.filter((u) => ids.includes(u.id)) : todas;
}
export const unidadeVazia = () => ({ id: uid(), nome: "", cnpj: "", whatsapp: "", contato: "" });

export const ROTULO_STATUS_SISTEMA = { levantamento: "em levantamento", proposta: "proposta", construcao: "em construção", entregue: "entregue", sustentacao: "em sustentação", encerrado: "encerrado" };
