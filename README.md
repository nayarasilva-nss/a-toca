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
- **Banco**: Neon Postgres (Vercel Marketplace) via `api/storage.js` — tabela chave-valor `kv`; o navegador mantém um espelho em localStorage e, se o banco estiver indisponível, segue funcionando localmente. Dados antigos do localStorage migram sozinhos para o banco na primeira abertura.
- **IA**: Anthropic Claude via `api/ia.js` (Vercel Function — a chave nunca vai ao navegador)
- **Deploy**: Vercel

---

## Rodando localmente

```bash
npm install
vercel env pull   # traz DATABASE_URL e ANTHROPIC_API_KEY para .env.local
vercel dev        # front + funções api/ (IA e banco) em http://localhost:3000
npm run dev       # só o front (sem IA e sem banco — usa localStorage)
npm run build
npm run lint
```

Variáveis de ambiente (Vercel): `ANTHROPIC_API_KEY` e as do Neon (`DATABASE_URL` etc., criadas pela integração).

Acesso: o projeto usa a proteção de deploy da Vercel — só quem está logado na conta abre o app e a API.
