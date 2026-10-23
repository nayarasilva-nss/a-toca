import { neon } from '@neondatabase/serverless';
import { exigirSessao } from './_lib/sessao.js';
import { eventosDoApp } from '../src/nucleo/agenda-base.js';

// Agenda ↔ Google Agenda, sem OAuth, pelo formato iCal:
//  GET ?ics=<token>   público: calendário do Enraizar (tarefas, vencimentos, entregas) para assinar no Google
//  GET ?google=1      consultora: eventos da Google Agenda dela (endereço secreto iCal guardado em kv)
//  POST {googleUrl}   consultora: grava/limpa o endereço secreto;  POST {novoToken:true} gera outro token do feed

const FUSO = 'America/Sao_Paulo';

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
const novoToken = () => Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);

// ── exportação: Enraizar → Google ────────────────────────────────
const esc = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
const dobrar = (linha) => { const out = []; let l = linha; while (l.length > 73) { out.push(l.slice(0, 73)); l = ' ' + l.slice(73); } out.push(l); return out.join('\r\n'); };
const isoCompacto = (iso) => iso.replace(/-/g, '');
const somarDiaISO = (iso) => { const [a, m, d] = iso.split('-').map(Number); const dt = new Date(Date.UTC(a, m - 1, d + 1)); return dt.toISOString().slice(0, 10); };

async function montarICS(sql) {
  const tarefas = (await lerKV(sql, 'toca:tarefas')) || [];
  const clientes = (await lerKV(sql, 'toca:clientes')) || [];
  const financeiroPorCliente = {}; const sistemasPorCliente = {};
  for (const c of clientes) {
    financeiroPorCliente[c.id] = (await lerKV(sql, `toca:financeiro:${c.id}`)) || { parcelas: [] };
    sistemasPorCliente[c.id] = (await lerKV(sql, `toca:sistemas:${c.id}`)) || [];
  }
  const eventos = eventosDoApp({ clientes, financeiroPorCliente, sistemasPorCliente });
  const agora = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  const linhas = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Enraizar//Agenda//PT', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Enraizar', `X-WR-TIMEZONE:${FUSO}`];
  for (const t of tarefas) {
    if (!t.data || t.status === 'feita') continue;
    linhas.push('BEGIN:VEVENT', `UID:tarefa-${t.id}@enraizar`, `DTSTAMP:${agora}`);
    if (t.hora && /^\d{2}:\d{2}$/.test(t.hora)) {
      const ini = `${isoCompacto(t.data)}T${t.hora.replace(':', '')}00`;
      const [h, m] = t.hora.split(':').map(Number); const fim = new Date(2000, 0, 1, h, m + 30);
      linhas.push(`DTSTART;TZID=${FUSO}:${ini}`, `DTEND;TZID=${FUSO}:${isoCompacto(t.data)}T${String(fim.getHours()).padStart(2, '0')}${String(fim.getMinutes()).padStart(2, '0')}00`);
    } else {
      linhas.push(`DTSTART;VALUE=DATE:${isoCompacto(t.data)}`, `DTEND;VALUE=DATE:${isoCompacto(somarDiaISO(t.data))}`);
    }
    linhas.push(dobrar(`SUMMARY:${esc((t.prioridade === 'urgente' ? '⚠️ ' : '') + t.titulo)}`));
    if (t.detalhe || t.solicitante) linhas.push(dobrar(`DESCRIPTION:${esc([t.detalhe, t.solicitante ? `Pedido de ${t.solicitante}` : ''].filter(Boolean).join('\n'))}`));
    linhas.push('END:VEVENT');
  }
  for (const e of eventos) {
    linhas.push('BEGIN:VEVENT', `UID:${e.id}@enraizar`, `DTSTAMP:${agora}`, `DTSTART;VALUE=DATE:${isoCompacto(e.data)}`, `DTEND;VALUE=DATE:${isoCompacto(somarDiaISO(e.data))}`, dobrar(`SUMMARY:${esc(`${e.tipo === 'parcela' ? '💰' : '🛠'} ${e.titulo} — ${e.cliente}`)}`), 'END:VEVENT');
  }
  linhas.push('END:VCALENDAR');
  return linhas.join('\r\n') + '\r\n';
}

