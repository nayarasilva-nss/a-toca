import { useState } from "react";
import { AvisoErro, BotaoPrimario } from "../componentes/ui.jsx";
import { CORES } from "../nucleo/base.jsx";
import { HeaderModulo } from "../telas/hub.jsx";

// ─── Módulo: Conselheira ───────────────────────────────────────────

export function ModuloPenseira({ cliente, mensagens, gerando, erro, onEnviar, onLimpar, onVoltar }) {
  const [texto, setTexto] = useState("");

  const enviar = () => {
    const t = texto.trim();
    if (!t || gerando) return;
    setTexto("");
    onEnviar(t);
  };

  return (
    <div className="pb-16">
      <HeaderModulo
        titulo="Conselheira"
        cliente={cliente}
        onVoltar={onVoltar}
        acoes={null}
      />
      <div style={{ maxWidth: "1000px", margin: "0 auto", paddingLeft: "32px", paddingRight: "32px" }}>
        <div className="rounded-lg shadow-sm flex flex-col" style={{ background: CORES.papel, border: "2px solid var(--linha)", minHeight: "60vh" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--fundo-recuo)" }}>
          <div>
            <p className="text-xs" style={{ color: CORES.textoDim }}>
              Pense em voz alta sobre {cliente.negocio}. Dúvidas trabalhistas vêm com base legal.
            </p>
          </div>
          {mensagens.length > 0 && (
            <button onClick={onLimpar} className="enz-link" style={{ textTransform: "none", letterSpacing: 0, fontSize: 12 }} style={{ color: "var(--ouro-texto)" }}>
              Limpar conversa
            </button>
          )}
        </div>

        <div className="flex-1 px-6 py-4 overflow-y-auto" style={{ maxHeight: "55vh" }}>
          {mensagens.length === 0 && !gerando && (
            <p className="text-sm py-8 text-center font-serif italic" style={{ color: "var(--tinta-musgo)" }}>
              Despeje um pensamento — "o cliente quer proibir calça azul, pode?" — e examine-o com clareza.
            </p>
          )}
          {mensagens.map((m, i) => (
            <div key={i} className={`mb-3 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[85%] px-4 py-2.5 rounded-lg text-sm whitespace-pre-line"
                style={
                  m.role === "user"
                    ? { background: CORES.fogo, color: "var(--fundo-elevado)" }
                    : { background: CORES.cartao, border: "2px solid var(--linha)", color: CORES.fogoEscuro }
                }
              >
                {m.content}
              </div>
            </div>
          ))}
          {gerando && (
            <div className="flex justify-start mb-3">
              <div className="px-4 py-2.5 rounded-lg text-sm font-serif italic" style={{ background: CORES.cartao, border: "2px solid var(--linha)", color: CORES.dourado }}>
                Pensando...
              </div>
            </div>
          )}
          <AvisoErro erro={erro} />
        </div>

        <div className="px-6 py-4 border-t flex gap-2" style={{ borderColor: "var(--fundo-recuo)" }}>
          <textarea
            rows={2}
            className="flex-1 px-3 py-2 rounded border bg-creme text-sm outline-none resize-none"
            style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }}
            placeholder="Escreva seu pensamento ou dúvida..."
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                enviar();
              }
            }}
          />
          <BotaoPrimario onClick={enviar} disabled={gerando || !texto.trim()}>
            Enviar
          </BotaoPrimario>
        </div>
      </div>
    </div>
    </div>
  );
}
