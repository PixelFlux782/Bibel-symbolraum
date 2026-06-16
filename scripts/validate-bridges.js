/**
 * Validation script for MeaningBridge system and the water reference path.
 * Run with: node scripts/validate-bridges.js
 */

/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const path = require("path");
const createJiti = require("jiti");

const projectRoot = path.resolve(__dirname, "..");
const jiti = createJiti(__filename, {
  alias: {
    "@": projectRoot,
    "@/": `${projectRoot}/`,
  },
});

const {
  getAllBridges,
  countBridges,
} = jiti("../lib/meaning-bridges/bridgeRegistry.ts");

const {
  validateMeaningBridges,
} = jiti("../lib/meaning-bridges/validateMeaningBridges.ts");

const {
  getSymbolPathConfig,
  getSymbolPathConfigFromReflectionLike,
} = jiti("../lib/symbols/symbolPathConfig.ts");

const {
  dedupeCodexChips,
  getWaterCodexAnchorBridge,
  getWaterCodexChipLinks,
} = jiti("../lib/codex/linking.ts");

const {
  resolveCodexEntry,
} = jiti("../lib/codex/resolveCodexEntry.ts");

const {
  codexRegistry,
} = jiti("../lib/codex/codexRegistry.ts");

const {
  buildRoomHref,
  resolveRoomContext,
} = jiti("../lib/rooms/roomContext.ts");

const {
  parseStoredReflections,
  resolveReflectionReturnLinks,
} = jiti("../lib/reflections.ts");

function failIf(condition, message, details) {
  return condition ? null : { message, details };
}

function getCodexEntryByExactId(id) {
  return codexRegistry.find((entry) => entry.id === id);
}

function countChipsByNormalizedKey(chips) {
  return chips.reduce((counts, chip) => {
    const key = chip.id || chip.label;
    counts.set(key, (counts.get(key) ?? 0) + 1);
    return counts;
  }, new Map());
}

function routeExists(href) {
  const pathname = href.split("?")[0];

  if (pathname === "/codex") return true;
  if (pathname === "/symbolnetz") return fs.existsSync(path.join(projectRoot, "app", "symbolnetz", "page.tsx"));
  if (pathname.startsWith("/codex/")) {
    return Boolean(getCodexEntryByExactId(pathname.replace("/codex/", "")));
  }
  if (pathname.startsWith("/raeume/")) {
    return fs.existsSync(path.join(projectRoot, "app", "raeume", pathname.replace("/raeume/", ""), "page.tsx"));
  }
  if (pathname === "/mein-pfad") {
    return fs.existsSync(path.join(projectRoot, "app", "mein-pfad", "page.tsx"));
  }

  return false;
}

