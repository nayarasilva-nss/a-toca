import { TituloSecao, Card, FasesEnraizar, FASES } from "../componentes/enraizar.jsx";
import { TEMPERAMENTOS } from "../ia/documentos.jsx";
import { FOCOS_MENTORIA } from "../nucleo/focos.jsx";
import { ArvoreEnraizar } from "../componentes/arvore.jsx";
import { BotaoPrimario, ConfirmarAcao } from "../componentes/ui.jsx";
import { acoesNumeradas, semanaAtualDe } from "../ia/cronograma.jsx";

// ─── Header Padrão para Módulos ────────────────────────────────
export function HeaderModulo({ titulo, subtitulo, cliente, onVoltar, acoes }) {
  return (
    <div className="enz-container" style={{ paddingBottom: 0 }}>
      <button onClick={onVoltar} className="enz-link" style={{ marginBottom: 20 }}>← {cliente.negocio}</button>
      <TituloSecao nivel={2} titulo={titulo} descricao={subtitulo} acoes={acoes} />
    </div>
  );
}

const NOME_FASE = Object.fromEntries(FASES.map((f) => [f.id, f.nome]));
const ROTULO_FASE = { ...NOME_FASE, perigo: "Atenção", encerrado: "Encerrado", prospeccao: "Escuta" };

function LinhaCliente({ cliente, fase, onAbrir, acoes }) {
  return (
    <div className="enz-card enz-card-vazado flex items-center justify-between gap-4 flex-wrap" style={{ padding: "18px 0" }}>
      <button onClick={onAbrir} className="text-left" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "inherit", minWidth: 0, flex: 1 }}>
        <div className="enz-card-titulo" style={{ fontSize: 22 }}>{cliente.negocio}</div>
        <div className="enz-card-subtitulo">{cliente.tipo === "pessoa" ? "mentorado" : "empresa"}{cliente.segmento ? ` · ${cliente.segmento}` : ""}</div>
      </button>
      <div className="flex items-center gap-4 flex-wrap">
        {fase && <span className="enz-rotulo" style={{ color: fase === "perigo" ? "var(--erro)" : "var(--ouro-texto)" }}>{ROTULO_FASE[fase] || fase}</span>}
        {acoes}
        <button onClick={onAbrir} className="enz-link">abrir →</button>
      </div>
    </div>
  );
}

export function DashboardInicial({ clientes, fases = {}, nomeUsuario, onAbrir, onNovo, onClientes }) {
  const total = clientes.length;
  const contagens = {};
  for (const c of clientes) { const f = fases[c.id] === "prospeccao" ? "escuta" : fases[c.id]; if (f) contagens[f] = (contagens[f] || 0) + 1; }
  const mentorados = clientes.filter((c) => c.tipo === "pessoa").length;
  const emAndamento = clientes.filter((c) => ["construcao", "sustentacao"].includes(fases[c.id])).length;
  const atencao = clientes.filter((c) => fases[c.id] === "perigo").length;
  const primeiro = (nomeUsuario || "").split(" ")[0];
  const kpis = [["Clientes", total], ["Em construção ou sustentação", emAndamento], ["Mentorados", mentorados], ["Precisam de atenção", atencao]];
  return (
    <div className="enz-container">
      <TituloSecao
        rotulo="Painel"
        titulo={primeiro ? `Oi, ${primeiro}.` : "Bem-vinda."}
        virada={total ? `${total} cliente${total > 1 ? "s" : ""} em jornada.` : "Nenhum cliente ainda."}
        acoes={<BotaoPrimario onClick={onNovo}>Novo cliente</BotaoPrimario>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4" style={{ marginTop: 40, borderTop: "1px solid var(--linha)" }}>
        {kpis.map(([rotulo, valor]) => (
          <div key={rotulo} style={{ padding: "20px 16px 20px 0" }}>
            <span className="enz-rotulo">{rotulo}</span>
            <div className="enz-numero" style={{ marginTop: 10, color: valor && rotulo === "Precisam de atenção" ? "var(--erro)" : "var(--tinta)" }}>{valor}</div>
          </div>
        ))}
      </div>

      <section style={{ marginTop: 56 }}>
        <TituloSecao nivel={2} rotulo="As seis fases" titulo="Onde cada cliente está." />
        <div style={{ marginTop: 32 }}>
          <FasesEnraizar contagens={contagens} />
        </div>
      </section>

      <section style={{ marginTop: 56 }}>
        <TituloSecao nivel={2} rotulo="Clientes" titulo="Quem está enraizando." acoes={total > 0 ? <button className="enz-link" onClick={onClientes}>ver todos →</button> : null} />
        <div style={{ marginTop: 24 }}>
          {total === 0 ? (
            <div className="enz-card enz-card-vazado flex items-center gap-6 flex-wrap">
              <ArvoreEnraizar variante="broto" tamanho={56} />
              <div>
                <div className="enz-card-titulo" style={{ fontSize: 22 }}>Nenhum cliente ainda.</div>
                <div className="enz-nota">crie o primeiro — a Escuta começa por ele.</div>
              </div>
            </div>
          ) : (
            clientes.slice(0, 8).map((c) => <LinhaCliente key={c.id} cliente={c} fase={fases[c.id]} onAbrir={() => onAbrir(c.id)} />)
          )}
        </div>
      </section>
    </div>
  );
}

export function ListaClientes({ clientes, fases = {}, backupPendente, onAplicarBackup, onCancelarBackup, onAbrir, onNovo, onExcluir, onExportarBackup, onImportarBackup }) {
  const mentorados = clientes.filter((c) => c.tipo === "pessoa").length;
  return (
    <div className="enz-container">
      <TituloSecao
        rotulo="Clientes"
        titulo="Todos os clientes."
        virada={clientes.length ? `${clientes.length - mentorados} empresa${clientes.length - mentorados === 1 ? "" : "s"} · ${mentorados} mentorado${mentorados === 1 ? "" : "s"}` : "Nenhum ainda."}
        acoes={<BotaoPrimario onClick={onNovo}>Novo cliente</BotaoPrimario>}
      />

      {backupPendente && (
        <Card rotulo="Backup" titulo={`${backupPendente.clientes.length} cliente${backupPendente.clientes.length === 1 ? "" : "s"} no arquivo.`} subtitulo="aplicar substitui todos os dados atuais do app." style={{ marginTop: 32 }}>
          <div className="flex gap-4 items-center flex-wrap">
            <BotaoPrimario onClick={onAplicarBackup}>Aplicar backup</BotaoPrimario>
            <button onClick={onCancelarBackup} className="enz-link">cancelar</button>
          </div>
        </Card>
      )}

      <div style={{ marginTop: 32 }}>
        {clientes.length === 0 ? (
          <div className="enz-card enz-card-vazado enz-nota">nenhum cliente ainda. crie o primeiro.</div>
        ) : (
          clientes.map((c) => (
            <LinhaCliente
              key={c.id}
              cliente={c}
              fase={fases[c.id]}
              onAbrir={() => onAbrir(c.id)}
              acoes={<ConfirmarAcao rotulo="excluir" aviso="isso apaga documentos, planos, atas e histórico deste cliente" onConfirmar={() => onExcluir(c.id)} />}
            />
          ))
        )}
      </div>

      <div className="flex gap-6 items-center flex-wrap" style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--linha)" }}>
        <button onClick={onExportarBackup} className="enz-link">exportar backup (.json)</button>
        <label className="enz-link" style={{ cursor: "pointer" }}>
          importar backup
          <input type="file" accept="application/json,.json" style={{ display: "none" }} onChange={(e) => { const arq = e.target.files && e.target.files[0]; if (arq) onImportarBackup(arq); e.target.value = ""; }} />
        </label>
      </div>
    </div>
  );
}

