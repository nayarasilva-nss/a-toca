// ─── Motor próprio de PDF (sem dependências externas) ───────────
// Renderiza a área de impressão no tema Papel sobre branco e compõe cada página A4
// com o cabeçalho e o rodapé da marca (Enraizar · Nayara Silva), cliente, data e numeração.

export const PROPS_PDF = ["display","box-sizing","width","min-width","max-width","margin-top","margin-right","margin-bottom","margin-left","padding-top","padding-right","padding-bottom","padding-left","border-top-width","border-right-width","border-bottom-width","border-left-width","border-top-style","border-right-style","border-bottom-style","border-left-style","border-top-color","border-right-color","border-bottom-color","border-left-color","border-radius","background-color","color","font-family","font-size","font-weight","font-style","line-height","letter-spacing","text-transform","text-align","text-decoration","vertical-align","white-space","list-style-type","flex-direction","flex-wrap","justify-content","align-items","gap","grid-template-columns","opacity","overflow"];

const PAPEL = {
  tinta: "#1e3226",
  areia: "#6b5d42",
  salvia: "#4f6b3a",
  musgo: "#56645a",
  ouro: "#b8902f",
  linha: "#dcd6c6",
};

export function inlinarEstilos(el) {
  if (el.namespaceURI && el.namespaceURI.includes("svg")) return; // SVGs já carregam seus atributos
  const cs = window.getComputedStyle(el);
  let s = "";
  for (const p of PROPS_PDF) {
    const v = cs.getPropertyValue(p);
    if (v && v !== "normal" && v !== "none" && v !== "auto") s += `${p}:${v};`;
    else if (v && (p === "display" || p.startsWith("border") || p.startsWith("margin") || p.startsWith("padding"))) s += `${p}:${v};`;
  }
  el.setAttribute("style", s);
  el.removeAttribute("class");
  for (const filho of Array.from(el.children)) inlinarEstilos(filho);
}

export function construirPdf(paginas) {
  const W = 595.28;
  const H = 841.89;
  const partes = [];
  let pos = 0;
  const offsets = [];
  const escrever = (s) => {
    partes.push(s);
    pos += s.length;
  };
  escrever("%PDF-1.4\n");
  const total = paginas.length;
  const numObjs = 2 + total * 3;
  const objPag = (i) => 3 + i * 3;
  const objCont = (i) => 4 + i * 3;
  const objImg = (i) => 5 + i * 3;
  const addObj = (num, corpo) => {
    offsets[num] = pos;
    escrever(`${num} 0 obj\n${corpo}\nendobj\n`);
  };
  addObj(1, "<< /Type /Catalog /Pages 2 0 R >>");
  addObj(2, `<< /Type /Pages /Count ${total} /Kids [${paginas.map((_, i) => `${objPag(i)} 0 R`).join(" ")}] >>`);
  paginas.forEach((p, i) => {
    addObj(objPag(i), `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Contents ${objCont(i)} 0 R /Resources << /XObject << /Im${i} ${objImg(i)} 0 R >> >> >>`);
    const cs = `q ${W} 0 0 ${H} 0 0 cm /Im${i} Do Q`;
    addObj(objCont(i), `<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`);
    offsets[objImg(i)] = pos;
    escrever(`${objImg(i)} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${p.w} /Height ${p.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.dados.length} >>\nstream\n`);
    escrever(p.dados);
    escrever("\nendstream\nendobj\n");
  });
  const inicioXref = pos;
  escrever(`xref\n0 ${numObjs + 1}\n0000000000 65535 f \n`);
  for (let n = 1; n <= numObjs; n++) escrever(`${String(offsets[n]).padStart(10, "0")} 00000 n \n`);
  escrever(`trailer\n<< /Size ${numObjs + 1} /Root 1 0 R >>\nstartxref\n${inicioXref}\n%%EOF`);
  const bin = partes.join("");
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i) & 0xff;
  return bytes;
}

