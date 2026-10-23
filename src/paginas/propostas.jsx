import { comRetentativa } from "../ia/base.jsx";
import { resumoCampo } from "../ia/campo.jsx";
import { gerarProposta, gerarPropostaSistema } from "../ia/proposta.jsx";
import { gerarContrato, revisarContrato, tipoContratoDe } from "../ia/contrato.jsx";
import { contratoVazio } from "../modulos/contrato.jsx";
import { listaSistemas, sistemaDaProposta } from "../nucleo/sistemas.js";
import { planoDoEscopo, etapasTexto, somaHoras } from "../nucleo/catalogo.jsx";
import { gerarMetasEngajamento, gerarMetasMentorado } from "../ia/treinamentos.jsx";
import { EditorProposta, ListaPropostas, propostaVazia } from "../modulos/propostas.jsx";
import { stSet } from "../nucleo/persistencia.jsx";

export function TelaPropostas({ app }) {
  const { campoPorCliente, clienteAtual, diagsLiderPorCliente, diagsPorCliente, erro, executarGeracao, exportarImpressao, gerando, gestaoPorCliente, mentoriaAtual, mentoriaPorCliente, pessoasPorCliente, pontosCCTDe, precificacao, propostaAtual, propostasAtuais, propostasPorCliente, salvarColecao, setErro, setPrecificacao, setTela, tela, sistemasPorCliente, contratada, mudarContratada } = app;

  const mudarPropostas = (clienteId, novas) => salvarColecao("propostas", clienteId, novas);

  const gerarPropostaCliente = (cliente, prop) =>
    executarGeracao(async () => {
      const gerado = prop.tipo === "sistema"
        ? await comRetentativa(() => gerarPropostaSistema(cliente, prop, sistemaDaProposta(listaSistemas(sistemasPorCliente, cliente.id), prop) || { escopo: [] }))
        : await comRetentativa(() => gerarProposta(
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


  const gerarContratoCliente = (cliente, prop) =>
    executarGeracao(async () => {
      const atual = { ...contratoVazio(), ...(prop.contrato || {}) };
      const partes = { contratada, contratante: { nome: cliente.negocio, ...atual.contratante } };
      const gerado = await comRetentativa(() => gerarContrato(cliente, prop, tipoContratoDe(cliente, prop), partes, sistemaDaProposta(listaSistemas(sistemasPorCliente, cliente.id), prop)));
      const lista = propostasPorCliente[cliente.id] || [];
      await mudarPropostas(cliente.id, lista.map((p) => (p.id === prop.id ? { ...p, contrato: { ...atual, ...gerado } } : p)));
    });

  const revisarContratoCliente = (cliente, prop) =>
    executarGeracao(async () => {
      const atual = { ...contratoVazio(), ...(prop.contrato || {}) };
      const revisao = await comRetentativa(() => revisarContrato(cliente, prop, tipoContratoDe(cliente, prop), atual));
      const lista = propostasPorCliente[cliente.id] || [];
      await mudarPropostas(cliente.id, lista.map((p) => (p.id === prop.id ? { ...p, contrato: { ...atual, revisao } } : p)));
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
          const servicos = clienteAtual.servicos || {};
          const nova = propostaVazia(servicos.sistemas && !servicos.consultoria ? "sistema" : "consultoria");
          if (nova.tipo === "sistema") {
            const sis = sistemaDaProposta(listaSistemas(sistemasPorCliente, clienteAtual.id), { sistemaId: tela.sistemaId }) || { escopo: [] };
            const plano = planoDoEscopo(sis.escopo, precificacao.horasPorSemana);
            Object.assign(nova, { sistemaId: sis.id || "", titulo: sis.nome, mensalidade: sis.mensalidade || precificacao.mensalidadePadrao || "", horasEstimadas: somaHoras(sis.escopo) ? String(somaHoras(sis.escopo)) : "", fases: etapasTexto(plano).join("\n"), duracao: sis.prazoSemanas ? `${sis.prazoSemanas} semanas` : (somaHoras(sis.escopo) ? plano.prazoTexto : ""), condicoesPagamento: "50% no aceite e 50% na entrega", validade: "15 dias", entregaveis: (sis.escopo || []).map((i) => i.texto).filter(Boolean).join("\n"), foraEscopo: sis.foraEscopo || "", fornecidoCliente: (sis.fornecidoCliente || []).map((i) => i.texto).filter(Boolean).join("\n") });
          }
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
        temSistemas={!!(clienteAtual.servicos || {}).sistemas}
        sistemas={listaSistemas(sistemasPorCliente, clienteAtual.id)}
        onMudarPrecificacao={mudarPrecificacao}
        onMudar={(nova) => mudarPropostas(clienteAtual.id, propostasAtuais.map((p) => (p.id === nova.id ? nova : p)))}
        onGerar={() => gerarPropostaCliente(clienteAtual, propostaAtual)}
        onGerarMetas={() => gerarMetasCliente(clienteAtual, propostaAtual)}
        contratada={contratada}
        onMudarContratada={mudarContratada}
        onGerarContrato={() => gerarContratoCliente(clienteAtual, propostaAtual)}
        onRevisarContrato={() => revisarContratoCliente(clienteAtual, propostaAtual)}
        onImprimirContrato={() => exportarImpressao({ seletor: ".area-contrato", nome: `Contrato — ${clienteAtual.negocio}` })}
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
