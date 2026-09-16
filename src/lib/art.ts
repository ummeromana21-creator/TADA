/** Vector art for the scrapbook: motif icons, hand-drawn doodles, logo marks and storybook scenes. All functions return SVG markup strings. */
import { hexOr, str } from "./util";

export const MOTIFS: Record<string, string> = {
leaf:'<path d="M4 20C4 10 10 4 20 4c0 10-6 16-16 16z"/><path d="M4 20L14 10"/>',
wheat:'<path d="M12 22V6"/><path d="M12 10c-4 0-6-2-6-6 4 0 6 2 6 6zM12 14c-4 0-6-2-6-6 4 0 6 2 6 6zM12 10c4 0 6-2 6-6-4 0-6 2-6 6zM12 14c4 0 6-2 6-6-4 0-6 2-6 6z"/>',
flame:'<path d="M12 22c-4 0-7-3-7-7 0-3 2-5 3-7 1 2 2 3 3 3 0-3 1-6 3-8 3 3 5 7 5 11 0 4-3 8-7 8z"/>',
wave:'<path d="M2 12c3-4 5-4 8 0s5 4 8 0 3-2 4 0"/><path d="M2 18c3-4 5-4 8 0s5 4 8 0 3-2 4 0"/>',
star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
bolt:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
cup:'<path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 10h2a2 2 0 0 1 0 4h-2"/><path d="M8 3v2M11 3v2M14 3v2"/>',
house:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
heart:'<path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z"/>',
sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
mountain:'<path d="M3 20l6-11 4 6 3-4 5 9z"/>',
book:'<path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"/>',
paw:'<circle cx="7" cy="9" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="17" cy="9" r="2"/><path d="M12 12c-4 0-6 3-6 5.5S8 21 12 21s6-1 6-3.5S16 12 12 12z"/>',
scissors:'<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.5 8L20 19M8.5 16L20 5"/>',
car:'<path d="M3 14l2-5a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 5v4H3z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
camera:'<path d="M3 8h4l2-3h6l2 3h4v11H3z"/><circle cx="12" cy="13" r="3.5"/>',
needle:'<path d="M4 20L18 6"/><path d="M16 4l4 4-2 2-4-4z"/>',
hat:'<path d="M7 12a3 3 0 0 1 0-6 4 4 0 0 1 8-1 3.5 3.5 0 0 1 2 7v6H7z"/><path d="M7 15h10"/>',
sparkle:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
tooth:'<path d="M8 3c2 0 3 1 4 1s2-1 4-1 4 2 4 5c0 3-2 5-2 8s-1 6-2 6-2-5-4-5-3 5-4 5-2-3-2-6-2-5-2-8 2-5 4-5z"/>',
dumbbell:'<path d="M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12"/>',
music:'<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
plane:'<path d="M21 3L3 10l7 3 3 7z"/><path d="M10 13l11-10"/>',
pin:'<path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z"/><circle cx="12" cy="11" r="2.2"/>',
bag:'<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
plate:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/>',
brush:'<path d="M14 3l7 7-9 9H5v-7z"/><path d="M5 19l4-4"/>',
code:'<path d="M8 6l-6 6 6 6M16 6l6 6-6 6"/>',
globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"/>',
wrench:'<path d="M21 7a5 5 0 0 1-7 6L6 21l-3-3 8-8a5 5 0 0 1 6-7l-3 3 1 3 3 1z"/>',
flower:'<circle cx="12" cy="12" r="3"/><path d="M12 3a3 3 0 0 1 0 6 3 3 0 0 1 0-6zM12 15a3 3 0 0 1 0 6 3 3 0 0 1 0-6zM3 12a3 3 0 0 1 6 0 3 3 0 0 1-6 0zM15 12a3 3 0 0 1 6 0 3 3 0 0 1-6 0z"/>',
truck:'<path d="M2 7h11v9H2z"/><path d="M13 10h5l3 3v3h-8z"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
shirt:'<path d="M8 3l4 2 4-2 5 4-3 3-1-1v11H7V9L6 10 3 7z"/>',
laptop:'<rect x="4" y="5" width="16" height="10" rx="1"/><path d="M2 19h20"/>',
bike:'<circle cx="6" cy="17" r="3.5"/><circle cx="18" cy="17" r="3.5"/><path d="M6 17l4-8h6l2 8M10 9l4 8"/>',
handshake:'<path d="M3 11l4-4 5 2 3-2 6 5"/><path d="M8 13l3 3M11 11l3 3M14 9l3 3"/><path d="M3 11l5 6 4 3 5-3 4-6"/>',
tree:'<path d="M12 3l6 8h-3l4 6H5l4-6H6z"/><path d="M12 17v4"/>',
cake:'<path d="M4 20h16v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2z"/><path d="M4 15c2 2 4-2 6 0s4 2 6 0 2 0 4 0"/><path d="M12 12V9"/><circle cx="12" cy="7" r="1.5"/>',
mushroom:'<path d="M3 11a9 6 0 0 1 18 0c0 1-1 2-2 2H5c-1 0-2-1-2-2z"/><path d="M9 13v6a3 3 0 0 0 6 0v-6"/><circle cx="9" cy="8" r="1"/><circle cx="14" cy="6" r="1.2"/>'
};
export const MOTIF_NAMES = Object.keys(MOTIFS);

