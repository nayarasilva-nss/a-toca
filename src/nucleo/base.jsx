// ─── Enraizar — Sistema de Desenvolvimento Organizacional ──────
// Ferramenta de consultoria · Nayara Silva
// Método: Escuta · Raio-X · Acordo · Construção · Sustentação · Prova
// Paleta: Elegante, minimalista, enraizada

// Cores do Design System (Método Enraizar - Sofisticado & Intuitivo)
export const CORES = {
  // Método Enraizar — todas as cores vêm dos tokens em index.css (temas Floresta e Papel)
  principal: "var(--tinta)",
  principalEscuro: "var(--tinta)",
  principalClaro: "var(--tinta-areia)",
  dourado: "var(--ouro)",
  douradoEscuro: "var(--ouro-texto)",
  douradoClaro: "var(--ouro)",
  verde: "var(--tinta-salvia)",
  verdeClaro: "var(--linha-forte)",
  verdeEscuro: "var(--sucesso)",
  fundoPrincipal: "var(--fundo)",
  cartao: "var(--fundo-elevado)",
  hover: "var(--fundo-destaque)",
  texto: "var(--tinta)",
  textoDim: "var(--tinta-musgo)",
  border: "var(--linha)",
  fogo: "var(--tinta)",
  fogoEscuro: "var(--tinta)",
  laranja: "var(--linha-forte)",
  papel: "var(--fundo-elevado)",
  cremeClaro: "var(--fundo)",
  cremePalido: "var(--fundo-elevado)",
};

export const GRAVIDADES = ["leve", "media", "grave", "gravissima"];

export const GRAV_INFO = {
  leve: { rotulo: "Leve", medida: "Feedback registrado", cor: "var(--info)", fundo: "var(--info-fundo)" },
  media: { rotulo: "Média", medida: "Advertência escrita", cor: "var(--alerta)", fundo: "var(--alerta-fundo)" },
  grave: { rotulo: "Grave", medida: "Suspensão", cor: "var(--erro)", fundo: "var(--erro-fundo)" },
  gravissima: { rotulo: "Gravíssima", medida: "Desligamento por justa causa*", cor: "var(--erro)", fundo: "var(--erro-fundo)" },
};

export const STATUS_FRENTE = {
  nao_iniciada: { rotulo: "Não iniciada", cor: "var(--tinta-musgo)", fundo: "var(--fundo-recuo)" },
  em_andamento: { rotulo: "Em andamento", cor: "var(--alerta)", fundo: "var(--alerta-fundo)" },
  formalizada: { rotulo: "Formalizada", cor: "var(--sucesso)", fundo: "var(--sucesso-fundo)" },
  concluida: { rotulo: "Concluída", cor: "var(--sucesso)", fundo: "var(--sucesso-fundo)" },
};

export const STATUS_TREINAMENTO = {
  planejado: { rotulo: "Planejado", cor: "var(--alerta)", fundo: "var(--alerta-fundo)" },
  confirmado: { rotulo: "Confirmado", cor: "var(--info)", fundo: "var(--info-fundo)" },
  em_progresso: { rotulo: "Em progresso", cor: "var(--alerta)", fundo: "var(--alerta-fundo)" },
  realizado: { rotulo: "Realizado", cor: "var(--sucesso)", fundo: "var(--sucesso-fundo)" },
  avaliado: { rotulo: "Avaliado", cor: "var(--sucesso)", fundo: "var(--sucesso-fundo)" },
};

export const TABELA_MAE = [
  ["Assiduidade e Ponto", "Atraso sem justificativa (acima da tolerância)", "leve"],
  ["Assiduidade e Ponto", "Esquecer marcação de ponto reiteradamente", "leve"],
  ["Assiduidade e Ponto", "Entregar atestado fora do prazo de 48h", "leve"],
  ["Assiduidade e Ponto", "Saída antecipada sem autorização do líder", "media"],
  ["Assiduidade e Ponto", "Falta sem aviso prévio ao líder", "media"],
  ["Assiduidade e Ponto", "Hora extra sem solicitação expressa do líder", "media"],
  ["Assiduidade e Ponto", "Registrar o ponto de outra pessoa", "grave"],
  ["Assiduidade e Ponto", "Abandono de posto durante o serviço", "grave"],
  ["Assiduidade e Ponto", "Falta injustificada por mais de 30 dias (abandono de emprego)", "gravissima"],
  ["Uniforme e Higiene", "Apresentar-se sem uniforme completo ou com uniforme sujo", "leve"],
  ["Uniforme e Higiene", "Cabelo solto, unhas fora do padrão ou perfume em área de alimentos", "leve"],
  ["Uniforme e Higiene", "Uso de adornos (anéis, correntes, piercings) na cozinha/produção", "media"],
  ["Uniforme e Higiene", "Barba em setor de cozinha/produção", "media"],
  ["Conduta e Convivência", "Uso de celular fora do armário sem autorização do líder", "leve"],
  ["Conduta e Convivência", "Conversa excessiva ou dispersão que prejudique o serviço", "leve"],
  ["Conduta e Convivência", "Tratamento inadequado a cliente", "grave"],
  ["Conduta e Convivência", "Piadas ofensivas ou apelidos pejorativos", "grave"],
  ["Conduta e Convivência", "Desacato ou insubordinação a líder", "grave"],
  ["Conduta e Convivência", "Assédio moral ou sexual", "gravissima"],
  ["Conduta e Convivência", "Discriminação de qualquer natureza", "gravissima"],
  ["Conduta e Convivência", "Agressão física ou verbal, chantagem ou intimidação", "gravissima"],
  ["Conduta e Convivência", "Comparecer ao trabalho sob efeito de álcool ou drogas", "gravissima"],
  ["Operação e Padrão", "Não reportar falta de insumo ao gerente da unidade", "leve"],
  ["Operação e Padrão", "Não executar checklist da função", "media"],
  ["Operação e Padrão", "Descumprir ficha técnica ou padrão de preparo", "media"],
  ["Operação e Padrão", "Descumprir norma de manipulação/armazenamento de alimentos", "grave"],
  ["Operação e Padrão", "Servir produto fora do padrão de qualidade conscientemente", "grave"],
  ["Patrimônio e Insumos", "Desperdício de insumos por negligência", "media"],
  ["Patrimônio e Insumos", "Consumo de produtos sem autorização", "grave"],
  ["Patrimônio e Insumos", "Dano a equipamento por mau uso", "grave"],
  ["Patrimônio e Insumos", "Furto ou apropriação de bens, insumos ou valores", "gravissima"],
  ["Segurança", "Não utilizar EPI fornecido", "media"],
  ["Segurança", "Manusear equipamento elétrico com mãos molhadas", "media"],
  ["Segurança", "Não comunicar acidente de trabalho em até 24h", "media"],
  ["Segurança", "Colocar colega ou cliente em risco por negligência grave", "grave"],
].map(([s, i, g]) => ({ setor: s, infracao: i, gravidade: g }));

export const uid = () => Math.random().toString(36).slice(2, 9);
