import { LIMITES_LEGAIS, chamarIA, extrairJSON } from "./base.jsx";
import { blocoCCT } from "./cct.jsx";
import { uid } from "../nucleo/base.jsx";

// ─── IA + Configuração: Políticas, Checklists e Atas ────────────

export async function gerarPolitica(cliente, doc, cctPontos, registrosCampo) {
  const informalidadesPol = (registrosCampo || [])
    .filter((r) => r.tipo === "visita" && r.informalidades)
    .map((r) => r.informalidades)
    .join("; ")
    .slice(0, 400);
  const prompt = `Você é especialista em governança de pequenas e médias empresas brasileiras. Escreva a política interna abaixo para o cliente — clara, aplicável e curta.

CLIENTE
Negócio: ${cliente.negocio}
Segmento: ${cliente.segmento}
Regras da casa: ${cliente.regras || "não informado"}
Contexto: ${cliente.contexto || "não informado"}
${informalidadesPol ? `Informalidades observadas em campo (se o tema da política tocar nelas, a política deve formalizar a regra correta): ${informalidadesPol}` : ""}

POLÍTICA
Nome: ${doc.nome}
Observações da consultora: ${doc.obs || "nenhuma"}

${LIMITES_LEGAIS}
${blocoCCT(cctPontos)}
Responda APENAS com JSON compacto de uma linha:
{"es":"escopo — a quem e a que se aplica (1-2 frases)","di":["5 a 10 diretrizes objetivas, uma regra por item"],"rs":"responsabilidades — quem aplica e quem fiscaliza (1-2 frases)","vi":"vigência e revisão (1 frase)"}
Sem markdown, sem texto fora do JSON.`;
  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  return {
    escopo: obj.es || "",
    diretrizes: Array.isArray(obj.di) ? obj.di.join("\n") : obj.di || "",
    responsabilidades: obj.rs || "",
    vigencia: obj.vi || "",
  };
}

export async function gerarChecklist(cliente, doc, cctPontos, pops) {
  const popIgual = (pops || []).find(
    (p) => p.nome && doc.nome && (p.nome.toLowerCase().includes(doc.nome.toLowerCase()) || doc.nome.toLowerCase().includes(p.nome.toLowerCase()))
  );
  const blocoPop = popIgual && popIgual.passos
    ? `POP JÁ DOCUMENTADO deste processo — alinhe os itens do checklist aos passos dele:
${popIgual.passos}`
    : (pops || []).length
      ? `POPs existentes do cliente: ${(pops || []).map((p) => p.nome).filter(Boolean).join(", ")}.`
      : "";
  const prompt = `Você é especialista em operação de pequenas e médias empresas brasileiras. Escreva os itens do checklist abaixo — itens verificáveis, curtos, na ordem natural de execução.

CLIENTE
Negócio: ${cliente.negocio}
Segmento: ${cliente.segmento}
Setores: ${cliente.setores || "não informado"}
Contexto: ${cliente.contexto || "não informado"}

CHECKLIST
Nome: ${doc.nome}
Setor: ${doc.setor || "não informado"}
Frequência: ${doc.frequencia || "não informada"}
Observações da consultora: ${doc.obs || "nenhuma"}
${blocoPop}
${blocoCCT(cctPontos)}
Responda APENAS com JSON compacto de uma linha:
{"it":["8 a 18 itens verificáveis e curtos, em ordem de execução"]}
Sem markdown, sem texto fora do JSON.`;
  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  return { itens: Array.isArray(obj.it) ? obj.it.join("\n") : obj.it || "" };
}

