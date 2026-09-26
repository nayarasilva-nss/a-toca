import { useState } from "react";
import { CORES } from "../nucleo/base.jsx";
import { ArvoreEnraizar } from "../componentes/arvore.jsx";
import { InputField } from "../componentes/ui.jsx";

export async function chamarAuth(acao, corpo) {
  const r = await fetch(`/api/auth?acao=${acao}`, {
    method: corpo === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json" },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });
  if (!(r.headers.get("content-type") || "").includes("application/json")) throw new Error("sem-api");
  const dados = await r.json();
  if (!r.ok) throw new Error(dados.error || `HTTP ${r.status}`);
  return dados;
}

export function TelaLogin({ precisaConfigurar, onEntrar }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const valido = precisaConfigurar
    ? nome.trim() && email.trim() && senha.length >= 8 && senha === confirmacao
    : email.trim() && senha;

  const enviar = async (e) => {
    e.preventDefault();
    if (!valido || enviando) return;
    setEnviando(true);
    setErro(null);
    try {
      const { usuario } = await chamarAuth(precisaConfigurar ? "configurar" : "entrar", precisaConfigurar ? { nome, email, senha } : { email, senha });
      onEntrar(usuario);
    } catch (err) {
      setErro(err.message === "sem-api" ? "Servidor indisponível. Tente de novo em instantes." : err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", background: `linear-gradient(135deg, ${CORES.fundoPrincipal} 0%, ${CORES.cartao} 55%, ${CORES.hover} 100%)` }}>
      <form onSubmit={enviar} style={{ width: "100%", maxWidth: "420px", background: CORES.cartao, borderRadius: "16px", boxShadow: "0 12px 40px rgba(75, 64, 53, 0.14)", borderTop: `4px solid ${CORES.dourado}`, padding: "40px 36px 32px", boxSizing: "border-box" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <ArvoreEnraizar tamanho={72} cor={CORES.dourado} />
          <div className="font-serif" style={{ fontSize: "30px", fontWeight: 800, letterSpacing: "3px", color: CORES.dourado, marginTop: "10px" }}>ENRAIZAR</div>
          <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: CORES.textoDim, marginTop: "4px", fontFamily: "'Lora', serif" }}>Desenvolvimento Organizacional</div>
          <p style={{ fontSize: "13px", fontStyle: "italic", color: CORES.principalClaro, marginTop: "14px", fontFamily: "'Lora', serif" }}>
            {precisaConfigurar ? "Primeiro acesso: crie a conta da consultora." : "Todo crescimento começa em quem enraiza."}
          </p>
        </div>

        {precisaConfigurar && <InputField label="Seu nome" value={nome} onChange={setNome} placeholder="Ex.: Nayara Silva" />}
        <InputField label="E-mail" type="email" value={email} onChange={setEmail} placeholder="voce@exemplo.com" />
        <InputField label="Senha" type="password" value={senha} onChange={setSenha} placeholder={precisaConfigurar ? "Mínimo de 8 caracteres" : "Sua senha"} />
        {precisaConfigurar && <InputField label="Confirmar senha" type="password" value={confirmacao} onChange={setConfirmacao} placeholder="Repita a senha" />}

        {precisaConfigurar && senha && confirmacao && senha !== confirmacao && (
          <p style={{ fontSize: "12px", color: "#8A3A2E", marginTop: "-12px", marginBottom: "16px", fontFamily: "'Lora', serif" }}>As senhas não conferem.</p>
        )}
        {erro && (
          <div style={{ marginBottom: "16px", padding: "12px 14px", borderRadius: "8px", background: "#F5DDD6", color: "#8A3A2E", fontSize: "13px", fontFamily: "'Lora', serif" }}>{erro}</div>
        )}

        <button
          type="submit"
          disabled={!valido || enviando}
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: "8px",
            border: "none",
            fontFamily: "'Lora', serif",
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "1px",
            cursor: valido && !enviando ? "pointer" : "not-allowed",
            background: valido ? `linear-gradient(135deg, ${CORES.verde} 0%, ${CORES.verdeEscuro} 100%)` : CORES.fundoPrincipal,
            color: valido ? CORES.cartao : CORES.textoDim,
            boxShadow: valido ? `0 4px 12px ${CORES.verde}40` : "none",
            opacity: enviando ? 0.7 : 1,
            transition: "all 0.3s ease",
          }}
        >
          {enviando ? "Entrando..." : precisaConfigurar ? "Criar conta e entrar" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
