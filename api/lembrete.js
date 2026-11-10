import { neon } from '@neondatabase/serverless';
import { algumConfigurado, enviarAviso } from './_lib/avisos.js';
import { textoLembrete } from '../src/nucleo/agenda-base.js';
import { limparLeadsAntigos, textoLimpeza } from './_lib/limpeza.js';

// Lembrete diário no celular — Telegram e/ou WhatsApp (cron da Vercel, ver vercel.json): tarefas de hoje, atrasadas e pedidos a triar.
// Vercel manda Authorization: Bearer <CRON_SECRET> quando a variável existe; fora do cron, só a consultora pode disparar à mão.

async function lerKV(sql, chave) {
  const linhas = await sql`SELECT valor FROM kv WHERE chave = ${chave}`;
  if (!linhas.length) return null;
  let v = JSON.parse(linhas[0].valor);
  if (typeof v === 'string' && /^\s*[[{]/.test(v)) v = JSON.parse(v);
  return v;
}

export default async (req, res) => {
  const segredo = process.env.CRON_SECRET;
  const auth = req.headers.authorization || '';
  const doCron = !!segredo && auth === `Bearer ${segredo}`;
  if (!doCron) {
    const { sessaoDe } = await import('./_lib/sessao.js');
    const s = sessaoDe(req);
    if (!s || s.papel !== 'consultora') return res.status(401).json({ error: 'não autorizado' });
  }
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) return res.status(503).json({ error: 'DATABASE_URL não configurada' });
  const sql = neon(url);
  // limpeza dos leads antigos: vale mesmo sem canal de aviso configurado
  let limpeza = { apagados: 0, aVencer: [] };
  try { limpeza = await limparLeadsAntigos(sql); } catch (e) { console.error('lembrete: limpeza de leads falhou —', e.message); }
  if (!algumConfigurado()) return res.status(200).json({ ok: false, motivo: 'nenhum canal de aviso configurado (Telegram ou WhatsApp)', limpeza: { apagados: limpeza.apagados, aVencer: limpeza.aVencer.length } });

  try {
    const tarefas = (await lerKV(sql, 'toca:tarefas')) || [];
    let pendentes = 0;
    try { const [{ n }] = await sql`SELECT count(*)::int AS n FROM pedidos WHERE status = 'pendente'`; pendentes = n; } catch {}
    // hoje no fuso de Brasília
    const agora = new Date(Date.now() - 3 * 3600 * 1000);
    const hoje = agora.toISOString().slice(0, 10);
    const extra = textoLimpeza(limpeza);
    const texto = [textoLembrete(tarefas, pendentes, hoje), extra].filter(Boolean).join('\n\n');
    const r = await enviarAviso(texto);
    return res.status(200).json({ ...r, hoje, tarefas: tarefas.length, pendentes, limpeza: { apagados: limpeza.apagados, aVencer: limpeza.aVencer.length } });
  } catch (e) {
    console.error('lembrete:', e);
    return res.status(500).json({ error: 'Erro interno' });
  }
};
