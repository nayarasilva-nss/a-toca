import { useEffect, useState } from "react";
import { Card, TituloSecao } from "../componentes/enraizar.jsx";
import { AvisoErro, BotaoContorno, ConfirmarAcao } from "../componentes/ui.jsx";
import { CADENCIA, ROTEIRO_DIAGNOSTICO, dataProximoToque, hojeISO, mensagemConfirmacao, proximoPasso } from "../nucleo/conversa-lead.js";

export const STATUS_LEAD = {
  novo: { rotulo: "Novo", cor: "var(--alerta)", fundo: "var(--alerta-fundo)" },
  contatado: { rotulo: "Contatado", cor: "var(--info)", fundo: "var(--info-fundo)" },
  diagnostico: { rotulo: "Diagnóstico marcado", cor: "var(--ouro-texto)", fundo: "var(--fundo-recuo)" },
  convertido: { rotulo: "Virou cliente", cor: "var(--sucesso)", fundo: "var(--sucesso-fundo)" },
  perdido: { rotulo: "Não seguiu", cor: "var(--tinta-musgo)", fundo: "var(--fundo-recuo)" },
};

export const URL_APP = "https://enraizar.vercel.app";

// lead → dados iniciais do cliente, pela trilha que a pessoa escolheu no site
export function clienteDoLead(lead) {
  const quando = lead.criadoEm ? new Date(lead.criadoEm).toLocaleDateString("pt-BR") : "";
  const contato = [lead.nome, lead.whatsapp && `WhatsApp ${lead.whatsapp}`, lead.email].filter(Boolean).join(" · ");
  const diag = lead.diagnostico && lead.diagnostico.areas ? `Autodiagnóstico do site: ${lead.diagnostico.indice}% do negócio depende do dono. Por área: ${lead.diagnostico.areas.map((a) => `${a.area} ${a.pct}% (${a.nivel})`).join("; ")}.` : "";
  const contexto = [`Veio pelo ${lead.origem === "autodiagnostico" ? "autodiagnóstico do site" : "site"}${quando ? ` em ${quando}` : ""}. Contato: ${contato}.`, lead.funcionarios && `Funcionários: ${lead.funcionarios}.`, lead.interesse && `Interesse: ${lead.interesse}.`, lead.dor && `Maior dor, nas palavras da pessoa: "${lead.dor}"`, diag].filter(Boolean).join("\n");
  const base = { contato: { nome: lead.nome, whatsapp: lead.whatsapp, email: lead.email }, contexto, leadId: lead.id, ...(lead.diagnostico && lead.diagnostico.areas ? { autodiagnostico: { indice: lead.diagnostico.indice, areas: lead.diagnostico.areas, em: quando } } : {}) };
  if (lead.interesse === "Mentoria") return { ...base, tipo: "pessoa", negocio: lead.nome, segmento: lead.negocio || "", servicos: { consultoria: false, mentoria: true, treinamentos: false, sistemas: false } };
  const servicos = { consultoria: true, mentoria: false, treinamentos: false, sistemas: false };
  if (lead.interesse === "Sistemas personalizados") Object.assign(servicos, { consultoria: false, sistemas: true });
  if (lead.interesse === "Treinamento de liderança") Object.assign(servicos, { consultoria: false, treinamentos: true });
  return { ...base, tipo: "empresa", negocio: lead.negocio.split(/[,—–-]/)[0].trim() || lead.nome, segmento: lead.negocio || "", servicos };
}

