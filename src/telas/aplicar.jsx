import { useEffect, useState } from "react";

// Página pública /aplicar: o formulário "Aplicação para diagnóstico" do site, falando com /api/leads.
// Abre sozinha (link) ou dentro do site (iframe com ?embed=1). Visual segue o site: azul-marinho, creme, Montserrat e Playfair.

const INTERESSES = ["Ainda não sei", "Consultoria de estrutura", "Sistemas personalizados", "Treinamento de liderança", "Mentoria"];
const FUNCIONARIOS = ["Até 10", "11 a 30", "31 a 80", "Mais de 80"];

const CSS = `
  .ap-raiz { --azul: #0B2239; --azul-claro: #2F4A6B; --creme: #F6F3EE; --areia: #E9E5DE; --tinta: #2B2B2B; --cinza: #6E645D; --linha: #B9AEA3; font-family: 'Montserrat', system-ui, sans-serif; color: var(--tinta); background: var(--creme); min-height: 100vh; }
  .ap-raiz.is-embed { min-height: 0; background: transparent; }
  .ap-topo { background: var(--azul); color: var(--creme); padding: 28px clamp(20px,5vw,44px); }
  .ap-topo .ap-marca { font: 500 13px/1 'Montserrat', sans-serif; letter-spacing: .22em; text-transform: uppercase; opacity: .85; }
  .ap-topo .ap-sub { font: 400 11px/1.4 'Montserrat', sans-serif; letter-spacing: .18em; text-transform: uppercase; opacity: .6; margin-top: 6px; }
  .ap-miolo { max-width: 760px; margin: 0 auto; padding: clamp(28px,6vw,48px) clamp(20px,5vw,44px); }
  .ap-rotulo { font: 500 11.5px/1 'Montserrat', sans-serif; letter-spacing: .14em; text-transform: uppercase; color: var(--azul); }
  .ap-titulo { font: 400 clamp(30px,4vw,42px)/1.15 'Playfair Display', serif; color: var(--azul); margin: 10px 0 14px; text-wrap: balance; }
  .ap-texto { font-size: 15px; line-height: 1.8; color: #4A4A4A; margin: 0 0 34px; }
  .ap-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: 22px 20px; }
  .ap-campo { display: flex; flex-direction: column; gap: 8px; font-size: 11.5px; letter-spacing: .12em; text-transform: uppercase; color: var(--cinza); }
  .ap-campo.is-largo { grid-column: 1 / -1; }
  .ap-campo input, .ap-campo select, .ap-campo textarea { border: none; border-bottom: 1px solid var(--linha); background: transparent; padding: 8px 0; font: 15px 'Montserrat', sans-serif; outline: none; color: var(--tinta); border-radius: 0; text-transform: none; letter-spacing: 0; }
  .ap-campo input:focus, .ap-campo select:focus, .ap-campo textarea:focus { border-bottom-color: var(--azul); }
  .ap-campo textarea { resize: vertical; min-height: 72px; }
  .ap-acoes { grid-column: 1 / -1; display: flex; flex-direction: column; gap: 14px; margin-top: 8px; }
  .ap-botao { all: unset; cursor: pointer; text-align: center; background: var(--azul); color: var(--creme); padding: 18px 28px; font: 500 13px/1 'Montserrat', sans-serif; letter-spacing: .1em; text-transform: uppercase; }
  .ap-botao:hover { background: var(--azul-claro); }
  .ap-botao:disabled { opacity: .6; cursor: default; }
  .ap-lgpd { font-size: 11.5px; color: var(--cinza); text-align: center; }
  .ap-erro { grid-column: 1 / -1; font-size: 13px; color: #8a3a2e; }
  .ap-ok { text-align: center; padding: 48px 0; }
  .ap-ok .ap-titulo { font-size: clamp(26px,3.4vw,34px); }
  .ap-ok p { font-size: 15px; line-height: 1.8; color: #4A4A4A; }
  .ap-hp { position: absolute; left: -9999px; opacity: 0; height: 0; overflow: hidden; }
`;

