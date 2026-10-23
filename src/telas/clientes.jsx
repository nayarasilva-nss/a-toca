import { useState } from "react";
import { TituloSecao } from "../componentes/enraizar.jsx";
import { InputField, BotaoPrimario, BotaoContorno, ConfirmarAcao } from "../componentes/ui.jsx";
import { FOCOS_MENTORIA } from "../nucleo/focos.jsx";
import { unidadeVazia } from "../nucleo/sistemas.js";

const SERVICOS_PADRAO = { empresa: { consultoria: true, mentoria: false, treinamentos: false, sistemas: false }, pessoa: { consultoria: false, mentoria: true, treinamentos: false, sistemas: false } };

function Area({ label, value, onChange, placeholder, ajuda }) {
  return (
    <div className="enz-campo">
      <label className="enz-rotulo">{label}</label>
      <textarea className="enz-input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ minHeight: 110, resize: "vertical" }} />
      {ajuda && <div className="enz-ajuda">{ajuda}</div>}
    </div>
  );
}

export function FormCliente({ inicial, prefill, onSalvar, onCancelar, onExcluir }) {
  const [c, setC] = useState(
    inicial
      ? { tipo: "empresa", servicos: SERVICOS_PADRAO[inicial.tipo || "empresa"], ...inicial }
      : { tipo: "empresa", negocio: "", segmento: "", setores: "", regras: "", contexto: "", servicos: SERVICOS_PADRAO.empresa, ...(prefill || {}) }
  );
  const set = (campo) => (v) => setC({ ...c, [campo]: v });
  const ehPessoa = c.tipo === "pessoa";
  const servicos = { ...SERVICOS_PADRAO[c.tipo], ...(c.servicos || {}) };
  const valido = c.negocio.trim() && c.segmento.trim();

  // as trilhas seguem o tipo: pessoa é sempre mentoria; empresa é consultoria e/ou treinamentos, com mentoria do dono opcional
  const definirTipo = (tipo) => {
    if (tipo === c.tipo) return;
    setC({ ...c, tipo, servicos: { ...SERVICOS_PADRAO[tipo], treinamentos: servicos.treinamentos } });
  };
  const alternarServico = (chave) => {
    if (ehPessoa && chave === "mentoria") return;
    setC({ ...c, servicos: { ...servicos, [chave]: !servicos[chave] } });
  };

  const trilhas = ehPessoa
    ? [["mentoria", "Mentoria", "a jornada de encontros — sempre"], ["treinamentos", "Treinamentos", "turmas avulsas"]]
    : [["consultoria", "Consultoria", "frentes, processos, governança"], ["sistemas", "Sistemas", "desenvolvimento de sistema personalizado"], ["treinamentos", "Treinamentos", "dentro de uma frente ou avulsos"], ["mentoria", "Mentoria do dono", "encontros com quem contrata"]];

  return (
    <div className="enz-container" style={{ maxWidth: 720 }}>
      <TituloSecao
        rotulo={inicial ? "Editar cliente" : "Novo cliente"}
        titulo={inicial ? c.negocio || "Editar cliente" : "Quem vamos enraizar?"}
        virada={inicial ? "Atualize o que mudou." : prefill ? "Veio pelo site. Confira a trilha e o que a pessoa contou." : "Comece pelo básico. O resto nasce da Escuta."}
      />

      <div className="enz-campo" style={{ marginTop: 40 }}>
        <span className="enz-rotulo" style={{ marginBottom: 12 }}>Tipo de cliente</span>
        <div className="flex gap-3 flex-wrap">
          <BotaoContorno ativo={!ehPessoa} onClick={() => definirTipo("empresa")}>Empresa</BotaoContorno>
          <BotaoContorno ativo={ehPessoa} onClick={() => definirTipo("pessoa")}>Pessoa · mentorado</BotaoContorno>
        </div>
      </div>

      <InputField label={ehPessoa ? "Nome da pessoa" : "Nome do negócio"} value={c.negocio} onChange={set("negocio")} placeholder={ehPessoa ? "Marina Costa" : "Caverna do Cheff"} />
      <InputField label={ehPessoa ? "Atuação" : "Segmento"} value={c.segmento} onChange={set("segmento")} placeholder={ehPessoa ? "analista financeira — em busca de novo rumo" : "Restaurante — hamburgueria artesanal"} ajuda={ehPessoa ? "o que faz hoje, em poucas palavras." : undefined} />
      {!ehPessoa && <InputField label="Setores e áreas" value={c.setores} onChange={set("setores")} placeholder="Salão, Cozinha, Delivery, Estoque" />}
      {!ehPessoa && <Area label="Regras próprias da casa" value={c.regras} onChange={set("regras")} placeholder="celular proibido na operação; uniforme completo obrigatório" />}
      <Area
        label={ehPessoa ? "Contexto e objetivos" : "Contexto e dores relatadas"}
        value={c.contexto}
        onChange={set("contexto")}
        placeholder={ehPessoa ? "o que a trouxe até aqui: uma decisão a tomar, um hábito a mudar, um time a conduzir" : "atrasos recorrentes, desperdício de insumos"}
        ajuda={ehPessoa ? "por que buscou a mentoria." : undefined}
      />

      {ehPessoa && !inicial && (
        <div className="enz-campo">
          <span className="enz-rotulo" style={{ marginBottom: 12 }}>Foco da jornada</span>
          <div className="flex gap-3 flex-wrap">
            {Object.entries(FOCOS_MENTORIA).map(([chave, meta]) => (
              <BotaoContorno key={chave} ativo={c.focoMentoria === chave} onClick={() => setC({ ...c, focoMentoria: c.focoMentoria === chave ? "" : chave })}>{meta.rotulo}</BotaoContorno>
            ))}
          </div>
          <div className="enz-ajuda">{c.focoMentoria ? FOCOS_MENTORIA[c.focoMentoria].nota : "opcional agora: dá para definir depois, em Mentoria. nenhum foco é padrão."}</div>
        </div>
      )}

      {!ehPessoa && (
        <div className="enz-campo">
          <span className="enz-rotulo" style={{ marginBottom: 6 }}>Unidades (CNPJs)</span>
          <div className="enz-ajuda" style={{ marginTop: 0, marginBottom: 10 }}>só para quem tem mais de um CNPJ: cada sistema pode cobrar a mensalidade por unidade, e a cobrança vai no WhatsApp de cada uma.</div>
          {(c.unidades || []).map((u, i) => {
            const mudar = (campo) => (e) => setC({ ...c, unidades: c.unidades.map((x, k) => (k === i ? { ...x, [campo]: e.target.value } : x)) });
            return (
              <div key={u.id} className="grid gap-2 sm:grid-cols-5" style={{ marginBottom: 8, alignItems: "center" }}>
                <input className="enz-input" placeholder="nome da unidade" value={u.nome} onChange={mudar("nome")} />
                <input className="enz-input" placeholder="CNPJ" value={u.cnpj} onChange={mudar("cnpj")} />
                <input className="enz-input" placeholder="WhatsApp da unidade" value={u.whatsapp} onChange={mudar("whatsapp")} />
                <input className="enz-input" placeholder="quem recebe a cobrança" value={u.contato} onChange={mudar("contato")} />
                <button type="button" className="enz-link" onClick={() => setC({ ...c, unidades: c.unidades.filter((_, k) => k !== i) })}>remover</button>
              </div>
            );
          })}
          <button type="button" className="enz-link" onClick={() => setC({ ...c, unidades: [...(c.unidades || []), unidadeVazia()] })}>+ unidade</button>
        </div>
      )}

      <div className="enz-campo">
        <span className="enz-rotulo" style={{ marginBottom: 12 }}>Trilhas contratadas</span>
        <div className="flex gap-3 flex-wrap">
          {trilhas.map(([chave, rotulo]) => (
            <BotaoContorno key={chave} ativo={!!servicos[chave]} disabled={ehPessoa && chave === "mentoria"} onClick={() => alternarServico(chave)}>
              {rotulo}
            </BotaoContorno>
          ))}
        </div>
        <div className="enz-ajuda">{trilhas.filter(([k]) => servicos[k]).map(([, r, nota]) => `${r.toLowerCase()}: ${nota}`).join(" · ") || "escolha ao menos uma trilha."}</div>
      </div>

      <div className="flex items-center gap-4 flex-wrap" style={{ marginTop: 8 }}>
        <BotaoPrimario onClick={() => valido && onSalvar({ ...c, servicos })} disabled={!valido}>{inicial ? "Salvar" : "Criar cliente"}</BotaoPrimario>
        <button onClick={onCancelar} className="enz-link">cancelar</button>
      </div>

      {inicial && onExcluir && (
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--linha)" }}>
          <ConfirmarAcao rotulo="Excluir este cliente" aviso="isso apaga documentos, planos, atas e histórico deste cliente para sempre" onConfirmar={onExcluir} />
        </div>
      )}
    </div>
  );
}
