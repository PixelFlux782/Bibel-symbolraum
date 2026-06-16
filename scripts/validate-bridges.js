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
} = jiti("../lib/reflections.ts");

function failIf(condition, message, details) {
  return condition ? null : { message, details };
}

function getCodexEntryByExactId(id) {
  return codexRegistry.find((entry) => entry.id === id);
}

function validateWaterReferenceBridge() {
  const errors = [];
  const warnings = [];
  const waterBridge = getSymbolPathConfig("wasser");
  const waterChipLinks = getWaterCodexChipLinks();
  const waterMeaningFields = waterBridge?.codexGates?.meaningFields ?? [];
  const waterScriptureAnchors = waterBridge?.codexGates?.scriptureAnchors ?? [];
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
    failIf(reflectionSource.includes("pathContext: roomContext ? { from: roomContext.source, path: roomContext.pathId, symbol: roomContext.symbolId } : undefined"), "Room reflections persist compatible pathContext fields."),
    failIf(meinPfadSource.includes("getSymbolPathConfigFromReflectionLike"), "Mein Pfad uses bridge fallback labels."),
    failIf(meinPfadSource.includes("bridge?.codexHref"), "Mein Pfad has Codex href fallback."),
    failIf(meinPfadSource.includes("ctaLabels.roomReturn"), "Mein Pfad has room CTA fallback."),
    failIf(dedupeCodexChips(waterMeaningFields.map((field) => ({ id: field.id, label: field.label }))).length === waterMeaningFields.length, "Water meaning fields are deduplicated.", waterMeaningFields),
    failIf(dedupeCodexChips(waterScriptureAnchors.map((anchor) => ({ id: anchor.id, label: anchor.label }))).length === waterScriptureAnchors.length, "Water scripture anchors are deduplicated.", waterScriptureAnchors),
    failIf(waterChipLinks.meaningFields.length === waterMeaningFields.length, "Every visible water meaning-field chip has an href.", waterChipLinks.meaningFields),
    failIf(waterChipLinks.scriptureAnchors.length === waterScriptureAnchors.length, "Every visible water scripture chip has an href.", waterChipLinks.scriptureAnchors),
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
