import { AvisoErro, BotaoContorno, BotaoPrimario, InputField, Trabalhando } from "../componentes/ui.jsx";
import { RodapeImpressao } from "./tabela.jsx";
import { CORES, uid } from "../nucleo/base.jsx";
import { HeaderModulo } from "../telas/hub.jsx";

// ─── Módulo: Descrições de Cargo ────────────────────────────────

export const CAMPOS_CARGO = [
  ["sumaria", "Descrição sumária", 3],
  ["atividades", "Atividades (uma por linha)", 8],
  ["requisitos", "Requisitos", 3],
  ["condicoes", "Condições de trabalho", 3],
  ["supervisao", "Supervisão", 2],
  ["patrimonio", "Patrimônio sob responsabilidade", 2],
  ["confidenciais", "Informações confidenciais", 2],
];

export function cargoVazio() {
  return {
    id: uid(),
    nome: "",
    setor: "",
    obs: "",
    sumaria: "",
    atividades: "",
    requisitos: "",
    condicoes: "",
    supervisao: "",
    patrimonio: "",
    confidenciais: "",
  };
}

export function ListaCargos({ cliente, cargos, onAbrirCargo, onNovoCargo, onVoltar }) {
  return (
    <div className="pb-16">
      <HeaderModulo
        titulo="Descrições de Cargo"
        cliente={cliente}
        onVoltar={onVoltar}
        acoes={<BotaoPrimario onClick={onNovoCargo}>+ Novo cargo</BotaoPrimario>}
      />
      <div style={{ maxWidth: "1000px", margin: "0 auto", paddingLeft: "32px", paddingRight: "32px" }}>
      {cargos.length === 0 ? (
        <div className="text-center py-16 rounded-lg" style={{ background: CORES.papel, border: "1px dashed #7BA85C" }}>
          <p className="text-sm" style={{ color: CORES.textoDim }}>
            Nenhum cargo cadastrado. Crie o primeiro — informe nome e setor, e a IA escreve a descrição completa para sua revisão.
          </p>
        </div>
      ) : (
        <div className="grid gap-2">
          {cargos.map((cg) => (
            <button
              key={cg.id}
              onClick={() => onAbrirCargo(cg.id)}
              className="objeto text-left px-5 py-3 rounded-lg shadow-sm flex items-baseline justify-between"
              className="card"
            >
              <span className="font-serif" style={{ color: CORES.fogo }}>{cg.nome || "(sem nome)"}</span>
              <span className="text-xs" style={{ color: CORES.textoDim }}>
                {cg.setor}{cg.sumaria ? "" : " · rascunho vazio"}
              </span>
            </button>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

export function EditorCargo({ cliente, cargo, gerando, erro, onMudar, onGerar, onImprimir, onExcluir, onVoltar }) {
  const set = (campo) => (v) => onMudar({ ...cargo, [campo]: v });
  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: CORES.douradoEscuro, letterSpacing: 1, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "'Lora', serif" }}>
        ← Descrições de Cargo · {cliente.negocio}
      </button>
      <div className="rounded-lg p-6 shadow-sm card">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h2 className="font-serif text-lg" style={{ color: CORES.fogo }}>
            {cargo.nome || "Novo cargo"}
          </h2>
          <div className="flex gap-2">
            <BotaoPrimario onClick={onGerar} disabled={gerando || !cargo.nome.trim()}>
              {gerando ? "Gerando..." : cargo.sumaria ? "Gerar novamente" : "Gerar com IA"}
            </BotaoPrimario>
            {cargo.sumaria && <BotaoContorno onClick={onImprimir}>Exportar PDF</BotaoContorno>}
          </div>
        </div>

        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && (
          <>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <InputField label="Nome do cargo" value={cargo.nome} onChange={set("nome")} placeholder="Ex.: Chefe de Cozinha" />
              <InputField label="Setor" value={cargo.setor} onChange={set("setor")} placeholder="Ex.: Cozinha" />
            </div>
            <label className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>Observações para a IA (opcional)</span><textarea rows={2} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} placeholder="Ex.: responde ao gerente da unidade; supervisiona 2 auxiliares" value={cargo.obs} onChange={(e) => set("obs")(e.target.value)} /></label>
            {CAMPOS_CARGO.map(([campo, rotulo, linhas]) => (
              <label key={campo} className="block mb-4"><span className="block text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: CORES.dourado }}>{rotulo}</span><textarea rows={linhas} className="w-full px-3 py-2 rounded border bg-creme text-sm" style={{ borderColor: CORES.laranja, color: CORES.fogoEscuro }} value={cargo[campo]} onChange={(e) => set(campo)(e.target.value)} /></label>
            ))}
            <button onClick={onExcluir} className="text-xs underline" style={{ color: "#8A3A2E" }}>
              Excluir cargo
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function ImpressaoCargo({ cliente, cargo }) {
  if (!cargo || !cargo.sumaria) return null;
  const secoes = [
    ["Descrição sumária", cargo.sumaria],
    ["Requisitos", cargo.requisitos],
    ["Condições de trabalho", cargo.condicoes],
    ["Supervisão", cargo.supervisao],
    ["Patrimônio sob responsabilidade", cargo.patrimonio],
    ["Informações confidenciais", cargo.confidenciais],
  ].filter(([, v]) => v && v.trim());
  const atividades = (cargo.atividades || "").split("\n").map((a) => a.trim()).filter(Boolean);

  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "#2A1218" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="text-xs uppercase tracking-widest" style={{ color: CORES.dourado }}>Descrição de Cargo</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{cargo.nome}</div>
        <div className="text-sm mt-1" style={{ color: "#6B5D42" }}>
          {cliente.negocio}{cargo.setor ? ` · Setor: ${cargo.setor}` : ""}
        </div>
      </div>

      {secoes.slice(0, 1).map(([titulo, texto]) => (
        <div key={titulo} className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>{titulo}</div>
          <p className="text-sm">{texto}</p>
        </div>
      ))}

      {atividades.length > 0 && (
        <div className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>Atividades</div>
          <ul className="text-sm list-disc pl-5">
            {atividades.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {secoes.slice(1).map(([titulo, texto]) => (
        <div key={titulo} className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>{titulo}</div>
          <p className="text-sm">{texto}</p>
        </div>
      ))}

      <RodapeImpressao />
    </div>
  );
}
