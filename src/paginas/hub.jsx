import { parseDataBR } from "../ia/cronograma.jsx";
import { formatarBR, parseValorBR } from "../ia/financeiro.jsx";
import { HubCliente } from "../telas/hub.jsx";

export function TelaHub({ app }) {
  const { alcadasAtuais, anomaliasPorCliente, campoAtuais, campoPorCliente, cargosAtuais, clienteAtual, diagsAtuais, diagsLiderAtuais, docsDe, estruturaAtual, faseDoCliente, financeiroAtual, financeiroPorCliente, fluxosAtuais, focoMentoriaAtual, gestaoPorCliente, indicadoresAtuais, manualAtual, mentoriaAtual, pessoasAtuais, pontosCCTDe, popsAtuais, propostasAtuais, propostasPorCliente, relMentoriaAtual, relatoriosAtuais, ritosAtuais, ritosPorCliente, setErro, setTela, tabelas, tela, treinamentosAtuais, percepcoesPorCliente } = app;

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
        ? { texto: "Há parcela vencida — cobre ou renegocie antes que vire ruído na relação", modulo: "financeiro" }
        : { texto: "Há ações atrasadas no cronograma — resolva ou realoque as semanas", modulo: "cronograma" };
    }
    if (fase === "prospeccao") return { texto: "Escuta: registre o briefing da primeira conversa. É dele que tudo nasce", modulo: "gestao" };
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
    if (fase === "sustentacao") return { texto: "Sustentação: os ritos rodam — acompanhe anomalias e o Painel do Projeto", modulo: "painel" };
    if (fase === "prova") return { texto: "Prova: reavalie o diagnóstico, verifique as metas e prepare o Relatório de Encerramento", modulo: "relatorios" };
    return null;
  };

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

  if (tela.nome === "cliente" && clienteAtual) {
    return (
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
        totalPercepcoes={((percepcoesPorCliente || {})[clienteAtual.id] || []).filter((c) => c.respostas).length}
        temperamentoMentorado={(pessoasAtuais.find((p) => p.id === (mentoriaAtual || {}).mentoradoId) || pessoasAtuais.find((p) => p.contratante) || {}).dominante || ""}
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
    );
  }
  return null;
}
