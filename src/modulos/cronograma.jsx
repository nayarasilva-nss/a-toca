import { AvisoErro, BotaoContorno, BotaoPrimario, InputField, Trabalhando } from "../componentes/ui.jsx";
import { acoesNumeradas, intervaloSemana, semanaAtualDe } from "../ia/cronograma.jsx";
import { RodapeImpressao } from "./tabela.jsx";
import { CORES } from "../nucleo/base.jsx";

// ─── Módulo: Cronograma ─────────────────────────────────────────

export function ModuloCronograma({ cliente, gestao, gerando, erro, onMudar, onDistribuir, onImprimir, onVoltar }) {
  const frentes = gestao.frentes || [];
  const duracao = Number(gestao.duracaoSemanas) || 0;
  const semAtual = semanaAtualDe(gestao.inicio, duracao);
  const todas = acoesNumeradas(frentes);
  const comSemana = todas.filter((x) => x.acao.semana);
  const semSemana = todas.filter((x) => !x.acao.semana);
  const atrasadas = semAtual
    ? comSemana.filter((x) => !x.acao.feita && x.acao.semana < semAtual)
    : [];

  const marcarFeita = (frenteId, acaoId, feita) => {
    onMudar({
      ...gestao,
      frentes: frentes.map((f) =>
        f.id === frenteId ? { ...f, acoes: f.acoes.map((a) => (a.id === acaoId ? { ...a, feita } : a)) } : f
      ),
    });
  };

  const semanas = [];
  const maxSemana = Math.max(duracao, ...comSemana.map((x) => x.acao.semana), 0);
  for (let w = 1; w <= maxSemana; w++) semanas.push(w);

  return (
    <div className="max-w-3xl mx-auto mt-8 px-6 pb-16">
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: CORES.douradoEscuro, letterSpacing: 1, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-body)" }}>
        ← {cliente.negocio}
      </button>
      <div className="rounded-lg p-6 shadow-sm card">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h2 className="font-serif text-lg" style={{ color: CORES.fogo }}>Cronograma</h2>
          <div className="flex gap-2 flex-wrap">
            <BotaoPrimario onClick={onDistribuir} disabled={gerando || todas.length === 0}>
              {gerando ? "Distribuindo..." : "Distribuir ações com IA"}
            </BotaoPrimario>
            {comSemana.length > 0 && <BotaoContorno onClick={onImprimir}>Exportar PDF</BotaoContorno>}
          </div>
        </div>
        <p className="text-xs mb-4" style={{ color: CORES.textoDim }}>
          Linha do tempo do engajamento: onde cada ação está no tempo — e a semana em que os pés deveriam estar agora.
        </p>

        <div className="grid sm:grid-cols-2 gap-x-4">
          <InputField
            label="Início do engajamento (dd/mm/aaaa)"
            value={gestao.inicio || ""}
            onChange={(v) => onMudar({ ...gestao, inicio: v })}
            placeholder="Ex.: 04/08/2026"
          />
          <InputField
            label="Duração (semanas)"
            value={gestao.duracaoSemanas || ""}
            onChange={(v) => onMudar({ ...gestao, duracaoSemanas: v })}
            placeholder="Ex.: 10"
          />
        </div>

        {semAtual !== null && (
          <div className="mb-4 text-sm" style={{ color: CORES.fogoEscuro }}>
            {semAtual === 0
              ? "O engajamento ainda não começou."
              : duracao > 0 && semAtual > duracao
                ? `Prazo original encerrado (${duracao} semanas).`
                : <>Estamos na <strong>semana {semAtual}</strong>{duracao ? ` de ${duracao}` : ""}.</>}
          </div>
        )}

        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && todas.length === 0 && (
          <p className="text-sm py-4" style={{ color: CORES.textoDim }}>
            Nenhuma ação no plano ainda. Gere o plano de ação no Briefing primeiro — depois volte aqui pra distribuir no tempo.
          </p>
        )}

        {!gerando && atrasadas.length > 0 && (
          <div className="mb-5 p-4 rounded-lg" style={{ background: "var(--erro-fundo)" }}>
            <div className="text-sm font-semibold mb-2" style={{ color: "var(--erro)" }}>
              Atrasadas ({atrasadas.length})
            </div>
            {atrasadas.map((x) => (
              <label key={x.acao.id} className="flex items-start gap-2 py-1 text-sm cursor-pointer" style={{ color: "var(--erro)" }}>
                <input type="checkbox" className="mt-1" checked={false} onChange={() => marcarFeita(x.frenteId, x.acao.id, true)} />
                <span>
                  <span className="text-xs font-semibold uppercase tracking-wider mr-1">[sem. {x.acao.semana} · {x.frenteNome}]</span>
                  {x.acao.texto}
                </span>
              </label>
            ))}
          </div>
        )}

        {!gerando &&
          semanas.map((w) => {
            const doW = comSemana.filter((x) => x.acao.semana === w);
            const ehAtual = semAtual === w;
            if (doW.length === 0 && !ehAtual) return null;
            return (
              <div
                key={w}
                className="mb-3 p-3 rounded-lg"
                style={{
                  background: ehAtual ? CORES.hover : "white",
                  border: `1px solid ${ehAtual ? CORES.dourado : "var(--linha)"}`,
                }}
              >
                <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: ehAtual ? CORES.dourado : "var(--tinta-musgo)" }}>
                  Semana {w}{intervaloSemana(gestao.inicio, w) ? ` · ${intervaloSemana(gestao.inicio, w)}` : ""}{ehAtual ? " · atual" : ""}
                </div>
                {doW.length === 0 ? (
                  <div className="text-xs italic" style={{ color: "var(--tinta-musgo)" }}>Sem ações planejadas.</div>
                ) : (
                  doW.map((x) => (
                    <label key={x.acao.id} className="flex items-start gap-2 py-1 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={!!x.acao.feita}
                        onChange={(e) => marcarFeita(x.frenteId, x.acao.id, e.target.checked)}
                      />
                      <span style={{ color: x.acao.feita ? "var(--tinta-musgo)" : CORES.fogoEscuro, textDecoration: x.acao.feita ? "line-through" : "none" }}>
                        <span className="text-xs font-semibold mr-1" style={{ color: CORES.dourado }}>[{x.frenteNome}]</span>
                        {x.acao.texto}
                        {x.acao.responsavel && (
                          <span className="text-xs ml-1" style={{ color: "var(--tinta-musgo)" }}>· @{x.acao.responsavel}</span>
                        )}
                      </span>
                    </label>
                  ))
                )}
              </div>
            );
          })}

        {!gerando && semSemana.length > 0 && (
          <div className="mt-4 text-xs" style={{ color: "var(--tinta-musgo)" }}>
            {semSemana.length} aç{semSemana.length > 1 ? "ões" : "ão"} sem semana definida — atribua no Briefing (campo "sem.") ou use a distribuição por IA.
          </div>
        )}
      </div>
    </div>
  );
}

