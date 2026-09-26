import { gerarAlcadas } from "../ia/alcadas.jsx";
import { ModuloAlcadas } from "../modulos/alcadas.jsx";

export function TelaAlcadas({ app }) {
  const { alcadasAtuais, alcadasPorCliente, campoPorCliente, cargosPorCliente, clienteAtual, erro, estruturaPorCliente, exportarImpressao, gerando, salvarColecao, setErro, setGerando, setTela, tela } = app;

  const mudarAlcadas = (clienteId, novas) => salvarColecao("alcadas", clienteId, novas);

  const gerarAlcadasCliente = async (cliente) => {
    const alcadas = alcadasPorCliente[cliente.id] || { obs: "", itens: [] };
    setGerando(true);
    setErro(null);
    try {
      const itens = await gerarAlcadas(cliente, alcadas.obs, cargosPorCliente[cliente.id] || [], estruturaPorCliente[cliente.id] || [], (campoPorCliente[cliente.id] || []).filter((r) => r.tipo === "entrevista"));
      await mudarAlcadas(cliente.id, { ...alcadas, itens });
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  if (tela.nome === "alcadas" && clienteAtual) {
    return (
      <ModuloAlcadas
        cliente={clienteAtual}
        alcadas={alcadasAtuais}
        gerando={gerando}
        erro={erro}
        onMudar={(novas) => mudarAlcadas(clienteAtual.id, novas)}
        onGerar={() => gerarAlcadasCliente(clienteAtual)}
        onImprimir={exportarImpressao}
        onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
      />
    );
  }
  return null;
}