// Mensagem de primeiro contato: parte do que a própria pessoa preencheu (autodiagnóstico, dor, interesse).
const NOME_AREA = { "Pessoas": "pessoas", "Processos": "processos", "Governança e papéis": "governança e papéis", "Disciplina e cultura": "disciplina e cultura", "Financeiro": "o financeiro", "Autonomia do dono": "a sua própria autonomia" };
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const listar = (xs) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} e ${xs[xs.length - 1]}`);
export function mensagemPrimeiroContato(lead) {
  const primeiro = (lead.nome || "").trim().split(/\s+/)[0] || "tudo bem";
  const d = lead.diagnostico && lead.diagnostico.areas ? lead.diagnostico : null;
  const convite = lead.interesse === "Sistemas personalizados"
    ? "Topa 30 minutos de conversa para eu entender a sua operação e te dizer se um sistema próprio resolve? Sem custo."
    : lead.interesse === "Mentoria"
      ? "Topa 30 minutos de conversa para eu entender o seu momento e te dizer por onde começar? Sem custo."
      : "Topa 30 minutos de conversa para eu entender o seu negócio e te dizer por onde começar? Sem custo.";
  const partes = [`Oi, ${primeiro}! Aqui é a Nayara.`];
  if (d) {
    const ord = [...d.areas].sort((a, b) => a.pct - b.pct);
    const fracas = ord.filter((a) => a.pct < 34).slice(0, 3).map((a) => NOME_AREA[a.area] || a.area.toLowerCase());
    const fortes = ord.filter((a) => a.pct >= 67).slice(-2).map((a) => NOME_AREA[a.area] || a.area.toLowerCase());
    partes.push("Vi que você fez o autodiagnóstico no meu site.");
    if (fortes.length && fracas.length) partes.push(cap(`${listar(fortes)} ${fortes.length > 1 ? "já estão" : "já está"} bem ${fortes.length > 1 ? "estruturados" : "estruturado"}, mas ${listar(fracas)} ainda ${fracas.length > 1 ? "dependem" : "depende"} de você. Isso costuma ser o que trava o crescimento.`));
    else if (fracas.length) partes.push(`O resultado mostrou que ${listar(fracas)} ainda ${fracas.length > 1 ? "dependem" : "depende"} de você. Isso costuma ser o que trava o crescimento.`);
    else partes.push(`O resultado mostrou um negócio bem estruturado, com ${d.indice}% ainda nas suas mãos. O próximo passo costuma ser fazer isso virar crescimento.`);
  } else {
    partes.push("Recebi sua aplicação para o diagnóstico pelo site.");
    if (lead.dor) partes.push(`Você contou que "${String(lead.dor).trim().replace(/[.!?]+$/, "")}". Isso tem solução, e costuma ser mais simples do que parece.`);
  }
  partes.push(convite);
  return partes.join(" ");
}

async function api(metodo, corpo, query = "") {
  const opcoes = corpo ? { method: metodo, headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) } : { method: metodo };
  const r = await fetch(`/api/leads${query}`, opcoes);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
  return j;
}

function Copiar({ texto, rotulo = "copiar" }) {
  const [ok, setOk] = useState(false);
  return (
    <button className="enz-link" onClick={async () => { try { await navigator.clipboard.writeText(texto); setOk(true); setTimeout(() => setOk(false), 1500); } catch {} }}>
      {ok ? "copiado ✓" : rotulo}
    </button>
  );
}

function Bloco({ titulo, nota, codigo }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div className="flex items-center justify-between gap-2 flex-wrap"><span className="enz-rotulo">{titulo}</span><Copiar texto={codigo} /></div>
      {nota && <p className="enz-nota" style={{ margin: "4px 0 6px" }}>{nota}</p>}
      <pre className="enz-input" style={{ whiteSpace: "pre-wrap", wordBreak: "break-all", fontSize: 12, lineHeight: 1.5, fontFamily: "ui-monospace, Menlo, monospace", margin: 0 }}>{codigo}</pre>
    </div>
  );
}

function AvisosCelular() {
  const [canais, setCanais] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [ocupado, setOcupado] = useState("");
  const carregar = () => api("GET", null, "?aviso=canais").then(setCanais).catch(() => setCanais({}));
  useEffect(() => { carregar(); }, []);
  const rodar = async (acao, query) => {
    setOcupado(acao); setResultado(null);
    try { const r = await api("GET", null, query); setResultado(r); if (acao === "conectar" && r.ok) carregar(); } catch (e) { setResultado({ ok: false, motivo: e.message }); }
    setOcupado("");
  };
  const tg = canais ? canais.telegram : null;
  const wa = canais ? canais.whatsapp : null;
  return (
    <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--linha)" }}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="enz-rotulo">Avisos no seu celular</span>
        <BotaoContorno onClick={() => rodar("testar", "?aviso=testar")} disabled={!!ocupado}>{ocupado === "testar" ? "Enviando…" : "Enviar aviso de teste"}</BotaoContorno>
      </div>
      <p className="enz-nota" style={{ margin: "6px 0 10px" }}>lead novo, pedido novo e o resumo diário das 7h chegam como mensagem. dois canais possíveis, pode ter os dois.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="enz-card enz-card-vazado" style={{ padding: "12px 0" }}>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <strong>Telegram</strong>
            <span className="enz-nota" style={{ color: tg === "conectado" ? "var(--sucesso)" : "var(--alerta)" }}>{canais ? (tg === "conectado" ? "conectado" : tg === "sem chat" ? "token ok, falta conectar" : "sem token na Vercel") : "…"}</span>
          </div>
          <p className="enz-nota" style={{ marginTop: 4 }}>1) no Telegram, fale com @BotFather, /newbot, e grave o token na Vercel como TELEGRAM_BOT_TOKEN. 2) abra o seu bot e mande "oi". 3) clique em conectar.</p>
          {tg && tg !== "conectado" && <BotaoContorno onClick={() => rodar("conectar", "?aviso=telegram-conectar")} disabled={!!ocupado}>{ocupado === "conectar" ? "Conectando…" : "Conectar Telegram"}</BotaoContorno>}
        </div>
        <div className="enz-card enz-card-vazado" style={{ padding: "12px 0" }}>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <strong>WhatsApp</strong>
            <span className="enz-nota" style={{ color: wa ? "var(--sucesso)" : "var(--tinta-musgo)" }}>{canais ? (wa === "cloud" ? "API oficial" : wa === "callmebot" ? "CallMeBot" : "não configurado") : "…"}</span>
          </div>
          <p className="enz-nota" style={{ marginTop: 4 }}>API oficial da Meta: WHATSAPP_NUMERO, WHATSAPP_CLOUD_TOKEN, WHATSAPP_CLOUD_PHONE_ID e WHATSAPP_CLOUD_TEMPLATE na Vercel. alternativa: CALLMEBOT_APIKEY.</p>
        </div>
      </div>
      {resultado && (
        <p style={{ marginTop: 10, fontSize: 13.5, color: resultado.ok ? "var(--sucesso)" : "var(--alerta)" }}>
          {resultado.ok ? (resultado.chat ? `conectado ao Telegram de ${resultado.chat.nome}.` : `enviado por ${resultado.canal || "canal configurado"}. confira o celular.${resultado.falhas && resultado.falhas.length ? ` (${resultado.falhas.join("; ")})` : ""}`) : `não deu: ${resultado.motivo}`}
        </p>
      )}
    </div>
  );
}
function Diagnostico({ d }) {
  return (
    <div style={{ marginTop: 12, padding: "12px 14px", background: "var(--fundo-recuo)", borderRadius: 8 }}>
      <div className="flex items-baseline justify-between gap-2 flex-wrap" style={{ marginBottom: 8 }}>
        <span className="enz-rotulo">Autodiagnóstico</span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>{d.indice}% depende do dono</span>
      </div>
      <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {d.areas.map((a) => (
          <div key={a.area}>
            <div className="flex justify-between" style={{ fontSize: 12.5, marginBottom: 3 }}><span>{a.area}</span><span style={{ color: a.pct < 34 ? "var(--erro)" : "var(--tinta-musgo)" }}>{a.pct}% · {a.nivel}</span></div>
            <div style={{ height: 5, background: "var(--linha)", borderRadius: 999 }}><div style={{ width: `${a.pct}%`, height: "100%", background: a.pct < 34 ? "var(--erro)" : "var(--ouro)", borderRadius: 999 }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// bloco "Conversa": o que fazer agora com este lead, a mensagem pronta e o registro do toque (que vai para a Agenda)
function MensagemPronta({ numero, texto, rotulo, onAbrir, nota }) {
  const [t, setT] = useState(texto);
  const [ver, setVer] = useState(false);
  useEffect(() => { setT(texto); }, [texto]);
  const link = numero ? `https://wa.me/${numero}?text=${encodeURIComponent(t)}` : null;
  return (
    <div>
      <div className="flex items-center gap-3 flex-wrap">
        {link ? (
          <a className="enz-botao enz-botao-contorno" style={{ textDecoration: "none" }} href={link} target="_blank" rel="noreferrer" onClick={onAbrir}>{rotulo}</a>
        ) : (
          <BotaoContorno onClick={onAbrir}>{rotulo} (sem WhatsApp: copie o texto)</BotaoContorno>
        )}
        <button className="enz-link" onClick={() => setVer((v) => !v)}>{ver ? "esconder texto" : "ver e ajustar o texto"}</button>
        <Copiar texto={t} rotulo="copiar texto" />
      </div>
      {ver && <textarea className="enz-input" rows={5} style={{ marginTop: 8 }} value={t} onChange={(e) => setT(e.target.value)} />}
      {nota && <div className="enz-nota" style={{ marginTop: 6 }}>{nota}</div>}
    </div>
  );
}

