import { parseDataBR } from "../ia/cronograma.jsx";
import { parseValorBR } from "../ia/financeiro.jsx";
import { uid } from "./base.jsx";
import { listaSistemas, parcelaDoSistema } from "./sistemas.js";

// Mensalidades do sistema em sustentação: gera as parcelas até o mês corrente (não repete, não apaga o que já existe).

const dataBR = (d) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
const chaveMes = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export const chaveMesDe = (d) => chaveMes(d);
export const dataBRDe = (d) => dataBR(d);

// primeiro vencimento: "mensalidadeDesde" se preenchido; senão um mês depois da entrega (ou do início)
export function primeiroVencimento(sistema) {
  const desde = parseDataBR(sistema && sistema.mensalidadeDesde);
  if (desde) return desde;
  const inicio = parseDataBR(sistema && sistema.entregueEm) || parseDataBR(sistema && sistema.inicio);
  if (!inicio) return null;
  const dia = Number(sistema.diaVencimento) || Math.min(inicio.getDate(), 28);
  return new Date(inicio.getFullYear(), inicio.getMonth() + 1, Math.min(dia, 28));
}

export function mensalidadesPendentes(sistema, financeiro, hoje = new Date(), lista = null) {
  const valor = parseValorBR(sistema && sistema.mensalidade);
  if (!sistema || !sistema.mensalidadeAtiva || valor <= 0) return [];
  const primeiro = primeiroVencimento(sistema);
  if (!primeiro) return [];
  const existentes = new Set((financeiro.parcelas || []).filter((p) => p.mes && parcelaDoSistema(p, sistema, lista || [sistema])).map((p) => p.mes));
  const novas = [];
  const dia = Number(sistema.diaVencimento) || primeiro.getDate();
  const d = new Date(primeiro.getFullYear(), primeiro.getMonth(), Math.min(dia, 28));
  const limite = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  let n = 1;
  while (d <= limite && n <= 60) {
    const mes = chaveMes(d);
    if (!existentes.has(mes)) {
      novas.push({ id: uid(), descricao: `Mensalidade ${d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })} — ${sistema.nome || "sistema"}`, valor: `R$ ${sistema.mensalidade}`, vencimento: dataBR(d), pago: false, mes, recorrente: true, sistemaId: sistema.id });
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
    for (const s of listaSistemas(sistemasPorCliente, c.id)) {
      if (s.mensalidadeAtiva) {
        const v = parseValorBR(s.mensalidade);
        if (v > 0) { mensal += v; ativos++; }
      }
    }
  }
  return { mensal, ativos };
}

// ── Visão geral das mensalidades (todos os sistemas) ──────────────

const STATUS_MES = { paga: "Paga", pendente: "Pendente", atrasada: "Atrasada", nao_gerada: "Não gerada", sem: "—" };
export { STATUS_MES };

function statusParcela(p, hoje) {
  if (!p) return "nao_gerada";
  if (p.pago) return "paga";
  const venc = parseDataBR(p.vencimento);
  return venc && venc < hoje ? "atrasada" : "pendente";
}

// mes: "AAAA-MM". Uma linha por sistema com mensalidade (ativa ou com histórico).
export function visaoMensalidades({ clientes = [], sistemasPorCliente = {}, financeiroPorCliente = {}, mes, hoje = new Date() }) {
  const h = new Date(hoje); h.setHours(0, 0, 0, 0);
  const meses = []; // 6 meses até o escolhido, para o histórico
  const [ano, m] = mes.split("-").map(Number);
  for (let i = 5; i >= 0; i--) { const d = new Date(ano, m - 1 - i, 1); meses.push(chaveMes(d)); }
  const linhas = [];
  for (const c of clientes) {
    const lista = listaSistemas(sistemasPorCliente, c.id);
    for (const s of lista) {
    const parcelas = ((financeiroPorCliente[c.id] || {}).parcelas || []).filter((p) => p.mes && parcelaDoSistema(p, s, lista));
    if (!s.mensalidadeAtiva && !parcelas.length) continue;
    const valor = parseValorBR(s.mensalidade);
    const doMes = parcelas.find((p) => p.mes === mes) || null;
    const historico = meses.map((k) => { const p = parcelas.find((x) => x.mes === k); return { mes: k, status: p ? statusParcela(p, h) : (s.mensalidadeAtiva ? "sem" : "sem"), parcela: p }; });
    const atrasadas = parcelas.filter((p) => statusParcela(p, h) === "atrasada");
    const recebido = parcelas.filter((p) => p.pago).reduce((t, p) => t + parseValorBR(p.valor), 0);
    const proxima = parcelas.filter((p) => !p.pago).sort((a, b) => (a.mes > b.mes ? 1 : -1))[0] || null;
    const primeiro = primeiroVencimento(s);
    linhas.push({
      clienteId: c.id, sistemaId: s.id, chave: `${c.id}:${s.id}`, cliente: c.negocio, contato: c.contato || {}, sistema: s, nomeSistema: s.nome || "sistema", valor, ativa: !!s.mensalidadeAtiva,
      dia: Number(s.diaVencimento) || (primeiro ? primeiro.getDate() : null), desde: primeiro,
      doMes, statusMes: s.mensalidadeAtiva || doMes ? statusParcela(doMes, h) : "sem", historico, atrasadas, recebido, pagas: parcelas.filter((p) => p.pago).length, proxima,
      faltantes: mensalidadesPendentes(s, { parcelas: (financeiroPorCliente[c.id] || {}).parcelas || [] }, hoje, lista),
    });
    }
  }
  const ativas = linhas.filter((l) => l.ativa);
  const soma = (xs) => xs.reduce((t, x) => t + x, 0);
  const resumo = {
    mensal: soma(ativas.map((l) => l.valor)), ativos: ativas.length,
    previsto: soma(linhas.filter((l) => l.doMes || l.ativa).map((l) => (l.doMes ? parseValorBR(l.doMes.valor) : l.valor))),
    recebido: soma(linhas.filter((l) => l.doMes && l.doMes.pago).map((l) => parseValorBR(l.doMes.valor))),
    pendente: soma(linhas.filter((l) => l.statusMes === "pendente").map((l) => parseValorBR(l.doMes.valor))),
    atrasado: soma(linhas.flatMap((l) => l.atrasadas.map((p) => parseValorBR(p.valor)))),
    naoGeradas: linhas.filter((l) => l.statusMes === "nao_gerada").length,
    faltantes: soma(linhas.map((l) => l.faltantes.length)),
  };
  return { linhas: linhas.sort((a, b) => (a.ativa === b.ativa ? a.cliente.localeCompare(b.cliente) : a.ativa ? -1 : 1)), resumo, meses };
}

export function textoCobranca(linha, parcela, pix) {
  const nome = (linha.contato && linha.contato.nome) || linha.cliente;
  const mesTxt = parcela && parcela.mes ? new Date(Number(parcela.mes.slice(0, 4)), Number(parcela.mes.slice(5)) - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" }) : "";
  return `Oi, ${nome.split(" ")[0]}! Passando para lembrar da mensalidade do ${linha.nomeSistema}${mesTxt ? ` de ${mesTxt}` : ""}: ${parcela ? parcela.valor : "R$ " + linha.sistema.mensalidade}${parcela && parcela.vencimento ? `, vencimento ${parcela.vencimento}` : ""}.${pix ? ` Pix: ${pix}.` : ""} Qualquer coisa, me chama. Obrigada!`;
}
