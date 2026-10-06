import { ModuloPercepcoes } from "../modulos/percepcoes.jsx";
import { FOCOS_MENTORIA, focoDe } from "../nucleo/focos.jsx";
import { PAPEIS } from "../nucleo/percepcao.jsx";
import { stGet } from "../nucleo/persistencia.jsx";

export function TelaPercepcoes({ app }) {
  const { clienteAtual, diagsLiderAtuais, frameworkMentorado, mentoriaAtual, percepcoesPorCliente, salvarColecao, setTela, tela } = app;
  if (tela.nome !== "percepcoes" || !clienteAtual) return null;
  const convites = percepcoesPorCliente[clienteAtual.id] || [];
  const foco = focoDe(mentoriaAtual);

  const criar = async (papel, rodada) => {
    const token = crypto.randomUUID();
    const convite = { id: crypto.randomUUID(), token, papel, rodada, criadoEm: new Date().toISOString(), respostas: null };
    await window.storage.set(`percepcao:${token}`, {
      clienteId: clienteAtual.id,
      conviteId: convite.id,
      mentorado: clienteAtual.negocio,
      papel,
      rotuloPapel: PAPEIS[papel],
      foco,
      rodada,
      areas: frameworkMentorado.map((a) => ({ area: a.area, criterios: a.criterios })),
    });
    await salvarColecao("percepcoes", clienteAtual.id, [...convites, convite]);
  };

  const cancelar = async (c) => {
    await window.storage.delete(`percepcao:${c.token}`);
    await salvarColecao("percepcoes", clienteAtual.id, convites.filter((x) => x.id !== c.id));
  };

  const atualizar = async () => {
    const fresco = await stGet(`toca:percepcoes:${clienteAtual.id}`, { fresco: true });
    if (Array.isArray(fresco)) await salvarColecao("percepcoes", clienteAtual.id, fresco);
  };

  return (
    <ModuloPercepcoes
      cliente={clienteAtual}
      convites={convites}
      framework={frameworkMentorado}
      diagnosticos={diagsLiderAtuais}
      temFoco={!!foco && !!FOCOS_MENTORIA[foco]}
      onCriar={criar}
      onCancelar={cancelar}
      onAtualizar={atualizar}
      onVoltar={() => setTela({ nome: "cliente", id: tela.id })}
    />
  );
}
