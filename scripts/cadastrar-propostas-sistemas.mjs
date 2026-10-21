// Cadastra Kenkyo e Tsuru Lab como clientes da trilha Sistemas, com escopo e proposta
// iguais aos PDFs enviados em 21/10/2026. Pode rodar mais de uma vez: não duplica.
import { readFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

for (const l of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL);
const uid = () => Math.random().toString(36).slice(2, 9);
const DATA = '21/10/2026';

const get = async (chave) => { const [r] = await sql`SELECT valor FROM kv WHERE chave = ${chave}`; return r ? JSON.parse(r.valor) : null; };
const set = (chave, valor) => sql`INSERT INTO kv (chave, valor) VALUES (${chave}, ${JSON.stringify(valor)}) ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor`;

const item = (blocoId, texto, horas, etapa = 'Construção') => ({ id: uid(), texto, horas, etapa, status: 'a_fazer', blocoId });
const forn = (texto) => ({ id: uid(), texto, recebido: false });
const sistema = (dados) => ({ nome: '', briefing: '', escopo: [], foraEscopo: '', fornecidoCliente: [], stack: '', prazoSemanas: '', inicio: '', entregueEm: '', mensalidade: '', mensalidadeAtiva: false, status: 'proposta', obs: '', registros: [], ...dados });
const proposta = (dados) => ({ id: uid(), tipo: 'sistema', data: DATA, status: 'enviada', rotulo: '', duracao: '', investimento: '', condicoesPagamento: '50% no aceite e 50% na entrega', validade: '15 dias', obs: '', apresentacao: '', objetivo: '', fases: '', entregaveis: '', metodologia: '', condicoesGerais: '', ...dados });

const CLIENTES = [
  {
    cliente: { negocio: 'Kenkyo', tipo: 'empresa', segmento: 'Restaurante japonês', setores: 'Recepção, salão, cozinha', regras: '', contexto: 'Usa o Tagme para reservas (R$ 296/mês). Quer organizar o salão por praças e garçons.', servicos: { consultoria: false, mentoria: false, treinamentos: false, sistemas: true } },
    sistema: sistema({
      nome: 'Sistema de reservas e gestão de salão',
      briefing: 'Duas formas de organizar o salão do Kenkyo por praças e garçons: substituir o Tagme por um sistema próprio, ou mantê-lo nas reservas e acrescentar um sistema de salão.',
      escopo: [
        item('levantamento', 'Levantamento e desenho das telas com o cliente', 4, 'Levantamento'),
        item('base-app', 'Base do sistema: login, papéis por função, banco e publicação', 8, 'Fundação'),
        item('reserva-link', 'Link de reserva com origem do cliente', 6),
        item('clientes', 'Cadastro de clientes com histórico de visitas', 6),
        item('whatsapp-link', 'Botão de WhatsApp com mensagem pronta', 2),
        item('mapa-mesas', 'Mapa de mesas por praça', 12),
        item('garcons', 'Atribuição de garçons por praça e turno', 5),
        item('painel-gestor', 'Painel de ocupação, no-show e origem', 6),
        item('implantacao', 'Implantação e treinamento da equipe', 4, 'Entrega'),
      ],
      foraEscopo: 'Migração do histórico de clientes do Tagme (Opção A)\nIntegração automática com Tagme, Saipos ou iFood\nOperação em mais de uma unidade\nPagamento online na reserva',
      mensalidade: '200',
      prazoSemanas: '5',
      obs: 'Cliente fundador: mensalidade congelada enquanto for cliente e novas funções sem custo adicional.',
    }),
    proposta: proposta({
      titulo: 'Sistema de reservas e gestão de salão',
      subtitulo: 'Duas formas de organizar o salão do Kenkyo por praças e garçons: substituir o Tagme por um sistema próprio, ou mantê-lo nas reservas e acrescentar um sistema de salão.',
      opcoes: [
        { id: uid(), nome: 'Opção A', titulo: 'Sistema próprio completo', descricao: 'Substitui o Tagme e concentra reservas, clientes e salão num só lugar.', escopo: 'Link de reserva com origem do cliente\nCadastro de clientes com histórico de visitas\nBotão de WhatsApp com mensagem pronta\nMapa de mesas por praça\nAtribuição de garçons por praça e turno\nPainel de ocupação, no-show e origem\nImplantação e treinamento da equipe', horasEstimadas: '53', investimento: 'R$ 6.400', mensalidade: '200', mensalidadeNota: '', prazo: '4 a 5 semanas' },
        { id: uid(), nome: 'Opção B', titulo: 'Tagme + sistema de salão', descricao: 'As reservas seguem no Tagme; a recepção marca no mapa as mesas reservadas do dia.', escopo: 'Mapa de mesas por praça\nAtribuição de garçons por praça e turno\nPainel de ocupação por praça e mesas por garçom\nImplantação e treinamento da equipe', horasEstimadas: '30', investimento: 'R$ 3.600', mensalidade: '100', mensalidadeNota: 'Tagme à parte', prazo: '2 a 3 semanas' },
      ],
      comparativo: 'Custo mensal total | R$ 200 | R$ 396 (Tagme R$ 296 + R$ 100)\nReservas e cadastro de clientes | Sistema próprio | Tagme\nCanais de reserva do Tagme | Deixam de existir | Mantidos',
      foraEscopo: 'Migração do histórico de clientes do Tagme (Opção A)\nIntegração automática com Tagme, Saipos ou iFood\nOperação em mais de uma unidade\nPagamento online na reserva',
      condicoesGerais: 'Sistema licenciado ao Kenkyo; o código permanece com a desenvolvedora\nCliente fundador: mensalidade congelada enquanto for cliente e novas funções sem custo adicional\nProposta válida por 15 dias',
      duracao: '4 a 5 semanas',
      investimento: 'R$ 6.400',
      mensalidade: '200',
      horasEstimadas: '53',
    }),
  },
  {
    cliente: { negocio: 'Tsuru Lab', tipo: 'empresa', segmento: 'Consultoria gastronômica — Método A.M.E.', setores: '', regras: '', contexto: 'Chef Egino. Site institucional a partir de wireframe já aprovado.', servicos: { consultoria: false, mentoria: false, treinamentos: false, sistemas: true } },
    sistema: sistema({
      nome: 'Site institucional Tsuru Lab',
      briefing: 'Desenvolvimento do site da Tsuru Lab a partir do wireframe já aprovado: oito páginas que apresentam o Método A.M.E., levam o visitante a agendar uma conversa e captam contatos pelo guia gratuito.',
      escopo: [
        item('site-home', 'Home — oito seções, do topo à chamada final para agendar', 6),
        item('site-pagina', 'Serviços — o método em 3 passos e o caminho típico do cliente', 2.5),
        item('site-pagina', 'Imersão 360° — página de detalhe', 2.5),
        item('site-pagina', 'Consultoria A.M.E. — página de detalhe', 2.5),
        item('site-pagina', 'Assessoria — página de detalhe', 2.5),
        item('site-pagina', 'Sobre — o Chef Egino apresentado como guia', 2.5),
        item('site-pagina', 'Cases — resultados de clientes atendidos', 2.5),
        item('site-contato', 'Contato — formulário "Agende uma conversa" com aviso por e-mail', 3),
        item('site-captura', 'Captura de e-mail com entrega do guia gratuito', 3),
        item('whatsapp-link', 'Botão de WhatsApp', 2),
        item('site-seo', 'SEO básico e Google Analytics', 2, 'Entrega'),
        item('site-dominio', 'Configuração do domínio e publicação', 2, 'Entrega'),
        item('ajustes', 'Rodada de ajustes após a primeira versão', 4, 'Entrega'),
      ],
      foraEscopo: 'Loja virtual\nAgendamento online\nE-mail profissional',
      fornecidoCliente: [forn('Números do Chef, depoimentos e cases reais'), forn('Fotos e logo em alta resolução'), forn('Guia gratuito pronto em PDF'), forn('Acesso ao painel do domínio')],
      mensalidade: '100',
      prazoSemanas: '4',
      obs: 'Domínio já registrado pelo cliente; a renovação anual segue com o cliente.',
    }),
    proposta: proposta({
      titulo: 'Site institucional Tsuru Lab',
      subtitulo: 'Desenvolvimento do site da Tsuru Lab a partir do wireframe já aprovado: oito páginas que apresentam o Método A.M.E., levam o visitante a agendar uma conversa e captam contatos pelo guia gratuito.',
      entregaveis: 'Home — oito seções, do topo à chamada final para agendar\nServiços — o método em 3 passos e o caminho típico do cliente\nImersão 360° · Consultoria A.M.E. · Assessoria — uma página de detalhe para cada produto\nSobre — o Chef Egino apresentado como guia\nCases — resultados de clientes atendidos\nContato — formulário "Agende uma conversa" com aviso por e-mail\nTambém inclui: captura de e-mail com entrega do guia gratuito, botão de WhatsApp, versão para celular, SEO básico, Google Analytics, configuração do domínio e publicação',
      fornecidoCliente: 'Números do Chef, depoimentos e cases reais\nFotos e logo em alta resolução\nGuia gratuito pronto em PDF\nAcesso ao painel do domínio',
      foraEscopo: 'Loja virtual, agendamento online e e-mail profissional',
      condicoesGerais: 'Uma rodada de ajustes após a primeira versão\nMensalidade: hospedagem, certificado de segurança, backups e pequenas alterações\nDomínio: já registrado pelo cliente; a renovação anual segue com o cliente\nProposta válida por 15 dias',
      duracao: '3 a 4 semanas após o recebimento do conteúdo final',
      investimento: 'R$ 2.500',
      mensalidade: '100',
      horasEstimadas: '37,5',
    }),
  },
];

const lista = (await get('toca:clientes')) || [];
for (const { cliente, sistema: sis, proposta: prop } of CLIENTES) {
  let c = lista.find((x) => x.negocio.toLowerCase() === cliente.negocio.toLowerCase());
  if (!c) { c = { ...cliente, id: uid() }; lista.push(c); console.log(`+ cliente ${c.negocio} (${c.id})`); }
  else { Object.assign(c, { servicos: { ...(c.servicos || {}), sistemas: true } }); console.log(`= cliente ${c.negocio} já existia (${c.id})`); }
  await set(`toca:sistemas:${c.id}`, sis);
  const props = (await get(`toca:propostas:${c.id}`)) || [];
  const jaTem = props.find((p) => p.titulo === prop.titulo);
  await set(`toca:propostas:${c.id}`, jaTem ? props.map((p) => (p.id === jaTem.id ? { ...p, ...prop, id: p.id } : p)) : [...props, prop]);
  console.log(`  sistema + proposta "${prop.titulo}" gravados`);
}
await set('toca:clientes', lista);
console.log('pronto.');
