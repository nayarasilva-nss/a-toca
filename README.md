# 🌱 ENRAIZAR — Desenvolvimento Organizacional

Ferramenta de consultoria para estruturação organizacional de pequenas e médias empresas brasileiras.

**Autora**: Nayara Silva
**Método**: Escuta · Raio-X · Acordo · Construção · Sustentação · Prova
**Produção**: https://enraizar.vercel.app

---

## Módulos

- **Clientes**: cadastro (empresa ou pessoa mentorada), trilhas contratadas, briefing
- **Diagnóstico de maturidade**: 6 áreas, 24 critérios
- **Propostas e financeiro**: geração com IA, parcelas, acompanhamento
- **Cargos, organograma e alçadas**
- **Manual do colaborador, tabela disciplinar, políticas**
- **POPs e fluxos de processo**
- **Trabalho de campo**: visitas, entrevistas, anomalias
- **Treinamentos e mentoria**: encontros, avaliações, relatórios
- **Ritos e indicadores**
- **Conselheira**: chat com IA no contexto do cliente
- **Relatórios** e backup/restauração em `.json`

---

## Tecnologia

- **Frontend**: React 19 + Vite
- **Storage**: localStorage (dados ficam no navegador)
- **IA**: Anthropic Claude via `api/ia.js` (Vercel Function — a chave nunca vai ao navegador)
- **Deploy**: Vercel

---

## Rodando localmente

```bash
npm install
npm run dev
npm run build
npm run lint
```

Variável de ambiente (Vercel e `.env.local`):

```
ANTHROPIC_API_KEY=...
```
