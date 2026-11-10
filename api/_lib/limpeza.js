// Limpeza dos leads antigos, como promete a política de privacidade do site (nayarasilva.com.br/privacidade):
// quem não virou cliente é apagado 24 meses depois do último contato. Roda junto do lembrete diário.
// "Último contato" = o mais recente entre a chegada do lead, o último toque e a última edição (status, anotação).

export const MESES_GUARDA = 24;
export const DIAS_AVISO = 30;

const menosMeses = (data, meses) => { const d = new Date(data); d.setMonth(d.getMonth() - meses); return d; };

export async function limparLeadsAntigos(sql, { agora = new Date(), simular = false } = {}) {
  try {
    await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS ultimo_toque TIMESTAMPTZ`;
    await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ`;
  } catch {
    return { apagados: 0, aVencer: [] }; // tabela ainda não existe: nada a limpar
  }
  const linhas = await sql`
    SELECT id, nome, GREATEST(criado_em, COALESCE(ultimo_toque, criado_em), COALESCE(atualizado_em, criado_em)) AS ultimo
    FROM leads
    WHERE status <> 'convertido' AND cliente_id IS NULL`;
  const corte = menosMeses(agora, MESES_GUARDA);
  const corteAviso = new Date(corte.getTime() + DIAS_AVISO * 86400000);
  const vencidos = linhas.filter((l) => new Date(l.ultimo) < corte);
  const aVencer = linhas
    .filter((l) => new Date(l.ultimo) >= corte && new Date(l.ultimo) < corteAviso)
    .map((l) => ({ nome: l.nome, dias: Math.max(1, Math.ceil((new Date(l.ultimo) - corte) / 86400000)) }));
  if (simular || !vencidos.length) return { apagados: 0, vencidos: vencidos.length, aVencer };

  const ids = vencidos.map((l) => l.id);
  await sql`DELETE FROM leads WHERE id = ANY(${ids})`;

  // as tarefas da Agenda criadas para esses leads levam o nome da pessoa: saem junto
  try {
    const kv = await sql`SELECT valor FROM kv WHERE chave = 'toca:tarefas'`;
    if (kv.length) {
      let tarefas = JSON.parse(kv[0].valor);
      if (typeof tarefas === 'string') tarefas = JSON.parse(tarefas);
      if (Array.isArray(tarefas)) {
        const restantes = tarefas.filter((t) => !(t && t.leadId && ids.includes(t.leadId)));
        if (restantes.length !== tarefas.length) {
          await sql`UPDATE kv SET valor = ${JSON.stringify(restantes)}, atualizado_em = now() WHERE chave = 'toca:tarefas'`;
        }
      }
    }
  } catch (e) {
    console.warn('limpeza: tarefas dos leads apagados não removidas —', e.message);
  }
  console.log(`limpeza: ${ids.length} lead(s) com mais de ${MESES_GUARDA} meses sem contato apagado(s)`);
  return { apagados: ids.length, vencidos: ids.length, aVencer };
}

// linhas para o resumo da manhã
export function textoLimpeza(r) {
  const linhas = [];
  if (r.apagados) linhas.push(`🧹 ${r.apagados} lead${r.apagados > 1 ? 's' : ''} com mais de ${MESES_GUARDA} meses sem contato ${r.apagados > 1 ? 'foram apagados' : 'foi apagado'} (política de privacidade).`);
  if (r.aVencer && r.aVencer.length) linhas.push(`⏳ ${r.aVencer.length > 1 ? 'Leads que serão apagados' : 'Lead que será apagado'} em até ${DIAS_AVISO} dias por falta de contato: ${r.aVencer.map((l) => `${l.nome} (${l.dias} d)`).join(', ')}. Um novo contato ou anotação renova o prazo.`);
  return linhas.join('\n');
}
