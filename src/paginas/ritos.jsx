import { gerarRitos } from "../ia/ritos.jsx";
import { ModuloRitos } from "../modulos/ritos.jsx";

export function TelaRitos({ app }) {
  const { cargosPorCliente, clienteAtual, erro, exportarImpressao, gerando, indicadoresPorCliente, ritosAtuais, ritosPorCliente, salvarColecao, setErro, setGerando, setTela, tela } = app;

  const mudarRitos = (clienteId, novos) => salvarColecao("ritos", clienteId, novos);

  const gerarRitosCliente = async (cliente) => {
    const ritos = ritosPorCliente[cliente.id] || { obs: "", itens: [] };
    const painel = indicadoresPorCliente[cliente.id] || { obs: "", itens: [] };
    setGerando(true);
    setErro(null);
    try {
      const itens = await gerarRitos(cliente, ritos.obs, cargosPorCliente[cliente.id] || [], painel.itens || []);
      await mudarRitos(cliente.id, { ...ritos, itens });
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  if (tela.nome === "ritos" && clienteAtual) {
    return (
      <ModuloRitos
        cliente={clienteAtual}
        ritos={ritosAtuais}
        gerando={gerando}
        erro={erro}
        onMudar={(novos) => mudarRitos(clienteAtual.id, novos)}
        onGerar={() => gerarRitosCliente(clienteAtual)}
        onImprimir={exportarImpressao}
        onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
      />
    );
  }
  return null;
}
