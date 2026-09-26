import { CONFIG_DOCS, docVazio } from "../ia/documentos.jsx";
import { EditorDoc, ListaDocs } from "../modulos/documentos.jsx";

export function TelaDocumentos({ app }) {
  const { campoPorCliente, clienteAtual, docAtual, docsAtuais, docsDe, erro, executarGeracao, exportarImpressao, gerando, mudarDocs, pontosCCTDe, popsPorCliente, setErro, setTela, tela } = app;

  const gerarDocCliente = (tipo, cliente, doc) =>
    executarGeracao(async () => {
      const gerado = await CONFIG_DOCS[tipo].gerar(cliente, doc, pontosCCTDe(cliente.id), { pops: popsPorCliente[cliente.id] || [], campo: campoPorCliente[cliente.id] || [] });
      const docs = docsDe(tipo, cliente.id);
      await mudarDocs(tipo, cliente.id, docs.map((d) => (d.id === doc.id ? { ...doc, ...gerado } : d)));
    });


  if (tela.nome === "docs" && clienteAtual) {
    return (
      <ListaDocs
        cliente={clienteAtual}
        tipo={tela.tipo}
        docs={docsAtuais}
        onAbrir={(docId) => {
          setErro(null);
          setTela({ nome: "doc", tipo: tela.tipo, id: tela.id, docId });
        }}
        onNovo={async () => {
          const novo = docVazio(tela.tipo);
          await mudarDocs(tela.tipo, clienteAtual.id, [...docsAtuais, novo]);
          setErro(null);
          setTela({ nome: "doc", tipo: tela.tipo, id: tela.id, docId: novo.id });
        }}
        onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
      />
    );
  }
  if (tela.nome === "doc" && clienteAtual && docAtual) {
    return (
      <EditorDoc
        cliente={clienteAtual}
        tipo={tela.tipo}
        doc={docAtual}
        rotuloVoltar={tela.origem === "gestao" ? `Briefing & Plano de Ação · ${clienteAtual.negocio}` : `${CONFIG_DOCS[tela.tipo].tituloModulo} · ${clienteAtual.negocio}`}
        gerando={gerando}
        erro={erro}
        onMudar={(novo) => mudarDocs(tela.tipo, clienteAtual.id, docsAtuais.map((d) => (d.id === novo.id ? novo : d)))}
        onGerar={() => gerarDocCliente(tela.tipo, clienteAtual, docAtual)}
        onImprimir={exportarImpressao}
        onExcluir={async () => {
          await mudarDocs(tela.tipo, clienteAtual.id, docsAtuais.filter((d) => d.id !== docAtual.id));
          setTela(tela.origem === "gestao" ? { nome: "gestao", id: tela.id } : { nome: "docs", tipo: tela.tipo, id: tela.id });
        }}
        onVoltar={() => setTela(tela.origem === "gestao" ? { nome: "gestao", id: tela.id } : { nome: "docs", tipo: tela.tipo, id: tela.id })}
      />
    );
  }
  return null;
}
