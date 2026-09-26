import { AvisoErro, BotaoContorno, BotaoPrimario, Trabalhando } from "../componentes/ui.jsx";
import { CORES, GRAVIDADES, GRAV_INFO, uid } from "../nucleo/base.jsx";
import { HeaderModulo } from "../telas/hub.jsx";

// ─── Módulo: Tabela Disciplinar ─────────────────────────────────

export function agruparPorSetor(tabela) {
  return [...new Set(tabela.map((t) => t.setor))].map((s) => ({
    setor: s,
    itens: tabela
      .filter((t) => t.setor === s)
      .sort((a, b) => GRAVIDADES.indexOf(a.gravidade) - GRAVIDADES.indexOf(b.gravidade)),
  }));
}

export function ModuloTabela({ cliente, tabela, gerando, erro, onGerar, onMudarTabela, onImprimir, onVoltar }) {
  const grupos = tabela ? agruparPorSetor(tabela) : [];

  return (
    <div className="pb-16">
      <HeaderModulo
        titulo="Tabela Disciplinar"
        cliente={cliente}
        onVoltar={onVoltar}
        acoes={
          <>
            <BotaoPrimario onClick={onGerar} disabled={gerando}>
              {gerando ? "Gerando..." : tabela ? "Gerar novamente" : "Gerar com IA"}
            </BotaoPrimario>
            {tabela && <BotaoContorno onClick={onImprimir}>Exportar PDF</BotaoContorno>}
          </>
        }
      />
      <div style={{ maxWidth: "1200px", margin: "0 auto", paddingLeft: "32px", paddingRight: "32px" }}>
        <AvisoErro erro={erro} />
        {gerando && <Trabalhando />}

        {!gerando && !tabela && !erro && (
          <p className="text-sm py-6" style={{ color: CORES.textoDim }}>
            Nenhuma tabela gerada ainda. A IA parte da tabela-mãe e adapta aos dados do cliente — você revisa e ajusta tudo antes de exportar.
          </p>
        )}

        {!gerando && tabela && (
          <>
            <div className="overflow-x-auto"><table style={{ width: "100%", borderCollapse: "collapse", background: CORES.cartao, marginBottom: "20px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--ouro)", background: "var(--fundo-recuo)" }}>
                  <th style={{ textAlign: "left", padding: "16px", fontSize: "11px", fontWeight: "700", color: CORES.principal, fontFamily: "var(--font-body)", textTransform: "uppercase", letterSpacing: "1px" }}>Setor</th>
                  <th style={{ textAlign: "left", padding: "16px", fontSize: "11px", fontWeight: "700", color: CORES.principal, fontFamily: "var(--font-body)", textTransform: "uppercase", letterSpacing: "1px" }}>Infração</th>
                  <th style={{ textAlign: "center", padding: "16px", fontSize: "11px", fontWeight: "700", color: CORES.principal, fontFamily: "var(--font-body)", textTransform: "uppercase", letterSpacing: "1px" }}>Gravidade</th>
                  <th style={{ textAlign: "center", padding: "16px", fontSize: "11px", fontWeight: "700", color: CORES.principal, fontFamily: "var(--font-body)", textTransform: "uppercase", letterSpacing: "1px" }}>Medida</th>
                  <th style={{ textAlign: "center", padding: "16px", fontSize: "11px", fontWeight: "700", color: CORES.principal, fontFamily: "var(--font-body)", textTransform: "uppercase", letterSpacing: "1px" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {tabela.map((item, idx) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
                      background: idx % 2 === 0 ? CORES.cartao : "var(--fundo-elevado)"
                    }}
                  >
                    <td style={{ padding: "12px", fontSize: "13px", color: CORES.principal, fontFamily: "var(--font-body)", fontWeight: "600" }}>
                      <input
                        style={{ width: "100%", padding: "4px 8px", border: "1px solid var(--linha)", borderRadius: "4px", fontSize: "12px", color: CORES.principal }}
                        value={item.setor}
                        onChange={(e) => onMudarTabela(tabela.map((t) => (t.id === item.id ? { ...t, setor: e.target.value } : t)))}
                      />
                    </td>
                    <td style={{ padding: "12px", fontSize: "13px", color: CORES.principal, fontFamily: "var(--font-body)" }}>
                      <input
                        style={{ width: "100%", padding: "4px 8px", border: "1px solid var(--linha)", borderRadius: "4px", fontSize: "12px", color: CORES.principal }}
                        value={item.infracao}
                        onChange={(e) => onMudarTabela(tabela.map((t) => (t.id === item.id ? { ...t, infracao: e.target.value } : t)))}
                      />
                    </td>
                    <td style={{ padding: "12px", fontSize: "12px", textAlign: "center" }}>
                      <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: "12px", background: GRAV_INFO[item.gravidade].fundo, color: GRAV_INFO[item.gravidade].cor, fontWeight: "600", fontFamily: "var(--font-body)", fontSize: "11px" }}>
                        {GRAV_INFO[item.gravidade].rotulo}
                      </span>
                    </td>
                    <td style={{ padding: "12px", fontSize: "13px", textAlign: "center", color: CORES.principal, fontFamily: "var(--font-body)" }}>
                      {GRAV_INFO[item.gravidade].medida}
                    </td>
                    <td style={{ padding: "12px", fontSize: "12px", textAlign: "center" }}>
                      <button
                        onClick={() => onMudarTabela(tabela.filter((t) => t.id !== item.id))}
                        style={{ color: "var(--erro)", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "12px" }}
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>

            <button
              onClick={() => onMudarTabela([...tabela, { id: uid(), setor: "Geral", infracao: "", gravidade: "leve" }])}
              className="mt-2 text-sm"
              style={{ color: CORES.dourado, fontFamily: "var(--font-body)" }}
            >
              + Adicionar infração
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function ImpressaoTabela({ cliente, tabela }) {
  if (!tabela) return null;
  const grupos = agruparPorSetor(tabela);
  return (
    <div className="area-impressao hidden print:block p-10" style={{ color: "var(--tinta)" }}>
      <div className="border-b-4 pb-4 mb-6" style={{ borderColor: CORES.fogo }}>
        <div className="text-3xl font-serif" style={{ color: CORES.fogo }}>Tabela Disciplinar</div>
        <div className="text-lg font-serif mt-1">{cliente.negocio}</div>
        <div className="text-sm mt-1" style={{ color: "var(--tinta)" }}>{cliente.segmento}</div>
      </div>

      <div className="mb-6">
        <div className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: CORES.dourado }}>
          Gradação de medidas
        </div>
        <div className="overflow-x-auto"><table className="w-full text-sm border-collapse">
          <tbody>
            {GRAVIDADES.map((g) => (
              <tr key={g}>
                <td className="border px-3 py-1 font-semibold w-32" style={{ borderColor: CORES.laranja, color: GRAV_INFO[g].cor }}>
                  {GRAV_INFO[g].rotulo}
                </td>
                <td className="border px-3 py-1" style={{ borderColor: CORES.laranja }}>{GRAV_INFO[g].medida}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
        <p className="text-xs mt-2" style={{ color: "var(--tinta)" }}>
          Reincidência no mesmo tema eleva a medida ao grau seguinte. Três feedbacks registrados sobre o mesmo tema equivalem a advertência escrita. Sem registro, a ocorrência não existe.
        </p>
      </div>

      {grupos.map((gr) => (
        <div key={gr.setor} className="mb-5">
          <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: CORES.fogo }}>
            {gr.setor}
          </div>
          <div className="overflow-x-auto"><table className="w-full text-sm border-collapse">
            <tbody>
              {gr.itens.map((item) => (
                <tr key={item.id}>
                  <td className="border px-3 py-1" style={{ borderColor: CORES.laranja }}>{item.infracao}</td>
                  <td className="border px-3 py-1 w-28 font-semibold" style={{ borderColor: CORES.laranja, color: GRAV_INFO[item.gravidade].cor }}>
                    {GRAV_INFO[item.gravidade].rotulo}
                  </td>
                  <td className="border px-3 py-1 w-52" style={{ borderColor: CORES.laranja }}>{GRAV_INFO[item.gravidade].medida}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      ))}

      <RodapeImpressao />
    </div>
  );
}

export function RodapeImpressao() {
  return (
    <div className="mt-8 pt-4 border-t text-xs" style={{ borderColor: CORES.dourado, color: "var(--tinta)" }}>
      <p className="mb-1">
        * A aplicação de qualquer medida disciplinar — em especial suspensão e desligamento por justa causa (art. 482 da CLT) — deve ser validada previamente com o contador e/ou advogado trabalhista da empresa, inclusive quanto à convenção coletiva (CCT) vigente do setor.
      </p>
      <p className="font-serif italic" style={{ color: CORES.fogo }}>
        Elaborado por Nayara Silva · Consultoria de Governança
      </p>
    </div>
  );
}
