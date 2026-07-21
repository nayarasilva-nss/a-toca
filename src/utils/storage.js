// Storage adapter — converte localStorage em promise-based API
// A Toca.jsx espera window.storage.get() e window.storage.set() async

window.storage = {
  async get(chave) {
    try {
      const valor = localStorage.getItem(chave);
      return valor ? JSON.parse(valor) : null;
    } catch (e) {
      console.error(`Erro ao ler ${chave}:`, e);
      return null;
    }
  },

  async set(chave, valor) {
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
      return true;
    } catch (e) {
      console.error(`Erro ao salvar ${chave}:`, e);
      return false;
    }
  },
};

export default window.storage;
