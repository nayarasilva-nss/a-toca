import { comRetentativa } from "../ia/base.jsx";
import { gerarInfracoes } from "../ia/tabela.jsx";
import { ModuloTabela } from "../modulos/tabela.jsx";
import { stSet } from "../nucleo/persistencia.jsx";

export function TelaTabela({ app }) {
  const { campoPorCliente, clienteAtual, erro, executarGeracao, exportarImpressao, gerando, pontosCCTDe, salvarColecao, setTabelas, setTela, tabelas, tela } = app;

  const gerarTabela = (cliente) =>
    executarGeracao(async () => {
      const itens = await comRetentativa(() => gerarInfracoes(cliente, pontosCCTDe(cliente.id), campoPorCliente[cliente.id] || []));
      setTabelas((prev) => ({ ...prev, [cliente.id]: itens }));
      await stSet(`toca:tabela:${cliente.id}`, itens);
    });


  const mudarTabela = (clienteId, nova) => salvarColecao("tabelas", clienteId, nova);

  if (tela.nome === "tabela" && clienteAtual) {
    return (
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
    );
  }
  return null;
}
