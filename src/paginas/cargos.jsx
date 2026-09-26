import { comRetentativa } from "../ia/base.jsx";
import { gerarDescricaoCargo } from "../ia/cargos.jsx";
import { EditorCargo, ListaCargos, cargoVazio } from "../modulos/cargos.jsx";

export function TelaCargos({ app }) {
  const { campoPorCliente, cargoAtual, cargosAtuais, cargosPorCliente, clienteAtual, erro, estruturaPorCliente, executarGeracao, exportarImpressao, gerando, pontosCCTDe, salvarColecao, setErro, setTela, tela } = app;

  const mudarCargos = (clienteId, novos) => salvarColecao("cargos", clienteId, novos);

  const gerarCargo = (cliente, cargo) =>
    executarGeracao(async () => {
      const cargos = cargosPorCliente[cliente.id] || [];
      const gerado = await comRetentativa(() => gerarDescricaoCargo(cliente, cargo, cargos.filter((c) => c.id !== cargo.id), pontosCCTDe(cliente.id), estruturaPorCliente[cliente.id] || [], (campoPorCliente[cliente.id] || []).filter((r) => r.tipo === "entrevista")));
      const atualizado = { ...cargo, ...gerado };
      await mudarCargos(cliente.id, cargos.map((c) => (c.id === cargo.id ? atualizado : c)));
    });


  if (tela.nome === "cargos" && clienteAtual) {
    return (
      <ListaCargos
        cliente={clienteAtual}
        cargos={cargosAtuais}
        onAbrirCargo={(cargoId) => {
          setErro(null);
          setTela({ nome: "cargo", id: tela.id, cargoId });
        }}
        onNovoCargo={async () => {
          const novo = cargoVazio();
          await mudarCargos(clienteAtual.id, [...cargosAtuais, novo]);
          setErro(null);
          setTela({ nome: "cargo", id: tela.id, cargoId: novo.id });
        }}
        onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
      />
    );
  }
  if (tela.nome === "cargo" && clienteAtual && cargoAtual) {
    return (
      <EditorCargo
        cliente={clienteAtual}
        cargo={cargoAtual}
        gerando={gerando}
        erro={erro}
        onMudar={(novo) => mudarCargos(clienteAtual.id, cargosAtuais.map((c) => (c.id === novo.id ? novo : c)))}
        onGerar={() => gerarCargo(clienteAtual, cargoAtual)}
        onImprimir={exportarImpressao}
        onExcluir={async () => {
          await mudarCargos(clienteAtual.id, cargosAtuais.filter((c) => c.id !== cargoAtual.id));
          setTela({ nome: "cargos", id: tela.id });
        }}
        onVoltar={() => setTela({ nome: "cargos", id: tela.id })}
      />
    );
  }
  return null;
}
