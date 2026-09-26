import { neon } from '@neondatabase/serverless';

const KEY_MAX = 200;
const VALUE_MAX = 5 * 1024 * 1024;
let tabelaPronta = false;

function sql() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error('DATABASE_URL não configurada');
  return neon(url);
}

async function garantirTabela(db) {
  if (tabelaPronta) return;
  await db`CREATE TABLE IF NOT EXISTS kv (
    chave TEXT PRIMARY KEY,
    valor TEXT NOT NULL,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;
  tabelaPronta = true;
}

function chaveValida(chave) {
  return typeof chave === 'string' && chave.length > 0 && chave.length <= KEY_MAX;
}

export default async (req, res) => {
  let db;
  try {
    db = sql();
    await garantirTabela(db);
  } catch (e) {
    console.error('storage: banco indisponível', e.message);
    return res.status(503).json({ error: 'Banco de dados indisponível' });
  }

  try {
    if (req.method === 'GET') {
      const { chave, tudo } = req.query || {};
      if (tudo !== undefined) {
        const linhas = await db`SELECT chave, valor FROM kv`;
        return res.status(200).json({ itens: linhas });
      }
      if (!chaveValida(chave)) return res.status(400).json({ error: 'chave inválida' });
      const linhas = await db`SELECT valor FROM kv WHERE chave = ${chave}`;
      return res.status(200).json({ value: linhas.length ? linhas[0].valor : null });
    }

    if (req.method === 'PUT') {
      const { chave, valor } = req.body || {};
      if (!chaveValida(chave)) return res.status(400).json({ error: 'chave inválida' });
      if (typeof valor !== 'string' || valor.length > VALUE_MAX) return res.status(400).json({ error: 'valor inválido' });
      await db`INSERT INTO kv (chave, valor, atualizado_em) VALUES (${chave}, ${valor}, now())
               ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor, atualizado_em = now()`;
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'POST') {
      const { itens } = req.body || {};
      if (!Array.isArray(itens) || itens.length > 500) return res.status(400).json({ error: 'itens inválidos' });
      for (const item of itens) {
        if (!chaveValida(item?.chave) || typeof item.valor !== 'string' || item.valor.length > VALUE_MAX) {
          return res.status(400).json({ error: `item inválido: ${item?.chave}` });
        }
      }
      for (const { chave, valor } of itens) {
        await db`INSERT INTO kv (chave, valor, atualizado_em) VALUES (${chave}, ${valor}, now())
                 ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor, atualizado_em = now()`;
      }
      return res.status(200).json({ ok: true, gravados: itens.length });
    }

    if (req.method === 'DELETE') {
      const { chave } = req.query || {};
      if (!chaveValida(chave)) return res.status(400).json({ error: 'chave inválida' });
      await db`DELETE FROM kv WHERE chave = ${chave}`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('storage error:', e.message);
    return res.status(500).json({ error: e.message || 'erro interno' });
  }
};
