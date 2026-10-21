import { comRetentativa } from "../ia/base.jsx";
import { estimarEscopoSistema } from "../ia/proposta.jsx";
import { ModuloSistema, sistemaVazio } from "../modulos/sistema.jsx";
import { itemDoBloco } from "../nucleo/catalogo.jsx";
import { uid } from "../nucleo/base.jsx";

export function TelaSistema({ app }) {
  const { catalogo, clienteAtual, erro, executarGeracao, gerando, mudarCatalogo, mudarPrecificacaoGlobal, precificacao, propostasAtuais, salvarColecao, setTela, sistemasPorCliente, tela } = app;
  if (tela.nome !== "sistema" || !clienteAtual) return null;
  const sistema = { ...sistemaVazio(), ...(sistemasPorCliente[clienteAtual.id] || {}) };
  const propostaAceita = (propostasAtuais || []).find((p) => p.status === "aceita" && p.tipo === "sistema") || null;
  const salvar = (novo) => salvarColecao("sistemas", clienteAtual.id, novo);

  const estimarComIA = () =>
    executarGeracao(async () => {
      const { itens, obs } = await comRetentativa(() => estimarEscopoSistema(clienteAtual, sistema, catalogo));
      const escopo = itens.map((i) => {
        const bloco = i.b ? catalogo.find((b) => b.id === i.b) : null;
        return bloco ? { ...itemDoBloco(bloco), texto: i.n || bloco.nome, horas: Number(i.h) || bloco.horas, etapa: i.et || bloco.etapa } : { id: uid(), texto: i.n, horas: Number(i.h) || 0, etapa: i.et || "Construção", status: "a_fazer" };
      });
      await salvar({ ...sistema, escopo, obs: [sistema.obs, obs ? `Estimativa da IA: ${obs}` : ""].filter(Boolean).join("\n") });
    });

  return (
    <ModuloSistema
      cliente={clienteAtual}
      sistema={sistema}
      propostaAceita={propostaAceita}
      catalogo={catalogo}
      precificacao={precificacao}
      gerando={gerando}
      erro={erro}
      onMudar={salvar}
      onMudarCatalogo={mudarCatalogo}
      onMudarPrecificacao={mudarPrecificacaoGlobal}
      onEstimarIA={estimarComIA}
      onPropostas={() => setTela({ nome: "propostas", id: tela.id })}
      onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
    />
  );
}
