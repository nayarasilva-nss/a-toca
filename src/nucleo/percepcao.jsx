import { chaveNota, percentualArea } from "../ia/diagnostico.jsx";

export const PAPEIS = {
  chefe: "Chefe ou gestor",
  socio: "Sócio",
  par: "Colega ou par",
  time: "Pessoa do time",
  familia: "Família",
  outro: "Outro",
};

export const RODADAS = { inicio: "Início da jornada", fim: "Fim da jornada" };

export const ESCALA_PERCEPCAO = ["Nunca", "Às vezes", "Quase sempre", "Sempre"];

export const respondidos = (convites, rodada) => (convites || []).filter((c) => c.respostas && (!rodada || c.rodada === rodada));

// média por critério entre quem respondeu → notas no mesmo formato do diagnóstico
export function agregarPercepcoes(convites, framework, rodada) {
  const lista = respondidos(convites, rodada);
  if (!lista.length) return null;
  const notas = {};
  framework.forEach((a, aIdx) =>
    a.criterios.forEach((_, cIdx) => {
      const k = chaveNota(aIdx, cIdx);
      const vals = lista.map((c) => c.respostas.notas[k]).filter((v) => v !== undefined && v !== null && v !== "");
      if (vals.length) notas[k] = vals.reduce((s, v) => s + Number(v), 0) / vals.length;
    })
  );
  return { notas, total: lista.length, porArea: framework.map((_, i) => percentualArea(notas, i, framework)) };
}

export function resumoPercepcoesParaIA(convites, framework) {
  const partes = [];
  for (const rodada of ["inicio", "fim"]) {
    const ag = agregarPercepcoes(convites, framework, rodada);
    if (!ag) continue;
    const areas = framework.map((a, i) => (ag.porArea[i] !== null ? `${a.area} ${ag.porArea[i]}%` : null)).filter(Boolean).join(", ");
    const abertas = respondidos(convites, rodada)
      .map((c) => `[${PAPEIS[c.papel] || c.papel}] faz bem: ${c.respostas.bem || "—"} | precisaria mudar: ${c.respostas.mudar || "—"}`)
      .join("\n");
    partes.push(`Percepcao do entorno (${RODADAS[rodada]}, ${ag.total} resposta${ag.total > 1 ? "s" : ""}): ${areas}\n${abertas}`);
  }
  return partes.join("\n\n");
}
