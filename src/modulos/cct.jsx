import { AvisoErro, ConfirmarAcao, Trabalhando } from "../componentes/ui.jsx";
import { CORES, uid } from "../nucleo/base.jsx";
import { HeaderModulo } from "../telas/hub.jsx";

// ─── Módulo: CCT & Conformidade ─────────────────────────────────

export const DESTINOS_CCT = {
  manual: "Manual",
  tabela: "Tabela Disciplinar",
  cargos: "Descrições de Cargo",
  geral: "Geral",
};

export function ModuloCCT({ cliente, cct, gerando, erro, onMudar, onAnalisar, onVoltar }) {
  const pontos = cct.pontos || [];

  const aoEscolherArquivo = (e) => {
    const arquivo = e.target.files && e.target.files[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = () => {
      const base64 = String(leitor.result).split(",")[1];
      onAnalisar(arquivo.name, base64);
    };
    leitor.readAsDataURL(arquivo);
    e.target.value = "";
  };

  return (
    <div className="pb-16">
      <HeaderModulo
        titulo="CCT & Conformidade"
        cliente={cliente}
        onVoltar={onVoltar}
        acoes={null}
      />
      <div style={{ maxWidth: "1000px", margin: "0 auto", paddingLeft: "32px", paddingRight: "32px" }}>
        <div className="rounded-lg p-6 shadow-sm card">
          <p className="text-xs mb-4" style={{ color: CORES.textoDim }}>
            As leis do Ministério: suba o PDF da convenção coletiva do setor — e depois os termos aditivos, um a um. A cada documento, a IA atualiza a análise: remove o que foi superado, ajusta o que mudou e soma o que é novo. Todas as gerações deste cliente respeitam o resultado. Os arquivos não ficam armazenados; só a análise.
          </p>

        <label
          className="inline-block px-4 py-2 rounded text-sm font-semibold text-white cursor-pointer"
          style={{ background: gerando ? "#9A8AA0" : CORES.fogo, opacity: gerando ? 0.6 : 1 }}
        >
          {gerando ? "Analisando..." : pontos.length ? "Subir aditivo ou nova CCT (soma à análise)" : "Subir PDF da CCT e analisar"}
          <input type="file" accept="application/pdf" className="hidden" disabled={gerando} onChange={aoEscolherArquivo} />
        </label>
        {pontos.length > 0 && !gerando && (
          <span className="ml-3">
            <ConfirmarAcao
              label="Recomeçar do zero"
              aviso="apaga pontos e documentos analisados"
              onConfirmar={() => onMudar({ nomeArquivo: "", dataAnalise: "", documentos: [], pontos: [] })}
            />
          </span>
        )}
        {(cct.documentos || []).length > 0 && !gerando && (
          <div className="text-xs mt-2" style={{ color: "#A89878" }}>
            Documentos analisados:{" "}
            {(cct.documentos || []).map((d) => `${d.nomeArquivo} (${d.dataAnalise})`).join(" · ")}
          </div>
        )}
        {cct.nomeArquivo && !(cct.documentos || []).length && !gerando && (
          <span className="text-xs ml-3" style={{ color: "#A89878" }}>
            Última análise: {cct.nomeArquivo}
            {cct.dataAnalise ? ` · ${cct.dataAnalise}` : ""}
          </span>
        )}

        <div className="mt-4">
          <AvisoErro erro={erro} />
        </div>
        {gerando && <Trabalhando />}

        {!gerando && pontos.length > 0 && (
          <div className="mt-4">
            <div className="flex items-baseline justify-between mb-2 flex-wrap gap-2">
              <div className="label" style={{ color: CORES.dourado }}>
                Pontos obrigatórios extraídos
              </div>
              <div className="text-xs font-semibold" style={{ color: pontos.every((p) => p.statusConf === "resolvido") ? "#4F6B3A" : "#9A6A2F" }}>
                {pontos.filter((p) => p.statusConf === "resolvido").length}/{pontos.length} resolvidos
              </div>
            </div>
            {pontos.map((p) => (
              <div key={p.id} className="flex items-start gap-2 py-2 border-b" style={{ borderColor: "#EFE8D6" }}>
                <input
                  className="w-32 shrink-0 px-2 py-1 text-xs rounded border bg-creme font-semibold"
                  style={{ borderColor: "#E0D5BC", color: CORES.fogo }}
                  value={p.tema}
                  onChange={(e) =>
                    onMudar({ ...cct, pontos: pontos.map((x) => (x.id === p.id ? { ...x, tema: e.target.value } : x)) })
                  }
                />
                <textarea
                  rows={2}
                  className="flex-1 px-2 py-1 text-sm rounded border bg-creme"
                  style={{ borderColor: "#E0D5BC", color: CORES.fogoEscuro }}
                  value={p.exigencia}
                  onChange={(e) =>
                    onMudar({ ...cct, pontos: pontos.map((x) => (x.id === p.id ? { ...x, exigencia: e.target.value } : x)) })
                  }
                />
                <select
                  className="px-2 py-1 text-xs rounded border bg-creme shrink-0"
                  style={
                    p.statusConf === "resolvido"
                      ? { borderColor: "#4F6B3A", background: "#E3EBD8", color: "#4F6B3A" }
                      : p.statusConf === "tratamento"
                      ? { borderColor: "#9A6A2F", background: "#F5E6C8", color: "#9A6A2F" }
                      : { borderColor: "#C77", background: "#F5DDD6", color: "#8A3A2E" }
                  }
                  value={p.statusConf || "pendente"}
                  onChange={(e) =>
                    onMudar({
                      ...cct,
                      pontos: pontos.map((x) =>
                        x.id === p.id
                          ? { ...x, statusConf: e.target.value, dataResolucao: e.target.value === "resolvido" ? new Date().toLocaleDateString("pt-BR") : x.dataResolucao }
                          : x
                      ),
                    })
                  }
                >
                  <option value="pendente">Pendente</option>
                  <option value="tratamento">Em tratamento</option>
                  <option value="resolvido">Resolvido ✓</option>
                </select>
                <select
                  className="px-2 py-1 text-xs rounded border bg-creme"
                  style={{ borderColor: "#E0D5BC", color: "#6B5D42" }}
                  value={p.destino}
                  onChange={(e) =>
                    onMudar({ ...cct, pontos: pontos.map((x) => (x.id === p.id ? { ...x, destino: e.target.value } : x)) })
                  }
                >
                  {Object.entries(DESTINOS_CCT).map(([chave, rotulo]) => (
                    <option key={chave} value={chave}>{rotulo}</option>
                  ))}
                </select>
                <button
                  onClick={() => onMudar({ ...cct, pontos: pontos.filter((x) => x.id !== p.id) })}
                  className="px-1 text-xs"
                  style={{ color: "#B8860B" }}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                onMudar({ ...cct, pontos: [...pontos, { id: uid(), tema: "Novo ponto", exigencia: "", destino: "geral" }] })
              }
              className="mt-2 text-sm"
              style={{ color: CORES.dourado }}
            >
              + Adicionar ponto manual
            </button>
            <p className="text-xs mt-4" style={{ color: "#A89878" }}>
              Estes pontos são injetados automaticamente na geração da tabela disciplinar, das descrições de cargo e do manual deste cliente.
            </p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
