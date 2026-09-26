import { AvisoErro, BotaoContorno, BotaoPrimario, Trabalhando } from "../componentes/ui.jsx";
import { RodapeImpressao } from "./tabela.jsx";
import { CORES, uid } from "../nucleo/base.jsx";

// ─── Módulo: Indicadores ────────────────────────────────────────

export function ModuloIndicadores({ cliente, painel, gerando, erro, onMudar, onGerar, onImprimir, onVoltar }) {
  const itens = painel.itens || [];
  const areas = [...new Set(itens.map((i) => i.area))];
  const mudarItem = (id, campo, valor) =>
    onMudar({ ...painel, itens: itens.map((i) => (i.id === id ? { ...i, [campo]: valor } : i)) });

  return (
    <div className="max-w-4xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: CORES.douradoEscuro, letterSpacing: 1, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "'Lora', serif" }}>
        ← {cliente.negocio}
      </button>
      <div className="rounded-lg p-6 shadow-sm card">
        <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
          <h2 className="font-serif text-lg" style={{ color: CORES.fogo }}>Indicadores</h2>
          <div className="flex gap-2">
            <BotaoPrimario onClick={onGerar} disabled={gerando}>
              {gerando ? "Gerando..." : itens.length ? "Gerar novamente" : "Gerar com IA"}
            </BotaoPrimario>
            {itens.length > 0 && <BotaoContorno onClick={onImprimir}>Exportar PDF</BotaoContorno>}
          </div>
        </div>
        <p className="text-xs mb-4" style={{ color: CORES.textoDim }}>
          A Taça das Casas: os pontos que cada área acompanha — poucos, mensuráveis com o que a PME tem, com meta e dono. Sem isso, os ritos viram reunião de opinião.
        </p>

        <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Observações para a IA (opcional)</span><textarea rows={2} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} placeholder="Ex.: dor principal é desperdício e atraso no delivery; sistema de vendas é o Consumer" value={painel.obs || ""} onChange={(v) => onMudar({ ...painel, obs: v })} /></label>

        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && itens.length === 0 && !erro && (
          <p className="text-sm py-4" style={{ color: CORES.textoDim }}>
            Nenhum indicador definido. Gere com IA — metas vêm marcadas como sugestão, pra calibrar com o dono.
          </p>
        )}

        {!gerando &&
          areas.map((area) => (
            <div key={area} className="mb-5">
              <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: CORES.dourado }}>
                {area}
              </div>
              <div className="hidden sm:flex gap-2 text-xs pb-1" style={{ color: "#A89878" }}>
                <span className="w-40">Indicador</span>
                <span className="flex-1">Como medir</span>
                <span className="w-28">Meta</span>
                <span className="w-24">Frequência</span>
                <span className="w-28">Responsável</span>
                <span className="w-5" />
              </div>
              {itens
                .filter((i) => i.area === area)
                .map((i) => (
                  <div key={i.id} className="flex items-center gap-2 py-1.5 border-b flex-wrap sm:flex-nowrap" style={{ borderColor: "#EFE8D6" }}>
                    <input
                      className="w-40 px-2 py-1 text-sm rounded border bg-creme"
                      style={{ borderColor: "#E0D5BC", color: CORES.fogoEscuro }}
                      value={i.nome}
                      onChange={(e) => mudarItem(i.id, "nome", e.target.value)}
                    />
                    <input
                      className="flex-1 min-w-36 px-2 py-1 text-xs rounded border bg-creme"
                      style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                      value={i.como}
                      placeholder="Como medir"
                      onChange={(e) => mudarItem(i.id, "como", e.target.value)}
                    />
                    <input
                      className="w-28 px-2 py-1 text-xs rounded border bg-creme"
                      style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                      value={i.meta}
                      placeholder="Meta"
                      onChange={(e) => mudarItem(i.id, "meta", e.target.value)}
                    />
                    <input
                      className="w-24 px-2 py-1 text-xs rounded border bg-creme"
                      style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                      value={i.frequencia}
                      placeholder="Freq."
                      onChange={(e) => mudarItem(i.id, "frequencia", e.target.value)}
                    />
                    <input
                      className="w-28 px-2 py-1 text-xs rounded border bg-creme"
                      style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                      value={i.responsavel}
                      placeholder="Responsável"
                      onChange={(e) => mudarItem(i.id, "responsavel", e.target.value)}
                    />
                    <button
                      onClick={() => onMudar({ ...painel, itens: itens.filter((x) => x.id !== i.id) })}
                      className="px-1 text-xs"
                      style={{ color: "#B8860B" }}
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
              onMudar({ ...painel, itens: [...itens, { id: uid(), area: "Geral", nome: "", como: "", meta: "", frequencia: "", responsavel: "" }] })
            }
            className="mt-1 text-sm"
            style={{ color: CORES.dourado }}
          >
            + Adicionar indicador
          </button>
        )}
      </div>
    </div>
  );
}

export function ImpressaoIndicadores({ cliente, painel }) {
  const itens = (painel && painel.itens) || [];
  if (itens.length === 0) return null;
  const areas = [...new Set(itens.map((i) => i.area))];
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "#2A1218" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="text-xs uppercase tracking-widest" style={{ color: CORES.dourado }}>Painel de Indicadores</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{cliente.negocio}</div>
        <div className="text-sm mt-1" style={{ color: "#6B5D42" }}>{cliente.segmento}</div>
      </div>
      {areas.map((area) => (
        <div key={area} className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>{area}</div>
          <div className="overflow-x-auto"><table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="border px-3 py-1 text-left" style={{ borderColor: CORES.laranja, color: CORES.dourado }}>Indicador</th>
                <th className="border px-3 py-1 text-left" style={{ borderColor: CORES.laranja, color: CORES.dourado }}>Como medir</th>
                <th className="border px-3 py-1 text-left w-28" style={{ borderColor: CORES.laranja, color: CORES.dourado }}>Meta</th>
                <th className="border px-3 py-1 text-left w-24" style={{ borderColor: CORES.laranja, color: CORES.dourado }}>Frequência</th>
                <th className="border px-3 py-1 text-left w-32" style={{ borderColor: CORES.laranja, color: CORES.dourado }}>Responsável</th>
              </tr>
            </thead>
            <tbody>
              {itens
                .filter((i) => i.area === area)
                .map((i) => (
                  <tr key={i.id}>
                    <td className="border px-3 py-1 font-semibold" style={{ borderColor: CORES.laranja }}>{i.nome}</td>
                    <td className="border px-3 py-1" style={{ borderColor: CORES.laranja }}>{i.como}</td>
                    <td className="border px-3 py-1" style={{ borderColor: CORES.laranja }}>{i.meta}</td>
                    <td className="border px-3 py-1" style={{ borderColor: CORES.laranja }}>{i.frequencia}</td>
                    <td className="border px-3 py-1" style={{ borderColor: CORES.laranja }}>{i.responsavel}</td>
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
