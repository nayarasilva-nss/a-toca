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
        <button onClick={onVoltar} className="enz-link" style={{ marginBottom: 20 }}>
          ← {cliente.negocio}
        </button>
        <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
          <h2 className="enz-titulo is-2">Relatório de Encerramento</h2>
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
        <p className="enz-titulo-descricao" style={{ marginTop: 0, marginBottom: 24 }}>
          O fechamento do projeto. Antes e depois do diagnóstico, frentes concluídas, entregas e recomendações — o documento que renova o contrato e gera indicação.
        </p>
        {relatorios.length === 0 ? (
          <div className="enz-card enz-card-vazado" style={{ padding: "28px 0" }}>
            <p className="enz-nota" style={{ fontSize: 14 }}>
              Nenhum relatório ainda. Crie ao final do projeto — a IA reúne tudo que aconteceu no Enraizar deste cliente.
            </p>
          </div>
        ) : (
          <div className="grid gap-2">
            {relatorios.map((r) => (
              <button
                key={r.id}
                onClick={() => onAbrir(r.id)}
                className="objeto text-left px-5 py-3 rounded-lg shadow-sm flex items-baseline justify-between"
                className="enz-card"
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
      <button onClick={() => onAbrir(null)} className="enz-link" style={{ marginBottom: 20 }}>
        ← Relatórios · {cliente.negocio}
      </button>
      <div className="enz-card">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h2 className="enz-titulo is-3">Relatório de {relAberto.data}</h2>
          <div className="flex gap-2">
            <BotaoPrimario onClick={onGerar} disabled={gerando}>
              {gerando ? "Gerando..." : relAberto.retrospectiva ? "Gerar novamente" : "Gerar com IA"}
            </BotaoPrimario>
            {relAberto.retrospectiva && <BotaoContorno onClick={onImprimir}>Exportar PDF</BotaoContorno>}
          </div>
        </div>

        <div className="mb-4 p-3 rounded-lg" style={{ background: CORES.hover, border: "2px solid var(--ouro)" }}>
          <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
            <div className="label" style={{ color: "var(--alerta)" }}>
              Verificação das metas pactuadas (fase Prova)
            </div>
            {(metasAcordo || []).length > 0 && (relAberto.metasVerificadas || []).length === 0 && (
              <button
                onClick={() => set("metasVerificadas")((metasAcordo || []).map((m) => ({ id: uid(), objetivo: m.objetivo, prazo: m.prazo, status: "parcial", porque: "" })))}
                className="enz-link" style={{ textTransform: "none", letterSpacing: 0, fontSize: 12 }}
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
            <div key={m.id} className="py-1.5 border-b" style={{ borderColor: "var(--fundo-recuo)" }}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex-1 text-sm" style={{ color: CORES.fogoEscuro }}>{m.objetivo}{m.prazo ? ` — até ${m.prazo}` : ""}</span>
                <select
                  className="px-2 py-0.5 text-xs rounded border font-semibold"
                  style={
                    m.status === "batida"
                      ? { borderColor: "var(--sucesso)", background: "var(--sucesso-fundo)", color: "var(--sucesso)" }
                      : m.status === "nao"
                      ? { borderColor: "var(--erro)", background: "var(--erro-fundo)", color: "var(--erro)" }
                      : { borderColor: "var(--alerta)", background: "var(--alerta-fundo)", color: "var(--alerta)" }
                  }
                  value={m.status}
                  onChange={(e) => set("metasVerificadas")(relAberto.metasVerificadas.map((x) => (x.id === m.id ? { ...x, status: e.target.value } : x)))}
                >
                  {Object.entries(STATUS_META).map(([ch, rot]) => <option key={ch} value={ch}>{rot}</option>)}
                </select>
              </div>
              <input
                className="w-full mt-1 px-2 py-1 text-xs rounded border bg-creme"
                style={{ borderColor: "var(--linha)", color: "var(--tinta)" }}
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
              <div className="enz-rotulo mb-1" style={{ color: "var(--tinta-musgo)" }}>
                Antes ({primeiroDiag.data})
              </div>
              <RadarMaturidade notas={primeiroDiag.notas} tamanho={240} />
            </div>
            <div className="text-center">
              <div className="enz-rotulo mb-1">
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
              className="enz-link" style={{ textTransform: "none", letterSpacing: 0, fontSize: 12 }}
              style={{ color: "var(--erro)" }}
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
    <div className="area-impressao hidden print:block p-10" style={{ color: "var(--tinta)" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="enz-rotulo">Relatório de Encerramento</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{cliente.negocio}</div>
        <div className="text-sm mt-1" style={{ color: "var(--tinta)" }}>{rel.data}</div>
      </div>

      <div className="mb-5">
        <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Retrospectiva</div>
        <p className="text-sm whitespace-pre-line">{rel.retrospectiva}</p>
      </div>
      {(rel.metasVerificadas || []).length > 0 && (
        <div className="mb-5 p-3" style={{ border: "1px solid var(--linha-forte)" }}>
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Metas pactuadas — verificação</div>
          {(rel.metasVerificadas || []).map((m) => (
            <div key={m.id} className="text-sm mb-1">
              <strong>{ROT_META[m.status] || m.status}:</strong> {m.objetivo}{m.prazo ? ` (até ${m.prazo})` : ""}
              {m.porque && <span className="text-xs italic" style={{ color: "var(--tinta)" }}> — {m.porque}</span>}
            </div>
          ))}
        </div>
      )}
      {dadosPainel && (
        <div className="mb-5 p-3" style={{ border: "1px solid var(--linha-forte)" }}>
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Painel do Projeto</div>
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
              <div className="text-xs font-semibold mb-1" style={{ color: "var(--tinta)" }}>Antes · {primeiroDiag.data}</div>
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
