import { AvisoErro, BotaoContorno, BotaoPrimario, Trabalhando } from "../componentes/ui.jsx";
import { RodapeImpressao } from "./tabela.jsx";
import { CORES, uid } from "../nucleo/base.jsx";
import { HeaderModulo } from "../telas/hub.jsx";

// ─── Módulo: Estrutura de Governança / Organograma ──────────────

export function montarArvore(posicoes) {
  const filhosDe = {};
  const raizes = [];
  for (const p of posicoes) {
    const paiValido = p.superiorId && posicoes.some((x) => x.id === p.superiorId) && p.superiorId !== p.id;
    if (paiValido) {
      (filhosDe[p.superiorId] = filhosDe[p.superiorId] || []).push(p);
    } else {
      raizes.push(p);
    }
  }
  return { raizes, filhosDe };
}

export function NoArvore({ posicao, filhosDe, visitados, impressao }) {
  if (visitados.has(posicao.id)) return null;
  const novos = new Set(visitados);
  novos.add(posicao.id);
  const filhos = filhosDe[posicao.id] || [];
  return (
    <div className="ml-0">
      <div
        className={impressao ? "inline-block px-3 py-1.5 rounded mb-1" : "inline-block px-3 py-1.5 rounded mb-1 shadow-sm"}
        style={{ background: impressao ? "white" : CORES.papel, border: `2px solid #D4AF37AA` }}
      >
        <span className="font-serif text-sm" style={{ color: CORES.fogo }}>{posicao.nome}</span>
        {posicao.setor && (
          <span className="text-xs ml-2" style={{ color: CORES.textoDim }}>{posicao.setor}</span>
        )}
      </div>
      {filhos.length > 0 && (
        <div className="pl-6 ml-2 border-l-2" style={{ borderColor: CORES.laranja }}>
          {filhos.map((f) => (
            <NoArvore key={f.id} posicao={f} filhosDe={filhosDe} visitados={novos} impressao={impressao} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Organograma({ posicoes, impressao }) {
  const { raizes, filhosDe } = montarArvore(posicoes);
  return (
    <div>
      {raizes.map((r) => (
        <NoArvore key={r.id} posicao={r} filhosDe={filhosDe} visitados={new Set()} impressao={impressao} />
      ))}
    </div>
  );
}

export function ModuloEstrutura({ cliente, posicoes, cargos, gerando, erro, onMudar, onGerar, onImprimir, onVoltar }) {
  const importarDosCargos = () => {
    const existentes = new Set(posicoes.map((p) => p.nome.toLowerCase()));
    const novas = cargos
      .filter((c) => c.nome.trim() && !existentes.has(c.nome.toLowerCase()))
      .map((c) => ({ id: uid(), nome: c.nome, setor: c.setor || "", superiorId: null }));
    onMudar([...posicoes, ...novas]);
  };

  return (
    <div className="pb-16">
      <HeaderModulo
        titulo="Estrutura de Governança"
        cliente={cliente}
        onVoltar={onVoltar}
        acoes={null}
      />
      <div style={{ maxWidth: "1000px", margin: "0 auto", paddingLeft: "32px", paddingRight: "32px" }}>
        <div className="rounded-lg p-6 shadow-sm card">
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <BotaoPrimario onClick={onGerar} disabled={gerando}>
              {gerando ? "Gerando..." : posicoes.length ? "Gerar novamente" : "Gerar com IA"}
            </BotaoPrimario>
            {cargos.length > 0 && <BotaoContorno onClick={importarDosCargos}>Importar dos cargos</BotaoContorno>}
            {posicoes.length > 0 && <BotaoContorno onClick={onImprimir}>Exportar PDF</BotaoContorno>}
          </div>
        </div>

        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && posicoes.length === 0 && !erro && (
          <p className="text-sm py-6" style={{ color: CORES.textoDim }}>
            A tapeçaria da casa ainda está em branco. Gere com IA a partir dos dados do cliente, importe dos cargos já descritos, ou adicione posições manualmente.
          </p>
        )}

        {!gerando && posicoes.length > 0 && (
          <>
            <div className="mb-6">
              {posicoes.map((p) => (
                <div key={p.id} className="flex items-center gap-2 py-1.5 border-b" style={{ borderColor: "#EFE8D6" }}>
                  <input
                    className="flex-1 px-2 py-1 text-sm rounded border bg-creme"
                    style={{ borderColor: "#E0D5BC", color: CORES.fogoEscuro }}
                    value={p.nome}
                    placeholder="Nome da posição"
                    onChange={(e) => onMudar(posicoes.map((x) => (x.id === p.id ? { ...x, nome: e.target.value } : x)))}
                  />
                  <input
                    className="w-28 px-2 py-1 text-xs rounded border bg-creme"
                    style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                    value={p.setor}
                    placeholder="Setor"
                    onChange={(e) => onMudar(posicoes.map((x) => (x.id === p.id ? { ...x, setor: e.target.value } : x)))}
                  />
                  <select
                    className="w-40 px-2 py-1 text-xs rounded border bg-creme"
                    style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                    value={p.superiorId || ""}
                    onChange={(e) =>
                      onMudar(posicoes.map((x) => (x.id === p.id ? { ...x, superiorId: e.target.value || null } : x)))
                    }
                  >
                    <option value="">— topo —</option>
                    {posicoes
                      .filter((x) => x.id !== p.id)
                      .map((x) => (
                        <option key={x.id} value={x.id}>reporta a: {x.nome}</option>
                      ))}
                  </select>
                  <button
                    onClick={() =>
                      onMudar(
                        posicoes
                          .filter((x) => x.id !== p.id)
                          .map((x) => (x.superiorId === p.id ? { ...x, superiorId: null } : x))
                      )
                    }
                    className="px-1 text-xs"
                    style={{ color: "#B8860B" }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => onMudar([...posicoes, { id: uid(), nome: "", setor: "", superiorId: null }])}
                className="mt-2 text-sm"
                style={{ color: CORES.dourado }}
              >
                + Adicionar posição
              </button>
            </div>

            <div className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: CORES.dourado }}>
              Pré-visualização do organograma
            </div>
            <Organograma posicoes={posicoes} />
          </>
        )}
      </div>
      </div>
    </div>
  );
}

export function ImpressaoEstrutura({ cliente, posicoes }) {
  if (!posicoes || posicoes.length === 0) return null;
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "#2A1218" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="text-xs uppercase tracking-widest" style={{ color: CORES.dourado }}>Estrutura de Governança</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>Organograma</div>
        <div className="text-sm mt-1" style={{ color: "#6B5D42" }}>{cliente.negocio} · {cliente.segmento}</div>
      </div>
      <Organograma posicoes={posicoes} impressao />
      <p className="text-xs mt-6" style={{ color: "#6B5D42" }}>
        Cada posição responde à posição imediatamente acima na linha de reporte. Comunicações e decisões seguem esta estrutura.
      </p>
      <RodapeImpressao />
    </div>
  );
}
