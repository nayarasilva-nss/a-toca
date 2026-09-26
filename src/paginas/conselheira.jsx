import { resumoCampo } from "../ia/campo.jsx";
import { conversarPenseira } from "../ia/conselheira.jsx";
import { acoesNumeradas, semanaAtualDe } from "../ia/cronograma.jsx";
import { FRAMEWORK_DIAG, percentualArea } from "../ia/diagnostico.jsx";
import { TEMPERAMENTOS } from "../ia/documentos.jsx";
import { ModuloPenseira } from "../modulos/conselheira.jsx";
import { stSet } from "../nucleo/persistencia.jsx";

export function TelaConselheira({ app }) {
  const { alcadasPorCliente, campoPorCliente, cargosPorCliente, clienteAtual, diagsPorCliente, docsDe, erro, estruturaPorCliente, fluxosPorCliente, gerando, gestaoPorCliente, indicadoresPorCliente, manualPorCliente, mentoriaPorCliente, penseiraPorCliente, pessoasPorCliente, pontosCCTDe, popsPorCliente, ritosPorCliente, setErro, setGerando, setPenseiraPorCliente, setTela, tabelas, tela, treinamentosPorCliente } = app;

  const enviarPenseira = async (cliente, textoUsuario) => {
    const historicoAtual = penseiraPorCliente[cliente.id] || [];
    const comPergunta = [...historicoAtual, { role: "user", content: textoUsuario }];
    setPenseiraPorCliente((prev) => ({ ...prev, [cliente.id]: comPergunta }));
    setGerando(true);
    setErro(null);
    try {
      const gestao = gestaoPorCliente[cliente.id] || { frentes: [] };
      const diags = diagsPorCliente[cliente.id] || [];
      const ultimoDiag = diags.length ? diags[diags.length - 1] : null;
      const linhaDiagPan = ultimoDiag
        ? `Diagnóstico (${ultimoDiag.data}): ${FRAMEWORK_DIAG.map((a, i) => {
            const p = percentualArea(ultimoDiag.notas, i);
            return p === null ? null : `${a.area} ${p}%`;
          }).filter(Boolean).join(", ")}${ultimoDiag.criticos ? ` | críticos: ${ultimoDiag.criticos.split("\n").join("; ")}` : ""}`
        : "Diagnóstico: não realizado";
      const semPan = semanaAtualDe(gestao.inicio, Number(gestao.duracaoSemanas) || 0);
      const atrasadasPan = semPan
        ? acoesNumeradas(gestao.frentes || []).filter((x) => x.acao.semana && !x.acao.feita && x.acao.semana < semPan)
        : [];
      const linhaCrono = semPan
        ? `Cronograma: semana ${semPan}${gestao.duracaoSemanas ? ` de ${gestao.duracaoSemanas}` : ""}${atrasadasPan.length ? ` | atrasadas: ${atrasadasPan.map((x) => x.acao.texto).join("; ")}` : " | sem atrasos"}`
        : "Cronograma: não iniciado";
      const inv = [
        tabelas[cliente.id] ? `tabela disciplinar (${tabelas[cliente.id].length})` : null,
        (cargosPorCliente[cliente.id] || []).length ? `${cargosPorCliente[cliente.id].length} cargos` : null,
        (estruturaPorCliente[cliente.id] || []).length ? `organograma (${estruturaPorCliente[cliente.id].length} posições)` : null,
        (manualPorCliente[cliente.id] || []).length ? `manual (${manualPorCliente[cliente.id].length} seções)` : null,
        (popsPorCliente[cliente.id] || []).length ? `${popsPorCliente[cliente.id].length} POPs` : null,
        (fluxosPorCliente[cliente.id] || []).length ? `${fluxosPorCliente[cliente.id].length} fluxos` : null,
        ((alcadasPorCliente[cliente.id] || {}).itens || []).length ? `alçadas (${alcadasPorCliente[cliente.id].itens.length})` : null,
        ((ritosPorCliente[cliente.id] || {}).itens || []).length ? `ritos (${ritosPorCliente[cliente.id].itens.length})` : null,
        ((indicadoresPorCliente[cliente.id] || {}).itens || []).length ? `indicadores (${indicadoresPorCliente[cliente.id].itens.length})` : null,
        docsDe("politicas", cliente.id).length ? `políticas (${docsDe("politicas", cliente.id).length})` : null,
        docsDe("checklists", cliente.id).length ? `checklists (${docsDe("checklists", cliente.id).length})` : null,
        docsDe("atas", cliente.id).length ? `atas (${docsDe("atas", cliente.id).length})` : null,
        (campoPorCliente[cliente.id] || []).length ? `trabalho de campo (${(campoPorCliente[cliente.id] || []).filter((r) => r.tipo === "visita").length} visitas, ${(campoPorCliente[cliente.id] || []).filter((r) => r.tipo === "entrevista").length} entrevistas, ${(campoPorCliente[cliente.id] || []).filter((r) => r.tipo === "turno").length} turnos)` : null,
        (treinamentosPorCliente[cliente.id] || []).length ? `treinamentos (${(treinamentosPorCliente[cliente.id] || []).filter((t) => t.status === "realizado").length} realizados de ${(treinamentosPorCliente[cliente.id] || []).length})` : null,
        ((mentoriaPorCliente[cliente.id] || {}).encontros || []).length ? `mentoria (${((mentoriaPorCliente[cliente.id] || {}).encontros || []).filter((e) => e.realizada).length}/${((mentoriaPorCliente[cliente.id] || {}).encontros || []).length} encontros)` : null,
      ].filter(Boolean).join(", ") || "nenhum documento produzido ainda";
      const riscosCampoPan = resumoCampo(campoPorCliente[cliente.id] || [], "riscos");
      const linhaTime = (pessoasPorCliente[cliente.id] || [])
        .filter((p) => p.nome)
        .map((p) => `${p.nome}${p.cargo ? ` (${p.cargo})` : ""}${p.dominante && TEMPERAMENTOS[p.dominante] ? ` — ${TEMPERAMENTOS[p.dominante].rotulo}` : ""}${p.contratante ? " [contratante]" : ""}`)
        .join("; ");
      const linhaMentoria = (mentoriaPorCliente[cliente.id] && (mentoriaPorCliente[cliente.id].encontros || []).length)
        ? `Mentoria: ${(mentoriaPorCliente[cliente.id].encontros || []).filter((e) => e.realizada).length}/${mentoriaPorCliente[cliente.id].encontros.length} encontros; objetivos: ${mentoriaPorCliente[cliente.id].objetivos || "nao declarados"}; proximos temas: ${(mentoriaPorCliente[cliente.id].encontros || []).filter((e) => !e.realizada).slice(0, 3).map((e) => e.tema).join(", ") || "nenhum"}; atividades pra casa pendentes: ${(mentoriaPorCliente[cliente.id].encontros || []).filter((e) => e.realizada).flatMap((e) => (e.atividades || []).filter((a) => !a.feita)).map((a) => a.texto).join("; ") || "nenhuma"}; praticas moldadoras: ${((mentoriaPorCliente[cliente.id].praticas || []).map((p) => `${p.texto} (${p.status})`).join("; ")) || "nenhuma prescrita"}; virtude central: ${(mentoriaPorCliente[cliente.id].moldagem && mentoriaPorCliente[cliente.id].moldagem.virtudeCentral && mentoriaPorCliente[cliente.id].moldagem.virtudeCentral.nome) || "nao definida"}; diario da virtude: ${((mentoriaPorCliente[cliente.id].virtudes || []).filter((v) => v.nota).slice(0, 5).map((v) => `${v.data}: ${v.nota}`).join("; ")) || "sem registros"}`
        : null;
      const panorama = [
        cliente.tipo === "pessoa" ? `ATENCAO: este cliente e uma PESSOA FISICA (mentorado de lideranca), nao uma empresa. Trate as perguntas no contexto de mentoria individual.` : null,
        linhaMentoria,
        linhaDiagPan,
        linhaCrono,
        `Documentos produzidos: ${inv}`,
        linhaTime ? `Time mapeado: ${linhaTime}` : null,
        riscosCampoPan ? `Riscos observados em campo: ${riscosCampoPan.slice(0, 500)}` : null,
      ].filter(Boolean).join("\n");
      const resposta = await conversarPenseira(cliente, pontosCCTDe(cliente.id), gestao.frentes, comPergunta, pessoasPorCliente[cliente.id] || [], panorama);
      const completo = [...comPergunta, { role: "assistant", content: resposta }];
      setPenseiraPorCliente((prev) => ({ ...prev, [cliente.id]: completo }));
      await stSet(`toca:penseira:${cliente.id}`, completo);
    } catch (e) {
      setErro(e.message || "erro desconhecido");
      await stSet(`toca:penseira:${cliente.id}`, comPergunta);
    } finally {
      setGerando(false);
    }
  };

  const limparPenseira = async (clienteId) => {
    setPenseiraPorCliente((prev) => ({ ...prev, [clienteId]: [] }));
    await stSet(`toca:penseira:${clienteId}`, []);
  };

  if (tela.nome === "penseira" && clienteAtual) {
    return (
      <ModuloPenseira
        cliente={clienteAtual}
        mensagens={penseiraPorCliente[clienteAtual.id] || []}
        gerando={gerando}
        erro={erro}
        onEnviar={(t) => enviarPenseira(clienteAtual, t)}
        onLimpar={() => limparPenseira(clienteAtual.id)}
        onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
      />
    );
  }
  return null;
}
