// ─── IA: chamada base ───────────────────────────────────────────

export async function chamarIA(prompt) {
  const response = await fetch("/api/ia", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.text || "";
}

export async function comRetentativa(fn) {
  try {
    return await fn();
  } catch (e) {
    // resposta truncada ou ilegível — tenta uma segunda vez antes de desistir
    return await fn();
  }
}

export function extrairJSON(texto, abre, fecha) {
  const limpo = texto.replace(/```json|```/g, "").trim();
  const inicio = limpo.indexOf(abre);
  const fim = limpo.lastIndexOf(fecha);
  return JSON.parse(limpo.slice(inicio, fim + 1));
}

export const LIMITES_LEGAIS = `LIMITES LEGAIS (obrigatórios — nada pode violar a CLT nem a convenção coletiva/CCT do setor e região do cliente):
- Nunca crie infração ou exigência que puna exercício de direito: atestado médico válido, faltas legais (casamento, luto, paternidade, doação de sangue), licenças, atividade sindical, recusa de trabalho em risco grave e iminente.
- Nenhuma medida pode envolver multa em dinheiro, desconto salarial punitivo ou redução de benefício.
- Se uma regra própria do cliente conflitar com a CLT ou com CCT usual do setor, NÃO a inclua.`;
