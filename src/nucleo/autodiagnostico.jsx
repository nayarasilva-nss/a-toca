import { FRAMEWORK_DIAG, percentualArea } from "../ia/diagnostico.jsx";

// Autodiagnóstico do site (como o dono se vê) lado a lado com o Raio-X (como a consultora avaliou).
// As áreas são as mesmas do FRAMEWORK_DIAG; o casamento é pelo nome, sem diferenciar maiúsculas e acentos.

const normalizar = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

export const NIVEL_AUTODIAG = (pct) => (pct === null ? "—" : pct < 34 ? "Depende do dono" : pct < 67 ? "Em construção" : "Estruturado");

export function autodiagVisto(autodiag) {
  return !!(autodiag && Array.isArray(autodiag.areas) && autodiag.areas.length);
}

// linhas por área: dono (autodiagnóstico) × raiox (notas do diagnóstico) e a diferença em pontos
export function comparativoAutodiagnostico(autodiag, notas, framework = FRAMEWORK_DIAG) {
  const porNome = new Map((autodiag && autodiag.areas ? autodiag.areas : []).map((a) => [normalizar(a.area), a]));
  const linhas = framework.map((a, aIdx) => {
    const dono = porNome.get(normalizar(a.area));
    const donoPct = dono ? Number(dono.pct) : null;
    const raiox = notas ? percentualArea(notas, aIdx, framework) : null;
    const diff = donoPct !== null && raiox !== null ? donoPct - raiox : null;
    return { area: a.area, dono: donoPct, nivelDono: dono ? dono.nivel : null, raiox, diff };
  });
  const media = (xs) => { const v = xs.filter((x) => x !== null); return v.length ? Math.round(v.reduce((s, x) => s + x, 0) / v.length) : null; };
  const geralDono = media(linhas.map((l) => l.dono));
  const geralRaiox = media(linhas.map((l) => l.raiox));
  const maiorDistancia = linhas.filter((l) => l.diff !== null).sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))[0] || null;
  return { linhas, geralDono, geralRaiox, geralDiff: geralDono !== null && geralRaiox !== null ? geralDono - geralRaiox : null, maiorDistancia };
}

// frase curta sobre o que a distância diz
export function leituraDistancia(diff) {
  if (diff === null) return "";
  if (diff >= 20) return "o dono se vê bem melhor do que o Raio-X mostra";
  if (diff >= 8) return "o dono se vê um pouco melhor do que o Raio-X mostra";
  if (diff <= -20) return "o dono se vê bem pior do que o Raio-X mostra";
  if (diff <= -8) return "o dono se vê um pouco pior do que o Raio-X mostra";
  return "a visão do dono e o Raio-X batem";
}

export function resumoAutodiagParaIA(autodiag, notas) {
  if (!autodiagVisto(autodiag)) return "";
  const c = comparativoAutodiagnostico(autodiag, notas);
  const linhas = c.linhas.map((l) => `${l.area}: dono ${l.dono === null ? "—" : l.dono + "%"} · Raio-X ${l.raiox === null ? "não avaliada" : l.raiox + "%"}${l.diff !== null ? ` (${l.diff > 0 ? "+" : ""}${l.diff})` : ""}`).join("\n");
  return `COMO O DONO SE VÊ (autodiagnóstico respondido no site${autodiag.em ? ` em ${autodiag.em}` : ""}; ${autodiag.indice}% do negócio dependeria dele, na visão dele)
${linhas}
Use a distância entre a visão do dono e o Raio-X: onde ele se vê melhor do que está, a leitura precisa ajudar a enxergar; onde se vê pior, reconheça o que já funciona.`;
}
