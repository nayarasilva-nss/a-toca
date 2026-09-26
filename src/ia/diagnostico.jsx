import { chamarIA, extrairJSON } from "./base.jsx";
import { resumoCampo } from "./campo.jsx";
import { ESCOLA_LIDERANCA, ESCOLA_TEMPERAMENTOS, TEMPERAMENTOS } from "./documentos.jsx";

// ─── Diagnóstico de Maturidade ──────────────────────────────────

export const ESCALA_DIAG = ["Inexistente", "Inicial", "Definido", "Consolidado"];

export const FRAMEWORK_DIAG = [
  {
    area: "Pessoas",
    criterios: [
      "Cargos têm descrição escrita e conhecida",
      "Recrutamento e integração seguem um padrão",
      "Feedback e avaliação acontecem com regularidade",
      "Treinamento da função existe e é aplicado",
    ],
  },
  {
    area: "Processos",
    criterios: [
      "Processos-chave estão mapeados (POPs)",
      "Checklists são usados na operação diária",
      "O padrão é seguido mesmo sem o dono presente",
      "Erros geram ajuste de processo, não só bronca",
    ],
  },
  {
    area: "Governança e Papéis",
    criterios: [
      "Organograma e linhas de reporte são claros",
      "Alçadas de decisão estão definidas",
      "Reuniões de gestão têm ritmo e pauta",
      "Indicadores são acompanhados de verdade",
    ],
  },
  {
    area: "Disciplina e Cultura",
    criterios: [
      "Regras da casa estão escritas (manual)",
      "Medidas disciplinares são aplicadas com consistência",
      "Ocorrências são registradas formalmente",
      "Convivência e clima são saudáveis",
    ],
  },
  {
    area: "Financeiro",
    criterios: [
      "Finanças da empresa separadas das do dono",
      "Fluxo de caixa é acompanhado",
      "Precificação e margem são conhecidas",
      "Existem metas e orçamento",
    ],
  },
  {
    area: "Autonomia do Dono",
    criterios: [
      "A operação roda sem o dono no dia a dia",
      "Líderes decidem no nível certo sem escalar tudo",
      "O dono dedica tempo à estratégia, não só ao operacional",
      "O dono consegue tirar férias sem colapso",
    ],
  },
];

export function chaveNota(a, c) {
  return `${a}-${c}`;
}

export const FRAMEWORK_PESSOAL = [
  { area: "Autoconsciência", criterios: ["Conhece as próprias forças e limites", "Percebe as emoções no momento em que surgem", "Reconhece os padrões que se repetem na própria vida", "Aceita feedback sem se defender"] },
  { area: "Domínio de Si", criterios: ["Regula impulsos sob pressão", "Sustenta os hábitos que decidiu ter", "Cumpre o que combina consigo mesmo", "Lida com frustração sem se sabotar"] },
  { area: "Relações", criterios: ["Escuta com atenção real", "Expressa o que pensa e sente com clareza", "Estabelece limites saudáveis", "Repara conflitos em vez de fugir deles"] },
  { area: "Ordem e Prioridades", criterios: ["Mantém rotina que sustenta a energia (sono, corpo)", "Separa o importante do urgente", "Termina o que começa", "Usa o tempo alinhado ao que diz importar"] },
  { area: "Propósito e Direção", criterios: ["Sabe o que quer construir na vida", "Decide coerente com os próprios valores", "Vive fora do piloto automático", "Investe em crescimento contínuo"] },
  { area: "Coragem de Agir", criterios: ["Age antes de se sentir totalmente pronto", "Enfrenta conversas e decisões difíceis", "Assume erros sem se destruir", "Pede ajuda quando precisa"] },
];

export const FRAMEWORK_LIDER = [
  { area: "Autoconsciência", criterios: ["Conhece as próprias forças e limites", "Busca e recebe feedback sem se defender", "Regula as emoções sob pressão", "Age coerente com o que cobra dos outros"] },
  { area: "Comunicação", criterios: ["Comunica expectativas com clareza", "Escuta antes de responder", "Dá feedback frequente e específico ao time", "Conduz conversas difíceis sem adiar"] },
  { area: "Delegação e Confiança", criterios: ["Delega com clareza de resultado e prazo", "Acompanha sem microgerenciar", "Tolera o erro de aprendizagem", "Desenvolve autonomia nos liderados"] },
  { area: "Gestão do Time", criterios: ["Conhece o perfil de cada liderado", "Distribui tarefas conforme o perfil", "Lida com conflitos de frente e com justiça", "Cobra resultados sem quebrar a relação"] },
  { area: "Resultados e Prioridades", criterios: ["Separa o importante do urgente", "Planeja a semana antes que ela o atropele", "Decide no tempo certo, sem paralisar", "Acompanha números, não só impressões"] },
  { area: "Influência e Relações", criterios: ["Gerencia bem a relação com o próprio chefe", "Constrói pontes com pares e outras áreas", "Exerce autoridade sem precisar do cargo", "É exemplo do comportamento que exige"] },
];

export function percentualArea(notas, aIdx, framework) {
  const criterios = (framework || FRAMEWORK_DIAG)[aIdx].criterios;
  let soma = 0;
  let respondidos = 0;
  criterios.forEach((_, cIdx) => {
    const n = notas[chaveNota(aIdx, cIdx)];
    if (n !== undefined && n !== null && n !== "") {
      soma += Number(n);
      respondidos++;
    }
  });
  if (respondidos === 0) return null;
  return Math.round((soma / (respondidos * 3)) * 100);
}

