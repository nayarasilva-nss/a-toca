import { CORES } from "../nucleo/base.jsx";

// ─── Árvore (Símbolo do Enraizar) ────────────────────────────────
export function ArvoreEnraizar({ tamanho = 140, cor = CORES.dourado }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 140 140" style={{ flexShrink: 0 }}>
      {/* Raízes */}
      <line x1="70" y1="70" x2="40" y2="120" stroke={cor} strokeWidth="2" strokeLinecap="round" />
      <line x1="70" y1="70" x2="60" y2="125" stroke={cor} strokeWidth="2" strokeLinecap="round" />
      <line x1="70" y1="70" x2="80" y2="125" stroke={cor} strokeWidth="2" strokeLinecap="round" />
      <line x1="70" y1="70" x2="100" y2="120" stroke={cor} strokeWidth="2" strokeLinecap="round" />

      {/* Tronco */}
      <line x1="70" y1="70" x2="70" y2="30" stroke={cor} strokeWidth="3" strokeLinecap="round" />

      {/* Galhos */}
      <line x1="70" y1="35" x2="50" y2="15" stroke={cor} strokeWidth="2" strokeLinecap="round" />
      <line x1="70" y1="35" x2="90" y2="15" stroke={cor} strokeWidth="2" strokeLinecap="round" />
      <line x1="70" y1="45" x2="45" y2="25" stroke={cor} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="70" y1="45" x2="95" y2="25" stroke={cor} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="70" y1="50" x2="40" y2="40" stroke={cor} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="70" y1="50" x2="100" y2="40" stroke={cor} strokeWidth="1.5" strokeLinecap="round" />

      {/* Centro */}
      <circle cx="70" cy="70" r="5" fill={cor} />
    </svg>
  );
}


// ─── CardFase (Visualização de cada fase do Enraizar) ────────────
