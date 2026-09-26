import { gerarAnaliseTemperamento } from "../ia/temperamentos.jsx";
import { EditorPessoa, ListaPessoas, pessoaVazia } from "../modulos/temperamentos.jsx";

export function TelaTemperamentos({ app }) {
  const { cargosPorCliente, clienteAtual, erro, executarGeracao, exportarImpressao, gerando, mudarPessoas, pessoaAtual, pessoasAtuais, pessoasPorCliente, setErro, setTela, tela } = app;

  const analisarPessoa = (cliente, pessoa) =>
    executarGeracao(async () => {
      const pessoas = pessoasPorCliente[cliente.id] || [];
      const gerado = await gerarAnaliseTemperamento(cliente, pessoa, cargosPorCliente[cliente.id] || []);
      const atualizada = { ...pessoa, ...gerado };
      await mudarPessoas(cliente.id, pessoas.map((p) => (p.id === pessoa.id ? atualizada : p)));
    });


  if (tela.nome === "temperamentos" && clienteAtual) {
    return (
      <ListaPessoas
        cliente={clienteAtual}
        pessoas={pessoasAtuais}
        onAbrir={(pessoaId) => {
          setErro(null);
          setTela({ nome: "pessoa", id: tela.id, pessoaId });
        }}
        onNova={async () => {
          const nova = pessoaVazia();
          await mudarPessoas(clienteAtual.id, [...pessoasAtuais, nova]);
          setErro(null);
          setTela({ nome: "pessoa", id: tela.id, pessoaId: nova.id });
        }}
        onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
      />
    );
  }
  if (tela.nome === "pessoa" && clienteAtual && pessoaAtual) {
    return (
      <EditorPessoa
        cliente={clienteAtual}
        pessoa={pessoaAtual}
        gerando={gerando}
        erro={erro}
        onMudar={(nova) => mudarPessoas(clienteAtual.id, pessoasAtuais.map((p) => (p.id === nova.id ? nova : p)))}
        onGerar={() => analisarPessoa(clienteAtual, pessoaAtual)}
        onImprimir={exportarImpressao}
        onExcluir={async () => {
          await mudarPessoas(clienteAtual.id, pessoasAtuais.filter((p) => p.id !== pessoaAtual.id));
          setTela({ nome: "temperamentos", id: tela.id });
        }}
        onVoltar={() => setTela({ nome: "temperamentos", id: tela.id })}
      />
    );
  }
  return null;
}
