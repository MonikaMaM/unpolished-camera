// =====================================================================
// UNPOLISHED PRESENCE — FILM PRESETS
// Varje film har sin egna ton, korn, kurva, halation, vinjett
// =====================================================================

const FILMS = {
  PORTRA_400: {
    name: 'PORTRA 400',
    short: 'PORTRA 400',
    // Färgmatris: subtila varma hudtoner, mjuk kontrast, lyft skuggor
    contrast: 1.08,
    saturation: 0.92,
    temperature: 8,        // varmare
    tint: 3,               // lite magenta
    shadowLift: 12,        // mjuka skuggor
    highlightRoll: 8,      // mjuka highlights
    // RGB-skift (toning)
    rShift: 4,
    gShift: 0,
    bShift: -4,
    // Korn
    grain: 0.06,
    grainSize: 1,
    // Vinjett
    vignette: 0.15,
    // Halation (röd glow runt highlights)
    halation: 0.08,
    halationColor: [255, 180, 150],
    // Färgton
    bw: false,
  },

  KODACHROME_64: {
    name: 'KODACHROME 64',
    short: 'KODACHROME',
    contrast: 1.28,
    saturation: 1.18,
    temperature: 4,
    tint: -2,              // lite cyan
    shadowLift: -8,        // djupa skuggor
    highlightRoll: 4,
    rShift: 6,
    gShift: -2,
    bShift: -6,
    grain: 0.04,
    grainSize: 1,
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
    temperature: -18,      // tungsten / blått
    tint: 4,
    shadowLift: 18,        // mjuka skuggor
    highlightRoll: 6,
    rShift: -4,
    gShift: -2,
    bShift: 8,
    grain: 0.10,
    grainSize: 1.2,
    vignette: 0.18,
    halation: 0.32,        // KARAKTÄRISTISK röd halation
    halationColor: [255, 80, 60],
    bw: false,
  },

  TRI_X_400: {
    name: 'TRI-X 400',
    short: 'TRI-X 400',
    contrast: 1.32,
    saturation: 0,
    temperature: 0,
    tint: 0,
    shadowLift: -6,
    highlightRoll: 6,
    rShift: 0,
    gShift: 0,
    bShift: 0,
    grain: 0.14,           // tydligt korn
    grainSize: 1.1,
    vignette: 0.20,
    halation: 0,
    halationColor: [255, 255, 255],
    bw: true,
    bwMix: { r: 0.30, g: 0.55, b: 0.15 }, // klassisk pankromatisk mix
  },

  FP_3000B: {
    name: 'FP-3000B',
    short: 'FP-3000B',
    contrast: 1.12,
    saturation: 0,
    temperature: 0,
    tint: 0,
    shadowLift: 14,        // mjukare skuggor
    highlightRoll: 10,     // mjukare highlights
    rShift: 0,
    gShift: 0,
    bShift: 0,
    grain: 0.05,           // slätare än Tri-X
    grainSize: 0.8,
    vignette: 0.12,
    halation: 0.06,
    halationColor: [255, 255, 255],
    bw: true,
    bwMix: { r: 0.35, g: 0.50, b: 0.15 },
  },

  EKTAR_100: {
    name: 'EKTAR 100',
    short: 'EKTAR 100',
    contrast: 1.22,
    saturation: 1.30,      // hög mättnad
    temperature: -2,
    tint: -3,              // grön/cyan
    shadowLift: -4,
    highlightRoll: 5,
    rShift: -2,
    gShift: 4,
    bShift: 2,
    grain: 0.025,          // finkornig
    grainSize: 0.7,
    vignette: 0.18,
    halation: 0.03,
    halationColor: [255, 220, 200],
    bw: false,
  },
};

// Ordning i film-strip
const FILM_ORDER = [
  'PORTRA_400',
  'KODACHROME_64',
  'CINESTILL_800T',
  'TRI_X_400',
  'FP_3000B',
  'EKTAR_100',
];
