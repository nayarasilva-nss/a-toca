// ─── Motor próprio de PDF (sem dependências externas) ───────────

export const PROPS_PDF = ["display","box-sizing","width","min-width","max-width","margin-top","margin-right","margin-bottom","margin-left","padding-top","padding-right","padding-bottom","padding-left","border-top-width","border-right-width","border-bottom-width","border-left-width","border-top-style","border-right-style","border-bottom-style","border-left-style","border-top-color","border-right-color","border-bottom-color","border-left-color","border-radius","background-color","background-image","color","font-family","font-size","font-weight","font-style","line-height","letter-spacing","text-align","text-decoration-line","text-transform","white-space","vertical-align","border-collapse","border-spacing","list-style-type","list-style-position","flex-direction","flex-wrap","justify-content","align-items","gap","flex-grow","flex-shrink","flex-basis","transform","opacity","overflow"];

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

export async function gerarPdfDoNo(nodeOculto) {
  const LARG = 794; // A4 a 96dpi
  const ALT_PAG = 1123;
  const ESCALA = 2;

  // 1. Clona e monta fora da tela, renderizado, para capturar estilos reais
  const clone = nodeOculto.cloneNode(true);
  clone.classList.remove("hidden");
  clone.style.display = "block";
  const quadro = document.createElement("div");
  quadro.style.cssText = `position:fixed;left:-13000px;top:0;width:${LARG}px;background:#ffffff;`;
  quadro.appendChild(clone);
  document.body.appendChild(quadro);
  await new Promise((r) => setTimeout(r, 60));

  try {
    // 2. Congela os estilos computados em cada elemento (vira autossuficiente)
    clone.style.width = LARG + "px";
    clone.style.boxSizing = "border-box";
    inlinarEstilos(clone);
    const altura = Math.max(clone.scrollHeight, 200);

    // 3. Serializa num SVG foreignObject e rasteriza
    const xml = new XMLSerializer().serializeToString(clone);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${LARG}" height="${altura}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">${xml}</div></foreignObject></svg>`;
    const img = new Image();
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
    await img.decode();

    const cheio = document.createElement("canvas");
    cheio.width = LARG * ESCALA;
    cheio.height = altura * ESCALA;
    const ctx = cheio.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cheio.width, cheio.height);
    ctx.drawImage(img, 0, 0, cheio.width, cheio.height);

    // 4. Fatia em páginas A4 e monta os JPEGs
    const numPaginas = Math.max(1, Math.ceil(altura / ALT_PAG));
    const paginas = [];
    for (let i = 0; i < numPaginas; i++) {
      const pag = document.createElement("canvas");
      pag.width = LARG * ESCALA;
      pag.height = ALT_PAG * ESCALA;
      const pctx = pag.getContext("2d");
      pctx.fillStyle = "#ffffff";
      pctx.fillRect(0, 0, pag.width, pag.height);
      const origemY = i * ALT_PAG * ESCALA;
      const alturaFatia = Math.min(ALT_PAG * ESCALA, cheio.height - origemY);
      if (alturaFatia > 0) pctx.drawImage(cheio, 0, origemY, pag.width, alturaFatia, 0, 0, pag.width, alturaFatia);
      const b64 = pag.toDataURL("image/jpeg", 0.93).split(",")[1];
      paginas.push({ dados: atob(b64), w: pag.width, h: pag.height });
    }

    // 5. Escreve o PDF byte a byte
    return construirPdf(paginas);
  } finally {
    quadro.remove();
  }
}