function usarFontes() {
  useEffect(() => {
    if (document.getElementById("ap-fontes")) return;
    const l = document.createElement("link");
    l.id = "ap-fontes";
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500&family=Playfair+Display:wght@400&display=swap";
    document.head.appendChild(l);
  }, []);
}

function avisarAltura() {
  if (window.parent === window) return;
  try {
    window.parent.postMessage({ enraizarAltura: document.documentElement.scrollHeight }, "*");
  } catch {}
}

export function PaginaAplicar() {
  usarFontes();
  const params = new URLSearchParams(window.location.search);
  const embed = params.get("embed") === "1";
  const origem = params.get("origem") || "site";
  const [d, setD] = useState({ nome: "", whatsapp: "", email: "", negocio: "", funcionarios: "", interesse: "", dor: "", site: "" });
  const [fase, setFase] = useState("pronto");
  const [erro, setErro] = useState("");
  const set = (campo) => (e) => setD({ ...d, [campo]: e.target.value });

  useEffect(() => { avisarAltura(); const t = setInterval(avisarAltura, 800); return () => clearInterval(t); }, [fase]);

  const enviar = async (e) => {
    e.preventDefault();
    setErro("");
    setFase("enviando");
    try {
      const r = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...d, origem }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Não foi possível enviar. Tente de novo.");
      setFase("enviado");
    } catch (err) {
      setErro(err.message);
      setFase("pronto");
    }
  };

  return (
    <div className={`ap-raiz ${embed ? "is-embed" : ""}`}>
      <style>{CSS}</style>
      {!embed && (
        <div className="ap-topo">
          <div className="ap-marca">Nayara Silva</div>
          <div className="ap-sub">Estrutura para o seu negócio crescer</div>
        </div>
      )}
      <div className="ap-miolo" style={embed ? { padding: 0 } : undefined}>
        {fase === "enviado" ? (
          <div className="ap-ok">
            <div className="ap-rotulo">Recebido</div>
            <h1 className="ap-titulo">Obrigada pela confiança.</h1>
            <p>Em até dois dias úteis entro em contato pelo WhatsApp para marcar a conversa.</p>
          </div>
        ) : (
          <>
            {!embed && (
              <>
                <div className="ap-rotulo">Aplicação para diagnóstico</div>
                <h1 className="ap-titulo">Todo crescimento começa em quem enraíza.</h1>
                <p className="ap-texto">Ajudo donos de negócio que vivem presos ao improviso a transformar o costume em processo, sistema e liderança, para que o negócio cresça sem depender deles.</p>
              </>
            )}
            <form className="ap-form" onSubmit={enviar}>
              <label className="ap-campo">Nome<input required value={d.nome} onChange={set("nome")} autoComplete="name" /></label>
              <label className="ap-campo">WhatsApp<input required type="tel" value={d.whatsapp} onChange={set("whatsapp")} autoComplete="tel" placeholder="(11) 90000-0000" /></label>
              <label className="ap-campo">E-mail<input type="email" value={d.email} onChange={set("email")} autoComplete="email" /></label>
              <label className="ap-campo">Negócio, ramo e cidade<input value={d.negocio} onChange={set("negocio")} /></label>
              <label className="ap-campo">Número de funcionários
                <select value={d.funcionarios} onChange={set("funcionarios")}>
                  <option value="">selecione</option>
                  {FUNCIONARIOS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </label>
              <label className="ap-campo">Interesse
                <select value={d.interesse} onChange={set("interesse")}>
                  <option value="">selecione</option>
                  {INTERESSES.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </label>
              <label className="ap-campo is-largo">Qual é hoje a sua maior dor no negócio?<textarea rows={3} value={d.dor} onChange={set("dor")} /></label>
              <label className="ap-hp" aria-hidden="true">Site<input tabIndex={-1} autoComplete="off" value={d.site} onChange={set("site")} /></label>
              {erro && <div className="ap-erro">{erro}</div>}
              <div className="ap-acoes">
                <button type="submit" className="ap-botao" disabled={fase === "enviando"}>{fase === "enviando" ? "Enviando…" : "Agendar diagnóstico"}</button>
                <span className="ap-lgpd">Seus dados são usados apenas para o contato, conforme a LGPD.</span>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
