// Aviso no WhatsApp da consultora. Dois canais, nesta ordem:
// 1) API oficial do WhatsApp (Meta Cloud API): WHATSAPP_CLOUD_TOKEN + WHATSAPP_CLOUD_PHONE_ID (+ WHATSAPP_CLOUD_TEMPLATE opcional)
// 2) CallMeBot (gratuito, uso pessoal): CALLMEBOT_APIKEY
// Em ambos, WHATSAPP_NUMERO é o número que recebe (DDI+DDD+número, só dígitos, ex.: 5562999990000).

const URL_APP = 'https://enraizar.vercel.app';
const VERSAO_GRAPH = 'v21.0';

const numeroDestino = () => String(process.env.WHATSAPP_NUMERO || '').replace(/\D/g, '');
export const cloudConfigurado = () => !!(process.env.WHATSAPP_CLOUD_TOKEN && process.env.WHATSAPP_CLOUD_PHONE_ID && numeroDestino());
export const callmebotConfigurado = () => !!(process.env.CALLMEBOT_APIKEY && numeroDestino());
export function configurado() {
  return cloudConfigurado() || callmebotConfigurado();
}
export const canalAtivo = () => (cloudConfigurado() ? 'cloud' : callmebotConfigurado() ? 'callmebot' : null);

export function textoLeadNovo(lead) {
  const linhas = [
    lead.origem === 'autodiagnostico' ? '🌱 Novo lead pelo autodiagnóstico' : '🌱 Novo lead pelo site',
    `*${lead.nome}*`,
    lead.whatsapp && `WhatsApp: ${lead.whatsapp}`,
    lead.email && `E-mail: ${lead.email}`,
    lead.negocio && `Negócio: ${lead.negocio}`,
    lead.funcionarios && `Funcionários: ${lead.funcionarios}`,
    lead.interesse && `Interesse: ${lead.interesse}`,
    lead.dor && `Dor: "${lead.dor.length > 300 ? lead.dor.slice(0, 300) + '…' : lead.dor}"`,
    linhaDiagnostico(lead.diagnostico),
    '',
    `Ver no app: ${URL_APP}`,
  ];
  return linhas.filter((l) => l !== undefined && l !== null && l !== false).join('\n');
}

function linhaDiagnostico(d) {
  if (!d || !Array.isArray(d.areas) || !d.areas.length) return null;
  const fracas = [...d.areas].sort((a, b) => a.pct - b.pct).slice(0, 2).map((a) => `${a.area} ${a.pct}%`);
  return `Autodiagnóstico: ${d.indice}% depende do dono · mais fracas: ${fracas.join(', ')}`;
}

async function comTimeout(fn, ms = 10000) {
  const controle = new AbortController();
  const t = setTimeout(() => controle.abort(), ms);
  try { return await fn(controle.signal); } finally { clearTimeout(t); }
}

// ── Meta Cloud API ───────────────────────────────────────────────
// Mensagem de texto livre só chega se a Nay falou com o número do bot nas últimas 24 h.
// Fora da janela, a API exige um modelo aprovado: WHATSAPP_CLOUD_TEMPLATE (modelo com um parâmetro de texto no corpo).
async function enviarCloud(texto) {
  const url = `https://graph.facebook.com/${VERSAO_GRAPH}/${process.env.WHATSAPP_CLOUD_PHONE_ID}/messages`;
  const cabecalhos = { Authorization: `Bearer ${process.env.WHATSAPP_CLOUD_TOKEN}`, 'Content-Type': 'application/json' };
  const chamar = async (corpo) => {
    const r = await comTimeout((signal) => fetch(url, { method: 'POST', headers: cabecalhos, body: JSON.stringify(corpo), signal }));
    const j = await r.json().catch(() => ({}));
    return { ok: r.ok, codigo: j && j.error && j.error.code, motivo: j && j.error ? `${j.error.code || ''} ${j.error.message || ''}`.trim() : '' };
  };
  const modelo = process.env.WHATSAPP_CLOUD_TEMPLATE;
  // Com modelo configurado, ele vai primeiro: é o único caminho que entrega fora da janela de 24 h.
  // A API aceita texto livre (200) e só avisa a falha depois, pelo webhook (131047), então texto fica como reserva.
  let erroModelo = '';
  if (modelo) {
    const umaLinha = texto.replace(/[\r\n\t]+/g, ' · ').replace(/\s{2,}/g, ' ').slice(0, 1000);
    const t = await chamar({ messaging_product: 'whatsapp', to: numeroDestino(), type: 'template', template: { name: modelo, language: { code: process.env.WHATSAPP_CLOUD_IDIOMA || 'pt_BR' }, components: [{ type: 'body', parameters: [{ type: 'text', text: umaLinha }] }] } });
    if (t.ok) return { ok: true, canal: 'cloud-modelo' };
    erroModelo = t.motivo || 'erro';
  }
  const texto1 = await chamar({ messaging_product: 'whatsapp', to: numeroDestino(), type: 'text', text: { body: texto } });
  if (texto1.ok) return { ok: true, canal: 'cloud-texto', aviso: modelo ? `modelo "${modelo}" recusado (${erroModelo}); texto só chega se você falou com o número de teste nas últimas 24 h` : 'texto só chega se você falou com o número de teste nas últimas 24 h' };
  return { ok: false, motivo: `Cloud API: ${texto1.motivo || 'erro'}${modelo ? ` | modelo: ${erroModelo}` : ' — sem WHATSAPP_CLOUD_TEMPLATE para mandar fora da janela de 24 h'}` };
}

// ── CallMeBot ────────────────────────────────────────────────────
async function enviarCallMeBot(texto) {
  const url = `https://api.callmebot.com/whatsapp.php?phone=${numeroDestino()}&text=${encodeURIComponent(texto)}&apikey=${encodeURIComponent(process.env.CALLMEBOT_APIKEY)}`;
  try {
    const r = await comTimeout((signal) => fetch(url, { signal }), 8000);
    const corpo = await r.text().catch(() => '');
    if (!r.ok) return { ok: false, motivo: `CallMeBot respondeu ${r.status}: ${corpo.slice(0, 160)}` };
    if (/error|invalid|not allowed/i.test(corpo) && !/queued|sent|success/i.test(corpo)) return { ok: false, motivo: corpo.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200) };
    return { ok: true, canal: 'callmebot' };
  } catch (e) {
    return { ok: false, motivo: e.name === 'AbortError' ? 'CallMeBot não respondeu em 8 s' : e.message };
  }
}

// Devolve { ok, canal?, motivo? }. Nunca lança: o registro já está salvo e o aviso é um extra.
export async function enviarWhatsApp(texto) {
  if (cloudConfigurado()) {
    try { return await enviarCloud(texto); } catch (e) { return { ok: false, motivo: e.name === 'AbortError' ? 'Cloud API não respondeu em 10 s' : e.message }; }
  }
  if (callmebotConfigurado()) return enviarCallMeBot(texto);
  return { ok: false, motivo: 'WhatsApp não configurado: defina WHATSAPP_NUMERO e, para a API oficial, WHATSAPP_CLOUD_TOKEN + WHATSAPP_CLOUD_PHONE_ID (ou CALLMEBOT_APIKEY)' };
}
