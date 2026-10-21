import { BotaoContorno, InputField } from "../componentes/ui.jsx";
import { formatarBR, parseValorBR } from "../ia/financeiro.jsx";
import { uid } from "../nucleo/base.jsx";
import { emLinhasDoc } from "./documentos.jsx";
import { linhasPara } from "./sistema.jsx";

// Proposta de desenvolvimento de sistema: precificada por hora, mensalidade à parte,
// com uma ou mais opções (A/B) no mesmo documento. Marca: Nayara Silva · Soluções personalizadas para negócios.

const calcular = (horas, valorHora) => {
  const h = Number(String(horas || "").replace(",", ".")) || 0;
  const total = h * valorHora;
  return { h, total, arredondado: total > 0 ? Math.ceil(total / 100) * 100 : 0 };
};

export function PainelPrecoSistema({ prop, precificacao, onMudar, onMudarPrecificacao }) {
  const valorHora = parseValorBR(precificacao.valorHora);
  const { h, total, arredondado } = calcular(prop.horasEstimadas, valorHora);
  const setP = (campo) => (e) => onMudarPrecificacao({ ...precificacao, [campo]: e.target.value });
  const temOpcoes = (prop.opcoes || []).length > 0;
  return (
    <div className="mb-4 rounded-lg p-4" style={{ background: "var(--fundo-elevado)", border: "1px solid var(--linha)" }}>
      <div className="enz-rotulo mb-1">Precificação por hora</div>
      <p className="text-xs mb-3" style={{ color: "var(--tinta-musgo)" }}>
        Seu valor/hora vale para todos os sistemas; as horas são estimadas por projeto{temOpcoes ? " — ou por opção, abaixo" : ""}. A mensalidade cobre hospedagem, manutenção e pequenas alterações; não entra na implantação.
      </p>
      <div className="grid sm:grid-cols-3 gap-2 mb-2">
        <div>
          <div className="text-xs mb-0.5">Valor da sua hora (R$)</div>
          <input className="w-full px-2 py-1 text-sm rounded border bg-creme" style={{ borderColor: "var(--linha)" }} placeholder="Ex.: 120" value={precificacao.valorHora || ""} onChange={setP("valorHora")} />
        </div>
        {!temOpcoes && (
          <div>
            <div className="text-xs mb-0.5">Horas estimadas neste projeto</div>
            <input className="w-full px-2 py-1 text-sm rounded border bg-creme" style={{ borderColor: "var(--linha)" }} placeholder="Ex.: 50" value={prop.horasEstimadas || ""} onChange={(e) => onMudar({ ...prop, horasEstimadas: e.target.value })} />
          </div>
        )}
        <div>
          <div className="text-xs mb-0.5">Mensalidade padrão (R$/mês)</div>
          <input className="w-full px-2 py-1 text-sm rounded border bg-creme" style={{ borderColor: "var(--linha)" }} placeholder="Ex.: 100" value={precificacao.mensalidadePadrao || ""} onChange={setP("mensalidadePadrao")} />
        </div>
      </div>
      {!temOpcoes && (
        <div className="flex items-center gap-3 flex-wrap">
          {arredondado > 0 ? (
            <BotaoContorno onClick={() => onMudar({ ...prop, investimento: formatarBR(arredondado), mensalidade: prop.mensalidade || precificacao.mensalidadePadrao || "", memoriaCalculo: `${h} h × ${formatarBR(valorHora)} = ${formatarBR(total)}${arredondado !== total ? ` (arredondado: ${formatarBR(arredondado)})` : ""}` })}>
              Calcular implantação: {formatarBR(arredondado)}
            </BotaoContorno>
          ) : (
            <span className="text-xs italic" style={{ color: "var(--tinta-musgo)" }}>Preencha o valor da hora e as horas estimadas.</span>
          )}
        </div>
      )}
      {prop.memoriaCalculo && !temOpcoes && (
        <div className="text-xs mt-2 pt-2 border-t" style={{ color: "var(--tinta-musgo)", borderColor: "var(--fundo-recuo)" }}>
          Memória de cálculo (interna, não sai no PDF): {prop.memoriaCalculo}
        </div>
      )}
    </div>
  );
}

