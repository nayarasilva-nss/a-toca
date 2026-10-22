import { neon } from '@neondatabase/serverless';
import { exigirSessao, novoId } from './_lib/sessao.js';
import { enviarWhatsApp } from './_lib/whatsapp.js';

// Pedidos dos liderados: POST público com o código do link (toca:pedidos:codigo); o resto exige a consultora.

export const STATUS_PEDIDO = ['pendente', 'aceito', 'recusado'];
const PRIORIDADES = ['normal', 'urgente'];
const LIMITE_POR_IP = 10;
const JANELA_MS = 10 * 60 * 1000;
const envios = new Map();

let tabelaPronta = false;
async function db() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error('DATABASE_URL não configurada');
  const sql = neon(url);
  if (!tabelaPronta) {
    await sql`CREATE TABLE IF NOT EXISTS pedidos (
      id TEXT PRIMARY KEY,
      criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
      nome TEXT NOT NULL,
      contato TEXT NOT NULL DEFAULT '',
      pedido TEXT NOT NULL,
      prazo TEXT NOT NULL DEFAULT '',
      prioridade TEXT NOT NULL DEFAULT 'normal',
      status TEXT NOT NULL DEFAULT 'pendente',
      obs TEXT NOT NULL DEFAULT '',
      tarefa_id TEXT
    )`;
    tabelaPronta = true;
  }
  return sql;
}

const texto = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const publico = (p) => ({ id: p.id, criadoEm: p.criado_em, nome: p.nome, contato: p.contato, pedido: p.pedido, prazo: p.prazo, prioridade: p.prioridade, status: p.status, obs: p.obs, tarefaId: p.tarefa_id });

async function codigoAtual(sql) {
  const linhas = await sql`SELECT valor FROM kv WHERE chave = 'toca:pedidos:codigo'`;
  if (!linhas.length) return '';
  let v = linhas[0].valor;
  try { v = JSON.parse(v); } catch {}
  if (typeof v === 'string') { try { const w = JSON.parse(v); if (typeof w === 'string') v = w; } catch {} }
  return typeof v === 'string' ? v : '';
}

function estourouLimite(req) {
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || '?';
  const agora = Date.now();
  const lista = (envios.get(ip) || []).filter((t) => agora - t < JANELA_MS);
  lista.push(agora);
  envios.set(ip, lista);
  return lista.length > LIMITE_POR_IP;
}

export default async (req, res) => {
  let sql;
  try {
    sql = await db();
  } catch (e) {
    console.error('pedidos: banco indisponível', e.message);
    return res.status(503).json({ error: 'Banco de dados indisponível' });
  }

  try {
    // público: confere se o link é válido
    if (req.method === 'GET' && req.query?.c !== undefined) {
      const codigo = await codigoAtual(sql);
      const ok = !!codigo && texto(req.query.c, 80) === codigo;
      return res.status(ok ? 200 : 404).json(ok ? { ok: true } : { error: 'Este link não está ativo.' });
    }

    // público: envia um pedido
    if (req.method === 'POST') {
      const b = req.body || {};
      if (texto(b.site, 50)) return res.status(200).json({ ok: true });
      const codigo = await codigoAtual(sql);
      if (!codigo || texto(b.c, 80) !== codigo) return res.status(403).json({ error: 'Este link não está ativo.' });
      if (estourouLimite(req)) return res.status(429).json({ error: 'Muitos envios. Tente de novo em alguns minutos.' });
      const nome = texto(b.nome, 120);
      const pedido = texto(b.pedido, 3000);
      if (nome.length < 2) return res.status(400).json({ error: 'Informe seu nome' });
      if (pedido.length < 3) return res.status(400).json({ error: 'Escreva o que você precisa' });
      const prazo = /^\d{4}-\d{2}-\d{2}$/.test(b.prazo || '') ? b.prazo : '';
      const prioridade = PRIORIDADES.includes(b.prioridade) ? b.prioridade : 'normal';
      const contato = texto(b.contato, 120);
      const id = novoId();
      await sql`INSERT INTO pedidos (id, nome, contato, pedido, prazo, prioridade) VALUES (${id}, ${nome}, ${contato}, ${pedido}, ${prazo}, ${prioridade})`;
      const aviso = await enviarWhatsApp(`📥 Novo pedido de *${nome}*${prioridade === 'urgente' ? ' ⚠️ urgente' : ''}${prazo ? ` · prazo ${prazo.split('-').reverse().join('/')}` : ''}\n${pedido.length > 400 ? pedido.slice(0, 400) + '…' : pedido}${contato ? `\nContato: ${contato}` : ''}\n\nTriar: https://enraizar.vercel.app`);
      if (!aviso.ok) console.warn('pedidos: aviso no WhatsApp não enviado —', aviso.motivo);
      return res.status(200).json({ ok: true });
    }

    if (!exigirSessao(req, res, ['consultora'])) return;

    if (req.method === 'GET') {
      if (req.query?.resumo) {
        const [{ n }] = await sql`SELECT count(*)::int AS n FROM pedidos WHERE status = 'pendente'`;
        return res.status(200).json({ pendentes: n });
      }
      const linhas = await sql`SELECT * FROM pedidos ORDER BY (status = 'pendente') DESC, criado_em DESC LIMIT 500`;
      return res.status(200).json({ pedidos: linhas.map(publico) });
    }

    if (req.method === 'PATCH') {
      const { id, status, obs, tarefaId } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id obrigatório' });
      if (status !== undefined && !STATUS_PEDIDO.includes(status)) return res.status(400).json({ error: 'status inválido' });
      const [atual] = await sql`SELECT * FROM pedidos WHERE id = ${id}`;
      if (!atual) return res.status(404).json({ error: 'Pedido não encontrado' });
      const novo = { status: status ?? atual.status, obs: obs !== undefined ? texto(obs, 2000) : atual.obs, tarefa_id: tarefaId !== undefined ? tarefaId : atual.tarefa_id };
      await sql`UPDATE pedidos SET status = ${novo.status}, obs = ${novo.obs}, tarefa_id = ${novo.tarefa_id} WHERE id = ${id}`;
      return res.status(200).json({ pedido: publico({ ...atual, ...novo }) });
    }

    if (req.method === 'DELETE') {
      const id = req.query?.id;
      if (!id) return res.status(400).json({ error: 'id obrigatório' });
      await sql`DELETE FROM pedidos WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('pedidos:', e);
    return res.status(500).json({ error: 'Erro interno' });
  }
};
