// Conversa com o lead depois do primeiro contato: o que dizer em cada situação e quando dar o próximo toque.
// Puro (sem React) para poder testar fora do app.

export const CADENCIA = [
  { n: 1, dias: 2, rotulo: "Toque 1 · um insight do diagnóstico" },
  { n: 2, dias: 3, rotulo: "Toque 2 · uma prova real" },
  { n: 3, dias: 7, rotulo: "Toque 3 · fechamento sem pressão" },
];

export const RESPOSTAS = {
  topou: "Topou conversar",
  vago: "Respondeu vago",
  nao: "Sem resposta",
};

const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const deISO = (s) => { const [a, m, d] = String(s).split("-").map(Number); return new Date(a, m - 1, d); };
export const somarDias = (dataISO, n) => { const d = deISO(dataISO); d.setDate(d.getDate() + n); return iso(d); };
export const hojeISO = () => iso(new Date());
export const diasEntre = (deISOa, ateISO) => Math.round((deISO(ateISO) - deISO(deISOa)) / 86400000);

const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const primeiroNome = (lead) => (lead.nome || "").trim().split(/\s+/)[0] || "tudo bem";

// próximos dois dias úteis a partir de amanhã: "quinta (6/11) às 10h"
export function proximosHorarios(hoje = hojeISO()) {
  const out = [];
  let d = deISO(hoje);
  while (out.length < 2) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    out.push({ dia: DIAS[d.getDay()], data: `${d.getDate()}/${d.getMonth() + 1}`, iso: iso(d), hora: out.length === 0 ? "10h" : "15h" });
  }
  return out;
}

export function mensagemTopou(lead, hoje = hojeISO()) {
  const [a, b] = proximosHorarios(hoje);
  return `Ótimo, ${primeiroNome(lead)}! Tenho ${a.dia} (${a.data}) às ${a.hora} ou ${b.dia} (${b.data}) às ${b.hora}, 30 minutos por chamada de vídeo. Qual fica melhor para você?`;
}

export function mensagemVago(lead) {
  return `Entendo, ${primeiroNome(lead)}. Antes de falar em valor, me conta uma coisa: se você sumisse duas semanas, o que para primeiro no negócio?`;
}

export function mensagemConfirmacao(lead, dataISO, hora) {
  const d = deISO(dataISO);
  return `Oi, ${primeiroNome(lead)}! Passando para confirmar a nossa conversa ${DIAS[d.getDay()]} (${d.getDate()}/${d.getMonth() + 1})${hora ? ` às ${hora}` : ""}. Te mando o link um pouco antes. Combinado?`;
}

// o que o dono normalmente faz quando a área depende dele
const SINTOMA = {
  "Pessoas": "o dono cobrando um por um",
  "Processos": "o dono explicando a mesma coisa toda semana",
  "Governança e papéis": "o dono decidindo tudo sozinho, porque ninguém sabe até onde vai",
  "Disciplina e cultura": "o dono fiscalizando para a rotina acontecer",
  "Financeiro": "o dono descobrindo o resultado só no fim do mês",
  "Autonomia do dono": "o dono sem conseguir sair dois dias sem o telefone tocar",
};

export function mensagemToque(lead, n) {
  const nome = primeiroNome(lead);
  if (n === 1) {
    const d = lead.diagnostico && lead.diagnostico.areas ? lead.diagnostico : null;
    if (d) {
      const pior = [...d.areas].sort((a, b) => a.pct - b.pct)[0];
      return `Oi, ${nome}! Fiquei pensando no seu resultado: ${pior.area.toLowerCase()} ficou em ${pior.pct}%. Normalmente isso é ${SINTOMA[pior.area] || "o dono segurando essa parte sozinho"}. É o seu caso?`;
    }
    if (lead.dor) return `Oi, ${nome}! Fiquei pensando no que você contou: "${String(lead.dor).trim().replace(/[.!?]+$/, "")}". Isso normalmente tem uma causa só. Quer que eu te diga qual eu acho que é?`;
    return `Oi, ${nome}! Fiquei pensando no seu negócio. Me conta: hoje, o que mais depende de você para acontecer?`;
  }
  if (n === 2) {
    const sistemas = lead.interesse === "Sistemas personalizados";
    return sistemas
      ? `${cap(nome)}, um exemplo real: no Kenkyo, as rotinas viraram um checklist no celular do time. São 5 unidades, mais de 10 mil itens conferidos em 3 meses e 96% de conformidade, sem eu cobrar ninguém. Dá para fazer no seu também. Quer ver como funciona?`
      : `${cap(nome)}, um exemplo real: no Kenkyo isso virou rotina escrita e checklist no celular do time. Hoje são 5 unidades rodando com 96% das rotinas feitas sem eu cobrar ninguém. Dá para fazer no seu também. Quer ver como funciona?`;
  }
  return `${cap(nome)}, vou deixar você em paz. Se quiser retomar, é só me chamar aqui. Deixo o convite dos 30 minutos aberto. Combinado?`;
}

