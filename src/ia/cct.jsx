import { extrairJSON } from "./base.jsx";
import { uid } from "../nucleo/base.jsx";

// ─── IA: Análise da CCT (PDF) ───────────────────────────────────

export async function analisarCCT(cliente, base64pdf, pontosExistentes) {
  const temExistentes = pontosExistentes && pontosExistentes.length > 0;
  const listaExistente = temExistentes
    ? pontosExistentes.map((p, i) => `${i + 1}. [${p.tema}] ${p.exigencia}`).join("\n")
    : "";

  const tarefa = temExistentes
    ? `PONTOS JÁ EXTRAÍDOS DE DOCUMENTOS ANTERIORES (numerados):
${listaExistente}

O documento anexo pode ser a CCT principal, um TERMO ADITIVO ou uma nova versão. Compare com os pontos acima e responda APENAS com as MUDANÇAS, em JSON compacto de uma linha:
{"rm":[números de pontos SUPERADOS ou revogados pelo documento],"ed":[{"n":número,"o":"novo texto da exigência atualizada"}],"add":[{"t":"tema curto","o":"nova exigência em 1 frase objetiva com números quando houver","d":"manual|tabela|cargos|geral"}]}
Se um ponto continua válido e inalterado, NÃO o mencione. Máximo 10 itens em "add".`
    : `TAREFA: extraia da CCT os pontos que NÃO PODEM FALTAR ou NÃO PODEM SER CONTRARIADOS na documentação interna da empresa (manual do colaborador, tabela disciplinar, descrições de cargo, jornada, políticas). Foque no que impacta regras internas: jornada e intervalos, banco de horas/hora extra, adicionais, uniforme (quem paga/lava), alimentação, faltas e atestados, medidas disciplinares, estabilidades, e qualquer vedação relevante. Ignore cláusulas puramente sindicais/administrativas sem efeito nas regras internas.

Responda APENAS com JSON compacto de uma linha (máx. 14 pontos, os mais relevantes):
{"p":[{"t":"tema curto","o":"o que a CCT exige/veda, em 1 frase objetiva com números quando houver","d":"manual|tabela|cargos|geral"}]}`;

  const response = await fetch("/api/ia", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64pdf } },
            {
              type: "text",
              text: `Você é especialista em direito do trabalho e governança de PMEs brasileiras. O documento anexo é uma convenção coletiva de trabalho (CCT) ou termo aditivo aplicável ao cliente abaixo.

CLIENTE
Negócio: ${cliente.negocio}
Segmento: ${cliente.segmento}

${tarefa}
Sem markdown, sem texto fora do JSON.`,
            },
          ],
        },
      ],
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  const texto = data.text || "";
  const obj = extrairJSON(texto, "{", "}");

  if (!temExistentes) {
    return (obj.p || [])
      .filter((p) => p && p.t && p.o)
      .map((p) => ({ id: uid(), tema: p.t, exigencia: p.o, destino: p.d || "geral" }));
  }

  // Aplicar diff sobre os pontos existentes
  const remover = new Set((obj.rm || []).map(Number));
  const edicoes = {};
  for (const e of obj.ed || []) {
    if (e && e.n) edicoes[Number(e.n)] = e;
  }
  const mantidos = pontosExistentes
    .map((p, i) => {
      const n = i + 1;
      if (remover.has(n)) return null;
      const ed = edicoes[n];
      return ed && ed.o ? { ...p, exigencia: ed.o } : p;
    })
    .filter(Boolean);
  const novos = (obj.add || [])
    .filter((p) => p && p.t && p.o)
    .map((p) => ({ id: uid(), tema: p.t, exigencia: p.o, destino: p.d || "geral" }));
  return [...mantidos, ...novos];
}

export function blocoCCT(pontos) {
  if (!pontos || pontos.length === 0) return "";
  const linhas = pontos.map((p) => `- [${p.tema}] ${p.exigencia}`).join("\n");
  return `\nEXIGÊNCIAS DA CCT DESTE CLIENTE (extraídas do documento oficial — respeite TODAS obrigatoriamente; em conflito com qualquer outra instrução, a CCT prevalece):\n${linhas}\n`;
}
