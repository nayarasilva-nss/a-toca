import { parseDataBR } from "../ia/cronograma.jsx";
import { formatarBR, parseValorBR } from "../ia/financeiro.jsx";
import { uid } from "./base.jsx";
import { listaSistemas, parcelaDoSistema, unidadesCobradas } from "./sistemas.js";

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

// valor mensal do sistema: único, ou valor × unidades cobradas
export function valorMensal(sistema, cliente) {
  const v = parseValorBR(sistema && sistema.mensalidade);
  if (sistema && sistema.cobranca === "unidade") return v * unidadesCobradas(sistema, cliente).length;
  return v;
}

export function mensalidadesPendentes(sistema, financeiro, hoje = new Date(), lista = null, cliente = null) {
  const valor = parseValorBR(sistema && sistema.mensalidade);
  if (!sistema || !sistema.mensalidadeAtiva || valor <= 0) return [];
  const primeiro = primeiroVencimento(sistema);
  if (!primeiro) return [];
  const porUnidade = sistema.cobranca === "unidade";
  const unidades = porUnidade ? unidadesCobradas(sistema, cliente) : [null];
  if (porUnidade && !unidades.length) return [];
  const existentes = new Set((financeiro.parcelas || []).filter((p) => p.mes && parcelaDoSistema(p, sistema, lista || [sistema])).map((p) => `${p.mes}|${p.unidadeId || ""}`));
  const novas = [];
  const dia = Number(sistema.diaVencimento) || primeiro.getDate();
  const d = new Date(primeiro.getFullYear(), primeiro.getMonth(), Math.min(dia, 28));
  const limite = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  let n = 1;
  while (d <= limite && n <= 60) {
    const mes = chaveMes(d);
    const mesTxt = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    for (const u of unidades) {
      const chave = `${mes}|${u ? u.id : ""}`;
      if (existentes.has(chave)) continue;
      novas.push({ id: uid(), descricao: `Mensalidade ${mesTxt} — ${sistema.nome || "sistema"}${u ? ` · ${u.nome}` : ""}`, valor: `R$ ${sistema.mensalidade}`, vencimento: dataBR(d), pago: false, mes, recorrente: true, sistemaId: sistema.id, unidadeId: u ? u.id : "" });
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
        const v = valorMensal(s, c);
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
    const temImplantacao = parseValorBR(s.implantacao) > 0;
    if (!s.mensalidadeAtiva && !parcelas.length && !temImplantacao) continue;
    const valor = valorMensal(s, c);
    const unidades = unidadesCobradas(s, c);
    const porUnidade = s.cobranca === "unidade";
    // status de um mês: todas pagas → paga; alguma atrasada → atrasada; alguma pendente → pendente; nenhuma gerada → nao_gerada
    const statusDoMes = (ps) => { if (!ps.length) return "nao_gerada"; const sts = ps.map((p) => statusParcela(p, h)); return sts.includes("atrasada") ? "atrasada" : sts.includes("pendente") ? "pendente" : "paga"; };
    const parcelasDoMes = parcelas.filter((p) => p.mes === mes);
    const doMes = parcelasDoMes[0] || null;
    const historico = meses.map((k) => { const ps = parcelas.filter((x) => x.mes === k); return { mes: k, status: ps.length ? statusDoMes(ps) : "sem", parcela: ps[0] || null }; });
    const atrasadas = parcelas.filter((p) => statusParcela(p, h) === "atrasada");
    const recebido = parcelas.filter((p) => p.pago).reduce((t, p) => t + parseValorBR(p.valor), 0);
    const proxima = parcelas.filter((p) => !p.pago).sort((a, b) => (a.mes > b.mes ? 1 : -1))[0] || null;
    const primeiro = primeiroVencimento(s);
    const porUnidadeLinhas = porUnidade ? unidades.map((u) => { const p = parcelasDoMes.find((x) => x.unidadeId === u.id) || null; return { unidade: u, parcela: p, status: p ? statusParcela(p, h) : "nao_gerada" }; }) : [];
    linhas.push({
      clienteId: c.id, sistemaId: s.id, chave: `${c.id}:${s.id}`, cliente: c.negocio, contato: c.contato || {}, sistema: s, nomeSistema: s.nome || "sistema", valor, ativa: !!s.mensalidadeAtiva,
      porUnidade, unidades, porUnidadeLinhas, valorUnidade: parseValorBR(s.mensalidade),
      dia: Number(s.diaVencimento) || (primeiro ? primeiro.getDate() : null), desde: primeiro,
      doMes, parcelasDoMes, statusMes: s.mensalidadeAtiva || parcelasDoMes.length ? statusDoMes(parcelasDoMes) : "sem", historico, atrasadas, recebido, pagas: parcelas.filter((p) => p.pago).length, proxima,
      faltantes: mensalidadesPendentes(s, { parcelas: (financeiroPorCliente[c.id] || {}).parcelas || [] }, hoje, lista, c),
      implantacao: resumoImplantacao(s, financeiroPorCliente[c.id], lista),
    });
    }
  }
  const ativas = linhas.filter((l) => l.ativa);
  const soma = (xs) => xs.reduce((t, x) => t + x, 0);
  const resumo = {
    mensal: soma(ativas.map((l) => l.valor)), ativos: ativas.length,
    previsto: soma(linhas.filter((l) => l.parcelasDoMes.length || l.ativa).map((l) => (l.parcelasDoMes.length ? soma(l.parcelasDoMes.map((p) => parseValorBR(p.valor))) : l.valor))),
    recebido: soma(linhas.flatMap((l) => l.parcelasDoMes.filter((p) => p.pago).map((p) => parseValorBR(p.valor)))),
    pendente: soma(linhas.flatMap((l) => l.parcelasDoMes.filter((p) => !p.pago && statusParcela(p, h) === "pendente").map((p) => parseValorBR(p.valor)))),
    atrasado: soma(linhas.flatMap((l) => l.atrasadas.map((p) => parseValorBR(p.valor)))),
    naoGeradas: linhas.filter((l) => l.statusMes === "nao_gerada").length,
    faltantes: soma(linhas.map((l) => l.faltantes.length)),
    implantacaoAberta: soma(linhas.map((l) => l.implantacao.aberto)),
    implantacaoRecebida: soma(linhas.map((l) => l.implantacao.recebido)),
  };
  return { linhas: linhas.sort((a, b) => (a.ativa === b.ativa ? a.cliente.localeCompare(b.cliente) : a.ativa ? -1 : 1)), resumo, meses };
}

