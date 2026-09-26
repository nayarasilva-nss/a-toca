import { useState } from "react";
import { AvisoErro, BotaoPrimario, ConfirmarAcao, Trabalhando } from "../componentes/ui.jsx";
import { CORES, STATUS_FRENTE, uid } from "../nucleo/base.jsx";
import { HeaderModulo } from "../telas/hub.jsx";

// ─── Módulo: Gestão do Engajamento ──────────────────────────────

export function CartaoFrente({ frente, onMudar, onRemover }) {
  const st = STATUS_FRENTE[frente.status];
  const feitas = frente.acoes.filter((a) => a.feita).length;
  const [abertas, setAbertas] = useState(() => new Set());

  const alternar = (id) => {
    setAbertas((prev) => {
      const novo = new Set(prev);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  };

  const mudarAcao = (id, campo, valor) =>
    onMudar({ ...frente, acoes: frente.acoes.map((x) => (x.id === id ? { ...x, [campo]: valor } : x)) });

  const mudarEtapas = (acaoId, novasEtapas) => mudarAcao(acaoId, "etapas", novasEtapas);

  return (
    <div className="rounded-lg p-4 mb-3" style={{ background: CORES.cartao, border: "2px solid #E97F3855" }}>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <input
          className="font-serif text-base flex-1 min-w-40 bg-transparent outline-none"
          style={{ color: CORES.fogo }}
          value={frente.nome}
          onChange={(e) => onMudar({ ...frente, nome: e.target.value })}
        />
        <select
          className="px-2 py-1 text-xs rounded border font-semibold"
          style={{ borderColor: st.cor, background: st.fundo, color: st.cor }}
          value={frente.status}
          onChange={(e) => onMudar({ ...frente, status: e.target.value })}
        >
          {Object.entries(STATUS_FRENTE).map(([chave, info]) => (
            <option key={chave} value={chave}>{info.rotulo}</option>
          ))}
        </select>
        <button onClick={onRemover} className="px-1 text-xs" style={{ color: "var(--ouro-texto)" }} title="Remover frente">✕</button>
      </div>
      <input
        className="w-full text-sm mb-3 px-2 py-1 rounded border bg-creme"
        style={{ borderColor: "var(--fundo-recuo)", color: "var(--tinta)" }}
        placeholder="Escopo da frente..."
        value={frente.escopo}
        onChange={(e) => onMudar({ ...frente, escopo: e.target.value })}
      />
      {frente.acoes.map((a) => {
        const etapas = a.etapas || [];
        const etapasFeitas = etapas.filter((e) => e.feita).length;
        const aberta = abertas.has(a.id);
        const temDetalhe = a.responsavel || a.obs || etapas.length > 0;
        return (
          <div key={a.id} className="py-1 border-b" style={{ borderColor: "var(--fundo-elevado)" }}>
            <div className="flex items-start gap-2">
              <button
                onClick={() => alternar(a.id)}
                className="mt-0.5 text-xs w-4 shrink-0"
                style={{ color: temDetalhe ? CORES.dourado : "var(--linha-forte)" }}
                title="Etapas, responsável e observações"
              >
                {aberta ? "▾" : "▸"}
              </button>
              <input
                type="checkbox"
                className="mt-1"
                checked={a.feita}
                onChange={() => mudarAcao(a.id, "feita", !a.feita)}
              />
              <div className="flex-1 min-w-0">
                <input
                  className="w-full text-sm bg-transparent outline-none"
                  style={{ color: a.feita ? "var(--tinta-musgo)" : CORES.fogoEscuro, textDecoration: a.feita ? "line-through" : "none" }}
                  value={a.texto}
                  onChange={(e) => mudarAcao(a.id, "texto", e.target.value)}
                />
                {!aberta && temDetalhe && (
                  <div className="flex gap-2 flex-wrap text-xs mt-0.5" style={{ color: "var(--tinta-musgo)" }}>
                    {a.responsavel && <span style={{ color: CORES.dourado }}>@{a.responsavel}</span>}
                    {etapas.length > 0 && <span>{etapasFeitas}/{etapas.length} etapas</span>}
                    {a.obs && <span title={a.obs}>obs</span>}
                  </div>
                )}
              </div>
              <input
                className="w-14 px-1 py-0.5 text-xs rounded border bg-creme text-center"
                style={{ borderColor: "var(--linha)", color: "var(--tinta)" }}
                placeholder="sem."
                title="Semana do cronograma"
                value={a.semana || ""}
                onChange={(e) => mudarAcao(a.id, "semana", e.target.value === "" ? null : Number(e.target.value))}
              />
              <button
                onClick={() => onMudar({ ...frente, acoes: frente.acoes.filter((x) => x.id !== a.id) })}
                className="text-xs px-1"
                style={{ color: "var(--linha-forte)" }}
              >
                ✕
              </button>
            </div>

            {aberta && (
              <div className="ml-10 mt-1 mb-2 p-3 rounded" style={{ background: "var(--fundo-elevado)", border: "1px solid var(--fundo-recuo)" }}>
                <div className="grid sm:grid-cols-2 gap-2 mb-2">
                  <input
                    className="px-2 py-1 text-xs rounded border bg-creme"
                    style={{ borderColor: "var(--linha)", color: "var(--tinta)" }}
                    placeholder="Responsável (ex.: Nay, gerente, dono)"
                    value={a.responsavel || ""}
                    onChange={(e) => mudarAcao(a.id, "responsavel", e.target.value)}
                  />
                  <input
                    className="px-2 py-1 text-xs rounded border bg-creme"
                    style={{ borderColor: "var(--linha)", color: "var(--tinta)" }}
                    placeholder="Observações..."
                    value={a.obs || ""}
                    onChange={(e) => mudarAcao(a.id, "obs", e.target.value)}
                  />
                  <input
                    className="px-2 py-1 text-xs rounded border bg-creme"
                    style={{ borderColor: "var(--linha)", color: "var(--tinta)" }}
                    placeholder="Por quê (justificativa da ação)"
                    title="O porquê fecha o 5W2H — sai em itálico no PDF do plano"
                    value={a.porque || ""}
                    onChange={(e) => mudarAcao(a.id, "porque", e.target.value)}
                  />
                  <input
                    className="px-2 py-1 text-xs rounded border bg-creme"
                    style={{ borderColor: "var(--linha)", color: "var(--tinta)" }}
                    placeholder="Custo estimado (opcional)"
                    value={a.custo || ""}
                    onChange={(e) => mudarAcao(a.id, "custo", e.target.value)}
                  />
                </div>
                {etapas.map((et) => (
                  <div key={et.id} className="flex items-center gap-2 py-0.5">
                    <input
                      type="checkbox"
                      checked={!!et.feita}
                      onChange={() =>
                        mudarEtapas(a.id, etapas.map((x) => (x.id === et.id ? { ...x, feita: !x.feita } : x)))
                      }
                    />
                    <input
                      className="flex-1 text-xs bg-transparent outline-none"
                      style={{ color: et.feita ? "var(--tinta-musgo)" : CORES.fogoEscuro, textDecoration: et.feita ? "line-through" : "none" }}
                      placeholder="Etapa..."
                      value={et.texto}
                      onChange={(e) =>
                        mudarEtapas(a.id, etapas.map((x) => (x.id === et.id ? { ...x, texto: e.target.value } : x)))
                      }
                    />
                    <button
                      onClick={() => mudarEtapas(a.id, etapas.filter((x) => x.id !== et.id))}
                      className="text-xs px-1"
                      style={{ color: "var(--linha-forte)" }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => mudarEtapas(a.id, [...etapas, { id: uid(), texto: "", feita: false }])}
                  className="text-xs mt-1"
                  style={{ color: CORES.dourado }}
                >
                  + Etapa
                </button>
              </div>
            )}
          </div>
        );
      })}
      <div className="flex items-center justify-between mt-2">
        <button
          onClick={() => onMudar({ ...frente, acoes: [...frente.acoes, { id: uid(), texto: "", feita: false }] })}
          className="text-xs"
          style={{ color: CORES.dourado }}
        >
          + Ação
        </button>
        <span className="text-xs" style={{ color: "var(--tinta-musgo)" }}>
          {feitas}/{frente.acoes.length} concluídas
        </span>
      </div>
    </div>
  );
}

export function ModuloGestao({ cliente, gestao, atas, gerando, erro, onMudar, onGerarPlano, onAtualizarPlano, onAbrirAta, onNovaAta, onVoltar }) {
  const frentes = gestao.frentes || [];
  return (
    <div className="pb-16">
      <HeaderModulo
        titulo="Plano de Ação"
        cliente={cliente}
        onVoltar={onVoltar}
        acoes={
          frentes.length === 0 ? (
            <BotaoPrimario onClick={onGerarPlano} disabled={gerando || !(gestao.briefing || "").trim()}>
              {gerando ? "Gerando..." : "Gerar plano com IA"}
            </BotaoPrimario>
          ) : (
            <BotaoPrimario onClick={onAtualizarPlano} disabled={gerando}>
              {gerando ? "Atualizando..." : "Atualizar plano"}
            </BotaoPrimario>
          )
        }
      />

      <div style={{ maxWidth: "1000px", margin: "0 auto", paddingLeft: "32px", paddingRight: "32px" }}>
        <div style={{ background: CORES.cartao, borderRadius: "4px", marginBottom: "32px", boxShadow: "none" }}>
        <div style={{ padding: "32px", borderBottom: "1px solid rgba(74,64,53, 0.08)", background: "linear-gradient(180deg, rgba(217, 145, 79, 0.08) 0%, rgba(245, 237, 217, 0.4) 100%)" }}>
          <div style={{ fontSize: "18px", fontWeight: "600", color: CORES.principal, marginBottom: "4px" }}>Briefing</div>
          <div style={{ fontSize: "12px", color: "var(--tinta-musgo)" }}>Registre o que saiu da reunião para que a IA gere o plano</div>
        </div>
        <div style={{ padding: "28px" }}>
          <p style={{ fontSize: "11px", marginBottom: "16px", color: CORES.textoDim, fontFamily: "var(--font-body)" }}>
            Anote aqui o que saiu da reunião — necessidades, dores, o que existe e o que falta em cada área. A IA transforma isso em frentes e plano de ação. Se o contratante já estiver mapeado em Temperamentos, o plano se molda ao temperamento dele — sem nunca mencioná-lo.
          </p>
          <textarea
            rows={7}
            placeholder="Ex.: Reunião com Driely em 18/07. Frente de pessoas: nada estruturado, começar do zero. Processos operacionais: existe uma leve estrutura, precisa ser formalizada e direcionada..."
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid var(--linha-forte)",
              borderRadius: "4px",
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              background: CORES.cartao,
              color: "var(--tinta)",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.2s"
            }}
            value={gestao.briefing || ""}
            onChange={(e) => onMudar({ ...gestao, briefing: e.target.value })}
            onFocus={(e) => { e.target.style.borderColor = CORES.dourado; e.target.style.boxShadow = "0 0 0 2px rgba(212, 175, 55, 0.1)"; }}
            onBlur={(e) => { e.target.style.borderColor = CORES.laranja; e.target.style.boxShadow = "none"; }}
          />
          <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            {frentes.length === 0 ? (
              <BotaoPrimario onClick={onGerarPlano} disabled={gerando || !(gestao.briefing || "").trim()}>
                {gerando ? "Gerando..." : "Gerar plano de ação com IA"}
              </BotaoPrimario>
            ) : (
              <>
                <BotaoPrimario onClick={onAtualizarPlano} disabled={gerando}>
                  {gerando ? "Atualizando..." : "Atualizar plano com IA"}
                </BotaoPrimario>
                <span style={{ fontSize: "11px", color: "var(--tinta-musgo)", fontFamily: "var(--font-body)" }}>
                  Lê o briefing e a última ata; preserva frentes, status e ações feitas — só acrescenta e ajusta.
                </span>
                <ConfirmarAcao label="Recomeçar do zero" aviso="apaga frentes, status e ações marcadas" onConfirmar={onGerarPlano} />
              </>
            )}
          </div>
          <AvisoErro erro={erro} />
          {gerando && <Trabalhando />}
        </div>
      </div>

      {!gerando && (
        <div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "16px" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 500, color: CORES.principal }}>Frentes de trabalho</h3>
            <button
              onClick={() =>
                onMudar({
                  ...gestao,
                  frentes: [...frentes, { id: uid(), nome: "Nova frente", status: "nao_iniciada", escopo: "", acoes: [] }],
                })
              }
              style={{ fontSize: "13px", color: CORES.dourado, background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: "600" }}
            >
              + Frente manual
            </button>
          </div>
          {frentes.length === 0 ? (
            <p style={{ fontSize: "13px", paddingTop: "16px", paddingBottom: "16px", color: CORES.textoDim, fontFamily: "var(--font-body)" }}>
              Nenhuma frente ainda. Preencha o briefing e gere o plano — ou adicione frentes manualmente.
            </p>
          ) : (
            frentes.map((f) => (
              <CartaoFrente
                key={f.id}
                frente={f}
                onMudar={(nova) => onMudar({ ...gestao, frentes: frentes.map((x) => (x.id === nova.id ? nova : x)) })}
                onRemover={() => onMudar({ ...gestao, frentes: frentes.filter((x) => x.id !== f.id) })}
              />
            ))
          )}

          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: "32px", marginBottom: "16px" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 500, color: CORES.principal }}>Atas de reunião</h3>
            <button onClick={onNovaAta} style={{ fontSize: "13px", color: CORES.dourado, background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: "600" }}>
              + Nova ata
            </button>
          </div>
          {atas.length === 0 ? (
            <p style={{ fontSize: "13px", paddingTop: "8px", paddingBottom: "8px", color: CORES.textoDim, fontFamily: "var(--font-body)" }}>
              Nenhuma ata ainda. Registre cada reunião de acompanhamento aqui — despeje as anotações e a IA estrutura em resumo, decisões e ações.
            </p>
          ) : (
            <div style={{ display: "grid", gap: "8px" }}>
              {atas.map((a) => (
                <button
                  key={a.id}
                  onClick={() => onAbrirAta(a.id)}
                  style={{ textAlign: "left", padding: "16px 20px", borderRadius: "4px", boxShadow: "none", display: "flex", alignItems: "baseline", justifyContent: "space-between", background: CORES.cartao, border: "1px solid var(--linha-forte)", cursor: "pointer", transition: "all 0.3s ease" }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 16px rgba(107,93,66, 0.2)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(107,93,66, 0.1)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: "600", color: CORES.principal }}>{a.nome || "(sem título)"}</span>
                  <span style={{ fontSize: "11px", color: CORES.textoDim, fontFamily: "var(--font-body)" }}>{a.data || (a.resumo ? "" : "rascunho vazio")}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