export const CAMPOS_SISTEMA_PARAMS = [
  ["rotulo", "Rótulo interno (opcional)", "Ex.: Kenkyo — reservas v1"],
  ["titulo", "Título da proposta", "Ex.: Sistema de reservas e gestão de salão"],
  ["subtitulo", "Resumo em uma frase (abaixo do título)", "Ex.: Duas formas de organizar o salão por praças e garçons."],
  ["duracao", "Prazo de entrega", "Ex.: 4 a 5 semanas"],
  ["condicoesPagamento", "Condições de pagamento", "50% no aceite e 50% na entrega"],
  ["validade", "Validade da proposta", "15 dias"],
];

const opcaoVazia = (letra) => ({ id: uid(), nome: `Opção ${letra}`, titulo: "", descricao: "", escopo: "", horasEstimadas: "", investimento: "", mensalidade: "", mensalidadeNota: "", prazo: "" });

function EditorOpcao({ opcao, valorHora, mensalidadePadrao, onMudar, onRemover }) {
  const set = (campo) => (v) => onMudar({ ...opcao, [campo]: v });
  const { h, total, arredondado } = calcular(opcao.horasEstimadas, valorHora);
  return (
    <div className="enz-card" style={{ padding: 20, marginBottom: 12 }}>
      <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
        <input className="enz-input" style={{ width: 120, padding: "6px 10px" }} value={opcao.nome} onChange={(e) => set("nome")(e.target.value)} />
        <button onClick={onRemover} className="enz-confirmar">remover opção</button>
      </div>
      <InputField label="Título da opção" value={opcao.titulo} onChange={set("titulo")} placeholder="Sistema próprio completo" />
      <InputField label="Em uma frase" value={opcao.descricao} onChange={set("descricao")} placeholder="Substitui o Tagme e concentra reservas, clientes e salão num só lugar." />
      <label className="block mb-4">
        <span className="enz-rotulo mb-1">Escopo desta opção (um item por linha)</span>
        <textarea rows={5} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: "var(--linha)" }} value={opcao.escopo} onChange={(e) => set("escopo")(e.target.value)} />
      </label>
      <div className="grid sm:grid-cols-4 gap-x-3">
        <InputField label="Horas" value={opcao.horasEstimadas} onChange={set("horasEstimadas")} placeholder="50" />
        <InputField label="Implantação (R$)" value={opcao.investimento} onChange={set("investimento")} placeholder="R$ 6.400" />
        <InputField label="Mensalidade (R$/mês)" value={opcao.mensalidade} onChange={set("mensalidade")} placeholder={mensalidadePadrao || "200"} />
        <InputField label="Prazo" value={opcao.prazo} onChange={set("prazo")} placeholder="4 a 5 semanas" />
      </div>
      <InputField label="Nota da mensalidade (opcional)" value={opcao.mensalidadeNota} onChange={set("mensalidadeNota")} placeholder="Tagme à parte" />
      {arredondado > 0 && (
        <button className="enz-link" onClick={() => onMudar({ ...opcao, investimento: formatarBR(arredondado), mensalidade: opcao.mensalidade || mensalidadePadrao || "" })}>
          calcular: {h} h × {formatarBR(valorHora)} = {formatarBR(arredondado)} →
        </button>
      )}
    </div>
  );
}