export function textoCobranca(linha, parcela, pix, unidade = null) {
  const nome = (unidade && (unidade.contato || unidade.nome)) || (linha.contato && linha.contato.nome) || linha.cliente;
  const mesTxt = parcela && parcela.mes ? new Date(Number(parcela.mes.slice(0, 4)), Number(parcela.mes.slice(5)) - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" }) : "";
  return `Oi, ${nome.split(" ")[0]}! Passando para lembrar da mensalidade do ${linha.nomeSistema}${mesTxt ? ` de ${mesTxt}` : ""}: ${parcela ? parcela.valor : "R$ " + linha.sistema.mensalidade}${parcela && parcela.vencimento ? `, vencimento ${parcela.vencimento}` : ""}.${pix ? ` Pix: ${pix}.` : ""} Qualquer coisa, me chama. Obrigada!`;
}

// ── Implantação: 50% no aceite, 50% na entrega, por sistema ───────

const dataHojeBR = () => dataBR(new Date());

// plano: { tipo: "50-50" } (aceite + entrega) ou { tipo: "iguais", n } (N parcelas mensais iguais a partir de hoje)
export function parcelasImplantacao(sistema, financeiro, lista = null, plano = { tipo: "50-50" }) {
  const total = parseValorBR(sistema && sistema.implantacao);
  if (!sistema || total <= 0) return [];
  const existentes = (financeiro.parcelas || []).filter((p) => p.implantacao && parcelaDoSistema(p, sistema, lista || [sistema]));
  if (existentes.length) return [];
  const nome = sistema.nome || "sistema";
  const comum = { pago: false, implantacao: true, sistemaId: sistema.id };
  if (plano && plano.tipo === "iguais") {
    const n = Math.min(24, Math.max(1, Number(plano.n) || 1));
    const base = Math.floor((total / n) * 100) / 100;
    const resto = Math.round((total - base * n) * 100) / 100;
    const hoje = new Date();
    return Array.from({ length: n }, (_, i) => {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() + i, Math.min(hoje.getDate(), 28));
      return { id: uid(), descricao: `Implantação ${i + 1}/${n} — ${nome}`, valor: formatarBR(i === 0 ? base + resto : base), vencimento: dataBR(d), ...comum };
    });
  }
  const metade = formatarBR(total / 2);
  return [
    { id: uid(), descricao: `50% no aceite — ${nome}`, valor: metade, vencimento: dataHojeBR(), ...comum },
    { id: uid(), descricao: `50% na entrega — ${nome}`, valor: metade, vencimento: sistema.entregueEm || "", entrega: true, ...comum },
  ];
}

