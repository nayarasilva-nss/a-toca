import { comRetentativa } from "../ia/base.jsx";
import { gerarRelatorioEvolucao } from "../ia/treinamentos.jsx";
import { ModuloRelMentoria } from "../modulos/relMentoria.jsx";
import { mentoriaVazia } from "../modulos/treinamentos.jsx";
import { stSet } from "../nucleo/persistencia.jsx";

export function TelaRelMentoria({ app }) {
  const { clienteAtual, diagsLiderAtuais, diagsLiderPorCliente, erro, executarGeracao, exportarImpressao, frameworkMentorado, gerando, mentoriaPorCliente, pessoasPorCliente, propostasPorCliente, relMentoriaAtual, setMentoriaPorCliente, setTela, tela } = app;

  const mudarRelMentoria = async (clienteId, novo) => {
    setMentoriaPorCliente((prev) => ({ ...prev, [clienteId]: { ...(prev[clienteId] || mentoriaVazia()), relatorio: novo } }));
    await stSet(`toca:relmentoria:${clienteId}`, novo);
  };

  const gerarRelMentoriaCliente = (cliente) =>
    executarGeracao(async () => {
      const mentoria = mentoriaPorCliente[cliente.id] || { encontros: [] };
      const mentorado = (pessoasPorCliente[cliente.id] || []).find((p) => p.id === mentoria.mentoradoId) || null;
      const gerado = await comRetentativa(() => gerarRelatorioEvolucao(cliente, mentoria, mentorado, diagsLiderPorCliente[cliente.id] || []));
      await mudarRelMentoria(cliente.id, { ...(mentoriaPorCliente[cliente.id]?.relatorio || {}), ...gerado });
    });


  if (tela.nome === "relmentoria" && clienteAtual) {
    return (
      <ModuloRelMentoria
        cliente={clienteAtual}
        rel={relMentoriaAtual}
        diagsLider={diagsLiderAtuais}
        metasAcordo={((propostasPorCliente[clienteAtual.id] || []).find((p) => p.status === "aceita") || {}).metas || []}
        framework={frameworkMentorado}
        gerando={gerando}
        erro={erro}
        onMudar={(novo) => mudarRelMentoria(clienteAtual.id, novo)}
        onGerar={() => gerarRelMentoriaCliente(clienteAtual)}
        onImprimir={exportarImpressao}
        onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
      />
    );
  }
  return null;
}
