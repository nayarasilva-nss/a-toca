import { chamarIA, extrairJSON } from "./base.jsx";
import { Organograma } from "../modulos/estrutura.jsx";
import { uid } from "../nucleo/base.jsx";

// ─── IA: Alçadas de Decisão ─────────────────────────────────────

export async function gerarAlcadas(cliente, obs, cargos, posicoes, entrevistas) {
  const decisoesReais = (entrevistas || [])
    .filter((e) => e.atividades || e.fazNaoDeveria)
    .map((e) => `${e.funcao || e.entrevistado || "?"}: ${[e.atividades, e.fazNaoDeveria && `decide/faz sem ser da função: ${e.fazNaoDeveria}`].filter(Boolean).join("; ")}`)
    .join("\n")
    .slice(0, 600);
  const listaCargos = cargos.map((c) => c.nome).filter(Boolean).join(", ") || "nenhum cadastrado";
  const listaPosicoes = (posicoes || []).map((p) => p.nome).filter(Boolean).join(", ") || "não montado";
  const prompt = `Você é especialista em governança de pequenas e médias empresas brasileiras. Monte a MATRIZ DE ALÇADAS DE DECISÃO do cliente: quem pode decidir o quê, até que limite, e para quem escala acima disso. Objetivo: liberar o dono das decisões operacionais sem perder controle.

CLIENTE
Negócio: ${cliente.negocio}
Segmento: ${cliente.segmento}
Setores: ${cliente.setores || "não informado"}
Contexto: ${cliente.contexto || "não informado"}
Cargos descritos: ${listaCargos}
Organograma: ${listaPosicoes}
Observações da consultora: ${obs || "nenhuma"}
${decisoesReais ? `Relatos de campo sobre quem decide NA PRÁTICA (formalize o que funciona; corrija o que é desvio):\n${decisoesReais}` : ""}

Regras:
- 10 a 16 decisões nas categorias: Financeiro, Compras, Comercial, Pessoas, Operação.
- "q" deve ser um cargo real da lista quando existir; o nível mais baixo capaz de decidir bem.
- Limites em R$ quando fizer sentido, como sugestão a validar pelo dono (valores redondos e conservadores para o porte).
- Decisões de alto impacto (demissão, contratação, investimento relevante) escalam ao dono/gestor.

Responda APENAS com JSON compacto de uma linha:
{"a":[{"c":"categoria","d":"decisão curta","q":"quem decide","l":"limite ou condição","e":"acima disso, quem decide"}]}
Sem markdown, sem texto fora do JSON.`;

  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  return (obj.a || [])
    .filter((i) => i && i.d)
    .map((i) => ({
      id: uid(),
      categoria: i.c || "Geral",
      decisao: i.d,
      decide: i.q || "",
      limite: i.l || "",
      escalonamento: i.e || "",
    }));
}
