import { useEffect, useState } from "react";
import { Card, TituloSecao } from "../componentes/enraizar.jsx";
import { AvisoErro, BotaoContorno, ConfirmarAcao } from "../componentes/ui.jsx";

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

function AvisoWhatsApp() {
  const [resultado, setResultado] = useState(null);
  const [testando, setTestando] = useState(false);
  const testar = async () => {
    setTestando(true);
    try { setResultado(await api("GET", null, "?aviso=testar")); } catch (e) { setResultado({ ok: false, motivo: e.message }); }
    setTestando(false);
  };
  return (
    <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--linha)" }}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="enz-rotulo">Aviso no seu WhatsApp</span>
        <BotaoContorno onClick={testar} disabled={testando}>{testando ? "Enviando…" : "Enviar aviso de teste"}</BotaoContorno>
      </div>
      <p className="enz-nota" style={{ margin: "6px 0 0" }}>lead novo, pedido novo e o resumo diário das 7h chegam como mensagem no seu WhatsApp. canal preferido: a API oficial do WhatsApp (Meta), com as variáveis WHATSAPP_NUMERO, WHATSAPP_CLOUD_TOKEN, WHATSAPP_CLOUD_PHONE_ID e WHATSAPP_CLOUD_TEMPLATE na Vercel. alternativa gratuita: CallMeBot, com CALLMEBOT_APIKEY.</p>
      {resultado && (
        <p style={{ marginTop: 8, fontSize: 13.5, color: resultado.ok ? "var(--sucesso)" : "var(--alerta)" }}>
          {resultado.ok ? `enviado pelo canal ${resultado.canal || "configurado"}. confira o WhatsApp.` : `não enviado: ${resultado.motivo}`}
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

function LinhaLead({ lead, onMudar, onConverter, onExcluir, clienteNome }) {
  const [obs, setObs] = useState(lead.obs || "");
  const st = STATUS_LEAD[lead.status] || STATUS_LEAD.novo;
  const quando = lead.criadoEm ? new Date(lead.criadoEm).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
  const tel = (lead.whatsapp || "").replace(/\D/g, "");
  const wa = tel ? `https://wa.me/${tel.length <= 11 ? "55" + tel : tel}?text=${encodeURIComponent(`Oi, ${lead.nome.split(" ")[0]}! Aqui é a Nayara. Recebi sua aplicação para o diagnóstico pelo site.`)}` : null;
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

export function TelaLeads({ clientes = [], onConverter, onVoltar, onMudouNovos }) {
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
          <AvisoWhatsApp />
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
        <LinhaLead key={l.id} lead={l} clienteNome={nomeCliente(l.clienteId)} onMudar={(c) => mudar(l, c)} onConverter={() => onConverter(l)} onExcluir={() => excluir(l)} />
      ))}
    </div>
  );
}
