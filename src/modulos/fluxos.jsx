import { AvisoErro, BotaoContorno, BotaoPrimario, InputField, Trabalhando } from "../componentes/ui.jsx";
import { emLinhasDoc } from "./documentos.jsx";
import { RodapeImpressao } from "./tabela.jsx";
import { CORES, uid } from "../nucleo/base.jsx";

// ─── Módulo: Desenho de Processos ───────────────────────────────

export function fluxoVazio() {
  return { id: uid(), nome: "", setor: "", obs: "", etapas: [], melhorias: "" };
}

export function DiagramaFluxo({ etapas, impressao }) {
  return (
    <div className="flex flex-col items-center">
      {etapas.map((e, i) => (
        <div key={e.id} className="flex flex-col items-center w-full">
          {i > 0 && (
            <div className="flex flex-col items-center py-0.5">
              <div className="w-0.5 h-3" style={{ background: CORES.dourado }} />
              <div style={{ color: CORES.dourado, fontSize: 10, lineHeight: "8px" }}>▼</div>
            </div>
          )}
          <div className="flex items-center gap-2 max-w-md w-full justify-center">
            <div
              className="px-4 py-2 text-center text-sm"
              style={
                e.tipo === "decisao"
                  ? {
                      background: impressao ? "white" : CORES.hover,
                      border: `2px solid #D4AF37AA`,
                      borderRadius: 4,
                      transform: "skewX(-12deg)",
                      color: CORES.fogoEscuro,
                      minWidth: 180,
                    }
                  : {
                      background: impressao ? "white" : CORES.papel,
                      border: `1.5px solid ${e.tipo === "decisao" ? CORES.dourado : "#C4B48E"}`,
                      borderRadius: 8,
                      color: CORES.fogoEscuro,
                      minWidth: 180,
                    }
              }
            >
              <div style={e.tipo === "decisao" ? { transform: "skewX(12deg)" } : undefined}>
                {e.tipo === "decisao" ? `${e.texto}?` : e.texto}
                {e.responsavel && (
                  <div className="text-xs mt-0.5" style={{ color: CORES.textoDim }}>{e.responsavel}</div>
                )}
              </div>
            </div>
            {e.tipo === "decisao" && e.seNao && (
              <div className="text-xs max-w-[140px]" style={{ color: "#8A3A2E" }}>
                <span className="font-semibold">Não →</span> {e.seNao}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListaFluxos({ cliente, fluxos, onAbrir, onNovo, onVoltar }) {
  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: CORES.douradoEscuro, letterSpacing: 1, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "'Lora', serif" }}>
        ← {cliente.negocio}
      </button>
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="font-serif text-xl" style={{ color: CORES.fogo }}>Desenho de Processos</h2>
        <BotaoPrimario onClick={onNovo}>+ Novo processo</BotaoPrimario>
      </div>
      <p className="text-xs mb-5" style={{ color: CORES.textoDim }}>
        As passagens do castelo: por onde o trabalho realmente anda. Quem faz o quê, onde tem decisão, onde trava — o POP diz como executar; aqui você desenha o caminho.
      </p>
      {fluxos.length === 0 ? (
        <div className="text-center py-16 rounded-lg" style={{ background: CORES.papel, border: "1px dashed #7BA85C" }}>
          <p className="text-sm" style={{ color: CORES.textoDim }}>
            Nenhum processo desenhado. Descreva como funciona hoje (e onde dói) — a IA desenha o fluxo com responsáveis, decisões e melhorias.
          </p>
        </div>
      ) : (
        <div className="grid gap-2">
          {fluxos.map((f) => (
            <button
              key={f.id}
              onClick={() => onAbrir(f.id)}
              className="objeto text-left px-5 py-3 rounded-lg shadow-sm flex items-baseline justify-between"
              className="card"
            >
              <span className="font-serif" style={{ color: CORES.fogo }}>{f.nome || "(sem nome)"}</span>
              <span className="text-xs" style={{ color: CORES.textoDim }}>
                {f.setor}{f.etapas && f.etapas.length ? ` · ${f.etapas.length} etapas` : " · rascunho vazio"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function EditorFluxo({ cliente, fluxo, gerando, erro, onMudar, onGerar, onImprimir, onExcluir, onVoltar }) {
  const set = (campo) => (v) => onMudar({ ...fluxo, [campo]: v });
  const etapas = fluxo.etapas || [];

  const mudarEtapa = (id, campo, valor) =>
    onMudar({ ...fluxo, etapas: etapas.map((e) => (e.id === id ? { ...e, [campo]: valor } : e)) });

  const mover = (idx, dir) => {
    const alvo = idx + dir;
    if (alvo < 0 || alvo >= etapas.length) return;
    const novas = [...etapas];
    [novas[idx], novas[alvo]] = [novas[alvo], novas[idx]];
    onMudar({ ...fluxo, etapas: novas });
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: CORES.douradoEscuro, letterSpacing: 1, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "'Lora', serif" }}>
        ← Desenho de Processos · {cliente.negocio}
      </button>
      <div className="rounded-lg p-6 shadow-sm card">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h2 className="font-serif text-lg" style={{ color: CORES.fogo }}>{fluxo.nome || "Novo processo"}</h2>
          <div className="flex gap-2">
            <BotaoPrimario onClick={onGerar} disabled={gerando || !fluxo.nome.trim()}>
              {gerando ? "Desenhando..." : etapas.length ? "Desenhar novamente" : "Desenhar com IA"}
            </BotaoPrimario>
            {etapas.length > 0 && <BotaoContorno onClick={onImprimir}>Exportar PDF</BotaoContorno>}
          </div>
        </div>

        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && (
          <>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <InputField label="Nome do processo" value={fluxo.nome} onChange={set("nome")} placeholder="Ex.: Pedido do delivery, do app à entrega" />
              <InputField label="Setor" value={fluxo.setor} onChange={set("setor")} placeholder="Ex.: Delivery" />
            </div>
            <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Como funciona hoje — e onde trava (para a IA)</span><textarea rows={3} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} placeholder="Ex.: pedido cai no tablet, cozinha só vé quando alguém avisa; embalagem sem conferência; motoboy sai sem checar endereço" value={fluxo.obs} onChange={(e) => set("obs")(e.target.value)} /></label>

            {etapas.length > 0 && (
              <>
                <div className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: CORES.dourado }}>
                  Etapas
                </div>
                {etapas.map((e, idx) => (
                  <div key={e.id} className="flex items-center gap-1.5 py-1.5 border-b flex-wrap" style={{ borderColor: "#EFE8D6" }}>
                    <div className="flex flex-col">
                      <button onClick={() => mover(idx, -1)} className="text-xs leading-3" style={{ color: "#C0B091" }}>▲</button>
                      <button onClick={() => mover(idx, 1)} className="text-xs leading-3" style={{ color: "#C0B091" }}>▼</button>
                    </div>
                    <select
                      className="px-1.5 py-1 text-xs rounded border bg-creme"
                      style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                      value={e.tipo}
                      onChange={(ev) => mudarEtapa(e.id, "tipo", ev.target.value)}
                    >
                      <option value="tarefa">Tarefa</option>
                      <option value="decisao">Decisão</option>
                    </select>
                    <input
                      className="flex-1 min-w-36 px-2 py-1 text-sm rounded border bg-creme"
                      style={{ borderColor: "#E0D5BC", color: CORES.fogoEscuro }}
                      value={e.texto}
                      placeholder="Etapa"
                      onChange={(ev) => mudarEtapa(e.id, "texto", ev.target.value)}
                    />
                    <input
                      className="w-32 px-2 py-1 text-xs rounded border bg-creme"
                      style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                      value={e.responsavel}
                      placeholder="Responsável"
                      onChange={(ev) => mudarEtapa(e.id, "responsavel", ev.target.value)}
                    />
                    {e.tipo === "decisao" && (
                      <input
                        className="w-44 px-2 py-1 text-xs rounded border bg-creme"
                        style={{ borderColor: "#E8C4B8", color: "#8A3A2E" }}
                        value={e.seNao}
                        placeholder="Se não → ..."
                        onChange={(ev) => mudarEtapa(e.id, "seNao", ev.target.value)}
                      />
                    )}
                    <button
                      onClick={() => onMudar({ ...fluxo, etapas: etapas.filter((x) => x.id !== e.id) })}
                      className="px-1 text-xs"
                      style={{ color: "#B8860B" }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </>
            )}
            <button
              onClick={() => onMudar({ ...fluxo, etapas: [...etapas, { id: uid(), tipo: "tarefa", texto: "", responsavel: "", seNao: "" }] })}
              className="mt-2 text-sm"
              style={{ color: CORES.dourado }}
            >
              + Adicionar etapa
            </button>

            {etapas.length > 0 && (
              <>
                <div className="text-xs uppercase tracking-widest font-semibold mt-6 mb-3" style={{ color: CORES.dourado }}>
                  Pré-visualização do fluxo
                </div>
                <DiagramaFluxo etapas={etapas} />
              </>
            )}

            <div className="mt-5">
              <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Gargalos e melhorias propostas (um por linha)</span><textarea rows={4} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} value={fluxo.melhorias} onChange={(e) => set("melhorias")(e.target.value)} /></label>
            </div>

            <button onClick={onExcluir} className="text-xs underline" style={{ color: "#8A3A2E" }}>
              Excluir processo
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function ImpressaoFluxo({ cliente, fluxo }) {
  if (!fluxo || !(fluxo.etapas || []).length) return null;
  const melhorias = emLinhasDoc(fluxo.melhorias);
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "#2A1218" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="text-xs uppercase tracking-widest" style={{ color: CORES.dourado }}>Desenho de Processo</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{fluxo.nome}</div>
        <div className="text-sm mt-1" style={{ color: "#6B5D42" }}>
          {cliente.negocio}{fluxo.setor ? ` · Setor: ${fluxo.setor}` : ""}
        </div>
      </div>
      <DiagramaFluxo etapas={fluxo.etapas} impressao />
      {melhorias.length > 0 && (
        <div className="mt-6 mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Gargalos e melhorias propostas</div>
          <ol className="text-sm list-decimal pl-5">
            {melhorias.map((m, i) => <li key={i} className="mb-0.5">{m}</li>)}
          </ol>
        </div>
      )}
      <RodapeImpressao />
    </div>
  );
}
