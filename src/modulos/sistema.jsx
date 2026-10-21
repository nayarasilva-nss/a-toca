import { uid } from "../nucleo/base.jsx";
import { HeaderModulo } from "../telas/hub.jsx";
import { Card } from "../componentes/enraizar.jsx";
import { BotaoContorno, InputField } from "../componentes/ui.jsx";

// ─── Módulo: Sistema (desenvolvimento de sistema personalizado) ──

export const STATUS_ENTREGA = {
  a_fazer: { rotulo: "A fazer", cor: "var(--tinta-musgo)", fundo: "var(--fundo-recuo)" },
  em_andamento: { rotulo: "Em andamento", cor: "var(--alerta)", fundo: "var(--alerta-fundo)" },
  entregue: { rotulo: "Entregue", cor: "var(--sucesso)", fundo: "var(--sucesso-fundo)" },
};

export const STATUS_SISTEMA = {
  levantamento: "Levantamento",
  proposta: "Proposta",
  construcao: "Em construção",
  entregue: "Entregue",
  sustentacao: "Em sustentação",
  encerrado: "Encerrado",
};

export function sistemaVazio() {
  return {
    nome: "",
    briefing: "",
    escopo: [],
    foraEscopo: "",
    fornecidoCliente: [],
    stack: "",
    prazoSemanas: "",
    inicio: "",
    entregueEm: "",
    mensalidade: "",
    mensalidadeAtiva: false,
    status: "levantamento",
    obs: "",
  };
}

export const linhasPara = (texto) => String(texto || "").split("\n").map((l) => l.trim()).filter(Boolean);

function ListaItens({ itens, onMudar, placeholder, comStatus, comRecebido }) {
  const set = (id, campo, valor) => onMudar(itens.map((i) => (i.id === id ? { ...i, [campo]: valor } : i)));
  return (
    <div>
      {itens.map((i) => (
        <div key={i.id} className="flex items-center gap-2 flex-wrap" style={{ padding: "6px 0", borderBottom: "1px solid var(--linha)" }}>
          {comRecebido && <input type="checkbox" checked={!!i.recebido} onChange={(e) => set(i.id, "recebido", e.target.checked)} title="Recebido" />}
          <input className="enz-input" style={{ flex: 1, minWidth: 200, padding: "8px 10px" }} value={i.texto} placeholder={placeholder} onChange={(e) => set(i.id, "texto", e.target.value)} />
          {comStatus && (
            <select className="enz-input" style={{ width: 150, padding: "8px 10px" }} value={i.status || "a_fazer"} onChange={(e) => set(i.id, "status", e.target.value)}>
              {Object.entries(STATUS_ENTREGA).map(([k, s]) => <option key={k} value={k}>{s.rotulo}</option>)}
            </select>
          )}
          <button onClick={() => onMudar(itens.filter((x) => x.id !== i.id))} className="enz-link" title="Remover">✕</button>
        </div>
      ))}
      <button onClick={() => onMudar([...itens, { id: uid(), texto: "", ...(comStatus ? { status: "a_fazer" } : {}), ...(comRecebido ? { recebido: false } : {}) }])} className="enz-link" style={{ marginTop: 10 }}>
        + item
      </button>
    </div>
  );
}

