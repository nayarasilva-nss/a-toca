import { chamarIA, extrairJSON } from "./base.jsx";

// ─── Cronograma ─────────────────────────────────────────────────

export function parseDataBR(str) {
  if (!str) return null;
  const m = String(str).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!m) return null;
  const ano = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
  const d = new Date(ano, Number(m[2]) - 1, Number(m[1]));
  return isNaN(d.getTime()) ? null : d;
}

export function semanaAtualDe(inicio, duracao) {
  const d = parseDataBR(inicio);
  if (!d) return null;
  const diff = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 0; // ainda não começou
  const sem = Math.floor(diff / 7) + 1;
  const total = Number(duracao) || 0;
  return total > 0 ? Math.min(sem, total + 1) : sem;
}

export function intervaloSemana(inicio, w) {
  const d = parseDataBR(inicio);
  if (!d || !w) return "";
  const ini = new Date(d.getTime() + (w - 1) * 7 * 86400000);
  const fim = new Date(ini.getTime() + 6 * 86400000);
  const fmt = (x) => `${String(x.getDate()).padStart(2, "0")}/${String(x.getMonth() + 1).padStart(2, "0")}`;
  return `${fmt(ini)}–${fmt(fim)}`;
}

export function acoesNumeradas(frentes) {
  const lista = [];
  (frentes || []).forEach((f) => {
    (f.acoes || []).forEach((a) => {
      lista.push({ frenteId: f.id, frenteNome: f.nome, acao: a });
    });
  });
  return lista;
}

export async function distribuirCronograma(cliente, gestao) {
  const todas = acoesNumeradas(gestao.frentes);
  const numeradas = todas.filter((x) => !x.acao.feita && !x.acao.semana);
  if (numeradas.length === 0) return {};
  const jaMarcadas = todas
    .filter((x) => x.acao.semana)
    .map((x) => `semana ${x.acao.semana}: ${x.acao.texto}`)
    .join("; ");
  const linhas = numeradas.map((x, i) => `${i + 1}. [${x.frenteNome}] ${x.acao.texto}`).join("\n");
  const duracao = Number(gestao.duracaoSemanas) || 10;

  const prompt = `Você é especialista em planejamento de consultorias para PMEs brasileiras. Distribua as ações abaixo ao longo de ${duracao} semanas de projeto, respeitando dependências lógicas (diagnóstico/estrutura antes de documentos; documentos antes de treinamento/implantação) e equilibrando a carga semanal.

CLIENTE: ${cliente.negocio} (${cliente.segmento})

AÇÕES PENDENTES A DISTRIBUIR (numeradas — apenas estas)
${linhas}
${jaMarcadas ? `Ações já alocadas (NÃO redistribua; use como referência de carga): ${jaMarcadas}` : ""}

Responda APENAS com JSON compacto de uma linha, uma entrada por ação:
{"s":[{"n":número da ação,"w":semana de 1 a ${duracao}}]}
Sem markdown, sem texto fora do JSON.`;

  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  const mapa = {};
  for (const item of obj.s || []) {
    const idx = Number(item.n) - 1;
    const w = Number(item.w);
    if (numeradas[idx] && w >= 1 && w <= duracao) {
      mapa[numeradas[idx].acao.id] = w;
    }
  }
  return mapa;
}