function Conversa({ lead, numero, onMudar, onTarefa, onConverter }) {
  const hoje = hojeISO();
  const passo = proximoPasso(lead, hoje);
  const [dataDiag, setDataDiag] = useState("");
  const [horaDiag, setHoraDiag] = useState("14:00");
  if (!passo) return null;
  const primeiro = (lead.nome || "").split(/\s+/)[0];

  const registrarToque = (n) => {
    // n = toque enviado agora (0 = primeiro contato); programa o seguinte e leva para a Agenda
    const proxima = dataProximoToque(n, hoje);
    const campos = { toques: n, ultimoToque: new Date().toISOString(), proximoToque: proxima, resposta: "nao" };
    if (lead.status === "novo") campos.status = "contatado";
    onMudar(campos);
    const seguinte = CADENCIA[n];
    onTarefa(lead, seguinte ? { titulo: `${seguinte.rotulo.split(" · ")[0]} com ${primeiro} (lead)`, data: proxima, detalhe: `${lead.nome}${lead.negocio ? ` · ${lead.negocio}` : ""}. ${seguinte.rotulo.split(" · ")[1]}. Abra o lead em Leads para a mensagem pronta.` } : { titulo: `Decidir: ${primeiro} vira "Não seguiu"? (lead)`, data: proxima || hoje, detalhe: `${lead.nome}: três toques sem resposta. Marque "Não seguiu" em Leads ou mude a abordagem.` });
  };
  const responder = (resposta) => { onMudar({ resposta, proximoToque: "" }); onTarefa(lead, null); };
  const marcarDiagnostico = () => {
    if (!dataDiag) return;
    onMudar({ status: "diagnostico", proximoToque: dataDiag });
    onTarefa(lead, { titulo: `Diagnóstico com ${primeiro} (lead)`, data: dataDiag, hora: horaDiag, detalhe: `${lead.nome}${lead.negocio ? ` · ${lead.negocio}` : ""}. Roteiro em Leads → Conversa de diagnóstico. Na véspera, mande a confirmação.` });
  };

  const caixa = { marginTop: 12, padding: "12px 14px", background: "var(--fundo-recuo)", borderRadius: 8 };
  const cabecalho = (
    <div className="flex items-baseline justify-between gap-2 flex-wrap" style={{ marginBottom: 8 }}>
      <span className="enz-rotulo">Conversa · {passo.titulo}</span>
      {passo.situacao === "toque" && <span className="enz-nota" style={{ color: passo.atraso > 0 ? "var(--erro)" : "var(--tinta-musgo)" }}>{passo.semResposta ? `${passo.semResposta} ${passo.semResposta === 1 ? "dia" : "dias"} sem resposta · ` : ""}{passo.dica}</span>}
    </div>
  );

  if (passo.situacao === "primeiro") return null; // o bloco de primeiro contato já cuida

  if (passo.situacao === "diagnostico") {
    return (
      <div style={caixa}>
        {cabecalho}
        <p className="enz-nota" style={{ margin: "0 0 10px" }}>{passo.dica}</p>
        <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.6 }}>
          {ROTEIRO_DIAGNOSTICO.map((r) => <li key={r.t}><strong>{r.t}.</strong> {r.p}</li>)}
        </ol>
        <div style={{ marginTop: 12 }}>
          <MensagemPronta numero={numero} texto={mensagemConfirmacao(lead, lead.proximoToque || hoje, "")} rotulo="Confirmar na véspera" nota="um toque de uma linha no dia anterior evita o não comparecimento." />
        </div>
        <div className="flex items-center gap-3 flex-wrap" style={{ marginTop: 12 }}>
          <span className="enz-nota">depois da conversa:</span>
          <BotaoContorno onClick={onConverter}>Virar cliente</BotaoContorno>
          <button className="enz-link" onClick={() => onMudar({ status: "perdido" })}>não seguiu</button>
        </div>
      </div>
    );
  }

  if (passo.situacao === "topou") {
    return (
      <div style={caixa}>
        {cabecalho}
        <p className="enz-nota" style={{ margin: "0 0 10px" }}>{passo.dica}</p>
        <MensagemPronta numero={numero} texto={passo.mensagem} rotulo="Oferecer dois horários" />
        <div className="flex items-end gap-3 flex-wrap" style={{ marginTop: 12 }}>
          <label className="enz-nota" style={{ display: "grid", gap: 4 }}>dia da conversa<input className="enz-input" type="date" value={dataDiag} onChange={(e) => setDataDiag(e.target.value)} style={{ width: 170 }} /></label>
          <label className="enz-nota" style={{ display: "grid", gap: 4 }}>hora<input className="enz-input" type="time" value={horaDiag} onChange={(e) => setHoraDiag(e.target.value)} style={{ width: 110 }} /></label>
          <BotaoContorno onClick={marcarDiagnostico} disabled={!dataDiag}>Marcar diagnóstico</BotaoContorno>
          <button className="enz-link" onClick={() => responder("nao")}>sumiu de novo</button>
        </div>
      </div>
    );
  }

  if (passo.situacao === "vago") {
    return (
      <div style={caixa}>
        {cabecalho}
        <p className="enz-nota" style={{ margin: "0 0 10px" }}>{passo.dica}</p>
        <MensagemPronta numero={numero} texto={passo.mensagem} rotulo="Devolver a pergunta" />
        <div className="flex items-center gap-3 flex-wrap" style={{ marginTop: 12 }}>
          <span className="enz-nota">e aí?</span>
          <BotaoContorno onClick={() => responder("topou")}>Topou conversar</BotaoContorno>
          <button className="enz-link" onClick={() => responder("nao")}>sem resposta</button>
        </div>
      </div>
    );
  }

  if (passo.situacao === "esgotou") {
    return (
      <div style={caixa}>
        {cabecalho}
        <p className="enz-nota" style={{ margin: "0 0 10px" }}>{passo.dica}</p>
        <div className="flex items-center gap-3 flex-wrap">
          <BotaoContorno onClick={() => { onMudar({ status: "perdido" }); onTarefa(lead, null); }}>Marcar "Não seguiu"</BotaoContorno>
          <button className="enz-link" onClick={() => responder("topou")}>respondeu e topou</button>
          <button className="enz-link" onClick={() => responder("vago")}>respondeu vago</button>
        </div>
      </div>
    );
  }

  // toque N programado
  return (
    <div style={caixa}>
      {cabecalho}
      <MensagemPronta numero={numero} texto={passo.mensagem} rotulo={`Mandar o toque ${passo.n}`} onAbrir={() => registrarToque(passo.n)} nota={`ao abrir, o toque ${passo.n} fica registrado e o próximo entra na Agenda.`} />
      <div className="flex items-center gap-3 flex-wrap" style={{ marginTop: 12 }}>
        <span className="enz-nota">a pessoa respondeu?</span>
        <BotaoContorno onClick={() => responder("topou")}>Topou conversar</BotaoContorno>
        <BotaoContorno onClick={() => responder("vago")}>Respondeu vago</BotaoContorno>
      </div>
    </div>
  );
}

