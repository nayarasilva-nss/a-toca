import { chamarIA, extrairJSON } from "./base.jsx";
import { ESCOLA_LIDERANCA, ESCOLA_TEMPERAMENTOS, FORM_TEMPERAMENTO, TEMPERAMENTOS } from "./documentos.jsx";

// ─── IA: Análise de Temperamento ────────────────────────────────

export async function gerarAnaliseTemperamento(cliente, pessoa, cargos) {
  const cargoDesc = cargos.find((c) => c.nome.toLowerCase() === (pessoa.cargo || "").toLowerCase());
  const jaDefinido = pessoa.dominante && TEMPERAMENTOS[pessoa.dominante];

  const prompt = `Você é especialista em ciência dos temperamentos (sanguíneo, colérico, melancólico, fleumático) aplicada ${cliente.tipo === "pessoa" ? "à mentoria de desenvolvimento humano e liderança" : "à gestão de pessoas em pequenas e médias empresas brasileiras"}, no Método Enraizar da consultora Nayara Silva.
${ESCOLA_TEMPERAMENTOS}
${ESCOLA_LIDERANCA}

${cliente.tipo === "pessoa" ? `JORNADA DE MENTORIA\nMentorado: ${cliente.negocio} (${cliente.segmento})\nA pessoa analisada abaixo é o próprio mentorado ou alguém do entorno que ele lidera.` : `CLIENTE\nNegócio: ${cliente.negocio} (${cliente.segmento})`}

PESSOA ANALISADA
Nome/apelido: ${pessoa.nome}
Cargo/função: ${pessoa.cargo || "não informado"}
${cargoDesc && cargoDesc.sumaria ? `Descrição do cargo: ${cargoDesc.sumaria}` : ""}
Observações da consultora sobre a pessoa (comportamentos, reações, padrões): ${pessoa.obs || "nenhuma"}
${Object.keys(pessoa.respostas || {}).length ? `Formulário de observação preenchido pela consultora:\n${FORM_TEMPERAMENTO.map((q, i) => {
    const r = (pessoa.respostas || {})[i];
    if (!r) return null;
    const op = q.opcoes.find((o) => o[1] === r);
    return `- ${q.pergunta}: ${op ? op[0] : r}`;
  }).filter(Boolean).join("\n")}` : ""}
${pessoa.contratante ? (cliente.tipo === "pessoa" ? "ATENÇÃO: esta pessoa é o MENTORADO — quem contratou a mentoria. Além da análise padrão, oriente a mentora sobre como conduzir a jornada com essa pessoa: ritmo dos encontros, tipo de provocação que funciona, o que evitar." : "ATENÇÃO: esta pessoa é o CONTRATANTE/DONO — quem contratou a consultoria. Além da análise padrão, oriente a própria consultora sobre como conduzir o projeto com essa pessoa.") : ""}
${jaDefinido ? `Temperamento JÁ CLASSIFICADO pela consultora: dominante ${TEMPERAMENTOS[pessoa.dominante].rotulo}${pessoa.secundario && TEMPERAMENTOS[pessoa.secundario] ? `, secundário ${TEMPERAMENTOS[pessoa.secundario].rotulo}` : ""} — NÃO reclassifique; use esta classificação.` : "Temperamento ainda não classificado: sugira dominante e secundário a partir das observações. Se as observações forem insuficientes para classificar com confiança, diga isso na justificativa e indique o que a consultora deveria observar."}

Responda APENAS com JSON compacto de uma linha:
{"d":"sanguineo|colerico|melancolico|fleumatico","s":"sanguineo|colerico|melancolico|fleumatico","ju":"justificativa da classificação em 1-2 frases baseada nas observações","fo":["2 a 4 forças desse temperamento neste cargo específico"],"ri":["2 a 4 riscos/atritos desse temperamento neste cargo"],"li":"como o líder deve liderar e se comunicar com essa pessoa (2-3 frases práticas)","ad":"leitura honesta da adequação temperamento × cargo (1-2 frases; se houver desajuste, diga e sugira mitigação)"${pessoa.contratante ? ',"ab":"como a consultora deve conduzir a consultoria com este contratante: formato de propostas e entregas, ritmo e duração de reuniões, como apresentar más notícias e cobranças, o que evitar (3-5 frases práticas)"' : ""}}
Sem markdown, sem texto fora do JSON.`;

  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  const linhas = (v) => (Array.isArray(v) ? v.join("\n") : v || "");
  return {
    dominante: jaDefinido ? pessoa.dominante : TEMPERAMENTOS[obj.d] ? obj.d : "",
    secundario: jaDefinido && pessoa.secundario ? pessoa.secundario : TEMPERAMENTOS[obj.s] ? obj.s : "",
    justificativa: obj.ju || "",
    forcas: linhas(obj.fo),
    riscos: linhas(obj.ri),
    lideranca: obj.li || "",
    adequacao: obj.ad || "",
    abordagem: pessoa.contratante ? obj.ab || "" : pessoa.abordagem || "",
  };
}