export function CamposSistema({ prop, precificacao, onMudar }) {
  const set = (campo) => (v) => onMudar({ ...prop, [campo]: v });
  const opcoes = prop.opcoes || [];
  const valorHora = parseValorBR((precificacao || {}).valorHora);
  const mudarOpcao = (nova) => set("opcoes")(opcoes.map((o) => (o.id === nova.id ? nova : o)));
  return (
    <>
      <div className="grid sm:grid-cols-2 gap-x-4">
        {CAMPOS_SISTEMA_PARAMS.map(([campo, rotulo, placeholder]) => (
          <InputField key={campo} label={rotulo} value={prop[campo] || ""} onChange={set(campo)} placeholder={placeholder} />
        ))}
      </div>

      <div className="mb-6" style={{ paddingTop: 16, borderTop: "1px solid var(--linha)" }}>
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
          <span className="enz-rotulo">Opções (A, B…)</span>
          <button className="enz-link" onClick={() => set("opcoes")([...opcoes, opcaoVazia(String.fromCharCode(65 + opcoes.length))])}>+ opção</button>
        </div>
        <p className="enz-nota" style={{ marginBottom: 12 }}>
          {opcoes.length ? "cada opção vira um card no PDF, com comparativo embaixo. o escopo, valor e mensalidade gerais abaixo ficam de fora." : "sem opções, a proposta usa o escopo, o valor e a mensalidade únicos abaixo. adicione duas ou mais para o cliente escolher."}
        </p>
        {opcoes.map((o) => <EditorOpcao key={o.id} opcao={o} valorHora={valorHora} mensalidadePadrao={(precificacao || {}).mensalidadePadrao} onMudar={mudarOpcao} onRemover={() => set("opcoes")(opcoes.filter((x) => x.id !== o.id))} />)}
        {opcoes.length > 1 && (
          <label className="block mb-4">
            <span className="enz-rotulo mb-1">Linhas extras do comparativo (opcional) — Rótulo | Opção A | Opção B</span>
            <textarea rows={3} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: "var(--linha)" }} value={prop.comparativo || ""} onChange={(e) => set("comparativo")(e.target.value)} placeholder={"Reservas e cadastro de clientes | Sistema próprio | Tagme\nCanais de reserva do Tagme | Deixam de existir | Mantidos"} />
          </label>
        )}
      </div>

      {!opcoes.length && (
        <div className="grid sm:grid-cols-2 gap-x-4">
          <InputField label="Implantação + desenvolvimento (R$)" value={prop.investimento || ""} onChange={set("investimento")} placeholder="R$ 6.400" />
          <InputField label="Mensalidade (R$/mês)" value={prop.mensalidade || ""} onChange={set("mensalidade")} placeholder="200" ajuda="hospedagem, manutenção e pequenas alterações." />
        </div>
      )}

      <label className="block mb-4">
        <span className="enz-rotulo mb-1">Observações para a IA (opcional)</span>
        <textarea rows={2} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: "var(--linha)" }} value={prop.obs || ""} onChange={(e) => set("obs")(e.target.value)} placeholder="Ex.: cliente fundador, mensalidade congelada" />
      </label>
      {[["apresentacao", "Apresentação", 3], ["objetivo", "Objetivo", 2], ...(opcoes.length ? [] : [["entregaveis", "Escopo (um item por linha)", 6]]), ["fases", "Etapas (uma por linha: Etapa — semanas — o que inclui)", 4], ["foraEscopo", "Fora do escopo (um por linha)", 3], ["fornecidoCliente", "Fornecido pelo cliente (um por linha)", 3], ["condicoesGerais", "Condições gerais (uma por linha)", 3]].map(([campo, rotulo, linhas]) => (
        <label key={campo} className="block mb-4">
          <span className="enz-rotulo mb-1">{rotulo}</span>
          <textarea rows={linhas} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: "var(--linha)" }} value={prop[campo] || ""} onChange={(e) => set(campo)(e.target.value)} />
        </label>
      ))}
    </>
  );
}

// ── Impressão

const VERDE = "#1e3226";
const CREME = "#f2eee3";
const OURO = "#b8902f";

function Rotulo({ children, claro }) {
  return <div style={{ fontFamily: "var(--font-body)", fontSize: 9.5, letterSpacing: ".24em", textTransform: "uppercase", fontWeight: 700, color: claro ? "rgba(242,238,227,.75)" : OURO, marginBottom: 6 }}>{children}</div>;
}
const Linha = ({ children }) => <li style={{ display: "flex", gap: 8, marginBottom: 2, fontSize: 11.5, lineHeight: 1.35 }}><span style={{ color: OURO }}>—</span><span>{children}</span></li>;
const Ponto = ({ children }) => <li style={{ display: "flex", gap: 8, marginBottom: 2, fontSize: 11, lineHeight: 1.35 }}><span style={{ color: VERDE, fontSize: 8, lineHeight: "15px" }}>●</span><span style={{ flex: 1 }}>{children}</span></li>;
const Lista = ({ children }) => <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>{children}</ul>;
const valorBR = (v) => (/^\s*R\$/.test(String(v || "")) ? String(v).replace(/,00$/, "") : v ? `R$ ${v}` : "a definir");

