import { comRetentativa } from "../ia/base.jsx";
import { resumoCampo } from "../ia/campo.jsx";
import { gerarProposta } from "../ia/proposta.jsx";
import { gerarMetasEngajamento, gerarMetasMentorado } from "../ia/treinamentos.jsx";
import { EditorProposta, ListaPropostas, propostaVazia } from "../modulos/propostas.jsx";
import { stSet } from "../nucleo/persistencia.jsx";

export function TelaPropostas({ app }) {
  const { campoPorCliente, clienteAtual, diagsLiderPorCliente, diagsPorCliente, erro, executarGeracao, exportarImpressao, gerando, gestaoPorCliente, mentoriaAtual, mentoriaPorCliente, pessoasPorCliente, pontosCCTDe, precificacao, propostaAtual, propostasAtuais, propostasPorCliente, salvarColecao, setErro, setPrecificacao, setTela, tela } = app;

  const mudarPropostas = (clienteId, novas) => salvarColecao("propostas", clienteId, novas);

  const gerarPropostaCliente = (cliente, prop) =>
    executarGeracao(async () => {
      const gerado = await comRetentativa(() => gerarProposta(
        cliente,
        prop,
        gestaoPorCliente[cliente.id] || { briefing: "", frentes: [] },
        diagsPorCliente[cliente.id] || [],
        pessoasPorCliente[cliente.id] || [],
        campoPorCliente[cliente.id] || [],
        mentoriaPorCliente[cliente.id] || null
      ));
      const props = propostasPorCliente[cliente.id] || [];
      await mudarPropostas(cliente.id, props.map((p) => (p.id === prop.id ? { ...prop, ...gerado } : p)));
    });


  const mudarPrecificacao = async (nova) => {
    setPrecificacao(nova);
    await stSet("toca:precificacao", nova);
  };

  const gerarMetasCliente = (cliente, prop) =>
    executarGeracao(async () => {
      const metas = cliente.tipo === "pessoa"
        ? await comRetentativa(() => gerarMetasMentorado(cliente, mentoriaPorCliente[cliente.id], diagsLiderPorCliente[cliente.id] || []))
        : await comRetentativa(() => gerarMetasEngajamento(cliente, diagsPorCliente[cliente.id] || [], resumoCampo(campoPorCliente[cliente.id] || [], "riscos"), pontosCCTDe(cliente.id)));
      const lista = propostasPorCliente[cliente.id] || [];
      const existentes = (prop.metas || []).filter((m) => m.objetivo);
      await mudarPropostas(cliente.id, lista.map((p) => (p.id === prop.id ? { ...prop, metas: [...existentes, ...metas] } : p)));
    });


  if (tela.nome === "propostas" && clienteAtual) {
    return (
      <ListaPropostas
        cliente={clienteAtual}
        propostas={propostasAtuais}
        onAbrir={(propostaId) => {
          setErro(null);
          setTela({ nome: "proposta", id: tela.id, propostaId });
        }}
        onNova={async () => {
          const nova = propostaVazia();
          await mudarPropostas(clienteAtual.id, [...propostasAtuais, nova]);
          setErro(null);
          setTela({ nome: "proposta", id: tela.id, propostaId: nova.id });
        }}
        onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
      />
    );
  }
  if (tela.nome === "proposta" && clienteAtual && propostaAtual) {
    return (
      <EditorProposta
        cliente={clienteAtual}
        prop={propostaAtual}
        gerando={gerando}
        erro={erro}
        frentes={(gestaoPorCliente[clienteAtual.id] || { frentes: [] }).frentes || []}
        semanasPadrao={(gestaoPorCliente[clienteAtual.id] || {}).duracaoSemanas}
        numEncontros={(mentoriaAtual.encontros || []).length}
        precificacao={precificacao}
        onMudarPrecificacao={mudarPrecificacao}
        onMudar={(nova) => mudarPropostas(clienteAtual.id, propostasAtuais.map((p) => (p.id === nova.id ? nova : p)))}
        onGerar={() => gerarPropostaCliente(clienteAtual, propostaAtual)}
        onGerarMetas={() => gerarMetasCliente(clienteAtual, propostaAtual)}
        onImprimir={exportarImpressao}
        onExcluir={async () => {
          await mudarPropostas(clienteAtual.id, propostasAtuais.filter((p) => p.id !== propostaAtual.id));
          setTela({ nome: "propostas", id: tela.id });
        }}
        onVoltar={() => setTela({ nome: "propostas", id: tela.id })}
      />
    );
  }
  return null;
}
