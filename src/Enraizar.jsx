import { useState, useEffect, useReducer } from "react";
import { COLECOES, COLECOES_INICIAIS, reduzirColecoes } from "./nucleo/estado.jsx";
import { Cabecalho } from "./componentes/cabecalho.jsx";
import { Toast } from "./componentes/ui.jsx";
import { gerarAlcadas } from "./ia/alcadas.jsx";
import { comRetentativa } from "./ia/base.jsx";
import { campoVazio, gerarPlanoAcao, gerarRoteiroEntrevista, gerarRoteiroVisita, resumoCampo } from "./ia/campo.jsx";
import { gerarDescricaoCargo } from "./ia/cargos.jsx";
import { analisarCCT } from "./ia/cct.jsx";
import { conversarPenseira } from "./ia/conselheira.jsx";
import { acoesNumeradas, distribuirCronograma, parseDataBR, semanaAtualDe } from "./ia/cronograma.jsx";
import { FRAMEWORK_DIAG, FRAMEWORK_LIDER, FRAMEWORK_PESSOAL, gerarLeituraDiagLider, gerarLeituraDiagnostico, percentualArea } from "./ia/diagnostico.jsx";
import { CONFIG_DOCS, TEMPERAMENTOS, docVazio } from "./ia/documentos.jsx";
import { gerarEstrutura } from "./ia/estrutura.jsx";
import { formatarBR, parseValorBR } from "./ia/financeiro.jsx";
import { gerarFluxo } from "./ia/fluxo.jsx";
import { gerarIndicadores } from "./ia/indicadores.jsx";
import { gerarManual } from "./ia/manual.jsx";
import { gerarPOP } from "./ia/pop.jsx";
import { gerarProposta } from "./ia/proposta.jsx";
import { gerarRelatorio } from "./ia/relatorio.jsx";
import { gerarAtualizacaoPlano, gerarRitos } from "./ia/ritos.jsx";
import { gerarInfracoes } from "./ia/tabela.jsx";
import { gerarAnaliseTemperamento } from "./ia/temperamentos.jsx";
import { analisarAnomalia, estruturarSessaoMentoria, gerarFichaMoldagem, gerarJornadaMentoria, gerarMetasEngajamento, gerarMetasMentorado, gerarPlanoTreinamento, gerarRelatorioEvolucao, gerarRelatorioTreinamento } from "./ia/treinamentos.jsx";
import { ImpressaoAlcadas, ModuloAlcadas } from "./modulos/alcadas.jsx";
import { ModuloAnomalias } from "./modulos/anomalias.jsx";
import { EditorCampo, ListaCampo } from "./modulos/campo.jsx";
import { EditorCargo, ImpressaoCargo, ListaCargos, cargoVazio } from "./modulos/cargos.jsx";
import { ModuloCCT } from "./modulos/cct.jsx";
import { ModuloPenseira } from "./modulos/conselheira.jsx";
import { ImpressaoCronograma, ModuloCronograma } from "./modulos/cronograma.jsx";
import { EditorDiagnostico, ImpressaoDiagnostico, ListaDiagnosticos, diagVazio } from "./modulos/diagnostico.jsx";
import { EditorDoc, ImpressaoAta, ImpressaoChecklist, ImpressaoPolitica, ListaDocs } from "./modulos/documentos.jsx";
import { ImpressaoEstrutura, ModuloEstrutura } from "./modulos/estrutura.jsx";
import { ModuloFinanceiro } from "./modulos/financeiro.jsx";
import { EditorFluxo, ImpressaoFluxo, ListaFluxos, fluxoVazio } from "./modulos/fluxos.jsx";
import { ModuloGestao } from "./modulos/gestao.jsx";
import { ImpressaoIndicadores, ModuloIndicadores } from "./modulos/indicadores.jsx";
import { ImpressaoManual, ModuloManual } from "./modulos/manual.jsx";
import { ModuloMentoria } from "./modulos/mentoria.jsx";
import { ModuloPainel } from "./modulos/painel.jsx";
import { EditorPop, ImpressaoPop, ListaPops, popVazio } from "./modulos/pops.jsx";
import { EditorProposta, ImpressaoProposta, ListaPropostas, propostaVazia } from "./modulos/propostas.jsx";
import { ImpressaoRelMentoria, ModuloRelMentoria } from "./modulos/relMentoria.jsx";
import { ImpressaoRelatorio, ModuloRelatorio } from "./modulos/relatorio.jsx";
import { ImpressaoRitos, ModuloRitos } from "./modulos/ritos.jsx";
import { ImpressaoTabela, ModuloTabela } from "./modulos/tabela.jsx";
import { EditorPessoa, ImpressaoPessoa, ListaPessoas, pessoaVazia } from "./modulos/temperamentos.jsx";
import { ImpressaoCertificados, ImpressaoRelTreinamento, ImpressaoTreinamento, ModuloTreinamentos, mentoriaVazia, treinamentoVazio } from "./modulos/treinamentos.jsx";
import { CORES, STATUS_FRENTE, uid } from "./nucleo/base.jsx";
import { stGet, stSet } from "./nucleo/persistencia.jsx";
import { gerarPdfDoNo } from "./pdf/motor.jsx";
import { FormCliente } from "./telas/clientes.jsx";
import { DashboardInicial, HubCliente, ListaClientes } from "./telas/hub.jsx";

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
  const cargosPorCliente = colecoes.cargos, setCargosPorCliente = atualizar("cargos");
  const gestaoPorCliente = colecoes.gestao, setGestaoPorCliente = atualizar("gestao");
  const estruturaPorCliente = colecoes.estrutura, setEstruturaPorCliente = atualizar("estrutura");
  const manualPorCliente = colecoes.manual, setManualPorCliente = atualizar("manual");
  const cctPorCliente = colecoes.cct, setCctPorCliente = atualizar("cct");
  const penseiraPorCliente = colecoes.penseira, setPenseiraPorCliente = atualizar("penseira");
  const popsPorCliente = colecoes.pops, setPopsPorCliente = atualizar("pops");
  const fluxosPorCliente = colecoes.fluxos, setFluxosPorCliente = atualizar("fluxos");
  const campoPorCliente = colecoes.campo, setCampoPorCliente = atualizar("campo");
  const treinamentosPorCliente = colecoes.treinamentos, setTreinamentosPorCliente = atualizar("treinamentos");
  const mentoriaPorCliente = colecoes.mentoria, setMentoriaPorCliente = atualizar("mentoria");
  const diagsLiderPorCliente = colecoes.diagsLider, setDiagsLiderPorCliente = atualizar("diagsLider");
  // RelMentoria agora é integrado em mentoriaPorCliente[id].relatorio
  const anomaliasPorCliente = colecoes.anomalias, setAnomaliasPorCliente = atualizar("anomalias");
  const painelPorCliente = colecoes.painel, setPainelPorCliente = atualizar("painel");
  const alcadasPorCliente = colecoes.alcadas, setAlcadasPorCliente = atualizar("alcadas");
  const ritosPorCliente = colecoes.ritos, setRitosPorCliente = atualizar("ritos");
  const indicadoresPorCliente = colecoes.indicadores, setIndicadoresPorCliente = atualizar("indicadores");
  const [docsExtras, setDocsExtras] = useState({ politicas: {}, checklists: {}, atas: {} });
  const pessoasPorCliente = colecoes.pessoas, setPessoasPorCliente = atualizar("pessoas");
  const diagsPorCliente = colecoes.diags, setDiagsPorCliente = atualizar("diags");
  const propostasPorCliente = colecoes.propostas, setPropostasPorCliente = atualizar("propostas");
  const relatoriosPorCliente = colecoes.relatorios, setRelatoriosPorCliente = atualizar("relatorios");
  const financeiroPorCliente = colecoes.financeiro, setFinanceiroPorCliente = atualizar("financeiro");
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState(null);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
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
  }, []);

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
    a.download = `enraizar-backup-${new Date().toISOString().slice(0, 10)}.json`;
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
      return { texto: "Raio-X: faça o diagnóstico de maturidade — os números vendem o Acordo", modulo: "diagnosticos" };
    }
    if (fase === "raiox") return { texto: "Acordo: gere a proposta com as metas pactuadas — a proposta está pronta", modulo: "propostas" };
    if (fase === "acordo") return { texto: "Acordo na rua — quando o cliente fechar, marque a proposta como Aceita para a Construção começar", modulo: "propostas" };
    if (fase === "construcao") {
      if (!parseDataBR(g.inicio)) return { texto: "Construção: defina o início e a duração no Cronograma", modulo: "cronograma" };
      if (!(g.frentes || []).length) return { texto: "Construção: gere o plano de ação a partir do briefing", modulo: "gestao" };
      if (!(fin.parcelas || []).length) return { texto: "Registre as parcelas no Financeiro", modulo: "financeiro" };
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
    `${clienteAtual ? clienteAtual.negocio : "ENRAIZAR"} — ${tela.nome}`.replace(/[\\/:*?"<>|]/g, "").trim();

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
<div class="aviso-topo" style="background:#6B5D42;color:#E8C547;padding:10px 16px;font-size:14px;text-align:center;font-family:sans-serif;">
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
      <Cabecalho onHome={() => setTela({ nome: "home" })} onClientes={() => setTela({ nome: "clientes" })} />

      <div className="print:hidden">
        {!pronto ? (
          <div className="text-center py-20 font-serif italic" style={{ color: CORES.dourado }}>Abrindo ENRAIZAR...</div>
        ) : tela.nome === "home" ? (
          <DashboardInicial clientes={clientes} nomeUsuario={nomeUsuario} onSetNomeUsuario={setNomeUsuario} onAbrir={abrirCliente} onNovo={() => setTela({ nome: "novo" })} />
        ) : tela.nome === "clientes" ? (
          <ListaClientes clientes={clientes} gestaoPorCliente={gestaoPorCliente} fases={fasesClientes} backupPendente={backupPendente} onAplicarBackup={aplicarBackup} onCancelarBackup={() => setBackupPendente(null)} onAbrir={abrirCliente} onNovo={() => setTela({ nome: "novo" })} onExcluir={excluirCliente} onExportarBackup={exportarBackup} onImportarBackup={importarBackup} onVoltar={() => setTela({ nome: "home" })} nomeUsuario={nomeUsuario} onSetNomeUsuario={setNomeUsuario} />
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
