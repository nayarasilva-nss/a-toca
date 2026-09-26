import { AvisoErro, BotaoContorno, BotaoPrimario, Trabalhando } from "../componentes/ui.jsx";
import { RodapeImpressao } from "./tabela.jsx";
import { CORES, uid } from "../nucleo/base.jsx";

// ─── Módulo: Alçadas de Decisão ─────────────────────────────────

export function agruparAlcadas(itens) {
  return [...new Set(itens.map((i) => i.categoria))].map((c) => ({
    categoria: c,
    itens: itens.filter((i) => i.categoria === c),
  }));
}

export function ModuloAlcadas({ cliente, alcadas, gerando, erro, onMudar, onGerar, onImprimir, onVoltar }) {
  const itens = alcadas.itens || [];
  const grupos = agruparAlcadas(itens);
  const mudarItem = (id, campo, valor) =>
    onMudar({ ...alcadas, itens: itens.map((i) => (i.id === id ? { ...i, [campo]: valor } : i)) });

  return (
    <div className="max-w-4xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="enz-link" style={{ marginBottom: 20 }}>
        ← {cliente.negocio}
      </button>
      <div className="enz-card">
        <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
          <h2 className="enz-titulo is-3">Alçadas de Decisão</h2>
          <div className="flex gap-2">
            <BotaoPrimario onClick={onGerar} disabled={gerando}>
              {gerando ? "Gerando..." : itens.length ? "Gerar novamente" : "Gerar com IA"}
            </BotaoPrimario>
            {itens.length > 0 && <BotaoContorno onClick={onImprimir}>Exportar PDF</BotaoContorno>}
          </div>
        </div>
        <p className="enz-titulo-descricao" style={{ marginTop: 0, marginBottom: 24 }}>
          Quem decide o quê sem pedir licença, até que limite, e para quem escala. O documento que liberta o dono do operacional.
        </p>

        <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Observações para a IA (opcional)</span><textarea rows={2} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} placeholder="Ex.: dono quer aprovar toda compra acima de R$ 500; gerente pode dar até 10% de desconto" value={alcadas.obs || ""} onChange={(v) => onMudar({ ...alcadas, obs: v })} /></label>

        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && itens.length === 0 && !erro && (
          <p className="text-sm py-4" style={{ color: CORES.textoDim }}>
            Nenhuma alçada definida. Gere com IA — ela propõe limites conservadores a partir dos cargos e do organograma, e você calibra os valores com o dono.
          </p>
        )}

        {!gerando &&
          grupos.map((g) => (
            <div key={g.categoria} className="mb-5">
              <div className="enz-rotulo mb-1">
                {g.categoria}
              </div>
              <div className="hidden sm:flex gap-2 text-xs pb-1" style={{ color: "var(--tinta-musgo)" }}>
                <span className="flex-1">Decisão</span>
                <span className="w-32">Quem decide</span>
                <span className="w-36">Limite / condição</span>
                <span className="w-32">Acima disso</span>
                <span className="w-5" />
              </div>
              {g.itens.map((i) => (
                <div key={i.id} className="flex items-center gap-2 py-1.5 border-b flex-wrap sm:flex-nowrap" style={{ borderColor: "var(--fundo-recuo)" }}>
                  <input
                    className="flex-1 min-w-40 px-2 py-1 text-sm rounded border bg-creme"
                    style={{ borderColor: "var(--linha)", color: CORES.fogoEscuro }}
                    value={i.decisao}
                    onChange={(e) => mudarItem(i.id, "decisao", e.target.value)}
                  />
                  <input
                    className="w-32 px-2 py-1 text-xs rounded border bg-creme"
                    style={{ borderColor: "var(--linha)", color: "var(--tinta)" }}
                    value={i.decide}
                    placeholder="Quem decide"
                    onChange={(e) => mudarItem(i.id, "decide", e.target.value)}
                  />
                  <input
                    className="w-36 px-2 py-1 text-xs rounded border bg-creme"
                    style={{ borderColor: "var(--linha)", color: "var(--tinta)" }}
                    value={i.limite}
                    placeholder="Limite"
                    onChange={(e) => mudarItem(i.id, "limite", e.target.value)}
                  />
                  <input
                    className="w-32 px-2 py-1 text-xs rounded border bg-creme"
                    style={{ borderColor: "var(--linha)", color: "var(--tinta)" }}
                    value={i.escalonamento}
                    placeholder="Escala para"
                    onChange={(e) => mudarItem(i.id, "escalonamento", e.target.value)}
                  />
                  <button
                    onClick={() => onMudar({ ...alcadas, itens: itens.filter((x) => x.id !== i.id) })}
                    className="px-1 text-xs"
                    style={{ color: "var(--ouro-texto)" }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ))}

        {!gerando && (
          <button
            onClick={() =>
              onMudar({ ...alcadas, itens: [...itens, { id: uid(), categoria: "Geral", decisao: "", decide: "", limite: "", escalonamento: "" }] })
            }
            className="mt-1 text-sm"
            style={{ color: CORES.dourado }}
          >
            + Adicionar alçada
          </button>
        )}
      </div>
    </div>
  );
}

export function ImpressaoAlcadas({ cliente, alcadas }) {
  const itens = (alcadas && alcadas.itens) || [];
  if (itens.length === 0) return null;
  const grupos = agruparAlcadas(itens);
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "var(--tinta)" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="enz-rotulo">Matriz de Alçadas de Decisão</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{cliente.negocio}</div>
        <div className="text-sm mt-1" style={{ color: "var(--tinta)" }}>{cliente.segmento}</div>
      </div>
      <p className="text-sm mb-5">
        Decisões dentro do limite são tomadas pelo responsável indicado, sem consulta prévia. Acima do limite, a decisão escala para o nível indicado. Valores e condições revisados periodicamente pela gestão.
      </p>
      {grupos.map((g) => (
        <div key={g.categoria} className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>{g.categoria}</div>
          <div className="overflow-x-auto"><table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="border px-3 py-1 text-left" style={{ borderColor: CORES.laranja, color: CORES.dourado }}>Decisão</th>
                <th className="border px-3 py-1 text-left w-36" style={{ borderColor: CORES.laranja, color: CORES.dourado }}>Quem decide</th>
                <th className="border px-3 py-1 text-left w-40" style={{ borderColor: CORES.laranja, color: CORES.dourado }}>Limite / condição</th>
                <th className="border px-3 py-1 text-left w-36" style={{ borderColor: CORES.laranja, color: CORES.dourado }}>Acima disso</th>
              </tr>
            </thead>
            <tbody>
              {g.itens.map((i) => (
                <tr key={i.id}>
                  <td className="border px-3 py-1" style={{ borderColor: CORES.laranja }}>{i.decisao}</td>
                  <td className="border px-3 py-1 font-semibold" style={{ borderColor: CORES.laranja }}>{i.decide}</td>
                  <td className="border px-3 py-1" style={{ borderColor: CORES.laranja }}>{i.limite}</td>
                  <td className="border px-3 py-1" style={{ borderColor: CORES.laranja }}>{i.escalonamento}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      ))}
      <RodapeImpressao />
    </div>
  );
}
