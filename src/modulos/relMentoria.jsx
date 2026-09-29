import { AvisoErro, BotaoContorno, BotaoPrimario, Trabalhando } from "../componentes/ui.jsx";
import { FRAMEWORK_PESSOAL } from "../ia/diagnostico.jsx";
import { RadarMaturidade } from "./diagnostico.jsx";
import { emLinhasDoc } from "./documentos.jsx";
import { RodapeImpressao } from "./tabela.jsx";
import { CORES, uid } from "../nucleo/base.jsx";

// ─── Módulo: Relatório de Evolução (mentoria) ───────────────────

export function ModuloRelMentoria({ cliente, rel, diagsLider, metasAcordo, framework: fwRel, gerando, erro, onMudar, onGerar, onImprimir, onVoltar }) {
  const FRM = fwRel || FRAMEWORK_PESSOAL;
  const set = (campo) => (v) => onMudar({ ...rel, [campo]: v });
  const tem = rel.retrospectiva || rel.evolucao;
  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="enz-link" style={{ marginBottom: 20 }}>
        ← {cliente.negocio}
      </button>
      <div className="enz-card">
        <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
          <h2 className="enz-titulo is-3">Relatório de Evolução</h2>
          <div className="flex gap-2">
            <BotaoPrimario onClick={onGerar} disabled={gerando}>
              {gerando ? "Escrevendo..." : tem ? "Gerar novamente" : "Gerar com IA"}
            </BotaoPrimario>
            {tem && <BotaoContorno onClick={onImprimir}>Exportar PDF</BotaoContorno>}
          </div>
        </div>
        <p className="enz-titulo-descricao" style={{ marginTop: 0, marginBottom: 24 }}>
          A prova da jornada. Encontros realizados, pra casa cumprido e o radar antes e depois — o documento que renova a mentoria.
        </p>
        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}
        {!gerando && !tem && !erro && (
          <p className="text-sm py-4" style={{ color: CORES.textoDim }}>
            Gere quando houver jornada caminhada — a IA escreve só com os dados reais: encontros realizados, atividades feitas e diagnósticos do mentorado.
          </p>
        )}
        {!gerando && (
          <div className="mb-4 p-3 rounded-lg" style={{ background: CORES.hover, border: "2px solid var(--ouro)" }}>
            <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
              <div className="label" style={{ color: "var(--alerta)" }}>
                Verificação das metas do mentorado (fase Prova)
              </div>
              {(metasAcordo || []).length > 0 && (rel.metasVerificadas || []).length === 0 && (
                <button
                  onClick={() => onMudar({ ...rel, metasVerificadas: (metasAcordo || []).map((m) => ({ id: uid(), objetivo: m.objetivo, prazo: m.prazo, status: "parcial", porque: "" })) })}
                  className="enz-link" style={{ textTransform: "none", letterSpacing: 0, fontSize: 12 }}
                  style={{ color: CORES.dourado }}
                >
                  Puxar metas do Acordo
                </button>
              )}
            </div>
            {(rel.metasVerificadas || []).length === 0 && (
              <p className="text-xs" style={{ color: CORES.textoDim }}>
                {(metasAcordo || []).length ? "Puxe as metas da proposta aceita e registre: batida, parcial ou não batida — com o porquê." : "Nenhuma meta na proposta aceita deste mentorado."}
              </p>
            )}
            {(rel.metasVerificadas || []).map((m) => (
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
                    onChange={(e) => onMudar({ ...rel, metasVerificadas: rel.metasVerificadas.map((x) => (x.id === m.id ? { ...x, status: e.target.value } : x)) })}
                  >
                    <option value="batida">Batida ✓</option>
                    <option value="parcial">Parcial</option>
                    <option value="nao">Não batida</option>
                  </select>
                </div>
                <input
                  className="w-full mt-1 px-2 py-1 text-xs rounded border bg-creme"
                  style={{ borderColor: "var(--linha)", color: "var(--tinta)" }}
                  placeholder="Por quê"
                  value={m.porque}
                  onChange={(e) => onMudar({ ...rel, metasVerificadas: rel.metasVerificadas.map((x) => (x.id === m.id ? { ...x, porque: e.target.value } : x)) })}
                />
              </div>
            ))}
          </div>
        )}
        {!gerando && tem && (
          <>
            {diagsLider.length > 0 && (
              <div className="flex justify-center gap-8 my-4 flex-wrap">
                <div className="text-center">
                  <div className="text-xs mb-1" style={{ color: CORES.textoDim }}>Início ({diagsLider[0].data})</div>
                  <RadarMaturidade notas={diagsLider[0].notas} tamanho={220} framework={FRM} />
                </div>
                {diagsLider.length > 1 && (
                  <div className="text-center">
                    <div className="text-xs mb-1" style={{ color: CORES.textoDim }}>Atual ({diagsLider[diagsLider.length - 1].data})</div>
                    <RadarMaturidade notas={diagsLider[diagsLider.length - 1].notas} tamanho={220} framework={FRM} />
                  </div>
                )}
              </div>
            )}
            <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Retrospectiva da jornada</span><textarea rows={4} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} value={rel.retrospectiva} onChange={(e) => set("retrospectiva")(e.target.value)} /></label>
            <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Evolução observada</span><textarea rows={4} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} value={rel.evolucao} onChange={(e) => set("evolucao")(e.target.value)} /></label>
            <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Conquistas (uma por linha)</span><textarea rows={4} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} value={rel.conquistas} onChange={(e) => set("conquistas")(e.target.value)} /></label>
            <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Recomendações de continuidade (uma por linha)</span><textarea rows={3} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} value={rel.recomendacoes} onChange={(e) => set("recomendacoes")(e.target.value)} /></label>
          </>
        )}
      </div>
    </div>
  );
}

