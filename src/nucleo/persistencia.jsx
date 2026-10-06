// ─── Persistência ───────────────────────────────────────────────

export async function stGet(chave, opcoes) {
  try {
    const r = await window.storage.get(chave, opcoes);
    if (!r || r.value == null) return null;
    let v = JSON.parse(r.value);
    // dados gravados pelo adaptador antigo ficaram codificados duas vezes
    if (typeof v === "string" && /^\s*[\[{]/.test(v)) v = JSON.parse(v);
    return v;
  } catch {
    return null;
  }
}

export async function stSet(chave, valor) {
  try {
    await window.storage.set(chave, JSON.stringify(valor));
  } catch (e) {
    console.error("Falha ao salvar", chave, e);
  }
}
