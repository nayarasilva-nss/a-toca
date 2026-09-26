import crypto from 'node:crypto';

const NOME_COOKIE = 'enraizar_sessao';
const DURACAO_S = 30 * 24 * 3600;

function segredo() {
  const s = process.env.SESSAO_SEGREDO;
  if (!s) throw new Error('SESSAO_SEGREDO não configurado');
  return s;
}

const assinar = (payload) => crypto.createHmac('sha256', segredo()).update(payload).digest('base64url');

export function criarToken(dados) {
  const payload = Buffer.from(JSON.stringify({ ...dados, exp: Math.floor(Date.now() / 1000) + DURACAO_S })).toString('base64url');
  return `${payload}.${assinar(payload)}`;
}

export function lerToken(token) {
  if (!token) return null;
  const [payload, assinatura] = token.split('.');
  if (!payload || !assinatura) return null;
  const esperada = assinar(payload);
  if (assinatura.length !== esperada.length || !crypto.timingSafeEqual(Buffer.from(assinatura), Buffer.from(esperada))) return null;
  try {
    const dados = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return dados.exp > Date.now() / 1000 ? dados : null;
  } catch {
    return null;
  }
}

export function lerCookies(req) {
  const bruto = req.headers.cookie || '';
  const pares = bruto.split(';').map((c) => c.trim()).filter(Boolean);
  return Object.fromEntries(pares.map((p) => { const i = p.indexOf('='); return [p.slice(0, i), decodeURIComponent(p.slice(i + 1))]; }));
}

export const sessaoDe = (req) => lerToken(lerCookies(req)[NOME_COOKIE]);

export function cookieSessao(token) {
  const seguro = process.env.VERCEL ? '; Secure' : '';
  return `${NOME_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${DURACAO_S}${seguro}`;
}

export const cookieLimpar = () => `${NOME_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;

export function hashSenha(senha, salt = crypto.randomBytes(16).toString('hex')) {
  return { salt, hash: crypto.scryptSync(senha, salt, 64).toString('hex') };
}

export function senhaConfere(senha, salt, hash) {
  const calculado = crypto.scryptSync(senha, salt, 64);
  const esperado = Buffer.from(hash, 'hex');
  return calculado.length === esperado.length && crypto.timingSafeEqual(calculado, esperado);
}

export const novoId = () => crypto.randomUUID();

export function exigirSessao(req, res, papeis) {
  const sessao = sessaoDe(req);
  if (!sessao) {
    res.status(401).json({ error: 'não autenticado' });
    return null;
  }
  if (papeis && !papeis.includes(sessao.papel)) {
    res.status(403).json({ error: 'sem permissão' });
    return null;
  }
  return sessao;
}
