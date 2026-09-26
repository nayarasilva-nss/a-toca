import { comRetentativa } from "../ia/base.jsx";
import { gerarPlanoAcao, resumoCampo } from "../ia/campo.jsx";
import { docVazio } from "../ia/documentos.jsx";
import { gerarAtualizacaoPlano } from "../ia/ritos.jsx";
import { ModuloGestao } from "../modulos/gestao.jsx";

export function TelaGestao({ app }) {
  const { atasAtuais, campoPorCliente, clienteAtual, docsDe, erro, gerando, gestaoPorCliente, mudarDocs, mudarGestao, pessoasPorCliente, setErro, setGerando, setTela, tela } = app;

  const gerarPlano = async (cliente) => {
    const gestao = gestaoPorCliente[cliente.id] || { briefing: "", frentes: [] };
    setGerando(true);
    setErro(null);
    try {
      const frentes = await comRetentativa(() => gerarPlanoAcao(cliente, gestao.briefing, pessoasPorCliente[cliente.id] || [], resumoCampo(campoPorCliente[cliente.id] || [], "riscos")));
      await mudarGestao(cliente.id, { ...gestao, frentes });
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  const atualizarPlano = async (cliente) => {
    const gestao = gestaoPorCliente[cliente.id] || { briefing: "", frentes: [] };
    const atas = docsDe("atas", cliente.id);
    const comConteudo = atas.filter((a) => a.resumo);
    const ultimaAta = comConteudo.length ? comConteudo[comConteudo.length - 1] : null;
    setGerando(true);
    setErro(null);
    try {
      const frentes = await comRetentativa(() => gerarAtualizacaoPlano(cliente, gestao, ultimaAta, pessoasPorCliente[cliente.id] || [], resumoCampo(campoPorCliente[cliente.id] || [], "riscos")));
      await mudarGestao(cliente.id, { ...gestao, frentes });
    } catch (e) {
      setErro(e.message || "erro desconhecido");
    } finally {
      setGerando(false);
    }
  };

  if (tela.nome === "gestao" && clienteAtual) {
    return (
      <ModuloGestao
        cliente={clienteAtual}
        gestao={gestaoPorCliente[clienteAtual.id] || { briefing: "", frentes: [] }}
        atas={atasAtuais}
        gerando={gerando}
        erro={erro}
        onMudar={(nova) => mudarGestao(clienteAtual.id, nova)}
        onGerarPlano={() => gerarPlano(clienteAtual)}
        onAtualizarPlano={() => atualizarPlano(clienteAtual)}
        onAbrirAta={(docId) => {
          setErro(null);
          setTela({ nome: "doc", tipo: "atas", id: tela.id, docId, origem: "gestao" });
        }}
        onNovaAta={async () => {
          const novo = docVazio("atas");
          await mudarDocs("atas", clienteAtual.id, [...atasAtuais, novo]);
          setErro(null);
          setTela({ nome: "doc", tipo: "atas", id: tela.id, docId: novo.id, origem: "gestao" });
        }}
        onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
      />
    );
  }
  return null;
}
