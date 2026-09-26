const CHAVE = "enraizar:tema";

export function lerTema() {
  try {
    const t = localStorage.getItem(CHAVE);
    return t === "papel" ? "papel" : "floresta";
  } catch {
    return "floresta";
  }
}

export function aplicarTema(tema) {
  document.documentElement.dataset.theme = tema;
  try {
    localStorage.setItem(CHAVE, tema);
  } catch {}
}
