import { comRetentativa } from "../ia/base.jsx";
import { campoVazio, gerarRoteiroEntrevista, gerarRoteiroVisita } from "../ia/campo.jsx";
import { EditorCampo, ListaCampo } from "../modulos/campo.jsx";
import { pessoaVazia } from "../modulos/temperamentos.jsx";

export function TelaCampo({ app }) {
  const { campoAtuais, campoAtual, campoPorCliente, cargosPorCliente, clienteAtual, erro, executarGeracao, gerando, gestaoPorCliente, mudarPessoas, pessoasAtuais, pontosCCTDe, salvarColecao, setErro, setTela, tela } = app;

  const mudarCampo = (clienteId, novos) => salvarColecao("campo", clienteId, novos);

  const gerarRoteiroCampo = (cliente, reg) =>
    executarGeracao(async () => {
      const roteiro =
        reg.tipo === "visita"
          ? await comRetentativa(() => gerarRoteiroVisita(cliente, (gestaoPorCliente[cliente.id] || {}).frentes || [], pontosCCTDe(cliente.id), reg, campoPorCliente[cliente.id] || []))
          : await comRetentativa(() => gerarRoteiroEntrevista(cliente, reg, cargosPorCliente[cliente.id] || []));
      const registros = campoPorCliente[cliente.id] || [];
      await mudarCampo(cliente.id, registros.map((r) => (r.id === reg.id ? { ...reg, roteiro } : r)));
    });


  if (tela.nome === "campo" && clienteAtual) {
    return (
      <ListaCampo
        cliente={clienteAtual}
        registros={campoAtuais}
        onAbrir={(regId) => {
          setErro(null);
          setTela({ nome: "campo-reg", id: tela.id, regId });
        }}
        onNovo={async (tipo) => {
          const novo = campoVazio(tipo);
          await mudarCampo(clienteAtual.id, [...campoAtuais, novo]);
          setErro(null);
          setTela({ nome: "campo-reg", id: tela.id, regId: novo.id });
        }}
        onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
      />
    );
  }
  if (tela.nome === "campo-reg" && clienteAtual && campoAtual) {
    return (
      <EditorCampo
        cliente={clienteAtual}
        reg={campoAtual}
        pessoas={pessoasAtuais}
        gerando={gerando}
        erro={erro}
        onMudar={(novo) => mudarCampo(clienteAtual.id, campoAtuais.map((r) => (r.id === novo.id ? novo : r)))}
        onGerarRoteiro={() => gerarRoteiroCampo(clienteAtual, campoAtual)}
        onAbrirPessoa={(pessoaId) => setTela({ nome: "pessoa", id: tela.id, pessoaId })}
        onCriarPessoa={async () => {
          const nova = { ...pessoaVazia(), nome: campoAtual.entrevistado, cargo: campoAtual.funcao };
          await mudarPessoas(clienteAtual.id, [...pessoasAtuais, nova]);
          setTela({ nome: "pessoa", id: tela.id, pessoaId: nova.id });
        }}
        onExcluir={async () => {
          await mudarCampo(clienteAtual.id, campoAtuais.filter((r) => r.id !== campoAtual.id));
          setTela({ nome: "campo", id: tela.id });
        }}
        onVoltar={() => setTela({ nome: "campo", id: tela.id })}
      />
    );
  }
  return null;
}
