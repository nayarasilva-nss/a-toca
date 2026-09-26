import { blocoCCT } from "./cct.jsx";
import { TEMPERAMENTOS } from "./documentos.jsx";
import { STATUS_FRENTE } from "../nucleo/base.jsx";

// ─── IA: Conselheira (agente de consultoria) ───────────────────────

export async function conversarPenseira(cliente, cctPontos, frentes, historico, pessoas, panorama) {
  const listaFrentes =
    (frentes || []).map((f) => `${f.nome} (${STATUS_FRENTE[f.status] ? STATUS_FRENTE[f.status].rotulo : f.status})`).join("; ") ||
    "nenhuma mapeada ainda";

  const dono = (pessoas || []).find((p) => p.contratante && p.dominante && TEMPERAMENTOS[p.dominante]);
  const blocoDono = dono
    ? `\nCONTRATANTE (temperamento mapeado): ${dono.nome} — dominante ${TEMPERAMENTOS[dono.dominante].rotulo}${dono.secundario && TEMPERAMENTOS[dono.secundario] ? `, secundário ${TEMPERAMENTOS[dono.secundario].rotulo}` : ""}.${dono.abordagem ? ` Abordagem definida: ${dono.abordagem}` : ""}\nQuando aconselhar a consultora sobre COMO comunicar, propor ou negociar algo com o cliente, leve o temperamento do contratante em conta.\n`
    : "";

  const ehMentoria = cliente.tipo === "pessoa";
  const contexto = `Você é a Conselheira: assistente de raciocínio da consultora Nayara Silva (${ehMentoria ? "mentoria de líderes e donos de PMEs brasileiras, pelo Método Enraizar" : "consultoria de governança para PMEs brasileiras"}). Seu papel é ajudá-la a pensar ${ehMentoria ? "a jornada do mentorado abaixo — encontros, pra casa, temperamento, metas — e responder dúvidas" : "soluções para o cliente abaixo e responder dúvidas"} — sempre com base legal quando o tema for trabalhista.

${ehMentoria ? "MENTORADO EM FOCO" : "CLIENTE EM FOCO"}
${ehMentoria ? "Nome" : "Negócio"}: ${cliente.negocio}
${ehMentoria ? "Atuação" : "Segmento"}: ${cliente.segmento}
Setores: ${cliente.setores || "não informado"}
Regras da casa: ${cliente.regras || "não informado"}
Contexto e dores: ${cliente.contexto || "não informado"}
${ehMentoria ? "" : `Frentes da consultoria: ${listaFrentes}`}
${panorama ? `\nPANORAMA DO PROJETO (dados reais do sistema):\n${panorama}\n` : ""}${blocoDono}${cctPontos && cctPontos.length ? blocoCCT(cctPontos) : "\n(CCT deste cliente ainda não analisada no app — quando o tema depender da convenção, avise que a resposta considera apenas CLT e prática usual do setor.)\n"}
COMO RESPONDER
- Direto ao ponto, em português claro, sem juridiquês desnecessário.
- Questão trabalhista: dê a resposta E a base legal (artigo da CLT, súmula, ponto da CCT) quando existir. Se a empresa PODE fazer algo, diga que pode e em quais condições/limites (ex.: poder diretivo do empregador — art. 2º da CLT — permite regras de vestimenta razoáveis e não discriminatórias); se NÃO pode, explique por quê.
- Distinga com honestidade: o que é regra clara da lei, o que é entendimento majoritário, e o que é zona cinzenta que exige advogado. Nunca invente artigo ou cláusula.
- Questão de gestão/estrutura: raciocine como consultora sênior — prós, contras e recomendação prática, considerando o porte de PME.
- Respostas em texto corrido; use no máximo uma lista curta quando realmente ajudar. Sem markdown pesado.`;

  const mensagens = [
    { role: "user", content: contexto + "\n\nConfirme apenas com: pronta." },
    { role: "assistant", content: "pronta." },
    ...historico.slice(-12).map((m) => ({ role: m.role, content: m.content })),
  ];

  const response = await fetch("/api/ia", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      max_tokens: 1000,
      messages: mensagens,
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return (data.text || "").trim();
}
