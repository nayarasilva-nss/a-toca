import { useState } from "react";
import { SeloTemperamento } from "./temperamentos.jsx";
import { FOCOS_MENTORIA, focoDe } from "../nucleo/focos.jsx";
import { AvisoErro, BotaoPrimario, Trabalhando } from "../componentes/ui.jsx";
import { GUIA_MOLDAGEM, TEMPERAMENTOS } from "../ia/documentos.jsx";
import { CORES, uid } from "../nucleo/base.jsx";

// ─── Módulo: Mentoria ───────────────────────────────────────────

export function ReguaMetodoMentoria({ mentoria, temRaioX, statusAcordo, temProva }) {
  const encontros = mentoria.encontros || [];
  const realizados = encontros.filter((e) => e.realizada).length;
  const atividades = encontros.flatMap((e) => e.atividades || []);
  const pctPraCasa = atividades.length ? atividades.filter((a) => a.feita).length / atividades.length : 0;
  const fases = [
    { rotulo: "Escuta", ok: !!(mentoria.briefing || mentoria.objetivos) },
    { rotulo: "Raio-X", ok: temRaioX },
    { rotulo: "Acordo", ok: statusAcordo === "aceita", meio: statusAcordo === "gerada" },
    { rotulo: "Construção", ok: encontros.length > 0 && realizados > 0, meio: encontros.length > 0 && realizados === 0 },
    { rotulo: "Sustentação", ok: encontros.length > 0 && realizados / encontros.length >= 0.6 && pctPraCasa >= 0.5 },
    { rotulo: "Prova", ok: temProva },
  ];
  return (
    <div className="flex items-center gap-1 mb-4 flex-wrap">
      {fases.map((f, i) => (
        <span key={f.rotulo} className="flex items-center gap-1">
          {i > 0 && <span style={{ color: "var(--linha-forte)" }}>→</span>}
          <span
            className="text-xs px-2 py-0.5 rounded font-semibold"
            style={
              f.ok
                ? { background: "var(--sucesso-fundo)", color: "var(--sucesso)", border: "1px solid var(--linha-forte)" }
                : f.meio
                ? { background: "var(--alerta-fundo)", color: "var(--alerta)", border: "1px solid var(--alerta)" }
                : { background: CORES.cartao, color: "var(--tinta-musgo)", border: "1px solid var(--linha)" }
            }
          >
            {f.rotulo}
          </span>
        </span>
      ))}
    </div>
  );
}

