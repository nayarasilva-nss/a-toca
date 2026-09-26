import { AvisoErro, BotaoPrimario, ConfirmarAcao, InputField, Trabalhando } from "../componentes/ui.jsx";
import { MARCAS_TURNO, TIPOS_CAMPO } from "../ia/campo.jsx";
import { TEMPERAMENTOS } from "../ia/documentos.jsx";
import { CORES, uid } from "../nucleo/base.jsx";

// ─── Módulo: Trabalho de Campo ──────────────────────────────────

export function ListaCampo({ cliente, registros, onAbrir, onNovo, onVoltar }) {
  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: CORES.douradoEscuro, letterSpacing: 1, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-body)" }}>
        ← {cliente.negocio}
      </button>
      <div className="flex items-baseline justify-between mb-2 gap-2 flex-wrap">
        <h2 className="font-serif text-xl" style={{ color: CORES.fogo }}>Trabalho de Campo</h2>
        <div className="flex gap-2 flex-wrap">
          <BotaoPrimario onClick={() => onNovo("visita")}>+ Visita</BotaoPrimario>
          <BotaoPrimario onClick={() => onNovo("entrevista")}>+ Entrevista</BotaoPrimario>
          <BotaoPrimario onClick={() => onNovo("turno")}>+ Turno</BotaoPrimario>
        </div>
      </div>
      <p className="text-xs mb-5" style={{ color: CORES.textoDim }}>
        O caderno de campo: observar as criaturas no habitat delas. O que você registra aqui vira fonte primária — alimenta cargos, processos, plano e diagnóstico. 100% interno: nada disso sai em documento de cliente.
      </p>
      {registros.length === 0 ? (
        <div className="text-center py-16 rounded-lg" style={{ background: CORES.papel, border: "1px dashed var(--linha-forte)" }}>
          <p className="text-sm" style={{ color: CORES.textoDim }}>
            O caderno está em branco. Antes de ir a campo, crie uma visita ou entrevista — a IA prepara o roteiro com base no briefing, nas frentes e na CCT.
          </p>
        </div>
      ) : (
        <div className="grid gap-2">
          {registros.map((r) => (
            <button
              key={r.id}
              onClick={() => onAbrir(r.id)}
              className="objeto text-left px-5 py-3 rounded-lg shadow-sm flex items-baseline justify-between gap-2 flex-wrap"
              className="card"
            >
              <span className="font-serif" style={{ color: CORES.fogo }}>
                <span className="text-xs uppercase tracking-widest mr-2" style={{ color: CORES.dourado }}>{TIPOS_CAMPO[r.tipo].curto}</span>
                {r.tipo === "entrevista" ? (r.entrevistado || r.funcao || "(sem nome)") : (r.titulo || r.setor || "(sem título)")}
              </span>
              <span className="text-xs" style={{ color: CORES.textoDim }}>{r.data}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function EditorCampo({ cliente, reg, pessoas, gerando, erro, onMudar, onGerarRoteiro, onAbrirPessoa, onCriarPessoa, onExcluir, onVoltar }) {
  const set = (campo) => (v) => onMudar({ ...reg, [campo]: v });
  const pessoaLigada =
    reg.tipo === "entrevista" && reg.entrevistado
      ? (pessoas || []).find((p) => p.nome && p.nome.toLowerCase().trim() === reg.entrevistado.toLowerCase().trim())
      : null;

  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: CORES.douradoEscuro, letterSpacing: 1, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-body)" }}>
        ← Trabalho de Campo · {cliente.negocio}
      </button>
      <div className="rounded-lg p-6 shadow-sm card">
        <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
          <h2 className="font-serif text-lg" style={{ color: CORES.fogo }}>{TIPOS_CAMPO[reg.tipo].rotulo}</h2>
          {(reg.tipo === "visita" || reg.tipo === "entrevista") && (
            <BotaoPrimario onClick={onGerarRoteiro} disabled={gerando}>
              {gerando ? "Preparando..." : reg.roteiro ? "Refazer roteiro com IA" : "Preparar roteiro com IA"}
            </BotaoPrimario>
          )}
        </div>
        <p className="text-xs mb-4" style={{ color: CORES.textoDim }}>
          {reg.tipo === "visita" && "Roteiro antes, olhos abertos durante, registro logo depois — memória de campo evapora em horas."}
          {reg.tipo === "entrevista" && "O que a pessoa realmente faz, na voz dela. Papel se confronta depois; agora é escuta."}
          {reg.tipo === "turno" && "Linha do tempo do turno: hora, o que viu, e a marca do que é (processo, pessoa, risco, oportunidade)."}
        </p>

        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && (
          <>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <InputField label="Data" value={reg.data} onChange={set("data")} />
              {reg.tipo === "visita" && <InputField label="Foco da visita (opcional)" value={reg.titulo} onChange={set("titulo")} placeholder="Ex.: produção do sushibar no pico" />}
              {reg.tipo === "turno" && <InputField label="Setor / turno" value={reg.setor} onChange={set("setor")} placeholder="Ex.: Cozinha — turno do jantar" />}
              {reg.tipo === "entrevista" && (
                <>
                  <InputField label="Nome do entrevistado" value={reg.entrevistado} onChange={set("entrevistado")} />
                  <InputField label="Função" value={reg.funcao} onChange={set("funcao")} placeholder="Ex.: Sushiman" />
                </>
              )}
            </div>

            {reg.tipo === "entrevista" && reg.entrevistado && (
              <div className="mb-4 text-xs flex items-center gap-2 flex-wrap" style={{ color: CORES.textoDim }}>
                {pessoaLigada ? (
                  <>
                    <span>
                      {pessoaLigada.nome} já está em Temperamentos
                      {pessoaLigada.dominante && TEMPERAMENTOS[pessoaLigada.dominante] ? ` (${TEMPERAMENTOS[pessoaLigada.dominante].rotulo})` : ""}.
                    </span>
                    <button onClick={() => onAbrirPessoa(pessoaLigada.id)} className="underline font-semibold" style={{ color: CORES.dourado }}>
                      Abrir ficha → preencher observação de temperamento
                    </button>
                  </>
                ) : (
                  <button onClick={onCriarPessoa} className="underline font-semibold" style={{ color: CORES.dourado }}>
                    + Mapear {reg.entrevistado} em Temperamentos (aproveite a entrevista para observar o temperamento)
                  </button>
                )}
              </div>
            )}

            {(reg.tipo === "visita" || reg.tipo === "entrevista") && (
              <label className="block mb-4">
                <span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>
                  {reg.tipo === "visita" ? "Roteiro de observação (um ponto por linha)" : "Roteiro de perguntas (uma por linha)"}
                </span>
                <textarea rows={6} className="w-full px-3 py-2 rounded border bg-creme text-sm outline-none" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} value={reg.roteiro} onChange={(e) => set("roteiro")(e.target.value)} placeholder="Gere com IA ou escreva o seu" />
              </label>
            )}

            {reg.tipo === "visita" && (
              <>
                <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>O que foi observado</span><textarea rows={4} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} value={reg.observado} onChange={(e) => set("observado")(e.target.value)} /></label>
                <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Evidências de informalidade</span><textarea rows={3} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} placeholder="Controles em papel, combinados verbais, ponto frouxo..." value={reg.informalidades} onChange={(e) => set("informalidades")(e.target.value)} /></label>
                <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Riscos percebidos (trabalhista / contábil / administrativo)</span><textarea rows={3} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} value={reg.riscos} onChange={(e) => set("riscos")(e.target.value)} /></label>
                <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Pontos fortes a preservar</span><textarea rows={2} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} value={reg.pontosFortes} onChange={(e) => set("pontosFortes")(e.target.value)} /></label>
              </>
            )}

            {reg.tipo === "entrevista" && (
              <>
                <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Atividades relatadas (o que ele faz de verdade)</span><textarea rows={4} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} value={reg.atividades} onChange={(e) => set("atividades")(e.target.value)} /></label>
                <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>O que faz e não deveria ser dele</span><textarea rows={2} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} value={reg.fazNaoDeveria} onChange={(e) => set("fazNaoDeveria")(e.target.value)} /></label>
                <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>O que deveria fazer e não faz (e por quê)</span><textarea rows={2} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} value={reg.deveriaNaoFaz} onChange={(e) => set("deveriaNaoFaz")(e.target.value)} /></label>
                <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Dores relatadas</span><textarea rows={3} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} value={reg.dores} onChange={(e) => set("dores")(e.target.value)} /></label>
              </>
            )}

            {reg.tipo === "turno" && (
              <>
                <div className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: CORES.dourado }}>Linha do tempo</div>
                {(reg.linhas || []).map((l) => (
                  <div key={l.id} className="flex items-center gap-2 py-1.5 border-b flex-wrap sm:flex-nowrap" style={{ borderColor: "var(--fundo-recuo)" }}>
                    <input
                      className="w-16 px-2 py-1 text-xs rounded border bg-creme text-center"
                      style={{ borderColor: "var(--linha)", color: "var(--tinta)" }}
                      placeholder="hh:mm"
                      value={l.hora}
                      onChange={(e) => onMudar({ ...reg, linhas: reg.linhas.map((x) => (x.id === l.id ? { ...x, hora: e.target.value } : x)) })}
                    />
                    <select
                      className="px-1.5 py-1 text-xs rounded border font-semibold"
                      style={{
                        borderColor: (MARCAS_TURNO[l.marca] || MARCAS_TURNO.processo).cor,
                        background: (MARCAS_TURNO[l.marca] || MARCAS_TURNO.processo).fundo,
                        color: (MARCAS_TURNO[l.marca] || MARCAS_TURNO.processo).cor,
                      }}
                      value={l.marca}
                      onChange={(e) => onMudar({ ...reg, linhas: reg.linhas.map((x) => (x.id === l.id ? { ...x, marca: e.target.value } : x)) })}
                    >
                      {Object.entries(MARCAS_TURNO).map(([chave, m]) => (
                        <option key={chave} value={chave}>{m.rotulo}</option>
                      ))}
                    </select>
                    <input
                      className="flex-1 min-w-40 px-2 py-1 text-sm rounded border bg-creme"
                      style={{ borderColor: "var(--linha)", color: CORES.fogoEscuro }}
                      placeholder="O que você viu"
                      value={l.texto}
                      onChange={(e) => onMudar({ ...reg, linhas: reg.linhas.map((x) => (x.id === l.id ? { ...x, texto: e.target.value } : x)) })}
                    />
                    <button
                      onClick={() => onMudar({ ...reg, linhas: reg.linhas.filter((x) => x.id !== l.id) })}
                      className="px-1 text-xs"
                      style={{ color: "var(--ouro-texto)" }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => onMudar({ ...reg, linhas: [...(reg.linhas || []), { id: uid(), hora: "", marca: "processo", texto: "" }] })}
                  className="mt-2 text-sm"
                  style={{ color: CORES.dourado }}
                >
                  + Registro
                </button>
              </>
            )}

            <div className="mt-4">
              <ConfirmarAcao label="Excluir este registro" aviso="apaga este registro de campo" onConfirmar={onExcluir} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
