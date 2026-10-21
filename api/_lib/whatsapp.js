// Aviso no WhatsApp da consultora via CallMeBot (gratuito para uso pessoal).
// Configuração: WHATSAPP_NUMERO (DDI+DDD+número, só dígitos, ex.: 5511999990000) e CALLMEBOT_APIKEY
// (a chave chega no seu WhatsApp depois de mandar "I allow callmebot to send me messages" para +34 644 71 81 99).

const URL_APP = 'https://enraizar.vercel.app';

export function configurado() {
  return !!(process.env.WHATSAPP_NUMERO && process.env.CALLMEBOT_APIKEY);
}

export function textoLeadNovo(lead) {
  const linhas = [
    '🌱 Novo lead pelo site',
    `*${lead.nome}*`,
    lead.whatsapp && `WhatsApp: ${lead.whatsapp}`,
    lead.email && `E-mail: ${lead.email}`,
    lead.negocio && `Negócio: ${lead.negocio}`,
    lead.funcionarios && `Funcionários: ${lead.funcionarios}`,
    lead.interesse && `Interesse: ${lead.interesse}`,
    lead.dor && `Dor: "${lead.dor.length > 300 ? lead.dor.slice(0, 300) + '…' : lead.dor}"`,
    '',
    `Ver no app: ${URL_APP}`,
  ];
  return linhas.filter((l) => l !== undefined && l !== null && l !== false).join('\n');
}

// Devolve { ok, motivo }. Nunca lança: o lead já está salvo e o aviso é um extra.
export async function enviarWhatsApp(texto) {
  if (!configurado()) return { ok: false, motivo: 'WHATSAPP_NUMERO ou CALLMEBOT_APIKEY não configurados' };
  const numero = String(process.env.WHATSAPP_NUMERO).replace(/\D/g, '');
  const url = `https://api.callmebot.com/whatsapp.php?phone=${numero}&text=${encodeURIComponent(texto)}&apikey=${encodeURIComponent(process.env.CALLMEBOT_APIKEY)}`;
  try {
    const controle = new AbortController();
    const t = setTimeout(() => controle.abort(), 8000);
    const r = await fetch(url, { signal: controle.signal });
    clearTimeout(t);
    const corpo = await r.text().catch(() => '');
    if (!r.ok) return { ok: false, motivo: `CallMeBot respondeu ${r.status}: ${corpo.slice(0, 160)}` };
    if (/error|invalid|not allowed/i.test(corpo) && !/queued|sent|success/i.test(corpo)) return { ok: false, motivo: corpo.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200) };
    return { ok: true };
  } catch (e) {
    return { ok: false, motivo: e.name === 'AbortError' ? 'CallMeBot não respondeu em 8 s' : e.message };
  }
}