export const ROTEIRO_DIAGNOSTICO = [
  { t: "O negócio", p: "O que o negócio faz, quantas pessoas, quanto fatura por mês?" },
  { t: "O que depende de você", p: "O que só acontece se você estiver lá ou cobrar?" },
  { t: "O que já tentou", p: "O que você já tentou para resolver isso e por que não ficou de pé?" },
  { t: "Daqui a 12 meses", p: "Onde você quer estar em 12 meses? O que precisa ser diferente?" },
  { t: "Devolutiva (últimos 5 min)", p: "Repita em duas frases o que ouviu. Depois: \"o próximo passo é eu te mandar uma proposta com o que faria primeiro. Te mando até sexta.\"" },
];

// situação atual e o que fazer agora
export function proximoPasso(lead, hoje = hojeISO()) {
  if (lead.clienteId || lead.status === "convertido") return null;
  if (lead.status === "perdido") return null;
  if (lead.status === "novo") return { situacao: "primeiro", titulo: "Primeiro contato", dica: "Mande a mensagem de primeiro contato. Ao abrir o WhatsApp, o lead passa para \"Contatado\" e o Toque 1 entra na Agenda para daqui a 2 dias." };
  if (lead.status === "diagnostico") return { situacao: "diagnostico", titulo: "Conversa de diagnóstico", dica: "Você não está vendendo, está diagnosticando. Quatro perguntas, na ordem, e a devolutiva nos últimos 5 minutos." };
  // contatado
  const ultimo = lead.ultimoToque ? iso(new Date(lead.ultimoToque)) : null;
  const semResposta = ultimo ? diasEntre(ultimo, hoje) : 0;
  if (lead.resposta === "topou") return { situacao: "topou", titulo: "Topou conversar", dica: "Não pergunte \"quando fica bom?\". Ofereça dois horários e feche. Depois marque o diagnóstico aqui, que a Agenda guarda.", mensagem: mensagemTopou(lead, hoje) };
  if (lead.resposta === "vago") return { situacao: "vago", titulo: "Respondeu vago", dica: "Não dê preço. Devolva uma pergunta que puxa a dor. A resposta é o gancho para os 30 minutos.", mensagem: mensagemVago(lead) };
  const toques = lead.toques || 0;
  if (toques >= CADENCIA.length) return { situacao: "esgotou", titulo: "Três toques sem resposta", dica: "Marque como \"Não seguiu\". Sai da fila e da sua cabeça. Se a pessoa voltar, é só mudar o status.", semResposta };
  const passo = CADENCIA[toques];
  const vence = lead.proximoToque || (ultimo ? somarDias(ultimo, passo.dias) : hoje);
  const atraso = diasEntre(vence, hoje);
  return { situacao: "toque", n: passo.n, titulo: passo.rotulo, vence, atraso, semResposta, mensagem: mensagemToque(lead, passo.n), dica: atraso > 0 ? `Vencia ${atraso === 1 ? "ontem" : `há ${atraso} dias`}. Mande hoje.` : atraso === 0 ? "É hoje." : `Programado para daqui a ${-atraso} ${-atraso === 1 ? "dia" : "dias"}. Pode mandar antes se quiser.` };
}

// data do próximo toque depois do toque n (0 = primeiro contato)
export function dataProximoToque(apos, hoje = hojeISO()) {
  const passo = CADENCIA[apos];
  return passo ? somarDias(hoje, passo.dias) : "";
}
