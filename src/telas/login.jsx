import { useState } from "react";
import { ArvoreEnraizar } from "../componentes/arvore.jsx";
import { InputField, BotaoPrimario } from "../componentes/ui.jsx";

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
      setErro(err.message === "sem-api" ? "Servidor indisponível. Tente de novo em instantes; nada foi perdido." : err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div data-theme="floresta" className="min-h-screen flex items-center" style={{ background: "var(--fundo)", color: "var(--tinta)" }}>
      <div className="w-full max-w-5xl mx-auto px-6 py-12 sm:py-20 grid gap-12 items-center" style={{ gridTemplateColumns: "minmax(0, 1fr)" }}>
        <div className="grid gap-12 items-center lg:grid-cols-[minmax(0,440px)_1fr]">
          <div>
            <span className="enz-rotulo">Método</span>
            <h1 className="enz-titulo" style={{ fontSize: "clamp(56px, 9vw, 96px)", lineHeight: 0.95, letterSpacing: "-0.01em", marginTop: 12 }}>Enraizar</h1>
            <p className="enz-citacao" style={{ marginTop: 14 }}>
              <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 20, color: "var(--tinta-salvia)" }}>Todo crescimento começa em quem enraíza.</span>
            </p>

            <form onSubmit={enviar} className="enz-card enz-card-vazado" style={{ marginTop: 40, paddingBottom: 0 }}>
              <span className="enz-rotulo" style={{ marginBottom: 20 }}>{precisaConfigurar ? "Primeiro acesso" : "Entrar"}</span>
              {precisaConfigurar && (
                <p className="enz-nota" style={{ marginBottom: 20 }}>crie a conta da consultora. depois, quem entra aqui é você.</p>
              )}
              {precisaConfigurar && <InputField label="Seu nome" value={nome} onChange={setNome} placeholder="Nayara Silva" />}
              <InputField label="E-mail" type="email" value={email} onChange={setEmail} placeholder="voce@exemplo.com" />
              <InputField label="Senha" type="password" value={senha} onChange={setSenha} placeholder={precisaConfigurar ? "mínimo de 8 caracteres" : ""} />
              {precisaConfigurar && (
                <InputField
                  label="Confirmar senha"
                  type="password"
                  value={confirmacao}
                  onChange={setConfirmacao}
                  ajuda={senha && confirmacao && senha !== confirmacao ? "as senhas não conferem." : undefined}
                />
              )}
              {erro && <div className="enz-aviso-erro" role="alert">{erro}</div>}
              <div className="flex items-center gap-4 flex-wrap" style={{ marginTop: 4 }}>
                <BotaoPrimario type="submit" disabled={!valido || enviando}>
                  {enviando ? "Entrando…" : precisaConfigurar ? "Criar conta e entrar" : "Entrar"}
                </BotaoPrimario>
              </div>
            </form>
          </div>
          <div className="hidden lg:flex justify-center">
            <ArvoreEnraizar variante="raizes" tamanho={380} alt="A árvore do Método Enraizar: raízes maiores que a copa" />
          </div>
        </div>
      </div>
    </div>
  );
}
