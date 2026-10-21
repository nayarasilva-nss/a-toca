import { Ilustracao } from "./arvore.jsx";

export function Cabecalho({ onHome, onClientes, onLeads, leadsNovos = 0, usuario, onSair, tema, onTema }) {
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
        {onLeads && (
          <button onClick={onLeads} className="enz-botao enz-botao-contorno enz-botao-pequeno" title="Quem chegou pelo site">
            Leads{leadsNovos > 0 && <span style={{ marginLeft: 6, padding: "1px 7px", borderRadius: 999, background: "var(--alerta)", color: "var(--fundo)", fontSize: 11, fontWeight: 700 }}>{leadsNovos}</span>}
          </button>
        )}
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