// ── importação: Google → Enraizar ────────────────────────────────
function desdobrar(texto) {
  return texto.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '').split('\n');
}
function lerProp(linha) {
  const i = linha.indexOf(':'); if (i < 0) return null;
  const [nome, ...params] = linha.slice(0, i).split(';');
  const p = {}; for (const x of params) { const [k, v] = x.split('='); p[k] = v; }
  return { nome: nome.toUpperCase(), params: p, valor: linha.slice(i + 1) };
}
const fmtData = new Intl.DateTimeFormat('en-CA', { timeZone: FUSO, year: 'numeric', month: '2-digit', day: '2-digit' });
const fmtHora = new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, hour: '2-digit', minute: '2-digit', hour12: false });
// devolve { data: 'AAAA-MM-DD', hora: 'HH:MM' | '', diaInteiro }
function converter(valor, params) {
  if ((params.VALUE === 'DATE') || /^\d{8}$/.test(valor)) return { data: `${valor.slice(0, 4)}-${valor.slice(4, 6)}-${valor.slice(6, 8)}`, hora: '', diaInteiro: true };
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z?)$/.exec(valor);
  if (!m) return null;
  if (m[7] === 'Z') { const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0))); return { data: fmtData.format(d), hora: fmtHora.format(d), diaInteiro: false, ms: d.getTime() }; }
  // sem Z: hora local do fuso informado (quase sempre São Paulo); tratamos como São Paulo
  return { data: `${m[1]}-${m[2]}-${m[3]}`, hora: `${m[4]}:${m[5]}`, diaInteiro: false };
}
const addDias = (iso, n) => { const [a, m, d] = iso.split('-').map(Number); const dt = new Date(Date.UTC(a, m - 1, d + n)); return dt.toISOString().slice(0, 10); };
const DIAS = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };
const diaSemana = (iso) => { const [a, m, d] = iso.split('-').map(Number); return new Date(Date.UTC(a, m - 1, d)).getUTCDay(); };

// expande recorrências simples (diária, semanal, mensal, anual) dentro da janela
function ocorrencias(inicio, rrule, exdatas, janelaIni, janelaFim) {
  if (!rrule) return inicio.data >= janelaIni && inicio.data <= janelaFim ? [inicio.data] : [];
  const r = {}; for (const x of rrule.split(';')) { const [k, v] = x.split('='); r[k] = v; }
  const freq = r.FREQ; const intervalo = Math.max(1, Number(r.INTERVAL) || 1);
  const until = r.UNTIL ? `${r.UNTIL.slice(0, 4)}-${r.UNTIL.slice(4, 6)}-${r.UNTIL.slice(6, 8)}` : null;
  const count = r.COUNT ? Number(r.COUNT) : null;
  const byday = freq === 'WEEKLY' && r.BYDAY ? r.BYDAY.split(',').map((d) => DIAS[d.slice(-2)]).filter((x) => x !== undefined) : null;
  const out = []; let n = 0; let data = inicio.data; let passos = 0;
  while (data <= janelaFim && passos < 2000 && (!until || data <= until) && (!count || n < count)) {
    passos++;
    const cabe = freq === 'WEEKLY' && byday ? byday.includes(diaSemana(data)) : true;
    if (cabe) { n++; if (data >= janelaIni && !exdatas.has(data)) out.push(data); }
    if (freq === 'DAILY') data = addDias(data, intervalo);
    else if (freq === 'WEEKLY') { data = addDias(data, 1); if (byday && diaSemana(data) === diaSemana(inicio.data) && intervalo > 1) data = addDias(data, 7 * (intervalo - 1)); else if (!byday) data = addDias(data, 7 * intervalo - 1); }
    else if (freq === 'MONTHLY') { const [a, m, d] = data.split('-').map(Number); const dt = new Date(Date.UTC(a, m - 1 + intervalo, d)); data = dt.toISOString().slice(0, 10); }
    else if (freq === 'YEARLY') { const [a, m, d] = data.split('-').map(Number); data = new Date(Date.UTC(a + intervalo, m - 1, d)).toISOString().slice(0, 10); }
    else break;
  }
  return out;
}

