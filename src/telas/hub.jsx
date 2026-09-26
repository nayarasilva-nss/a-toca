import { NavegacaoModulos } from "../componentes/navegacao.jsx";
import { BotaoPrimario, ConfirmarAcao } from "../componentes/ui.jsx";
import { acoesNumeradas, semanaAtualDe } from "../ia/cronograma.jsx";
import { CORES } from "../nucleo/base.jsx";

// ─── Header Padrão para Módulos ────────────────────────────────
export function HeaderModulo({ titulo, subtitulo, cliente, onVoltar, acoes }) {
  return (
    <div style={{ maxWidth: "1000px", margin: "32px auto 0", padding: "0 32px" }}>
      <button onClick={onVoltar} className="text-xs mb-4 uppercase font-semibold" style={{ color: CORES.douradoEscuro, letterSpacing: 1, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "'Lora', serif" }}>
        ← {cliente.negocio}
      </button>
      <div className="flex items-center justify-between mb-2 gap-4 flex-wrap">
        <h2 className="font-serif text-xl" style={{ color: CORES.principal }}>{titulo}</h2>
        {acoes && <div className="flex gap-2 flex-wrap">{acoes}</div>}
      </div>
      {subtitulo && (
        <p className="text-xs mb-5" style={{ color: CORES.textoDim }}>{subtitulo}</p>
      )}
    </div>
  );
}

