import { comRetentativa } from "../ia/base.jsx";
import { montarEscopoSistema } from "../ia/proposta.jsx";
import { ListaSistemas, ModuloSistema } from "../modulos/sistema.jsx";
import { realizadasPorItem } from "../nucleo/catalogo.jsx";
import { uid } from "../nucleo/base.jsx";
import { ETAPAS } from "../nucleo/catalogo.jsx";
import { mensalidadesPendentes } from "../nucleo/recorrencia.jsx";
import { listaSistemas, sistemaPorId, sistemaVazio } from "../nucleo/sistemas.js";

export function TelaSistema({ app }) {
  const { clienteAtual, erro, executarGeracao, financeiroAtual, gerando, mudarPrecificacaoGlobal, precificacao, propostasAtuais, salvarColecao, setTela, sistemasPorCliente, tela } = app;
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

  // referências: itens de outros sistemas dela, com horas estimadas e realizadas (calibram a IA)
  const referencias = () => {
    const refs = [];
    for (const [cid, v] of Object.entries(sistemasPorCliente || {})) {
      for (const s of (Array.isArray(v) ? v : v ? [v] : [])) {
        if (s.id === sistema.id) continue;
        const real = realizadasPorItem(s);
        for (const i of s.escopo || []) {
          if (!(i.texto || "").trim()) continue;
          refs.push(`${i.texto}: ${i.horas || 0} h estimadas${real[i.id] ? `, ${real[i.id]} h realizadas` : ""} (${s.nome || "sistema"}${cid === clienteAtual.id ? "" : ", outro cliente"})`);
        }
      }
    }
    return refs.slice(0, 60);
  };

  const montarComIA = (instrucao) =>
    executarGeracao(async () => {
      const { itens, obs } = await comRetentativa(() => montarEscopoSistema(clienteAtual, sistema, { instrucao, referencias: referencias() }));
      const atuais = sistema.escopo || [];
      const escopo = itens.map((i) => {
        const existente = i.id ? atuais.find((a) => a.id === i.id) : null;
        const base = existente || { id: uid(), status: "a_fazer" };
        return { ...base, texto: i.n, horas: Number(i.h) || base.horas || 0, etapa: ETAPAS.includes(i.et) ? i.et : base.etapa || "Construção" };
      });
      await salvar({ ...sistema, escopo, notaIA: obs || "" });
    });

  return (
    <ModuloSistema
      cliente={clienteAtual}
      sistema={sistema}
      totalSistemas={lista.length}
      propostaAceita={propostaAceita}
      financeiro={financeiroAtual || { parcelas: [] }}
      lista={lista}
      onMudarFinanceiro={(fin) => salvarColecao("financeiro", clienteAtual.id, fin)}
      precificacao={precificacao}
      gerando={gerando}
      erro={erro}
      onMudar={salvar}
      onMudarPrecificacao={mudarPrecificacaoGlobal}
      onMontarIA={montarComIA}
      onPropostas={() => setTela({ nome: "propostas", id: tela.id, sistemaId: sistema.id })}
      onLista={() => setTela({ nome: "sistema", id: tela.id, lista: true })}
      onVoltar={() => (lista.length > 1 ? setTela({ nome: "sistema", id: tela.id, lista: true }) : setTela({ nome: "cliente", id: tela.id }))}
    />
  );
}
