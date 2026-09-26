import { comRetentativa } from "../ia/base.jsx";
import { gerarEstrutura } from "../ia/estrutura.jsx";
import { ModuloEstrutura } from "../modulos/estrutura.jsx";

export function TelaEstrutura({ app }) {
  const { campoPorCliente, cargosAtuais, cargosPorCliente, clienteAtual, erro, estruturaAtual, executarGeracao, exportarImpressao, gerando, salvarColecao, setTela, tela } = app;

  const mudarEstrutura = (clienteId, novas) => salvarColecao("estrutura", clienteId, novas);

  const gerarOrganograma = (cliente) =>
    executarGeracao(async () => {
      const posicoes = await comRetentativa(() => gerarEstrutura(cliente, cargosPorCliente[cliente.id] || [], (campoPorCliente[cliente.id] || []).filter((r) => r.tipo === "entrevista")));
      await mudarEstrutura(cliente.id, posicoes);
    });


  if (tela.nome === "estrutura" && clienteAtual) {
    return (
      <ModuloEstrutura
        cliente={clienteAtual}
        posicoes={estruturaAtual}
        cargos={cargosAtuais}
        gerando={gerando}
        erro={erro}
        onMudar={(novas) => mudarEstrutura(clienteAtual.id, novas)}
        onGerar={() => gerarOrganograma(clienteAtual)}
        onImprimir={exportarImpressao}
        onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
      />
    );
  }
  return null;
}
