import { neon } from '@neondatabase/serverless';
import { exigirSessao, novoId } from './_lib/sessao.js';
import { textoLeadNovo } from './_lib/whatsapp.js';
import { algumConfigurado, canais, conectarTelegram, enviarAviso } from './_lib/avisos.js';

// Leads do site: POST é público (o formulário do site envia para cá); o resto exige a consultora logada.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const INTERESSES = ['Ainda não sei', 'Consultoria de estrutura', 'Sistemas personalizados', 'Treinamento de liderança', 'Mentoria'];
export const FUNCIONARIOS = ['Até 10', '11 a 30', '31 a 80', 'Mais de 80'];
export const STATUS_LEAD = ['novo', 'contatado', 'diagnostico', 'convertido', 'perdido'];
const LIMITE_POR_IP = 6; // envios por janela
const JANELA_MS = 10 * 60 * 1000;
const envios = new Map();

let tabelaPronta = false;
async function db() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error('DATABASE_URL não configurada');
  const sql = neon(url);
  if (!tabelaPronta) {
    await sql`CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
      nome TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      negocio TEXT NOT NULL DEFAULT '',
      funcionarios TEXT NOT NULL DEFAULT '',
      interesse TEXT NOT NULL DEFAULT '',
      dor TEXT NOT NULL DEFAULT '',
      origem TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'novo',
      obs TEXT NOT NULL DEFAULT '',
      cliente_id TEXT,
      diagnostico TEXT NOT NULL DEFAULT ''
    )`;
    await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS diagnostico TEXT NOT NULL DEFAULT ''`;
    tabelaPronta = true;
  }
  return sql;
}

const texto = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const lerDiag = (t) => { try { return t ? JSON.parse(t) : null; } catch { return null; } };
const publico = (l) => ({ id: l.id, criadoEm: l.criado_em, nome: l.nome, whatsapp: l.whatsapp, email: l.email, negocio: l.negocio, funcionarios: l.funcionarios, interesse: l.interesse, dor: l.dor, origem: l.origem, status: l.status, obs: l.obs, clienteId: l.cliente_id, diagnostico: lerDiag(l.diagnostico) });

// resultado do autodiagnóstico do site: { indice: 0-100, areas: [{ area, nota, max, pct, nivel }] }
function limparDiagnostico(d) {
  if (!d || typeof d !== 'object' || !Array.isArray(d.areas) || !d.areas.length || d.areas.length > 12) return '';
  const num = (v, max) => Math.max(0, Math.min(max, Math.round(Number(v) || 0)));
  const areas = d.areas.slice(0, 12).map((a) => ({ area: texto(a && a.area, 60), nota: num(a && a.nota, 100), max: num(a && a.max, 100), pct: num(a && a.pct, 100), nivel: texto(a && a.nivel, 40) })).filter((a) => a.area);
  if (!areas.length) return '';
  return JSON.stringify({ indice: num(d.indice, 100), areas });
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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
  if (req.method === 'OPTIONS') { cors(res); return res.status(204).end(); }

  let sql;
  try {
    sql = await db();
  } catch (e) {
    console.error('leads: banco indisponível', e.message);
    return res.status(503).json({ error: 'Banco de dados indisponível' });
  }

  try {
    if (req.method === 'POST') {
      cors(res);
      const b = req.body || {};
      if (texto(b.site, 50)) return res.status(200).json({ ok: true }); // honeypot: bots preenchem, pessoas não
      if (estourouLimite(req)) return res.status(429).json({ error: 'Muitos envios. Tente de novo em alguns minutos.' });
      const nome = texto(b.nome, 120);
      const whatsapp = texto(b.whatsapp, 30);
      const email = texto(b.email, 120);
      if (nome.length < 2) return res.status(400).json({ error: 'Informe seu nome' });
      if (whatsapp.replace(/\D/g, '').length < 8) return res.status(400).json({ error: 'Informe um WhatsApp válido' });
      if (email && !EMAIL.test(email)) return res.status(400).json({ error: 'Informe um e-mail válido' });
      const lead = {
        id: novoId(), nome, whatsapp, email,
        negocio: texto(b.negocio, 200), funcionarios: texto(b.funcionarios, 40), interesse: texto(b.interesse, 60),
        dor: texto(b.dor, 2000), origem: texto(b.origem, 80) || 'site',
        diagnostico: limparDiagnostico(b.diagnostico),
      };
      await sql`INSERT INTO leads (id, nome, whatsapp, email, negocio, funcionarios, interesse, dor, origem, diagnostico)
                VALUES (${lead.id}, ${lead.nome}, ${lead.whatsapp}, ${lead.email}, ${lead.negocio}, ${lead.funcionarios}, ${lead.interesse}, ${lead.dor}, ${lead.origem}, ${lead.diagnostico})`;
      const aviso = await enviarAviso(textoLeadNovo({ ...lead, diagnostico: lerDiag(lead.diagnostico) }));
      if (!aviso.ok) console.warn('leads: aviso não enviado —', aviso.motivo);
      return res.status(200).json({ ok: true });
    }

    if (!exigirSessao(req, res, ['consultora'])) return;

    if (req.method === 'GET' && req.query?.aviso === 'canais') return res.status(200).json(await canais());
    if (req.method === 'GET' && req.query?.aviso === 'telegram-conectar') return res.status(200).json(await conectarTelegram(sql));
    if (req.method === 'GET' && req.query?.aviso === 'testar') {
      if (!algumConfigurado()) return res.status(200).json({ ok: false, configurado: false, motivo: 'Nenhum canal configurado: Telegram (TELEGRAM_BOT_TOKEN) ou WhatsApp (WHATSAPP_NUMERO + WHATSAPP_CLOUD_TOKEN/PHONE_ID ou CALLMEBOT_APIKEY).' });
      const r = await enviarAviso('✅ Teste do Enraizar: os avisos de lead, pedido e o resumo diário vão chegar aqui.');
      return res.status(200).json({ ...r, configurado: true });
    }

    if (req.method === 'GET') {
      if (req.query?.resumo) {
        const [{ n }] = await sql`SELECT count(*)::int AS n FROM leads WHERE status = 'novo'`;
        return res.status(200).json({ novos: n });
      }
      const linhas = await sql`SELECT * FROM leads ORDER BY criado_em DESC LIMIT 500`;
      return res.status(200).json({ leads: linhas.map(publico) });
    }

    if (req.method === 'PATCH') {
      const { id, status, obs, clienteId } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id obrigatório' });
      if (status !== undefined && !STATUS_LEAD.includes(status)) return res.status(400).json({ error: 'status inválido' });
      const [atual] = await sql`SELECT * FROM leads WHERE id = ${id}`;
      if (!atual) return res.status(404).json({ error: 'Lead não encontrado' });
      const novo = { status: status ?? atual.status, obs: obs !== undefined ? texto(obs, 4000) : atual.obs, cliente_id: clienteId !== undefined ? clienteId : atual.cliente_id };
      await sql`UPDATE leads SET status = ${novo.status}, obs = ${novo.obs}, cliente_id = ${novo.cliente_id} WHERE id = ${id}`;
      return res.status(200).json({ lead: publico({ ...atual, ...novo }) });
    }

    if (req.method === 'DELETE') {
      const id = req.query?.id;
      if (!id) return res.status(400).json({ error: 'id obrigatório' });
      await sql`DELETE FROM leads WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('leads:', e);
    return res.status(500).json({ error: 'Erro interno' });
  }
};
