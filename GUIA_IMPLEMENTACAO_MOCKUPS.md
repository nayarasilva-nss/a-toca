# 📋 Guia de Implementação Fiel aos Mockups

## Copiar EXATAMENTE os estilos dos mockups

### 1️⃣ INPUT FIELD (Padrão dos Mockups)

```jsx
<div style={{ marginBottom: "18px" }}>
  <label style={{
    display: "block",
    fontSize: "11px",
    letterSpacing: "1px",
    color: "#D4AF37",  // Dourado
    textTransform: "uppercase",
    marginBottom: "6px",
    fontWeight: "600",
    fontFamily: "'Lora', serif"
  }}>
    E-mail
  </label>
  <input
    type="email"
    placeholder="nayara@"
    style={{
      width: "100%",
      padding: "10px 12px",
      border: "1px solid #D9914F",  // Cobre
      borderRadius: "4px",
      fontFamily: "'Lora', serif",
      fontSize: "13px",
      background: "#FFFBF0",  // Cream pale
      color: "#3C181E",  // Vinho claro
      outline: "none"
    }}
  />
</div>
```

### 2️⃣ BUTTON PRIMÁRIO (Padrão dos Mockups)

```jsx
<button style={{
  width: "100%",
  padding: "12px",
  background: "#5C1A2B",  // Vinho escuro
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  fontFamily: "'Lora', serif",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer",
  letterSpacing: "1px"
}}>
  ENTRAR
</button>
```

### 3️⃣ CARD CONTAINER (Padrão dos Mockups)

```jsx
<div style={{ width: "440px" }}>
  {/* Header com gradiente */}
  <div style={{
    padding: "32px",
    borderBottom: "1px solid rgba(60, 24, 30, 0.08)",
    background: "linear-gradient(180deg, rgba(217, 145, 79, 0.08) 0%, rgba(245, 237, 217, 0.4) 100%)"
  }}>
    <div style={{
      fontSize: "18px",
      fontWeight: "600",
      color: "#5C1A2B",
      marginBottom: "4px"
    }}>
      Novo Engajamento
    </div>
    <div style={{
      fontSize: "12px",
      color: "#8B6F47"
    }}>
      Preencha os dados básicos do cliente
    </div>
  </div>

  {/* Content */}
  <div style={{ padding: "28px" }}>
    {/* Seus inputs e conteúdo aqui */}
  </div>
</div>
```

### 4️⃣ SECTION HEADER COM LABEL (Padrão dos Mockups)

```jsx
<div style={{
  fontSize: "13px",
  fontWeight: "600",
  color: "#5C1A2B",
  marginBottom: "12px",
  textTransform: "uppercase",
  letterSpacing: "1px"
}}>
  Frentes Abertas (selecione)
</div>
```

### 5️⃣ CHECKBOX STYLE (Padrão dos Mockups)

```jsx
<label style={{
  display: "flex",
  alignItems: "center",
  gap: "8px",
  cursor: "pointer",
  fontSize: "13px"
}}>
  <input
    type="checkbox"
    checked={true}
    style={{ accentColor: "#5C1A2B", cursor: "pointer" }}
  />
  <span>Pessoas (descrições de cargo, estrutura, seleção)</span>
</label>
```

### 6️⃣ BADGE/STATUS BOX (Padrão dos Mockups)

```jsx
<div style={{
  padding: "12px",
  background: "#F5EDD9",  // Cream light
  borderLeft: "4px solid #9A6A2F",
  borderRadius: "2px"
}}>
  <div style={{
    fontSize: "12px",
    fontWeight: "600",
    color: "#3C181E"
  }}>
    Pessoas
  </div>
  <div style={{
    fontSize: "11px",
    color: "#6B5D4F",
    marginTop: "2px"
  }}>
    Em andamento · 6 ações
  </div>
</div>
```

### 7️⃣ TITLE COM GRADIENT (Padrão dos Mockups)

```jsx
<div style={{
  fontFamily: "'Crimson Text', serif",
  fontSize: "48px",
  fontWeight: "800",
  letterSpacing: "4px",
  background: "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  marginBottom: "8px"
}}>
  A TOCA
</div>
```