export async function gerarLeituraDiagLider(cliente, notas, mentoria, mentorado) {
  const FRD = (mentoria && (mentoria.foco || "lideranca") === "autoconhecimento") ? FRAMEWORK_PESSOAL : FRAMEWORK_LIDER;
  const focoAutoL = mentoria && (mentoria.foco || "lideranca") === "autoconhecimento";
  const linhas = FRD.map((a, aIdx) => {
    const detalhe = a.criterios
      .map((cr, cIdx) => {
        const nota = notas[chaveNota(aIdx, cIdx)];
        return nota !== undefined && nota !== "" ? `${cr}: ${nota}/3` : null;
      })
      .filter(Boolean)
      .join("; ");
    const p = percentualArea(notas, aIdx, FRD);
    return `${a.area}${p !== null ? ` (${p}%)` : ""}: ${detalhe || "nao avaliada"}`;
  }).join("\n");
  const prompt = `Voce e mentora de desenvolvimento humano, especialista em ${focoAutoL ? "autoconhecimento" : "governanca e lideranca"} e ciencia dos temperamentos.
${ESCOLA_TEMPERAMENTOS}
${ESCOLA_LIDERANCA}
A consultora avaliou a maturidade ${focoAutoL ? "pessoal" : "de lideranca"} do mentorado abaixo (0=inexistente, 1=inicial, 2=em desenvolvimento, 3=consolidado). Escreva a leitura para uso da mentora.

MENTORADO
Nome: ${cliente.tipo === "pessoa" ? cliente.negocio : (mentorado && mentorado.nome) || "nao informado"}
Papel/atuacao: ${cliente.tipo === "pessoa" ? cliente.segmento : (mentorado && mentorado.cargo) || "nao informado"}
Contexto: ${cliente.contexto || "nao informado"}
${mentorado && mentorado.dominante && TEMPERAMENTOS[mentorado.dominante] ? `Temperamento: ${TEMPERAMENTOS[mentorado.dominante].rotulo}${mentorado.secundario && TEMPERAMENTOS[mentorado.secundario] ? ` com ${TEMPERAMENTOS[mentorado.secundario].rotulo}` : ""} - conecte as notas ao perfil (ex.: colerico forte em resultados e fraco em escuta e um padrao tipico).` : ""}
${mentoria && mentoria.objetivos ? `Objetivos da mentoria: ${mentoria.objetivos}` : ""}

AVALIACAO
${linhas}

Responda APENAS com JSON compacto de uma linha:
{"l":"leitura geral em 4-6 frases: o padrao de lideranca que as notas revelam, conectado ao temperamento quando mapeado","f":["2-3 forcas a alavancar"],"d":["2-4 areas prioritarias de desenvolvimento, da mais critica"],"r":["2-3 recomendacoes praticas de foco para os proximos encontros"]}
Sem markdown, sem texto fora do JSON.`;
  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  return {
    leitura: obj.l || "",
    criticos: [...(Array.isArray(obj.d) ? obj.d : []), ...(Array.isArray(obj.r) ? obj.r.map((r) => `Foco: ${r}`) : [])].join("\n"),
    forcas: Array.isArray(obj.f) ? obj.f.join("\n") : obj.f || "",
  };
}

export async function gerarLeituraDiagnostico(cliente, notas, gestao, registrosCampo) {
  // A leitura do negócio também forma o dono como líder — lente Havard aplicada
  const evidencias = resumoCampo(registrosCampo, "geral");
  const blocoGestao = gestao
    ? `Briefing registrado: ${gestao.briefing || "não registrado"}
Frentes da consultoria: ${(gestao.frentes || []).map((f) => f.nome).join(", ") || "nenhuma"}`
    : "";
  const linhas = FRAMEWORK_DIAG.map((a, aIdx) => {
    const detalhe = a.criterios
      .map((crit, cIdx) => {
        const n = notas[chaveNota(aIdx, cIdx)];
        return n !== undefined && n !== null && n !== "" ? `${crit}: ${ESCALA_DIAG[Number(n)]}` : null;
      })
      .filter(Boolean)
      .join("; ");
    const pct = percentualArea(notas, aIdx);
    return `${a.area} (${pct === null ? "não avaliada" : pct + "%"}) — ${detalhe || "sem respostas"}`;
  }).join("\n");

  const prompt = `Você é especialista em governança de pequenas e médias empresas brasileiras (método Nayara Silva). Abaixo está o diagnóstico de maturidade do cliente, avaliado pela consultora em campo (escala: Inexistente, Inicial, Definido, Consolidado).

CLIENTE
Negócio: ${cliente.negocio}
Segmento: ${cliente.segmento}
Contexto: ${cliente.contexto || "não informado"}
${blocoGestao}
${evidencias ? `EVIDÊNCIAS DE CAMPO (observação direta — cite-as na leitura quando sustentarem uma nota):\n${evidencias}` : ""}

DIAGNÓSTICO
${linhas}

Responda APENAS com JSON compacto de uma linha:
{"le":"leitura geral honesta do estágio do negócio (3-5 frases, sem suavizar nem dramatizar)","cr":["2 a 4 pontos críticos — o que mais trava o negócio hoje, citando as áreas"],"pr":["3 a 5 prioridades de ação em ordem de ataque, práticas e específicas"]}
Sem markdown, sem texto fora do JSON.`;

  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  const emTexto = (v) => (Array.isArray(v) ? v.join("\n") : v || "");
  return { leitura: obj.le || "", criticos: emTexto(obj.cr), prioridades: emTexto(obj.pr) };
}
