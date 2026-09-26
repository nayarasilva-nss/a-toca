import { ModuloFinanceiro } from "../modulos/financeiro.jsx";

export function TelaFinanceiro({ app }) {
  const { clienteAtual, financeiroAtual, propostasPorCliente, salvarColecao, setTela, tela } = app;

  const mudarFinanceiro = (clienteId, novo) => salvarColecao("financeiro", clienteId, novo);

  if (tela.nome === "financeiro" && clienteAtual) {
    return (
      <ModuloFinanceiro
        cliente={clienteAtual}
        financeiro={financeiroAtual}
        propostaAceita={(propostasPorCliente[clienteAtual.id] || []).find((p) => p.status === "aceita") || null}
        onMudar={(novo) => mudarFinanceiro(clienteAtual.id, novo)}
        onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
      />
    );
  }
  return null;
}