export const DECOR: Record<string, string> = {
sprig:'<svg viewBox="0 0 100 100" fill="none" aria-hidden="true"><path d="M12 92C30 66 44 44 82 12" stroke="#7FB58F" stroke-width="3" stroke-linecap="round"/><path d="M30 64c-11-2-16-9-16-18 9 0 15 7 16 18zM43 48c-11-2-16-9-16-18 9 0 15 7 16 18zM56 33c-11-2-16-9-16-18 9 0 15 7 16 18z" fill="#9BC4A7"/><path d="M34 69c2-11 9-16 18-16 0 9-7 15-18 16zM47 53c2-11 9-16 18-16 0 9-7 15-18 16zM60 38c2-11 9-16 18-16 0 9-7 15-18 16z" fill="#BFDCC6"/></svg>',
flower:'<svg viewBox="0 0 100 100" fill="none" aria-hidden="true"><g fill="#F6C6D0"><ellipse cx="50" cy="28" rx="10" ry="15"/><ellipse cx="50" cy="72" rx="10" ry="15"/><ellipse cx="28" cy="50" rx="15" ry="10"/><ellipse cx="72" cy="50" rx="15" ry="10"/><ellipse cx="34" cy="34" rx="10" ry="14" transform="rotate(-45 34 34)"/><ellipse cx="66" cy="34" rx="10" ry="14" transform="rotate(45 66 34)"/><ellipse cx="34" cy="66" rx="10" ry="14" transform="rotate(45 34 66)"/><ellipse cx="66" cy="66" rx="10" ry="14" transform="rotate(-45 66 66)"/></g><circle cx="50" cy="50" r="11" fill="#FFE45C"/><circle cx="46" cy="47" r="2" fill="#E8B62A"/><circle cx="54" cy="52" r="2" fill="#E8B62A"/></svg>',
sun:'<svg viewBox="0 0 100 100" fill="none" aria-hidden="true"><g stroke="#F2CD8A" stroke-width="4" stroke-linecap="round"><path d="M50 6v10M50 84v10M6 50h10M84 50h10M19 19l7 7M74 74l7 7M19 81l7-7M74 26l7-7"/></g><circle cx="50" cy="50" r="22" fill="#FFE45C"/><circle cx="42" cy="47" r="2.5" fill="#2A2724"/><circle cx="58" cy="47" r="2.5" fill="#2A2724"/><path d="M42 56c4 5 12 5 16 0" stroke="#2A2724" stroke-width="2.5" stroke-linecap="round"/><circle cx="36" cy="54" r="3" fill="#F6C6D0"/><circle cx="64" cy="54" r="3" fill="#F6C6D0"/></svg>',
star:'<svg viewBox="0 0 100 100" fill="none" aria-hidden="true"><path d="M50 8l12 27 29 3-22 20 7 29-26-15-26 15 7-29L9 38l29-3z" fill="#FFE45C" stroke="#E8B62A" stroke-width="3" stroke-linejoin="round"/><path d="M36 34l-8 6" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>',
heart:'<svg viewBox="0 0 100 100" fill="none" aria-hidden="true"><path d="M50 88S12 62 12 36a20 20 0 0 1 38-9 20 20 0 0 1 38 9c0 26-38 52-38 52z" fill="#F6C6D0" stroke="#E0596F" stroke-width="3"/><path d="M28 34c1-6 5-10 10-11" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>',
sparkles:'<svg viewBox="0 0 100 100" fill="#FFE45C" aria-hidden="true"><path d="M30 10l5 15 15 5-15 5-5 15-5-15-15-5 15-5z"/><path d="M72 40l4 11 11 4-11 4-4 11-4-11-11-4 11-4z"/><path d="M40 68l3 8 8 3-8 3-3 8-3-8-8-3 8-3z"/></svg>',
cloud:'<svg viewBox="0 0 100 60" fill="none" aria-hidden="true"><path d="M22 50h56a14 14 0 0 0 2-28 20 20 0 0 0-38-6 14 14 0 0 0-20 34z" fill="#fff" stroke="#D2E2FA" stroke-width="3"/><circle cx="42" cy="34" r="2" fill="#2A2724"/><circle cx="56" cy="34" r="2" fill="#2A2724"/><path d="M45 41c2 2 6 2 8 0" stroke="#2A2724" stroke-width="2" stroke-linecap="round"/></svg>',
arrow:'<svg viewBox="0 0 120 60" fill="none" stroke="#2E4BC6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 44c30-30 60-30 100-8"/><path d="M96 26l12 10-15 4"/></svg>',
scribble:'<svg viewBox="0 0 200 40" fill="none" stroke="#FFE45C" stroke-width="7" stroke-linecap="round" aria-hidden="true"><path d="M6 26c40-10 80-14 120-10s50 8 68 4"/></svg>',
mushroom:'<svg viewBox="0 0 100 100" fill="none" aria-hidden="true"><path d="M10 52a40 30 0 0 1 80 0c0 4-3 7-7 7H17c-4 0-7-3-7-7z" fill="#E0596F"/><circle cx="34" cy="38" r="5" fill="#fff"/><circle cx="58" cy="30" r="6" fill="#fff"/><circle cx="72" cy="46" r="4" fill="#fff"/><path d="M36 59v20a14 12 0 0 0 28 0V59z" fill="#FBEFC8" stroke="#E8B62A" stroke-width="2"/><circle cx="45" cy="70" r="2" fill="#2A2724"/><circle cx="55" cy="70" r="2" fill="#2A2724"/><path d="M46 77c2 2 6 2 8 0" stroke="#2A2724" stroke-width="2" stroke-linecap="round"/></svg>',
bunting:'<svg viewBox="0 0 300 60" fill="none" aria-hidden="true"><path d="M2 10c60 26 120 26 180 0s90 6 116 10" stroke="#2A2724" stroke-width="2" stroke-linecap="round"/><g><path d="M20 16l16 30 16-26z" fill="#F6C6D0"/><path d="M60 27l16 30 16-28z" fill="#FFE45C"/><path d="M100 31l16 30 16-30z" fill="#BFDCC6"/><path d="M140 30l16 30 16-30z" fill="#D2E2FA"/><path d="M180 24l16 30 16-30z" fill="#E4D9F7"/><path d="M220 18l16 30 16-26z" fill="#F6C6D0"/><path d="M260 14l16 30 16-24z" fill="#FFE45C"/></g></svg>',
};

