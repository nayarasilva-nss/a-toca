import { comRetentativa } from "../ia/base.jsx";
import { estruturarSessaoMentoria, gerarFichaMoldagem, gerarJornadaMentoria } from "../ia/treinamentos.jsx";
import { ModuloMentoria } from "../modulos/mentoria.jsx";
import { pessoaVazia } from "../modulos/temperamentos.jsx";
import { mentoriaVazia } from "../modulos/treinamentos.jsx";
import { uid } from "../nucleo/base.jsx";

export function TelaMentoria({ app }) {
  const { clienteAtual, diagsLiderAtuais, diagsLiderPorCliente, diagsPorCliente, erro, gerando, mentoriaAtual, mentoriaPorCliente, mudarPessoas, pessoasAtuais, pessoasPorCliente, propostasPorCliente, relMentoriaAtual, salvarColecao, setErro, setGerando, setTela, tela } = app;

  const mudarMentoria = (clienteId, nova) => salvarColecao("mentoria", clienteId, nova);

  const gerarJornadaCliente = async (cliente) => {
    const mentoria = mentoriaPorCliente[cliente.id] || mentoriaVazia();
    setGerando(true);
    setErro(null);
    try {
      const mentorado = (pessoasPorCliente[cliente.id] || []).find((p) => p.id === mentoria.mentoradoId) || null;
      const diags = diagsPorCliente[cliente.id] || [];
      const diagsL = diagsLiderPorCliente[cliente.id] || [];
      const encontros = await comRetentativa(() => gerarJornadaMentoria(cliente, mentoria, mentorado, diags.length ? diags[diags.length - 1] : null, pessoasPorCliente[cliente.id] || [], diagsL.length ? diagsL[diagsL.length - 1] : null));
      // preserva encontros já realizados/anotados no topo
      const preservados = (mentoria.encontros || []).filter((e) => e.realizada || e.anotacoes);
      await mudarMentoria(cliente.id, { ...mentoria, encontros: [...preservados, ...encontros] });
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  const gerarFichaMoldagemCliente = async (cliente) => {
    const mentoria = mentoriaPorCliente[cliente.id] || {};
    setGerando(true);
    setErro(null);
    try {
      const mentorado = (pessoasPorCliente[cliente.id] || []).find((p) => p.id === mentoria.mentoradoId) || null;
      const ficha = await comRetentativa(() => gerarFichaMoldagem(cliente, mentoria, mentorado, diagsLiderPorCliente[cliente.id] || []));
      await mudarMentoria(cliente.id, { ...mentoria, moldagem: { ...ficha, praticasSugeridas: ficha.praticasSugeridas } });
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  const estruturarSessaoCliente = async (cliente, sessao) => {
    const mentoria = mentoriaPorCliente[cliente.id];
    setGerando(true);
    setErro(null);
    try {
      const r = await comRetentativa(() => estruturarSessaoMentoria(cliente, sessao));
      const existentes = new Set((sessao.atividades || []).map((a) => a.texto.trim().toLowerCase()));
      const novas = (r.novasAtividades || [])
        .filter((t) => !existentes.has(String(t).trim().toLowerCase()))
        .map((t) => ({ id: uid(), texto: t, feita: false }));
      await mudarMentoria(cliente.id, {
        ...mentoria,
        encontros: mentoria.encontros.map((e) =>
          e.id === sessao.id
            ? { ...e, anotacoes: r.anotacoes, acoes: r.acoes, atividades: [...(e.atividades || []), ...novas] }
            : e
        ),
      });
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  if (tela.nome === "mentoria" && clienteAtual) {
    return (
      <ModuloMentoria
        cliente={clienteAtual}
        mentoria={mentoriaAtual}
        pessoas={pessoasAtuais}
        temRaioX={diagsLiderAtuais.length > 0}
        statusAcordo={(propostasPorCliente[clienteAtual.id] || []).some((p) => p.status === "aceita") ? "aceita" : (propostasPorCliente[clienteAtual.id] || []).some((p) => p.apresentacao) ? "gerada" : "nenhum"}
        temProva={!!(relMentoriaAtual.retrospectiva || relMentoriaAtual.evolucao)}
        gerando={gerando}
        erro={erro}
        onMudar={(nova) => mudarMentoria(clienteAtual.id, nova)}
        onGerarJornada={() => gerarJornadaCliente(clienteAtual)}
        onEstruturarSessao={(sessao) => estruturarSessaoCliente(clienteAtual, sessao)}
        onGerarFicha={() => gerarFichaMoldagemCliente(clienteAtual)}
        onCriarMentorado={async () => {
          const nova = { ...pessoaVazia(), nome: clienteAtual.negocio, cargo: clienteAtual.segmento, contratante: true };
          await mudarPessoas(clienteAtual.id, [...pessoasAtuais, nova]);
          await mudarMentoria(clienteAtual.id, { ...mentoriaAtual, mentoradoId: nova.id });
        }}
        onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
      />
    );
  }
  return null;
}
