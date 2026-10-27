import { neon } from '@neondatabase/serverless';
import { configurado as whatsappConfigurado, canalAtivo as canalWhatsApp, enviarWhatsApp } from './whatsapp.js';

// Avisos no celular da consultora: WhatsApp (API oficial ou CallMeBot) e/ou Telegram.
// Telegram: TELEGRAM_BOT_TOKEN na Vercel; o chat é descoberto uma vez e guardado em kv (toca:telegram:chat).

const TELEGRAM = 'https://api.telegram.org/bot';

function db() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error('DATABASE_URL não configurada');
  return neon(url);
}

async function lerKV(sql, chave) {
  const linhas = await sql`SELECT valor FROM kv WHERE chave = ${chave}`;
  if (!linhas.length) return null;
  let v = JSON.parse(linhas[0].valor);
  if (typeof v === 'string' && /^\s*[[{"]/.test(v)) { try { v = JSON.parse(v); } catch {} }
  return v;
}
async function gravarKV(sql, chave, valor) {
  const s = JSON.stringify(valor);
  await sql`INSERT INTO kv (chave, valor, atualizado_em) VALUES (${chave}, ${s}, now()) ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor, atualizado_em = now()`;
}

export const telegramTemToken = () => !!process.env.TELEGRAM_BOT_TOKEN;

export async function telegramChat(sql) {
  if (!telegramTemToken()) return null;
  const v = await lerKV(sql || db(), 'toca:telegram:chat');
  return v && v.id ? v : null;
}

// Descobre o chat: a Nay manda qualquer mensagem para o bot e o app lê as últimas atualizações.
export async function conectarTelegram(sql) {
  if (!telegramTemToken()) return { ok: false, motivo: 'TELEGRAM_BOT_TOKEN não está na Vercel' };
  const r = await fetch(`${TELEGRAM}${process.env.TELEGRAM_BOT_TOKEN}/getUpdates?limit=20`);
  const j = await r.json().catch(() => ({}));
  if (!j.ok) return { ok: false, motivo: `Telegram: ${j.description || 'token inválido'}` };
  const privados = (j.result || []).map((u) => (u.message || u.edited_message || {}).chat).filter((c) => c && c.type === 'private');
  const chat = privados[privados.length - 1];
  if (!chat) return { ok: false, motivo: 'nenhuma mensagem recebida ainda: abra o bot no Telegram, mande "oi" e clique de novo' };
  const dados = { id: chat.id, nome: [chat.first_name, chat.last_name].filter(Boolean).join(' ') || chat.username || String(chat.id), em: new Date().toISOString() };
  await gravarKV(sql || db(), 'toca:telegram:chat', dados);
  await enviarTelegram('✅ Enraizar conectado. Os avisos de lead, pedido e o resumo diário vão chegar aqui.', dados.id);
  return { ok: true, chat: dados };
}

export async function enviarTelegram(texto, chatId = null) {
  if (!telegramTemToken()) return { ok: false, motivo: 'TELEGRAM_BOT_TOKEN não configurado' };
  let id = chatId;
  if (!id) { const c = await telegramChat(); if (!c) return { ok: false, motivo: 'Telegram sem chat conectado: mande "oi" para o bot e clique em Conectar no app' }; id = c.id; }
  try {
    const controle = new AbortController();
    const t = setTimeout(() => controle.abort(), 10000);
    // texto puro, sem parse_mode: o resumo tem emojis e asteriscos que o Markdown do Telegram quebraria
    const r = await fetch(`${TELEGRAM}${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: id, text: texto.replace(/\*/g, ''), disable_web_page_preview: true }), signal: controle.signal });
    clearTimeout(t);
    const j = await r.json().catch(() => ({}));
    return j.ok ? { ok: true, canal: 'telegram' } : { ok: false, motivo: `Telegram: ${j.description || r.status}` };
  } catch (e) {
    return { ok: false, motivo: e.name === 'AbortError' ? 'Telegram não respondeu em 10 s' : e.message };
  }
}

export async function canais() {
  const t = telegramTemToken() ? await telegramChat().catch(() => null) : null;
  return { whatsapp: canalWhatsApp(), telegram: telegramTemToken() ? (t ? 'conectado' : 'sem chat') : null };
}

export function algumConfigurado() {
  return whatsappConfigurado() || telegramTemToken();
}

// Manda pelos canais configurados; basta um chegar para ser ok.
export async function enviarAviso(texto) {
  const resultados = [];
  if (whatsappConfigurado()) resultados.push(await enviarWhatsApp(texto));
  if (telegramTemToken()) resultados.push(await enviarTelegram(texto));
  if (!resultados.length) return { ok: false, motivo: 'nenhum canal configurado (WhatsApp ou Telegram)' };
  const ok = resultados.filter((r) => r.ok);
  if (ok.length) return { ok: true, canal: ok.map((r) => r.canal).join('+'), falhas: [...resultados.filter((r) => !r.ok).map((r) => r.motivo), ...ok.filter((r) => r.aviso).map((r) => `${r.canal}: ${r.aviso}`)] };
  return { ok: false, motivo: resultados.map((r) => r.motivo).join(' | ') };
}