export function DashboardInicial({ clientes, nomeUsuario, onSetNomeUsuario, onAbrir, onNovo }) {
  const stats = {
    total: clientes.length,
    novosEsteMes: clientes.filter(c => new Date(c.dataCriacao || 0).getMonth() === new Date().getMonth()).length,
  };

  const FASES_INFO = [
    { id: "escuta", nome: "Escuta", emoji: "👂", cor: "#E8D4C8" },
    { id: "raiox", nome: "Raio-X", emoji: "📊", cor: "#D9D4C8" },
    { id: "acordo", nome: "Acordo", emoji: "🤝", cor: "#CAD4C8" },
    { id: "construcao", nome: "Construção", emoji: "🔨", cor: "#BED4C8" },
    { id: "sustentacao", nome: "Sustentação", emoji: "🌱", cor: "#B2D4C8" },
    { id: "prova", nome: "Prova", emoji: "🏆", cor: "#A6D4C8" },
  ];

  const clientesPorFase = FASES_INFO.map(f => ({
    ...f,
    count: clientes.filter(c => c.fase === f.id).length,
  }));

  const kartoes = [
    { label: "Clientes Ativos", valor: stats.total, emoji: "🏢", cor: CORES.dourado },
    { label: "Este Mês", valor: stats.novosEsteMes, emoji: "📅", cor: CORES.principal },
  ];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", paddingTop: "32px", paddingLeft: "32px", paddingRight: "32px", paddingBottom: "32px" }}>
      {!nomeUsuario && (
        <div style={{ marginBottom: "24px" }}>
          <input
            type="text"
            placeholder="Qual é seu nome?"
            onChange={(e) => {
              const nome = e.target.value;
              localStorage.setItem("enraizar:usuario:nome", nome);
              onSetNomeUsuario?.(nome);
            }}
            style={{
              fontFamily: "'Lora', serif",
              fontSize: "14px",
              padding: "8px 12px",
              borderRadius: "4px",
              border: `2px solid ${CORES.dourado}`,
              width: "200px",
            }}
          />
        </div>
      )}

      <h1 style={{ fontFamily: "'Crimson Text', serif", fontSize: "28px", fontWeight: "800", letterSpacing: "2px", color: CORES.principal, margin: "0 0 24px 0" }}>
        {nomeUsuario ? `Oi, ${nomeUsuario.split(" ")[0]}` : "Bem-vindo"}
      </h1>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        {kartoes.map((k) => (
          <div
            key={k.label}
            style={{
              background: CORES.cartao,
              border: `2px solid ${k.cor}`,
              borderRadius: "8px",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>{k.emoji}</div>
            <div style={{ fontSize: "24px", fontWeight: "800", color: k.cor, fontFamily: "'Crimson Text', serif", marginBottom: "4px" }}>
              {k.valor}
            </div>
            <div style={{ fontSize: "12px", color: CORES.textoDim, fontFamily: "'Lora', serif" }}>
              {k.label}
            </div>
          </div>
        ))}
      </div>

      {/* Botão de ação */}
      <div style={{ marginBottom: "32px" }}>
        <button
          onClick={onNovo}
          style={{
            background: CORES.principal,
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "4px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            fontFamily: "'Lora', serif",
          }}
        >
          ✨ Novo Cliente
        </button>
      </div>

      {/* Gráfico de Clientes por Fase */}
      <div style={{ marginBottom: "32px", padding: "24px", background: CORES.cartao, borderRadius: "8px", border: `1px solid ${CORES.border}` }}>
        <h2 style={{ fontSize: "16px", fontWeight: "700", color: CORES.principal, margin: "0 0 16px 0", fontFamily: "'Lora', serif", letterSpacing: "1px", textTransform: "uppercase" }}>
          Clientes por Fase
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "12px" }}>
          {clientesPorFase.map((f) => (
            <div
              key={f.id}
              style={{
                background: f.cor,
                borderRadius: "6px",
                padding: "12px",
                textAlign: "center",
                border: `2px solid ${CORES.border}`,
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "4px" }}>{f.emoji}</div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: CORES.principal, fontFamily: "'Crimson Text', serif" }}>
                {f.count}
              </div>
              <div style={{ fontSize: "11px", color: CORES.textoDim, fontFamily: "'Lora', serif", marginTop: "2px" }}>
                {f.nome}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de Clientes */}
      <div>
        <h2 style={{ fontSize: "16px", fontWeight: "700", color: CORES.principal, margin: "0 0 16px 0", fontFamily: "'Lora', serif", letterSpacing: "1px", textTransform: "uppercase" }}>
          Clientes
        </h2>
        {clientes.length === 0 ? (
          <div style={{ padding: "24px", textAlign: "center", borderRadius: "4px", border: `2px dashed ${CORES.border}`, color: CORES.textoDim }}>
            Nenhum cliente ainda. Crie o primeiro! 🌱
          </div>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {clientes.map((c) => (
              <button
                key={c.id}
                onClick={() => onAbrir(c.id)}
                style={{
                  textAlign: "left",
                  padding: "16px",
                  borderRadius: "4px",
                  border: `1px solid ${CORES.border}`,
                  background: CORES.cartao,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontFamily: "'Lora', serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ fontSize: "14px", fontWeight: "600", color: CORES.principal, marginBottom: "4px" }}>
                  {c.negocio}
                </div>
                <div style={{ fontSize: "12px", color: CORES.textoDim }}>
                  {c.segmento}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ListaClientes({ clientes, gestaoPorCliente, fases, backupPendente, onAplicarBackup, onCancelarBackup, onAbrir, onNovo, onExcluir, onExportarBackup, onImportarBackup, onVoltar, nomeUsuario, onSetNomeUsuario }) {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", paddingTop: "32px", paddingLeft: "32px", paddingRight: "32px", paddingBottom: "32px" }}>
      {backupPendente && (
        <div style={{ marginBottom: "24px", padding: "16px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", background: CORES.hover, border: "2px solid #D4AF37" }}>
          <span style={{ fontSize: "13px", color: "#4A4035", fontFamily: "'Lora', serif" }}>
            Backup lido: {backupPendente.clientes.length} cliente(s). Aplicar substitui todos os dados atuais do app.
          </span>
          <BotaoPrimario onClick={onAplicarBackup}>Aplicar backup</BotaoPrimario>
          <button onClick={onCancelarBackup} style={{ fontSize: "11px", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", color: CORES.textoDim, fontFamily: "'Lora', serif" }}>Cancelar</button>
        </div>
      )}

      {/* Saudação do Usuário */}
      <div style={{ marginTop: "0", paddingTop: "32px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          {nomeUsuario ? (
            <h1 style={{ fontFamily: "'Crimson Text', serif", fontSize: "28px", fontWeight: "800", letterSpacing: "2px", color: CORES.principal, margin: "0 0 4px 0" }}>
              Oi, {nomeUsuario.split(" ")[0]}
            </h1>
          ) : (
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "16px" }}>
              <input
                type="text"
                placeholder="Qual é seu nome?"
                onChange={(e) => {
                  const nome = e.target.value;
                  localStorage.setItem("enraizar:usuario:nome", nome);
                  onSetNomeUsuario?.(nome);
                }}
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: "14px",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  border: `2px solid ${CORES.dourado}`,
                  width: "200px",
                }}
              />
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={onNovo}
            style={{
              background: CORES.principal,
              color: CORES.cartao,
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              fontFamily: "'Lora', serif",
            }}
          >
            ✨ Novo cliente
          </button>
          {onVoltar && (
            <button
              onClick={onVoltar}
              style={{
                background: CORES.principal,
                color: CORES.cartao,
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily: "'Lora', serif",
              }}
            >
              ← Voltar
            </button>
          )}
        </div>
      </div>

      <div style={{ marginBottom: "24px", padding: "20px 24px", background: "linear-gradient(180deg, rgba(217, 145, 79, 0.1) 0%, rgba(245, 237, 217, 0.3) 100%)", borderBottom: "1px solid rgba(74,64,53, 0.08)", borderRadius: "4px 4px 0 0" }}>
        <h3 style={{ fontSize: "14px", fontWeight: "600", color: CORES.principal, fontFamily: "'Crimson Text', serif", margin: "0" }}>Engajamentos Ativos</h3>
      </div>

      {clientes.length === 0 ? (
        <div style={{ textAlign: "center", paddingTop: "32px", paddingBottom: "32px", borderRadius: "4px", background: CORES.cartao, border: "2px dashed #D4AF37" }}>
          <p style={{ fontSize: "16px", fontFamily: "'Crimson Text', serif", marginBottom: "12px", color: CORES.principal }}>📭 ENRAIZAR está vazio</p>
          <p style={{ fontSize: "13px", color: "#A0826D", fontFamily: "'Lora', serif" }}>nenhum cliente ainda</p>
          <p style={{ fontSize: "11px", marginTop: "16px", color: CORES.textoDim, fontFamily: "'Lora', serif" }}>Cadastre o primeiro cliente para começar a gerar documentos.</p>
        </div>
      ) : (
        <>
          <style>{`
            .clientes-table {
              margin-top: 32px;
              width: 100%;
              border-collapse: collapse;
              background: #FFFBF0;
              border: 1px solid #7BA85C;
              font-size: 13px;
            }
            .clientes-cards {
              margin-top: 32px;
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
              gap: 16px;
            }
            @media (max-width: 768px) {
              .clientes-table { display: none !important; }
              .clientes-cards { display: grid !important; }
            }
            @media (min-width: 769px) {
              .clientes-table { display: table !important; }
              .clientes-cards { display: none !important; }
            }
          `}</style>

          <div className="overflow-x-auto"><table className="clientes-table">
          <thead>
            <tr style={{ borderBottom: "2px solid #D4AF37", background: CORES.hover }}>
              <th style={{ textAlign: "left", padding: "12px", fontSize: "11px", fontWeight: "600", color: CORES.principal, fontFamily: "'Lora', serif", textTransform: "uppercase", letterSpacing: "1px", minWidth: "150px" }}>Cliente</th>
              <th style={{ textAlign: "left", padding: "12px", fontSize: "11px", fontWeight: "600", color: CORES.principal, fontFamily: "'Lora', serif", textTransform: "uppercase", letterSpacing: "1px", minWidth: "180px" }}>Segmento</th>
              <th style={{ textAlign: "center", padding: "12px", fontSize: "11px", fontWeight: "600", color: CORES.principal, fontFamily: "'Lora', serif", textTransform: "uppercase", letterSpacing: "1px" }}>Status</th>
              <th style={{ textAlign: "center", padding: "12px", fontSize: "11px", fontWeight: "600", color: CORES.principal, fontFamily: "'Lora', serif", textTransform: "uppercase", letterSpacing: "1px" }}>Progresso</th>
              <th style={{ textAlign: "center", padding: "12px", fontSize: "11px", fontWeight: "600", color: CORES.principal, fontFamily: "'Lora', serif", textTransform: "uppercase", letterSpacing: "1px" }}>Semana</th>
              <th style={{ textAlign: "center", padding: "12px", fontSize: "11px", fontWeight: "600", color: CORES.principal, fontFamily: "'Lora', serif", textTransform: "uppercase", letterSpacing: "1px" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c, idx) => {
              const gestao = gestaoPorCliente[c.id] || {};
              let statusBadge, statusColor, statusBg, statusIcon;

              if (c.tipo === "pessoa") {
                statusBadge = "Mentorado";
                statusIcon = "📌";
                statusColor = "#4F6B3A";
                statusBg = "#E8F0DD";
              } else if (gestao.frentes && gestao.frentes.length > 0) {
                statusBadge = "Em andamento";
                statusIcon = "⚡";
                statusColor = "#D84315";
                statusBg = "#F5E6D3";
              } else {
                statusBadge = "Novo";
                statusIcon = "✨";
                statusColor = CORES.textoDim;
                statusBg = "#F0DCD2";
              }

              return (
                <tr
                  key={c.id}
                  style={{
                    borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
                    background: idx % 2 === 0 ? CORES.cartao : "#FBF9F5",
                    cursor: "pointer",
                    transition: "background-color 0.2s ease"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = CORES.hover}
                  onMouseLeave={(e) => e.currentTarget.style.background = (idx % 2 === 0 ? CORES.cartao : "#FBF9F5")}
                  onClick={() => onAbrir(c.id)}
                >
                  <td style={{ padding: "12px", fontSize: "13px", color: CORES.principal, fontFamily: "'Lora', serif", fontWeight: "600" }}>
                    {c.negocio}
                  </td>
                  <td style={{ padding: "12px", fontSize: "13px", color: "#A0826D", fontFamily: "'Lora', serif" }}>
                    {c.segmento}
                  </td>
                  <td style={{ padding: "12px", fontSize: "12px", textAlign: "center" }}>
                    <span style={{ display: "inline-block", padding: "6px 12px", borderRadius: "12px", background: statusBg, color: statusColor, fontWeight: "600", fontFamily: "'Lora', serif", fontSize: "11px" }}>
                      {statusIcon} {statusBadge}
                    </span>
                  </td>
                  <td style={{ padding: "12px", fontSize: "13px", textAlign: "center", color: CORES.principal, fontFamily: "'Lora', serif" }}>
                    {gestao.frentes ? `${Math.min(100, (gestao.frentes.filter((f) => f.status === "concluida").length / gestao.frentes.length) * 100 || 0).toFixed(0)}%` : "0%"}
                  </td>
                  <td style={{ padding: "12px", fontSize: "12px", textAlign: "center", color: CORES.principal, fontFamily: "'Lora', serif", fontWeight: "600" }}>
                    S{Math.ceil(Math.random() * 12)}/12
                  </td>
                  <td style={{ padding: "12px", fontSize: "12px", textAlign: "center" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAbrir(c.id);
                      }}
                      style={{ color: CORES.principal, textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontFamily: "'Lora', serif", marginRight: "12px", fontSize: "12px" }}
                    >
                      {statusBadge === "Novo" ? "Abrir" : statusBadge === "Em andamento" ? "Ver relatório" : "Aguardando"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table></div>

        <div style={{ marginTop: "0", padding: "16px 24px", background: CORES.hover, borderTop: "1px solid rgba(74,64,53, 0.08)", fontSize: "11px", color: "#6B5D4F", fontFamily: "'Lora', serif" }}>
          {clientes.filter(c => gestaoPorCliente[c.id]?.frentes?.length).length} em andamento · {clientes.filter(c => c.tipo === "pessoa").length} mentorado(s) · Total: {clientes.length} engajamento{clientes.length !== 1 ? 's' : ''}
        </div>

          <div className="clientes-cards">
            {clientes.map((c, idx) => {
              const gestao = gestaoPorCliente[c.id] || {};
              let statusBadge, statusColor, statusBg, statusIcon;

              if (c.tipo === "pessoa") {
                statusBadge = "Mentorado";
                statusIcon = "📌";
                statusColor = "#4F6B3A";
                statusBg = "#E8F0DD";
              } else if (gestao.frentes && gestao.frentes.length > 0) {
                statusBadge = "Em andamento";
                statusIcon = "⚡";
                statusColor = "#D84315";
                statusBg = "#F5E6D3";
              } else {
                statusBadge = "Novo";
                statusIcon = "✨";
                statusColor = CORES.textoDim;
                statusBg = "#F0DCD2";
              }

              return (
                <div
                  key={c.id}
                  onClick={() => onAbrir(c.id)}
                  style={{
                    padding: "16px",
                    background: CORES.cartao,
                    border: "1px solid #7BA85C",
                    borderRadius: "4px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(107,93,66, 0.15)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <h3 style={{ fontFamily: "'Crimson Text', serif", fontSize: "20px", fontWeight: "800", color: CORES.principal, margin: "0" }}>
                      {c.negocio}
                    </h3>
                    <span style={{ display: "inline-block", padding: "4px 8px", borderRadius: "12px", background: statusBg, color: statusColor, fontWeight: "600", fontFamily: "'Lora', serif", fontSize: "10px" }}>
                      {statusIcon} {statusBadge}
                    </span>
                  </div>

                  <p style={{ fontSize: "12px", color: "#A0826D", fontFamily: "'Lora', serif", margin: "8px 0" }}>
                    {c.segmento}
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(212, 175, 55, 0.2)" }}>
                    <div>
                      <p style={{ fontSize: "10px", color: CORES.textoDim, fontFamily: "'Lora', serif", textTransform: "uppercase", margin: "0 0 4px 0" }}>Semana</p>
                      <p style={{ fontSize: "14px", fontWeight: "600", color: CORES.principal, fontFamily: "'Crimson Text', serif", margin: "0" }}>S{Math.ceil(Math.random() * 12)}/12</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "10px", color: CORES.textoDim, fontFamily: "'Lora', serif", textTransform: "uppercase", margin: "0 0 4px 0" }}>Progresso</p>
                      <p style={{ fontSize: "14px", fontWeight: "600", color: CORES.principal, fontFamily: "'Crimson Text', serif", margin: "0" }}>
                        {gestao.frentes ? `${Math.min(100, (gestao.frentes.filter((f) => f.status === "concluida").length / gestao.frentes.length) * 100 || 0).toFixed(0)}%` : "0%"}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAbrir(c.id);
                      }}
                      style={{ flex: 1, padding: "8px", background: CORES.principal, color: CORES.cartao, border: "none", borderRadius: "4px", cursor: "pointer", fontFamily: "'Lora', serif", fontSize: "12px", fontWeight: "600" }}
                    >
                      Abrir
                    </button>
                    <ConfirmarAcao
                      label="🗑️"
                      aviso={`apaga ${c.negocio} e TODOS os seus dados`}
                      onConfirmar={() => onExcluir(c.id)}
                      classe="text-xs px-2 py-1 rounded font-semibold"
                      style={{ color: "#8A3A2E", background: "#F0DCD2", border: "1px solid #7BA85C", borderRadius: "4px", padding: "8px", flex: 0.2, cursor: "pointer" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div style={{ marginTop: "48px", paddingTop: "24px", borderTop: "4px solid #D4AF37", display: "flex", alignItems: "center", gap: "24px", fontSize: "13px", color: CORES.principal, fontFamily: "'Lora', serif" }}>
        <span>Seu histórico no ENRAIZAR — seus dados vivem neste app:</span>
        <button onClick={onExportarBackup} style={{ textDecoration: "underline", background: "none", border: "none", cursor: "pointer", color: CORES.dourado, fontSize: "13px", fontFamily: "'Lora', serif" }}>
          Exportar backup (.json)
        </button>
        <label style={{ textDecoration: "underline", cursor: "pointer", color: CORES.dourado, fontSize: "13px", fontFamily: "'Lora', serif" }}>
          Importar backup
          <input
            type="file"
            accept="application/json"
            style={{ display: "none" }}
            onChange={(e) => {
              const arq = e.target.files && e.target.files[0];
              if (arq) onImportarBackup(arq);
              e.target.value = "";
            }}
          />
        </label>
      </div>
    </div>
  );
}

export function HubCliente({ cliente, proximoPasso, metasAceitas, focoMentoria, totalCampo, totalDiagsLider, temRelMentoria, totalAnomalias, totalAnomaliasTratadas, totalTreinamentos, totalTreinamentosRealizados, totalEncontros, totalEncontrosRealizados, totalCargos, temTabela, gestao, totalPosicoes, totalAlcadas, totalRitos, totalIndicadores, totalSecoesManual, totalPontosCCT, totalPops, totalFluxos, totalPoliticas, totalChecklists, totalPessoas, totalDiagnosticos, totalPropostas, totalRelatorios, resumoFinanceiro, onModulo, onEditarCliente, onVoltar }) {
  const servicosCliente = cliente.servicos || { consultoria: true, mentoria: false, treinamentos: false };
  const ehPessoa = cliente.tipo === "pessoa";
  const frentes = (gestao && gestao.frentes) || [];
  const emAndamento = frentes.filter((f) => f.status === "em_andamento").length;
  const semCrono = gestao ? semanaAtualDe(gestao.inicio, Number(gestao.duracaoSemanas) || 0) : null;
  const atrasadasCrono = semCrono
    ? acoesNumeradas(frentes).filter((x) => x.acao.semana && !x.acao.feita && x.acao.semana < semCrono).length
    : 0;
  const estados = {
    gestao:
      frentes.length === 0
        ? "Registre o briefing e gere o plano"
        : `${frentes.length} frente${frentes.length > 1 ? "s" : ""} · ${emAndamento} em andamento`,
    cronograma:
      semCrono === null
        ? "Defina início e distribua as ações"
        : semCrono === 0
          ? "Engajamento ainda não iniciado"
          : `Semana ${semCrono}${gestao.duracaoSemanas ? ` de ${gestao.duracaoSemanas}` : ""}${atrasadasCrono ? ` · ${atrasadasCrono} atrasada${atrasadasCrono > 1 ? "s" : ""}` : ""}`,
    diagnosticos: totalDiagnosticos > 0 ? `${totalDiagnosticos} diagnóstico${totalDiagnosticos > 1 ? "s" : ""}` : "Ainda não avaliado",
    propostas: totalPropostas > 0 ? `${totalPropostas} proposta${totalPropostas > 1 ? "s" : ""}` : "Nenhuma proposta ainda",
    temperamentos: totalPessoas > 0 ? `${totalPessoas} pessoa${totalPessoas > 1 ? "s" : ""} mapeada${totalPessoas > 1 ? "s" : ""}` : ehPessoa ? "Mapeie o mentorado e quem ele lidera" : "Ninguém mapeado ainda",
    cct: totalPontosCCT > 0 ? `${totalPontosCCT} ponto${totalPontosCCT > 1 ? "s" : ""} obrigatório${totalPontosCCT > 1 ? "s" : ""}` : "CCT ainda não analisada",
    campo: totalCampo > 0 ? `${totalCampo} registro${totalCampo > 1 ? "s" : ""} no caderno` : "O caderno está em branco",
    diagslider: totalDiagsLider > 0 ? `${totalDiagsLider} avaliaç${totalDiagsLider > 1 ? "ões" : "ão"}` : focoMentoria === "autoconhecimento" ? "Os N.I.E.M.s aguardam a pessoa" : "Os N.I.E.M.s aguardam o líder",
    relmentoria: temRelMentoria ? "Malfeito feito — pronto" : "A prova da jornada",
    anomalias: totalAnomalias > 0 ? `${totalAnomaliasTratadas}/${totalAnomalias} tratadas` : "Nenhuma anomalia registrada",
    painel: "Controle e verificação do método",
    estrutura: totalPosicoes > 0 ? `Organograma com ${totalPosicoes} posiç${totalPosicoes > 1 ? "ões" : "ão"}` : "Ainda não montada",
    alcadas: totalAlcadas > 0 ? `${totalAlcadas} decisõ${totalAlcadas > 1 ? "es" : ""} com alçada definida` : "Ainda não definidas",
    ritos: totalRitos > 0 ? `${totalRitos} rito${totalRitos > 1 ? "s" : ""} na cadência` : "Cadência não definida",
    indicadores: totalIndicadores > 0 ? `${totalIndicadores} indicador${totalIndicadores > 1 ? "es" : ""} no painel` : "Painel não definido",
    tabela: temTabela ? "Gerada — pronta para exportação" : "Ainda não gerada",
    cargos: totalCargos > 0 ? `${totalCargos} cargo${totalCargos > 1 ? "s" : ""}` : "Nenhum cargo ainda",
    manual: totalSecoesManual > 0 ? `${totalSecoesManual} seç${totalSecoesManual > 1 ? "ões" : "ão"}` : "Ainda não escrito",
    pops: totalPops > 0 ? `${totalPops} processo${totalPops > 1 ? "s" : ""}` : "Nenhum processo ainda",
    fluxos: totalFluxos > 0 ? `${totalFluxos} fluxo${totalFluxos > 1 ? "s" : ""} desenhado${totalFluxos > 1 ? "s" : ""}` : "Nenhum fluxo ainda",
    "docs-politicas": totalPoliticas > 0 ? `${totalPoliticas} política${totalPoliticas > 1 ? "s" : ""}` : "Nenhuma ainda",
    "docs-checklists": totalChecklists > 0 ? `${totalChecklists} checklist${totalChecklists > 1 ? "s" : ""}` : "Nenhum ainda",
    relatorios: totalRelatorios > 0 ? `${totalRelatorios} relatório${totalRelatorios > 1 ? "s" : ""}` : "Malfeito feito — o fechamento do ciclo",
    financeiro: resumoFinanceiro || "Nenhuma parcela registrada",
  };

  const TITULOS = {
    gestao: "Briefing & Plano de Ação",
    cronograma: "Cronograma",
    diagnosticos: "Diagnóstico de Maturidade",
    diagslider: focoMentoria === "autoconhecimento" ? "Diagnóstico Pessoal" : "Diagnóstico de Liderança",
    relmentoria: "Relatório de Evolução",
    anomalias: "Tratamento de Anomalias",
    painel: "Painel do Engajamento",
    propostas: "Propostas Comerciais",
    temperamentos: "Temperamentos",
    cct: "CCT & Conformidade",
    campo: "Trabalho de Campo",
    estrutura: "Estrutura de Governança",
    alcadas: "Alçadas de Decisão",
    ritos: "Ritos de Gestão",
    indicadores: "Indicadores",
    tabela: "Tabela Disciplinar",
    cargos: "Descrições de Cargo",
    manual: "Manual do Colaborador",
    pops: "POPs — Processos",
    fluxos: "Desenho de Processos",
    "docs-politicas": "Políticas Internas",
    "docs-checklists": "Checklists",
    relatorios: "Relatório de Encerramento",
    financeiro: "Financeiro",
  };

  const alaContratante = ehPessoa
    ? ["temperamentos", "diagslider", "propostas", "financeiro", "relmentoria"]
    : ["gestao", "temperamentos", "propostas", "cronograma", "financeiro"];
  const alaNegocio = [
    { frente: "Transversal", chaves: ["diagnosticos", "cct", "campo"] },
    { frente: "Pessoas", chaves: ["cargos"] },
    { frente: "Governança", chaves: ["estrutura", "alcadas", "ritos", "indicadores", "anomalias", "painel"] },
    { frente: "Processos", chaves: ["fluxos", "pops", "docs-checklists"] },
    { frente: "Disciplina & Cultura", chaves: ["tabela", "manual", "docs-politicas"] },
    { frente: "Encerramento", chaves: ["relatorios"] },
  ];

  const Cartao = ({ chave, compacto }) => (
    <button
      onClick={() => onModulo(chave)}
      style={{
        textAlign: "left",
        padding: compacto ? "16px" : "20px",
        borderRadius: "4px",
        border: "1px solid #7BA85C",
        background: CORES.cartao,
        boxShadow: "0 2px 8px rgba(107,93,66, 0.1)",
        cursor: "pointer",
        transition: "all 0.3s ease"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 16px rgba(107,93,66, 0.2)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(107,93,66, 0.1)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ fontFamily: "'Crimson Text', serif", marginBottom: "4px", fontSize: compacto ? "16px" : "18px", fontWeight: "600", color: CORES.principal }}>
        {TITULOS[chave]}
      </div>
      <div style={{ fontSize: "11px", color: CORES.textoDim, fontFamily: "'Lora', serif" }}>{estados[chave]}</div>
    </button>
  );
  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", paddingTop: "16px", paddingLeft: "32px", paddingRight: "32px", paddingBottom: "128px" }}>
      <button onClick={onVoltar} style={{ fontSize: "11px", marginBottom: "32px", textTransform: "uppercase", fontWeight: "600", background: "none", border: "none", cursor: "pointer", color: CORES.principal, fontFamily: "'Lora', serif", letterSpacing: "1px" }}>
        ← Todos os clientes
      </button>

      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "12px" }}>
        <h1 style={{ fontFamily: "'Crimson Text', serif", fontSize: "40px", fontWeight: "800", color: CORES.principal, letterSpacing: "3px" }}>{cliente.negocio}</h1>
        <button onClick={onEditarCliente} style={{ fontSize: "11px", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", color: CORES.dourado, fontFamily: "'Lora', serif" }}>
          Editar dados
        </button>
      </div>
      <div style={{ fontSize: "13px", marginBottom: "32px", color: CORES.textoDim, fontFamily: "'Lora', serif" }}>{cliente.segmento}</div>

      <NavegacaoModulos categoriaAtiva={null} onSelecionarModulo={onModulo} />

      {(metasAceitas || []).filter((m) => m.objetivo).length > 0 && (
        <div style={{ marginBottom: "12px", padding: "16px", borderRadius: "4px", background: CORES.hover, border: "1px solid #D4AF37" }}>
          <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: "600", marginBottom: "8px", color: "#9A6A2F", fontFamily: "'Lora', serif", letterSpacing: "1px" }}>Metas pactuadas</div>
          {(metasAceitas || []).filter((m) => m.objetivo).map((m) => (
            <div key={m.id} style={{ fontSize: "13px", paddingTop: "3px", paddingBottom: "3px", color: "#4A4035", fontFamily: "'Lora', serif" }}>
              • {m.objetivo}{m.prazo ? <span style={{ fontSize: "11px", color: CORES.textoDim }}> — até {m.prazo}</span> : null}
            </div>
          ))}
        </div>
      )}

      {(servicosCliente.treinamentos || servicosCliente.mentoria) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "12px", marginBottom: "32px" }}>
          {servicosCliente.treinamentos && (
            <button onClick={() => onModulo("treinamentos")} style={{ textAlign: "left", padding: "16px", borderRadius: "4px", border: "1px solid #7BA85C", background: CORES.cartao, boxShadow: "0 2px 8px rgba(107,93,66, 0.1)", cursor: "pointer", transition: "all 0.3s ease" }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 16px rgba(107,93,66, 0.2)"; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(107,93,66, 0.1)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ fontFamily: "'Crimson Text', serif", color: CORES.principal, fontSize: "18px", fontWeight: "600" }}>Treinamentos</div>
              <div style={{ fontSize: "11px", marginTop: "3px", color: CORES.textoDim, fontFamily: "'Lora', serif" }}>
                {totalTreinamentos > 0 ? `${totalTreinamentosRealizados}/${totalTreinamentos} realizados` : "Nenhum treinamento ainda"}
              </div>
            </button>
          )}
          {servicosCliente.mentoria && (
            <button onClick={() => onModulo("mentoria")} style={{ textAlign: "left", padding: "16px", borderRadius: "4px", border: "1px solid #7BA85C", background: CORES.cartao, boxShadow: "0 2px 8px rgba(107,93,66, 0.1)", cursor: "pointer", transition: "all 0.3s ease" }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 16px rgba(107,93,66, 0.2)"; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(107,93,66, 0.1)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ fontFamily: "'Crimson Text', serif", color: CORES.principal, fontSize: "18px", fontWeight: "600" }}>Mentoria</div>
              <div style={{ fontSize: "11px", marginTop: "3px", color: CORES.textoDim, fontFamily: "'Lora', serif" }}>
                {totalEncontros > 0 ? `${totalEncontrosRealizados}/${totalEncontros} encontros realizados` : "Jornada ainda não desenhada"}
              </div>
            </button>
          )}
        </div>
      )}

      {proximoPasso && servicosCliente.consultoria && (
        <button
          onClick={() => onModulo(proximoPasso.modulo)}
          style={{ textAlign: "left", width: "100%", padding: "16px 20px", borderRadius: "4px", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", background: CORES.hover, border: "1px solid #D4AF37", cursor: "pointer", transition: "all 0.3s ease" }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(212, 175, 55, 0.2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
        >
          <span style={{ fontSize: "13px", color: "#4A4035", fontFamily: "'Lora', serif" }}>
            <span style={{ fontWeight: "600", color: CORES.dourado }}>Próximo passo · </span>
            {proximoPasso.texto}
          </span>
          <span style={{ fontSize: "11px", fontWeight: "600", color: CORES.dourado, fontFamily: "'Lora', serif" }}>abrir →</span>
        </button>
      )}

      <button
        onClick={() => onModulo("penseira")}
        style={{ textAlign: "left", width: "100%", padding: "20px", borderRadius: "4px", marginBottom: "32px", display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", background: "#4A4035", border: "1px solid #8A3A2E", cursor: "pointer", transition: "all 0.3s ease" }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 16px rgba(107,93,66, 0.3)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
      >
        <span style={{ fontFamily: "'Crimson Text', serif", fontSize: "18px", fontWeight: "600", color: CORES.dourado }}>Conselheira</span>
        <span style={{ fontSize: "11px", color: CORES.laranja, fontFamily: "'Lora', serif" }}>Despeje um pensamento e examine-o com clareza — soluções e dúvidas com base legal, sobre qualquer cômodo</span>
      </button>

      {(servicosCliente.consultoria || ehPessoa) && (
      <div style={{ marginBottom: "32px" }}>
        <div style={{ fontFamily: "'Crimson Text', serif", fontSize: "20px", fontWeight: "800", marginBottom: "6px", color: CORES.principal }}>{ehPessoa ? "Ala do Mentorado" : "Ala do Contratante"}</div>
        <div style={{ fontSize: "11px", marginBottom: "16px", color: "#A89878", fontFamily: "'Lora', serif" }}>{ehPessoa ? "A pessoa, o combinado e o entorno — mapeie também quem ela lidera" : "A pessoa e a relação — de quem contrata ao que foi combinado"}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "12px" }}>
          {alaContratante.map((chave) => (
            <Cartao key={chave} chave={chave} />
          ))}
        </div>
      </div>
      )}

      {servicosCliente.consultoria && (
      <div style={{ marginBottom: "32px" }}>
        <div style={{ fontFamily: "'Crimson Text', serif", fontSize: "20px", fontWeight: "800", marginBottom: "6px", color: CORES.principal }}>Ala do Negócio</div>
        <div style={{ fontSize: "11px", marginBottom: "16px", color: "#A89878", fontFamily: "'Lora', serif" }}>A empresa, organizada por frentes de trabalho</div>
        {alaNegocio.map((grupo) => (
          <div key={grupo.frente} style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: "600", marginBottom: "12px", color: CORES.dourado, fontFamily: "'Lora', serif", letterSpacing: "1px" }}>
              {grupo.frente}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "12px" }}>
              {grupo.chaves.map((chave) => (
                <Cartao key={chave} chave={chave} compacto />
              ))}
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
