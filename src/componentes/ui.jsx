import { useState, useEffect } from "react";
import { CORES } from "../nucleo/base.jsx";

// ─── Toast (Notificação) ────────────────────────────────────────
export function Toast({ mensagem, tipo = "info" }) {
  const cores = {
    info: { bg: "#E8DFD3", txt: "#6B5D42" },
    sucesso: { bg: "#D8E5D0", txt: "#3C5A2B" },
    aviso: { bg: "#F2E3CB", txt: "#9A6A2F" }
  };
  const cor = cores[tipo] || cores.info;

  return (
    <div style={{
      position: "fixed",
      bottom: "24px",
      right: "24px",
      background: cor.bg,
      color: cor.txt,
      padding: "16px 24px",
      borderRadius: "8px",
      border: `1px solid ${cor.txt}`,
      fontSize: "13px",
      fontFamily: "'Lora', serif",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      maxWidth: "300px",
      zIndex: 999,
      animation: "slideIn 0.3s ease-out"
    }}>
      {mensagem}
    </div>
  );
}


// ─── CardModulo (Exibe um módulo dentro de uma fase) ────────────


// ─── TelaDeFases (Dashboard principal com as 6 fases) ────────────
export function BotaoPrimario({ children, onClick, disabled, style }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded text-white disabled:opacity-60 transition-colors hover:opacity-90"
      style={{
        fontFamily: "'Lora', serif",
        fontSize: "13px",
        fontWeight: "600",
        letterSpacing: "1px",
        padding: "12px 16px",
        background: CORES.fogo,
        color: "white",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        ...style
      }}
    >
      {children}
    </button>
  );
}

export function BotaoContorno({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded transition-colors hover:opacity-80"
      style={{
        fontFamily: "'Lora', serif",
        fontSize: "13px",
        fontWeight: "600",
        letterSpacing: "1px",
        padding: "12px 16px",
        border: `1px solid ${CORES.laranja}`,
        background: "transparent",
        color: CORES.fogo,
        cursor: "pointer"
      }}
    >
      {children}
    </button>
  );
}

export function InputField({ label, placeholder, value, onChange, type = "text", required = false, color = CORES.verde }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      {label && (
        <label
          style={{
            display: "block",
            fontFamily: "'Lora', serif",
            fontSize: "12px",
            letterSpacing: "2px",
            color: color,
            textTransform: "uppercase",
            marginBottom: "10px",
            fontWeight: "700"
          }}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        style={{
          width: "100%",
          padding: "14px 16px",
          border: `2px solid ${color === CORES.verde ? CORES.verdeClaro : CORES.dourado}20`,
          borderRadius: "8px",
          fontFamily: "'Lora', serif",
          fontSize: "14px",
          background: CORES.fundoPrincipal,
          color: CORES.principal,
          outline: "none",
          transition: "all 0.3s ease",
          boxSizing: "border-box"
        }}
        onFocus={(e) => {
          e.target.style.borderColor = CORES.dourado;
          e.target.style.boxShadow = `0 0 0 3px ${CORES.dourado}20`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = color === CORES.verde ? CORES.verdeClaro : `${CORES.dourado}20`;
          e.target.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

export const FRASES_TRABALHANDO = [
  "Organizando as ideias...",
  "Estruturando o conteúdo...",
  "Revisando os detalhes...",
  "Quase pronto...",
];

export function ConfirmarAcao({ rotulo, aviso, onConfirmar, classe }) {
  const [pendente, setPendente] = useState(false);
  useEffect(() => {
    if (!pendente) return;
    const t = setTimeout(() => setPendente(false), 5000);
    return () => clearTimeout(t);
  }, [pendente]);
  return (
    <button
      onClick={() => {
        if (pendente) {
          setPendente(false);
          onConfirmar();
        } else {
          setPendente(true);
        }
      }}
      className={classe || "text-xs underline"}
      style={{ color: "#8A3A2E", fontWeight: pendente ? 700 : 400 }}
    >
      {pendente ? `Clique de novo para confirmar — ${aviso}` : rotulo}
    </button>
  );
}

export function Trabalhando() {
  const [frase] = useState(() => FRASES_TRABALHANDO[Math.floor(Math.random() * FRASES_TRABALHANDO.length)]);
  return (
    <div className="py-10 text-center font-serif italic" style={{ color: CORES.dourado }}>
      ENRAIZAR está trabalhando — {frase}
    </div>
  );
}

export function AvisoErro({ erro }) {
  if (!erro) return null;
  const eLimite = /rate limit/i.test(erro);
  return (
    <div className="mb-4 p-3 rounded text-sm" style={{ background: "#F0DCD2", color: "#8A3A2E" }}>
      {eLimite
        ? "Limite de gerações atingido por agora. Recarregue a página e tente de novo em alguns minutos; o que você digitou está salvo."
        : `Não foi possível conectar. Verifique a conexão e tente de novo. (${erro})`}
    </div>
  );
}
