// Regras de redação e revisão de contratos, condensadas da skill "teoria-geral-contratos"
// (Aquino, Teoria Geral dos Contratos, 2021; CC/2002, CDC, Jornadas de Direito Civil).
// Não é parecer jurídico: orienta a IA a redigir com os cuidados que a doutrina e a lei pedem.

export const REGIMES = {
  empresarial: {
    rotulo: "empresarial paritário",
    texto: `REGIME: relação entre empresária (contratada) e empresa (contratante) — contrato civil/empresarial, que se presume paritário e simétrico (art. 421-A CC). Consequências: as partes podem fixar parâmetros objetivos de interpretação, revisão e resolução (421-A, I); a alocação de riscos pactuada deve ser respeitada (421-A, II); revisão judicial é excepcional (421-A, III; art. 421, parágrafo único: intervenção mínima). Não aplique o CDC. Pode haver cláusula de eleição de foro (art. 63 CPC) e regras próprias de interpretação (art. 113, §2º).`,
  },
  consumo: {
    rotulo: "consumo (CDC)",
    texto: `REGIME: a contratante é pessoa física que contrata o serviço como destinatária final — relação de consumo (arts. 2º e 3º CDC), aplicada em diálogo com o CC (art. 7º CDC). Consequências obrigatórias: nenhuma cláusula que limite direitos do consumidor, inverta ônus ou imponha renúncia antecipada (art. 51 CDC; art. 424 CC); cláusulas limitativas em destaque e redação clara (art. 54, §§3º e 4º); foro não pode prejudicar o consumidor (art. 51, IV); cláusula resolutiva só como alternativa do consumidor (art. 54, §2º); na resolução, não há perda total do que foi pago (art. 53); se a contratação for fora do estabelecimento (on-line, telefone), informar o direito de arrependimento em 7 dias (art. 49); dever de informação integra a prestação (arts. 6º, III, 30 e 31). Interpretação sempre a favor do consumidor (art. 47). Nada de arbitragem obrigatória.`,
  },
};

export const ROTEIRO_REDACAO = `ROTEIRO DE REDAÇÃO (siga nesta ordem):
1. Partes qualificadas, com poderes de representação quando pessoa jurídica.
2. Objeto, preço, prazo e forma de pagamento determinados (art. 104 CC: objeto lícito, possível, determinado). Preço nunca ao arbítrio exclusivo de uma parte.
3. Alocação de riscos explícita (art. 421-A, II): o que acontece com atraso de material do contratante, caso fortuito ou força maior (art. 393), mudança de escopo.
4. Cláusula penal proporcional e nunca superior à obrigação principal (art. 412), sujeita a redução equitativa (art. 413): use multa moderada (ex.: 2% + juros de 1% ao mês + atualização) e evite multa compensatória pesada.
5. Cláusula resolutiva expressa (art. 474): quais inadimplementos, prazo de cura (ex.: 10 dias após notificação escrita) e forma de notificação com prova de recebimento.
6. Vigência, renovação e denúncia: contrato de execução continuada (mensalidade, mentoria) admite resilição unilateral com aviso prévio (art. 473); se a outra parte fez investimento considerável, a denúncia só opera após prazo compatível (art. 473, parágrafo único). Fixe o aviso (ex.: 30 dias).
7. Exceção do contrato não cumprido (art. 476): a contratada pode suspender a execução enquanto houver parcela vencida, com aviso.
8. Confidencialidade com limites de objeto, tempo e exceções (informação pública, exigência legal).
9. Propriedade intelectual e dados: diga claramente o que fica com quem; para sistemas, código-fonte com a contratada e licença de uso não exclusiva ao contratante; dados do contratante são dele, com exportação ao fim.
10. Boa-fé objetiva (art. 422): deveres de cooperação, informação e lealdade — descreva o que cada parte precisa fazer para o outro conseguir cumprir (acessos, materiais, prazos de resposta).
11. Regras de interpretação próprias (art. 113, §2º) e ordem de prevalência: contrato > proposta aceita > mensagens trocadas.
12. Foro da comarca do contratante (ou de São Paulo/SP se não informado); sem arbitragem.
13. Sem promessa de resultado; a obrigação da contratada é de meio (consultoria, mentoria) ou de entrega do escopo (sistema), nunca de resultado econômico do negócio.
Linguagem: português claro, períodos curtos, sem latim e sem jargão desnecessário; cada cláusula numerada, com subitens numerados quando houver. Não invente dados: use [colchetes] para o que faltar.`;

export const CHECKLIST_REVISAO = `CHECKLIST DE REVISÃO (lado de quem assina — verifique cada item e aponte o que falta ou está arriscado, com o artigo):
- Partes corretas, com poderes de representação.
- Objeto, preço, prazo e forma de pagamento determinados; índice de reajuste quando houver mensalidade.
- Alocação de riscos explícita (421-A, II): caso fortuito, atraso do contratante, mudança de escopo.
- Cláusula penal proporcional (412-413).
- Cláusula resolutiva expressa: quais inadimplementos, prazo de cura, forma de notificação.
- Vigência, renovação, denúncia com aviso prévio e proteção de investimentos (473, parágrafo único).
- Exclusividade, não concorrência e confidencialidade com limites de tempo, espaço e objeto.
- Contratos coligados mencionados (proposta aceita como anexo; ordem de prevalência).
- Foro definido; sem arbitragem em consumo.
- Regras próprias de interpretação (113, §2º).
- Em consumo: nenhuma renúncia antecipada (424 CC; 51 CDC), cláusulas limitativas em destaque, direito de arrependimento quando couber (49 CDC), sem perda total do pago (53 CDC).
- Obrigação de meio × resultado nomeada; nada que prometa resultado econômico.
- Prazos de reclamação e garantia mapeados (vícios: art. 445 CC ou art. 26 CDC; para sistema, prazo de correção de defeitos após a entrega).
- Boa-fé: deveres de informação e cooperação de ambas as partes escritos.`;

export function regimeDe(cliente, tipo) {
  // pessoa física contratando para si (mentoria, ou sistema/consultoria sem CNPJ) é consumidora; empresa é relação paritária
  if (tipo === "mentoria") return "consumo";
  return cliente && cliente.tipo === "pessoa" ? "consumo" : "empresarial";
}
