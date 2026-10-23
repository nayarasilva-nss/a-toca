import { useState } from "react";
import { parseDataBR } from "../ia/cronograma.jsx";
import { formatarBR, parseValorBR } from "../ia/financeiro.jsx";
import { CORES, uid } from "../nucleo/base.jsx";
import { parcelasImplantacao, resumoImplantacao } from "../nucleo/recorrencia.jsx";
import { unidadesCobradas } from "../nucleo/sistemas.js";
import { HeaderModulo } from "../telas/hub.jsx";

// ─── Módulo: Financeiro ─────────────────────────────────────────

function LancarImplantacao({ sistema, sistemas, financeiro, onLancar }) {
  const [tipo, setTipo] = useState("50-50");
  const [n, setN] = useState(3);
  return (
    <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 8 }}>
      <select className="enz-input" style={{ width: 230, padding: "6px 10px" }} value={tipo} onChange={(e) => setTipo(e.target.value)}>
        <option value="50-50">50% no aceite + 50% na entrega</option>
        <option value="iguais">parcelas mensais iguais</option>
      </select>
      {tipo === "iguais" && <input className="enz-input" type="number" min={1} max={24} style={{ width: 70, padding: "6px 10px" }} value={n} onChange={(e) => setN(e.target.value)} />}
      <button className="enz-botao enz-botao-contorno enz-botao-pequeno" onClick={() => onLancar(parcelasImplantacao(sistema, financeiro, sistemas, { tipo, n }))}>Lançar parcelas</button>
      <span className="enz-nota">depois ajuste valor e data de cada uma na lista abaixo.</span>
    </div>
  );
}