export const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

export const ICON: Record<string, string> = {
  arrow: '<path d="M5 12h14"></path><path d="M13 6l6 6-6 6"></path>',
  check: '<path d="M5 12.5l4.2 4.2L19 7"></path>',
  ext: '<path d="M14 4h6v6"></path><path d="M20 4l-9 9"></path><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"></path>',
  x: '<path d="M6 6l12 12M18 6L6 18"></path>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.7"></path><path d="M20 4v5h-5"></path>',
  shield: '<path d="M12 3l7 3v6c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V6z"></path><path d="M9 12l2 2 4-4"></path>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"></path>',
  share: '<path d="M12 4v11"></path><path d="M8 8l4-4 4 4"></path><path d="M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5"></path>',
  globe: MOTIFS.globe, pin: MOTIFS.pin, heart: MOTIFS.heart, spark: MOTIFS.sparkle, camera: MOTIFS.camera,
};
export const ico = (n: string, s = 18, c = "currentColor", w = 2) =>
  `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n] || MOTIFS[n] || ""}</svg>`;

export const decor = (name: string, style: string) => `<div class="decor" style="${style}">${DECOR[name] || ""}</div>`;

export function burst(n = 14, r1 = 50, r2 = 41) {
  let d = "";
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI * i) / n - Math.PI / 2, r = i % 2 ? r2 : r1;
    d += (i ? "L" : "M") + (50 + r * Math.cos(a)).toFixed(1) + " " + (50 + r * Math.sin(a)).toFixed(1);
  }
  return d + "Z";
}
export const starSticker = (text: string, fill = "#FFE45C", stroke = "#E8B62A") =>
  `<div class="starburst"><svg viewBox="0 0 100 100" aria-hidden="true"><path d="${burst()}" fill="${fill}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"></path></svg><span>${esc(text)}</span></div>`;