export function SecaoMoldagem({ mentoria, mentorado, gerando, onMudar, onGerarFicha }) {
  const [guiaAberto, setGuiaAberto] = useState(false);
  const m = mentoria.moldagem || {};
  const praticas = mentoria.praticas || [];
  const guia = mentorado && mentorado.dominante ? GUIA_MOLDAGEM[mentorado.dominante] : null;
  const temFicha = m.leitura || (m.praticasSugeridas || []).length > 0;
  const ativarPratica = (p) => {
    onMudar({
      ...mentoria,
      praticas: [...praticas, { id: uid(), texto: p.texto, porque: p.porque, desde: new Date().toLocaleDateString("pt-BR"), status: "ativa" }],
      moldagem: { ...m, praticasSugeridas: (m.praticasSugeridas || []).filter((x) => x.id !== p.id) },
    });
  };
  return (
    <div className="mb-4 p-4 rounded-lg" style={{ background: "var(--fundo-elevado)", border: "2px solid var(--ouro)" }}>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
        <div className="label" style={{ color: "var(--alerta)" }}>
          Moldagem pelo temperamento
        </div>
        <div className="flex gap-3 items-center">
          {guia && (
            <button onClick={() => setGuiaAberto(!guiaAberto)} className="enz-link" style={{ textTransform: "none", letterSpacing: 0, fontSize: 12 }} style={{ color: CORES.dourado }}>
              {guiaAberto ? "Fechar guia" : `Guia do ${TEMPERAMENTOS[mentorado.dominante].rotulo.toLowerCase()}`}
            </button>
          )}
          {mentorado && mentorado.dominante && (
            <button onClick={onGerarFicha} className="text-xs underline font-semibold" style={{ color: CORES.dourado }} disabled={gerando}>
              {temFicha ? "Refazer ficha de moldagem" : "Gerar ficha de moldagem com IA"}
            </button>
          )}
        </div>
      </div>
      {!mentorado && (
        <p className="text-xs" style={{ color: CORES.textoDim }}>Vincule o mentorado para a moldagem — a prescrição nasce do temperamento.</p>
      )}
      {mentorado && !mentorado.dominante && (
        <p className="text-xs" style={{ color: "var(--alerta)" }}>Classifique o temperamento no módulo Temperamentos — sem ele não há moldagem precisa.</p>
      )}

      {guiaAberto && guia && (
        <div className="mt-2 p-3 rounded text-xs" style={{ background: CORES.cartao, border: "1px solid var(--fundo-recuo)", color: "var(--tinta-areia)", lineHeight: 1.6 }}>
          <div className="mb-1"><strong style={{ color: CORES.fogo }}>Essência:</strong> {guia.essencia}</div>
          <div className="mb-1"><strong style={{ color: "var(--erro)" }}>Onde acomoda:</strong> {guia.acomoda}</div>
          <div className="mb-1"><strong style={{ color: "var(--sucesso)" }}>Direção da moldagem:</strong> {guia.direcao}</div>
          <div className="mb-1"><strong style={{ color: "var(--info)" }}>Virtudes:</strong> {guia.virtudes}</div>
          <div className="mb-1"><strong style={{ color: CORES.dourado }}>Práticas do estilo:</strong> {guia.praticas.map((p, i) => <div key={i} className="ml-2">• {p}</div>)}</div>
          <div className="mb-1"><strong style={{ color: CORES.fogo }}>Como cobrar:</strong> {guia.cobranca}</div>
          <div><strong style={{ color: "var(--erro)" }}>Armadilha do mentor:</strong> {guia.armadilha}</div>
        </div>
      )}

      {temFicha && (
        <div className="mt-2">
          {m.virtudeCentral && m.virtudeCentral.nome && (
            <div className="mb-2 p-3 rounded-lg" style={{ background: "var(--info-fundo)", border: "2px solid var(--info)55" }}>
              <div className="label" style={{ color: "var(--info)" }}>
                Virtude central da jornada: {m.virtudeCentral.nome}
              </div>
              {m.virtudeCentral.manifestacao && (
                <div className="text-xs mt-1" style={{ color: "var(--tinta-areia)" }}><strong>Como a falta aparece:</strong> {m.virtudeCentral.manifestacao}</div>
              )}
              {m.virtudeCentral.cultivo && (
                <div className="text-xs mt-1" style={{ color: "var(--tinta-areia)" }}><strong>Cultivo (subjetivo, observável):</strong> {m.virtudeCentral.cultivo}</div>
              )}
            </div>
          )}
          {m.leitura && (
            <textarea rows={3} className="w-full px-2 py-1 text-sm rounded border bg-creme mb-2" style={{ borderColor: "var(--linha)", color: CORES.fogoEscuro }}
              value={m.leitura} onChange={(e) => onMudar({ ...mentoria, moldagem: { ...m, leitura: e.target.value } })} />
          )}
          {m.contrabalancos && (
            <div className="text-xs mb-2 p-2 rounded" style={{ background: "var(--erro-fundo)", color: "var(--erro)" }}>
              <strong>Contrabalançar:</strong> {m.contrabalancos.split("\n").join(" · ")}
            </div>
          )}
          {(m.praticasSugeridas || []).length > 0 && (
            <div className="mb-2">
              <div className="text-xs font-semibold mb-1" style={{ color: "var(--tinta)" }}>Práticas sugeridas — ative as que prescrever:</div>
              {(m.praticasSugeridas || []).map((p) => (
                <div key={p.id} className="flex items-start gap-2 py-1 border-b" style={{ borderColor: "var(--fundo-elevado)" }}>
                  <div className="flex-1">
                    <div className="text-sm" style={{ color: CORES.fogoEscuro }}>{p.texto}</div>
                    {p.porque && <div className="text-xs italic" style={{ color: CORES.textoDim }}>{p.porque}</div>}
                  </div>
                  <button onClick={() => ativarPratica(p)} className="text-xs px-2 py-0.5 rounded font-semibold shrink-0" style={{ background: "var(--sucesso-fundo)", color: "var(--sucesso)", border: "1px solid var(--linha-forte)" }}>
                    Prescrever ✓
                  </button>
                  <button onClick={() => onMudar({ ...mentoria, moldagem: { ...m, praticasSugeridas: m.praticasSugeridas.filter((x) => x.id !== p.id) } })} className="text-xs px-1" style={{ color: "var(--linha-forte)" }}>✕</button>
                </div>
              ))}
            </div>
          )}
          {m.comoCobrar && (
            <div className="text-xs mb-2 p-2 rounded" style={{ background: "var(--fundo-elevado)", border: "1px solid var(--fundo-recuo)", color: "var(--tinta)" }}>
              <strong>Como cobrar este mentorado:</strong> {m.comoCobrar}
            </div>
          )}
          {m.sinais && (
            <div className="text-xs mb-1" style={{ color: "var(--sucesso)" }}>
              <strong>Sinais de que está pegando:</strong> {m.sinais.split("\n").join(" · ")}
            </div>
          )}
        </div>
      )}

      {praticas.length > 0 && (
        <div className="mt-3">
          <div className="enz-rotulo mb-1">
            Práticas moldadoras ativas · {praticas.filter((p) => p.status === "consolidada").length} consolidadas
          </div>
          {praticas.map((p) => (
            <div key={p.id} className="flex items-start gap-2 py-1.5 border-b" style={{ borderColor: "var(--fundo-elevado)" }}>
              <select
                className="px-1.5 py-0.5 text-xs rounded border font-semibold shrink-0"
                style={
                  p.status === "consolidada"
                    ? { borderColor: "var(--sucesso)", background: "var(--sucesso-fundo)", color: "var(--sucesso)" }
                    : p.status === "pausada"
                    ? { borderColor: "var(--tinta-musgo)", background: "var(--fundo-elevado)", color: "var(--tinta-musgo)" }
                    : { borderColor: "var(--alerta)", background: "var(--alerta-fundo)", color: "var(--alerta)" }
                }
                value={p.status}
                onChange={(e) => onMudar({ ...mentoria, praticas: praticas.map((x) => (x.id === p.id ? { ...x, status: e.target.value } : x)) })}
              >
                <option value="ativa">Ativa</option>
                <option value="consolidada">Consolidada ✓</option>
                <option value="pausada">Pausada</option>
              </select>
              <div className="flex-1">
                <input className="w-full text-sm bg-transparent outline-none" style={{ color: p.status === "consolidada" ? "var(--sucesso)" : CORES.fogoEscuro }}
                  value={p.texto} onChange={(e) => onMudar({ ...mentoria, praticas: praticas.map((x) => (x.id === p.id ? { ...x, texto: e.target.value } : x)) })} />
                <div className="text-xs" style={{ color: "var(--tinta-musgo)" }}>{p.porque ? `${p.porque} · ` : ""}desde {p.desde}</div>
              </div>
              <button onClick={() => onMudar({ ...mentoria, praticas: praticas.filter((x) => x.id !== p.id) })} className="text-xs px-1" style={{ color: "var(--linha-forte)" }}>✕</button>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={() => onMudar({ ...mentoria, praticas: [...praticas, { id: uid(), texto: "", porque: "", desde: new Date().toLocaleDateString("pt-BR"), status: "ativa" }] })}
        className="text-xs mt-2"
        style={{ color: CORES.dourado }}
      >
        + Prescrever prática manualmente
      </button>

      <div className="mt-4 pt-3 border-t" style={{ borderColor: "var(--alerta-fundo)" }}>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
          <div className="label" style={{ color: "var(--info)" }}>
            Diário da virtude · registros subjetivos
          </div>
          <button
            onClick={() => onMudar({ ...mentoria, virtudes: [{ id: uid(), data: new Date().toLocaleDateString("pt-BR"), nota: "" }, ...(mentoria.virtudes || [])] })}
            className="enz-link" style={{ textTransform: "none", letterSpacing: 0, fontSize: 12 }}
            style={{ color: "var(--info)" }}
          >
            + Registrar observação
          </button>
        </div>
        {(mentoria.virtudes || []).length === 0 && (
          <p className="text-xs" style={{ color: CORES.textoDim }}>
            O que você viu, não o que mediu: "sustentou a conversa difícil sem recuar", "chegou sem o salto duas vezes". Vira a evidência qualitativa do Relatório de Evolução.
          </p>
        )}
        {(mentoria.virtudes || []).map((v) => (
          <div key={v.id} className="flex items-start gap-2 py-1">
            <span className="text-xs mt-1.5 shrink-0" style={{ color: "var(--tinta-musgo)" }}>{v.data}</span>
            <input
              className="flex-1 px-2 py-1 text-sm rounded border bg-creme"
              style={{ borderColor: "var(--linha)", color: CORES.fogoEscuro }}
              placeholder="O que você observou nesta pessoa..."
              value={v.nota}
              onChange={(e) => onMudar({ ...mentoria, virtudes: mentoria.virtudes.map((x) => (x.id === v.id ? { ...x, nota: e.target.value } : x)) })}
            />
            <button onClick={() => onMudar({ ...mentoria, virtudes: mentoria.virtudes.filter((x) => x.id !== v.id) })} className="text-xs px-1 mt-1" style={{ color: "var(--linha-forte)" }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ModuloMentoria({ cliente, mentoria, pessoas, temRaioX, statusAcordo, temProva, gerando, erro, onMudar, onGerarJornada, onEstruturarSessao, onCriarMentorado, onGerarFicha, onVoltar }) {
  const encontros = mentoria.encontros || [];
  const mentorado = pessoas.find((p) => p.id === mentoria.mentoradoId);
  const mudarEncontro = (id, campo, valor) =>
    onMudar({ ...mentoria, encontros: encontros.map((e) => (e.id === id ? { ...e, [campo]: valor } : e)) });
  const realizados = encontros.filter((e) => e.realizada).length;

  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="enz-link" style={{ marginBottom: 20 }}>
        ← {cliente.negocio}
      </button>
      <div className="enz-card">
        <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
          <h2 className="enz-titulo is-3">Mentoria</h2>
          <BotaoPrimario onClick={onGerarJornada} disabled={gerando || !focoDe(mentoria)}>
            {gerando ? "Desenhando..." : encontros.length ? "Redesenhar jornada com IA" : "Desenhar jornada com IA"}
          </BotaoPrimario>
        </div>
        <p className="enz-titulo-descricao" style={{ marginTop: 0, marginBottom: 24 }}>
          Encontros com propósito, um de cada vez. Até o mentorado não precisar mais de você.
          {encontros.length > 0 && ` · ${realizados}/${encontros.length} realizados`}
        </p>
        <ReguaMetodoMentoria mentoria={mentoria} temRaioX={temRaioX} statusAcordo={statusAcordo} temProva={temProva} />

        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <span className="enz-rotulo">Foco da jornada</span>
          {Object.entries(FOCOS_MENTORIA).map(([ch, meta]) => [ch, meta.rotulo]).map(([ch, rot]) => (
            <button
              key={ch}
              onClick={() => onMudar({ ...mentoria, foco: ch })}
              className="px-3 py-1 text-xs rounded border font-semibold"
              style={
                focoDe(mentoria) === ch
                  ? { background: CORES.hover, borderColor: CORES.dourado, color: CORES.fogo }
                  : { background: CORES.cartao, borderColor: "var(--linha)", color: "var(--tinta-musgo)" }
              }
            >
              {focoDe(mentoria) === ch ? "✓ " : ""}{rot}
            </button>
          ))}
          <span className="enz-nota">{focoDe(mentoria) ? FOCOS_MENTORIA[focoDe(mentoria)].nota : "escolha com o mentorado antes de desenhar a jornada — nenhum foco é padrão."}</span>
        </div>

        <div className="grid sm:grid-cols-2 gap-x-4">
          <div className="mb-4">
            <div className="enz-rotulo mb-1">Mentorado</div>
            {cliente.tipo === "pessoa" ? (
              <div className="flex items-center gap-2 flex-wrap" style={{ padding: "10px 0" }}>
                <span className="font-serif" style={{ fontSize: 20 }}>{cliente.negocio}</span>
                {mentorado && mentorado.dominante ? <SeloTemperamento chave={mentorado.dominante} pequeno /> : <span className="enz-nota">temperamento ainda não classificado — abra Temperamentos</span>}
              </div>
            ) : (
            <select
              className="w-full px-3 py-2 rounded border text-sm bg-creme"
              style={{ borderColor: "var(--linha)", color: CORES.fogoEscuro }}
              value={mentoria.mentoradoId || ""}
              onChange={(e) => onMudar({ ...mentoria, mentoradoId: e.target.value })}
            >
              <option value="">Selecionar de Temperamentos...</option>
              {pessoas.filter((p) => p.nome).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}{p.dominante && TEMPERAMENTOS[p.dominante] ? ` (${TEMPERAMENTOS[p.dominante].rotulo})` : ""}
                </option>
              ))}
            </select>
            )}
            {mentorado && mentorado.dominante && TEMPERAMENTOS[mentorado.dominante] && (
              <div className="text-xs mt-1" style={{ color: CORES.textoDim }}>A jornada se molda ao temperamento — sem citá-lo nos temas.</div>
            )}
            {!mentoria.mentoradoId && cliente.tipo === "pessoa" && !pessoas.some((p) => p.nome && p.nome.toLowerCase().trim() === (cliente.negocio || "").toLowerCase().trim()) && (
              <button onClick={onCriarMentorado} className="text-xs underline mt-1" style={{ color: CORES.dourado }}>
                + Criar {cliente.negocio} em Temperamentos e vincular
              </button>
            )}
            {mentorado && !mentorado.dominante && (
              <div className="text-xs mt-1" style={{ color: "var(--alerta)" }}>Temperamento ainda não classificado — o formulário de observação da ficha ajuda.</div>
            )}
          </div>
          <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Objetivos da mentoria</span><textarea rows={3} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} placeholder={focoDe(mentoria) === "lideranca" ? "liderar sem centralizar; preparar o time para funcionar sem ele" : focoDe(mentoria) === "vocacao" ? "entender no que é boa e decidir o próximo passo profissional" : focoDe(mentoria) === "transicao" ? "sair da área atual com plano e sem romper o que funciona" : "o que o mentorado quer ver diferente ao fim da jornada"} value={mentoria.objetivos || ""} onChange={(v) => onMudar({ ...mentoria, objetivos: v })} /></label>
        </div>
        <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Briefing da conversa inicial (alimenta a jornada)</span><textarea rows={3} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} placeholder={focoDe(mentoria) === "lideranca" ? "recém-promovido, era par do time que agora lidera; evita conflito" : "o que a pessoa contou: de onde vem, o que a incomoda, o que já tentou"} value={mentoria.briefing || ""} onChange={(v) => onMudar({ ...mentoria, briefing: v })} /></label>

        <SecaoMoldagem mentoria={mentoria} mentorado={mentorado} gerando={gerando} onMudar={onMudar} onGerarFicha={onGerarFicha} />

        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && (() => {
          const pendentes = encontros
            .filter((e) => e.realizada)
            .flatMap((e) => (e.atividades || []).filter((a) => !a.feita && a.texto).map((a) => ({ encontro: e, atividade: a })));
          if (!pendentes.length) return null;
          return (
            <div className="mb-4 p-4 rounded-lg" style={{ background: "var(--alerta-fundo)", border: "2px solid var(--ouro)" }}>
              <div className="enz-rotulo mb-2" style={{ color: "var(--alerta)" }}>
                Pra casa pendente — cobre no próximo encontro
              </div>
              {(mentoria.praticas || []).filter((p) => p.status === "ativa").length > 0 && (
                <div className="text-xs mb-2 pb-2 border-b" style={{ color: "var(--tinta)", borderColor: "var(--alerta-fundo)" }}>
                  <strong>Práticas ativas a cobrar:</strong> {(mentoria.praticas || []).filter((p) => p.status === "ativa").map((p) => p.texto).join(" · ")}
                </div>
              )}
              {pendentes.map(({ encontro, atividade }) => (
                <label key={atividade.id} className="flex items-start gap-2 py-0.5 text-sm cursor-pointer" style={{ color: CORES.fogoEscuro }}>
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={false}
                    onChange={() =>
                      onMudar({
                        ...mentoria,
                        encontros: encontros.map((e) =>
                          e.id === encontro.id
                            ? { ...e, atividades: e.atividades.map((a) => (a.id === atividade.id ? { ...a, feita: true } : a)) }
                            : e
                        ),
                      })
                    }
                  />
                  <span>
                    {atividade.texto}
                    <span className="text-xs ml-1" style={{ color: CORES.textoDim }}>({encontro.tema})</span>
                  </span>
                </label>
              ))}
            </div>
          );
        })()}

        {!gerando && encontros.map((e, idx) => (
          <div key={e.id} className="mb-3 rounded-lg p-4" style={{ background: CORES.cartao, border: e.realizada ? "2px solid var(--linha-forte)" : "2px solid var(--linha)" }}>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <input type="checkbox" checked={!!e.realizada} onChange={() => mudarEncontro(e.id, "realizada", !e.realizada)} title="Encontro realizado" />
              <span className="text-xs font-semibold" style={{ color: CORES.dourado }}>{idx + 1}.</span>
              <input className="font-serif flex-1 min-w-40 bg-transparent outline-none" style={{ color: CORES.fogo }} value={e.tema} onChange={(ev) => mudarEncontro(e.id, "tema", ev.target.value)} />
              <input className="w-24 px-2 py-1 text-xs rounded border bg-creme text-center" style={{ borderColor: "var(--linha)", color: "var(--tinta)" }} placeholder="dd/mm" value={e.data} onChange={(ev) => mudarEncontro(e.id, "data", ev.target.value)} />
              <button onClick={() => onMudar({ ...mentoria, encontros: encontros.filter((x) => x.id !== e.id) })} className="px-1 text-xs" style={{ color: "var(--ouro-texto)" }}>✕</button>
            </div>
            {e.objetivo && <div className="text-xs mb-1" style={{ color: "var(--tinta)" }}>{e.objetivo}</div>}
            {e.provocacao && <div className="text-xs italic mb-2" style={{ color: CORES.textoDim }}>Provocação: {e.provocacao}</div>}
            {(e.atividades || []).length > 0 && (
              <div className="mb-2 p-2 rounded" style={{ background: "var(--fundo-elevado)", border: "1px solid var(--fundo-recuo)" }}>
                <div className="enz-rotulo mb-1">
                  Pra casa · {(e.atividades || []).filter((a) => a.feita).length}/{(e.atividades || []).length}
                </div>
                {(e.atividades || []).map((a) => (
                  <div key={a.id} className="flex items-center gap-2 py-0.5">
                    <input
                      type="checkbox"
                      checked={!!a.feita}
                      onChange={() => mudarEncontro(e.id, "atividades", e.atividades.map((x) => (x.id === a.id ? { ...x, feita: !x.feita } : x)))}
                    />
                    <input
                      className="flex-1 text-xs bg-transparent outline-none"
                      style={{ color: a.feita ? "var(--tinta-musgo)" : CORES.fogoEscuro, textDecoration: a.feita ? "line-through" : "none" }}
                      value={a.texto}
                      onChange={(ev) => mudarEncontro(e.id, "atividades", e.atividades.map((x) => (x.id === a.id ? { ...x, texto: ev.target.value } : x)))}
                    />
                    <button
                      onClick={() => mudarEncontro(e.id, "atividades", e.atividades.filter((x) => x.id !== a.id))}
                      className="text-xs px-1"
                      style={{ color: "var(--linha-forte)" }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {(e.atividades || []).filter((a) => a.tipo === "fca").map((a) => (
                  <div key={`fca-${a.id}`} className="ml-5 mb-1 grid gap-1 p-2 rounded" style={{ background: CORES.cartao, border: "1px solid var(--linha)" }}>
                    <input className="px-2 py-0.5 text-xs rounded border bg-creme" style={{ borderColor: "var(--linha)", color: "var(--tinta)" }} placeholder="Fato: o que aconteceu" value={a.fato || ""} onChange={(ev) => mudarEncontro(e.id, "atividades", e.atividades.map((x) => (x.id === a.id ? { ...x, fato: ev.target.value } : x)))} />
                    <input className="px-2 py-0.5 text-xs rounded border bg-creme" style={{ borderColor: "var(--linha)", color: "var(--tinta)" }} placeholder="Causa: por que aconteceu" value={a.causa || ""} onChange={(ev) => mudarEncontro(e.id, "atividades", e.atividades.map((x) => (x.id === a.id ? { ...x, causa: ev.target.value } : x)))} />
                    <input className="px-2 py-0.5 text-xs rounded border bg-creme" style={{ borderColor: "var(--linha)", color: "var(--tinta)" }} placeholder="Ação: o que farei diferente" value={a.acaoFca || ""} onChange={(ev) => mudarEncontro(e.id, "atividades", e.atividades.map((x) => (x.id === a.id ? { ...x, acaoFca: ev.target.value } : x)))} />
                  </div>
                ))}
              </div>
            )}
            <span className="flex gap-3 mb-2">
              <button
                onClick={() => mudarEncontro(e.id, "atividades", [...(e.atividades || []), { id: uid(), texto: "", feita: false }])}
                className="text-xs"
                style={{ color: CORES.dourado }}
              >
                + Atividade pra casa
              </button>
              <button
                onClick={() => mudarEncontro(e.id, "atividades", [...(e.atividades || []), { id: uid(), tipo: "fca", texto: "FCA da semana: analisar uma situação difícil (Fato → Causa → Ação)", fato: "", causa: "", acaoFca: "", feita: false }])}
                className="text-xs"
                style={{ color: "var(--alerta)" }}
                title="O mentorado analisa uma situação difícil da semana no formato Fato → Causa → Ação"
              >
                + FCA pra casa
              </button>
            </span>
            <textarea rows={2} className="w-full px-2 py-1 text-sm rounded border bg-creme outline-none mb-1" style={{ borderColor: "var(--fundo-recuo)", color: CORES.fogoEscuro }} placeholder="Anotações da sessão..." value={e.anotacoes} onChange={(ev) => mudarEncontro(e.id, "anotacoes", ev.target.value)} />
            {e.anotacoes && (
              <div className="flex items-center gap-3 flex-wrap">
                <button onClick={() => onEstruturarSessao(e)} className="enz-link" style={{ textTransform: "none", letterSpacing: 0, fontSize: 12 }} style={{ color: CORES.dourado }} disabled={gerando}>
                  Estruturar com IA (resumo + ações)
                </button>
              </div>
            )}
            {e.acoes && (
              <div className="text-xs mt-1 p-2 rounded" style={{ background: "var(--fundo-elevado)", color: "var(--tinta)" }}>
                <strong>Ações combinadas:</strong> {e.acoes.split("\n").join(" · ")}
              </div>
            )}
          </div>
        ))}

        {!gerando && (
          <button onClick={() => onMudar({ ...mentoria, encontros: [...encontros, { id: uid(), tema: "Novo encontro", objetivo: "", provocacao: "", data: "", anotacoes: "", acoes: "", realizada: false }] })} className="text-sm" style={{ color: CORES.dourado }}>
            + Adicionar encontro
          </button>
        )}
      </div>
    </div>
  );
}
