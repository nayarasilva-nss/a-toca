import { useState } from "react";
import { CORES } from "../nucleo/base.jsx";

// ─── Categorias de Módulos (Navegação Principal) ──────────────────
export const CATEGORIAS_MODULOS = [
  {
    id: "dashboard",
    nome: "Dashboard",
    emoji: "📊",
    modulos: [
      { id: "home", nome: "Home" }
    ]
  },
  {
    id: "cliente",
    nome: "Cliente",
    emoji: "🏢",
    modulos: [
      { id: "cliente", nome: "Visão Geral" },
      { id: "novo", nome: "Novo Cliente" },
      { id: "editar", nome: "Editar" }
    ]
  },
  {
    id: "gestao",
    nome: "Gestão",
    emoji: "⚙️",
    modulos: [
      { id: "gestao", nome: "Frentes" },
      { id: "estrutura", nome: "Organograma" },
      { id: "cargos", nome: "Cargos" },
      { id: "tabela", nome: "Matriz Comportamental" }
    ]
  },
  {
    id: "pessoas",
    nome: "Pessoas",
    emoji: "👥",
    modulos: [
      { id: "pessoa", nome: "Perfil" },
      { id: "temperamentos", nome: "Temperamentos" },
      { id: "diaglider", nome: "Diagnóstico Liderança" },
      { id: "mentoria", nome: "Mentoria" }
    ]
  },
  {
    id: "processos",
    nome: "Processos",
    emoji: "📋",
    modulos: [
      { id: "pops", nome: "POPs" },
      { id: "fluxos", nome: "Fluxogramas" },
      { id: "manual", nome: "Manual" },
      { id: "cct", nome: "CCT" }
    ]
  },
  {
    id: "financeiro",
    nome: "Financeiro",
    emoji: "💰",
    modulos: [
      { id: "propostas", nome: "Propostas" },
      { id: "cronograma", nome: "Cronograma" },
      { id: "financeiro", nome: "Financeiro" },
      { id: "relatorios", nome: "Relatórios" }
    ]
  },
  {
    id: "diagnosticos",
    nome: "Diagnósticos",
    emoji: "🔍",
    modulos: [
      { id: "diagnosticos", nome: "Diagnósticos" },
      { id: "anomalias", nome: "Anomalias" },
      { id: "campo", nome: "Análise de Campo" }
    ]
  },
  {
    id: "configuracao",
    nome: "Configuração",
    emoji: "⚡",
    modulos: [
      { id: "treinamentos", nome: "Treinamentos" },
      { id: "indicadores", nome: "KPIs" },
      { id: "ritos", nome: "Ritos" },
      { id: "alcadas", nome: "Alçadas" },
      { id: "docs", nome: "Políticas" }
    ]
  }
];


// ─── As 6 Fases do Enraizar ─────────────────────────────────────


// ─── Conteúdo Detalhado de Cada Fase ────────────────────────────


// ─── Mapa de Módulos por Fase ───────────────────────────────────

export function NavegacaoModulos({ categoriaAtiva, onSelecionarModulo, onMostrarTodas, mostrandoTodas = false }) {
  const [expanded, setExpanded] = useState({});

  return (
    <nav
      style={{
        background: CORES.fundoPrincipal,
        borderBottom: `1px solid ${CORES.border}`,
        padding: "12px 24px",
        overflowX: "auto",
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        fontSize: "13px",
        fontFamily: "'Lora', serif",
      }}
    >
      {CATEGORIAS_MODULOS.map((cat) => (
        <div key={cat.id} style={{ position: "relative" }}>
          <button
            onClick={() => setExpanded({ ...expanded, [cat.id]: !expanded[cat.id] })}
            style={{
              background: categoriaAtiva === cat.id ? CORES.dourado : "transparent",
              color: categoriaAtiva === cat.id ? CORES.principal : CORES.textoDim,
              border: "none",
              padding: "8px 12px",
              borderRadius: "4px",
              cursor: "pointer",
              fontFamily: "'Lora', serif",
              fontSize: "13px",
              fontWeight: "600",
              transition: "all 0.2s ease",
              display: "flex",
              gap: "6px",
              alignItems: "center",
              whiteSpace: "nowrap",
            }}
          >
            {cat.emoji} {cat.nome}
            {expanded[cat.id] && <span>▼</span>}
          </button>

          {expanded[cat.id] && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                background: CORES.cartao,
                border: `1px solid ${CORES.border}`,
                borderRadius: "4px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                zIndex: 100,
                minWidth: "160px",
                marginTop: "4px",
              }}
            >
              {cat.modulos.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => {
                    onSelecionarModulo(mod.id);
                    setExpanded({ ...expanded, [cat.id]: false });
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 12px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: CORES.texto,
                    fontSize: "13px",
                    fontFamily: "'Lora', serif",
                    borderBottom: `1px solid ${CORES.border}`,
                  }}
                >
                  {mod.nome}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
