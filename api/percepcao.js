import { neon } from '@neondatabase/serverless';

// Endpoint público (sem login): a pessoa do entorno abre o link, lê o questionário e responde uma vez.
const TOKEN = /^[a-f0-9-]{20,64}$/;
const TEXTO_MAX = 2000;

function db() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error('DATABASE_URL não configurada');
  return neon(url);
}

async function ler(sql, chave) {
  const linhas = await sql`SELECT valor FROM kv WHERE chave = ${chave}`;
  if (!linhas.length) return null;
  let v = JSON.parse(linhas[0].valor);
  if (typeof v === 'string' && /^\s*[\[{]/.test(v)) v = JSON.parse(v);
  return v;
}

async function gravar(sql, chave, valor) {
  const s = JSON.stringify(valor);
  await sql`INSERT INTO kv (chave, valor, atualizado_em) VALUES (${chave}, ${s}, now())
            ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor, atualizado_em = now()`;
}

export default async (req, res) => {
  const token = req.method === 'GET' ? req.query?.t : req.body?.t;
  if (!TOKEN.test(token || '')) return res.status(400).json({ error: 'Link inválido' });

  let sql;
  try {
    sql = db();
  } catch (e) {
    return res.status(503).json({ error: 'Banco de dados indisponível' });
  }

  try {
    const convite = await ler(sql, `percepcao:${token}`);
    if (!convite) return res.status(404).json({ error: 'Este link não existe ou foi cancelado.' });

    if (req.method === 'GET') {
      const { mentorado, papel, rotuloPapel, foco, rodada, areas, respondidoEm } = convite;
      return res.status(200).json({ mentorado, papel, rotuloPapel, foco, rodada, areas, respondido: !!respondidoEm });
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (convite.respondidoEm) return res.status(409).json({ error: 'Este questionário já foi respondido. Obrigada.' });

    const { notas, bem, mudar } = req.body || {};
    if (!notas || typeof notas !== 'object') return res.status(400).json({ error: 'Respostas inválidas' });
    const limpas = {};
    convite.areas.forEach((a, aIdx) =>
      a.criterios.forEach((_, cIdx) => {
        const k = `${aIdx}-${cIdx}`;
        const n = Number(notas[k]);
        if (notas[k] !== undefined && notas[k] !== null && notas[k] !== '' && n >= 0 && n <= 3) limpas[k] = n;
      })
    );
    if (!Object.keys(limpas).length) return res.status(400).json({ error: 'Responda ao menos uma pergunta' });
    const respostas = {
      notas: limpas,
      bem: String(bem || '').slice(0, TEXTO_MAX),
      mudar: String(mudar || '').slice(0, TEXTO_MAX),
    };
    const respondidoEm = new Date().toISOString();

    await gravar(sql, `percepcao:${token}`, { ...convite, respostas, respondidoEm });

    const chaveLista = `toca:percepcoes:${convite.clienteId}`;
    const lista = (await ler(sql, chaveLista)) || [];
    const idx = Array.isArray(lista) ? lista.findIndex((c) => c.id === convite.conviteId) : -1;
    if (idx >= 0) {
      lista[idx] = { ...lista[idx], respostas, respondidoEm };
      await gravar(sql, chaveLista, lista);
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('percepcao error:', e.message);
    return res.status(500).json({ error: 'Não foi possível salvar. Tente de novo em instantes.' });
  }
};
