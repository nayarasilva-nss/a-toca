import { chamarIA, extrairJSON } from "./base.jsx";
import { uid } from "../nucleo/base.jsx";

// ─── IA: Estrutura de Governança / Organograma ──────────────────

export async function gerarEstrutura(cliente, cargos, entrevistas) {
  const linhasReais = (entrevistas || [])
    .filter((e) => e.atividades || e.dores)
    .map((e) => `${e.entrevistado || "colaborador"} (${e.funcao || "?"}): ${[e.atividades, e.dores].filter(Boolean).join("; ")}`)
    .join("\n")
    .slice(0, 600);
  const listaCargos = cargos.map((c) => `${c.nome}${c.setor ? ` (${c.setor})` : ""}`).join("; ") || "nenhum cadastrado";
  const prompt = `Você é especialista em estrutura organizacional de pequenas e médias empresas brasileiras. Proponha o organograma do cliente abaixo: as posições necessárias e a linha de reporte de cada uma.

CLIENTE
Negócio: ${cliente.negocio}
Segmento: ${cliente.segmento}
Setores/áreas: ${cliente.setores || "não informado"}
Contexto: ${cliente.contexto || "não informado"}
Cargos já descritos pela consultora (use estes nomes quando existirem): ${listaCargos}
${linhasReais ? `Relatos de campo (revelam a quem as pessoas respondem NA PRÁTICA — estruture o real, não o imaginado):\n${linhasReais}` : ""}

Regras:
- Estrutura enxuta e realista para PME — sem inflar níveis hierárquicos.
- Uma única posição no topo (sócio/gestor), salvo indicação contrária no contexto.
- "sup" é o nome EXATO de outra posição da própria lista; apenas o topo tem sup null.

Responda APENAS com JSON compacto de uma linha:
{"p":[{"n":"nome da posição","s":"setor/área","sup":"nome da posição superior ou null"}]}
Sem markdown, sem texto fora do JSON.`;

  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  const brutas = (obj.p || []).filter((p) => p && p.n);
  const posicoes = brutas.map((p) => ({ id: uid(), nome: p.n, setor: p.s || "", superiorId: null, _sup: p.sup || null }));
  for (const pos of posicoes) {
    if (pos._sup) {
      const alvo = posicoes.find((x) => x.nome.toLowerCase() === String(pos._sup).toLowerCase());
      if (alvo && alvo.id !== pos.id) pos.superiorId = alvo.id;
    }
    delete pos._sup;
  }
  return posicoes;
}
