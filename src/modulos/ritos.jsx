import { AvisoErro, BotaoContorno, BotaoPrimario, Trabalhando } from "../componentes/ui.jsx";
import { emLinhasDoc } from "./documentos.jsx";
import { RodapeImpressao } from "./tabela.jsx";
import { CORES, uid } from "../nucleo/base.jsx";

// ─── Módulo: Ritos de Gestão ────────────────────────────────────

export function ModuloRitos({ cliente, ritos, gerando, erro, onMudar, onGerar, onImprimir, onVoltar }) {
  const itens = ritos.itens || [];
  const mudarItem = (id, campo, valor) =>
    onMudar({ ...ritos, itens: itens.map((i) => (i.id === id ? { ...i, [campo]: valor } : i)) });

  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="enz-link" style={{ marginBottom: 20 }}>
        ← {cliente.negocio}
      </button>
      <div className="enz-card">
        <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
          <h2 className="enz-titulo is-3">Ritos de Gestão</h2>
          <div className="flex gap-2">
            <BotaoPrimario onClick={onGerar} disabled={gerando}>
              {gerando ? "Gerando..." : itens.length ? "Gerar novamente" : "Gerar com IA"}
            </BotaoPrimario>
            {itens.length > 0 && <BotaoContorno onClick={onImprimir}>Exportar PDF</BotaoContorno>}
          </div>
        </div>
        <p className="enz-titulo-descricao" style={{ marginTop: 0, marginBottom: 24 }}>
          Encontros fixos que ninguém cancela. Cada rito com pauta padrão, para virar hábito — a gestão acontece sem depender de o dono lembrar.
        </p>

        <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Observações para a IA (opcional)</span><textarea rows={2} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} placeholder="Ex.: turnos de almoço e jantar; líderes só se encontram todos às segundas" value={ritos.obs || ""} onChange={(v) => onMudar({ ...ritos, obs: v })} /></label>

        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && itens.length === 0 && !erro && (
          <p className="text-sm py-4" style={{ color: CORES.textoDim }}>
            Nenhum rito definido. Gere com IA — do alinhamento diário rápido à mensal de resultados, com pautas que citam os indicadores quando já definidos.
          </p>
        )}

        {!gerando &&
          itens.map((r) => (
            <div key={r.id} className="mb-4 rounded-lg p-4" style={{ background: CORES.cartao, border: "2px solid var(--linha)" }}>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <input
                  className="font-serif text-base flex-1 min-w-40 bg-transparent outline-none"
                  style={{ color: CORES.fogo }}
                  value={r.nome}
                  onChange={(e) => mudarItem(r.id, "nome", e.target.value)}
                />
                <button
                  onClick={() => onMudar({ ...ritos, itens: itens.filter((x) => x.id !== r.id) })}
                  className="px-1 text-xs"
                  style={{ color: "var(--ouro-texto)" }}
                >
                  ✕
                </button>
              </div>
              <div className="grid sm:grid-cols-3 gap-2 mb-2">
                <input
                  className="px-2 py-1 text-xs rounded border bg-creme"
                  style={{ borderColor: "var(--linha)", color: "var(--tinta)" }}
                  value={r.frequencia}
                  placeholder="Frequência e momento"
                  onChange={(e) => mudarItem(r.id, "frequencia", e.target.value)}
                />
                <input
                  className="px-2 py-1 text-xs rounded border bg-creme"
                  style={{ borderColor: "var(--linha)", color: "var(--tinta)" }}
                  value={r.duracao}
                  placeholder="Duração"
                  onChange={(e) => mudarItem(r.id, "duracao", e.target.value)}
                />
                <input
                  className="px-2 py-1 text-xs rounded border bg-creme"
                  style={{ borderColor: "var(--linha)", color: "var(--tinta)" }}
                  value={r.participantes}
                  placeholder="Participantes"
                  onChange={(e) => mudarItem(r.id, "participantes", e.target.value)}
                />
              </div>
              <textarea
                rows={4}
                className="w-full px-2 py-1 text-sm rounded border bg-creme outline-none"
                style={{ borderColor: "var(--fundo-recuo)", color: CORES.fogoEscuro }}
                value={r.pauta}
                placeholder="Pauta padrão (um item por linha)"
                onChange={(e) => mudarItem(r.id, "pauta", e.target.value)}
              />
            </div>
          ))}

        {!gerando && (
          <button
            onClick={() =>
              onMudar({ ...ritos, itens: [...itens, { id: uid(), nome: "Novo rito", frequencia: "", duracao: "", participantes: "", pauta: "" }] })
            }
            className="text-sm"
            style={{ color: CORES.dourado }}
          >
            + Adicionar rito
          </button>
        )}
      </div>
    </div>
  );
}

export function ImpressaoRitos({ cliente, ritos }) {
  const itens = (ritos && ritos.itens) || [];
  if (itens.length === 0) return null;
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "var(--tinta)" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="enz-rotulo">Ritos de Gestão</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{cliente.negocio}</div>
        <div className="text-sm mt-1" style={{ color: "var(--tinta)" }}>{cliente.segmento}</div>
      </div>
      <p className="text-sm mb-5">
        Os ritos acontecem no dia e horário fixos, com a pauta padrão abaixo, independentemente da presença do dono. Reunião sem pauta cumprida não conta como realizada.
      </p>
      {itens.map((r) => {
        const pauta = emLinhasDoc(r.pauta);
        return (
          <div key={r.id} className="mb-5">
            <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>{r.nome}</div>
            <div className="overflow-x-auto"><table className="w-full text-sm border-collapse mb-2">
              <tbody>
                <tr>
                  {r.frequencia && (
                    <td className="border px-3 py-1" style={{ borderColor: CORES.laranja }}><strong>Quando:</strong> {r.frequencia}</td>
                  )}
                  {r.duracao && (
                    <td className="border px-3 py-1 w-36" style={{ borderColor: CORES.laranja }}><strong>Duração:</strong> {r.duracao}</td>
                  )}
                </tr>
                {r.participantes && (
                  <tr>
                    <td className="border px-3 py-1" colSpan={2} style={{ borderColor: CORES.laranja }}><strong>Participantes:</strong> {r.participantes}</td>
                  </tr>
                )}
              </tbody>
            </table></div>
            {pauta.length > 0 && (
              <ol className="text-sm list-decimal pl-5">
                {pauta.map((p, i) => <li key={i} className="mb-0.5">{p}</li>)}
              </ol>
            )}
          </div>
        );
      })}
      <RodapeImpressao />
    </div>
  );
}
