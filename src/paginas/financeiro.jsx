import { ModuloFinanceiro } from "../modulos/financeiro.jsx";
import { mensalidadesPendentes } from "../nucleo/recorrencia.jsx";

export function TelaFinanceiro({ app }) {
  const { clienteAtual, financeiroAtual, propostasPorCliente, salvarColecao, setTela, sistemasPorCliente, tela } = app;

  const mudarFinanceiro = (clienteId, novo) => salvarColecao("financeiro", clienteId, novo);

  if (tela.nome === "financeiro" && clienteAtual) {
    return (
      <ModuloFinanceiro
        cliente={clienteAtual}
        financeiro={financeiroAtual}
        propostaAceita={(propostasPorCliente[clienteAtual.id] || []).find((p) => p.status === "aceita") || null}
        sistema={(sistemasPorCliente || {})[clienteAtual.id] || null}
        mensalidadesPendentes={mensalidadesPendentes((sistemasPorCliente || {})[clienteAtual.id], financeiroAtual)}
        onMudar={(novo) => mudarFinanceiro(clienteAtual.id, novo)}
        onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
      />
    );
  }
  return null;
}
