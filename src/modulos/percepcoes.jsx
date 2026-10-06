import { useState } from "react";
import { HeaderModulo } from "../telas/hub.jsx";
import { Card } from "../componentes/enraizar.jsx";
import { BotaoPrimario, BotaoContorno, ConfirmarAcao } from "../componentes/ui.jsx";
import { PAPEIS, RODADAS, agregarPercepcoes, respondidos } from "../nucleo/percepcao.jsx";
import { percentualArea } from "../ia/diagnostico.jsx";

const dataBR = (iso) => (iso ? new Date(iso).toLocaleDateString("pt-BR") : "");

function Comparativo({ framework, convites, diagnosticos }) {
  const inicio = agregarPercepcoes(convites, framework, "inicio");
  const fim = agregarPercepcoes(convites, framework, "fim");
  const primeiroDiag = diagnosticos[0] || null;
  const ultimoDiag = diagnosticos.length > 1 ? diagnosticos[diagnosticos.length - 1] : null;
  if (!inicio && !fim) return null;
  const col = (v) => (v === null || v === undefined ? "—" : `${v}%`);
  return (
    <Card variante="vazado" rotulo="Leitura" titulo="O que o entorno vê, área por área." subtitulo="comparado com a sua avaliação no diagnóstico — a distância entre os dois é o ponto cego.">
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Área</th>
              {primeiroDiag && <th>Diagnóstico · início</th>}
              {inicio && <th>Entorno · início ({inicio.total})</th>}
              {ultimoDiag && <th>Diagnóstico · fim</th>}
              {fim && <th>Entorno · fim ({fim.total})</th>}
            </tr>
          </thead>
          <tbody>
            {framework.map((a, i) => (
              <tr key={a.area}>
                <td>{a.area}</td>
                {primeiroDiag && <td>{col(percentualArea(primeiroDiag.notas, i, framework))}</td>}
                {inicio && <td style={{ color: "var(--tinta-broto)" }}>{col(inicio.porArea[i])}</td>}
                {ultimoDiag && <td>{col(percentualArea(ultimoDiag.notas, i, framework))}</td>}
                {fim && <td style={{ color: "var(--tinta-broto)" }}>{col(fim.porArea[i])}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function ModuloPercepcoes({ cliente, convites, framework, diagnosticos, temFoco, onCriar, onCancelar, onAtualizar, onVoltar }) {
  const [papel, setPapel] = useState("chefe");
  const [rodada, setRodada] = useState("inicio");
  const [copiado, setCopiado] = useState(null);
  const base = `${window.location.origin}/responder?t=`;
  const copiar = async (c) => {
    try {
      await navigator.clipboard.writeText(base + c.token);
      setCopiado(c.id);
      setTimeout(() => setCopiado(null), 2000);
    } catch {}
  };
  const pendentes = convites.filter((c) => !c.respostas);
  const feitos = respondidos(convites);

  return (
    <div className="pb-16">
      <HeaderModulo
        titulo="Percepção do entorno"
        subtitulo="Quem convive com o mentorado responde como o vê, na mesma régua do diagnóstico. Cada pessoa recebe um link; as respostas chegam aqui agregadas por papel."
        cliente={cliente}
        onVoltar={onVoltar}
        acoes={<BotaoContorno onClick={onAtualizar} pequeno>Atualizar respostas</BotaoContorno>}
      />
      <div className="enz-container" style={{ paddingTop: 0 }}>
        {!temFoco && (
          <div className="enz-aviso-erro" style={{ background: "var(--alerta-fundo)", color: "var(--alerta)" }}>
            Defina o foco da jornada em Mentoria antes de convidar: o questionário segue a régua do foco.
          </div>
        )}

        <Card rotulo="Novo convite" titulo="Quem vai responder?">
          <div className="flex gap-3 flex-wrap" style={{ marginBottom: 16 }}>
            {Object.entries(PAPEIS).map(([k, r]) => (
              <BotaoContorno key={k} pequeno ativo={papel === k} onClick={() => setPapel(k)}>{r}</BotaoContorno>
            ))}
          </div>
          <div className="flex gap-3 flex-wrap" style={{ marginBottom: 20 }}>
            {Object.entries(RODADAS).map(([k, r]) => (
              <BotaoContorno key={k} pequeno ativo={rodada === k} onClick={() => setRodada(k)}>{r}</BotaoContorno>
            ))}
          </div>
          <BotaoPrimario onClick={() => onCriar(papel, rodada)} disabled={!temFoco}>Gerar link</BotaoPrimario>
          <div className="enz-ajuda">o link é único e só pode ser respondido uma vez. envie por onde preferir. a identidade de quem respondeu fica só com você.</div>
        </Card>

        {convites.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <span className="enz-rotulo" style={{ marginBottom: 8 }}>Convites</span>
            {convites.map((c) => (
              <div key={c.id} className="enz-card enz-card-vazado flex items-center justify-between gap-4 flex-wrap" style={{ padding: "14px 0" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>{PAPEIS[c.papel] || c.papel}</div>
                  <div className="enz-legenda">{RODADAS[c.rodada]} · {c.respostas ? `respondido em ${dataBR(c.respondidoEm)}` : `criado em ${dataBR(c.criadoEm)} · aguardando`}</div>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  {!c.respostas && <button className="enz-link" onClick={() => copiar(c)}>{copiado === c.id ? "copiado ✓" : "copiar link"}</button>}
                  <ConfirmarAcao rotulo={c.respostas ? "apagar" : "cancelar"} aviso={c.respostas ? "isso apaga a resposta" : "o link deixa de funcionar"} onConfirmar={() => onCancelar(c)} />
                </div>
              </div>
            ))}
            {pendentes.length > 0 && <p className="enz-nota" style={{ marginTop: 8 }}>{pendentes.length} link{pendentes.length > 1 ? "s" : ""} aguardando resposta. clique em "Atualizar respostas" depois que as pessoas responderem.</p>}
          </div>
        )}

        {feitos.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <Comparativo framework={framework} convites={convites} diagnosticos={diagnosticos} />
            <Card variante="vazado" rotulo="Em suas palavras" titulo="O que disseram.">
              {feitos.map((c) => (
                <div key={c.id} style={{ marginBottom: 16 }}>
                  <span className="enz-rotulo" style={{ marginBottom: 4 }}>{PAPEIS[c.papel] || c.papel} · {RODADAS[c.rodada]}</span>
                  {c.respostas.bem && <div><span className="enz-legenda">faz bem — </span>{c.respostas.bem}</div>}
                  {c.respostas.mudar && <div><span className="enz-legenda">precisaria mudar — </span>{c.respostas.mudar}</div>}
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
