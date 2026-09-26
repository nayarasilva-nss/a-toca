import { AvisoErro, BotaoContorno, BotaoPrimario, ConfirmarAcao, InputField, Trabalhando } from "../componentes/ui.jsx";
import { emLinhasDoc } from "./documentos.jsx";
import { RodapeImpressao } from "./tabela.jsx";
import { CORES, STATUS_TREINAMENTO, uid } from "../nucleo/base.jsx";
import { HeaderModulo } from "../telas/hub.jsx";

// ─── Módulo: Treinamentos ───────────────────────────────────────

export function treinamentoVazio() {
  return { id: uid(), tema: "", publico: "", cargaHoraria: "", data: "", valor: "", frenteId: "", status: "planejado", obs: "", objetivos: "", blocos: "", dinamicas: "", avaliacao: "", participantes: "", obsRealizacao: "" };
}

export function mentoriaVazia() {
  return {
    mentoradoId: "",
    objetivos: "",
    foco: "lideranca",
    encontros: [],
    moldagem: { virtudeCentral: { nome: "", manifesto: "", cultivo: "" }, tendencias: [], praticasSugeridas: [] },
    praticas: [],
    virtudes: [],
    relatorio: { retrospectiva: "", evolucao: "", conquistas: "", recomendacoes: "" },
    // Governança: conexão com outros serviços
    treinamentosRelacionados: [],  // IDs de treinamentos que apoiam esta mentoria
    acoesCCTRelacionadas: []      // IDs de anomalias/ações CCT relacionadas
  };
}


