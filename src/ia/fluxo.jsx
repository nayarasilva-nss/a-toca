import { chamarIA, extrairJSON } from "./base.jsx";
import { resumoCampo } from "./campo.jsx";
import { uid } from "../nucleo/base.jsx";

// ─── IA: Desenho de Processo (fluxo) ────────────────────────────

export async function gerarFluxo(cliente, fluxo, cargos, pops, registrosCampo) {
  const vistoEmCampo = resumoCampo(registrosCampo, "processos");
  const listaCargos = cargos.map((c) => c.nome).filter(Boolean).join(", ") || "nenhum cadastrado";
  const listaPops = pops.map((p) => p.nome).filter(Boolean).join(", ") || "nenhum";
  const prompt = `Você é especialista em desenho de processos para pequenas e médias empresas brasileiras. Desenhe o fluxo ponta a ponta do processo abaixo: etapas em ordem, responsável de cada uma, e pontos de decisão com o caminho do "não".

CLIENTE
Negócio: ${cliente.negocio}
Segmento: ${cliente.segmento}
Setores: ${cliente.setores || "não informado"}
Cargos existentes (use estes nomes como responsáveis quando couber): ${listaCargos}
POPs já documentados: ${listaPops}

PROCESSO
Nome: ${fluxo.nome}
Setor: ${fluxo.setor || "não informado"}
Observações da consultora (como funciona hoje, gargalos relatados): ${fluxo.obs || "nenhuma"}
${vistoEmCampo ? `VISTO EM CAMPO (fonte primária — desenhe o caminho REAL, não o idealizado):\n${vistoEmCampo}` : ""}

Regras:
- 6 a 14 etapas, cada uma curta (máx. 8 palavras), na ordem real de execução.
- Use "decisao" onde há verificação/aprovação; em "n", diga o que acontece no NÃO (ex.: "devolve à cozinha para refazer").
- Identifique gargalos e melhorias com base nas observações e no bom senso de operação enxuta.

Responda APENAS com JSON compacto de uma linha:
{"et":[{"t":"tarefa|decisao","x":"texto da etapa","r":"responsável","n":"apenas para decisao: o que acontece se não"}],"me":["3 a 6 gargalos ou melhorias propostas, um por item"]}
Sem markdown, sem texto fora do JSON.`;

  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  const etapas = (obj.et || [])
    .filter((e) => e && e.x)
    .map((e) => ({
      id: uid(),
      tipo: e.t === "decisao" ? "decisao" : "tarefa",
      texto: e.x,
      responsavel: e.r || "",
      seNao: e.t === "decisao" ? e.n || "" : "",
    }));
  return { etapas, melhorias: Array.isArray(obj.me) ? obj.me.join("\n") : obj.me || "" };
}
