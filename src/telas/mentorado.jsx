import { CORES } from "../nucleo/base.jsx";
import { ArvoreEnraizar } from "../componentes/arvore.jsx";

export function AreaMentorado({ usuario, onSair }) {
  const primeiroNome = (usuario.nome || "").split(" ")[0];
  return (
    <div style={{ minHeight: "100vh", background: CORES.fundoPrincipal }}>
      <header className="px-4 sm:px-8 py-4 sm:py-6 flex flex-wrap items-center justify-between gap-3" style={{ background: CORES.fundoPrincipal, borderBottom: `2px solid ${CORES.dourado}` }}>
        <div className="font-serif" style={{ fontSize: 26, fontWeight: 800, letterSpacing: 2, color: CORES.dourado }}>ENRAIZAR</div>
        <button onClick={onSair} className="text-xs uppercase font-semibold" style={{ background: "none", border: "none", cursor: "pointer", color: CORES.principal, letterSpacing: 1, fontFamily: "'Lora', serif" }}>
          Sair
        </button>
      </header>
      <main className="max-w-2xl mx-auto mt-12 px-6 pb-16 text-center">
        <ArvoreEnraizar tamanho={90} cor={CORES.verde} />
        <h1 className="font-serif" style={{ fontSize: "28px", color: CORES.principal, marginTop: "16px" }}>Oi, {primeiroNome}</h1>
        <p style={{ fontSize: "15px", color: CORES.textoDim, marginTop: "12px", lineHeight: 1.7, fontFamily: "'Lora', serif" }}>
          Sua área de mentoria está sendo preparada. Em breve você verá aqui seus encontros, metas, materiais e o registro da sua evolução.
        </p>
      </main>
    </div>
  );
}
