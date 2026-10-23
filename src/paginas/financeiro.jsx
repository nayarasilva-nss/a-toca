import { ModuloFinanceiro } from "../modulos/financeiro.jsx";
import { mensalidadesPendentes } from "../nucleo/recorrencia.jsx";
import { listaSistemas } from "../nucleo/sistemas.js";

export function TelaFinanceiro({ app }) {
  const { clienteAtual, financeiroAtual, propostasPorCliente, salvarColecao, setTela, sistemasPorCliente, tela } = app;

  const mudarFinanceiro = (clienteId, novo) => salvarColecao("financeiro", clienteId, novo);

  if (tela.nome === "financeiro" && clienteAtual) {
    const lista = listaSistemas(sistemasPorCliente, clienteAtual.id);
    return (
      <ModuloFinanceiro
        cliente={clienteAtual}
        financeiro={financeiroAtual}
        propostaAceita={(propostasPorCliente[clienteAtual.id] || []).find((p) => p.status === "aceita") || null}
        sistemas={lista}
        mensalidadesPendentes={lista.flatMap((s) => mensalidadesPendentes(s, financeiroAtual, new Date(), lista))}
        onMudar={(novo) => mudarFinanceiro(clienteAtual.id, novo)}
        onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
      />
    );
  }
  return null;
}
