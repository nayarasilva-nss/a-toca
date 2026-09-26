import { comRetentativa } from "../ia/base.jsx";
import { gerarPOP } from "../ia/pop.jsx";
import { EditorPop, ListaPops, popVazio } from "../modulos/pops.jsx";

export function TelaPops({ app }) {
  const { campoPorCliente, cargosPorCliente, clienteAtual, erro, executarGeracao, exportarImpressao, fluxosPorCliente, gerando, pontosCCTDe, popAtual, popsAtuais, popsPorCliente, salvarColecao, setErro, setTela, tela } = app;

  const mudarPops = (clienteId, novos) => salvarColecao("pops", clienteId, novos);

  const gerarPopCliente = (cliente, pop) =>
    executarGeracao(async () => {
      const pops = popsPorCliente[cliente.id] || [];
      const gerado = await comRetentativa(() => gerarPOP(cliente, pop, cargosPorCliente[cliente.id] || [], pontosCCTDe(cliente.id), fluxosPorCliente[cliente.id] || [], campoPorCliente[cliente.id] || []));
      const atualizado = { ...pop, ...gerado };
      await mudarPops(cliente.id, pops.map((p) => (p.id === pop.id ? atualizado : p)));
    });


  if (tela.nome === "pops" && clienteAtual) {
    return (
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
    );
  }
  if (tela.nome === "pop" && clienteAtual && popAtual) {
    return (
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
    );
  }
  return null;
}
