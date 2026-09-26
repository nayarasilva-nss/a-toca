import { distribuirCronograma } from "../ia/cronograma.jsx";
import { ModuloCronograma } from "../modulos/cronograma.jsx";

export function TelaCronograma({ app }) {
  const { clienteAtual, erro, exportarImpressao, gerando, gestaoPorCliente, mudarGestao, setErro, setGerando, setTela, tela } = app;

  const distribuirCronogramaCliente = async (cliente) => {
    const gestao = gestaoPorCliente[cliente.id] || { briefing: "", frentes: [] };
    setGerando(true);
    setErro(null);
    try {
      const mapa = await distribuirCronograma(cliente, gestao);
      const novasFrentes = (gestao.frentes || []).map((f) => ({
        ...f,
        acoes: (f.acoes || []).map((a) => (mapa[a.id] ? { ...a, semana: mapa[a.id] } : a)),
      }));
      await mudarGestao(cliente.id, { ...gestao, frentes: novasFrentes });
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  if (tela.nome === "cronograma" && clienteAtual) {
    return (
      <ModuloCronograma
        cliente={clienteAtual}
        gestao={gestaoPorCliente[clienteAtual.id] || { briefing: "", frentes: [] }}
        gerando={gerando}
        erro={erro}
        onMudar={(nova) => mudarGestao(clienteAtual.id, nova)}
        onDistribuir={() => distribuirCronogramaCliente(clienteAtual)}
        onImprimir={exportarImpressao}
        onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
      />
    );
  }
  return null;
}
