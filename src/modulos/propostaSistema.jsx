import { BotaoContorno, InputField } from "../componentes/ui.jsx";
import { formatarBR, parseValorBR } from "../ia/financeiro.jsx";
import { emLinhasDoc } from "./documentos.jsx";
import { linhasPara } from "./sistema.jsx";

// Proposta de desenvolvimento de sistema: precificada por hora, com mensalidade à parte.

export function PainelPrecoSistema({ prop, precificacao, onMudar, onMudarPrecificacao }) {
  const valorHora = parseValorBR(precificacao.valorHora);
  const horas = Number(String(prop.horasEstimadas || "").replace(",", ".")) || 0;
  const total = horas * valorHora;
  const arredondado = total > 0 ? Math.ceil(total / 100) * 100 : 0;
  const setP = (campo) => (e) => onMudarPrecificacao({ ...precificacao, [campo]: e.target.value });
  return (
    <div className="mb-4 rounded-lg p-4" style={{ background: "var(--fundo-elevado)", border: "1px solid var(--linha)" }}>
      <div className="enz-rotulo mb-1">Precificação por hora</div>
      <p className="text-xs mb-3" style={{ color: "var(--tinta-musgo)" }}>
        Seu valor/hora vale para todos os sistemas; as horas são estimadas por projeto. A mensalidade cobre hospedagem, manutenção e pequenas alterações — não entra na implantação.
      </p>
      <div className="grid sm:grid-cols-3 gap-2 mb-2">
        <div>
          <div className="text-xs mb-0.5">Valor da sua hora (R$)</div>
          <input className="w-full px-2 py-1 text-sm rounded border bg-creme" style={{ borderColor: "var(--linha)" }} placeholder="Ex.: 120" value={precificacao.valorHora || ""} onChange={setP("valorHora")} />
        </div>
        <div>
          <div className="text-xs mb-0.5">Horas estimadas neste projeto</div>
          <input className="w-full px-2 py-1 text-sm rounded border bg-creme" style={{ borderColor: "var(--linha)" }} placeholder="Ex.: 50" value={prop.horasEstimadas || ""} onChange={(e) => onMudar({ ...prop, horasEstimadas: e.target.value })} />
        </div>
        <div>
          <div className="text-xs mb-0.5">Mensalidade padrão (R$/mês)</div>
          <input className="w-full px-2 py-1 text-sm rounded border bg-creme" style={{ borderColor: "var(--linha)" }} placeholder="Ex.: 100" value={precificacao.mensalidadePadrao || ""} onChange={setP("mensalidadePadrao")} />
        </div>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        {arredondado > 0 ? (
          <BotaoContorno
            onClick={() =>
              onMudar({
                ...prop,
                investimento: formatarBR(arredondado),
                mensalidade: prop.mensalidade || precificacao.mensalidadePadrao || "",
                memoriaCalculo: `${horas} h × ${formatarBR(valorHora)} = ${formatarBR(total)}${arredondado !== total ? ` (arredondado: ${formatarBR(arredondado)})` : ""}`,
              })
            }
          >
            Calcular implantação: {formatarBR(arredondado)}
          </BotaoContorno>
        ) : (
          <span className="text-xs italic" style={{ color: "var(--tinta-musgo)" }}>Preencha o valor da hora e as horas estimadas.</span>
        )}
      </div>
      {prop.memoriaCalculo && (
        <div className="text-xs mt-2 pt-2 border-t" style={{ color: "var(--tinta-musgo)", borderColor: "var(--fundo-recuo)" }}>
          Memória de cálculo (interna, não sai no PDF): {prop.memoriaCalculo}
        </div>
      )}
    </div>
  );
}

export const CAMPOS_SISTEMA_PARAMS = [
  ["rotulo", "Rótulo interno (opcional)", "Ex.: Opção A — sistema completo"],
  ["titulo", "Título da proposta", "Ex.: Sistema de reservas e gestão de salão"],
  ["investimento", "Implantação + desenvolvimento (R$)", "Ex.: R$ 6.400"],
  ["mensalidade", "Mensalidade (R$/mês)", "Ex.: 200"],
  ["duracao", "Prazo de entrega", "Ex.: 4 a 5 semanas"],
  ["condicoesPagamento", "Condições de pagamento", "50% no aceite e 50% na entrega"],
  ["validade", "Validade da proposta", "15 dias"],
];

