import { AvisoErro, BotaoContorno, BotaoPrimario, InputField, Trabalhando } from "../componentes/ui.jsx";
import { CONFIG_DOCS } from "../ia/documentos.jsx";
import { RodapeImpressao } from "./tabela.jsx";
import { CORES } from "../nucleo/base.jsx";
import { HeaderModulo } from "../telas/hub.jsx";

// ─── Componentes genéricos de documentos ────────────────────────

export function ListaDocs({ cliente, tipo, docs, onAbrir, onNovo, onVoltar }) {
  const cfg = CONFIG_DOCS[tipo];
  return (
    <div className="pb-16">
      <HeaderModulo
        titulo={cfg.tituloModulo}
        cliente={cliente}
        onVoltar={onVoltar}
        acoes={<BotaoPrimario onClick={onNovo}>{cfg.novoRotulo}</BotaoPrimario>}
      />
      <div style={{ maxWidth: "1000px", margin: "0 auto", paddingLeft: "32px", paddingRight: "32px" }}>
      {docs.length === 0 ? (
        <div className="text-center py-16 rounded-lg" style={{ background: CORES.papel, border: "1px dashed var(--linha-forte)" }}>
          <p className="text-sm" style={{ color: CORES.textoDim }}>
            Nenhum{cfg.singular === "ata" || cfg.singular === "política" ? "a" : ""} {cfg.singular} ainda. Crie e deixe a IA escrever a primeira versão para sua revisão.
          </p>
        </div>
      ) : (
        <div className="grid gap-2">
          {docs.map((d) => (
            <button
              key={d.id}
              onClick={() => onAbrir(d.id)}
              className="objeto text-left px-5 py-3 rounded-lg shadow-sm flex items-baseline justify-between"
              className="card"
            >
              <span className="font-serif" style={{ color: CORES.fogo }}>{d.nome || "(sem nome)"}</span>
              <span className="text-xs" style={{ color: CORES.textoDim }}>{cfg.subtituloLista(d)}</span>
            </button>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

export function EditorDoc({ cliente, tipo, doc, rotuloVoltar, gerando, erro, onMudar, onGerar, onImprimir, onExcluir, onVoltar }) {
  const cfg = CONFIG_DOCS[tipo];
  const set = (campo) => (v) => onMudar({ ...doc, [campo]: v });
  const temConteudo = !!(doc[cfg.campoIndicador] || "").trim();
  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: CORES.douradoEscuro, letterSpacing: 1, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-body)" }}>
        ← {rotuloVoltar}
      </button>
      <div className="rounded-lg p-6 shadow-sm card">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h2 className="font-serif text-lg" style={{ color: CORES.fogo }}>
            {doc.nome || `Nov${cfg.singular === "checklist" ? "o" : "a"} ${cfg.singular}`}
          </h2>
          <div className="flex gap-2">
            <BotaoPrimario onClick={onGerar} disabled={gerando || !doc.nome.trim()}>
              {gerando ? "Gerando..." : temConteudo ? "Gerar novamente" : "Gerar com IA"}
            </BotaoPrimario>
            {temConteudo && <BotaoContorno onClick={onImprimir}>Exportar PDF</BotaoContorno>}
          </div>
        </div>

        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && (
          <>
            {cfg.camposBase.map(([campo, rotulo, area, linhas, placeholder]) => (
              area ? (
                <label key={campo} className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>{rotulo}</span><textarea rows={linhas} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} placeholder={placeholder} value={doc[campo] || ""} onChange={(e) => set(campo)(e.target.value)} /></label>
              ) : (
                <InputField key={campo} label={rotulo} value={doc[campo] || ""} onChange={set(campo)} placeholder={placeholder} />
              )
            ))}
            {cfg.camposGerados.map(([campo, rotulo, area, linhas]) => (
              area ? (
                <label key={campo} className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>{rotulo}</span><textarea rows={linhas} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} value={doc[campo] || ""} onChange={(e) => set(campo)(e.target.value)} /></label>
              ) : (
                <InputField key={campo} label={rotulo} value={doc[campo] || ""} onChange={set(campo)} />
              )
            ))}
            <button onClick={onExcluir} className="text-xs underline" style={{ color: "var(--erro)" }}>
              Excluir {cfg.singular}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export const emLinhasDoc = (t) => (t || "").split("\n").map((x) => x.trim()).filter(Boolean);

export function ImpressaoPolitica({ cliente, doc }) {
  if (!doc || !doc.diretrizes) return null;
  const diretrizes = emLinhasDoc(doc.diretrizes);
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "var(--tinta)" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="text-xs uppercase tracking-widest" style={{ color: CORES.dourado }}>Política interna</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{doc.nome}</div>
        <div className="text-sm mt-1" style={{ color: "var(--tinta)" }}>{cliente.negocio} · {cliente.segmento}</div>
      </div>
      {doc.escopo && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Escopo</div>
          <p className="text-sm">{doc.escopo}</p>
        </div>
      )}
      <div className="mb-5">
        <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Diretrizes</div>
        <ol className="text-sm list-decimal pl-5">
          {diretrizes.map((d, i) => <li key={i} className="mb-0.5">{d}</li>)}
        </ol>
      </div>
      {doc.responsabilidades && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Responsabilidades</div>
          <p className="text-sm">{doc.responsabilidades}</p>
        </div>
      )}
      {doc.vigencia && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Vigência e revisão</div>
          <p className="text-sm">{doc.vigencia}</p>
        </div>
      )}
      <RodapeImpressao />
    </div>
  );
}

export function ImpressaoChecklist({ cliente, doc }) {
  if (!doc || !doc.itens) return null;
  const itens = emLinhasDoc(doc.itens);
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "var(--tinta)" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="text-xs uppercase tracking-widest" style={{ color: CORES.dourado }}>Checklist</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{doc.nome}</div>
        <div className="text-sm mt-1" style={{ color: "var(--tinta)" }}>
          {cliente.negocio}
          {doc.setor ? ` · Setor: ${doc.setor}` : ""}
          {doc.frequencia ? ` · ${doc.frequencia}` : ""}
        </div>
      </div>
      <div className="overflow-x-auto"><table className="w-full text-sm border-collapse mb-8">
        <tbody>
          {itens.map((item, i) => (
            <tr key={i}>
              <td className="border px-3 py-2 w-10 text-center" style={{ borderColor: CORES.laranja }}>
                <span className="inline-block w-4 h-4 border-2 align-middle" style={{ borderColor: CORES.fogo }} />
              </td>
              <td className="border px-3 py-2" style={{ borderColor: CORES.laranja }}>{item}</td>
            </tr>
          ))}
        </tbody>
      </table></div>
      <div className="flex gap-10 text-sm mb-2">
        <div className="flex-1 border-t pt-1" style={{ borderColor: "var(--tinta)" }}>Executado por</div>
        <div className="w-40 border-t pt-1" style={{ borderColor: "var(--tinta)" }}>Data / hora</div>
      </div>
      <RodapeImpressao />
    </div>
  );
}

export function ImpressaoAta({ cliente, doc }) {
  if (!doc || !doc.resumo) return null;
  const decisoes = emLinhasDoc(doc.decisoes);
  const acoes = emLinhasDoc(doc.acoes);
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "var(--tinta)" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="text-xs uppercase tracking-widest" style={{ color: CORES.dourado }}>Ata de reunião</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{doc.nome}</div>
        <div className="text-sm mt-1" style={{ color: "var(--tinta)" }}>
          {cliente.negocio}
          {doc.data ? ` · ${doc.data}` : ""}
        </div>
        {doc.participantes && (
          <div className="text-sm mt-1" style={{ color: "var(--tinta)" }}>Participantes: {doc.participantes}</div>
        )}
      </div>
      <div className="mb-5">
        <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Resumo</div>
        <p className="text-sm whitespace-pre-line">{doc.resumo}</p>
      </div>
      {decisoes.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Decisões</div>
          <ul className="text-sm list-disc pl-5">
            {decisoes.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </div>
      )}
      {acoes.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Ações acordadas</div>
          <ul className="text-sm list-disc pl-5">
            {acoes.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}
      <RodapeImpressao />
    </div>
  );
}
