import { comRetentativa } from "../ia/base.jsx";
import { estimarEscopoSistema } from "../ia/proposta.jsx";
import { ListaSistemas, ModuloSistema } from "../modulos/sistema.jsx";
import { calibracaoCatalogo, itemDoBloco } from "../nucleo/catalogo.jsx";
import { uid } from "../nucleo/base.jsx";
import { mensalidadesPendentes } from "../nucleo/recorrencia.jsx";
import { listaSistemas, sistemaPorId, sistemaVazio } from "../nucleo/sistemas.js";

export function TelaSistema({ app }) {
  const { catalogo, clienteAtual, erro, executarGeracao, financeiroAtual, gerando, mudarCatalogo, mudarPrecificacaoGlobal, precificacao, propostasAtuais, salvarColecao, setTela, sistemasPorCliente, tela } = app;
  if (tela.nome !== "sistema" || !clienteAtual) return null;
  const lista = listaSistemas(sistemasPorCliente, clienteAtual.id);
  const salvarLista = (nova) => salvarColecao("sistemas", clienteAtual.id, nova);
  const abrir = (sistemaId) => setTela({ nome: "sistema", id: tela.id, sistemaId });

  // um sistema só e nenhum pedido explícito de lista: vai direto para ele
  const sistema = tela.sistemaId ? sistemaPorId(lista, tela.sistemaId) : (lista.length === 1 && !tela.lista ? lista[0] : null);

  if (!sistema) {
    return (
      <ListaSistemas
        cliente={clienteAtual}
        sistemas={lista}
        onAbrir={abrir}
        onNovo={async () => { const novo = sistemaVazio(); await salvarLista([...lista, novo]); abrir(novo.id); }}
        onExcluir={(id) => salvarLista(lista.filter((s) => s.id !== id))}
        onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
      />
    );
  }

  const propostaAceita = (propostasAtuais || []).find((p) => p.status === "aceita" && p.tipo === "sistema" && (p.sistemaId ? p.sistemaId === sistema.id : lista.length === 1)) || null;
  const salvar = async (novo) => {
    await salvarLista(lista.map((s) => (s.id === novo.id ? novo : s)));
    // reflexos no financeiro: data da entrega vence o 50% final; mensalidade ativa gera as parcelas do mês
    const fin = financeiroAtual || { parcelas: [] };
    let parcelas = fin.parcelas || [];
    let mudou = false;
    if (novo.entregueEm && novo.entregueEm !== sistema.entregueEm) {
      parcelas = parcelas.map((p) => (p.entrega && !p.pago && !p.vencimento && (!p.sistemaId || p.sistemaId === novo.id) ? { ...p, vencimento: novo.entregueEm } : p));
      mudou = parcelas.some((p, i) => p !== (fin.parcelas || [])[i]);
    }
    const novas = mensalidadesPendentes(novo, { parcelas }, new Date(), lista, clienteAtual);
    if (novas.length) { parcelas = [...parcelas, ...novas]; mudou = true; }
    if (mudou) await salvarColecao("financeiro", clienteAtual.id, { ...fin, parcelas });
  };

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
      totalSistemas={lista.length}
      propostaAceita={propostaAceita}
      catalogo={catalogo}
      calibracao={calibracaoCatalogo(sistemasPorCliente)}
      precificacao={precificacao}
      gerando={gerando}
      erro={erro}
      onMudar={salvar}
      onMudarCatalogo={mudarCatalogo}
      onMudarPrecificacao={mudarPrecificacaoGlobal}
      onEstimarIA={estimarComIA}
      onPropostas={() => setTela({ nome: "propostas", id: tela.id, sistemaId: sistema.id })}
      onLista={() => setTela({ nome: "sistema", id: tela.id, lista: true })}
      onVoltar={() => (lista.length > 1 ? setTela({ nome: "sistema", id: tela.id, lista: true }) : setTela({ nome: "cliente", id: tela.id }))}
    />
  );
}
