import { AvisoErro, BotaoContorno, BotaoPrimario, Trabalhando } from "../componentes/ui.jsx";
import { RodapeImpressao } from "./tabela.jsx";
import { CORES, uid } from "../nucleo/base.jsx";
import { HeaderModulo } from "../telas/hub.jsx";

// ─── Módulo: Manual do Colaborador ──────────────────────────────

export function ModuloManual({ cliente, secoes, gerando, erro, onMudar, onGerar, onImprimir, onVoltar }) {
  return (
    <div className="pb-16">
      <HeaderModulo
        titulo="Manual do Colaborador"
        cliente={cliente}
        onVoltar={onVoltar}
        acoes={null}
      />
      <div style={{ maxWidth: "1000px", margin: "0 auto", paddingLeft: "32px", paddingRight: "32px" }}>
        <div className="rounded-lg p-6 shadow-sm card">
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <div className="flex gap-2">
            <BotaoPrimario onClick={onGerar} disabled={gerando}>
              {gerando ? "Gerando..." : secoes.length ? "Gerar novamente" : "Gerar com IA"}
            </BotaoPrimario>
            {secoes.length > 0 && <BotaoContorno onClick={onImprimir}>Exportar PDF</BotaoContorno>}
          </div>
        </div>

        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && secoes.length === 0 && !erro && (
          <p className="text-sm py-6" style={{ color: CORES.textoDim }}>
            Nenhuma seção ainda. A IA escreve o manual a partir dos dados e regras da casa — você revisa seção por seção antes de exportar.
          </p>
        )}

        {!gerando &&
          secoes.map((s) => (
            <div key={s.id} className="mb-4 rounded-lg p-4" style={{ background: CORES.cartao, border: "2px solid #E97F3855" }}>
              <div className="flex items-center gap-2 mb-2">
                <input
                  className="font-serif flex-1 bg-transparent outline-none"
                  style={{ color: CORES.fogo }}
                  value={s.titulo}
                  onChange={(e) => onMudar(secoes.map((x) => (x.id === s.id ? { ...x, titulo: e.target.value } : x)))}
                />
                <button
                  onClick={() => onMudar(secoes.filter((x) => x.id !== s.id))}
                  className="px-1 text-xs"
                  style={{ color: "#B8860B" }}
                >
                  ✕
                </button>
              </div>
              <textarea
                rows={4}
                className="w-full px-2 py-1 text-sm rounded border bg-creme outline-none"
                style={{ borderColor: "#EFE8D6", color: CORES.fogoEscuro }}
                value={s.conteudo}
                onChange={(e) => onMudar(secoes.map((x) => (x.id === s.id ? { ...x, conteudo: e.target.value } : x)))}
              />
            </div>
          ))}

        {!gerando && secoes.length > 0 && (
          <button
            onClick={() => onMudar([...secoes, { id: uid(), titulo: "Nova seção", conteudo: "" }])}
            className="text-sm"
            style={{ color: CORES.dourado }}
          >
            + Adicionar seção
          </button>
        )}
      </div>
      </div>
    </div>
  );
}

export function ImpressaoManual({ cliente, secoes }) {
  if (!secoes || secoes.length === 0) return null;
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "#2A1218" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="text-xs uppercase tracking-widest" style={{ color: CORES.dourado }}>Documento interno</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>Manual do Colaborador</div>
        <div className="text-sm mt-1" style={{ color: "#6B5D42" }}>{cliente.negocio} · {cliente.segmento}</div>
      </div>
      {secoes.map((s, i) => (
        <div key={s.id} className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>
            {i + 1}. {s.titulo}
          </div>
          <p className="text-sm whitespace-pre-line">{s.conteudo}</p>
        </div>
      ))}
      <RodapeImpressao />
    </div>
  );
}
