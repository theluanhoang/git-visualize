export type HslTriplet = { h: number; s: number; l: number };

export function parseCssHslTriplet(raw: string): HslTriplet | null {
  const parts = raw.trim().split(/\s+/);
  if (parts.length < 3) return null;
  const h = parseFloat(parts[0]);
  const s = parseFloat(parts[1].replace('%', ''));
  const l = parseFloat(parts[2].replace('%', ''));
  if (Number.isNaN(h) || Number.isNaN(s) || Number.isNaN(l)) return null;
  return { h, s, l };
}

export function hslToRgb(h: number, sPct: number, lPct: number) {
  const s = sPct / 100;
  const l = lPct / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r1 = 0, g1 = 0, b1 = 0;
  if (hp >= 0 && hp < 1) { r1 = c; g1 = x; b1 = 0; }
  else if (hp >= 1 && hp < 2) { r1 = x; g1 = c; b1 = 0; }
  else if (hp >= 2 && hp < 3) { r1 = 0; g1 = c; b1 = x; }
  else if (hp >= 3 && hp < 4) { r1 = 0; g1 = x; b1 = c; }
  else if (hp >= 4 && hp < 5) { r1 = x; g1 = 0; b1 = c; }
  else if (hp >= 5 && hp <= 6) { r1 = c; g1 = 0; b1 = x; }
  const m = l - c / 2;
  const r = Math.round((r1 + m) * 255);
  const g = Math.round((g1 + m) * 255);
  const b = Math.round((b1 + m) * 255);
  return { r, g, b };
}

export function hslTripletToRgbString(t: HslTriplet) {
  const { r, g, b } = hslToRgb(t.h, t.s, t.l);
  return `rgb(${r}, ${g}, ${b})`;
}

export function hslTripletToRgbaString(t: HslTriplet, a: number) {
  const { r, g, b } = hslToRgb(t.h, t.s, t.l);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}


