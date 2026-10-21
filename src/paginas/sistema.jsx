import { ModuloSistema, sistemaVazio } from "../modulos/sistema.jsx";

export function TelaSistema({ app }) {
  const { clienteAtual, propostasAtuais, salvarColecao, setTela, sistemasPorCliente, tela } = app;
  if (tela.nome !== "sistema" || !clienteAtual) return null;
  const sistema = { ...sistemaVazio(), ...(sistemasPorCliente[clienteAtual.id] || {}) };
  const propostaAceita = (propostasAtuais || []).find((p) => p.status === "aceita" && p.tipo === "sistema") || null;
  return (
    <ModuloSistema
      cliente={clienteAtual}
      sistema={sistema}
      propostaAceita={propostaAceita}
      onMudar={(novo) => salvarColecao("sistemas", clienteAtual.id, novo)}
      onPropostas={() => setTela({ nome: "propostas", id: tela.id })}
      onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
    />
  );
}
