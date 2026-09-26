// Storage adapter — banco (Neon via /api/storage) com cache em memória e espelho em localStorage.
// Enraizar.jsx espera window.storage.get(chave) → { value } | null, set(chave, valor), delete(chave).

const API = "/api/storage";
const PREFIXO = "toca:";
const JSON_HEADERS = { "Content-Type": "application/json" };

let cache = null;
let remotoOk = null;
let carregando = null;

function ehJson(r) {
  return (r.headers.get("content-type") || "").includes("application/json");
}

function lerLocal(chave) {
  try {
    return localStorage.getItem(chave);
  } catch {
    return null;
  }
}

function gravarLocal(chave, valor) {
  try {
    localStorage.setItem(chave, valor);
  } catch (e) {
    console.warn(`storage: espelho local falhou para ${chave}`, e.message);
  }
}

async function migrarLocalSeNecessario() {
  if (cache.size > 0) return;
  const itens = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIXO)) itens.push({ chave: k, valor: localStorage.getItem(k) });
    }
  } catch {
    return;
  }
  if (!itens.length) return;
  const r = await fetch(API, { method: "POST", headers: JSON_HEADERS, body: JSON.stringify({ itens }) });
  if (!r.ok) throw new Error(`migração falhou (${r.status})`);
  for (const i of itens) cache.set(i.chave, i.valor);
  console.info(`storage: ${itens.length} registros migrados do navegador para o banco`);
}

function carregarRemoto() {
  if (carregando) return carregando;
  carregando = (async () => {
    try {
      const r = await fetch(`${API}?tudo=1`);
      if (!r.ok || !ehJson(r)) throw new Error(`HTTP ${r.status}`);
      const { itens } = await r.json();
      cache = new Map(itens.map((i) => [i.chave, i.valor]));
      remotoOk = true;
      await migrarLocalSeNecessario();
    } catch (e) {
      console.warn("storage: banco indisponível, usando apenas o localStorage —", e.message);
      remotoOk = false;
    }
  })();
  return carregando;
}

window.storage = {
  async get(chave) {
    await carregarRemoto();
    const v = remotoOk ? cache.get(chave) ?? null : lerLocal(chave);
    return v === null || v === undefined ? null : { value: v };
  },

  async set(chave, valor) {
    const s = typeof valor === "string" ? valor : JSON.stringify(valor);
    gravarLocal(chave, s);
    await carregarRemoto();
    if (!remotoOk) return true;
    cache.set(chave, s);
    try {
      const r = await fetch(API, { method: "PUT", headers: JSON_HEADERS, body: JSON.stringify({ chave, valor: s }) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return true;
    } catch (e) {
      console.error(`storage: falha ao gravar ${chave} no banco (cópia local mantida) —`, e.message);
      return false;
    }
  },

  async delete(chave) {
    try {
      localStorage.removeItem(chave);
    } catch {}
    await carregarRemoto();
    if (!remotoOk) return true;
    cache.delete(chave);
    try {
      const r = await fetch(`${API}?chave=${encodeURIComponent(chave)}`, { method: "DELETE" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return true;
    } catch (e) {
      console.error(`storage: falha ao remover ${chave} do banco —`, e.message);
      return false;
    }
  },

  online() {
    return remotoOk === true;
  },
};

export default window.storage;
