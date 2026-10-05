import { useState, useEffect, useReducer } from "react";
import { COLECOES, COLECOES_INICIAIS, reduzirColecoes } from "./nucleo/estado.jsx";
import { pessoaVazia } from "./modulos/temperamentos.jsx";
import { FOCOS_MENTORIA, focoDe } from "./nucleo/focos.jsx";
import { frameworkMentorado as frameworkDoMentorado } from "./ia/diagnostico.jsx";
import { lerTema, aplicarTema } from "./nucleo/tema.js";
import { TelaLogin, chamarAuth } from "./telas/login.jsx";
import { AreaMentorado } from "./telas/mentorado.jsx";
import { Cabecalho } from "./componentes/cabecalho.jsx";
import { acoesNumeradas, parseDataBR, semanaAtualDe } from "./ia/cronograma.jsx";
import { FRAMEWORK_LIDER, FRAMEWORK_PESSOAL } from "./ia/diagnostico.jsx";
import { ImpressaoAlcadas } from "./modulos/alcadas.jsx";
import { ImpressaoCargo } from "./modulos/cargos.jsx";
import { ImpressaoCronograma } from "./modulos/cronograma.jsx";
import { ImpressaoDiagnostico } from "./modulos/diagnostico.jsx";
import { ImpressaoAta, ImpressaoChecklist, ImpressaoPolitica } from "./modulos/documentos.jsx";
import { ImpressaoEstrutura } from "./modulos/estrutura.jsx";
import { ImpressaoFluxo } from "./modulos/fluxos.jsx";
import { ImpressaoIndicadores } from "./modulos/indicadores.jsx";
import { ImpressaoManual } from "./modulos/manual.jsx";
import { ImpressaoPop } from "./modulos/pops.jsx";
import { ImpressaoProposta } from "./modulos/propostas.jsx";
import { ImpressaoRelMentoria } from "./modulos/relMentoria.jsx";
import { ImpressaoRelatorio } from "./modulos/relatorio.jsx";
import { ImpressaoRitos } from "./modulos/ritos.jsx";
import { ImpressaoTabela } from "./modulos/tabela.jsx";
import { ImpressaoPessoa } from "./modulos/temperamentos.jsx";
import { ImpressaoCertificados, ImpressaoRelTreinamento, ImpressaoTreinamento, mentoriaVazia } from "./modulos/treinamentos.jsx";
import { CORES, uid } from "./nucleo/base.jsx";
import { stGet, stSet } from "./nucleo/persistencia.jsx";
import { gerarPdfDoNo } from "./pdf/motor.jsx";
import { FormCliente } from "./telas/clientes.jsx";
import { DashboardInicial, ListaClientes } from "./telas/hub.jsx";
import { TelaHub } from "./paginas/hub.jsx";
import { TelaGestao } from "./paginas/gestao.jsx";
import { TelaConselheira } from "./paginas/conselheira.jsx";
import { TelaCct } from "./paginas/cct.jsx";
import { TelaEstrutura } from "./paginas/estrutura.jsx";
import { TelaManual } from "./paginas/manual.jsx";
import { TelaPops } from "./paginas/pops.jsx";
import { TelaRelatorio } from "./paginas/relatorio.jsx";
import { TelaFinanceiro } from "./paginas/financeiro.jsx";
import { TelaCronograma } from "./paginas/cronograma.jsx";
import { TelaPropostas } from "./paginas/propostas.jsx";
import { TelaDiagnostico } from "./paginas/diagnostico.jsx";
import { TelaTemperamentos } from "./paginas/temperamentos.jsx";
import { TelaDocumentos } from "./paginas/documentos.jsx";
import { TelaRitos } from "./paginas/ritos.jsx";
import { TelaIndicadores } from "./paginas/indicadores.jsx";
import { TelaAlcadas } from "./paginas/alcadas.jsx";
import { TelaAnomalias } from "./paginas/anomalias.jsx";
import { TelaPainel } from "./paginas/painel.jsx";
import { TelaRelMentoria } from "./paginas/relMentoria.jsx";
import { TelaDiagLider } from "./paginas/diagLider.jsx";
import { TelaTreinamentos } from "./paginas/treinamentos.jsx";
import { TelaMentoria } from "./paginas/mentoria.jsx";
import { TelaCampo } from "./paginas/campo.jsx";
import { TelaFluxos } from "./paginas/fluxos.jsx";
import { TelaTabela } from "./paginas/tabela.jsx";
import { TelaCargos } from "./paginas/cargos.jsx";

