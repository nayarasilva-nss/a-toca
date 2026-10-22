const uid = () => Math.random().toString(36).slice(2, 9);
function parseDataBR(str) {
  if (!str) return null;
  const m = String(str).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!m) return null;
  const ano = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
  const d = new Date(ano, Number(m[2]) - 1, Number(m[1]));
  return isNaN(d.getTime()) ? null : d;
}

// (módulo puro, sem JSX nem imports: também roda no cron da Vercel em api/lembrete.js)
// Agenda pessoal da Nay: tarefas (dela ou vindas de pedidos) e um calendário que também mostra
// os compromissos que já existem no app — vencimentos do Financeiro e entregas de sistemas.

export const PRIORIDADES = {
  normal: { rotulo: "Normal", cor: "var(--tinta-musgo)" },
  urgente: { rotulo: "Urgente", cor: "var(--erro)" },
};

export const DIAS_SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
export const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

export const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const hojeISO = () => iso(new Date());
export function deISO(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ""));
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}
export const brDe = (s) => { const d = deISO(s); return d ? d.toLocaleDateString("pt-BR") : ""; };
export const isoDeBR = (br) => { const d = parseDataBR(br); return d ? iso(d) : ""; };
export const somarDias = (s, n) => { const d = deISO(s); if (!d) return ""; d.setDate(d.getDate() + n); return iso(d); };

export function rotuloRelativo(s, hoje = hojeISO()) {
  if (!s) return "sem data";
  if (s === hoje) return "hoje";
  if (s === somarDias(hoje, 1)) return "amanhã";
  if (s === somarDias(hoje, -1)) return "ontem";
  const d = deISO(s);
  const dif = Math.round((d - deISO(hoje)) / 86400000);
  if (dif > 1 && dif < 7) return DIAS_SEMANA[d.getDay()] + " " + d.getDate() + "/" + (d.getMonth() + 1);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + (d.getFullYear() !== deISO(hoje).getFullYear() ? "/" + d.getFullYear() : "");
}

export function tarefaVazia(extra = {}) {
  return { id: uid(), titulo: "", detalhe: "", data: "", hora: "", prioridade: "normal", clienteId: "", status: "aberta", origem: "eu", pedidoId: "", solicitante: "", criadoEm: new Date().toISOString(), feitoEm: "", ...extra };
}

const ordem = (a, b) => (a.data || "9999") < (b.data || "9999") ? -1 : (a.data || "9999") > (b.data || "9999") ? 1 : (a.hora || "99") < (b.hora || "99") ? -1 : (a.hora || "99") > (b.hora || "99") ? 1 : (a.prioridade === "urgente" ? -1 : 1);

// grupos para a lista: atrasadas, hoje, próximos 7 dias, depois, sem data, feitas
export function agruparTarefas(tarefas, hoje = hojeISO()) {
  const abertas = (tarefas || []).filter((t) => t.status !== "feita").sort(ordem);
  const limite = somarDias(hoje, 7);
  const g = { atrasadas: [], hoje: [], semana: [], depois: [], semData: [], feitas: [] };
  for (const t of abertas) {
    if (!t.data) g.semData.push(t);
    else if (t.data < hoje) g.atrasadas.push(t);
    else if (t.data === hoje) g.hoje.push(t);
    else if (t.data <= limite) g.semana.push(t);
    else g.depois.push(t);
  }
  g.feitas = (tarefas || []).filter((t) => t.status === "feita").sort((a, b) => (b.feitoEm || "").localeCompare(a.feitoEm || "")).slice(0, 15);
  return g;
}

// compromissos que já vivem no app
export function eventosDoApp({ clientes = [], financeiroPorCliente = {}, sistemasPorCliente = {} }) {
  const nome = (id) => (clientes.find((c) => c.id === id) || {}).negocio || "cliente";
  const eventos = [];
  for (const c of clientes) {
    const fin = financeiroPorCliente[c.id];
    for (const p of (fin && fin.parcelas) || []) {
      const d = isoDeBR(p.vencimento);
      if (d && !p.pago) eventos.push({ id: `parcela-${p.id}`, data: d, tipo: "parcela", titulo: `${p.descricao || "Parcela"} · ${p.valor || ""}`.trim(), clienteId: c.id, cliente: nome(c.id) });
    }
    const sis = sistemasPorCliente[c.id];
    if (sis) {
      const ini = isoDeBR(sis.inicio);
      const ent = isoDeBR(sis.entregueEm);
      if (ini) eventos.push({ id: `inicio-${c.id}`, data: ini, tipo: "sistema", titulo: `Início · ${sis.nome || "sistema"}`, clienteId: c.id, cliente: nome(c.id) });
      if (ent) eventos.push({ id: `entrega-${c.id}`, data: ent, tipo: "sistema", titulo: `Entrega · ${sis.nome || "sistema"}`, clienteId: c.id, cliente: nome(c.id) });
    }
  }
  return eventos;
}

export function porDia(tarefas, eventos) {
  const mapa = new Map();
  const add = (d, k, v) => { if (!d) return; if (!mapa.has(d)) mapa.set(d, { tarefas: [], eventos: [] }); mapa.get(d)[k].push(v); };
  for (const t of tarefas || []) if (t.status !== "feita") add(t.data, "tarefas", t);
  for (const e of eventos || []) add(e.data, "eventos", e);
  return mapa;
}

// semanas do mês (domingo a sábado), com dias dos meses vizinhos para completar a grade
export function gradeMes(ano, mes) {
  const primeiro = new Date(ano, mes, 1);
  const inicio = new Date(ano, mes, 1 - primeiro.getDay());
  const semanas = [];
  const d = new Date(inicio);
  do {
    const semana = [];
    for (let i = 0; i < 7; i++) { semana.push({ iso: iso(d), dia: d.getDate(), foraDoMes: d.getMonth() !== mes }); d.setDate(d.getDate() + 1); }
    semanas.push(semana);
  } while (d.getMonth() === mes);
  return semanas;
}

// texto do lembrete diário (WhatsApp)
export function textoLembrete(tarefas, pedidosPendentes = 0, hoje = hojeISO()) {
  const g = agruparTarefas(tarefas, hoje);
  const linha = (t) => `• ${t.hora ? t.hora + " " : ""}${t.titulo}${t.prioridade === "urgente" ? " ⚠️" : ""}${t.solicitante ? ` (pedido de ${t.solicitante})` : ""}`;
  const partes = [`☀️ Bom dia, Nay. ${deISO(hoje).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}`];
  if (g.hoje.length) partes.push(`\nHoje (${g.hoje.length}):\n${g.hoje.map(linha).join("\n")}`);
  if (g.atrasadas.length) partes.push(`\nAtrasadas (${g.atrasadas.length}):\n${g.atrasadas.map(linha).join("\n")}`);
  if (g.semana.length) partes.push(`\nPróximos dias: ${g.semana.slice(0, 5).map((t) => `${rotuloRelativo(t.data, hoje)} ${t.titulo}`).join(" · ")}${g.semana.length > 5 ? " …" : ""}`);
  if (pedidosPendentes) partes.push(`\n📥 ${pedidosPendentes} pedido${pedidosPendentes > 1 ? "s" : ""} esperando triagem.`);
  if (!g.hoje.length && !g.atrasadas.length && !pedidosPendentes) partes.push("\nNada marcado para hoje. Dia livre para o que importa.");
  partes.push("\nhttps://enraizar.vercel.app");
  return partes.join("\n");
}
