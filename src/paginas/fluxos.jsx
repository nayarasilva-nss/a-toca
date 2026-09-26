import { gerarFluxo } from "../ia/fluxo.jsx";
import { EditorFluxo, ListaFluxos, fluxoVazio } from "../modulos/fluxos.jsx";

export function TelaFluxos({ app }) {
  const { campoPorCliente, cargosPorCliente, clienteAtual, erro, executarGeracao, exportarImpressao, fluxoAtual, fluxosAtuais, fluxosPorCliente, gerando, popsPorCliente, salvarColecao, setErro, setTela, tela } = app;

  const mudarFluxos = (clienteId, novos) => salvarColecao("fluxos", clienteId, novos);

  const gerarFluxoCliente = (cliente, fluxo) =>
    executarGeracao(async () => {
      const gerado = await gerarFluxo(cliente, fluxo, cargosPorCliente[cliente.id] || [], popsPorCliente[cliente.id] || [], campoPorCliente[cliente.id] || []);
      const fluxos = fluxosPorCliente[cliente.id] || [];
      await mudarFluxos(cliente.id, fluxos.map((f) => (f.id === fluxo.id ? { ...fluxo, ...gerado } : f)));
    });


  if (tela.nome === "fluxos" && clienteAtual) {
    return (
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
    );
  }
  if (tela.nome === "fluxo" && clienteAtual && fluxoAtual) {
    return (
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
    );
  }
  return null;
}