export function motifSvg(name: string, size: number, color: string, w = 1.6) {
  const m = MOTIFS[name] || MOTIFS.sparkle;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${m}</svg>`;
}

export function logoSvg(logo: unknown, size = 72, name = "") {
  const l = (logo && typeof logo === "object" ? logo : {}) as Record<string, unknown>;
  const bg = hexOr(l.bg, "#2A2724"), fg = hexOr(l.fg, "#F7F3EC"), style = str(l.style);
  const mono = str(l.monogram).slice(0, 3) || (name || "T").slice(0, 1).toUpperCase();
  let shape = "";
  if (style === "rounded") shape = `<rect x="2" y="2" width="68" height="68" rx="16" fill="${bg}"></rect>`;
  else if (style === "badge") shape = `<path d="M36 3l30 9v22c0 16-12 29-30 35C18 63 6 50 6 34V12z" fill="${bg}"></path>`;
  else if (style === "wordmark") shape = `<rect x="2" y="2" width="68" height="68" rx="6" fill="${bg}"></rect>`;
  else shape = `<circle cx="36" cy="36" r="34" fill="${bg}"></circle>`;
  const inner = style === "wordmark"
    ? `<text x="36" y="46" text-anchor="middle" font-family="Young Serif, Georgia, serif" font-size="${mono.length > 2 ? 22 : 30}" fill="${fg}">${esc(mono)}</text>`
    : `<g transform="translate(18 18) scale(1.5)" fill="none" stroke="${fg}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${MOTIFS[str(l.motif)] || MOTIFS.sparkle}</g>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 72 72" aria-hidden="true">${shape}${inner}</svg>`;
}

const inner = (svg: string) => svg.replace(/<\/?svg[^>]*>/g, "");

/** A little storybook scene built from vectors: sky wash, sun, hills, the motif on a sticker, flowers. */
export function scene(motif: string, from: string, to: string, i = 0) {
  const m = MOTIFS[motif] || MOTIFS.sparkle, flip = i % 2;
  return `<svg class="scene" viewBox="0 0 200 200" aria-hidden="true"><defs><linearGradient id="g${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="200" height="200" fill="url(#g${i})"/><circle cx="${flip ? 150 : 50}" cy="46" r="22" fill="#FFE45C" opacity=".9"/><g stroke="#FFE45C" stroke-width="3" stroke-linecap="round" opacity=".7"><path d="M${flip ? 150 : 50} 14v8M${flip ? 150 : 50} 70v8M${flip ? 118 : 18} 46h8M${flip ? 174 : 74} 46h8"/></g><ellipse cx="${flip ? 40 : 160}" cy="42" rx="26" ry="12" fill="#fff" opacity=".8"/><ellipse cx="${flip ? 56 : 176}" cy="46" rx="18" ry="10" fill="#fff" opacity=".8"/><ellipse cx="60" cy="200" rx="130" ry="60" fill="#BFDCC6" opacity=".85"/><ellipse cx="170" cy="210" rx="120" ry="60" fill="#9BC4A7" opacity=".85"/><g transform="translate(100 112)"><circle r="42" fill="#fff" opacity=".95"/><g transform="translate(-30 -30) scale(2.5)" fill="none" stroke="#2A2724" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${m}</g></g><g transform="translate(28 158) scale(.22)">${inner(DECOR.flower)}</g><g transform="translate(150 166) scale(.18)">${inner(DECOR.flower)}</g><g transform="translate(176 150) scale(.16)">${inner(DECOR.sparkles)}</g></svg>`;
}