export function ImpressaoRelMentoria({ cliente, rel, diagsLider, framework: fwRel }) {
  const FRM = fwRel || FRAMEWORK_PESSOAL;
  if (!rel || !(rel.retrospectiva || rel.evolucao)) return null;
  const ROT_META_M = { batida: "Batida", parcial: "Parcial", nao: "Não batida" };
  const conquistas = emLinhasDoc(rel.conquistas);
  const recomendacoes = emLinhasDoc(rel.recomendacoes);
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "var(--tinta)" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="enz-rotulo">Relatório de Evolução — Mentoria</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{cliente.negocio}</div>
        <div className="text-sm mt-1" style={{ color: "var(--tinta)" }}>{cliente.segmento}</div>
      </div>
      {rel.retrospectiva && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Retrospectiva</div>
          <p className="text-sm">{rel.retrospectiva}</p>
        </div>
      )}
      {(rel.metasVerificadas || []).length > 0 && (
        <div className="mb-5 p-3" style={{ border: "1px solid var(--linha-forte)" }}>
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Metas do mentorado — verificação</div>
          {(rel.metasVerificadas || []).map((m) => (
            <div key={m.id} className="text-sm mb-1">
              <strong>{ROT_META_M[m.status] || m.status}:</strong> {m.objetivo}{m.prazo ? ` (até ${m.prazo})` : ""}
              {m.porque && <span className="text-xs italic" style={{ color: "var(--tinta)" }}> — {m.porque}</span>}
            </div>
          ))}
        </div>
      )}
      {diagsLider.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: CORES.dourado }}>Maturidade — antes e depois</div>
          <div className="flex justify-center gap-10">
            <div className="text-center">
              <div className="text-xs mb-1" style={{ color: "var(--tinta)" }}>Início ({diagsLider[0].data})</div>
              <RadarMaturidade notas={diagsLider[0].notas} tamanho={250} framework={FRM} />
            </div>
            {diagsLider.length > 1 && (
              <div className="text-center">
                <div className="text-xs mb-1" style={{ color: "var(--tinta)" }}>Atual ({diagsLider[diagsLider.length - 1].data})</div>
                <RadarMaturidade notas={diagsLider[diagsLider.length - 1].notas} tamanho={250} framework={FRM} />
              </div>
            )}
          </div>
        </div>
      )}
      {rel.evolucao && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Evolução observada</div>
          <p className="text-sm">{rel.evolucao}</p>
        </div>
      )}
      {conquistas.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Conquistas</div>
          <ul className="text-sm list-disc pl-5">{conquistas.map((x, i) => <li key={i} className="mb-0.5">{x}</li>)}</ul>
        </div>
      )}
      {recomendacoes.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Recomendações de continuidade</div>
          <ul className="text-sm list-disc pl-5">{recomendacoes.map((x, i) => <li key={i} className="mb-0.5">{x}</li>)}</ul>
        </div>
      )}
      <RodapeImpressao />
    </div>
  );
}