function CardOpcao({ opcao }) {
  const itens = linhasPara(opcao.escopo);
  return (
    <div style={{ border: `1px solid #dcd6c6`, borderTop: `3px solid ${VERDE}`, borderRadius: 6, padding: "12px 14px", background: "#ffffff" }}>
      <Rotulo>{opcao.nome}</Rotulo>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 20, lineHeight: 1.15, fontWeight: 500, color: VERDE }}>{opcao.titulo}</div>
      {opcao.descricao && <p style={{ fontSize: 11.5, lineHeight: 1.4, marginTop: 5, color: "#56645a" }}>{opcao.descricao}</p>}
      {itens.length > 0 && <div style={{ marginTop: 10 }}><Lista>{itens.map((i, k) => <Ponto key={k}>{i}</Ponto>)}</Lista></div>}
      <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #dcd6c6" }}>
        <Rotulo>Implantação + desenvolvimento</Rotulo>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 30, lineHeight: 1, fontWeight: 500, color: VERDE }}>{valorBR(opcao.investimento)}</div>
        <div style={{ fontSize: 12, marginTop: 8 }}>
          {opcao.mensalidade && <><strong>{valorBR(opcao.mensalidade)}</strong> por mês{opcao.mensalidadeNota ? `, ${opcao.mensalidadeNota}` : ""}</>}
        </div>
        {opcao.prazo && <div style={{ fontSize: 11, color: "#56645a", marginTop: 4 }}>Entrega em {opcao.prazo}</div>}
      </div>
    </div>
  );
}