export function ModuloTreinamentos({ cliente, treinamentos, frentes, pessoas, gerando, erro, aberto, onAbrir, onNovo, onMudar, onGerar, onGerarRelatorio, onImprimir, onExcluir, onVoltar }) {
  const t = treinamentos.find((x) => x.id === aberto);

  if (!t) {
    return (
      <div className="pb-16">
        <HeaderModulo
          titulo="Treinamentos"
          cliente={cliente}
          onVoltar={onVoltar}
          acoes={<BotaoPrimario onClick={onNovo}>+ Novo treinamento</BotaoPrimario>}
        />
        <div style={{ maxWidth: "1000px", margin: "0 auto", paddingLeft: "32px", paddingRight: "32px" }}>
        <p className="enz-titulo-descricao" style={{ marginTop: 0, marginBottom: 24 }}>
          {cliente.tipo === "pessoa" ? "Turmas avulsas para o mentorado e quem ele lidera. Com a ciência dos temperamentos como marca." : "Cada turma encontra aqui a aula de que precisa. Dentro de uma frente do projeto ou avulsa — com a ciência dos temperamentos como marca."}
        </p>
        {treinamentos.length === 0 ? (
          <div className="enz-card enz-card-vazado" style={{ padding: "28px 0" }}>
            <p className="enz-nota" style={{ fontSize: 14 }}>Nenhum treinamento. Crie o primeiro — a IA monta objetivos, blocos e dinâmicas adaptadas ao time mapeado.</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {treinamentos.map((x) => {
              const frente = frentes.find((f) => f.id === x.frenteId);
              return (
                <button key={x.id} onClick={() => onAbrir(x.id)} className="objeto text-left px-5 py-3 rounded-lg shadow-sm flex items-baseline justify-between gap-2 flex-wrap card">
                  <span className="font-serif" style={{ color: CORES.fogo }}>{x.tema || "(sem tema)"}</span>
                  <span className="text-xs flex items-center gap-2" style={{ color: CORES.textoDim }}>
                    {x.data || "sem data"}
                    <span className="px-1.5 py-0.5 rounded font-semibold" style={{ background: STATUS_TREINAMENTO[x.status]?.fundo || "var(--alerta-fundo)", color: STATUS_TREINAMENTO[x.status]?.cor || "var(--alerta)" }}>
                      {STATUS_TREINAMENTO[x.status]?.rotulo || "Planejado"}
                    </span>
                    <span className="italic">{frente ? `frente: ${frente.nome}` : "avulso"}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
        </div>
      </div>
    );
  }

  const set = (campo) => (v) => onMudar({ ...t, [campo]: v });
  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={() => onAbrir(null)} className="enz-link" style={{ marginBottom: 20 }}>
        ← Treinamentos · {cliente.negocio}
      </button>
      <div className="enz-card">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h2 className="enz-titulo is-3">{t.tema || "Novo treinamento"}</h2>
          <div className="flex gap-2 items-center">
            <select
              className="px-2 py-1 text-xs rounded border font-semibold"
              style={{ borderColor: STATUS_TREINAMENTO[t.status]?.cor || "var(--alerta)", background: STATUS_TREINAMENTO[t.status]?.fundo || "var(--alerta-fundo)", color: STATUS_TREINAMENTO[t.status]?.cor || "var(--alerta)" }}
              value={t.status}
              onChange={(e) => onMudar({ ...t, status: e.target.value })}
            >
              <option value="planejado">Planejado</option>
              <option value="confirmado">Confirmado</option>
              <option value="em_progresso">Em progresso</option>
              <option value="realizado">Realizado</option>
              <option value="avaliado">Avaliado</option>
            </select>
            <BotaoPrimario onClick={onGerar} disabled={gerando || !t.tema.trim()}>
              {gerando ? "Montando..." : t.blocos ? "Montar plano novamente" : "Montar plano com IA"}
            </BotaoPrimario>
            {t.blocos && <BotaoContorno onClick={onImprimir}>Exportar PDF</BotaoContorno>}
          </div>
        </div>

        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && (
          <>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <InputField label="Tema" value={t.tema} onChange={set("tema")} placeholder="Ex.: Liderança pelo temperamento" />
              <InputField label="Público" value={t.publico} onChange={set("publico")} placeholder="Ex.: líderes de setor" />
              <InputField label="Carga horária" value={t.cargaHoraria} onChange={set("cargaHoraria")} placeholder="Ex.: 4h" />
              <InputField label="Data prevista/realizada" value={t.data} onChange={set("data")} placeholder="dd/mm/aaaa" />
              <InputField label="Valor (se avulso — uso interno)" value={t.valor} onChange={set("valor")} placeholder="Ex.: 1.800" />
              <div className="mb-4">
                <div className="enz-rotulo mb-1">Vínculo</div>
                <select
                  className="w-full px-3 py-2 rounded border text-sm bg-creme"
                  style={{ borderColor: "var(--linha)", color: CORES.fogoEscuro }}
                  value={t.frenteId || ""}
                  onChange={(e) => onMudar({ ...t, frenteId: e.target.value })}
                >
                  <option value="">Avulso (fora da consultoria)</option>
                  {frentes.map((f) => (
                    <option key={f.id} value={f.id}>Frente: {f.nome}</option>
                  ))}
                </select>
              </div>
            </div>
            <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Observações para a IA</span><textarea rows={2} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} placeholder="Ex.: turma resistente a teoria; já houve conflito entre salão e cozinha" value={t.obs} onChange={(e) => set("obs")(e.target.value)} /></label>
            <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Objetivos de aprendizagem</span><textarea rows={3} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} value={t.objetivos} onChange={(e) => set("objetivos")(e.target.value)} /></label>
            <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Blocos de conteúdo (um por linha: título — duração: conteúdo)</span><textarea rows={6} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} value={t.blocos} onChange={(e) => set("blocos")(e.target.value)} /></label>
            <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Dinâmicas</span><textarea rows={3} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} value={t.dinamicas} onChange={(e) => set("dinamicas")(e.target.value)} /></label>
            <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Avaliação de eficácia</span><textarea rows={2} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} value={t.avaliacao} onChange={(e) => set("avaliacao")(e.target.value)} /></label>
            <div className="mb-4 p-3 rounded-lg" style={{ background: CORES.cartao, border: "1px solid var(--fundo-recuo)" }}>
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="label" style={{ color: CORES.dourado }}>
                  Participantes · {(t.participantesLista || []).filter((p) => p.presente).length}/{(t.participantesLista || []).length} presentes
                </div>
                <div className="flex gap-2">
                  {pessoas.filter((p) => p.nome).length > 0 && (
                    <button
                      onClick={() => {
                        const existentes = new Set((t.participantesLista || []).map((p) => p.nome.toLowerCase().trim()));
                        const novos = pessoas
                          .filter((p) => p.nome && !existentes.has(p.nome.toLowerCase().trim()))
                          .map((p) => ({ id: uid(), nome: p.nome, presente: true }));
                        if (novos.length) onMudar({ ...t, participantesLista: [...(t.participantesLista || []), ...novos] });
                      }}
                      className="enz-link" style={{ textTransform: "none", letterSpacing: 0, fontSize: 12 }}
                      style={{ color: CORES.dourado }}
                    >
                      Importar de Temperamentos
                    </button>
                  )}
                  <button
                    onClick={() => onMudar({ ...t, participantesLista: [...(t.participantesLista || []), { id: uid(), nome: "", presente: true }] })}
                    className="enz-link" style={{ textTransform: "none", letterSpacing: 0, fontSize: 12 }}
                    style={{ color: CORES.dourado }}
                  >
                    + Adicionar
                  </button>
                </div>
              </div>
              {(t.participantesLista || []).length === 0 && (
                <p className="text-xs" style={{ color: "var(--tinta-musgo)" }}>Monte a turma: importe o time mapeado ou adicione nomes. A presença alimenta certificados e relatório.</p>
              )}
              {(t.participantesLista || []).map((p) => (
                <div key={p.id} className="flex items-center gap-2 py-0.5">
                  <input
                    type="checkbox"
                    checked={!!p.presente}
                    title="Presente"
                    onChange={() => onMudar({ ...t, participantesLista: t.participantesLista.map((x) => (x.id === p.id ? { ...x, presente: !x.presente } : x)) })}
                  />
                  <input
                    className="flex-1 text-sm bg-transparent outline-none"
                    style={{ color: p.presente ? CORES.fogoEscuro : "var(--tinta-musgo)" }}
                    placeholder="Nome do participante"
                    value={p.nome}
                    onChange={(ev) => onMudar({ ...t, participantesLista: t.participantesLista.map((x) => (x.id === p.id ? { ...x, nome: ev.target.value } : x)) })}
                  />
                  <button
                    onClick={() => onMudar({ ...t, participantesLista: t.participantesLista.filter((x) => x.id !== p.id) })}
                    className="text-xs px-1"
                    style={{ color: "var(--linha-forte)" }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            {t.status === "realizado" && (
              <>
                <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Como foi (registro interno — alimenta o relatório)</span><textarea rows={3} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} value={t.obsRealizacao} onChange={(e) => set("obsRealizacao")(e.target.value)} /></label>
                <div className="mb-4 flex gap-2 flex-wrap">
                  {(t.participantesLista || []).some((p) => p.presente && p.nome.trim()) && (
                    <BotaoContorno onClick={() => onImprimir({ seletor: ".area-cert", nome: `${cliente.negocio} — Certificados ${t.tema}` })}>
                      Gerar certificados (PDF)
                    </BotaoContorno>
                  )}
                  <BotaoContorno onClick={onGerarRelatorio} disabled={gerando}>
                    {t.relResumo ? "Refazer relatório de realização" : "Relatório de realização com IA"}
                  </BotaoContorno>
                  {t.relResumo && (
                    <BotaoContorno onClick={() => onImprimir({ seletor: ".area-relt", nome: `${cliente.negocio} — Relatório ${t.tema}` })}>
                      Exportar relatório (PDF)
                    </BotaoContorno>
                  )}
                </div>
                {t.relResumo && (
                  <>
                    <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Relatório — resumo do realizado</span><textarea rows={3} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} value={t.relResumo} onChange={(e) => set("relResumo")(e.target.value)} /></label>
                    <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Relatório — resultados e reações observadas</span><textarea rows={3} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} value={t.relResultados} onChange={(e) => set("relResultados")(e.target.value)} /></label>
                    <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Relatório — recomendações de continuidade</span><textarea rows={3} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} value={t.relRecomendacoes} onChange={(e) => set("relRecomendacoes")(e.target.value)} /></label>
                  </>
                )}
              </>
            )}
            <ConfirmarAcao label="Excluir este treinamento" aviso="apaga o treinamento e seu plano" onConfirmar={onExcluir} />
          </>
        )}
      </div>
    </div>
  );
}

