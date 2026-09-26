import { Ilustracao } from "./arvore.jsx";

export function Cabecalho({ onHome, onClientes, usuario, onSair, tema, onTema }) {
  return (
    <header className="enz-cabecalho print:hidden">
      <button onClick={onHome} className="enz-cabecalho-marca" aria-label="Início">
        <Ilustracao nome="broto-raiz" largura={30} altura={38} />
        <span className="enz-cabecalho-nome">
          <span className="enz-marca">Enraizar</span>
          <span className="enz-rotulo enz-assinatura">Método · desenvolvimento organizacional</span>
        </span>
      </button>
      <span className="enz-lema">Todo crescimento começa em quem enraíza.</span>
      <div className="enz-cabecalho-acoes">
        {onClientes && (
          <button onClick={onClientes} className="enz-botao enz-botao-contorno enz-botao-pequeno">
            Clientes
          </button>
        )}
        {onTema && (
          <button onClick={() => onTema(tema === "papel" ? "floresta" : "papel")} className="enz-sair" title="Alternar entre os temas Floresta e Papel">
            {tema === "papel" ? "Floresta" : "Papel"}
          </button>
        )}
        {usuario && onSair && (
          <button onClick={onSair} className="enz-sair" title={usuario.email}>
            Sair
          </button>
        )}
      </div>
    </header>
  );
}