export async function gerarAta(cliente, doc) {
  const prompt = `Você é especialista em governança de pequenas e médias empresas brasileiras. Transforme as anotações brutas da reunião abaixo em uma ata estruturada e fiel — não invente nada que não esteja nas anotações.

CLIENTE
Negócio: ${cliente.negocio}

REUNIÃO
Título: ${doc.nome}
Data: ${doc.data || "não informada"}
Participantes: ${doc.participantes || "não informados"}
Anotações brutas:
${doc.obs || "(vazias)"}

Responda APENAS com JSON compacto de uma linha:
{"rs":"resumo do que foi discutido (3-5 frases)","de":["decisões tomadas, uma por item; se nenhuma, lista vazia"],"ac":["ações acordadas no formato 'ação — responsável — prazo' quando as anotações permitirem"]}
Sem markdown, sem texto fora do JSON.`;
  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  return {
    resumo: obj.rs || "",
    decisoes: Array.isArray(obj.de) ? obj.de.join("\n") : obj.de || "",
    acoes: Array.isArray(obj.ac) ? obj.ac.join("\n") : obj.ac || "",
  };
}

export const CONFIG_DOCS = {
  politicas: {
    tituloModulo: "Políticas Internas",
    singular: "política",
    novoRotulo: "+ Nova política",
    placeholderNome: "Ex.: Política de Uso de Celular",
    camposBase: [
      ["nome", "Nome da política", false, 1, "Ex.: Política de Uso de Celular"],
      ["obs", "Observações para a IA (opcional)", true, 2, "Ex.: celular fica no armário; exceção para líderes de plantão"],
    ],
    camposGerados: [
      ["escopo", "Escopo", true, 2],
      ["diretrizes", "Diretrizes (uma por linha)", true, 6],
      ["responsabilidades", "Responsabilidades", true, 2],
      ["vigencia", "Vigência e revisão", true, 1],
    ],
    campoIndicador: "diretrizes",
    gerar: (cliente, doc, cct, extras) => gerarPolitica(cliente, doc, cct, extras && extras.campo),
    subtituloLista: (d) => (d.diretrizes ? "" : "rascunho vazio"),
  },
  checklists: {
    tituloModulo: "Checklists",
    singular: "checklist",
    novoRotulo: "+ Novo checklist",
    placeholderNome: "Ex.: Abertura do salão",
    camposBase: [
      ["nome", "Nome do checklist", false, 1, "Ex.: Abertura do salão"],
      ["setor", "Setor", false, 1, "Ex.: Salão"],
      ["frequencia", "Frequência", false, 1, "Ex.: Diária, antes da abertura"],
      ["obs", "Observações para a IA (opcional)", true, 2, "Ex.: incluir conferência de caixa e ligar equipamentos"],
    ],
    camposGerados: [["itens", "Itens (um por linha)", true, 10]],
    campoIndicador: "itens",
    gerar: (cliente, doc, cct, extras) => gerarChecklist(cliente, doc, cct, extras && extras.pops),
    subtituloLista: (d) => [d.setor, d.frequencia].filter(Boolean).join(" · ") || (d.itens ? "" : "rascunho vazio"),
  },
  atas: {
    tituloModulo: "Atas de Reunião",
    singular: "ata",
    novoRotulo: "+ Nova ata",
    placeholderNome: "Ex.: Alinhamento semanal de líderes",
    camposBase: [
      ["nome", "Título da reunião", false, 1, "Ex.: Alinhamento semanal de líderes"],
      ["data", "Data", false, 1, "Ex.: 18/07/2026"],
      ["participantes", "Participantes", false, 1, "Ex.: Nay, gerente, chefe de cozinha"],
      ["obs", "Anotações brutas da reunião", true, 6, "Despeje aqui as anotações do jeito que saíram — a IA estrutura em resumo, decisões e ações"],
    ],
    camposGerados: [
      ["resumo", "Resumo", true, 3],
      ["decisoes", "Decisões (uma por linha)", true, 4],
      ["acoes", "Ações (uma por linha: ação — responsável — prazo)", true, 4],
    ],
    campoIndicador: "resumo",
    gerar: (cliente, doc) => gerarAta(cliente, doc),
    subtituloLista: (d) => d.data || (d.resumo ? "" : "rascunho vazio"),
  },
};

