import { useState } from "react";
import { Card } from "../componentes/enraizar.jsx";
import { AvisoErro, BotaoContorno, BotaoPrimario, InputField, Trabalhando } from "../componentes/ui.jsx";
import { tipoContratoDe } from "../ia/contrato.jsx";

export const STATUS_CONTRATO = {
  rascunho: { rotulo: "Rascunho", cor: "var(--tinta-musgo)", fundo: "var(--fundo-recuo)" },
  enviado: { rotulo: "Enviado para assinatura", cor: "var(--alerta)", fundo: "var(--alerta-fundo)" },
  assinado: { rotulo: "Assinado", cor: "var(--sucesso)", fundo: "var(--sucesso-fundo)" },
};

export const contratoVazio = () => ({ status: "rascunho", titulo: "", clausulas: [], obs: "", dataAssinatura: "", contratante: { nome: "", documento: "", endereco: "", representante: "" } });

function Parte({ rotulo, dados, onMudar, comRepresentante }) {
  const set = (campo) => (v) => onMudar({ ...dados, [campo]: v });
  return (
    <div>
      <span className="enz-rotulo" style={{ marginBottom: 8 }}>{rotulo}</span>
      <InputField label="Nome / razão social" value={dados.nome || ""} onChange={set("nome")} />
      <InputField label="CPF / CNPJ" value={dados.documento || ""} onChange={set("documento")} />
      <InputField label="Endereço" value={dados.endereco || ""} onChange={set("endereco")} placeholder="rua, número, cidade/UF" />
      {comRepresentante && <InputField label="Representante (se empresa)" value={dados.representante || ""} onChange={set("representante")} placeholder="nome e CPF" />}
    </div>
  );
}

