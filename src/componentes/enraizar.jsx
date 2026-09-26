import { Ilustracao } from "./arvore.jsx";

export function TituloSecao({ rotulo, titulo, virada, descricao, nivel = 1, alinhamento = "esquerda", acoes, className = "" }) {
  const Tag = nivel === 1 ? "h1" : nivel === 2 ? "h2" : "h3";
  return (
    <div className={`enz-titulo-secao ${alinhamento === "centro" ? "is-centro" : ""} ${className}`}>
      {rotulo && <span className="enz-rotulo">{rotulo}</span>}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <Tag className={`enz-titulo ${nivel === 2 ? "is-2" : nivel === 3 ? "is-3" : ""}`}>
          {titulo}
          {virada && <span className="enz-virada">{virada}</span>}
        </Tag>
        {acoes && <div className="flex gap-2 flex-wrap items-center" style={{ paddingTop: 6 }}>{acoes}</div>}
      </div>
      {descricao && <p className="enz-titulo-descricao">{descricao}</p>}
    </div>
  );
}

export function Card({ children, rotulo, titulo, subtitulo, variante = "padrao", className = "", style, onClick }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag type={onClick ? "button" : undefined} onClick={onClick} style={style} className={`enz-card ${variante === "vazado" ? "enz-card-vazado" : ""} ${onClick ? "enz-card-clicavel" : ""} ${className}`}>
      {rotulo && <span className="enz-rotulo">{rotulo}</span>}
      {titulo && <div className="enz-card-titulo">{titulo}</div>}
      {subtitulo && <div className="enz-card-subtitulo">{subtitulo}</div>}
      {children && <div className="enz-card-corpo">{children}</div>}
    </Tag>
  );
}

export function Citacao({ children, autor, tom = "salvia" }) {
  return (
    <figure className={`enz-citacao ${tom === "areia" ? "is-areia" : ""}`}>
      <blockquote>{children}</blockquote>
      {autor && <figcaption className="enz-nota">{autor}</figcaption>}
    </figure>
  );
}

export const FASES = [
  { id: "escuta", nome: "Escuta", semente: "a semente", img: "fase-1-escuta" },
  { id: "raiox", nome: "Raio-X", semente: "a análise do solo", img: "fase-2-raio-x" },
  { id: "acordo", nome: "Acordo", semente: "o plantio decidido", img: "fase-3-acordo" },
  { id: "construcao", nome: "Construção", semente: "raízes e tronco", img: "fase-4-construcao" },
  { id: "sustentacao", nome: "Sustentação", semente: "de pé, sem tutor", img: "fase-5-sustentacao" },
  { id: "prova", nome: "Prova", semente: "os frutos", img: "fase-6-prova" },
];

// faseAtual: 0 = nenhuma concluída … 6 = todas. contagens: { [id]: número } mostra um número sob cada fase.
export function FasesEnraizar({ faseAtual = 0, compacto = false, contagens, onFase }) {
  const glifo = compacto ? 40 : 64;
  return (
    <div className={`enz-fases ${compacto ? "is-compacto" : ""}`}>
      <div className="enz-fases-colunas">
        {FASES.map((f, i) => {
          const futura = i >= faseAtual && !contagens;
          const Tag = onFase ? "button" : "div";
          return (
            <Tag key={f.id} type={onFase ? "button" : undefined} onClick={onFase ? () => onFase(f.id) : undefined} className={`enz-fase ${futura ? "is-futura" : ""} ${onFase ? "is-clicavel" : ""}`}>
              <Ilustracao nome={f.img} largura={glifo} altura={glifo} className="enz-fase-glifo" />
              <div className="enz-fase-nome">{f.nome}</div>
              <div className="enz-fase-semente">{f.semente}</div>
              {contagens && <div className="enz-fase-contagem">{contagens[f.id] || 0}</div>}
            </Tag>
          );
        })}
      </div>
      <div className="enz-fases-trilho" aria-hidden="true">
        {faseAtual > 0 && <div className="enz-fases-seiva" style={{ width: `calc(100% / 6 * ${Math.min(faseAtual, 6) - 1})` }} />}
        {FASES.map((f, i) => (
          <span key={f.id} className={`enz-fases-ponto ${i >= faseAtual ? "is-futura" : ""} ${i === faseAtual - 1 ? "is-atual" : ""}`} style={{ left: `calc(100% / 12 + 100% / 6 * ${i})` }} />
        ))}
      </div>
    </div>
  );
}

export function RaizProgresso({ progresso = 0, rotulo }) {
  const pct = Math.max(0, Math.min(1, progresso)) * 100;
  return (
    <div>
      <div className="enz-raiz-trilho" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={rotulo}>
        <Ilustracao nome="linha-raizes" largura="100%" altura={42} className="enz-raiz-fundo" style={{ backgroundSize: "100% 100%" }} />
        <div className="enz-raiz-crescida" style={{ width: `${pct}%` }}>
          <Ilustracao nome="linha-raizes" largura="100%" altura={42} style={{ backgroundSize: "100% 100%", width: "100%" }} />
        </div>
      </div>
      {rotulo && <div className="enz-raiz-legenda">{rotulo}</div>}
    </div>
  );
}
