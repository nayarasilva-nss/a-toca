import { useEffect, useState } from "react";
import { BotaoContorno } from "./ui.jsx";

// Convite para instalar o Enraizar como aplicativo. Some depois de instalado ou dispensado.
// Chrome, Edge e Android avisam que dá para instalar (beforeinstallprompt); o Safari do iPhone não avisa, então vai a instrução.
const CHAVE = "enraizar:instalar-dispensado";

const jaInstalado = () => {
  try { return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true; } catch { return false; }
};
const ehIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export function InstalarApp() {
  const [convite, setConvite] = useState(null);
  const [visivel, setVisivel] = useState(false);
  const [instrucao, setInstrucao] = useState(false);

  useEffect(() => {
    if (jaInstalado()) return;
    try { if (localStorage.getItem(CHAVE)) return; } catch {}
    const aoConvidar = (e) => { e.preventDefault(); setConvite(e); setVisivel(true); };
    const aoInstalar = () => setVisivel(false);
    window.addEventListener("beforeinstallprompt", aoConvidar);
    window.addEventListener("appinstalled", aoInstalar);
    if (ehIOS()) { setInstrucao(true); setVisivel(true); }
    return () => { window.removeEventListener("beforeinstallprompt", aoConvidar); window.removeEventListener("appinstalled", aoInstalar); };
  }, []);

  if (!visivel) return null;
  const dispensar = () => { try { localStorage.setItem(CHAVE, "1"); } catch {} setVisivel(false); };
  const instalar = async () => {
    if (!convite) return;
    convite.prompt();
    try { await convite.userChoice; } catch {}
    setConvite(null);
    setVisivel(false);
  };

  return (
    <div className="enz-card flex items-center justify-between gap-3 flex-wrap" style={{ marginTop: 16, borderLeft: "3px solid var(--ouro)" }}>
      <div className="flex items-center gap-3" style={{ minWidth: 0 }}>
        <img src="/icones/icone-192.png" alt="" width="40" height="40" style={{ borderRadius: 9, flexShrink: 0 }} />
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, lineHeight: 1.2 }}>Use o Enraizar como aplicativo</div>
          <div className="enz-nota" style={{ marginTop: 2 }}>
            {instrucao && !convite
              ? <>No iPhone: toque em <strong>Compartilhar</strong> (o quadrado com a seta) e depois em <strong>Adicionar à Tela de Início</strong>.</>
              : "Fica com ícone próprio, abre em tela cheia e direto na sua agenda."}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {convite && <BotaoContorno onClick={instalar}>Instalar</BotaoContorno>}
        <button className="enz-link" onClick={dispensar}>agora não</button>
      </div>
    </div>
  );
}