// ─── App ────────────────────────────────────────────────────────

export default function App() {
  const [nomeUsuario, setNomeUsuario] = useState(() => {
    const saved = localStorage.getItem("enraizar:usuario:nome");
    return saved || "";
  });
  const [clientes, setClientes] = useState([]);
  const [tela, setTela] = useState({ nome: "home" });
  const [colecoes, despachar] = useReducer(reduzirColecoes, COLECOES_INICIAIS);
  const atualizar = (colecao) => (valor) => despachar({ tipo: "atualizar", colecao, valor });
  const tabelas = colecoes.tabelas, setTabelas = atualizar("tabelas");
  const cargosPorCliente = colecoes.cargos;
  const gestaoPorCliente = colecoes.gestao, setGestaoPorCliente = atualizar("gestao");
  const estruturaPorCliente = colecoes.estrutura;
  const manualPorCliente = colecoes.manual;
  const cctPorCliente = colecoes.cct;
  const penseiraPorCliente = colecoes.penseira, setPenseiraPorCliente = atualizar("penseira");
  const popsPorCliente = colecoes.pops;
  const fluxosPorCliente = colecoes.fluxos;
  const campoPorCliente = colecoes.campo;
  const treinamentosPorCliente = colecoes.treinamentos;
  const mentoriaPorCliente = colecoes.mentoria, setMentoriaPorCliente = atualizar("mentoria");
  const diagsLiderPorCliente = colecoes.diagsLider;
  // RelMentoria agora é integrado em mentoriaPorCliente[id].relatorio
  const anomaliasPorCliente = colecoes.anomalias;
  const painelPorCliente = colecoes.painel;
  const alcadasPorCliente = colecoes.alcadas;
  const ritosPorCliente = colecoes.ritos;
  const indicadoresPorCliente = colecoes.indicadores;
  const [docsExtras, setDocsExtras] = useState({ politicas: {}, checklists: {}, atas: {} });
  const pessoasPorCliente = colecoes.pessoas;
  const diagsPorCliente = colecoes.diags, setDiagsPorCliente = atualizar("diags");
  const propostasPorCliente = colecoes.propostas, setPropostasPorCliente = atualizar("propostas");
  const relatoriosPorCliente = colecoes.relatorios, setRelatoriosPorCliente = atualizar("relatorios");
  const financeiroPorCliente = colecoes.financeiro, setFinanceiroPorCliente = atualizar("financeiro");
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState(null);
  const [pronto, setPronto] = useState(false);
  const [tema, setTema] = useState(lerTema);
  useEffect(() => { aplicarTema(tema); }, [tema]);
  const mudarTema = (t) => setTema(t);
  const [auth, setAuth] = useState({ estado: "carregando", usuario: null, precisaConfigurar: false });
  const autenticado = auth.estado === "ok" || auth.estado === "local";

  useEffect(() => {
    chamarAuth("sessao")
      .then(({ usuario, precisaConfigurar }) => setAuth({ estado: usuario ? "ok" : "anonimo", usuario, precisaConfigurar }))
      .catch((e) => {
        // sem API (npm run dev): segue em modo local com localStorage
        if (e.message === "sem-api" || e instanceof TypeError) setAuth({ estado: "local", usuario: null, precisaConfigurar: false });
        else setAuth({ estado: "anonimo", usuario: null, precisaConfigurar: false });
      });
  }, []);

  const entrar = (usuario) => {
    window.storage.reconectar();
    setAuth({ estado: "ok", usuario, precisaConfigurar: false });
  };

  const sair = async () => {
    try { await chamarAuth("sair", {}); } catch {}
    window.storage.reconectar();
    setClientes([]);
    setPronto(false);
    setTela({ nome: "home" });
    setAuth({ estado: "anonimo", usuario: null, precisaConfigurar: false });
  };

  useEffect(() => {
    if (!autenticado) return;
    stGet("toca:clientes").then(async (cs) => {
      cs = cs || [];
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
  }, [autenticado]);

  const carregarDadosCliente = async (id) => {
    for (const [colecao, def] of Object.entries(COLECOES)) {
      if (colecoes[colecao][id] !== undefined) continue;
      const lido = await stGet(`toca:${def.chave}:${id}`);
      let valor = def.normalizar ? def.normalizar(lido) : lido || def.padrao();
      if (colecao === "mentoria") {
        const relatorio = await stGet(`toca:relmentoria:${id}`);
        if (relatorio) valor = { ...valor, relatorio };
      }
      despachar({ tipo: "atualizar", colecao, valor: (prev) => ({ ...prev, [id]: valor }) });
    }
    for (const tipo of ["politicas", "checklists", "atas"]) {
      if (docsExtras[tipo][id] === undefined) {
        const dd = await stGet(`toca:${tipo}:${id}`);
        setDocsExtras((prev) => ({ ...prev, [tipo]: { ...prev[tipo], [id]: dd || [] } }));
      }
    }
  };

  const salvarColecao = async (colecao, clienteId, valor) => {
    despachar({ tipo: "atualizar", colecao, valor: (prev) => ({ ...prev, [clienteId]: valor }) });
    await stSet(`toca:${COLECOES[colecao].chave}:${clienteId}`, valor);
  };

  const executarGeracao = async (fn) => {
    setGerando(true);
    setErro(null);
    try {
      return await fn();
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
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
    if (novo.tipo === "pessoa") {
      const ficha = { ...pessoaVazia(), nome: novo.negocio, cargo: novo.segmento, contratante: true };
      await salvarColecao("pessoas", novo.id, [ficha]);
      await salvarColecao("mentoria", novo.id, { ...mentoriaVazia(), foco: novo.focoMentoria || "", mentoradoId: ficha.id });
    }
    abrirCliente(novo.id);
  };

  const salvarEdicaoCliente = async (dados) => {
    const lista = clientes.map((c) => (c.id === tela.id ? { ...c, ...dados } : c));
    setClientes(lista);
    await stSet("toca:clientes", lista);
    setTela({ nome: "cliente", id: tela.id });
  };

  const mudarGestao = (clienteId, nova) => salvarColecao("gestao", clienteId, nova);

  const pontosCCTDe = (clienteId) => (cctPorCliente[clienteId] && cctPorCliente[clienteId].pontos) || [];

  const docsDe = (tipo, clienteId) => docsExtras[tipo][clienteId] || [];

  const mudarDocs = async (tipo, clienteId, novos) => {
    setDocsExtras((prev) => ({ ...prev, [tipo]: { ...prev[tipo], [clienteId]: novos } }));
    await stSet(`toca:${tipo}:${clienteId}`, novos);
  };

  const mudarPessoas = (clienteId, novas) => salvarColecao("pessoas", clienteId, novas);

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
    a.download = `enraizar-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const [backupPendente, setBackupPendente] = useState(null);
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [precificacao, setPrecificacao] = useState({ base: "", porFrente: "", porSemana: "", porEncontro: "" });

  useEffect(() => {
    if (!autenticado) return;
    (async () => {
      const p = await stGet("toca:precificacao");
      if (p) setPrecificacao(p);
    })();
  }, [autenticado]);

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
    despachar({ tipo: "removerCliente", clienteId });
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
  const mentoriaAtualFoco = mentoriaPorCliente[clienteAtual ? clienteAtual.id : ""] || {};
  const focoMentoriaAtual = focoDe(mentoriaAtualFoco);
  const frameworkMentorado = frameworkDoMentorado(mentoriaAtualFoco);
  const tituloDiagMentorado = focoMentoriaAtual ? FOCOS_MENTORIA[focoMentoriaAtual].diagnostico : "Diagnóstico do Mentorado";
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

  const nomeDocumentoAtual = () =>
    `${clienteAtual ? clienteAtual.negocio : "Enraizar"} — ${tela.nome}`.replace(/[\\/:*?"<>|]/g, "").trim();

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
<div class="aviso-topo" style="background:var(--tinta);color:var(--ouro);padding:10px 16px;font-size:14px;text-align:center;font-family:sans-serif;">
  Escolha "Salvar como PDF" na janela de impressão.
  <button onclick="window.print()" style="margin-left:10px;padding:4px 12px;border-radius:4px;border:1px solid var(--ouro);background:transparent;color:var(--ouro);cursor:pointer;">Imprimir agora</button>
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

  if (auth.estado === "carregando") {
    return <div className="min-h-screen flex items-center justify-center font-serif italic" style={{ background: CORES.fundoPrincipal, color: CORES.dourado }}>Abrindo Enraizar...</div>;
  }
  if (auth.estado === "anonimo") {
    return <TelaLogin precisaConfigurar={auth.precisaConfigurar} onEntrar={entrar} />;
  }
  if (auth.usuario?.papel === "mentorado") {
    return <AreaMentorado usuario={auth.usuario} onSair={sair} tema={tema} onTema={mudarTema} />;
  }

  const app = {
    alcadasAtuais, alcadasPorCliente, anomaliasPorCliente, atasAtuais, campoAtuais, campoAtual, campoPorCliente, cargoAtual, cargosAtuais, cargosPorCliente, cctPorCliente, clienteAtual, dadosPainelDe, diagAtual, diagLiderAtual, diagsAtuais, diagsLiderAtuais, diagsLiderPorCliente, diagsPorCliente, docAtual, docsAtuais, docsDe, erro, estruturaAtual, estruturaPorCliente, executarGeracao, exportarImpressao, faseDoCliente, financeiroAtual, financeiroPorCliente, fluxoAtual, fluxosAtuais, fluxosPorCliente, focoMentoriaAtual, frameworkMentorado, gerando, gestaoPorCliente, indicadoresAtuais, indicadoresPorCliente, manualAtual, manualPorCliente, mentoriaAtual, mentoriaPorCliente, mudarDocs, mudarGestao, mudarPessoas, painelPorCliente, penseiraPorCliente, pessoaAtual, pessoasAtuais, pessoasPorCliente, pontosCCTDe, popAtual, popsAtuais, popsPorCliente, precificacao, propostaAtual, propostasAtuais, propostasPorCliente, relMentoriaAtual, relatorioAtual, relatoriosAtuais, relatoriosPorCliente, ritosAtuais, ritosPorCliente, salvarColecao, setErro, setGerando, setMentoriaPorCliente, setPenseiraPorCliente, setPrecificacao, setTabelas, setTela, tabelas, tela, tituloDiagMentorado, treinamentoAtual, treinamentosAtuais, treinamentosPorCliente,
  };

  return (
    <div className="min-h-screen">
      <Cabecalho onHome={() => setTela({ nome: "home" })} onClientes={() => setTela({ nome: "clientes" })} usuario={auth.usuario} onSair={auth.usuario ? sair : undefined} tema={tema} onTema={mudarTema} />

      <div className="print:hidden">
        {!pronto ? (
          <div className="text-center py-20 font-serif italic" style={{ color: CORES.dourado }}>Abrindo Enraizar...</div>
        ) : tela.nome === "home" ? (
          <DashboardInicial clientes={clientes} fases={fasesClientes} nomeUsuario={auth.usuario?.nome || nomeUsuario} onSetNomeUsuario={setNomeUsuario} onClientes={() => setTela({ nome: "clientes" })} onAbrir={abrirCliente} onNovo={() => setTela({ nome: "novo" })} />
        ) : tela.nome === "clientes" ? (
          <ListaClientes clientes={clientes} gestaoPorCliente={gestaoPorCliente} fases={fasesClientes} backupPendente={backupPendente} onAplicarBackup={aplicarBackup} onCancelarBackup={() => setBackupPendente(null)} onAbrir={abrirCliente} onNovo={() => setTela({ nome: "novo" })} onExcluir={excluirCliente} onExportarBackup={exportarBackup} onImportarBackup={importarBackup} onVoltar={() => setTela({ nome: "home" })} nomeUsuario={nomeUsuario} onSetNomeUsuario={setNomeUsuario} />
        ) : tela.nome === "novo" ? (
          <FormCliente onSalvar={salvarNovoCliente} onCancelar={() => setTela({ nome: "home" })} />
        ) : tela.nome === "editar" && clienteAtual ? (
          <FormCliente inicial={clienteAtual} onSalvar={salvarEdicaoCliente} onCancelar={() => setTela({ nome: "cliente", id: tela.id })} onExcluir={() => excluirCliente(clienteAtual.id)} />
        ) : ["cliente"].includes(tela.nome) ? (
          <TelaHub app={app} />
        ) : ["gestao"].includes(tela.nome) ? (
          <TelaGestao app={app} />
        ) : ["penseira"].includes(tela.nome) ? (
          <TelaConselheira app={app} />
        ) : ["cct"].includes(tela.nome) ? (
          <TelaCct app={app} />
        ) : ["estrutura"].includes(tela.nome) ? (
          <TelaEstrutura app={app} />
        ) : ["manual"].includes(tela.nome) ? (
          <TelaManual app={app} />
        ) : ["pops", "pop"].includes(tela.nome) ? (
          <TelaPops app={app} />
        ) : ["relatorios"].includes(tela.nome) ? (
          <TelaRelatorio app={app} />
        ) : ["financeiro"].includes(tela.nome) ? (
          <TelaFinanceiro app={app} />
        ) : ["cronograma"].includes(tela.nome) ? (
          <TelaCronograma app={app} />
        ) : ["propostas", "proposta"].includes(tela.nome) ? (
          <TelaPropostas app={app} />
        ) : ["diagnosticos", "diagnostico"].includes(tela.nome) ? (
          <TelaDiagnostico app={app} />
        ) : ["temperamentos", "pessoa", "entorno"].includes(tela.nome) ? (
          <TelaTemperamentos app={app} />
        ) : ["docs", "doc"].includes(tela.nome) ? (
          <TelaDocumentos app={app} />
        ) : ["ritos"].includes(tela.nome) ? (
          <TelaRitos app={app} />
        ) : ["indicadores"].includes(tela.nome) ? (
          <TelaIndicadores app={app} />
        ) : ["alcadas"].includes(tela.nome) ? (
          <TelaAlcadas app={app} />
        ) : ["anomalias"].includes(tela.nome) ? (
          <TelaAnomalias app={app} />
        ) : ["painel"].includes(tela.nome) ? (
          <TelaPainel app={app} />
        ) : ["relmentoria"].includes(tela.nome) ? (
          <TelaRelMentoria app={app} />
        ) : ["diagslider", "diaglider"].includes(tela.nome) ? (
          <TelaDiagLider app={app} />
        ) : ["treinamentos"].includes(tela.nome) ? (
          <TelaTreinamentos app={app} />
        ) : ["mentoria"].includes(tela.nome) ? (
          <TelaMentoria app={app} />
        ) : ["campo", "campo-reg"].includes(tela.nome) ? (
          <TelaCampo app={app} />
        ) : ["fluxos", "fluxo"].includes(tela.nome) ? (
          <TelaFluxos app={app} />
        ) : ["tabela"].includes(tela.nome) ? (
          <TelaTabela app={app} />
        ) : ["cargos", "cargo"].includes(tela.nome) ? (
          <TelaCargos app={app} />
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
