import { useEffect, useState } from "react";
import { Ilustracao } from "./arvore.jsx";

export function BotaoPrimario({ children, onClick, disabled, type = "button", style, className = "", pequeno }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={style} className={`enz-botao enz-botao-primario ${pequeno ? "enz-botao-pequeno" : ""} ${className}`}>
      {children}
    </button>
  );
}

export function BotaoContorno({ children, onClick, disabled, type = "button", style, className = "", pequeno, ativo }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={style} className={`enz-botao enz-botao-contorno ${pequeno ? "enz-botao-pequeno" : ""} ${ativo ? "is-ativo" : ""} ${className}`}>
      {ativo && <span className="enz-ponto" style={{ color: "var(--ouro)" }} />}
      {children}
    </button>
  );
}

export function InputField({ label, placeholder, value, onChange, type = "text", required = false, id, ajuda }) {
  const campoId = id || (label ? "campo-" + label.toLowerCase().replace(/[^a-z0-9]+/g, "-") : undefined);
  return (
    <div className="enz-campo">
      {label && <label htmlFor={campoId} className="enz-rotulo">{label}</label>}
      <input id={campoId} className="enz-input" type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} required={required} />
      {ajuda && <div className="enz-ajuda">{ajuda}</div>}
    </div>
  );
}

export function Toast({ mensagem, tipo = "info" }) {
  return (
    <div role="status" className={`enz-toast enz-toast-${tipo}`}>
      <span className="enz-ponto" />
      <span>{mensagem}</span>
    </div>
  );
}

export const FRASES_TRABALHANDO = [
  "organizando as ideias",
  "estruturando o conteúdo",
  "revisando os detalhes",
  "quase pronto",
];

export function ConfirmarAcao({ rotulo, label, aviso, onConfirmar, classe = "" }) {
  const [pendente, setPendente] = useState(false);
  useEffect(() => {
    if (!pendente) return;
    const t = setTimeout(() => setPendente(false), 5000);
    return () => clearTimeout(t);
  }, [pendente]);
  return (
    <button
      type="button"
      onClick={() => {
        if (pendente) {
          setPendente(false);
          onConfirmar();
        } else {
          setPendente(true);
        }
      }}
      className={`enz-confirmar ${pendente ? "is-pendente" : ""} ${classe}`}
    >
      {pendente ? `Clique de novo para confirmar — ${aviso}` : rotulo || label}
    </button>
  );
}

export function Trabalhando({ frase }) {
  const [escolhida] = useState(() => frase || FRASES_TRABALHANDO[Math.floor(Math.random() * FRASES_TRABALHANDO.length)]);
  return (
    <div className="enz-trabalhando" aria-live="polite">
      <Ilustracao nome="broto-raiz" largura={56} altura={72} className="enz-trabalhando-broto" />
      <div className="enz-trabalhando-titulo">Enraizar está trabalhando</div>
      <div className="enz-trabalhando-frase">{escolhida}</div>
    </div>
  );
}

export function AvisoErro({ erro }) {
  if (!erro) return null;
  const eLimite = /rate limit/i.test(erro);
  return (
    <div className="enz-aviso-erro" role="alert">
      {eLimite
        ? "Limite de gerações atingido por agora. Recarregue a página e tente de novo em alguns minutos; o que você digitou está salvo."
        : `Não foi possível conectar. Verifique a conexão e tente de novo; o que você digitou está salvo. (${erro})`}
    </div>
  );
}
