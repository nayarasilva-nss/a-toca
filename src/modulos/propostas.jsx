import { AvisoErro, BotaoContorno, BotaoPrimario, InputField, Trabalhando } from "../componentes/ui.jsx";
import { formatarBR, parseValorBR } from "../ia/financeiro.jsx";
import { emLinhasDoc } from "./documentos.jsx";
import { RodapeImpressao } from "./tabela.jsx";
import { CORES, uid } from "../nucleo/base.jsx";

// ─── Módulo: Proposta Comercial ─────────────────────────────────

export const STATUS_PROPOSTA = {
  rascunho: { rotulo: "Rascunho", cor: CORES.textoDim, fundo: CORES.hover },
  enviada: { rotulo: "Enviada", cor: "#9A6A2F", fundo: "#F5E6C8" },
  aceita: { rotulo: "Aceita ✓", cor: "#4F6B3A", fundo: "#E3EBD8" },
  recusada: { rotulo: "Recusada", cor: "#8A3A2E", fundo: "#F0DCD2" },
};

export function propostaVazia() {
  return {
    id: uid(),
    data: new Date().toLocaleDateString("pt-BR"),
    status: "rascunho",
    rotulo: "",
    duracao: "",
    investimento: "",
    condicoesPagamento: "",
    validade: "",
    obs: "",
    apresentacao: "",
    objetivo: "",
    fases: "",
    entregaveis: "",
    metodologia: "",
    condicoesGerais: "",
  };
}

export const CAMPOS_PROPOSTA_PARAMS = [
  ["rotulo", "Rótulo interno (opcional)", false, 1, "Ex.: Proposta v1"],
  ["duracao", "Duração prevista", false, 1, "Ex.: 10 semanas"],
  ["investimento", "Investimento", false, 1, "Ex.: R$ 9.000,00"],
  ["condicoesPagamento", "Condições de pagamento", false, 1, "Ex.: entrada + 2 parcelas mensais"],
  ["validade", "Validade da proposta", false, 1, "Ex.: 15 dias"],
  ["obs", "Observações para a IA (opcional)", true, 2, "Ex.: enfatizar a frente de pessoas; cliente sensível a preço"],
];

export const CAMPOS_PROPOSTA_GERADOS = [
  ["apresentacao", "Apresentação", 3],
  ["objetivo", "Objetivo", 2],
  ["fases", "Fases (uma por linha)", 4],
  ["entregaveis", "Entregáveis (um por linha)", 6],
  ["metodologia", "Metodologia", 3],
  ["condicoesGerais", "Condições gerais", 3],
];

