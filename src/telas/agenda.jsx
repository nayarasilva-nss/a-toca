import { useEffect, useMemo, useState } from "react";
import { Card, TituloSecao } from "../componentes/enraizar.jsx";
import { AvisoErro, BotaoContorno, BotaoPrimario, ConfirmarAcao } from "../componentes/ui.jsx";
import { DIAS_SEMANA, MESES, PRIORIDADES, agruparTarefas, brDe, deISO, eventosDoApp, gradeMes, hojeISO, porDia, rotuloRelativo, tarefaVazia } from "../nucleo/agenda.jsx";
import { stGet, stSet } from "../nucleo/persistencia.jsx";
import { uid } from "../nucleo/base.jsx";

export const URL_APP = "https://enraizar.vercel.app";

async function api(metodo, corpo, query = "") {
  const opcoes = corpo ? { method: metodo, headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) } : { method: metodo };
  const r = await fetch(`/api/pedidos${query}`, opcoes);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
  return j;
}

// ── Tarefa ───────────────────────────────────────────────────────

function LinhaTarefa({ t, clientes, hoje, onMudar, onExcluir, onAbrirCliente }) {
  const [editando, setEditando] = useState(false);
  const cliente = t.clienteId ? clientes.find((c) => c.id === t.clienteId) : null;
  const atrasada = t.data && t.data < hoje && t.status !== "feita";
  const set = (campo) => (v) => onMudar({ ...t, [campo]: v });
  const concluir = () => onMudar({ ...t, status: t.status === "feita" ? "aberta" : "feita", feitoEm: t.status === "feita" ? "" : new Date().toISOString() });
  return (
    <div style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--linha)", opacity: t.status === "feita" ? 0.6 : 1 }}>
      <button type="button" onClick={concluir} aria-label={t.status === "feita" ? "reabrir" : "concluir"} title={t.status === "feita" ? "reabrir" : "concluir"}
        style={{ width: 22, height: 22, marginTop: 2, borderRadius: 999, border: `1.5px solid ${t.status === "feita" ? "var(--sucesso)" : "var(--linha-forte)"}`, background: t.status === "feita" ? "var(--sucesso)" : "transparent", color: "var(--fundo)", display: "grid", placeItems: "center", fontSize: 13, cursor: "pointer" }}>
        {t.status === "feita" ? "✓" : ""}
      </button>
      <div>
        {editando ? (
          <div className="grid gap-2">
            <input className="enz-input" value={t.titulo} onChange={(e) => set("titulo")(e.target.value)} autoFocus />
            <textarea className="enz-input" rows={2} value={t.detalhe || ""} onChange={(e) => set("detalhe")(e.target.value)} placeholder="detalhe (opcional)" />
            <div className="flex gap-2 flex-wrap">
              <input className="enz-input" type="date" style={{ width: 160 }} value={t.data || ""} onChange={(e) => set("data")(e.target.value)} />
              <input className="enz-input" type="time" style={{ width: 110 }} value={t.hora || ""} onChange={(e) => set("hora")(e.target.value)} />
              <select className="enz-input" style={{ width: 130 }} value={t.prioridade || "normal"} onChange={(e) => set("prioridade")(e.target.value)}>
                {Object.entries(PRIORIDADES).map(([k, p]) => <option key={k} value={k}>{p.rotulo}</option>)}
              </select>
              <select className="enz-input" style={{ width: 200 }} value={t.clienteId || ""} onChange={(e) => set("clienteId")(e.target.value)}>
                <option value="">sem cliente</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.negocio}</option>)}
              </select>
              <button className="enz-link" onClick={() => setEditando(false)}>concluir edição</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <button type="button" className="text-left" onClick={() => setEditando(true)} title="editar" style={{ font: "inherit", fontSize: 15.5, lineHeight: 1.4, textDecoration: t.status === "feita" ? "line-through" : "none", cursor: "text" }}>
                {t.prioridade === "urgente" && <span style={{ color: "var(--erro)", marginRight: 6 }}>●</span>}{t.titulo || <span className="enz-nota">sem título</span>}
              </button>
              <ConfirmarAcao rotulo="excluir" aviso="apaga a tarefa" onConfirmar={onExcluir} />
            </div>
            <div className="enz-nota" style={{ marginTop: 2 }}>
              {t.data ? <span style={{ color: atrasada ? "var(--erro)" : undefined }}>{rotuloRelativo(t.data, hoje)}{t.hora ? ` · ${t.hora}` : ""}</span> : "sem data"}
              {cliente && <> · <button className="enz-link" style={{ fontSize: 13 }} onClick={() => onAbrirCliente(cliente.id)}>{cliente.negocio}</button></>}
              {t.solicitante && <> · pedido de {t.solicitante}</>}
            </div>
            {t.detalhe && <div style={{ fontSize: 14, lineHeight: 1.55, marginTop: 4, whiteSpace: "pre-line", color: "var(--tinta-areia)" }}>{t.detalhe}</div>}
          </>
        )}
      </div>
    </div>
  );
}

