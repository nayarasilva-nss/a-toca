// Contato público da Nay. Enquanto não há aviso automático, quem envia algo pode chamá-la direto no WhatsApp.
export const WHATSAPP_NAYARA = "5562994308385";
export const linkWhatsApp = (texto) => `https://wa.me/${WHATSAPP_NAYARA}?text=${encodeURIComponent(texto)}`;