export function CamposSistema({ prop, onMudar }) {
  const set = (campo) => (v) => onMudar({ ...prop, [campo]: v });
  return (
    <>
      <div className="grid sm:grid-cols-2 gap-x-4">
        {CAMPOS_SISTEMA_PARAMS.map(([campo, rotulo, placeholder]) => (
          <InputField key={campo} label={rotulo} value={prop[campo] || ""} onChange={set(campo)} placeholder={placeholder} />
        ))}
      </div>
      <label className="block mb-4">
        <span className="enz-rotulo mb-1">Observações para a IA (opcional)</span>
        <textarea rows={2} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: "var(--linha)" }} value={prop.obs || ""} onChange={(e) => set("obs")(e.target.value)} placeholder="Ex.: cliente fundador, mensalidade congelada; duas opções (A e B)" />
      </label>
      {[["apresentacao", "Apresentação", 3], ["objetivo", "Objetivo", 2], ["entregaveis", "Escopo (um item por linha)", 6], ["foraEscopo", "Fora do escopo (um por linha)", 3], ["fornecidoCliente", "Fornecido pelo cliente (um por linha)", 3], ["condicoesGerais", "Condições gerais", 3]].map(([campo, rotulo, linhas]) => (
        <label key={campo} className="block mb-4">
          <span className="enz-rotulo mb-1">{rotulo}</span>
          <textarea rows={linhas} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: "var(--linha)" }} value={prop[campo] || ""} onChange={(e) => set(campo)(e.target.value)} />
        </label>
      ))}
    </>
  );
}

function Bloco({ titulo, children }) {
  return (
    <div className="mb-5">
      <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: "var(--ouro-texto)" }}>{titulo}</div>
      {children}
    </div>
  );
}

export function ImpressaoPropostaSistema({ cliente, prop }) {
  const escopo = emLinhasDoc(prop.entregaveis);
  const fora = linhasPara(prop.foraEscopo);
  const fornecido = linhasPara(prop.fornecidoCliente);
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "var(--tinta)" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: "var(--ouro)" }}>
        <div className="enz-rotulo">Proposta comercial · Soluções personalizadas para negócios</div>
        <div className="text-3xl font-serif">{prop.titulo || "Desenvolvimento de sistema"}</div>
        <div className="text-sm mt-1">Para {cliente.negocio} · {prop.data}{prop.validade ? ` · válida por ${prop.validade}` : ""}</div>
      </div>

      {prop.apresentacao && <Bloco titulo="Apresentação"><p className="text-sm whitespace-pre-line">{prop.apresentacao}</p></Bloco>}
      {prop.objetivo && <Bloco titulo="Objetivo"><p className="text-sm">{prop.objetivo}</p></Bloco>}

      {escopo.length > 0 && (
        <Bloco titulo="Escopo">
          <ul className="text-sm list-disc pl-5">{escopo.map((e, i) => <li key={i}>{e}</li>)}</ul>
        </Bloco>
      )}

      <Bloco titulo="Implantação + desenvolvimento">
        <div className="text-3xl font-serif" style={{ color: "var(--tinta)" }}>{prop.investimento || "a definir"}</div>
        <div className="text-sm mt-1">
          {prop.mensalidade ? <><strong>R$ {prop.mensalidade}</strong> por mês — hospedagem, manutenção e pequenas alterações. </> : null}
          {prop.duracao ? <>Entrega em {prop.duracao}.</> : null}
        </div>
      </Bloco>

      <div className="grid grid-cols-2 gap-8">
        {fora.length > 0 && (
          <Bloco titulo="Fora do escopo">
            <ul className="text-sm" style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>{fora.map((e, i) => <li key={i}>— {e}</li>)}</ul>
          </Bloco>
        )}
        {fornecido.length > 0 && (
          <Bloco titulo="Fornecido pelo cliente">
            <ul className="text-sm" style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>{fornecido.map((e, i) => <li key={i}>— {e}</li>)}</ul>
          </Bloco>
        )}
      </div>

      <Bloco titulo="Condições">
        <ul className="text-sm" style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
          {prop.condicoesPagamento && <li>— Pagamento: {prop.condicoesPagamento}</li>}
          {linhasPara(prop.condicoesGerais).map((c, i) => <li key={i}>— {c}</li>)}
          {prop.validade && <li>— Proposta válida por {prop.validade}</li>}
        </ul>
      </Bloco>

      <div className="mt-10 pt-6 text-sm">
        <div className="flex gap-16">
          <div className="flex-1 border-t pt-1 text-center" style={{ borderColor: "var(--tinta)" }}>Nayara Silva</div>
          <div className="flex-1 border-t pt-1 text-center" style={{ borderColor: "var(--tinta)" }}>{cliente.negocio}</div>
        </div>
      </div>
    </div>
  );
}
