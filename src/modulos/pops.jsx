import { AvisoErro, BotaoContorno, BotaoPrimario, InputField, Trabalhando } from "../componentes/ui.jsx";
import { RodapeImpressao } from "./tabela.jsx";
import { CORES, uid } from "../nucleo/base.jsx";
import { HeaderModulo } from "../telas/hub.jsx";

// ─── Módulo: POPs ───────────────────────────────────────────────

export const CAMPOS_POP = [
  ["objetivo", "Objetivo", 2],
  ["materiais", "Materiais e recursos (um por linha)", 4],
  ["passos", "Passos (um por linha, em ordem)", 8],
  ["atencao", "Pontos de atenção (um por linha)", 3],
  ["frequencia", "Frequência", 1],
  ["responsavel", "Responsável pela execução", 1],
];

export function popVazio() {
  return {
    id: uid(),
    nome: "",
    setor: "",
    obs: "",
    objetivo: "",
    materiais: "",
    passos: "",
    atencao: "",
    frequencia: "",
    responsavel: "",
  };
}

export function ListaPops({ cliente, pops, onAbrirPop, onNovoPop, onVoltar }) {
  return (
    <div className="pb-16">
      <HeaderModulo
        titulo="POPs — Processos Operacionais"
        cliente={cliente}
        onVoltar={onVoltar}
        acoes={<BotaoPrimario onClick={onNovoPop}>+ Novo POP</BotaoPrimario>}
      />
      <div style={{ maxWidth: "1000px", margin: "0 auto", paddingLeft: "32px", paddingRight: "32px" }}>
        {pops.length === 0 ? (
          <div className="text-center py-16 rounded-lg" style={{ background: CORES.papel, border: "1px dashed #7BA85C" }}>
            <p className="text-sm" style={{ color: CORES.textoDim }}>
              Nenhum processo documentado ainda. Crie o primeiro — informe o nome do processo e o setor, e a IA escreve o passo a passo para sua revisão.
            </p>
          </div>
        ) : (
          <div className="grid gap-2">
            {pops.map((p) => (
              <button
                key={p.id}
                onClick={() => onAbrirPop(p.id)}
                className="objeto text-left px-5 py-3 rounded-lg shadow-sm flex items-baseline justify-between"
                className="card"
              >
                <span className="font-serif" style={{ color: CORES.fogo }}>{p.nome || "(sem nome)"}</span>
                <span className="text-xs" style={{ color: CORES.textoDim }}>
                  {p.setor}{p.passos ? "" : " · rascunho vazio"}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function EditorPop({ cliente, pop, gerando, erro, onMudar, onGerar, onImprimir, onExcluir, onVoltar }) {
  const set = (campo) => (v) => onMudar({ ...pop, [campo]: v });
  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: CORES.douradoEscuro, letterSpacing: 1, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "'Lora', serif" }}>
        ← POPs · {cliente.negocio}
      </button>
      <div className="rounded-lg p-6 shadow-sm card">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h2 className="font-serif text-lg" style={{ color: CORES.fogo }}>
            {pop.nome || "Novo POP"}
          </h2>
          <div className="flex gap-2">
            <BotaoPrimario onClick={onGerar} disabled={gerando || !pop.nome.trim()}>
              {gerando ? "Gerando..." : pop.passos ? "Gerar novamente" : "Gerar com IA"}
            </BotaoPrimario>
            {pop.passos && <BotaoContorno onClick={onImprimir}>Exportar PDF</BotaoContorno>}
          </div>
        </div>

        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && (
          <>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <InputField label="Nome do processo" value={pop.nome} onChange={set("nome")} placeholder="Ex.: Abertura do salão" />
              <InputField label="Setor" value={pop.setor} onChange={set("setor")} placeholder="Ex.: Salão" />
            </div>
            <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Observações para a IA (opcional)</span><textarea rows={2} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} placeholder="Ex.: o processo inclui conferir o caixa e ligar os equipamentos da cozinha" value={pop.obs} onChange={(e) => set("obs")(e.target.value)} /></label>
            {CAMPOS_POP.map(([campo, rotulo, linhas]) => (
              <label key={campo} className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>{rotulo}</span><textarea rows={linhas} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} value={pop[campo]} onChange={(e) => set(campo)(e.target.value)} /></label>
            ))}
            <button onClick={onExcluir} className="text-xs underline" style={{ color: "#8A3A2E" }}>
              Excluir POP
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function ImpressaoPop({ cliente, pop }) {
  if (!pop || !pop.passos) return null;
  const emLinhas = (t) => (t || "").split("\n").map((x) => x.trim()).filter(Boolean);
  const materiais = emLinhas(pop.materiais);
  const passos = emLinhas(pop.passos);
  const atencao = emLinhas(pop.atencao);

  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "#2A1218" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="text-xs uppercase tracking-widest" style={{ color: CORES.dourado }}>Procedimento Operacional Padrão</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{pop.nome}</div>
        <div className="text-sm mt-1" style={{ color: "#6B5D42" }}>
          {cliente.negocio}{pop.setor ? ` · Setor: ${pop.setor}` : ""}
        </div>
      </div>

      <div className="overflow-x-auto"><table className="w-full text-sm border-collapse mb-6">
        <tbody>
          {pop.responsavel && (
            <tr>
              <td className="border px-3 py-1 font-semibold w-40" style={{ borderColor: CORES.laranja, color: CORES.fogo }}>Responsável</td>
              <td className="border px-3 py-1" style={{ borderColor: CORES.laranja }}>{pop.responsavel}</td>
            </tr>
          )}
          {pop.frequencia && (
            <tr>
              <td className="border px-3 py-1 font-semibold" style={{ borderColor: CORES.laranja, color: CORES.fogo }}>Frequência</td>
              <td className="border px-3 py-1" style={{ borderColor: CORES.laranja }}>{pop.frequencia}</td>
            </tr>
          )}
        </tbody>
      </table></div>

      {pop.objetivo && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Objetivo</div>
          <p className="text-sm">{pop.objetivo}</p>
        </div>
      )}

      {materiais.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Materiais e recursos</div>
          <ul className="text-sm list-disc pl-5">
            {materiais.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </div>
      )}

      {passos.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Passo a passo</div>
          <ol className="text-sm list-decimal pl-5">
            {passos.map((p, i) => <li key={i} className="mb-0.5">{p}</li>)}
          </ol>
        </div>
      )}

      {atencao.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.dourado }}>Pontos de atenção</div>
          <ul className="text-sm list-disc pl-5">
            {atencao.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}

      <RodapeImpressao />
    </div>
  );
}
