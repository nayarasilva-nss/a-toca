import { LIMITES_LEGAIS, chamarIA, extrairJSON } from "./base.jsx";
import { blocoCCT } from "./cct.jsx";
import { uid } from "../nucleo/base.jsx";

// ─── IA: Manual do Colaborador ──────────────────────────────────

export async function gerarManual(cliente, cctPontos, politicas, posicoes, registrosCampo) {
  const informalidadesVistas = (registrosCampo || [])
    .filter((r) => r.tipo === "visita" && r.informalidades)
    .map((r) => r.informalidades)
    .join("; ")
    .slice(0, 500);
  const nomesPoliticas = (politicas || []).map((p) => p.nome).filter(Boolean).join(", ");
  const blocoExtras = [
    nomesPoliticas ? `Políticas internas formais já existentes (cite-as pelo nome quando o tema aparecer): ${nomesPoliticas}.` : "",
    (posicoes || []).length ? `Estrutura de liderança (para a seção de comunicação e hierarquia): ${(posicoes || []).map((p) => p.nome).join(" · ")}.` : "",
    informalidadesVistas ? `Informalidades observadas em campo (o manual deve formalizar o combinado correto nesses temas, sem citar a observação): ${informalidadesVistas}.` : "",
  ].filter(Boolean).join("\n");
  const prompt = `Você é especialista em governança de pequenas e médias empresas brasileiras. Escreva o Manual do Colaborador do cliente abaixo, em tom direto, acolhedor e firme — regras claras sem juridiquês.

CLIENTE
Negócio: ${cliente.negocio}
Segmento: ${cliente.segmento}
Setores/áreas: ${cliente.setores || "não informado"}
Regras próprias da casa: ${cliente.regras || "não informado"}
Contexto: ${cliente.contexto || "não informado"}
${blocoExtras}

Seções esperadas (adapte títulos e conteúdo ao cliente): Boas-vindas e cultura; Jornada e ponto; Uniforme e apresentação; Conduta e convivência; Uso de celular e equipamentos; Comunicação e hierarquia; Medidas disciplinares (cite a gradação feedback → advertência → suspensão → desligamento, sem listar infrações).

${LIMITES_LEGAIS}
${blocoCCT(cctPontos)}
Responda APENAS com JSON compacto de uma linha, conteúdo de cada seção com 3 a 5 frases corridas:
{"s":[{"t":"título da seção","c":"conteúdo"}]}
Sem markdown, sem texto fora do JSON.`;

  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  return (obj.s || [])
    .filter((s) => s && s.t && s.c)
    .map((s) => ({ id: uid(), titulo: s.t, conteudo: s.c }));
}
