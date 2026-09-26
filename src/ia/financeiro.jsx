// ─── Financeiro: utilitários ────────────────────────────────────

export function parseValorBR(str) {
  if (!str) return 0;
  const limpo = String(str).replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const n = parseFloat(limpo);
  return isNaN(n) ? 0 : n;
}

export function formatarBR(n) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
