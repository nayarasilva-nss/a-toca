import { comRetentativa } from "../ia/base.jsx";
import { gerarLeituraDiagLider } from "../ia/diagnostico.jsx";
import { EditorDiagnostico, ListaDiagnosticos, diagVazio } from "../modulos/diagnostico.jsx";

export function TelaDiagLider({ app }) {
  const { clienteAtual, diagLiderAtual, diagsLiderAtuais, diagsLiderPorCliente, erro, executarGeracao, exportarImpressao, focoMentoriaAtual, frameworkMentorado, gerando, mentoriaPorCliente, pessoasPorCliente, salvarColecao, setErro, setTela, tela, tituloDiagMentorado } = app;

  const mudarDiagsLider = (clienteId, novos) => salvarColecao("diagsLider", clienteId, novos);

  const gerarLeituraLiderCliente = (cliente, diag) =>
    executarGeracao(async () => {
      const mentoria = mentoriaPorCliente[cliente.id] || {};
      const mentorado = (pessoasPorCliente[cliente.id] || []).find((p) => p.id === mentoria.mentoradoId) || (pessoasPorCliente[cliente.id] || []).find((p) => p.contratante) || null;
      const gerado = await comRetentativa(() => gerarLeituraDiagLider(cliente, diag.notas, mentoria, mentorado));
      const lista = diagsLiderPorCliente[cliente.id] || [];
      await mudarDiagsLider(cliente.id, lista.map((d) => (d.id === diag.id ? { ...diag, ...gerado } : d)));
    });


  if (tela.nome === "diagslider" && clienteAtual) {
    return (
      <ListaDiagnosticos
        cliente={clienteAtual}
        diagnosticos={diagsLiderAtuais}
        titulo={tituloDiagMentorado}
        subtitulo={focoMentoriaAtual === "autoconhecimento"
          ? "Os N.I.E.M.s da pessoa: avalie a maturidade pessoal em 6 áreas e 24 critérios. Reavalie ao longo da mentoria — o antes/depois é a prova da evolução."
          : "Os N.I.E.M.s do líder: avalie a maturidade de liderança em 6 áreas e 24 critérios. Reavalie ao longo da mentoria — o antes/depois é a prova da evolução."}
        framework={frameworkMentorado}
        onAbrir={(diagId) => {
          setErro(null);
          setTela({ nome: "diaglider", id: tela.id, diagId });
        }}
        onNovo={async () => {
          const novo = diagVazio();
          await mudarDiagsLider(clienteAtual.id, [...diagsLiderAtuais, novo]);
          setErro(null);
          setTela({ nome: "diaglider", id: tela.id, diagId: novo.id });
        }}
        onReavaliar={async (base) => {
          const novo = { ...diagVazio(), notas: { ...base.notas }, rotulo: `Reavaliação de ${base.rotulo || base.data}` };
          await mudarDiagsLider(clienteAtual.id, [...diagsLiderAtuais, novo]);
          setErro(null);
          setTela({ nome: "diaglider", id: tela.id, diagId: novo.id });
        }}
        onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
      />
    );
  }
  if (tela.nome === "diaglider" && clienteAtual && diagLiderAtual) {
    return (
      <EditorDiagnostico
        cliente={clienteAtual}
        diag={diagLiderAtual}
        titulo={tituloDiagMentorado}
        framework={frameworkMentorado}
        gerando={gerando}
        erro={erro}
        onMudar={(novo) => mudarDiagsLider(clienteAtual.id, diagsLiderAtuais.map((d) => (d.id === novo.id ? novo : d)))}
        onGerarLeitura={() => gerarLeituraLiderCliente(clienteAtual, diagLiderAtual)}
        onCriarFrentes={null}
        onImprimir={exportarImpressao}
        onExcluir={async () => {
          await mudarDiagsLider(clienteAtual.id, diagsLiderAtuais.filter((d) => d.id !== diagLiderAtual.id));
          setTela({ nome: "diagslider", id: tela.id });
        }}
        onVoltar={() => setTela({ nome: "diagslider", id: tela.id })}
      />
    );
  }
  return null;
}