export function ImpressaoTreinamento({ cliente, trein }) {
  if (!trein || !trein.blocos) return null;
  const objetivos = emLinhasDoc(trein.objetivos);
  const blocos = emLinhasDoc(trein.blocos);
  const dinamicas = emLinhasDoc(trein.dinamicas);
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "var(--tinta)" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="enz-rotulo">Plano de Treinamento</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{trein.tema}</div>
        <div className="text-sm mt-1" style={{ color: "var(--tinta)" }}>
          {cliente.negocio}{trein.publico ? ` · Público: ${trein.publico}` : ""}{trein.cargaHoraria ? ` · ${trein.cargaHoraria}` : ""}{trein.data ? ` · ${trein.data}` : ""}
        </div>
      </div>
      {objetivos.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Objetivos</div>
          <ul className="text-sm list-disc pl-5">{objetivos.map((o, i) => <li key={i} className="mb-0.5">{o}</li>)}</ul>
        </div>
      )}
      <div className="mb-5">
        <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Programa</div>
        <ol className="text-sm list-decimal pl-5">{blocos.map((b, i) => <li key={i} className="mb-1">{b}</li>)}</ol>
      </div>
      {dinamicas.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Dinâmicas</div>
          <ul className="text-sm list-disc pl-5">{dinamicas.map((d, i) => <li key={i} className="mb-0.5">{d}</li>)}</ul>
        </div>
      )}
      {trein.avaliacao && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Avaliação de eficácia</div>
          <p className="text-sm">{trein.avaliacao}</p>
        </div>
      )}
      <RodapeImpressao />
    </div>
  );
}