### 8️⃣ BUTTON OUTLINE (Padrão dos Mockups)

```jsx
<button style={{
  padding: "12px",
  background: "transparent",
  color: "#5C1A2B",
  border: "1px solid #5C1A2B",
  borderRadius: "4px",
  fontFamily: "'Lora', serif",
  fontSize: "12px",
  fontWeight: "600",
  cursor: "pointer",
  letterSpacing: "0.5px"
}}>
  VER CRONOGRAMA
</button>
```

### 9️⃣ GRID LAYOUT (Padrão dos Mockups)

```jsx
<div style={{
  padding: "32px",
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "24px"
}}>
  {/* Conteúdo */}
</div>
```

### 🔟 TEXTAREA (Padrão dos Mockups)

```jsx
<textarea
  placeholder="O que o dono relatou na primeira conversa? Qual é a maior dor agora?"
  style={{
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #D9914F",
    borderRadius: "4px",
    fontFamily: "'Lora', serif",
    fontSize: "13px",
    background: "#FFFBF0",
    color: "#3C181E",
    minHeight: "120px",
    resize: "vertical"
  }}
/>
```

---

## 🎨 Cores Exatas (Copiar Dessa Tabela)

| Uso | Cor | Hex |
|-----|-----|-----|
| Vinho (buttons primários) | 🟫 | #5C1A2B |
| Vinho claro (texto) | 🟥 | #3C181E |
| Vinho médio (backgrounds) | 🟧 | #8A3A2E |
| Dourado (labels) | 🟨 | #D4AF37 |
| Dourado dark (hover) | 🟪 | #B8860B |
| Cobre (borders, inputs) | 🟧 | #D9914F |
| Brown (texto secundário) | 🟫 | #8B6F47 |
| Brown dark | 🟪 | #6B5D4F |
| Taupe | 🟫 | #8A7A5C |
| Cream light | 🟨 | #F5EDD9 |
| Cream pale (bg principal) | 🟨 | #FFFBF0 |

---

## 🔤 Fontes Exatas

```css
@import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital@0;1&family=Lora:wght@400;600&display=swap');

/* Títulos (48px, 800, Crimson Text) */
fontFamily: "'Crimson Text', serif"
fontSize: "48px"
fontWeight: "800"
letterSpacing: "4px"

/* Body (13px, 400, Lora) */
fontFamily: "'Lora', serif"
fontSize: "13px"
fontWeight: "400"

/* Labels (11px, 600, uppercase, Lora) */
fontFamily: "'Lora', serif"
fontSize: "11px"
fontWeight: "600"
letterSpacing: "1px"
textTransform: "uppercase"
```

---

## 📐 Espaçamentos Exatos (Copiar Dessa Tabela)

| Elemento | Propriedade | Valor |
|----------|-------------|-------|
| Input | padding | 10px 12px |
| Button | padding | 12px (small) ou 12px 16px |
| Card container | padding | 28px-32px |
| Form field | marginBottom | 18px |
| Label | marginBottom | 6px |
| Section spacing | gap | 8px-24px |
| Card borders | border-radius | 4px |

---

## ✅ Checklist de Implementação

- [ ] Importar Google Fonts (Crimson Text + Lora)
- [ ] Usar cores EXATAS da tabela acima
- [ ] Input: 10px 12px padding, border #D9914F
- [ ] Buttons: 12px padding, background #5C1A2B
- [ ] Labels: 11px, UPPERCASE, #D4AF37, letter-spacing 1px
- [ ] Cards: 28px-32px padding, gradient headers
- [ ] Gradients: linear-gradient(180deg, rgba(217, 145, 79, 0.08) 0%, rgba(245, 237, 217, 0.4) 100%)
- [ ] Border radius: 4px (inputs, buttons, cards)
- [ ] Border color: #D9914F (inputs)
- [ ] Background: #FFFBF0 (cream pale, main)

---

**Arquivo de referência**: `MOCKUP_REFERENCIA.html` (cópia exata do mockup original)
