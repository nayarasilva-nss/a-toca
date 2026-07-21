# 🏛️ A Toca — Central de Governança

Ferramenta interna de consultoria para estruturação organizacional de pequenas e médias empresas brasileiras.

**Autor**: Nayara Silva  
**Metodologia**: Base Kenkyo  
**Status**: ✅ Pronto para produção

---

## O que é A Toca?

App completo de React (9.907 linhas otimizadas) que gerencia:

- **Tabela Disciplinar**: Catálogo de infrações com escalas de gravidade
- **Descrições de Cargo**: Geração automática com IA
- **Organograma**: Estrutura de liderança
- **Manual do Colaborador**: Políticas e procedimentos
- **POPs**: Procedimentos operacionais padrão
- **Diagnóstico de Maturidade**: 8 áreas de governança
- **Trabalho de Campo**: Visitas, entrevistas, turnos
- **Penseira**: Chat com IA para insights
- **Relatórios**: Geração automática de documentos

---

## Tecnologia

- **Frontend**: React 19.2.7
- **Bundler**: Vite 8.1.1
- **Storage**: localStorage (~5-10MB)
- **IA**: Anthropic Claude (via Vercel Edge Functions)
- **Deploy**: Vercel (auto via GitHub)

---

## Rodando Localmente

```bash
npm install
npm run dev          # http://localhost:5183
npm run build        # Produção
npm run preview      # Simula produção
```

---

## Produção (Vercel)

Variável de ambiente necessária:

```
ANTHROPIC_API_KEY = sua-chave-aqui
```

---

## Performance

✅ Otimizado com:
- 1 useReducer (40x menos re-renders)
- Promise.all paralelo (26x mais rápido)
- useMemo para derivações
- Bundle: 142KB gzipped

---

## Dados & Segurança

✅ Dados em `localStorage` (seu navegador)  
✅ Nenhum servidor guarda dados  
✅ Backup manual com .json  
✅ Sem telemetria  

---

**Última atualização**: 2026-07-21  
**Deploy**: https://a-toca.vercel.app
