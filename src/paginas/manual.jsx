import { comRetentativa } from "../ia/base.jsx";
import { gerarManual } from "../ia/manual.jsx";
import { ModuloManual } from "../modulos/manual.jsx";

export function TelaManual({ app }) {
  const { campoPorCliente, clienteAtual, docsDe, erro, estruturaPorCliente, executarGeracao, exportarImpressao, gerando, manualAtual, pontosCCTDe, salvarColecao, setTela, tela } = app;

  const mudarManual = (clienteId, novas) => salvarColecao("manual", clienteId, novas);

  const gerarManualCliente = (cliente) =>
    executarGeracao(async () => {
      const secoes = await comRetentativa(() => gerarManual(cliente, pontosCCTDe(cliente.id), docsDe("politicas", cliente.id), estruturaPorCliente[cliente.id] || [], campoPorCliente[cliente.id] || []));
      await mudarManual(cliente.id, secoes);
    });


  if (tela.nome === "manual" && clienteAtual) {
    return (
      <ModuloManual
        cliente={clienteAtual}
        secoes={manualAtual}
        gerando={gerando}
        erro={erro}
        onMudar={(novas) => mudarManual(clienteAtual.id, novas)}
        onGerar={() => gerarManualCliente(clienteAtual)}
        onImprimir={exportarImpressao}
        onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
      />
    );
  }
  return null;
}
