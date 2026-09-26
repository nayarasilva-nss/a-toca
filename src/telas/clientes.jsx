import { useState } from "react";
import { ConfirmarAcao, InputField } from "../componentes/ui.jsx";
import { CORES } from "../nucleo/base.jsx";

// ─── Clientes ───────────────────────────────────────────────────

export function FormCliente({ inicial, onSalvar, onCancelar, onExcluir }) {
  const [c, setC] = useState(
    inicial
      ? { tipo: "empresa", servicos: { consultoria: true, mentoria: false, treinamentos: false }, ...inicial }
      : { tipo: "empresa", negocio: "", segmento: "", setores: "", regras: "", contexto: "", servicos: { consultoria: true, mentoria: false, treinamentos: false } }
  );
  const set = (campo) => (v) => setC({ ...c, [campo]: v });
  const servicos = c.servicos || { consultoria: true, mentoria: false, treinamentos: false };
  const alternarServico = (chave) => setC({ ...c, servicos: { ...servicos, [chave]: !servicos[chave] } });
  const valido = c.negocio.trim() && c.segmento.trim();
  const ehPessoa = c.tipo === "pessoa";

  const definirTipo = (tipo) => {
    if (tipo === c.tipo) return;
    setC({ ...c, tipo });
  };

  return (
    <div style={{ maxWidth: "500px", margin: "32px auto", background: CORES.cartao, borderRadius: "12px", boxShadow: "0 4px 20px rgba(75, 64, 53, 0.12)", overflow: "hidden" }}>
      {/* Header com degradê bege → verde */}
      <div style={{
        padding: "40px 32px",
        background: `linear-gradient(135deg, ${CORES.verdeClaro} 0%, ${CORES.verde} 50%, ${CORES.dourado}20 100%)`,
        borderBottom: `3px solid ${CORES.dourado}`
      }}>
        <div style={{ fontSize: "28px", fontWeight: "700", color: CORES.cartao, marginBottom: "8px", fontFamily: "'Crimson Text', serif", letterSpacing: "1px" }}>
          {inicial ? "✏️ Editar" : "🌱 Novo Cliente"}
        </div>
        <div style={{ fontSize: "13px", color: CORES.cartao, opacity: "0.95", fontFamily: "'Lora', serif" }}>
          {inicial ? "Atualize as informações" : "Bem-vindo ao ENRAIZAR"}
        </div>
      </div>

      <div style={{ padding: "40px 32px" }}>
        {/* Tipo de Cliente */}
        <div style={{ marginBottom: "32px" }}>
          <label style={{ display: "block", fontFamily: "'Lora', serif", fontSize: "12px", letterSpacing: "2px", color: CORES.verde, textTransform: "uppercase", marginBottom: "14px", fontWeight: "700" }}>
            Tipo de Cliente
          </label>
          <div style={{ display: "flex", gap: "12px" }}>
            {[["empresa", "🏢 Empresa"], ["pessoa", "👤 Pessoa (Mentorado)"]].map(([chave, rotulo]) => (
              <button
                key={chave}
                onClick={() => definirTipo(chave)}
                style={{
                  flex: 1,
                  padding: "14px 16px",
                  borderRadius: "8px",
                  border: `2px solid ${c.tipo === chave ? CORES.dourado : CORES.verdeClaro}`,
                  fontFamily: "'Lora', serif",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  background: c.tipo === chave ? CORES.verde : CORES.fundoPrincipal,
                  color: c.tipo === chave ? CORES.cartao : CORES.verde,
                  transition: "all 0.3s ease",
                  boxShadow: c.tipo === chave ? `0 4px 12px ${CORES.verde}40` : "none"
                }}
              >
                {c.tipo === chave ? "✓ " : ""}{rotulo}
              </button>
            ))}
          </div>
        </div>

        {/* Campos de Texto */}
        <InputField label={ehPessoa ? "Nome da pessoa" : "Nome do negócio"} value={c.negocio} onChange={set("negocio")} placeholder={ehPessoa ? "Ex.: Carlos Andrade" : "Ex.: Caverna do Cheff"} color={CORES.verde} />
        <InputField label={ehPessoa ? "Atuação (cargo e empresa)" : "Segmento"} value={c.segmento} onChange={set("segmento")} placeholder={ehPessoa ? "Ex.: Gerente geral — restaurante" : "Ex.: Restaurante — hamburgueria artesanal"} color={CORES.verde} />
        {!ehPessoa && <InputField label="Setores / áreas" value={c.setores} onChange={set("setores")} placeholder="Ex.: Salão, Cozinha, Delivery, Estoque" color={CORES.verde} />}

        {/* Regras (apenas empresas) */}
        {!ehPessoa && (
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontFamily: "'Lora', serif", fontSize: "12px", letterSpacing: "2px", color: CORES.verde, textTransform: "uppercase", marginBottom: "10px", fontWeight: "700" }}>
              Regras próprias da casa
            </label>
            <textarea
              placeholder="Ex.: celular proibido; uniforme completo obrigatório"
              value={c.regras}
              onChange={(e) => set("regras")(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 16px",
                border: `2px solid ${CORES.verdeClaro}`,
                borderRadius: "8px",
                fontFamily: "'Lora', serif",
                fontSize: "14px",
                background: CORES.fundoPrincipal,
                color: CORES.principal,
                outline: "none",
                minHeight: "100px",
                boxSizing: "border-box",
                transition: "all 0.3s ease",
                resize: "vertical"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = CORES.dourado;
                e.target.style.boxShadow = `0 0 0 3px ${CORES.dourado}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = CORES.verdeClaro;
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
        )}

        {/* Contexto e Objetivos */}
        <div style={{ marginBottom: "32px" }}>
          <label style={{ display: "block", fontFamily: "'Lora', serif", fontSize: "12px", letterSpacing: "2px", color: CORES.verde, textTransform: "uppercase", marginBottom: "10px", fontWeight: "700" }}>
            {ehPessoa ? "Contexto e Objetivos" : "Contexto e Dores"}
          </label>
          <textarea
            placeholder={ehPessoa ? "Ex.: liderança recém-promovida; resistência do time" : "Ex.: atrasos recorrentes, desperdício"}
            value={c.contexto}
            onChange={(e) => set("contexto")(e.target.value)}
            style={{
              width: "100%",
              padding: "14px 16px",
              border: `2px solid ${CORES.verdeClaro}`,
              borderRadius: "8px",
              fontFamily: "'Lora', serif",
              fontSize: "14px",
              background: CORES.fundoPrincipal,
              color: CORES.principal,
              outline: "none",
              minHeight: "100px",
              boxSizing: "border-box",
              transition: "all 0.3s ease",
              resize: "vertical"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = CORES.dourado;
              e.target.style.boxShadow = `0 0 0 3px ${CORES.dourado}20`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = CORES.verdeClaro;
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Trilhas Contratadas */}
        <div style={{ marginBottom: "32px" }}>
          <label style={{ display: "block", fontFamily: "'Lora', serif", fontSize: "12px", letterSpacing: "2px", color: CORES.verde, textTransform: "uppercase", marginBottom: "14px", fontWeight: "700" }}>
            Trilhas Contratadas
          </label>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
            {[["consultoria", "📋 Consultoria"], ["mentoria", "🎯 Mentoria"], ["treinamentos", "📚 Treinamentos"]].map(([chave, rotulo]) => (
              <button
                key={chave}
                onClick={() => alternarServico(chave)}
                style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: `2px solid ${servicos[chave] ? CORES.dourado : CORES.verdeClaro}`,
                  fontFamily: "'Lora', serif",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  background: servicos[chave] ? `${CORES.dourado}15` : CORES.fundoPrincipal,
                  color: servicos[chave] ? CORES.principal : CORES.verde,
                  transition: "all 0.3s ease"
                }}
              >
                {servicos[chave] ? "✓ " : ""}{rotulo}
              </button>
            ))}
          </div>
          <p style={{ fontSize: "12px", marginBottom: "0", color: CORES.textoDim, fontFamily: "'Lora', serif", lineHeight: "1.5" }}>
            As trilhas definem as alas visíveis no ENRAIZAR. Treinamentos podem ser dentro da consultoria ou avulsos.
          </p>
        </div>

        {/* Botões de Ação */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
          <button
            onClick={() => valido && onSalvar(c)}
            disabled={!valido}
            style={{
              flex: 1,
              padding: "16px 24px",
              borderRadius: "8px",
              border: "none",
              fontFamily: "'Lora', serif",
              fontSize: "14px",
              fontWeight: "700",
              cursor: valido ? "pointer" : "not-allowed",
              background: valido ? `linear-gradient(135deg, ${CORES.verde} 0%, ${CORES.verdeEscuro} 100%)` : CORES.fundoPrincipal,
              color: valido ? CORES.cartao : CORES.textoDim,
              letterSpacing: "1px",
              transition: "all 0.3s ease",
              boxShadow: valido ? `0 4px 12px ${CORES.verde}40` : "none",
              opacity: valido ? 1 : 0.6
            }}
          >
            ✓ Salvar Cliente
          </button>
          <button
            onClick={onCancelar}
            style={{
              flex: 1,
              padding: "16px 24px",
              background: CORES.fundoPrincipal,
              color: CORES.principal,
              border: `2px solid ${CORES.principal}`,
              borderRadius: "8px",
              fontFamily: "'Lora', serif",
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer",
              letterSpacing: "1px",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = CORES.principal;
              e.target.style.color = CORES.cartao;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = CORES.fundoPrincipal;
              e.target.style.color = CORES.principal;
            }}
          >
            Cancelar
          </button>
        </div>

        {/* Excluir */}
        {inicial && onExcluir && (
          <div style={{ paddingTop: "24px", borderTop: `2px solid ${CORES.verdeClaro}` }}>
            <ConfirmarAcao
              label="Excluir este cliente"
              aviso="apaga documentos, planos, atas e histórico"
              onConfirmar={onExcluir}
              classe="text-xs underline"
            />
          </div>
        )}
      </div>
    </div>
  );
}
