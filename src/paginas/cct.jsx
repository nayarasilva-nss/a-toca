import { analisarCCT } from "../ia/cct.jsx";
import { ModuloCCT } from "../modulos/cct.jsx";
import { uid } from "../nucleo/base.jsx";

export function TelaCct({ app }) {
  const { cctPorCliente, clienteAtual, erro, executarGeracao, gerando, salvarColecao, setTela, tela } = app;

  const mudarCCT = (clienteId, nova) => salvarColecao("cct", clienteId, nova);

  const analisarCCTCliente = (cliente, nomeArquivo, base64) =>
    executarGeracao(async () => {
      const atual = cctPorCliente[cliente.id] || { nomeArquivo: "", dataAnalise: "", documentos: [], pontos: [] };
      const pontos = await analisarCCT(cliente, base64, atual.pontos || []);
      const hoje = new Date().toLocaleDateString("pt-BR");
      const documentos = [...(atual.documentos || []), { id: uid(), nomeArquivo, dataAnalise: hoje }];
      await mudarCCT(cliente.id, { nomeArquivo, dataAnalise: hoje, documentos, pontos });
    });


  if (tela.nome === "cct" && clienteAtual) {
    return (
      <ModuloCCT
        cliente={clienteAtual}
        cct={cctPorCliente[clienteAtual.id] || { nomeArquivo: "", dataAnalise: "", pontos: [] }}
        gerando={gerando}
        erro={erro}
        onMudar={(nova) => mudarCCT(clienteAtual.id, nova)}
        onAnalisar={(nome, base64) => analisarCCTCliente(clienteAtual, nome, base64)}
        onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
      />
    );
  }
  return null;
}
