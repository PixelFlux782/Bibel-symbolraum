export type VisualAssetSlot = {
  current: string;
  future?: string;
};

export const visualAssetSlots = {
  startHero: {
    current: "/Visuals/start_symbolraum_hero.png",
    future: "/Visuals/start_symbolraum_hero.png",
  },
  wasserHero: { current: "/Visuals/wasser_tiefenbild.png" },
  wasserDepth: { current: "/Visuals/wasser_tiefenbild.png" },
  wasserInterface: { current: "/Visuals/wasser_interface_backround.png" },
  wasserMacro: { current: "/Visuals/wasser_makro.png" },
  wasserScene: { current: "/Visuals/wasser_szenenbild.png" },
  wasserHebrew: { current: "/Visuals/wasser_hebr_symbl.png" },
  lichtHero: {
    current: "/Visuals/licht_raum_hero.png",
    future: "/Visuals/licht_raum_hero.png",
  },
  feuerHero: {
    current: "/Visuals/feuer_glut_raum.png",
    future: "/Visuals/feuer_glut_raum.png",
  },
  wuesteHero: {
    current: "/Visuals/wueste_nacht_raum.png",
    future: "/Visuals/wueste_nacht_raum.png",
  },
  brotHero: {
    current: "/Visuals/brot_manna_gabe.png",
    future: "/Visuals/brot_manna_gabe.png",
  },
  archivHero: { current: "/Visuals/hebr_archiv_waende_background.png" },
  pfadHero: { current: "/Visuals/hebr_archiv_waende_background.png" },
  symbolnetzHero: { current: "/Visuals/symbolnetz_backround.png" },
  tiefenraum: { current: "/Visuals/tiefenraum_backround.png" },
} as const satisfies Record<string, VisualAssetSlot>;

export const visualAssets = {
  startHero: visualAssetSlots.startHero.current,
  wasserHero: visualAssetSlots.wasserHero.current,
  wasserDepth: visualAssetSlots.wasserDepth.current,
  wasserInterface: visualAssetSlots.wasserInterface.current,
  wasserMacro: visualAssetSlots.wasserMacro.current,
  wasserScene: visualAssetSlots.wasserScene.current,
  wasserHebrew: visualAssetSlots.wasserHebrew.current,
  lichtHero: visualAssetSlots.lichtHero.current,
  feuerHero: visualAssetSlots.feuerHero.current,
  wuesteHero: visualAssetSlots.wuesteHero.current,
  brotHero: visualAssetSlots.brotHero.current,
  archivHero: visualAssetSlots.archivHero.current,
  pfadHero: visualAssetSlots.pfadHero.current,
  symbolnetzHero: visualAssetSlots.symbolnetzHero.current,
  tiefenraum: visualAssetSlots.tiefenraum.current,
} as const;