export function HubCliente({ cliente, proximoPasso, metasAceitas, focoMentoria, temperamentoMentorado, totalCampo, totalDiagsLider, temRelMentoria, totalAnomalias, totalAnomaliasTratadas, totalTreinamentos, totalTreinamentosRealizados, totalEncontros, totalEncontrosRealizados, totalCargos, temTabela, gestao, totalPosicoes, totalAlcadas, totalRitos, totalIndicadores, totalSecoesManual, totalPontosCCT, totalPops, totalFluxos, totalPoliticas, totalChecklists, totalPessoas, totalDiagnosticos, totalPropostas, totalRelatorios, resumoFinanceiro, onModulo, onEditarCliente, onVoltar }) {
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
          ? "Projeto ainda não iniciado"
          : `Semana ${semCrono}${gestao.duracaoSemanas ? ` de ${gestao.duracaoSemanas}` : ""}${atrasadasCrono ? ` · ${atrasadasCrono} atrasada${atrasadasCrono > 1 ? "s" : ""}` : ""}`,
    diagnosticos: totalDiagnosticos > 0 ? `${totalDiagnosticos} diagnóstico${totalDiagnosticos > 1 ? "s" : ""}` : "Ainda não avaliado",
    propostas: totalPropostas > 0 ? `${totalPropostas} proposta${totalPropostas > 1 ? "s" : ""}` : "Nenhuma proposta ainda",
    temperamentos: ehPessoa
      ? (temperamentoMentorado && TEMPERAMENTOS[temperamentoMentorado] ? `${TEMPERAMENTOS[temperamentoMentorado].rotulo}${totalPessoas > 1 ? ` · entorno: ${totalPessoas - 1}` : ""}` : "Ainda não classificado")
      : totalPessoas > 0 ? `${totalPessoas} pessoa${totalPessoas > 1 ? "s" : ""} mapeada${totalPessoas > 1 ? "s" : ""}` : "Ninguém mapeado ainda",
    cct: totalPontosCCT > 0 ? `${totalPontosCCT} ponto${totalPontosCCT > 1 ? "s" : ""} obrigatório${totalPontosCCT > 1 ? "s" : ""}` : "CCT ainda não analisada",
    campo: totalCampo > 0 ? `${totalCampo} registro${totalCampo > 1 ? "s" : ""} no caderno` : "O caderno está em branco",
    diagslider: totalDiagsLider > 0 ? `${totalDiagsLider} avaliaç${totalDiagsLider > 1 ? "ões" : "ão"}` : "Ainda não avaliado",
    relmentoria: temRelMentoria ? "Relatório pronto" : "A prova da jornada",
    anomalias: totalAnomalias > 0 ? `${totalAnomaliasTratadas}/${totalAnomalias} tratadas` : "Nenhuma anomalia registrada",
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
    relatorios: totalRelatorios > 0 ? `${totalRelatorios} relatório${totalRelatorios > 1 ? "s" : ""}` : "O fechamento do projeto",
    financeiro: resumoFinanceiro || "Nenhuma parcela registrada",
  };

  const TITULOS = {
    gestao: "Briefing & Plano de Ação",
    cronograma: "Cronograma",
    diagnosticos: "Diagnóstico de Maturidade",
    diagslider: focoMentoria && FOCOS_MENTORIA[focoMentoria] ? FOCOS_MENTORIA[focoMentoria].diagnostico : "Diagnóstico do Mentorado",
    relmentoria: "Relatório de Evolução",
    anomalias: "Tratamento de Anomalias",
    painel: "Painel do Projeto",
    propostas: "Propostas Comerciais",
    temperamentos: ehPessoa ? "Temperamento" : "Temperamentos",
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
    <Card onClick={() => onModulo(chave)} titulo={TITULOS[chave]} subtitulo={estados[chave]} style={compacto ? { padding: "18px 20px" } : { padding: "22px 24px" }} />
  );
  return (
    <div className="enz-container">
      <button onClick={onVoltar} className="enz-link" style={{ marginBottom: 20 }}>← Todos os clientes</button>
      <TituloSecao
        rotulo={ehPessoa ? "Mentorado" : "Cliente"}
        titulo={cliente.negocio}
        virada={cliente.segmento}
        acoes={<button onClick={onEditarCliente} className="enz-link">editar dados</button>}
      />

      {(metasAceitas || []).filter((m) => m.objetivo).length > 0 && (
        <Card variante="vazado" rotulo="Metas pactuadas" style={{ marginTop: 40 }}>
          {(metasAceitas || []).filter((m) => m.objetivo).map((m) => (
            <div key={m.id} className="flex items-baseline gap-3" style={{ padding: "4px 0" }}>
              <span className="enz-ponto" style={{ color: "var(--ouro)" }} />
              <span>{m.objetivo}{m.prazo ? <span className="enz-legenda"> — até {m.prazo}</span> : null}</span>
            </div>
          ))}
        </Card>
      )}

      {proximoPasso && servicosCliente.consultoria && (
        <Card onClick={() => onModulo(proximoPasso.modulo)} rotulo="Próximo passo" style={{ marginTop: 32 }}>
          <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <span style={{ fontFamily: "var(--font-display)", fontSize: 21, lineHeight: 1.3, color: "var(--tinta)" }}>{proximoPasso.texto}</span>
            <span className="enz-legenda">abrir →</span>
          </div>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" style={{ marginTop: 32 }}>
        {servicosCliente.mentoria && (
          <Card onClick={() => onModulo("mentoria")} rotulo="Jornada" titulo="Mentoria" subtitulo={totalEncontros > 0 ? `${totalEncontrosRealizados}/${totalEncontros} encontros realizados` : focoMentoria ? "jornada ainda não desenhada" : "defina o foco da jornada"} />
        )}
        {servicosCliente.treinamentos && (
          <Card onClick={() => onModulo("treinamentos")} rotulo="Turmas" titulo="Treinamentos" subtitulo={totalTreinamentos > 0 ? `${totalTreinamentosRealizados}/${totalTreinamentos} realizados` : "nenhum treinamento ainda"} />
        )}
        <Card onClick={() => onModulo("penseira")} rotulo="IA" titulo="Conselheira" subtitulo={ehPessoa ? "despeje um pensamento sobre a jornada e examine-o com clareza" : "despeje um pensamento e examine-o com clareza — dúvidas com base legal, sobre qualquer frente"} />
      </div>

      {(servicosCliente.consultoria || ehPessoa) && (
        <section style={{ marginTop: 56 }}>
          <TituloSecao
            nivel={2}
            rotulo={ehPessoa ? "O mentorado" : "O contratante"}
            titulo={ehPessoa ? "A pessoa, o combinado e o entorno." : "A pessoa e a relação."}
            descricao={ehPessoa ? "Mapeie também as pessoas do entorno dela." : "De quem contrata ao que foi combinado."}
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" style={{ marginTop: 24 }}>
            {alaContratante.map((chave) => <Cartao key={chave} chave={chave} />)}
          </div>
        </section>
      )}

      {servicosCliente.consultoria && (
        <section style={{ marginTop: 56 }}>
          <TituloSecao nivel={2} rotulo="O negócio" titulo="A empresa, por frentes de trabalho." />
          {alaNegocio.map((grupo) => (
            <div key={grupo.frente} style={{ marginTop: 32 }}>
              <span className="enz-rotulo" style={{ marginBottom: 12 }}>{grupo.frente}</span>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {grupo.chaves.map((chave) => <Cartao key={chave} chave={chave} compacto />)}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
