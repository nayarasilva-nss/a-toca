import { useEffect, useState } from "react";
import { ArvoreEnraizar } from "../componentes/arvore.jsx";
import { TituloSecao, Citacao } from "../componentes/enraizar.jsx";
import { BotaoPrimario } from "../componentes/ui.jsx";
import { ESCALA_PERCEPCAO } from "../nucleo/percepcao.jsx";

const NAO_OBSERVO = "x";

function Moldura({ children }) {
  return (
    <div data-theme="floresta" className="min-h-screen" style={{ background: "var(--fundo)", color: "var(--tinta)" }}>
      <header className="enz-cabecalho">
        <span className="enz-cabecalho-nome">
          <span className="enz-marca">Enraizar</span>
          <span className="enz-rotulo enz-assinatura">Método · Nayara Silva</span>
        </span>
      </header>
      <main className="enz-container" style={{ maxWidth: 760 }}>{children}</main>
    </div>
  );
}

export function PaginaResponder() {
  const token = new URLSearchParams(window.location.search).get("t") || "";
  const [estado, setEstado] = useState({ fase: "carregando" });
  const [notas, setNotas] = useState({});
  const [bem, setBem] = useState("");
  const [mudar, setMudar] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    fetch(`/api/percepcao?t=${encodeURIComponent(token)}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Link inválido");
        setEstado({ fase: d.respondido ? "respondido" : "pronto", convite: d });
      })
      .catch((e) => setEstado({ fase: "erro", mensagem: e.message }));
  }, [token]);

  const enviar = async () => {
    if (enviando) return;
    setEnviando(true);
    setErro(null);
    try {
      const limpas = Object.fromEntries(Object.entries(notas).filter(([, v]) => v !== NAO_OBSERVO));
      const r = await fetch("/api/percepcao", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ t: token, notas: limpas, bem, mudar }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Não foi possível enviar");
      setEstado({ fase: "obrigada" });
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  };

  if (estado.fase === "carregando") return <Moldura><p className="enz-nota">abrindo o questionário…</p></Moldura>;
  if (estado.fase === "erro") return <Moldura><TituloSecao rotulo="Percepção" titulo="Este link não está disponível." descricao={estado.mensagem} /></Moldura>;
  if (estado.fase === "respondido") return <Moldura><TituloSecao rotulo="Percepção" titulo="Você já respondeu." virada="Obrigada pelo tempo." /></Moldura>;
  if (estado.fase === "obrigada") {
    return (
      <Moldura>
        <div className="grid gap-10 items-center lg:grid-cols-[minmax(0,1fr)_240px]">
          <div>
            <TituloSecao rotulo="Enviado" titulo="Obrigada." virada="Sua percepção ajuda alguém a enxergar o que sozinho não vê." />
            <div style={{ marginTop: 32 }}><Citacao>Todo crescimento começa em quem enraíza.</Citacao></div>
          </div>
          <div className="hidden lg:block"><ArvoreEnraizar variante="frutos" tamanho={220} /></div>
        </div>
      </Moldura>
    );
  }

  const { convite } = estado;
  const total = convite.areas.reduce((s, a) => s + a.criterios.length, 0);
  const respondidas = Object.keys(notas).length;
  const primeiro = (convite.mentorado || "").split(" ")[0];

  return (
    <Moldura>
      <TituloSecao
        rotulo="Percepção do entorno"
        titulo={`Como você vê ${primeiro}?`}
        virada="Leva uns cinco minutos. Não há resposta certa."
        descricao={`Você está respondendo como ${(convite.rotuloPapel || "").toLowerCase()}. Suas respostas chegam à mentora e entram na leitura de forma agregada — ${primeiro} não vê quem respondeu o quê. Marque com que frequência observa cada comportamento; se não tem como observar, deixe em "não observo".`}
      />

      {convite.areas.map((a, aIdx) => (
        <section key={a.area} style={{ marginTop: 40 }}>
          <span className="enz-rotulo" style={{ marginBottom: 8 }}>{a.area}</span>
          {a.criterios.map((cr, cIdx) => {
            const k = `${aIdx}-${cIdx}`;
            return (
              <div key={k} className="enz-card enz-card-vazado" style={{ padding: "16px 0" }}>
                <div style={{ marginBottom: 10 }}>{cr}</div>
                <div className="flex gap-2 flex-wrap">
                  {ESCALA_PERCEPCAO.map((rot, v) => (
                    <button key={v} type="button" onClick={() => setNotas({ ...notas, [k]: v })} className={`enz-botao enz-botao-contorno enz-botao-pequeno ${notas[k] === v ? "is-ativo" : ""}`}>
                      {notas[k] === v && <span className="enz-ponto" style={{ color: "var(--ouro)" }} />}{rot}
                    </button>
                  ))}
                  <button type="button" onClick={() => setNotas({ ...notas, [k]: NAO_OBSERVO })} className="enz-link" style={{ opacity: notas[k] === NAO_OBSERVO ? 1 : 0.7 }}>
                    {notas[k] === NAO_OBSERVO ? "● " : ""}não observo
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      ))}

      <section style={{ marginTop: 40 }}>
        <span className="enz-rotulo" style={{ marginBottom: 8 }}>Em suas palavras</span>
        <div className="enz-campo" style={{ marginTop: 12 }}>
          <label className="enz-rotulo">O que {primeiro} faz bem</label>
          <textarea className="enz-input" value={bem} onChange={(e) => setBem(e.target.value)} style={{ minHeight: 90 }} placeholder="uma ou duas situações concretas valem mais que adjetivos" />
        </div>
        <div className="enz-campo">
          <label className="enz-rotulo">O que precisaria mudar</label>
          <textarea className="enz-input" value={mudar} onChange={(e) => setMudar(e.target.value)} style={{ minHeight: 90 }} placeholder="o que, se mudasse, faria diferença para você" />
        </div>
      </section>

      {erro && <div className="enz-aviso-erro" role="alert">{erro}</div>}
      <div className="flex items-center gap-4 flex-wrap" style={{ marginTop: 8 }}>
        <BotaoPrimario onClick={enviar} disabled={enviando || respondidas === 0}>{enviando ? "Enviando…" : "Enviar"}</BotaoPrimario>
        <span className="enz-legenda">{respondidas} de {total} respondidas</span>
      </div>
    </Moldura>
  );
}
