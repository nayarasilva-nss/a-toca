import { parseDataBR } from "../ia/cronograma.jsx";
import { formatarBR, parseValorBR } from "../ia/financeiro.jsx";
import { CORES, uid } from "../nucleo/base.jsx";
import { HeaderModulo } from "../telas/hub.jsx";

// ─── Módulo: Financeiro ─────────────────────────────────────────

export function ModuloFinanceiro({ cliente, financeiro, propostaAceita, onMudar, onVoltar }) {
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
        titulo="Financeiro do Engajamento"
        cliente={cliente}
        onVoltar={onVoltar}
        acoes={null}
      />
      <div style={{ maxWidth: "1000px", margin: "0 auto", paddingLeft: "32px", paddingRight: "32px" }}>
        <div className="rounded-lg p-6 shadow-sm card">
        <p className="text-xs mb-4" style={{ color: CORES.textoDim }}>
          Controle financeiro: parcelas, vencimentos e o que já entrou. Uso interno — nada disso aparece em documentos do cliente.
        </p>

        {propostaAceita && parcelas.length === 0 && (
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
            style={{ background: "#E3EBD8", color: "#4F6B3A", border: "1px solid #4F6B3A55" }}
          >
            Puxar da proposta aceita ({propostaAceita.investimento || "valor a definir"}) — cria a primeira parcela para você dividir
          </button>
        )}

        <div className="flex gap-3 flex-wrap mb-5">
          <div className="px-4 py-2 rounded-lg text-sm" style={{ background: "#E3EBD8", color: "#4F6B3A" }}>
            Recebido: <strong>{formatarBR(recebido)}</strong>
          </div>
          <div className="px-4 py-2 rounded-lg text-sm" style={{ background: CORES.hover, color: "#9A6A2F" }}>
            A receber: <strong>{formatarBR(aReceber)}</strong>
          </div>
          {atrasado > 0 && (
            <div className="px-4 py-2 rounded-lg text-sm" style={{ background: "#F0DCD2", color: "#8A3A2E" }}>
              Vencido: <strong>{formatarBR(atrasado)}</strong>
            </div>
          )}
        </div>

        {parcelas.map((p) => {
          const venc = parseDataBR(p.vencimento);
          const vencida = !p.pago && venc && venc < hoje;
          return (
            <div key={p.id} className="flex items-center gap-2 py-1.5 border-b flex-wrap" style={{ borderColor: "#EFE8D6" }}>
              <input
                type="checkbox"
                checked={!!p.pago}
                title="Recebida"
                onChange={(e) => mudarParcela(p.id, "pago", e.target.checked)}
              />
              <input
                className="flex-1 min-w-32 px-2 py-1 text-sm rounded border bg-creme"
                style={{ borderColor: "#E0D5BC", color: p.pago ? "#A89878" : CORES.fogoEscuro, textDecoration: p.pago ? "line-through" : "none" }}
                placeholder="Descrição (ex.: Entrada, Parcela 1)"
                value={p.descricao}
                onChange={(e) => mudarParcela(p.id, "descricao", e.target.value)}
              />
              <input
                className="w-28 px-2 py-1 text-sm rounded border bg-creme text-right"
                style={{ borderColor: "#E0D5BC", color: CORES.fogoEscuro }}
                placeholder="R$ 0,00"
                value={p.valor}
                onChange={(e) => mudarParcela(p.id, "valor", e.target.value)}
              />
              <input
                className="w-28 px-2 py-1 text-xs rounded border bg-creme text-center"
                style={{ borderColor: vencida ? "#8A3A2E" : "#E0D5BC", color: vencida ? "#8A3A2E" : "#6B5D42" }}
                placeholder="dd/mm/aaaa"
                title="Vencimento"
                value={p.vencimento}
                onChange={(e) => mudarParcela(p.id, "vencimento", e.target.value)}
              />
              <button
                onClick={() => onMudar({ ...financeiro, parcelas: parcelas.filter((x) => x.id !== p.id) })}
                className="px-1 text-xs"
                style={{ color: "#B8860B" }}
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
