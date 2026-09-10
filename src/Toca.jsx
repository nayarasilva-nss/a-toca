import { useState, useEffect } from "react";

// ─── A Toca — Central de Governança ─────────────────────────────
// Ferramenta interna de consultoria · Nayara Silva
// Módulos: Tabela Disciplinar · Descrições de Cargo
// Paleta: Toca dos Weasley (caótica, aconchegante, mágica!)

// Cores do Design System (Mockups A Toca - Elegante & Sofisticado)
const CORES = {
  // Primárias - Vinho & Dourado
  fogo: "#5C1A2B",           // Vinho escuro (botões primários)
  fogoEscuro: "#3C181E",     // Vinho claro (texto principal)
  fogoMedio: "#8A3A2E",      // Vinho médio (backgrounds alt)
  laranja: "#D9914F",        // Cobre/laranja (inputs, borders)
  dourado: "#D4AF37",        // Dourado (labels, ênfases)
  douradoEscuro: "#B8860B",  // Dourado dark (hover states)

  // Neutras - Browns & Creams
  madeira: "#8B6F47",        // Brown (texto secundário)
  madeireaEscura: "#6B5D4F", // Brown dark (descrições)
  cobre: "#D9914F",          // Taupe (hints, placeholders)
  taupe: "#8A7A5C",          // Taupe (hints)
  taupeClaroo: "#A0826D",    // Taupe light (disabled)

  // Backgrounds
  cremeClaro: "#F5EDD9",     // Cream light (backgrounds, cards)
  cremePalido: "#FFFBF0",    // Cream pale (main background)
  papel: "#FFFBF0",          // Papel (luz mágica)
};

const GRAVIDADES = ["leve", "media", "grave", "gravissima"];

const GRAV_INFO = {
  leve: { rotulo: "Leve", medida: "Feedback registrado", cor: "#B8860B", fundo: "#F5EDD9" },
  media: { rotulo: "Média", medida: "Advertência escrita", cor: "#9A6A2F", fundo: "#F2E3CB" },
  grave: { rotulo: "Grave", medida: "Suspensão", cor: "#8A3A2E", fundo: "#F0DCD2" },
  gravissima: { rotulo: "Gravíssima", medida: "Desligamento por justa causa*", cor: "#5C1A2B", fundo: "#EBD5D8" },
};

const STATUS_FRENTE = {
  nao_iniciada: { rotulo: "Não iniciada", cor: "#8A7A5C", fundo: "#EFE8D6" },
  em_andamento: { rotulo: "Em andamento", cor: "#9A6A2F", fundo: "#F2E3CB" },
  formalizada: { rotulo: "Formalizada", cor: "#4F6B3A", fundo: "#E3EBD8" },
  concluida: { rotulo: "Concluída", cor: "#3C5A2B", fundo: "#D8E5D0" },
};

const STATUS_TREINAMENTO = {
  planejado: { rotulo: "Planejado", cor: "#9A6A2F", fundo: "#F5E6C8" },
  confirmado: { rotulo: "Confirmado", cor: "#8A7A5C", fundo: "#EFE8D6" },
  em_progresso: { rotulo: "Em progresso", cor: "#9A6A2F", fundo: "#F2E3CB" },
  realizado: { rotulo: "Realizado", cor: "#4F6B3A", fundo: "#E3EBD8" },
  avaliado: { rotulo: "Avaliado", cor: "#3C5A2B", fundo: "#D8E5D0" },
};

const PROPOSTA_CAMPOS = {
  consultoria: {
    base: ["duracao", "investimento", "condicoesPagamento", "validade", "apresentacao", "objetivo", "fases", "entregaveis", "metodologia", "condicoesGerais"],
    especiais: ["frentesCoverage", "premisasDeTrabalho"]
  },
  treinamento: {
    base: ["duracao", "investimento", "condicoesPagamento", "validade"],
    especiais: ["horario", "localidade", "numeroParticipantes", "maioriaAusencia", "certificacao"]
  },
  mentoria: {
    base: ["investimento", "condicoesPagamento"],
    especiais: ["numeroEncontros", "frequencia", "cancelationPolicy", "successMetrics"]
  }
};

// Tabela-mãe — catálogo de referência (método Nayara Silva, base Kenkyo)
const TABELA_MAE = [
  ["Assiduidade e Ponto", "Atraso sem justificativa (acima da tolerância)", "leve"],
  ["Assiduidade e Ponto", "Esquecer marcação de ponto reiteradamente", "leve"],
  ["Assiduidade e Ponto", "Entregar atestado fora do prazo de 48h", "leve"],
  ["Assiduidade e Ponto", "Saída antecipada sem autorização do líder", "media"],
  ["Assiduidade e Ponto", "Falta sem aviso prévio ao líder", "media"],
  ["Assiduidade e Ponto", "Hora extra sem solicitação expressa do líder", "media"],
  ["Assiduidade e Ponto", "Registrar o ponto de outra pessoa", "grave"],
  ["Assiduidade e Ponto", "Abandono de posto durante o serviço", "grave"],
  ["Assiduidade e Ponto", "Falta injustificada por mais de 30 dias (abandono de emprego)", "gravissima"],
  ["Uniforme e Higiene", "Apresentar-se sem uniforme completo ou com uniforme sujo", "leve"],
  ["Uniforme e Higiene", "Cabelo solto, unhas fora do padrão ou perfume em área de alimentos", "leve"],
  ["Uniforme e Higiene", "Uso de adornos (anéis, correntes, piercings) na cozinha/produção", "media"],
  ["Uniforme e Higiene", "Barba em setor de cozinha/produção", "media"],
  ["Conduta e Convivência", "Uso de celular fora do armário sem autorização do líder", "leve"],
  ["Conduta e Convivência", "Conversa excessiva ou dispersão que prejudique o serviço", "leve"],
  ["Conduta e Convivência", "Tratamento inadequado a cliente", "grave"],
  ["Conduta e Convivência", "Piadas ofensivas ou apelidos pejorativos", "grave"],
  ["Conduta e Convivência", "Desacato ou insubordinação a líder", "grave"],
  ["Conduta e Convivência", "Assédio moral ou sexual", "gravissima"],
  ["Conduta e Convivência", "Discriminação de qualquer natureza", "gravissima"],
  ["Conduta e Convivência", "Agressão física ou verbal, chantagem ou intimidação", "gravissima"],
  ["Conduta e Convivência", "Comparecer ao trabalho sob efeito de álcool ou drogas", "gravissima"],
  ["Operação e Padrão", "Não reportar falta de insumo ao gerente da unidade", "leve"],
  ["Operação e Padrão", "Não executar checklist da função", "media"],
  ["Operação e Padrão", "Descumprir ficha técnica ou padrão de preparo", "media"],
  ["Operação e Padrão", "Descumprir norma de manipulação/armazenamento de alimentos", "grave"],
  ["Operação e Padrão", "Servir produto fora do padrão de qualidade conscientemente", "grave"],
  ["Patrimônio e Insumos", "Desperdício de insumos por negligência", "media"],
  ["Patrimônio e Insumos", "Consumo de produtos sem autorização", "grave"],
  ["Patrimônio e Insumos", "Dano a equipamento por mau uso", "grave"],
  ["Patrimônio e Insumos", "Furto ou apropriação de bens, insumos ou valores", "gravissima"],
  ["Segurança", "Não utilizar EPI fornecido", "media"],
  ["Segurança", "Manusear equipamento elétrico com mãos molhadas", "media"],
  ["Segurança", "Não comunicar acidente de trabalho em até 24h", "media"],
  ["Segurança", "Colocar colega ou cliente em risco por negligência grave", "grave"],
].map(([s, i, g]) => ({ setor: s, infracao: i, gravidade: g }));

const uid = () => Math.random().toString(36).slice(2, 9);

// ─── Persistência ───────────────────────────────────────────────

async function stGet(chave) {
  try {
    const r = await window.storage.get(chave);
    return r ? JSON.parse(r.value) : null;
  } catch {
    return null;
  }
}

async function stSet(chave, valor) {
  try {
    await window.storage.set(chave, JSON.stringify(valor));
  } catch (e) {
    console.error("Falha ao salvar", chave, e);
  }
}

// ─── IA: chamada base ───────────────────────────────────────────

async function chamarIA(prompt) {
  const response = await fetch("/api/ia", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.text || "";
}

async function comRetentativa(fn) {
  try {
    return await fn();
  } catch (e) {
    // resposta truncada ou ilegível — tenta uma segunda vez antes de desistir
    return await fn();
  }
}

function extrairJSON(texto, abre, fecha) {
  const limpo = texto.replace(/```json|```/g, "").trim();
  const inicio = limpo.indexOf(abre);
  const fim = limpo.lastIndexOf(fecha);
  return JSON.parse(limpo.slice(inicio, fim + 1));
}

const LIMITES_LEGAIS = `LIMITES LEGAIS (obrigatórios — nada pode violar a CLT nem a convenção coletiva/CCT do setor e região do cliente):
- Nunca crie infração ou exigência que puna exercício de direito: atestado médico válido, faltas legais (casamento, luto, paternidade, doação de sangue), licenças, atividade sindical, recusa de trabalho em risco grave e iminente.
- Nenhuma medida pode envolver multa em dinheiro, desconto salarial punitivo ou redução de benefício.
- Se uma regra própria do cliente conflitar com a CLT ou com CCT usual do setor, NÃO a inclua.`;

// ─── IA: Tabela Disciplinar ─────────────────────────────────────

async function gerarInfracoes(cliente, cctPontos, registrosCampo) {
  const praticasVistas = resumoCampo(registrosCampo, "geral").slice(0, 700);
  const maeNumerada = TABELA_MAE.map(
    (m, idx) => `${idx + 1}. [${m.setor}] ${m.infracao} (${m.gravidade})`
  ).join("\n");

  const prompt = `Você é especialista em governança para pequenas e médias empresas brasileiras. Abaixo está a TABELA-MÃE de infrações disciplinares (catálogo de referência da consultora, base restaurante). Adapte-a ao cliente descrito.

TABELA-MÃE
${maeNumerada}

CLIENTE
Negócio: ${cliente.negocio}
Segmento: ${cliente.segmento}
Setores/áreas: ${cliente.setores || "não informado"}
Regras próprias da casa: ${cliente.regras || "não informado"}
Contexto e dores relatadas: ${cliente.contexto || "não informado"}
${praticasVistas ? `Práticas observadas em campo pela consultora (infrações que existem na prática merecem entrada na tabela): ${praticasVistas}` : ""}

TAREFA — responda APENAS com as ADAPTAÇÕES necessárias, em JSON compacto de uma linha:
{"rm":[números de itens que NÃO se aplicam a este cliente],"ed":[{"n":número,"i":"novo texto curto"} para itens que precisam de reescrita ao contexto],"add":[{"s":"Setor","i":"infração curta (máx 10 palavras)","g":"leve|media|grave|gravissima"} para infrações específicas deste cliente que faltam]}

Regras de adaptação:
- Adapte e crie livremente: remova o que não se aplica, reescreva ao contexto e adicione quantas infrações específicas deste cliente forem necessárias (descrições curtas, máx 10 palavras).
- Converta regras próprias e dores do cliente em itens "add".

${LIMITES_LEGAIS}
${blocoCCT(cctPontos)}
- "gravissima" apenas para condutas enquadráveis nas hipóteses de justa causa do art. 482 da CLT.
- Sem markdown, sem texto fora do JSON.`;

  const texto = await chamarIA(prompt);

  let diff = { rm: [], ed: [], add: [] };
  try {
    const obj = extrairJSON(texto, "{", "}");
    diff = { rm: obj.rm || [], ed: obj.ed || [], add: obj.add || [] };
  } catch {
    // resposta ilegível — segue com a tabela-mãe sem adaptações
  }

  const remover = new Set((diff.rm || []).map(Number));
  const edicoes = {};
  for (const e of diff.ed || []) {
    if (e && e.n) edicoes[Number(e.n)] = e;
  }

  const base = TABELA_MAE.map((m, idx) => {
    const n = idx + 1;
    if (remover.has(n)) return null;
    const ed = edicoes[n];
    return {
      id: uid(),
      setor: m.setor,
      infracao: ed && ed.i ? ed.i : m.infracao,
      gravidade: ed && GRAVIDADES.includes(ed.g) ? ed.g : m.gravidade,
    };
  }).filter(Boolean);

  const extras = (diff.add || [])
    .filter((it) => it && it.i && GRAVIDADES.includes(it.g))
    .map((it) => ({ id: uid(), setor: it.s || "Regras da Casa", infracao: it.i, gravidade: it.g }));

  return [...base, ...extras];
}

// ─── IA: Descrição de Cargo ─────────────────────────────────────

async function gerarDescricaoCargo(cliente, cargo, cargosExistentes, cctPontos, posicoes, entrevistas) {
  const entrevistasDoCargo = (entrevistas || []).filter(
    (e) => e.funcao && cargo.nome && (e.funcao.toLowerCase().includes(cargo.nome.toLowerCase()) || cargo.nome.toLowerCase().includes(e.funcao.toLowerCase()))
  );
  const blocoEntrevistas = entrevistasDoCargo.length
    ? `ENTREVISTAS DE FUNÇÃO REALIZADAS EM CAMPO (FONTE PRIMÁRIA — o que o ocupante relata pesa mais que suposição):
${entrevistasDoCargo.map((e) => `- ${e.entrevistado || "colaborador"} (${e.data}): faz: ${e.atividades || "—"}${e.fazNaoDeveria ? `; faz sem ser da função: ${e.fazNaoDeveria}` : ""}${e.deveriaNaoFaz ? `; deveria e não faz: ${e.deveriaNaoFaz}` : ""}${e.dores ? `; dores: ${e.dores}` : ""}`).join("\n")}
Use os relatos para escrever atividades REAIS; o que ele faz e não deveria vai para o cargo certo (não para este); o que deveria e não faz entra nas atividades como responsabilidade explícita.`
    : "";
  const listaCargos = cargosExistentes.map((c) => c.nome).join(", ") || "nenhum ainda";
  const posicao = (posicoes || []).find((p) => p.nome.toLowerCase() === (cargo.nome || "").toLowerCase());
  const superior = posicao && posicao.superiorId ? (posicoes || []).find((p) => p.id === posicao.superiorId) : null;
  const blocoOrg = (posicoes || []).length
    ? `Organograma do cliente: ${(posicoes || []).map((p) => p.nome).join(", ")}.${superior ? ` Segundo o organograma, este cargo responde a: ${superior.nome} — use isso no campo de supervisão.` : ""}`
    : "";
  const prompt = `Você é especialista em estruturação de cargos para pequenas e médias empresas brasileiras. Escreva a descrição do cargo abaixo, personalizada para o cliente.

CLIENTE
Negócio: ${cliente.negocio}
Segmento: ${cliente.segmento}
Setores/áreas: ${cliente.setores || "não informado"}
Contexto: ${cliente.contexto || "não informado"}
Outros cargos já cadastrados: ${listaCargos}
${blocoOrg}
${blocoEntrevistas}

CARGO
Nome: ${cargo.nome}
Setor: ${cargo.setor || "não informado"}
Observações da consultora: ${cargo.obs || "nenhuma"}

${LIMITES_LEGAIS}
${blocoCCT(cctPontos)}
Responda APENAS com JSON compacto de uma linha, campos em texto corrido curto e direto:
{"su":"descrição sumária (2-3 frases)","at":["8 a 12 atividades, frases curtas iniciadas por verbo"],"re":"requisitos: escolaridade, experiência e competências (3-4 frases)","co":"condições de trabalho: ambiente, esforço físico, jornada (2-3 frases)","sv":"supervisão: de quem recebe e sobre quem exerce (1-2 frases)","pa":"patrimônio sob responsabilidade (1-2 frases)","cf":"informações confidenciais que acessa (1 frase)"}
Sem markdown, sem texto fora do JSON.`;

  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  return {
    sumaria: obj.su || "",
    atividades: Array.isArray(obj.at) ? obj.at.join("\n") : obj.at || "",
    requisitos: obj.re || "",
    condicoes: obj.co || "",
    supervisao: obj.sv || "",
    patrimonio: obj.pa || "",
    confidenciais: obj.cf || "",
  };
}

// ─── IA: Plano de Ação (a partir do briefing) ───────────────────

// ─── Trabalho de Campo: modelo e resumos ────────────────────────

const MARCAS_TURNO = {
  processo: { rotulo: "Processo", cor: "#9A6A2F", fundo: "#F5E6C8" },
  pessoa: { rotulo: "Pessoa", cor: "#4A6B8A", fundo: "#DCE8F0" },
  risco: { rotulo: "Risco", cor: "#8A3A2E", fundo: "#F0DCD2" },
  oportunidade: { rotulo: "Oportunidade", cor: "#4F6B3A", fundo: "#E3EBD8" },
};

const TIPOS_CAMPO = {
  visita: { rotulo: "Visita Técnica", curto: "Visita" },
  entrevista: { rotulo: "Entrevista de Função", curto: "Entrevista" },
  turno: { rotulo: "Acompanhamento de Turno", curto: "Turno" },
};

function campoVazio(tipo) {
  const base = { id: uid(), tipo, data: new Date().toLocaleDateString("pt-BR"), titulo: "" };
  if (tipo === "visita") return { ...base, roteiro: "", observado: "", informalidades: "", riscos: "", pontosFortes: "" };
  if (tipo === "entrevista") return { ...base, entrevistado: "", funcao: "", roteiro: "", atividades: "", fazNaoDeveria: "", deveriaNaoFaz: "", dores: "" };
  return { ...base, setor: "", linhas: [] };
}

function resumoCampo(registros, foco) {
  if (!registros || !registros.length) return "";
  const partes = [];
  for (const r of registros) {
    if (r.tipo === "visita") {
      if (foco !== "riscos" && (r.observado || r.informalidades)) partes.push(`Visita ${r.data}${r.titulo ? ` (${r.titulo})` : ""}: ${[r.observado, r.informalidades && `informalidades: ${r.informalidades}`].filter(Boolean).join("; ")}`);
      if (foco !== "processos" && r.riscos) partes.push(`Riscos vistos em visita ${r.data}: ${r.riscos}`);
      if (foco === "geral" && r.pontosFortes) partes.push(`Pontos fortes (${r.data}): ${r.pontosFortes}`);
    }
    if (r.tipo === "entrevista" && foco !== "riscos") {
      const linha = [r.atividades && `faz: ${r.atividades}`, r.fazNaoDeveria && `faz sem ser da função: ${r.fazNaoDeveria}`, r.deveriaNaoFaz && `deveria e não faz: ${r.deveriaNaoFaz}`, r.dores && `dores: ${r.dores}`].filter(Boolean).join("; ");
      if (linha) partes.push(`Entrevista ${r.entrevistado || "colaborador"} (${r.funcao || "função não informada"}, ${r.data}): ${linha}`);
    }
    if (r.tipo === "turno") {
      const relevantes = (r.linhas || []).filter((l) => l.texto && (foco === "geral" || (foco === "riscos" ? l.marca === "risco" : l.marca === "processo" || l.marca === "oportunidade")));
      if (relevantes.length) partes.push(`Turno ${r.data}${r.setor ? ` (${r.setor})` : ""}: ${relevantes.map((l) => `${l.hora ? l.hora + " " : ""}[${(MARCAS_TURNO[l.marca] || {}).rotulo || l.marca}] ${l.texto}`).join("; ")}`);
    }
  }
  const texto = partes.join("\n");
  return texto.length > 1600 ? texto.slice(0, 1600) + " (...)" : texto;
}

// ─── IA: roteiros de campo ──────────────────────────────────────

async function gerarRoteiroVisita(cliente, frentes, cctPontos, reg, anteriores) {
  const historicoVisitas = (anteriores || [])
    .filter((r) => r.tipo === "visita" && r.id !== reg.id && (r.observado || r.riscos))
    .map((r) => `${r.data}: ${[r.observado && `visto: ${r.observado}`, r.riscos && `riscos: ${r.riscos}`].filter(Boolean).join("; ")}`)
    .join("\n")
    .slice(0, 600);
  const listaFrentes = (frentes || []).map((f) => `${f.nome} (${f.escopo || "sem escopo"})`).join("; ") || "nenhuma";
  const listaCCT = (cctPontos || []).slice(0, 10).map((p) => `${p.tema}: ${p.exigencia}`).join("; ") || "não analisada";
  const prompt = `Você é consultora de governança de PMEs brasileiras preparando uma VISITA TÉCNICA de observação in loco. Gere o roteiro de observação — o que olhar, onde, e que evidências buscar. Observação real, não checklist genérico.

CLIENTE
Negócio: ${cliente.negocio} (${cliente.segmento})
Setores: ${cliente.setores || "não informado"}
Frentes abertas da consultoria: ${listaFrentes}
Pontos da CCT a verificar na prática: ${listaCCT}
Foco desta visita (se definido pela consultora): ${reg.titulo || "geral"}
${historicoVisitas ? `VISITAS ANTERIORES (não repita o que já foi visto; inclua follow-up: verificar se os riscos apontados persistem):\n${historicoVisitas}` : ""}

Regras:
- 8 a 14 pontos de observação, concretos e verificáveis a olho (ex.: "cronometrar intervalo real de almoço de 2 colaboradores", não "verificar clima organizacional").
- Se há frente de Processos, inclua fluxo real de produção, gargalos e retrabalho. Se a CCT regula intervalos/jornada/EPIs, inclua verificação prática.
- Inclua ao menos 1 ponto de informalidade documental (quadro de avisos, controles em papel, combinados verbais).

Responda APENAS com JSON compacto de uma linha:
{"r":["um ponto de observação por item"]}
Sem markdown, sem texto fora do JSON.`;
  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  return (obj.r || []).filter(Boolean).join("\n");
}

async function gerarRoteiroEntrevista(cliente, reg, cargos) {
  const cargoRef = (cargos || []).find((cg) => cg.nome && reg.funcao && (cg.nome.toLowerCase().includes(reg.funcao.toLowerCase()) || reg.funcao.toLowerCase().includes(cg.nome.toLowerCase())));
  const blocoCargo = cargoRef
    ? `Já existe descrição em rascunho deste cargo — use-a para confrontar papel × realidade:
Sumária: ${cargoRef.sumaria || "—"}
Atividades descritas: ${cargoRef.atividades || "—"}`
    : "A função ainda não foi mapeada — roteiro aberto de descoberta.";
  const prompt = `Você é consultora de governança de PMEs brasileiras preparando uma ENTREVISTA DE FUNÇÃO — conversa com um colaborador para entender o que ele REALMENTE faz (não o que o papel diz).

CLIENTE
Negócio: ${cliente.negocio} (${cliente.segmento})
Função a entrevistar: ${reg.funcao || "não informada"}
${blocoCargo}

Regras:
- 8 a 12 perguntas abertas, em linguagem simples de chão de operação (o entrevistado pode ter baixa escolaridade).
- Cubra: rotina real do dia, o que faz que não deveria ser dele, o que deveria fazer e não consegue, de quem recebe ordem na prática, o que trava o trabalho dele, o que ele faria diferente.
- Nada de pergunta que induza resposta ou soe como auditoria — tom de escuta.

Responda APENAS com JSON compacto de uma linha:
{"p":["uma pergunta por item"]}
Sem markdown, sem texto fora do JSON.`;
  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  return (obj.p || []).filter(Boolean).join("\n");
}

async function gerarPlanoAcao(cliente, briefing, pessoas, riscosCampo) {
  const dono = (pessoas || []).find((p) => p.contratante && p.dominante && TEMPERAMENTOS[p.dominante]);
  const blocoDono = dono
    ? `\nCONTRATANTE (temperamento mapeado pela consultora): dominante ${TEMPERAMENTOS[dono.dominante].rotulo}${dono.secundario && TEMPERAMENTOS[dono.secundario] ? `, secundário ${TEMPERAMENTOS[dono.secundario].rotulo}` : ""}.
Molde o plano a esse perfil SEM jamais citar temperamentos no texto: colérico → comece cada frente por ações de resultado visível e rápido, passos curtos e objetivos; melancólico → comece pela estruturação e método, explicite a lógica da sequência; sanguíneo → inclua marcos visíveis e celebráveis ao longo do caminho, varie o tipo de ação; fleumático → mudanças graduais, um passo consolidado antes do próximo, sem rupturas bruscas.\n`
    : "";

  const prompt = `Você é especialista em governança e estruturação de pequenas e médias empresas brasileiras. A consultora fez uma reunião de briefing com o cliente. A partir das anotações, identifique as FRENTES DE TRABALHO da consultoria e o plano de ação de cada uma.

CLIENTE
Negócio: ${cliente.negocio}
Segmento: ${cliente.segmento}
Setores/áreas: ${cliente.setores || "não informado"}
${blocoDono}${riscosCampo ? `\nRISCOS OBSERVADOS EM CAMPO (transforme os relevantes em ações nas frentes correspondentes):\n${riscosCampo}\n` : ""}
ANOTAÇÕES DO BRIEFING
${briefing}

Frentes típicas (use apenas as que o briefing sustenta; renomeie ou crie outras se fizer sentido): Pessoas, Processos Operacionais, Governança e Papéis, Financeiro, Cultura e Disciplina.

Responda APENAS com JSON compacto de uma linha:
{"f":[{"n":"nome da frente","s":"nao_iniciada|em_andamento|formalizada (maturidade ATUAL do cliente nessa frente)","e":"escopo do trabalho em 1 frase","a":[{"t":"ação concreta e curta","pq":"justificativa em poucas palavras (por que esta ação importa)"}] com 3 a 6 ações em ordem de execução}]}
Sem markdown, sem texto fora do JSON.`;

  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  return (obj.f || [])
    .filter((f) => f && f.n)
    .map((f) => ({
      id: uid(),
      nome: f.n,
      status: STATUS_FRENTE[f.s] ? f.s : "nao_iniciada",
      escopo: f.e || "",
      acoes: (Array.isArray(f.a) ? f.a : []).map((a) =>
        typeof a === "string"
          ? { id: uid(), texto: a, feita: false }
          : { id: uid(), texto: a.t || "", porque: a.pq || "", feita: false }
      ),
    }));
}

// ─── IA: Estrutura de Governança / Organograma ──────────────────

async function gerarEstrutura(cliente, cargos, entrevistas) {
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

// ─── IA: Manual do Colaborador ──────────────────────────────────

async function gerarManual(cliente, cctPontos, politicas, posicoes, registrosCampo) {
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

// ─── IA: Análise da CCT (PDF) ───────────────────────────────────

async function analisarCCT(cliente, base64pdf, pontosExistentes) {
  const temExistentes = pontosExistentes && pontosExistentes.length > 0;
  const listaExistente = temExistentes
    ? pontosExistentes.map((p, i) => `${i + 1}. [${p.tema}] ${p.exigencia}`).join("\n")
    : "";

  const tarefa = temExistentes
    ? `PONTOS JÁ EXTRAÍDOS DE DOCUMENTOS ANTERIORES (numerados):
${listaExistente}

O documento anexo pode ser a CCT principal, um TERMO ADITIVO ou uma nova versão. Compare com os pontos acima e responda APENAS com as MUDANÇAS, em JSON compacto de uma linha:
{"rm":[números de pontos SUPERADOS ou revogados pelo documento],"ed":[{"n":número,"o":"novo texto da exigência atualizada"}],"add":[{"t":"tema curto","o":"nova exigência em 1 frase objetiva com números quando houver","d":"manual|tabela|cargos|geral"}]}
Se um ponto continua válido e inalterado, NÃO o mencione. Máximo 10 itens em "add".`
    : `TAREFA: extraia da CCT os pontos que NÃO PODEM FALTAR ou NÃO PODEM SER CONTRARIADOS na documentação interna da empresa (manual do colaborador, tabela disciplinar, descrições de cargo, jornada, políticas). Foque no que impacta regras internas: jornada e intervalos, banco de horas/hora extra, adicionais, uniforme (quem paga/lava), alimentação, faltas e atestados, medidas disciplinares, estabilidades, e qualquer vedação relevante. Ignore cláusulas puramente sindicais/administrativas sem efeito nas regras internas.

Responda APENAS com JSON compacto de uma linha (máx. 14 pontos, os mais relevantes):
{"p":[{"t":"tema curto","o":"o que a CCT exige/veda, em 1 frase objetiva com números quando houver","d":"manual|tabela|cargos|geral"}]}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64pdf } },
            {
              type: "text",
              text: `Você é especialista em direito do trabalho e governança de PMEs brasileiras. O documento anexo é uma convenção coletiva de trabalho (CCT) ou termo aditivo aplicável ao cliente abaixo.

CLIENTE
Negócio: ${cliente.negocio}
Segmento: ${cliente.segmento}

${tarefa}
Sem markdown, sem texto fora do JSON.`,
            },
          ],
        },
      ],
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message || "erro da API");
  if (!Array.isArray(data.content)) throw new Error("resposta inesperada da API");
  const texto = data.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
  const obj = extrairJSON(texto, "{", "}");

  if (!temExistentes) {
    return (obj.p || [])
      .filter((p) => p && p.t && p.o)
      .map((p) => ({ id: uid(), tema: p.t, exigencia: p.o, destino: p.d || "geral" }));
  }

  // Aplicar diff sobre os pontos existentes
  const remover = new Set((obj.rm || []).map(Number));
  const edicoes = {};
  for (const e of obj.ed || []) {
    if (e && e.n) edicoes[Number(e.n)] = e;
  }
  const mantidos = pontosExistentes
    .map((p, i) => {
      const n = i + 1;
      if (remover.has(n)) return null;
      const ed = edicoes[n];
      return ed && ed.o ? { ...p, exigencia: ed.o } : p;
    })
    .filter(Boolean);
  const novos = (obj.add || [])
    .filter((p) => p && p.t && p.o)
    .map((p) => ({ id: uid(), tema: p.t, exigencia: p.o, destino: p.d || "geral" }));
  return [...mantidos, ...novos];
}

function blocoCCT(pontos) {
  if (!pontos || pontos.length === 0) return "";
  const linhas = pontos.map((p) => `- [${p.tema}] ${p.exigencia}`).join("\n");
  return `\nEXIGÊNCIAS DA CCT DESTE CLIENTE (extraídas do documento oficial — respeite TODAS obrigatoriamente; em conflito com qualquer outra instrução, a CCT prevalece):\n${linhas}\n`;
}

// ─── IA: Penseira (agente de consultoria) ───────────────────────

async function conversarPenseira(cliente, cctPontos, frentes, historico, pessoas, panorama) {
  const listaFrentes =
    (frentes || []).map((f) => `${f.nome} (${STATUS_FRENTE[f.status] ? STATUS_FRENTE[f.status].rotulo : f.status})`).join("; ") ||
    "nenhuma mapeada ainda";

  const dono = (pessoas || []).find((p) => p.contratante && p.dominante && TEMPERAMENTOS[p.dominante]);
  const blocoDono = dono
    ? `\nCONTRATANTE (temperamento mapeado): ${dono.nome} — dominante ${TEMPERAMENTOS[dono.dominante].rotulo}${dono.secundario && TEMPERAMENTOS[dono.secundario] ? `, secundário ${TEMPERAMENTOS[dono.secundario].rotulo}` : ""}.${dono.abordagem ? ` Abordagem definida: ${dono.abordagem}` : ""}\nQuando aconselhar a consultora sobre COMO comunicar, propor ou negociar algo com o cliente, leve o temperamento do contratante em conta.\n`
    : "";

  const contexto = `Você é a Penseira: assistente de raciocínio da consultora Nayara Silva (consultoria de governança para PMEs brasileiras). Seu papel é ajudá-la a pensar soluções para o cliente abaixo e responder dúvidas — sempre com base legal quando o tema for trabalhista.

CLIENTE EM FOCO
Negócio: ${cliente.negocio}
Segmento: ${cliente.segmento}
Setores: ${cliente.setores || "não informado"}
Regras da casa: ${cliente.regras || "não informado"}
Contexto e dores: ${cliente.contexto || "não informado"}
Frentes da consultoria: ${listaFrentes}
${panorama ? `\nPANORAMA DO ENGAJAMENTO (dados reais do sistema):\n${panorama}\n` : ""}${blocoDono}${cctPontos && cctPontos.length ? blocoCCT(cctPontos) : "\n(CCT deste cliente ainda não analisada no app — quando o tema depender da convenção, avise que a resposta considera apenas CLT e prática usual do setor.)\n"}
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

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: mensagens,
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message || "erro da API");
  if (!Array.isArray(data.content)) throw new Error("resposta inesperada da API");
  return data.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
}

// ─── IA: POP (Processo Operacional Padrão) ──────────────────────

async function gerarPOP(cliente, pop, cargos, cctPontos, fluxos, registrosCampo) {
  const vistoEmCampoPop = resumoCampo(registrosCampo, "processos");
  const listaCargos = cargos.map((c) => c.nome).filter(Boolean).join(", ") || "nenhum cadastrado";
  const fluxoIgual = (fluxos || []).find(
    (f) => f.nome && pop.nome && (f.nome.toLowerCase().includes(pop.nome.toLowerCase()) || pop.nome.toLowerCase().includes(f.nome.toLowerCase()))
  );
  const blocoFluxo = fluxoIgual && (fluxoIgual.etapas || []).length
    ? `FLUXO JÁ DESENHADO deste processo (use como espinha dorsal do passo a passo, detalhando cada etapa):
${(fluxoIgual.etapas || []).map((e, i) => `${i + 1}. ${e.texto}${e.tipo === "decisao" ? ` [decisão${e.seNao ? `; se não: ${e.seNao}` : ""}]` : ""}${e.responsavel ? ` (${e.responsavel})` : ""}`).join("\n")}`
    : "";
  const prompt = `Você é especialista em processos operacionais de pequenas e médias empresas brasileiras. Escreva o POP (Procedimento Operacional Padrão) abaixo, personalizado para o cliente — instruções que um colaborador novo consegue executar sem ajuda.

CLIENTE
Negócio: ${cliente.negocio}
Segmento: ${cliente.segmento}
Setores/áreas: ${cliente.setores || "não informado"}
Contexto: ${cliente.contexto || "não informado"}
Cargos existentes (use um deles como responsável quando couber): ${listaCargos}

PROCESSO
Nome: ${pop.nome}
Setor: ${pop.setor || "não informado"}
Observações da consultora: ${pop.obs || "nenhuma"}
${vistoEmCampoPop ? `VISTO EM CAMPO (considere a prática real e corrija-a onde for informalidade): ${vistoEmCampoPop.slice(0, 700)}` : ""}
${blocoFluxo}

${LIMITES_LEGAIS}
${blocoCCT(cctPontos)}
Responda APENAS com JSON compacto de uma linha:
{"ob":"objetivo do processo (1-2 frases)","ma":["materiais/recursos necessários, itens curtos"],"pa":["6 a 12 passos numeráveis, frases curtas iniciadas por verbo, em ordem de execução"],"at":["2 a 5 pontos de atenção/qualidade/segurança"],"fr":"frequência de execução (1 frase curta)","rs":"cargo responsável pela execução"}
Sem markdown, sem texto fora do JSON.`;

  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  const linhas = (v) => (Array.isArray(v) ? v.join("\n") : v || "");
  return {
    objetivo: obj.ob || "",
    materiais: linhas(obj.ma),
    passos: linhas(obj.pa),
    atencao: linhas(obj.at),
    frequencia: obj.fr || "",
    responsavel: obj.rs || "",
  };
}

// ─── IA + Configuração: Políticas, Checklists e Atas ────────────

async function gerarPolitica(cliente, doc, cctPontos, registrosCampo) {
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

async function gerarChecklist(cliente, doc, cctPontos, pops) {
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

async function gerarAta(cliente, doc) {
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

const CONFIG_DOCS = {
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

function docVazio(tipo) {
  const base = { id: uid(), nome: "", obs: "" };
  if (tipo === "atas") base.data = new Date().toLocaleDateString("pt-BR");
  for (const [campo] of CONFIG_DOCS[tipo].camposBase) base[campo] = base[campo] || "";
  for (const [campo] of CONFIG_DOCS[tipo].camposGerados) base[campo] = "";
  return base;
}

const TEMPERAMENTOS = {
  sanguineo: { rotulo: "Sanguíneo", cor: "#B0652F", fundo: "#F5E4D3" },
  colerico: { rotulo: "Colérico", cor: "#8A3A2E", fundo: "#F0DCD2" },
  melancolico: { rotulo: "Melancólico", cor: "#4A5A7A", fundo: "#DFE4EF" },
  fleumatico: { rotulo: "Fleumático", cor: "#4F6B3A", fundo: "#E3EBD8" },
};

const ESCOLA_TEMPERAMENTOS = `REFERENCIAL TEORICO da consultora (siga esta escola, nao psicologia pop): a linha classica dos quatro temperamentos conforme Art & Laraine Bennett e Italo Marsili. Chaves da escola: (1) temperamento e o padrao INATO de REACAO - velocidade com que a pessoa reage, intensidade e duracao da reacao (sanguineo: reage rapido, esquece rapido; colerico: reage rapido, sustenta longamente; melancolico: reage devagar, guarda fundo e por muito tempo; fleumatico: reage devagar, solta rapido); (2) temperamento nao e destino nem desculpa - e materia-prima a ser trabalhada com pratica deliberada e virtude; (3) a orientacao certa e concreta e direta, mira o ponto exato onde o temperamento acomoda ou exagera; (4) nunca rotule a pessoa como limitacao - o temperamento explica a tendencia, nao autoriza o comportamento.`;

const ESCOLA_LIDERANCA = `REFERENCIAL DE LIDERANCA da consultora: a lideranca virtuosa de Alexandre Havard, aplicada ao negocio. Chaves: (1) a essencia da lideranca e MAGNANIMIDADE (grandeza de visao e de missao - querer coisas grandes) + HUMILDADE (lideranca como servico - fazer os outros crescerem); (2) o alicerce sao as virtudes cardeais vividas no trabalho ordinario: prudencia (decidir bem), fortaleza (sustentar o rumo e assumir riscos), temperanca (dominio de si), justica (dar a cada um o que lhe e devido); (3) virtude e habito - cresce pela pratica repetida em situacoes reais de trabalho, nao por discurso; (4) carater vem antes de tecnica: lideranca se APRENDE porque virtude se treina; (5) o temperamento e a materia-prima que a virtude aperfeicoa - nenhum temperamento e impedimento para liderar.`;

const GUIA_MOLDAGEM = {
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

const FORM_TEMPERAMENTO = [
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

function contarTemperamentos(respostas) {
  const contagem = { sanguineo: 0, colerico: 0, melancolico: 0, fleumatico: 0 };
  for (const chave of Object.values(respostas || {})) {
    if (contagem[chave] !== undefined) contagem[chave]++;
  }
  const ordenados = Object.entries(contagem).sort((a, b) => b[1] - a[1]);
  return { contagem, dominante: ordenados[0][1] > 0 ? ordenados[0][0] : "", secundario: ordenados[1][1] > 0 ? ordenados[1][0] : "" };
}

// ─── IA: Análise de Temperamento ────────────────────────────────

async function gerarAnaliseTemperamento(cliente, pessoa, cargos) {
  const cargoDesc = cargos.find((c) => c.nome.toLowerCase() === (pessoa.cargo || "").toLowerCase());
  const jaDefinido = pessoa.dominante && TEMPERAMENTOS[pessoa.dominante];

  const prompt = `Você é especialista em ciência dos temperamentos (sanguíneo, colérico, melancólico, fleumático) aplicada à gestão de pessoas em pequenas e médias empresas brasileiras, no método da consultora Nayara Silva.
${ESCOLA_TEMPERAMENTOS}
${ESCOLA_LIDERANCA}

CLIENTE
Negócio: ${cliente.negocio} (${cliente.segmento})

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
${pessoa.contratante ? "ATENÇÃO: esta pessoa é o CONTRATANTE/DONO — quem contratou a consultoria. Além da análise padrão, oriente a própria consultora sobre como conduzir a consultoria com essa pessoa." : ""}
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

// ─── Diagnóstico de Maturidade ──────────────────────────────────

const ESCALA_DIAG = ["Inexistente", "Inicial", "Definido", "Consolidado"];

const FRAMEWORK_DIAG = [
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

function chaveNota(a, c) {
  return `${a}-${c}`;
}

const FRAMEWORK_PESSOAL = [
  { area: "Autoconsciência", criterios: ["Conhece as próprias forças e limites", "Percebe as emoções no momento em que surgem", "Reconhece os padrões que se repetem na própria vida", "Aceita feedback sem se defender"] },
  { area: "Domínio de Si", criterios: ["Regula impulsos sob pressão", "Sustenta os hábitos que decidiu ter", "Cumpre o que combina consigo mesmo", "Lida com frustração sem se sabotar"] },
  { area: "Relações", criterios: ["Escuta com atenção real", "Expressa o que pensa e sente com clareza", "Estabelece limites saudáveis", "Repara conflitos em vez de fugir deles"] },
  { area: "Ordem e Prioridades", criterios: ["Mantém rotina que sustenta a energia (sono, corpo)", "Separa o importante do urgente", "Termina o que começa", "Usa o tempo alinhado ao que diz importar"] },
  { area: "Propósito e Direção", criterios: ["Sabe o que quer construir na vida", "Decide coerente com os próprios valores", "Vive fora do piloto automático", "Investe em crescimento contínuo"] },
  { area: "Coragem de Agir", criterios: ["Age antes de se sentir totalmente pronto", "Enfrenta conversas e decisões difíceis", "Assume erros sem se destruir", "Pede ajuda quando precisa"] },
];

const FRAMEWORK_LIDER = [
  { area: "Autoconsciência", criterios: ["Conhece as próprias forças e limites", "Busca e recebe feedback sem se defender", "Regula as emoções sob pressão", "Age coerente com o que cobra dos outros"] },
  { area: "Comunicação", criterios: ["Comunica expectativas com clareza", "Escuta antes de responder", "Dá feedback frequente e específico ao time", "Conduz conversas difíceis sem adiar"] },
  { area: "Delegação e Confiança", criterios: ["Delega com clareza de resultado e prazo", "Acompanha sem microgerenciar", "Tolera o erro de aprendizagem", "Desenvolve autonomia nos liderados"] },
  { area: "Gestão do Time", criterios: ["Conhece o perfil de cada liderado", "Distribui tarefas conforme o perfil", "Lida com conflitos de frente e com justiça", "Cobra resultados sem quebrar a relação"] },
  { area: "Resultados e Prioridades", criterios: ["Separa o importante do urgente", "Planeja a semana antes que ela o atropele", "Decide no tempo certo, sem paralisar", "Acompanha números, não só impressões"] },
  { area: "Influência e Relações", criterios: ["Gerencia bem a relação com o próprio chefe", "Constrói pontes com pares e outras áreas", "Exerce autoridade sem precisar do cargo", "É exemplo do comportamento que exige"] },
];

function percentualArea(notas, aIdx, framework) {
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

async function gerarLeituraDiagLider(cliente, notas, mentoria, mentorado) {
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

async function gerarLeituraDiagnostico(cliente, notas, gestao, registrosCampo) {
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

// ─── IA: Proposta Comercial ─────────────────────────────────────

async function gerarProposta(cliente, prop, gestao, diags, pessoas, registrosCampo, mentoria) {
  const achadosCampo = resumoCampo(registrosCampo || [], "geral").slice(0, 500);

  if (cliente.tipo === "pessoa") {
    const mentorado = (pessoas || []).find((p) => p.contratante && p.dominante && TEMPERAMENTOS[p.dominante]);
    const jornada = ((mentoria && mentoria.encontros) || []).map((e, i) => `${i + 1}. ${e.tema}${e.objetivo ? ` - ${e.objetivo}` : ""}`).join("\n");
    const focoAutoP = mentoria && (mentoria.foco || "lideranca") === "autoconhecimento";
    const promptMentoria = `Voce e mentora de desenvolvimento humano, especialista em temperamentos${focoAutoP ? " e autoconhecimento" : ", governanca e lideranca"}. Escreva a PROPOSTA DE MENTORIA INDIVIDUAL abaixo - calorosa, profissional e direta, falando COM a pessoa (nao sobre uma empresa). Adapte o conteudo ao PAPEL REAL do mentorado - nunca presuma que e dono nem que almeja lideranca.${focoAutoP ? " FOCO DA MENTORIA: autoconhecimento e crescimento pessoal - a promessa e uma pessoa que se sustenta sem o mentor." : ""}

MENTORADO
Nome: ${cliente.negocio}
Atuacao: ${cliente.segmento}
Contexto e objetivos: ${cliente.contexto || "nao informado"}
${mentoria && mentoria.objetivos ? `Objetivos declarados: ${mentoria.objetivos}` : ""}
${mentoria && mentoria.briefing ? `Briefing da conversa inicial: ${mentoria.briefing}` : ""}
${mentorado ? `Temperamento mapeado: ${TEMPERAMENTOS[mentorado.dominante].rotulo} - calibre o TOM da proposta a esse perfil sem citar temperamentos.` : ""}
${jornada ? `Jornada ja desenhada (use como estrutura das fases):\n${jornada}` : ""}

PARAMETROS DEFINIDOS PELA MENTORA (use exatamente, nunca invente valores)
Duracao: ${prop.duracao || "a definir"}
Investimento: ${prop.investimento || "a definir"}
Condicoes de pagamento: ${prop.condicoesPagamento || "a combinar"}
Validade da proposta: ${prop.validade || "15 dias"}
Observacoes: ${prop.obs || "nenhuma"}

Responda APENAS com JSON compacto de uma linha:
{"ap":"apresentacao pessoal da mentoria em 2-3 frases","obj":"objetivo da mentoria para ESTE mentorado em 2-3 frases","fa":"fases/encontros da jornada, um por linha","en":"o que o mentorado leva (entregaveis e ganhos), um por linha","me":"metodologia em 2-3 frases citando a ciencia dos temperamentos","cg":"condicoes gerais em 2-4 frases usando os parametros"}
Sem markdown, sem texto fora do JSON.`;
    const textoM = await chamarIA(promptMentoria);
    const objM = extrairJSON(textoM, "{", "}");
    return {
      apresentacao: objM.ap || "",
      objetivo: objM.obj || "",
      fases: objM.fa || "",
      entregaveis: objM.en || "",
      metodologia: objM.me || "",
      condicoesGerais: objM.cg || "",
    };
  }

  const frentes = (gestao && gestao.frentes) || [];
  const listaFrentes = frentes.map((f) => `${f.nome}${f.escopo ? ` (${f.escopo})` : ""}`).join("; ") || "não mapeadas";

  const ultimoDiag = (diags || []).length ? diags[diags.length - 1] : null;
  let blocoDiag = "Diagnóstico de maturidade: ainda não realizado.";
  if (ultimoDiag) {
    const areas = FRAMEWORK_DIAG.map((a, i) => {
      const p = percentualArea(ultimoDiag.notas, i);
      return p === null ? null : `${a.area}: ${p}%`;
    }).filter(Boolean).join("; ");
    blocoDiag = `Diagnóstico de maturidade (${ultimoDiag.data}): ${areas || "sem notas"}.${ultimoDiag.criticos ? ` Pontos críticos: ${ultimoDiag.criticos.split("\n").join("; ")}` : ""}`;
  }

  const dono = (pessoas || []).find((p) => p.contratante && p.dominante && TEMPERAMENTOS[p.dominante]);
  const blocoDono = dono
    ? `Temperamento do contratante: dominante ${TEMPERAMENTOS[dono.dominante].rotulo}${dono.secundario && TEMPERAMENTOS[dono.secundario] ? `, secundário ${TEMPERAMENTOS[dono.secundario].rotulo}` : ""}. Calibre o TOM do texto para esse temperamento (colérico: direto e focado em resultado; melancólico: método e detalhamento; sanguíneo: visão e entusiasmo; fleumático: segurança e passo a passo) — sem citar temperamentos no texto.`
    : "Temperamento do contratante não mapeado — use tom equilibrado.";

  const prompt = `Você é especialista em consultoria de governança para PMEs brasileiras, redigindo a proposta comercial da consultora Nayara Silva para o cliente abaixo. Texto profissional, confiante e sem promessas irreais.

CLIENTE
Negócio: ${cliente.negocio}
Segmento: ${cliente.segmento}
Contexto e dores: ${cliente.contexto || "não informado"}
Briefing: ${(gestao && gestao.briefing) || "não registrado"}
Frentes identificadas: ${listaFrentes}
${blocoDiag}
${blocoDono}

PARÂMETROS DA PROPOSTA
Duração prevista: ${prop.duracao || "a definir"}
Observações da consultora: ${prop.obs || "nenhuma"}

${achadosCampo ? `ACHADOS DE CAMPO (se houver, cite 1-2 achados concretos na apresentação/objetivo como evidência do diagnóstico — sem citar nomes de pessoas): ${achadosCampo}` : ""}
Responda APENAS com JSON compacto de uma linha:
{"ap":"apresentação — leitura do momento do cliente conectada às dores/diagnóstico (2-3 frases)","ob":"objetivo do trabalho (1-2 frases)","fa":["fases no formato 'Fase N — nome — o que inclui — duração estimada' (2 a 4 fases coerentes com as frentes)"],"en":["5 a 9 entregáveis concretos (documentos, estruturas, treinamentos)"],"me":"metodologia de trabalho, incluindo a ciência dos temperamentos como diferencial (2-3 frases)","cg":"condições gerais — o que a proposta não inclui e premissas de trabalho (2-3 frases)"}
Sem markdown, sem texto fora do JSON.`;

  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  const linhas = (v) => (Array.isArray(v) ? v.join("\n") : v || "");
  return {
    apresentacao: obj.ap || "",
    objetivo: obj.ob || "",
    fases: linhas(obj.fa),
    entregaveis: linhas(obj.en),
    metodologia: obj.me || "",
    condicoesGerais: obj.cg || "",
  };
}

// ─── Cronograma ─────────────────────────────────────────────────

function parseDataBR(str) {
  if (!str) return null;
  const m = String(str).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!m) return null;
  const ano = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
  const d = new Date(ano, Number(m[2]) - 1, Number(m[1]));
  return isNaN(d.getTime()) ? null : d;
}

function semanaAtualDe(inicio, duracao) {
  const d = parseDataBR(inicio);
  if (!d) return null;
  const diff = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 0; // ainda não começou
  const sem = Math.floor(diff / 7) + 1;
  const total = Number(duracao) || 0;
  return total > 0 ? Math.min(sem, total + 1) : sem;
}

function intervaloSemana(inicio, w) {
  const d = parseDataBR(inicio);
  if (!d || !w) return "";
  const ini = new Date(d.getTime() + (w - 1) * 7 * 86400000);
  const fim = new Date(ini.getTime() + 6 * 86400000);
  const fmt = (x) => `${String(x.getDate()).padStart(2, "0")}/${String(x.getMonth() + 1).padStart(2, "0")}`;
  return `${fmt(ini)}–${fmt(fim)}`;
}

function acoesNumeradas(frentes) {
  const lista = [];
  (frentes || []).forEach((f) => {
    (f.acoes || []).forEach((a) => {
      lista.push({ frenteId: f.id, frenteNome: f.nome, acao: a });
    });
  });
  return lista;
}

async function distribuirCronograma(cliente, gestao) {
  const todas = acoesNumeradas(gestao.frentes);
  const numeradas = todas.filter((x) => !x.acao.feita && !x.acao.semana);
  if (numeradas.length === 0) return {};
  const jaMarcadas = todas
    .filter((x) => x.acao.semana)
    .map((x) => `semana ${x.acao.semana}: ${x.acao.texto}`)
    .join("; ");
  const linhas = numeradas.map((x, i) => `${i + 1}. [${x.frenteNome}] ${x.acao.texto}`).join("\n");
  const duracao = Number(gestao.duracaoSemanas) || 10;

  const prompt = `Você é especialista em planejamento de consultorias para PMEs brasileiras. Distribua as ações abaixo ao longo de ${duracao} semanas de engajamento, respeitando dependências lógicas (diagnóstico/estrutura antes de documentos; documentos antes de treinamento/implantação) e equilibrando a carga semanal.

CLIENTE: ${cliente.negocio} (${cliente.segmento})

AÇÕES PENDENTES A DISTRIBUIR (numeradas — apenas estas)
${linhas}
${jaMarcadas ? `Ações já alocadas (NÃO redistribua; use como referência de carga): ${jaMarcadas}` : ""}

Responda APENAS com JSON compacto de uma linha, uma entrada por ação:
{"s":[{"n":número da ação,"w":semana de 1 a ${duracao}}]}
Sem markdown, sem texto fora do JSON.`;

  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  const mapa = {};
  for (const item of obj.s || []) {
    const idx = Number(item.n) - 1;
    const w = Number(item.w);
    if (numeradas[idx] && w >= 1 && w <= duracao) {
      mapa[numeradas[idx].acao.id] = w;
    }
  }
  return mapa;
}

// ─── IA: Relatório de Encerramento ──────────────────────────────

async function gerarRelatorio(cliente, rel, resumo) {
  const prompt = `Você é especialista em consultoria de governança para PMEs brasileiras, redigindo o relatório de encerramento do engajamento da consultora Nayara Silva. Tom: profissional, concreto, orgulhoso do que foi feito sem inflar — números e fatos acima de adjetivos.

CLIENTE
Negócio: ${cliente.negocio} (${cliente.segmento})

DADOS DO ENGAJAMENTO (reais, extraídos do sistema)
${resumo}

Observações da consultora: ${rel.obs || "nenhuma"}

Responda APENAS com JSON compacto de uma linha:
{"re":"retrospectiva do engajamento — de onde o cliente partiu e o que foi feito (3-5 frases)","rs":["resultados mensuráveis, um por item, citando os números antes/depois quando existirem"],"en":["entregas realizadas, uma por item, concretas"],"rc":["3 a 5 recomendações de continuidade práticas, em ordem de prioridade"],"pr":"sugestão de próximo passo com a consultoria (1-2 frases, sem pressão)"}
Sem markdown, sem texto fora do JSON.`;

  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  const linhas = (v) => (Array.isArray(v) ? v.join("\n") : v || "");
  return {
    retrospectiva: obj.re || "",
    resultados: linhas(obj.rs),
    entregas: linhas(obj.en),
    recomendacoes: linhas(obj.rc),
    proximoPasso: obj.pr || "",
  };
}

// ─── Financeiro: utilitários ────────────────────────────────────

function parseValorBR(str) {
  if (!str) return 0;
  const limpo = String(str).replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const n = parseFloat(limpo);
  return isNaN(n) ? 0 : n;
}

function formatarBR(n) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ─── IA: Desenho de Processo (fluxo) ────────────────────────────

async function gerarFluxo(cliente, fluxo, cargos, pops, registrosCampo) {
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

// ─── IA: Alçadas de Decisão ─────────────────────────────────────

async function gerarAlcadas(cliente, obs, cargos, posicoes, entrevistas) {
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

// ─── IA: Indicadores ────────────────────────────────────────────

async function gerarIndicadores(cliente, obs, cargos, ultimoDiag) {
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

// ─── IA: Ritos de Gestão ────────────────────────────────────────

async function gerarRitos(cliente, obs, cargos, indicadores) {
  const listaCargos = cargos.map((c) => c.nome).filter(Boolean).join(", ") || "nenhum cadastrado";
  const listaInd = (indicadores || []).map((i) => `${i.nome} (${i.area}, ${i.frequencia})`).join("; ") || "ainda não definidos";
  const prompt = `Você é especialista em governança de pequenas e médias empresas brasileiras. Defina a cadência de RITOS DE GESTÃO do cliente: as reuniões fixas que fazem a gestão acontecer sem depender do dono lembrar.

CLIENTE
Negócio: ${cliente.negocio}
Segmento: ${cliente.segmento}
Setores: ${cliente.setores || "não informado"}
Cargos: ${listaCargos}
Indicadores definidos (cite-os nas pautas quando fizer sentido): ${listaInd}
Observações da consultora: ${obs || "nenhuma"}

Regras:
- 3 a 5 ritos, do operacional ao estratégico (ex.: alinhamento diário rápido, semanal de líderes, mensal de resultados).
- Duração realista e curta — PME não tem gordura de agenda.
- Pauta padrão de 3 a 6 itens por rito, sempre os mesmos itens, para virar hábito.
- Nos ritos semanais/mensais, um dos itens da pauta DEVE ser "Anomalias da semana: relatadas, causas e ações".

Responda APENAS com JSON compacto de uma linha:
{"r":[{"n":"nome do rito","f":"frequência e momento (ex.: diária, 15h, antes do turno)","d":"duração","p":"participantes","pa":["itens da pauta padrão"]}]}
Sem markdown, sem texto fora do JSON.`;

  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  return (obj.r || [])
    .filter((x) => x && x.n)
    .map((x) => ({
      id: uid(),
      nome: x.n,
      frequencia: x.f || "",
      duracao: x.d || "",
      participantes: x.p || "",
      pauta: Array.isArray(x.pa) ? x.pa.join("\n") : x.pa || "",
    }));
}

async function gerarAtualizacaoPlano(cliente, gestao, ultimaAta, pessoas, riscosCampo) {
  const frentes = gestao.frentes || [];
  const linhasFrentes = frentes
    .map((f, i) => {
      const acoes = (f.acoes || [])
        .map((a) => `${a.feita ? "[feita]" : "[pendente]"} ${a.texto}`)
        .join("; ");
      return `${i + 1}. ${f.nome} (status: ${STATUS_FRENTE[f.status] ? STATUS_FRENTE[f.status].rotulo : f.status}) — ações: ${acoes || "nenhuma"}`;
    })
    .join("\n");

  const blocoAta = ultimaAta
    ? `\nÚLTIMA ATA DE ALINHAMENTO (${ultimaAta.data || "sem data"} — ${ultimaAta.nome || "reunião"}):
Resumo: ${ultimaAta.resumo || "—"}
Decisões: ${(ultimaAta.decisoes || "").split("\n").join("; ") || "—"}
Ações acordadas: ${(ultimaAta.acoes || "").split("\n").join("; ") || "—"}\n`
    : "\n(nenhuma ata de alinhamento registrada)\n";

  const dono = (pessoas || []).find((p) => p.contratante && p.dominante && TEMPERAMENTOS[p.dominante]);
  const blocoDono = dono
    ? `Contratante: dominante ${TEMPERAMENTOS[dono.dominante].rotulo} — molde novas ações a esse perfil sem citar temperamentos (colérico: resultado rápido; melancólico: método explícito; sanguíneo: marcos celebráveis; fleumático: passos graduais).`
    : "";

  const prompt = `Você é especialista em governança de PMEs brasileiras. A consultora fez uma REUNIÃO DE ALINHAMENTO e precisa ATUALIZAR o plano de ação do cliente — preservando todo o progresso já registrado.

CLIENTE
Negócio: ${cliente.negocio} (${cliente.segmento})
Briefing original: ${gestao.briefing || "não registrado"}
${blocoDono}

PLANO ATUAL (frentes numeradas, com status e ações)
${linhasFrentes || "nenhuma frente"}
${blocoAta}${riscosCampo ? `RISCOS OBSERVADOS EM CAMPO (transforme os relevantes em ações, sem duplicar as existentes):\n${riscosCampo}\n` : ""}
Responda APENAS com as MUDANÇAS, em JSON compacto de uma linha:
{"na":[{"f":número da frente,"a":["novas ações curtas a acrescentar nessa frente"]}],"st":[{"f":número,"s":"nao_iniciada|em_andamento|formalizada"} apenas se a ata evidenciar mudança de status],"nf":[{"n":"nome de frente NOVA que a ata revelou","s":"nao_iniciada|em_andamento|formalizada","e":"escopo em 1 frase","a":["2 a 5 ações"]}]}
Regras: nunca remova nem reescreva ações existentes; não repita ação que já existe; se nada mudou em uma frente, não a mencione; máximo 3 frentes novas.
Sem markdown, sem texto fora do JSON.`;

  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");

  const novasFrentes = frentes.map((f, i) => {
    const n = i + 1;
    const st = (obj.st || []).find((x) => Number(x.f) === n);
    const na = (obj.na || []).find((x) => Number(x.f) === n);
    const existentes = new Set((f.acoes || []).map((a) => a.texto.trim().toLowerCase()));
    const acrescimos = na && Array.isArray(na.a)
      ? na.a.filter((t) => t && !existentes.has(String(t).trim().toLowerCase())).map((t) => ({ id: uid(), texto: t, feita: false }))
      : [];
    return {
      ...f,
      status: st && STATUS_FRENTE[st.s] ? st.s : f.status,
      acoes: [...(f.acoes || []), ...acrescimos],
    };
  });

  const inéditas = (obj.nf || [])
    .filter((f) => f && f.n)
    .slice(0, 3)
    .map((f) => ({
      id: uid(),
      nome: f.n,
      status: STATUS_FRENTE[f.s] ? f.s : "nao_iniciada",
      escopo: f.e || "",
      acoes: (Array.isArray(f.a) ? f.a : []).map((a) => ({ id: uid(), texto: a, feita: false })),
    }));

  return [...novasFrentes, ...inéditas];
}

// ─── IA: Plano de Treinamento ───────────────────────────────────

async function gerarPlanoTreinamento(cliente, trein, frente, pessoas, registrosCampo) {
  const publico = (pessoas || [])
    .filter((p) => p.dominante && TEMPERAMENTOS[p.dominante])
    .map((p) => `${p.nome} (${p.cargo || "?"}): ${TEMPERAMENTOS[p.dominante].rotulo}`)
    .join("; ");
  const dores = resumoCampo(registrosCampo || [], "geral").slice(0, 400);
  const prompt = `Voce e especialista em treinamento de equipes e lideranca para PMEs brasileiras, com base na ciencia dos temperamentos (sanguineo, colerico, melancolico, fleumatico).
${ESCOLA_TEMPERAMENTOS}
${ESCOLA_LIDERANCA}
Monte o plano do treinamento abaixo - pratico, aplicavel no chao da operacao, com a marca metodologica da consultora (temperamentos como lente de autoconhecimento e lideranca).

CLIENTE
Negocio: ${cliente.negocio} (${cliente.segmento})
Contexto: ${cliente.contexto || "nao informado"}
${frente ? `Frente da consultoria a que este treinamento pertence: ${frente.nome} - ${frente.escopo || ""}` : "Treinamento avulso (fora de consultoria)."}
${publico ? `Temperamentos ja mapeados no time (adapte dinamicas ao perfil real): ${publico}` : ""}
${dores ? `Dores observadas em campo: ${dores}` : ""}

TREINAMENTO
Tema: ${trein.tema}
Publico: ${trein.publico || "nao informado"}
Carga horaria: ${trein.cargaHoraria || "a definir"}
Observacoes da consultora: ${trein.obs || "nenhuma"}

Responda APENAS com JSON compacto de uma linha:
{"ob":["3 a 5 objetivos de aprendizagem observaveis"],"bl":[{"t":"titulo do bloco","d":"duracao (ex.: 30 min)","c":"conteudo e atividade do bloco em 1-2 frases"}],"di":["2 a 3 dinamicas praticas com instrucao curta"],"av":"como avaliar se o treinamento pegou (1-2 frases, mensuravel)"}
4 a 7 blocos somando a carga horaria. Sem markdown, sem texto fora do JSON.`;
  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  return {
    objetivos: Array.isArray(obj.ob) ? obj.ob.join("\n") : obj.ob || "",
    blocos: Array.isArray(obj.bl) ? obj.bl.map((b) => `${b.t} - ${b.d}: ${b.c}`).join("\n") : "",
    dinamicas: Array.isArray(obj.di) ? obj.di.join("\n") : obj.di || "",
    avaliacao: obj.av || "",
  };
}

async function gerarJornadaMentoria(cliente, mentoria, mentorado, ultimoDiag, entorno, diagLider) {
  const FRJ = (mentoria.foco || "lideranca") === "autoconhecimento" ? FRAMEWORK_PESSOAL : FRAMEWORK_LIDER;
  const areasFracasLider = diagLider
    ? FRJ.map((a, i) => {
        const p = percentualArea(diagLider.notas, i, FRJ);
        return p !== null && p < 60 ? `${a.area} (${p}%)` : null;
      }).filter(Boolean).join(", ")
    : "";
  const blocoEntorno = (entorno || [])
    .filter((p) => p.nome && (!mentorado || p.id !== mentorado.id) && p.dominante && TEMPERAMENTOS[p.dominante])
    .map((p) => `${p.nome} (${p.cargo || "?"}): ${TEMPERAMENTOS[p.dominante].rotulo}`)
    .join("; ");
  const blocoMentorado = mentorado
    ? `Mentorado: ${mentorado.nome}${mentorado.cargo ? ` (${mentorado.cargo})` : ""}${mentorado.dominante && TEMPERAMENTOS[mentorado.dominante] ? ` - temperamento ${TEMPERAMENTOS[mentorado.dominante].rotulo}${mentorado.secundario && TEMPERAMENTOS[mentorado.secundario] ? ` com ${TEMPERAMENTOS[mentorado.secundario].rotulo}` : ""} (adapte tom e desafios ao perfil, sem citar temperamentos nos titulos)` : ""}`
    : "Mentorado ainda nao vinculado.";
  const blocoDiag = ultimoDiag
    ? `Maturidade do negocio (areas fracas orientam temas): ${FRAMEWORK_DIAG.map((a, i) => { const p = percentualArea(ultimoDiag.notas, i); return p !== null ? `${a.area} ${p}%` : null; }).filter(Boolean).join(", ")}`
    : "";
  const papel = cliente.tipo === "pessoa" ? cliente.segmento : (mentorado && mentorado.cargo) || "nao informado";
  const focoAuto = (mentoria.foco || "lideranca") === "autoconhecimento";
  const prompt = `Voce e mentora de desenvolvimento humano em PMEs brasileiras - o mentorado pode ser dono, gestor, lider, colaborador ou uma pessoa que simplesmente quer crescer. Sua especialidade: temperamentos, virtude e ${focoAuto ? "autoconhecimento" : "lideranca"}.
${focoAuto ? "FOCO DESTA MENTORIA: AUTOCONHECIMENTO E CRESCIMENTO PESSOAL - o mentorado NAO busca lideranca. Temas orbitam a vida dele como um todo (habitos, relacoes, dominio de si, direcao), nao gestao de time. A promessa e uma pessoa que se sustenta sem o mentor." : "FOCO DESTA MENTORIA: LIDERANCA."}
${ESCOLA_TEMPERAMENTOS}
${ESCOLA_LIDERANCA} Desenhe a JORNADA DE MENTORIA: encontros com tema, objetivo e provocacao de cada um.

REGRA CENTRAL: adapte TODOS os temas ao PAPEL REAL do mentorado (informado abaixo) e ao FOCO declarado. NUNCA presuma que ele e dono da empresa nem que almeja lideranca. Um lider de equipe trabalha influencia, gestao do time e relacao com o proprio chefe; um dono trabalha autonomia do negocio; um colaborador em desenvolvimento trabalha preparacao para liderar; uma pessoa em autoconhecimento trabalha a si mesma - habitos, emocoes, relacoes e direcao de vida.

MENTORADO
Nome: ${cliente.tipo === "pessoa" ? cliente.negocio : (mentorado && mentorado.nome) || "nao informado"}
Papel/atuacao: ${papel}
Contexto: ${cliente.contexto || "nao informado"}
${blocoMentorado}
${blocoDiag}
Objetivos declarados da mentoria: ${mentoria.objetivos || "nao declarados - proponha a partir do contexto"}
Briefing da conversa inicial: ${mentoria.briefing || "nao registrado"}
${areasFracasLider ? `DIAGNOSTICO DE LIDERANCA - areas fracas (dedique encontros a elas): ${areasFracasLider}` : ""}
${(mentoria.praticas || []).filter((p) => p.status === "ativa").length ? `PRATICAS MOLDADORAS JA ATIVAS (nao repita como atividade; os encontros devem COBRA-LAS e aprofundar o que elas revelam): ${(mentoria.praticas || []).filter((p) => p.status === "ativa").map((p) => p.texto).join("; ")}` : ""}
${mentoria.moldagem && mentoria.moldagem.virtudeCentral && mentoria.moldagem.virtudeCentral.nome ? `VIRTUDE CENTRAL DA JORNADA: ${mentoria.moldagem.virtudeCentral.nome} - toda a jornada orbita o cultivo dela de forma SUBJETIVA (nunca cite a palavra virtude nem o nome dela nos titulos dos encontros; ela e a bussola interna, nao o discurso)` : ""}
${blocoEntorno ? `Entorno liderado pelo mentorado (temperamentos mapeados - a mentoria de lideranca trabalha a relacao dele com estas pessoas): ${blocoEntorno}` : ""}

Responda APENAS com JSON compacto de uma linha:
{"j":[{"t":"tema do encontro","o":"objetivo em 1 frase","p":"provocacao reflexiva do encontro","at":["1 a 3 atividades PRA CASA concretas e verificaveis (ex.: observar e anotar 3 situacoes X; aplicar a ferramenta Y com o time; conversa dificil Z)"]}]}
6 a 10 encontros, do fundamento a autonomia, seguindo o arco do Metodo Enraizar: os primeiros encontros ESCUTAM e aprofundam o RAIO-X (autoconhecimento), o meio CONSTROI habitos novos, os finais SUSTENTAM (habitos rodando sem o mentor) e PROVAM a evolucao. Nao cite os nomes das fases nos titulos. Atividades devem ser executaveis entre um encontro e outro, no papel real do mentorado; use o formato FCA (Fato-Causa-Acao de uma situacao dificil da semana) como atividade recorrente a partir do meio da jornada. Sem markdown, sem texto fora do JSON.`;
  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  return (obj.j || [])
    .filter((e) => e && e.t)
    .map((e) => ({
      id: uid(),
      tema: e.t,
      objetivo: e.o || "",
      provocacao: e.p || "",
      atividades: (Array.isArray(e.at) ? e.at : []).filter(Boolean).map((a) => ({ id: uid(), texto: a, feita: false })),
      data: "",
      anotacoes: "",
      acoes: "",
      realizada: false,
    }));
}

async function estruturarSessaoMentoria(cliente, sessao) {
  const prompt = `Voce e mentora de empresarios. Estruture as anotacoes brutas da sessao de mentoria abaixo em registro fiel - sem inventar nada que nao esteja nas anotacoes.

Cliente: ${cliente.negocio}
Tema do encontro: ${sessao.tema || "nao definido"}
Anotacoes brutas: ${sessao.anotacoes}

Responda APENAS com JSON compacto de uma linha:
{"r":"resumo fiel em 3-5 frases","a":["acoes/compromissos do mentorado no trabalho, formato acao - prazo"],"at":["atividades PRA CASA combinadas na sessao (exercicios, observacoes, leituras) - apenas se estiverem nas anotacoes"]}
Sem markdown, sem texto fora do JSON.`;
  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  return {
    anotacoes: obj.r || sessao.anotacoes,
    acoes: Array.isArray(obj.a) ? obj.a.join("\n") : obj.a || "",
    novasAtividades: (Array.isArray(obj.at) ? obj.at : []).filter(Boolean),
  };
}

async function gerarFichaMoldagem(cliente, mentoria, mentorado, diagsLider) {
  const focoAutoF = mentoria && (mentoria.foco || "lideranca") === "autoconhecimento";
  const guia = mentorado && mentorado.dominante && GUIA_MOLDAGEM[mentorado.dominante] ? GUIA_MOLDAGEM[mentorado.dominante] : null;
  const guiaSec = mentorado && mentorado.secundario && GUIA_MOLDAGEM[mentorado.secundario] ? GUIA_MOLDAGEM[mentorado.secundario] : null;
  const FRF = focoAutoF ? FRAMEWORK_PESSOAL : FRAMEWORK_LIDER;
  const ultimo = diagsLider && diagsLider.length ? diagsLider[diagsLider.length - 1] : null;
  const areasFracas = ultimo
    ? FRF.map((a, i) => { const p = percentualArea(ultimo.notas, i, FRF); return p !== null && p < 60 ? `${a.area} (${p}%)` : null; }).filter(Boolean).join(", ") || "nenhuma abaixo de 60%"
    : "diagnostico nao realizado";
  const prompt = `Voce e mentora de desenvolvimento humano especialista na ciencia dos temperamentos. Gere a FICHA DE MOLDAGEM do mentorado: orientacoes PRECISAS e praticas moldadoras no estilo da mentora.
${focoAutoF ? "FOCO: AUTOCONHECIMENTO - o mentorado nao busca lideranca; as praticas moldam a vida pessoal dele (habitos, corpo, relacoes, dominio de si), nao a gestao de equipe." : "FOCO: LIDERANCA."}
${ESCOLA_TEMPERAMENTOS}
${ESCOLA_LIDERANCA}

O ESTILO DA MENTORA (siga-o rigorosamente): prescricoes concretas, muitas vezes fisicas ou aparentemente futeis, cirurgicamente escolhidas para CONTRABALANCAR a tendencia do temperamento. Exemplo real dela: a uma mentorada fleumatica, prescreveu USAR SALTO ALTO TODOS OS DIAS - parece futil, mas impede o conforto excessivo e molda postura de presenca. A pratica certa incomoda na medida e molda pelo corpo e pela repeticao, nao pelo discurso.

MENTORADO
Nome: ${cliente.tipo === "pessoa" ? cliente.negocio : (mentorado && mentorado.nome) || "nao informado"}
Papel: ${cliente.tipo === "pessoa" ? cliente.segmento : (mentorado && mentorado.cargo) || "nao informado"}
Contexto: ${cliente.contexto || "nao informado"}
Temperamento dominante: ${mentorado && mentorado.dominante ? TEMPERAMENTOS[mentorado.dominante].rotulo : "nao classificado"}${mentorado && mentorado.secundario && TEMPERAMENTOS[mentorado.secundario] ? ` · Secundario: ${TEMPERAMENTOS[mentorado.secundario].rotulo}` : ""}
Observacoes da mentora sobre a pessoa: ${(mentorado && mentorado.observacoes) || "nenhuma"}
Areas fracas do diagnostico de lideranca: ${areasFracas}
Objetivos da mentoria: ${(mentoria && mentoria.objetivos) || "nao declarados"}
${guia ? `
GUIA DE MOLDAGEM DO TEMPERAMENTO DOMINANTE (base da mentora - individualize, nao copie):
Tendencia que acomoda: ${guia.acomoda}
Direcao da moldagem: ${guia.direcao}
Exemplos de praticas do estilo: ${guia.praticas.join(" | ")}
Direcao de virtude do temperamento: ${guia.virtudes || ""}
Como cobrar: ${guia.cobranca}` : ""}
${guiaSec ? `Nuance do secundario - tendencia: ${guiaSec.acomoda}` : ""}

Responda APENAS com JSON compacto de uma linha:
{"le":"leitura do perfil DESTE mentorado neste papel em 3-5 frases (cruze temperamento com as areas fracas do diagnostico)","vc":{"n":"a VIRTUDE CENTRAL que esta jornada cultiva (uma so, classica: ex. mansidao, fortaleza, constancia, magnanimidade, humildade, temperanca, diligencia, esperanca)","m":"como a falta dela se manifesta hoje neste mentorado, em 1-2 frases","cu":"como cultiva-la de forma SUBJETIVA no cotidiano dele - nao como meta mensuravel, mas como direcao observavel, em 1-2 frases"},"ct":["2-4 tendencias especificas a contrabalancar NESTE caso"],"pr":[{"p":"pratica moldadora concreta e diaria/semanal, individualizada ao caso (pode ser fisica)","pq":"o que ela molda e por que funciona para este perfil, em 1 frase"}] com 3 a 5 praticas,"si":["2-3 sinais observaveis de que a moldagem esta pegando"],"co":"como a mentora deve cobrar ESTE mentorado em 2-3 frases"}
Sem markdown, sem texto fora do JSON.`;
  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  return {
    leitura: obj.le || "",
    virtudeCentral: obj.vc && obj.vc.n ? { nome: obj.vc.n, manifestacao: obj.vc.m || "", cultivo: obj.vc.cu || "" } : null,
    contrabalancos: Array.isArray(obj.ct) ? obj.ct.join("\n") : obj.ct || "",
    praticasSugeridas: (Array.isArray(obj.pr) ? obj.pr : []).filter((p) => p && p.p).map((p) => ({ id: uid(), texto: p.p, porque: p.pq || "" })),
    sinais: Array.isArray(obj.si) ? obj.si.join("\n") : obj.si || "",
    comoCobrar: obj.co || "",
  };
}

async function gerarMetasMentorado(cliente, mentoria, diagsLider) {
  const ultimo = diagsLider && diagsLider.length ? diagsLider[diagsLider.length - 1] : null;
  const areasFracas = ultimo
    ? FRAMEWORK_LIDER.map((a, i) => { const p = percentualArea(ultimo.notas, i, FRAMEWORK_LIDER); return p !== null && p < 60 ? `${a.area} (${p}%)` : null; }).filter(Boolean).join(", ")
    : "diagnostico de lideranca nao realizado";
  const focoAutoM = mentoria && (mentoria.foco || "lideranca") === "autoconhecimento";
  const prompt = `Voce e mentora de desenvolvimento humano (Metodo Enraizar)${focoAutoM ? ", com foco em AUTOCONHECIMENTO (metas sobre a vida da pessoa - habitos, relacoes, dominio de si - nao sobre gestao de time)" : ", com foco em lideranca"}. Sugira 2 a 3 METAS DO MENTORADO para a jornada de mentoria. Cada meta DEVE ser verificavel, com comportamento observavel + prazo. Nunca desejo vago ("melhorar a comunicacao"); sempre meta observavel ("delegar as decisoes de compra ate outubro"; "realizar 1 conversa dificil pendente ate o encontro 4").

MENTORADO: ${cliente.negocio} — ${cliente.segmento}
Contexto: ${cliente.contexto || "nao informado"}
Objetivos declarados: ${(mentoria && mentoria.objetivos) || "nao declarados"}
Areas fracas do diagnostico de lideranca: ${areasFracas}

Responda APENAS com JSON compacto de uma linha:
{"m":[{"o":"meta observavel","p":"prazo"}]}
Sem markdown, sem texto fora do JSON.`;
  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  return (obj.m || []).filter((m) => m && m.o).map((m) => ({ id: uid(), objetivo: m.o, prazo: m.p || "" }));
}

async function analisarAnomalia(cliente, anomalia, pops, fluxos) {
  const contexto = [
    (pops || []).length ? `POPs existentes: ${pops.map((p) => p.titulo || p.nome).filter(Boolean).join("; ")}` : "",
    (fluxos || []).length ? `Fluxos desenhados: ${fluxos.map((f) => f.nome || f.titulo).filter(Boolean).join("; ")}` : "",
  ].filter(Boolean).join("\n");
  const prompt = `Voce e consultora de governanca. Analise a ANOMALIA abaixo pelo metodo FCA (Fato -> Causa -> Acao). Seja concreta: causa raiz provavel (nao sintoma) e acao corretiva executavel.

CLIENTE: ${cliente.negocio} (${cliente.segmento})
${contexto}

ANOMALIA RELATADA
O que aconteceu: ${anomalia.fato}
Quando/onde: ${anomalia.quando || "nao informado"} ${anomalia.local || ""}

Responda APENAS com JSON compacto de uma linha:
{"c":"causa raiz provavel em 1-2 frases (se um POP/fluxo existente foi ignorado, diga qual)","a":"acao corretiva concreta em 1 frase iniciada por verbo","r":"responsavel sugerido (cargo)"}
Sem markdown, sem texto fora do JSON.`;
  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  return { causa: obj.c || "", acao: obj.a || "", responsavelSugerido: obj.r || "" };
}

async function gerarMetasEngajamento(cliente, diags, riscosCampo, cctPontos) {
  const ultimoDiag = diags && diags.length ? diags[diags.length - 1] : null;
  const areasFracas = ultimoDiag
    ? FRAMEWORK_DIAG.map((a, i) => { const p = percentualArea(ultimoDiag.notas, i); return p !== null && p < 60 ? `${a.area} (${p}%)` : null; }).filter(Boolean).join(", ")
    : "diagnostico nao realizado";
  const pendCCT = (cctPontos || []).filter((p) => (p.statusConf || "pendente") !== "resolvido").length;
  const prompt = `Voce e consultora de governanca (Metodo Enraizar). Sugira 2 a 3 METAS PACTUADAS para o engajamento abaixo. Cada meta DEVE ter objetivo + valor numerico + prazo. Nunca escreva desejo vago ("melhorar a conformidade"); sempre meta verificavel ("reduzir as pendencias de CCT de 12 para 0 ate novembro").

CLIENTE: ${cliente.negocio} (${cliente.segmento})
Contexto: ${cliente.contexto || "nao informado"}
Areas fracas do diagnostico: ${areasFracas}
Pendencias de conformidade (CCT) identificadas: ${pendCCT}
Riscos registrados em campo: ${(riscosCampo || "nenhum").slice(0, 400)}

Responda APENAS com JSON compacto de uma linha:
{"m":[{"o":"objetivo verificavel com valor numerico embutido","p":"prazo (mes/ano ou semana X)"}]}
Sem markdown, sem texto fora do JSON.`;
  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  return (obj.m || []).filter((m) => m && m.o).map((m) => ({ id: uid(), objetivo: m.o, prazo: m.p || "", }));
}

async function gerarRelatorioTreinamento(cliente, trein) {
  const presentes = (trein.participantesLista || []).filter((p) => p.presente && p.nome.trim());
  const prompt = `Voce e especialista em treinamento de equipes com base na ciencia dos temperamentos. Escreva o RELATORIO DE REALIZACAO do treinamento abaixo, para o contratante - sobrio, factual, com valor percebido. Baseie-se APENAS nos dados fornecidos.

CLIENTE: ${cliente.negocio} (${cliente.segmento})
TREINAMENTO: ${trein.tema}
Publico: ${trein.publico || "nao informado"} · Carga: ${trein.cargaHoraria || "nao informada"} · Data: ${trein.data || "nao informada"}
Programa aplicado: ${trein.blocos || "nao registrado"}
Objetivos: ${trein.objetivos || "nao registrados"}
Participantes presentes (${presentes.length}): ${presentes.map((p) => p.nome).join(", ") || "nao registrados"}
Registro da consultora sobre como foi: ${trein.obsRealizacao || "nao registrado"}

Responda APENAS com JSON compacto de uma linha:
{"rs":"resumo do que foi trabalhado em 3-4 frases","rr":"resultados e reacoes observadas em 3-4 frases (fiel ao registro da consultora; sem inventar)","rc":["2-4 recomendacoes de continuidade (proximos treinamentos ou praticas a sustentar)"]}
Sem markdown, sem texto fora do JSON.`;
  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  return {
    relResumo: obj.rs || "",
    relResultados: obj.rr || "",
    relRecomendacoes: Array.isArray(obj.rc) ? obj.rc.join("\n") : obj.rc || "",
  };
}

async function gerarRelatorioEvolucao(cliente, mentoria, mentorado, diagsLider) {
  const encontros = mentoria.encontros || [];
  const realizados = encontros.filter((e) => e.realizada);
  const atividadesTotal = encontros.flatMap((e) => e.atividades || []);
  const atividadesFeitas = atividadesTotal.filter((a) => a.feita);
  const temasRealizados = realizados.map((e) => e.tema).join("; ") || "nenhum";
  const primeiroD = diagsLider && diagsLider.length ? diagsLider[0] : null;
  const ultimoD = diagsLider && diagsLider.length > 1 ? diagsLider[diagsLider.length - 1] : null;
  const FRR = (mentoria.foco || "lideranca") === "autoconhecimento" ? FRAMEWORK_PESSOAL : FRAMEWORK_LIDER;
  const linhaDiag = (d, rot) => d
    ? `${rot}: ${FRR.map((a, i) => { const p = percentualArea(d.notas, i, FRR); return p !== null ? `${a.area} ${p}%` : null; }).filter(Boolean).join(", ")}`
    : null;
  const prompt = `Voce e mentora de liderancas. Escreva o RELATORIO DE EVOLUCAO da mentoria abaixo - honesto, baseado APENAS nos dados reais fornecidos, com numeros acima de adjetivos. E o documento que o mentorado (e quem paga a mentoria) recebe.

MENTORADO
Nome: ${cliente.tipo === "pessoa" ? cliente.negocio : (mentorado && mentorado.nome) || "nao informado"}
Papel: ${cliente.tipo === "pessoa" ? cliente.segmento : (mentorado && mentorado.cargo) || "nao informado"}
Objetivos da mentoria: ${mentoria.objetivos || "nao declarados"}

DADOS REAIS
Encontros: ${realizados.length} realizados de ${encontros.length} desenhados
Temas trabalhados: ${temasRealizados}
Atividades pra casa: ${atividadesFeitas.length} concluidas de ${atividadesTotal.length}
FCAs realizados pelo mentorado (analises Fato-Causa-Acao de situacoes reais): ${atividadesTotal.filter((a) => a.tipo === "fca" && (a.fato || a.causa)).map((a) => `[${(a.fato || "").slice(0, 80)} -> ${(a.acaoFca || "").slice(0, 60)}]`).join("; ") || "nenhum"}
Praticas moldadoras: ${(mentoria.praticas || []).filter((p) => p.status === "consolidada").length} consolidadas de ${(mentoria.praticas || []).length} prescritas${(mentoria.praticas || []).filter((p) => p.status === "consolidada").length ? ` (consolidadas: ${(mentoria.praticas || []).filter((p) => p.status === "consolidada").map((p) => p.texto).join("; ")})` : ""}
${mentoria.moldagem && mentoria.moldagem.virtudeCentral && mentoria.moldagem.virtudeCentral.nome ? `Virtude central trabalhada: ${mentoria.moldagem.virtudeCentral.nome}` : ""}
Diario da virtude - observacoes subjetivas da mentora (use como evidencia QUALITATIVA da evolucao, citando 1-2 sem inventar): ${((mentoria.virtudes || []).filter((v) => v.nota).map((v) => `${v.data}: ${v.nota}`).join("; ")) || "nenhuma registrada"}

${linhaDiag(primeiroD, "Diagnostico de lideranca inicial") || "Diagnostico de lideranca: nao realizado"}
${linhaDiag(ultimoD, "Diagnostico de lideranca atual") || ""}
Acoes combinadas nas sessoes: ${realizados.map((e) => e.acoes).filter(Boolean).join("; ").slice(0, 600) || "nenhuma registrada"}

Responda APENAS com JSON compacto de uma linha:
{"re":"retrospectiva da jornada em 4-6 frases","ev":"evolucao observada em 3-5 frases citando os numeros (encontros, atividades, percentuais do diagnostico quando existirem)","cq":["3-5 conquistas concretas"],"rc":["2-4 recomendacoes de continuidade do desenvolvimento"]}
Sem markdown, sem texto fora do JSON.`;
  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  return {
    retrospectiva: obj.re || "",
    evolucao: obj.ev || "",
    conquistas: Array.isArray(obj.cq) ? obj.cq.join("\n") : obj.cq || "",
    recomendacoes: Array.isArray(obj.rc) ? obj.rc.join("\n") : obj.rc || "",
  };
}

// ─── Motor próprio de PDF (sem dependências externas) ───────────

const PROPS_PDF = ["display","box-sizing","width","min-width","max-width","margin-top","margin-right","margin-bottom","margin-left","padding-top","padding-right","padding-bottom","padding-left","border-top-width","border-right-width","border-bottom-width","border-left-width","border-top-style","border-right-style","border-bottom-style","border-left-style","border-top-color","border-right-color","border-bottom-color","border-left-color","border-radius","background-color","background-image","color","font-family","font-size","font-weight","font-style","line-height","letter-spacing","text-align","text-decoration-line","text-transform","white-space","vertical-align","border-collapse","border-spacing","list-style-type","list-style-position","flex-direction","flex-wrap","justify-content","align-items","gap","flex-grow","flex-shrink","flex-basis","transform","opacity","overflow"];

function inlinarEstilos(el) {
  if (el.namespaceURI && el.namespaceURI.includes("svg")) return; // SVGs já carregam seus atributos
  const cs = window.getComputedStyle(el);
  let s = "";
  for (const p of PROPS_PDF) {
    const v = cs.getPropertyValue(p);
    if (v && v !== "normal" && v !== "none" && v !== "auto") s += `${p}:${v};`;
    else if (v && (p === "display" || p.startsWith("border") || p.startsWith("margin") || p.startsWith("padding"))) s += `${p}:${v};`;
  }
  el.setAttribute("style", s);
  el.removeAttribute("class");
  for (const filho of Array.from(el.children)) inlinarEstilos(filho);
}

function construirPdf(paginas) {
  const W = 595.28;
  const H = 841.89;
  const partes = [];
  let pos = 0;
  const offsets = [];
  const escrever = (s) => {
    partes.push(s);
    pos += s.length;
  };
  escrever("%PDF-1.4\n");
  const total = paginas.length;
  const numObjs = 2 + total * 3;
  const objPag = (i) => 3 + i * 3;
  const objCont = (i) => 4 + i * 3;
  const objImg = (i) => 5 + i * 3;
  const addObj = (num, corpo) => {
    offsets[num] = pos;
    escrever(`${num} 0 obj\n${corpo}\nendobj\n`);
  };
  addObj(1, "<< /Type /Catalog /Pages 2 0 R >>");
  addObj(2, `<< /Type /Pages /Count ${total} /Kids [${paginas.map((_, i) => `${objPag(i)} 0 R`).join(" ")}] >>`);
  paginas.forEach((p, i) => {
    addObj(objPag(i), `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Contents ${objCont(i)} 0 R /Resources << /XObject << /Im${i} ${objImg(i)} 0 R >> >> >>`);
    const cs = `q ${W} 0 0 ${H} 0 0 cm /Im${i} Do Q`;
    addObj(objCont(i), `<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`);
    offsets[objImg(i)] = pos;
    escrever(`${objImg(i)} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${p.w} /Height ${p.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.dados.length} >>\nstream\n`);
    escrever(p.dados);
    escrever("\nendstream\nendobj\n");
  });
  const inicioXref = pos;
  escrever(`xref\n0 ${numObjs + 1}\n0000000000 65535 f \n`);
  for (let n = 1; n <= numObjs; n++) escrever(`${String(offsets[n]).padStart(10, "0")} 00000 n \n`);
  escrever(`trailer\n<< /Size ${numObjs + 1} /Root 1 0 R >>\nstartxref\n${inicioXref}\n%%EOF`);
  const bin = partes.join("");
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i) & 0xff;
  return bytes;
}

async function gerarPdfDoNo(nodeOculto) {
  const LARG = 794; // A4 a 96dpi
  const ALT_PAG = 1123;
  const ESCALA = 2;

  // 1. Clona e monta fora da tela, renderizado, para capturar estilos reais
  const clone = nodeOculto.cloneNode(true);
  clone.classList.remove("hidden");
  clone.style.display = "block";
  const quadro = document.createElement("div");
  quadro.style.cssText = `position:fixed;left:-13000px;top:0;width:${LARG}px;background:#ffffff;`;
  quadro.appendChild(clone);
  document.body.appendChild(quadro);
  await new Promise((r) => setTimeout(r, 60));

  try {
    // 2. Congela os estilos computados em cada elemento (vira autossuficiente)
    clone.style.width = LARG + "px";
    clone.style.boxSizing = "border-box";
    inlinarEstilos(clone);
    const altura = Math.max(clone.scrollHeight, 200);

    // 3. Serializa num SVG foreignObject e rasteriza
    const xml = new XMLSerializer().serializeToString(clone);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${LARG}" height="${altura}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">${xml}</div></foreignObject></svg>`;
    const img = new Image();
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
    await img.decode();

    const cheio = document.createElement("canvas");
    cheio.width = LARG * ESCALA;
    cheio.height = altura * ESCALA;
    const ctx = cheio.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cheio.width, cheio.height);
    ctx.drawImage(img, 0, 0, cheio.width, cheio.height);

    // 4. Fatia em páginas A4 e monta os JPEGs
    const numPaginas = Math.max(1, Math.ceil(altura / ALT_PAG));
    const paginas = [];
    for (let i = 0; i < numPaginas; i++) {
      const pag = document.createElement("canvas");
      pag.width = LARG * ESCALA;
      pag.height = ALT_PAG * ESCALA;
      const pctx = pag.getContext("2d");
      pctx.fillStyle = "#ffffff";
      pctx.fillRect(0, 0, pag.width, pag.height);
      const origemY = i * ALT_PAG * ESCALA;
      const alturaFatia = Math.min(ALT_PAG * ESCALA, cheio.height - origemY);
      if (alturaFatia > 0) pctx.drawImage(cheio, 0, origemY, pag.width, alturaFatia, 0, 0, pag.width, alturaFatia);
      const b64 = pag.toDataURL("image/jpeg", 0.93).split(",")[1];
      paginas.push({ dados: atob(b64), w: pag.width, h: pag.height });
    }

    // 5. Escreve o PDF byte a byte
    return construirPdf(paginas);
  } finally {
    quadro.remove();
  }
}

// ─── Componentes base ───────────────────────────────────────────

function Cabecalho({ onHome }) {
  return (
    <header
      className="px-8 py-6 flex items-baseline justify-between print:hidden"
      style={{
        background: "linear-gradient(180deg, rgba(60, 24, 30, 0.98) 0%, rgba(75, 36, 40, 0.96) 100%)",
        borderBottom: "5px solid #B8860B",
        boxShadow: "0 12px 32px rgba(0,0,0,0.3)",
      }}
    >
      <button onClick={onHome} className="text-left" style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
        <div
          className="font-serif"
          style={{
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: 6,
            background: "linear-gradient(135deg, #D4AF37 0%, #E8C547 40%, #B8860B 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          A TOCA
        </div>
        <div className="fonte-corpo" style={{ fontSize: 11, letterSpacing: 3, color: "#A0826D", textTransform: "uppercase" }}>
          Central de Governança · Nayara Silva
        </div>
      </button>
      <div className="fonte-corpo italic text-sm hidden sm:block" style={{ color: "#A0826D" }}>
        onde tudo funciona sozinho
      </div>
    </header>
  );
}

function CampoTexto({ rotulo, valor, onChange, area, linhas, placeholder }) {
  const base = "w-full px-3 py-2 rounded border bg-white text-sm outline-none focus:ring-2";
  const estilo = { borderColor: "#D9914F", color: CORES.fogoEscuro };
  return (
    <label className="block mb-4">
      <span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>
        {rotulo}
      </span>
      {area ? (
        <textarea rows={linhas || 3} className={base} style={estilo} value={valor} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={base} style={estilo} value={valor} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

function BotaoPrimario({ children, onClick, disabled, style }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded text-white disabled:opacity-60 transition-colors hover:opacity-90"
      style={{
        fontFamily: "'Lora', serif",
        fontSize: "13px",
        fontWeight: "600",
        letterSpacing: "1px",
        padding: "12px 16px",
        background: CORES.fogo,
        color: "white",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        ...style
      }}
    >
      {children}
    </button>
  );
}

function BotaoContorno({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded transition-colors hover:opacity-80"
      style={{
        fontFamily: "'Lora', serif",
        fontSize: "13px",
        fontWeight: "600",
        letterSpacing: "1px",
        padding: "12px 16px",
        border: `1px solid ${CORES.laranja}`,
        background: "transparent",
        color: CORES.fogo,
        cursor: "pointer"
      }}
    >
      {children}
    </button>
  );
}

function InputField({ label, placeholder, value, onChange, type = "text", required = false }) {
  return (
    <div style={{ marginBottom: "18px" }}>
      {label && (
        <label
          style={{
            display: "block",
            fontFamily: "'Lora', serif",
            fontSize: "11px",
            letterSpacing: "1px",
            color: CORES.dourado,
            textTransform: "uppercase",
            marginBottom: "6px",
            fontWeight: "600"
          }}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        style={{
          width: "100%",
          padding: "10px 12px",
          border: `1px solid ${CORES.laranja}`,
          borderRadius: "4px",
          fontFamily: "'Lora', serif",
          fontSize: "13px",
          background: CORES.cremePalido,
          color: CORES.fogo,
          outline: "none",
          transition: "border-color 0.2s",
          boxSizing: "border-box"
        }}
        onFocus={(e) => {
          e.target.style.borderColor = CORES.dourado;
          e.target.style.boxShadow = `0 0 0 2px rgba(212, 175, 55, 0.1)`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = CORES.laranja;
          e.target.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

function CardComponent({ children, style, onClick, className = "" }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg transition-all hover:shadow-lg ${className}`}
      style={{
        background: CORES.cremePalido,
        border: `1px solid rgba(60, 24, 30, 0.08)`,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
        ...style
      }}
    >
      {children}
    </div>
  );
}

function Label({ children, color = CORES.dourado, uppercase = true }) {
  return (
    <label
      style={{
        fontFamily: "'Lora', serif",
        fontSize: "11px",
        fontWeight: "600",
        letterSpacing: `${uppercase ? "1px" : "0"}`,
        color: color,
        textTransform: uppercase ? "uppercase" : "none",
        display: "block"
      }}
    >
      {children}
    </label>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div
      style={{
        background: "linear-gradient(180deg, rgba(217, 145, 79, 0.08) 0%, rgba(245, 237, 217, 0.4) 100%)",
        padding: "28px 32px",
        borderBottom: `1px solid rgba(60, 24, 30, 0.08)`,
        marginBottom: "28px"
      }}
    >
      <div
        style={{
          fontFamily: "'Lora', serif",
          fontSize: "18px",
          fontWeight: "600",
          color: CORES.fogo,
          marginBottom: "4px"
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: "12px", color: CORES.madeira }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

const FRASES_TOCA = [
  "A louça se lava sozinha...",
  "As agulhas de tricô trabalham sozinhas...",
  "A pena escreve sem ninguém segurar...",
  "A colher mexe o caldeirão sozinha...",
  "O relógio ajusta os ponteiros...",
  "Um aceno de varinha e o cômodo se arruma...",
];

function ConfirmarAcao({ rotulo, aviso, onConfirmar, classe }) {
  const [pendente, setPendente] = useState(false);
  useEffect(() => {
    if (!pendente) return;
    const t = setTimeout(() => setPendente(false), 5000);
    return () => clearTimeout(t);
  }, [pendente]);
  return (
    <button
      onClick={() => {
        if (pendente) {
          setPendente(false);
          onConfirmar();
        } else {
          setPendente(true);
        }
      }}
      className={classe || "text-xs underline"}
      style={{ color: "#8A3A2E", fontWeight: pendente ? 700 : 400 }}
    >
      {pendente ? `Clique de novo para confirmar — ${aviso}` : rotulo}
    </button>
  );
}

function Trabalhando() {
  const [frase] = useState(() => FRASES_TOCA[Math.floor(Math.random() * FRASES_TOCA.length)]);
  return (
    <div className="py-10 text-center font-serif italic" style={{ color: CORES.dourado }}>
      A Toca está trabalhando — {frase}
    </div>
  );
}

function AvisoErro({ erro }) {
  if (!erro) return null;
  const eLimite = /rate limit/i.test(erro);
  return (
    <div className="mb-4 p-3 rounded text-sm" style={{ background: "#F0DCD2", color: "#8A3A2E" }}>
      {eLimite
        ? "A rede de Flu está congestionada — limite de gerações atingido por agora. Recarregue a página e tente de novo em alguns minutos; o que você digitou está salvo."
        : `Errol bateu na janela e a mensagem não chegou. Verifique a conexão e tente de novo. (${erro})`}
    </div>
  );
}

// ─── O Relógio (dashboard de clientes) ──────────────────────────

const FASES_RELOGIO = [
  { chave: "prospeccao", rotulo: "Prospecção" },
  { chave: "escuta", rotulo: "Escuta" },
  { chave: "raiox", rotulo: "Raio-X" },
  { chave: "acordo", rotulo: "Acordo" },
  { chave: "construcao", rotulo: "Construção" },
  { chave: "sustentacao", rotulo: "Sustentação" },
  { chave: "prova", rotulo: "Prova" },
  { chave: "encerrado", rotulo: "Encerrado" },
  { chave: "perigo", rotulo: "Perigo Mortal" },
];

const CORES_PONTEIROS = ["#5C1A2B", "#B8860B", "#4A5A7A", "#4F6B3A", "#8A3A2E", "#B0652F", "#6B4A7A", "#3F6B6B", "#7A3A5A"];

// ─── Clientes ───────────────────────────────────────────────────

function FormCliente({ inicial, onSalvar, onCancelar, onExcluir }) {
  const [c, setC] = useState(
    inicial
      ? { tipo: "empresa", servicos: { consultoria: true, mentoria: false, treinamentos: false }, ...inicial }
      : { tipo: "empresa", negocio: "", segmento: "", setores: "", regras: "", contexto: "", servicos: { consultoria: true, mentoria: false, treinamentos: false } }
  );
  const set = (campo) => (v) => setC({ ...c, [campo]: v });
  const servicos = c.servicos || { consultoria: true, mentoria: false, treinamentos: false };
  const alternarServico = (chave) => setC({ ...c, servicos: { ...servicos, [chave]: !servicos[chave] } });
  const valido = c.negocio.trim() && c.segmento.trim();
  const ehPessoa = c.tipo === "pessoa";

  const definirTipo = (tipo) => {
    if (tipo === c.tipo) return;
    setC({ ...c, tipo });
  };

  return (
    <div style={{ maxWidth: "440px", margin: "32px auto", background: "#FFFBF0", borderRadius: "4px", boxShadow: "0 2px 8px rgba(92, 26, 43, 0.1)" }}>
      <div style={{ padding: "32px", borderBottom: "1px solid rgba(60, 24, 30, 0.08)", background: "linear-gradient(180deg, rgba(217, 145, 79, 0.08) 0%, rgba(245, 237, 217, 0.4) 100%)" }}>
        <div style={{ fontSize: "18px", fontWeight: "600", color: "#5C1A2B", marginBottom: "4px" }}>
          {inicial ? "Editar cliente" : "Novo cliente"}
        </div>
        <div style={{ fontSize: "12px", color: "#8B6F47" }}>
          Preencha os dados básicos
        </div>
      </div>

      <div style={{ padding: "28px" }}>
        <Label>Tipo de cliente</Label>
        <div style={{ display: "flex", gap: "8px", marginBottom: "18px" }}>
          {[["empresa", "Empresa"], ["pessoa", "Pessoa (mentorado)"]].map(([chave, rotulo]) => (
            <button
              key={chave}
              onClick={() => definirTipo(chave)}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: "4px",
                border: "1px solid",
                fontFamily: "'Lora', serif",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                borderColor: c.tipo === chave ? "#D4AF37" : "#D9914F",
                background: c.tipo === chave ? "#F5EDD9" : "#FFFBF0",
                color: c.tipo === chave ? "#5C1A2B" : "#8B6F47"
              }}
            >
              {c.tipo === chave ? "✓ " : ""}{rotulo}
            </button>
          ))}
        </div>

        <InputField label={ehPessoa ? "Nome da pessoa" : "Nome do negócio"} value={c.negocio} onChange={set("negocio")} placeholder={ehPessoa ? "Ex.: Carlos Andrade" : "Ex.: Caverna do Cheff"} />
        <InputField label={ehPessoa ? "Atuação (cargo e empresa/negócio)" : "Segmento"} value={c.segmento} onChange={set("segmento")} placeholder={ehPessoa ? "Ex.: Gerente geral — restaurante de médio porte" : "Ex.: Restaurante — hamburgueria artesanal"} />
        {!ehPessoa && <InputField label="Setores / áreas" value={c.setores} onChange={set("setores")} placeholder="Ex.: Salão, Cozinha, Delivery, Estoque" />}
        {!ehPessoa && (
          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", fontFamily: "'Lora', serif", fontSize: "11px", letterSpacing: "1px", color: "#D4AF37", textTransform: "uppercase", marginBottom: "6px", fontWeight: "600" }}>Regras próprias da casa</label>
            <textarea placeholder="Ex.: celular proibido na operação; uniforme completo obrigatório" value={c.regras} onChange={(e) => set("regras")(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1px solid #D9914F", borderRadius: "4px", fontFamily: "'Lora', serif", fontSize: "13px", background: "#FFFBF0", color: "#3C181E", outline: "none", minHeight: "120px", boxSizing: "border-box", transition: "border-color 0.2s" }} onFocus={(e) => { e.target.style.borderColor = "#D4AF37"; e.target.style.boxShadow = "0 0 0 2px rgba(212, 175, 55, 0.1)"; }} onBlur={(e) => { e.target.style.borderColor = "#D9914F"; e.target.style.boxShadow = "none"; }} />
          </div>
        )}
        <div style={{ marginBottom: "18px" }}>
          <label style={{ display: "block", fontFamily: "'Lora', serif", fontSize: "11px", letterSpacing: "1px", color: "#D4AF37", textTransform: "uppercase", marginBottom: "6px", fontWeight: "600" }}>{ehPessoa ? "Contexto e objetivos (por que buscou a mentoria)" : "Contexto e dores relatadas"}</label>
          <textarea placeholder={ehPessoa ? "Ex.: liderança recém-promovida; time resiste; quer parar de apagar incêndio" : "Ex.: atrasos recorrentes, desperdício de insumos"} value={c.contexto} onChange={(e) => set("contexto")(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1px solid #D9914F", borderRadius: "4px", fontFamily: "'Lora', serif", fontSize: "13px", background: "#FFFBF0", color: "#3C181E", outline: "none", minHeight: "120px", boxSizing: "border-box", transition: "border-color 0.2s" }} onFocus={(e) => { e.target.style.borderColor = "#D4AF37"; e.target.style.boxShadow = "0 0 0 2px rgba(212, 175, 55, 0.1)"; }} onBlur={(e) => { e.target.style.borderColor = "#D9914F"; e.target.style.boxShadow = "none"; }} />
        </div>

        <Label>Trilhas contratadas</Label>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
          {[["consultoria", "Consultoria"], ["mentoria", "Mentoria"], ["treinamentos", "Treinamentos"]].map(([chave, rotulo]) => (
            <button
              key={chave}
              onClick={() => alternarServico(chave)}
              style={{
                padding: "10px 12px",
                borderRadius: "4px",
                border: "1px solid",
                fontFamily: "'Lora', serif",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                borderColor: servicos[chave] ? "#D4AF37" : "#D9914F",
                background: servicos[chave] ? "#F5EDD9" : "#FFFBF0",
                color: servicos[chave] ? "#5C1A2B" : "#8B6F47"
              }}
            >
              {servicos[chave] ? "✓ " : ""}{rotulo}
            </button>
          ))}
        </div>
        <p style={{ fontSize: "11px", marginBottom: "24px", color: "#8A7A5C", fontFamily: "'Lora', serif" }}>
          As trilhas definem quais alas aparecem na toca deste cliente. Treinamentos podem viver dentro da consultoria ou avulsos.
        </p>

        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
          <BotaoPrimario onClick={() => valido && onSalvar(c)} disabled={!valido}>Salvar cliente</BotaoPrimario>
          <button onClick={onCancelar} style={{ flex: 1, padding: "12px 16px", background: "transparent", color: "#5C1A2B", border: "1px solid #5C1A2B", borderRadius: "4px", fontFamily: "'Lora', serif", fontSize: "13px", fontWeight: "600", cursor: "pointer", letterSpacing: "1px" }}>
            Cancelar
          </button>
        </div>

        {inicial && onExcluir && (
          <div style={{ paddingTop: "24px", borderTop: "1px solid #D9914F" }}>
            <ConfirmarAcao
              label="Excluir este cliente e todos os seus dados"
              aviso="apaga documentos, planos, atas e histórico deste cliente para sempre"
              onConfirmar={onExcluir}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function BadgesFrentes({ gestao }) {
  const frentes = (gestao && gestao.frentes) || [];
  if (frentes.length === 0) return null;
  return (
    <div className="flex gap-1.5 flex-wrap mt-2">
      {frentes.map((f) => {
        const st = STATUS_FRENTE[f.status];
        return (
          <span
            key={f.id}
            className="px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: st.fundo, color: st.cor }}
            title={st.rotulo}
          >
            {f.nome}
          </span>
        );
      })}
    </div>
  );
}

// ─── Header Padrão para Módulos ────────────────────────────────
function HeaderModulo({ titulo, cliente, onVoltar, acoes }) {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", paddingTop: "32px", paddingLeft: "32px", paddingRight: "32px" }}>
      <button onClick={onVoltar} style={{ fontSize: "11px", marginBottom: "24px", textTransform: "uppercase", fontWeight: "600", background: "none", border: "none", cursor: "pointer", color: "#5C1A2B", fontFamily: "'Lora', serif", letterSpacing: "1px" }}>
        ← {cliente.negocio}
      </button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", gap: "16px", flexWrap: "wrap" }}>
        <h1 style={{ fontFamily: "'Crimson Text', serif", fontSize: "32px", fontWeight: "800", color: "#5C1A2B", margin: "0", letterSpacing: "2px" }}>{titulo}</h1>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {acoes}
        </div>
      </div>
    </div>
  );
}

function MagicClock() {
  const radiusMain = 62;
  const radiusRing1 = 58;
  const radiusRing2 = 54;
  const cx = 70;
  const cy = 70;

  const progressPessoas = 75;
  const progressAcao = 33;
  const progressGeral = 12;
  const progressDocs = 55;

  const rotateP = (progressPessoas / 100) * 270;
  const rotateA = (progressAcao / 100) * 120;
  const rotateG = (progressGeral / 100) * 45;
  const rotateD = (progressDocs / 100) * 200;

  return (
    <svg
      viewBox="0 0 140 140"
      width="140"
      height="140"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(0 8px 16px rgba(92, 26, 43, 0.2))" }}
    >
      <defs>
        <radialGradient id="innerGradient" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#FFFBF0" stopOpacity="1" />
          <stop offset="100%" stopColor="#F5EDD9" stopOpacity="0.6" />
        </radialGradient>
      </defs>

      <circle cx={cx} cy={cy} r={radiusMain} fill="#FFFBF0" stroke="#8B6F47" strokeWidth="3.5" />
      <circle cx={cx} cy={cy} r={radiusRing1} fill="none" stroke="#D4AF37" strokeWidth="1.5" opacity="0.8" />
      <circle cx={cx} cy={cy} r={radiusRing2} fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.5" />
      <circle cx={cx} cy={cy} r={radiusMain} fill="url(#innerGradient)" />

      <line x1={cx} y1={cy - radiusMain - 5} x2={cx} y2={cy - radiusMain + 8} stroke="#8B6F47" strokeWidth="2.5" strokeLinecap="round" />
      <line x1={cx + radiusMain + 5} y1={cy} x2={cx + radiusMain - 8} y2={cy} stroke="#8B6F47" strokeWidth="2.5" strokeLinecap="round" />
      <line x1={cx} y1={cy + radiusMain + 5} x2={cx} y2={cy + radiusMain - 8} stroke="#8B6F47" strokeWidth="2.5" strokeLinecap="round" />
      <line x1={cx - radiusMain - 5} y1={cy} x2={cx - radiusMain + 8} y2={cy} stroke="#8B6F47" strokeWidth="2.5" strokeLinecap="round" />

      <line x1={cx - 15} y1={cy - 15} x2={cx - 8} y2={cy - 8} stroke="#D9914F" strokeWidth="1" strokeDasharray="2,2" opacity="0.4" />
      <line x1={cx + 15} y1={cy - 15} x2={cx + 8} y2={cy - 8} stroke="#D9914F" strokeWidth="1" strokeDasharray="2,2" opacity="0.4" />
      <line x1={cx + 15} y1={cy + 15} x2={cx + 8} y2={cy + 8} stroke="#D9914F" strokeWidth="1" strokeDasharray="2,2" opacity="0.4" />
      <line x1={cx - 15} y1={cy + 15} x2={cx - 8} y2={cy + 8} stroke="#D9914F" strokeWidth="1" strokeDasharray="2,2" opacity="0.4" />

      <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: "rotatePointer1 3s ease-in-out infinite" }}>
        <line x1={cx} y1={cy} x2={cx} y2={28} stroke="#5C1A2B" strokeWidth="4" strokeLinecap="round" />
        <circle cx={cx} cy={28} r="2.5" fill="#5C1A2B" />
      </g>

      <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: "rotatePointer2 4s ease-in-out infinite" }}>
        <line x1={cx} y1={cy} x2={122} y2={cy} stroke="#D9914F" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx={122} cy={cy} r="2" fill="#D9914F" />
      </g>

      <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: "rotatePointer3 5s ease-in-out infinite" }}>
        <line x1={cx} y1={cy} x2={cx} y2={105} stroke="#4F6B3A" strokeWidth="3" strokeLinecap="round" />
        <circle cx={cx} cy={105} r="1.5" fill="#4F6B3A" />
      </g>

      <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: "rotatePointer4 6s ease-in-out infinite" }}>
        <line x1={cx} y1={cy} x2={18} y2={cy} stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={18} cy={cy} r="1.5" fill="#D4AF37" />
      </g>

      <text x={cx} y={18} textAnchor="middle" fontSize="14" fontWeight="800" fill="#5C1A2B" fontFamily="'Crimson Text', serif">P</text>
      <text x={122} y={80} textAnchor="middle" fontSize="14" fontWeight="800" fill="#5C1A2B" fontFamily="'Crimson Text', serif">A</text>
      <text x={cx} y={132} textAnchor="middle" fontSize="14" fontWeight="800" fill="#5C1A2B" fontFamily="'Crimson Text', serif">G</text>
      <text x={18} y={80} textAnchor="middle" fontSize="14" fontWeight="800" fill="#5C1A2B" fontFamily="'Crimson Text', serif">D</text>

      <text x={cx} y={42} textAnchor="middle" fontSize="8" fontWeight="600" fill="#D9914F" opacity="0.7" fontFamily="'Lora', serif">{progressPessoas}%</text>
      <text x={105} y={77} textAnchor="middle" fontSize="8" fontWeight="600" fill="#D9914F" opacity="0.7" fontFamily="'Lora', serif">{progressAcao}%</text>
      <text x={cx} y={102} textAnchor="middle" fontSize="8" fontWeight="600" fill="#D9914F" opacity="0.7" fontFamily="'Lora', serif">{progressGeral}%</text>
      <text x={35} y={77} textAnchor="middle" fontSize="8" fontWeight="600" fill="#D9914F" opacity="0.7" fontFamily="'Lora', serif">{progressDocs}%</text>

      <circle cx={cx} cy={cy} r="7" fill="#5C1A2B" />
      <circle cx={cx} cy={cy} r="5" fill="#D4AF37" />
      <circle cx={cx} cy={cy} r="2.5" fill="#FFFBF0" />

      <style>{`
        @keyframes rotatePointer1 { 0% { transform: rotate(0deg); } 100% { transform: rotate(270deg); } }
        @keyframes rotatePointer2 { 0% { transform: rotate(0deg); } 100% { transform: rotate(120deg); } }
        @keyframes rotatePointer3 { 0% { transform: rotate(0deg); } 100% { transform: rotate(45deg); } }
        @keyframes rotatePointer4 { 0% { transform: rotate(0deg); } 100% { transform: rotate(200deg); } }
      `}</style>
    </svg>
  );
}

function DashboardGamificado({ onNavigate, clientes = [] }) {
  const cliente = clientes[0] || { negocio: "Sem cliente", segmento: "" };

  return (
    <div style={{ background: "#FFFBF0", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700;800&family=Lora:wght@400;500;600;700&display=swap');
      `}</style>

      {/* HEADER VINHO ESCURO */}
      <div style={{ background: "#5C1A2B", padding: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "36px", fontWeight: "800", color: "#D4AF37", fontFamily: "'Crimson Text', serif", margin: "0 0 4px 0", letterSpacing: "2px" }}>A TOCA</h1>
          <p style={{ fontSize: "13px", color: "#D4AF37", fontFamily: "'Lora', serif", margin: "0", opacity: "0.9" }}>
            {cliente.negocio}{cliente.segmento ? ` · ${cliente.segmento}` : ""}
          </p>
        </div>

        {/* CARDS DE PONTOS E STREAK À DIREITA */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ background: "#D4AF37", padding: "16px 24px", borderRadius: "6px", textAlign: "center", minWidth: "140px" }}>
            <div style={{ fontSize: "32px", fontWeight: "800", color: "#5C1A2B", fontFamily: "'Crimson Text', serif" }}>285</div>
            <div style={{ fontSize: "10px", fontWeight: "600", color: "#5C1A2B", fontFamily: "'Lora', serif", letterSpacing: "1px" }}>PONTOS</div>
          </div>

          <div style={{ background: "#D4AF37", padding: "16px 24px", borderRadius: "6px", textAlign: "center", minWidth: "140px" }}>
            <div style={{ fontSize: "32px", fontWeight: "800", color: "#5C1A2B", fontFamily: "'Crimson Text', serif" }}>4 🔥</div>
            <div style={{ fontSize: "10px", fontWeight: "600", color: "#5C1A2B", fontFamily: "'Lora', serif", letterSpacing: "1px" }}>SEMANAS</div>
          </div>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>

        {/* 4 CARDS DE DIAS DA SEMANA */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "16px", marginBottom: "48px" }}>
          {["Seg", "Ter", "Qua", "Qui"].map((dia) => (
            <div key={dia} style={{
              border: "2px solid #4F6B3A",
              borderRadius: "8px",
              padding: "20px",
              textAlign: "center",
              background: "#FFFBF0",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#5C1A2B", fontFamily: "'Lora', serif", marginBottom: "12px" }}>{dia}</div>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>✓</div>
              <div style={{ fontSize: "11px", color: "#8B6F47", fontFamily: "'Lora', serif" }}>+8 pontos</div>
            </div>
          ))}
        </div>

        {/* SEÇÃO CONQUISTAS DESBLOQUEADAS */}
        <div style={{ marginBottom: "48px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: "700", color: "#5C1A2B", fontFamily: "'Lora', serif", uppercase: true, letterSpacing: "2px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
            🏆 CONQUISTAS DESBLOQUEADAS
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: "12px" }}>
            {["Primeiro Passo", "Consistência", "Mestre do Método"].map((badge, idx) => (
              <div key={idx} style={{
                background: "#E3EBD8",
                border: "2px solid #4F6B3A",
                borderRadius: "8px",
                padding: "16px",
                textAlign: "center",
                cursor: "pointer",
              }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>🎖️</div>
                <div style={{ fontSize: "10px", fontWeight: "600", color: "#5C1A2B", fontFamily: "'Lora', serif" }}>{badge}</div>
              </div>
            ))}
          </div>
        </div>

        {/* PRÓXIMA CONQUISTA */}
        <div style={{
          background: "linear-gradient(135deg, rgba(217, 145, 79, 0.1), rgba(212, 175, 55, 0.05))",
          border: "2px dashed #D9914F",
          borderRadius: "8px",
          padding: "32px",
          textAlign: "center",
          marginBottom: "48px"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#5C1A2B", fontFamily: "'Lora', serif", margin: "0 0 8px 0" }}>
            Mestre do Planejamento
          </h3>
          <p style={{ fontSize: "12px", color: "#8B6F47", fontFamily: "'Lora', serif", margin: "0 0 16px 0", lineHeight: "1.6" }}>
            Complete 10 tarefas estratégicas
          </p>
          <div style={{ fontSize: "12px", fontWeight: "600", color: "#4F6B3A", fontFamily: "'Lora', serif", marginBottom: "12px" }}>
            6 de 10 completas
          </div>
          <div style={{ width: "100%", height: "8px", background: "#E3EBD8", borderRadius: "4px", marginBottom: "24px", overflow: "hidden" }}>
            <div style={{ width: "60%", height: "100%", background: "#D9914F" }} />
          </div>
          <button style={{ background: "#5C1A2B", color: "#FFFBF0", border: "none", padding: "12px 24px", borderRadius: "4px", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "'Lora', serif" }}>
            CONTINUAR ASSIM
          </button>
        </div>

        {/* FOOTER COM DICA */}
        <div style={{ textAlign: "center", padding: "24px 0", borderTop: "2px solid #D4AF37" }}>
          <div style={{ fontSize: "20px", marginBottom: "8px" }}>💡</div>
          <p style={{ fontSize: "13px", color: "#8B6F47", fontFamily: "'Lora', serif", lineHeight: "1.6", margin: "0", maxWidth: "600px", marginLeft: "auto", marginRight: "auto" }}>
            Dica: Quanto mais consistente, mais pontos!<br />Continue sua sequência. Você está no caminho certo.
          </p>
        </div>
      </div>
    </div>
  );
}

function ListaClientes({ clientes, gestaoPorCliente, fases, backupPendente, onAplicarBackup, onCancelarBackup, onAbrir, onNovo, onExcluir, onExportarBackup, onImportarBackup, onVoltar }) {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", paddingTop: "32px", paddingLeft: "32px", paddingRight: "32px", paddingBottom: "32px" }}>
      {backupPendente && (
        <div style={{ marginBottom: "24px", padding: "16px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", background: "#F5EDD9", border: "2px solid #D4AF37" }}>
          <span style={{ fontSize: "13px", color: "#3C181E", fontFamily: "'Lora', serif" }}>
            Backup lido: {backupPendente.clientes.length} cliente(s). Aplicar substitui todos os dados atuais do app.
          </span>
          <BotaoPrimario onClick={onAplicarBackup}>Aplicar backup</BotaoPrimario>
          <button onClick={onCancelarBackup} style={{ fontSize: "11px", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", color: "#8A7A5C", fontFamily: "'Lora', serif" }}>Cancelar</button>
        </div>
      )}

      {/* Dashboard de Clientes */}
      <div style={{ marginTop: "0", paddingTop: "32px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
        <h1 style={{ fontFamily: "'Crimson Text', serif", fontSize: "28px", fontWeight: "800", letterSpacing: "2px", color: "#5C1A2B", margin: "0 0 24px 0" }}>Dashboard de Clientes</h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={onNovo}
            style={{
              background: "#5C1A2B",
              color: "#FFFBF0",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              fontFamily: "'Lora', serif",
            }}
          >
            ✨ Novo cliente
          </button>
          {onVoltar && (
            <button
              onClick={onVoltar}
              style={{
                background: "#5C1A2B",
                color: "#FFFBF0",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily: "'Lora', serif",
              }}
            >
              ← Voltar
            </button>
          )}
        </div>
      </div>

      <div style={{ marginBottom: "24px", padding: "20px 24px", background: "linear-gradient(180deg, rgba(217, 145, 79, 0.1) 0%, rgba(245, 237, 217, 0.3) 100%)", borderBottom: "1px solid rgba(60, 24, 30, 0.08)", borderRadius: "4px 4px 0 0" }}>
        <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#5C1A2B", fontFamily: "'Crimson Text', serif", margin: "0" }}>Engajamentos Ativos</h3>
      </div>

      {clientes.length === 0 ? (
        <div style={{ textAlign: "center", paddingTop: "32px", paddingBottom: "32px", borderRadius: "4px", background: "#FFFBF0", border: "2px dashed #D4AF37" }}>
          <p style={{ fontSize: "16px", fontFamily: "'Crimson Text', serif", marginBottom: "12px", color: "#5C1A2B" }}>📭 A Toca está vazia</p>
          <p style={{ fontSize: "13px", color: "#A0826D", fontFamily: "'Lora', serif" }}>nem um gnomo no jardim</p>
          <p style={{ fontSize: "11px", marginTop: "16px", color: "#8A7A5C", fontFamily: "'Lora', serif" }}>Cadastre o primeiro cliente para começar a gerar documentos.</p>
        </div>
      ) : (
        <>
          <style>{`
            .clientes-table {
              margin-top: 32px;
              width: 100%;
              border-collapse: collapse;
              background: #FFFBF0;
              border: 1px solid #D9914F;
              font-size: 13px;
            }
            .clientes-cards {
              margin-top: 32px;
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
              gap: 16px;
            }
            @media (max-width: 768px) {
              .clientes-table { display: none !important; }
              .clientes-cards { display: grid !important; }
            }
            @media (min-width: 769px) {
              .clientes-table { display: table !important; }
              .clientes-cards { display: none !important; }
            }
          `}</style>

          <table className="clientes-table">
          <thead>
            <tr style={{ borderBottom: "2px solid #D4AF37", background: "#F5EDD9" }}>
              <th style={{ textAlign: "left", padding: "12px", fontSize: "11px", fontWeight: "600", color: "#5C1A2B", fontFamily: "'Lora', serif", textTransform: "uppercase", letterSpacing: "1px", minWidth: "150px" }}>Cliente</th>
              <th style={{ textAlign: "left", padding: "12px", fontSize: "11px", fontWeight: "600", color: "#5C1A2B", fontFamily: "'Lora', serif", textTransform: "uppercase", letterSpacing: "1px", minWidth: "180px" }}>Segmento</th>
              <th style={{ textAlign: "center", padding: "12px", fontSize: "11px", fontWeight: "600", color: "#5C1A2B", fontFamily: "'Lora', serif", textTransform: "uppercase", letterSpacing: "1px" }}>Status</th>
              <th style={{ textAlign: "center", padding: "12px", fontSize: "11px", fontWeight: "600", color: "#5C1A2B", fontFamily: "'Lora', serif", textTransform: "uppercase", letterSpacing: "1px" }}>Progresso</th>
              <th style={{ textAlign: "center", padding: "12px", fontSize: "11px", fontWeight: "600", color: "#5C1A2B", fontFamily: "'Lora', serif", textTransform: "uppercase", letterSpacing: "1px" }}>Semana</th>
              <th style={{ textAlign: "center", padding: "12px", fontSize: "11px", fontWeight: "600", color: "#5C1A2B", fontFamily: "'Lora', serif", textTransform: "uppercase", letterSpacing: "1px" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c, idx) => {
              const gestao = gestaoPorCliente[c.id] || {};
              let statusBadge, statusColor, statusBg, statusIcon;

              if (c.tipo === "pessoa") {
                statusBadge = "Mentorado";
                statusIcon = "📌";
                statusColor = "#4F6B3A";
                statusBg = "#E8F0DD";
              } else if (gestao.frentes && gestao.frentes.length > 0) {
                statusBadge = "Em andamento";
                statusIcon = "⚡";
                statusColor = "#D84315";
                statusBg = "#F5E6D3";
              } else {
                statusBadge = "Novo";
                statusIcon = "✨";
                statusColor = "#8A7A5C";
                statusBg = "#F0DCD2";
              }

              return (
                <tr
                  key={c.id}
                  style={{
                    borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
                    background: idx % 2 === 0 ? "#FFFBF0" : "#FBF9F5",
                    cursor: "pointer",
                    transition: "background-color 0.2s ease"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#F5EDD9"}
                  onMouseLeave={(e) => e.currentTarget.style.background = (idx % 2 === 0 ? "#FFFBF0" : "#FBF9F5")}
                  onClick={() => onAbrir(c.id)}
                >
                  <td style={{ padding: "12px", fontSize: "13px", color: "#5C1A2B", fontFamily: "'Lora', serif", fontWeight: "600" }}>
                    {c.negocio}
                  </td>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#A0826D", fontFamily: "'Lora', serif" }}>
                    {c.segmento}
                  </td>
                  <td style={{ padding: "12px", fontSize: "12px", textAlign: "center" }}>
                    <span style={{ display: "inline-block", padding: "6px 12px", borderRadius: "12px", background: statusBg, color: statusColor, fontWeight: "600", fontFamily: "'Lora', serif", fontSize: "11px" }}>
                      {statusIcon} {statusBadge}
                    </span>
                  </td>
                  <td style={{ padding: "12px", fontSize: "13px", textAlign: "center", color: "#5C1A2B", fontFamily: "'Lora', serif" }}>
                    {gestao.frentes ? `${Math.min(100, (gestao.frentes.filter((f) => f.status === "concluida").length / gestao.frentes.length) * 100 || 0).toFixed(0)}%` : "0%"}
                  </td>
                  <td style={{ padding: "12px", fontSize: "12px", textAlign: "center", color: "#5C1A2B", fontFamily: "'Lora', serif", fontWeight: "600" }}>
                    S{Math.ceil(Math.random() * 12)}/12
                  </td>
                  <td style={{ padding: "12px", fontSize: "12px", textAlign: "center" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAbrir(c.id);
                      }}
                      style={{ color: "#5C1A2B", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontFamily: "'Lora', serif", marginRight: "12px", fontSize: "12px" }}
                    >
                      {statusBadge === "Novo" ? "Abrir" : statusBadge === "Em andamento" ? "Ver relatório" : "Aguardando"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ marginTop: "0", padding: "16px 24px", background: "#F5EDD9", borderTop: "1px solid rgba(60, 24, 30, 0.08)", fontSize: "11px", color: "#6B5D4F", fontFamily: "'Lora', serif" }}>
          {clientes.filter(c => gestaoPorCliente[c.id]?.frentes?.length).length} em andamento · {clientes.filter(c => c.tipo === "pessoa").length} mentorado(s) · Total: {clientes.length} engajamento{clientes.length !== 1 ? 's' : ''}
        </div>

          <div className="clientes-cards">
            {clientes.map((c, idx) => {
              const gestao = gestaoPorCliente[c.id] || {};
              let statusBadge, statusColor, statusBg, statusIcon;

              if (c.tipo === "pessoa") {
                statusBadge = "Mentorado";
                statusIcon = "📌";
                statusColor = "#4F6B3A";
                statusBg = "#E8F0DD";
              } else if (gestao.frentes && gestao.frentes.length > 0) {
                statusBadge = "Em andamento";
                statusIcon = "⚡";
                statusColor = "#D84315";
                statusBg = "#F5E6D3";
              } else {
                statusBadge = "Novo";
                statusIcon = "✨";
                statusColor = "#8A7A5C";
                statusBg = "#F0DCD2";
              }

              return (
                <div
                  key={c.id}
                  onClick={() => onAbrir(c.id)}
                  style={{
                    padding: "16px",
                    background: "#FFFBF0",
                    border: "1px solid #D9914F",
                    borderRadius: "4px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(92, 26, 43, 0.15)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <h3 style={{ fontFamily: "'Crimson Text', serif", fontSize: "20px", fontWeight: "800", color: "#5C1A2B", margin: "0" }}>
                      {c.negocio}
                    </h3>
                    <span style={{ display: "inline-block", padding: "4px 8px", borderRadius: "12px", background: statusBg, color: statusColor, fontWeight: "600", fontFamily: "'Lora', serif", fontSize: "10px" }}>
                      {statusIcon} {statusBadge}
                    </span>
                  </div>

                  <p style={{ fontSize: "12px", color: "#A0826D", fontFamily: "'Lora', serif", margin: "8px 0" }}>
                    {c.segmento}
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(212, 175, 55, 0.2)" }}>
                    <div>
                      <p style={{ fontSize: "10px", color: "#8A7A5C", fontFamily: "'Lora', serif", textTransform: "uppercase", margin: "0 0 4px 0" }}>Semana</p>
                      <p style={{ fontSize: "14px", fontWeight: "600", color: "#5C1A2B", fontFamily: "'Crimson Text', serif", margin: "0" }}>S{Math.ceil(Math.random() * 12)}/12</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "10px", color: "#8A7A5C", fontFamily: "'Lora', serif", textTransform: "uppercase", margin: "0 0 4px 0" }}>Progresso</p>
                      <p style={{ fontSize: "14px", fontWeight: "600", color: "#5C1A2B", fontFamily: "'Crimson Text', serif", margin: "0" }}>
                        {gestao.frentes ? `${Math.min(100, (gestao.frentes.filter((f) => f.status === "concluida").length / gestao.frentes.length) * 100 || 0).toFixed(0)}%` : "0%"}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAbrir(c.id);
                      }}
                      style={{ flex: 1, padding: "8px", background: "#5C1A2B", color: "#FFFBF0", border: "none", borderRadius: "4px", cursor: "pointer", fontFamily: "'Lora', serif", fontSize: "12px", fontWeight: "600" }}
                    >
                      Abrir
                    </button>
                    <ConfirmarAcao
                      label="🗑️"
                      aviso={`apaga ${c.negocio} e TODOS os seus dados`}
                      onConfirmar={() => onExcluir(c.id)}
                      classe="text-xs px-2 py-1 rounded font-semibold"
                      style={{ color: "#8A3A2E", background: "#F0DCD2", border: "1px solid #D9914F", borderRadius: "4px", padding: "8px", flex: 0.2, cursor: "pointer" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div style={{ marginTop: "48px", paddingTop: "24px", borderTop: "4px solid #D4AF37", display: "flex", alignItems: "center", gap: "24px", fontSize: "13px", color: "#5C1A2B", fontFamily: "'Lora', serif" }}>
        <span>O Vira-Tempo da Toca — seus dados vivem neste app:</span>
        <button onClick={onExportarBackup} style={{ textDecoration: "underline", background: "none", border: "none", cursor: "pointer", color: "#D4AF37", fontSize: "13px", fontFamily: "'Lora', serif" }}>
          Exportar backup (.json)
        </button>
        <label style={{ textDecoration: "underline", cursor: "pointer", color: "#D4AF37", fontSize: "13px", fontFamily: "'Lora', serif" }}>
          Importar backup
          <input
            type="file"
            accept="application/json"
            style={{ display: "none" }}
            onChange={(e) => {
              const arq = e.target.files && e.target.files[0];
              if (arq) onImportarBackup(arq);
              e.target.value = "";
            }}
          />
        </label>
      </div>
    </div>
  );
}

function HubCliente({ cliente, proximoPasso, metasAceitas, focoMentoria, totalCampo, totalDiagsLider, temRelMentoria, totalAnomalias, totalAnomaliasTratadas, totalTreinamentos, totalTreinamentosRealizados, totalEncontros, totalEncontrosRealizados, totalCargos, temTabela, gestao, totalPosicoes, totalAlcadas, totalRitos, totalIndicadores, totalSecoesManual, totalPontosCCT, totalPops, totalFluxos, totalPoliticas, totalChecklists, totalPessoas, totalDiagnosticos, totalPropostas, totalRelatorios, resumoFinanceiro, onModulo, onEditarCliente, onVoltar }) {
  const servicosCliente = cliente.servicos || { consultoria: true, mentoria: false, treinamentos: false };
  const ehPessoa = cliente.tipo === "pessoa";
  const frentes = (gestao && gestao.frentes) || [];
  const emAndamento = frentes.filter((f) => f.status === "em_andamento").length;
  const semCrono = gestao ? semanaAtualDe(gestao.inicio, Number(gestao.duracaoSemanas) || 0) : null;
  const atrasadasCrono = semCrono
    ? acoesNumeradas(frentes).filter((x) => x.acao.semana && !x.acao.feita && x.acao.semana < semCrono).length
    : 0;
  const estados = {
    gestao:
      frentes.length === 0
        ? "Registre o briefing e gere o plano"
        : `${frentes.length} frente${frentes.length > 1 ? "s" : ""} · ${emAndamento} em andamento`,
    cronograma:
      semCrono === null
        ? "Defina início e distribua as ações"
        : semCrono === 0
          ? "Engajamento ainda não iniciado"
          : `Semana ${semCrono}${gestao.duracaoSemanas ? ` de ${gestao.duracaoSemanas}` : ""}${atrasadasCrono ? ` · ${atrasadasCrono} atrasada${atrasadasCrono > 1 ? "s" : ""}` : ""}`,
    diagnosticos: totalDiagnosticos > 0 ? `${totalDiagnosticos} diagnóstico${totalDiagnosticos > 1 ? "s" : ""}` : "Ainda não avaliado",
    propostas: totalPropostas > 0 ? `${totalPropostas} proposta${totalPropostas > 1 ? "s" : ""}` : "Nenhuma proposta ainda",
    temperamentos: totalPessoas > 0 ? `${totalPessoas} pessoa${totalPessoas > 1 ? "s" : ""} mapeada${totalPessoas > 1 ? "s" : ""}` : ehPessoa ? "Mapeie o mentorado e quem ele lidera" : "Ninguém mapeado ainda",
    cct: totalPontosCCT > 0 ? `${totalPontosCCT} ponto${totalPontosCCT > 1 ? "s" : ""} obrigatório${totalPontosCCT > 1 ? "s" : ""}` : "CCT ainda não analisada",
    campo: totalCampo > 0 ? `${totalCampo} registro${totalCampo > 1 ? "s" : ""} no caderno` : "O caderno está em branco",
    diagslider: totalDiagsLider > 0 ? `${totalDiagsLider} avaliaç${totalDiagsLider > 1 ? "ões" : "ão"}` : focoMentoria === "autoconhecimento" ? "Os N.I.E.M.s aguardam a pessoa" : "Os N.I.E.M.s aguardam o líder",
    relmentoria: temRelMentoria ? "Malfeito feito — pronto" : "A prova da jornada",
    anomalias: totalAnomalias > 0 ? `${totalAnomaliasTratadas}/${totalAnomalias} tratadas` : "O bisbilhoscópio está em silêncio",
    painel: "Controle e verificação do método",
    estrutura: totalPosicoes > 0 ? `Organograma com ${totalPosicoes} posiç${totalPosicoes > 1 ? "ões" : "ão"}` : "Ainda não montada",
    alcadas: totalAlcadas > 0 ? `${totalAlcadas} decisõ${totalAlcadas > 1 ? "es" : ""} com alçada definida` : "Ainda não definidas",
    ritos: totalRitos > 0 ? `${totalRitos} rito${totalRitos > 1 ? "s" : ""} na cadência` : "Cadência não definida",
    indicadores: totalIndicadores > 0 ? `${totalIndicadores} indicador${totalIndicadores > 1 ? "es" : ""} no painel` : "Painel não definido",
    tabela: temTabela ? "Gerada — pronta para exportação" : "Ainda não gerada",
    cargos: totalCargos > 0 ? `${totalCargos} cargo${totalCargos > 1 ? "s" : ""}` : "Nenhum cargo ainda",
    manual: totalSecoesManual > 0 ? `${totalSecoesManual} seç${totalSecoesManual > 1 ? "ões" : "ão"}` : "Ainda não escrito",
    pops: totalPops > 0 ? `${totalPops} processo${totalPops > 1 ? "s" : ""}` : "Nenhum processo ainda",
    fluxos: totalFluxos > 0 ? `${totalFluxos} fluxo${totalFluxos > 1 ? "s" : ""} desenhado${totalFluxos > 1 ? "s" : ""}` : "Nenhum fluxo ainda",
    "docs-politicas": totalPoliticas > 0 ? `${totalPoliticas} política${totalPoliticas > 1 ? "s" : ""}` : "Nenhuma ainda",
    "docs-checklists": totalChecklists > 0 ? `${totalChecklists} checklist${totalChecklists > 1 ? "s" : ""}` : "Nenhum ainda",
    relatorios: totalRelatorios > 0 ? `${totalRelatorios} relatório${totalRelatorios > 1 ? "s" : ""}` : "Malfeito feito — o fechamento do ciclo",
    financeiro: resumoFinanceiro || "O cofre de Gringotes",
  };

  const TITULOS = {
    gestao: "Briefing & Plano de Ação",
    cronograma: "Cronograma",
    diagnosticos: "Diagnóstico de Maturidade",
    diagslider: focoMentoria === "autoconhecimento" ? "Diagnóstico Pessoal" : "Diagnóstico de Liderança",
    relmentoria: "Relatório de Evolução",
    anomalias: "Tratamento de Anomalias",
    painel: "Painel do Engajamento",
    propostas: "Propostas Comerciais",
    temperamentos: "Temperamentos",
    cct: "CCT & Conformidade",
    campo: "Trabalho de Campo",
    estrutura: "Estrutura de Governança",
    alcadas: "Alçadas de Decisão",
    ritos: "Ritos de Gestão",
    indicadores: "Indicadores",
    tabela: "Tabela Disciplinar",
    cargos: "Descrições de Cargo",
    manual: "Manual do Colaborador",
    pops: "POPs — Processos",
    fluxos: "Desenho de Processos",
    "docs-politicas": "Políticas Internas",
    "docs-checklists": "Checklists",
    relatorios: "Relatório de Encerramento",
    financeiro: "Financeiro",
  };

  const alaContratante = ehPessoa
    ? ["temperamentos", "diagslider", "propostas", "financeiro", "relmentoria"]
    : ["gestao", "temperamentos", "propostas", "cronograma", "financeiro"];
  const alaNegocio = [
    { frente: "Transversal", chaves: ["diagnosticos", "cct", "campo"] },
    { frente: "Pessoas", chaves: ["cargos"] },
    { frente: "Governança", chaves: ["estrutura", "alcadas", "ritos", "indicadores", "anomalias", "painel"] },
    { frente: "Processos", chaves: ["fluxos", "pops", "docs-checklists"] },
    { frente: "Disciplina & Cultura", chaves: ["tabela", "manual", "docs-politicas"] },
    { frente: "Encerramento", chaves: ["relatorios"] },
  ];

  const Cartao = ({ chave, compacto }) => (
    <button
      onClick={() => onModulo(chave)}
      style={{
        textAlign: "left",
        padding: compacto ? "16px" : "20px",
        borderRadius: "4px",
        border: "1px solid #D9914F",
        background: "#FFFBF0",
        boxShadow: "0 2px 8px rgba(92, 26, 43, 0.1)",
        cursor: "pointer",
        transition: "all 0.3s ease"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 16px rgba(92, 26, 43, 0.2)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(92, 26, 43, 0.1)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ fontFamily: "'Crimson Text', serif", marginBottom: "4px", fontSize: compacto ? "16px" : "18px", fontWeight: "600", color: "#5C1A2B" }}>
        {TITULOS[chave]}
      </div>
      <div style={{ fontSize: "11px", color: "#8A7A5C", fontFamily: "'Lora', serif" }}>{estados[chave]}</div>
    </button>
  );
  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", paddingTop: "16px", paddingLeft: "32px", paddingRight: "32px", paddingBottom: "128px" }}>
      <button onClick={onVoltar} style={{ fontSize: "11px", marginBottom: "32px", textTransform: "uppercase", fontWeight: "600", background: "none", border: "none", cursor: "pointer", color: "#5C1A2B", fontFamily: "'Lora', serif", letterSpacing: "1px" }}>
        ← Todos os clientes
      </button>

      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "12px" }}>
        <h1 style={{ fontFamily: "'Crimson Text', serif", fontSize: "40px", fontWeight: "800", color: "#5C1A2B", letterSpacing: "3px" }}>{cliente.negocio}</h1>
        <button onClick={onEditarCliente} style={{ fontSize: "11px", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", color: "#D4AF37", fontFamily: "'Lora', serif" }}>
          Editar dados
        </button>
      </div>
      <div style={{ fontSize: "13px", marginBottom: "32px", color: "#A0826D", fontFamily: "'Lora', serif" }}>{cliente.segmento}</div>

      {(metasAceitas || []).filter((m) => m.objetivo).length > 0 && (
        <div style={{ marginBottom: "12px", padding: "16px", borderRadius: "4px", background: "#F5EDD9", border: "1px solid #D4AF37" }}>
          <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: "600", marginBottom: "8px", color: "#9A6A2F", fontFamily: "'Lora', serif", letterSpacing: "1px" }}>Metas pactuadas</div>
          {(metasAceitas || []).filter((m) => m.objetivo).map((m) => (
            <div key={m.id} style={{ fontSize: "13px", paddingTop: "3px", paddingBottom: "3px", color: "#3C181E", fontFamily: "'Lora', serif" }}>
              • {m.objetivo}{m.prazo ? <span style={{ fontSize: "11px", color: "#8A7A5C" }}> — até {m.prazo}</span> : null}
            </div>
          ))}
        </div>
      )}

      {(servicosCliente.treinamentos || servicosCliente.mentoria) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "12px", marginBottom: "32px" }}>
          {servicosCliente.treinamentos && (
            <button onClick={() => onModulo("treinamentos")} style={{ textAlign: "left", padding: "16px", borderRadius: "4px", border: "1px solid #D9914F", background: "#FFFBF0", boxShadow: "0 2px 8px rgba(92, 26, 43, 0.1)", cursor: "pointer", transition: "all 0.3s ease" }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 16px rgba(92, 26, 43, 0.2)"; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(92, 26, 43, 0.1)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ fontFamily: "'Crimson Text', serif", color: "#5C1A2B", fontSize: "18px", fontWeight: "600" }}>Treinamentos</div>
              <div style={{ fontSize: "11px", marginTop: "3px", color: "#8A7A5C", fontFamily: "'Lora', serif" }}>
                {totalTreinamentos > 0 ? `${totalTreinamentosRealizados}/${totalTreinamentos} realizados` : "A Sala Precisa aguarda a primeira turma"}
              </div>
            </button>
          )}
          {servicosCliente.mentoria && (
            <button onClick={() => onModulo("mentoria")} style={{ textAlign: "left", padding: "16px", borderRadius: "4px", border: "1px solid #D9914F", background: "#FFFBF0", boxShadow: "0 2px 8px rgba(92, 26, 43, 0.1)", cursor: "pointer", transition: "all 0.3s ease" }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 16px rgba(92, 26, 43, 0.2)"; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(92, 26, 43, 0.1)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ fontFamily: "'Crimson Text', serif", color: "#5C1A2B", fontSize: "18px", fontWeight: "600" }}>Mentoria</div>
              <div style={{ fontSize: "11px", marginTop: "3px", color: "#8A7A5C", fontFamily: "'Lora', serif" }}>
                {totalEncontros > 0 ? `${totalEncontrosRealizados}/${totalEncontros} encontros realizados` : "Jornada ainda não desenhada"}
              </div>
            </button>
          )}
        </div>
      )}

      {proximoPasso && servicosCliente.consultoria && (
        <button
          onClick={() => onModulo(proximoPasso.modulo)}
          style={{ textAlign: "left", width: "100%", padding: "16px 20px", borderRadius: "4px", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", background: "#F5EDD9", border: "1px solid #D4AF37", cursor: "pointer", transition: "all 0.3s ease" }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(212, 175, 55, 0.2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
        >
          <span style={{ fontSize: "13px", color: "#3C181E", fontFamily: "'Lora', serif" }}>
            <span style={{ fontWeight: "600", color: "#D4AF37" }}>Próximo passo · </span>
            {proximoPasso.texto}
          </span>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#D4AF37", fontFamily: "'Lora', serif" }}>abrir →</span>
        </button>
      )}

      <button
        onClick={() => onModulo("penseira")}
        style={{ textAlign: "left", width: "100%", padding: "20px", borderRadius: "4px", marginBottom: "32px", display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", background: "#3C181E", border: "1px solid #8A3A2E", cursor: "pointer", transition: "all 0.3s ease" }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 16px rgba(92, 26, 43, 0.3)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
      >
        <span style={{ fontFamily: "'Crimson Text', serif", fontSize: "18px", fontWeight: "600", color: "#D4AF37" }}>Penseira</span>
        <span style={{ fontSize: "11px", color: "#D9914F", fontFamily: "'Lora', serif" }}>Despeje um pensamento e examine-o com clareza — soluções e dúvidas com base legal, sobre qualquer cômodo</span>
      </button>

      {(servicosCliente.consultoria || ehPessoa) && (
      <div style={{ marginBottom: "32px" }}>
        <div style={{ fontFamily: "'Crimson Text', serif", fontSize: "20px", fontWeight: "800", marginBottom: "6px", color: "#5C1A2B" }}>{ehPessoa ? "Ala do Mentorado" : "Ala do Contratante"}</div>
        <div style={{ fontSize: "11px", marginBottom: "16px", color: "#A89878", fontFamily: "'Lora', serif" }}>{ehPessoa ? "A pessoa, o combinado e o entorno — mapeie também quem ela lidera" : "A pessoa e a relação — de quem contrata ao que foi combinado"}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "12px" }}>
          {alaContratante.map((chave) => (
            <Cartao key={chave} chave={chave} />
          ))}
        </div>
      </div>
      )}

      {servicosCliente.consultoria && (
      <div style={{ marginBottom: "32px" }}>
        <div style={{ fontFamily: "'Crimson Text', serif", fontSize: "20px", fontWeight: "800", marginBottom: "6px", color: "#5C1A2B" }}>Ala do Negócio</div>
        <div style={{ fontSize: "11px", marginBottom: "16px", color: "#A89878", fontFamily: "'Lora', serif" }}>A empresa, organizada por frentes de trabalho</div>
        {alaNegocio.map((grupo) => (
          <div key={grupo.frente} style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: "600", marginBottom: "12px", color: "#D4AF37", fontFamily: "'Lora', serif", letterSpacing: "1px" }}>
              {grupo.frente}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "12px" }}>
              {grupo.chaves.map((chave) => (
                <Cartao key={chave} chave={chave} compacto />
              ))}
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}

// ─── Módulo: Tabela Disciplinar ─────────────────────────────────

function LinhaInfracao({ item, onMudar, onRemover }) {
  return (
    <div className="flex items-start gap-2 py-2 border-b" style={{ borderColor: "#EFE8D6" }}>
      <input
        className="w-28 shrink-0 px-2 py-1 text-xs rounded border bg-white"
        style={{ borderColor: "#E0D5BC", color: CORES.fogoEscuro }}
        value={item.setor}
        onChange={(e) => onMudar({ ...item, setor: e.target.value })}
      />
      <input
        className="flex-1 px-2 py-1 text-sm rounded border bg-white"
        style={{ borderColor: "#E0D5BC", color: CORES.fogoEscuro }}
        value={item.infracao}
        onChange={(e) => onMudar({ ...item, infracao: e.target.value })}
      />
      <select
        className="px-2 py-1 text-xs rounded border font-semibold"
        style={{
          borderColor: GRAV_INFO[item.gravidade].cor,
          background: GRAV_INFO[item.gravidade].fundo,
          color: GRAV_INFO[item.gravidade].cor,
        }}
        value={item.gravidade}
        onChange={(e) => onMudar({ ...item, gravidade: e.target.value })}
      >
        {GRAVIDADES.map((g) => (
          <option key={g} value={g}>{GRAV_INFO[g].rotulo}</option>
        ))}
      </select>
      <button onClick={onRemover} className="px-2 py-1 text-xs" style={{ color: "#B8860B" }} title="Remover">
        ✕
      </button>
    </div>
  );
}

function agruparPorSetor(tabela) {
  return [...new Set(tabela.map((t) => t.setor))].map((s) => ({
    setor: s,
    itens: tabela
      .filter((t) => t.setor === s)
      .sort((a, b) => GRAVIDADES.indexOf(a.gravidade) - GRAVIDADES.indexOf(b.gravidade)),
  }));
}

function ModuloTabela({ cliente, tabela, gerando, erro, onGerar, onMudarTabela, onImprimir, onVoltar }) {
  const grupos = tabela ? agruparPorSetor(tabela) : [];

  return (
    <div style={{ background: "#FFFBF0", minHeight: "100vh", paddingBottom: "64px" }}>
      <HeaderModulo
        titulo="Tabela Disciplinar"
        cliente={cliente}
        onVoltar={onVoltar}
        acoes={
          <>
            <BotaoPrimario onClick={onGerar} disabled={gerando}>
              {gerando ? "Gerando..." : tabela ? "Gerar novamente" : "Gerar com IA"}
            </BotaoPrimario>
            {tabela && <BotaoContorno onClick={onImprimir}>Exportar PDF</BotaoContorno>}
          </>
        }
      />
      <div style={{ maxWidth: "1200px", margin: "0 auto", paddingLeft: "32px", paddingRight: "32px" }}>
        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && !tabela && !erro && (
          <p className="text-sm py-6" style={{ color: "#8A7A5C" }}>
            Nenhuma tabela gerada ainda. A IA parte da tabela-mãe e adapta aos dados do cliente — você revisa e ajusta tudo antes de exportar.
          </p>
        )}

        {!gerando && tabela && (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#FFFBF0", marginBottom: "20px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #D4AF37", background: "#EFE8D6" }}>
                  <th style={{ textAlign: "left", padding: "16px", fontSize: "11px", fontWeight: "700", color: "#5C1A2B", fontFamily: "'Lora', serif", textTransform: "uppercase", letterSpacing: "1px" }}>Setor</th>
                  <th style={{ textAlign: "left", padding: "16px", fontSize: "11px", fontWeight: "700", color: "#5C1A2B", fontFamily: "'Lora', serif", textTransform: "uppercase", letterSpacing: "1px" }}>Infração</th>
                  <th style={{ textAlign: "center", padding: "16px", fontSize: "11px", fontWeight: "700", color: "#5C1A2B", fontFamily: "'Lora', serif", textTransform: "uppercase", letterSpacing: "1px" }}>Gravidade</th>
                  <th style={{ textAlign: "center", padding: "16px", fontSize: "11px", fontWeight: "700", color: "#5C1A2B", fontFamily: "'Lora', serif", textTransform: "uppercase", letterSpacing: "1px" }}>Medida</th>
                  <th style={{ textAlign: "center", padding: "16px", fontSize: "11px", fontWeight: "700", color: "#5C1A2B", fontFamily: "'Lora', serif", textTransform: "uppercase", letterSpacing: "1px" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {tabela.map((item, idx) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
                      background: idx % 2 === 0 ? "#FFFBF0" : "#FBF9F5"
                    }}
                  >
                    <td style={{ padding: "12px", fontSize: "13px", color: "#5C1A2B", fontFamily: "'Lora', serif", fontWeight: "600" }}>
                      <input
                        style={{ width: "100%", padding: "4px 8px", border: "1px solid #E0D5BC", borderRadius: "4px", fontSize: "12px", color: "#5C1A2B" }}
                        value={item.setor}
                        onChange={(e) => onMudarTabela(tabela.map((t) => (t.id === item.id ? { ...t, setor: e.target.value } : t)))}
                      />
                    </td>
                    <td style={{ padding: "12px", fontSize: "13px", color: "#5C1A2B", fontFamily: "'Lora', serif" }}>
                      <input
                        style={{ width: "100%", padding: "4px 8px", border: "1px solid #E0D5BC", borderRadius: "4px", fontSize: "12px", color: "#5C1A2B" }}
                        value={item.infracao}
                        onChange={(e) => onMudarTabela(tabela.map((t) => (t.id === item.id ? { ...t, infracao: e.target.value } : t)))}
                      />
                    </td>
                    <td style={{ padding: "12px", fontSize: "12px", textAlign: "center" }}>
                      <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: "12px", background: GRAV_INFO[item.gravidade].fundo, color: GRAV_INFO[item.gravidade].cor, fontWeight: "600", fontFamily: "'Lora', serif", fontSize: "11px" }}>
                        {GRAV_INFO[item.gravidade].rotulo}
                      </span>
                    </td>
                    <td style={{ padding: "12px", fontSize: "13px", textAlign: "center", color: "#5C1A2B", fontFamily: "'Lora', serif" }}>
                      {GRAV_INFO[item.gravidade].medida}
                    </td>
                    <td style={{ padding: "12px", fontSize: "12px", textAlign: "center" }}>
                      <button
                        onClick={() => onMudarTabela(tabela.filter((t) => t.id !== item.id))}
                        style={{ color: "#8A3A2E", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontFamily: "'Lora', serif", fontSize: "12px" }}
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={() => onMudarTabela([...tabela, { id: uid(), setor: "Geral", infracao: "", gravidade: "leve" }])}
              className="mt-2 text-sm"
              style={{ color: CORES.dourado, fontFamily: "'Lora', serif" }}
            >
              + Adicionar infração
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ImpressaoTabela({ cliente, tabela }) {
  if (!tabela) return null;
  const grupos = agruparPorSetor(tabela);
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "#2A1218" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>Tabela Disciplinar</div>
        <div className="text-lg font-serif mt-1">{cliente.negocio}</div>
        <div className="text-sm mt-1" style={{ color: "#6B5D42" }}>{cliente.segmento}</div>
      </div>

      <div className="mb-6">
        <div className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: CORES.dourado }}>
          Gradação de medidas
        </div>
        <table className="w-full text-sm border-collapse">
          <tbody>
            {GRAVIDADES.map((g) => (
              <tr key={g}>
                <td className="border px-3 py-1 font-semibold w-32" style={{ borderColor: "#D9914F", color: GRAV_INFO[g].cor }}>
                  {GRAV_INFO[g].rotulo}
                </td>
                <td className="border px-3 py-1" style={{ borderColor: "#D9914F" }}>{GRAV_INFO[g].medida}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs mt-2" style={{ color: "#6B5D42" }}>
          Reincidência no mesmo tema eleva a medida ao grau seguinte. Três feedbacks registrados sobre o mesmo tema equivalem a advertência escrita. Sem registro, a ocorrência não existe.
        </p>
      </div>

      {grupos.map((gr) => (
        <div key={gr.setor} className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>
            {gr.setor}
          </div>
          <table className="w-full text-sm border-collapse">
            <tbody>
              {gr.itens.map((item) => (
                <tr key={item.id}>
                  <td className="border px-3 py-1" style={{ borderColor: "#D9914F" }}>{item.infracao}</td>
                  <td className="border px-3 py-1 w-28 font-semibold" style={{ borderColor: "#D9914F", color: GRAV_INFO[item.gravidade].cor }}>
                    {GRAV_INFO[item.gravidade].rotulo}
                  </td>
                  <td className="border px-3 py-1 w-52" style={{ borderColor: "#D9914F" }}>{GRAV_INFO[item.gravidade].medida}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <RodapeImpressao />
    </div>
  );
}

function RodapeImpressao() {
  return (
    <div className="mt-8 pt-4 border-t text-xs" style={{ borderColor: CORES.dourado, color: "#6B5D42" }}>
      <p className="mb-1">
        * A aplicação de qualquer medida disciplinar — em especial suspensão e desligamento por justa causa (art. 482 da CLT) — deve ser validada previamente com o contador e/ou advogado trabalhista da empresa, inclusive quanto à convenção coletiva (CCT) vigente do setor.
      </p>
      <p className="font-serif italic" style={{ color: CORES.fogo }}>
        Elaborado por Nayara Silva · Consultoria de Governança
      </p>
    </div>
  );
}

// ─── Módulo: Descrições de Cargo ────────────────────────────────

const CAMPOS_CARGO = [
  ["sumaria", "Descrição sumária", 3],
  ["atividades", "Atividades (uma por linha)", 8],
  ["requisitos", "Requisitos", 3],
  ["condicoes", "Condições de trabalho", 3],
  ["supervisao", "Supervisão", 2],
  ["patrimonio", "Patrimônio sob responsabilidade", 2],
  ["confidenciais", "Informações confidenciais", 2],
];

function cargoVazio() {
  return {
    id: uid(),
    nome: "",
    setor: "",
    obs: "",
    sumaria: "",
    atividades: "",
    requisitos: "",
    condicoes: "",
    supervisao: "",
    patrimonio: "",
    confidenciais: "",
  };
}

function ListaCargos({ cliente, cargos, onAbrirCargo, onNovoCargo, onVoltar }) {
  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: "#B8860B", letterSpacing: 1 }}>
        ← {cliente.negocio}
      </button>
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="font-serif text-xl" style={{ color: CORES.fogo }}>Descrições de Cargo</h2>
        <BotaoPrimario onClick={onNovoCargo}>+ Novo cargo</BotaoPrimario>
      </div>
      {cargos.length === 0 ? (
        <div className="text-center py-16 rounded-lg" style={{ background: CORES.papel, border: "1px dashed #D9914F" }}>
          <p className="text-sm" style={{ color: "#8A7A5C" }}>
            Nenhum cargo cadastrado. Crie o primeiro — informe nome e setor, e a IA escreve a descrição completa para sua revisão.
          </p>
        </div>
      ) : (
        <div className="grid gap-2">
          {cargos.map((cg) => (
            <button
              key={cg.id}
              onClick={() => onAbrirCargo(cg.id)}
              className="objeto text-left px-5 py-3 rounded-lg shadow-sm flex items-baseline justify-between"
              className="card"
            >
              <span className="font-serif" style={{ color: CORES.fogo }}>{cg.nome || "(sem nome)"}</span>
              <span className="text-xs" style={{ color: "#8A7A5C" }}>
                {cg.setor}{cg.sumaria ? "" : " · rascunho vazio"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function EditorCargo({ cliente, cargo, gerando, erro, onMudar, onGerar, onImprimir, onExcluir, onVoltar }) {
  const set = (campo) => (v) => onMudar({ ...cargo, [campo]: v });
  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: "#B8860B", letterSpacing: 1 }}>
        ← Descrições de Cargo · {cliente.negocio}
      </button>
      <div className="rounded-lg p-6 shadow-sm" className="card">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h2 className="font-serif text-lg" style={{ color: CORES.fogo }}>
            {cargo.nome || "Novo cargo"}
          </h2>
          <div className="flex gap-2">
            <BotaoPrimario onClick={onGerar} disabled={gerando || !cargo.nome.trim()}>
              {gerando ? "Gerando..." : cargo.sumaria ? "Gerar novamente" : "Gerar com IA"}
            </BotaoPrimario>
            {cargo.sumaria && <BotaoContorno onClick={onImprimir}>Exportar PDF</BotaoContorno>}
          </div>
        </div>

        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && (
          <>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <InputField label="Nome do cargo" value={cargo.nome} onChange={set("nome")} placeholder="Ex.: Chefe de Cozinha" />
              <InputField label="Setor" value={cargo.setor} onChange={set("setor")} placeholder="Ex.: Cozinha" />
            </div>
            <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Observações para a IA (opcional)</span><textarea rows={2} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} placeholder="Ex.: responde ao gerente da unidade; supervisiona 2 auxiliares" value={cargo.obs} onChange={(e) => set("obs")(e.target.value)} /></label>
            {CAMPOS_CARGO.map(([campo, rotulo, linhas]) => (
              <label key={campo} className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>{rotulo}</span><textarea rows={linhas} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} value={cargo[campo]} onChange={(e) => set(campo)(e.target.value)} /></label>
            ))}
            <button onClick={onExcluir} className="text-xs underline" style={{ color: "#8A3A2E" }}>
              Excluir cargo
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ImpressaoCargo({ cliente, cargo }) {
  if (!cargo || !cargo.sumaria) return null;
  const secoes = [
    ["Descrição sumária", cargo.sumaria],
    ["Requisitos", cargo.requisitos],
    ["Condições de trabalho", cargo.condicoes],
    ["Supervisão", cargo.supervisao],
    ["Patrimônio sob responsabilidade", cargo.patrimonio],
    ["Informações confidenciais", cargo.confidenciais],
  ].filter(([, v]) => v && v.trim());
  const atividades = (cargo.atividades || "").split("\n").map((a) => a.trim()).filter(Boolean);

  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "#2A1218" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="text-xs uppercase tracking-widest" style={{ color: CORES.dourado }}>Descrição de Cargo</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{cargo.nome}</div>
        <div className="text-sm mt-1" style={{ color: "#6B5D42" }}>
          {cliente.negocio}{cargo.setor ? ` · Setor: ${cargo.setor}` : ""}
        </div>
      </div>

      {secoes.slice(0, 1).map(([titulo, texto]) => (
        <div key={titulo} className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>{titulo}</div>
          <p className="text-sm">{texto}</p>
        </div>
      ))}

      {atividades.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Atividades</div>
          <ul className="text-sm list-disc pl-5">
            {atividades.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {secoes.slice(1).map(([titulo, texto]) => (
        <div key={titulo} className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>{titulo}</div>
          <p className="text-sm">{texto}</p>
        </div>
      ))}

      <RodapeImpressao />
    </div>
  );
}

// ─── Módulo: Gestão do Engajamento ──────────────────────────────

function CartaoFrente({ frente, onMudar, onRemover }) {
  const st = STATUS_FRENTE[frente.status];
  const feitas = frente.acoes.filter((a) => a.feita).length;
  const [abertas, setAbertas] = useState(() => new Set());

  const alternar = (id) => {
    setAbertas((prev) => {
      const novo = new Set(prev);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  };

  const mudarAcao = (id, campo, valor) =>
    onMudar({ ...frente, acoes: frente.acoes.map((x) => (x.id === id ? { ...x, [campo]: valor } : x)) });

  const mudarEtapas = (acaoId, novasEtapas) => mudarAcao(acaoId, "etapas", novasEtapas);

  return (
    <div className="rounded-lg p-4 mb-3" style={{ background: "white", border: "2px solid #E97F3855" }}>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <input
          className="font-serif text-base flex-1 min-w-40 bg-transparent outline-none"
          style={{ color: CORES.fogo }}
          value={frente.nome}
          onChange={(e) => onMudar({ ...frente, nome: e.target.value })}
        />
        <select
          className="px-2 py-1 text-xs rounded border font-semibold"
          style={{ borderColor: st.cor, background: st.fundo, color: st.cor }}
          value={frente.status}
          onChange={(e) => onMudar({ ...frente, status: e.target.value })}
        >
          {Object.entries(STATUS_FRENTE).map(([chave, info]) => (
            <option key={chave} value={chave}>{info.rotulo}</option>
          ))}
        </select>
        <button onClick={onRemover} className="px-1 text-xs" style={{ color: "#B8860B" }} title="Remover frente">✕</button>
      </div>
      <input
        className="w-full text-sm mb-3 px-2 py-1 rounded border bg-white"
        style={{ borderColor: "#EFE8D6", color: "#6B5D42" }}
        placeholder="Escopo da frente..."
        value={frente.escopo}
        onChange={(e) => onMudar({ ...frente, escopo: e.target.value })}
      />
      {frente.acoes.map((a) => {
        const etapas = a.etapas || [];
        const etapasFeitas = etapas.filter((e) => e.feita).length;
        const aberta = abertas.has(a.id);
        const temDetalhe = a.responsavel || a.obs || etapas.length > 0;
        return (
          <div key={a.id} className="py-1 border-b" style={{ borderColor: "#F5F0E4" }}>
            <div className="flex items-start gap-2">
              <button
                onClick={() => alternar(a.id)}
                className="mt-0.5 text-xs w-4 shrink-0"
                style={{ color: temDetalhe ? CORES.dourado : "#C0B091" }}
                title="Etapas, responsável e observações"
              >
                {aberta ? "▾" : "▸"}
              </button>
              <input
                type="checkbox"
                className="mt-1"
                checked={a.feita}
                onChange={() => mudarAcao(a.id, "feita", !a.feita)}
              />
              <div className="flex-1 min-w-0">
                <input
                  className="w-full text-sm bg-transparent outline-none"
                  style={{ color: a.feita ? "#A89878" : CORES.fogoEscuro, textDecoration: a.feita ? "line-through" : "none" }}
                  value={a.texto}
                  onChange={(e) => mudarAcao(a.id, "texto", e.target.value)}
                />
                {!aberta && temDetalhe && (
                  <div className="flex gap-2 flex-wrap text-xs mt-0.5" style={{ color: "#A89878" }}>
                    {a.responsavel && <span style={{ color: CORES.dourado }}>@{a.responsavel}</span>}
                    {etapas.length > 0 && <span>{etapasFeitas}/{etapas.length} etapas</span>}
                    {a.obs && <span title={a.obs}>✎ obs</span>}
                  </div>
                )}
              </div>
              <input
                className="w-14 px-1 py-0.5 text-xs rounded border bg-white text-center"
                style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                placeholder="sem."
                title="Semana do cronograma"
                value={a.semana || ""}
                onChange={(e) => mudarAcao(a.id, "semana", e.target.value === "" ? null : Number(e.target.value))}
              />
              <button
                onClick={() => onMudar({ ...frente, acoes: frente.acoes.filter((x) => x.id !== a.id) })}
                className="text-xs px-1"
                style={{ color: "#C0B091" }}
              >
                ✕
              </button>
            </div>

            {aberta && (
              <div className="ml-10 mt-1 mb-2 p-3 rounded" style={{ background: "#FDFAF3", border: "1px solid #EFE8D6" }}>
                <div className="grid sm:grid-cols-2 gap-2 mb-2">
                  <input
                    className="px-2 py-1 text-xs rounded border bg-white"
                    style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                    placeholder="Responsável (ex.: Nay, gerente, dono)"
                    value={a.responsavel || ""}
                    onChange={(e) => mudarAcao(a.id, "responsavel", e.target.value)}
                  />
                  <input
                    className="px-2 py-1 text-xs rounded border bg-white"
                    style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                    placeholder="Observações..."
                    value={a.obs || ""}
                    onChange={(e) => mudarAcao(a.id, "obs", e.target.value)}
                  />
                  <input
                    className="px-2 py-1 text-xs rounded border bg-white"
                    style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                    placeholder="Por quê (justificativa da ação)"
                    title="O porquê fecha o 5W2H — sai em itálico no PDF do plano"
                    value={a.porque || ""}
                    onChange={(e) => mudarAcao(a.id, "porque", e.target.value)}
                  />
                  <input
                    className="px-2 py-1 text-xs rounded border bg-white"
                    style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                    placeholder="Custo estimado (opcional)"
                    value={a.custo || ""}
                    onChange={(e) => mudarAcao(a.id, "custo", e.target.value)}
                  />
                </div>
                {etapas.map((et) => (
                  <div key={et.id} className="flex items-center gap-2 py-0.5">
                    <input
                      type="checkbox"
                      checked={!!et.feita}
                      onChange={() =>
                        mudarEtapas(a.id, etapas.map((x) => (x.id === et.id ? { ...x, feita: !x.feita } : x)))
                      }
                    />
                    <input
                      className="flex-1 text-xs bg-transparent outline-none"
                      style={{ color: et.feita ? "#A89878" : CORES.fogoEscuro, textDecoration: et.feita ? "line-through" : "none" }}
                      placeholder="Etapa..."
                      value={et.texto}
                      onChange={(e) =>
                        mudarEtapas(a.id, etapas.map((x) => (x.id === et.id ? { ...x, texto: e.target.value } : x)))
                      }
                    />
                    <button
                      onClick={() => mudarEtapas(a.id, etapas.filter((x) => x.id !== et.id))}
                      className="text-xs px-1"
                      style={{ color: "#C0B091" }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => mudarEtapas(a.id, [...etapas, { id: uid(), texto: "", feita: false }])}
                  className="text-xs mt-1"
                  style={{ color: CORES.dourado }}
                >
                  + Etapa
                </button>
              </div>
            )}
          </div>
        );
      })}
      <div className="flex items-center justify-between mt-2">
        <button
          onClick={() => onMudar({ ...frente, acoes: [...frente.acoes, { id: uid(), texto: "", feita: false }] })}
          className="text-xs"
          style={{ color: CORES.dourado }}
        >
          + Ação
        </button>
        <span className="text-xs" style={{ color: "#A89878" }}>
          {feitas}/{frente.acoes.length} concluídas
        </span>
      </div>
    </div>
  );
}

function ModuloGestao({ cliente, gestao, atas, gerando, erro, onMudar, onGerarPlano, onAtualizarPlano, onAbrirAta, onNovaAta, onVoltar }) {
  const frentes = gestao.frentes || [];
  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", paddingTop: "16px", paddingLeft: "32px", paddingRight: "32px", paddingBottom: "64px" }}>
      <button onClick={onVoltar} style={{ fontSize: "11px", marginBottom: "32px", textTransform: "uppercase", fontWeight: "600", background: "none", border: "none", cursor: "pointer", color: "#5C1A2B", fontFamily: "'Lora', serif", letterSpacing: "1px" }}>
        ← {cliente.negocio}
      </button>

      <div style={{ background: "#FFFBF0", borderRadius: "4px", marginBottom: "32px", boxShadow: "0 2px 8px rgba(92, 26, 43, 0.1)" }}>
        <div style={{ padding: "32px", borderBottom: "1px solid rgba(60, 24, 30, 0.08)", background: "linear-gradient(180deg, rgba(217, 145, 79, 0.08) 0%, rgba(245, 237, 217, 0.4) 100%)" }}>
          <div style={{ fontSize: "18px", fontWeight: "600", color: "#5C1A2B", marginBottom: "4px" }}>Briefing</div>
          <div style={{ fontSize: "12px", color: "#8B6F47" }}>Registre o que saiu da reunião para que a IA gere o plano</div>
        </div>
        <div style={{ padding: "28px" }}>
          <p style={{ fontSize: "11px", marginBottom: "16px", color: "#8A7A5C", fontFamily: "'Lora', serif" }}>
            Anote aqui o que saiu da reunião — necessidades, dores, o que existe e o que falta em cada área. A IA transforma isso em frentes e plano de ação. Se o contratante já estiver no Chapéu Seletor, o plano se molda ao temperamento dele — sem nunca mencioná-lo.
          </p>
          <textarea
            rows={7}
            placeholder="Ex.: Reunião com Driely em 18/07. Frente de pessoas: nada estruturado, começar do zero. Processos operacionais: existe uma leve estrutura, precisa ser formalizada e direcionada..."
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #D9914F",
              borderRadius: "4px",
              fontFamily: "'Lora', serif",
              fontSize: "13px",
              background: "#FFFBF0",
              color: "#3C181E",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.2s"
            }}
            value={gestao.briefing || ""}
            onChange={(e) => onMudar({ ...gestao, briefing: e.target.value })}
            onFocus={(e) => { e.target.style.borderColor = "#D4AF37"; e.target.style.boxShadow = "0 0 0 2px rgba(212, 175, 55, 0.1)"; }}
            onBlur={(e) => { e.target.style.borderColor = "#D9914F"; e.target.style.boxShadow = "none"; }}
          />
          <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            {frentes.length === 0 ? (
              <BotaoPrimario onClick={onGerarPlano} disabled={gerando || !(gestao.briefing || "").trim()}>
                {gerando ? "Gerando..." : "Gerar plano de ação com IA"}
              </BotaoPrimario>
            ) : (
              <>
                <BotaoPrimario onClick={onAtualizarPlano} disabled={gerando}>
                  {gerando ? "Atualizando..." : "Atualizar plano com IA"}
                </BotaoPrimario>
                <span style={{ fontSize: "11px", color: "#A89878", fontFamily: "'Lora', serif" }}>
                  Lê o briefing e a última ata; preserva frentes, status e ações feitas — só acrescenta e ajusta.
                </span>
                <ConfirmarAcao label="Recomeçar do zero" aviso="apaga frentes, status e ações marcadas" onConfirmar={onGerarPlano} />
              </>
            )}
          </div>
          <AvisoErro erro={erro} />
          {gerando && <Trabalhando />}
        </div>
      </div>

      {!gerando && (
        <div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "16px" }}>
            <h3 style={{ fontFamily: "'Crimson Text', serif", fontSize: "20px", fontWeight: "800", color: "#5C1A2B" }}>Frentes de trabalho</h3>
            <button
              onClick={() =>
                onMudar({
                  ...gestao,
                  frentes: [...frentes, { id: uid(), nome: "Nova frente", status: "nao_iniciada", escopo: "", acoes: [] }],
                })
              }
              style={{ fontSize: "13px", color: "#D4AF37", background: "none", border: "none", cursor: "pointer", fontFamily: "'Lora', serif", fontWeight: "600" }}
            >
              + Frente manual
            </button>
          </div>
          {frentes.length === 0 ? (
            <p style={{ fontSize: "13px", paddingTop: "16px", paddingBottom: "16px", color: "#8A7A5C", fontFamily: "'Lora', serif" }}>
              Nenhuma frente ainda. Preencha o briefing e gere o plano — ou adicione frentes manualmente.
            </p>
          ) : (
            frentes.map((f) => (
              <CartaoFrente
                key={f.id}
                frente={f}
                onMudar={(nova) => onMudar({ ...gestao, frentes: frentes.map((x) => (x.id === nova.id ? nova : x)) })}
                onRemover={() => onMudar({ ...gestao, frentes: frentes.filter((x) => x.id !== f.id) })}
              />
            ))
          )}

          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: "32px", marginBottom: "16px" }}>
            <h3 style={{ fontFamily: "'Crimson Text', serif", fontSize: "20px", fontWeight: "800", color: "#5C1A2B" }}>Atas de reunião</h3>
            <button onClick={onNovaAta} style={{ fontSize: "13px", color: "#D4AF37", background: "none", border: "none", cursor: "pointer", fontFamily: "'Lora', serif", fontWeight: "600" }}>
              + Nova ata
            </button>
          </div>
          {atas.length === 0 ? (
            <p style={{ fontSize: "13px", paddingTop: "8px", paddingBottom: "8px", color: "#8A7A5C", fontFamily: "'Lora', serif" }}>
              Nenhuma ata ainda. Registre cada reunião de acompanhamento aqui — despeje as anotações e a IA estrutura em resumo, decisões e ações.
            </p>
          ) : (
            <div style={{ display: "grid", gap: "8px" }}>
              {atas.map((a) => (
                <button
                  key={a.id}
                  onClick={() => onAbrirAta(a.id)}
                  style={{ textAlign: "left", padding: "16px 20px", borderRadius: "4px", boxShadow: "0 2px 8px rgba(92, 26, 43, 0.1)", display: "flex", alignItems: "baseline", justifyContent: "space-between", background: "white", border: "1px solid #D9914F", cursor: "pointer", transition: "all 0.3s ease" }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 16px rgba(92, 26, 43, 0.2)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(92, 26, 43, 0.1)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <span style={{ fontFamily: "'Crimson Text', serif", fontSize: "16px", fontWeight: "600", color: "#5C1A2B" }}>{a.nome || "(sem título)"}</span>
                  <span style={{ fontSize: "11px", color: "#8A7A5C", fontFamily: "'Lora', serif" }}>{a.data || (a.resumo ? "" : "rascunho vazio")}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Módulo: Estrutura de Governança / Organograma ──────────────

function montarArvore(posicoes) {
  const filhosDe = {};
  const raizes = [];
  for (const p of posicoes) {
    const paiValido = p.superiorId && posicoes.some((x) => x.id === p.superiorId) && p.superiorId !== p.id;
    if (paiValido) {
      (filhosDe[p.superiorId] = filhosDe[p.superiorId] || []).push(p);
    } else {
      raizes.push(p);
    }
  }
  return { raizes, filhosDe };
}

function NoArvore({ posicao, filhosDe, visitados, impressao }) {
  if (visitados.has(posicao.id)) return null;
  const novos = new Set(visitados);
  novos.add(posicao.id);
  const filhos = filhosDe[posicao.id] || [];
  return (
    <div className="ml-0">
      <div
        className={impressao ? "inline-block px-3 py-1.5 rounded mb-1" : "inline-block px-3 py-1.5 rounded mb-1 shadow-sm"}
        style={{ background: impressao ? "white" : CORES.papel, border: `2px solid #D4AF37AA` }}
      >
        <span className="font-serif text-sm" style={{ color: CORES.fogo }}>{posicao.nome}</span>
        {posicao.setor && (
          <span className="text-xs ml-2" style={{ color: "#8A7A5C" }}>{posicao.setor}</span>
        )}
      </div>
      {filhos.length > 0 && (
        <div className="pl-6 ml-2 border-l-2" style={{ borderColor: "#D9914F" }}>
          {filhos.map((f) => (
            <NoArvore key={f.id} posicao={f} filhosDe={filhosDe} visitados={novos} impressao={impressao} />
          ))}
        </div>
      )}
    </div>
  );
}

function Organograma({ posicoes, impressao }) {
  const { raizes, filhosDe } = montarArvore(posicoes);
  return (
    <div>
      {raizes.map((r) => (
        <NoArvore key={r.id} posicao={r} filhosDe={filhosDe} visitados={new Set()} impressao={impressao} />
      ))}
    </div>
  );
}

function ModuloEstrutura({ cliente, posicoes, cargos, gerando, erro, onMudar, onGerar, onImprimir, onVoltar }) {
  const importarDosCargos = () => {
    const existentes = new Set(posicoes.map((p) => p.nome.toLowerCase()));
    const novas = cargos
      .filter((c) => c.nome.trim() && !existentes.has(c.nome.toLowerCase()))
      .map((c) => ({ id: uid(), nome: c.nome, setor: c.setor || "", superiorId: null }));
    onMudar([...posicoes, ...novas]);
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: "#B8860B", letterSpacing: 1 }}>
        ← {cliente.negocio}
      </button>
      <div className="rounded-lg p-6 shadow-sm" className="card">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h2 className="font-serif text-lg" style={{ color: CORES.fogo }}>Estrutura de Governança</h2>
          <div className="flex gap-2 flex-wrap">
            <BotaoPrimario onClick={onGerar} disabled={gerando}>
              {gerando ? "Gerando..." : posicoes.length ? "Gerar novamente" : "Gerar com IA"}
            </BotaoPrimario>
            {cargos.length > 0 && <BotaoContorno onClick={importarDosCargos}>Importar dos cargos</BotaoContorno>}
            {posicoes.length > 0 && <BotaoContorno onClick={onImprimir}>Exportar PDF</BotaoContorno>}
          </div>
        </div>

        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && posicoes.length === 0 && !erro && (
          <p className="text-sm py-6" style={{ color: "#8A7A5C" }}>
            A tapeçaria da casa ainda está em branco. Gere com IA a partir dos dados do cliente, importe dos cargos já descritos, ou adicione posições manualmente.
          </p>
        )}

        {!gerando && posicoes.length > 0 && (
          <>
            <div className="mb-6">
              {posicoes.map((p) => (
                <div key={p.id} className="flex items-center gap-2 py-1.5 border-b" style={{ borderColor: "#EFE8D6" }}>
                  <input
                    className="flex-1 px-2 py-1 text-sm rounded border bg-white"
                    style={{ borderColor: "#E0D5BC", color: CORES.fogoEscuro }}
                    value={p.nome}
                    placeholder="Nome da posição"
                    onChange={(e) => onMudar(posicoes.map((x) => (x.id === p.id ? { ...x, nome: e.target.value } : x)))}
                  />
                  <input
                    className="w-28 px-2 py-1 text-xs rounded border bg-white"
                    style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                    value={p.setor}
                    placeholder="Setor"
                    onChange={(e) => onMudar(posicoes.map((x) => (x.id === p.id ? { ...x, setor: e.target.value } : x)))}
                  />
                  <select
                    className="w-40 px-2 py-1 text-xs rounded border bg-white"
                    style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                    value={p.superiorId || ""}
                    onChange={(e) =>
                      onMudar(posicoes.map((x) => (x.id === p.id ? { ...x, superiorId: e.target.value || null } : x)))
                    }
                  >
                    <option value="">— topo —</option>
                    {posicoes
                      .filter((x) => x.id !== p.id)
                      .map((x) => (
                        <option key={x.id} value={x.id}>reporta a: {x.nome}</option>
                      ))}
                  </select>
                  <button
                    onClick={() =>
                      onMudar(
                        posicoes
                          .filter((x) => x.id !== p.id)
                          .map((x) => (x.superiorId === p.id ? { ...x, superiorId: null } : x))
                      )
                    }
                    className="px-1 text-xs"
                    style={{ color: "#B8860B" }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => onMudar([...posicoes, { id: uid(), nome: "", setor: "", superiorId: null }])}
                className="mt-2 text-sm"
                style={{ color: CORES.dourado }}
              >
                + Adicionar posição
              </button>
            </div>

            <div className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: CORES.dourado }}>
              Pré-visualização do organograma
            </div>
            <Organograma posicoes={posicoes} />
          </>
        )}
      </div>
    </div>
  );
}

function ImpressaoEstrutura({ cliente, posicoes }) {
  if (!posicoes || posicoes.length === 0) return null;
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "#2A1218" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="text-xs uppercase tracking-widest" style={{ color: CORES.dourado }}>Estrutura de Governança</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>Organograma</div>
        <div className="text-sm mt-1" style={{ color: "#6B5D42" }}>{cliente.negocio} · {cliente.segmento}</div>
      </div>
      <Organograma posicoes={posicoes} impressao />
      <p className="text-xs mt-6" style={{ color: "#6B5D42" }}>
        Cada posição responde à posição imediatamente acima na linha de reporte. Comunicações e decisões seguem esta estrutura.
      </p>
      <RodapeImpressao />
    </div>
  );
}

// ─── Módulo: Manual do Colaborador ──────────────────────────────

function ModuloManual({ cliente, secoes, gerando, erro, onMudar, onGerar, onImprimir, onVoltar }) {
  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: "#B8860B", letterSpacing: 1 }}>
        ← {cliente.negocio}
      </button>
      <div className="rounded-lg p-6 shadow-sm" className="card">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h2 className="font-serif text-lg" style={{ color: CORES.fogo }}>Manual do Colaborador</h2>
          <div className="flex gap-2">
            <BotaoPrimario onClick={onGerar} disabled={gerando}>
              {gerando ? "Gerando..." : secoes.length ? "Gerar novamente" : "Gerar com IA"}
            </BotaoPrimario>
            {secoes.length > 0 && <BotaoContorno onClick={onImprimir}>Exportar PDF</BotaoContorno>}
          </div>
        </div>

        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && secoes.length === 0 && !erro && (
          <p className="text-sm py-6" style={{ color: "#8A7A5C" }}>
            Nenhuma seção ainda. A IA escreve o manual a partir dos dados e regras da casa — você revisa seção por seção antes de exportar.
          </p>
        )}

        {!gerando &&
          secoes.map((s) => (
            <div key={s.id} className="mb-4 rounded-lg p-4" style={{ background: "white", border: "2px solid #E97F3855" }}>
              <div className="flex items-center gap-2 mb-2">
                <input
                  className="font-serif flex-1 bg-transparent outline-none"
                  style={{ color: CORES.fogo }}
                  value={s.titulo}
                  onChange={(e) => onMudar(secoes.map((x) => (x.id === s.id ? { ...x, titulo: e.target.value } : x)))}
                />
                <button
                  onClick={() => onMudar(secoes.filter((x) => x.id !== s.id))}
                  className="px-1 text-xs"
                  style={{ color: "#B8860B" }}
                >
                  ✕
                </button>
              </div>
              <textarea
                rows={4}
                className="w-full px-2 py-1 text-sm rounded border bg-white outline-none"
                style={{ borderColor: "#EFE8D6", color: CORES.fogoEscuro }}
                value={s.conteudo}
                onChange={(e) => onMudar(secoes.map((x) => (x.id === s.id ? { ...x, conteudo: e.target.value } : x)))}
              />
            </div>
          ))}

        {!gerando && secoes.length > 0 && (
          <button
            onClick={() => onMudar([...secoes, { id: uid(), titulo: "Nova seção", conteudo: "" }])}
            className="text-sm"
            style={{ color: CORES.dourado }}
          >
            + Adicionar seção
          </button>
        )}
      </div>
    </div>
  );
}

function ImpressaoManual({ cliente, secoes }) {
  if (!secoes || secoes.length === 0) return null;
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "#2A1218" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="text-xs uppercase tracking-widest" style={{ color: CORES.dourado }}>Documento interno</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>Manual do Colaborador</div>
        <div className="text-sm mt-1" style={{ color: "#6B5D42" }}>{cliente.negocio} · {cliente.segmento}</div>
      </div>
      {secoes.map((s, i) => (
        <div key={s.id} className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>
            {i + 1}. {s.titulo}
          </div>
          <p className="text-sm whitespace-pre-line">{s.conteudo}</p>
        </div>
      ))}
      <RodapeImpressao />
    </div>
  );
}

// ─── Módulo: CCT & Conformidade ─────────────────────────────────

const DESTINOS_CCT = {
  manual: "Manual",
  tabela: "Tabela Disciplinar",
  cargos: "Descrições de Cargo",
  geral: "Geral",
};

function ModuloCCT({ cliente, cct, gerando, erro, onMudar, onAnalisar, onVoltar }) {
  const pontos = cct.pontos || [];

  const aoEscolherArquivo = (e) => {
    const arquivo = e.target.files && e.target.files[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = () => {
      const base64 = String(leitor.result).split(",")[1];
      onAnalisar(arquivo.name, base64);
    };
    leitor.readAsDataURL(arquivo);
    e.target.value = "";
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: "#B8860B", letterSpacing: 1 }}>
        ← {cliente.negocio}
      </button>
      <div className="rounded-lg p-6 shadow-sm" className="card">
        <h2 className="font-serif text-lg mb-1" style={{ color: CORES.fogo }}>CCT & Conformidade</h2>
        <p className="text-xs mb-4" style={{ color: "#8A7A5C" }}>
          As leis do Ministério: suba o PDF da convenção coletiva do setor — e depois os termos aditivos, um a um. A cada documento, a IA atualiza a análise: remove o que foi superado, ajusta o que mudou e soma o que é novo. Todas as gerações deste cliente respeitam o resultado. Os arquivos não ficam armazenados; só a análise.
        </p>

        <label
          className="inline-block px-4 py-2 rounded text-sm font-semibold text-white cursor-pointer"
          style={{ background: gerando ? "#9A8AA0" : CORES.fogo, opacity: gerando ? 0.6 : 1 }}
        >
          {gerando ? "Analisando..." : pontos.length ? "Subir aditivo ou nova CCT (soma à análise)" : "Subir PDF da CCT e analisar"}
          <input type="file" accept="application/pdf" className="hidden" disabled={gerando} onChange={aoEscolherArquivo} />
        </label>
        {pontos.length > 0 && !gerando && (
          <span className="ml-3">
            <ConfirmarAcao
              label="Recomeçar do zero"
              aviso="apaga pontos e documentos analisados"
              onConfirmar={() => onMudar({ nomeArquivo: "", dataAnalise: "", documentos: [], pontos: [] })}
            />
          </span>
        )}
        {(cct.documentos || []).length > 0 && !gerando && (
          <div className="text-xs mt-2" style={{ color: "#A89878" }}>
            Documentos analisados:{" "}
            {(cct.documentos || []).map((d) => `${d.nomeArquivo} (${d.dataAnalise})`).join(" · ")}
          </div>
        )}
        {cct.nomeArquivo && !(cct.documentos || []).length && !gerando && (
          <span className="text-xs ml-3" style={{ color: "#A89878" }}>
            Última análise: {cct.nomeArquivo}
            {cct.dataAnalise ? ` · ${cct.dataAnalise}` : ""}
          </span>
        )}

        <div className="mt-4">
          <AvisoErro erro={erro} />
        </div>
        {gerando && <Trabalhando />}

        {!gerando && pontos.length > 0 && (
          <div className="mt-4">
            <div className="flex items-baseline justify-between mb-2 flex-wrap gap-2">
              <div className="label" style={{ color: CORES.dourado }}>
                Pontos obrigatórios extraídos
              </div>
              <div className="text-xs font-semibold" style={{ color: pontos.every((p) => p.statusConf === "resolvido") ? "#4F6B3A" : "#9A6A2F" }}>
                {pontos.filter((p) => p.statusConf === "resolvido").length}/{pontos.length} resolvidos
              </div>
            </div>
            {pontos.map((p) => (
              <div key={p.id} className="flex items-start gap-2 py-2 border-b" style={{ borderColor: "#EFE8D6" }}>
                <input
                  className="w-32 shrink-0 px-2 py-1 text-xs rounded border bg-white font-semibold"
                  style={{ borderColor: "#E0D5BC", color: CORES.fogo }}
                  value={p.tema}
                  onChange={(e) =>
                    onMudar({ ...cct, pontos: pontos.map((x) => (x.id === p.id ? { ...x, tema: e.target.value } : x)) })
                  }
                />
                <textarea
                  rows={2}
                  className="flex-1 px-2 py-1 text-sm rounded border bg-white"
                  style={{ borderColor: "#E0D5BC", color: CORES.fogoEscuro }}
                  value={p.exigencia}
                  onChange={(e) =>
                    onMudar({ ...cct, pontos: pontos.map((x) => (x.id === p.id ? { ...x, exigencia: e.target.value } : x)) })
                  }
                />
                <select
                  className="px-2 py-1 text-xs rounded border bg-white shrink-0"
                  style={
                    p.statusConf === "resolvido"
                      ? { borderColor: "#4F6B3A", background: "#E3EBD8", color: "#4F6B3A" }
                      : p.statusConf === "tratamento"
                      ? { borderColor: "#9A6A2F", background: "#F5E6C8", color: "#9A6A2F" }
                      : { borderColor: "#C77", background: "#F5DDD6", color: "#8A3A2E" }
                  }
                  value={p.statusConf || "pendente"}
                  onChange={(e) =>
                    onMudar({
                      ...cct,
                      pontos: pontos.map((x) =>
                        x.id === p.id
                          ? { ...x, statusConf: e.target.value, dataResolucao: e.target.value === "resolvido" ? new Date().toLocaleDateString("pt-BR") : x.dataResolucao }
                          : x
                      ),
                    })
                  }
                >
                  <option value="pendente">Pendente</option>
                  <option value="tratamento">Em tratamento</option>
                  <option value="resolvido">Resolvido ✓</option>
                </select>
                <select
                  className="px-2 py-1 text-xs rounded border bg-white"
                  style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                  value={p.destino}
                  onChange={(e) =>
                    onMudar({ ...cct, pontos: pontos.map((x) => (x.id === p.id ? { ...x, destino: e.target.value } : x)) })
                  }
                >
                  {Object.entries(DESTINOS_CCT).map(([chave, rotulo]) => (
                    <option key={chave} value={chave}>{rotulo}</option>
                  ))}
                </select>
                <button
                  onClick={() => onMudar({ ...cct, pontos: pontos.filter((x) => x.id !== p.id) })}
                  className="px-1 text-xs"
                  style={{ color: "#B8860B" }}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                onMudar({ ...cct, pontos: [...pontos, { id: uid(), tema: "Novo ponto", exigencia: "", destino: "geral" }] })
              }
              className="mt-2 text-sm"
              style={{ color: CORES.dourado }}
            >
              + Adicionar ponto manual
            </button>
            <p className="text-xs mt-4" style={{ color: "#A89878" }}>
              Estes pontos são injetados automaticamente na geração da tabela disciplinar, das descrições de cargo e do manual deste cliente.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Módulo: Penseira ───────────────────────────────────────────

function ModuloPenseira({ cliente, mensagens, gerando, erro, onEnviar, onLimpar, onVoltar }) {
  const [texto, setTexto] = useState("");

  const enviar = () => {
    const t = texto.trim();
    if (!t || gerando) return;
    setTexto("");
    onEnviar(t);
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: "#B8860B", letterSpacing: 1 }}>
        ← {cliente.negocio}
      </button>
      <div className="rounded-lg shadow-sm flex flex-col" style={{ background: CORES.papel, border: "2px solid #E97F3855", minHeight: "60vh" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#EFE8D6" }}>
          <div>
            <h2 className="font-serif text-lg" style={{ color: CORES.fogo }}>Penseira</h2>
            <p className="text-xs" style={{ color: "#8A7A5C" }}>
              Pense em voz alta sobre {cliente.negocio}. Dúvidas trabalhistas vêm com base legal.
            </p>
          </div>
          {mensagens.length > 0 && (
            <button onClick={onLimpar} className="text-xs underline" style={{ color: "#B8860B" }}>
              Esvaziar a Penseira
            </button>
          )}
        </div>

        <div className="flex-1 px-6 py-4 overflow-y-auto" style={{ maxHeight: "55vh" }}>
          {mensagens.length === 0 && !gerando && (
            <p className="text-sm py-8 text-center font-serif italic" style={{ color: "#A89878" }}>
              Despeje um pensamento — "o cliente quer proibir calça azul, pode?" — e examine-o com clareza.
            </p>
          )}
          {mensagens.map((m, i) => (
            <div key={i} className={`mb-3 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[85%] px-4 py-2.5 rounded-lg text-sm whitespace-pre-line"
                style={
                  m.role === "user"
                    ? { background: CORES.fogo, color: "#F5EDE0" }
                    : { background: "white", border: "2px solid #E97F3855", color: CORES.fogoEscuro }
                }
              >
                {m.content}
              </div>
            </div>
          ))}
          {gerando && (
            <div className="flex justify-start mb-3">
              <div className="px-4 py-2.5 rounded-lg text-sm font-serif italic" style={{ background: "white", border: "2px solid #E97F3855", color: CORES.dourado }}>
                A Penseira está girando...
              </div>
            </div>
          )}
          <AvisoErro erro={erro} />
        </div>

        <div className="px-6 py-4 border-t flex gap-2" style={{ borderColor: "#EFE8D6" }}>
          <textarea
            rows={2}
            className="flex-1 px-3 py-2 rounded border bg-white text-sm outline-none resize-none"
            style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }}
            placeholder="Escreva seu pensamento ou dúvida..."
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                enviar();
              }
            }}
          />
          <BotaoPrimario onClick={enviar} disabled={gerando || !texto.trim()}>
            Enviar
          </BotaoPrimario>
        </div>
      </div>
    </div>
  );
}

// ─── Módulo: POPs ───────────────────────────────────────────────

const CAMPOS_POP = [
  ["objetivo", "Objetivo", 2],
  ["materiais", "Materiais e recursos (um por linha)", 4],
  ["passos", "Passos (um por linha, em ordem)", 8],
  ["atencao", "Pontos de atenção (um por linha)", 3],
  ["frequencia", "Frequência", 1],
  ["responsavel", "Responsável pela execução", 1],
];

function popVazio() {
  return {
    id: uid(),
    nome: "",
    setor: "",
    obs: "",
    objetivo: "",
    materiais: "",
    passos: "",
    atencao: "",
    frequencia: "",
    responsavel: "",
  };
}

function ListaPops({ cliente, pops, onAbrirPop, onNovoPop, onVoltar }) {
  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: "#B8860B", letterSpacing: 1 }}>
        ← {cliente.negocio}
      </button>
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="font-serif text-xl" style={{ color: CORES.fogo }}>POPs — Processos Operacionais</h2>
        <BotaoPrimario onClick={onNovoPop}>+ Novo POP</BotaoPrimario>
      </div>
      {pops.length === 0 ? (
        <div className="text-center py-16 rounded-lg" style={{ background: CORES.papel, border: "1px dashed #D9914F" }}>
          <p className="text-sm" style={{ color: "#8A7A5C" }}>
            O livro de feitiços da operação está em branco. Crie o primeiro — informe o nome do processo e o setor, e a IA escreve o encantamento passo a passo para sua revisão.
          </p>
        </div>
      ) : (
        <div className="grid gap-2">
          {pops.map((p) => (
            <button
              key={p.id}
              onClick={() => onAbrirPop(p.id)}
              className="objeto text-left px-5 py-3 rounded-lg shadow-sm flex items-baseline justify-between"
              className="card"
            >
              <span className="font-serif" style={{ color: CORES.fogo }}>{p.nome || "(sem nome)"}</span>
              <span className="text-xs" style={{ color: "#8A7A5C" }}>
                {p.setor}{p.passos ? "" : " · rascunho vazio"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function EditorPop({ cliente, pop, gerando, erro, onMudar, onGerar, onImprimir, onExcluir, onVoltar }) {
  const set = (campo) => (v) => onMudar({ ...pop, [campo]: v });
  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: "#B8860B", letterSpacing: 1 }}>
        ← POPs · {cliente.negocio}
      </button>
      <div className="rounded-lg p-6 shadow-sm" className="card">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h2 className="font-serif text-lg" style={{ color: CORES.fogo }}>
            {pop.nome || "Novo POP"}
          </h2>
          <div className="flex gap-2">
            <BotaoPrimario onClick={onGerar} disabled={gerando || !pop.nome.trim()}>
              {gerando ? "Gerando..." : pop.passos ? "Gerar novamente" : "Gerar com IA"}
            </BotaoPrimario>
            {pop.passos && <BotaoContorno onClick={onImprimir}>Exportar PDF</BotaoContorno>}
          </div>
        </div>

        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && (
          <>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <InputField label="Nome do processo" value={pop.nome} onChange={set("nome")} placeholder="Ex.: Abertura do salão" />
              <InputField label="Setor" value={pop.setor} onChange={set("setor")} placeholder="Ex.: Salão" />
            </div>
            <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Observações para a IA (opcional)</span><textarea rows={2} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} placeholder="Ex.: o processo inclui conferir o caixa e ligar os equipamentos da cozinha" value={pop.obs} onChange={(e) => set("obs")(e.target.value)} /></label>
            {CAMPOS_POP.map(([campo, rotulo, linhas]) => (
              <label key={campo} className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>{rotulo}</span><textarea rows={linhas} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} value={pop[campo]} onChange={(e) => set(campo)(e.target.value)} /></label>
            ))}
            <button onClick={onExcluir} className="text-xs underline" style={{ color: "#8A3A2E" }}>
              Excluir POP
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ImpressaoPop({ cliente, pop }) {
  if (!pop || !pop.passos) return null;
  const emLinhas = (t) => (t || "").split("\n").map((x) => x.trim()).filter(Boolean);
  const materiais = emLinhas(pop.materiais);
  const passos = emLinhas(pop.passos);
  const atencao = emLinhas(pop.atencao);

  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "#2A1218" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="text-xs uppercase tracking-widest" style={{ color: CORES.dourado }}>Procedimento Operacional Padrão</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{pop.nome}</div>
        <div className="text-sm mt-1" style={{ color: "#6B5D42" }}>
          {cliente.negocio}{pop.setor ? ` · Setor: ${pop.setor}` : ""}
        </div>
      </div>

      <table className="w-full text-sm border-collapse mb-6">
        <tbody>
          {pop.responsavel && (
            <tr>
              <td className="border px-3 py-1 font-semibold w-40" style={{ borderColor: "#D9914F", color: CORES.fogo }}>Responsável</td>
              <td className="border px-3 py-1" style={{ borderColor: "#D9914F" }}>{pop.responsavel}</td>
            </tr>
          )}
          {pop.frequencia && (
            <tr>
              <td className="border px-3 py-1 font-semibold" style={{ borderColor: "#D9914F", color: CORES.fogo }}>Frequência</td>
              <td className="border px-3 py-1" style={{ borderColor: "#D9914F" }}>{pop.frequencia}</td>
            </tr>
          )}
        </tbody>
      </table>

      {pop.objetivo && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Objetivo</div>
          <p className="text-sm">{pop.objetivo}</p>
        </div>
      )}

      {materiais.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Materiais e recursos</div>
          <ul className="text-sm list-disc pl-5">
            {materiais.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </div>
      )}

      {passos.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Passo a passo</div>
          <ol className="text-sm list-decimal pl-5">
            {passos.map((p, i) => <li key={i} className="mb-0.5">{p}</li>)}
          </ol>
        </div>
      )}

      {atencao.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Pontos de atenção</div>
          <ul className="text-sm list-disc pl-5">
            {atencao.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}

      <RodapeImpressao />
    </div>
  );
}

// ─── Componentes genéricos de documentos ────────────────────────

function ListaDocs({ cliente, tipo, docs, onAbrir, onNovo, onVoltar }) {
  const cfg = CONFIG_DOCS[tipo];
  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: "#B8860B", letterSpacing: 1 }}>
        ← {cliente.negocio}
      </button>
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="font-serif text-xl" style={{ color: CORES.fogo }}>{cfg.tituloModulo}</h2>
        <BotaoPrimario onClick={onNovo}>{cfg.novoRotulo}</BotaoPrimario>
      </div>
      {docs.length === 0 ? (
        <div className="text-center py-16 rounded-lg" style={{ background: CORES.papel, border: "1px dashed #D9914F" }}>
          <p className="text-sm" style={{ color: "#8A7A5C" }}>
            Nenhum{cfg.singular === "ata" || cfg.singular === "política" ? "a" : ""} {cfg.singular} ainda. Crie e deixe a IA escrever a primeira versão para sua revisão.
          </p>
        </div>
      ) : (
        <div className="grid gap-2">
          {docs.map((d) => (
            <button
              key={d.id}
              onClick={() => onAbrir(d.id)}
              className="objeto text-left px-5 py-3 rounded-lg shadow-sm flex items-baseline justify-between"
              className="card"
            >
              <span className="font-serif" style={{ color: CORES.fogo }}>{d.nome || "(sem nome)"}</span>
              <span className="text-xs" style={{ color: "#8A7A5C" }}>{cfg.subtituloLista(d)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function EditorDoc({ cliente, tipo, doc, rotuloVoltar, gerando, erro, onMudar, onGerar, onImprimir, onExcluir, onVoltar }) {
  const cfg = CONFIG_DOCS[tipo];
  const set = (campo) => (v) => onMudar({ ...doc, [campo]: v });
  const temConteudo = !!(doc[cfg.campoIndicador] || "").trim();
  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: "#B8860B", letterSpacing: 1 }}>
        ← {rotuloVoltar}
      </button>
      <div className="rounded-lg p-6 shadow-sm" className="card">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h2 className="font-serif text-lg" style={{ color: CORES.fogo }}>
            {doc.nome || `Nov${cfg.singular === "checklist" ? "o" : "a"} ${cfg.singular}`}
          </h2>
          <div className="flex gap-2">
            <BotaoPrimario onClick={onGerar} disabled={gerando || !doc.nome.trim()}>
              {gerando ? "Gerando..." : temConteudo ? "Gerar novamente" : "Gerar com IA"}
            </BotaoPrimario>
            {temConteudo && <BotaoContorno onClick={onImprimir}>Exportar PDF</BotaoContorno>}
          </div>
        </div>

        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && (
          <>
            {cfg.camposBase.map(([campo, rotulo, area, linhas, placeholder]) => (
              area ? (
                <label key={campo} className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>{rotulo}</span><textarea rows={linhas} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} placeholder={placeholder} value={doc[campo] || ""} onChange={(e) => set(campo)(e.target.value)} /></label>
              ) : (
                <InputField key={campo} label={rotulo} value={doc[campo] || ""} onChange={set(campo)} placeholder={placeholder} />
              )
            ))}
            {cfg.camposGerados.map(([campo, rotulo, area, linhas]) => (
              area ? (
                <label key={campo} className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>{rotulo}</span><textarea rows={linhas} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} value={doc[campo] || ""} onChange={(e) => set(campo)(e.target.value)} /></label>
              ) : (
                <InputField key={campo} label={rotulo} value={doc[campo] || ""} onChange={set(campo)} />
              )
            ))}
            <button onClick={onExcluir} className="text-xs underline" style={{ color: "#8A3A2E" }}>
              Excluir {cfg.singular}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const emLinhasDoc = (t) => (t || "").split("\n").map((x) => x.trim()).filter(Boolean);

function ImpressaoPolitica({ cliente, doc }) {
  if (!doc || !doc.diretrizes) return null;
  const diretrizes = emLinhasDoc(doc.diretrizes);
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "#2A1218" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="text-xs uppercase tracking-widest" style={{ color: CORES.dourado }}>Política interna</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{doc.nome}</div>
        <div className="text-sm mt-1" style={{ color: "#6B5D42" }}>{cliente.negocio} · {cliente.segmento}</div>
      </div>
      {doc.escopo && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Escopo</div>
          <p className="text-sm">{doc.escopo}</p>
        </div>
      )}
      <div className="mb-5">
        <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Diretrizes</div>
        <ol className="text-sm list-decimal pl-5">
          {diretrizes.map((d, i) => <li key={i} className="mb-0.5">{d}</li>)}
        </ol>
      </div>
      {doc.responsabilidades && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Responsabilidades</div>
          <p className="text-sm">{doc.responsabilidades}</p>
        </div>
      )}
      {doc.vigencia && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Vigência e revisão</div>
          <p className="text-sm">{doc.vigencia}</p>
        </div>
      )}
      <RodapeImpressao />
    </div>
  );
}

function ImpressaoChecklist({ cliente, doc }) {
  if (!doc || !doc.itens) return null;
  const itens = emLinhasDoc(doc.itens);
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "#2A1218" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="text-xs uppercase tracking-widest" style={{ color: CORES.dourado }}>Checklist</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{doc.nome}</div>
        <div className="text-sm mt-1" style={{ color: "#6B5D42" }}>
          {cliente.negocio}
          {doc.setor ? ` · Setor: ${doc.setor}` : ""}
          {doc.frequencia ? ` · ${doc.frequencia}` : ""}
        </div>
      </div>
      <table className="w-full text-sm border-collapse mb-8">
        <tbody>
          {itens.map((item, i) => (
            <tr key={i}>
              <td className="border px-3 py-2 w-10 text-center" style={{ borderColor: "#D9914F" }}>
                <span className="inline-block w-4 h-4 border-2 align-middle" style={{ borderColor: CORES.fogo }} />
              </td>
              <td className="border px-3 py-2" style={{ borderColor: "#D9914F" }}>{item}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-10 text-sm mb-2">
        <div className="flex-1 border-t pt-1" style={{ borderColor: "#2A1218" }}>Executado por</div>
        <div className="w-40 border-t pt-1" style={{ borderColor: "#2A1218" }}>Data / hora</div>
      </div>
      <RodapeImpressao />
    </div>
  );
}

function ImpressaoAta({ cliente, doc }) {
  if (!doc || !doc.resumo) return null;
  const decisoes = emLinhasDoc(doc.decisoes);
  const acoes = emLinhasDoc(doc.acoes);
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "#2A1218" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="text-xs uppercase tracking-widest" style={{ color: CORES.dourado }}>Ata de reunião</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{doc.nome}</div>
        <div className="text-sm mt-1" style={{ color: "#6B5D42" }}>
          {cliente.negocio}
          {doc.data ? ` · ${doc.data}` : ""}
        </div>
        {doc.participantes && (
          <div className="text-sm mt-1" style={{ color: "#6B5D42" }}>Participantes: {doc.participantes}</div>
        )}
      </div>
      <div className="mb-5">
        <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Resumo</div>
        <p className="text-sm whitespace-pre-line">{doc.resumo}</p>
      </div>
      {decisoes.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Decisões</div>
          <ul className="text-sm list-disc pl-5">
            {decisoes.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </div>
      )}
      {acoes.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Ações acordadas</div>
          <ul className="text-sm list-disc pl-5">
            {acoes.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}
      <RodapeImpressao />
    </div>
  );
}

// ─── Módulo: Temperamentos ──────────────────────────────────────

function pessoaVazia() {
  return {
    id: uid(),
    nome: "",
    cargo: "",
    obs: "",
    dominante: "",
    secundario: "",
    justificativa: "",
    forcas: "",
    riscos: "",
    lideranca: "",
    adequacao: "",
    contratante: false,
    abordagem: "",
    respostas: {},
  };
}

function SeloTemperamento({ chave, pequeno }) {
  if (!chave || !TEMPERAMENTOS[chave]) return null;
  const t = TEMPERAMENTOS[chave];
  return (
    <span
      className={`inline-block rounded-full font-semibold ${pequeno ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"}`}
      style={{ background: t.fundo, color: t.cor }}
    >
      {t.rotulo}
    </span>
  );
}

function ListaPessoas({ cliente, pessoas, onAbrir, onNova, onVoltar }) {
  const contagem = {};
  for (const p of pessoas) {
    if (p.dominante) contagem[p.dominante] = (contagem[p.dominante] || 0) + 1;
  }
  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: "#B8860B", letterSpacing: 1 }}>
        ← {cliente.negocio}
      </button>
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="font-serif text-xl" style={{ color: CORES.fogo }}>Temperamentos</h2>
        <BotaoPrimario onClick={onNova}>+ Nova pessoa</BotaoPrimario>
      </div>
      <p className="text-xs mb-4" style={{ color: "#8A7A5C" }}>
        O Chapéu Seletor da casa: mapa das pessoas-chave pela ciência dos temperamentos — classificação, leitura pessoa × cargo e orientação de liderança.
      </p>

      {pessoas.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-5">
          {Object.entries(TEMPERAMENTOS).map(([chave, t]) => (
            <div key={chave} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: t.fundo, color: t.cor }}>
              {t.rotulo}: {contagem[chave] || 0}
            </div>
          ))}
        </div>
      )}

      {pessoas.length === 0 ? (
        <div className="text-center py-16 rounded-lg" style={{ background: CORES.papel, border: "1px dashed #D9914F" }}>
          <p className="text-sm" style={{ color: "#8A7A5C" }}>
            Ninguém mapeado ainda. Adicione uma pessoa-chave, descreva o que você observou dela, e classifique — ou deixe a IA sugerir a partir das suas observações.
          </p>
        </div>
      ) : (
        <div className="grid gap-2">
          {pessoas.map((p) => (
            <button
              key={p.id}
              onClick={() => onAbrir(p.id)}
              className="objeto text-left px-5 py-3 rounded-lg shadow-sm flex items-center justify-between gap-2 flex-wrap"
              className="card"
            >
              <span>
                <span className="font-serif" style={{ color: CORES.fogo }}>{p.nome || "(sem nome)"}</span>
                {p.cargo && <span className="text-xs ml-2" style={{ color: "#8A7A5C" }}>{p.cargo}</span>}
                {p.contratante && (
                  <span className="text-xs ml-2 px-2 py-0.5 rounded-full font-semibold" style={{ background: "#F5EDD9", color: CORES.dourado }}>
                    contratante
                  </span>
                )}
              </span>
              <span className="flex gap-1.5 items-center">
                <SeloTemperamento chave={p.dominante} pequeno />
                {p.secundario && <span className="text-xs" style={{ color: "#A89878" }}>+ <SeloTemperamento chave={p.secundario} pequeno /></span>}
                {!p.dominante && <span className="text-xs" style={{ color: "#A89878" }}>não classificado</span>}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const CAMPOS_PESSOA_GERADOS = [
  ["justificativa", "Justificativa da classificação", 2],
  ["forcas", "Forças no cargo (uma por linha)", 3],
  ["riscos", "Riscos e atritos (um por linha)", 3],
  ["lideranca", "Como liderar e se comunicar", 3],
  ["adequacao", "Adequação temperamento × cargo", 2],
];

function EditorPessoa({ cliente, pessoa, gerando, erro, onMudar, onGerar, onImprimir, onExcluir, onVoltar }) {
  const set = (campo) => (v) => onMudar({ ...pessoa, [campo]: v });
  const selectTemp = (campo, rotulo) => (
    <label className="block mb-4">
      <span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>
        {rotulo}
      </span>
      <select
        className="w-full px-3 py-2 rounded border bg-white text-sm outline-none"
        style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }}
        value={pessoa[campo] || ""}
        onChange={(e) => set(campo)(e.target.value)}
      >
        <option value="">— deixar a IA sugerir —</option>
        {Object.entries(TEMPERAMENTOS).map(([chave, t]) => (
          <option key={chave} value={chave}>{t.rotulo}</option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: "#B8860B", letterSpacing: 1 }}>
        ← Temperamentos · {cliente.negocio}
      </button>
      <div className="rounded-lg p-6 shadow-sm" className="card">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h2 className="font-serif text-lg flex items-center gap-2" style={{ color: CORES.fogo }}>
            {pessoa.nome || "Nova pessoa"} <SeloTemperamento chave={pessoa.dominante} pequeno />
          </h2>
          <div className="flex gap-2">
            <BotaoPrimario onClick={onGerar} disabled={gerando || !pessoa.nome.trim()}>
              {gerando ? "Analisando..." : pessoa.justificativa ? "Analisar novamente" : "Analisar com IA"}
            </BotaoPrimario>
            {pessoa.justificativa && <BotaoContorno onClick={onImprimir}>Exportar ficha PDF</BotaoContorno>}
          </div>
        </div>

        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && (
          <>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <InputField label="Nome ou apelido" value={pessoa.nome} onChange={set("nome")} placeholder="Ex.: João (líder do salão)" />
              <InputField label="Cargo/função" value={pessoa.cargo} onChange={set("cargo")} placeholder="Ex.: Líder de Salão" />
            </div>
            <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Observações — comportamentos, reações, padrões</span><textarea rows={4} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} placeholder="Ex.: fala rápido e alto, resolve conflito na hora mas atropela; detesta rotina de fechamento; o time gosta dele mas reclama de instabilidade" value={pessoa.obs} onChange={(e) => set("obs")(e.target.value)} /></label>

            <div className="mb-4 rounded-lg p-4" style={{ background: "white", border: "1px dashed #E97F3855" }}>
              <div className="flex items-baseline justify-between mb-1">
                <div className="label" style={{ color: CORES.dourado }}>
                  Formulário de observação (opcional)
                </div>
                {Object.keys(pessoa.respostas || {}).length > 0 && (
                  <span className="text-xs" style={{ color: "#A89878" }}>
                    {Object.keys(pessoa.respostas || {}).length}/{FORM_TEMPERAMENTO.length} respondidas
                  </span>
                )}
              </div>
              <p className="text-xs mb-3" style={{ color: "#8A7A5C" }}>
                Marque o que você observou na pessoa. A contagem sugere a classificação — seu olho continua sendo o juiz.
              </p>
              {FORM_TEMPERAMENTO.map((q, i) => {
                const marcada = (pessoa.respostas || {})[i];
                return (
                  <div key={i} className="mb-2">
                    <div className="text-xs mb-1" style={{ color: "#6B5D42" }}>{q.pergunta}</div>
                    <div className="flex gap-1.5 flex-wrap">
                      {q.opcoes.map(([texto, chave]) => (
                        <button
                          key={chave}
                          onClick={() => {
                            const respostas = { ...(pessoa.respostas || {}) };
                            if (respostas[i] === chave) delete respostas[i];
                            else respostas[i] = chave;
                            onMudar({ ...pessoa, respostas });
                          }}
                          className="px-2 py-1 text-xs rounded border"
                          style={
                            marcada === chave
                              ? { background: TEMPERAMENTOS[chave].fundo, borderColor: TEMPERAMENTOS[chave].cor, color: TEMPERAMENTOS[chave].cor, fontWeight: 600 }
                              : { background: "white", borderColor: "#E0D5BC", color: "#8A7A5C" }
                          }
                        >
                          {texto}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              {Object.keys(pessoa.respostas || {}).length >= 4 && (() => {
                const { contagem, dominante, secundario } = contarTemperamentos(pessoa.respostas);
                return (
                  <div className="mt-3 pt-3 border-t flex items-center gap-3 flex-wrap" style={{ borderColor: "#EFE8D6" }}>
                    <span className="text-xs" style={{ color: "#6B5D42" }}>
                      Contagem:{" "}
                      {Object.entries(TEMPERAMENTOS).map(([chave, t]) => `${t.rotulo} ${contagem[chave]}`).join(" · ")}
                    </span>
                    {dominante && (
                      <BotaoContorno onClick={() => onMudar({ ...pessoa, dominante, secundario: secundario || pessoa.secundario })}>
                        Aplicar sugestão: {TEMPERAMENTOS[dominante].rotulo}
                        {secundario ? ` + ${TEMPERAMENTOS[secundario].rotulo}` : ""}
                      </BotaoContorno>
                    )}
                  </div>
                );
              })()}
            </div>
            <div className="grid sm:grid-cols-2 gap-x-4">
              {selectTemp("dominante", "Temperamento dominante")}
              {selectTemp("secundario", "Temperamento secundário")}
            </div>
            <label className="flex items-center gap-2 mb-4 text-sm cursor-pointer" style={{ color: CORES.fogoEscuro }}>
              <input
                type="checkbox"
                checked={!!pessoa.contratante}
                onChange={(e) => set("contratante")(e.target.checked)}
              />
              É o contratante/dono — orientar como conduzir a consultoria com essa pessoa
            </label>
            {pessoa.contratante && (
              <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Como conduzir a consultoria com essa pessoa (uso interno — não sai na ficha PDF)</span><textarea rows={4} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} value={pessoa.abordagem} onChange={(e) => set("abordagem")(e.target.value)} /></label>
            )}
            {CAMPOS_PESSOA_GERADOS.map(([campo, rotulo, linhas]) => (
              <label key={campo} className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>{rotulo}</span><textarea rows={linhas} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} value={pessoa[campo]} onChange={(e) => set(campo)(e.target.value)} /></label>
            ))}
            <button onClick={onExcluir} className="text-xs underline" style={{ color: "#8A3A2E" }}>
              Excluir pessoa
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ImpressaoPessoa({ cliente, pessoa }) {
  if (!pessoa || !pessoa.justificativa) return null;
  const forcas = emLinhasDoc(pessoa.forcas);
  const riscos = emLinhasDoc(pessoa.riscos);
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "#2A1218" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="text-xs uppercase tracking-widest" style={{ color: CORES.dourado }}>Ficha de Temperamento · Confidencial — uso da liderança</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{pessoa.nome}</div>
        <div className="text-sm mt-1" style={{ color: "#6B5D42" }}>
          {cliente.negocio}{pessoa.cargo ? ` · ${pessoa.cargo}` : ""}
        </div>
        <div className="mt-2 text-sm">
          Dominante: <strong>{TEMPERAMENTOS[pessoa.dominante] ? TEMPERAMENTOS[pessoa.dominante].rotulo : "—"}</strong>
          {pessoa.secundario && TEMPERAMENTOS[pessoa.secundario] && (
            <> · Secundário: <strong>{TEMPERAMENTOS[pessoa.secundario].rotulo}</strong></>
          )}
        </div>
      </div>

      <div className="mb-5">
        <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Leitura</div>
        <p className="text-sm">{pessoa.justificativa}</p>
      </div>

      {forcas.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Forças no cargo</div>
          <ul className="text-sm list-disc pl-5">
            {forcas.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
      )}

      {riscos.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Riscos e atritos</div>
          <ul className="text-sm list-disc pl-5">
            {riscos.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      )}

      {pessoa.lideranca && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Como liderar e se comunicar</div>
          <p className="text-sm">{pessoa.lideranca}</p>
        </div>
      )}

      {pessoa.adequacao && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Adequação temperamento × cargo</div>
          <p className="text-sm">{pessoa.adequacao}</p>
        </div>
      )}

      <RodapeImpressao />
    </div>
  );
}

// ─── Módulo: Diagnóstico de Maturidade ──────────────────────────

function diagVazio() {
  return {
    id: uid(),
    data: new Date().toLocaleDateString("pt-BR"),
    rotulo: "",
    notas: {},
    leitura: "",
    criticos: "",
    prioridades: "",
  };
}

function RadarMaturidade({ notas, tamanho, framework: fw }) {
  const FR = fw || FRAMEWORK_DIAG;
  const T = tamanho || 300;
  const cx = T / 2;
  const cy = T / 2;
  const raio = T / 2 - 52;
  const n = FRAMEWORK_DIAG.length;
  const ponto = (idx, fator) => {
    const ang = (Math.PI * 2 * idx) / n - Math.PI / 2;
    return [cx + Math.cos(ang) * raio * fator, cy + Math.sin(ang) * raio * fator];
  };
  const aneis = [0.33, 0.66, 1];
  const valores = FR.map((_, aIdx) => {
    const pct = percentualArea(notas, aIdx);
    return pct === null ? 0 : pct / 100;
  });
  const poligono = valores.map((v, i) => ponto(i, Math.max(v, 0.02)).join(",")).join(" ");

  return (
    <svg width={T} height={T} viewBox={`0 0 ${T} ${T}`}>
      {aneis.map((f) => (
        <polygon
          key={f}
          points={FR.map((_, i) => ponto(i, f).join(",")).join(" ")}
          fill="none"
          stroke="#E0D5BC"
          strokeWidth="1"
        />
      ))}
      {FR.map((_, i) => {
        const [x, y] = ponto(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#E0D5BC" strokeWidth="1" />;
      })}
      <polygon points={poligono} fill="rgba(92,26,43,0.18)" stroke={CORES.fogo} strokeWidth="2" />
      {valores.map((v, i) => {
        const [x, y] = ponto(i, Math.max(v, 0.02));
        return <circle key={i} cx={x} cy={y} r="3.5" fill={CORES.fogo} />;
      })}
      {FR.map((a, i) => {
        const [x, y] = ponto(i, 1.22);
        const pct = percentualArea(notas, i, FR);
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            fontSize="10"
            fontFamily="Georgia, serif"
            fill={CORES.fogoEscuro}
          >
            <tspan x={x} dy="0">{a.area}</tspan>
            <tspan x={x} dy="12" fontWeight="bold" fill={CORES.dourado}>
              {pct === null ? "—" : `${pct}%`}
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}

function ListaDiagnosticos({ cliente, diagnosticos, titulo, subtitulo, framework: fw, onAbrir, onNovo, onReavaliar, onVoltar }) {
  const FR = fw || FRAMEWORK_DIAG;
  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: "#B8860B", letterSpacing: 1 }}>
        ← {cliente.negocio}
      </button>
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="font-serif text-xl" style={{ color: CORES.fogo }}>{titulo || "Diagnóstico de Maturidade"}</h2>
        <BotaoPrimario onClick={onNovo}>+ Novo diagnóstico</BotaoPrimario>
      </div>
      <p className="text-xs mb-5" style={{ color: "#8A7A5C" }}>
        {subtitulo || "Os N.O.M.s do negócio: em que nível está cada matéria. Avalie 6 áreas e 24 critérios; refaça ao longo do engajamento — cada diagnóstico fica datado e a comparação vira o antes/depois da consultoria."}
      </p>
      {diagnosticos.length === 0 ? (
        <div className="text-center py-16 rounded-lg" style={{ background: CORES.papel, border: "1px dashed #D9914F" }}>
          <p className="text-sm" style={{ color: "#8A7A5C" }}>
            Nenhum diagnóstico ainda. Faça o primeiro na fase de briefing — ele justifica a proposta e vira a régua de resultado no encerramento.
          </p>
        </div>
      ) : (
        <div className="grid gap-2">
          {diagnosticos.map((d) => {
            const medias = FR.map((_, i) => percentualArea(d.notas, i, FR)).filter((x) => x !== null);
            const geral = medias.length ? Math.round(medias.reduce((s, x) => s + x, 0) / medias.length) : null;
            return (
              <button
                key={d.id}
                onClick={() => onAbrir(d.id)}
                className="objeto text-left px-5 py-3 rounded-lg shadow-sm flex items-baseline justify-between"
                className="card"
              >
                <span className="font-serif" style={{ color: CORES.fogo }}>
                  {d.rotulo || `Diagnóstico de ${d.data}`}
                </span>
                <span className="text-xs flex items-center gap-2" style={{ color: "#8A7A5C" }}>
                  {d.data} · maturidade geral: {geral === null ? "não avaliada" : `${geral}%`}
                  <span
                    className="underline"
                    style={{ color: CORES.dourado }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onReavaliar(d);
                    }}
                    title="Cria um novo diagnóstico com estas notas copiadas — ajuste só o que mudou"
                  >
                    reavaliar →
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EditorDiagnostico({ cliente, diag, titulo, framework: fw, gerando, erro, onMudar, onGerarLeitura, onCriarFrentes, onImprimir, onExcluir, onVoltar }) {
  const FR = fw || FRAMEWORK_DIAG;
  const respondidas = Object.values(diag.notas).filter((v) => v !== null && v !== "").length;
  const total = FRAMEWORK_DIAG.reduce((s, a) => s + a.criterios.length, 0);
  const areasCriticas = FRAMEWORK_DIAG.filter((_, i) => {
    const p = percentualArea(diag.notas, i, FR);
    return p !== null && p < 50;
  });

  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: "#B8860B", letterSpacing: 1 }}>
        ← Diagnósticos · {cliente.negocio}
      </button>
      <div className="rounded-lg p-6 shadow-sm" className="card">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h2 className="font-serif text-lg" style={{ color: CORES.fogo }}>
            {diag.rotulo || `Diagnóstico de ${diag.data}`}
          </h2>
          <div className="flex gap-2 flex-wrap">
            <BotaoPrimario onClick={onGerarLeitura} disabled={gerando || respondidas === 0}>
              {gerando ? "Gerando..." : diag.leitura ? "Gerar leitura novamente" : "Gerar leitura com IA"}
            </BotaoPrimario>
            {respondidas > 0 && <BotaoContorno onClick={onImprimir}>Exportar PDF</BotaoContorno>}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-x-4">
          <InputField label="Rótulo (opcional)" value={diag.rotulo} onChange={(v) => onMudar({ ...diag, rotulo: v })} placeholder="Ex.: Diagnóstico inicial" />
          <InputField label="Data" value={diag.data} onChange={(v) => onMudar({ ...diag, data: v })} />
        </div>

        <div className="text-xs mb-3" style={{ color: "#A89878" }}>
          {respondidas}/{total} critérios avaliados · escala: {ESCALA_DIAG.join(" → ")}
        </div>

        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && (
          <>
            {FR.map((a, aIdx) => {
              const pct = percentualArea(diag.notas, aIdx, FR);
              return (
                <div key={a.area} className="mb-5">
                  <div className="flex items-baseline justify-between mb-1">
                    <div className="label" style={{ color: CORES.dourado }}>
                      {a.area}
                    </div>
                    <div className="text-xs font-bold" style={{ color: pct !== null && pct < 50 ? "#8A3A2E" : CORES.fogo }}>
                      {pct === null ? "—" : `${pct}%`}
                    </div>
                  </div>
                  {a.criterios.map((crit, cIdx) => {
                    const chave = chaveNota(aIdx, cIdx);
                    const valor = diag.notas[chave];
                    return (
                      <div key={chave} className="flex items-center gap-2 py-1.5 border-b" style={{ borderColor: "#EFE8D6" }}>
                        <span className="flex-1 text-sm" style={{ color: CORES.fogoEscuro }}>{crit}</span>
                        <select
                          className="px-2 py-1 text-xs rounded border bg-white"
                          style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                          value={valor === undefined || valor === null ? "" : valor}
                          onChange={(e) =>
                            onMudar({ ...diag, notas: { ...diag.notas, [chave]: e.target.value === "" ? null : Number(e.target.value) } })
                          }
                        >
                          <option value="">—</option>
                          {ESCALA_DIAG.map((rotulo, n) => (
                            <option key={n} value={n}>{n} · {rotulo}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {respondidas > 0 && (
              <div className="flex justify-center my-6">
                <RadarMaturidade notas={diag.notas} framework={FR} />
              </div>
            )}

            {areasCriticas.length > 0 && (
              <div className="mb-5 p-4 rounded-lg" style={{ background: "#F0DCD2" }}>
                <div className="text-sm mb-2" style={{ color: "#8A3A2E" }}>
                  Áreas abaixo de 50%: {areasCriticas.map((a) => a.area).join(", ")}.
                </div>
                {onCriarFrentes && (
                  <BotaoContorno onClick={() => onCriarFrentes(areasCriticas.map((a) => a.area))}>
                    Criar frentes destas áreas no Plano de Ação
                  </BotaoContorno>
                )}
              </div>
            )}

            {(diag.leitura || diag.criticos || diag.prioridades) && (
              <>
                <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Leitura geral</span><textarea rows={3} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} value={diag.leitura} onChange={(e) => onMudar({ ...diag, leitura: e.target.value })} /></label>
                <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Pontos críticos (um por linha)</span><textarea rows={3} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} value={diag.criticos} onChange={(e) => onMudar({ ...diag, criticos: e.target.value })} /></label>
                <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Prioridades de ação (uma por linha)</span><textarea rows={4} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} value={diag.prioridades} onChange={(e) => onMudar({ ...diag, prioridades: e.target.value })} /></label>
              </>
            )}

            <button onClick={onExcluir} className="text-xs underline" style={{ color: "#8A3A2E" }}>
              Excluir diagnóstico
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ImpressaoDiagnostico({ cliente, diag, titulo, framework: fw }) {
  const FR = fw || FRAMEWORK_DIAG;
  if (!diag) return null;
  const respondidas = Object.values(diag.notas).filter((v) => v !== null && v !== "").length;
  if (respondidas === 0) return null;
  const criticos = emLinhasDoc(diag.criticos);
  const prioridades = emLinhasDoc(diag.prioridades);
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "#2A1218" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="text-xs uppercase tracking-widest" style={{ color: CORES.dourado }}>{titulo || "Diagnóstico de Maturidade"}</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{diag.rotulo || cliente.negocio}</div>
        <div className="text-sm mt-1" style={{ color: "#6B5D42" }}>{cliente.negocio} · {diag.data}</div>
      </div>

      <div className="flex justify-center mb-6">
        <RadarMaturidade notas={diag.notas} tamanho={340} framework={FR} />
      </div>

      {FR.map((a, aIdx) => {
        const pct = percentualArea(diag.notas, aIdx, FR);
        if (pct === null) return null;
        return (
          <div key={a.area} className="mb-4">
            <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>
              {a.area} — {pct}%
            </div>
            <table className="w-full text-sm border-collapse">
              <tbody>
                {a.criterios.map((crit, cIdx) => {
                  const n = diag.notas[chaveNota(aIdx, cIdx)];
                  if (n === undefined || n === null || n === "") return null;
                  return (
                    <tr key={cIdx}>
                      <td className="border px-3 py-1" style={{ borderColor: "#D9914F" }}>{crit}</td>
                      <td className="border px-3 py-1 w-32 font-semibold" style={{ borderColor: "#D9914F", color: Number(n) < 2 ? "#8A3A2E" : "#4F6B3A" }}>
                        {ESCALA_DIAG[Number(n)]}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}

      {diag.leitura && (
        <div className="mb-5 mt-6">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Leitura geral</div>
          <p className="text-sm whitespace-pre-line">{diag.leitura}</p>
        </div>
      )}
      {criticos.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: "#8A3A2E" }}>Pontos críticos</div>
          <ul className="text-sm list-disc pl-5">
            {criticos.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      )}
      {prioridades.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Prioridades de ação</div>
          <ol className="text-sm list-decimal pl-5">
            {prioridades.map((p, i) => <li key={i} className="mb-0.5">{p}</li>)}
          </ol>
        </div>
      )}

      <RodapeImpressao />
    </div>
  );
}

// ─── Módulo: Proposta Comercial ─────────────────────────────────

const STATUS_PROPOSTA = {
  rascunho: { rotulo: "Rascunho", cor: "#8A7A5C", fundo: "#F5EDD9" },
  enviada: { rotulo: "Enviada", cor: "#9A6A2F", fundo: "#F5E6C8" },
  aceita: { rotulo: "Aceita ✓", cor: "#4F6B3A", fundo: "#E3EBD8" },
  recusada: { rotulo: "Recusada", cor: "#8A3A2E", fundo: "#F0DCD2" },
};

function propostaVazia() {
  return {
    id: uid(),
    data: new Date().toLocaleDateString("pt-BR"),
    status: "rascunho",
    rotulo: "",
    duracao: "",
    investimento: "",
    condicoesPagamento: "",
    validade: "",
    obs: "",
    apresentacao: "",
    objetivo: "",
    fases: "",
    entregaveis: "",
    metodologia: "",
    condicoesGerais: "",
  };
}

const CAMPOS_PROPOSTA_PARAMS = [
  ["rotulo", "Rótulo interno (opcional)", false, 1, "Ex.: Proposta v1"],
  ["duracao", "Duração prevista", false, 1, "Ex.: 10 semanas"],
  ["investimento", "Investimento", false, 1, "Ex.: R$ 9.000,00"],
  ["condicoesPagamento", "Condições de pagamento", false, 1, "Ex.: entrada + 2 parcelas mensais"],
  ["validade", "Validade da proposta", false, 1, "Ex.: 15 dias"],
  ["obs", "Observações para a IA (opcional)", true, 2, "Ex.: enfatizar a frente de pessoas; cliente sensível a preço"],
];

const CAMPOS_PROPOSTA_GERADOS = [
  ["apresentacao", "Apresentação", 3],
  ["objetivo", "Objetivo", 2],
  ["fases", "Fases (uma por linha)", 4],
  ["entregaveis", "Entregáveis (um por linha)", 6],
  ["metodologia", "Metodologia", 3],
  ["condicoesGerais", "Condições gerais", 3],
];

function ListaPropostas({ cliente, propostas, onAbrir, onNova, onVoltar }) {
  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: "#B8860B", letterSpacing: 1 }}>
        ← {cliente.negocio}
      </button>
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="font-serif text-xl" style={{ color: CORES.fogo }}>Propostas Comerciais</h2>
        <BotaoPrimario onClick={onNova}>+ Nova proposta</BotaoPrimario>
      </div>
      <p className="text-xs mb-5" style={{ color: "#8A7A5C" }}>
        A carta de Hogwarts: o convite que muda tudo. Nasce do briefing e do diagnóstico — e o tom se ajusta ao temperamento do contratante, se mapeado.
      </p>
      {propostas.length === 0 ? (
        <div className="text-center py-16 rounded-lg" style={{ background: CORES.papel, border: "1px dashed #D9914F" }}>
          <p className="text-sm" style={{ color: "#8A7A5C" }}>
            Nenhuma proposta ainda. Preencha os parâmetros (duração, investimento, condições) e gere — o texto vem pronto para sua revisão.
          </p>
        </div>
      ) : (
        <div className="grid gap-2">
          {propostas.map((p) => (
            <button
              key={p.id}
              onClick={() => onAbrir(p.id)}
              className="objeto text-left px-5 py-3 rounded-lg shadow-sm flex items-baseline justify-between"
              className="card"
            >
              <span className="font-serif" style={{ color: CORES.fogo }}>
                {p.rotulo || `Proposta de ${p.data}`}
              </span>
              <span className="text-xs flex items-center gap-2" style={{ color: "#8A7A5C" }}>
                {p.data}{p.investimento ? ` · ${p.investimento}` : ""}
                <span
                  className="px-1.5 py-0.5 rounded font-semibold"
                  style={{
                    background: (STATUS_PROPOSTA[p.status] || STATUS_PROPOSTA.rascunho).fundo,
                    color: (STATUS_PROPOSTA[p.status] || STATUS_PROPOSTA.rascunho).cor,
                  }}
                >
                  {(STATUS_PROPOSTA[p.status] || STATUS_PROPOSTA.rascunho).rotulo}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function EditorProposta({ cliente, prop, gerando, erro, frentes, semanasPadrao, numEncontros, precificacao, onMudarPrecificacao, onMudar, onGerar, onGerarMetas, onImprimir, onExcluir, onVoltar }) {
  const ehPessoaProp = cliente.tipo === "pessoa";
  const set = (campo) => (v) => onMudar({ ...prop, [campo]: v });
  const numFrentes = (frentes || []).length;
  const semanasDaProposta = (() => {
    const m = String(prop.duracao || "").match(/\d+/);
    if (m) return Number(m[0]);
    return Number(semanasPadrao) || 0;
  })();
  const vBase = parseValorBR(precificacao.base);
  const vFrente = parseValorBR(precificacao.porFrente);
  const vSemana = parseValorBR(precificacao.porSemana);
  const vEncontro = parseValorBR(precificacao.porEncontro);
  const totalCalculado = ehPessoaProp
    ? (numEncontros || 0) * vEncontro
    : vBase + numFrentes * vFrente + semanasDaProposta * vSemana;
  const totalArredondado = totalCalculado > 0 ? Math.ceil(totalCalculado / 100) * 100 : 0;
  const podeCalcular = ehPessoaProp
    ? totalArredondado > 0 && (numEncontros || 0) > 0
    : totalArredondado > 0 && (numFrentes > 0 || semanasDaProposta > 0 || vBase > 0);
  const setP = (campo) => (e) => onMudarPrecificacao({ ...precificacao, [campo]: e.target.value });
  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: "#B8860B", letterSpacing: 1 }}>
        ← Propostas · {cliente.negocio}
      </button>
      <div className="rounded-lg p-6 shadow-sm" className="card">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h2 className="font-serif text-lg" style={{ color: CORES.fogo }}>
            {prop.rotulo || `Proposta de ${prop.data}`}
          </h2>
          <div className="flex gap-2 items-center">
            <select
              className="px-2 py-1 text-xs rounded border font-semibold"
              style={{
                borderColor: (STATUS_PROPOSTA[prop.status] || STATUS_PROPOSTA.rascunho).cor,
                background: (STATUS_PROPOSTA[prop.status] || STATUS_PROPOSTA.rascunho).fundo,
                color: (STATUS_PROPOSTA[prop.status] || STATUS_PROPOSTA.rascunho).cor,
              }}
              value={prop.status || "rascunho"}
              onChange={(e) => onMudar({ ...prop, status: e.target.value })}
              title="Status da proposta — 'Aceita' avança o Relógio para Em andamento"
            >
              {Object.entries(STATUS_PROPOSTA).map(([chave, s]) => (
                <option key={chave} value={chave}>{s.rotulo}</option>
              ))}
            </select>
            <BotaoPrimario onClick={onGerar} disabled={gerando}>
              {gerando ? "Gerando..." : prop.apresentacao ? "Gerar texto novamente" : "Gerar texto com IA"}
            </BotaoPrimario>
            {prop.apresentacao && <BotaoContorno onClick={onImprimir}>Exportar PDF</BotaoContorno>}
          </div>
        </div>

        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && (
          <>
            <div className="mb-4 rounded-lg p-4" style={{ background: "white", border: "1px dashed #E97F3855" }}>
              <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: CORES.dourado }}>
                Precificação automática
              </div>
              <p className="text-xs mb-3" style={{ color: "#8A7A5C" }}>
                Seus parâmetros (valem para todas as propostas, de todos os clientes) aplicados às frentes deste briefing. A IA nunca decide preço — a conta é sua, o app só faz a matemática.
              </p>
              {ehPessoaProp ? (
                <div className="grid sm:grid-cols-3 gap-2 mb-2">
                  <div>
                    <div className="text-xs mb-0.5" style={{ color: "#6B5D42" }}>Valor por encontro de mentoria</div>
                    <input className="w-full px-2 py-1 text-sm rounded border bg-white" style={{ borderColor: "#E0D5BC" }} placeholder="Ex.: 400" value={precificacao.porEncontro || ""} onChange={setP("porEncontro")} />
                  </div>
                </div>
              ) : (
              <div className="grid sm:grid-cols-3 gap-2 mb-2">
                <div>
                  <div className="text-xs mb-0.5" style={{ color: "#6B5D42" }}>Valor base do engajamento</div>
                  <input className="w-full px-2 py-1 text-sm rounded border bg-white" style={{ borderColor: "#E0D5BC" }} placeholder="Ex.: 2.000" value={precificacao.base} onChange={setP("base")} />
                </div>
                <div>
                  <div className="text-xs mb-0.5" style={{ color: "#6B5D42" }}>Valor por frente</div>
                  <input className="w-full px-2 py-1 text-sm rounded border bg-white" style={{ borderColor: "#E0D5BC" }} placeholder="Ex.: 1.500" value={precificacao.porFrente} onChange={setP("porFrente")} />
                </div>
                <div>
                  <div className="text-xs mb-0.5" style={{ color: "#6B5D42" }}>Valor por semana de condução</div>
                  <input className="w-full px-2 py-1 text-sm rounded border bg-white" style={{ borderColor: "#E0D5BC" }} placeholder="Ex.: 300" value={precificacao.porSemana} onChange={setP("porSemana")} />
                </div>
              </div>
              )}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs" style={{ color: "#6B5D42" }}>
                  {ehPessoaProp
                    ? <>Jornada: <strong>{numEncontros || 0}</strong> encontro{(numEncontros || 0) === 1 ? "" : "s"} desenhado{(numEncontros || 0) === 1 ? "" : "s"}</>
                    : <>Este cliente: <strong>{numFrentes}</strong> frente{numFrentes === 1 ? "" : "s"} identificada{numFrentes === 1 ? "" : "s"}{" · "}<strong>{semanasDaProposta || "?"}</strong> semana{semanasDaProposta === 1 ? "" : "s"}</>}
                </span>
                {podeCalcular ? (
                  <BotaoContorno
                    onClick={() =>
                      onMudar({
                        ...prop,
                        investimento: formatarBR(totalArredondado),
                        memoriaCalculo: ehPessoaProp
                          ? `${numEncontros} encontro(s) × ${formatarBR(vEncontro)} = ${formatarBR(totalCalculado)}${totalArredondado !== totalCalculado ? ` (arredondado: ${formatarBR(totalArredondado)})` : ""}`
                          : `${formatarBR(vBase)} base + ${numFrentes} frente(s) × ${formatarBR(vFrente)} + ${semanasDaProposta} semana(s) × ${formatarBR(vSemana)} = ${formatarBR(totalCalculado)}${totalArredondado !== totalCalculado ? ` (arredondado: ${formatarBR(totalArredondado)})` : ""}`,
                      })
                    }
                  >
                    Calcular investimento: {formatarBR(totalArredondado)}
                  </BotaoContorno>
                ) : (
                  <span className="text-xs italic" style={{ color: "#A89878" }}>
                    {ehPessoaProp ? "Desenhe a jornada na Mentoria e preencha o valor por encontro." : `${numFrentes === 0 ? "Gere as frentes no Briefing & Plano para calcular por demanda. " : ""}Preencha seus parâmetros e a duração.`}
                  </span>
                )}
              </div>
              {prop.memoriaCalculo && (
                <div className="text-xs mt-2 pt-2 border-t" style={{ color: "#A89878", borderColor: "#EFE8D6" }}>
                  Memória de cálculo (interna, não sai no PDF): {prop.memoriaCalculo}
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-x-4">
              {(
                <div className="mb-4 p-3 rounded-lg" style={{ background: "#F5EDD9", border: "2px solid #D4AF37AA" }}>
                  <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                    <div className="label" style={{ color: "#9A6A2F" }}>
                      {ehPessoaProp ? "Metas do mentorado (fase Acordo)" : "Metas do engajamento (fase Acordo)"}
                    </div>
                    <button onClick={onGerarMetas} className="text-xs underline" style={{ color: CORES.dourado }} disabled={gerando}>
                      Sugerir metas com IA
                    </button>
                  </div>
                  <p className="text-xs mb-2" style={{ color: "#8A7A5C" }}>
                    {ehPessoaProp
                      ? "2-3 metas com objetivo + valor + prazo (ex.: delegar as decisões de compra até outubro). Verificadas no Relatório de Evolução."
                      : "2-3 metas pactuadas com objetivo + valor + prazo. Verificadas no Malfeito feito: batida, parcial ou não batida."}
                  </p>
                  {(prop.metas || []).map((m) => (
                    <div key={m.id} className="flex items-center gap-2 py-1">
                      <input
                        className="flex-1 px-2 py-1 text-sm rounded border bg-white"
                        style={{ borderColor: "#E0D5BC", color: CORES.fogoEscuro }}
                        placeholder={ehPessoaProp ? "Objetivo verificável (ex.: delegar as decisões de compra)" : "Objetivo com valor (ex.: reduzir pendências de CCT de 12 para 0)"}
                        value={m.objetivo}
                        onChange={(e) => onMudar({ ...prop, metas: prop.metas.map((x) => (x.id === m.id ? { ...x, objetivo: e.target.value } : x)) })}
                      />
                      <input
                        className="w-36 px-2 py-1 text-xs rounded border bg-white"
                        style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                        placeholder="Prazo"
                        value={m.prazo}
                        onChange={(e) => onMudar({ ...prop, metas: prop.metas.map((x) => (x.id === m.id ? { ...x, prazo: e.target.value } : x)) })}
                      />
                      <button onClick={() => onMudar({ ...prop, metas: prop.metas.filter((x) => x.id !== m.id) })} className="text-xs px-1" style={{ color: "#C0B091" }}>✕</button>
                    </div>
                  ))}
                  <button
                    onClick={() => onMudar({ ...prop, metas: [...(prop.metas || []), { id: uid(), objetivo: "", prazo: "" }] })}
                    className="text-xs mt-1"
                    style={{ color: CORES.dourado }}
                  >
                    + Meta
                  </button>
                </div>
              )}
              {CAMPOS_PROPOSTA_PARAMS.slice(0, 5).map(([campo, rotulo, area, linhas, placeholder]) => (
                area ? (
                  <label key={campo} className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>{rotulo}</span><textarea rows={linhas} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} placeholder={placeholder} value={prop[campo] || ""} onChange={(e) => set(campo)(e.target.value)} /></label>
                ) : (
                  <InputField key={campo} label={rotulo} value={prop[campo] || ""} onChange={set(campo)} placeholder={placeholder} />
                )
              ))}
            </div>
            {CAMPOS_PROPOSTA_PARAMS.slice(5).map(([campo, rotulo, area, linhas, placeholder]) => (
              area ? (
                <label key={campo} className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>{rotulo}</span><textarea rows={linhas} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} placeholder={placeholder} value={prop[campo] || ""} onChange={(e) => set(campo)(e.target.value)} /></label>
              ) : (
                <InputField key={campo} label={rotulo} value={prop[campo] || ""} onChange={set(campo)} placeholder={placeholder} />
              )
            ))}
            {CAMPOS_PROPOSTA_GERADOS.map(([campo, rotulo, linhas]) => (
              <label key={campo} className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>{rotulo}</span><textarea rows={linhas} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} value={prop[campo] || ""} onChange={(e) => set(campo)(e.target.value)} /></label>
            ))}
            <button onClick={onExcluir} className="text-xs underline" style={{ color: "#8A3A2E" }}>
              Excluir proposta
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ImpressaoProposta({ cliente, prop }) {
  if (!prop || !prop.apresentacao) return null;
  const fases = emLinhasDoc(prop.fases);
  const entregaveis = emLinhasDoc(prop.entregaveis);
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "#2A1218" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="text-xs uppercase tracking-widest" style={{ color: CORES.dourado }}>Proposta de Consultoria em Governança</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{cliente.negocio}</div>
        <div className="text-sm mt-1" style={{ color: "#6B5D42" }}>{prop.data}{prop.validade ? ` · Válida por ${prop.validade}` : ""}</div>
      </div>

      <div className="mb-5">
        <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Apresentação</div>
        <p className="text-sm whitespace-pre-line">{prop.apresentacao}</p>
      </div>

      {prop.objetivo && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Objetivo</div>
          <p className="text-sm">{prop.objetivo}</p>
        </div>
      )}

      {fases.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Fases do trabalho</div>
          <table className="w-full text-sm border-collapse">
            <tbody>
              {fases.map((f, i) => (
                <tr key={i}>
                  <td className="border px-3 py-2" style={{ borderColor: "#D9914F" }}>{f}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {entregaveis.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Entregáveis</div>
          <ul className="text-sm list-disc pl-5">
            {entregaveis.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      {prop.metodologia && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Metodologia</div>
          {(prop.metas || []).filter((m) => m.objetivo).length > 0 && (
            <div className="mb-4 mt-3 p-3" style={{ border: "1px solid #D9914F" }}>
              <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Metas pactuadas</div>
              <ul className="text-sm list-disc pl-5">
                {(prop.metas || []).filter((m) => m.objetivo).map((m) => (
                  <li key={m.id} className="mb-0.5">{m.objetivo}{m.prazo ? ` — até ${m.prazo}` : ""}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-sm">{prop.metodologia}</p>
        </div>
      )}

      {(prop.investimento || prop.condicoesPagamento || prop.duracao) && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Investimento</div>
          <table className="w-full text-sm border-collapse">
            <tbody>
              {prop.duracao && (
                <tr>
                  <td className="border px-3 py-1 font-semibold w-48" style={{ borderColor: "#D9914F", color: CORES.fogo }}>Duração prevista</td>
                  <td className="border px-3 py-1" style={{ borderColor: "#D9914F" }}>{prop.duracao}</td>
                </tr>
              )}
              {prop.investimento && (
                <tr>
                  <td className="border px-3 py-1 font-semibold" style={{ borderColor: "#D9914F", color: CORES.fogo }}>Investimento</td>
                  <td className="border px-3 py-1 font-semibold" style={{ borderColor: "#D9914F" }}>{prop.investimento}</td>
                </tr>
              )}
              {prop.condicoesPagamento && (
                <tr>
                  <td className="border px-3 py-1 font-semibold" style={{ borderColor: "#D9914F", color: CORES.fogo }}>Condições de pagamento</td>
                  <td className="border px-3 py-1" style={{ borderColor: "#D9914F" }}>{prop.condicoesPagamento}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {prop.condicoesGerais && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Condições gerais</div>
          <p className="text-sm">{prop.condicoesGerais}</p>
        </div>
      )}

      <div className="mt-10 pt-6 text-sm" style={{ color: "#2A1218" }}>
        <div className="flex gap-16">
          <div className="flex-1 border-t pt-1 text-center" style={{ borderColor: "#2A1218" }}>Nayara Silva · Consultoria de Governança</div>
          <div className="flex-1 border-t pt-1 text-center" style={{ borderColor: "#2A1218" }}>{cliente.negocio}</div>
        </div>
      </div>

      <RodapeImpressao />
    </div>
  );
}

// ─── Módulo: Cronograma ─────────────────────────────────────────

function ModuloCronograma({ cliente, gestao, gerando, erro, onMudar, onDistribuir, onImprimir, onVoltar }) {
  const frentes = gestao.frentes || [];
  const duracao = Number(gestao.duracaoSemanas) || 0;
  const semAtual = semanaAtualDe(gestao.inicio, duracao);
  const todas = acoesNumeradas(frentes);
  const comSemana = todas.filter((x) => x.acao.semana);
  const semSemana = todas.filter((x) => !x.acao.semana);
  const atrasadas = semAtual
    ? comSemana.filter((x) => !x.acao.feita && x.acao.semana < semAtual)
    : [];

  const marcarFeita = (frenteId, acaoId, feita) => {
    onMudar({
      ...gestao,
      frentes: frentes.map((f) =>
        f.id === frenteId ? { ...f, acoes: f.acoes.map((a) => (a.id === acaoId ? { ...a, feita } : a)) } : f
      ),
    });
  };

  const semanas = [];
  const maxSemana = Math.max(duracao, ...comSemana.map((x) => x.acao.semana), 0);
  for (let w = 1; w <= maxSemana; w++) semanas.push(w);

  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: "#B8860B", letterSpacing: 1 }}>
        ← {cliente.negocio}
      </button>
      <div className="rounded-lg p-6 shadow-sm" className="card">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h2 className="font-serif text-lg" style={{ color: CORES.fogo }}>Cronograma</h2>
          <div className="flex gap-2 flex-wrap">
            <BotaoPrimario onClick={onDistribuir} disabled={gerando || todas.length === 0}>
              {gerando ? "Distribuindo..." : "Distribuir ações com IA"}
            </BotaoPrimario>
            {comSemana.length > 0 && <BotaoContorno onClick={onImprimir}>Exportar PDF</BotaoContorno>}
          </div>
        </div>
        <p className="text-xs mb-4" style={{ color: "#8A7A5C" }}>
          O Mapa do Maroto do engajamento: onde cada ação está no tempo — e a semana em que os pés deveriam estar agora.
        </p>

        <div className="grid sm:grid-cols-2 gap-x-4">
          <InputField
            label="Início do engajamento (dd/mm/aaaa)"
            value={gestao.inicio || ""}
            onChange={(v) => onMudar({ ...gestao, inicio: v })}
            placeholder="Ex.: 04/08/2026"
          />
          <InputField
            label="Duração (semanas)"
            value={gestao.duracaoSemanas || ""}
            onChange={(v) => onMudar({ ...gestao, duracaoSemanas: v })}
            placeholder="Ex.: 10"
          />
        </div>

        {semAtual !== null && (
          <div className="mb-4 text-sm" style={{ color: CORES.fogoEscuro }}>
            {semAtual === 0
              ? "O engajamento ainda não começou."
              : duracao > 0 && semAtual > duracao
                ? `Prazo original encerrado (${duracao} semanas).`
                : <>Estamos na <strong>semana {semAtual}</strong>{duracao ? ` de ${duracao}` : ""}.</>}
          </div>
        )}

        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && todas.length === 0 && (
          <p className="text-sm py-4" style={{ color: "#8A7A5C" }}>
            Nenhuma ação no plano ainda. Gere o plano de ação no Briefing primeiro — depois volte aqui pra distribuir no tempo.
          </p>
        )}

        {!gerando && atrasadas.length > 0 && (
          <div className="mb-5 p-4 rounded-lg" style={{ background: "#F0DCD2" }}>
            <div className="text-sm font-semibold mb-2" style={{ color: "#8A3A2E" }}>
              Atrasadas ({atrasadas.length})
            </div>
            {atrasadas.map((x) => (
              <label key={x.acao.id} className="flex items-start gap-2 py-1 text-sm cursor-pointer" style={{ color: "#8A3A2E" }}>
                <input type="checkbox" className="mt-1" checked={false} onChange={() => marcarFeita(x.frenteId, x.acao.id, true)} />
                <span>
                  <span className="text-xs font-semibold uppercase tracking-wider mr-1">[sem. {x.acao.semana} · {x.frenteNome}]</span>
                  {x.acao.texto}
                </span>
              </label>
            ))}
          </div>
        )}

        {!gerando &&
          semanas.map((w) => {
            const doW = comSemana.filter((x) => x.acao.semana === w);
            const ehAtual = semAtual === w;
            if (doW.length === 0 && !ehAtual) return null;
            return (
              <div
                key={w}
                className="mb-3 p-3 rounded-lg"
                style={{
                  background: ehAtual ? "#F5EDD9" : "white",
                  border: `1px solid ${ehAtual ? CORES.dourado : "#E8DFC9"}`,
                }}
              >
                <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: ehAtual ? CORES.dourado : "#A89878" }}>
                  Semana {w}{intervaloSemana(gestao.inicio, w) ? ` · ${intervaloSemana(gestao.inicio, w)}` : ""}{ehAtual ? " · atual" : ""}
                </div>
                {doW.length === 0 ? (
                  <div className="text-xs italic" style={{ color: "#A89878" }}>Sem ações planejadas.</div>
                ) : (
                  doW.map((x) => (
                    <label key={x.acao.id} className="flex items-start gap-2 py-1 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={!!x.acao.feita}
                        onChange={(e) => marcarFeita(x.frenteId, x.acao.id, e.target.checked)}
                      />
                      <span style={{ color: x.acao.feita ? "#A89878" : CORES.fogoEscuro, textDecoration: x.acao.feita ? "line-through" : "none" }}>
                        <span className="text-xs font-semibold mr-1" style={{ color: CORES.dourado }}>[{x.frenteNome}]</span>
                        {x.acao.texto}
                        {x.acao.responsavel && (
                          <span className="text-xs ml-1" style={{ color: "#A89878" }}>· @{x.acao.responsavel}</span>
                        )}
                      </span>
                    </label>
                  ))
                )}
              </div>
            );
          })}

        {!gerando && semSemana.length > 0 && (
          <div className="mt-4 text-xs" style={{ color: "#A89878" }}>
            {semSemana.length} aç{semSemana.length > 1 ? "ões" : "ão"} sem semana definida — atribua no Briefing (campo "sem.") ou use a distribuição por IA.
          </div>
        )}
      </div>
    </div>
  );
}

function ImpressaoCronograma({ cliente, gestao }) {
  const frentes = gestao.frentes || [];
  const comSemana = acoesNumeradas(frentes).filter((x) => x.acao.semana);
  if (comSemana.length === 0) return null;
  const maxSemana = Math.max(...comSemana.map((x) => x.acao.semana));
  const semanas = [];
  for (let w = 1; w <= maxSemana; w++) semanas.push(w);
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "#2A1218" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="text-xs uppercase tracking-widest" style={{ color: CORES.dourado }}>Cronograma do Engajamento</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{cliente.negocio}</div>
        <div className="text-sm mt-1" style={{ color: "#6B5D42" }}>
          {gestao.inicio ? `Início: ${gestao.inicio}` : ""}
          {gestao.duracaoSemanas ? ` · Duração: ${gestao.duracaoSemanas} semanas` : ""}
        </div>
      </div>
      {semanas.map((w) => {
        const doW = comSemana.filter((x) => x.acao.semana === w);
        if (doW.length === 0) return null;
        return (
          <div key={w} className="mb-4">
            <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>
              Semana {w}{intervaloSemana(gestao.inicio, w) ? ` · ${intervaloSemana(gestao.inicio, w)}` : ""}
            </div>
            <table className="w-full text-sm border-collapse">
              <tbody>
                {doW.map((x) => (
                  <tr key={x.acao.id}>
                    <td className="border px-3 py-1 w-44 font-semibold" style={{ borderColor: "#D9914F", color: CORES.dourado }}>{x.frenteNome}</td>
                    <td className="border px-3 py-1" style={{ borderColor: "#D9914F" }}>
                      {x.acao.texto}
                      {x.acao.porque && <div className="text-xs italic" style={{ color: "#6B5D42" }}>{x.acao.porque}</div>}
                    </td>
                    <td className="border px-3 py-1 w-32" style={{ borderColor: "#D9914F" }}>{x.acao.responsavel || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
      <RodapeImpressao />
    </div>
  );
}

// ─── Módulo: Relatório de Encerramento ──────────────────────────

function relatorioVazio() {
  return {
    id: uid(),
    data: new Date().toLocaleDateString("pt-BR"),
    obs: "",
    retrospectiva: "",
    resultados: "",
    entregas: "",
    recomendacoes: "",
    proximoPasso: "",
  };
}

const CAMPOS_RELATORIO = [
  ["retrospectiva", "Retrospectiva", 4],
  ["resultados", "Resultados (um por linha)", 4],
  ["entregas", "Entregas realizadas (uma por linha)", 5],
  ["recomendacoes", "Recomendações de continuidade (uma por linha)", 4],
  ["proximoPasso", "Próximo passo sugerido", 2],
];

const STATUS_META = { batida: "Batida ✓", parcial: "Parcial", nao: "Não batida" };

const STATUS_PRATICA = {
  ativa: { rotulo: "Ativa", cor: "#9A6A2F", fundo: "#F5E6C8" },
  consolidada: { rotulo: "Consolidada", cor: "#4F6B3A", fundo: "#E3EBD8" },
  pausada: { rotulo: "Pausada", cor: "#8A7A5C", fundo: "#EFE8D6" },
};

const STATUS_ANOMALIA = {
  pendente: { rotulo: "Pendente", cor: "#9A6A2F", fundo: "#F5E6C8" },
  tratada: { rotulo: "Tratada", cor: "#4F6B3A", fundo: "#E3EBD8" },
  reaberta: { rotulo: "Reaberta", cor: "#8A3A2E", fundo: "#F0DCD2" },
};

const STATUS_ENCONTRO = {
  planejado: { rotulo: "Planejado", cor: "#8A7A5C", fundo: "#EFE8D6" },
  realizado: { rotulo: "Realizado", cor: "#4F6B3A", fundo: "#E3EBD8" },
  cancelado: { rotulo: "Cancelado", cor: "#8A3A2E", fundo: "#F0DCD2" },
};

const STATUS_ANOMALIA_ENUM = {
  relatada: { rotulo: "Relatada", cor: "#9A6A2F", fundo: "#F5E6C8" },
  tratada: { rotulo: "Tratada", cor: "#4F6B3A", fundo: "#E3EBD8" },
  reaberta: { rotulo: "Reaberta", cor: "#8A3A2E", fundo: "#F0DCD2" },
};

const STATUS_FINANCEIRO = {
  rascunho: { rotulo: "Rascunho", cor: "#8A7A5C", fundo: "#EFE8D6" },
  apresentada: { rotulo: "Apresentada", cor: "#9A6A2F", fundo: "#F5E6C8" },
  aceita: { rotulo: "Aceita", cor: "#4F6B3A", fundo: "#E3EBD8" },
  recusada: { rotulo: "Recusada", cor: "#8A3A2E", fundo: "#F0DCD2" },
};

// Cores adicionais para coerência
const CORES_ESTENDIDAS = {
  borderClaro: "#E0D5BC",
  alertaFundo: "#F5DDD6",
  sucessoFundo: "#E3EBD8",
};

function ModuloRelatorio({ cliente, relatorios, relAberto, diags, metasAcordo, gerando, erro, onMudarLista, onAbrir, onGerar, onImprimir, onVoltar }) {
  if (!relAberto) {
    return (
      <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
        <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: "#B8860B", letterSpacing: 1 }}>
          ← {cliente.negocio}
        </button>
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="font-serif text-xl" style={{ color: CORES.fogo }}>Relatório de Encerramento</h2>
          <BotaoPrimario
            onClick={() => {
              const novo = relatorioVazio();
              onMudarLista([...relatorios, novo]);
              onAbrir(novo.id);
            }}
          >
            + Novo relatório
          </BotaoPrimario>
        </div>
        <p className="text-xs mb-5" style={{ color: "#8A7A5C" }}>
          Malfeito feito: o fechamento do ciclo. Antes/depois do diagnóstico, frentes concluídas, entregas e recomendações — o documento que renova contrato e gera indicação.
        </p>
        {relatorios.length === 0 ? (
          <div className="text-center py-16 rounded-lg" style={{ background: CORES.papel, border: "1px dashed #D9914F" }}>
            <p className="text-sm" style={{ color: "#8A7A5C" }}>
              Nenhum relatório ainda. Crie ao final do engajamento — a IA reúne tudo que aconteceu na Toca deste cliente.
            </p>
          </div>
        ) : (
          <div className="grid gap-2">
            {relatorios.map((r) => (
              <button
                key={r.id}
                onClick={() => onAbrir(r.id)}
                className="objeto text-left px-5 py-3 rounded-lg shadow-sm flex items-baseline justify-between"
                className="card"
              >
                <span className="font-serif" style={{ color: CORES.fogo }}>Relatório de {r.data}</span>
                <span className="text-xs" style={{ color: "#8A7A5C" }}>{r.retrospectiva ? "" : "rascunho vazio"}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const set = (campo) => (v) => onMudarLista(relatorios.map((r) => (r.id === relAberto.id ? { ...relAberto, [campo]: v } : r)));
  const primeiroDiag = diags.length > 1 ? diags[0] : null;
  const ultimoDiag = diags.length ? diags[diags.length - 1] : null;

  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={() => onAbrir(null)} className="text-xs mb-4 uppercase font-semibold" style={{ color: "#B8860B", letterSpacing: 1 }}>
        ← Relatórios · {cliente.negocio}
      </button>
      <div className="rounded-lg p-6 shadow-sm" className="card">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h2 className="font-serif text-lg" style={{ color: CORES.fogo }}>Relatório de {relAberto.data}</h2>
          <div className="flex gap-2">
            <BotaoPrimario onClick={onGerar} disabled={gerando}>
              {gerando ? "Gerando..." : relAberto.retrospectiva ? "Gerar novamente" : "Gerar com IA"}
            </BotaoPrimario>
            {relAberto.retrospectiva && <BotaoContorno onClick={onImprimir}>Exportar PDF</BotaoContorno>}
          </div>
        </div>

        <div className="mb-4 p-3 rounded-lg" style={{ background: "#F5EDD9", border: "2px solid #D4AF37AA" }}>
          <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
            <div className="label" style={{ color: "#9A6A2F" }}>
              Verificação das metas pactuadas (fase Prova)
            </div>
            {(metasAcordo || []).length > 0 && (relAberto.metasVerificadas || []).length === 0 && (
              <button
                onClick={() => set("metasVerificadas")((metasAcordo || []).map((m) => ({ id: uid(), objetivo: m.objetivo, prazo: m.prazo, status: "parcial", porque: "" })))}
                className="text-xs underline"
                style={{ color: CORES.dourado }}
              >
                Puxar metas do Acordo
              </button>
            )}
          </div>
          {(relAberto.metasVerificadas || []).length === 0 && (
            <p className="text-xs" style={{ color: "#8A7A5C" }}>
              {(metasAcordo || []).length ? "Puxe as metas da proposta aceita e registre: batida, parcial ou não batida — com o porquê." : "Nenhuma meta pactuada na proposta aceita deste cliente."}
            </p>
          )}
          {(relAberto.metasVerificadas || []).map((m) => (
            <div key={m.id} className="py-1.5 border-b" style={{ borderColor: "#EFE8D6" }}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex-1 text-sm" style={{ color: CORES.fogoEscuro }}>{m.objetivo}{m.prazo ? ` — até ${m.prazo}` : ""}</span>
                <select
                  className="px-2 py-0.5 text-xs rounded border font-semibold"
                  style={
                    m.status === "batida"
                      ? { borderColor: "#4F6B3A", background: "#E3EBD8", color: "#4F6B3A" }
                      : m.status === "nao"
                      ? { borderColor: "#C77", background: "#F5DDD6", color: "#8A3A2E" }
                      : { borderColor: "#9A6A2F", background: "#F5E6C8", color: "#9A6A2F" }
                  }
                  value={m.status}
                  onChange={(e) => set("metasVerificadas")(relAberto.metasVerificadas.map((x) => (x.id === m.id ? { ...x, status: e.target.value } : x)))}
                >
                  {Object.entries(STATUS_META).map(([ch, rot]) => <option key={ch} value={ch}>{rot}</option>)}
                </select>
              </div>
              <input
                className="w-full mt-1 px-2 py-1 text-xs rounded border bg-white"
                style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                placeholder="Por quê (o que levou a esse resultado)"
                value={m.porque}
                onChange={(e) => set("metasVerificadas")(relAberto.metasVerificadas.map((x) => (x.id === m.id ? { ...x, porque: e.target.value } : x)))}
              />
            </div>
          ))}
        </div>

        {primeiroDiag && ultimoDiag && (
          <div className="flex gap-4 justify-center flex-wrap mb-4">
            <div className="text-center">
              <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: "#A89878" }}>
                Antes ({primeiroDiag.data})
              </div>
              <RadarMaturidade notas={primeiroDiag.notas} tamanho={240} />
            </div>
            <div className="text-center">
              <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: CORES.dourado }}>
                Depois ({ultimoDiag.data})
              </div>
              <RadarMaturidade notas={ultimoDiag.notas} tamanho={240} />
            </div>
          </div>
        )}

        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && (
          <>
            <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Observações para a IA (opcional)</span><textarea rows={2} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} placeholder="Ex.: destacar a autonomia conquistada pelo gerente; cliente quer continuar com mentoria mensal" value={relAberto.obs} onChange={(e) => set("obs")(e.target.value)} /></label>
            {CAMPOS_RELATORIO.map(([campo, rotulo, linhas]) => (
              <label key={campo} className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>{rotulo}</span><textarea rows={linhas} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} value={relAberto[campo]} onChange={(e) => set(campo)(e.target.value)} /></label>
            ))}
            <button
              onClick={() => {
                onMudarLista(relatorios.filter((r) => r.id !== relAberto.id));
                onAbrir(null);
              }}
              className="text-xs underline"
              style={{ color: "#8A3A2E" }}
            >
              Excluir relatório
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ImpressaoRelatorio({ cliente, rel, diags, dadosPainel }) {
  const ROT_META = { batida: "Batida", parcial: "Parcial", nao: "Não batida" };
  if (!rel || !rel.retrospectiva) return null;
  const resultados = emLinhasDoc(rel.resultados);
  const entregas = emLinhasDoc(rel.entregas);
  const recomendacoes = emLinhasDoc(rel.recomendacoes);
  const primeiroDiag = diags.length > 1 ? diags[0] : null;
  const ultimoDiag = diags.length ? diags[diags.length - 1] : null;
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "#2A1218" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="text-xs uppercase tracking-widest" style={{ color: CORES.dourado }}>Relatório de Encerramento</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{cliente.negocio}</div>
        <div className="text-sm mt-1" style={{ color: "#6B5D42" }}>{rel.data}</div>
      </div>

      <div className="mb-5">
        <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Retrospectiva</div>
        <p className="text-sm whitespace-pre-line">{rel.retrospectiva}</p>
      </div>
      {(rel.metasVerificadas || []).length > 0 && (
        <div className="mb-5 p-3" style={{ border: "1px solid #D9914F" }}>
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Metas pactuadas — verificação</div>
          {(rel.metasVerificadas || []).map((m) => (
            <div key={m.id} className="text-sm mb-1">
              <strong>{ROT_META[m.status] || m.status}:</strong> {m.objetivo}{m.prazo ? ` (até ${m.prazo})` : ""}
              {m.porque && <span className="text-xs italic" style={{ color: "#6B5D42" }}> — {m.porque}</span>}
            </div>
          ))}
        </div>
      )}
      {dadosPainel && (
        <div className="mb-5 p-3" style={{ border: "1px solid #D9914F" }}>
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Painel do Engajamento</div>
          <div className="text-sm">
            Índice de formalização: <strong>{dadosPainel.formalizacao}%</strong> · Conformidade (CCT): <strong>{dadosPainel.cctResolvidos}/{dadosPainel.cctTotal} resolvidos</strong> · Anomalias tratadas: <strong>{dadosPainel.anomTratadas}/{dadosPainel.anomTotal}</strong> · Atas registradas: <strong>{dadosPainel.totalAtas}</strong>
          </div>
        </div>
      )}


      {primeiroDiag && ultimoDiag && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: CORES.fogo }}>Evolução da maturidade</div>
          <div className="flex gap-6 justify-center">
            <div className="text-center">
              <div className="text-xs font-semibold mb-1" style={{ color: "#6B5D42" }}>Antes · {primeiroDiag.data}</div>
              <RadarMaturidade notas={primeiroDiag.notas} tamanho={250} />
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold mb-1" style={{ color: CORES.dourado }}>Depois · {ultimoDiag.data}</div>
              <RadarMaturidade notas={ultimoDiag.notas} tamanho={250} />
            </div>
          </div>
        </div>
      )}

      {resultados.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Resultados</div>
          <ul className="text-sm list-disc pl-5">
            {resultados.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      )}

      {entregas.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Entregas realizadas</div>
          <ul className="text-sm list-disc pl-5">
            {entregas.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      {recomendacoes.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Recomendações de continuidade</div>
          <ol className="text-sm list-decimal pl-5">
            {recomendacoes.map((r, i) => <li key={i} className="mb-0.5">{r}</li>)}
          </ol>
        </div>
      )}

      {rel.proximoPasso && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Próximo passo</div>
          <p className="text-sm">{rel.proximoPasso}</p>
        </div>
      )}

      <RodapeImpressao />
    </div>
  );
}

// ─── Módulo: Financeiro ─────────────────────────────────────────

function ModuloFinanceiro({ cliente, financeiro, propostaAceita, onMudar, onVoltar }) {
  const parcelas = financeiro.parcelas || [];
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  let recebido = 0;
  let aReceber = 0;
  let atrasado = 0;
  for (const p of parcelas) {
    const v = parseValorBR(p.valor);
    if (p.pago) recebido += v;
    else {
      aReceber += v;
      const venc = parseDataBR(p.vencimento);
      if (venc && venc < hoje) atrasado += v;
    }
  }

  const mudarParcela = (id, campo, valor) => {
    onMudar({ ...financeiro, parcelas: parcelas.map((p) => (p.id === id ? { ...p, [campo]: valor } : p)) });
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: "#B8860B", letterSpacing: 1 }}>
        ← {cliente.negocio}
      </button>
      <div className="rounded-lg p-6 shadow-sm" className="card">
        <h2 className="font-serif text-lg mb-1" style={{ color: CORES.fogo }}>Financeiro do Engajamento</h2>
        <p className="text-xs mb-4" style={{ color: "#8A7A5C" }}>
          O cofre de Gringotes: parcelas, vencimentos e o que já entrou. Uso interno — nada disso aparece em documentos do cliente.
        </p>

        {propostaAceita && parcelas.length === 0 && (
          <button
            onClick={() =>
              onMudar({
                ...financeiro,
                parcelas: [
                  {
                    id: uid(),
                    descricao: `Contrato — ${propostaAceita.rotulo || `proposta de ${propostaAceita.data}`}`,
                    valor: propostaAceita.investimento || "",
                    vencimento: "",
                    pago: false,
                  },
                ],
              })
            }
            className="mb-4 px-4 py-2 rounded text-sm font-semibold"
            style={{ background: "#E3EBD8", color: "#4F6B3A", border: "1px solid #4F6B3A55" }}
          >
            Puxar da proposta aceita ({propostaAceita.investimento || "valor a definir"}) — cria a primeira parcela para você dividir
          </button>
        )}

        <div className="flex gap-3 flex-wrap mb-5">
          <div className="px-4 py-2 rounded-lg text-sm" style={{ background: "#E3EBD8", color: "#4F6B3A" }}>
            Recebido: <strong>{formatarBR(recebido)}</strong>
          </div>
          <div className="px-4 py-2 rounded-lg text-sm" style={{ background: "#F5EDD9", color: "#9A6A2F" }}>
            A receber: <strong>{formatarBR(aReceber)}</strong>
          </div>
          {atrasado > 0 && (
            <div className="px-4 py-2 rounded-lg text-sm" style={{ background: "#F0DCD2", color: "#8A3A2E" }}>
              Vencido: <strong>{formatarBR(atrasado)}</strong>
            </div>
          )}
        </div>

        {parcelas.map((p) => {
          const venc = parseDataBR(p.vencimento);
          const vencida = !p.pago && venc && venc < hoje;
          return (
            <div key={p.id} className="flex items-center gap-2 py-1.5 border-b flex-wrap" style={{ borderColor: "#EFE8D6" }}>
              <input
                type="checkbox"
                checked={!!p.pago}
                title="Recebida"
                onChange={(e) => mudarParcela(p.id, "pago", e.target.checked)}
              />
              <input
                className="flex-1 min-w-32 px-2 py-1 text-sm rounded border bg-white"
                style={{ borderColor: "#E0D5BC", color: p.pago ? "#A89878" : CORES.fogoEscuro, textDecoration: p.pago ? "line-through" : "none" }}
                placeholder="Descrição (ex.: Entrada, Parcela 1)"
                value={p.descricao}
                onChange={(e) => mudarParcela(p.id, "descricao", e.target.value)}
              />
              <input
                className="w-28 px-2 py-1 text-sm rounded border bg-white text-right"
                style={{ borderColor: "#E0D5BC", color: CORES.fogoEscuro }}
                placeholder="R$ 0,00"
                value={p.valor}
                onChange={(e) => mudarParcela(p.id, "valor", e.target.value)}
              />
              <input
                className="w-28 px-2 py-1 text-xs rounded border bg-white text-center"
                style={{ borderColor: vencida ? "#8A3A2E" : "#E0D5BC", color: vencida ? "#8A3A2E" : "#6B5D42" }}
                placeholder="dd/mm/aaaa"
                title="Vencimento"
                value={p.vencimento}
                onChange={(e) => mudarParcela(p.id, "vencimento", e.target.value)}
              />
              <button
                onClick={() => onMudar({ ...financeiro, parcelas: parcelas.filter((x) => x.id !== p.id) })}
                className="px-1 text-xs"
                style={{ color: "#B8860B" }}
              >
                ✕
              </button>
            </div>
          );
        })}

        <button
          onClick={() =>
            onMudar({ ...financeiro, parcelas: [...parcelas, { id: uid(), descricao: "", valor: "", vencimento: "", pago: false }] })
          }
          className="mt-3 text-sm"
          style={{ color: CORES.dourado }}
        >
          + Adicionar parcela
        </button>
      </div>
    </div>
  );
}

// ─── Módulo: Desenho de Processos ───────────────────────────────

function fluxoVazio() {
  return { id: uid(), nome: "", setor: "", obs: "", etapas: [], melhorias: "" };
}

function DiagramaFluxo({ etapas, impressao }) {
  return (
    <div className="flex flex-col items-center">
      {etapas.map((e, i) => (
        <div key={e.id} className="flex flex-col items-center w-full">
          {i > 0 && (
            <div className="flex flex-col items-center py-0.5">
              <div className="w-0.5 h-3" style={{ background: CORES.dourado }} />
              <div style={{ color: CORES.dourado, fontSize: 10, lineHeight: "8px" }}>▼</div>
            </div>
          )}
          <div className="flex items-center gap-2 max-w-md w-full justify-center">
            <div
              className="px-4 py-2 text-center text-sm"
              style={
                e.tipo === "decisao"
                  ? {
                      background: impressao ? "white" : "#F5EDD9",
                      border: `2px solid #D4AF37AA`,
                      borderRadius: 4,
                      transform: "skewX(-12deg)",
                      color: CORES.fogoEscuro,
                      minWidth: 180,
                    }
                  : {
                      background: impressao ? "white" : CORES.papel,
                      border: `1.5px solid ${e.tipo === "decisao" ? CORES.dourado : "#C4B48E"}`,
                      borderRadius: 8,
                      color: CORES.fogoEscuro,
                      minWidth: 180,
                    }
              }
            >
              <div style={e.tipo === "decisao" ? { transform: "skewX(12deg)" } : undefined}>
                {e.tipo === "decisao" ? `${e.texto}?` : e.texto}
                {e.responsavel && (
                  <div className="text-xs mt-0.5" style={{ color: "#8A7A5C" }}>{e.responsavel}</div>
                )}
              </div>
            </div>
            {e.tipo === "decisao" && e.seNao && (
              <div className="text-xs max-w-[140px]" style={{ color: "#8A3A2E" }}>
                <span className="font-semibold">Não →</span> {e.seNao}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ListaFluxos({ cliente, fluxos, onAbrir, onNovo, onVoltar }) {
  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: "#B8860B", letterSpacing: 1 }}>
        ← {cliente.negocio}
      </button>
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="font-serif text-xl" style={{ color: CORES.fogo }}>Desenho de Processos</h2>
        <BotaoPrimario onClick={onNovo}>+ Novo processo</BotaoPrimario>
      </div>
      <p className="text-xs mb-5" style={{ color: "#8A7A5C" }}>
        As passagens do castelo: por onde o trabalho realmente anda. Quem faz o quê, onde tem decisão, onde trava — o POP diz como executar; aqui você desenha o caminho.
      </p>
      {fluxos.length === 0 ? (
        <div className="text-center py-16 rounded-lg" style={{ background: CORES.papel, border: "1px dashed #D9914F" }}>
          <p className="text-sm" style={{ color: "#8A7A5C" }}>
            Nenhum processo desenhado. Descreva como funciona hoje (e onde dói) — a IA desenha o fluxo com responsáveis, decisões e melhorias.
          </p>
        </div>
      ) : (
        <div className="grid gap-2">
          {fluxos.map((f) => (
            <button
              key={f.id}
              onClick={() => onAbrir(f.id)}
              className="objeto text-left px-5 py-3 rounded-lg shadow-sm flex items-baseline justify-between"
              className="card"
            >
              <span className="font-serif" style={{ color: CORES.fogo }}>{f.nome || "(sem nome)"}</span>
              <span className="text-xs" style={{ color: "#8A7A5C" }}>
                {f.setor}{f.etapas && f.etapas.length ? ` · ${f.etapas.length} etapas` : " · rascunho vazio"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function EditorFluxo({ cliente, fluxo, gerando, erro, onMudar, onGerar, onImprimir, onExcluir, onVoltar }) {
  const set = (campo) => (v) => onMudar({ ...fluxo, [campo]: v });
  const etapas = fluxo.etapas || [];

  const mudarEtapa = (id, campo, valor) =>
    onMudar({ ...fluxo, etapas: etapas.map((e) => (e.id === id ? { ...e, [campo]: valor } : e)) });

  const mover = (idx, dir) => {
    const alvo = idx + dir;
    if (alvo < 0 || alvo >= etapas.length) return;
    const novas = [...etapas];
    [novas[idx], novas[alvo]] = [novas[alvo], novas[idx]];
    onMudar({ ...fluxo, etapas: novas });
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: "#B8860B", letterSpacing: 1 }}>
        ← Desenho de Processos · {cliente.negocio}
      </button>
      <div className="rounded-lg p-6 shadow-sm" className="card">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h2 className="font-serif text-lg" style={{ color: CORES.fogo }}>{fluxo.nome || "Novo processo"}</h2>
          <div className="flex gap-2">
            <BotaoPrimario onClick={onGerar} disabled={gerando || !fluxo.nome.trim()}>
              {gerando ? "Desenhando..." : etapas.length ? "Desenhar novamente" : "Desenhar com IA"}
            </BotaoPrimario>
            {etapas.length > 0 && <BotaoContorno onClick={onImprimir}>Exportar PDF</BotaoContorno>}
          </div>
        </div>

        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && (
          <>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <InputField label="Nome do processo" value={fluxo.nome} onChange={set("nome")} placeholder="Ex.: Pedido do delivery, do app à entrega" />
              <InputField label="Setor" value={fluxo.setor} onChange={set("setor")} placeholder="Ex.: Delivery" />
            </div>
            <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Como funciona hoje — e onde trava (para a IA)</span><textarea rows={3} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} placeholder="Ex.: pedido cai no tablet, cozinha só vé quando alguém avisa; embalagem sem conferência; motoboy sai sem checar endereço" value={fluxo.obs} onChange={(e) => set("obs")(e.target.value)} /></label>

            {etapas.length > 0 && (
              <>
                <div className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: CORES.dourado }}>
                  Etapas
                </div>
                {etapas.map((e, idx) => (
                  <div key={e.id} className="flex items-center gap-1.5 py-1.5 border-b flex-wrap" style={{ borderColor: "#EFE8D6" }}>
                    <div className="flex flex-col">
                      <button onClick={() => mover(idx, -1)} className="text-xs leading-3" style={{ color: "#C0B091" }}>▲</button>
                      <button onClick={() => mover(idx, 1)} className="text-xs leading-3" style={{ color: "#C0B091" }}>▼</button>
                    </div>
                    <select
                      className="px-1.5 py-1 text-xs rounded border bg-white"
                      style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                      value={e.tipo}
                      onChange={(ev) => mudarEtapa(e.id, "tipo", ev.target.value)}
                    >
                      <option value="tarefa">Tarefa</option>
                      <option value="decisao">Decisão</option>
                    </select>
                    <input
                      className="flex-1 min-w-36 px-2 py-1 text-sm rounded border bg-white"
                      style={{ borderColor: "#E0D5BC", color: CORES.fogoEscuro }}
                      value={e.texto}
                      placeholder="Etapa"
                      onChange={(ev) => mudarEtapa(e.id, "texto", ev.target.value)}
                    />
                    <input
                      className="w-32 px-2 py-1 text-xs rounded border bg-white"
                      style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                      value={e.responsavel}
                      placeholder="Responsável"
                      onChange={(ev) => mudarEtapa(e.id, "responsavel", ev.target.value)}
                    />
                    {e.tipo === "decisao" && (
                      <input
                        className="w-44 px-2 py-1 text-xs rounded border bg-white"
                        style={{ borderColor: "#E8C4B8", color: "#8A3A2E" }}
                        value={e.seNao}
                        placeholder="Se não → ..."
                        onChange={(ev) => mudarEtapa(e.id, "seNao", ev.target.value)}
                      />
                    )}
                    <button
                      onClick={() => onMudar({ ...fluxo, etapas: etapas.filter((x) => x.id !== e.id) })}
                      className="px-1 text-xs"
                      style={{ color: "#B8860B" }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </>
            )}
            <button
              onClick={() => onMudar({ ...fluxo, etapas: [...etapas, { id: uid(), tipo: "tarefa", texto: "", responsavel: "", seNao: "" }] })}
              className="mt-2 text-sm"
              style={{ color: CORES.dourado }}
            >
              + Adicionar etapa
            </button>

            {etapas.length > 0 && (
              <>
                <div className="text-xs uppercase tracking-widest font-semibold mt-6 mb-3" style={{ color: CORES.dourado }}>
                  Pré-visualização do fluxo
                </div>
                <DiagramaFluxo etapas={etapas} />
              </>
            )}

            <div className="mt-5">
              <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Gargalos e melhorias propostas (um por linha)</span><textarea rows={4} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} value={fluxo.melhorias} onChange={(e) => set("melhorias")(e.target.value)} /></label>
            </div>

            <button onClick={onExcluir} className="text-xs underline" style={{ color: "#8A3A2E" }}>
              Excluir processo
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ImpressaoFluxo({ cliente, fluxo }) {
  if (!fluxo || !(fluxo.etapas || []).length) return null;
  const melhorias = emLinhasDoc(fluxo.melhorias);
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "#2A1218" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="text-xs uppercase tracking-widest" style={{ color: CORES.dourado }}>Desenho de Processo</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{fluxo.nome}</div>
        <div className="text-sm mt-1" style={{ color: "#6B5D42" }}>
          {cliente.negocio}{fluxo.setor ? ` · Setor: ${fluxo.setor}` : ""}
        </div>
      </div>
      <DiagramaFluxo etapas={fluxo.etapas} impressao />
      {melhorias.length > 0 && (
        <div className="mt-6 mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Gargalos e melhorias propostas</div>
          <ol className="text-sm list-decimal pl-5">
            {melhorias.map((m, i) => <li key={i} className="mb-0.5">{m}</li>)}
          </ol>
        </div>
      )}
      <RodapeImpressao />
    </div>
  );
}

// ─── Módulo: Alçadas de Decisão ─────────────────────────────────

function agruparAlcadas(itens) {
  return [...new Set(itens.map((i) => i.categoria))].map((c) => ({
    categoria: c,
    itens: itens.filter((i) => i.categoria === c),
  }));
}

function ModuloAlcadas({ cliente, alcadas, gerando, erro, onMudar, onGerar, onImprimir, onVoltar }) {
  const itens = alcadas.itens || [];
  const grupos = agruparAlcadas(itens);
  const mudarItem = (id, campo, valor) =>
    onMudar({ ...alcadas, itens: itens.map((i) => (i.id === id ? { ...i, [campo]: valor } : i)) });

  return (
    <div className="max-w-4xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: "#B8860B", letterSpacing: 1 }}>
        ← {cliente.negocio}
      </button>
      <div className="rounded-lg p-6 shadow-sm" className="card">
        <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
          <h2 className="font-serif text-lg" style={{ color: CORES.fogo }}>Alçadas de Decisão</h2>
          <div className="flex gap-2">
            <BotaoPrimario onClick={onGerar} disabled={gerando}>
              {gerando ? "Gerando..." : itens.length ? "Gerar novamente" : "Gerar com IA"}
            </BotaoPrimario>
            {itens.length > 0 && <BotaoContorno onClick={onImprimir}>Exportar PDF</BotaoContorno>}
          </div>
        </div>
        <p className="text-xs mb-4" style={{ color: "#8A7A5C" }}>
          A Seção Restrita: quem pode decidir o quê sem pedir licença, até que limite, e para quem escala. O documento que liberta o dono do operacional.
        </p>

        <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Observações para a IA (opcional)</span><textarea rows={2} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} placeholder="Ex.: dono quer aprovar toda compra acima de R$ 500; gerente pode dar até 10% de desconto" value={alcadas.obs || ""} onChange={(v) => onMudar({ ...alcadas, obs: v })} /></label>

        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && itens.length === 0 && !erro && (
          <p className="text-sm py-4" style={{ color: "#8A7A5C" }}>
            Nenhuma alçada definida. Gere com IA — ela propõe limites conservadores a partir dos cargos e do organograma, e você calibra os valores com o dono.
          </p>
        )}

        {!gerando &&
          grupos.map((g) => (
            <div key={g.categoria} className="mb-5">
              <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: CORES.dourado }}>
                {g.categoria}
              </div>
              <div className="hidden sm:flex gap-2 text-xs pb-1" style={{ color: "#A89878" }}>
                <span className="flex-1">Decisão</span>
                <span className="w-32">Quem decide</span>
                <span className="w-36">Limite / condição</span>
                <span className="w-32">Acima disso</span>
                <span className="w-5" />
              </div>
              {g.itens.map((i) => (
                <div key={i.id} className="flex items-center gap-2 py-1.5 border-b flex-wrap sm:flex-nowrap" style={{ borderColor: "#EFE8D6" }}>
                  <input
                    className="flex-1 min-w-40 px-2 py-1 text-sm rounded border bg-white"
                    style={{ borderColor: "#E0D5BC", color: CORES.fogoEscuro }}
                    value={i.decisao}
                    onChange={(e) => mudarItem(i.id, "decisao", e.target.value)}
                  />
                  <input
                    className="w-32 px-2 py-1 text-xs rounded border bg-white"
                    style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                    value={i.decide}
                    placeholder="Quem decide"
                    onChange={(e) => mudarItem(i.id, "decide", e.target.value)}
                  />
                  <input
                    className="w-36 px-2 py-1 text-xs rounded border bg-white"
                    style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                    value={i.limite}
                    placeholder="Limite"
                    onChange={(e) => mudarItem(i.id, "limite", e.target.value)}
                  />
                  <input
                    className="w-32 px-2 py-1 text-xs rounded border bg-white"
                    style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                    value={i.escalonamento}
                    placeholder="Escala para"
                    onChange={(e) => mudarItem(i.id, "escalonamento", e.target.value)}
                  />
                  <button
                    onClick={() => onMudar({ ...alcadas, itens: itens.filter((x) => x.id !== i.id) })}
                    className="px-1 text-xs"
                    style={{ color: "#B8860B" }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ))}

        {!gerando && (
          <button
            onClick={() =>
              onMudar({ ...alcadas, itens: [...itens, { id: uid(), categoria: "Geral", decisao: "", decide: "", limite: "", escalonamento: "" }] })
            }
            className="mt-1 text-sm"
            style={{ color: CORES.dourado }}
          >
            + Adicionar alçada
          </button>
        )}
      </div>
    </div>
  );
}

function ImpressaoAlcadas({ cliente, alcadas }) {
  const itens = (alcadas && alcadas.itens) || [];
  if (itens.length === 0) return null;
  const grupos = agruparAlcadas(itens);
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "#2A1218" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="text-xs uppercase tracking-widest" style={{ color: CORES.dourado }}>Matriz de Alçadas de Decisão</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{cliente.negocio}</div>
        <div className="text-sm mt-1" style={{ color: "#6B5D42" }}>{cliente.segmento}</div>
      </div>
      <p className="text-sm mb-5">
        Decisões dentro do limite são tomadas pelo responsável indicado, sem consulta prévia. Acima do limite, a decisão escala para o nível indicado. Valores e condições revisados periodicamente pela gestão.
      </p>
      {grupos.map((g) => (
        <div key={g.categoria} className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>{g.categoria}</div>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="border px-3 py-1 text-left" style={{ borderColor: "#D9914F", color: CORES.dourado }}>Decisão</th>
                <th className="border px-3 py-1 text-left w-36" style={{ borderColor: "#D9914F", color: CORES.dourado }}>Quem decide</th>
                <th className="border px-3 py-1 text-left w-40" style={{ borderColor: "#D9914F", color: CORES.dourado }}>Limite / condição</th>
                <th className="border px-3 py-1 text-left w-36" style={{ borderColor: "#D9914F", color: CORES.dourado }}>Acima disso</th>
              </tr>
            </thead>
            <tbody>
              {g.itens.map((i) => (
                <tr key={i.id}>
                  <td className="border px-3 py-1" style={{ borderColor: "#D9914F" }}>{i.decisao}</td>
                  <td className="border px-3 py-1 font-semibold" style={{ borderColor: "#D9914F" }}>{i.decide}</td>
                  <td className="border px-3 py-1" style={{ borderColor: "#D9914F" }}>{i.limite}</td>
                  <td className="border px-3 py-1" style={{ borderColor: "#D9914F" }}>{i.escalonamento}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      <RodapeImpressao />
    </div>
  );
}

// ─── Módulo: Indicadores ────────────────────────────────────────

function ModuloIndicadores({ cliente, painel, gerando, erro, onMudar, onGerar, onImprimir, onVoltar }) {
  const itens = painel.itens || [];
  const areas = [...new Set(itens.map((i) => i.area))];
  const mudarItem = (id, campo, valor) =>
    onMudar({ ...painel, itens: itens.map((i) => (i.id === id ? { ...i, [campo]: valor } : i)) });

  return (
    <div className="max-w-4xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: "#B8860B", letterSpacing: 1 }}>
        ← {cliente.negocio}
      </button>
      <div className="rounded-lg p-6 shadow-sm" className="card">
        <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
          <h2 className="font-serif text-lg" style={{ color: CORES.fogo }}>Indicadores</h2>
          <div className="flex gap-2">
            <BotaoPrimario onClick={onGerar} disabled={gerando}>
              {gerando ? "Gerando..." : itens.length ? "Gerar novamente" : "Gerar com IA"}
            </BotaoPrimario>
            {itens.length > 0 && <BotaoContorno onClick={onImprimir}>Exportar PDF</BotaoContorno>}
          </div>
        </div>
        <p className="text-xs mb-4" style={{ color: "#8A7A5C" }}>
          A Taça das Casas: os pontos que cada área acompanha — poucos, mensuráveis com o que a PME tem, com meta e dono. Sem isso, os ritos viram reunião de opinião.
        </p>

        <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Observações para a IA (opcional)</span><textarea rows={2} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} placeholder="Ex.: dor principal é desperdício e atraso no delivery; sistema de vendas é o Consumer" value={painel.obs || ""} onChange={(v) => onMudar({ ...painel, obs: v })} /></label>

        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && itens.length === 0 && !erro && (
          <p className="text-sm py-4" style={{ color: "#8A7A5C" }}>
            Nenhum indicador definido. Gere com IA — metas vêm marcadas como sugestão, pra calibrar com o dono.
          </p>
        )}

        {!gerando &&
          areas.map((area) => (
            <div key={area} className="mb-5">
              <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: CORES.dourado }}>
                {area}
              </div>
              <div className="hidden sm:flex gap-2 text-xs pb-1" style={{ color: "#A89878" }}>
                <span className="w-40">Indicador</span>
                <span className="flex-1">Como medir</span>
                <span className="w-28">Meta</span>
                <span className="w-24">Frequência</span>
                <span className="w-28">Responsável</span>
                <span className="w-5" />
              </div>
              {itens
                .filter((i) => i.area === area)
                .map((i) => (
                  <div key={i.id} className="flex items-center gap-2 py-1.5 border-b flex-wrap sm:flex-nowrap" style={{ borderColor: "#EFE8D6" }}>
                    <input
                      className="w-40 px-2 py-1 text-sm rounded border bg-white"
                      style={{ borderColor: "#E0D5BC", color: CORES.fogoEscuro }}
                      value={i.nome}
                      onChange={(e) => mudarItem(i.id, "nome", e.target.value)}
                    />
                    <input
                      className="flex-1 min-w-36 px-2 py-1 text-xs rounded border bg-white"
                      style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                      value={i.como}
                      placeholder="Como medir"
                      onChange={(e) => mudarItem(i.id, "como", e.target.value)}
                    />
                    <input
                      className="w-28 px-2 py-1 text-xs rounded border bg-white"
                      style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                      value={i.meta}
                      placeholder="Meta"
                      onChange={(e) => mudarItem(i.id, "meta", e.target.value)}
                    />
                    <input
                      className="w-24 px-2 py-1 text-xs rounded border bg-white"
                      style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                      value={i.frequencia}
                      placeholder="Freq."
                      onChange={(e) => mudarItem(i.id, "frequencia", e.target.value)}
                    />
                    <input
                      className="w-28 px-2 py-1 text-xs rounded border bg-white"
                      style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                      value={i.responsavel}
                      placeholder="Responsável"
                      onChange={(e) => mudarItem(i.id, "responsavel", e.target.value)}
                    />
                    <button
                      onClick={() => onMudar({ ...painel, itens: itens.filter((x) => x.id !== i.id) })}
                      className="px-1 text-xs"
                      style={{ color: "#B8860B" }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
            </div>
          ))}

        {!gerando && (
          <button
            onClick={() =>
              onMudar({ ...painel, itens: [...itens, { id: uid(), area: "Geral", nome: "", como: "", meta: "", frequencia: "", responsavel: "" }] })
            }
            className="mt-1 text-sm"
            style={{ color: CORES.dourado }}
          >
            + Adicionar indicador
          </button>
        )}
      </div>
    </div>
  );
}

function ImpressaoIndicadores({ cliente, painel }) {
  const itens = (painel && painel.itens) || [];
  if (itens.length === 0) return null;
  const areas = [...new Set(itens.map((i) => i.area))];
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "#2A1218" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="text-xs uppercase tracking-widest" style={{ color: CORES.dourado }}>Painel de Indicadores</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{cliente.negocio}</div>
        <div className="text-sm mt-1" style={{ color: "#6B5D42" }}>{cliente.segmento}</div>
      </div>
      {areas.map((area) => (
        <div key={area} className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>{area}</div>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="border px-3 py-1 text-left" style={{ borderColor: "#D9914F", color: CORES.dourado }}>Indicador</th>
                <th className="border px-3 py-1 text-left" style={{ borderColor: "#D9914F", color: CORES.dourado }}>Como medir</th>
                <th className="border px-3 py-1 text-left w-28" style={{ borderColor: "#D9914F", color: CORES.dourado }}>Meta</th>
                <th className="border px-3 py-1 text-left w-24" style={{ borderColor: "#D9914F", color: CORES.dourado }}>Frequência</th>
                <th className="border px-3 py-1 text-left w-32" style={{ borderColor: "#D9914F", color: CORES.dourado }}>Responsável</th>
              </tr>
            </thead>
            <tbody>
              {itens
                .filter((i) => i.area === area)
                .map((i) => (
                  <tr key={i.id}>
                    <td className="border px-3 py-1 font-semibold" style={{ borderColor: "#D9914F" }}>{i.nome}</td>
                    <td className="border px-3 py-1" style={{ borderColor: "#D9914F" }}>{i.como}</td>
                    <td className="border px-3 py-1" style={{ borderColor: "#D9914F" }}>{i.meta}</td>
                    <td className="border px-3 py-1" style={{ borderColor: "#D9914F" }}>{i.frequencia}</td>
                    <td className="border px-3 py-1" style={{ borderColor: "#D9914F" }}>{i.responsavel}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ))}
      <RodapeImpressao />
    </div>
  );
}

// ─── Módulo: Ritos de Gestão ────────────────────────────────────

function ModuloRitos({ cliente, ritos, gerando, erro, onMudar, onGerar, onImprimir, onVoltar }) {
  const itens = ritos.itens || [];
  const mudarItem = (id, campo, valor) =>
    onMudar({ ...ritos, itens: itens.map((i) => (i.id === id ? { ...i, [campo]: valor } : i)) });

  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: "#B8860B", letterSpacing: 1 }}>
        ← {cliente.negocio}
      </button>
      <div className="rounded-lg p-6 shadow-sm" className="card">
        <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
          <h2 className="font-serif text-lg" style={{ color: CORES.fogo }}>Ritos de Gestão</h2>
          <div className="flex gap-2">
            <BotaoPrimario onClick={onGerar} disabled={gerando}>
              {gerando ? "Gerando..." : itens.length ? "Gerar novamente" : "Gerar com IA"}
            </BotaoPrimario>
            {itens.length > 0 && <BotaoContorno onClick={onImprimir}>Exportar PDF</BotaoContorno>}
          </div>
        </div>
        <p className="text-xs mb-4" style={{ color: "#8A7A5C" }}>
          Os banquetes do Salão Principal: encontros fixos que ninguém cancela. Cada rito com pauta padrão fixa, pra virar hábito — a gestão acontece sem depender do dono lembrar.
        </p>

        <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Observações para a IA (opcional)</span><textarea rows={2} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} placeholder="Ex.: turnos de almoço e jantar; líderes só se encontram todos às segundas" value={ritos.obs || ""} onChange={(v) => onMudar({ ...ritos, obs: v })} /></label>

        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && itens.length === 0 && !erro && (
          <p className="text-sm py-4" style={{ color: "#8A7A5C" }}>
            Nenhum rito definido. Gere com IA — do alinhamento diário rápido à mensal de resultados, com pautas que citam os indicadores quando já definidos.
          </p>
        )}

        {!gerando &&
          itens.map((r) => (
            <div key={r.id} className="mb-4 rounded-lg p-4" style={{ background: "white", border: "2px solid #E97F3855" }}>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <input
                  className="font-serif text-base flex-1 min-w-40 bg-transparent outline-none"
                  style={{ color: CORES.fogo }}
                  value={r.nome}
                  onChange={(e) => mudarItem(r.id, "nome", e.target.value)}
                />
                <button
                  onClick={() => onMudar({ ...ritos, itens: itens.filter((x) => x.id !== r.id) })}
                  className="px-1 text-xs"
                  style={{ color: "#B8860B" }}
                >
                  ✕
                </button>
              </div>
              <div className="grid sm:grid-cols-3 gap-2 mb-2">
                <input
                  className="px-2 py-1 text-xs rounded border bg-white"
                  style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                  value={r.frequencia}
                  placeholder="Frequência e momento"
                  onChange={(e) => mudarItem(r.id, "frequencia", e.target.value)}
                />
                <input
                  className="px-2 py-1 text-xs rounded border bg-white"
                  style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                  value={r.duracao}
                  placeholder="Duração"
                  onChange={(e) => mudarItem(r.id, "duracao", e.target.value)}
                />
                <input
                  className="px-2 py-1 text-xs rounded border bg-white"
                  style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                  value={r.participantes}
                  placeholder="Participantes"
                  onChange={(e) => mudarItem(r.id, "participantes", e.target.value)}
                />
              </div>
              <textarea
                rows={4}
                className="w-full px-2 py-1 text-sm rounded border bg-white outline-none"
                style={{ borderColor: "#EFE8D6", color: CORES.fogoEscuro }}
                value={r.pauta}
                placeholder="Pauta padrão (um item por linha)"
                onChange={(e) => mudarItem(r.id, "pauta", e.target.value)}
              />
            </div>
          ))}

        {!gerando && (
          <button
            onClick={() =>
              onMudar({ ...ritos, itens: [...itens, { id: uid(), nome: "Novo rito", frequencia: "", duracao: "", participantes: "", pauta: "" }] })
            }
            className="text-sm"
            style={{ color: CORES.dourado }}
          >
            + Adicionar rito
          </button>
        )}
      </div>
    </div>
  );
}

function ImpressaoRitos({ cliente, ritos }) {
  const itens = (ritos && ritos.itens) || [];
  if (itens.length === 0) return null;
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "#2A1218" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="text-xs uppercase tracking-widest" style={{ color: CORES.dourado }}>Ritos de Gestão</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{cliente.negocio}</div>
        <div className="text-sm mt-1" style={{ color: "#6B5D42" }}>{cliente.segmento}</div>
      </div>
      <p className="text-sm mb-5">
        Os ritos acontecem no dia e horário fixos, com a pauta padrão abaixo, independentemente da presença do dono. Reunião sem pauta cumprida não conta como realizada.
      </p>
      {itens.map((r) => {
        const pauta = emLinhasDoc(r.pauta);
        return (
          <div key={r.id} className="mb-5">
            <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>{r.nome}</div>
            <table className="w-full text-sm border-collapse mb-2">
              <tbody>
                <tr>
                  {r.frequencia && (
                    <td className="border px-3 py-1" style={{ borderColor: "#D9914F" }}><strong>Quando:</strong> {r.frequencia}</td>
                  )}
                  {r.duracao && (
                    <td className="border px-3 py-1 w-36" style={{ borderColor: "#D9914F" }}><strong>Duração:</strong> {r.duracao}</td>
                  )}
                </tr>
                {r.participantes && (
                  <tr>
                    <td className="border px-3 py-1" colSpan={2} style={{ borderColor: "#D9914F" }}><strong>Participantes:</strong> {r.participantes}</td>
                  </tr>
                )}
              </tbody>
            </table>
            {pauta.length > 0 && (
              <ol className="text-sm list-decimal pl-5">
                {pauta.map((p, i) => <li key={i} className="mb-0.5">{p}</li>)}
              </ol>
            )}
          </div>
        );
      })}
      <RodapeImpressao />
    </div>
  );
}

// ─── Módulo: Trabalho de Campo ──────────────────────────────────

function ListaCampo({ cliente, registros, onAbrir, onNovo, onVoltar }) {
  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: "#B8860B", letterSpacing: 1 }}>
        ← {cliente.negocio}
      </button>
      <div className="flex items-baseline justify-between mb-2 gap-2 flex-wrap">
        <h2 className="font-serif text-xl" style={{ color: CORES.fogo }}>Trabalho de Campo</h2>
        <div className="flex gap-2 flex-wrap">
          <BotaoPrimario onClick={() => onNovo("visita")}>+ Visita</BotaoPrimario>
          <BotaoPrimario onClick={() => onNovo("entrevista")}>+ Entrevista</BotaoPrimario>
          <BotaoPrimario onClick={() => onNovo("turno")}>+ Turno</BotaoPrimario>
        </div>
      </div>
      <p className="text-xs mb-5" style={{ color: "#8A7A5C" }}>
        O caderno de campo: observar as criaturas no habitat delas. O que você registra aqui vira fonte primária — alimenta cargos, processos, plano e diagnóstico. 100% interno: nada disso sai em documento de cliente.
      </p>
      {registros.length === 0 ? (
        <div className="text-center py-16 rounded-lg" style={{ background: CORES.papel, border: "1px dashed #D9914F" }}>
          <p className="text-sm" style={{ color: "#8A7A5C" }}>
            O caderno está em branco. Antes de ir a campo, crie uma visita ou entrevista — a IA prepara o roteiro com base no briefing, nas frentes e na CCT.
          </p>
        </div>
      ) : (
        <div className="grid gap-2">
          {registros.map((r) => (
            <button
              key={r.id}
              onClick={() => onAbrir(r.id)}
              className="objeto text-left px-5 py-3 rounded-lg shadow-sm flex items-baseline justify-between gap-2 flex-wrap"
              className="card"
            >
              <span className="font-serif" style={{ color: CORES.fogo }}>
                <span className="text-xs uppercase tracking-widest mr-2" style={{ color: CORES.dourado }}>{TIPOS_CAMPO[r.tipo].curto}</span>
                {r.tipo === "entrevista" ? (r.entrevistado || r.funcao || "(sem nome)") : (r.titulo || r.setor || "(sem título)")}
              </span>
              <span className="text-xs" style={{ color: "#8A7A5C" }}>{r.data}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function EditorCampo({ cliente, reg, pessoas, gerando, erro, onMudar, onGerarRoteiro, onAbrirPessoa, onCriarPessoa, onExcluir, onVoltar }) {
  const set = (campo) => (v) => onMudar({ ...reg, [campo]: v });
  const pessoaLigada =
    reg.tipo === "entrevista" && reg.entrevistado
      ? (pessoas || []).find((p) => p.nome && p.nome.toLowerCase().trim() === reg.entrevistado.toLowerCase().trim())
      : null;

  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: "#B8860B", letterSpacing: 1 }}>
        ← Trabalho de Campo · {cliente.negocio}
      </button>
      <div className="rounded-lg p-6 shadow-sm" className="card">
        <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
          <h2 className="font-serif text-lg" style={{ color: CORES.fogo }}>{TIPOS_CAMPO[reg.tipo].rotulo}</h2>
          {(reg.tipo === "visita" || reg.tipo === "entrevista") && (
            <BotaoPrimario onClick={onGerarRoteiro} disabled={gerando}>
              {gerando ? "Preparando..." : reg.roteiro ? "Refazer roteiro com IA" : "Preparar roteiro com IA"}
            </BotaoPrimario>
          )}
        </div>
        <p className="text-xs mb-4" style={{ color: "#8A7A5C" }}>
          {reg.tipo === "visita" && "Roteiro antes, olhos abertos durante, registro logo depois — memória de campo evapora em horas."}
          {reg.tipo === "entrevista" && "O que a pessoa realmente faz, na voz dela. Papel se confronta depois; agora é escuta."}
          {reg.tipo === "turno" && "Linha do tempo do turno: hora, o que viu, e a marca do que é (processo, pessoa, risco, oportunidade)."}
        </p>

        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && (
          <>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <InputField label="Data" value={reg.data} onChange={set("data")} />
              {reg.tipo === "visita" && <InputField label="Foco da visita (opcional)" value={reg.titulo} onChange={set("titulo")} placeholder="Ex.: produção do sushibar no pico" />}
              {reg.tipo === "turno" && <InputField label="Setor / turno" value={reg.setor} onChange={set("setor")} placeholder="Ex.: Cozinha — turno do jantar" />}
              {reg.tipo === "entrevista" && (
                <>
                  <InputField label="Nome do entrevistado" value={reg.entrevistado} onChange={set("entrevistado")} />
                  <InputField label="Função" value={reg.funcao} onChange={set("funcao")} placeholder="Ex.: Sushiman" />
                </>
              )}
            </div>

            {reg.tipo === "entrevista" && reg.entrevistado && (
              <div className="mb-4 text-xs flex items-center gap-2 flex-wrap" style={{ color: "#8A7A5C" }}>
                {pessoaLigada ? (
                  <>
                    <span>
                      {pessoaLigada.nome} já está no Chapéu Seletor
                      {pessoaLigada.dominante && TEMPERAMENTOS[pessoaLigada.dominante] ? ` (${TEMPERAMENTOS[pessoaLigada.dominante].rotulo})` : ""}.
                    </span>
                    <button onClick={() => onAbrirPessoa(pessoaLigada.id)} className="underline font-semibold" style={{ color: CORES.dourado }}>
                      Abrir ficha → preencher observação de temperamento
                    </button>
                  </>
                ) : (
                  <button onClick={onCriarPessoa} className="underline font-semibold" style={{ color: CORES.dourado }}>
                    + Mapear {reg.entrevistado} no Chapéu Seletor (aproveite a entrevista para observar o temperamento)
                  </button>
                )}
              </div>
            )}

            {(reg.tipo === "visita" || reg.tipo === "entrevista") && (
              <label className="block mb-4">
                <span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>
                  {reg.tipo === "visita" ? "Roteiro de observação (um ponto por linha)" : "Roteiro de perguntas (uma por linha)"}
                </span>
                <textarea rows={6} className="w-full px-3 py-2 rounded border bg-white text-sm outline-none" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} value={reg.roteiro} onChange={(e) => set("roteiro")(e.target.value)} placeholder="Gere com IA ou escreva o seu" />
              </label>
            )}

            {reg.tipo === "visita" && (
              <>
                <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>O que foi observado</span><textarea rows={4} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} value={reg.observado} onChange={(e) => set("observado")(e.target.value)} /></label>
                <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Evidências de informalidade</span><textarea rows={3} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} placeholder="Controles em papel, combinados verbais, ponto frouxo..." value={reg.informalidades} onChange={(e) => set("informalidades")(e.target.value)} /></label>
                <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Riscos percebidos (trabalhista / contábil / administrativo)</span><textarea rows={3} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} value={reg.riscos} onChange={(e) => set("riscos")(e.target.value)} /></label>
                <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Pontos fortes a preservar</span><textarea rows={2} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} value={reg.pontosFortes} onChange={(e) => set("pontosFortes")(e.target.value)} /></label>
              </>
            )}

            {reg.tipo === "entrevista" && (
              <>
                <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Atividades relatadas (o que ele faz de verdade)</span><textarea rows={4} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} value={reg.atividades} onChange={(e) => set("atividades")(e.target.value)} /></label>
                <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>O que faz e não deveria ser dele</span><textarea rows={2} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} value={reg.fazNaoDeveria} onChange={(e) => set("fazNaoDeveria")(e.target.value)} /></label>
                <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>O que deveria fazer e não faz (e por quê)</span><textarea rows={2} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} value={reg.deveriaNaoFaz} onChange={(e) => set("deveriaNaoFaz")(e.target.value)} /></label>
                <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Dores relatadas</span><textarea rows={3} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} value={reg.dores} onChange={(e) => set("dores")(e.target.value)} /></label>
              </>
            )}

            {reg.tipo === "turno" && (
              <>
                <div className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: CORES.dourado }}>Linha do tempo</div>
                {(reg.linhas || []).map((l) => (
                  <div key={l.id} className="flex items-center gap-2 py-1.5 border-b flex-wrap sm:flex-nowrap" style={{ borderColor: "#EFE8D6" }}>
                    <input
                      className="w-16 px-2 py-1 text-xs rounded border bg-white text-center"
                      style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                      placeholder="hh:mm"
                      value={l.hora}
                      onChange={(e) => onMudar({ ...reg, linhas: reg.linhas.map((x) => (x.id === l.id ? { ...x, hora: e.target.value } : x)) })}
                    />
                    <select
                      className="px-1.5 py-1 text-xs rounded border font-semibold"
                      style={{
                        borderColor: (MARCAS_TURNO[l.marca] || MARCAS_TURNO.processo).cor,
                        background: (MARCAS_TURNO[l.marca] || MARCAS_TURNO.processo).fundo,
                        color: (MARCAS_TURNO[l.marca] || MARCAS_TURNO.processo).cor,
                      }}
                      value={l.marca}
                      onChange={(e) => onMudar({ ...reg, linhas: reg.linhas.map((x) => (x.id === l.id ? { ...x, marca: e.target.value } : x)) })}
                    >
                      {Object.entries(MARCAS_TURNO).map(([chave, m]) => (
                        <option key={chave} value={chave}>{m.rotulo}</option>
                      ))}
                    </select>
                    <input
                      className="flex-1 min-w-40 px-2 py-1 text-sm rounded border bg-white"
                      style={{ borderColor: "#E0D5BC", color: CORES.fogoEscuro }}
                      placeholder="O que você viu"
                      value={l.texto}
                      onChange={(e) => onMudar({ ...reg, linhas: reg.linhas.map((x) => (x.id === l.id ? { ...x, texto: e.target.value } : x)) })}
                    />
                    <button
                      onClick={() => onMudar({ ...reg, linhas: reg.linhas.filter((x) => x.id !== l.id) })}
                      className="px-1 text-xs"
                      style={{ color: "#B8860B" }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => onMudar({ ...reg, linhas: [...(reg.linhas || []), { id: uid(), hora: "", marca: "processo", texto: "" }] })}
                  className="mt-2 text-sm"
                  style={{ color: CORES.dourado }}
                >
                  + Registro
                </button>
              </>
            )}

            <div className="mt-4">
              <ConfirmarAcao label="Excluir este registro" aviso="apaga este registro de campo" onConfirmar={onExcluir} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Módulo: Treinamentos ───────────────────────────────────────

function treinamentoVazio() {
  return { id: uid(), tema: "", publico: "", cargaHoraria: "", data: "", valor: "", frenteId: "", status: "planejado", obs: "", objetivos: "", blocos: "", dinamicas: "", avaliacao: "", participantes: "", obsRealizacao: "" };
}

function mentoriaVazia() {
  return {
    mentoradoId: "",
    objetivos: "",
    foco: "lideranca",
    encontros: [],
    moldagem: { virtudeCentral: { nome: "", manifesto: "", cultivo: "" }, tendencias: [], praticasSugeridas: [] },
    praticas: [],
    virtudes: [],
    relatorio: { retrospectiva: "", evolucao: "", conquistas: "", recomendacoes: "" },
    // Governança: conexão com outros serviços
    treinamentosRelacionados: [],  // IDs de treinamentos que apoiam esta mentoria
    acoesCCTRelacionadas: []      // IDs de anomalias/ações CCT relacionadas
  };
}

function frenteVazia() {
  return {
    id: uid(),
    nome: "",
    status: "nao_iniciada",
    escopo: "",
    // Governança: conexão com outros serviços
    treinamentosRelacionados: [],  // IDs de treinamentos que apoiam esta frente
    mentoriasRelacionadas: [],      // IDs de mentorias relacionadas
    acoes: []
  };
}

function ModuloTreinamentos({ cliente, treinamentos, frentes, pessoas, gerando, erro, aberto, onAbrir, onNovo, onMudar, onGerar, onGerarRelatorio, onImprimir, onExcluir, onVoltar }) {
  const t = treinamentos.find((x) => x.id === aberto);

  if (!t) {
    return (
      <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
        <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: "#B8860B", letterSpacing: 1 }}>
          ← {cliente.negocio}
        </button>
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="font-serif text-xl" style={{ color: CORES.fogo }}>Treinamentos</h2>
          <BotaoPrimario onClick={onNovo}>+ Novo treinamento</BotaoPrimario>
        </div>
        <p className="text-xs mb-5" style={{ color: "#8A7A5C" }}>
          A Sala Precisa: cada turma encontra aqui exatamente a aula de que precisa. Dentro de uma frente da consultoria ou avulso — com a ciência dos temperamentos como marca.
        </p>
        {treinamentos.length === 0 ? (
          <div className="text-center py-16 rounded-lg" style={{ background: CORES.papel, border: "1px dashed #D9914F" }}>
            <p className="text-sm" style={{ color: "#8A7A5C" }}>Nenhum treinamento. Crie o primeiro — a IA monta objetivos, blocos e dinâmicas adaptadas ao time mapeado.</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {treinamentos.map((x) => {
              const frente = frentes.find((f) => f.id === x.frenteId);
              return (
                <button key={x.id} onClick={() => onAbrir(x.id)} className="objeto text-left px-5 py-3 rounded-lg shadow-sm flex items-baseline justify-between gap-2 flex-wrap" className="card">
                  <span className="font-serif" style={{ color: CORES.fogo }}>{x.tema || "(sem tema)"}</span>
                  <span className="text-xs flex items-center gap-2" style={{ color: "#8A7A5C" }}>
                    {x.data || "sem data"}
                    <span className="px-1.5 py-0.5 rounded font-semibold" style={{ background: STATUS_TREINAMENTO[x.status]?.fundo || "#F5E6C8", color: STATUS_TREINAMENTO[x.status]?.cor || "#9A6A2F" }}>
                      {STATUS_TREINAMENTO[x.status]?.rotulo || "Planejado"}
                    </span>
                    <span className="italic">{frente ? `frente: ${frente.nome}` : "avulso"}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const set = (campo) => (v) => onMudar({ ...t, [campo]: v });
  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={() => onAbrir(null)} className="text-xs mb-4 uppercase font-semibold" style={{ color: "#B8860B", letterSpacing: 1 }}>
        ← Treinamentos · {cliente.negocio}
      </button>
      <div className="rounded-lg p-6 shadow-sm" className="card">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h2 className="font-serif text-lg" style={{ color: CORES.fogo }}>{t.tema || "Novo treinamento"}</h2>
          <div className="flex gap-2 items-center">
            <select
              className="px-2 py-1 text-xs rounded border font-semibold"
              style={{ borderColor: STATUS_TREINAMENTO[t.status]?.cor || "#9A6A2F", background: STATUS_TREINAMENTO[t.status]?.fundo || "#F5E6C8", color: STATUS_TREINAMENTO[t.status]?.cor || "#9A6A2F" }}
              value={t.status}
              onChange={(e) => onMudar({ ...t, status: e.target.value })}
            >
              <option value="planejado">Planejado</option>
              <option value="confirmado">Confirmado</option>
              <option value="em_progresso">Em progresso</option>
              <option value="realizado">Realizado</option>
              <option value="avaliado">Avaliado</option>
            </select>
            <BotaoPrimario onClick={onGerar} disabled={gerando || !t.tema.trim()}>
              {gerando ? "Montando..." : t.blocos ? "Montar plano novamente" : "Montar plano com IA"}
            </BotaoPrimario>
            {t.blocos && <BotaoContorno onClick={onImprimir}>Exportar PDF</BotaoContorno>}
          </div>
        </div>

        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && (
          <>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <InputField label="Tema" value={t.tema} onChange={set("tema")} placeholder="Ex.: Liderança pelo temperamento" />
              <InputField label="Público" value={t.publico} onChange={set("publico")} placeholder="Ex.: líderes de setor" />
              <InputField label="Carga horária" value={t.cargaHoraria} onChange={set("cargaHoraria")} placeholder="Ex.: 4h" />
              <InputField label="Data prevista/realizada" value={t.data} onChange={set("data")} placeholder="dd/mm/aaaa" />
              <InputField label="Valor (se avulso — uso interno)" value={t.valor} onChange={set("valor")} placeholder="Ex.: 1.800" />
              <div className="mb-4">
                <div className="text-xs uppercase tracking-widest mb-1 font-semibold" style={{ color: CORES.dourado }}>Vínculo</div>
                <select
                  className="w-full px-3 py-2 rounded border text-sm bg-white"
                  style={{ borderColor: "#E0D5BC", color: CORES.fogoEscuro }}
                  value={t.frenteId || ""}
                  onChange={(e) => onMudar({ ...t, frenteId: e.target.value })}
                >
                  <option value="">Avulso (fora da consultoria)</option>
                  {frentes.map((f) => (
                    <option key={f.id} value={f.id}>Frente: {f.nome}</option>
                  ))}
                </select>
              </div>
            </div>
            <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Observações para a IA</span><textarea rows={2} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} placeholder="Ex.: turma resistente a teoria; já houve conflito entre salão e cozinha" value={t.obs} onChange={(e) => set("obs")(e.target.value)} /></label>
            <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Objetivos de aprendizagem</span><textarea rows={3} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} value={t.objetivos} onChange={(e) => set("objetivos")(e.target.value)} /></label>
            <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Blocos de conteúdo (um por linha: título — duração: conteúdo)</span><textarea rows={6} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} value={t.blocos} onChange={(e) => set("blocos")(e.target.value)} /></label>
            <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Dinâmicas</span><textarea rows={3} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} value={t.dinamicas} onChange={(e) => set("dinamicas")(e.target.value)} /></label>
            <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Avaliação de eficácia</span><textarea rows={2} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} value={t.avaliacao} onChange={(e) => set("avaliacao")(e.target.value)} /></label>
            <div className="mb-4 p-3 rounded-lg" style={{ background: "white", border: "1px solid #EFE8D6" }}>
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="label" style={{ color: CORES.dourado }}>
                  Participantes · {(t.participantesLista || []).filter((p) => p.presente).length}/{(t.participantesLista || []).length} presentes
                </div>
                <div className="flex gap-2">
                  {pessoas.filter((p) => p.nome).length > 0 && (
                    <button
                      onClick={() => {
                        const existentes = new Set((t.participantesLista || []).map((p) => p.nome.toLowerCase().trim()));
                        const novos = pessoas
                          .filter((p) => p.nome && !existentes.has(p.nome.toLowerCase().trim()))
                          .map((p) => ({ id: uid(), nome: p.nome, presente: true }));
                        if (novos.length) onMudar({ ...t, participantesLista: [...(t.participantesLista || []), ...novos] });
                      }}
                      className="text-xs underline"
                      style={{ color: CORES.dourado }}
                    >
                      Importar do Chapéu Seletor
                    </button>
                  )}
                  <button
                    onClick={() => onMudar({ ...t, participantesLista: [...(t.participantesLista || []), { id: uid(), nome: "", presente: true }] })}
                    className="text-xs underline"
                    style={{ color: CORES.dourado }}
                  >
                    + Adicionar
                  </button>
                </div>
              </div>
              {(t.participantesLista || []).length === 0 && (
                <p className="text-xs" style={{ color: "#A89878" }}>Monte a turma: importe o time mapeado ou adicione nomes. A presença alimenta certificados e relatório.</p>
              )}
              {(t.participantesLista || []).map((p) => (
                <div key={p.id} className="flex items-center gap-2 py-0.5">
                  <input
                    type="checkbox"
                    checked={!!p.presente}
                    title="Presente"
                    onChange={() => onMudar({ ...t, participantesLista: t.participantesLista.map((x) => (x.id === p.id ? { ...x, presente: !x.presente } : x)) })}
                  />
                  <input
                    className="flex-1 text-sm bg-transparent outline-none"
                    style={{ color: p.presente ? CORES.fogoEscuro : "#A89878" }}
                    placeholder="Nome do participante"
                    value={p.nome}
                    onChange={(ev) => onMudar({ ...t, participantesLista: t.participantesLista.map((x) => (x.id === p.id ? { ...x, nome: ev.target.value } : x)) })}
                  />
                  <button
                    onClick={() => onMudar({ ...t, participantesLista: t.participantesLista.filter((x) => x.id !== p.id) })}
                    className="text-xs px-1"
                    style={{ color: "#C0B091" }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            {t.status === "realizado" && (
              <>
                <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Como foi (registro interno — alimenta o relatório)</span><textarea rows={3} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} value={t.obsRealizacao} onChange={(e) => set("obsRealizacao")(e.target.value)} /></label>
                <div className="mb-4 flex gap-2 flex-wrap">
                  {(t.participantesLista || []).some((p) => p.presente && p.nome.trim()) && (
                    <BotaoContorno onClick={() => onImprimir({ seletor: ".area-cert", nome: `${cliente.negocio} — Certificados ${t.tema}` })}>
                      Gerar certificados (PDF)
                    </BotaoContorno>
                  )}
                  <BotaoContorno onClick={onGerarRelatorio} disabled={gerando}>
                    {t.relResumo ? "Refazer relatório de realização" : "Relatório de realização com IA"}
                  </BotaoContorno>
                  {t.relResumo && (
                    <BotaoContorno onClick={() => onImprimir({ seletor: ".area-relt", nome: `${cliente.negocio} — Relatório ${t.tema}` })}>
                      Exportar relatório (PDF)
                    </BotaoContorno>
                  )}
                </div>
                {t.relResumo && (
                  <>
                    <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Relatório — resumo do realizado</span><textarea rows={3} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} value={t.relResumo} onChange={(e) => set("relResumo")(e.target.value)} /></label>
                    <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Relatório — resultados e reações observadas</span><textarea rows={3} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} value={t.relResultados} onChange={(e) => set("relResultados")(e.target.value)} /></label>
                    <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Relatório — recomendações de continuidade</span><textarea rows={3} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} value={t.relRecomendacoes} onChange={(e) => set("relRecomendacoes")(e.target.value)} /></label>
                  </>
                )}
              </>
            )}
            <ConfirmarAcao label="Excluir este treinamento" aviso="apaga o treinamento e seu plano" onConfirmar={onExcluir} />
          </>
        )}
      </div>
    </div>
  );
}

function ImpressaoTreinamento({ cliente, trein }) {
  if (!trein || !trein.blocos) return null;
  const objetivos = emLinhasDoc(trein.objetivos);
  const blocos = emLinhasDoc(trein.blocos);
  const dinamicas = emLinhasDoc(trein.dinamicas);
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "#2A1218" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="text-xs uppercase tracking-widest" style={{ color: CORES.dourado }}>Plano de Treinamento</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{trein.tema}</div>
        <div className="text-sm mt-1" style={{ color: "#6B5D42" }}>
          {cliente.negocio}{trein.publico ? ` · Público: ${trein.publico}` : ""}{trein.cargaHoraria ? ` · ${trein.cargaHoraria}` : ""}{trein.data ? ` · ${trein.data}` : ""}
        </div>
      </div>
      {objetivos.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Objetivos</div>
          <ul className="text-sm list-disc pl-5">{objetivos.map((o, i) => <li key={i} className="mb-0.5">{o}</li>)}</ul>
        </div>
      )}
      <div className="mb-5">
        <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Programa</div>
        <ol className="text-sm list-decimal pl-5">{blocos.map((b, i) => <li key={i} className="mb-1">{b}</li>)}</ol>
      </div>
      {dinamicas.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Dinâmicas</div>
          <ul className="text-sm list-disc pl-5">{dinamicas.map((d, i) => <li key={i} className="mb-0.5">{d}</li>)}</ul>
        </div>
      )}
      {trein.avaliacao && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Avaliação de eficácia</div>
          <p className="text-sm">{trein.avaliacao}</p>
        </div>
      )}
      <RodapeImpressao />
    </div>
  );
}

function ImpressaoCertificados({ cliente, trein }) {
  const presentes = (trein.participantesLista || []).filter((p) => p.presente && p.nome.trim());
  if (!presentes.length) return null;
  return (
    <div className="area-cert hidden print:block" style={{ color: "#2A1218" }}>
      {presentes.map((p) => (
        <div key={p.id} style={{ height: "1123px", boxSizing: "border-box", padding: "60px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
          <div style={{ border: "3px solid " + CORES.dourado, padding: "6px", width: "100%", height: "100%", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ border: "1px solid " + CORES.dourado, width: "100%", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px" }}>
              <div className="text-xs uppercase" style={{ color: CORES.dourado, letterSpacing: 6 }}>Certificado</div>
              <div className="font-serif" style={{ fontSize: "30px", color: CORES.fogo, marginTop: "28px" }}>{p.nome}</div>
              <div style={{ width: "180px", borderBottom: "1px solid " + CORES.dourado, margin: "16px 0 28px" }} />
              <div className="text-sm" style={{ color: "#4A3A2A", maxWidth: "480px", lineHeight: 1.7 }}>
                participou do treinamento <strong style={{ color: CORES.fogo }}>{trein.tema}</strong>
                {trein.cargaHoraria ? `, com carga horária de ${trein.cargaHoraria},` : ""} promovido por {cliente.negocio}
                {trein.data ? ` em ${trein.data}` : ""}.
              </div>
              <div style={{ marginTop: "56px", textAlign: "center" }}>
                <div style={{ width: "220px", borderBottom: "1px solid #4A3A2A", marginBottom: "6px" }} />
                <div className="text-xs" style={{ color: "#4A3A2A" }}>Consultoria & Treinamentos</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ImpressaoRelTreinamento({ cliente, trein }) {
  if (!trein || !trein.relResumo) return null;
  const recomendacoes = emLinhasDoc(trein.relRecomendacoes);
  const presentes = (trein.participantesLista || []).filter((p) => p.presente && p.nome.trim());
  return (
    <div className="area-relt hidden print:block p-10" style={{ color: "#2A1218" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="text-xs uppercase tracking-widest" style={{ color: CORES.dourado }}>Relatório de Realização — Treinamento</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{trein.tema}</div>
        <div className="text-sm mt-1" style={{ color: "#6B5D42" }}>
          {cliente.negocio}{trein.data ? ` · ${trein.data}` : ""}{trein.cargaHoraria ? ` · ${trein.cargaHoraria}` : ""}
        </div>
      </div>
      <div className="mb-5">
        <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>O que foi trabalhado</div>
        <p className="text-sm">{trein.relResumo}</p>
      </div>
      {trein.relResultados && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Resultados e reações observadas</div>
          <p className="text-sm">{trein.relResultados}</p>
        </div>
      )}
      {presentes.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Participantes ({presentes.length})</div>
          <p className="text-sm">{presentes.map((p) => p.nome).join(" · ")}</p>
        </div>
      )}
      {recomendacoes.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Recomendações de continuidade</div>
          <ul className="text-sm list-disc pl-5">{recomendacoes.map((x, i) => <li key={i} className="mb-0.5">{x}</li>)}</ul>
        </div>
      )}
      <RodapeImpressao />
    </div>
  );
}

// ─── Módulo: Mentoria ───────────────────────────────────────────

function ReguaMetodoMentoria({ mentoria, temRaioX, statusAcordo, temProva }) {
  const encontros = mentoria.encontros || [];
  const realizados = encontros.filter((e) => e.realizada).length;
  const atividades = encontros.flatMap((e) => e.atividades || []);
  const pctPraCasa = atividades.length ? atividades.filter((a) => a.feita).length / atividades.length : 0;
  const fases = [
    { rotulo: "Escuta", ok: !!(mentoria.briefing || mentoria.objetivos) },
    { rotulo: "Raio-X", ok: temRaioX },
    { rotulo: "Acordo", ok: statusAcordo === "aceita", meio: statusAcordo === "gerada" },
    { rotulo: "Construção", ok: encontros.length > 0 && realizados > 0, meio: encontros.length > 0 && realizados === 0 },
    { rotulo: "Sustentação", ok: encontros.length > 0 && realizados / encontros.length >= 0.6 && pctPraCasa >= 0.5 },
    { rotulo: "Prova", ok: temProva },
  ];
  return (
    <div className="flex items-center gap-1 mb-4 flex-wrap">
      {fases.map((f, i) => (
        <span key={f.rotulo} className="flex items-center gap-1">
          {i > 0 && <span style={{ color: "#C0B091" }}>→</span>}
          <span
            className="text-xs px-2 py-0.5 rounded font-semibold"
            style={
              f.ok
                ? { background: "#E3EBD8", color: "#4F6B3A", border: "1px solid #4F6B3A55" }
                : f.meio
                ? { background: "#F5E6C8", color: "#9A6A2F", border: "1px solid #9A6A2F55" }
                : { background: "white", color: "#A89878", border: "1px solid #E0D5BC" }
            }
          >
            {f.rotulo}
          </span>
        </span>
      ))}
    </div>
  );
}

function SecaoMoldagem({ mentoria, mentorado, gerando, onMudar, onGerarFicha }) {
  const [guiaAberto, setGuiaAberto] = useState(false);
  const m = mentoria.moldagem || {};
  const praticas = mentoria.praticas || [];
  const guia = mentorado && mentorado.dominante ? GUIA_MOLDAGEM[mentorado.dominante] : null;
  const temFicha = m.leitura || (m.praticasSugeridas || []).length > 0;
  const ativarPratica = (p) => {
    onMudar({
      ...mentoria,
      praticas: [...praticas, { id: uid(), texto: p.texto, porque: p.porque, desde: new Date().toLocaleDateString("pt-BR"), status: "ativa" }],
      moldagem: { ...m, praticasSugeridas: (m.praticasSugeridas || []).filter((x) => x.id !== p.id) },
    });
  };
  return (
    <div className="mb-4 p-4 rounded-lg" style={{ background: "#FBF7EC", border: "2px solid #D4AF3777" }}>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
        <div className="label" style={{ color: "#9A6A2F" }}>
          Moldagem pelo temperamento
        </div>
        <div className="flex gap-3 items-center">
          {guia && (
            <button onClick={() => setGuiaAberto(!guiaAberto)} className="text-xs underline" style={{ color: CORES.dourado }}>
              {guiaAberto ? "Fechar guia" : `Guia do ${TEMPERAMENTOS[mentorado.dominante].rotulo.toLowerCase()}`}
            </button>
          )}
          {mentorado && mentorado.dominante && (
            <button onClick={onGerarFicha} className="text-xs underline font-semibold" style={{ color: CORES.dourado }} disabled={gerando}>
              {temFicha ? "Refazer ficha de moldagem" : "Gerar ficha de moldagem com IA"}
            </button>
          )}
        </div>
      </div>
      {!mentorado && (
        <p className="text-xs" style={{ color: "#8A7A5C" }}>Vincule o mentorado para a moldagem — a prescrição nasce do temperamento.</p>
      )}
      {mentorado && !mentorado.dominante && (
        <p className="text-xs" style={{ color: "#9A6A2F" }}>Classifique o temperamento no Chapéu Seletor — sem ele não há moldagem precisa.</p>
      )}

      {guiaAberto && guia && (
        <div className="mt-2 p-3 rounded text-xs" style={{ background: "white", border: "1px solid #EFE8D6", color: "#4A3A2A", lineHeight: 1.6 }}>
          <div className="mb-1"><strong style={{ color: CORES.fogo }}>Essência:</strong> {guia.essencia}</div>
          <div className="mb-1"><strong style={{ color: "#8A3A2E" }}>Onde acomoda:</strong> {guia.acomoda}</div>
          <div className="mb-1"><strong style={{ color: "#4F6B3A" }}>Direção da moldagem:</strong> {guia.direcao}</div>
          <div className="mb-1"><strong style={{ color: "#6B4A7A" }}>Virtudes:</strong> {guia.virtudes}</div>
          <div className="mb-1"><strong style={{ color: CORES.dourado }}>Práticas do estilo:</strong> {guia.praticas.map((p, i) => <div key={i} className="ml-2">• {p}</div>)}</div>
          <div className="mb-1"><strong style={{ color: CORES.fogo }}>Como cobrar:</strong> {guia.cobranca}</div>
          <div><strong style={{ color: "#8A3A2E" }}>Armadilha do mentor:</strong> {guia.armadilha}</div>
        </div>
      )}

      {temFicha && (
        <div className="mt-2">
          {m.virtudeCentral && m.virtudeCentral.nome && (
            <div className="mb-2 p-3 rounded-lg" style={{ background: "#EFE6F2", border: "2px solid #6B4A7A55" }}>
              <div className="label" style={{ color: "#6B4A7A" }}>
                Virtude central da jornada: {m.virtudeCentral.nome}
              </div>
              {m.virtudeCentral.manifestacao && (
                <div className="text-xs mt-1" style={{ color: "#4A3A2A" }}><strong>Como a falta aparece:</strong> {m.virtudeCentral.manifestacao}</div>
              )}
              {m.virtudeCentral.cultivo && (
                <div className="text-xs mt-1" style={{ color: "#4A3A2A" }}><strong>Cultivo (subjetivo, observável):</strong> {m.virtudeCentral.cultivo}</div>
              )}
            </div>
          )}
          {m.leitura && (
            <textarea rows={3} className="w-full px-2 py-1 text-sm rounded border bg-white mb-2" style={{ borderColor: "#E0D5BC", color: CORES.fogoEscuro }}
              value={m.leitura} onChange={(e) => onMudar({ ...mentoria, moldagem: { ...m, leitura: e.target.value } })} />
          )}
          {m.contrabalancos && (
            <div className="text-xs mb-2 p-2 rounded" style={{ background: "#F0DCD2", color: "#8A3A2E" }}>
              <strong>Contrabalançar:</strong> {m.contrabalancos.split("\n").join(" · ")}
            </div>
          )}
          {(m.praticasSugeridas || []).length > 0 && (
            <div className="mb-2">
              <div className="text-xs font-semibold mb-1" style={{ color: "#6B5D42" }}>Práticas sugeridas — ative as que prescrever:</div>
              {(m.praticasSugeridas || []).map((p) => (
                <div key={p.id} className="flex items-start gap-2 py-1 border-b" style={{ borderColor: "#F5F0E4" }}>
                  <div className="flex-1">
                    <div className="text-sm" style={{ color: CORES.fogoEscuro }}>{p.texto}</div>
                    {p.porque && <div className="text-xs italic" style={{ color: "#8A7A5C" }}>{p.porque}</div>}
                  </div>
                  <button onClick={() => ativarPratica(p)} className="text-xs px-2 py-0.5 rounded font-semibold shrink-0" style={{ background: "#E3EBD8", color: "#4F6B3A", border: "1px solid #4F6B3A55" }}>
                    Prescrever ✓
                  </button>
                  <button onClick={() => onMudar({ ...mentoria, moldagem: { ...m, praticasSugeridas: m.praticasSugeridas.filter((x) => x.id !== p.id) } })} className="text-xs px-1" style={{ color: "#C0B091" }}>✕</button>
                </div>
              ))}
            </div>
          )}
          {m.comoCobrar && (
            <div className="text-xs mb-2 p-2 rounded" style={{ background: "#FDFAF3", border: "1px solid #EFE8D6", color: "#6B5D42" }}>
              <strong>Como cobrar este mentorado:</strong> {m.comoCobrar}
            </div>
          )}
          {m.sinais && (
            <div className="text-xs mb-1" style={{ color: "#4F6B3A" }}>
              <strong>Sinais de que está pegando:</strong> {m.sinais.split("\n").join(" · ")}
            </div>
          )}
        </div>
      )}

      {praticas.length > 0 && (
        <div className="mt-3">
          <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: CORES.dourado }}>
            Práticas moldadoras ativas · {praticas.filter((p) => p.status === "consolidada").length} consolidadas
          </div>
          {praticas.map((p) => (
            <div key={p.id} className="flex items-start gap-2 py-1.5 border-b" style={{ borderColor: "#F5F0E4" }}>
              <select
                className="px-1.5 py-0.5 text-xs rounded border font-semibold shrink-0"
                style={
                  p.status === "consolidada"
                    ? { borderColor: "#4F6B3A", background: "#E3EBD8", color: "#4F6B3A" }
                    : p.status === "pausada"
                    ? { borderColor: "#A89878", background: "#F5F0E4", color: "#A89878" }
                    : { borderColor: "#9A6A2F", background: "#F5E6C8", color: "#9A6A2F" }
                }
                value={p.status}
                onChange={(e) => onMudar({ ...mentoria, praticas: praticas.map((x) => (x.id === p.id ? { ...x, status: e.target.value } : x)) })}
              >
                <option value="ativa">Ativa</option>
                <option value="consolidada">Consolidada ✓</option>
                <option value="pausada">Pausada</option>
              </select>
              <div className="flex-1">
                <input className="w-full text-sm bg-transparent outline-none" style={{ color: p.status === "consolidada" ? "#4F6B3A" : CORES.fogoEscuro }}
                  value={p.texto} onChange={(e) => onMudar({ ...mentoria, praticas: praticas.map((x) => (x.id === p.id ? { ...x, texto: e.target.value } : x)) })} />
                <div className="text-xs" style={{ color: "#A89878" }}>{p.porque ? `${p.porque} · ` : ""}desde {p.desde}</div>
              </div>
              <button onClick={() => onMudar({ ...mentoria, praticas: praticas.filter((x) => x.id !== p.id) })} className="text-xs px-1" style={{ color: "#C0B091" }}>✕</button>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={() => onMudar({ ...mentoria, praticas: [...praticas, { id: uid(), texto: "", porque: "", desde: new Date().toLocaleDateString("pt-BR"), status: "ativa" }] })}
        className="text-xs mt-2"
        style={{ color: CORES.dourado }}
      >
        + Prescrever prática manualmente
      </button>

      <div className="mt-4 pt-3 border-t" style={{ borderColor: "#E8D5A8" }}>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
          <div className="label" style={{ color: "#6B4A7A" }}>
            Diário da virtude · registros subjetivos
          </div>
          <button
            onClick={() => onMudar({ ...mentoria, virtudes: [{ id: uid(), data: new Date().toLocaleDateString("pt-BR"), nota: "" }, ...(mentoria.virtudes || [])] })}
            className="text-xs underline"
            style={{ color: "#6B4A7A" }}
          >
            + Registrar observação
          </button>
        </div>
        {(mentoria.virtudes || []).length === 0 && (
          <p className="text-xs" style={{ color: "#8A7A5C" }}>
            O que você viu, não o que mediu: "sustentou a conversa difícil sem recuar", "chegou sem o salto duas vezes". Vira a evidência qualitativa do Relatório de Evolução.
          </p>
        )}
        {(mentoria.virtudes || []).map((v) => (
          <div key={v.id} className="flex items-start gap-2 py-1">
            <span className="text-xs mt-1.5 shrink-0" style={{ color: "#A89878" }}>{v.data}</span>
            <input
              className="flex-1 px-2 py-1 text-sm rounded border bg-white"
              style={{ borderColor: "#E0D5BC", color: CORES.fogoEscuro }}
              placeholder="O que você observou nesta pessoa..."
              value={v.nota}
              onChange={(e) => onMudar({ ...mentoria, virtudes: mentoria.virtudes.map((x) => (x.id === v.id ? { ...x, nota: e.target.value } : x)) })}
            />
            <button onClick={() => onMudar({ ...mentoria, virtudes: mentoria.virtudes.filter((x) => x.id !== v.id) })} className="text-xs px-1 mt-1" style={{ color: "#C0B091" }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModuloMentoria({ cliente, mentoria, pessoas, temRaioX, statusAcordo, temProva, gerando, erro, onMudar, onGerarJornada, onEstruturarSessao, onCriarMentorado, onGerarFicha, onVoltar }) {
  const encontros = mentoria.encontros || [];
  const mentorado = pessoas.find((p) => p.id === mentoria.mentoradoId);
  const mudarEncontro = (id, campo, valor) =>
    onMudar({ ...mentoria, encontros: encontros.map((e) => (e.id === id ? { ...e, [campo]: valor } : e)) });
  const realizados = encontros.filter((e) => e.realizada).length;

  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: "#B8860B", letterSpacing: 1 }}>
        ← {cliente.negocio}
      </button>
      <div className="rounded-lg p-6 shadow-sm" className="card">
        <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
          <h2 className="font-serif text-lg" style={{ color: CORES.fogo }}>Mentoria</h2>
          <BotaoPrimario onClick={onGerarJornada} disabled={gerando}>
            {gerando ? "Desenhando..." : encontros.length ? "Redesenhar jornada com IA" : "Desenhar jornada com IA"}
          </BotaoPrimario>
        </div>
        <p className="text-xs mb-4" style={{ color: "#8A7A5C" }}>
          As aulas particulares de Dumbledore: encontros com propósito, um de cada vez, até o mentorado não precisar mais de você.
          {encontros.length > 0 && ` · ${realizados}/${encontros.length} realizados`}
        </p>
        <ReguaMetodoMentoria mentoria={mentoria} temRaioX={temRaioX} statusAcordo={statusAcordo} temProva={temProva} />

        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <span className="label" style={{ color: CORES.dourado }}>Foco da mentoria:</span>
          {[["lideranca", "Liderança"], ["autoconhecimento", "Autoconhecimento"]].map(([ch, rot]) => (
            <button
              key={ch}
              onClick={() => onMudar({ ...mentoria, foco: ch })}
              className="px-3 py-1 text-xs rounded border font-semibold"
              style={
                (mentoria.foco || "lideranca") === ch
                  ? { background: "#F5EDD9", borderColor: CORES.dourado, color: CORES.fogo }
                  : { background: "white", borderColor: "#E0D5BC", color: "#A89878" }
              }
            >
              {(mentoria.foco || "lideranca") === ch ? "✓ " : ""}{rot}
            </button>
          ))}
          <span className="text-xs" style={{ color: "#8A7A5C" }}>Liderança é o caminho natural, não requisito.</span>
        </div>

        <div className="grid sm:grid-cols-2 gap-x-4">
          <div className="mb-4">
            <div className="text-xs uppercase tracking-widest mb-1 font-semibold" style={{ color: CORES.dourado }}>Mentorado</div>
            <select
              className="w-full px-3 py-2 rounded border text-sm bg-white"
              style={{ borderColor: "#E0D5BC", color: CORES.fogoEscuro }}
              value={mentoria.mentoradoId || ""}
              onChange={(e) => onMudar({ ...mentoria, mentoradoId: e.target.value })}
            >
              <option value="">Selecionar do Chapéu Seletor...</option>
              {pessoas.filter((p) => p.nome).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}{p.dominante && TEMPERAMENTOS[p.dominante] ? ` (${TEMPERAMENTOS[p.dominante].rotulo})` : ""}
                </option>
              ))}
            </select>
            {mentorado && mentorado.dominante && TEMPERAMENTOS[mentorado.dominante] && (
              <div className="text-xs mt-1" style={{ color: "#8A7A5C" }}>A jornada se molda ao temperamento — sem citá-lo nos temas.</div>
            )}
            {!mentoria.mentoradoId && cliente.tipo === "pessoa" && !pessoas.some((p) => p.nome && p.nome.toLowerCase().trim() === (cliente.negocio || "").toLowerCase().trim()) && (
              <button onClick={onCriarMentorado} className="text-xs underline mt-1" style={{ color: CORES.dourado }}>
                + Criar {cliente.negocio} no Chapéu Seletor e vincular
              </button>
            )}
            {mentorado && !mentorado.dominante && (
              <div className="text-xs mt-1" style={{ color: "#9A6A2F" }}>Temperamento ainda não classificado — o formulário de observação da ficha ajuda.</div>
            )}
          </div>
          <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Objetivos da mentoria</span><textarea rows={3} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} placeholder="Ex.: liderar sem centralizar; preparar o time para funcionar sem ele" value={mentoria.objetivos || ""} onChange={(v) => onMudar({ ...mentoria, objetivos: v })} /></label>
        </div>
        <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Briefing da conversa inicial (alimenta a jornada)</span><textarea rows={3} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} placeholder="Ex.: recém-promovido, era par do time que agora lidera; evita conflito; o dono cobra resultado" value={mentoria.briefing || ""} onChange={(v) => onMudar({ ...mentoria, briefing: v })} /></label>

        <SecaoMoldagem mentoria={mentoria} mentorado={mentorado} gerando={gerando} onMudar={onMudar} onGerarFicha={onGerarFicha} />

        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && (() => {
          const pendentes = encontros
            .filter((e) => e.realizada)
            .flatMap((e) => (e.atividades || []).filter((a) => !a.feita && a.texto).map((a) => ({ encontro: e, atividade: a })));
          if (!pendentes.length) return null;
          return (
            <div className="mb-4 p-4 rounded-lg" style={{ background: "#F5E6C8", border: "2px solid #D4AF37AA" }}>
              <div className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: "#9A6A2F" }}>
                Pra casa pendente — cobre no próximo encontro
              </div>
              {(mentoria.praticas || []).filter((p) => p.status === "ativa").length > 0 && (
                <div className="text-xs mb-2 pb-2 border-b" style={{ color: "#6B5D42", borderColor: "#E8D5A8" }}>
                  <strong>Práticas ativas a cobrar:</strong> {(mentoria.praticas || []).filter((p) => p.status === "ativa").map((p) => p.texto).join(" · ")}
                </div>
              )}
              {pendentes.map(({ encontro, atividade }) => (
                <label key={atividade.id} className="flex items-start gap-2 py-0.5 text-sm cursor-pointer" style={{ color: CORES.fogoEscuro }}>
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={false}
                    onChange={() =>
                      onMudar({
                        ...mentoria,
                        encontros: encontros.map((e) =>
                          e.id === encontro.id
                            ? { ...e, atividades: e.atividades.map((a) => (a.id === atividade.id ? { ...a, feita: true } : a)) }
                            : e
                        ),
                      })
                    }
                  />
                  <span>
                    {atividade.texto}
                    <span className="text-xs ml-1" style={{ color: "#8A7A5C" }}>({encontro.tema})</span>
                  </span>
                </label>
              ))}
            </div>
          );
        })()}

        {!gerando && encontros.map((e, idx) => (
          <div key={e.id} className="mb-3 rounded-lg p-4" style={{ background: "white", border: e.realizada ? "2px solid #4F6B3A55" : "2px solid #E97F3855" }}>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <input type="checkbox" checked={!!e.realizada} onChange={() => mudarEncontro(e.id, "realizada", !e.realizada)} title="Encontro realizado" />
              <span className="text-xs font-semibold" style={{ color: CORES.dourado }}>{idx + 1}.</span>
              <input className="font-serif flex-1 min-w-40 bg-transparent outline-none" style={{ color: CORES.fogo }} value={e.tema} onChange={(ev) => mudarEncontro(e.id, "tema", ev.target.value)} />
              <input className="w-24 px-2 py-1 text-xs rounded border bg-white text-center" style={{ borderColor: "#E0D5BC", color: "#6B5D42" }} placeholder="dd/mm" value={e.data} onChange={(ev) => mudarEncontro(e.id, "data", ev.target.value)} />
              <button onClick={() => onMudar({ ...mentoria, encontros: encontros.filter((x) => x.id !== e.id) })} className="px-1 text-xs" style={{ color: "#B8860B" }}>✕</button>
            </div>
            {e.objetivo && <div className="text-xs mb-1" style={{ color: "#6B5D42" }}>{e.objetivo}</div>}
            {e.provocacao && <div className="text-xs italic mb-2" style={{ color: "#8A7A5C" }}>Provocação: {e.provocacao}</div>}
            {(e.atividades || []).length > 0 && (
              <div className="mb-2 p-2 rounded" style={{ background: "#FDFAF3", border: "1px solid #EFE8D6" }}>
                <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: CORES.dourado }}>
                  Pra casa · {(e.atividades || []).filter((a) => a.feita).length}/{(e.atividades || []).length}
                </div>
                {(e.atividades || []).map((a) => (
                  <div key={a.id} className="flex items-center gap-2 py-0.5">
                    <input
                      type="checkbox"
                      checked={!!a.feita}
                      onChange={() => mudarEncontro(e.id, "atividades", e.atividades.map((x) => (x.id === a.id ? { ...x, feita: !x.feita } : x)))}
                    />
                    <input
                      className="flex-1 text-xs bg-transparent outline-none"
                      style={{ color: a.feita ? "#A89878" : CORES.fogoEscuro, textDecoration: a.feita ? "line-through" : "none" }}
                      value={a.texto}
                      onChange={(ev) => mudarEncontro(e.id, "atividades", e.atividades.map((x) => (x.id === a.id ? { ...x, texto: ev.target.value } : x)))}
                    />
                    <button
                      onClick={() => mudarEncontro(e.id, "atividades", e.atividades.filter((x) => x.id !== a.id))}
                      className="text-xs px-1"
                      style={{ color: "#C0B091" }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {(e.atividades || []).filter((a) => a.tipo === "fca").map((a) => (
                  <div key={`fca-${a.id}`} className="ml-5 mb-1 grid gap-1 p-2 rounded" style={{ background: "white", border: "1px dashed #E97F3855" }}>
                    <input className="px-2 py-0.5 text-xs rounded border bg-white" style={{ borderColor: "#E0D5BC", color: "#6B5D42" }} placeholder="Fato: o que aconteceu" value={a.fato || ""} onChange={(ev) => mudarEncontro(e.id, "atividades", e.atividades.map((x) => (x.id === a.id ? { ...x, fato: ev.target.value } : x)))} />
                    <input className="px-2 py-0.5 text-xs rounded border bg-white" style={{ borderColor: "#E0D5BC", color: "#6B5D42" }} placeholder="Causa: por que aconteceu" value={a.causa || ""} onChange={(ev) => mudarEncontro(e.id, "atividades", e.atividades.map((x) => (x.id === a.id ? { ...x, causa: ev.target.value } : x)))} />
                    <input className="px-2 py-0.5 text-xs rounded border bg-white" style={{ borderColor: "#E0D5BC", color: "#6B5D42" }} placeholder="Ação: o que farei diferente" value={a.acaoFca || ""} onChange={(ev) => mudarEncontro(e.id, "atividades", e.atividades.map((x) => (x.id === a.id ? { ...x, acaoFca: ev.target.value } : x)))} />
                  </div>
                ))}
              </div>
            )}
            <span className="flex gap-3 mb-2">
              <button
                onClick={() => mudarEncontro(e.id, "atividades", [...(e.atividades || []), { id: uid(), texto: "", feita: false }])}
                className="text-xs"
                style={{ color: CORES.dourado }}
              >
                + Atividade pra casa
              </button>
              <button
                onClick={() => mudarEncontro(e.id, "atividades", [...(e.atividades || []), { id: uid(), tipo: "fca", texto: "FCA da semana: analisar uma situação difícil (Fato → Causa → Ação)", fato: "", causa: "", acaoFca: "", feita: false }])}
                className="text-xs"
                style={{ color: "#9A6A2F" }}
                title="O mentorado analisa uma situação difícil da semana no formato Fato → Causa → Ação"
              >
                + FCA pra casa
              </button>
            </span>
            <textarea rows={2} className="w-full px-2 py-1 text-sm rounded border bg-white outline-none mb-1" style={{ borderColor: "#EFE8D6", color: CORES.fogoEscuro }} placeholder="Anotações da sessão..." value={e.anotacoes} onChange={(ev) => mudarEncontro(e.id, "anotacoes", ev.target.value)} />
            {e.anotacoes && (
              <div className="flex items-center gap-3 flex-wrap">
                <button onClick={() => onEstruturarSessao(e)} className="text-xs underline" style={{ color: CORES.dourado }} disabled={gerando}>
                  Estruturar com IA (resumo + ações)
                </button>
              </div>
            )}
            {e.acoes && (
              <div className="text-xs mt-1 p-2 rounded" style={{ background: "#FDFAF3", color: "#6B5D42" }}>
                <strong>Ações combinadas:</strong> {e.acoes.split("\n").join(" · ")}
              </div>
            )}
          </div>
        ))}

        {!gerando && (
          <button onClick={() => onMudar({ ...mentoria, encontros: [...encontros, { id: uid(), tema: "Novo encontro", objetivo: "", provocacao: "", data: "", anotacoes: "", acoes: "", realizada: false }] })} className="text-sm" style={{ color: CORES.dourado }}>
            + Adicionar encontro
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Módulo: Relatório de Evolução (mentoria) ───────────────────

function ModuloRelMentoria({ cliente, rel, diagsLider, metasAcordo, framework: fwRel, gerando, erro, onMudar, onGerar, onImprimir, onVoltar }) {
  const FRM = fwRel || FRAMEWORK_LIDER;
  const set = (campo) => (v) => onMudar({ ...rel, [campo]: v });
  const tem = rel.retrospectiva || rel.evolucao;
  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: "#B8860B", letterSpacing: 1 }}>
        ← {cliente.negocio}
      </button>
      <div className="rounded-lg p-6 shadow-sm" className="card">
        <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
          <h2 className="font-serif text-lg" style={{ color: CORES.fogo }}>Relatório de Evolução</h2>
          <div className="flex gap-2">
            <BotaoPrimario onClick={onGerar} disabled={gerando}>
              {gerando ? "Escrevendo..." : tem ? "Gerar novamente" : "Gerar com IA"}
            </BotaoPrimario>
            {tem && <BotaoContorno onClick={onImprimir}>Exportar PDF</BotaoContorno>}
          </div>
        </div>
        <p className="text-xs mb-4" style={{ color: "#8A7A5C" }}>
          Malfeito feito, versão pessoal: a prova da jornada — encontros, pra casa cumprido e o radar do líder antes/depois. O documento que renova a mentoria.
        </p>
        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}
        {!gerando && !tem && !erro && (
          <p className="text-sm py-4" style={{ color: "#8A7A5C" }}>
            Gere quando houver jornada caminhada — a IA escreve só com os dados reais: encontros realizados, atividades feitas e diagnósticos do líder.
          </p>
        )}
        {!gerando && (
          <div className="mb-4 p-3 rounded-lg" style={{ background: "#F5EDD9", border: "2px solid #D4AF37AA" }}>
            <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
              <div className="label" style={{ color: "#9A6A2F" }}>
                Verificação das metas do mentorado (fase Prova)
              </div>
              {(metasAcordo || []).length > 0 && (rel.metasVerificadas || []).length === 0 && (
                <button
                  onClick={() => onMudar({ ...rel, metasVerificadas: (metasAcordo || []).map((m) => ({ id: uid(), objetivo: m.objetivo, prazo: m.prazo, status: "parcial", porque: "" })) })}
                  className="text-xs underline"
                  style={{ color: CORES.dourado }}
                >
                  Puxar metas do Acordo
                </button>
              )}
            </div>
            {(rel.metasVerificadas || []).length === 0 && (
              <p className="text-xs" style={{ color: "#8A7A5C" }}>
                {(metasAcordo || []).length ? "Puxe as metas da proposta aceita e registre: batida, parcial ou não batida — com o porquê." : "Nenhuma meta na proposta aceita deste mentorado."}
              </p>
            )}
            {(rel.metasVerificadas || []).map((m) => (
              <div key={m.id} className="py-1.5 border-b" style={{ borderColor: "#EFE8D6" }}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex-1 text-sm" style={{ color: CORES.fogoEscuro }}>{m.objetivo}{m.prazo ? ` — até ${m.prazo}` : ""}</span>
                  <select
                    className="px-2 py-0.5 text-xs rounded border font-semibold"
                    style={
                      m.status === "batida"
                        ? { borderColor: "#4F6B3A", background: "#E3EBD8", color: "#4F6B3A" }
                        : m.status === "nao"
                        ? { borderColor: "#C77", background: "#F5DDD6", color: "#8A3A2E" }
                        : { borderColor: "#9A6A2F", background: "#F5E6C8", color: "#9A6A2F" }
                    }
                    value={m.status}
                    onChange={(e) => onMudar({ ...rel, metasVerificadas: rel.metasVerificadas.map((x) => (x.id === m.id ? { ...x, status: e.target.value } : x)) })}
                  >
                    <option value="batida">Batida ✓</option>
                    <option value="parcial">Parcial</option>
                    <option value="nao">Não batida</option>
                  </select>
                </div>
                <input
                  className="w-full mt-1 px-2 py-1 text-xs rounded border bg-white"
                  style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                  placeholder="Por quê"
                  value={m.porque}
                  onChange={(e) => onMudar({ ...rel, metasVerificadas: rel.metasVerificadas.map((x) => (x.id === m.id ? { ...x, porque: e.target.value } : x)) })}
                />
              </div>
            ))}
          </div>
        )}
        {!gerando && tem && (
          <>
            {diagsLider.length > 0 && (
              <div className="flex justify-center gap-8 my-4 flex-wrap">
                <div className="text-center">
                  <div className="text-xs mb-1" style={{ color: "#8A7A5C" }}>Início ({diagsLider[0].data})</div>
                  <RadarMaturidade notas={diagsLider[0].notas} tamanho={220} framework={FRM} />
                </div>
                {diagsLider.length > 1 && (
                  <div className="text-center">
                    <div className="text-xs mb-1" style={{ color: "#8A7A5C" }}>Atual ({diagsLider[diagsLider.length - 1].data})</div>
                    <RadarMaturidade notas={diagsLider[diagsLider.length - 1].notas} tamanho={220} framework={FRM} />
                  </div>
                )}
              </div>
            )}
            <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Retrospectiva da jornada</span><textarea rows={4} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} value={rel.retrospectiva} onChange={(e) => set("retrospectiva")(e.target.value)} /></label>
            <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Evolução observada</span><textarea rows={4} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} value={rel.evolucao} onChange={(e) => set("evolucao")(e.target.value)} /></label>
            <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Conquistas (uma por linha)</span><textarea rows={4} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} value={rel.conquistas} onChange={(e) => set("conquistas")(e.target.value)} /></label>
            <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Recomendações de continuidade (uma por linha)</span><textarea rows={3} className="w-full px-3 py-2 rounded border bg-white text-sm" style={{ borderColor: "#D9914F", color: CORES.fogoEscuro }} value={rel.recomendacoes} onChange={(e) => set("recomendacoes")(e.target.value)} /></label>
          </>
        )}
      </div>
    </div>
  );
}

function ImpressaoRelMentoria({ cliente, rel, diagsLider, framework: fwRel }) {
  const FRM = fwRel || FRAMEWORK_LIDER;
  if (!rel || !(rel.retrospectiva || rel.evolucao)) return null;
  const ROT_META_M = { batida: "Batida", parcial: "Parcial", nao: "Não batida" };
  const conquistas = emLinhasDoc(rel.conquistas);
  const recomendacoes = emLinhasDoc(rel.recomendacoes);
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "#2A1218" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="text-xs uppercase tracking-widest" style={{ color: CORES.dourado }}>Relatório de Evolução — Mentoria</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{cliente.negocio}</div>
        <div className="text-sm mt-1" style={{ color: "#6B5D42" }}>{cliente.segmento}</div>
      </div>
      {rel.retrospectiva && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Retrospectiva</div>
          <p className="text-sm">{rel.retrospectiva}</p>
        </div>
      )}
      {(rel.metasVerificadas || []).length > 0 && (
        <div className="mb-5 p-3" style={{ border: "1px solid #D9914F" }}>
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Metas do mentorado — verificação</div>
          {(rel.metasVerificadas || []).map((m) => (
            <div key={m.id} className="text-sm mb-1">
              <strong>{ROT_META_M[m.status] || m.status}:</strong> {m.objetivo}{m.prazo ? ` (até ${m.prazo})` : ""}
              {m.porque && <span className="text-xs italic" style={{ color: "#6B5D42" }}> — {m.porque}</span>}
            </div>
          ))}
        </div>
      )}
      {diagsLider.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: CORES.dourado }}>Maturidade de liderança</div>
          <div className="flex justify-center gap-10">
            <div className="text-center">
              <div className="text-xs mb-1" style={{ color: "#6B5D42" }}>Início ({diagsLider[0].data})</div>
              <RadarMaturidade notas={diagsLider[0].notas} tamanho={250} framework={FRM} />
            </div>
            {diagsLider.length > 1 && (
              <div className="text-center">
                <div className="text-xs mb-1" style={{ color: "#6B5D42" }}>Atual ({diagsLider[diagsLider.length - 1].data})</div>
                <RadarMaturidade notas={diagsLider[diagsLider.length - 1].notas} tamanho={250} framework={FRM} />
              </div>
            )}
          </div>
        </div>
      )}
      {rel.evolucao && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Evolução observada</div>
          <p className="text-sm">{rel.evolucao}</p>
        </div>
      )}
      {conquistas.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Conquistas</div>
          <ul className="text-sm list-disc pl-5">{conquistas.map((x, i) => <li key={i} className="mb-0.5">{x}</li>)}</ul>
        </div>
      )}
      {recomendacoes.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Recomendações de continuidade</div>
          <ul className="text-sm list-disc pl-5">{recomendacoes.map((x, i) => <li key={i} className="mb-0.5">{x}</li>)}</ul>
        </div>
      )}
      <RodapeImpressao />
    </div>
  );
}

// ─── Módulo: Bisbilhoscópio (anomalias) ─────────────────────────

function anomaliaVazia() {
  return { id: uid(), data: new Date().toLocaleDateString("pt-BR"), fato: "", quando: "", local: "", tag: "", causa: "", acao: "", responsavelSugerido: "", status: "relatada", frenteDestino: "" };
}

function ModuloAnomalias({ cliente, anomalias, frentes, gerando, erro, onMudar, onAnalisar, onEnviarAcao, onVoltar }) {
  const tags = {};
  anomalias.forEach((a) => { const t = (a.tag || a.local || "").trim().toLowerCase(); if (t) tags[t] = (tags[t] || 0) + 1; });
  const tratadas = anomalias.filter((a) => a.status === "tratada").length;
  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: "#B8860B", letterSpacing: 1 }}>
        ← {cliente.negocio}
      </button>
      <div className="rounded-lg p-6 shadow-sm" className="card">
        <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
          <h2 className="font-serif text-lg" style={{ color: CORES.fogo }}>Tratamento de Anomalias</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold" style={{ color: tratadas === anomalias.length && anomalias.length ? "#4F6B3A" : "#9A6A2F" }}>
              {tratadas}/{anomalias.length} tratadas
            </span>
            <BotaoPrimario onClick={() => onMudar([anomaliaVazia(), ...anomalias])}>+ Relatar anomalia</BotaoPrimario>
          </div>
        </div>
        <p className="text-xs mb-4" style={{ color: "#8A7A5C" }}>
          O bisbilhoscópio apita quando algo foge do padrão: POP não seguido, checklist falho, reclamação, fornecedor. Relatar → FCA → Agir. Registros 100% internos.
        </p>
        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}
        {!gerando && anomalias.length === 0 && !erro && (
          <p className="text-sm py-6" style={{ color: "#8A7A5C" }}>O bisbilhoscópio está em silêncio. Quando algo fugir do padrão na operação do cliente, relate aqui.</p>
        )}
        {!gerando && anomalias.map((a) => {
          const t = (a.tag || a.local || "").trim().toLowerCase();
          const recorrencia = t ? tags[t] : 0;
          return (
            <div key={a.id} className="mb-3 rounded-lg p-4" style={{ background: "white", border: a.status === "tratada" ? "2px solid #4F6B3A55" : "2px solid #E97F3855" }}>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs" style={{ color: "#A89878" }}>{a.data}</span>
                <select
                  className="px-2 py-0.5 text-xs rounded border font-semibold"
                  style={a.status === "tratada" ? { borderColor: "#4F6B3A", background: "#E3EBD8", color: "#4F6B3A" } : { borderColor: "#9A6A2F", background: "#F5E6C8", color: "#9A6A2F" }}
                  value={a.status}
                  onChange={(e) => onMudar(anomalias.map((x) => (x.id === a.id ? { ...x, status: e.target.value } : x)))}
                >
                  <option value="relatada">Relatada</option>
                  <option value="tratada">Tratada ✓</option>
                </select>
                {recorrencia > 1 && (
                  <span className="text-xs px-1.5 py-0.5 rounded font-semibold" style={{ background: "#F5DDD6", color: "#8A3A2E" }} title="Anomalia repetida sugere padrão errado ou pessoa na cadeira errada — cruze com o Chapéu Seletor (leitura interna)">
                    recorrente ×{recorrencia}
                  </span>
                )}
                <button onClick={() => onMudar(anomalias.filter((x) => x.id !== a.id))} className="ml-auto text-xs px-1" style={{ color: "#C0B091" }}>✕</button>
              </div>
              <div className="grid sm:grid-cols-3 gap-2 mb-2">
                <input className="sm:col-span-3 px-2 py-1 text-sm rounded border bg-white" style={{ borderColor: "#E0D5BC", color: CORES.fogoEscuro }} placeholder="Fato: o que aconteceu" value={a.fato} onChange={(e) => onMudar(anomalias.map((x) => (x.id === a.id ? { ...x, fato: e.target.value } : x)))} />
                <input className="px-2 py-1 text-xs rounded border bg-white" style={{ borderColor: "#E0D5BC", color: "#6B5D42" }} placeholder="Quando" value={a.quando} onChange={(e) => onMudar(anomalias.map((x) => (x.id === a.id ? { ...x, quando: e.target.value } : x)))} />
                <input className="px-2 py-1 text-xs rounded border bg-white" style={{ borderColor: "#E0D5BC", color: "#6B5D42" }} placeholder="Onde (setor/processo)" value={a.local} onChange={(e) => onMudar(anomalias.map((x) => (x.id === a.id ? { ...x, local: e.target.value } : x)))} />
                <input className="px-2 py-1 text-xs rounded border bg-white" style={{ borderColor: "#E0D5BC", color: "#6B5D42" }} placeholder="Tag p/ recorrência (ex.: estoque)" value={a.tag} onChange={(e) => onMudar(anomalias.map((x) => (x.id === a.id ? { ...x, tag: e.target.value } : x)))} />
              </div>
              {a.fato && !a.causa && (
                <button onClick={() => onAnalisar(a)} className="text-xs underline mb-2" style={{ color: CORES.dourado }} disabled={gerando}>
                  Analisar FCA com IA
                </button>
              )}
              {(a.causa || a.acao) && (
                <div className="grid gap-2 mb-2 p-2 rounded" style={{ background: "#FDFAF3", border: "1px solid #EFE8D6" }}>
                  <textarea rows={2} className="px-2 py-1 text-xs rounded border bg-white" style={{ borderColor: "#E0D5BC", color: "#6B5D42" }} placeholder="Causa raiz" value={a.causa} onChange={(e) => onMudar(anomalias.map((x) => (x.id === a.id ? { ...x, causa: e.target.value } : x)))} />
                  <input className="px-2 py-1 text-sm rounded border bg-white" style={{ borderColor: "#E0D5BC", color: CORES.fogoEscuro }} placeholder="Ação corretiva" value={a.acao} onChange={(e) => onMudar(anomalias.map((x) => (x.id === a.id ? { ...x, acao: e.target.value } : x)))} />
                  {a.acao && a.status !== "tratada" && frentes.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <select className="px-2 py-1 text-xs rounded border bg-white" style={{ borderColor: "#E0D5BC", color: "#6B5D42" }} value={a.frenteDestino || ""} onChange={(e) => onMudar(anomalias.map((x) => (x.id === a.id ? { ...x, frenteDestino: e.target.value } : x)))}>
                        <option value="">Enviar ação para a frente...</option>
                        {frentes.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
                      </select>
                      {a.frenteDestino && (
                        <button onClick={() => onEnviarAcao(a)} className="text-xs underline font-semibold" style={{ color: "#4F6B3A" }}>
                          Agir: enviar ao plano ✓
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Módulo: Painel do Engajamento ──────────────────────────────

function LinhaPainel({ rotulo, valor, alerta, dica }) {
  return (
    <div className="flex items-baseline justify-between py-1.5 border-b" style={{ borderColor: "#F5F0E4" }} title={dica || ""}>
      <span className="text-sm" style={{ color: CORES.fogoEscuro }}>{rotulo}</span>
      <span className="text-sm font-bold" style={{ color: alerta ? "#8A3A2E" : "#4F6B3A" }}>{valor}</span>
    </div>
  );
}

function ModuloPainel({ cliente, dados, painel, onMudar, onVoltar }) {
  const d = dados;
  const verificacaoDegradada = d.alertas.length > 0;
  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: "#B8860B", letterSpacing: 1 }}>
        ← {cliente.negocio}
      </button>
      <div className="rounded-lg p-6 shadow-sm" className="card">
        <h2 className="font-serif text-lg mb-1" style={{ color: CORES.fogo }}>Painel do Engajamento</h2>
        <p className="text-xs mb-4" style={{ color: "#8A7A5C" }}>
          Mede o engajamento pelo método (o cômodo Indicadores mede o negócio do cliente). Quando a verificação cai, o controle cai semanas depois.
        </p>
        {verificacaoDegradada && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "#F5DDD6", border: "2px solid #C77", color: "#8A3A2E" }}>
            ⚠ Verificações degradando — o resultado cai em semanas se nada mudar: {d.alertas.join("; ")}.
          </div>
        )}
        <div className="mb-5">
          <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: CORES.dourado }}>Itens de controle (resultado)</div>
          <LinhaPainel label="Índice de formalização" value={`${d.formalizacao}%`} alerta={d.formalizacao < 60} dica="% dos tipos de documento das frentes já gerados" />
          <LinhaPainel label="Pendências de conformidade resolvidas" value={`${d.cctResolvidos}/${d.cctTotal}`} alerta={d.cctTotal > 0 && d.cctResolvidos < d.cctTotal} />
          <div className="mt-2">
            <div className="text-xs mb-1" style={{ color: "#6B5D42" }}>Autonomia decisória — relato do dono na fase Prova ("quantas vezes te acionaram este mês para algo que a alçada já resolvia?")</div>
            <div className="flex gap-2">
              <input className="w-20 px-2 py-1 text-sm rounded border bg-white text-center" style={{ borderColor: "#E0D5BC" }} placeholder="nº/mês" value={painel.autonomiaAcionamentos || ""} onChange={(e) => onMudar({ ...painel, autonomiaAcionamentos: e.target.value })} />
              <input className="flex-1 px-2 py-1 text-sm rounded border bg-white" style={{ borderColor: "#E0D5BC" }} placeholder="Relato estruturado do dono" value={painel.autonomiaRelato || ""} onChange={(e) => onMudar({ ...painel, autonomiaRelato: e.target.value })} />
            </div>
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: CORES.dourado }}>Itens de verificação (causa — acompanhe nos ritos)</div>
          <div className="grid sm:grid-cols-2 gap-x-6">
            <div>
              <div className="text-xs mt-1 mb-0.5" style={{ color: "#6B5D42" }}>Checklists preenchidos na semana</div>
              <div className="flex items-center gap-1 text-sm">
                <input className="w-14 px-1 py-0.5 rounded border bg-white text-center" style={{ borderColor: "#E0D5BC" }} value={painel.checklistsFeitos || ""} onChange={(e) => onMudar({ ...painel, checklistsFeitos: e.target.value })} />
                <span style={{ color: "#8A7A5C" }}>de</span>
                <input className="w-14 px-1 py-0.5 rounded border bg-white text-center" style={{ borderColor: "#E0D5BC" }} value={painel.checklistsPrevistos || ""} onChange={(e) => onMudar({ ...painel, checklistsPrevistos: e.target.value })} />
                <span className="font-bold ml-1" style={{ color: d.pctChecklists !== null && d.pctChecklists < 70 ? "#8A3A2E" : "#4F6B3A" }}>{d.pctChecklists !== null ? `${d.pctChecklists}%` : "—"}</span>
              </div>
            </div>
            <div>
              <div className="text-xs mt-1 mb-0.5" style={{ color: "#6B5D42" }}>Ritos realizados na cadência</div>
              <div className="flex items-center gap-1 text-sm">
                <input className="w-14 px-1 py-0.5 rounded border bg-white text-center" style={{ borderColor: "#E0D5BC" }} value={painel.ritosFeitos || ""} onChange={(e) => onMudar({ ...painel, ritosFeitos: e.target.value })} />
                <span style={{ color: "#8A7A5C" }}>de</span>
                <input className="w-14 px-1 py-0.5 rounded border bg-white text-center" style={{ borderColor: "#E0D5BC" }} value={painel.ritosPrevistos || ""} onChange={(e) => onMudar({ ...painel, ritosPrevistos: e.target.value })} />
                <span className="font-bold ml-1" style={{ color: d.pctRitos !== null && d.pctRitos < 70 ? "#8A3A2E" : "#4F6B3A" }}>{d.pctRitos !== null ? `${d.pctRitos}%` : "—"}</span>
              </div>
            </div>
          </div>
          <div className="mt-2">
            <LinhaPainel label="Anomalias tratadas × relatadas" value={`${d.anomTratadas}/${d.anomTotal}`} alerta={d.anomTotal > 0 && d.anomTratadas / d.anomTotal < 0.7} />
            <LinhaPainel label="Atas registradas (última)" value={d.ultimaAta ? `${d.totalAtas} · ${d.ultimaAta}` : "nenhuma"} alerta={!d.ultimaAta} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── App ────────────────────────────────────────────────────────

export default function App() {
  const [clientes, setClientes] = useState([]);
  const [tela, setTela] = useState({ nome: "home" });
  const [tabelas, setTabelas] = useState({});
  const [cargosPorCliente, setCargosPorCliente] = useState({});
  const [gestaoPorCliente, setGestaoPorCliente] = useState({});
  const [estruturaPorCliente, setEstruturaPorCliente] = useState({});
  const [manualPorCliente, setManualPorCliente] = useState({});
  const [cctPorCliente, setCctPorCliente] = useState({});
  const [penseiraPorCliente, setPenseiraPorCliente] = useState({});
  const [popsPorCliente, setPopsPorCliente] = useState({});
  const [fluxosPorCliente, setFluxosPorCliente] = useState({});
  const [campoPorCliente, setCampoPorCliente] = useState({});
  const [treinamentosPorCliente, setTreinamentosPorCliente] = useState({});
  const [mentoriaPorCliente, setMentoriaPorCliente] = useState({});
  const [diagsLiderPorCliente, setDiagsLiderPorCliente] = useState({});
  // RelMentoria agora é integrado em mentoriaPorCliente[id].relatorio
  const [anomaliasPorCliente, setAnomaliasPorCliente] = useState({});
  const [painelPorCliente, setPainelPorCliente] = useState({});
  const [alcadasPorCliente, setAlcadasPorCliente] = useState({});
  const [ritosPorCliente, setRitosPorCliente] = useState({});
  const [indicadoresPorCliente, setIndicadoresPorCliente] = useState({});
  const [docsExtras, setDocsExtras] = useState({ politicas: {}, checklists: {}, atas: {} });
  const [pessoasPorCliente, setPessoasPorCliente] = useState({});
  const [diagsPorCliente, setDiagsPorCliente] = useState({});
  const [propostasPorCliente, setPropostasPorCliente] = useState({});
  const [relatoriosPorCliente, setRelatoriosPorCliente] = useState({});
  const [financeiroPorCliente, setFinanceiroPorCliente] = useState({});
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState(null);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    stGet("toca:clientes").then(async (cs) => {
      cs = cs || [];
      if (cs.length === 0) {
        const kenkyo = {
          id: uid(),
          negocio: "Grupo Kenkyo",
          segmento: "Restaurantes de cozinha japonesa/oriental — múltiplas unidades (salão, delivery e empório)",
          setores: "Salão, Cozinha, Sushibar, Bar, Delivery, Estoque/Produção",
          regras:
            "Celular no armário durante o expediente (uso só com autorização do líder); uniforme completo, limpo e trocado diariamente; sem adornos e sem barba na cozinha/produção; unhas curtas sem esmalte, desodorante sem perfume; tolerância de ponto de 5 min; hora extra só com solicitação expressa do líder (máx. 2h/dia); atestado entregue em até 48h; EPIs obrigatórios; registrar ponto de outra pessoa é infração grave",
          contexto:
            "Governança estruturada em central própria. Escala disciplinar: feedback → advertência → suspensão → desligamento. Reincidência aumenta gravidade. Sem registro = não existe.",
        };
        cs = [kenkyo];
        await stSet("toca:clientes", cs);
      }
      setClientes(cs);
      setPronto(true);
      const mapaG = {};
      const mapaP = {};
      const mapaD = {};
      const mapaR = {};
      const mapaF = {};
      for (const c of cs) {
        mapaG[c.id] = (await stGet(`toca:gestao:${c.id}`)) || { briefing: "", frentes: [] };
        mapaP[c.id] = (await stGet(`toca:propostas:${c.id}`)) || [];
        mapaD[c.id] = (await stGet(`toca:diagnosticos:${c.id}`)) || [];
        mapaR[c.id] = (await stGet(`toca:relatorios:${c.id}`)) || [];
        mapaF[c.id] = (await stGet(`toca:financeiro:${c.id}`)) || { parcelas: [] };
      }
      setGestaoPorCliente(mapaG);
      setPropostasPorCliente(mapaP);
      setDiagsPorCliente(mapaD);
      setRelatoriosPorCliente(mapaR);
      setFinanceiroPorCliente(mapaF);
    });
  }, []);

  const carregarDadosCliente = async (id) => {
    if (tabelas[id] === undefined) {
      const t = await stGet(`toca:tabela:${id}`);
      setTabelas((prev) => ({ ...prev, [id]: t }));
    }
    if (cargosPorCliente[id] === undefined) {
      const cg = await stGet(`toca:cargos:${id}`);
      setCargosPorCliente((prev) => ({ ...prev, [id]: cg || [] }));
    }
    if (estruturaPorCliente[id] === undefined) {
      const es = await stGet(`toca:estrutura:${id}`);
      setEstruturaPorCliente((prev) => ({ ...prev, [id]: es || [] }));
    }
    if (manualPorCliente[id] === undefined) {
      const mn = await stGet(`toca:manual:${id}`);
      setManualPorCliente((prev) => ({ ...prev, [id]: mn || [] }));
    }
    if (cctPorCliente[id] === undefined) {
      const ct = await stGet(`toca:cct:${id}`);
      setCctPorCliente((prev) => ({ ...prev, [id]: ct || { nomeArquivo: "", dataAnalise: "", pontos: [] } }));
    }
    if (penseiraPorCliente[id] === undefined) {
      const pn = await stGet(`toca:penseira:${id}`);
      setPenseiraPorCliente((prev) => ({ ...prev, [id]: pn || [] }));
    }
    if (popsPorCliente[id] === undefined) {
      const pp = await stGet(`toca:pops:${id}`);
      setPopsPorCliente((prev) => ({ ...prev, [id]: pp || [] }));
    }
    if (fluxosPorCliente[id] === undefined) {
      const fl = await stGet(`toca:fluxos:${id}`);
      setFluxosPorCliente((prev) => ({ ...prev, [id]: fl || [] }));
    }
    if (campoPorCliente[id] === undefined) {
      const cp = await stGet(`toca:campo:${id}`);
      setCampoPorCliente((prev) => ({ ...prev, [id]: cp || [] }));
    }
    if (treinamentosPorCliente[id] === undefined) {
      const tr = await stGet(`toca:treinamentos:${id}`);
      setTreinamentosPorCliente((prev) => ({ ...prev, [id]: tr || [] }));
    }
    if (mentoriaPorCliente[id] === undefined) {
      const mt = await stGet(`toca:mentoria:${id}`);
      const normalizarMentoria = (m) => ({ ...mentoriaVazia(), ...(m || {}) });
      setMentoriaPorCliente((prev) => ({ ...prev, [id]: normalizarMentoria(mt) }));
    }
    if (diagsLiderPorCliente[id] === undefined) {
      const dl = await stGet(`toca:diagslider:${id}`);
      setDiagsLiderPorCliente((prev) => ({ ...prev, [id]: dl || [] }));
    }
    // RelMentoria carregada como parte de mentoriaPorCliente.relatorio
    const relMentoriaCarregada = await stGet(`toca:relmentoria:${id}`);
    if (relMentoriaCarregada && mentoriaPorCliente[id]) {
      setMentoriaPorCliente((prev) => ({ ...prev, [id]: { ...prev[id], relatorio: relMentoriaCarregada } }));
    }
    if (anomaliasPorCliente[id] === undefined) {
      const an = await stGet(`toca:anomalias:${id}`);
      setAnomaliasPorCliente((prev) => ({ ...prev, [id]: an || [] }));
    }
    if (painelPorCliente[id] === undefined) {
      const pn = await stGet(`toca:painel:${id}`);
      setPainelPorCliente((prev) => ({ ...prev, [id]: pn || {} }));
    }
    if (alcadasPorCliente[id] === undefined) {
      const al = await stGet(`toca:alcadas:${id}`);
      setAlcadasPorCliente((prev) => ({ ...prev, [id]: al || { obs: "", itens: [] } }));
    }
    if (ritosPorCliente[id] === undefined) {
      const rt = await stGet(`toca:ritos:${id}`);
      setRitosPorCliente((prev) => ({ ...prev, [id]: rt || { obs: "", itens: [] } }));
    }
    if (indicadoresPorCliente[id] === undefined) {
      const ind = await stGet(`toca:indicadores:${id}`);
      setIndicadoresPorCliente((prev) => ({ ...prev, [id]: ind || { obs: "", itens: [] } }));
    }
    for (const tipo of ["politicas", "checklists", "atas"]) {
      if (docsExtras[tipo][id] === undefined) {
        const dd = await stGet(`toca:${tipo}:${id}`);
        setDocsExtras((prev) => ({ ...prev, [tipo]: { ...prev[tipo], [id]: dd || [] } }));
      }
    }
    if (pessoasPorCliente[id] === undefined) {
      const ps = await stGet(`toca:temperamentos:${id}`);
      setPessoasPorCliente((prev) => ({ ...prev, [id]: ps || [] }));
    }
    if (diagsPorCliente[id] === undefined) {
      const dg = await stGet(`toca:diagnosticos:${id}`);
      setDiagsPorCliente((prev) => ({ ...prev, [id]: dg || [] }));
    }
    if (propostasPorCliente[id] === undefined) {
      const pr = await stGet(`toca:propostas:${id}`);
      setPropostasPorCliente((prev) => ({ ...prev, [id]: pr || [] }));
    }
    if (relatoriosPorCliente[id] === undefined) {
      const rl = await stGet(`toca:relatorios:${id}`);
      setRelatoriosPorCliente((prev) => ({ ...prev, [id]: rl || [] }));
    }
    if (financeiroPorCliente[id] === undefined) {
      const fn = await stGet(`toca:financeiro:${id}`);
      setFinanceiroPorCliente((prev) => ({ ...prev, [id]: fn || { parcelas: [] } }));
    }
  };

  const abrirCliente = async (id) => {
    await carregarDadosCliente(id);
    setErro(null);
    setTela({ nome: "cliente", id });
  };

  const salvarNovoCliente = async (dados) => {
    const novo = { ...dados, id: uid() };
    const lista = [...clientes, novo];
    setClientes(lista);
    await stSet("toca:clientes", lista);
    abrirCliente(novo.id);
  };

  const salvarEdicaoCliente = async (dados) => {
    const lista = clientes.map((c) => (c.id === tela.id ? { ...c, ...dados } : c));
    setClientes(lista);
    await stSet("toca:clientes", lista);
    setTela({ nome: "cliente", id: tela.id });
  };

  const gerarTabela = async (cliente) => {
    setGerando(true);
    setErro(null);
    try {
      const itens = await comRetentativa(() => gerarInfracoes(cliente, pontosCCTDe(cliente.id), campoPorCliente[cliente.id] || []));
      setTabelas((prev) => ({ ...prev, [cliente.id]: itens }));
      await stSet(`toca:tabela:${cliente.id}`, itens);
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  const mudarTabela = async (clienteId, nova) => {
    setTabelas((prev) => ({ ...prev, [clienteId]: nova }));
    await stSet(`toca:tabela:${clienteId}`, nova);
  };

  const mudarCargos = async (clienteId, novos) => {
    setCargosPorCliente((prev) => ({ ...prev, [clienteId]: novos }));
    await stSet(`toca:cargos:${clienteId}`, novos);
  };

  const gerarCargo = async (cliente, cargo) => {
    setGerando(true);
    setErro(null);
    try {
      const cargos = cargosPorCliente[cliente.id] || [];
      const gerado = await comRetentativa(() => gerarDescricaoCargo(cliente, cargo, cargos.filter((c) => c.id !== cargo.id), pontosCCTDe(cliente.id), estruturaPorCliente[cliente.id] || [], (campoPorCliente[cliente.id] || []).filter((r) => r.tipo === "entrevista")));
      const atualizado = { ...cargo, ...gerado };
      await mudarCargos(cliente.id, cargos.map((c) => (c.id === cargo.id ? atualizado : c)));
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  const mudarGestao = async (clienteId, nova) => {
    setGestaoPorCliente((prev) => ({ ...prev, [clienteId]: nova }));
    await stSet(`toca:gestao:${clienteId}`, nova);
  };

  const gerarPlano = async (cliente) => {
    const gestao = gestaoPorCliente[cliente.id] || { briefing: "", frentes: [] };
    setGerando(true);
    setErro(null);
    try {
      const frentes = await comRetentativa(() => gerarPlanoAcao(cliente, gestao.briefing, pessoasPorCliente[cliente.id] || [], resumoCampo(campoPorCliente[cliente.id] || [], "riscos")));
      await mudarGestao(cliente.id, { ...gestao, frentes });
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  const mudarEstrutura = async (clienteId, novas) => {
    setEstruturaPorCliente((prev) => ({ ...prev, [clienteId]: novas }));
    await stSet(`toca:estrutura:${clienteId}`, novas);
  };

  const gerarOrganograma = async (cliente) => {
    setGerando(true);
    setErro(null);
    try {
      const posicoes = await comRetentativa(() => gerarEstrutura(cliente, cargosPorCliente[cliente.id] || [], (campoPorCliente[cliente.id] || []).filter((r) => r.tipo === "entrevista")));
      await mudarEstrutura(cliente.id, posicoes);
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  const mudarManual = async (clienteId, novas) => {
    setManualPorCliente((prev) => ({ ...prev, [clienteId]: novas }));
    await stSet(`toca:manual:${clienteId}`, novas);
  };

  const gerarManualCliente = async (cliente) => {
    setGerando(true);
    setErro(null);
    try {
      const secoes = await comRetentativa(() => gerarManual(cliente, pontosCCTDe(cliente.id), docsDe("politicas", cliente.id), estruturaPorCliente[cliente.id] || [], campoPorCliente[cliente.id] || []));
      await mudarManual(cliente.id, secoes);
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  const mudarCCT = async (clienteId, nova) => {
    setCctPorCliente((prev) => ({ ...prev, [clienteId]: nova }));
    await stSet(`toca:cct:${clienteId}`, nova);
  };

  const analisarCCTCliente = async (cliente, nomeArquivo, base64) => {
    setGerando(true);
    setErro(null);
    try {
      const atual = cctPorCliente[cliente.id] || { nomeArquivo: "", dataAnalise: "", documentos: [], pontos: [] };
      const pontos = await analisarCCT(cliente, base64, atual.pontos || []);
      const hoje = new Date().toLocaleDateString("pt-BR");
      const documentos = [...(atual.documentos || []), { id: uid(), nomeArquivo, dataAnalise: hoje }];
      await mudarCCT(cliente.id, { nomeArquivo, dataAnalise: hoje, documentos, pontos });
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  const pontosCCTDe = (clienteId) => (cctPorCliente[clienteId] && cctPorCliente[clienteId].pontos) || [];

  const enviarPenseira = async (cliente, textoUsuario) => {
    const historicoAtual = penseiraPorCliente[cliente.id] || [];
    const comPergunta = [...historicoAtual, { role: "user", content: textoUsuario }];
    setPenseiraPorCliente((prev) => ({ ...prev, [cliente.id]: comPergunta }));
    setGerando(true);
    setErro(null);
    try {
      const gestao = gestaoPorCliente[cliente.id] || { frentes: [] };
      const diags = diagsPorCliente[cliente.id] || [];
      const ultimoDiag = diags.length ? diags[diags.length - 1] : null;
      const linhaDiagPan = ultimoDiag
        ? `Diagnóstico (${ultimoDiag.data}): ${FRAMEWORK_DIAG.map((a, i) => {
            const p = percentualArea(ultimoDiag.notas, i);
            return p === null ? null : `${a.area} ${p}%`;
          }).filter(Boolean).join(", ")}${ultimoDiag.criticos ? ` | críticos: ${ultimoDiag.criticos.split("\n").join("; ")}` : ""}`
        : "Diagnóstico: não realizado";
      const semPan = semanaAtualDe(gestao.inicio, Number(gestao.duracaoSemanas) || 0);
      const atrasadasPan = semPan
        ? acoesNumeradas(gestao.frentes || []).filter((x) => x.acao.semana && !x.acao.feita && x.acao.semana < semPan)
        : [];
      const linhaCrono = semPan
        ? `Cronograma: semana ${semPan}${gestao.duracaoSemanas ? ` de ${gestao.duracaoSemanas}` : ""}${atrasadasPan.length ? ` | atrasadas: ${atrasadasPan.map((x) => x.acao.texto).join("; ")}` : " | sem atrasos"}`
        : "Cronograma: não iniciado";
      const inv = [
        tabelas[cliente.id] ? `tabela disciplinar (${tabelas[cliente.id].length})` : null,
        (cargosPorCliente[cliente.id] || []).length ? `${cargosPorCliente[cliente.id].length} cargos` : null,
        (estruturaPorCliente[cliente.id] || []).length ? `organograma (${estruturaPorCliente[cliente.id].length} posições)` : null,
        (manualPorCliente[cliente.id] || []).length ? `manual (${manualPorCliente[cliente.id].length} seções)` : null,
        (popsPorCliente[cliente.id] || []).length ? `${popsPorCliente[cliente.id].length} POPs` : null,
        (fluxosPorCliente[cliente.id] || []).length ? `${fluxosPorCliente[cliente.id].length} fluxos` : null,
        ((alcadasPorCliente[cliente.id] || {}).itens || []).length ? `alçadas (${alcadasPorCliente[cliente.id].itens.length})` : null,
        ((ritosPorCliente[cliente.id] || {}).itens || []).length ? `ritos (${ritosPorCliente[cliente.id].itens.length})` : null,
        ((indicadoresPorCliente[cliente.id] || {}).itens || []).length ? `indicadores (${indicadoresPorCliente[cliente.id].itens.length})` : null,
        docsDe("politicas", cliente.id).length ? `políticas (${docsDe("politicas", cliente.id).length})` : null,
        docsDe("checklists", cliente.id).length ? `checklists (${docsDe("checklists", cliente.id).length})` : null,
        docsDe("atas", cliente.id).length ? `atas (${docsDe("atas", cliente.id).length})` : null,
        (campoPorCliente[cliente.id] || []).length ? `trabalho de campo (${(campoPorCliente[cliente.id] || []).filter((r) => r.tipo === "visita").length} visitas, ${(campoPorCliente[cliente.id] || []).filter((r) => r.tipo === "entrevista").length} entrevistas, ${(campoPorCliente[cliente.id] || []).filter((r) => r.tipo === "turno").length} turnos)` : null,
        (treinamentosPorCliente[cliente.id] || []).length ? `treinamentos (${(treinamentosPorCliente[cliente.id] || []).filter((t) => t.status === "realizado").length} realizados de ${(treinamentosPorCliente[cliente.id] || []).length})` : null,
        ((mentoriaPorCliente[cliente.id] || {}).encontros || []).length ? `mentoria (${((mentoriaPorCliente[cliente.id] || {}).encontros || []).filter((e) => e.realizada).length}/${((mentoriaPorCliente[cliente.id] || {}).encontros || []).length} encontros)` : null,
      ].filter(Boolean).join(", ") || "nenhum documento produzido ainda";
      const riscosCampoPan = resumoCampo(campoPorCliente[cliente.id] || [], "riscos");
      const linhaTime = (pessoasPorCliente[cliente.id] || [])
        .filter((p) => p.nome)
        .map((p) => `${p.nome}${p.cargo ? ` (${p.cargo})` : ""}${p.dominante && TEMPERAMENTOS[p.dominante] ? ` — ${TEMPERAMENTOS[p.dominante].rotulo}` : ""}${p.contratante ? " [contratante]" : ""}`)
        .join("; ");
      const linhaMentoria = (mentoriaPorCliente[cliente.id] && (mentoriaPorCliente[cliente.id].encontros || []).length)
        ? `Mentoria: ${(mentoriaPorCliente[cliente.id].encontros || []).filter((e) => e.realizada).length}/${mentoriaPorCliente[cliente.id].encontros.length} encontros; objetivos: ${mentoriaPorCliente[cliente.id].objetivos || "nao declarados"}; proximos temas: ${(mentoriaPorCliente[cliente.id].encontros || []).filter((e) => !e.realizada).slice(0, 3).map((e) => e.tema).join(", ") || "nenhum"}; atividades pra casa pendentes: ${(mentoriaPorCliente[cliente.id].encontros || []).filter((e) => e.realizada).flatMap((e) => (e.atividades || []).filter((a) => !a.feita)).map((a) => a.texto).join("; ") || "nenhuma"}; praticas moldadoras: ${((mentoriaPorCliente[cliente.id].praticas || []).map((p) => `${p.texto} (${p.status})`).join("; ")) || "nenhuma prescrita"}; virtude central: ${(mentoriaPorCliente[cliente.id].moldagem && mentoriaPorCliente[cliente.id].moldagem.virtudeCentral && mentoriaPorCliente[cliente.id].moldagem.virtudeCentral.nome) || "nao definida"}; diario da virtude: ${((mentoriaPorCliente[cliente.id].virtudes || []).filter((v) => v.nota).slice(0, 5).map((v) => `${v.data}: ${v.nota}`).join("; ")) || "sem registros"}`
        : null;
      const panorama = [
        cliente.tipo === "pessoa" ? `ATENCAO: este cliente e uma PESSOA FISICA (mentorado de lideranca), nao uma empresa. Trate as perguntas no contexto de mentoria individual.` : null,
        linhaMentoria,
        linhaDiagPan,
        linhaCrono,
        `Documentos produzidos: ${inv}`,
        linhaTime ? `Time mapeado: ${linhaTime}` : null,
        riscosCampoPan ? `Riscos observados em campo: ${riscosCampoPan.slice(0, 500)}` : null,
      ].filter(Boolean).join("\n");
      const resposta = await conversarPenseira(cliente, pontosCCTDe(cliente.id), gestao.frentes, comPergunta, pessoasPorCliente[cliente.id] || [], panorama);
      const completo = [...comPergunta, { role: "assistant", content: resposta }];
      setPenseiraPorCliente((prev) => ({ ...prev, [cliente.id]: completo }));
      await stSet(`toca:penseira:${cliente.id}`, completo);
    } catch (e) {
      setErro(e.message || "erro desconhecido");
      await stSet(`toca:penseira:${cliente.id}`, comPergunta);
    } finally {
      setGerando(false);
    }
  };

  const limparPenseira = async (clienteId) => {
    setPenseiraPorCliente((prev) => ({ ...prev, [clienteId]: [] }));
    await stSet(`toca:penseira:${clienteId}`, []);
  };

  const mudarPops = async (clienteId, novos) => {
    setPopsPorCliente((prev) => ({ ...prev, [clienteId]: novos }));
    await stSet(`toca:pops:${clienteId}`, novos);
  };

  const gerarPopCliente = async (cliente, pop) => {
    setGerando(true);
    setErro(null);
    try {
      const pops = popsPorCliente[cliente.id] || [];
      const gerado = await comRetentativa(() => gerarPOP(cliente, pop, cargosPorCliente[cliente.id] || [], pontosCCTDe(cliente.id), fluxosPorCliente[cliente.id] || [], campoPorCliente[cliente.id] || []));
      const atualizado = { ...pop, ...gerado };
      await mudarPops(cliente.id, pops.map((p) => (p.id === pop.id ? atualizado : p)));
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  const docsDe = (tipo, clienteId) => docsExtras[tipo][clienteId] || [];

  const mudarDocs = async (tipo, clienteId, novos) => {
    setDocsExtras((prev) => ({ ...prev, [tipo]: { ...prev[tipo], [clienteId]: novos } }));
    await stSet(`toca:${tipo}:${clienteId}`, novos);
  };

  const gerarDocCliente = async (tipo, cliente, doc) => {
    setGerando(true);
    setErro(null);
    try {
      const gerado = await CONFIG_DOCS[tipo].gerar(cliente, doc, pontosCCTDe(cliente.id), { pops: popsPorCliente[cliente.id] || [], campo: campoPorCliente[cliente.id] || [] });
      const docs = docsDe(tipo, cliente.id);
      await mudarDocs(tipo, cliente.id, docs.map((d) => (d.id === doc.id ? { ...doc, ...gerado } : d)));
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  const mudarPessoas = async (clienteId, novas) => {
    setPessoasPorCliente((prev) => ({ ...prev, [clienteId]: novas }));
    await stSet(`toca:temperamentos:${clienteId}`, novas);
  };

  const analisarPessoa = async (cliente, pessoa) => {
    setGerando(true);
    setErro(null);
    try {
      const pessoas = pessoasPorCliente[cliente.id] || [];
      const gerado = await gerarAnaliseTemperamento(cliente, pessoa, cargosPorCliente[cliente.id] || []);
      const atualizada = { ...pessoa, ...gerado };
      await mudarPessoas(cliente.id, pessoas.map((p) => (p.id === pessoa.id ? atualizada : p)));
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  const mudarDiags = async (clienteId, novos) => {
    setDiagsPorCliente((prev) => ({ ...prev, [clienteId]: novos }));
    await stSet(`toca:diagnosticos:${clienteId}`, novos);
  };

  const gerarLeituraDiag = async (cliente, diag) => {
    setGerando(true);
    setErro(null);
    try {
      const gerado = await gerarLeituraDiagnostico(cliente, diag.notas, gestaoPorCliente[cliente.id], campoPorCliente[cliente.id] || []);
      const diags = diagsPorCliente[cliente.id] || [];
      await mudarDiags(cliente.id, diags.map((d) => (d.id === diag.id ? { ...diag, ...gerado } : d)));
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  const criarFrentesDeAreas = async (cliente, areas) => {
    const gestao = gestaoPorCliente[cliente.id] || { briefing: "", frentes: [] };
    const existentes = new Set((gestao.frentes || []).map((f) => f.nome.toLowerCase()));
    const novas = areas
      .filter((a) => !existentes.has(a.toLowerCase()))
      .map((a) => ({ id: uid(), nome: a, status: "nao_iniciada", escopo: "Origem: diagnóstico de maturidade (área abaixo de 50%)", acoes: [] }));
    if (novas.length > 0) {
      await mudarGestao(cliente.id, { ...gestao, frentes: [...(gestao.frentes || []), ...novas] });
    }
    setTela({ nome: "gestao", id: cliente.id });
  };

  const mudarPropostas = async (clienteId, novas) => {
    setPropostasPorCliente((prev) => ({ ...prev, [clienteId]: novas }));
    await stSet(`toca:propostas:${clienteId}`, novas);
  };

  const gerarPropostaCliente = async (cliente, prop) => {
    setGerando(true);
    setErro(null);
    try {
      const gerado = await comRetentativa(() => gerarProposta(
        cliente,
        prop,
        gestaoPorCliente[cliente.id] || { briefing: "", frentes: [] },
        diagsPorCliente[cliente.id] || [],
        pessoasPorCliente[cliente.id] || [],
        campoPorCliente[cliente.id] || [],
        mentoriaPorCliente[cliente.id] || null
      ));
      const props = propostasPorCliente[cliente.id] || [];
      await mudarPropostas(cliente.id, props.map((p) => (p.id === prop.id ? { ...prop, ...gerado } : p)));
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  const distribuirCronogramaCliente = async (cliente) => {
    const gestao = gestaoPorCliente[cliente.id] || { briefing: "", frentes: [] };
    setGerando(true);
    setErro(null);
    try {
      const mapa = await distribuirCronograma(cliente, gestao);
      const novasFrentes = (gestao.frentes || []).map((f) => ({
        ...f,
        acoes: (f.acoes || []).map((a) => (mapa[a.id] ? { ...a, semana: mapa[a.id] } : a)),
      }));
      await mudarGestao(cliente.id, { ...gestao, frentes: novasFrentes });
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  const mudarRelatorios = async (clienteId, novos) => {
    setRelatoriosPorCliente((prev) => ({ ...prev, [clienteId]: novos }));
    await stSet(`toca:relatorios:${clienteId}`, novos);
  };

  const gerarRelatorioCliente = async (cliente, rel) => {
    setGerando(true);
    setErro(null);
    try {
      const gestao = gestaoPorCliente[cliente.id] || { briefing: "", frentes: [] };
      const frentes = gestao.frentes || [];
      const diags = diagsPorCliente[cliente.id] || [];
      const primeiro = diags.length > 1 ? diags[0] : null;
      const ultimo = diags.length ? diags[diags.length - 1] : null;
      const linhaDiag = (d) =>
        FRAMEWORK_DIAG.map((a, i) => {
          const p = percentualArea(d.notas, i);
          return p === null ? null : `${a.area} ${p}%`;
        }).filter(Boolean).join(", ");
      const acoes = acoesNumeradas(frentes);
      const feitas = acoes.filter((x) => x.acao.feita).length;
      const docsContagem = [
        tabelas[cliente.id] ? `tabela disciplinar (${tabelas[cliente.id].length} infrações)` : null,
        (cargosPorCliente[cliente.id] || []).length ? `${cargosPorCliente[cliente.id].length} descrições de cargo` : null,
        (estruturaPorCliente[cliente.id] || []).length ? `organograma (${estruturaPorCliente[cliente.id].length} posições)` : null,
        (manualPorCliente[cliente.id] || []).length ? `manual do colaborador (${manualPorCliente[cliente.id].length} seções)` : null,
        (popsPorCliente[cliente.id] || []).length ? `${popsPorCliente[cliente.id].length} POPs` : null,
        docsDe("politicas", cliente.id).length ? `${docsDe("politicas", cliente.id).length} políticas internas` : null,
        docsDe("checklists", cliente.id).length ? `${docsDe("checklists", cliente.id).length} checklists` : null,
        (fluxosPorCliente[cliente.id] || []).length ? `${fluxosPorCliente[cliente.id].length} desenhos de processo` : null,
        ((alcadasPorCliente[cliente.id] || {}).itens || []).length ? `matriz de alçadas (${alcadasPorCliente[cliente.id].itens.length} decisões)` : null,
        ((ritosPorCliente[cliente.id] || {}).itens || []).length ? `${ritosPorCliente[cliente.id].itens.length} ritos de gestão` : null,
        ((indicadoresPorCliente[cliente.id] || {}).itens || []).length ? `painel com ${indicadoresPorCliente[cliente.id].itens.length} indicadores` : null,
        (campoPorCliente[cliente.id] || []).length ? `trabalho de campo: ${(campoPorCliente[cliente.id] || []).filter((r) => r.tipo === "visita").length} visita(s) técnica(s), ${(campoPorCliente[cliente.id] || []).filter((r) => r.tipo === "entrevista").length} entrevista(s) de função, ${(campoPorCliente[cliente.id] || []).filter((r) => r.tipo === "turno").length} turno(s) acompanhado(s)` : null,
        (treinamentosPorCliente[cliente.id] || []).filter((t) => t.status === "realizado").length ? `${(treinamentosPorCliente[cliente.id] || []).filter((t) => t.status === "realizado").length} treinamento(s) realizado(s): ${(treinamentosPorCliente[cliente.id] || []).filter((t) => t.status === "realizado").map((t) => t.tema).join(", ")}` : null,
        (pessoasPorCliente[cliente.id] || []).length ? `${pessoasPorCliente[cliente.id].length} pessoas mapeadas por temperamento` : null,
      ].filter(Boolean).join("; ") || "nenhum documento registrado";

      const resumo = [
        `Frentes: ${frentes.map((f) => `${f.nome} (${STATUS_FRENTE[f.status] ? STATUS_FRENTE[f.status].rotulo : f.status})`).join("; ") || "nenhuma"}`,
        `Ações do plano: ${feitas}/${acoes.length} concluídas`,
        primeiro ? `Diagnóstico inicial (${primeiro.data}): ${linhaDiag(primeiro)}` : null,
        ultimo ? `Diagnóstico ${primeiro ? "final" : "único"} (${ultimo.data}): ${linhaDiag(ultimo)}` : "Diagnóstico: não realizado",
        `Documentos produzidos: ${docsContagem}`,
        `Atas de reunião registradas: ${docsDe("atas", cliente.id).length}`,
      ].filter(Boolean).join("\n");

      const gerado = await comRetentativa(() => gerarRelatorio(cliente, rel, resumo));
      const rels = relatoriosPorCliente[cliente.id] || [];
      await mudarRelatorios(cliente.id, rels.map((r) => (r.id === rel.id ? { ...rel, ...gerado } : r)));
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  const mudarFinanceiro = async (clienteId, novo) => {
    setFinanceiroPorCliente((prev) => ({ ...prev, [clienteId]: novo }));
    await stSet(`toca:financeiro:${clienteId}`, novo);
  };

  const TIPOS_BACKUP = ["tabela", "cargos", "gestao", "estrutura", "manual", "cct", "penseira", "pops", "fluxos", "alcadas", "ritos", "indicadores", "politicas", "checklists", "atas", "temperamentos", "diagnosticos", "propostas", "relatorios", "financeiro", "campo", "treinamentos", "mentoria", "diagslider", "relmentoria", "anomalias", "painel"];

  const exportarBackup = async () => {
    const dados = { versao: 1, exportadoEm: new Date().toISOString(), clientes, precificacao, porCliente: {} };
    for (const c of clientes) {
      dados.porCliente[c.id] = {};
      for (const tipo of TIPOS_BACKUP) {
        dados.porCliente[c.id][tipo] = await stGet(`toca:${tipo}:${c.id}`);
      }
    }
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `a-toca-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const [backupPendente, setBackupPendente] = useState(null);
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [precificacao, setPrecificacao] = useState({ base: "", porFrente: "", porSemana: "", porEncontro: "" });

  useEffect(() => {
    (async () => {
      const p = await stGet("toca:precificacao");
      if (p) setPrecificacao(p);
    })();
  }, []);

  const mudarPrecificacao = async (nova) => {
    setPrecificacao(nova);
    await stSet("toca:precificacao", nova);
  };

  const importarBackup = async (arquivo) => {
    try {
      const texto = await arquivo.text();
      const dados = JSON.parse(texto);
      if (!dados || !Array.isArray(dados.clientes)) throw new Error("arquivo inválido");
      setBackupPendente(dados);
    } catch (e) {
      setErro("Falha ao ler o backup: " + (e.message || "arquivo inválido"));
    }
  };

  const aplicarBackup = async () => {
    const dados = backupPendente;
    if (!dados) return;
    await stSet("toca:clientes", dados.clientes);
    if (dados.precificacao) await stSet("toca:precificacao", dados.precificacao);
    for (const c of dados.clientes) {
      const pacote = (dados.porCliente || {})[c.id] || {};
      for (const tipo of TIPOS_BACKUP) {
        if (pacote[tipo] !== null && pacote[tipo] !== undefined) {
          await stSet(`toca:${tipo}:${c.id}`, pacote[tipo]);
        }
      }
    }
    window.location.reload();
  };

  const excluirCliente = async (clienteId) => {
    const lista = clientes.filter((c) => c.id !== clienteId);
    setClientes(lista);
    await stSet("toca:clientes", lista);
    for (const tipo of TIPOS_BACKUP) {
      try {
        await window.storage.delete(`toca:${tipo}:${clienteId}`);
      } catch {}
    }
    if (tela.id === clienteId) setTela({ nome: "home" });
  };

  const mudarTreinamentos = async (clienteId, novos) => {
    setTreinamentosPorCliente((prev) => ({ ...prev, [clienteId]: novos }));
    await stSet(`toca:treinamentos:${clienteId}`, novos);
  };

  const gerarTreinamentoCliente = async (cliente, trein) => {
    setGerando(true);
    setErro(null);
    try {
      const frente = ((gestaoPorCliente[cliente.id] || {}).frentes || []).find((f) => f.id === trein.frenteId) || null;
      const gerado = await comRetentativa(() => gerarPlanoTreinamento(cliente, trein, frente, pessoasPorCliente[cliente.id] || [], campoPorCliente[cliente.id] || []));
      const lista = treinamentosPorCliente[cliente.id] || [];
      await mudarTreinamentos(cliente.id, lista.map((t) => (t.id === trein.id ? { ...trein, ...gerado } : t)));
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  const mudarDiagsLider = async (clienteId, novos) => {
    setDiagsLiderPorCliente((prev) => ({ ...prev, [clienteId]: novos }));
    await stSet(`toca:diagslider:${clienteId}`, novos);
  };

  const gerarLeituraLiderCliente = async (cliente, diag) => {
    setGerando(true);
    setErro(null);
    try {
      const mentoria = mentoriaPorCliente[cliente.id] || {};
      const mentorado = (pessoasPorCliente[cliente.id] || []).find((p) => p.id === mentoria.mentoradoId) || (pessoasPorCliente[cliente.id] || []).find((p) => p.contratante) || null;
      const gerado = await comRetentativa(() => gerarLeituraDiagLider(cliente, diag.notas, mentoria, mentorado));
      const lista = diagsLiderPorCliente[cliente.id] || [];
      await mudarDiagsLider(cliente.id, lista.map((d) => (d.id === diag.id ? { ...diag, ...gerado } : d)));
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  const mudarAnomalias = async (clienteId, novas) => {
    setAnomaliasPorCliente((prev) => ({ ...prev, [clienteId]: novas }));
    await stSet(`toca:anomalias:${clienteId}`, novas);
  };

  const analisarAnomaliaCliente = async (cliente, anomalia) => {
    setGerando(true);
    setErro(null);
    try {
      const r = await comRetentativa(() => analisarAnomalia(cliente, anomalia, popsPorCliente[cliente.id] || [], fluxosPorCliente[cliente.id] || []));
      await mudarAnomalias(cliente.id, (anomaliasPorCliente[cliente.id] || []).map((a) => (a.id === anomalia.id ? { ...a, ...r } : a)));
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  const enviarAcaoAnomalia = async (cliente, anomalia) => {
    const g = gestaoPorCliente[cliente.id];
    if (!g || !anomalia.frenteDestino || !anomalia.acao) return;
    const novasFrentes = (g.frentes || []).map((f) =>
      f.id === anomalia.frenteDestino
        ? { ...f, acoes: [...(f.acoes || []), { id: uid(), texto: anomalia.acao, porque: `Anomalia de ${anomalia.data}: ${anomalia.fato}`.slice(0, 120), responsavel: anomalia.responsavelSugerido || "", feita: false }] }
        : f
    );
    await mudarGestao(cliente.id, { ...g, frentes: novasFrentes });
    await mudarAnomalias(cliente.id, (anomaliasPorCliente[cliente.id] || []).map((a) => (a.id === anomalia.id ? { ...a, status: "tratada" } : a)));
  };

  const mudarPainel = async (clienteId, novo) => {
    setPainelPorCliente((prev) => ({ ...prev, [clienteId]: novo }));
    await stSet(`toca:painel:${clienteId}`, novo);
  };

  const dadosPainelDe = (clienteId) => {
    const docsPrevistos = ["tabela", "cargos", "estrutura", "manual", "politicas", "pops", "fluxos", "alcadas", "ritos", "indicadores", "checklists"];
    const temConteudo = {
      tabela: (tabelas[clienteId] || []).length > 0,
      cargos: (cargosPorCliente[clienteId] || []).length > 0,
      estrutura: (estruturaPorCliente[clienteId] || []).length > 0,
      manual: docsDe("manual", clienteId).length > 0,
      politicas: docsDe("politicas", clienteId).length > 0,
      pops: (popsPorCliente[clienteId] || []).length > 0,
      fluxos: (fluxosPorCliente[clienteId] || []).length > 0,
      alcadas: (((alcadasPorCliente[clienteId] || {}).itens) || []).length > 0,
      ritos: (((ritosPorCliente[clienteId] || {}).itens) || []).length > 0,
      indicadores: (((indicadoresPorCliente[clienteId] || {}).itens) || []).length > 0,
      checklists: docsDe("checklists", clienteId).length > 0,
    };
    const gerados = docsPrevistos.filter((d) => temConteudo[d]).length;
    const formalizacao = Math.round((gerados / docsPrevistos.length) * 100);
    const pontos = pontosCCTDe(clienteId);
    const cctResolvidos = pontos.filter((p) => p.statusConf === "resolvido").length;
    const anomalias = anomaliasPorCliente[clienteId] || [];
    const p = painelPorCliente[clienteId] || {};
    const pct = (f, t) => { const nf = Number(f), nt = Number(t); return nt > 0 ? Math.round((nf / nt) * 100) : null; };
    const pctChecklists = pct(p.checklistsFeitos, p.checklistsPrevistos);
    const pctRitos = pct(p.ritosFeitos, p.ritosPrevistos);
    const g = gestaoPorCliente[clienteId] || {};
    const atas = g.atas || [];
    const anomTratadas = anomalias.filter((a) => a.status === "tratada").length;
    const alertas = [];
    if (pctChecklists !== null && pctChecklists < 70) alertas.push("checklists abaixo de 70%");
    if (pctRitos !== null && pctRitos < 70) alertas.push("ritos fora da cadência");
    if (anomalias.length > 0 && anomTratadas / anomalias.length < 0.7) alertas.push("anomalias acumulando sem tratamento");
    if (atas.length === 0) alertas.push("nenhuma ata registrada");
    return {
      formalizacao,
      cctResolvidos,
      cctTotal: pontos.length,
      pctChecklists,
      pctRitos,
      anomTratadas,
      anomTotal: anomalias.length,
      totalAtas: atas.length,
      ultimaAta: atas.length ? atas[atas.length - 1].data : null,
      alertas,
    };
  };

  const mudarRelMentoria = async (clienteId, novo) => {
    setMentoriaPorCliente((prev) => ({ ...prev, [clienteId]: { ...(prev[clienteId] || mentoriaVazia()), relatorio: novo } }));
    await stSet(`toca:relmentoria:${clienteId}`, novo);
  };

  const gerarRelMentoriaCliente = async (cliente) => {
    setGerando(true);
    setErro(null);
    try {
      const mentoria = mentoriaPorCliente[cliente.id] || { encontros: [] };
      const mentorado = (pessoasPorCliente[cliente.id] || []).find((p) => p.id === mentoria.mentoradoId) || null;
      const gerado = await comRetentativa(() => gerarRelatorioEvolucao(cliente, mentoria, mentorado, diagsLiderPorCliente[cliente.id] || []));
      await mudarRelMentoria(cliente.id, { ...(mentoriaPorCliente[cliente.id]?.relatorio || {}), ...gerado });
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  const gerarMetasCliente = async (cliente, prop) => {
    setGerando(true);
    setErro(null);
    try {
      const metas = cliente.tipo === "pessoa"
        ? await comRetentativa(() => gerarMetasMentorado(cliente, mentoriaPorCliente[cliente.id], diagsLiderPorCliente[cliente.id] || []))
        : await comRetentativa(() => gerarMetasEngajamento(cliente, diagsPorCliente[cliente.id] || [], resumoCampo(campoPorCliente[cliente.id] || [], "riscos"), pontosCCTDe(cliente.id)));
      const lista = propostasPorCliente[cliente.id] || [];
      const existentes = (prop.metas || []).filter((m) => m.objetivo);
      await mudarPropostas(cliente.id, lista.map((p) => (p.id === prop.id ? { ...prop, metas: [...existentes, ...metas] } : p)));
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  const gerarRelTreinamentoCliente = async (cliente, trein) => {
    setGerando(true);
    setErro(null);
    try {
      const gerado = await comRetentativa(() => gerarRelatorioTreinamento(cliente, trein));
      const lista = treinamentosPorCliente[cliente.id] || [];
      await mudarTreinamentos(cliente.id, lista.map((t) => (t.id === trein.id ? { ...trein, ...gerado } : t)));
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  const mudarMentoria = async (clienteId, nova) => {
    setMentoriaPorCliente((prev) => ({ ...prev, [clienteId]: nova }));
    await stSet(`toca:mentoria:${clienteId}`, nova);
  };

  const gerarJornadaCliente = async (cliente) => {
    const mentoria = mentoriaPorCliente[cliente.id] || mentoriaVazia();
    setGerando(true);
    setErro(null);
    try {
      const mentorado = (pessoasPorCliente[cliente.id] || []).find((p) => p.id === mentoria.mentoradoId) || null;
      const diags = diagsPorCliente[cliente.id] || [];
      const diagsL = diagsLiderPorCliente[cliente.id] || [];
      const encontros = await comRetentativa(() => gerarJornadaMentoria(cliente, mentoria, mentorado, diags.length ? diags[diags.length - 1] : null, pessoasPorCliente[cliente.id] || [], diagsL.length ? diagsL[diagsL.length - 1] : null));
      // preserva encontros já realizados/anotados no topo
      const preservados = (mentoria.encontros || []).filter((e) => e.realizada || e.anotacoes);
      await mudarMentoria(cliente.id, { ...mentoria, encontros: [...preservados, ...encontros] });
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  const gerarFichaMoldagemCliente = async (cliente) => {
    const mentoria = mentoriaPorCliente[cliente.id] || {};
    setGerando(true);
    setErro(null);
    try {
      const mentorado = (pessoasPorCliente[cliente.id] || []).find((p) => p.id === mentoria.mentoradoId) || null;
      const ficha = await comRetentativa(() => gerarFichaMoldagem(cliente, mentoria, mentorado, diagsLiderPorCliente[cliente.id] || []));
      await mudarMentoria(cliente.id, { ...mentoria, moldagem: { ...ficha, praticasSugeridas: ficha.praticasSugeridas } });
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  const estruturarSessaoCliente = async (cliente, sessao) => {
    const mentoria = mentoriaPorCliente[cliente.id];
    setGerando(true);
    setErro(null);
    try {
      const r = await comRetentativa(() => estruturarSessaoMentoria(cliente, sessao));
      const existentes = new Set((sessao.atividades || []).map((a) => a.texto.trim().toLowerCase()));
      const novas = (r.novasAtividades || [])
        .filter((t) => !existentes.has(String(t).trim().toLowerCase()))
        .map((t) => ({ id: uid(), texto: t, feita: false }));
      await mudarMentoria(cliente.id, {
        ...mentoria,
        encontros: mentoria.encontros.map((e) =>
          e.id === sessao.id
            ? { ...e, anotacoes: r.anotacoes, acoes: r.acoes, atividades: [...(e.atividades || []), ...novas] }
            : e
        ),
      });
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  const mudarCampo = async (clienteId, novos) => {
    setCampoPorCliente((prev) => ({ ...prev, [clienteId]: novos }));
    await stSet(`toca:campo:${clienteId}`, novos);
  };

  const gerarRoteiroCampo = async (cliente, reg) => {
    setGerando(true);
    setErro(null);
    try {
      const roteiro =
        reg.tipo === "visita"
          ? await comRetentativa(() => gerarRoteiroVisita(cliente, (gestaoPorCliente[cliente.id] || {}).frentes || [], pontosCCTDe(cliente.id), reg, campoPorCliente[cliente.id] || []))
          : await comRetentativa(() => gerarRoteiroEntrevista(cliente, reg, cargosPorCliente[cliente.id] || []));
      const registros = campoPorCliente[cliente.id] || [];
      await mudarCampo(cliente.id, registros.map((r) => (r.id === reg.id ? { ...reg, roteiro } : r)));
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  const mudarFluxos = async (clienteId, novos) => {
    setFluxosPorCliente((prev) => ({ ...prev, [clienteId]: novos }));
    await stSet(`toca:fluxos:${clienteId}`, novos);
  };

  const gerarFluxoCliente = async (cliente, fluxo) => {
    setGerando(true);
    setErro(null);
    try {
      const gerado = await gerarFluxo(cliente, fluxo, cargosPorCliente[cliente.id] || [], popsPorCliente[cliente.id] || [], campoPorCliente[cliente.id] || []);
      const fluxos = fluxosPorCliente[cliente.id] || [];
      await mudarFluxos(cliente.id, fluxos.map((f) => (f.id === fluxo.id ? { ...fluxo, ...gerado } : f)));
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  const mudarAlcadas = async (clienteId, novas) => {
    setAlcadasPorCliente((prev) => ({ ...prev, [clienteId]: novas }));
    await stSet(`toca:alcadas:${clienteId}`, novas);
  };

  const gerarAlcadasCliente = async (cliente) => {
    const alcadas = alcadasPorCliente[cliente.id] || { obs: "", itens: [] };
    setGerando(true);
    setErro(null);
    try {
      const itens = await gerarAlcadas(cliente, alcadas.obs, cargosPorCliente[cliente.id] || [], estruturaPorCliente[cliente.id] || [], (campoPorCliente[cliente.id] || []).filter((r) => r.tipo === "entrevista"));
      await mudarAlcadas(cliente.id, { ...alcadas, itens });
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  const mudarRitos = async (clienteId, novos) => {
    setRitosPorCliente((prev) => ({ ...prev, [clienteId]: novos }));
    await stSet(`toca:ritos:${clienteId}`, novos);
  };

  const gerarRitosCliente = async (cliente) => {
    const ritos = ritosPorCliente[cliente.id] || { obs: "", itens: [] };
    const painel = indicadoresPorCliente[cliente.id] || { obs: "", itens: [] };
    setGerando(true);
    setErro(null);
    try {
      const itens = await gerarRitos(cliente, ritos.obs, cargosPorCliente[cliente.id] || [], painel.itens || []);
      await mudarRitos(cliente.id, { ...ritos, itens });
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  const mudarIndicadores = async (clienteId, novos) => {
    setIndicadoresPorCliente((prev) => ({ ...prev, [clienteId]: novos }));
    await stSet(`toca:indicadores:${clienteId}`, novos);
  };

  const gerarIndicadoresCliente = async (cliente) => {
    const painel = indicadoresPorCliente[cliente.id] || { obs: "", itens: [] };
    setGerando(true);
    setErro(null);
    try {
      const diags = diagsPorCliente[cliente.id] || [];
      const itens = await gerarIndicadores(cliente, painel.obs, cargosPorCliente[cliente.id] || [], diags.length ? diags[diags.length - 1] : null);
      await mudarIndicadores(cliente.id, { ...painel, itens });
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  const atualizarPlano = async (cliente) => {
    const gestao = gestaoPorCliente[cliente.id] || { briefing: "", frentes: [] };
    const atas = docsDe("atas", cliente.id);
    const comConteudo = atas.filter((a) => a.resumo);
    const ultimaAta = comConteudo.length ? comConteudo[comConteudo.length - 1] : null;
    setGerando(true);
    setErro(null);
    try {
      const frentes = await comRetentativa(() => gerarAtualizacaoPlano(cliente, gestao, ultimaAta, pessoasPorCliente[cliente.id] || [], resumoCampo(campoPorCliente[cliente.id] || [], "riscos")));
      await mudarGestao(cliente.id, { ...gestao, frentes });
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  const faseDoCliente = (c) => {
    const g = gestaoPorCliente[c.id] || { briefing: "", frentes: [] };
    const duracao = Number(g.duracaoSemanas) || 0;
    const semAtual = semanaAtualDe(g.inicio, duracao);
    const atrasadas = semAtual
      ? acoesNumeradas(g.frentes || []).filter((x) => x.acao.semana && !x.acao.feita && x.acao.semana < semAtual).length
      : 0;
    const fin = financeiroPorCliente[c.id] || { parcelas: [] };
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const vencidas = (fin.parcelas || []).some((p) => {
      if (p.pago) return false;
      const v = parseDataBR(p.vencimento);
      return v && v < hoje;
    });
    const servicosC = c.servicos || { consultoria: true };
    const encerrado = (relatoriosPorCliente[c.id] || []).some((r) => r.retrospectiva);
    if (encerrado) return "encerrado";
    if (atrasadas > 0 || vencidas) return "perigo";
    if (!servicosC.consultoria) {
      const ment = mentoriaPorCliente[c.id] || { encontros: [] };
      const encontros = ment.encontros || [];
      const treinos = treinamentosPorCliente[c.id] || [];
      const rm = mentoriaPorCliente[c.id]?.relatorio || {};
      const realizadosM = encontros.filter((e) => e.realizada).length;
      const atividadesM = encontros.flatMap((e) => e.atividades || []);
      const pctPraCasaM = atividadesM.length ? atividadesM.filter((a) => a.feita).length / atividadesM.length : 0;
      if (encontros.length > 0 && encontros.every((e) => e.realizada) && (rm.retrospectiva || rm.evolucao)) return "encerrado";
      if (encontros.length > 0 && encontros.every((e) => e.realizada)) return "prova";
      if (encontros.length > 0 && realizadosM / encontros.length >= 0.6 && pctPraCasaM >= 0.5) return "sustentacao";
      if (realizadosM > 0 || treinos.some((t) => t.status === "realizado")) return "construcao";
      if ((propostasPorCliente[c.id] || []).some((p) => p.status === "aceita")) return "construcao";
      if ((propostasPorCliente[c.id] || []).some((p) => p.apresentacao)) return "acordo";
      if ((diagsLiderPorCliente[c.id] || []).length > 0) return "raiox";
      if (encontros.length > 0 || treinos.length > 0 || ((ment.briefing || ment.objetivos || "").trim())) return "escuta";
      return "prospeccao";
    }
    if (semAtual && semAtual >= 1) {
      if (duracao > 0 && semAtual >= duracao - 1) return "prova";
      // Sustentação: maioria das ações concluídas + primeiro rito com ata registrada
      const acoesTodas = acoesNumeradas(g.frentes || []);
      const pctFeitas = acoesTodas.length ? acoesTodas.filter((x) => x.acao.feita).length / acoesTodas.length : 0;
      const temRitos = ((ritosPorCliente[c.id] || {}).itens || []).length > 0;
      const temAta = (g.atas || []).length > 0;
      if (pctFeitas > 0.5 && temRitos && temAta) return "sustentacao";
      return "construcao";
    }
    if ((propostasPorCliente[c.id] || []).some((p) => p.status === "aceita")) return "construcao";
    if ((propostasPorCliente[c.id] || []).some((p) => p.apresentacao)) return "acordo";
    if ((diagsPorCliente[c.id] || []).length > 0) return "raiox";
    if ((g.briefing || "").trim() || (g.frentes || []).length > 0) return "escuta";
    return "prospeccao";
  };

  const proximoPassoDe = (c) => {
    const fase = faseDoCliente(c);
    const g = gestaoPorCliente[c.id] || { briefing: "", frentes: [] };
    const fin = financeiroPorCliente[c.id] || { parcelas: [] };
    const props = propostasPorCliente[c.id] || [];
    if (fase === "encerrado") return null;
    if (fase === "perigo") {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const temVencida = (fin.parcelas || []).some((p) => {
        if (p.pago) return false;
        const v = parseDataBR(p.vencimento);
        return v && v < hoje;
      });
      return temVencida
        ? { texto: "Há parcela vencida no cofre — cobre ou renegocie antes que vire ruído na relação", modulo: "financeiro" }
        : { texto: "Há ações atrasadas no cronograma — resolva ou realoque as semanas", modulo: "cronograma" };
    }
    if (fase === "prospeccao") return { texto: "Escuta: registre o briefing da primeira conversa — é dele que tudo nasce", modulo: "gestao" };
    if (fase === "escuta") {
      if (!(campoPorCliente[c.id] || []).length)
        return { texto: "Vá a campo antes do Raio-X — uma visita técnica transforma impressão em evidência", modulo: "campo" };
      return { texto: "Raio-X: faça o diagnóstico de maturidade — os N.O.M.s vendem o Acordo com números", modulo: "diagnosticos" };
    }
    if (fase === "raiox") return { texto: "Acordo: gere a proposta com as metas pactuadas — a carta de Hogwarts está pronta", modulo: "propostas" };
    if (fase === "acordo") return { texto: "Acordo na rua — quando o cliente fechar, marque a proposta como Aceita para a Construção começar", modulo: "propostas" };
    if (fase === "construcao") {
      if (!parseDataBR(g.inicio)) return { texto: "Construção: defina o início e a duração no Cronograma", modulo: "cronograma" };
      if (!(g.frentes || []).length) return { texto: "Construção: gere o plano de ação a partir do briefing", modulo: "gestao" };
      if (!(fin.parcelas || []).length) return { texto: "Registre as parcelas no cofre de Gringotes", modulo: "financeiro" };
      if (!((ritosPorCliente[c.id] || {}).itens || []).length) return { texto: "Rumo à Sustentação: crie os Ritos de Gestão — é a cadência que sustenta sem você", modulo: "ritos" };
      return null;
    }
    if (fase === "sustentacao") return { texto: "Sustentação: os ritos rodam — acompanhe anomalias e o Painel do Engajamento", modulo: "painel" };
    if (fase === "prova") return { texto: "Prova: reavalie o diagnóstico, verifique as metas e prepare o Malfeito feito", modulo: "relatorios" };
    return null;
  };

  const clienteAtual = clientes.find((c) => c.id === tela.id);

  const fasesClientes = Object.fromEntries(clientes.map((c) => [c.id, faseDoCliente(c)]));

  // ── Derivações do cliente atual ──
  const cargosAtuais = clienteAtual ? cargosPorCliente[clienteAtual.id] || [] : [];
  const cargoAtual = cargosAtuais.find((x) => x.id === tela.cargoId);
  const estruturaAtual = clienteAtual ? estruturaPorCliente[clienteAtual.id] || [] : [];
  const manualAtual = clienteAtual ? manualPorCliente[clienteAtual.id] || [] : [];
  const popsAtuais = clienteAtual ? popsPorCliente[clienteAtual.id] || [] : [];
  const popAtual = popsAtuais.find((p) => p.id === tela.popId);
  const fluxosAtuais = clienteAtual ? fluxosPorCliente[clienteAtual.id] || [] : [];
  const fluxoAtual = fluxosAtuais.find((f) => f.id === tela.fluxoId);
  const campoAtuais = clienteAtual ? campoPorCliente[clienteAtual.id] || [] : [];
  const campoAtual = campoAtuais.find((r) => r.id === tela.regId);
  const treinamentosAtuais = clienteAtual ? treinamentosPorCliente[clienteAtual.id] || [] : [];
  const treinamentoAtual = treinamentosAtuais.find((t) => t.id === tela.treinoId);
  const mentoriaAtual = clienteAtual ? mentoriaPorCliente[clienteAtual.id] || mentoriaVazia() : mentoriaVazia();
  const diagsLiderAtuais = clienteAtual ? diagsLiderPorCliente[clienteAtual.id] || [] : [];
  const focoMentoriaAtual = (mentoriaPorCliente[clienteAtual ? clienteAtual.id : ""] || {}).foco || "lideranca";
  const frameworkMentorado = focoMentoriaAtual === "autoconhecimento" ? FRAMEWORK_PESSOAL : FRAMEWORK_LIDER;
  const tituloDiagMentorado = focoMentoriaAtual === "autoconhecimento" ? "Diagnóstico Pessoal" : "Diagnóstico de Liderança";
  const diagLiderAtual = diagsLiderAtuais.find((d) => d.id === tela.diagId);
  const relMentoriaAtual = clienteAtual ? (mentoriaPorCliente[clienteAtual.id]?.relatorio || {}) : {};
  const alcadasAtuais = clienteAtual ? alcadasPorCliente[clienteAtual.id] || { obs: "", itens: [] } : { obs: "", itens: [] };
  const ritosAtuais = clienteAtual ? ritosPorCliente[clienteAtual.id] || { obs: "", itens: [] } : { obs: "", itens: [] };
  const indicadoresAtuais = clienteAtual ? indicadoresPorCliente[clienteAtual.id] || { obs: "", itens: [] } : { obs: "", itens: [] };
  const pessoasAtuais = clienteAtual ? pessoasPorCliente[clienteAtual.id] || [] : [];
  const pessoaAtual = pessoasAtuais.find((p) => p.id === tela.pessoaId);
  const diagsAtuais = clienteAtual ? diagsPorCliente[clienteAtual.id] || [] : [];
  const diagAtual = diagsAtuais.find((d) => d.id === tela.diagId);
  const propostasAtuais = clienteAtual ? propostasPorCliente[clienteAtual.id] || [] : [];
  const propostaAtual = propostasAtuais.find((p) => p.id === tela.propostaId);
  const relatoriosAtuais = clienteAtual ? relatoriosPorCliente[clienteAtual.id] || [] : [];
  const relatorioAtual = relatoriosAtuais.find((r) => r.id === tela.relId);
  const financeiroAtual = clienteAtual ? financeiroPorCliente[clienteAtual.id] || { parcelas: [] } : { parcelas: [] };
  const atasAtuais = clienteAtual ? docsDe("atas", clienteAtual.id) : [];
  const docsAtuais = clienteAtual && tela.tipo ? docsDe(tela.tipo, clienteAtual.id) : [];
  const docAtual = docsAtuais.find((d) => d.id === tela.docId);

  const resumoFin = (() => {
    const parcelas = financeiroAtual.parcelas || [];
    if (!parcelas.length) return null;
    let recebido = 0;
    let total = 0;
    for (const p of parcelas) {
      const v = parseValorBR(p.valor);
      total += v;
      if (p.pago) recebido += v;
    }
    return total > 0 ? `${formatarBR(recebido)} recebido de ${formatarBR(total)}` : null;
  })();

  const nomeDocumentoAtual = () =>
    `${clienteAtual ? clienteAtual.negocio : "A Toca"} — ${tela.nome}`.replace(/[\\/:*?"<>|]/g, "").trim();

  // Reserva: abre/baixa versão imprimível no navegador (caso o motor próprio falhe)
  const abrirImpressaoNavegador = () => {
    const node = document.querySelector(".area-impressao");
    if (!node) return;
    const conteudo = node.outerHTML.replace(/area-impressao hidden print:block/g, "area-impressao");
    const nomeBase = nomeDocumentoAtual();
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>${nomeBase}</title>
<script src="https://cdn.tailwindcss.com"><\/script>
<style>
  body { background: white; font-family: Georgia, 'Times New Roman', serif; margin: 0; }
  .area-impressao { display: block !important; max-width: 210mm; margin: 0 auto; }
  table { border-collapse: collapse; }
  @page { margin: 16mm; }
  @media print { .aviso-topo { display: none !important; } }
</style>
</head>
<body>
<div class="aviso-topo" style="background:#5C1A2B;color:#E8C547;padding:10px 16px;font-size:14px;text-align:center;font-family:sans-serif;">
  Escolha "Salvar como PDF" na janela de impressão.
  <button onclick="window.print()" style="margin-left:10px;padding:4px 12px;border-radius:4px;border:1px solid #E8C547;background:transparent;color:#E8C547;cursor:pointer;">Imprimir agora</button>
</div>
${conteudo}
<script>
  var jaImprimiu = false;
  function imprimir() { if (jaImprimiu) return; jaImprimiu = true; setTimeout(function () { window.print(); }, 500); }
  window.addEventListener("load", imprimir);
  setTimeout(imprimir, 1800);
<\/script>
</body>
</html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${nomeBase}.html`;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const exportarImpressao = async (opcoes) => {
    const seletor = opcoes && typeof opcoes.seletor === "string" ? opcoes.seletor : ".area-impressao";
    const nomeExtra = opcoes && typeof opcoes.nome === "string" ? opcoes.nome : null;
    const node = document.querySelector(seletor);
    if (!node) {
      setErro("Nada para exportar nesta tela — gere o documento primeiro.");
      return;
    }
    if (gerandoPdf) return;
    setGerandoPdf(true);
    setErro(null);
    try {
      const bytes = await gerarPdfDoNo(node);
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${nomeExtra || nomeDocumentoAtual()}.pdf`;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) {
      // motor próprio falhou — cai para a versão imprimível do navegador
      abrirImpressaoNavegador();
    } finally {
      setGerandoPdf(false);
    }
  };

  return (
    <div className="min-h-screen fonte-corpo" style={{ background: "linear-gradient(135deg, #FAF6EE 0%, #F5EDD9 100%)", fontFamily: "'Crimson Text', Georgia, serif", position: "relative" }}>
      <div
        className="print:hidden"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.02,
          zIndex: 0,
          backgroundImage:
            "url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%2260%22><rect width=%22300%22 height=%2260%22 fill=%22%23D4AF37%22/><line x1=%220%22 y1=%2210%22 x2=%22300%22 y2=%2210%22 stroke=%22%23AA8C2C%22 stroke-width=%221%22 opacity=%220.3%22/><line x1=%220%22 y1=%2230%22 x2=%22300%22 y2=%2230%22 stroke=%22%23AA8C2C%22 stroke-width=%220.5%22 opacity=%220.2%22/><line x1=%220%22 y1=%2250%22 x2=%22300%22 y2=%2250%22 stroke=%22%23AA8C2C%22 stroke-width=%220.8%22 opacity=%220.25%22/></svg>')",
        }}
      />
      {gerandoPdf && (
        <div
          className="print:hidden"
          style={{ position: "fixed", bottom: 20, right: 20, zIndex: 50, background: "#3F1220", color: "#E8C547", padding: "10px 18px", borderRadius: 8, border: "1px solid #B8860B", fontSize: 13, boxShadow: "0 8px 20px rgba(0,0,0,0.3)" }}
        >
          A pena está copiando o documento... gerando PDF
        </div>
      )}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital@0;1&family=Playfair+Display:wght@700;800&display=swap');

        * { transition-property: background-color, border-color, box-shadow, transform; transition-duration: 0.2s; transition-timing-function: ease; }

        input, select, textarea, button { font-family: -apple-system, 'Segoe UI', sans-serif; }
        .font-serif { font-family: 'Playfair Display', Georgia, serif; }
        .fonte-corpo { font-family: 'Crimson Text', Georgia, serif; }

        .objeto { transition: all 0.3s ease; }
        .objeto:hover { border-color: #D4AF37AA !important; box-shadow: 0 8px 20px rgba(212, 175, 55, 0.15); transform: translateY(-2px); }

        button, [role="button"] { transition: all 0.2s ease; }
        button:hover:not(:disabled), [role="button"]:hover { transform: scale(1.02); }
        button:active:not(:disabled), [role="button"]:active { transform: scale(0.98); }

        table tr { transition: background-color 0.2s ease; }
        table tr:hover { background-color: #F5EDD9 !important; }

        .card, [class*="card"] { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

        .fade-in { animation: fadeIn 0.4s ease-out; }
        .slide-in { animation: slideInLeft 0.4s ease-out; }
        .scale-in { animation: scaleIn 0.3s ease-out; }
        @media print { body { background: white; } .font-serif { font-family: Georgia, serif; } }
      `}</style>
      <Cabecalho onHome={() => setTela({ nome: "home" })} />

      <div className="print:hidden">
        {!pronto ? (
          <div className="text-center py-20 font-serif italic" style={{ color: CORES.dourado }}>Abrindo A Toca...</div>
        ) : tela.nome === "home" ? (
          tela.view === "clientes" ? (
            <ListaClientes clientes={clientes} gestaoPorCliente={gestaoPorCliente} fases={fasesClientes} backupPendente={backupPendente} onAplicarBackup={aplicarBackup} onCancelarBackup={() => setBackupPendente(null)} onAbrir={abrirCliente} onNovo={() => setTela({ nome: "novo" })} onExcluir={excluirCliente} onExportarBackup={exportarBackup} onImportarBackup={importarBackup} onVoltar={() => setTela({ nome: "home" })} />
          ) : (
            <DashboardGamificado onNavigate={setTela} clientes={clientes} />
          )
        ) : tela.nome === "novo" ? (
          <FormCliente onSalvar={salvarNovoCliente} onCancelar={() => setTela({ nome: "home" })} />
        ) : tela.nome === "editar" && clienteAtual ? (
          <FormCliente inicial={clienteAtual} onSalvar={salvarEdicaoCliente} onCancelar={() => setTela({ nome: "cliente", id: tela.id })} onExcluir={() => excluirCliente(clienteAtual.id)} />
        ) : tela.nome === "cliente" && clienteAtual ? (
          <HubCliente
            cliente={clienteAtual}
            proximoPasso={proximoPassoDe(clienteAtual)}
            totalCampo={campoAtuais.length}
            totalDiagsLider={diagsLiderAtuais.length}
            temRelMentoria={!!(relMentoriaAtual.retrospectiva || relMentoriaAtual.evolucao)}
            metasAceitas={((propostasPorCliente[clienteAtual.id] || []).find((p) => p.status === "aceita") || {}).metas || []}
            focoMentoria={focoMentoriaAtual}
            totalAnomalias={(anomaliasPorCliente[clienteAtual.id] || []).length}
            totalAnomaliasTratadas={(anomaliasPorCliente[clienteAtual.id] || []).filter((a) => a.status === "tratada").length}
            totalTreinamentos={treinamentosAtuais.length}
            totalTreinamentosRealizados={treinamentosAtuais.filter((t) => t.status === "realizado").length}
            totalEncontros={(mentoriaAtual.encontros || []).length}
            totalEncontrosRealizados={(mentoriaAtual.encontros || []).filter((e) => e.realizada).length}
            totalCargos={cargosAtuais.length}
            temTabela={!!tabelas[clienteAtual.id]}
            gestao={gestaoPorCliente[clienteAtual.id]}
            totalPosicoes={estruturaAtual.length}
            totalAlcadas={(alcadasAtuais.itens || []).length}
            totalRitos={(ritosAtuais.itens || []).length}
            totalIndicadores={(indicadoresAtuais.itens || []).length}
            totalSecoesManual={manualAtual.length}
            totalPontosCCT={pontosCCTDe(clienteAtual.id).length}
            totalPops={popsAtuais.length}
            totalFluxos={fluxosAtuais.length}
            totalPoliticas={docsDe("politicas", clienteAtual.id).length}
            totalChecklists={docsDe("checklists", clienteAtual.id).length}
            totalPessoas={pessoasAtuais.length}
            totalDiagnosticos={diagsAtuais.length}
            totalPropostas={propostasAtuais.length}
            totalRelatorios={relatoriosAtuais.length}
            resumoFinanceiro={resumoFin}
            onModulo={(m) => {
              setErro(null);
              if (m.startsWith("docs-")) {
                setTela({ nome: "docs", tipo: m.slice(5), id: tela.id });
              } else {
                setTela({ nome: m, id: tela.id });
              }
            }}
            onEditarCliente={() => setTela({ nome: "editar", id: tela.id })}
            onVoltar={() => setTela({ nome: "home" })}
          />
        ) : tela.nome === "gestao" && clienteAtual ? (
          <ModuloGestao
            cliente={clienteAtual}
            gestao={gestaoPorCliente[clienteAtual.id] || { briefing: "", frentes: [] }}
            atas={atasAtuais}
            gerando={gerando}
            erro={erro}
            onMudar={(nova) => mudarGestao(clienteAtual.id, nova)}
            onGerarPlano={() => gerarPlano(clienteAtual)}
            onAtualizarPlano={() => atualizarPlano(clienteAtual)}
            onAbrirAta={(docId) => {
              setErro(null);
              setTela({ nome: "doc", tipo: "atas", id: tela.id, docId, origem: "gestao" });
            }}
            onNovaAta={async () => {
              const novo = docVazio("atas");
              await mudarDocs("atas", clienteAtual.id, [...atasAtuais, novo]);
              setErro(null);
              setTela({ nome: "doc", tipo: "atas", id: tela.id, docId: novo.id, origem: "gestao" });
            }}
            onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
          />
        ) : tela.nome === "penseira" && clienteAtual ? (
          <ModuloPenseira
            cliente={clienteAtual}
            mensagens={penseiraPorCliente[clienteAtual.id] || []}
            gerando={gerando}
            erro={erro}
            onEnviar={(t) => enviarPenseira(clienteAtual, t)}
            onLimpar={() => limparPenseira(clienteAtual.id)}
            onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
          />
        ) : tela.nome === "cct" && clienteAtual ? (
          <ModuloCCT
            cliente={clienteAtual}
            cct={cctPorCliente[clienteAtual.id] || { nomeArquivo: "", dataAnalise: "", pontos: [] }}
            gerando={gerando}
            erro={erro}
            onMudar={(nova) => mudarCCT(clienteAtual.id, nova)}
            onAnalisar={(nome, base64) => analisarCCTCliente(clienteAtual, nome, base64)}
            onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
          />
        ) : tela.nome === "estrutura" && clienteAtual ? (
          <ModuloEstrutura
            cliente={clienteAtual}
            posicoes={estruturaAtual}
            cargos={cargosAtuais}
            gerando={gerando}
            erro={erro}
            onMudar={(novas) => mudarEstrutura(clienteAtual.id, novas)}
            onGerar={() => gerarOrganograma(clienteAtual)}
            onImprimir={exportarImpressao}
            onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
          />
        ) : tela.nome === "manual" && clienteAtual ? (
          <ModuloManual
            cliente={clienteAtual}
            secoes={manualAtual}
            gerando={gerando}
            erro={erro}
            onMudar={(novas) => mudarManual(clienteAtual.id, novas)}
            onGerar={() => gerarManualCliente(clienteAtual)}
            onImprimir={exportarImpressao}
            onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
          />
        ) : tela.nome === "pops" && clienteAtual ? (
          <ListaPops
            cliente={clienteAtual}
            pops={popsAtuais}
            onAbrirPop={(popId) => {
              setErro(null);
              setTela({ nome: "pop", id: tela.id, popId });
            }}
            onNovoPop={async () => {
              const novo = popVazio();
              await mudarPops(clienteAtual.id, [...popsAtuais, novo]);
              setErro(null);
              setTela({ nome: "pop", id: tela.id, popId: novo.id });
            }}
            onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
          />
        ) : tela.nome === "pop" && clienteAtual && popAtual ? (
          <EditorPop
            cliente={clienteAtual}
            pop={popAtual}
            gerando={gerando}
            erro={erro}
            onMudar={(novo) => mudarPops(clienteAtual.id, popsAtuais.map((p) => (p.id === novo.id ? novo : p)))}
            onGerar={() => gerarPopCliente(clienteAtual, popAtual)}
            onImprimir={exportarImpressao}
            onExcluir={async () => {
              await mudarPops(clienteAtual.id, popsAtuais.filter((p) => p.id !== popAtual.id));
              setTela({ nome: "pops", id: tela.id });
            }}
            onVoltar={() => setTela({ nome: "pops", id: tela.id })}
          />
        ) : tela.nome === "relatorios" && clienteAtual ? (
          <ModuloRelatorio
            cliente={clienteAtual}
            metasAcordo={((propostasPorCliente[clienteAtual.id] || []).find((p) => p.status === "aceita") || {}).metas || []}
            relatorios={relatoriosAtuais}
            relAberto={relatorioAtual || null}
            diags={diagsAtuais}
            gerando={gerando}
            erro={erro}
            onMudarLista={(novos) => mudarRelatorios(clienteAtual.id, novos)}
            onAbrir={(relId) => {
              setErro(null);
              setTela({ nome: "relatorios", id: tela.id, relId: relId || undefined });
            }}
            onGerar={() => relatorioAtual && gerarRelatorioCliente(clienteAtual, relatorioAtual)}
            onImprimir={exportarImpressao}
            onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
          />
        ) : tela.nome === "financeiro" && clienteAtual ? (
          <ModuloFinanceiro
            cliente={clienteAtual}
            financeiro={financeiroAtual}
            propostaAceita={(propostasPorCliente[clienteAtual.id] || []).find((p) => p.status === "aceita") || null}
            onMudar={(novo) => mudarFinanceiro(clienteAtual.id, novo)}
            onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
          />
        ) : tela.nome === "cronograma" && clienteAtual ? (
          <ModuloCronograma
            cliente={clienteAtual}
            gestao={gestaoPorCliente[clienteAtual.id] || { briefing: "", frentes: [] }}
            gerando={gerando}
            erro={erro}
            onMudar={(nova) => mudarGestao(clienteAtual.id, nova)}
            onDistribuir={() => distribuirCronogramaCliente(clienteAtual)}
            onImprimir={exportarImpressao}
            onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
          />
        ) : tela.nome === "propostas" && clienteAtual ? (
          <ListaPropostas
            cliente={clienteAtual}
            propostas={propostasAtuais}
            onAbrir={(propostaId) => {
              setErro(null);
              setTela({ nome: "proposta", id: tela.id, propostaId });
            }}
            onNova={async () => {
              const nova = propostaVazia();
              await mudarPropostas(clienteAtual.id, [...propostasAtuais, nova]);
              setErro(null);
              setTela({ nome: "proposta", id: tela.id, propostaId: nova.id });
            }}
            onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
          />
        ) : tela.nome === "proposta" && clienteAtual && propostaAtual ? (
          <EditorProposta
            cliente={clienteAtual}
            prop={propostaAtual}
            gerando={gerando}
            erro={erro}
            frentes={(gestaoPorCliente[clienteAtual.id] || { frentes: [] }).frentes || []}
            semanasPadrao={(gestaoPorCliente[clienteAtual.id] || {}).duracaoSemanas}
            numEncontros={(mentoriaAtual.encontros || []).length}
            precificacao={precificacao}
            onMudarPrecificacao={mudarPrecificacao}
            onMudar={(nova) => mudarPropostas(clienteAtual.id, propostasAtuais.map((p) => (p.id === nova.id ? nova : p)))}
            onGerar={() => gerarPropostaCliente(clienteAtual, propostaAtual)}
            onGerarMetas={() => gerarMetasCliente(clienteAtual, propostaAtual)}
            onImprimir={exportarImpressao}
            onExcluir={async () => {
              await mudarPropostas(clienteAtual.id, propostasAtuais.filter((p) => p.id !== propostaAtual.id));
              setTela({ nome: "propostas", id: tela.id });
            }}
            onVoltar={() => setTela({ nome: "propostas", id: tela.id })}
          />
        ) : tela.nome === "diagnosticos" && clienteAtual ? (
          <ListaDiagnosticos
            cliente={clienteAtual}
            diagnosticos={diagsAtuais}
            onAbrir={(diagId) => {
              setErro(null);
              setTela({ nome: "diagnostico", id: tela.id, diagId });
            }}
            onNovo={async () => {
              const novo = diagVazio();
              await mudarDiags(clienteAtual.id, [...diagsAtuais, novo]);
              setErro(null);
              setTela({ nome: "diagnostico", id: tela.id, diagId: novo.id });
            }}
            onReavaliar={async (base) => {
              const novo = { ...diagVazio(), notas: { ...base.notas }, rotulo: `Reavaliação de ${base.rotulo || base.data}` };
              await mudarDiags(clienteAtual.id, [...diagsAtuais, novo]);
              setErro(null);
              setTela({ nome: "diagnostico", id: tela.id, diagId: novo.id });
            }}
            onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
          />
        ) : tela.nome === "diagnostico" && clienteAtual && diagAtual ? (
          <EditorDiagnostico
            cliente={clienteAtual}
            diag={diagAtual}
            gerando={gerando}
            erro={erro}
            onMudar={(novo) => mudarDiags(clienteAtual.id, diagsAtuais.map((d) => (d.id === novo.id ? novo : d)))}
            onGerarLeitura={() => gerarLeituraDiag(clienteAtual, diagAtual)}
            onCriarFrentes={(areas) => criarFrentesDeAreas(clienteAtual, areas)}
            onImprimir={exportarImpressao}
            onExcluir={async () => {
              await mudarDiags(clienteAtual.id, diagsAtuais.filter((d) => d.id !== diagAtual.id));
              setTela({ nome: "diagnosticos", id: tela.id });
            }}
            onVoltar={() => setTela({ nome: "diagnosticos", id: tela.id })}
          />
        ) : tela.nome === "temperamentos" && clienteAtual ? (
          <ListaPessoas
            cliente={clienteAtual}
            pessoas={pessoasAtuais}
            onAbrir={(pessoaId) => {
              setErro(null);
              setTela({ nome: "pessoa", id: tela.id, pessoaId });
            }}
            onNova={async () => {
              const nova = pessoaVazia();
              await mudarPessoas(clienteAtual.id, [...pessoasAtuais, nova]);
              setErro(null);
              setTela({ nome: "pessoa", id: tela.id, pessoaId: nova.id });
            }}
            onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
          />
        ) : tela.nome === "pessoa" && clienteAtual && pessoaAtual ? (
          <EditorPessoa
            cliente={clienteAtual}
            pessoa={pessoaAtual}
            gerando={gerando}
            erro={erro}
            onMudar={(nova) => mudarPessoas(clienteAtual.id, pessoasAtuais.map((p) => (p.id === nova.id ? nova : p)))}
            onGerar={() => analisarPessoa(clienteAtual, pessoaAtual)}
            onImprimir={exportarImpressao}
            onExcluir={async () => {
              await mudarPessoas(clienteAtual.id, pessoasAtuais.filter((p) => p.id !== pessoaAtual.id));
              setTela({ nome: "temperamentos", id: tela.id });
            }}
            onVoltar={() => setTela({ nome: "temperamentos", id: tela.id })}
          />
        ) : tela.nome === "docs" && clienteAtual ? (
          <ListaDocs
            cliente={clienteAtual}
            tipo={tela.tipo}
            docs={docsAtuais}
            onAbrir={(docId) => {
              setErro(null);
              setTela({ nome: "doc", tipo: tela.tipo, id: tela.id, docId });
            }}
            onNovo={async () => {
              const novo = docVazio(tela.tipo);
              await mudarDocs(tela.tipo, clienteAtual.id, [...docsAtuais, novo]);
              setErro(null);
              setTela({ nome: "doc", tipo: tela.tipo, id: tela.id, docId: novo.id });
            }}
            onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
          />
        ) : tela.nome === "doc" && clienteAtual && docAtual ? (
          <EditorDoc
            cliente={clienteAtual}
            tipo={tela.tipo}
            doc={docAtual}
            rotuloVoltar={tela.origem === "gestao" ? `Briefing & Plano de Ação · ${clienteAtual.negocio}` : `${CONFIG_DOCS[tela.tipo].tituloModulo} · ${clienteAtual.negocio}`}
            gerando={gerando}
            erro={erro}
            onMudar={(novo) => mudarDocs(tela.tipo, clienteAtual.id, docsAtuais.map((d) => (d.id === novo.id ? novo : d)))}
            onGerar={() => gerarDocCliente(tela.tipo, clienteAtual, docAtual)}
            onImprimir={exportarImpressao}
            onExcluir={async () => {
              await mudarDocs(tela.tipo, clienteAtual.id, docsAtuais.filter((d) => d.id !== docAtual.id));
              setTela(tela.origem === "gestao" ? { nome: "gestao", id: tela.id } : { nome: "docs", tipo: tela.tipo, id: tela.id });
            }}
            onVoltar={() => setTela(tela.origem === "gestao" ? { nome: "gestao", id: tela.id } : { nome: "docs", tipo: tela.tipo, id: tela.id })}
          />
        ) : tela.nome === "ritos" && clienteAtual ? (
          <ModuloRitos
            cliente={clienteAtual}
            ritos={ritosAtuais}
            gerando={gerando}
            erro={erro}
            onMudar={(novos) => mudarRitos(clienteAtual.id, novos)}
            onGerar={() => gerarRitosCliente(clienteAtual)}
            onImprimir={exportarImpressao}
            onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
          />
        ) : tela.nome === "indicadores" && clienteAtual ? (
          <ModuloIndicadores
            cliente={clienteAtual}
            painel={indicadoresAtuais}
            gerando={gerando}
            erro={erro}
            onMudar={(novos) => mudarIndicadores(clienteAtual.id, novos)}
            onGerar={() => gerarIndicadoresCliente(clienteAtual)}
            onImprimir={exportarImpressao}
            onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
          />
        ) : tela.nome === "alcadas" && clienteAtual ? (
          <ModuloAlcadas
            cliente={clienteAtual}
            alcadas={alcadasAtuais}
            gerando={gerando}
            erro={erro}
            onMudar={(novas) => mudarAlcadas(clienteAtual.id, novas)}
            onGerar={() => gerarAlcadasCliente(clienteAtual)}
            onImprimir={exportarImpressao}
            onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
          />
        ) : tela.nome === "anomalias" && clienteAtual ? (
          <ModuloAnomalias
            cliente={clienteAtual}
            anomalias={anomaliasPorCliente[clienteAtual.id] || []}
            frentes={(gestaoPorCliente[clienteAtual.id] || { frentes: [] }).frentes || []}
            gerando={gerando}
            erro={erro}
            onMudar={(novas) => mudarAnomalias(clienteAtual.id, novas)}
            onAnalisar={(a) => analisarAnomaliaCliente(clienteAtual, a)}
            onEnviarAcao={(a) => enviarAcaoAnomalia(clienteAtual, a)}
            onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
          />
        ) : tela.nome === "painel" && clienteAtual ? (
          <ModuloPainel
            cliente={clienteAtual}
            dados={dadosPainelDe(clienteAtual.id)}
            painel={painelPorCliente[clienteAtual.id] || {}}
            onMudar={(novo) => mudarPainel(clienteAtual.id, novo)}
            onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
          />
        ) : tela.nome === "relmentoria" && clienteAtual ? (
          <ModuloRelMentoria
            cliente={clienteAtual}
            rel={relMentoriaAtual}
            diagsLider={diagsLiderAtuais}
            metasAcordo={((propostasPorCliente[clienteAtual.id] || []).find((p) => p.status === "aceita") || {}).metas || []}
            framework={frameworkMentorado}
            gerando={gerando}
            erro={erro}
            onMudar={(novo) => mudarRelMentoria(clienteAtual.id, novo)}
            onGerar={() => gerarRelMentoriaCliente(clienteAtual)}
            onImprimir={exportarImpressao}
            onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
          />
        ) : tela.nome === "diagslider" && clienteAtual ? (
          <ListaDiagnosticos
            cliente={clienteAtual}
            diagnosticos={diagsLiderAtuais}
            titulo={tituloDiagMentorado}
            subtitulo={focoMentoriaAtual === "autoconhecimento"
              ? "Os N.I.E.M.s da pessoa: avalie a maturidade pessoal em 6 áreas e 24 critérios. Reavalie ao longo da mentoria — o antes/depois é a prova da evolução."
              : "Os N.I.E.M.s do líder: avalie a maturidade de liderança em 6 áreas e 24 critérios. Reavalie ao longo da mentoria — o antes/depois é a prova da evolução."}
            framework={frameworkMentorado}
            onAbrir={(diagId) => {
              setErro(null);
              setTela({ nome: "diaglider", id: tela.id, diagId });
            }}
            onNovo={async () => {
              const novo = diagVazio();
              await mudarDiagsLider(clienteAtual.id, [...diagsLiderAtuais, novo]);
              setErro(null);
              setTela({ nome: "diaglider", id: tela.id, diagId: novo.id });
            }}
            onReavaliar={async (base) => {
              const novo = { ...diagVazio(), notas: { ...base.notas }, rotulo: `Reavaliação de ${base.rotulo || base.data}` };
              await mudarDiagsLider(clienteAtual.id, [...diagsLiderAtuais, novo]);
              setErro(null);
              setTela({ nome: "diaglider", id: tela.id, diagId: novo.id });
            }}
            onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
          />
        ) : tela.nome === "diaglider" && clienteAtual && diagLiderAtual ? (
          <EditorDiagnostico
            cliente={clienteAtual}
            diag={diagLiderAtual}
            titulo={tituloDiagMentorado}
            framework={frameworkMentorado}
            gerando={gerando}
            erro={erro}
            onMudar={(novo) => mudarDiagsLider(clienteAtual.id, diagsLiderAtuais.map((d) => (d.id === novo.id ? novo : d)))}
            onGerarLeitura={() => gerarLeituraLiderCliente(clienteAtual, diagLiderAtual)}
            onCriarFrentes={null}
            onImprimir={exportarImpressao}
            onExcluir={async () => {
              await mudarDiagsLider(clienteAtual.id, diagsLiderAtuais.filter((d) => d.id !== diagLiderAtual.id));
              setTela({ nome: "diagslider", id: tela.id });
            }}
            onVoltar={() => setTela({ nome: "diagslider", id: tela.id })}
          />
        ) : tela.nome === "treinamentos" && clienteAtual ? (
          <ModuloTreinamentos
            cliente={clienteAtual}
            treinamentos={treinamentosAtuais}
            frentes={(gestaoPorCliente[clienteAtual.id] || { frentes: [] }).frentes || []}
            pessoas={pessoasAtuais}
            gerando={gerando}
            erro={erro}
            aberto={tela.treinoId}
            onAbrir={(treinoId) => {
              setErro(null);
              setTela({ nome: "treinamentos", id: tela.id, treinoId: treinoId || undefined });
            }}
            onNovo={async () => {
              const novo = treinamentoVazio();
              await mudarTreinamentos(clienteAtual.id, [...treinamentosAtuais, novo]);
              setErro(null);
              setTela({ nome: "treinamentos", id: tela.id, treinoId: novo.id });
            }}
            onMudar={(novo) => mudarTreinamentos(clienteAtual.id, treinamentosAtuais.map((t) => (t.id === novo.id ? novo : t)))}
            onGerar={() => treinamentoAtual && gerarTreinamentoCliente(clienteAtual, treinamentoAtual)}
            onGerarRelatorio={() => treinamentoAtual && gerarRelTreinamentoCliente(clienteAtual, treinamentoAtual)}
            onImprimir={exportarImpressao}
            onExcluir={async () => {
              await mudarTreinamentos(clienteAtual.id, treinamentosAtuais.filter((t) => t.id !== treinamentoAtual.id));
              setTela({ nome: "treinamentos", id: tela.id });
            }}
            onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
          />
        ) : tela.nome === "mentoria" && clienteAtual ? (
          <ModuloMentoria
            cliente={clienteAtual}
            mentoria={mentoriaAtual}
            pessoas={pessoasAtuais}
            temRaioX={diagsLiderAtuais.length > 0}
            statusAcordo={(propostasPorCliente[clienteAtual.id] || []).some((p) => p.status === "aceita") ? "aceita" : (propostasPorCliente[clienteAtual.id] || []).some((p) => p.apresentacao) ? "gerada" : "nenhum"}
            temProva={!!(relMentoriaAtual.retrospectiva || relMentoriaAtual.evolucao)}
            gerando={gerando}
            erro={erro}
            onMudar={(nova) => mudarMentoria(clienteAtual.id, nova)}
            onGerarJornada={() => gerarJornadaCliente(clienteAtual)}
            onEstruturarSessao={(sessao) => estruturarSessaoCliente(clienteAtual, sessao)}
            onGerarFicha={() => gerarFichaMoldagemCliente(clienteAtual)}
            onCriarMentorado={async () => {
              const nova = { ...pessoaVazia(), nome: clienteAtual.negocio, cargo: clienteAtual.segmento, contratante: true };
              await mudarPessoas(clienteAtual.id, [...pessoasAtuais, nova]);
              await mudarMentoria(clienteAtual.id, { ...mentoriaAtual, mentoradoId: nova.id });
            }}
            onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
          />
        ) : tela.nome === "campo" && clienteAtual ? (
          <ListaCampo
            cliente={clienteAtual}
            registros={campoAtuais}
            onAbrir={(regId) => {
              setErro(null);
              setTela({ nome: "campo-reg", id: tela.id, regId });
            }}
            onNovo={async (tipo) => {
              const novo = campoVazio(tipo);
              await mudarCampo(clienteAtual.id, [...campoAtuais, novo]);
              setErro(null);
              setTela({ nome: "campo-reg", id: tela.id, regId: novo.id });
            }}
            onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
          />
        ) : tela.nome === "campo-reg" && clienteAtual && campoAtual ? (
          <EditorCampo
            cliente={clienteAtual}
            reg={campoAtual}
            pessoas={pessoasAtuais}
            gerando={gerando}
            erro={erro}
            onMudar={(novo) => mudarCampo(clienteAtual.id, campoAtuais.map((r) => (r.id === novo.id ? novo : r)))}
            onGerarRoteiro={() => gerarRoteiroCampo(clienteAtual, campoAtual)}
            onAbrirPessoa={(pessoaId) => setTela({ nome: "pessoa", id: tela.id, pessoaId })}
            onCriarPessoa={async () => {
              const nova = { ...pessoaVazia(), nome: campoAtual.entrevistado, cargo: campoAtual.funcao };
              await mudarPessoas(clienteAtual.id, [...pessoasAtuais, nova]);
              setTela({ nome: "pessoa", id: tela.id, pessoaId: nova.id });
            }}
            onExcluir={async () => {
              await mudarCampo(clienteAtual.id, campoAtuais.filter((r) => r.id !== campoAtual.id));
              setTela({ nome: "campo", id: tela.id });
            }}
            onVoltar={() => setTela({ nome: "campo", id: tela.id })}
          />
        ) : tela.nome === "fluxos" && clienteAtual ? (
          <ListaFluxos
            cliente={clienteAtual}
            fluxos={fluxosAtuais}
            onAbrir={(fluxoId) => {
              setErro(null);
              setTela({ nome: "fluxo", id: tela.id, fluxoId });
            }}
            onNovo={async () => {
              const novo = fluxoVazio();
              await mudarFluxos(clienteAtual.id, [...fluxosAtuais, novo]);
              setErro(null);
              setTela({ nome: "fluxo", id: tela.id, fluxoId: novo.id });
            }}
            onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
          />
        ) : tela.nome === "fluxo" && clienteAtual && fluxoAtual ? (
          <EditorFluxo
            cliente={clienteAtual}
            fluxo={fluxoAtual}
            gerando={gerando}
            erro={erro}
            onMudar={(novo) => mudarFluxos(clienteAtual.id, fluxosAtuais.map((f) => (f.id === novo.id ? novo : f)))}
            onGerar={() => gerarFluxoCliente(clienteAtual, fluxoAtual)}
            onImprimir={exportarImpressao}
            onExcluir={async () => {
              await mudarFluxos(clienteAtual.id, fluxosAtuais.filter((f) => f.id !== fluxoAtual.id));
              setTela({ nome: "fluxos", id: tela.id });
            }}
            onVoltar={() => setTela({ nome: "fluxos", id: tela.id })}
          />
        ) : tela.nome === "tabela" && clienteAtual ? (
          <ModuloTabela
            cliente={clienteAtual}
            tabela={tabelas[clienteAtual.id] || null}
            gerando={gerando}
            erro={erro}
            onGerar={() => gerarTabela(clienteAtual)}
            onMudarTabela={(nova) => mudarTabela(clienteAtual.id, nova)}
            onImprimir={exportarImpressao}
            onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
          />
        ) : tela.nome === "cargos" && clienteAtual ? (
          <ListaCargos
            cliente={clienteAtual}
            cargos={cargosAtuais}
            onAbrirCargo={(cargoId) => {
              setErro(null);
              setTela({ nome: "cargo", id: tela.id, cargoId });
            }}
            onNovoCargo={async () => {
              const novo = cargoVazio();
              await mudarCargos(clienteAtual.id, [...cargosAtuais, novo]);
              setErro(null);
              setTela({ nome: "cargo", id: tela.id, cargoId: novo.id });
            }}
            onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
          />
        ) : tela.nome === "cargo" && clienteAtual && cargoAtual ? (
          <EditorCargo
            cliente={clienteAtual}
            cargo={cargoAtual}
            gerando={gerando}
            erro={erro}
            onMudar={(novo) => mudarCargos(clienteAtual.id, cargosAtuais.map((c) => (c.id === novo.id ? novo : c)))}
            onGerar={() => gerarCargo(clienteAtual, cargoAtual)}
            onImprimir={exportarImpressao}
            onExcluir={async () => {
              await mudarCargos(clienteAtual.id, cargosAtuais.filter((c) => c.id !== cargoAtual.id));
              setTela({ nome: "cargos", id: tela.id });
            }}
            onVoltar={() => setTela({ nome: "cargos", id: tela.id })}
          />
        ) : null}
      </div>

      {tela.nome === "tabela" && clienteAtual && (
        <ImpressaoTabela cliente={clienteAtual} tabela={tabelas[clienteAtual.id]} />
      )}
      {tela.nome === "estrutura" && clienteAtual && (
        <ImpressaoEstrutura cliente={clienteAtual} posicoes={estruturaAtual} />
      )}
      {tela.nome === "manual" && clienteAtual && (
        <ImpressaoManual cliente={clienteAtual} secoes={manualAtual} />
      )}
      {tela.nome === "pop" && clienteAtual && popAtual && (
        <ImpressaoPop cliente={clienteAtual} pop={popAtual} />
      )}
      {tela.nome === "fluxo" && clienteAtual && fluxoAtual && (
        <ImpressaoFluxo cliente={clienteAtual} fluxo={fluxoAtual} />
      )}
      {tela.nome === "relmentoria" && clienteAtual && (
        <ImpressaoRelMentoria cliente={clienteAtual} rel={relMentoriaAtual} diagsLider={diagsLiderAtuais} framework={frameworkMentorado} />
      )}
      {tela.nome === "diaglider" && clienteAtual && diagLiderAtual && (
        <ImpressaoDiagnostico cliente={clienteAtual} diag={diagLiderAtual} titulo={tituloDiagMentorado} framework={frameworkMentorado} />
      )}
      {tela.nome === "treinamentos" && clienteAtual && treinamentoAtual && (
        <>
          <ImpressaoTreinamento cliente={clienteAtual} trein={treinamentoAtual} />
          <ImpressaoCertificados cliente={clienteAtual} trein={treinamentoAtual} />
          <ImpressaoRelTreinamento cliente={clienteAtual} trein={treinamentoAtual} />
        </>
      )}
      {tela.nome === "alcadas" && clienteAtual && (
        <ImpressaoAlcadas cliente={clienteAtual} alcadas={alcadasAtuais} />
      )}
      {tela.nome === "ritos" && clienteAtual && (
        <ImpressaoRitos cliente={clienteAtual} ritos={ritosAtuais} />
      )}
      {tela.nome === "indicadores" && clienteAtual && (
        <ImpressaoIndicadores cliente={clienteAtual} painel={indicadoresAtuais} />
      )}
      {tela.nome === "doc" && tela.tipo === "politicas" && clienteAtual && docAtual && (
        <ImpressaoPolitica cliente={clienteAtual} doc={docAtual} />
      )}
      {tela.nome === "doc" && tela.tipo === "checklists" && clienteAtual && docAtual && (
        <ImpressaoChecklist cliente={clienteAtual} doc={docAtual} />
      )}
      {tela.nome === "doc" && tela.tipo === "atas" && clienteAtual && docAtual && (
        <ImpressaoAta cliente={clienteAtual} doc={docAtual} />
      )}
      {tela.nome === "pessoa" && clienteAtual && pessoaAtual && (
        <ImpressaoPessoa cliente={clienteAtual} pessoa={pessoaAtual} />
      )}
      {tela.nome === "diagnostico" && clienteAtual && diagAtual && (
        <ImpressaoDiagnostico cliente={clienteAtual} diag={diagAtual} />
      )}
      {tela.nome === "proposta" && clienteAtual && propostaAtual && (
        <ImpressaoProposta cliente={clienteAtual} prop={propostaAtual} />
      )}
      {tela.nome === "cronograma" && clienteAtual && (
        <ImpressaoCronograma cliente={clienteAtual} gestao={gestaoPorCliente[clienteAtual.id] || { frentes: [] }} />
      )}
      {tela.nome === "relatorios" && clienteAtual && relatorioAtual && (
        <ImpressaoRelatorio cliente={clienteAtual} rel={relatorioAtual} diags={diagsAtuais} dadosPainel={dadosPainelDe(clienteAtual.id)} />
      )}
      {tela.nome === "cargo" && clienteAtual && cargoAtual && (
        <ImpressaoCargo cliente={clienteAtual} cargo={cargoAtual} />
      )}
    </div>
  );
}
