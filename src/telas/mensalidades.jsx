import { useEffect, useMemo, useState } from "react";
import { Card, TituloSecao } from "../componentes/enraizar.jsx";
import { BotaoContorno, BotaoPrimario, InputField } from "../componentes/ui.jsx";
import { formatarBR } from "../ia/financeiro.jsx";
import { STATUS_MES, textoCobranca, visaoMensalidades } from "../nucleo/recorrencia.jsx";
import { MESES } from "../nucleo/agenda-base.js";

const COR = { paga: "var(--sucesso)", pendente: "var(--alerta)", atrasada: "var(--erro)", nao_gerada: "var(--tinta-musgo)", sem: "var(--linha)" };
const hojeMes = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; };
const rotuloMes = (k) => { const [a, m] = k.split("-").map(Number); return `${MESES[m - 1]} ${a}`; };
const dataHoje = () => new Date().toLocaleDateString("pt-BR");
const linkZap = (numero, texto) => { const n = String(numero || "").replace(/\D/g, ""); return n ? `https://wa.me/${n.length <= 11 ? "55" + n : n}?text=${encodeURIComponent(texto)}` : null; };

function Tile({ rotulo, valor, cor }) {
  return (
    <div style={{ padding: "16px 16px 16px 0" }}>
      <span className="enz-rotulo">{rotulo}</span>
      <div className="enz-numero" style={{ marginTop: 8, fontSize: 30, color: cor || "var(--tinta)" }}>{valor}</div>
    </div>
  );
}

