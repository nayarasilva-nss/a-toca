import { comRetentativa } from "../ia/base.jsx";
import { gerarPlanoTreinamento, gerarRelatorioTreinamento } from "../ia/treinamentos.jsx";
import { ModuloTreinamentos, treinamentoVazio } from "../modulos/treinamentos.jsx";

export function TelaTreinamentos({ app }) {
  const { campoPorCliente, clienteAtual, erro, executarGeracao, exportarImpressao, gerando, gestaoPorCliente, pessoasAtuais, pessoasPorCliente, salvarColecao, setErro, setTela, tela, treinamentoAtual, treinamentosAtuais, treinamentosPorCliente } = app;

  const mudarTreinamentos = (clienteId, novos) => salvarColecao("treinamentos", clienteId, novos);

  const gerarTreinamentoCliente = (cliente, trein) =>
    executarGeracao(async () => {
      const frente = ((gestaoPorCliente[cliente.id] || {}).frentes || []).find((f) => f.id === trein.frenteId) || null;
      const gerado = await comRetentativa(() => gerarPlanoTreinamento(cliente, trein, frente, pessoasPorCliente[cliente.id] || [], campoPorCliente[cliente.id] || []));
      const lista = treinamentosPorCliente[cliente.id] || [];
      await mudarTreinamentos(cliente.id, lista.map((t) => (t.id === trein.id ? { ...trein, ...gerado } : t)));
    });


  const gerarRelTreinamentoCliente = (cliente, trein) =>
    executarGeracao(async () => {
      const gerado = await comRetentativa(() => gerarRelatorioTreinamento(cliente, trein));
      const lista = treinamentosPorCliente[cliente.id] || [];
      await mudarTreinamentos(cliente.id, lista.map((t) => (t.id === trein.id ? { ...trein, ...gerado } : t)));
    });


  if (tela.nome === "treinamentos" && clienteAtual) {
    return (
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
    );
  }
  return null;
}