function Grupo({ titulo, itens, vazio, cor, children }) {
  if (!itens.length && !vazio) return null;
  return (
    <section style={{ marginTop: 28 }}>
      <div className="flex items-baseline gap-3"><span className="enz-rotulo" style={{ color: cor }}>{titulo}</span><span className="enz-nota">{itens.length || ""}</span></div>
      {itens.length ? children : <p className="enz-nota" style={{ padding: "10px 0" }}>{vazio}</p>}
    </section>
  );
}

function NovaTarefa({ clientes, dataInicial = "", onCriar }) {
  const [t, setT] = useState(() => tarefaVazia({ data: dataInicial }));
  useEffect(() => { setT((x) => ({ ...x, data: dataInicial })); }, [dataInicial]);
  const set = (campo) => (e) => setT({ ...t, [campo]: e.target.value });
  const criar = (e) => { e.preventDefault(); if (!t.titulo.trim()) return; onCriar({ ...t, titulo: t.titulo.trim() }); setT(tarefaVazia({ data: dataInicial })); };
  return (
    <form onSubmit={criar} className="enz-card" style={{ padding: 16 }}>
      <div className="flex gap-2 flex-wrap items-center">
        <input className="enz-input" style={{ flex: "1 1 260px" }} placeholder="o que precisa fazer?" value={t.titulo} onChange={set("titulo")} />
        <input className="enz-input" type="date" style={{ width: 160 }} value={t.data} onChange={set("data")} title="data" />
        <input className="enz-input" type="time" style={{ width: 110 }} value={t.hora} onChange={set("hora")} title="hora" />
        <select className="enz-input" style={{ width: 120 }} value={t.prioridade} onChange={set("prioridade")}>
          {Object.entries(PRIORIDADES).map(([k, p]) => <option key={k} value={k}>{p.rotulo}</option>)}
        </select>
        <select className="enz-input" style={{ width: 180 }} value={t.clienteId} onChange={set("clienteId")}>
          <option value="">sem cliente</option>
          {clientes.map((c) => <option key={c.id} value={c.id}>{c.negocio}</option>)}
        </select>
        <BotaoPrimario type="submit" disabled={!t.titulo.trim()}>Adicionar</BotaoPrimario>
      </div>
    </form>
  );
}

// ── Calendário ───────────────────────────────────────────────────