export function ListaPropostas({ cliente, propostas, onAbrir, onNova, onVoltar }) {
  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: CORES.douradoEscuro, letterSpacing: 1, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "'Lora', serif" }}>
        ← {cliente.negocio}
      </button>
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="font-serif text-xl" style={{ color: CORES.fogo }}>Propostas Comerciais</h2>
        <BotaoPrimario onClick={onNova}>+ Nova proposta</BotaoPrimario>
      </div>
      <p className="text-xs mb-5" style={{ color: CORES.textoDim }}>
        A proposta é o convite que muda tudo. Nasce do briefing e do diagnóstico — e o tom se ajusta ao temperamento do contratante, se mapeado.
      </p>
      {propostas.length === 0 ? (
        <div className="text-center py-16 rounded-lg" style={{ background: CORES.papel, border: "1px dashed #7BA85C" }}>
          <p className="text-sm" style={{ color: CORES.textoDim }}>
            Nenhuma proposta ainda. Preencha os parâmetros (duração, investimento, condições) e gere — o texto vem pronto para sua revisão.
          </p>
        </div>
      ) : (
        <div className="grid gap-2">
          {propostas.map((p) => (
            <button
              key={p.id}
              onClick={() => onAbrir(p.id)}
              className="objeto text-left px-5 py-3 rounded-lg shadow-sm flex items-baseline justify-between"
              className="card"
            >
              <span className="font-serif" style={{ color: CORES.fogo }}>
                {p.rotulo || `Proposta de ${p.data}`}
              </span>
              <span className="text-xs flex items-center gap-2" style={{ color: CORES.textoDim }}>
                {p.data}{p.investimento ? ` · ${p.investimento}` : ""}
                <span
                  className="px-1.5 py-0.5 rounded font-semibold"
                  style={{
                    background: (STATUS_PROPOSTA[p.status] || STATUS_PROPOSTA.rascunho).fundo,
                    color: (STATUS_PROPOSTA[p.status] || STATUS_PROPOSTA.rascunho).cor,
                  }}
                >
                  {(STATUS_PROPOSTA[p.status] || STATUS_PROPOSTA.rascunho).rotulo}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function EditorProposta({ cliente, prop, gerando, erro, frentes, semanasPadrao, numEncontros, precificacao, onMudarPrecificacao, onMudar, onGerar, onGerarMetas, onImprimir, onExcluir, onVoltar }) {
  const ehPessoaProp = cliente.tipo === "pessoa";
  const set = (campo) => (v) => onMudar({ ...prop, [campo]: v });
  const numFrentes = (frentes || []).length;
  const semanasDaProposta = (() => {
    const m = String(prop.duracao || "").match(/\d+/);
    if (m) return Number(m[0]);
    return Number(semanasPadrao) || 0;
  })();
  const vBase = parseValorBR(precificacao.base);
  const vFrente = parseValorBR(precificacao.porFrente);
  const vSemana = parseValorBR(precificacao.porSemana);
  const vEncontro = parseValorBR(precificacao.porEncontro);
  const totalCalculado = ehPessoaProp
    ? (numEncontros || 0) * vEncontro
    : vBase + numFrentes * vFrente + semanasDaProposta * vSemana;
  const totalArredondado = totalCalculado > 0 ? Math.ceil(totalCalculado / 100) * 100 : 0;
  const podeCalcular = ehPessoaProp
    ? totalArredondado > 0 && (numEncontros || 0) > 0
    : totalArredondado > 0 && (numFrentes > 0 || semanasDaProposta > 0 || vBase > 0);
  const setP = (campo) => (e) => onMudarPrecificacao({ ...precificacao, [campo]: e.target.value });
  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: CORES.douradoEscuro, letterSpacing: 1, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "'Lora', serif" }}>
        ← Propostas · {cliente.negocio}
      </button>
      <div className="rounded-lg p-6 shadow-sm card">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h2 className="font-serif text-lg" style={{ color: CORES.fogo }}>
            {prop.rotulo || `Proposta de ${prop.data}`}
          </h2>
          <div className="flex gap-2 items-center">
            <select
              className="px-2 py-1 text-xs rounded border font-semibold"
              style={{
                borderColor: (STATUS_PROPOSTA[prop.status] || STATUS_PROPOSTA.rascunho).cor,
                background: (STATUS_PROPOSTA[prop.status] || STATUS_PROPOSTA.rascunho).fundo,
                color: (STATUS_PROPOSTA[prop.status] || STATUS_PROPOSTA.rascunho).cor,
              }}
              value={prop.status || "rascunho"}
              onChange={(e) => onMudar({ ...prop, status: e.target.value })}
              title="Status da proposta — 'Aceita' avança o Relógio para Em andamento"
            >
              {Object.entries(STATUS_PROPOSTA).map(([chave, s]) => (
                <option key={chave} value={chave}>{s.rotulo}</option>
              ))}
            </select>
            <BotaoPrimario onClick={onGerar} disabled={gerando}>
              {gerando ? "Gerando..." : prop.apresentacao ? "Gerar texto novamente" : "Gerar texto com IA"}
            </BotaoPrimario>
            {prop.apresentacao && <BotaoContorno onClick={onImprimir}>Exportar PDF</BotaoContorno>}
          </div>
        </div>

        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && (
          <>
            <div className="mb-4 rounded-lg p-4" style={{ background: CORES.cartao, border: "1px dashed #E97F3855" }}>
              <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: CORES.dourado }}>
                Precificação automática
              </div>
              <p className="text-xs mb-3" style={{ color: CORES.textoDim }}>
                Seus parâmetros (valem para todas as propostas, de todos os clientes) aplicados às frentes deste briefing. A IA nunca decide preço — a conta é sua, o app só faz a matemática.
              </p>
              {ehPessoaProp ? (
                <div className="grid sm:grid-cols-3 gap-2 mb-2">
                  <div>
                    <div className="text-xs mb-0.5" style={{ color: "#6B5D42" }}>Valor por encontro de mentoria</div>
                    <input className="w-full px-2 py-1 text-sm rounded border bg-creme" style={{ borderColor: "#E0D5BC" }} placeholder="Ex.: 400" value={precificacao.porEncontro || ""} onChange={setP("porEncontro")} />
                  </div>
                </div>
              ) : (
              <div className="grid sm:grid-cols-3 gap-2 mb-2">
                <div>
                  <div className="text-xs mb-0.5" style={{ color: "#6B5D42" }}>Valor base do engajamento</div>
                  <input className="w-full px-2 py-1 text-sm rounded border bg-creme" style={{ borderColor: "#E0D5BC" }} placeholder="Ex.: 2.000" value={precificacao.base} onChange={setP("base")} />
                </div>
                <div>
                  <div className="text-xs mb-0.5" style={{ color: "#6B5D42" }}>Valor por frente</div>
                  <input className="w-full px-2 py-1 text-sm rounded border bg-creme" style={{ borderColor: "#E0D5BC" }} placeholder="Ex.: 1.500" value={precificacao.porFrente} onChange={setP("porFrente")} />
                </div>
                <div>
                  <div className="text-xs mb-0.5" style={{ color: "#6B5D42" }}>Valor por semana de condução</div>
                  <input className="w-full px-2 py-1 text-sm rounded border bg-creme" style={{ borderColor: "#E0D5BC" }} placeholder="Ex.: 300" value={precificacao.porSemana} onChange={setP("porSemana")} />
                </div>
              </div>
              )}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs" style={{ color: "#6B5D42" }}>
                  {ehPessoaProp
                    ? <>Jornada: <strong>{numEncontros || 0}</strong> encontro{(numEncontros || 0) === 1 ? "" : "s"} desenhado{(numEncontros || 0) === 1 ? "" : "s"}</>
                    : <>Este cliente: <strong>{numFrentes}</strong> frente{numFrentes === 1 ? "" : "s"} identificada{numFrentes === 1 ? "" : "s"}{" · "}<strong>{semanasDaProposta || "?"}</strong> semana{semanasDaProposta === 1 ? "" : "s"}</>}
                </span>
                {podeCalcular ? (
                  <BotaoContorno
                    onClick={() =>
                      onMudar({
                        ...prop,
                        investimento: formatarBR(totalArredondado),
                        memoriaCalculo: ehPessoaProp
                          ? `${numEncontros} encontro(s) × ${formatarBR(vEncontro)} = ${formatarBR(totalCalculado)}${totalArredondado !== totalCalculado ? ` (arredondado: ${formatarBR(totalArredondado)})` : ""}`
                          : `${formatarBR(vBase)} base + ${numFrentes} frente(s) × ${formatarBR(vFrente)} + ${semanasDaProposta} semana(s) × ${formatarBR(vSemana)} = ${formatarBR(totalCalculado)}${totalArredondado !== totalCalculado ? ` (arredondado: ${formatarBR(totalArredondado)})` : ""}`,
                      })
                    }
                  >
                    Calcular investimento: {formatarBR(totalArredondado)}
                  </BotaoContorno>
                ) : (
                  <span className="text-xs italic" style={{ color: "#A89878" }}>
                    {ehPessoaProp ? "Desenhe a jornada na Mentoria e preencha o valor por encontro." : `${numFrentes === 0 ? "Gere as frentes no Briefing & Plano para calcular por demanda. " : ""}Preencha seus parâmetros e a duração.`}
                  </span>
                )}
              </div>
              {prop.memoriaCalculo && (
                <div className="text-xs mt-2 pt-2 border-t" style={{ color: "#A89878", borderColor: "#EFE8D6" }}>
                  Memória de cálculo (interna, não sai no PDF): {prop.memoriaCalculo}
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-x-4">
              {(
                <div className="mb-4 p-3 rounded-lg" style={{ background: CORES.hover, border: "2px solid #D4AF37AA" }}>
                  <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                    <div className="label" style={{ color: "#9A6A2F" }}>
                      {ehPessoaProp ? "Metas do mentorado (fase Acordo)" : "Metas do engajamento (fase Acordo)"}
                    </div>
                    <button onClick={onGerarMetas} className="text-xs underline" style={{ color: CORES.dourado }} disabled={gerando}>
                      Sugerir metas com IA
                    </button>
                  </div>
                  <p className="text-xs mb-2" style={{ color: CORES.textoDim }}>
                    {ehPessoaProp
                      ? "2-3 metas com objetivo + valor + prazo (ex.: delegar as decisões de compra até outubro). Verificadas no Relatório de Evolução."
                      : "2-3 metas pactuadas com objetivo + valor + prazo. Verificadas no Malfeito feito: batida, parcial ou não batida."}
                  </p>
                  {(prop.metas || []).map((m) => (
                    <div key={m.id} className="flex items-center gap-2 py-1">
                      <input
                        className="flex-1 px-2 py-1 text-sm rounded border bg-creme"
                        style={{ borderColor: "#E0D5BC", color: CORES.fogoEscuro }}
                        placeholder={ehPessoaProp ? "Objetivo verificável (ex.: delegar as decisões de compra)" : "Objetivo com valor (ex.: reduzir pendências de CCT de 12 para 0)"}
                        value={m.objetivo}
                        onChange={(e) => onMudar({ ...prop, metas: prop.metas.map((x) => (x.id === m.id ? { ...x, objetivo: e.target.value } : x)) })}
                      />
                      <input
                        className="w-36 px-2 py-1 text-xs rounded border bg-creme"
                        style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                        placeholder="Prazo"
                        value={m.prazo}
                        onChange={(e) => onMudar({ ...prop, metas: prop.metas.map((x) => (x.id === m.id ? { ...x, prazo: e.target.value } : x)) })}
                      />
                      <button onClick={() => onMudar({ ...prop, metas: prop.metas.filter((x) => x.id !== m.id) })} className="text-xs px-1" style={{ color: "#C0B091" }}>✕</button>
                    </div>
                  ))}
                  <button
                    onClick={() => onMudar({ ...prop, metas: [...(prop.metas || []), { id: uid(), objetivo: "", prazo: "" }] })}
                    className="text-xs mt-1"
                    style={{ color: CORES.dourado }}
                  >
                    + Meta
                  </button>
                </div>
              )}
              {CAMPOS_PROPOSTA_PARAMS.slice(0, 5).map(([campo, rotulo, area, linhas, placeholder]) => (
                area ? (
                  <label key={campo} className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>{rotulo}</span><textarea rows={linhas} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} placeholder={placeholder} value={prop[campo] || ""} onChange={(e) => set(campo)(e.target.value)} /></label>
                ) : (
                  <InputField key={campo} label={rotulo} value={prop[campo] || ""} onChange={set(campo)} placeholder={placeholder} />
                )
              ))}
            </div>
            {CAMPOS_PROPOSTA_PARAMS.slice(5).map(([campo, rotulo, area, linhas, placeholder]) => (
              area ? (
                <label key={campo} className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>{rotulo}</span><textarea rows={linhas} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} placeholder={placeholder} value={prop[campo] || ""} onChange={(e) => set(campo)(e.target.value)} /></label>
              ) : (
                <InputField key={campo} label={rotulo} value={prop[campo] || ""} onChange={set(campo)} placeholder={placeholder} />
              )
            ))}
            {CAMPOS_PROPOSTA_GERADOS.map(([campo, rotulo, linhas]) => (
              <label key={campo} className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>{rotulo}</span><textarea rows={linhas} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} value={prop[campo] || ""} onChange={(e) => set(campo)(e.target.value)} /></label>
            ))}
            <button onClick={onExcluir} className="text-xs underline" style={{ color: "#8A3A2E" }}>
              Excluir proposta
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function ImpressaoProposta({ cliente, prop }) {
  if (!prop || !prop.apresentacao) return null;
  const fases = emLinhasDoc(prop.fases);
  const entregaveis = emLinhasDoc(prop.entregaveis);
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "#2A1218" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="text-xs uppercase tracking-widest" style={{ color: CORES.dourado }}>Proposta de Consultoria em Governança</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{cliente.negocio}</div>
        <div className="text-sm mt-1" style={{ color: "#6B5D42" }}>{prop.data}{prop.validade ? ` · Válida por ${prop.validade}` : ""}</div>
      </div>

      <div className="mb-5">
        <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Apresentação</div>
        <p className="text-sm whitespace-pre-line">{prop.apresentacao}</p>
      </div>

      {prop.objetivo && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Objetivo</div>
          <p className="text-sm">{prop.objetivo}</p>
        </div>
      )}

      {fases.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Fases do trabalho</div>
          <div className="overflow-x-auto"><table className="w-full text-sm border-collapse">
            <tbody>
              {fases.map((f, i) => (
                <tr key={i}>
                  <td className="border px-3 py-2" style={{ borderColor: CORES.laranja }}>{f}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}

      {entregaveis.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Entregáveis</div>
          <ul className="text-sm list-disc pl-5">
            {entregaveis.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      {prop.metodologia && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Metodologia</div>
          {(prop.metas || []).filter((m) => m.objetivo).length > 0 && (
            <div className="mb-4 mt-3 p-3" style={{ border: "1px solid #7BA85C" }}>
              <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Metas pactuadas</div>
              <ul className="text-sm list-disc pl-5">
                {(prop.metas || []).filter((m) => m.objetivo).map((m) => (
                  <li key={m.id} className="mb-0.5">{m.objetivo}{m.prazo ? ` — até ${m.prazo}` : ""}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-sm">{prop.metodologia}</p>
        </div>
      )}

      {(prop.investimento || prop.condicoesPagamento || prop.duracao) && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Investimento</div>
          <div className="overflow-x-auto"><table className="w-full text-sm border-collapse">
            <tbody>
              {prop.duracao && (
                <tr>
                  <td className="border px-3 py-1 font-semibold w-48" style={{ borderColor: CORES.laranja, color: CORES.fogo }}>Duração prevista</td>
                  <td className="border px-3 py-1" style={{ borderColor: CORES.laranja }}>{prop.duracao}</td>
                </tr>
              )}
              {prop.investimento && (
                <tr>
                  <td className="border px-3 py-1 font-semibold" style={{ borderColor: CORES.laranja, color: CORES.fogo }}>Investimento</td>
                  <td className="border px-3 py-1 font-semibold" style={{ borderColor: CORES.laranja }}>{prop.investimento}</td>
                </tr>
              )}
              {prop.condicoesPagamento && (
                <tr>
                  <td className="border px-3 py-1 font-semibold" style={{ borderColor: CORES.laranja, color: CORES.fogo }}>Condições de pagamento</td>
                  <td className="border px-3 py-1" style={{ borderColor: CORES.laranja }}>{prop.condicoesPagamento}</td>
                </tr>
              )}
            </tbody>
          </table></div>
        </div>
      )}

      {prop.condicoesGerais && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Condições gerais</div>
          <p className="text-sm">{prop.condicoesGerais}</p>
        </div>
      )}

      <div className="mt-10 pt-6 text-sm" style={{ color: "#2A1218" }}>
        <div className="flex gap-16">
          <div className="flex-1 border-t pt-1 text-center" style={{ borderColor: "#2A1218" }}>Nayara Silva · Consultoria de Governança</div>
          <div className="flex-1 border-t pt-1 text-center" style={{ borderColor: "#2A1218" }}>{cliente.negocio}</div>
        </div>
      </div>

      <RodapeImpressao />
    </div>
  );
}
