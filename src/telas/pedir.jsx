import { useEffect, useState } from "react";
import { TituloSecao } from "../componentes/enraizar.jsx";
import { BotaoPrimario, InputField } from "../componentes/ui.jsx";
import { linkWhatsApp } from "../nucleo/contato.js";

// Página pública /pedir?c=CÓDIGO: quem trabalha com a Nay manda um pedido, que cai na caixa de entrada da Agenda.

function Moldura({ children }) {
  return (
    <div data-theme="papel" className="min-h-screen" style={{ background: "var(--fundo)", color: "var(--tinta)" }}>
      <header className="enz-cabecalho">
        <span className="enz-cabecalho-nome">
          <span className="enz-marca">Nayara Silva</span>
          <span className="enz-rotulo enz-assinatura" style={{ display: "block" }}>Pedidos e solicitações</span>
        </span>
      </header>
      <main className="enz-container" style={{ maxWidth: 640 }}>{children}</main>
    </div>
  );
}

export function PaginaPedir() {
  const codigo = new URLSearchParams(window.location.search).get("c") || "";
  const [fase, setFase] = useState("carregando");
  const [erro, setErro] = useState("");
  const [d, setD] = useState({ nome: "", pedido: "", prazo: "", prioridade: "normal", contato: "", site: "" });
  const set = (campo) => (v) => setD({ ...d, [campo]: v });

  useEffect(() => {
    fetch(`/api/pedidos?c=${encodeURIComponent(codigo)}`).then((r) => setFase(r.ok ? "pronto" : "invalido")).catch(() => setFase("invalido"));
  }, [codigo]);

  const enviar = async (e) => {
    e.preventDefault();
    setErro("");
    setFase("enviando");
    try {
      const r = await fetch("/api/pedidos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...d, c: codigo }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Não foi possível enviar. Tente de novo.");
      setFase("enviado");
    } catch (err) {
      setErro(err.message);
      setFase("pronto");
    }
  };

  if (fase === "carregando") return <Moldura><p className="enz-nota">abrindo…</p></Moldura>;
  if (fase === "invalido") return <Moldura><TituloSecao rotulo="Pedidos" titulo="Este link não está ativo." descricao="Peça um link novo para a Nayara." /></Moldura>;
  if (fase === "enviado") {
    return (
      <Moldura>
        <TituloSecao rotulo="Recebido" titulo="Anotado." descricao="Seu pedido entrou na lista da Nayara. Se for urgente ou você quiser garantir que ela viu, avise pelo WhatsApp com um toque: a mensagem já vai pronta." />
        <div className="flex items-center gap-4 flex-wrap" style={{ marginTop: 24 }}>
          <a className="enz-botao enz-botao-primario" href={linkWhatsApp(`Oi, Nayara! Mandei um pedido pelo seu link${d.prazo ? ` (para ${d.prazo.split("-").reverse().join("/")})` : ""}${d.prioridade === "urgente" ? ", urgente" : ""}: ${d.pedido}`)} target="_blank" rel="noreferrer">Avisar no WhatsApp</a>
          <button className="enz-link" onClick={() => { setD({ nome: d.nome, pedido: "", prazo: "", prioridade: "normal", contato: d.contato, site: "" }); setFase("pronto"); }}>mandar outro pedido</button>
        </div>
      </Moldura>
    );
  }
  return (
    <Moldura>
      <TituloSecao rotulo="Pedidos" titulo="O que você precisa de mim?" descricao="Escreva como se fosse uma mensagem. Se tiver prazo, marque. Eu leio tudo e respondo depois da triagem." />
      <form onSubmit={enviar} style={{ marginTop: 32 }}>
        <InputField label="Seu nome" value={d.nome} onChange={set("nome")} required />
        <div className="enz-campo">
          <label className="enz-rotulo" htmlFor="pedido">O que você precisa</label>
          <textarea id="pedido" className="enz-input" rows={5} required value={d.pedido} onChange={(e) => set("pedido")(e.target.value)} placeholder="Ex.: preciso da sua aprovação na escala de domingo até sexta" />
        </div>
        <div className="grid gap-x-4 sm:grid-cols-2">
          <div className="enz-campo">
            <label className="enz-rotulo" htmlFor="prazo">Para quando (opcional)</label>
            <input id="prazo" className="enz-input" type="date" value={d.prazo} onChange={(e) => set("prazo")(e.target.value)} />
          </div>
          <div className="enz-campo">
            <label className="enz-rotulo" htmlFor="prioridade">Urgência</label>
            <select id="prioridade" className="enz-input" value={d.prioridade} onChange={(e) => set("prioridade")(e.target.value)}>
              <option value="normal">Normal</option>
              <option value="urgente">Urgente — trava o trabalho</option>
            </select>
          </div>
        </div>
        <InputField label="Seu WhatsApp ou e-mail (opcional)" value={d.contato} onChange={set("contato")} ajuda="para eu responder direto a você." />
        <label style={{ position: "absolute", left: -9999, opacity: 0, height: 0, overflow: "hidden" }} aria-hidden="true">Site<input tabIndex={-1} autoComplete="off" value={d.site} onChange={(e) => set("site")(e.target.value)} /></label>
        {erro && <div className="enz-aviso-erro">{erro}</div>}
        <BotaoPrimario type="submit" disabled={fase === "enviando"}>{fase === "enviando" ? "Enviando…" : "Enviar pedido"}</BotaoPrimario>
      </form>
    </Moldura>
  );
}