export function ModuloSistema({ cliente, sistema, propostaAceita, onMudar, onVoltar, onPropostas }) {
  const set = (campo) => (v) => onMudar({ ...sistema, [campo]: v });
  const escopo = sistema.escopo || [];
  const entregues = escopo.filter((i) => i.status === "entregue").length;
  const fornecido = sistema.fornecidoCliente || [];
  const pendentes = fornecido.filter((i) => !i.recebido && i.texto.trim());

  return (
    <div className="pb-16">
      <HeaderModulo
        titulo={sistema.nome || "Sistema"}
        subtitulo="O que será construído, o que fica de fora, o que o cliente precisa entregar — e o andamento de cada parte."
        cliente={cliente}
        onVoltar={onVoltar}
        acoes={<BotaoContorno pequeno onClick={onPropostas}>Propostas</BotaoContorno>}
      />
      <div className="enz-container" style={{ paddingTop: 0 }}>
        <div className="grid gap-3 sm:grid-cols-3" style={{ marginBottom: 32 }}>
          <Card variante="vazado" rotulo="Entregas" titulo={`${entregues} de ${escopo.length}`} subtitulo="itens do escopo entregues" />
          <Card variante="vazado" rotulo="Do cliente" titulo={pendentes.length ? `${pendentes.length} pendente${pendentes.length > 1 ? "s" : ""}` : "tudo recebido"} subtitulo="material que depende do cliente" />
          <Card variante="vazado" rotulo="Mensalidade" titulo={sistema.mensalidade ? `R$ ${sistema.mensalidade}/mês` : "—"} subtitulo={sistema.mensalidadeAtiva ? "ativa" : "ainda não iniciada"} />
        </div>

        <Card rotulo="O sistema" titulo="Identificação">
          <div className="grid sm:grid-cols-2 gap-x-4">
            <InputField label="Nome do sistema ou do projeto" value={sistema.nome} onChange={set("nome")} placeholder="Sistema de reservas e gestão de salão" />
            <div className="enz-campo">
              <label className="enz-rotulo">Situação</label>
              <select className="enz-input" value={sistema.status || "levantamento"} onChange={(e) => set("status")(e.target.value)}>
                {Object.entries(STATUS_SISTEMA).map(([k, r]) => <option key={k} value={k}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="enz-campo">
            <label className="enz-rotulo">Briefing — o que o cliente precisa resolver</label>
            <textarea className="enz-input" value={sistema.briefing} onChange={(e) => set("briefing")(e.target.value)} style={{ minHeight: 110 }} placeholder="o problema de hoje, quem usa, o que já existe (planilha, outro sistema), o que precisa sair funcionando" />
          </div>
          <div className="grid sm:grid-cols-3 gap-x-4">
            <InputField label="Stack / base" value={sistema.stack} onChange={set("stack")} placeholder="Next.js + Supabase + Vercel" />
            <InputField label="Prazo (semanas)" value={sistema.prazoSemanas} onChange={set("prazoSemanas")} placeholder="4 a 5" />
            <InputField label="Início (dd/mm/aaaa)" value={sistema.inicio} onChange={set("inicio")} placeholder="" />
          </div>
        </Card>

        <Card rotulo="Escopo" titulo="O que será construído." subtitulo="cada item vira uma linha da proposta e uma entrega para acompanhar." style={{ marginTop: 24 }}>
          <ListaItens itens={escopo} onMudar={set("escopo")} placeholder="Mapa de mesas por praça, com status em tempo real" comStatus />
        </Card>

        <div className="grid gap-3 lg:grid-cols-2" style={{ marginTop: 24 }}>
          <Card rotulo="Fora do escopo" titulo="O que não entra." subtitulo="um por linha. evita a conversa difícil depois.">
            <textarea className="enz-input" value={sistema.foraEscopo} onChange={(e) => set("foraEscopo")(e.target.value)} style={{ minHeight: 120 }} placeholder={"Integração com iFood\nOperação em mais de uma unidade\nPagamento online"} />
          </Card>
          <Card rotulo="Fornecido pelo cliente" titulo="O que depende dele." subtitulo="marque quando receber — o prazo só conta a partir daí.">
            <ListaItens itens={fornecido} onMudar={set("fornecidoCliente")} placeholder="Planta do salão com mesas e praças" comRecebido />
          </Card>
        </div>

        <Card rotulo="Depois da entrega" titulo="Mensalidade e sustentação." style={{ marginTop: 24 }}>
          <div className="grid sm:grid-cols-3 gap-x-4 items-end">
            <InputField label="Mensalidade (R$)" value={sistema.mensalidade} onChange={set("mensalidade")} placeholder="200" ajuda="hospedagem, manutenção, pequenas alterações." />
            <InputField label="Entregue em (dd/mm/aaaa)" value={sistema.entregueEm} onChange={set("entregueEm")} />
            <label className="enz-campo flex items-center gap-2" style={{ paddingBottom: 24 }}>
              <input type="checkbox" checked={!!sistema.mensalidadeAtiva} onChange={(e) => set("mensalidadeAtiva")(e.target.checked)} />
              <span>mensalidade ativa</span>
            </label>
          </div>
          {propostaAceita && <p className="enz-nota">proposta aceita: {propostaAceita.investimento || "valor a definir"}{propostaAceita.mensalidade ? ` + R$ ${propostaAceita.mensalidade}/mês` : ""}.</p>}
          <div className="enz-campo" style={{ marginTop: 12 }}>
            <label className="enz-rotulo">Observações internas</label>
            <textarea className="enz-input" value={sistema.obs} onChange={(e) => set("obs")(e.target.value)} style={{ minHeight: 80 }} placeholder="decisões, pendências antes de começar, o que não falar com o cliente ainda" />
          </div>
        </Card>
      </div>
    </div>
  );
}