function validateWaterReferenceBridge() {
  const errors = [];
  const warnings = [];
  const waterBridge = getSymbolPathConfig("wasser");
  const waterChipLinks = getWaterCodexChipLinks();
  const waterMeaningFields = waterBridge?.codexGates?.meaningFields ?? [];
  const waterScriptureAnchors = waterBridge?.codexGates?.scriptureAnchors ?? [];
  const waterAnchorIds = waterBridge?.codexAnchorBridge?.anchorIds ?? [];
  const curatedWaterMeaningIds = ["tiefe", "reinigung", "uebergang", "geburt", "verborgenheit"];
  const requiredWaterAnchorIds = ["wasser", ...curatedWaterMeaningIds, "genesis-1-2", "exodus-14"];
  const waterMeaningFieldCounts = countChipsByNormalizedKey(waterMeaningFields);
  const waterScriptureAnchorCounts = waterScriptureAnchors.reduce((counts, anchor) => {
    counts.set(anchor.id, (counts.get(anchor.id) ?? 0) + 1);
    return counts;
  }, new Map());
  const configuredReflection = getSymbolPathConfigFromReflectionLike({
    symbol: "wasser",
    roomHref: "/raeume/wasser",
  });
  const codexRoomHref = buildRoomHref("wasser", { from: "codex", symbol: "wasser" });
  const symbolNetworkRoomHref = buildRoomHref("wasser", {
    from: "symbolnetz",
    symbol: "wasser",
    path: "journey-wasser-wueste-brot",
  });
  const codexRoomContext = resolveRoomContext({ from: "codex", symbol: "wasser" }, "wasser");
  const symbolNetworkRoomContext = resolveRoomContext({ from: "symbolnetz", symbol: "wasser", lens: "story" }, "wasser");
  const legacyObjectReflections = parseStoredReflections(JSON.stringify({ wasser: "Eine alte Wasserspur." }));
  const sparseWaterReflections = parseStoredReflections(JSON.stringify([{
    id: "old-water",
    symbol: "wasser",
    answer: "Eine knappe alte Spur.",
    createdAt: "2024-05-12T00:00:00.000Z",
  }]));
  const pathWaterReflections = parseStoredReflections(JSON.stringify([{
    id: "water-exodus",
    symbol: "Wasser",
    symbolSlug: "wasser",
    answer: "Eine Spur an der Schwelle.",
    pathLabel: "Exodus 14",
    pathContext: { from: "codex", path: "exodus-14", symbol: "wasser" },
    createdAt: "2024-05-13T00:00:00.000Z",
  }]));
  const legacyThinWaterReflections = parseStoredReflections(JSON.stringify([{
    room: "wasser",
    text: "Eine sehr alte Wasserspur.",
    source: "mein-pfad",
    createdAt: "kein-datum",
  }]));
  const invalidStorageReflections = parseStoredReflections("{not valid json");
  const sparseWaterLinks = resolveReflectionReturnLinks(sparseWaterReflections[0]);
  const pathWaterLinks = resolveReflectionReturnLinks(pathWaterReflections[0]);
  const legacyThinWaterLinks = resolveReflectionReturnLinks(legacyThinWaterReflections[0]);
  const legacyObjectWaterLinks = resolveReflectionReturnLinks(legacyObjectReflections[0]);
  const meinPfadRoomHref = pathWaterLinks.find((link) => link.key === "room")?.href;
  const meinPfadRoomContext = resolveRoomContext({ from: "mein-pfad", path: "exodus-14", symbol: "wasser" }, "wasser");
  const waterReflectionLinks = [
    ...sparseWaterLinks,
    ...pathWaterLinks,
    ...legacyThinWaterLinks,
    ...legacyObjectWaterLinks,
  ];
  const meinPfadSource = fs.readFileSync(path.join(projectRoot, "app", "mein-pfad", "page.tsx"), "utf8");
  const reflectionSource = fs.readFileSync(path.join(projectRoot, "components", "rooms", "engine", "ReflectionOverlay.tsx"), "utf8");

  [
    failIf(Boolean(waterBridge), "Wasser has a symbol bridge config."),
    failIf(waterBridge?.codexHref === "/codex/wasser", "Wasser has Codex link.", waterBridge?.codexHref),
    failIf(waterBridge?.roomHref === "/raeume/wasser", "Wasser has room link.", waterBridge?.roomHref),
    failIf(waterBridge?.ctaLabels.codex === "Wasser im Codex lesen", "Wasser has Codex CTA label.", waterBridge?.ctaLabels.codex),
    failIf(waterBridge?.ctaLabels.room === "Den Wasserraum betreten", "Wasser has room CTA label.", waterBridge?.ctaLabels.room),
    failIf(waterBridge?.ctaLabels.roomReturn === "Wasserraum erneut betreten", "Wasser has room return CTA label.", waterBridge?.ctaLabels.roomReturn),
    failIf(codexRoomHref.startsWith("/raeume/wasser?"), "Wasser room href keeps codex context.", codexRoomHref),
    failIf(codexRoomHref.includes("from=codex"), "Wasser room href includes from=codex.", codexRoomHref),
    failIf(symbolNetworkRoomHref.includes("from=symbolnetz"), "Wasser room href includes from=symbolnetz.", symbolNetworkRoomHref),
    failIf(codexRoomContext?.source === "codex" && codexRoomContext.symbolId === "wasser", "Wasser room can read codex origin context.", codexRoomContext),
    failIf(symbolNetworkRoomContext?.source === "symbolnetz" && symbolNetworkRoomContext.symbolId === "wasser", "Wasser room can read symbol network origin context.", symbolNetworkRoomContext),
    failIf(legacyObjectReflections[0]?.codexHref === "/codex/wasser", "Legacy water reflection gets Codex href.", legacyObjectReflections[0]),
    failIf(legacyObjectReflections[0]?.roomHref === "/raeume/wasser", "Legacy water reflection gets room href.", legacyObjectReflections[0]),
    failIf(configuredReflection?.label === "Wasser", "Sparse water reflection resolves display label.", configuredReflection),
    failIf(sparseWaterReflections[0]?.symbol === "wasser", "Sparse reflection entries remain compatible.", sparseWaterReflections[0]),
    failIf(invalidStorageReflections.length === 0, "Invalid localStorage data is ignored safely.", invalidStorageReflections),
    failIf(sparseWaterLinks.some((link) => link.label === "Zum Wasser-Codex"), "Sparse water reflection gets Codex fallback.", sparseWaterLinks),
    failIf(sparseWaterLinks.some((link) => link.label === "Den Wasserraum erneut betreten"), "Sparse water reflection gets room fallback.", sparseWaterLinks),
    failIf(!sparseWaterLinks.some((link) => link.key === "trace"), "Sparse water reflection without path renders no trace link.", sparseWaterLinks),
    failIf(pathWaterLinks.some((link) => link.key === "trace" && link.href === "/codex/exodus-14"), "Water reflection with path returns to the Codex anchor.", pathWaterLinks),
    failIf(Boolean(meinPfadRoomHref?.includes("from=mein-pfad")), "Mein Pfad water room link keeps personal origin.", meinPfadRoomHref),
    failIf(Boolean(meinPfadRoomHref?.includes("path=exodus-14")), "Mein Pfad water room link keeps path context.", meinPfadRoomHref),
    failIf(Boolean(meinPfadRoomHref?.includes("symbol=wasser")), "Mein Pfad water room link keeps symbol context.", meinPfadRoomHref),
    failIf(legacyThinWaterLinks.some((link) => link.label === "Zum Wasser-Codex"), "Thin legacy water data gets readable water fallbacks.", legacyThinWaterLinks),
    failIf(getSymbolPathConfigFromReflectionLike(legacyThinWaterReflections[0])?.label === "Wasser", "Thin legacy water data resolves to a readable water label.", legacyThinWaterReflections[0]),
    failIf(meinPfadRoomContext?.source === "mein-pfad" && meinPfadRoomContext.text.includes("bewahrten Spur"), "Water room can read personal path origin context.", meinPfadRoomContext),
    failIf(reflectionSource.includes("pathContext: roomContext ? { from: roomContext.source, path: roomContext.pathId, symbol: roomContext.symbolId } : undefined"), "Room reflections persist compatible pathContext fields."),
    failIf(meinPfadSource.includes("getSymbolPathConfigFromReflectionLike"), "Mein Pfad uses bridge fallback labels."),
    failIf(meinPfadSource.includes("resolveReflectionReturnLinks"), "Mein Pfad uses reflection return-link resolver."),
    failIf(dedupeCodexChips(waterMeaningFields.map((field) => ({ id: field.id, label: field.label }))).length === waterMeaningFields.length, "Water meaning fields are deduplicated.", waterMeaningFields),
    failIf(dedupeCodexChips(waterScriptureAnchors.map((anchor) => ({ id: anchor.id, label: anchor.label }))).length === waterScriptureAnchors.length, "Water scripture anchors are deduplicated.", waterScriptureAnchors),
    failIf(waterChipLinks.meaningFields.length === waterMeaningFields.length, "Every visible water meaning-field chip has an href.", waterChipLinks.meaningFields),
    failIf(waterChipLinks.scriptureAnchors.length === waterScriptureAnchors.length, "Every visible water scripture chip has an href.", waterChipLinks.scriptureAnchors),
    failIf(waterChipLinks.meaningFields.every((chip) => Boolean(chip.href)), "All curated water meaning fields resolve to an href.", waterChipLinks.meaningFields),
    failIf(waterAnchorIds.length === new Set(waterAnchorIds).size, "Water bridge anchor ids are unique.", waterAnchorIds),
    failIf(requiredWaterAnchorIds.every((anchorId) => waterAnchorIds.includes(anchorId)), "Water bridge includes all required anchor ids.", waterAnchorIds),
    failIf(waterScriptureAnchorCounts.get("genesis-1-2") === 1, "Water scripture gates include Genesis 1,2 exactly once.", waterScriptureAnchors),
    failIf(waterScriptureAnchorCounts.get("exodus-14") === 1, "Water scripture gates include Exodus 14 exactly once.", waterScriptureAnchors),
    failIf(Boolean(getCodexEntryByExactId("genesis-1-2")), "Genesis 1,2 is a valid Codex target."),
    failIf(Boolean(getCodexEntryByExactId("exodus-14")), "Exodus 14 is a valid Codex target when curated for water."),
  ].forEach((error) => {
    if (error) errors.push(error);
  });

  waterChipLinks.scriptureAnchors.forEach((chip) => {
    const linkedEntry = getCodexEntryByExactId(chip.id) ?? resolveCodexEntry(chip.label);

    if (linkedEntry && chip.href !== `/codex/${linkedEntry.id}`) {
      errors.push({
        message: `Water scripture chip "${chip.label}" should prefer its Codex entry route.`,
        details: chip,
      });
    }
  });

  waterReflectionLinks.forEach((link) => {
    if (!routeExists(link.href)) {
      errors.push({
        message: `Water reflection return link "${link.label}" points to a missing route.`,
        details: link,
      });
    }

    if (/^(wasser|exodus-14|genesis-1-2)$/.test(link.label)) {
      errors.push({
        message: `Water reflection return link exposes a raw technical label: "${link.label}".`,
        details: link,
      });
    }
  });

  curatedWaterMeaningIds.forEach((meaningId) => {
    if ((waterMeaningFieldCounts.get(meaningId) ?? 0) > 1) {
      errors.push({
        message: `Water meaning field "${meaningId}" is configured more than once.`,
        details: waterMeaningFields,
      });
    }

    const linkedEntry = getCodexEntryByExactId(meaningId);
    const chip = waterChipLinks.meaningFields.find((candidate) => candidate.id === meaningId);

    if (linkedEntry && chip?.href !== `/codex/${linkedEntry.id}`) {
      errors.push({
        message: `Water meaning chip "${meaningId}" should prefer its Codex entry route.`,
        details: chip,
      });
    }
  });

  waterAnchorIds.forEach((anchorId) => {
    const linkedEntry = getCodexEntryByExactId(anchorId);
    const anchorBridge = getWaterCodexAnchorBridge(anchorId);

    if (!linkedEntry) {
      errors.push({
        message: `Water anchor "${anchorId}" is not a valid Codex target.`,
        details: waterAnchorIds,
      });
    }

    if (!anchorBridge) {
      errors.push({
        message: `Water anchor "${anchorId}" has no return bridge.`,
        details: waterAnchorIds,
      });
      return;
    }

    if (anchorBridge.returnHref !== "/codex/wasser" || !routeExists(anchorBridge.returnHref)) {
      errors.push({
        message: `Water anchor "${anchorId}" has no valid return link to the water Codex.`,
        details: anchorBridge,
      });
    }

    if (!anchorBridge.roomHref || !routeExists(anchorBridge.roomHref)) {
      errors.push({
        message: `Water anchor "${anchorId}" has no valid water room link.`,
        details: anchorBridge,
      });
    }

    if (anchorBridge.personalPathHref && !routeExists(anchorBridge.personalPathHref)) {
      errors.push({
        message: `Water anchor "${anchorId}" points to a missing personal path route.`,
        details: anchorBridge,
      });
    }
  });

  [...waterChipLinks.meaningFields, ...waterChipLinks.scriptureAnchors].forEach((chip) => {
    if (!chip.href) {
      errors.push({ message: `Water chip "${chip.label}" has no href.`, details: chip });
      return;
    }

    if (chip.href.startsWith("/codex/")) {
      const routeId = chip.href.replace("/codex/", "").split("?")[0];

      if (!getCodexEntryByExactId(routeId)) {
        errors.push({ message: `Water chip "${chip.label}" points to a known missing Codex route.`, details: chip });
      }
    } else if (chip.href.startsWith("/codex?")) {
      const params = new URLSearchParams(chip.href.slice("/codex?".length));
      const hasMeaningFallback = params.has("meaning") && params.get("meaning")?.trim();
      const hasScriptureFallback = params.has("scripture") && params.get("scripture")?.trim();

      if (!hasMeaningFallback && !hasScriptureFallback) {
        errors.push({ message: `Water chip "${chip.label}" uses an invalid Codex fallback query.`, details: chip });
      }
    } else {
      errors.push({ message: `Water chip "${chip.label}" does not point into the Codex.`, details: chip });
    }
  });

  if (waterBridge && waterBridge.movement.join(" -> ") !== "Symbolnetz -> Codex -> Raum -> persoenliche Spur -> Mein Pfad") {
    warnings.push({
      message: "Wasser movement differs from the expected reference sequence.",
      details: waterBridge.movement,
    });
  }

  return { valid: errors.length === 0, errors, warnings };
}

