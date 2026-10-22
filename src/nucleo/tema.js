const CHAVE = "enraizar:tema";

export function lerTema() {
  try {
    const t = localStorage.getItem(CHAVE);
    // sem escolha salva, começa no Papel: mais perto do site e mais confortável para longas sessões
    return t === "floresta" ? "floresta" : "papel";
  } catch {
    return "papel";
  }
}

export function aplicarTema(tema) {
  document.documentElement.dataset.theme = tema;
  try {
    localStorage.setItem(CHAVE, tema);
  } catch {}
}