export function ImpressaoCertificados({ cliente, trein }) {
  const presentes = (trein.participantesLista || []).filter((p) => p.presente && p.nome.trim());
  if (!presentes.length) return null;
  return (
    <div className="area-cert hidden print:block" style={{ color: "var(--tinta)" }}>
      {presentes.map((p) => (
        <div key={p.id} style={{ height: "1123px", boxSizing: "border-box", padding: "60px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
          <div style={{ border: "3px solid " + CORES.dourado, padding: "6px", width: "100%", height: "100%", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ border: "1px solid " + CORES.dourado, width: "100%", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px" }}>
              <div className="enz-rotulo" style={{ color: CORES.dourado, letterSpacing: 6 }}>Certificado</div>
              <div className="font-serif" style={{ fontSize: "30px", color: CORES.fogo, marginTop: "28px" }}>{p.nome}</div>
              <div style={{ width: "180px", borderBottom: "1px solid " + CORES.dourado, margin: "16px 0 28px" }} />
              <div className="text-sm" style={{ color: "var(--tinta-areia)", maxWidth: "480px", lineHeight: 1.7 }}>
                participou do treinamento <strong style={{ color: CORES.fogo }}>{trein.tema}</strong>
                {trein.cargaHoraria ? `, com carga horária de ${trein.cargaHoraria},` : ""} promovido por {cliente.negocio}
                {trein.data ? ` em ${trein.data}` : ""}.
              </div>
              <div style={{ marginTop: "56px", textAlign: "center" }}>
                <div style={{ width: "220px", borderBottom: "1px solid var(--tinta-areia)", marginBottom: "6px" }} />
                <div className="text-xs" style={{ color: "var(--tinta-areia)" }}>Consultoria & Treinamentos</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ImpressaoRelTreinamento({ cliente, trein }) {
  if (!trein || !trein.relResumo) return null;
  const recomendacoes = emLinhasDoc(trein.relRecomendacoes);
  const presentes = (trein.participantesLista || []).filter((p) => p.presente && p.nome.trim());
  return (
    <div className="area-relt hidden print:block p-10" style={{ color: "var(--tinta)" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="enz-rotulo">Relatório de Realização — Treinamento</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{trein.tema}</div>
        <div className="text-sm mt-1" style={{ color: "var(--tinta)" }}>
          {cliente.negocio}{trein.data ? ` · ${trein.data}` : ""}{trein.cargaHoraria ? ` · ${trein.cargaHoraria}` : ""}
        </div>
      </div>
      <div className="mb-5">
        <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>O que foi trabalhado</div>
        <p className="text-sm">{trein.relResumo}</p>
      </div>
      {trein.relResultados && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Resultados e reações observadas</div>
          <p className="text-sm">{trein.relResultados}</p>
        </div>
      )}
      {presentes.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Participantes ({presentes.length})</div>
          <p className="text-sm">{presentes.map((p) => p.nome).join(" · ")}</p>
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
