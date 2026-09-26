import { ArvoreEnraizar } from "../componentes/arvore.jsx";
import { Cabecalho } from "../componentes/cabecalho.jsx";
import { TituloSecao, Citacao } from "../componentes/enraizar.jsx";

export function AreaMentorado({ usuario, onSair, tema, onTema }) {
  const primeiroNome = (usuario.nome || "").split(" ")[0];
  return (
    <div className="min-h-screen">
      <Cabecalho usuario={usuario} onSair={onSair} tema={tema} onTema={onTema} />
      <main className="enz-container grid gap-12 items-center lg:grid-cols-[minmax(0,560px)_1fr]">
        <div>
          <TituloSecao rotulo="Sua jornada" titulo={`Oi, ${primeiroNome}.`} virada="Sua área está sendo preparada." />
          <p style={{ marginTop: 24, maxWidth: 520, fontSize: 16, lineHeight: 1.6 }}>
            Em breve você verá aqui seus encontros, o pra casa de cada etapa, as metas combinadas e o registro da sua evolução.
          </p>
          <div style={{ marginTop: 40 }}>
            <Citacao>A autonomia nunca é construída diretamente.</Citacao>
          </div>
        </div>
        <div className="hidden lg:flex justify-center">
          <ArvoreEnraizar variante="inteira" tamanho={320} />
        </div>
      </main>
    </div>
  );
}
