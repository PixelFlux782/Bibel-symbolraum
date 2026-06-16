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
  getSymbolCodexAnchorBridge,
  getSymbolCodexChipLinks,
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
  getOntologyEntity,
} = jiti("../lib/ontology/index.ts");

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
    const codexId = pathname.replace("/codex/", "");

    return Boolean(getCodexEntryByExactId(codexId) || getOntologyEntity(codexId));
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
    failIf(Boolean(waterBridge), "Water codex gate missing: symbol bridge config for wasser was not found."),
    failIf(waterBridge?.codexHref === "/codex/wasser", "Water codex gate missing: codexHref must point to /codex/wasser.", waterBridge?.codexHref),
    failIf(waterBridge?.roomHref === "/raeume/wasser", "Water room gate missing: roomHref must point to /raeume/wasser.", waterBridge?.roomHref),
    failIf(waterBridge?.ctaLabels.codex === "Wasser im Codex lesen", "Water codex CTA label missing or changed.", waterBridge?.ctaLabels.codex),
    failIf(waterBridge?.ctaLabels.room === "Den Wasserraum betreten", "Water room CTA label missing or changed.", waterBridge?.ctaLabels.room),
    failIf(waterBridge?.ctaLabels.roomReturn === "Wasserraum erneut betreten", "Water room return CTA label missing or changed.", waterBridge?.ctaLabels.roomReturn),
    failIf(codexRoomHref.startsWith("/raeume/wasser?"), "Water room context missing: codex room href should keep query context.", codexRoomHref),
    failIf(codexRoomHref.includes("from=codex"), "Water room context missing: codex room href must include from=codex.", codexRoomHref),
    failIf(symbolNetworkRoomHref.includes("from=symbolnetz"), "Water room context missing: symbol network room href must include from=symbolnetz.", symbolNetworkRoomHref),
    failIf(codexRoomContext?.source === "codex" && codexRoomContext.symbolId === "wasser", "Water room context missing: room cannot read codex origin context.", codexRoomContext),
    failIf(symbolNetworkRoomContext?.source === "symbolnetz" && symbolNetworkRoomContext.symbolId === "wasser", "Water room context missing: room cannot read symbol network origin context.", symbolNetworkRoomContext),
    failIf(legacyObjectReflections[0]?.codexHref === "/codex/wasser", "Legacy water reflection gets Codex href.", legacyObjectReflections[0]),
    failIf(legacyObjectReflections[0]?.roomHref === "/raeume/wasser", "Legacy water reflection gets room href.", legacyObjectReflections[0]),
    failIf(configuredReflection?.label === "Wasser", "Sparse water reflection resolves display label.", configuredReflection),
    failIf(sparseWaterReflections[0]?.symbol === "wasser", "Sparse reflection entries remain compatible.", sparseWaterReflections[0]),
    failIf(invalidStorageReflections.length === 0, "Invalid localStorage data is ignored safely.", invalidStorageReflections),
    failIf(sparseWaterLinks.some((link) => link.label === "Zum Wasser-Codex"), "Sparse water reflection gets Codex fallback.", sparseWaterLinks),
    failIf(sparseWaterLinks.some((link) => link.label === "Den Wasserraum erneut betreten"), "Sparse water reflection gets room fallback.", sparseWaterLinks),
    failIf(!sparseWaterLinks.some((link) => link.key === "trace"), "Sparse water reflection without path renders no trace link.", sparseWaterLinks),
    failIf(pathWaterLinks.some((link) => link.key === "trace" && link.href === "/codex/exodus-14"), "Water reflection return link invalid: path reflection should return to its Codex anchor.", pathWaterLinks),
    failIf(Boolean(meinPfadRoomHref?.includes("from=mein-pfad")), "Water reflection return link invalid: Mein Pfad room link should keep personal origin.", meinPfadRoomHref),
    failIf(Boolean(meinPfadRoomHref?.includes("path=exodus-14")), "Water reflection return link invalid: Mein Pfad room link should keep path context.", meinPfadRoomHref),
    failIf(Boolean(meinPfadRoomHref?.includes("symbol=wasser")), "Water reflection return link invalid: Mein Pfad room link should keep symbol context.", meinPfadRoomHref),
    failIf(legacyThinWaterLinks.some((link) => link.label === "Zum Wasser-Codex"), "Thin legacy water data gets readable water fallbacks.", legacyThinWaterLinks),
    failIf(getSymbolPathConfigFromReflectionLike(legacyThinWaterReflections[0])?.label === "Wasser", "Thin legacy water data resolves to a readable water label.", legacyThinWaterReflections[0]),
    failIf(meinPfadRoomContext?.source === "mein-pfad" && meinPfadRoomContext.text.includes("bewahrten Spur"), "Water room can read personal path origin context.", meinPfadRoomContext),
    failIf(reflectionSource.includes("pathContext: roomContext ? { from: roomContext.source, path: roomContext.pathId, symbol: roomContext.symbolId } : undefined"), "Room reflections persist compatible pathContext fields."),
    failIf(meinPfadSource.includes("getSymbolPathConfigFromReflectionLike"), "Mein Pfad uses bridge fallback labels."),
    failIf(meinPfadSource.includes("resolveReflectionReturnLinks"), "Mein Pfad uses reflection return-link resolver."),
    failIf(dedupeCodexChips(waterMeaningFields.map((field) => ({ id: field.id, label: field.label }))).length === waterMeaningFields.length, "Water meaning fields are deduplicated.", waterMeaningFields),
    failIf(dedupeCodexChips(waterScriptureAnchors.map((anchor) => ({ id: anchor.id, label: anchor.label }))).length === waterScriptureAnchors.length, "Water scripture anchors are deduplicated.", waterScriptureAnchors),
    failIf(waterChipLinks.meaningFields.length === waterMeaningFields.length, "Water meaning chip link invalid: not every visible meaning-field chip has an href.", waterChipLinks.meaningFields),
    failIf(waterChipLinks.scriptureAnchors.length === waterScriptureAnchors.length, "Water scripture chip link invalid: not every visible scripture chip has an href.", waterChipLinks.scriptureAnchors),
    failIf(waterChipLinks.meaningFields.every((chip) => Boolean(chip.href)), "Water meaning chip link invalid: a curated meaning field does not resolve to an href.", waterChipLinks.meaningFields),
    failIf(waterAnchorIds.length === new Set(waterAnchorIds).size, "Duplicate water bridge anchor found.", waterAnchorIds),
    failIf(requiredWaterAnchorIds.every((anchorId) => waterAnchorIds.includes(anchorId)), "Water anchor return bridge missing: required water anchor id is absent.", waterAnchorIds),
    failIf(waterScriptureAnchorCounts.get("genesis-1-2") === 1, "Water scripture anchor missing or duplicated: Genesis 1,2 must appear exactly once.", waterScriptureAnchors),
    failIf(waterScriptureAnchorCounts.get("exodus-14") === 1, "Water scripture anchor missing or duplicated: Exodus 14 must appear exactly once.", waterScriptureAnchors),
    failIf(Boolean(getCodexEntryByExactId("genesis-1-2")), "Water scripture anchor missing: Genesis 1,2 is not a valid Codex target."),
    failIf(Boolean(getCodexEntryByExactId("exodus-14")), "Water scripture anchor missing: Exodus 14 is not a valid Codex target."),
  ].forEach((error) => {
    if (error) errors.push(error);
  });

  waterChipLinks.scriptureAnchors.forEach((chip) => {
    const linkedEntry = getCodexEntryByExactId(chip.id) ?? resolveCodexEntry(chip.label);

    if (linkedEntry && chip.href !== `/codex/${linkedEntry.id}`) {
      errors.push({
        message: `Water scripture chip link invalid: "${chip.label}" should prefer its Codex entry route.`,
        details: chip,
      });
    }
  });

  waterReflectionLinks.forEach((link) => {
    if (!routeExists(link.href)) {
      errors.push({
        message: `Water reflection return link invalid: "${link.label}" points to a missing route.`,
        details: link,
      });
    }

    if (/^(wasser|exodus-14|genesis-1-2)$/.test(link.label)) {
      errors.push({
        message: `Water reflection return link invalid: raw technical label is visible: "${link.label}".`,
        details: link,
      });
    }
  });

  curatedWaterMeaningIds.forEach((meaningId) => {
    if ((waterMeaningFieldCounts.get(meaningId) ?? 0) > 1) {
      errors.push({
        message: `Duplicate water meaning chip found: "${meaningId}" is configured more than once.`,
        details: waterMeaningFields,
      });
    }

    const linkedEntry = getCodexEntryByExactId(meaningId);
    const chip = waterChipLinks.meaningFields.find((candidate) => candidate.id === meaningId);

    if (linkedEntry && chip?.href !== `/codex/${linkedEntry.id}`) {
      errors.push({
        message: `Water meaning chip link invalid: "${meaningId}" should prefer its Codex entry route.`,
        details: chip,
      });
    }
  });

  waterAnchorIds.forEach((anchorId) => {
    const linkedEntry = getCodexEntryByExactId(anchorId);
    const anchorBridge = getWaterCodexAnchorBridge(anchorId);

    if (!linkedEntry) {
      errors.push({
        message: `Water anchor return bridge missing: "${anchorId}" is not a valid Codex target.`,
        details: waterAnchorIds,
      });
    }

    if (!anchorBridge) {
      errors.push({
        message: `Water anchor return bridge missing: "${anchorId}" has no return bridge.`,
        details: waterAnchorIds,
      });
      return;
    }

    if (anchorBridge.returnHref !== "/codex/wasser" || !routeExists(anchorBridge.returnHref)) {
      errors.push({
        message: `Water anchor return bridge missing: "${anchorId}" has no valid return link to the water Codex.`,
        details: anchorBridge,
      });
    }

    if (!anchorBridge.roomHref || !routeExists(anchorBridge.roomHref)) {
      errors.push({
        message: `Water room context missing: anchor "${anchorId}" has no valid water room link.`,
        details: anchorBridge,
      });
    }

    if (anchorBridge.personalPathHref && !routeExists(anchorBridge.personalPathHref)) {
      errors.push({
        message: `Water anchor return bridge missing: "${anchorId}" points to a missing personal path route.`,
        details: anchorBridge,
      });
    }
  });

  [...waterChipLinks.meaningFields, ...waterChipLinks.scriptureAnchors].forEach((chip) => {
    if (!chip.href) {
      errors.push({ message: `Water meaning chip link invalid: "${chip.label}" has no href.`, details: chip });
      return;
    }

    if (chip.href.startsWith("/codex/")) {
      const routeId = chip.href.replace("/codex/", "").split("?")[0];

      if (!getCodexEntryByExactId(routeId)) {
        errors.push({ message: `Water meaning chip link invalid: "${chip.label}" points to a known missing Codex route.`, details: chip });
      }
    } else if (chip.href.startsWith("/codex?")) {
      const params = new URLSearchParams(chip.href.slice("/codex?".length));
      const hasMeaningFallback = params.has("meaning") && params.get("meaning")?.trim();
      const hasScriptureFallback = params.has("scripture") && params.get("scripture")?.trim();

      if (!hasMeaningFallback && !hasScriptureFallback) {
        errors.push({ message: `Water meaning chip link invalid: "${chip.label}" uses an invalid Codex fallback query.`, details: chip });
      }
    } else {
      errors.push({ message: `Water meaning chip link invalid: "${chip.label}" does not point into the Codex.`, details: chip });
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

function validateLightPreparedBridge() {
  const errors = [];
  const warnings = [];
  const lightBridge = getSymbolPathConfig("licht");
  const lightChipLinks = getSymbolCodexChipLinks("licht");
  const lightMeaningFields = lightBridge?.codexGates?.meaningFields ?? [];
  const lightScriptureAnchors = lightBridge?.codexGates?.scriptureAnchors ?? [];
  const lightAnchorIds = lightBridge?.codexAnchorBridge?.anchorIds ?? [];
  const requiredLightAnchorIds = ["licht", "offenbarung", "ordnung", "erkenntnis", "glanz", "auge", "himmel", "genesis-1-3"];
  const expectedMovement = "Finsternis -> Ruf -> Licht -> Scheidung -> Ordnung -> Erkenntnis";

  [
    failIf(Boolean(lightBridge), "Light bridge prepared: symbol bridge config for licht was not found."),
    failIf(lightBridge?.codexHref === "/codex/licht", "Light bridge prepared: codexHref must point to /codex/licht.", lightBridge?.codexHref),
    failIf(lightBridge?.roomHref === "/raeume/licht", "Light bridge prepared: roomHref must point to /raeume/licht.", lightBridge?.roomHref),
    failIf(lightBridge?.symbolNetworkHref === "/symbolnetz?symbol=licht", "Light bridge prepared: symbolNetworkHref must point to the light symbol network.", lightBridge?.symbolNetworkHref),
    failIf(lightBridge?.pathLabel === "Lichtpfad", "Light bridge prepared: pathLabel must remain readable.", lightBridge?.pathLabel),
    failIf(lightBridge?.reflectionSource.label === "Spur aus dem Lichtraum", "Light bridge prepared: reflection source label missing.", lightBridge?.reflectionSource),
    failIf(Boolean(lightBridge?.codexAnchorBridge), "Light anchor return bridge prepared: codexAnchorBridge is missing.", lightBridge?.codexAnchorBridge),
    failIf(lightAnchorIds.length === new Set(lightAnchorIds).size, "Light anchor return bridge prepared: duplicate anchor found.", lightAnchorIds),
    failIf(requiredLightAnchorIds.every((anchorId) => lightAnchorIds.includes(anchorId)), "Light anchor return bridge prepared: central light anchor id is absent.", lightAnchorIds),
    failIf(lightScriptureAnchors.some((anchor) => anchor.id === "genesis-1-3"), "Light scripture gate missing: Genesis 1,3 must be present.", lightScriptureAnchors),
  ].forEach((error) => {
    if (error) errors.push(error);
  });

  if (lightBridge && lightBridge.movement.join(" -> ") !== expectedMovement) {
    warnings.push({
      message: "Light bridge prepared: movement differs from the Phase 30A sequence.",
      details: lightBridge.movement,
    });
  }

  if (!lightBridge?.codexAnchorBridge?.personalPathLabel) {
    warnings.push({
      message: "Full light reflection return loop missing: warning only.",
      details: "Phase 30B prepares Licht anchor returns without Mein-Pfad return enforcement.",
    });
  }

  if (dedupeCodexChips(lightMeaningFields.map((field) => ({ id: field.id, label: field.label }))).length !== lightMeaningFields.length) {
    errors.push({
      message: "Light bridge prepared: duplicate meaning chip found.",
      details: lightMeaningFields,
    });
  }

  [...lightChipLinks.meaningFields, ...lightChipLinks.scriptureAnchors].forEach((chip) => {
    if (!chip.href) {
      errors.push({ message: `Light bridge prepared: "${chip.label}" has no href.`, details: chip });
      return;
    }

    if (chip.href.startsWith("/codex/")) {
      if (!routeExists(chip.href)) {
        errors.push({ message: `Light bridge prepared: "${chip.label}" points to a missing Codex route.`, details: chip });
      }
    } else if (chip.href.startsWith("/codex?")) {
      const params = new URLSearchParams(chip.href.slice("/codex?".length));
      const hasMeaningFallback = params.has("meaning") && params.get("meaning")?.trim();
      const hasScriptureFallback = params.has("scripture") && params.get("scripture")?.trim();

      if (!hasMeaningFallback && !hasScriptureFallback) {
        errors.push({ message: `Light bridge prepared: "${chip.label}" uses an invalid Codex fallback query.`, details: chip });
      }
    } else {
      errors.push({ message: `Light bridge prepared: "${chip.label}" does not point into the Codex.`, details: chip });
    }

    if (/^(licht|genesis-1-3|offenbarung|ordnung|erkenntnis|glanz|auge|himmel)$/.test(chip.label)) {
      errors.push({
        message: `Light bridge prepared: raw technical label is visible: "${chip.label}".`,
        details: chip,
      });
    }
  });

  lightAnchorIds.forEach((anchorId) => {
    const hasTarget = Boolean(getCodexEntryByExactId(anchorId) || getOntologyEntity(anchorId));
    const anchorBridge = getSymbolCodexAnchorBridge("licht", anchorId);

    if (!hasTarget) {
      warnings.push({
        message: `Light anchor targets exist or fallback safely: "${anchorId}" uses no known Codex or ontology target.`,
        details: lightAnchorIds,
      });
    }

    if (!anchorBridge) {
      warnings.push({
        message: `Light anchor return bridge prepared: "${anchorId}" has no return bridge.`,
        details: lightAnchorIds,
      });
      return;
    }

    if (anchorId !== "licht" && (anchorBridge.returnHref !== "/codex/licht" || !routeExists(anchorBridge.returnHref))) {
      warnings.push({
        message: `Light anchor return bridge prepared: "${anchorId}" has no valid return link to the light Codex.`,
        details: anchorBridge,
      });
    }

    if (anchorId !== "licht" && (!anchorBridge.roomHref || !routeExists(anchorBridge.roomHref))) {
      warnings.push({
        message: `Light anchor return bridge prepared: "${anchorId}" has no valid light room link.`,
        details: anchorBridge,
      });
    }

    if (anchorId !== "licht" && !anchorBridge.roomHref.includes(`path=${encodeURIComponent(anchorId)}`)) {
      warnings.push({
        message: `Light anchor return bridge prepared: "${anchorId}" room link does not keep path context.`,
        details: anchorBridge,
      });
    }
  });

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
  console.log("\nMEANING BRIDGE AND WATER REFERENCE PATH VALIDATION\n");

  const bridges = getAllBridges();
  console.log(`Total Bridges: ${countBridges()}\n`);

  console.log("REGISTERED MEANING BRIDGES:\n");
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
  const lightResult = validateLightPreparedBridge();

  console.log("VALIDATION CHECKPOINTS:\n");
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

  if (lightResult.valid) {
    console.log("Light bridge prepared: OK");
  } else {
    console.log("Light bridge prepared: FAILED");
    printErrors(lightResult.errors);
  }

  if (lightResult.warnings.length > 0) {
    console.log("\nLight prepared warnings:");
    printErrors(lightResult.warnings);
  }

  console.log("\nSUMMARY:\n");
  console.log(`Bridges Registered: ${bridges.length}`);
  console.log(`Meaning Errors: ${result.errors.length}`);
  console.log(`Meaning Warnings: ${result.warnings.length}`);
  console.log(`Water Reference Errors: ${waterResult.errors.length}`);
  console.log(`Water Reference Warnings: ${waterResult.warnings.length}`);
  console.log(`Light Prepared Errors: ${lightResult.errors.length}`);
  console.log(`Light Prepared Warnings: ${lightResult.warnings.length}`);
  console.log(`Status: ${result.valid && waterResult.valid && lightResult.valid ? "VALID" : "INVALID"}\n`);

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

  process.exit(result.valid && waterResult.valid && lightResult.valid ? 0 : 1);
}

main();
