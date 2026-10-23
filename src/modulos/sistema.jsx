import { uid } from "../nucleo/base.jsx";
import { ROTULO_STATUS_SISTEMA, sistemaVazio } from "../nucleo/sistemas.js";
import { ConfirmarAcao } from "../componentes/ui.jsx";
import { HeaderModulo } from "../telas/hub.jsx";
import { Card } from "../componentes/enraizar.jsx";
import { useState } from "react";
import { AvisoErro, BotaoContorno, BotaoPrimario, InputField, Trabalhando } from "../componentes/ui.jsx";
import { formatarBR, parseValorBR } from "../ia/financeiro.jsx";
import { CATEGORIAS_CATALOGO, ETAPAS, horasDe, itemDoBloco, planoDoEscopo, realizadasPorItem, somaHoras, totalRealizadas } from "../nucleo/catalogo.jsx";

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

export { sistemaVazio };

export const linhasPara = (texto) => String(texto || "").split("\n").map((l) => l.trim()).filter(Boolean);

function ListaItens({ itens, onMudar, placeholder, comStatus, comRecebido, realizadas = {} }) {
  const set = (id, campo, valor) => onMudar(itens.map((i) => (i.id === id ? { ...i, [campo]: valor } : i)));
  return (
    <div>
      {itens.map((i) => (
        <div key={i.id} className="flex items-center gap-2 flex-wrap" style={{ padding: "6px 0", borderBottom: "1px solid var(--linha)" }}>
          {comRecebido && <input type="checkbox" checked={!!i.recebido} onChange={(e) => set(i.id, "recebido", e.target.checked)} title="Recebido" />}
          <input className="enz-input" style={{ flex: 1, minWidth: 200, padding: "8px 10px" }} value={i.texto} placeholder={placeholder} onChange={(e) => set(i.id, "texto", e.target.value)} />
          {comStatus && (
            <input className="enz-input" style={{ width: 64, padding: "8px 8px", textAlign: "right" }} value={i.horas ?? ""} placeholder="h" title="Horas estimadas" onChange={(e) => set(i.id, "horas", e.target.value)} />
          )}
          {comStatus && (
            <span className="enz-legenda" style={{ width: 54, textAlign: "right" }} title="Horas realizadas (dos registros)">{realizadas[i.id] ? `${realizadas[i.id]} h` : "—"}</span>
          )}
          {comStatus && (
            <select className="enz-input" style={{ width: 130, padding: "8px 10px" }} value={i.etapa || "Construção"} title="Etapa" onChange={(e) => set(i.id, "etapa", e.target.value)}>
              {ETAPAS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          )}
          {comStatus && (
            <select className="enz-input" style={{ width: 150, padding: "8px 10px" }} value={i.status || "a_fazer"} onChange={(e) => set(i.id, "status", e.target.value)}>
              {Object.entries(STATUS_ENTREGA).map(([k, s]) => <option key={k} value={k}>{s.rotulo}</option>)}
            </select>
          )}
          <button onClick={() => onMudar(itens.filter((x) => x.id !== i.id))} className="enz-link" title="Remover">✕</button>
        </div>
      ))}
      <button onClick={() => onMudar([...itens, { id: uid(), texto: "", ...(comStatus ? { status: "a_fazer", horas: "", etapa: "Construção" } : {}), ...(comRecebido ? { recebido: false } : {}) }])} className="enz-link" style={{ marginTop: 10 }}>
        + item
      </button>
    </div>
  );
}

function Catalogo({ catalogo, calibracao = {}, onMudarCatalogo, onAdicionar }) {
  const [marcados, setMarcados] = useState({});
  const [editando, setEditando] = useState(false);
  const selecionados = catalogo.filter((b) => marcados[b.id]);
  const set = (id, campo, valor) => onMudarCatalogo(catalogo.map((b) => (b.id === id ? { ...b, [campo]: campo === "horas" ? valor : valor } : b)));
  return (
    <Card rotulo="Catálogo de blocos" titulo="Monte o escopo com o que você já constrói." subtitulo="marque os blocos; as horas são o padrão — ajuste depois no escopo. blocos 'por página' podem entrar mais de uma vez.">
      {CATEGORIAS_CATALOGO.map((cat) => {
        const blocos = catalogo.filter((b) => b.categoria === cat);
        if (!blocos.length) return null;
        return (
          <div key={cat} style={{ marginBottom: 14 }}>
            <span className="enz-rotulo" style={{ marginBottom: 6 }}>{cat}</span>
            {blocos.map((b) => (
              <label key={b.id} className="flex items-center gap-3" style={{ padding: "5px 0", borderBottom: "1px solid var(--linha)" }}>
                <input type="checkbox" checked={!!marcados[b.id]} onChange={(e) => setMarcados({ ...marcados, [b.id]: e.target.checked })} />
                {editando ? (
                  <>
                    <input className="enz-input" style={{ flex: 1, padding: "6px 8px" }} value={b.nome} onChange={(e) => set(b.id, "nome", e.target.value)} />
                    <input className="enz-input" style={{ width: 64, padding: "6px 8px", textAlign: "right" }} value={b.horas} onChange={(e) => set(b.id, "horas", e.target.value)} />
                    <select className="enz-input" style={{ width: 130, padding: "6px 8px" }} value={b.etapa} onChange={(e) => set(b.id, "etapa", e.target.value)}>{ETAPAS.map((e) => <option key={e}>{e}</option>)}</select>
                    <button className="enz-link" onClick={() => onMudarCatalogo(catalogo.filter((x) => x.id !== b.id))}>✕</button>
                  </>
                ) : (
                  <>
                    <span style={{ flex: 1 }}>{b.nome}</span>
                    {calibracao[b.id] && <span className="enz-legenda" title={`média realizada em ${calibracao[b.id].n} projeto(s)`} style={{ color: calibracao[b.id].media > b.horas * 1.2 ? "var(--erro)" : calibracao[b.id].media < b.horas * 0.8 ? "var(--sucesso)" : "var(--tinta-musgo)" }}>real {calibracao[b.id].media} h · {calibracao[b.id].n}×</span>}
                    <span className="enz-legenda">{b.horas} h</span>
                  </>
                )}
              </label>
            ))}
            {editando && <button className="enz-link" style={{ marginTop: 6 }} onClick={() => onMudarCatalogo([...catalogo, { id: uid(), categoria: cat, nome: "", horas: 4, etapa: "Construção" }])}>+ bloco em {cat}</button>}
          </div>
        );
      })}
      <div className="flex items-center gap-4 flex-wrap" style={{ marginTop: 8 }}>
        <BotaoPrimario disabled={!selecionados.length} onClick={() => { onAdicionar(selecionados); setMarcados({}); }}>
          Adicionar ao escopo{selecionados.length ? ` · ${selecionados.length} bloco${selecionados.length > 1 ? "s" : ""} · ${somaHoras(selecionados)} h` : ""}
        </BotaoPrimario>
        <button className="enz-link" onClick={() => setEditando(!editando)}>{editando ? "concluir edição" : "editar catálogo"}</button>
        {Object.keys(calibracao).length > 0 && <span className="enz-nota">"real" é a média de horas registradas nos projetos entregues — use para ajustar o padrão.</span>}
      </div>
    </Card>
  );
}

function Plano({ escopo, precificacao, onMudarPrecificacao }) {
  const plano = planoDoEscopo(escopo, precificacao.horasPorSemana);
  const valorHora = parseValorBR(precificacao.valorHora);
  const custo = plano.horas * valorHora;
  const arredondado = custo > 0 ? Math.ceil(custo / 100) * 100 : 0;
  const setP = (campo) => (e) => onMudarPrecificacao({ ...precificacao, [campo]: e.target.value });
  return (
    <Card rotulo="Estimativa" titulo="Quanto custa, quanto tempo, em que ordem." subtitulo="calculada do escopo; a proposta nasce daqui.">
      <div className="grid sm:grid-cols-3 gap-2" style={{ marginBottom: 16 }}>
        <div><div className="text-xs mb-0.5">Valor da sua hora (R$)</div><input className="w-full px-2 py-1 text-sm rounded border bg-creme" style={{ borderColor: "var(--linha)" }} placeholder="120" value={precificacao.valorHora || ""} onChange={setP("valorHora")} /></div>
        <div><div className="text-xs mb-0.5">Horas que você dedica por semana</div><input className="w-full px-2 py-1 text-sm rounded border bg-creme" style={{ borderColor: "var(--linha)" }} placeholder="20" value={precificacao.horasPorSemana || ""} onChange={setP("horasPorSemana")} /></div>
        <div><div className="text-xs mb-0.5">Mensalidade padrão (R$/mês)</div><input className="w-full px-2 py-1 text-sm rounded border bg-creme" style={{ borderColor: "var(--linha)" }} placeholder="100" value={precificacao.mensalidadePadrao || ""} onChange={setP("mensalidadePadrao")} /></div>
      </div>
      <div className="grid grid-cols-3" style={{ borderTop: "1px solid var(--linha)", marginBottom: 16 }}>
        {[["Horas", `${plano.horas} h`], ["Implantação", arredondado ? formatarBR(arredondado) : "—"], ["Prazo", plano.horas ? plano.prazoTexto : "—"]].map(([r, v]) => (
          <div key={r} style={{ padding: "14px 12px 10px 0" }}><span className="enz-rotulo">{r}</span><div className="enz-numero" style={{ fontSize: 28, marginTop: 6 }}>{v}</div></div>
        ))}
      </div>
      {plano.semanas.length > 0 && (
        <div>
          <span className="enz-rotulo" style={{ marginBottom: 6 }}>Plano por semana</span>
          {plano.semanas.map((s) => (
            <div key={s.semana} className="flex gap-4" style={{ padding: "8px 0", borderBottom: "1px solid var(--linha)" }}>
              <div style={{ width: 90, flexShrink: 0 }}><div style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>Semana {s.semana}</div><div className="enz-legenda">{s.horas} h</div></div>
              <div style={{ flex: 1 }}>{s.itens.map((i) => <div key={i.id} className="flex gap-2" style={{ fontSize: 13, padding: "2px 0" }}><span className="enz-legenda" style={{ width: 92, flexShrink: 0 }}>{i.etapa || "Construção"}</span><span>{i.texto}</span></div>)}</div>
            </div>
          ))}
          <p className="enz-nota" style={{ marginTop: 8 }}>o prazo inclui 15% de folga sobre as horas; o plano é a ordem das etapas, não compromisso de data.</p>
        </div>
      )}
    </Card>
  );
}

function Horas({ sistema, precificacao, propostaAceita, onMudar }) {
  const [novo, setNovo] = useState({ data: new Date().toLocaleDateString("pt-BR"), itemId: "", horas: "", nota: "" });
  const registros = sistema.registros || [];
  const escopo = sistema.escopo || [];
  const real = realizadasPorItem(sistema);
  const estimadas = somaHoras(escopo);
  const realizadas = totalRealizadas(sistema);
  const valorHora = parseValorBR(precificacao.valorHora);
  const cobrado = propostaAceita ? parseValorBR(propostaAceita.investimento) : 0;
  const desvio = estimadas ? Math.round(((realizadas - estimadas) / estimadas) * 100) : null;
  const horaEfetiva = cobrado && realizadas ? cobrado / realizadas : null;
  const lancar = () => {
    const h = Number(String(novo.horas).replace(",", ".")) || 0;
    if (!h) return;
    onMudar({ ...sistema, registros: [...registros, { id: uid(), ...novo, horas: h }] });
    setNovo({ ...novo, horas: "", nota: "" });
  };
  return (
    <Card rotulo="Horas" titulo="Estimado × realizado." subtitulo="lance as horas conforme trabalha; o comparativo calibra o catálogo e mostra quanto valeu sua hora de verdade.">
      <div className="grid grid-cols-2 md:grid-cols-4" style={{ borderTop: "1px solid var(--linha)", marginBottom: 16 }}>
        {[
          ["Estimadas", `${estimadas} h`, null],
          ["Realizadas", `${realizadas} h`, desvio === null ? null : desvio > 10 ? "var(--erro)" : desvio < -10 ? "var(--sucesso)" : null],
          ["Desvio", desvio === null ? "—" : `${desvio > 0 ? "+" : ""}${desvio}%`, desvio === null ? null : desvio > 10 ? "var(--erro)" : desvio < -10 ? "var(--sucesso)" : null],
          ["Hora efetiva", horaEfetiva ? formatarBR(horaEfetiva) : "—", horaEfetiva && valorHora ? (horaEfetiva < valorHora * 0.9 ? "var(--erro)" : horaEfetiva > valorHora * 1.1 ? "var(--sucesso)" : null) : null],
        ].map(([r, v, cor]) => (
          <div key={r} style={{ padding: "14px 12px 10px 0" }}><span className="enz-rotulo">{r}</span><div className="enz-numero" style={{ fontSize: 26, marginTop: 6, color: cor || "var(--tinta)" }}>{v}</div></div>
        ))}
      </div>
      {horaEfetiva && valorHora ? <p className="enz-nota" style={{ marginBottom: 12 }}>cobrado {formatarBR(cobrado)} ÷ {realizadas} h realizadas = {formatarBR(horaEfetiva)}/h (sua hora: {formatarBR(valorHora)}). custo real das horas: {formatarBR(realizadas * valorHora)}.</p> : null}

      <div className="flex items-end gap-2 flex-wrap" style={{ marginBottom: 12 }}>
        <div><div className="text-xs mb-0.5">Data</div><input className="enz-input" style={{ width: 110, padding: "8px 10px" }} value={novo.data} onChange={(e) => setNovo({ ...novo, data: e.target.value })} /></div>
        <div style={{ flex: 1, minWidth: 220 }}><div className="text-xs mb-0.5">Item do escopo</div>
          <select className="enz-input" style={{ padding: "8px 10px" }} value={novo.itemId} onChange={(e) => setNovo({ ...novo, itemId: e.target.value })}>
            <option value="">(geral — sem item)</option>
            {escopo.map((i) => <option key={i.id} value={i.id}>{i.texto}</option>)}
          </select>
        </div>
        <div><div className="text-xs mb-0.5">Horas</div><input className="enz-input" style={{ width: 70, padding: "8px 10px", textAlign: "right" }} value={novo.horas} placeholder="2,5" onChange={(e) => setNovo({ ...novo, horas: e.target.value })} /></div>
        <div style={{ flex: 1, minWidth: 160 }}><div className="text-xs mb-0.5">Nota (opcional)</div><input className="enz-input" style={{ padding: "8px 10px" }} value={novo.nota} onChange={(e) => setNovo({ ...novo, nota: e.target.value })} /></div>
        <BotaoPrimario pequeno onClick={lancar} disabled={!Number(String(novo.horas).replace(",", "."))}>Lançar</BotaoPrimario>
      </div>

      {registros.length > 0 && (
        <div>
          {[...registros].reverse().map((r) => {
            const item = escopo.find((i) => i.id === r.itemId);
            return (
              <div key={r.id} className="flex items-center gap-3 flex-wrap" style={{ padding: "5px 0", borderBottom: "1px solid var(--linha)", fontSize: 13 }}>
                <span className="enz-legenda" style={{ width: 84 }}>{r.data}</span>
                <span style={{ flex: 1 }}>{item ? item.texto : "geral"}{r.nota ? <span className="enz-legenda"> — {r.nota}</span> : null}</span>
                <span style={{ width: 54, textAlign: "right" }}>{r.horas} h</span>
                <button className="enz-link" onClick={() => onMudar({ ...sistema, registros: registros.filter((x) => x.id !== r.id) })}>✕</button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export function ModuloSistema({ cliente, sistema, totalSistemas = 1, propostaAceita, catalogo = [], calibracao = {}, precificacao = {}, gerando, erro, onMudar, onMudarCatalogo, onMudarPrecificacao, onEstimarIA, onVoltar, onPropostas, onLista }) {
  const set = (campo) => (v) => onMudar({ ...sistema, [campo]: v });
  const escopo = sistema.escopo || [];
  const horasTotal = somaHoras(escopo);
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
        acoes={<>{totalSistemas > 1 && onLista && <BotaoContorno pequeno onClick={onLista}>Todos os sistemas ({totalSistemas})</BotaoContorno>}<BotaoContorno pequeno onClick={onEstimarIA} disabled={gerando || !(sistema.briefing || "").trim()}>{gerando ? "Estimando…" : "Estimar com IA"}</BotaoContorno><BotaoContorno pequeno onClick={onPropostas}>Propostas</BotaoContorno></>}
      />
      <div className="enz-container" style={{ paddingTop: 0 }}>
        <AvisoErro erro={erro} />
        {gerando && <Trabalhando frase="lendo o briefing e montando o escopo" />}
        <div className="grid gap-3 sm:grid-cols-3" style={{ marginBottom: 32 }}>
          <Card variante="vazado" rotulo="Entregas" titulo={`${entregues} de ${escopo.length}`} subtitulo={`itens do escopo entregues · ${horasTotal} h estimadas`} />
          <Card variante="vazado" rotulo="Do cliente" titulo={pendentes.length ? `${pendentes.length} pendente${pendentes.length > 1 ? "s" : ""}` : "tudo recebido"} subtitulo="material que depende do cliente" />
          <Card variante="vazado" rotulo="Valores" titulo={sistema.implantacao ? `R$ ${sistema.implantacao}` : "—"} subtitulo={`implantação${sistema.mensalidade ? ` · R$ ${sistema.mensalidade}/mês${sistema.mensalidadeAtiva ? " ativa" : ""}` : ""}`} />
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
            <InputField label="Prazo combinado (semanas)" value={sistema.prazoSemanas} onChange={set("prazoSemanas")} placeholder="deixe vazio para usar a estimativa" />
            <InputField label="Início (dd/mm/aaaa)" value={sistema.inicio} onChange={set("inicio")} placeholder="" />
          </div>
        </Card>

        <div style={{ marginTop: 24 }}>
          <Catalogo catalogo={catalogo} calibracao={calibracao} onMudarCatalogo={onMudarCatalogo} onAdicionar={(blocos) => set("escopo")([...escopo, ...blocos.map(itemDoBloco)])} />
        </div>

        <Card rotulo="Escopo" titulo="O que será construído." subtitulo="cada item vira uma linha da proposta e uma entrega para acompanhar. horas e etapa alimentam a estimativa." style={{ marginTop: 24 }}>
          <ListaItens itens={escopo} onMudar={set("escopo")} placeholder="Mapa de mesas por praça, com status em tempo real" comStatus realizadas={realizadasPorItem(sistema)} />
        </Card>

        <div style={{ marginTop: 24 }}>
          <Plano escopo={escopo} precificacao={precificacao} onMudarPrecificacao={onMudarPrecificacao} />
        </div>

        <div style={{ marginTop: 24 }}>
          <Horas sistema={sistema} precificacao={precificacao} propostaAceita={propostaAceita} onMudar={onMudar} />
        </div>

        <div className="grid gap-3 lg:grid-cols-2" style={{ marginTop: 24 }}>
          <Card rotulo="Fora do escopo" titulo="O que não entra." subtitulo="um por linha. evita a conversa difícil depois.">
            <textarea className="enz-input" value={sistema.foraEscopo} onChange={(e) => set("foraEscopo")(e.target.value)} style={{ minHeight: 120 }} placeholder={"Integração com iFood\nOperação em mais de uma unidade\nPagamento online"} />
          </Card>
          <Card rotulo="Fornecido pelo cliente" titulo="O que depende dele." subtitulo="marque quando receber — o prazo só conta a partir daí.">
            <ListaItens itens={fornecido} onMudar={set("fornecidoCliente")} placeholder="Planta do salão com mesas e praças" comRecebido />
          </Card>
        </div>

        <Card rotulo="Valores e entrega" titulo="Implantação, mensalidade e sustentação." style={{ marginTop: 24 }}>
          <div className="grid sm:grid-cols-4 gap-x-4 items-end">
            <InputField label="Implantação (R$)" value={sistema.implantacao} onChange={set("implantacao")} placeholder="6400" ajuda="50% no aceite, 50% na entrega." />
            <InputField label="Mensalidade (R$)" value={sistema.mensalidade} onChange={set("mensalidade")} placeholder="200" ajuda="hospedagem, manutenção, pequenas alterações." />
            <InputField label="Entregue em (dd/mm/aaaa)" value={sistema.entregueEm} onChange={set("entregueEm")} />
            <label className="enz-campo flex items-center gap-2" style={{ paddingBottom: 24 }}>
              <input type="checkbox" checked={!!sistema.mensalidadeAtiva} onChange={(e) => set("mensalidadeAtiva")(e.target.checked)} />
              <span>mensalidade ativa</span>
            </label>
          </div>
          {propostaAceita && <p className="enz-nota">proposta aceita: {propostaAceita.investimento || "valor a definir"}{propostaAceita.mensalidade ? ` + R$ ${propostaAceita.mensalidade}/mês` : ""}.{!sistema.implantacao && propostaAceita.investimento ? <> <button className="enz-link" style={{ fontSize: 13 }} onClick={() => onMudar({ ...sistema, implantacao: String(parseValorBR(propostaAceita.investimento)).replace(".", ","), mensalidade: sistema.mensalidade || propostaAceita.mensalidade || "" })}>usar estes valores</button></> : null}</p>}
          <div className="enz-campo" style={{ marginTop: 12 }}>
            <label className="enz-rotulo">Observações internas</label>
            <textarea className="enz-input" value={sistema.obs} onChange={(e) => set("obs")(e.target.value)} style={{ minHeight: 80 }} placeholder="decisões, pendências antes de começar, o que não falar com o cliente ainda" />
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Lista de sistemas do cliente ───────────────────────────────────
export function ListaSistemas({ cliente, sistemas, onAbrir, onNovo, onExcluir, onVoltar }) {
  return (
    <div className="pb-16">
      <HeaderModulo titulo="Sistemas" subtitulo="Cada sistema tem o próprio escopo, proposta, entrega e mensalidade." cliente={cliente} onVoltar={onVoltar} acoes={<BotaoPrimario pequeno onClick={onNovo}>+ Novo sistema</BotaoPrimario>} />
      <div className="enz-container" style={{ paddingTop: 0 }}>
        {sistemas.length === 0 && <div className="enz-card enz-card-vazado enz-nota">nenhum sistema ainda. crie o primeiro e registre o briefing.</div>}
        <div className="grid gap-3 sm:grid-cols-2">
          {sistemas.map((s) => {
            const e = s.escopo || []; const ok = e.filter((i) => i.status === "entregue").length;
            return (
              <Card key={s.id} onClick={() => onAbrir(s.id)} rotulo={ROTULO_STATUS_SISTEMA[s.status] || "em levantamento"} titulo={s.nome || "Sem nome"} subtitulo={[e.length ? `${ok}/${e.length} entregas` : "sem escopo", s.implantacao ? `implantação R$ ${s.implantacao}` : null, s.mensalidadeAtiva ? `R$ ${s.mensalidade}/mês` : s.mensalidade ? `mensalidade prevista R$ ${s.mensalidade}` : null, s.entregueEm ? `entregue em ${s.entregueEm}` : null].filter(Boolean).join(" · ")}>
                <span className="enz-link">abrir →</span>
              </Card>
            );
          })}
        </div>
        {sistemas.length > 0 && (
          <div className="flex gap-4 flex-wrap" style={{ marginTop: 24 }}>
            {sistemas.map((s) => <ConfirmarAcao key={s.id} rotulo={`excluir ${s.nome || "sem nome"}`} aviso="apaga o escopo e as horas deste sistema; parcelas no Financeiro ficam" onConfirmar={() => onExcluir(s.id)} />)}
          </div>
        )}
      </div>
    </div>
  );
}