function LinhaLead({ lead, onMudar, onConverter, onExcluir, clienteNome, onTarefa }) {
  const [obs, setObs] = useState(lead.obs || "");
  const st = STATUS_LEAD[lead.status] || STATUS_LEAD.novo;
  const quando = lead.criadoEm ? new Date(lead.criadoEm).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
  const tel = (lead.whatsapp || "").replace(/\D/g, "");
  const numero = tel ? (tel.length <= 11 ? "55" + tel : tel) : "";
  const wa = numero ? `https://wa.me/${numero}` : null;
  const [mensagem, setMensagem] = useState(() => mensagemPrimeiroContato(lead));
  const [verMensagem, setVerMensagem] = useState(false);
  const linkMensagem = numero ? `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}` : null;
  const abrirPrimeiroContato = () => {
    if (lead.status !== "novo") return;
    const proxima = dataProximoToque(0, hojeISO());
    onMudar({ status: "contatado", toques: 0, ultimoToque: new Date().toISOString(), proximoToque: proxima, resposta: "nao" });
    onTarefa(lead, { titulo: `Toque 1 com ${lead.nome.split(/\s+/)[0]} (lead)`, data: proxima, detalhe: `${lead.nome}${lead.negocio ? ` · ${lead.negocio}` : ""}. Um insight do diagnóstico. Abra o lead em Leads para a mensagem pronta.` });
  };
  return (
    <div className="enz-card" style={{ marginBottom: 12, borderLeft: `3px solid ${st.cor}` }}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, lineHeight: 1.2 }}>{lead.nome}</div>
          <div className="enz-nota" style={{ marginTop: 2 }}>{[lead.negocio, lead.funcionarios && `${lead.funcionarios} funcionários`, lead.interesse].filter(Boolean).join(" · ") || "sem detalhes"}</div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select className="enz-input" style={{ width: 190, padding: "6px 10px", color: st.cor, background: st.fundo }} value={lead.status} onChange={(e) => onMudar({ status: e.target.value })}>
            {Object.entries(STATUS_LEAD).map(([k, s]) => <option key={k} value={k}>{s.rotulo}</option>)}
          </select>
          {lead.clienteId ? <span className="enz-nota">cliente: {clienteNome || "cadastrado"}</span> : <BotaoContorno onClick={onConverter}>Virar cliente</BotaoContorno>}
        </div>
      </div>
      {!lead.clienteId && lead.status === "novo" && (
        <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--fundo-recuo)", borderRadius: 8 }}>
          <div className="flex items-center gap-3 flex-wrap">
            {linkMensagem ? (
              <a className="enz-botao enz-botao-contorno" style={{ textDecoration: "none" }} href={linkMensagem} target="_blank" rel="noreferrer" onClick={abrirPrimeiroContato}>Mensagem de primeiro contato</a>
            ) : (
              <span className="enz-nota">sem WhatsApp no lead; copie a mensagem e mande por e-mail</span>
            )}
            <button className="enz-link" onClick={() => setVerMensagem((v) => !v)}>{verMensagem ? "esconder texto" : "ver e ajustar o texto"}</button>
            <Copiar texto={mensagem} rotulo="copiar texto" />
          </div>
          {verMensagem && <textarea className="enz-input" rows={5} style={{ marginTop: 8 }} value={mensagem} onChange={(e) => setMensagem(e.target.value)} />}
          <div className="enz-nota" style={{ marginTop: 6 }}>montada com o que a pessoa preencheu{lead.diagnostico && lead.diagnostico.areas ? " e o resultado do autodiagnóstico" : ""}. ao abrir, o lead passa para "Contatado" e o toque 1 entra na Agenda para daqui a 2 dias.</div>
        </div>
      )}
      {!lead.clienteId && <Conversa lead={lead} numero={numero} onMudar={onMudar} onTarefa={onTarefa} onConverter={onConverter} />}
      <div className="flex gap-4 flex-wrap" style={{ marginTop: 10, fontSize: 13.5 }}>
        {wa && <a className="enz-link" href={wa} target="_blank" rel="noreferrer">WhatsApp {lead.whatsapp}</a>}
        {lead.email && <a className="enz-link" href={`mailto:${lead.email}`}>{lead.email}</a>}
        <span className="enz-nota">{quando}{lead.origem === "autodiagnostico" ? " · veio pelo autodiagnóstico" : lead.origem && lead.origem !== "site" ? ` · origem: ${lead.origem}` : ""}</span>
      </div>
      {lead.diagnostico && lead.diagnostico.areas && <Diagnostico d={lead.diagnostico} />}
      {lead.dor && <blockquote style={{ margin: "12px 0 0", padding: "10px 14px", borderLeft: "2px solid var(--ouro)", fontSize: 14, lineHeight: 1.6, fontStyle: "italic", background: "var(--fundo-recuo)" }}>{lead.dor}</blockquote>}
      <div style={{ marginTop: 12 }}>
        <span className="enz-rotulo" style={{ marginBottom: 6 }}>Anotações</span>
        <textarea className="enz-input" rows={2} value={obs} onChange={(e) => setObs(e.target.value)} onBlur={() => obs !== (lead.obs || "") && onMudar({ obs })} placeholder="o que conversaram, próximo passo…" />
      </div>
      <div className="flex justify-end" style={{ marginTop: 6 }}>
        <ConfirmarAcao rotulo="excluir" aviso="isso apaga o lead de vez" onConfirmar={onExcluir} />
      </div>
    </div>
  );
}

