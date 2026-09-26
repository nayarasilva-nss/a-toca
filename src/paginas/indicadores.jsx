import { gerarIndicadores } from "../ia/indicadores.jsx";
import { ModuloIndicadores } from "../modulos/indicadores.jsx";

export function TelaIndicadores({ app }) {
  const { cargosPorCliente, clienteAtual, diagsPorCliente, erro, exportarImpressao, gerando, indicadoresAtuais, indicadoresPorCliente, salvarColecao, setErro, setGerando, setTela, tela } = app;

  const mudarIndicadores = (clienteId, novos) => salvarColecao("indicadores", clienteId, novos);

  const gerarIndicadoresCliente = async (cliente) => {
    const painel = indicadoresPorCliente[cliente.id] || { obs: "", itens: [] };
    setGerando(true);
    setErro(null);
    try {
      const diags = diagsPorCliente[cliente.id] || [];
      const itens = await gerarIndicadores(cliente, painel.obs, cargosPorCliente[cliente.id] || [], diags.length ? diags[diags.length - 1] : null);
      await mudarIndicadores(cliente.id, { ...painel, itens });
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  if (tela.nome === "indicadores" && clienteAtual) {
    return (
      <ModuloIndicadores
        cliente={clienteAtual}
        painel={indicadoresAtuais}
        gerando={gerando}
        erro={erro}
        onMudar={(novos) => mudarIndicadores(clienteAtual.id, novos)}
        onGerar={() => gerarIndicadoresCliente(clienteAtual)}
        onImprimir={exportarImpressao}
        onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
      />
    );
  }
  return null;
}
