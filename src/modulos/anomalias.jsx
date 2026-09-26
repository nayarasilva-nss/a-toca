import { AvisoErro, BotaoPrimario, Trabalhando } from "../componentes/ui.jsx";
import { CORES, uid } from "../nucleo/base.jsx";
import { HeaderModulo } from "../telas/hub.jsx";

// ─── Módulo: Anomalias ─────────────────────────

export function anomaliaVazia() {
  return { id: uid(), data: new Date().toLocaleDateString("pt-BR"), fato: "", quando: "", local: "", tag: "", causa: "", acao: "", responsavelSugerido: "", status: "relatada", frenteDestino: "" };
}

export function ModuloAnomalias({ cliente, anomalias, frentes, gerando, erro, onMudar, onAnalisar, onEnviarAcao, onVoltar }) {
  const tags = {};
  anomalias.forEach((a) => { const t = (a.tag || a.local || "").trim().toLowerCase(); if (t) tags[t] = (tags[t] || 0) + 1; });
  const tratadas = anomalias.filter((a) => a.status === "tratada").length;
  return (
    <div className="pb-16">
      <HeaderModulo
        titulo="Tratamento de Anomalias"
        cliente={cliente}
        onVoltar={onVoltar}
        acoes={null}
      />
      <div style={{ maxWidth: "1000px", margin: "0 auto", paddingLeft: "32px", paddingRight: "32px" }}>
        <div className="rounded-lg p-6 shadow-sm card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", gap: "12px", flexWrap: "wrap" }}>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold" style={{ color: tratadas === anomalias.length && anomalias.length ? "#4F6B3A" : "#9A6A2F" }}>
              {tratadas}/{anomalias.length} tratadas
            </span>
            <BotaoPrimario onClick={() => onMudar([anomaliaVazia(), ...anomalias])}>+ Relatar anomalia</BotaoPrimario>
          </div>
        </div>
        <p className="text-xs mb-4" style={{ color: CORES.textoDim }}>
          O sistema detecta quando algo foge do padrão: POP não seguido, checklist falho, reclamação, fornecedor. Relatar → FCA → Agir. Registros 100% internos.
        </p>
        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}
        {!gerando && anomalias.length === 0 && !erro && (
          <p className="text-sm py-6" style={{ color: CORES.textoDim }}>Nenhuma anomalia registrada. Quando algo fugir do padrão na operação do cliente, relate aqui.</p>
        )}
        {!gerando && anomalias.map((a) => {
          const t = (a.tag || a.local || "").trim().toLowerCase();
          const recorrencia = t ? tags[t] : 0;
          return (
            <div key={a.id} className="mb-3 rounded-lg p-4" style={{ background: CORES.cartao, border: a.status === "tratada" ? "2px solid #4F6B3A55" : "2px solid #E97F3855" }}>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs" style={{ color: "#A89878" }}>{a.data}</span>
                <select
                  className="px-2 py-0.5 text-xs rounded border font-semibold"
                  style={a.status === "tratada" ? { borderColor: "#4F6B3A", background: "#E3EBD8", color: "#4F6B3A" } : { borderColor: "#9A6A2F", background: "#F5E6C8", color: "#9A6A2F" }}
                  value={a.status}
                  onChange={(e) => onMudar(anomalias.map((x) => (x.id === a.id ? { ...x, status: e.target.value } : x)))}
                >
                  <option value="relatada">Relatada</option>
                  <option value="tratada">Tratada ✓</option>
                </select>
                {recorrencia > 1 && (
                  <span className="text-xs px-1.5 py-0.5 rounded font-semibold" style={{ background: "#F5DDD6", color: "#8A3A2E" }} title="Anomalia repetida sugere padrão errado ou pessoa na cadeira errada — cruze com Temperamentos (leitura interna)">
                    recorrente ×{recorrencia}
                  </span>
                )}
                <button onClick={() => onMudar(anomalias.filter((x) => x.id !== a.id))} className="ml-auto text-xs px-1" style={{ color: "#C0B091" }}>✕</button>
              </div>
              <div className="grid sm:grid-cols-3 gap-2 mb-2">
                <input className="sm:col-span-3 px-2 py-1 text-sm rounded border bg-creme" style={{ borderColor: "#E0D5BC", color: CORES.fogoEscuro }} placeholder="Fato: o que aconteceu" value={a.fato} onChange={(e) => onMudar(anomalias.map((x) => (x.id === a.id ? { ...x, fato: e.target.value } : x)))} />
                <input className="px-2 py-1 text-xs rounded border bg-creme" style={{ borderColor: "#E0D5BC", color: "#6B5D42" }} placeholder="Quando" value={a.quando} onChange={(e) => onMudar(anomalias.map((x) => (x.id === a.id ? { ...x, quando: e.target.value } : x)))} />
                <input className="px-2 py-1 text-xs rounded border bg-creme" style={{ borderColor: "#E0D5BC", color: "#6B5D42" }} placeholder="Onde (setor/processo)" value={a.local} onChange={(e) => onMudar(anomalias.map((x) => (x.id === a.id ? { ...x, local: e.target.value } : x)))} />
                <input className="px-2 py-1 text-xs rounded border bg-creme" style={{ borderColor: "#E0D5BC", color: "#6B5D42" }} placeholder="Tag p/ recorrência (ex.: estoque)" value={a.tag} onChange={(e) => onMudar(anomalias.map((x) => (x.id === a.id ? { ...x, tag: e.target.value } : x)))} />
              </div>
              {a.fato && !a.causa && (
                <button onClick={() => onAnalisar(a)} className="text-xs underline mb-2" style={{ color: CORES.dourado }} disabled={gerando}>
                  Analisar FCA com IA
                </button>
              )}
              {(a.causa || a.acao) && (
                <div className="grid gap-2 mb-2 p-2 rounded" style={{ background: "#FDFAF3", border: "1px solid #EFE8D6" }}>
                  <textarea rows={2} className="px-2 py-1 text-xs rounded border bg-creme" style={{ borderColor: "#E0D5BC", color: "#6B5D42" }} placeholder="Causa raiz" value={a.causa} onChange={(e) => onMudar(anomalias.map((x) => (x.id === a.id ? { ...x, causa: e.target.value } : x)))} />
                  <input className="px-2 py-1 text-sm rounded border bg-creme" style={{ borderColor: "#E0D5BC", color: CORES.fogoEscuro }} placeholder="Ação corretiva" value={a.acao} onChange={(e) => onMudar(anomalias.map((x) => (x.id === a.id ? { ...x, acao: e.target.value } : x)))} />
                  {a.acao && a.status !== "tratada" && frentes.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <select className="px-2 py-1 text-xs rounded border bg-creme" style={{ borderColor: "#E0D5BC", color: "#6B5D42" }} value={a.frenteDestino || ""} onChange={(e) => onMudar(anomalias.map((x) => (x.id === a.id ? { ...x, frenteDestino: e.target.value } : x)))}>
                        <option value="">Enviar ação para a frente...</option>
                        {frentes.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
                      </select>
                      {a.frenteDestino && (
                        <button onClick={() => onEnviarAcao(a)} className="text-xs underline font-semibold" style={{ color: "#4F6B3A" }}>
                          Agir: enviar ao plano ✓
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
