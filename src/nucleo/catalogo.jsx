import { uid } from "./base.jsx";

// Catálogo de blocos que a Nay constrói: nome, horas padrão e categoria.
// Vale para todos os clientes; as horas são o ponto de partida — cada projeto ajusta.
export const CATALOGO_PADRAO = [
  // base
  { id: "base-app", categoria: "Base", nome: "Base do sistema: login, papéis por função, banco e publicação", horas: 8, etapa: "Fundação" },
  { id: "base-multi", categoria: "Base", nome: "Estrutura multiempresa (para revender a outros clientes)", horas: 6, etapa: "Fundação" },
  { id: "levantamento", categoria: "Base", nome: "Levantamento e desenho das telas com o cliente", horas: 4, etapa: "Levantamento" },
  // reservas e salão
  { id: "reserva-link", categoria: "Reservas e salão", nome: "Link público de reserva com origem do cliente e consentimento LGPD", horas: 6, etapa: "Construção" },
  { id: "clientes", categoria: "Reservas e salão", nome: "Cadastro de clientes com histórico de visitas, aniversário e etiquetas", horas: 6, etapa: "Construção" },
  { id: "whatsapp-link", categoria: "Reservas e salão", nome: "Botão de WhatsApp com mensagem pronta", horas: 2, etapa: "Construção" },
  { id: "mapa-mesas", categoria: "Reservas e salão", nome: "Mapa de mesas por praça com status em tempo real entre aparelhos", horas: 12, etapa: "Construção" },
  { id: "garcons", categoria: "Reservas e salão", nome: "Atribuição de garçons por praça e turno", horas: 5, etapa: "Construção" },
  { id: "painel-gestor", categoria: "Reservas e salão", nome: "Painel do gestor: ocupação, no-show e origem por período", horas: 6, etapa: "Construção" },
  // operação
  { id: "checklist", categoria: "Operação", nome: "Checklists por turno com registro de quem fez", horas: 6, etapa: "Construção" },
  { id: "cadastro-generico", categoria: "Operação", nome: "Cadastro simples (lista, busca, edição) — por entidade", horas: 4, etapa: "Construção" },
  { id: "relatorio", categoria: "Operação", nome: "Relatório ou painel com filtros por período — por tela", horas: 4, etapa: "Construção" },
  { id: "exportacao", categoria: "Operação", nome: "Exportação em PDF ou planilha", horas: 3, etapa: "Construção" },
  { id: "notificacao-email", categoria: "Operação", nome: "Aviso por e-mail (formulário, confirmação)", horas: 3, etapa: "Construção" },
  // site
  { id: "site-home", categoria: "Site", nome: "Home longa (até 8 seções) a partir de wireframe aprovado", horas: 6, etapa: "Construção" },
  { id: "site-pagina", categoria: "Site", nome: "Página interna (sobre, serviços, produto, cases) — por página", horas: 2.5, etapa: "Construção" },
  { id: "site-contato", categoria: "Site", nome: "Formulário de contato com aviso por e-mail", horas: 3, etapa: "Construção" },
  { id: "site-captura", categoria: "Site", nome: "Captura de e-mail com entrega de material gratuito", horas: 3, etapa: "Construção" },
  { id: "site-seo", categoria: "Site", nome: "SEO básico e Google Analytics", horas: 2, etapa: "Entrega" },
  { id: "site-dominio", categoria: "Site", nome: "Apontamento do domínio e publicação", horas: 2, etapa: "Entrega" },
  // entrega
  { id: "implantacao", categoria: "Entrega", nome: "Implantação e treinamento da equipe", horas: 4, etapa: "Entrega" },
  { id: "ajustes", categoria: "Entrega", nome: "Rodada de ajustes após a primeira versão", horas: 4, etapa: "Entrega" },
];

export const CATEGORIAS_CATALOGO = ["Base", "Reservas e salão", "Operação", "Site", "Entrega"];
export const ETAPAS = ["Levantamento", "Fundação", "Construção", "Entrega"];