export function resumoImplantacao(sistema, financeiro, lista = null) {
  const total = parseValorBR(sistema && sistema.implantacao);
  const parcelas = ((financeiro && financeiro.parcelas) || []).filter((p) => p.implantacao && parcelaDoSistema(p, sistema, lista || [sistema]));
  const recebido = parcelas.filter((p) => p.pago).reduce((t, p) => t + parseValorBR(p.valor), 0);
  const lancado = parcelas.reduce((t, p) => t + parseValorBR(p.valor), 0);
  return { total, recebido, lancado, aberto: Math.max(0, (lancado || total) - recebido), parcelas, geradas: parcelas.length > 0 };
}

// Redivide o que ainda não foi pago da implantação em N parcelas mensais iguais a partir de uma data,
// ou em "50/50" (aceite hoje + entrega). Parcelas pagas ficam; as em aberto são substituídas.
export function redividirImplantacao(sistema, financeiro, lista = null, plano = { tipo: "iguais", n: 2, primeira: "" }) {
  const todas = (financeiro && financeiro.parcelas) || [];
  const minhas = todas.filter((p) => p.implantacao && parcelaDoSistema(p, sistema, lista || [sistema]));
  const pagas = minhas.filter((p) => p.pago);
  const total = parseValorBR(sistema && sistema.implantacao);
  const restante = Math.max(0, total - pagas.reduce((t, p) => t + parseValorBR(p.valor), 0));
  const outras = todas.filter((p) => !minhas.includes(p) || p.pago);
  if (restante <= 0) return { parcelas: outras, novas: [] };
  const nome = sistema.nome || "sistema";
  const comum = { pago: false, implantacao: true, sistemaId: sistema.id };
  let novas = [];
  if (plano.tipo === "50-50") {
    const metade = formatarBR(restante / 2);
    novas = [
      { id: uid(), descricao: `50% no aceite — ${nome}`, valor: metade, vencimento: plano.primeira || dataHojeBR(), ...comum },
      { id: uid(), descricao: `50% na entrega — ${nome}`, valor: metade, vencimento: sistema.entregueEm || "", entrega: true, ...comum },
    ];
  } else {
    const n = Math.min(36, Math.max(1, Number(plano.n) || 1));
    const base = Math.floor((restante / n) * 100) / 100;
    const resto = Math.round((restante - base * n) * 100) / 100;
    const inicio = parseDataBR(plano.primeira) || new Date();
    novas = Array.from({ length: n }, (_, i) => {
      const d = new Date(inicio.getFullYear(), inicio.getMonth() + i, Math.min(inicio.getDate(), 28));
      return { id: uid(), descricao: `Implantação ${pagas.length + i + 1}/${pagas.length + n} — ${nome}`, valor: formatarBR(i === 0 ? base + resto : base), vencimento: dataBR(d), ...comum };
    });
  }
  return { parcelas: [...outras, ...novas], novas };
}