function Linha({ l, pix, onParcela, onSistema, onContato, onAbrirCliente }) {
  const [abrir, setAbrir] = useState(false);
  const [valor, setValor] = useState(l.sistema.mensalidade || "");
  const [dia, setDia] = useState(l.dia || "");
  const [desde, setDesde] = useState(l.sistema.mensalidadeDesde || "");
  const [zap, setZap] = useState((l.contato && l.contato.whatsapp) || "");
  const [quem, setQuem] = useState((l.contato && l.contato.nome) || "");
  const st = l.statusMes;
  const cobrar = linkZap(l.contato && l.contato.whatsapp, textoCobranca(l, l.doMes, pix));
  return (
    <div className="enz-card" style={{ marginBottom: 12, borderLeft: `3px solid ${COR[st] || "var(--linha)"}`, opacity: l.ativa ? 1 : 0.75 }}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <button className="text-left" style={{ font: "inherit", fontFamily: "var(--font-display)", fontSize: 21, lineHeight: 1.2 }} onClick={() => onAbrirCliente(l.clienteId)}>{l.cliente}</button>
          <div className="enz-nota" style={{ marginTop: 2 }}>{l.nomeSistema} · {l.ativa ? `${formatarBR(l.valor)} por mês` : l.valor ? "mensalidade ainda não ativada" : "sem mensalidade"}{l.dia ? ` · vence dia ${l.dia}` : ""}{l.pagas ? ` · ${l.pagas} paga${l.pagas > 1 ? "s" : ""}, ${formatarBR(l.recebido)} recebidos` : ""}</div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="enz-selo enz-selo-pequeno" style={{ background: "var(--fundo-recuo)", color: COR[st] }}><span className="enz-ponto" />{STATUS_MES[st]}{l.doMes && l.doMes.pago && l.doMes.pagoEm ? ` em ${l.doMes.pagoEm}` : ""}</span>
          {l.doMes && !l.doMes.pago && <BotaoPrimario pequeno onClick={() => onParcela(l.clienteId, l.doMes.id, { pago: true, pagoEm: dataHoje() })}>Marcar paga</BotaoPrimario>}
          {l.doMes && l.doMes.pago && <button className="enz-link" onClick={() => onParcela(l.clienteId, l.doMes.id, { pago: false, pagoEm: "" })}>desfazer</button>}
          {l.doMes && !l.doMes.pago && cobrar && <a className="enz-botao enz-botao-contorno enz-botao-pequeno" href={cobrar} target="_blank" rel="noreferrer">Cobrar no WhatsApp</a>}
          <button className="enz-link" onClick={() => setAbrir(!abrir)}>{abrir ? "fechar" : "ajustes"}</button>
        </div>
      </div>

      {l.implantacao && l.implantacao.total > 0 && (
        <div className="enz-nota" style={{ marginTop: 10 }}>
          implantação {formatarBR(l.implantacao.total)}: {l.implantacao.geradas ? `${formatarBR(l.implantacao.recebido)} recebidos · ${formatarBR(l.implantacao.aberto)} em aberto` : "parcelas ainda não lançadas no Financeiro do cliente"}
          {l.implantacao.parcelas.filter((p) => !p.pago).map((p) => <span key={p.id}> · <button className="enz-link" style={{ fontSize: 13 }} onClick={() => onParcela(l.clienteId, p.id, { pago: true, pagoEm: dataHoje() })}>marcar paga: {p.descricao.split(" — ")[0]}{p.vencimento ? ` (${p.vencimento})` : ""}</button></span>)}
        </div>
      )}
      <div className="flex items-center gap-1 flex-wrap" style={{ marginTop: 12 }} title="últimos seis meses">
        {l.historico.map((h) => (
          <span key={h.mes} title={`${rotuloMes(h.mes)}: ${STATUS_MES[h.status]}`} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, color: "var(--tinta-musgo)", marginRight: 8 }}>
            <span style={{ width: 9, height: 9, borderRadius: 999, background: COR[h.status], display: "inline-block" }} />{MESES[Number(h.mes.slice(5)) - 1].slice(0, 3)}
          </span>
        ))}
        {l.atrasadas.length > 0 && <span className="enz-nota" style={{ color: "var(--erro)" }}>· {l.atrasadas.length} em atraso: {l.atrasadas.map((p) => p.vencimento).join(", ")}</span>}
      </div>

      {abrir && (
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--linha)" }}>
          <div className="grid gap-x-4 sm:grid-cols-3">
            <InputField label="Valor (R$/mês)" value={valor} onChange={setValor} placeholder="200" />
            <InputField label="Dia do vencimento" value={dia} onChange={setDia} placeholder="10" ajuda="1 a 28" />
            <InputField label="Primeira mensalidade" value={desde} onChange={setDesde} placeholder="dd/mm/aaaa" ajuda={l.desde ? `hoje: ${l.desde.toLocaleDateString("pt-BR")}` : "um mês após a entrega, se vazio"} />
          </div>
          <div className="grid gap-x-4 sm:grid-cols-2">
            <InputField label="Quem recebe a cobrança" value={quem} onChange={setQuem} placeholder="nome da pessoa" ajuda="entra na saudação da mensagem" />
            <InputField label="WhatsApp do cliente" value={zap} onChange={setZap} placeholder="(62) 90000-0000" ajuda="para o botão de cobrança" />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <BotaoPrimario pequeno onClick={() => { onSistema(l.clienteId, l.sistemaId, { ...l.sistema, mensalidade: valor, diaVencimento: dia ? Math.min(28, Math.max(1, Number(dia))) : "", mensalidadeDesde: desde }); onContato(l.clienteId, { ...(l.contato || {}), nome: quem, whatsapp: zap }); setAbrir(false); }}>Salvar ajustes</BotaoPrimario>
            <BotaoContorno onClick={() => onSistema(l.clienteId, l.sistemaId, { ...l.sistema, mensalidadeAtiva: !l.ativa })}>{l.ativa ? "Pausar mensalidade" : "Reativar mensalidade"}</BotaoContorno>
            <span className="enz-nota">mudar o valor vale para as próximas mensalidades; as já geradas ficam como estão.</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function TelaMensalidades({ clientes, sistemasPorCliente, financeiroPorCliente, contratada, onMudarContratada, onMudarFinanceiro, onMudarSistema, onMudarContato, onAbrirCliente, onVoltar }) {
  const [mes, setMes] = useState(hojeMes());
  const [pix, setPix] = useState((contratada && contratada.pix) || "");
  const [geradas, setGeradas] = useState(0);
  const visao = useMemo(() => visaoMensalidades({ clientes, sistemasPorCliente, financeiroPorCliente, mes }), [clientes, sistemasPorCliente, financeiroPorCliente, mes]);
  const { linhas, resumo } = visao;

  // gera as mensalidades que faltam até o mês atual (idempotente: uma por mês por sistema)
  const gerarFaltantes = async () => {
    let n = 0;
    for (const l of linhas) {
      if (!l.faltantes.length) continue;
      const fin = financeiroPorCliente[l.clienteId] || { parcelas: [] };
      await onMudarFinanceiro(l.clienteId, { ...fin, parcelas: [...(fin.parcelas || []), ...l.faltantes] });
      n += l.faltantes.length;
    }
    setGeradas(n);
  };
  useEffect(() => { if (resumo.faltantes > 0) gerarFaltantes(); }, [resumo.faltantes]);

  const mudarMes = (n) => { const [a, m] = mes.split("-").map(Number); const d = new Date(a, m - 1 + n, 1); setMes(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`); };
  const mudarParcela = (clienteId, parcelaId, campos) => {
    const fin = financeiroPorCliente[clienteId] || { parcelas: [] };
    onMudarFinanceiro(clienteId, { ...fin, parcelas: (fin.parcelas || []).map((p) => (p.id === parcelaId ? { ...p, ...campos } : p)) });
  };

  return (
    <div className="enz-container">
      <button onClick={onVoltar} className="enz-link" style={{ marginBottom: 20 }}>← início</button>
      <TituloSecao
        rotulo="Mensalidades"
        titulo={resumo.ativos ? `${formatarBR(resumo.mensal)} por mês, em ${resumo.ativos} sistema${resumo.ativos > 1 ? "s" : ""}.` : "Nenhuma mensalidade ativa."}
        virada={resumo.atrasado > 0 ? `${formatarBR(resumo.atrasado)} em atraso.` : resumo.pendente > 0 ? `${formatarBR(resumo.pendente)} a receber este mês.` : resumo.ativos ? "Tudo em dia." : "Ative a mensalidade no módulo Sistema de cada cliente."}
        descricao="Cada sistema entregue gera uma mensalidade por mês, sozinho. Aqui você vê quem pagou, cobra quem não pagou e ajusta valor, dia e pausa."
      />

      <div className="flex items-center justify-between gap-3 flex-wrap" style={{ marginTop: 28 }}>
        <button className="enz-link" onClick={() => mudarMes(-1)}>← mês anterior</button>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 24, textTransform: "capitalize" }}>{rotuloMes(mes)}</div>
        <button className="enz-link" onClick={() => mudarMes(1)}>próximo mês →</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5" style={{ marginTop: 8, borderTop: "1px solid var(--linha)", borderBottom: "1px solid var(--linha)", marginBottom: 24 }}>
        <Tile rotulo="Previsto no mês" valor={formatarBR(resumo.previsto)} />
        <Tile rotulo="Recebido no mês" valor={formatarBR(resumo.recebido)} cor="var(--sucesso)" />
        <Tile rotulo="Pendente" valor={formatarBR(resumo.pendente)} cor={resumo.pendente ? "var(--alerta)" : undefined} />
        <Tile rotulo="Em atraso (todos os meses)" valor={formatarBR(resumo.atrasado)} cor={resumo.atrasado ? "var(--erro)" : undefined} />
        <Tile rotulo="Implantações a receber" valor={formatarBR(resumo.implantacaoAberta)} cor={resumo.implantacaoAberta ? "var(--alerta)" : undefined} />
      </div>
      {geradas > 0 && <p className="enz-nota" style={{ marginBottom: 16 }}>{geradas} mensalidade{geradas > 1 ? "s" : ""} gerada{geradas > 1 ? "s" : ""} agora, até o mês atual. Elas também aparecem no Financeiro de cada cliente e no calendário da Agenda.</p>}

      {linhas.length === 0 && <div className="enz-card enz-card-vazado enz-nota">nenhum sistema com mensalidade. no módulo Sistema do cliente, preencha o valor, marque "mensalidade ativa" e registre a data de entrega.</div>}
      {linhas.map((l) => <Linha key={l.chave} l={l} pix={pix} onParcela={mudarParcela} onSistema={onMudarSistema} onContato={onMudarContato} onAbrirCliente={onAbrirCliente} />)}

      <Card rotulo="Cobrança" titulo="Sua chave Pix." subtitulo="entra na mensagem do botão Cobrar no WhatsApp." style={{ marginTop: 32 }}>
        <div className="flex items-end gap-3 flex-wrap">
          <div style={{ flex: "1 1 280px" }}><InputField label="Chave Pix" value={pix} onChange={setPix} placeholder="e-mail, CPF/CNPJ, telefone ou chave aleatória" /></div>
          <div style={{ marginBottom: 24 }}><BotaoContorno onClick={() => onMudarContratada({ ...(contratada || {}), pix })}>Salvar</BotaoContorno></div>
        </div>
      </Card>
    </div>
  );
}

// card do painel inicial
export function CardMensalidades({ clientes, sistemasPorCliente, financeiroPorCliente, onAbrir }) {
  const { linhas, resumo } = visaoMensalidades({ clientes, sistemasPorCliente, financeiroPorCliente, mes: hojeMes() });
  if (!linhas.length) {
    if (!clientes.some((c) => (c.servicos || {}).sistemas)) return null;
    return <Card onClick={onAbrir} rotulo="Mensalidades" titulo="Nenhuma mensalidade ativa ainda." subtitulo="quando um sistema for entregue, ative a mensalidade no módulo Sistema e acompanhe aqui." style={{ marginTop: 24 }}><span className="enz-link">ver mensalidades →</span></Card>;
  }
  const pagas = linhas.filter((l) => l.statusMes === "paga").length;
  const pend = linhas.filter((l) => l.statusMes === "pendente" || l.statusMes === "nao_gerada").length;
  const atras = linhas.filter((l) => l.atrasadas.length).length;
  if (!resumo.ativos) return <Card onClick={onAbrir} rotulo="Mensalidades" titulo={resumo.implantacaoAberta ? `${formatarBR(resumo.implantacaoAberta)} de implantações a receber.` : "Nenhuma mensalidade ativa ainda."} subtitulo={resumo.implantacaoAberta ? "mensalidades começam quando os sistemas forem entregues." : "quando um sistema for entregue, ative a mensalidade no módulo Sistema e acompanhe aqui."} style={{ marginTop: 24 }}><span className="enz-link">ver mensalidades →</span></Card>;
  return (
    <Card onClick={onAbrir} rotulo="Mensalidades" titulo={`${formatarBR(resumo.mensal)} por mês em ${resumo.ativos} sistema${resumo.ativos > 1 ? "s" : ""}${resumo.implantacaoAberta ? ` · ${formatarBR(resumo.implantacaoAberta)} de implantações a receber` : ""}.`} subtitulo={`este mês: ${pagas} paga${pagas === 1 ? "" : "s"} · ${pend} pendente${pend === 1 ? "" : "s"}${atras ? ` · ${atras} cliente${atras > 1 ? "s" : ""} em atraso` : ""}`} style={{ marginTop: 24 }}>
      <span className="enz-link">ver mensalidades →</span>
    </Card>
  );
}
