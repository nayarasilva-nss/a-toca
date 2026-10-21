import { parseDataBR } from "../ia/cronograma.jsx";
import { parseValorBR } from "../ia/financeiro.jsx";
import { uid } from "./base.jsx";

// Mensalidades do sistema em sustentação: gera as parcelas até o mês corrente (não repete, não apaga o que já existe).

const dataBR = (d) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
const chaveMes = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export function mensalidadesPendentes(sistema, financeiro, hoje = new Date()) {
  const valor = parseValorBR(sistema && sistema.mensalidade);
  if (!sistema || !sistema.mensalidadeAtiva || valor <= 0) return [];
  const inicio = parseDataBR(sistema.entregueEm) || parseDataBR(sistema.inicio);
  if (!inicio) return [];
  const existentes = new Set((financeiro.parcelas || []).filter((p) => p.mes).map((p) => p.mes));
  const novas = [];
  // a primeira mensalidade vence um mês depois da entrega; depois, todo mês no mesmo dia
  const d = new Date(inicio.getFullYear(), inicio.getMonth() + 1, Math.min(inicio.getDate(), 28));
  const limite = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  let n = 1;
  while (d <= limite && n <= 60) {
    const mes = chaveMes(d);
    if (!existentes.has(mes)) {
      novas.push({ id: uid(), descricao: `Mensalidade ${d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })} — ${sistema.nome || "sistema"}`, valor: `R$ ${sistema.mensalidade}`, vencimento: dataBR(d), pago: false, mes, recorrente: true });
    }
    d.setMonth(d.getMonth() + 1);
    n++;
  }
  return novas;
}

export function resumoRecorrente(clientes, sistemasPorCliente) {
  let mensal = 0;
  let ativos = 0;
  for (const c of clientes) {
    const s = sistemasPorCliente[c.id];
    if (s && s.mensalidadeAtiva) {
      const v = parseValorBR(s.mensalidade);
      if (v > 0) { mensal += v; ativos++; }
    }
  }
  return { mensal, ativos };
}