export const horasDe = (item) => Number(String(item.horas ?? "").replace(",", ".")) || 0;
export const somaHoras = (escopo) => (escopo || []).reduce((s, i) => s + horasDe(i), 0);

export function itemDoBloco(bloco) {
  return { id: uid(), texto: bloco.nome, horas: bloco.horas, etapa: bloco.etapa, status: "a_fazer", blocoId: bloco.id };
}

// Plano por semanas: distribui as horas do escopo na ordem das etapas, respeitando as horas semanais da Nay.
export function planoDoEscopo(escopo, horasPorSemana = 20, folga = 0.15) {
  const itens = (escopo || []).filter((i) => (i.texto || "").trim());
  const horas = somaHoras(itens);
  const hs = Number(horasPorSemana) || 20;
  const ordem = (i) => { const k = ETAPAS.indexOf(i.etapa || "Construção"); return k < 0 ? 2 : k; };
  const fila = [...itens].sort((a, b) => ordem(a) - ordem(b));
  const semanas = [];
  let atual = { semana: 1, horas: 0, itens: [] };
  for (const i of fila) {
    const h = horasDe(i);
    if (atual.horas > 0 && atual.horas + h > hs) {
      semanas.push(atual);
      atual = { semana: atual.semana + 1, horas: 0, itens: [] };
    }
    atual.itens.push(i);
    atual.horas += h;
  }
  if (atual.itens.length) semanas.push(atual);
  const semanasTotal = Math.max(1, Math.ceil((horas * (1 + folga)) / hs));
  const prazoTexto = semanasTotal <= 1 ? "1 semana" : `${semanasTotal - 1} a ${semanasTotal} semanas`;
  return { horas, horasPorSemana: hs, semanas, semanasTotal, prazoTexto };
}

export function etapasTexto(plano) {
  const porEtapa = new Map();
  for (const s of plano.semanas) for (const i of s.itens) {
    const e = i.etapa || "Construção";
    if (!porEtapa.has(e)) porEtapa.set(e, { itens: [], semanas: new Set() });
    porEtapa.get(e).itens.push(i.texto);
    porEtapa.get(e).semanas.add(s.semana);
  }
  return ETAPAS.filter((e) => porEtapa.has(e)).map((e) => {
    const d = porEtapa.get(e);
    const sem = [...d.semanas];
    const faixa = sem.length > 1 ? `semanas ${Math.min(...sem)}–${Math.max(...sem)}` : `semana ${sem[0]}`;
    return `${e} — ${faixa} — ${d.itens.join("; ")}`;
  });
}

// ── Horas realizadas: registros por item do escopo e calibração do catálogo

export const realizadasPorItem = (sistema) => {
  const soma = {};
  for (const r of sistema.registros || []) {
    const h = Number(String(r.horas || "").replace(",", ".")) || 0;
    if (r.itemId) soma[r.itemId] = (soma[r.itemId] || 0) + h;
  }
  return soma;
};

export const totalRealizadas = (sistema) => (sistema.registros || []).reduce((s, r) => s + (Number(String(r.horas || "").replace(",", ".")) || 0), 0);

// média de horas realizadas por bloco do catálogo, somando todos os sistemas que têm registros
export function calibracaoCatalogo(sistemasPorCliente) {
  const acc = {};
  for (const v of Object.values(sistemasPorCliente || {})) for (const sis of (Array.isArray(v) ? v : [v])) {
    if (!sis || !(sis.registros || []).length) continue;
    const real = realizadasPorItem(sis);
    for (const item of sis.escopo || []) {
      if (!item.blocoId || !real[item.id]) continue;
      if (!acc[item.blocoId]) acc[item.blocoId] = { total: 0, n: 0 };
      acc[item.blocoId].total += real[item.id];
      acc[item.blocoId].n += 1;
    }
  }
  const out = {};
  for (const [id, a] of Object.entries(acc)) out[id] = { media: Math.round((a.total / a.n) * 10) / 10, n: a.n };
  return out;
}