function Comparativo({ opcoes, extras }) {
  const linhas = [
    ["Implantação + desenvolvimento", ...opcoes.map((o) => valorBR(o.investimento)), true],
    ["Mensalidade", ...opcoes.map((o) => (o.mensalidade ? `${valorBR(o.mensalidade)}${o.mensalidadeNota ? ` (${o.mensalidadeNota})` : ""}` : "—")), false],
    ...linhasPara(extras).map((l) => [...l.split("|").map((s) => s.trim()), false]),
    ["Prazo", ...opcoes.map((o) => o.prazo || "—"), false],
  ];
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
      <thead>
        <tr>
          <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: `1px solid ${VERDE}` }} />
          {opcoes.map((o) => <th key={o.id} style={{ textAlign: "left", padding: "6px 8px", borderBottom: `1px solid ${VERDE}`, fontSize: 9.5, letterSpacing: ".2em", textTransform: "uppercase", color: OURO }}>{o.nome}</th>)}
        </tr>
      </thead>
      <tbody>
        {linhas.map((l, i) => {
          const forte = l[l.length - 1] === true;
          const celulas = l.slice(0, -1);
          return (
            <tr key={i}>
              {celulas.map((c, j) => <td key={j} style={{ padding: "5px 8px", borderBottom: "1px solid #dcd6c6", fontSize: 11.5, color: j === 0 ? "#56645a" : VERDE, fontWeight: forte && j > 0 ? 700 : 400 }}>{c}</td>)}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function ImpressaoPropostaSistema({ cliente, prop }) {
  const opcoes = prop.opcoes || [];
  const escopo = emLinhasDoc(prop.entregaveis);
  const fora = linhasPara(prop.foraEscopo);
  const fornecido = linhasPara(prop.fornecidoCliente);
  const condicoes = [...(prop.condicoesPagamento ? [`Pagamento: ${prop.condicoesPagamento}`] : []), ...linhasPara(prop.condicoesGerais), ...(prop.validade ? [`Proposta válida por ${prop.validade}`] : [])];
  return (
    <div className="area-impressao hidden print:block p-10" data-marca="ns" style={{ color: VERDE, fontFamily: "var(--font-body)" }}>
      <Rotulo>Proposta comercial</Rotulo>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 28, lineHeight: 1.1, fontWeight: 500, color: VERDE }}>{prop.titulo || "Desenvolvimento de sistema"}</div>
      {prop.subtitulo && <p style={{ fontSize: 12.5, lineHeight: 1.5, marginTop: 8, maxWidth: 560 }}>{prop.subtitulo}</p>}
      {prop.apresentacao && <p style={{ fontSize: 13, lineHeight: 1.55, marginTop: prop.subtitulo ? 8 : 10, whiteSpace: "pre-line" }}>{prop.apresentacao}</p>}
      {prop.objetivo && <p style={{ fontSize: 13, lineHeight: 1.55, marginTop: 8 }}>{prop.objetivo}</p>}

      {opcoes.length > 0 ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(opcoes.length, 3)}, 1fr)`, gap: 12, marginTop: 14 }}>
            {opcoes.map((o) => <CardOpcao key={o.id} opcao={o} />)}
          </div>
          {opcoes.length > 1 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 500, color: VERDE }}>Comparativo</div>
              <Comparativo opcoes={opcoes} extras={prop.comparativo} />
            </div>
          )}
        </>
      ) : (
        <>
          {escopo.length > 0 && (
            <div style={{ border: "1px solid #dcd6c6", borderTop: `3px solid ${VERDE}`, borderRadius: 6, padding: "18px 20px", marginTop: 22, background: "#ffffff" }}>
              <Rotulo>Escopo · {escopo.length} {escopo.length === 1 ? "item" : "itens"}</Rotulo>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 24px" }}>
                {escopo.map((e, i) => <div key={i} style={{ fontSize: 12.5, lineHeight: 1.45, display: "flex", gap: 8 }}><span style={{ color: VERDE, fontSize: 9, lineHeight: "18px" }}>●</span><span>{e}</span></div>)}
              </div>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 22, marginTop: 22, alignItems: "start" }}>
            <div style={{ background: VERDE, color: CREME, borderRadius: 6, padding: "22px 24px" }}>
              <Rotulo claro>Implantação + desenvolvimento</Rotulo>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 40, lineHeight: 1, fontWeight: 500 }}>{valorBR(prop.investimento)}</div>
              {prop.mensalidade && <div style={{ fontSize: 12.5, marginTop: 12 }}>Hospedagem e manutenção: <strong>{valorBR(prop.mensalidade)} por mês</strong></div>}
            </div>
            <div style={{ fontSize: 12.5, lineHeight: 1.55 }}>
              {prop.duracao && <p><strong>Prazo:</strong> {prop.duracao}</p>}
              {prop.mensalidade && <p style={{ marginTop: 8 }}><strong>Mensalidade:</strong> hospedagem, certificado de segurança, backups e pequenas alterações</p>}
            </div>
          </div>
        </>
      )}

      {!opcoes.length && linhasPara(prop.fases).length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 500, color: VERDE, marginBottom: 6 }}>Etapas</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {linhasPara(prop.fases).map((l, i) => {
                const [etapa, semanas, ...resto] = l.split("—").map((x) => x.trim());
                return (
                  <tr key={i}>
                    <td style={{ padding: "5px 8px 5px 0", borderBottom: "1px solid #dcd6c6", fontSize: 11.5, fontWeight: 700, color: VERDE, width: 110 }}>{etapa}</td>
                    <td style={{ padding: "5px 8px", borderBottom: "1px solid #dcd6c6", fontSize: 11.5, color: "#56645a", width: 110 }}>{semanas}</td>
                    <td style={{ padding: "5px 0 5px 8px", borderBottom: "1px solid #dcd6c6", fontSize: 11.5 }}>{resto.join(" — ")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 16 }}>
        {(fornecido.length > 0 || fora.length > 0) && (
          <div>
            {fornecido.length > 0 && (
              <>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 500, color: VERDE, marginBottom: 6 }}>Fornecido pelo cliente</div>
                <Lista>{fornecido.map((e, i) => <Linha key={i}>{e}</Linha>)}</Lista>
              </>
            )}
            {fora.length > 0 && opcoes.length > 0 && (
              <div style={{ marginTop: fornecido.length ? 16 : 0 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 500, color: VERDE, marginBottom: 6 }}>Fora do escopo</div>
                <Lista>{fora.map((e, i) => <Linha key={i}>{e}</Linha>)}</Lista>
              </div>
            )}
          </div>
        )}
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 500, color: VERDE, marginBottom: 6 }}>Condições</div>
          <Lista>
            {condicoes.map((c, i) => <Linha key={i}>{c}</Linha>)}
            {!opcoes.length && fora.length > 0 && <Linha>Fora do escopo: {fora.join(", ")}</Linha>}
          </Lista>
        </div>
      </div>
    </div>
  );
}