export function docVazio(tipo) {
  const base = { id: uid(), nome: "", obs: "" };
  if (tipo === "atas") base.data = new Date().toLocaleDateString("pt-BR");
  for (const [campo] of CONFIG_DOCS[tipo].camposBase) base[campo] = base[campo] || "";
  for (const [campo] of CONFIG_DOCS[tipo].camposGerados) base[campo] = "";
  return base;
}

export const TEMPERAMENTOS = {
  sanguineo: { rotulo: "Sanguíneo", cor: "#B0652F", fundo: "#F5E4D3" },
  colerico: { rotulo: "Colérico", cor: "#8A3A2E", fundo: "#F0DCD2" },
  melancolico: { rotulo: "Melancólico", cor: "#4A5A7A", fundo: "#DFE4EF" },
  fleumatico: { rotulo: "Fleumático", cor: "#4F6B3A", fundo: "#E3EBD8" },
};

export const ESCOLA_TEMPERAMENTOS = `REFERENCIAL TEORICO da consultora (siga esta escola, nao psicologia pop): a linha classica dos quatro temperamentos conforme Art & Laraine Bennett e Italo Marsili. Chaves da escola: (1) temperamento e o padrao INATO de REACAO - velocidade com que a pessoa reage, intensidade e duracao da reacao (sanguineo: reage rapido, esquece rapido; colerico: reage rapido, sustenta longamente; melancolico: reage devagar, guarda fundo e por muito tempo; fleumatico: reage devagar, solta rapido); (2) temperamento nao e destino nem desculpa - e materia-prima a ser trabalhada com pratica deliberada e virtude; (3) a orientacao certa e concreta e direta, mira o ponto exato onde o temperamento acomoda ou exagera; (4) nunca rotule a pessoa como limitacao - o temperamento explica a tendencia, nao autoriza o comportamento.`;

export const ESCOLA_LIDERANCA = `REFERENCIAL DE LIDERANCA da consultora: a lideranca virtuosa de Alexandre Havard, aplicada ao negocio. Chaves: (1) a essencia da lideranca e MAGNANIMIDADE (grandeza de visao e de missao - querer coisas grandes) + HUMILDADE (lideranca como servico - fazer os outros crescerem); (2) o alicerce sao as virtudes cardeais vividas no trabalho ordinario: prudencia (decidir bem), fortaleza (sustentar o rumo e assumir riscos), temperanca (dominio de si), justica (dar a cada um o que lhe e devido); (3) virtude e habito - cresce pela pratica repetida em situacoes reais de trabalho, nao por discurso; (4) carater vem antes de tecnica: lideranca se APRENDE porque virtude se treina; (5) o temperamento e a materia-prima que a virtude aperfeicoa - nenhum temperamento e impedimento para liderar.`;

