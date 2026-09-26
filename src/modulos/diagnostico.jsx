import { AvisoErro, BotaoContorno, BotaoPrimario, InputField, Trabalhando } from "../componentes/ui.jsx";
import { ESCALA_DIAG, FRAMEWORK_DIAG, chaveNota, percentualArea } from "../ia/diagnostico.jsx";
import { emLinhasDoc } from "./documentos.jsx";
import { RodapeImpressao } from "./tabela.jsx";
import { CORES, uid } from "../nucleo/base.jsx";

// ─── Módulo: Diagnóstico de Maturidade ──────────────────────────

export function diagVazio() {
  return {
    id: uid(),
    data: new Date().toLocaleDateString("pt-BR"),
    rotulo: "",
    notas: {},
    leitura: "",
    criticos: "",
    prioridades: "",
  };
}

export function RadarMaturidade({ notas, tamanho, framework: fw }) {
  const FR = fw || FRAMEWORK_DIAG;
  const T = tamanho || 300;
  const cx = T / 2;
  const cy = T / 2;
  const raio = T / 2 - 52;
  const n = FRAMEWORK_DIAG.length;
  const ponto = (idx, fator) => {
    const ang = (Math.PI * 2 * idx) / n - Math.PI / 2;
    return [cx + Math.cos(ang) * raio * fator, cy + Math.sin(ang) * raio * fator];
  };
  const aneis = [0.33, 0.66, 1];
  const valores = FR.map((_, aIdx) => {
    const pct = percentualArea(notas, aIdx);
    return pct === null ? 0 : pct / 100;
  });
  const poligono = valores.map((v, i) => ponto(i, Math.max(v, 0.02)).join(",")).join(" ");

  return (
    <svg width={T} height={T} viewBox={`0 0 ${T} ${T}`}>
      {aneis.map((f) => (
        <polygon
          key={f}
          points={FR.map((_, i) => ponto(i, f).join(",")).join(" ")}
          fill="none"
          stroke="var(--linha)"
          strokeWidth="1"
        />
      ))}
      {FR.map((_, i) => {
        const [x, y] = ponto(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--linha)" strokeWidth="1" />;
      })}
      <polygon points={poligono} fill="rgba(107,93,66,0.18)" stroke={CORES.fogo} strokeWidth="2" />
      {valores.map((v, i) => {
        const [x, y] = ponto(i, Math.max(v, 0.02));
        return <circle key={i} cx={x} cy={y} r="3.5" fill={CORES.fogo} />;
      })}
      {FR.map((a, i) => {
        const [x, y] = ponto(i, 1.22);
        const pct = percentualArea(notas, i, FR);
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            fontSize="10"
            fontFamily="Georgia, serif"
            fill={CORES.fogoEscuro}
          >
            <tspan x={x} dy="0">{a.area}</tspan>
            <tspan x={x} dy="12" fontWeight="bold" fill={CORES.dourado}>
              {pct === null ? "—" : `${pct}%`}
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}

export function ListaDiagnosticos({ cliente, diagnosticos, titulo, subtitulo, framework: fw, onAbrir, onNovo, onReavaliar, onVoltar }) {
  const FR = fw || FRAMEWORK_DIAG;
  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="enz-link" style={{ marginBottom: 20 }}>
        ← {cliente.negocio}
      </button>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
        <h2 className="enz-titulo is-2">{titulo || "Diagnóstico de Maturidade"}</h2>
        <BotaoPrimario onClick={onNovo}>+ Novo diagnóstico</BotaoPrimario>
      </div>
      <p className="enz-titulo-descricao" style={{ marginTop: 0, marginBottom: 24 }}>
        {subtitulo || "Nível de maturidade do negócio em cada área. Avalie 6 áreas e 24 critérios; refaça ao longo do engajamento — cada diagnóstico fica datado e a comparação vira o antes/depois da consultoria."}
      </p>
      {diagnosticos.length === 0 ? (
        <div className="enz-card enz-card-vazado" style={{ padding: "28px 0" }}>
          <p className="enz-nota" style={{ fontSize: 14 }}>
            Nenhum diagnóstico ainda. Faça o primeiro na fase de briefing — ele justifica a proposta e vira a régua de resultado no encerramento.
          </p>
        </div>
      ) : (
        <div className="grid gap-2">
          {diagnosticos.map((d) => {
            const medias = FR.map((_, i) => percentualArea(d.notas, i, FR)).filter((x) => x !== null);
            const geral = medias.length ? Math.round(medias.reduce((s, x) => s + x, 0) / medias.length) : null;
            return (
              <button
                key={d.id}
                onClick={() => onAbrir(d.id)}
                className="objeto text-left px-5 py-3 rounded-lg shadow-sm flex items-baseline justify-between"
                className="enz-card"
              >
                <span className="font-serif" style={{ color: CORES.fogo }}>
                  {d.rotulo || `Diagnóstico de ${d.data}`}
                </span>
                <span className="text-xs flex items-center gap-2" style={{ color: CORES.textoDim }}>
                  {d.data} · maturidade geral: {geral === null ? "não avaliada" : `${geral}%`}
                  <span
                    className="underline"
                    style={{ color: CORES.dourado }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onReavaliar(d);
                    }}
                    title="Cria um novo diagnóstico com estas notas copiadas — ajuste só o que mudou"
                  >
                    reavaliar →
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function EditorDiagnostico({ cliente, diag, titulo, framework: fw, gerando, erro, onMudar, onGerarLeitura, onCriarFrentes, onImprimir, onExcluir, onVoltar }) {
  const FR = fw || FRAMEWORK_DIAG;
  const respondidas = Object.values(diag.notas).filter((v) => v !== null && v !== "").length;
  const total = FRAMEWORK_DIAG.reduce((s, a) => s + a.criterios.length, 0);
  const areasCriticas = FRAMEWORK_DIAG.filter((_, i) => {
    const p = percentualArea(diag.notas, i, FR);
    return p !== null && p < 50;
  });

  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="enz-link" style={{ marginBottom: 20 }}>
        ← Diagnósticos · {cliente.negocio}
      </button>
      <div className="enz-card">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h2 className="enz-titulo is-3">
            {diag.rotulo || `Diagnóstico de ${diag.data}`}
          </h2>
          <div className="flex gap-2 flex-wrap">
            <BotaoPrimario onClick={onGerarLeitura} disabled={gerando || respondidas === 0}>
              {gerando ? "Gerando..." : diag.leitura ? "Gerar leitura novamente" : "Gerar leitura com IA"}
            </BotaoPrimario>
            {respondidas > 0 && <BotaoContorno onClick={onImprimir}>Exportar PDF</BotaoContorno>}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-x-4">
          <InputField label="Rótulo (opcional)" value={diag.rotulo} onChange={(v) => onMudar({ ...diag, rotulo: v })} placeholder="Ex.: Diagnóstico inicial" />
          <InputField label="Data" value={diag.data} onChange={(v) => onMudar({ ...diag, data: v })} />
        </div>

        <div className="text-xs mb-3" style={{ color: "var(--tinta-musgo)" }}>
          {respondidas}/{total} critérios avaliados · escala: {ESCALA_DIAG.join(" → ")}
        </div>

        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && (
          <>
            {FR.map((a, aIdx) => {
              const pct = percentualArea(diag.notas, aIdx, FR);
              return (
                <div key={a.area} className="mb-5">
                  <div className="flex items-baseline justify-between mb-1">
                    <div className="label" style={{ color: CORES.dourado }}>
                      {a.area}
                    </div>
                    <div className="text-xs font-bold" style={{ color: pct !== null && pct < 50 ? "var(--erro)" : CORES.fogo }}>
                      {pct === null ? "—" : `${pct}%`}
                    </div>
                  </div>
                  {a.criterios.map((crit, cIdx) => {
                    const chave = chaveNota(aIdx, cIdx);
                    const valor = diag.notas[chave];
                    return (
                      <div key={chave} className="flex items-center gap-2 py-1.5 border-b" style={{ borderColor: "var(--fundo-recuo)" }}>
                        <span className="flex-1 text-sm" style={{ color: CORES.fogoEscuro }}>{crit}</span>
                        <select
                          className="px-2 py-1 text-xs rounded border bg-creme"
                          style={{ borderColor: "var(--linha)", color: "var(--tinta)" }}
                          value={valor === undefined || valor === null ? "" : valor}
                          onChange={(e) =>
                            onMudar({ ...diag, notas: { ...diag.notas, [chave]: e.target.value === "" ? null : Number(e.target.value) } })
                          }
                        >
                          <option value="">—</option>
                          {ESCALA_DIAG.map((rotulo, n) => (
                            <option key={n} value={n}>{n} · {rotulo}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {respondidas > 0 && (
              <div className="flex justify-center my-6">
                <RadarMaturidade notas={diag.notas} framework={FR} />
              </div>
            )}

            {areasCriticas.length > 0 && (
              <div className="mb-5 p-4 rounded-lg" style={{ background: "var(--erro-fundo)" }}>
                <div className="text-sm mb-2" style={{ color: "var(--erro)" }}>
                  Áreas abaixo de 50%: {areasCriticas.map((a) => a.area).join(", ")}.
                </div>
                {onCriarFrentes && (
                  <BotaoContorno onClick={() => onCriarFrentes(areasCriticas.map((a) => a.area))}>
                    Criar frentes destas áreas no Plano de Ação
                  </BotaoContorno>
                )}
              </div>
            )}

            {(diag.leitura || diag.criticos || diag.prioridades) && (
              <>
                <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Leitura geral</span><textarea rows={3} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} value={diag.leitura} onChange={(e) => onMudar({ ...diag, leitura: e.target.value })} /></label>
                <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Pontos críticos (um por linha)</span><textarea rows={3} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} value={diag.criticos} onChange={(e) => onMudar({ ...diag, criticos: e.target.value })} /></label>
                <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Prioridades de ação (uma por linha)</span><textarea rows={4} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} value={diag.prioridades} onChange={(e) => onMudar({ ...diag, prioridades: e.target.value })} /></label>
              </>
            )}

            <button onClick={onExcluir} className="enz-confirmar">
              Excluir diagnóstico
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function ImpressaoDiagnostico({ cliente, diag, titulo, framework: fw }) {
  const FR = fw || FRAMEWORK_DIAG;
  if (!diag) return null;
  const respondidas = Object.values(diag.notas).filter((v) => v !== null && v !== "").length;
  if (respondidas === 0) return null;
  const criticos = emLinhasDoc(diag.criticos);
  const prioridades = emLinhasDoc(diag.prioridades);
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "var(--tinta)" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="enz-rotulo">{titulo || "Diagnóstico de Maturidade"}</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{diag.rotulo || cliente.negocio}</div>
        <div className="text-sm mt-1" style={{ color: "var(--tinta)" }}>{cliente.negocio} · {diag.data}</div>
      </div>

      <div className="flex justify-center mb-6">
        <RadarMaturidade notas={diag.notas} tamanho={340} framework={FR} />
      </div>

      {FR.map((a, aIdx) => {
        const pct = percentualArea(diag.notas, aIdx, FR);
        if (pct === null) return null;
        return (
          <div key={a.area} className="mb-4">
            <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>
              {a.area} — {pct}%
            </div>
            <div className="overflow-x-auto"><table className="w-full text-sm border-collapse">
              <tbody>
                {a.criterios.map((crit, cIdx) => {
                  const n = diag.notas[chaveNota(aIdx, cIdx)];
                  if (n === undefined || n === null || n === "") return null;
                  return (
                    <tr key={cIdx}>
                      <td className="border px-3 py-1" style={{ borderColor: CORES.laranja }}>{crit}</td>
                      <td className="border px-3 py-1 w-32 font-semibold" style={{ borderColor: CORES.laranja, color: Number(n) < 2 ? "var(--erro)" : "var(--sucesso)" }}>
                        {ESCALA_DIAG[Number(n)]}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table></div>
          </div>
        );
      })}

      {diag.leitura && (
        <div className="mb-5 mt-6">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Leitura geral</div>
          <p className="text-sm whitespace-pre-line">{diag.leitura}</p>
        </div>
      )}
      {criticos.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: "var(--erro)" }}>Pontos críticos</div>
          <ul className="text-sm list-disc pl-5">
            {criticos.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      )}
      {prioridades.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Prioridades de ação</div>
          <ol className="text-sm list-decimal pl-5">
            {prioridades.map((p, i) => <li key={i} className="mb-0.5">{p}</li>)}
          </ol>
        </div>
      )}

      <RodapeImpressao />
    </div>
  );
}
