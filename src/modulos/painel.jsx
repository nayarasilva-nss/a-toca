import { CORES } from "../nucleo/base.jsx";
import { HeaderModulo } from "../telas/hub.jsx";

// ─── Módulo: Painel do Projeto ──────────────────────────────

export function LinhaPainel({ rotulo, valor, alerta, dica }) {
  return (
    <div className="flex items-baseline justify-between py-1.5 border-b" style={{ borderColor: "var(--fundo-elevado)" }} title={dica || ""}>
      <span className="text-sm" style={{ color: CORES.fogoEscuro }}>{rotulo}</span>
      <span className="text-sm font-bold" style={{ color: alerta ? "var(--erro)" : "var(--sucesso)" }}>{valor}</span>
    </div>
  );
}

export function ModuloPainel({ cliente, dados, painel, onMudar, onVoltar }) {
  const d = dados;
  const verificacaoDegradada = d.alertas.length > 0;
  return (
    <div className="pb-16">
      <HeaderModulo
        titulo="Painel do Projeto"
        cliente={cliente}
        onVoltar={onVoltar}
        acoes={null}
      />
      <div style={{ maxWidth: "1000px", margin: "0 auto", paddingLeft: "32px", paddingRight: "32px" }}>
        <div className="enz-card">
        <p className="enz-titulo-descricao" style={{ marginTop: 0, marginBottom: 24 }}>
          Mede a adesão ao método — Indicadores mede o negócio do cliente. Quando a verificação cai, o controle cai semanas depois.
        </p>
        {verificacaoDegradada && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "var(--erro-fundo)", border: "2px solid var(--erro)", color: "var(--erro)" }}>
            Verificações degradando — o resultado cai em semanas se nada mudar: {d.alertas.join("; ")}.
          </div>
        )}
        <div className="mb-5">
          <div className="enz-rotulo mb-1">Itens de controle (resultado)</div>
          <LinhaPainel label="Índice de formalização" value={`${d.formalizacao}%`} alerta={d.formalizacao < 60} dica="% dos tipos de documento das frentes já gerados" />
          <LinhaPainel label="Pendências de conformidade resolvidas" value={`${d.cctResolvidos}/${d.cctTotal}`} alerta={d.cctTotal > 0 && d.cctResolvidos < d.cctTotal} />
          <div className="mt-2">
            <div className="text-xs mb-1" style={{ color: "var(--tinta)" }}>Autonomia decisória — relato do dono na fase Prova ("quantas vezes te acionaram este mês para algo que a alçada já resolvia?")</div>
            <div className="flex gap-2">
              <input className="w-20 px-2 py-1 text-sm rounded border bg-creme text-center" style={{ borderColor: "var(--linha)" }} placeholder="nº/mês" value={painel.autonomiaAcionamentos || ""} onChange={(e) => onMudar({ ...painel, autonomiaAcionamentos: e.target.value })} />
              <input className="flex-1 px-2 py-1 text-sm rounded border bg-creme" style={{ borderColor: "var(--linha)" }} placeholder="Relato estruturado do dono" value={painel.autonomiaRelato || ""} onChange={(e) => onMudar({ ...painel, autonomiaRelato: e.target.value })} />
            </div>
          </div>
        </div>
        <div>
          <div className="enz-rotulo mb-1">Itens de verificação (causa — acompanhe nos ritos)</div>
          <div className="grid sm:grid-cols-2 gap-x-6">
            <div>
              <div className="text-xs mt-1 mb-0.5" style={{ color: "var(--tinta)" }}>Checklists preenchidos na semana</div>
              <div className="flex items-center gap-1 text-sm">
                <input className="w-14 px-1 py-0.5 rounded border bg-creme text-center" style={{ borderColor: "var(--linha)" }} value={painel.checklistsFeitos || ""} onChange={(e) => onMudar({ ...painel, checklistsFeitos: e.target.value })} />
                <span style={{ color: CORES.textoDim }}>de</span>
                <input className="w-14 px-1 py-0.5 rounded border bg-creme text-center" style={{ borderColor: "var(--linha)" }} value={painel.checklistsPrevistos || ""} onChange={(e) => onMudar({ ...painel, checklistsPrevistos: e.target.value })} />
                <span className="font-bold ml-1" style={{ color: d.pctChecklists !== null && d.pctChecklists < 70 ? "var(--erro)" : "var(--sucesso)" }}>{d.pctChecklists !== null ? `${d.pctChecklists}%` : "—"}</span>
              </div>
            </div>
            <div>
              <div className="text-xs mt-1 mb-0.5" style={{ color: "var(--tinta)" }}>Ritos realizados na cadência</div>
              <div className="flex items-center gap-1 text-sm">
                <input className="w-14 px-1 py-0.5 rounded border bg-creme text-center" style={{ borderColor: "var(--linha)" }} value={painel.ritosFeitos || ""} onChange={(e) => onMudar({ ...painel, ritosFeitos: e.target.value })} />
                <span style={{ color: CORES.textoDim }}>de</span>
                <input className="w-14 px-1 py-0.5 rounded border bg-creme text-center" style={{ borderColor: "var(--linha)" }} value={painel.ritosPrevistos || ""} onChange={(e) => onMudar({ ...painel, ritosPrevistos: e.target.value })} />
                <span className="font-bold ml-1" style={{ color: d.pctRitos !== null && d.pctRitos < 70 ? "var(--erro)" : "var(--sucesso)" }}>{d.pctRitos !== null ? `${d.pctRitos}%` : "—"}</span>
              </div>
            </div>
          </div>
          <div className="mt-2">
            <LinhaPainel label="Anomalias tratadas × relatadas" value={`${d.anomTratadas}/${d.anomTotal}`} alerta={d.anomTotal > 0 && d.anomTratadas / d.anomTotal < 0.7} />
            <LinhaPainel label="Atas registradas (última)" value={d.ultimaAta ? `${d.totalAtas} · ${d.ultimaAta}` : "nenhuma"} alerta={!d.ultimaAta} />
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