export function TelaLeads({ clientes = [], onConverter, onVoltar, onMudouNovos, onTarefaLead }) {
  const [leads, setLeads] = useState(null);
  const [erro, setErro] = useState(null);
  const [filtro, setFiltro] = useState("ativos");
  const [mostrarIntegracao, setMostrarIntegracao] = useState(false);

  const carregar = () => api("GET").then((j) => { setLeads(j.leads); setErro(null); }).catch((e) => setErro(e.message));
  useEffect(() => { carregar(); }, []);
  useEffect(() => { if (leads && onMudouNovos) onMudouNovos(leads.filter((l) => l.status === "novo").length); }, [leads]);

  const mudar = async (lead, campos) => {
    try {
      const j = await api("PATCH", { id: lead.id, ...campos });
      setLeads(leads.map((l) => (l.id === lead.id ? j.lead : l)));
    } catch (e) { setErro(e.message); }
  };
  const excluir = async (lead) => {
    try { await api("DELETE", null, `?id=${encodeURIComponent(lead.id)}`); setLeads(leads.filter((l) => l.id !== lead.id)); } catch (e) { setErro(e.message); }
  };

  const visiveis = (leads || []).filter((l) => (filtro === "ativos" ? !["convertido", "perdido"].includes(l.status) : filtro === "todos" ? true : l.status === filtro));
  const novos = (leads || []).filter((l) => l.status === "novo").length;
  const nomeCliente = (id) => (clientes.find((c) => c.id === id) || {}).negocio;

  const linkForm = `${URL_APP}/aplicar?origem=site`;
  const iframe = `<iframe src="${URL_APP}/aplicar?embed=1&origem=site" id="enraizar-form" style="width:100%;border:0;min-height:720px" title="Aplicação para diagnóstico"></iframe>
<script>window.addEventListener("message",function(e){if(e.data&&e.data.enraizarAltura){document.getElementById("enraizar-form").style.height=e.data.enraizarAltura+"px"}})</script>`;
  const fetchSnippet = `// no submit do seu formulário (campos: nome, whatsapp, email, negocio, funcionarios, interesse, dor)
fetch("${URL_APP}/api/leads", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ nome, whatsapp, email, negocio, funcionarios, interesse, dor, origem: "site" })
}).then(r => r.ok ? mostrarObrigada() : alert("Não foi possível enviar. Tente de novo."));`;

  return (
    <div className="enz-container">
      <button onClick={onVoltar} className="enz-link" style={{ marginBottom: 20 }}>← início</button>
      <TituloSecao
        rotulo="Leads"
        titulo="Quem chegou pelo site."
        virada={leads ? (novos ? `${novos} novo${novos > 1 ? "s" : ""} esperando contato.` : "Nenhum novo. Tudo em dia.") : "carregando…"}
        acoes={<BotaoContorno onClick={() => setMostrarIntegracao(!mostrarIntegracao)}>{mostrarIntegracao ? "fechar" : "Integrar com o site"}</BotaoContorno>}
      />

      {mostrarIntegracao && (
        <Card rotulo="Integração" titulo="Três jeitos de ligar o site a esta lista." subtitulo="todos caem aqui, com status Novo." style={{ marginTop: 24 }}>
          <Bloco titulo="1 · Link direto" nota="para botão, bio do Instagram ou WhatsApp. abre a página de aplicação pronta." codigo={linkForm} />
          <Bloco titulo="2 · Formulário embutido (iframe)" nota="cole onde o formulário deve aparecer no site. o script ajusta a altura sozinho." codigo={iframe} />
          <Bloco titulo="3 · Seu próprio formulário" nota="se o site já tem o formulário desenhado, só troque o envio por esta chamada. nomes dos campos iguais aos do site." codigo={fetchSnippet} />
          <p className="enz-nota" style={{ marginTop: 14 }}>o endereço aceita envios de qualquer domínio. há limite de envios por conexão e um campo-armadilha contra robôs.</p>
          <AvisosCelular />
        </Card>
      )}

      <AvisoErro erro={erro} />

      <div className="flex gap-2 flex-wrap" style={{ margin: "24px 0 16px" }}>
        {[["ativos", "Em andamento"], ["novo", "Novos"], ["convertido", "Viraram cliente"], ["perdido", "Não seguiram"], ["todos", "Todos"]].map(([k, r]) => (
          <button key={k} className={`enz-botao enz-botao-contorno enz-botao-pequeno ${filtro === k ? "is-ativo" : ""}`} onClick={() => setFiltro(k)}>{r}</button>
        ))}
      </div>

      {leads && visiveis.length === 0 && <div className="enz-card enz-card-vazado enz-nota">nenhum lead aqui. quando o site estiver no ar, eles aparecem sozinhos.</div>}
      {visiveis.map((l) => (
        <LinhaLead key={l.id} lead={l} clienteNome={nomeCliente(l.clienteId)} onMudar={(c) => mudar(l, c)} onConverter={() => onConverter(l)} onExcluir={() => excluir(l)} onTarefa={(lead, nova) => onTarefaLead && onTarefaLead(lead, nova)} />
      ))}
    </div>
  );
}
