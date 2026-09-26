// Storage adapter — localStorage com API async no formato { value } que Enraizar.jsx espera

window.storage = {
  async get(chave) {
    try {
      const valor = localStorage.getItem(chave);
      return valor === null ? null : { value: valor };
    } catch (e) {
      console.error(`Erro ao ler ${chave}:`, e);
      return null;
    }
  },

  async set(chave, valor) {
    try {
      localStorage.setItem(chave, typeof valor === "string" ? valor : JSON.stringify(valor));
      return true;
    } catch (e) {
      console.error(`Erro ao salvar ${chave}:`, e);
      return false;
    }
  },

  async delete(chave) {
    try {
      localStorage.removeItem(chave);
      return true;
    } catch (e) {
      console.error(`Erro ao remover ${chave}:`, e);
      return false;
    }
  },
};

export default window.storage;
