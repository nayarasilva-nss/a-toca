import { chamarIA, extrairJSON } from "./base.jsx";
import { FRAMEWORK_DIAG, percentualArea } from "./diagnostico.jsx";
import { uid } from "../nucleo/base.jsx";

// ─── IA: Indicadores ────────────────────────────────────────────

export async function gerarIndicadores(cliente, obs, cargos, ultimoDiag) {
  const listaCargos = cargos.map((c) => c.nome).filter(Boolean).join(", ") || "nenhum cadastrado";
  const areasFracas = ultimoDiag
    ? FRAMEWORK_DIAG.map((a, i) => {
        const p = percentualArea(ultimoDiag.notas, i);
        return p !== null && p < 50 ? `${a.area} (${p}%)` : null;
      }).filter(Boolean)
    : [];
  const blocoDiag = areasFracas.length
    ? `Áreas fracas no diagnóstico de maturidade: ${areasFracas.join(", ")} — priorize indicadores que iluminem a evolução dessas áreas.`
    : "";
  const prompt = `Você é especialista em gestão de pequenas e médias empresas brasileiras. Defina o painel de INDICADORES do cliente: poucos, mensuráveis com o que uma PME realmente tem, e acionáveis.

CLIENTE
Negócio: ${cliente.negocio}
Segmento: ${cliente.segmento}
Setores: ${cliente.setores || "não informado"}
Contexto: ${cliente.contexto || "não informado"}
Cargos (use como responsáveis quando couber): ${listaCargos}
Observações da consultora: ${obs || "nenhuma"}
${blocoDiag}

Regras:
- 8 a 14 indicadores nas áreas: Financeiro, Vendas, Operação, Pessoas, Cliente.
- "co" diz COMO medir na prática (fonte simples: sistema de vendas, planilha, contagem), sem exigir ferramenta que PME não tem.
- "mt" é uma meta de PARTIDA razoável para o segmento, marcada como sugestão (ex.: "sugestão: ≤ 3%").

Responda APENAS com JSON compacto de uma linha:
{"i":[{"a":"área","n":"nome do indicador","co":"como medir (1 frase)","mt":"meta sugerida","f":"frequência (diária/semanal/mensal)","r":"responsável"}]}
Sem markdown, sem texto fora do JSON.`;

  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  return (obj.i || [])
    .filter((x) => x && x.n)
    .map((x) => ({
      id: uid(),
      area: x.a || "Geral",
      nome: x.n,
      como: x.co || "",
      meta: x.mt || "",
      frequencia: x.f || "",
      responsavel: x.r || "",
    }));
}
