// ─── ENRAIZAR — Sistema de Desenvolvimento Organizacional ──────
// Ferramenta de consultoria · Nayara Silva
// Método: Escuta · Raio-X · Acordo · Construção · Sustentação · Prova
// Paleta: Elegante, minimalista, enraizada

// Cores do Design System (Método Enraizar - Sofisticado & Intuitivo)
export const CORES = {
  // Primárias - Enraizar
  principal: "#6B5D42",      // Marrom/café (títulos, estrutura principal)
  principalEscuro: "#4A4035", // Marrom escuro (borders, destaques)
  principalClaro: "#8B7A6B", // Marrom claro (textos secundários)

  // Acentos
  dourado: "#D4AF37",        // Dourado (labels, ênfases, árvore)
  douradoEscuro: "#B8860B",  // Dourado dark (hover states)
  douradoClaro: "#E8C547",   // Dourado claro (backgrounds)

  // Verde (nova) - Enraizar
  verde: "#4F6B3A",          // Verde terra/sálvia (acentos, status)
  verdeClaro: "#7BA85C",     // Verde claro (backgrounds, hovers)
  verdeEscuro: "#3D5630",    // Verde escuro (borders, destaques)

  // Backgrounds
  fundoPrincipal: "#F5F1E8", // Bege/creme claro (main background)
  cartao: "#FFFBF0",         // Creme branco (cards)
  hover: "#F0EDE5",          // Bege claro (hover states)

  // Neutras
  texto: "#4A4035",          // Texto principal (escuro)
  textoDim: "#8B7A6B",       // Texto dimmed (secundário)
  border: "#E8DFD3",         // Borders (claro)

  // Estados (mantém compatibilidade)
  fogo: "#6B5D42",           // Para compatibilidade
  fogoEscuro: "#4A4035",     // Para compatibilidade
  laranja: "#7BA85C",        // Para compatibilidade
  papel: "#FFFBF0",          // Para compatibilidade
  cremeClaro: "#F5F1E8",     // Para compatibilidade
  cremePalido: "#FFFBF0",    // Para compatibilidade
};

export const GRAVIDADES = ["leve", "media", "grave", "gravissima"];

export const GRAV_INFO = {
  leve: { rotulo: "Leve", medida: "Feedback registrado", cor: "#B8860B", fundo: CORES.hover },
  media: { rotulo: "Média", medida: "Advertência escrita", cor: "#9A6A2F", fundo: "#F2E3CB" },
  grave: { rotulo: "Grave", medida: "Suspensão", cor: "#8A3A2E", fundo: "#F0DCD2" },
  gravissima: { rotulo: "Gravíssima", medida: "Desligamento por justa causa*", cor: CORES.principal, fundo: "#EBD5D8" },
};

export const STATUS_FRENTE = {
  nao_iniciada: { rotulo: "Não iniciada", cor: CORES.textoDim, fundo: "#EFE8D6" },
  em_andamento: { rotulo: "Em andamento", cor: "#9A6A2F", fundo: "#F2E3CB" },
  formalizada: { rotulo: "Formalizada", cor: "#4F6B3A", fundo: "#E3EBD8" },
  concluida: { rotulo: "Concluída", cor: "#3C5A2B", fundo: "#D8E5D0" },
};

export const STATUS_TREINAMENTO = {
  planejado: { rotulo: "Planejado", cor: "#9A6A2F", fundo: "#F5E6C8" },
  confirmado: { rotulo: "Confirmado", cor: CORES.textoDim, fundo: "#EFE8D6" },
  em_progresso: { rotulo: "Em progresso", cor: "#9A6A2F", fundo: "#F2E3CB" },
  realizado: { rotulo: "Realizado", cor: "#4F6B3A", fundo: "#E3EBD8" },
  avaliado: { rotulo: "Avaliado", cor: "#3C5A2B", fundo: "#D8E5D0" },
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
