import { comRetentativa } from "../ia/base.jsx";
import { analisarAnomalia } from "../ia/treinamentos.jsx";
import { ModuloAnomalias } from "../modulos/anomalias.jsx";
import { uid } from "../nucleo/base.jsx";

export function TelaAnomalias({ app }) {
  const { anomaliasPorCliente, clienteAtual, erro, executarGeracao, fluxosPorCliente, gerando, gestaoPorCliente, mudarGestao, popsPorCliente, salvarColecao, setTela, tela } = app;

  const mudarAnomalias = (clienteId, novas) => salvarColecao("anomalias", clienteId, novas);

  const analisarAnomaliaCliente = (cliente, anomalia) =>
    executarGeracao(async () => {
      const r = await comRetentativa(() => analisarAnomalia(cliente, anomalia, popsPorCliente[cliente.id] || [], fluxosPorCliente[cliente.id] || []));
      await mudarAnomalias(cliente.id, (anomaliasPorCliente[cliente.id] || []).map((a) => (a.id === anomalia.id ? { ...a, ...r } : a)));
    });


  const enviarAcaoAnomalia = async (cliente, anomalia) => {
    const g = gestaoPorCliente[cliente.id];
    if (!g || !anomalia.frenteDestino || !anomalia.acao) return;
    const novasFrentes = (g.frentes || []).map((f) =>
      f.id === anomalia.frenteDestino
        ? { ...f, acoes: [...(f.acoes || []), { id: uid(), texto: anomalia.acao, porque: `Anomalia de ${anomalia.data}: ${anomalia.fato}`.slice(0, 120), responsavel: anomalia.responsavelSugerido || "", feita: false }] }
        : f
    );
    await mudarGestao(cliente.id, { ...g, frentes: novasFrentes });
    await mudarAnomalias(cliente.id, (anomaliasPorCliente[cliente.id] || []).map((a) => (a.id === anomalia.id ? { ...a, status: "tratada" } : a)));
  };

  if (tela.nome === "anomalias" && clienteAtual) {
    return (
      <ModuloAnomalias
        cliente={clienteAtual}
        anomalias={anomaliasPorCliente[clienteAtual.id] || []}
        frentes={(gestaoPorCliente[clienteAtual.id] || { frentes: [] }).frentes || []}
        gerando={gerando}
        erro={erro}
        onMudar={(novas) => mudarAnomalias(clienteAtual.id, novas)}
        onAnalisar={(a) => analisarAnomaliaCliente(clienteAtual, a)}
        onEnviarAcao={(a) => enviarAcaoAnomalia(clienteAtual, a)}
        onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
      />
    );
  }
  return null;
}
