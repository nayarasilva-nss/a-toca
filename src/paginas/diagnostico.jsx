import { gerarLeituraDiagnostico } from "../ia/diagnostico.jsx";
import { EditorDiagnostico, ListaDiagnosticos, diagVazio } from "../modulos/diagnostico.jsx";
import { uid } from "../nucleo/base.jsx";

export function TelaDiagnostico({ app }) {
  const { campoPorCliente, clienteAtual, diagAtual, diagsAtuais, diagsPorCliente, erro, executarGeracao, exportarImpressao, gerando, gestaoPorCliente, mudarGestao, salvarColecao, setErro, setTela, tela } = app;

  const mudarDiags = (clienteId, novos) => salvarColecao("diags", clienteId, novos);

  const gerarLeituraDiag = (cliente, diag) =>
    executarGeracao(async () => {
      const gerado = await gerarLeituraDiagnostico(cliente, diag.notas, gestaoPorCliente[cliente.id], campoPorCliente[cliente.id] || []);
      const diags = diagsPorCliente[cliente.id] || [];
      await mudarDiags(cliente.id, diags.map((d) => (d.id === diag.id ? { ...diag, ...gerado } : d)));
    });


  const criarFrentesDeAreas = async (cliente, areas) => {
    const gestao = gestaoPorCliente[cliente.id] || { briefing: "", frentes: [] };
    const existentes = new Set((gestao.frentes || []).map((f) => f.nome.toLowerCase()));
    const novas = areas
      .filter((a) => !existentes.has(a.toLowerCase()))
      .map((a) => ({ id: uid(), nome: a, status: "nao_iniciada", escopo: "Origem: diagnóstico de maturidade (área abaixo de 50%)", acoes: [] }));
    if (novas.length > 0) {
      await mudarGestao(cliente.id, { ...gestao, frentes: [...(gestao.frentes || []), ...novas] });
    }
    setTela({ nome: "gestao", id: cliente.id });
  };

  if (tela.nome === "diagnosticos" && clienteAtual) {
    return (
      <ListaDiagnosticos
        cliente={clienteAtual}
        diagnosticos={diagsAtuais}
        onAbrir={(diagId) => {
          setErro(null);
          setTela({ nome: "diagnostico", id: tela.id, diagId });
        }}
        onNovo={async () => {
          const novo = diagVazio();
          await mudarDiags(clienteAtual.id, [...diagsAtuais, novo]);
          setErro(null);
          setTela({ nome: "diagnostico", id: tela.id, diagId: novo.id });
        }}
        onReavaliar={async (base) => {
          const novo = { ...diagVazio(), notas: { ...base.notas }, rotulo: `Reavaliação de ${base.rotulo || base.data}` };
          await mudarDiags(clienteAtual.id, [...diagsAtuais, novo]);
          setErro(null);
          setTela({ nome: "diagnostico", id: tela.id, diagId: novo.id });
        }}
        onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
      />
    );
  }
  if (tela.nome === "diagnostico" && clienteAtual && diagAtual) {
    return (
      <EditorDiagnostico
        cliente={clienteAtual}
        diag={diagAtual}
        gerando={gerando}
        erro={erro}
        onMudar={(novo) => mudarDiags(clienteAtual.id, diagsAtuais.map((d) => (d.id === novo.id ? novo : d)))}
        onGerarLeitura={() => gerarLeituraDiag(clienteAtual, diagAtual)}
        onCriarFrentes={(areas) => criarFrentesDeAreas(clienteAtual, areas)}
        onImprimir={exportarImpressao}
        onExcluir={async () => {
          await mudarDiags(clienteAtual.id, diagsAtuais.filter((d) => d.id !== diagAtual.id));
          setTela({ nome: "diagnosticos", id: tela.id });
        }}
        onVoltar={() => setTela({ nome: "diagnosticos", id: tela.id })}
      />
    );
  }
  return null;
}
