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
  // barra do sistema (celular e app instalado) na cor do fundo do tema
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", tema === "floresta" ? "#1e3226" : "#f6f2e8");
  try {
    localStorage.setItem(CHAVE, tema);
  } catch {}
}
