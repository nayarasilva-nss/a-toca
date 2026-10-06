import { chamarIA, extrairJSON } from "./base.jsx";
import { metaFoco, PROMPT_SEM_FOCO } from "../nucleo/focos.jsx";
import { resumoCampo } from "./campo.jsx";
import { FRAMEWORK_DIAG, FRAMEWORK_LIDER, FRAMEWORK_PESSOAL, percentualArea, frameworkMentorado } from "./diagnostico.jsx";
import { ESCOLA_LIDERANCA, ESCOLA_TEMPERAMENTOS, GUIA_MOLDAGEM, TEMPERAMENTOS } from "./documentos.jsx";
import { uid } from "../nucleo/base.jsx";

// ─── IA: Plano de Treinamento ───────────────────────────────────

export async function gerarPlanoTreinamento(cliente, trein, frente, pessoas, registrosCampo) {
  const publico = (pessoas || [])
    .filter((p) => p.dominante && TEMPERAMENTOS[p.dominante])
    .map((p) => `${p.nome} (${p.cargo || "?"}): ${TEMPERAMENTOS[p.dominante].rotulo}`)
    .join("; ");
  const dores = resumoCampo(registrosCampo || [], "geral").slice(0, 400);
  const prompt = `Voce e especialista em treinamento de equipes e lideranca para PMEs brasileiras, com base na ciencia dos temperamentos (sanguineo, colerico, melancolico, fleumatico).
${ESCOLA_TEMPERAMENTOS}
${ESCOLA_LIDERANCA}
Monte o plano do treinamento abaixo - pratico, aplicavel no chao da operacao, com a marca metodologica da consultora (temperamentos como lente de autoconhecimento e lideranca).

${cliente.tipo === "pessoa" ? `MENTORADO QUE CONTRATOU\nNome: ${cliente.negocio} (${cliente.segmento})\nContexto: ${cliente.contexto || "nao informado"}\nTreinamento avulso para o mentorado e o time que ele lidera - nao existe projeto de consultoria; o treinamento serve a jornada de mentoria dele.` : `CLIENTE\nNegocio: ${cliente.negocio} (${cliente.segmento})\nContexto: ${cliente.contexto || "nao informado"}\n${frente ? `Frente do projeto a que este treinamento pertence: ${frente.nome} - ${frente.escopo || ""}` : "Treinamento avulso (fora do projeto de consultoria)."}`}
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

export async function gerarJornadaMentoria(cliente, mentoria, mentorado, ultimoDiag, entorno, diagLider) {
  const FRJ = frameworkMentorado(mentoria);
  const focoJ = metaFoco(mentoria);
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
  const prompt = `Voce e mentora de desenvolvimento humano em PMEs brasileiras - o mentorado pode ser dono, gestor, lider, colaborador ou uma pessoa que simplesmente quer crescer. Sua especialidade: temperamentos, virtude e ${focoJ ? focoJ.especialidade : "crescimento pessoal"}.
${focoJ ? focoJ.prompt : PROMPT_SEM_FOCO}
${ESCOLA_TEMPERAMENTOS}
${focoJ && focoJ.entorno ? ESCOLA_LIDERANCA : ""} Desenhe a JORNADA DE MENTORIA: encontros com tema, objetivo e provocacao de cada um.

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
${blocoEntorno ? `Entorno do mentorado (temperamentos mapeados${focoJ && focoJ.entorno ? " - a mentoria de lideranca trabalha a relacao dele com estas pessoas" : " - use so quando o tema pedir; nao e o centro desta jornada"}): ${blocoEntorno}` : ""}

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

export async function estruturarSessaoMentoria(cliente, sessao) {
  const prompt = `Voce e mentora de desenvolvimento humano (Metodo Enraizar) - o mentorado pode ser dono, gestor, lider ou colaborador. Estruture as anotacoes brutas da sessao de mentoria abaixo em registro fiel - sem inventar nada que nao esteja nas anotacoes.

${cliente.tipo === "pessoa" ? "Mentorado" : "Cliente"}: ${cliente.negocio}
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

export async function gerarFichaMoldagem(cliente, mentoria, mentorado, diagsLider) {
  const focoF = metaFoco(mentoria);
  const guia = mentorado && mentorado.dominante && GUIA_MOLDAGEM[mentorado.dominante] ? GUIA_MOLDAGEM[mentorado.dominante] : null;
  const guiaSec = mentorado && mentorado.secundario && GUIA_MOLDAGEM[mentorado.secundario] ? GUIA_MOLDAGEM[mentorado.secundario] : null;
  const FRF = frameworkMentorado(mentoria);
  const ultimo = diagsLider && diagsLider.length ? diagsLider[diagsLider.length - 1] : null;
  const areasFracas = ultimo
    ? FRF.map((a, i) => { const p = percentualArea(ultimo.notas, i, FRF); return p !== null && p < 60 ? `${a.area} (${p}%)` : null; }).filter(Boolean).join(", ") || "nenhuma abaixo de 60%"
    : "diagnostico nao realizado";
  const prompt = `Voce e mentora de desenvolvimento humano especialista na ciencia dos temperamentos. Gere a FICHA DE MOLDAGEM do mentorado: orientacoes PRECISAS e praticas moldadoras no estilo da mentora.
${focoF ? focoF.prompt : PROMPT_SEM_FOCO}
As praticas moldam o que ESTE foco pede - nao presuma gestao de equipe quando o foco nao e lideranca.
${ESCOLA_TEMPERAMENTOS}
${focoF && focoF.entorno ? ESCOLA_LIDERANCA : ""}

O ESTILO DA MENTORA (siga-o rigorosamente): prescricoes concretas, muitas vezes fisicas ou aparentemente futeis, cirurgicamente escolhidas para CONTRABALANCAR a tendencia do temperamento. Exemplo real dela: a uma mentorada fleumatica, prescreveu USAR SALTO ALTO TODOS OS DIAS - parece futil, mas impede o conforto excessivo e molda postura de presenca. A pratica certa incomoda na medida e molda pelo corpo e pela repeticao, nao pelo discurso.

MENTORADO
Nome: ${cliente.tipo === "pessoa" ? cliente.negocio : (mentorado && mentorado.nome) || "nao informado"}
Papel: ${cliente.tipo === "pessoa" ? cliente.segmento : (mentorado && mentorado.cargo) || "nao informado"}
Contexto: ${cliente.contexto || "nao informado"}
Temperamento dominante: ${mentorado && mentorado.dominante ? TEMPERAMENTOS[mentorado.dominante].rotulo : "nao classificado"}${mentorado && mentorado.secundario && TEMPERAMENTOS[mentorado.secundario] ? ` · Secundario: ${TEMPERAMENTOS[mentorado.secundario].rotulo}` : ""}
Observacoes da mentora sobre a pessoa: ${(mentorado && mentorado.observacoes) || "nenhuma"}
Areas fracas do diagnostico: ${areasFracas}
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

export async function gerarMetasMentorado(cliente, mentoria, diagsLider) {
  const FRM = frameworkMentorado(mentoria);
  const ultimo = diagsLider && diagsLider.length ? diagsLider[diagsLider.length - 1] : null;
  const areasFracas = ultimo
    ? FRM.map((a, i) => { const p = percentualArea(ultimo.notas, i, FRM); return p !== null && p < 60 ? `${a.area} (${p}%)` : null; }).filter(Boolean).join(", ")
    : "diagnostico nao realizado";
  const focoM = metaFoco(mentoria);
  const prompt = `Voce e mentora de desenvolvimento humano (Metodo Enraizar).
${focoM ? focoM.prompt : PROMPT_SEM_FOCO} Sugira 2 a 3 METAS DO MENTORADO para a jornada de mentoria. Cada meta DEVE ser verificavel, com comportamento observavel + prazo. Nunca desejo vago ("melhorar a comunicacao"); sempre meta observavel ("delegar as decisoes de compra ate outubro"; "realizar 1 conversa dificil pendente ate o encontro 4").

MENTORADO: ${cliente.negocio} — ${cliente.segmento}
Contexto: ${cliente.contexto || "nao informado"}
Objetivos declarados: ${(mentoria && mentoria.objetivos) || "nao declarados"}
Areas fracas do diagnostico: ${areasFracas}

Responda APENAS com JSON compacto de uma linha:
{"m":[{"o":"meta observavel","p":"prazo"}]}
Sem markdown, sem texto fora do JSON.`;
  const texto = await chamarIA(prompt);
  const obj = extrairJSON(texto, "{", "}");
  return (obj.m || []).filter((m) => m && m.o).map((m) => ({ id: uid(), objetivo: m.o, prazo: m.p || "" }));
}

export async function analisarAnomalia(cliente, anomalia, pops, fluxos) {
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

export async function gerarMetasEngajamento(cliente, diags, riscosCampo, cctPontos) {
  const ultimoDiag = diags && diags.length ? diags[diags.length - 1] : null;
  const areasFracas = ultimoDiag
    ? FRAMEWORK_DIAG.map((a, i) => { const p = percentualArea(ultimoDiag.notas, i); return p !== null && p < 60 ? `${a.area} (${p}%)` : null; }).filter(Boolean).join(", ")
    : "diagnostico nao realizado";
  const pendCCT = (cctPontos || []).filter((p) => (p.statusConf || "pendente") !== "resolvido").length;
  const prompt = `Voce e consultora de governanca (Metodo Enraizar). Sugira 2 a 3 METAS PACTUADAS para o projeto abaixo. Cada meta DEVE ter objetivo + valor numerico + prazo. Nunca escreva desejo vago ("melhorar a conformidade"); sempre meta verificavel ("reduzir as pendencias de CCT de 12 para 0 ate novembro").

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

export async function gerarRelatorioTreinamento(cliente, trein) {
  const presentes = (trein.participantesLista || []).filter((p) => p.presente && p.nome.trim());
  const prompt = `Voce e especialista em treinamento de equipes com base na ciencia dos temperamentos. Escreva o RELATORIO DE REALIZACAO do treinamento abaixo, para o contratante - sobrio, factual, com valor percebido. Baseie-se APENAS nos dados fornecidos.

${cliente.tipo === "pessoa" ? `MENTORADO QUE CONTRATOU: ${cliente.negocio} (${cliente.segmento})` : `CLIENTE: ${cliente.negocio} (${cliente.segmento})`}
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

export async function gerarRelatorioEvolucao(cliente, mentoria, mentorado, diagsLider, percepcoes = "") {
  const encontros = mentoria.encontros || [];
  const realizados = encontros.filter((e) => e.realizada);
  const atividadesTotal = encontros.flatMap((e) => e.atividades || []);
  const atividadesFeitas = atividadesTotal.filter((a) => a.feita);
  const temasRealizados = realizados.map((e) => e.tema).join("; ") || "nenhum";
  const primeiroD = diagsLider && diagsLider.length ? diagsLider[0] : null;
  const ultimoD = diagsLider && diagsLider.length > 1 ? diagsLider[diagsLider.length - 1] : null;
  const FRR = frameworkMentorado(mentoria);
  const focoR = metaFoco(mentoria);
  const linhaDiag = (d, rot) => d
    ? `${rot}: ${FRR.map((a, i) => { const p = percentualArea(d.notas, i, FRR); return p !== null ? `${a.area} ${p}%` : null; }).filter(Boolean).join(", ")}`
    : null;
  const prompt = `Voce e mentora de desenvolvimento humano (Metodo Enraizar).
${focoR ? focoR.prompt : PROMPT_SEM_FOCO}
Escreva o RELATORIO DE EVOLUCAO da mentoria abaixo - honesto, baseado APENAS nos dados reais fornecidos, com numeros acima de adjetivos. E o documento que o mentorado (e quem paga a mentoria) recebe.

MENTORADO
Nome: ${cliente.tipo === "pessoa" ? cliente.negocio : (mentorado && mentorado.nome) || "nao informado"}
Papel: ${cliente.tipo === "pessoa" ? cliente.segmento : (mentorado && mentorado.cargo) || "nao informado"}
Objetivos da mentoria: ${mentoria.objetivos || "nao declarados"}

DADOS REAIS
${percepcoes ? `${percepcoes}\n(se houver inicio e fim, o antes/depois visto pelo entorno e a evidencia mais forte de evolucao - cite com numeros)\n` : ""}Encontros: ${realizados.length} realizados de ${encontros.length} desenhados
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
