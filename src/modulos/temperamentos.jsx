import { AvisoErro, BotaoContorno, BotaoPrimario, InputField, Trabalhando } from "../componentes/ui.jsx";
import { FORM_TEMPERAMENTO, TEMPERAMENTOS, contarTemperamentos } from "../ia/documentos.jsx";
import { emLinhasDoc } from "./documentos.jsx";
import { RodapeImpressao } from "./tabela.jsx";
import { CORES, uid } from "../nucleo/base.jsx";

// ─── Módulo: Temperamentos ──────────────────────────────────────

export function pessoaVazia() {
  return {
    id: uid(),
    nome: "",
    cargo: "",
    obs: "",
    dominante: "",
    secundario: "",
    justificativa: "",
    forcas: "",
    riscos: "",
    lideranca: "",
    adequacao: "",
    contratante: false,
    abordagem: "",
    respostas: {},
  };
}

export function SeloTemperamento({ chave, pequeno }) {
  if (!chave || !TEMPERAMENTOS[chave]) return null;
  const t = TEMPERAMENTOS[chave];
  return (
    <span
      className={`inline-block rounded-full font-semibold ${pequeno ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"}`}
      style={{ background: t.fundo, color: t.cor }}
    >
      {t.rotulo}
    </span>
  );
}

export function ListaPessoas({ cliente, pessoas, onAbrir, onNova, onVoltar }) {
  const contagem = {};
  for (const p of pessoas) {
    if (p.dominante) contagem[p.dominante] = (contagem[p.dominante] || 0) + 1;
  }
  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: CORES.douradoEscuro, letterSpacing: 1, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "'Lora', serif" }}>
        ← {cliente.negocio}
      </button>
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="font-serif text-xl" style={{ color: CORES.fogo }}>Temperamentos</h2>
        <BotaoPrimario onClick={onNova}>+ Nova pessoa</BotaoPrimario>
      </div>
      <p className="text-xs mb-4" style={{ color: CORES.textoDim }}>
        Mapa das pessoas-chave pela ciência dos temperamentos — classificação, leitura pessoa × cargo e orientação de liderança.
      </p>

      {pessoas.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-5">
          {Object.entries(TEMPERAMENTOS).map(([chave, t]) => (
            <div key={chave} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: t.fundo, color: t.cor }}>
              {t.rotulo}: {contagem[chave] || 0}
            </div>
          ))}
        </div>
      )}

      {pessoas.length === 0 ? (
        <div className="text-center py-16 rounded-lg" style={{ background: CORES.papel, border: "1px dashed #7BA85C" }}>
          <p className="text-sm" style={{ color: CORES.textoDim }}>
            Ninguém mapeado ainda. Adicione uma pessoa-chave, descreva o que você observou dela, e classifique — ou deixe a IA sugerir a partir das suas observações.
          </p>
        </div>
      ) : (
        <div className="grid gap-2">
          {pessoas.map((p) => (
            <button
              key={p.id}
              onClick={() => onAbrir(p.id)}
              className="objeto text-left px-5 py-3 rounded-lg shadow-sm flex items-center justify-between gap-2 flex-wrap"
              className="card"
            >
              <span>
                <span className="font-serif" style={{ color: CORES.fogo }}>{p.nome || "(sem nome)"}</span>
                {p.cargo && <span className="text-xs ml-2" style={{ color: CORES.textoDim }}>{p.cargo}</span>}
                {p.contratante && (
                  <span className="text-xs ml-2 px-2 py-0.5 rounded-full font-semibold" style={{ background: CORES.hover, color: CORES.dourado }}>
                    contratante
                  </span>
                )}
              </span>
              <span className="flex gap-1.5 items-center">
                <SeloTemperamento chave={p.dominante} pequeno />
                {p.secundario && <span className="text-xs" style={{ color: "#A89878" }}>+ <SeloTemperamento chave={p.secundario} pequeno /></span>}
                {!p.dominante && <span className="text-xs" style={{ color: "#A89878" }}>não classificado</span>}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export const CAMPOS_PESSOA_GERADOS = [
  ["justificativa", "Justificativa da classificação", 2],
  ["forcas", "Forças no cargo (uma por linha)", 3],
  ["riscos", "Riscos e atritos (um por linha)", 3],
  ["lideranca", "Como liderar e se comunicar", 3],
  ["adequacao", "Adequação temperamento × cargo", 2],
];

export function EditorPessoa({ cliente, pessoa, gerando, erro, onMudar, onGerar, onImprimir, onExcluir, onVoltar }) {
  const set = (campo) => (v) => onMudar({ ...pessoa, [campo]: v });
  const selectTemp = (campo, rotulo) => (
    <label className="block mb-4">
      <span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>
        {rotulo}
      </span>
      <select
        className="w-full px-3 py-2 rounded border bg-creme text-sm outline-none"
        style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }}
        value={pessoa[campo] || ""}
        onChange={(e) => set(campo)(e.target.value)}
      >
        <option value="">— deixar a IA sugerir —</option>
        {Object.entries(TEMPERAMENTOS).map(([chave, t]) => (
          <option key={chave} value={chave}>{t.rotulo}</option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: CORES.douradoEscuro, letterSpacing: 1, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "'Lora', serif" }}>
        ← Temperamentos · {cliente.negocio}
      </button>
      <div className="rounded-lg p-6 shadow-sm card">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h2 className="font-serif text-lg flex items-center gap-2" style={{ color: CORES.fogo }}>
            {pessoa.nome || "Nova pessoa"} <SeloTemperamento chave={pessoa.dominante} pequeno />
          </h2>
          <div className="flex gap-2">
            <BotaoPrimario onClick={onGerar} disabled={gerando || !pessoa.nome.trim()}>
              {gerando ? "Analisando..." : pessoa.justificativa ? "Analisar novamente" : "Analisar com IA"}
            </BotaoPrimario>
            {pessoa.justificativa && <BotaoContorno onClick={onImprimir}>Exportar ficha PDF</BotaoContorno>}
          </div>
        </div>

        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && (
          <>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <InputField label="Nome ou apelido" value={pessoa.nome} onChange={set("nome")} placeholder="Ex.: João (líder do salão)" />
              <InputField label="Cargo/função" value={pessoa.cargo} onChange={set("cargo")} placeholder="Ex.: Líder de Salão" />
            </div>
            <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Observações — comportamentos, reações, padrões</span><textarea rows={4} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} placeholder="Ex.: fala rápido e alto, resolve conflito na hora mas atropela; detesta rotina de fechamento; o time gosta dele mas reclama de instabilidade" value={pessoa.obs} onChange={(e) => set("obs")(e.target.value)} /></label>

            <div className="mb-4 rounded-lg p-4" style={{ background: CORES.cartao, border: "1px dashed #E97F3855" }}>
              <div className="flex items-baseline justify-between mb-1">
                <div className="label" style={{ color: CORES.dourado }}>
                  Formulário de observação (opcional)
                </div>
                {Object.keys(pessoa.respostas || {}).length > 0 && (
                  <span className="text-xs" style={{ color: "#A89878" }}>
                    {Object.keys(pessoa.respostas || {}).length}/{FORM_TEMPERAMENTO.length} respondidas
                  </span>
                )}
              </div>
              <p className="text-xs mb-3" style={{ color: CORES.textoDim }}>
                Marque o que você observou na pessoa. A contagem sugere a classificação — seu olho continua sendo o juiz.
              </p>
              {FORM_TEMPERAMENTO.map((q, i) => {
                const marcada = (pessoa.respostas || {})[i];
                return (
                  <div key={i} className="mb-2">
                    <div className="text-xs mb-1" style={{ color: "#6B5D42" }}>{q.pergunta}</div>
                    <div className="flex gap-1.5 flex-wrap">
                      {q.opcoes.map(([texto, chave]) => (
                        <button
                          key={chave}
                          onClick={() => {
                            const respostas = { ...(pessoa.respostas || {}) };
                            if (respostas[i] === chave) delete respostas[i];
                            else respostas[i] = chave;
                            onMudar({ ...pessoa, respostas });
                          }}
                          className="px-2 py-1 text-xs rounded border"
                          style={
                            marcada === chave
                              ? { background: TEMPERAMENTOS[chave].fundo, borderColor: TEMPERAMENTOS[chave].cor, color: TEMPERAMENTOS[chave].cor, fontWeight: 600 }
                              : { background: CORES.cartao, borderColor: "#E0D5BC", color: CORES.textoDim }
                          }
                        >
                          {texto}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              {Object.keys(pessoa.respostas || {}).length >= 4 && (() => {
                const { contagem, dominante, secundario } = contarTemperamentos(pessoa.respostas);
                return (
                  <div className="mt-3 pt-3 border-t flex items-center gap-3 flex-wrap" style={{ borderColor: "#EFE8D6" }}>
                    <span className="text-xs" style={{ color: "#6B5D42" }}>
                      Contagem:{" "}
                      {Object.entries(TEMPERAMENTOS).map(([chave, t]) => `${t.rotulo} ${contagem[chave]}`).join(" · ")}
                    </span>
                    {dominante && (
                      <BotaoContorno onClick={() => onMudar({ ...pessoa, dominante, secundario: secundario || pessoa.secundario })}>
                        Aplicar sugestão: {TEMPERAMENTOS[dominante].rotulo}
                        {secundario ? ` + ${TEMPERAMENTOS[secundario].rotulo}` : ""}
                      </BotaoContorno>
                    )}
                  </div>
                );
              })()}
            </div>
            <div className="grid sm:grid-cols-2 gap-x-4">
              {selectTemp("dominante", "Temperamento dominante")}
              {selectTemp("secundario", "Temperamento secundário")}
            </div>
            <label className="flex items-center gap-2 mb-4 text-sm cursor-pointer" style={{ color: CORES.fogoEscuro }}>
              <input
                type="checkbox"
                checked={!!pessoa.contratante}
                onChange={(e) => set("contratante")(e.target.checked)}
              />
              É o contratante/dono — orientar como conduzir a consultoria com essa pessoa
            </label>
            {pessoa.contratante && (
              <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Como conduzir a consultoria com essa pessoa (uso interno — não sai na ficha PDF)</span><textarea rows={4} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} value={pessoa.abordagem} onChange={(e) => set("abordagem")(e.target.value)} /></label>
            )}
            {CAMPOS_PESSOA_GERADOS.map(([campo, rotulo, linhas]) => (
              <label key={campo} className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>{rotulo}</span><textarea rows={linhas} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} value={pessoa[campo]} onChange={(e) => set(campo)(e.target.value)} /></label>
            ))}
            <button onClick={onExcluir} className="text-xs underline" style={{ color: "#8A3A2E" }}>
              Excluir pessoa
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function ImpressaoPessoa({ cliente, pessoa }) {
  if (!pessoa || !pessoa.justificativa) return null;
  const forcas = emLinhasDoc(pessoa.forcas);
  const riscos = emLinhasDoc(pessoa.riscos);
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "#2A1218" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="text-xs uppercase tracking-widest" style={{ color: CORES.dourado }}>Ficha de Temperamento · Confidencial — uso da liderança</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{pessoa.nome}</div>
        <div className="text-sm mt-1" style={{ color: "#6B5D42" }}>
          {cliente.negocio}{pessoa.cargo ? ` · ${pessoa.cargo}` : ""}
        </div>
        <div className="mt-2 text-sm">
          Dominante: <strong>{TEMPERAMENTOS[pessoa.dominante] ? TEMPERAMENTOS[pessoa.dominante].rotulo : "—"}</strong>
          {pessoa.secundario && TEMPERAMENTOS[pessoa.secundario] && (
            <> · Secundário: <strong>{TEMPERAMENTOS[pessoa.secundario].rotulo}</strong></>
          )}
        </div>
      </div>

      <div className="mb-5">
        <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Leitura</div>
        <p className="text-sm">{pessoa.justificativa}</p>
      </div>

      {forcas.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Forças no cargo</div>
          <ul className="text-sm list-disc pl-5">
            {forcas.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
      )}

      {riscos.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Riscos e atritos</div>
          <ul className="text-sm list-disc pl-5">
            {riscos.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      )}

      {pessoa.lideranca && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Como liderar e se comunicar</div>
          <p className="text-sm">{pessoa.lideranca}</p>
        </div>
      )}

      {pessoa.adequacao && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Adequação temperamento × cargo</div>
          <p className="text-sm">{pessoa.adequacao}</p>
        </div>
      )}

      <RodapeImpressao />
    </div>
  );
}