function printErrors(errors) {
  errors.forEach((error) => {
    console.log(`  - ${error.message}`);
    if (error.details) {
      console.log(`    Details: ${JSON.stringify(error.details)}`);
    }
  });
}

function main() {
  console.log("\nMEANING BRIDGE SYSTEM VALIDATION\n");

  const bridges = getAllBridges();
  console.log(`Total Bridges: ${countBridges()}\n`);

  console.log("REGISTERED BRIDGES:\n");
  bridges.forEach((bridge, index) => {
    console.log(`${index + 1}. [${bridge.id}]`);
    console.log(`   Title: ${bridge.title}`);
    console.log(`   Source -> Target: ${bridge.sourceId} -> ${bridge.targetId}`);
    console.log(`   Meaning Fields: ${bridge.meaningFields.join(", ")}`);
    if (bridge.scriptureAnchors && bridge.scriptureAnchors.length > 0) {
      console.log(`   Scripture: ${bridge.scriptureAnchors.join(", ")}`);
    }
    if (bridge.tags && bridge.tags.length > 0) {
      console.log(`   Tags: ${bridge.tags.join(", ")}`);
    }
    console.log("");
  });

  const result = validateMeaningBridges();
  const waterResult = validateWaterReferenceBridge();

  console.log("VALIDATION RESULTS:\n");
  if (result.valid) {
    console.log("Meaning bridges: OK");
  } else {
    console.log("Meaning bridges: FAILED");
    printErrors(result.errors);
  }

  if (result.warnings.length > 0) {
    console.log("\nMeaning bridge warnings:");
    printErrors(result.warnings);
  }

  if (waterResult.valid) {
    console.log("Water reference bridge: OK");
  } else {
    console.log("Water reference bridge: FAILED");
    printErrors(waterResult.errors);
  }

  if (waterResult.warnings.length > 0) {
    console.log("\nWater reference warnings:");
    printErrors(waterResult.warnings);
  }

  console.log("\nSUMMARY:\n");
  console.log(`Bridges Registered: ${bridges.length}`);
  console.log(`Meaning Errors: ${result.errors.length}`);
  console.log(`Meaning Warnings: ${result.warnings.length}`);
  console.log(`Water Reference Errors: ${waterResult.errors.length}`);
  console.log(`Water Reference Warnings: ${waterResult.warnings.length}`);
  console.log(`Status: ${result.valid && waterResult.valid ? "VALID" : "INVALID"}\n`);

  const sourceMap = new Map();
  const targetMap = new Map();

  bridges.forEach((bridge) => {
    if (!sourceMap.has(bridge.sourceId)) sourceMap.set(bridge.sourceId, []);
    if (!targetMap.has(bridge.targetId)) targetMap.set(bridge.targetId, []);
    sourceMap.get(bridge.sourceId).push(bridge.id);
    targetMap.get(bridge.targetId).push(bridge.id);
  });

  console.log("Bridges by Source:");
  sourceMap.forEach((bridgeIds, sourceId) => {
    console.log(`  ${sourceId}: ${bridgeIds.join(", ")}`);
  });

  console.log("\nBridges by Target:");
  targetMap.forEach((bridgeIds, targetId) => {
    console.log(`  ${targetId}: ${bridgeIds.join(", ")}`);
  });

  console.log("\nVALIDATION COMPLETE\n");

  process.exit(result.valid && waterResult.valid ? 0 : 1);
}

main();
