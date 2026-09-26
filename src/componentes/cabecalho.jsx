import { CORES } from "../nucleo/base.jsx";

// ─── Componentes base ───────────────────────────────────────────

export function Cabecalho({ onHome, onClientes, usuario, onSair }) {
  return (
    <header
      className="px-4 sm:px-8 py-4 sm:py-6 flex flex-wrap items-center justify-between gap-3 print:hidden"
      style={{
        background: CORES.fundoPrincipal,
        borderBottom: `2px solid ${CORES.dourado}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <button onClick={onHome} className="text-left" style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
        <div
          className="font-serif text-[26px] sm:text-[32px]"
          style={{
            fontWeight: 800,
            letterSpacing: 2,
            color: CORES.dourado,
          }}
        >
          ENRAIZAR
        </div>
        <div className="fonte-corpo hidden sm:block" style={{ fontSize: 11, letterSpacing: 2, color: CORES.textoDim, textTransform: "uppercase" }}>
          Desenvolvimento Organizacional
        </div>
      </button>
      <div className="fonte-corpo italic text-sm hidden sm:block" style={{ color: CORES.textoDim }}>
        Todo crescimento começa em quem enraiza
      </div>
      <div className="flex items-center gap-3 flex-wrap">
      {onClientes && (
        <button
          onClick={onClientes}
          style={{
            background: "transparent",
            border: `2px solid ${CORES.principal}`,
            color: CORES.principal,
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "600",
            fontFamily: "'Lora', serif",
            letterSpacing: "1px",
          }}
        >
          🏢 Clientes
        </button>
      )}
        {usuario && onSair && (
          <button onClick={onSair} title={usuario.email} className="text-xs uppercase font-semibold" style={{ background: "none", border: "none", cursor: "pointer", color: CORES.textoDim, letterSpacing: 1, fontFamily: "'Lora', serif", padding: 0 }}>
            Sair
          </button>
        )}
      </div>
    </header>
  );
}
