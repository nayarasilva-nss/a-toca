// Redefine a senha de um usuário direto no banco (Neon), sem passar pela tela.
// Uso: npm run redefinir-senha            → lista os usuários cadastrados
//      npm run redefinir-senha -- e-mail  → pede a nova senha (digitação oculta) e grava
import { readFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { neon } from '@neondatabase/serverless';
import { hashSenha } from '../api/_lib/sessao.js';

function carregarEnv() {
  try {
    for (const linha of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
      const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {}
}

function perguntarOculto(pergunta) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const escrever = rl._writeToOutput;
    rl.question(pergunta, (resposta) => { rl._writeToOutput = escrever; rl.close(); process.stdout.write('\n'); resolve(resposta); });
    rl._writeToOutput = function (texto) { if (texto.includes(pergunta)) escrever.call(rl, pergunta); };
  });
}

carregarEnv();
const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) { console.error('DATABASE_URL não encontrada em .env.local'); process.exit(1); }
const sql = neon(url);
const email = (process.argv[2] || '').trim().toLowerCase();

if (!email) {
  const usuarios = await sql`SELECT email, nome, papel FROM usuarios ORDER BY email`;
  console.log(usuarios.length ? 'Usuários cadastrados:' : 'Nenhum usuário cadastrado.');
  for (const u of usuarios) console.log(`  ${u.email}  —  ${u.nome} (${u.papel})`);
  console.log('\nPara redefinir: npm run redefinir-senha -- e-mail');
  process.exit(0);
}

const [usuario] = await sql`SELECT id, nome FROM usuarios WHERE email = ${email}`;
if (!usuario) { console.error(`Nenhum usuário com o e-mail ${email}`); process.exit(1); }

const senha = await perguntarOculto(`Nova senha para ${usuario.nome} (mínimo 8 caracteres): `);
if (senha.length < 8) { console.error('A senha precisa ter pelo menos 8 caracteres.'); process.exit(1); }
const confirma = await perguntarOculto('Repita a nova senha: ');
if (senha !== confirma) { console.error('As senhas não conferem.'); process.exit(1); }

const { salt, hash } = hashSenha(senha);
await sql`UPDATE usuarios SET senha_hash = ${hash}, salt = ${salt} WHERE id = ${usuario.id}`;
console.log(`Senha de ${email} redefinida. Já dá para entrar em https://enraizar.vercel.app`);
