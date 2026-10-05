import { useEffect } from "react";
import { gerarAnaliseTemperamento } from "../ia/temperamentos.jsx";
import { EditorPessoa, ListaPessoas, pessoaVazia } from "../modulos/temperamentos.jsx";
import { mentoriaVazia } from "../modulos/treinamentos.jsx";

export function TelaTemperamentos({ app }) {
  const { cargosPorCliente, clienteAtual, erro, executarGeracao, exportarImpressao, gerando, mentoriaPorCliente, mudarPessoas, pessoaAtual, pessoasAtuais, pessoasPorCliente, salvarColecao, setErro, setTela, tela } = app;
  const ehPessoa = !!clienteAtual && clienteAtual.tipo === "pessoa";
  const mentoria = clienteAtual ? mentoriaPorCliente[clienteAtual.id] || null : null;
  const fichaMentorado = ehPessoa ? pessoasAtuais.find((p) => p.id === (mentoria && mentoria.mentoradoId)) || pessoasAtuais.find((p) => p.contratante) || null : null;

  // mentorado antigo sem ficha: cria e vincula ao abrir a aba
  useEffect(() => {
    if (tela.nome !== "temperamentos" || !ehPessoa) return;
    if (fichaMentorado) {
      setTela({ nome: "pessoa", id: tela.id, pessoaId: fichaMentorado.id });
      return;
    }
    (async () => {
      const ficha = { ...pessoaVazia(), nome: clienteAtual.negocio, cargo: clienteAtual.segmento, contratante: true };
      await mudarPessoas(clienteAtual.id, [...pessoasAtuais, ficha]);
      await salvarColecao("mentoria", clienteAtual.id, { ...(mentoria || mentoriaVazia()), mentoradoId: ficha.id });
      setTela({ nome: "pessoa", id: tela.id, pessoaId: ficha.id });
    })();
  }, [tela.nome, tela.id, ehPessoa, fichaMentorado && fichaMentorado.id]);

  const analisarPessoa = (cliente, pessoa) =>
    executarGeracao(async () => {
      const pessoas = pessoasPorCliente[cliente.id] || [];
      const gerado = await gerarAnaliseTemperamento(cliente, pessoa, cargosPorCliente[cliente.id] || []);
      const atualizada = { ...pessoa, ...gerado };
      await mudarPessoas(cliente.id, pessoas.map((p) => (p.id === pessoa.id ? atualizada : p)));
    });

  const abrirPessoa = (pessoaId) => {
    setErro(null);
    setTela({ nome: "pessoa", id: tela.id, pessoaId });
  };
  const novaPessoa = async () => {
    const nova = pessoaVazia();
    await mudarPessoas(clienteAtual.id, [...pessoasAtuais, nova]);
    abrirPessoa(nova.id);
  };

  if ((tela.nome === "temperamentos" && clienteAtual && !ehPessoa) || (tela.nome === "entorno" && clienteAtual)) {
    const lista = ehPessoa ? pessoasAtuais.filter((p) => !fichaMentorado || p.id !== fichaMentorado.id) : pessoasAtuais;
    return (
      <ListaPessoas
        cliente={clienteAtual}
        pessoas={lista}
        entorno={ehPessoa}
        onAbrir={abrirPessoa}
        onNova={novaPessoa}
        onVoltar={() => (ehPessoa && fichaMentorado ? abrirPessoa(fichaMentorado.id) : setTela({ nome: "cliente", id: tela.id }))}
      />
    );
  }
  if (tela.nome === "temperamentos" && ehPessoa) {
    return <div className="enz-container enz-nota">abrindo a ficha do mentorado…</div>;
  }
  if (tela.nome === "pessoa" && clienteAtual && pessoaAtual) {
    const ehFichaMentorado = !!fichaMentorado && pessoaAtual.id === fichaMentorado.id;
    return (
      <EditorPessoa
        cliente={clienteAtual}
        pessoa={pessoaAtual}
        mentorado={ehFichaMentorado}
        totalEntorno={ehPessoa ? pessoasAtuais.length - 1 : 0}
        gerando={gerando}
        erro={erro}
        onMudar={(nova) => mudarPessoas(clienteAtual.id, pessoasAtuais.map((p) => (p.id === nova.id ? nova : p)))}
        onGerar={() => analisarPessoa(clienteAtual, pessoaAtual)}
        onImprimir={exportarImpressao}
        onEntorno={ehPessoa ? () => setTela({ nome: "entorno", id: tela.id }) : undefined}
        onExcluir={ehFichaMentorado ? undefined : async () => {
          await mudarPessoas(clienteAtual.id, pessoasAtuais.filter((p) => p.id !== pessoaAtual.id));
          setTela({ nome: ehPessoa ? "entorno" : "temperamentos", id: tela.id });
        }}
        onVoltar={() => (ehFichaMentorado || !ehPessoa ? setTela({ nome: ehPessoa ? "cliente" : "temperamentos", id: tela.id }) : setTela({ nome: "entorno", id: tela.id }))}
      />
    );
  }
  return null;
}