export function ImpressaoCronograma({ cliente, gestao }) {
  const frentes = gestao.frentes || [];
  const comSemana = acoesNumeradas(frentes).filter((x) => x.acao.semana);
  if (comSemana.length === 0) return null;
  const maxSemana = Math.max(...comSemana.map((x) => x.acao.semana));
  const semanas = [];
  for (let w = 1; w <= maxSemana; w++) semanas.push(w);
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "var(--tinta)" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="text-xs uppercase tracking-widest" style={{ color: CORES.dourado }}>Cronograma do Engajamento</div>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>{cliente.negocio}</div>
        <div className="text-sm mt-1" style={{ color: "var(--tinta)" }}>
          {gestao.inicio ? `Início: ${gestao.inicio}` : ""}
          {gestao.duracaoSemanas ? ` · Duração: ${gestao.duracaoSemanas} semanas` : ""}
        </div>
      </div>
      {semanas.map((w) => {
        const doW = comSemana.filter((x) => x.acao.semana === w);
        if (doW.length === 0) return null;
        return (
          <div key={w} className="mb-4">
            <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>
              Semana {w}{intervaloSemana(gestao.inicio, w) ? ` · ${intervaloSemana(gestao.inicio, w)}` : ""}
            </div>
            <div className="overflow-x-auto"><table className="w-full text-sm border-collapse">
              <tbody>
                {doW.map((x) => (
                  <tr key={x.acao.id}>
                    <td className="border px-3 py-1 w-44 font-semibold" style={{ borderColor: CORES.laranja, color: CORES.dourado }}>{x.frenteNome}</td>
                    <td className="border px-3 py-1" style={{ borderColor: CORES.laranja }}>
                      {x.acao.texto}
                      {x.acao.porque && <div className="text-xs italic" style={{ color: "var(--tinta)" }}>{x.acao.porque}</div>}
                    </td>
                    <td className="border px-3 py-1 w-32" style={{ borderColor: CORES.laranja }}>{x.acao.responsavel || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </div>
        );
      })}
      <RodapeImpressao />
    </div>
  );
}