export function lerEventosICS(texto, janelaIni, janelaFim) {
  const linhas = desdobrar(texto);
  const eventos = []; let ev = null;
  for (const l of linhas) {
    if (l === 'BEGIN:VEVENT') { ev = { exdatas: new Set() }; continue; }
    if (l === 'END:VEVENT') {
      if (ev && ev.inicio && ev.resumo !== undefined) {
        for (const data of ocorrencias(ev.inicio, ev.rrule, ev.exdatas, janelaIni, janelaFim)) {
          eventos.push({ id: `g-${ev.uid || ev.resumo}-${data}`, data, hora: ev.inicio.hora, fim: ev.fim && !ev.fim.diaInteiro && ev.fim.data === ev.inicio.data ? ev.fim.hora : '', titulo: ev.resumo, local: ev.local || '', tipo: 'google' });
        }
      }
      ev = null; continue;
    }
    if (!ev) continue;
    const p = lerProp(l); if (!p) continue;
    if (p.nome === 'DTSTART') ev.inicio = converter(p.valor, p.params);
    else if (p.nome === 'DTEND') ev.fim = converter(p.valor, p.params);
    else if (p.nome === 'SUMMARY') ev.resumo = p.valor.replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\n/g, ' ');
    else if (p.nome === 'LOCATION') ev.local = p.valor.replace(/\\,/g, ',');
    else if (p.nome === 'UID') ev.uid = p.valor;
    else if (p.nome === 'RRULE') ev.rrule = p.valor;
    else if (p.nome === 'EXDATE') for (const v of p.valor.split(',')) { const c = converter(v.trim(), p.params); if (c) ev.exdatas.add(c.data); }
    else if (p.nome === 'STATUS' && p.valor === 'CANCELLED') ev.resumo = undefined;
  }
  return eventos.sort((a, b) => (a.data + (a.hora || '00:00')).localeCompare(b.data + (b.hora || '00:00')));
}

export default async (req, res) => {
  let sql;
  try { sql = db(); } catch { return res.status(503).json({ error: 'Banco de dados indisponível' }); }
  try {
    // feed público, protegido pelo token
    if (req.method === 'GET' && req.query?.ics !== undefined) {
      const cfg = (await lerKV(sql, 'toca:agenda:ics')) || {};
      if (!cfg.token || String(req.query.ics) !== cfg.token) return res.status(404).send('Calendário não encontrado');
      const ics = await montarICS(sql);
      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      return res.status(200).send(ics);
    }

    if (!exigirSessao(req, res, ['consultora'])) return;

    if (req.method === 'GET' && req.query?.google) {
      const cfg = (await lerKV(sql, 'toca:agenda:google')) || {};
      if (!cfg.url) return res.status(200).json({ configurado: false, eventos: [] });
      const hoje = fmtData.format(new Date());
      const janelaIni = addDias(hoje, -31); const janelaFim = addDias(hoje, 92);
      const controle = new AbortController(); const t = setTimeout(() => controle.abort(), 12000);
      let texto;
      try { const r = await fetch(cfg.url, { signal: controle.signal, headers: { 'User-Agent': 'Enraizar/1.0' } }); clearTimeout(t); if (!r.ok) return res.status(200).json({ configurado: true, erro: `Google respondeu ${r.status}`, eventos: [] }); texto = await r.text(); }
      catch (e) { clearTimeout(t); return res.status(200).json({ configurado: true, erro: e.name === 'AbortError' ? 'Google não respondeu em 12 s' : e.message, eventos: [] }); }
      if (!/BEGIN:VCALENDAR/.test(texto)) return res.status(200).json({ configurado: true, erro: 'o endereço não devolveu um calendário iCal', eventos: [] });
      return res.status(200).json({ configurado: true, eventos: lerEventosICS(texto, janelaIni, janelaFim), lidoEm: new Date().toISOString() });
    }

    if (req.method === 'GET') {
      let ics = (await lerKV(sql, 'toca:agenda:ics')) || {};
      if (!ics.token) { ics = { token: novoToken(), em: new Date().toISOString() }; await gravarKV(sql, 'toca:agenda:ics', ics); }
      const g = (await lerKV(sql, 'toca:agenda:google')) || {};
      return res.status(200).json({ icsToken: ics.token, googleUrl: g.url || '' });
    }

    if (req.method === 'POST') {
      const b = req.body || {};
      if (b.novoToken) { const ics = { token: novoToken(), em: new Date().toISOString() }; await gravarKV(sql, 'toca:agenda:ics', ics); return res.status(200).json({ icsToken: ics.token }); }
      if (b.googleUrl !== undefined) {
        const url = String(b.googleUrl || '').trim();
        if (url && !/^https:\/\/calendar\.google\.com\/calendar\/ical\/.+\.ics$/.test(url)) return res.status(400).json({ error: 'Cole o "endereço secreto no formato iCal" da Google Agenda (começa com https://calendar.google.com/calendar/ical/ e termina em .ics).' });
        await gravarKV(sql, 'toca:agenda:google', { url, em: new Date().toISOString() });
        return res.status(200).json({ ok: true, googleUrl: url });
      }
      return res.status(400).json({ error: 'nada para salvar' });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('agenda:', e);
    return res.status(500).json({ error: 'Erro interno' });
  }
};
