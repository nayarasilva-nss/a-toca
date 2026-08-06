# 🏠 A Toca — Design System (Mockups Completos)

## 📋 Visão Geral
Design elegante e sofisticado baseado nos mockups "A Toca - Mockups Completos.dc.html"

---

## 🎨 Paleta de Cores

### Cores Primárias (Vinho & Dourado)
| Nome | Hex | Uso |
|------|-----|-----|
| Vinho Escuro | #5C1A2B | Botões primários, headers |
| Vinho Claro | #3C181E | Texto principal, backgrounds |
| Vinho Medium | #8A3A2E | Backgrounds alternativos |
| Dourado | #D4AF37 | Labels, ênfases, bordas |
| Dourado Dark | #B8860B | Hover states |
| Cobre/Laranja | #D9914F | Inputs, borders, accents |

### Cores Neutras (Browns & Creams)
| Nome | Hex | Uso |
|------|-----|-----|
| Brown | #8B6F47 | Texto secundário |
| Brown Dark | #6B5D4F | Descrições, subtítulos |
| Taupe | #8A7A5C | Hints, placeholders |
| Taupe Light | #A0826D | Disabled states |
| Cream Light | #F5EDD9 | Backgrounds, cards |
| Cream Pale | #FFFBF0 | Main background, base |

---

## 🔤 Tipografia

### Fontes
- **Display/Títulos**: Crimson Text (serif)
  - font-weight: 800 (très bold)
  - font-size: 48px (main title)
  - letter-spacing: 4px

- **Body/Conteúdo**: Lora (serif)
  - font-weight: 400 (regular) / 600 (semibold)
  - font-size: 13px (main), 12px (secondary), 11px (labels)
  - line-height: 1.6

### Escala de Tamanhos
```
Título Principal  → 48px, 800, Crimson Text, letter-spacing: 4px
Título Página     → 24px, 600, Lora
Título Seção      → 18px, 600, Lora
Corpo             → 13px, 400, Lora
Corpo Pequeno     → 12px, 400, Lora
Label             → 11px, 600, Lora, letter-spacing: 1-2px (UPPERCASE)
Hint              → 10px, 400, Lora
```

---

## 📏 Espaçamento & Componentes

### Spacing Scale
```
xs: 2px
sm: 4px
md: 6px
lg: 8px
xl: 10px
2xl: 12px
3xl: 14px
4xl: 16px
5xl: 20px
6xl: 24px
7xl: 28px
8xl: 32px
```

### Form Elements
- **Input height**: 36px (padding: 10px 12px)
- **Button height**: 40px (padding: 12px 16px)
- **Border radius**: 4px
- **Border color**: #D9914F (copper)
- **Border width**: 1px
- **Focus ring**: 2px #D4AF37

### Cards
- **Padding**: 20px-32px
- **Border radius**: 8px
- **Background**: #FFFBF0 (cream pale)
- **Border**: 1px solid rgba(60, 24, 30, 0.08)
- **Shadow**: 0 2px 8px rgba(0, 0, 0, 0.06)

---

## 🎯 Component Patterns

### Buttons
- **Primary**: Background #5C1A2B, Color #FFFFFF
- **Secondary**: Background transparent, Border #D9914F
- **Hover**: Darker shade (--20% lightness)
- **Padding**: 12px 16px (small) → 14px 24px (large)
- **Letter-spacing**: 1px
- **Font-weight**: 600

### Labels
- **Color**: #D4AF37 (dourado)
- **Font-size**: 11px
- **Font-weight**: 600
- **Text-transform**: UPPERCASE
- **Letter-spacing**: 1-2px
- **Margin-bottom**: 6px

### Sections
- **Padding**: 28px-32px (containers)
- **Gap**: 8px-16px (between items)
- **Margin-bottom**: 24px-32px (between sections)
- **Border-bottom**: 1px solid rgba(60, 24, 30, 0.08)

---

## 🔄 States

### Hover
- Cards: box-shadow increases to 0 8px 16px
- Buttons: 20% darker background
- Links: underline appears

### Focus
- Inputs: 2px #D4AF37 ring
- Focus visible: outline-offset 2px

### Disabled
- Opacity: 60%
- Cursor: not-allowed
- Color: #A0826D (taupe light)

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 0-640px (1 column)
- **Tablet**: 640px-1024px (2 columns)
- **Desktop**: 1024px+ (3 columns)

### Grid Layout
- **Gap**: 8px-16px
- **Max-width**: 1200px (desktop container)
- **Padding**: 16px (mobile) → 32px (desktop)

---

## ✨ Special Styling

### Text Gradient (for "A TOCA" title)
```css
background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

### Subtle Backgrounds
```css
background: linear-gradient(180deg, rgba(60, 24, 30, 0.02) 0%, rgba(217, 145, 79, 0.05) 100%);
```

### Section Headers
```css
background: linear-gradient(180deg, rgba(217, 145, 79, 0.08) 0%, rgba(245, 237, 217, 0.4) 100%);
```

---

## 🎭 Implementation Checklist

- [ ] Update all buttons to use #5C1A2B primary color
- [ ] Apply Crimson Text to titles (48px, 800)
- [ ] Apply Lora to body text (13px, 400)
- [ ] Update all input borders to #D9914F
- [ ] Update label styling (11px, UPPERCASE, letter-spacing: 1px)
- [ ] Apply card shadows and borders consistently
- [ ] Update hover states on all interactive elements
- [ ] Add focus rings to inputs/buttons
- [ ] Test responsiveness at breakpoints
- [ ] Verify color contrast (WCAG AA minimum)

---

**Generated from**: A Toca - Mockups Completos.dc.html
**Last updated**: 2026-08-06
