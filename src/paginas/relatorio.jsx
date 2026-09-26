import { comRetentativa } from "../ia/base.jsx";
import { acoesNumeradas } from "../ia/cronograma.jsx";
import { FRAMEWORK_DIAG, percentualArea } from "../ia/diagnostico.jsx";
import { gerarRelatorio } from "../ia/relatorio.jsx";
import { ModuloRelatorio } from "../modulos/relatorio.jsx";
import { STATUS_FRENTE } from "../nucleo/base.jsx";

export function TelaRelatorio({ app }) {
  const { alcadasPorCliente, campoPorCliente, cargosPorCliente, clienteAtual, diagsAtuais, diagsPorCliente, docsDe, erro, estruturaPorCliente, executarGeracao, exportarImpressao, fluxosPorCliente, gerando, gestaoPorCliente, indicadoresPorCliente, manualPorCliente, pessoasPorCliente, popsPorCliente, propostasPorCliente, relatorioAtual, relatoriosAtuais, relatoriosPorCliente, ritosPorCliente, salvarColecao, setErro, setTela, tabelas, tela, treinamentosPorCliente } = app;

  const mudarRelatorios = (clienteId, novos) => salvarColecao("relatorios", clienteId, novos);

  const gerarRelatorioCliente = (cliente, rel) =>
    executarGeracao(async () => {
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
    });


  if (tela.nome === "relatorios" && clienteAtual) {
    return (
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
    );
  }
  return null;
}
