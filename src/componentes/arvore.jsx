const ARQUIVOS = {
  raizes: "arvore-raizes-capa",
  inteira: "arvore-inteira",
  frutos: "arvore-frutos",
  rasa: "arvore-rasa",
  sustentacao: "raizes-sustentacao",
  broto: "broto-raiz",
};

const PROPORCAO = { raizes: 1.1, inteira: 1.1, frutos: 1.1, rasa: 1, sustentacao: 0.8, broto: 1.3 };

// Ilustrações do Método Enraizar: creme sobre transparente na Floresta; no Papel viram máscara pintada em `tinta`.
export function Ilustracao({ nome, largura, altura, className = "", alt = "", style }) {
  return (
    <span
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      className={`enz-ilustracao ${className}`}
      style={{ "--enz-img": `url(/enraizar/${nome}.webp)`, width: largura, height: altura ?? largura, ...style }}
    />
  );
}

export function ArvoreEnraizar({ variante = "raizes", tamanho = 140, alt = "", className = "", style }) {
  const nome = ARQUIVOS[variante] || ARQUIVOS.raizes;
  return <Ilustracao nome={nome} largura={tamanho} altura={Math.round(tamanho * (PROPORCAO[variante] || 1.1))} alt={alt} className={className} style={style} />;
}
