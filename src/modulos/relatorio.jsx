import { AvisoErro, BotaoContorno, BotaoPrimario, Trabalhando } from "../componentes/ui.jsx";
import { RadarMaturidade } from "./diagnostico.jsx";
import { emLinhasDoc } from "./documentos.jsx";
import { RodapeImpressao } from "./tabela.jsx";
import { CORES, uid } from "../nucleo/base.jsx";

// ─── Módulo: Relatório de Encerramento ──────────────────────────

export function relatorioVazio() {
  return {
    id: uid(),
    data: new Date().toLocaleDateString("pt-BR"),
    obs: "",
    retrospectiva: "",
    resultados: "",
    entregas: "",
    recomendacoes: "",
    proximoPasso: "",
  };
}

export const CAMPOS_RELATORIO = [
  ["retrospectiva", "Retrospectiva", 4],
  ["resultados", "Resultados (um por linha)", 4],
  ["entregas", "Entregas realizadas (uma por linha)", 5],
  ["recomendacoes", "Recomendações de continuidade (uma por linha)", 4],
  ["proximoPasso", "Próximo passo sugerido", 2],
];

export const STATUS_META = { batida: "Batida ✓", parcial: "Parcial", nao: "Não batida" };






export function ModuloRelatorio({ cliente, relatorios, relAberto, diags, metasAcordo, gerando, erro, onMudarLista, onAbrir, onGerar, onImprimir, onVoltar }) {
  if (!relAberto) {
    return (
      <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
        <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: CORES.douradoEscuro, letterSpacing: 1, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "'Lora', serif" }}>
          ← {cliente.negocio}
        </button>
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="font-serif text-xl" style={{ color: CORES.fogo }}>Relatório de Encerramento</h2>
          <BotaoPrimario
            onClick={() => {
              const novo = relatorioVazio();
              onMudarLista([...relatorios, novo]);
              onAbrir(novo.id);
            }}
          >
            + Novo relatório
          </BotaoPrimario>
        </div>
        <p className="text-xs mb-5" style={{ color: CORES.textoDim }}>
          Malfeito feito: o fechamento do ciclo. Antes/depois do diagnóstico, frentes concluídas, entregas e recomendações — o documento que renova contrato e gera indicação.
        </p>
        {relatorios.length === 0 ? (
          <div className="text-center py-16 rounded-lg" style={{ background: CORES.papel, border: "1px dashed #7BA85C" }}>
            <p className="text-sm" style={{ color: CORES.textoDim }}>
              Nenhum relatório ainda. Crie ao final do engajamento — a IA reúne tudo que aconteceu no ENRAIZAR deste cliente.
            </p>
          </div>
        ) : (
          <div className="grid gap-2">
            {relatorios.map((r) => (
              <button
                key={r.id}
                onClick={() => onAbrir(r.id)}
                className="objeto text-left px-5 py-3 rounded-lg shadow-sm flex items-baseline justify-between"
                className="card"
              >
                <span className="font-serif" style={{ color: CORES.fogo }}>Relatório de {r.data}</span>
                <span className="text-xs" style={{ color: CORES.textoDim }}>{r.retrospectiva ? "" : "rascunho vazio"}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const set = (campo) => (v) => onMudarLista(relatorios.map((r) => (r.id === relAberto.id ? { ...relAberto, [campo]: v } : r)));
  const primeiroDiag = diags.length > 1 ? diags[0] : null;
  const ultimoDiag = diags.length ? diags[diags.length - 1] : null;

  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={() => onAbrir(null)} className="text-xs mb-4 uppercase font-semibold" style={{ color: CORES.douradoEscuro, letterSpacing: 1, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "'Lora', serif" }}>
        ← Relatórios · {cliente.negocio}
      </button>
      <div className="rounded-lg p-6 shadow-sm card">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h2 className="font-serif text-lg" style={{ color: CORES.fogo }}>Relatório de {relAberto.data}</h2>
          <div className="flex gap-2">
            <BotaoPrimario onClick={onGerar} disabled={gerando}>
              {gerando ? "Gerando..." : relAberto.retrospectiva ? "Gerar novamente" : "Gerar com IA"}
            </BotaoPrimario>
            {relAberto.retrospectiva && <BotaoContorno onClick={onImprimir}>Exportar PDF</BotaoContorno>}
          </div>
        </div>

        <div className="mb-4 p-3 rounded-lg" style={{ background: CORES.hover, border: "2px solid #D4AF37AA" }}>
          <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
            <div className="label" style={{ color: "#9A6A2F" }}>
              Verificação das metas pactuadas (fase Prova)
            </div>
            {(metasAcordo || []).length > 0 && (relAberto.metasVerificadas || []).length === 0 && (
              <button
                onClick={() => set("metasVerificadas")((metasAcordo || []).map((m) => ({ id: uid(), objetivo: m.objetivo, prazo: m.prazo, status: "parcial", porque: "" })))}
                className="text-xs underline"
                style={{ color: CORES.dourado }}
              >
                Puxar metas do Acordo
              </button>
            )}
          </div>
          {(relAberto.metasVerificadas || []).length === 0 && (
            <p className="text-xs" style={{ color: CORES.textoDim }}>
              {(metasAcordo || []).length ? "Puxe as metas da proposta aceita e registre: batida, parcial ou não batida — com o porquê." : "Nenhuma meta pactuada na proposta aceita deste cliente."}
            </p>
          )}
          {(relAberto.metasVerificadas || []).map((m) => (
            <div key={m.id} className="py-1.5 border-b" style={{ borderColor: "#EFE8D6" }}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex-1 text-sm" style={{ color: CORES.fogoEscuro }}>{m.objetivo}{m.prazo ? ` — até ${m.prazo}` : ""}</span>
                <select
                  className="px-2 py-0.5 text-xs rounded border font-semibold"
                  style={
                    m.status === "batida"
                      ? { borderColor: "#4F6B3A", background: "#E3EBD8", color: "#4F6B3A" }
                      : m.status === "nao"
                      ? { borderColor: "#C77", background: "#F5DDD6", color: "#8A3A2E" }
                      : { borderColor: "#9A6A2F", background: "#F5E6C8", color: "#9A6A2F" }
                  }
                  value={m.status}
                  onChange={(e) => set("metasVerificadas")(relAberto.metasVerificadas.map((x) => (x.id === m.id ? { ...x, status: e.target.value } : x)))}
                >
                  {Object.entries(STATUS_META).map(([ch, rot]) => <option key={ch} value={ch}>{rot}</option>)}
                </select>
              </div>
              <input
                className="w-full mt-1 px-2 py-1 text-xs rounded border bg-creme"
                style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                placeholder="Por quê (o que levou a esse resultado)"
                value={m.porque}
                onChange={(e) => set("metasVerificadas")(relAberto.metasVerificadas.map((x) => (x.id === m.id ? { ...x, porque: e.target.value } : x)))}
              />
            </div>
          ))}
        </div>

        {primeiroDiag && ultimoDiag && (
          <div className="flex gap-4 justify-center flex-wrap mb-4">
            <div className="text-center">
              <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: "#A89878" }}>
                Antes ({primeiroDiag.data})
              </div>
              <RadarMaturidade notas={primeiroDiag.notas} tamanho={240} />
            </div>
            <div className="text-center">
              <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: CORES.dourado }}>
                Depois ({ultimoDiag.data})
              </div>
              <RadarMaturidade notas={ultimoDiag.notas} tamanho={240} />
            </div>
          </div>
        )}

        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && (
          <>
            <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Observações para a IA (opcional)</span><textarea rows={2} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} placeholder="Ex.: destacar a autonomia conquistada pelo gerente; cliente quer continuar com mentoria mensal" value={relAberto.obs} onChange={(e) => set("obs")(e.target.value)} /></label>
            {CAMPOS_RELATORIO.map(([campo, rotulo, linhas]) => (
              <label key={campo} className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>{rotulo}</span><textarea rows={linhas} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} value={relAberto[campo]} onChange={(e) => set(campo)(e.target.value)} /></label>
            ))}
            <button
              onClick={() => {
                onMudarLista(relatorios.filter((r) => r.id !== relAberto.id));
                onAbrir(null);
              }}
              className="text-xs underline"
              style={{ color: "#8A3A2E" }}
            >
              Excluir relatório
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function ImpressaoRelatorio({ cliente, rel, diags, dadosPainel }) {
  const ROT_META = { batida: "Batida", parcial: "Parcial", nao: "Não batida" };
  if (!rel || !rel.retrospectiva) return null;
  const resultados = emLinhasDoc(rel.resultados);
  const entregas = emLinhasDoc(rel.entregas);
  const recomendacoes = emLinhasDoc(rel.recomendacoes);
  const primeiroDiag = diags.length > 1 ? diags[0] : null;
  const ultimoDiag = diags.length ? diags[diags.length - 1] : null;
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "#2A1218" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="text-xs uppercase tracking-widest" style={{ color: CORES.dourado }}>Relatório de Encerramento</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{cliente.negocio}</div>
        <div className="text-sm mt-1" style={{ color: "#6B5D42" }}>{rel.data}</div>
      </div>

      <div className="mb-5">
        <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Retrospectiva</div>
        <p className="text-sm whitespace-pre-line">{rel.retrospectiva}</p>
      </div>
      {(rel.metasVerificadas || []).length > 0 && (
        <div className="mb-5 p-3" style={{ border: "1px solid #7BA85C" }}>
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Metas pactuadas — verificação</div>
          {(rel.metasVerificadas || []).map((m) => (
            <div key={m.id} className="text-sm mb-1">
              <strong>{ROT_META[m.status] || m.status}:</strong> {m.objetivo}{m.prazo ? ` (até ${m.prazo})` : ""}
              {m.porque && <span className="text-xs italic" style={{ color: "#6B5D42" }}> — {m.porque}</span>}
            </div>
          ))}
        </div>
      )}
      {dadosPainel && (
        <div className="mb-5 p-3" style={{ border: "1px solid #7BA85C" }}>
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Painel do Engajamento</div>
          <div className="text-sm">
            Índice de formalização: <strong>{dadosPainel.formalizacao}%</strong> · Conformidade (CCT): <strong>{dadosPainel.cctResolvidos}/{dadosPainel.cctTotal} resolvidos</strong> · Anomalias tratadas: <strong>{dadosPainel.anomTratadas}/{dadosPainel.anomTotal}</strong> · Atas registradas: <strong>{dadosPainel.totalAtas}</strong>
          </div>
        </div>
      )}


      {primeiroDiag && ultimoDiag && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: CORES.fogo }}>Evolução da maturidade</div>
          <div className="flex gap-6 justify-center">
            <div className="text-center">
              <div className="text-xs font-semibold mb-1" style={{ color: "#6B5D42" }}>Antes · {primeiroDiag.data}</div>
              <RadarMaturidade notas={primeiroDiag.notas} tamanho={250} />
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold mb-1" style={{ color: CORES.dourado }}>Depois · {ultimoDiag.data}</div>
              <RadarMaturidade notas={ultimoDiag.notas} tamanho={250} />
            </div>
          </div>
        </div>
      )}

      {resultados.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Resultados</div>
          <ul className="text-sm list-disc pl-5">
            {resultados.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      )}

      {entregas.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Entregas realizadas</div>
          <ul className="text-sm list-disc pl-5">
            {entregas.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      {recomendacoes.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Recomendações de continuidade</div>
          <ol className="text-sm list-decimal pl-5">
            {recomendacoes.map((r, i) => <li key={i} className="mb-0.5">{r}</li>)}
          </ol>
        </div>
      )}

      {rel.proximoPasso && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Próximo passo</div>
          <p className="text-sm">{rel.proximoPasso}</p>
        </div>
      )}

      <RodapeImpressao />
    </div>
  );
}