export function CardContrato({ cliente, prop, contratada, gerando, erro, onMudarContratada, onMudar, onGerar, onImprimir }) {
  const [editandoClausulas, setEditandoClausulas] = useState(false);
  const contrato = { ...contratoVazio(), ...(prop.contrato || {}) };
  const tipo = tipoContratoDe(cliente, prop);
  const set = (campo) => (v) => onMudar({ ...contrato, [campo]: v });
  const opcoes = prop.opcoes || [];
  const temClausulas = contrato.clausulas.length > 0;
  const st = STATUS_CONTRATO[contrato.status] || STATUS_CONTRATO.rascunho;
  return (
    <Card rotulo="Contrato" titulo={temClausulas ? contrato.titulo : "Da proposta aceita ao contrato."} subtitulo={temClausulas ? `${contrato.clausulas.length} cláusulas · ${tipo}` : "confira as partes, gere o texto com a IA e revise antes de enviar."} style={{ marginBottom: 24 }}>
      <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 16 }}>
        <select className="enz-input" style={{ width: 220, padding: "6px 10px", color: st.cor, background: st.fundo }} value={contrato.status} onChange={(e) => set("status")(e.target.value)}>
          {Object.entries(STATUS_CONTRATO).map(([k, s]) => <option key={k} value={k}>{s.rotulo}</option>)}
        </select>
        {contrato.status === "assinado" && <input className="enz-input" style={{ width: 150, padding: "6px 10px" }} placeholder="assinado em dd/mm/aaaa" value={contrato.dataAssinatura || ""} onChange={(e) => set("dataAssinatura")(e.target.value)} />}
        {opcoes.length > 1 && (
          <select className="enz-input" style={{ width: 220, padding: "6px 10px" }} value={prop.opcaoEscolhida || ""} onChange={(e) => onMudar(contrato, { opcaoEscolhida: e.target.value })} title="Opção aceita pelo cliente">
            <option value="">opção aceita…</option>
            {opcoes.map((o) => <option key={o.id} value={o.id}>{o.nome} — {o.titulo}</option>)}
          </select>
        )}
        <BotaoPrimario onClick={onGerar} disabled={gerando || (opcoes.length > 1 && !prop.opcaoEscolhida)}>{gerando ? "Redigindo…" : temClausulas ? "Gerar novamente" : "Gerar contrato com IA"}</BotaoPrimario>
        {temClausulas && <BotaoContorno onClick={onImprimir}>Exportar contrato (PDF)</BotaoContorno>}
      </div>

      <AvisoErro erro={erro} />
      {gerando && <Trabalhando frase="redigindo as cláusulas a partir da proposta" />}

      <div className="grid gap-x-6 lg:grid-cols-2">
        <Parte rotulo="Contratada (você)" dados={contratada} onMudar={onMudarContratada} />
        <Parte rotulo="Contratante" dados={{ nome: cliente.negocio, ...contrato.contratante }} onMudar={set("contratante")} comRepresentante={cliente.tipo !== "pessoa"} />
      </div>
      <p className="enz-nota">os dados da contratada ficam salvos para os próximos contratos. os do contratante ficam neste contrato.</p>

      {temClausulas && (
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--linha)" }}>
          <div className="flex items-center justify-between gap-2 flex-wrap" style={{ marginBottom: 8 }}>
            <span className="enz-rotulo">Cláusulas</span>
            <button className="enz-link" onClick={() => setEditandoClausulas(!editandoClausulas)}>{editandoClausulas ? "concluir edição" : "editar texto"}</button>
          </div>
          {contrato.obs && <p className="enz-nota" style={{ marginBottom: 10 }}>IA: {contrato.obs}</p>}
          {contrato.clausulas.map((c, i) => (
            <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid var(--linha)" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>{c.n}. {c.titulo}</div>
              {editandoClausulas ? (
                <textarea className="enz-input" style={{ minHeight: 90, marginTop: 6 }} value={c.texto} onChange={(e) => set("clausulas")(contrato.clausulas.map((x, k) => (k === i ? { ...x, texto: e.target.value } : x)))} />
              ) : (
                <div style={{ fontSize: 13.5, lineHeight: 1.6, whiteSpace: "pre-line", marginTop: 4 }}>{c.texto}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

const VERDE = "#1e3226";

export function ImpressaoContrato({ cliente, prop, contratada }) {
  const contrato = prop && prop.contrato;
  if (!contrato || !(contrato.clausulas || []).length) return null;
  const tipo = tipoContratoDe(cliente, prop);
  const ct = { nome: cliente.negocio, ...(contrato.contratante || {}) };
  const linhaParte = (p) => [p.nome, p.documento && `inscrita no ${/\//.test(p.documento) ? "CNPJ" : "CPF/CNPJ"} sob o nº ${p.documento}`, p.endereco && `com endereço em ${p.endereco}`, p.representante && `neste ato representada por ${p.representante}`].filter(Boolean).join(", ");
  return (
    <div className="area-contrato hidden print:block p-10" data-marca={tipo === "sistema" ? "ns" : "enraizar"} data-cabecalho={`Contrato · ${cliente.negocio}`} style={{ color: VERDE, fontFamily: "var(--font-body)", fontSize: 12.5, lineHeight: 1.6 }}>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 9.5, letterSpacing: ".24em", textTransform: "uppercase", fontWeight: 700, color: "#b8902f", marginBottom: 6 }}>Contrato de prestação de serviços</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 26, lineHeight: 1.15, fontWeight: 500, marginBottom: 18 }}>{contrato.titulo}</div>

      <p style={{ marginBottom: 8 }}><strong>CONTRATADA:</strong> {linhaParte(contratada || {}) || "[dados da contratada]"}.</p>
      <p style={{ marginBottom: 16 }}><strong>CONTRATANTE:</strong> {linhaParte(ct)}.</p>
      <p style={{ marginBottom: 18 }}>As partes acima celebram o presente contrato, que se rege pelas cláusulas a seguir e pela proposta comercial aceita{prop.data ? ` em ${prop.data}` : ""}, que dele faz parte integrante.</p>

      {contrato.clausulas.map((c, i) => (
        <div key={i} style={{ marginBottom: 12, breakInside: "avoid" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 500, marginBottom: 3 }}>Cláusula {c.n} — {c.titulo}</div>
          <div style={{ whiteSpace: "pre-line" }}>{c.texto}</div>
        </div>
      ))}

      <p style={{ marginTop: 20 }}>E, por estarem de acordo, as partes assinam o presente em duas vias de igual teor.</p>
      <p style={{ marginTop: 6 }}>{(ct.endereco || "").split(",").pop()?.trim() || "[cidade/UF]"}, {contrato.dataAssinatura || "____ de ______________ de ______"}.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginTop: 56 }}>
        <div style={{ borderTop: `1px solid ${VERDE}`, paddingTop: 6, textAlign: "center" }}>{(contratada && contratada.nome) || "Nayara Silva"}<br /><span style={{ fontSize: 11, color: "#56645a" }}>Contratada</span></div>
        <div style={{ borderTop: `1px solid ${VERDE}`, paddingTop: 6, textAlign: "center" }}>{ct.representante || ct.nome}<br /><span style={{ fontSize: 11, color: "#56645a" }}>Contratante</span></div>
      </div>
    </div>
  );
}
