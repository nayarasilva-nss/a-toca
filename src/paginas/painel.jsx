import { ModuloPainel } from "../modulos/painel.jsx";

export function TelaPainel({ app }) {
  const { clienteAtual, dadosPainelDe, painelPorCliente, salvarColecao, setTela, tela } = app;

  const mudarPainel = (clienteId, novo) => salvarColecao("painel", clienteId, novo);

  if (tela.nome === "painel" && clienteAtual) {
    return (
      <ModuloPainel
        cliente={clienteAtual}
        dados={dadosPainelDe(clienteAtual.id)}
        painel={painelPorCliente[clienteAtual.id] || {}}
        onMudar={(novo) => mudarPainel(clienteAtual.id, novo)}
        onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
      />
    );
  }
  return null;
}
