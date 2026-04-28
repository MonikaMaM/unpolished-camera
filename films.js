// =====================================================================
// UNPOLISHED PRESENCE — FILM PRESETS
// =====================================================================

const FILMS = {
  PORTRA_400: {
    name: 'PORTRA 400',
    short: 'PORTRA 400',
    contrast: 1.08,
    saturation: 0.92,
    temperature: 8,
    tint: 3,
    shadowLift: 12,
    highlightRoll: 8,
    rShift: 4,
    gShift: 0,
    bShift: -4,
    grain: 0.06,
    vignette: 0.15,
    halation: 0.08,
    halationColor: [255, 180, 150],
    bw: false,
  },

  KODACHROME_64: {
    name: 'KODACHROME 64',
    short: 'KODACHROME',
    contrast: 1.28,
    saturation: 1.18,
    temperature: 4,
    tint: -2,
    shadowLift: -8,
    highlightRoll: 4,
    rShift: 6,
    gShift: -2,
    bShift: -6,
    grain: 0.04,
    vignette: 0.22,
    halation: 0.04,
    halationColor: [255, 200, 180],
    bw: false,
  },

  CINESTILL_800T: {
    name: 'CINESTILL 800T',
    short: 'CINESTILL 800T',
    contrast: 1.05,
    saturation: 0.85,
    temperature: -18,
    tint: 4,
    shadowLift: 18,
    highlightRoll: 6,
    rShift: -4,
    gShift: -2,
    bShift: 8,
    grain: 0.10,
    vignette: 0.18,
    halation: 0.32,
    halationColor: [255, 80, 60],
    bw: false,
  },

  EKTAR_100: {
    name: 'EKTAR 100',
    short: 'EKTAR 100',
    contrast: 1.22,
    saturation: 1.30,
    temperature: -2,
    tint: -3,
    shadowLift: -4,
    highlightRoll: 5,
    rShift: -2,
    gShift: 4,
    bShift: 2,
    grain: 0.025,
    vignette: 0.18,
    halation: 0.03,
    halationColor: [255, 220, 200],
    bw: false,
  },

  LOMO_COLOR_800: {
    name: 'LOMO COLOR 800',
    short: 'LOMO 800',
    contrast: 1.25,
    saturation: 1.35,
    temperature: 10,
    tint: 2,
    shadowLift: 6,
    highlightRoll: 4,
    rShift: 10,
    gShift: -2,
    bShift: -6,
    grain: 0.09,
    vignette: 0.32,
    halation: 0.12,
    halationColor: [255, 140, 100],
    bw: false,
  },

  // === SVARTVITA — använder CSS-filter pipeline ===

  // T-Max P3200 — mjuk, fin för hud
  TMAX_P3200: {
    name: 'T-MAX P3200',
    short: 'T-MAX 3200',
    bw: true,
    cssFilter: 'grayscale(1) contrast(1.05) brightness(1.08)',
    grain: 0.08,
    vignette: 0.15,
    halation: 0,
  },

  // Fuji Neopan 400 — neutral, ren, klassisk
  NEOPAN_400: {
    name: 'NEOPAN 400',
    short: 'NEOPAN 400',
    bw: true,
    cssFilter: 'grayscale(1) contrast(1.15) brightness(1.0)',
    grain: 0.06,
    vignette: 0.18,
    halation: 0,
  },
};

const FILM_ORDER = [
  'PORTRA_400',
  'KODACHROME_64',
  'CINESTILL_800T',
  'EKTAR_100',
  'LOMO_COLOR_800',
  'TMAX_P3200',
  'NEOPAN_400',
];
