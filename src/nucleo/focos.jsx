// Focos possíveis de uma jornada de mentoria. Nenhum é padrão: a mentora escolhe com o mentorado.
export const FOCOS_MENTORIA = {
  lideranca: {
    rotulo: "Liderança",
    nota: "liderar melhor: time, delegação, comunicação, resultados",
    especialidade: "lideranca e gestao de pessoas",
    diagnostico: "Diagnóstico de Liderança",
    diagnosticoNota: "de lideranca",
    diagnosticoDescricao: "Maturidade de liderança em 6 áreas e 24 critérios. Reavalie ao longo da jornada — o antes e depois é a prova da evolução.",
    framework: "lider",
    entorno: true,
    prompt: "FOCO DESTA MENTORIA: LIDERANCA - o mentorado quer liderar melhor (time, delegacao, comunicacao, decisao, resultados e a relacao com o proprio chefe). Adapte ao papel real dele: nem todo lider e dono.",
  },
  pessoal: {
    rotulo: "Crescimento pessoal",
    nota: "hábitos, domínio de si, relações, ordem, propósito, coragem",
    especialidade: "autoconhecimento e crescimento pessoal",
    diagnostico: "Diagnóstico Pessoal",
    diagnosticoNota: "pessoal",
    diagnosticoDescricao: "Maturidade pessoal em 6 áreas e 24 critérios. Reavalie ao longo da jornada — o antes e depois é a prova da evolução.",
    framework: "pessoal",
    entorno: false,
    prompt: "FOCO DESTA MENTORIA: CRESCIMENTO PESSOAL - o mentorado NAO busca lideranca nem cargo. Os temas orbitam a vida dele como um todo: habitos, corpo, relacoes, dominio de si, ordem, proposito. Nunca presuma empresa, equipe ou ambicao profissional. A promessa e uma pessoa que se sustenta sem a mentora.",
  },
  vocacao: {
    rotulo: "Vocação e carreira",
    nota: "descobrir para onde ir: talentos, valores, caminhos possíveis, decisão",
    especialidade: "discernimento vocacional e desenho de carreira",
    diagnostico: "Diagnóstico de Vocação",
    diagnosticoNota: "vocacional",
    diagnosticoDescricao: "Clareza vocacional em 6 áreas e 24 critérios — autoconhecimento, valores, talentos, caminhos, decisão e ação. Reavalie ao longo da jornada.",
    framework: "vocacao",
    entorno: false,
    prompt: "FOCO DESTA MENTORIA: VOCACAO E CARREIRA - o mentorado quer discernir o proprio caminho profissional: o que o move, em que e bom, quais caminhos existem, como decidir e dar os primeiros passos. Nao presuma lideranca, cargo, empresa nem que ele va empreender. Ajude-o a enxergar com honestidade e a decidir; a mentora nao decide por ele.",
  },
  transicao: {
    rotulo: "Transição",
    nota: "mudar de área, de empresa ou de fase de vida, com método",
    especialidade: "transicoes de carreira e de fase de vida",
    diagnostico: "Diagnóstico de Transição",
    diagnosticoNota: "de prontidao para a transicao",
    diagnosticoDescricao: "Prontidão para a mudança em 6 áreas e 24 critérios — clareza, valores, recursos, caminhos, decisão e sustentação. Reavalie ao longo da jornada.",
    framework: "vocacao",
    entorno: false,
    prompt: "FOCO DESTA MENTORIA: TRANSICAO - o mentorado esta mudando de area, de empresa, de negocio ou de fase de vida. Trabalhe clareza do que fica e do que muda, riscos reais, plano em etapas e a sustentacao emocional da mudanca. Nao presuma lideranca nem destino: o caminho e dele.",
  },
};

const ALIAS = { autoconhecimento: "pessoal" };

// chave normalizada do foco, ou null quando ainda não foi definido
export function focoDe(mentoria) {
  const bruto = mentoria && mentoria.foco;
  if (!bruto) return null;
  const chave = ALIAS[bruto] || bruto;
  return FOCOS_MENTORIA[chave] ? chave : null;
}

export function metaFoco(mentoria) {
  const chave = focoDe(mentoria);
  return chave ? FOCOS_MENTORIA[chave] : null;
}

// texto para os prompts quando o foco ainda não foi escolhido
export const PROMPT_SEM_FOCO = "FOCO DESTA MENTORIA: ainda nao definido pela mentora. NAO presuma lideranca, cargo, empresa ou ambicao: parta do contexto e dos objetivos declarados e trate a pessoa como alguem que quer crescer no que ela mesma apontar.";