function Calendario({ tarefas, eventos, hoje, diaSelecionado, onSelecionar }) {
  const [ano, setAno] = useState(() => deISO(hoje).getFullYear());
  const [mes, setMes] = useState(() => deISO(hoje).getMonth());
  const mapa = useMemo(() => porDia(tarefas, eventos), [tarefas, eventos]);
  const semanas = useMemo(() => gradeMes(ano, mes), [ano, mes]);
  const mudar = (n) => { const d = new Date(ano, mes + n, 1); setAno(d.getFullYear()); setMes(d.getMonth()); };
  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
        <button className="enz-link" onClick={() => mudar(-1)}>← mês anterior</button>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 24, textTransform: "capitalize" }}>{MESES[mes]} {ano}</div>
        <button className="enz-link" onClick={() => mudar(1)}>próximo mês →</button>
      </div>
      <div className="grid" style={{ gridTemplateColumns: "repeat(7, 1fr)", borderTop: "1px solid var(--linha)", borderLeft: "1px solid var(--linha)" }}>
        {DIAS_SEMANA.map((d) => <div key={d} className="enz-rotulo" style={{ padding: "8px 6px", borderRight: "1px solid var(--linha)", borderBottom: "1px solid var(--linha)", textAlign: "center" }}>{d}</div>)}
        {semanas.flat().map((d) => {
          const info = mapa.get(d.iso);
          const n = info ? info.tarefas.length + info.eventos.length : 0;
          const urgente = info && info.tarefas.some((t) => t.prioridade === "urgente");
          const sel = d.iso === diaSelecionado;
          return (
            <button key={d.iso} type="button" onClick={() => onSelecionar(d.iso)} style={{ minHeight: 76, padding: 6, textAlign: "left", borderRight: "1px solid var(--linha)", borderBottom: "1px solid var(--linha)", background: sel ? "var(--fundo-destaque)" : d.iso === hoje ? "var(--fundo-recuo)" : "transparent", opacity: d.foraDoMes ? 0.45 : 1, cursor: "pointer", verticalAlign: "top" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: d.iso === hoje ? "var(--ouro)" : "var(--tinta)", fontWeight: d.iso === hoje ? 600 : 400 }}>{d.dia}</div>
              {info && (
                <div style={{ marginTop: 4, display: "grid", gap: 2 }}>
                  {info.tarefas.slice(0, 2).map((t) => <div key={t.id} style={{ fontSize: 11.5, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: t.prioridade === "urgente" ? "var(--erro)" : "var(--tinta)" }}>• {t.titulo}</div>)}
                  {info.eventos.slice(0, 2 - Math.min(2, info.tarefas.length)).map((e) => <div key={e.id} style={{ fontSize: 11.5, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--tinta-salvia)" }}>◦ {e.titulo}</div>)}
                  {n > 2 && <div className="enz-nota" style={{ fontSize: 11 }}>+{n - 2}</div>}
                </div>
              )}
              {urgente && !info.tarefas.slice(0, 2).some((t) => t.prioridade === "urgente") && <span style={{ color: "var(--erro)", fontSize: 10 }}>●</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Pedidos ──────────────────────────────────────────────────────

// um código por vez, mesmo com o efeito rodando duas vezes (StrictMode) ou dois cliques seguidos
let promessaCodigo = null;
function garantirCodigo() {
  if (!promessaCodigo) promessaCodigo = (async () => { const c = uid() + uid(); await stSet("toca:pedidos:codigo", c); return c; })();
  return promessaCodigo;
}

function Pedidos({ onAceitar, onMudouPendentes }) {
  const [pedidos, setPedidos] = useState(null);
  const [erro, setErro] = useState(null);
  const [codigo, setCodigo] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [verHistorico, setVerHistorico] = useState(false);

  const carregar = () => api("GET").then((j) => { setPedidos(j.pedidos); setErro(null); }).catch((e) => setErro(e.message));
  useEffect(() => {
    carregar();
    let vivo = true;
    (async () => {
      let c = await stGet("toca:pedidos:codigo");
      if (typeof c !== "string" || !c) c = await garantirCodigo();
      if (vivo) setCodigo(c);
    })();
    return () => { vivo = false; };
  }, []);
  useEffect(() => { if (pedidos && onMudouPendentes) onMudouPendentes(pedidos.filter((p) => p.status === "pendente").length); }, [pedidos]);

  const gerarCodigo = async () => { promessaCodigo = null; setCodigo(await garantirCodigo()); };
  const link = codigo ? `${URL_APP}/pedir?c=${codigo}` : "";
  const mudar = async (p, campos) => {
    try { const j = await api("PATCH", { id: p.id, ...campos }); setPedidos(pedidos.map((x) => (x.id === p.id ? j.pedido : x))); } catch (e) { setErro(e.message); }
  };
  const aceitar = async (p) => {
    const tarefa = await onAceitar(p);
    await mudar(p, { status: "aceito", tarefaId: tarefa.id });
  };
  const excluir = async (p) => { try { await api("DELETE", null, `?id=${encodeURIComponent(p.id)}`); setPedidos(pedidos.filter((x) => x.id !== p.id)); } catch (e) { setErro(e.message); } };

  const pendentes = (pedidos || []).filter((p) => p.status === "pendente");
  const historico = (pedidos || []).filter((p) => p.status !== "pendente");
  const quando = (p) => (p.criadoEm ? new Date(p.criadoEm).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "");

  return (
    <div>
      <Card rotulo="Seu link de pedidos" titulo="Quem trabalha com você manda por aqui." subtitulo="cada pedido chega nesta caixa e no seu WhatsApp. aceitar vira tarefa com a data pedida." style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-3 flex-wrap">
          <code className="enz-input" style={{ flex: "1 1 320px", fontSize: 13, fontFamily: "ui-monospace, Menlo, monospace", wordBreak: "break-all" }}>{link || "gerando…"}</code>
          <BotaoContorno onClick={async () => { try { await navigator.clipboard.writeText(link); setCopiado(true); setTimeout(() => setCopiado(false), 1500); } catch {} }} disabled={!link}>{copiado ? "copiado ✓" : "Copiar link"}</BotaoContorno>
          <ConfirmarAcao rotulo="gerar link novo" aviso="o link antigo deixa de funcionar na hora" onConfirmar={gerarCodigo} />
        </div>
        <p className="enz-nota" style={{ marginTop: 10 }}>mande por WhatsApp ou fixe no grupo da equipe. quem tiver o link consegue enviar; se vazar, gere um novo.</p>
      </Card>

      <AvisoErro erro={erro} />
      {pedidos && pendentes.length === 0 && <div className="enz-card enz-card-vazado enz-nota">caixa vazia. nenhum pedido esperando triagem.</div>}
      {pendentes.map((p) => (
        <div key={p.id} className="enz-card" style={{ marginBottom: 12, borderLeft: `3px solid ${p.prioridade === "urgente" ? "var(--erro)" : "var(--alerta)"}` }}>
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>{p.nome}{p.prioridade === "urgente" && <span style={{ fontSize: 12, color: "var(--erro)", marginLeft: 10, letterSpacing: ".1em", textTransform: "uppercase" }}>urgente</span>}</div>
            <span className="enz-nota">{quando(p)}{p.prazo ? ` · para ${brDe(p.prazo)}` : ""}</span>
          </div>
          <p style={{ marginTop: 8, fontSize: 15, lineHeight: 1.6, whiteSpace: "pre-line" }}>{p.pedido}</p>
          {p.contato && <p className="enz-nota" style={{ marginTop: 6 }}>contato: {p.contato}</p>}
          <div className="flex items-center gap-3 flex-wrap" style={{ marginTop: 14 }}>
            <BotaoPrimario pequeno onClick={() => aceitar(p)}>Aceitar → vira tarefa</BotaoPrimario>
            <BotaoContorno onClick={() => mudar(p, { status: "recusado" })}>Recusar</BotaoContorno>
            <ConfirmarAcao rotulo="excluir" aviso="apaga o pedido" onConfirmar={() => excluir(p)} />
          </div>
        </div>
      ))}
      {historico.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <button className="enz-link" onClick={() => setVerHistorico(!verHistorico)}>{verHistorico ? "esconder" : "ver"} histórico ({historico.length})</button>
          {verHistorico && historico.map((p) => (
            <div key={p.id} className="flex items-baseline justify-between gap-3 flex-wrap" style={{ padding: "10px 0", borderBottom: "1px solid var(--linha)", fontSize: 14 }}>
              <span><strong>{p.nome}</strong> · {p.pedido.length > 90 ? p.pedido.slice(0, 90) + "…" : p.pedido}</span>
              <span className="enz-nota">{p.status === "aceito" ? "aceito" : "recusado"} · {quando(p)} <ConfirmarAcao rotulo="excluir" aviso="apaga o pedido" onConfirmar={() => excluir(p)} /></span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tela ─────────────────────────────────────────────────────────

export function TelaAgenda({ tarefas, onMudarTarefas, clientes = [], financeiroPorCliente = {}, sistemasPorCliente = {}, pedidosPendentes = 0, onMudouPendentes, abaInicial = "tarefas", onAbrirCliente, onVoltar }) {
  const [aba, setAba] = useState(abaInicial);
  const hoje = hojeISO();
  const [dia, setDia] = useState(hoje);
  const g = useMemo(() => agruparTarefas(tarefas, hoje), [tarefas, hoje]);
  const eventos = useMemo(() => eventosDoApp({ clientes, financeiroPorCliente, sistemasPorCliente }), [clientes, financeiroPorCliente, sistemasPorCliente]);
  const abertas = (tarefas || []).filter((t) => t.status !== "feita").length;

  const criar = (t) => onMudarTarefas([...(tarefas || []), t]);
  const mudar = (t) => onMudarTarefas((tarefas || []).map((x) => (x.id === t.id ? t : x)));
  const excluir = (t) => onMudarTarefas((tarefas || []).filter((x) => x.id !== t.id));
  const aceitarPedido = async (p) => {
    const t = tarefaVazia({ titulo: p.pedido.length > 90 ? p.pedido.slice(0, 90) + "…" : p.pedido, detalhe: p.pedido.length > 90 ? p.pedido : "", data: p.prazo || "", prioridade: p.prioridade === "urgente" ? "urgente" : "normal", origem: "pedido", pedidoId: p.id, solicitante: p.nome + (p.contato ? ` (${p.contato})` : "") });
    await onMudarTarefas([...(tarefas || []), t]);
    return t;
  };

  const lista = (itens) => itens.map((t) => <LinhaTarefa key={t.id} t={t} clientes={clientes} hoje={hoje} onMudar={mudar} onExcluir={() => excluir(t)} onAbrirCliente={onAbrirCliente} />);
  const doDia = porDia(tarefas, eventos).get(dia) || { tarefas: [], eventos: [] };

  return (
    <div className="enz-container">
      <button onClick={onVoltar} className="enz-link" style={{ marginBottom: 20 }}>← início</button>
      <TituloSecao
        rotulo="Agenda"
        titulo="O que é seu, fora dos clientes."
        virada={g.hoje.length || g.atrasadas.length ? `${g.hoje.length} para hoje${g.atrasadas.length ? ` · ${g.atrasadas.length} atrasada${g.atrasadas.length > 1 ? "s" : ""}` : ""}.` : abertas ? `${abertas} tarefa${abertas > 1 ? "s" : ""} em aberto, nada para hoje.` : "Nada pendente."}
      />
      <div className="flex gap-2 flex-wrap" style={{ margin: "24px 0" }}>
        {[["tarefas", "Tarefas"], ["calendario", "Calendário"], ["pedidos", `Pedidos${pedidosPendentes ? ` (${pedidosPendentes})` : ""}`]].map(([k, r]) => (
          <button key={k} className={`enz-botao enz-botao-contorno enz-botao-pequeno ${aba === k ? "is-ativo" : ""}`} onClick={() => setAba(k)}>{r}</button>
        ))}
      </div>

      {aba === "tarefas" && (
        <>
          <NovaTarefa clientes={clientes} onCriar={criar} />
          <Grupo titulo="Atrasadas" itens={g.atrasadas} cor="var(--erro)">{lista(g.atrasadas)}</Grupo>
          <Grupo titulo="Hoje" itens={g.hoje} vazio="nada para hoje.">{lista(g.hoje)}</Grupo>
          <Grupo titulo="Próximos 7 dias" itens={g.semana}>{lista(g.semana)}</Grupo>
          <Grupo titulo="Depois" itens={g.depois}>{lista(g.depois)}</Grupo>
          <Grupo titulo="Sem data" itens={g.semData}>{lista(g.semData)}</Grupo>
          <Grupo titulo="Feitas recentemente" itens={g.feitas}>{lista(g.feitas)}</Grupo>
        </>
      )}

      {aba === "calendario" && (
        <>
          <Calendario tarefas={tarefas} eventos={eventos} hoje={hoje} diaSelecionado={dia} onSelecionar={setDia} />
          <div style={{ marginTop: 28 }}>
            <div className="flex items-baseline justify-between gap-3 flex-wrap" style={{ marginBottom: 10 }}>
              <span className="enz-rotulo">{dia === hoje ? "Hoje" : deISO(dia).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</span>
              <span className="enz-nota">{doDia.tarefas.length + doDia.eventos.length ? "" : "nada neste dia"}</span>
            </div>
            {doDia.eventos.map((e) => (
              <div key={e.id} className="flex items-baseline gap-2 flex-wrap" style={{ padding: "8px 0", borderBottom: "1px solid var(--linha)", fontSize: 14 }}>
                <span style={{ color: "var(--tinta-salvia)" }}>◦</span><span>{e.titulo}</span>
                <button className="enz-link" style={{ fontSize: 13 }} onClick={() => onAbrirCliente(e.clienteId)}>{e.cliente}</button>
                <span className="enz-nota">{e.tipo === "parcela" ? "vencimento" : "sistema"}</span>
              </div>
            ))}
            {lista(doDia.tarefas)}
            <div style={{ marginTop: 16 }}><NovaTarefa clientes={clientes} dataInicial={dia} onCriar={criar} /></div>
          </div>
        </>
      )}

      {aba === "pedidos" && <Pedidos onAceitar={aceitarPedido} onMudouPendentes={onMudouPendentes} />}
    </div>
  );
}

// bloco "Hoje" do painel inicial
export function BlocoHoje({ tarefas, pedidosPendentes = 0, onAgenda, onConcluir }) {
  const hoje = hojeISO();
  const g = agruparTarefas(tarefas, hoje);
  const itens = [...g.atrasadas, ...g.hoje];
  if (!itens.length && !pedidosPendentes) return null;
  return (
    <Card rotulo="Hoje" titulo={itens.length ? `${itens.length} coisa${itens.length > 1 ? "s" : ""} para hoje${g.atrasadas.length ? `, ${g.atrasadas.length} atrasada${g.atrasadas.length > 1 ? "s" : ""}` : ""}.` : "Nada marcado para hoje."} subtitulo={pedidosPendentes ? `${pedidosPendentes} pedido${pedidosPendentes > 1 ? "s" : ""} esperando triagem na Agenda.` : undefined} style={{ marginTop: 32 }}>
      {itens.slice(0, 6).map((t) => (
        <div key={t.id} className="flex items-center gap-3" style={{ padding: "6px 0" }}>
          <button type="button" onClick={() => onConcluir(t)} aria-label="concluir" style={{ width: 18, height: 18, borderRadius: 999, border: "1.5px solid var(--linha-forte)", flex: "none", cursor: "pointer" }} />
          <span style={{ fontSize: 15 }}>{t.prioridade === "urgente" && <span style={{ color: "var(--erro)", marginRight: 6 }}>●</span>}{t.titulo}</span>
          <span className="enz-nota" style={{ color: t.data < hoje ? "var(--erro)" : undefined }}>{rotuloRelativo(t.data, hoje)}{t.hora ? ` · ${t.hora}` : ""}</span>
        </div>
      ))}
      <button className="enz-link" style={{ marginTop: 8 }} onClick={onAgenda}>abrir a agenda →</button>
    </Card>
  );
}