// a árvore da marca, em traços dourados, desenhada direto no canvas (não depende de imagem externa)
function desenharMarca(ctx, x, y, tamanho) {
  const e = tamanho / 140;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(e, e);
  ctx.strokeStyle = PAPEL.ouro;
  ctx.lineCap = "round";
  const linha = (x1, y1, x2, y2, w) => {
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };
  linha(70, 70, 40, 120, 2.2);
  linha(70, 70, 60, 125, 2.2);
  linha(70, 70, 80, 125, 2.2);
  linha(70, 70, 100, 120, 2.2);
  linha(70, 70, 70, 30, 3.2);
  linha(70, 35, 50, 15, 2.2);
  linha(70, 35, 90, 15, 2.2);
  linha(70, 45, 45, 25, 1.8);
  linha(70, 45, 95, 25, 1.8);
  linha(70, 50, 40, 40, 1.8);
  linha(70, 50, 100, 40, 1.8);
  ctx.fillStyle = PAPEL.ouro;
  ctx.beginPath();
  ctx.arc(70, 70, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function cabecalhoERodape(ctx, { escala, larg, alt, margem, cliente, data, pagina, total, topo, rodapeY }) {
  ctx.save();
  ctx.scale(escala, escala);
  // cabeçalho
  desenharMarca(ctx, margem - 6, 26, 56);
  ctx.fillStyle = PAPEL.tinta;
  ctx.font = "500 24px 'Cormorant Garamond', Georgia, serif";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("Enraizar", margem + 54, 52);
  ctx.fillStyle = PAPEL.ouro;
  ctx.font = "700 9px Lato, 'Helvetica Neue', Arial, sans-serif";
  ctx.fillText("MÉTODO ENRAIZAR  ·  NAYARA SILVA".split("").join(" "), margem + 55, 68);
  if (cliente) {
    ctx.textAlign = "right";
    ctx.fillStyle = PAPEL.tinta;
    ctx.font = "500 16px 'Cormorant Garamond', Georgia, serif";
    ctx.fillText(cliente, larg - margem, 50);
    ctx.fillStyle = PAPEL.musgo;
    ctx.font = "400 10px Lato, 'Helvetica Neue', Arial, sans-serif";
    ctx.fillText(data, larg - margem, 67);
    ctx.textAlign = "left";
  }
  ctx.strokeStyle = PAPEL.linha;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(margem, topo - 18);
  ctx.lineTo(larg - margem, topo - 18);
  ctx.stroke();
  // rodapé
  ctx.beginPath();
  ctx.moveTo(margem, rodapeY);
  ctx.lineTo(larg - margem, rodapeY);
  ctx.stroke();
  ctx.fillStyle = PAPEL.musgo;
  ctx.font = "400 10px Lato, 'Helvetica Neue', Arial, sans-serif";
  ctx.fillText("Enraizar · desenvolvimento organizacional · Nayara Silva", margem, rodapeY + 20);
  ctx.fillStyle = PAPEL.salvia;
  ctx.font = "italic 400 10px Lato, 'Helvetica Neue', Arial, sans-serif";
  ctx.fillText("Todo crescimento começa em quem enraíza.", margem, rodapeY + 35);
  ctx.textAlign = "right";
  ctx.fillStyle = PAPEL.musgo;
  ctx.font = "400 10px Lato, 'Helvetica Neue', Arial, sans-serif";
  ctx.fillText(`${pagina} de ${total}`, larg - margem, rodapeY + 20);
  ctx.textAlign = "left";
  ctx.restore();
}

export async function gerarPdfDoNo(nodeOculto, opcoes = {}) {
  const LARG = 794; // A4 a 96dpi
  const ALT_PAG = 1123;
  const ESCALA = 2;
  const MARGEM = 56;
  const TOPO = 110;
  const RODAPE_Y = ALT_PAG - 62;
  const ALT_CONTEUDO = RODAPE_Y - 16 - TOPO;
  const LARG_CONTEUDO = LARG - MARGEM * 2;
  const cliente = opcoes.cliente || "";
  const data = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  if (document.fonts && document.fonts.ready) await document.fonts.ready;

  // 1. Clona e monta fora da tela, no tema Papel sobre branco, para capturar os estilos certos
  const clone = nodeOculto.cloneNode(true);
  clone.classList.remove("hidden");
  clone.style.display = "block";
  const quadro = document.createElement("div");
  quadro.setAttribute("data-theme", "papel");
  quadro.className = "enz-pdf";
  quadro.style.cssText = `position:fixed;left:-13000px;top:0;width:${LARG_CONTEUDO}px;background:#ffffff;color:${PAPEL.tinta};`;
  quadro.appendChild(clone);
  document.body.appendChild(quadro);
  await new Promise((r) => setTimeout(r, 80));

  try {
    // 2. Congela os estilos computados (vira autossuficiente); sem padding — as margens são da página
    clone.style.width = LARG_CONTEUDO + "px";
    clone.style.boxSizing = "border-box";
    clone.style.padding = "0";
    inlinarEstilos(clone);
    clone.style.padding = "0";
    clone.style.background = "#ffffff";
    const altura = Math.max(clone.scrollHeight, 120);

    // 3. Serializa num SVG foreignObject e rasteriza
    const xml = new XMLSerializer().serializeToString(clone);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${LARG_CONTEUDO}" height="${altura}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="background:#ffffff;color:${PAPEL.tinta};font-family:Lato,'Helvetica Neue',Arial,sans-serif;">${xml}</div></foreignObject></svg>`;
    const img = new Image();
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
    await img.decode();

    const cheio = document.createElement("canvas");
    cheio.width = LARG_CONTEUDO * ESCALA;
    cheio.height = altura * ESCALA;
    const ctx = cheio.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cheio.width, cheio.height);
    ctx.drawImage(img, 0, 0, cheio.width, cheio.height);

    // 4. Fatia o conteúdo e compõe cada página com cabeçalho e rodapé
    const numPaginas = Math.max(1, Math.ceil(altura / ALT_CONTEUDO));
    const paginas = [];
    for (let i = 0; i < numPaginas; i++) {
      const pag = document.createElement("canvas");
      pag.width = LARG * ESCALA;
      pag.height = ALT_PAG * ESCALA;
      const pctx = pag.getContext("2d");
      pctx.fillStyle = "#ffffff";
      pctx.fillRect(0, 0, pag.width, pag.height);
      const origemY = i * ALT_CONTEUDO * ESCALA;
      const alturaFatia = Math.min(ALT_CONTEUDO * ESCALA, cheio.height - origemY);
      if (alturaFatia > 0) pctx.drawImage(cheio, 0, origemY, cheio.width, alturaFatia, MARGEM * ESCALA, TOPO * ESCALA, cheio.width, alturaFatia);
      cabecalhoERodape(pctx, { escala: ESCALA, larg: LARG, alt: ALT_PAG, margem: MARGEM, cliente, data, pagina: i + 1, total: numPaginas, topo: TOPO, rodapeY: RODAPE_Y });
      const b64 = pag.toDataURL("image/jpeg", 0.93).split(",")[1];
      paginas.push({ dados: atob(b64), w: pag.width, h: pag.height });
    }

    // 5. Escreve o PDF byte a byte
    return construirPdf(paginas);
  } finally {
    quadro.remove();
  }
}
