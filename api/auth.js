import { neon } from '@neondatabase/serverless';
import { criarToken, sessaoDe, cookieSessao, cookieLimpar, hashSenha, senhaConfere, novoId } from './_lib/sessao.js';

let tabelaPronta = false;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const publico = (u) => ({ id: u.id, email: u.email, nome: u.nome, papel: u.papel, clienteId: u.cliente_id });

async function db() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error('DATABASE_URL não configurada');
  const sql = neon(url);
  if (!tabelaPronta) {
    await sql`CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      nome TEXT NOT NULL,
      papel TEXT NOT NULL,
      senha_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      cliente_id TEXT,
      criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
    tabelaPronta = true;
  }
  return sql;
}

function validarCredenciais(email, senha, nome) {
  if (!EMAIL.test(email || '')) return 'Informe um e-mail válido';
  if (typeof senha !== 'string' || senha.length < 8) return 'A senha precisa ter pelo menos 8 caracteres';
  if (nome !== undefined && !(nome || '').trim()) return 'Informe seu nome';
  return null;
}

export default async (req, res) => {
  const acao = req.query?.acao || req.body?.acao;
  let sql;
  try {
    sql = await db();
  } catch (e) {
    console.error('auth: banco indisponível', e.message);
    return res.status(503).json({ error: 'Banco de dados indisponível' });
  }

  try {
    if (req.method === 'GET' && acao === 'sessao') {
      const [{ n }] = await sql`SELECT count(*)::int AS n FROM usuarios`;
      const sessao = sessaoDe(req);
      if (!sessao) return res.status(200).json({ usuario: null, precisaConfigurar: n === 0 });
      const linhas = await sql`SELECT id, email, nome, papel, cliente_id FROM usuarios WHERE id = ${sessao.id}`;
      if (!linhas.length) {
        res.setHeader('Set-Cookie', cookieLimpar());
        return res.status(200).json({ usuario: null, precisaConfigurar: n === 0 });
      }
      return res.status(200).json({ usuario: publico(linhas[0]), precisaConfigurar: false });
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    if (acao === 'configurar') {
      const [{ n }] = await sql`SELECT count(*)::int AS n FROM usuarios`;
      if (n > 0) return res.status(409).json({ error: 'O acesso já foi configurado' });
      const { nome, email, senha } = req.body || {};
      const erro = validarCredenciais(email, senha, nome);
      if (erro) return res.status(400).json({ error: erro });
      const { salt, hash } = hashSenha(senha);
      const usuario = { id: novoId(), email: email.trim().toLowerCase(), nome: nome.trim(), papel: 'consultora', cliente_id: null };
      await sql`INSERT INTO usuarios (id, email, nome, papel, senha_hash, salt) VALUES (${usuario.id}, ${usuario.email}, ${usuario.nome}, ${usuario.papel}, ${hash}, ${salt})`;
      res.setHeader('Set-Cookie', cookieSessao(criarToken({ id: usuario.id, papel: usuario.papel })));
      return res.status(200).json({ usuario: publico(usuario) });
    }

    if (acao === 'entrar') {
      const { email, senha } = req.body || {};
      const linhas = EMAIL.test(email || '') ? await sql`SELECT * FROM usuarios WHERE email = ${email.trim().toLowerCase()}` : [];
      const u = linhas[0];
      if (!u || typeof senha !== 'string' || !senhaConfere(senha, u.salt, u.senha_hash)) {
        await espera(400);
        return res.status(401).json({ error: 'E-mail ou senha incorretos' });
      }
      res.setHeader('Set-Cookie', cookieSessao(criarToken({ id: u.id, papel: u.papel })));
      return res.status(200).json({ usuario: publico(u) });
    }

    if (acao === 'sair') {
      res.setHeader('Set-Cookie', cookieLimpar());
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'ação inválida' });
  } catch (e) {
    console.error('auth error:', e.message);
    return res.status(500).json({ error: e.message || 'erro interno' });
  }
};