export const GUIA_MOLDAGEM = {
  sanguineo: {
    essencia: "Energia, carisma e conexão — lidera pelo entusiasmo e contagia o time.",
    acomoda: "Dispersão: começa muito e conclui pouco; promete no calor do momento; foge de rotina e de conversa dura; precisa de plateia.",
    direcao: "Moldar para a constância. O sanguíneo não precisa de mais brilho — precisa de acabativa e de silêncio produtivo.",
    praticas: [
      "Fechar 1 pendência por dia ANTES de abrir qualquer coisa nova — e registrar por escrito o que fechou",
      "Um bloco diário de 50 minutos de trabalho em silêncio, sem celular e sem interação — o músculo da profundidade",
      "Toda promessa feita ao time vira nota escrita na hora, com prazo — o entusiasmo assume compromisso",
      "Conduzir a reunião semanal seguindo a pauta ATÉ O FIM antes de qualquer história ou improviso",
    ],
    virtudes: "Direção de virtude: constância e temperança. O sanguíneo cresce quando aprende a permanecer — na tarefa, na palavra dada, no silêncio. A profundidade é a virtude que o entusiasmo dele ainda não conhece.",
    cobranca: "Cobre com leveza e reconhecimento público — o sanguíneo murcha com bronca fria, mas se move por não querer decepcionar. Peça o registro, não a intenção.",
    armadilha: "Não confunda a simpatia dele com progresso: ele vai encantar a sessão. A pergunta é sempre: o que ficou PRONTO desde o último encontro?",
  },
  colerico: {
    essencia: "Direção, decisão e resultado — lidera pela força e destrava o que ninguém destrava.",
    acomoda: "Atropelo: decide sozinho, escuta pouco, cobra no grito ou no gelo; confunde velocidade com acerto; enxerga fraqueza em quem sente.",
    direcao: "Moldar para a escuta e a paciência estratégica. O colérico não precisa de mais força — precisa de pausa entre o impulso e a ação.",
    praticas: [
      "Em toda reunião, ser o ÚLTIMO a dar opinião — e antes de dar, repetir em voz alta o que ouviu de alguém do time",
      "Regra das 24 horas: nenhuma decisão irreversível ou mensagem dura enviada no dia em que a raiva subiu",
      "Delegar 1 decisão por semana INTEIRA (sem retomar no meio) e só avaliar o resultado no prazo combinado",
      "Um elogio específico e verdadeiro por dia a alguém do time — treino de enxergar o acerto alheio",
    ],
    virtudes: "Direção de virtude: mansidão, paciência e humildade. A força do colérico só vira liderança quando aprende a esperar e a precisar dos outros. A escuta é a forma cotidiana da humildade nele.",
    cobranca: "Cobre de frente, com dados e sem rodeio — o colérico respeita quem sustenta o olhar. Nunca cobre com sermão emocional; mostre o custo do atropelo em resultado.",
    armadilha: "Ele vai tentar liderar a mentoria. Deixe-o decidir o compromisso, nunca o diagnóstico.",
  },
  melancolico: {
    essencia: "Profundidade, método e senso de qualidade — lidera pelo padrão alto e enxerga o que ninguém vê.",
    acomoda: "Paralisia: perfeccionismo que adia entrega; rumina o erro; cobra dos outros o próprio padrão impossível; isola-se para 'pensar melhor'.",
    direcao: "Moldar para a ação imperfeita. O melancólico não precisa de mais análise — precisa de prazo curto e de exposição antes de sentir-se pronto.",
    praticas: [
      "Entregar 1 coisa por semana em versão 80% — declarada como rascunho, no prazo, sem polir",
      "Falar PRIMEIRO em uma reunião por semana, antes de ter a resposta perfeita formulada",
      "Ao errar, registrar o FCA em 10 minutos e encerrar o assunto — proibido reabrir a ruminação depois",
      "Um contato humano por dia sem pauta de trabalho (café, pergunta pessoal) — treino de presença sem performance",
    ],
    virtudes: "Direção de virtude: magnanimidade e esperança. O melancólico cresce quando ousa querer coisas grandes e imperfeitas — contra a pusilanimidade que o encolhe. Agir antes de se sentir pronto é o ato de esperança dele.",
    cobranca: "Cobre com lógica e por escrito, mostrando o porquê — o melancólico precisa entender a razão. Reconheça o esforço explicitamente; ele desconta em si mesmo cada falha que você nem viu.",
    armadilha: "Ele vai transformar a prática em projeto perfeito de prática. O valor está no feito, não no planejado.",
  },
  fleumatico: {
    essencia: "Estabilidade, diplomacia e constância — lidera pela calma e segura o time nas crises.",
    acomoda: "Acomodação: evita conflito a qualquer custo; adia o desconfortável; diz sim para não desagradar; some na neutralidade quando precisa se posicionar.",
    direcao: "Moldar para o desconforto voluntário. O fleumático não precisa de mais paz — precisa de atrito diário escolhido, até o corpo desaprender a fuga.",
    praticas: [
      "Um desconforto físico voluntário e diário que exija postura (ex.: salto alto todos os dias, banho frio, caminho mais difícil) — o corpo ensina o que a mente evita",
      "Uma conversa adiada por semana, marcada com dia e hora — a agenda decide, não a coragem do momento",
      "Dizer 1 'não' claro por semana, sem almofada de desculpas — e registrar o que aconteceu depois (spoiler: nada explode)",
      "Posicionar-se PRIMEIRO em um assunto polêmico por semana, antes de saber a opinião da maioria",
    ],
    virtudes: "Direção de virtude: fortaleza e diligência. O fleumático cresce quando escolhe o desconforto que a paz dele evita — dizer, decidir, sustentar posição. A coragem de desagradar é a fortaleza na versão cotidiana.",
    cobranca: "Cobre com constância gentil e prazos explícitos — o fleumático não briga com você, ele simplesmente deixa escorregar. Volte sempre no combinado; a repetição serena é o que o move.",
    armadilha: "A pior armadilha é a sua: a sessão com ele é agradável demais, e o mentor relaxa junto. Conforto mútuo não é progresso.",
  },
};

