import { chamarIA, extrairJSON } from "./base.jsx";

// ─── IA: Relatório de Encerramento ──────────────────────────────

export async function gerarRelatorio(cliente, rel, resumo) {
  const prompt = `Você é especialista em consultoria de governança para PMEs brasileiras, redigindo o relatório de encerramento do engajamento da consultora Nayara Silva. Tom: profissional, concreto, orgulhoso do que foi feito sem inflar — números e fatos acima de adjetivos.

CLIENTE
Negócio: ${cliente.negocio} (${cliente.segmento})

DADOS DO ENGAJAMENTO (reais, extraídos do sistema)
${resumo}

Observações da consultora: ${rel.obs || "nenhuma"}

Responda APENAS com JSON compacto de uma linha:
{"re":"retrospectiva do engajamento — de onde o cliente partiu e o que foi feito (3-5 frases)","rs":["resultados mensuráveis, um por item, citando os números antes/depois quando existirem"],"en":["entregas realizadas, uma por item, concretas"],"rc":["3 a 5 recomendações de continuidade práticas, em ordem de prioridade"],"pr":"sugestão de próximo passo com a consultoria (1-2 frases, sem pressão)"}
Sem markdown, sem texto fora do JSON.`;

  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  const linhas = (v) => (Array.isArray(v) ? v.join("\n") : v || "");
  return {
    retrospectiva: obj.re || "",
    resultados: linhas(obj.rs),
    entregas: linhas(obj.en),
    recomendacoes: linhas(obj.rc),
    proximoPasso: obj.pr || "",
  };
}