export function ModuloFinanceiro({ cliente, financeiro, propostaAceita, sistemas = [], mensalidadesPendentes = [], onMudar, onVoltar }) {
  const parcelas = financeiro.parcelas || [];
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  let recebido = 0;
  let aReceber = 0;
  let atrasado = 0;
  for (const p of parcelas) {
    const v = parseValorBR(p.valor);
    if (p.pago) recebido += v;
    else {
      aReceber += v;
      const venc = parseDataBR(p.vencimento);
      if (venc && venc < hoje) atrasado += v;
    }
  }

  const mudarParcela = (id, campo, valor) => {
    onMudar({ ...financeiro, parcelas: parcelas.map((p) => (p.id === id ? { ...p, [campo]: valor } : p)) });
  };

  return (
    <div className="pb-16">
      <HeaderModulo
        titulo={cliente.tipo === "pessoa" ? "Financeiro da Jornada" : "Financeiro do Projeto"}
        cliente={cliente}
        onVoltar={onVoltar}
        acoes={null}
      />
      <div style={{ maxWidth: "1000px", margin: "0 auto", paddingLeft: "32px", paddingRight: "32px" }}>
        <div className="enz-card">
        <p className="enz-titulo-descricao" style={{ marginTop: 0, marginBottom: 24 }}>
          {cliente.tipo === "pessoa" ? "Parcelas da mentoria, vencimentos e o que já entrou. Uso interno — nada disso aparece para o mentorado." : "Parcelas, vencimentos e o que já entrou. Uso interno — nada disso aparece em documentos do cliente."}
        </p>

        {propostaAceita && propostaAceita.tipo !== "sistema" && parcelas.length === 0 && (
          <button
            onClick={() =>
              onMudar({
                ...financeiro,
                parcelas: [
                  {
                    id: uid(),
                    descricao: `Contrato — ${propostaAceita.rotulo || `proposta de ${propostaAceita.data}`}`,
                    valor: propostaAceita.investimento || "",
                    vencimento: "",
                    pago: false,
                  },
                ],
              })
            }
            className="mb-4 px-4 py-2 rounded text-sm font-semibold"
            style={{ background: "var(--sucesso-fundo)", color: "var(--sucesso)", border: "1px solid var(--linha-forte)" }}
          >
            Puxar da proposta aceita ({propostaAceita.investimento || "valor a definir"}) — cria a primeira parcela para você dividir
          </button>
        )}

        {sistemas.filter((sistema) => sistema.mensalidadeAtiva || sistema.entregueEm || parseValorBR(sistema.implantacao) > 0).map((sistema) => { const pend = mensalidadesPendentes.filter((p) => !p.sistemaId || p.sistemaId === sistema.id); const imp = resumoImplantacao(sistema, financeiro, sistemas); const novasImp = parcelasImplantacao(sistema, financeiro, sistemas); return (
          <div key={sistema.id} className="mb-4 p-4 rounded-lg" style={{ border: "1px solid var(--linha)" }}>
            <div className="enz-rotulo mb-1">Sistema · {sistema.nome || "sem nome"}</div>
            {imp.total > 0 && (
              <div className="text-sm" style={{ marginBottom: 6 }}>
                Implantação de {formatarBR(imp.total)}{imp.geradas ? ` — ${formatarBR(imp.recebido)} recebidos, ${formatarBR(imp.aberto)} em aberto.` : " — parcelas ainda não lançadas."}
                {novasImp.length > 0 && <LancarImplantacao sistema={sistema} sistemas={sistemas} financeiro={financeiro} onLancar={(novas) => onMudar({ ...financeiro, parcelas: [...parcelas, ...novas] })} />}
              </div>
            )}
            <div className="text-sm">
              {sistema.entregueEm ? `Entregue em ${sistema.entregueEm}. ` : ""}
              {sistema.mensalidadeAtiva ? `Mensalidade ativa de R$ ${sistema.mensalidade}/mês${sistema.cobranca === "unidade" ? ` por unidade (${unidadesCobradas(sistema, cliente).length} unidades)` : ""} — vence todo dia ${sistema.diaVencimento || (sistema.entregueEm || sistema.inicio || "").slice(0, 2) || "?"}.` : "Mensalidade ainda não ativada no módulo Sistema."}
            </div>
            {pend.length > 0 && (
              <button
                onClick={() => onMudar({ ...financeiro, parcelas: [...parcelas, ...pend] })}
                className="mt-3 px-4 py-2 rounded text-sm font-semibold"
                style={{ background: "var(--sucesso-fundo)", color: "var(--sucesso)", border: "1px solid var(--linha-forte)" }}
              >
                Gerar {pend.length} mensalidade{pend.length > 1 ? "s" : ""} até este mês
              </button>
            )}
            {sistema.mensalidadeAtiva && !pend.length && <div className="enz-nota" style={{ marginTop: 6 }}>mensalidades em dia até este mês. volte aqui no mês que vem.</div>}
          </div>
        ); })}

        <div className="flex gap-3 flex-wrap mb-5">
          <div className="px-4 py-2 rounded-lg text-sm" style={{ background: "var(--sucesso-fundo)", color: "var(--sucesso)" }}>
            Recebido: <strong>{formatarBR(recebido)}</strong>
          </div>
          <div className="px-4 py-2 rounded-lg text-sm" style={{ background: CORES.hover, color: "var(--alerta)" }}>
            A receber: <strong>{formatarBR(aReceber)}</strong>
          </div>
          {atrasado > 0 && (
            <div className="px-4 py-2 rounded-lg text-sm" style={{ background: "var(--erro-fundo)", color: "var(--erro)" }}>
              Vencido: <strong>{formatarBR(atrasado)}</strong>
            </div>
          )}
        </div>

        {parcelas.map((p) => {
          const venc = parseDataBR(p.vencimento);
          const vencida = !p.pago && venc && venc < hoje;
          return (
            <div key={p.id} className="flex items-center gap-2 py-1.5 border-b flex-wrap" style={{ borderColor: "var(--fundo-recuo)" }}>
              <input
                type="checkbox"
                checked={!!p.pago}
                title="Recebida"
                onChange={(e) => mudarParcela(p.id, "pago", e.target.checked)}
              />
              <input
                className="flex-1 min-w-32 px-2 py-1 text-sm rounded border bg-creme"
                style={{ borderColor: "var(--linha)", color: p.pago ? "var(--tinta-musgo)" : CORES.fogoEscuro, textDecoration: p.pago ? "line-through" : "none" }}
                placeholder="Descrição (ex.: Entrada, Parcela 1)"
                value={p.descricao}
                onChange={(e) => mudarParcela(p.id, "descricao", e.target.value)}
              />
              <input
                className="w-28 px-2 py-1 text-sm rounded border bg-creme text-right"
                style={{ borderColor: "var(--linha)", color: CORES.fogoEscuro }}
                placeholder="R$ 0,00"
                value={p.valor}
                onChange={(e) => mudarParcela(p.id, "valor", e.target.value)}
              />
              <input
                className="w-28 px-2 py-1 text-xs rounded border bg-creme text-center"
                style={{ borderColor: vencida ? "var(--erro)" : "var(--linha)", color: vencida ? "var(--erro)" : "var(--tinta)" }}
                placeholder="dd/mm/aaaa"
                title="Vencimento"
                value={p.vencimento}
                onChange={(e) => mudarParcela(p.id, "vencimento", e.target.value)}
              />
              <button
                onClick={() => onMudar({ ...financeiro, parcelas: parcelas.filter((x) => x.id !== p.id) })}
                className="px-1 text-xs"
                style={{ color: "var(--ouro-texto)" }}
              >
                ✕
              </button>
            </div>
          );
        })}

        <button
          onClick={() =>
            onMudar({ ...financeiro, parcelas: [...parcelas, { id: uid(), descricao: "", valor: "", vencimento: "", pago: false }] })
          }
          className="mt-3 text-sm"
          style={{ color: CORES.dourado }}
        >
          + Adicionar parcela
        </button>
      </div>
      </div>
    </div>
  );
}