export const FORM_TEMPERAMENTO = [
  {
    pergunta: "Ritmo e tom de fala",
    opcoes: [
      ["Rápido e animado", "sanguineo"],
      ["Rápido e firme", "colerico"],
      ["Pausado e preciso", "melancolico"],
      ["Calmo e baixo", "fleumatico"],
    ],
  },
  {
    pergunta: "Diante de um problema",
    opcoes: [
      ["Fala com todo mundo sobre ele", "sanguineo"],
      ["Resolve na hora, sem esperar", "colerico"],
      ["Analisa antes de agir", "melancolico"],
      ["Espera e observa", "fleumatico"],
    ],
  },
  {
    pergunta: "Em situação de conflito",
    opcoes: [
      ["Faz piada, contorna", "sanguineo"],
      ["Enfrenta de frente", "colerico"],
      ["Se magoa e guarda", "melancolico"],
      ["Evita e cede", "fleumatico"],
    ],
  },
  {
    pergunta: "Com rotina e repetição",
    opcoes: [
      ["Se entedia rápido", "sanguineo"],
      ["Tolera se der resultado", "colerico"],
      ["Gosta de método e padrão", "melancolico"],
      ["Adapta-se sem reclamar", "fleumatico"],
    ],
  },
  {
    pergunta: "Jeito de decidir",
    opcoes: [
      ["Por entusiasmo, no impulso", "sanguineo"],
      ["Rápido e assertivo", "colerico"],
      ["Devagar, quer certeza", "melancolico"],
      ["Adia, prefere consenso", "fleumatico"],
    ],
  },
  {
    pergunta: "Energia no grupo",
    opcoes: [
      ["Anima o ambiente", "sanguineo"],
      ["Assume o comando", "colerico"],
      ["Observa e aponta falhas", "melancolico"],
      ["Acalma e concilia", "fleumatico"],
    ],
  },
  {
    pergunta: "Quando alguém erra",
    opcoes: [
      ["Releva e esquece", "sanguineo"],
      ["Cobra na hora", "colerico"],
      ["Registra e lembra depois", "melancolico"],
      ["Desculpa e absorve", "fleumatico"],
    ],
  },
  {
    pergunta: "O que mais o motiva",
    opcoes: [
      ["Reconhecimento e novidade", "sanguineo"],
      ["Resultado e controle", "colerico"],
      ["Qualidade e propósito", "melancolico"],
      ["Segurança e harmonia", "fleumatico"],
    ],
  },
];

export function contarTemperamentos(respostas) {
  const contagem = { sanguineo: 0, colerico: 0, melancolico: 0, fleumatico: 0 };
  for (const chave of Object.values(respostas || {})) {
    if (contagem[chave] !== undefined) contagem[chave]++;
  }
  const ordenados = Object.entries(contagem).sort((a, b) => b[1] - a[1]);
  return { contagem, dominante: ordenados[0][1] > 0 ? ordenados[0][0] : "", secundario: ordenados[1][1] > 0 ? ordenados[1][0] : "" };
}
