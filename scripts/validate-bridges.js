/**
 * Validation script for MeaningBridge system
 * Run with: node scripts/validate-bridges.js
 */

const path = require("path");
const createJiti = require("jiti");

const projectRoot = path.resolve(__dirname, "..");
const jiti = createJiti(__filename, {
  alias: {
    "@": projectRoot,
    "@/": `${projectRoot}/`,
  },
});

// Require the modules
const {
  getAllBridges,
  countBridges,
  getBridgesFromSource,
  getBridgesFromTarget,
} = jiti("../lib/meaning-bridges/bridgeRegistry.ts");

const {
  validateMeaningBridges,
} = jiti("../lib/meaning-bridges/validateMeaningBridges.ts");

function main() {
  console.log("\n╔════════════════════════════════════════════════╗");
  console.log("║     MEANING BRIDGE SYSTEM VALIDATION            ║");
  console.log("╚════════════════════════════════════════════════╝\n");

  // Get all bridges
  const bridges = getAllBridges();
  console.log(`📚 Total Bridges: ${countBridges()}\n`);

  // Display all bridges
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("REGISTERED BRIDGES:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  bridges.forEach((bridge, index) => {
    console.log(`${index + 1}. [${bridge.id}]`);
    console.log(`   Title: ${bridge.title}`);
    console.log(`   Source → Target: ${bridge.sourceId} → ${bridge.targetId}`);
    console.log(`   Meaning Fields: ${bridge.meaningFields.join(", ")}`);
    if (bridge.scriptureAnchors && bridge.scriptureAnchors.length > 0) {
      console.log(`   Scripture: ${bridge.scriptureAnchors.join(", ")}`);
    }
    if (bridge.tags && bridge.tags.length > 0) {
      console.log(`   Tags: ${bridge.tags.join(", ")}`);
    }
    console.log("");
  });

  // Validate
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("VALIDATION RESULTS:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const result = validateMeaningBridges();

  if (result.valid) {
    console.log("✅ VALIDATION PASSED - All bridges are valid!\n");
  } else {
    console.log("❌ VALIDATION FAILED - Errors found:\n");
    result.errors.forEach((error) => {
      console.log(`   [${error.bridgeId}] ${error.field}`);
      console.log(`   → ${error.message}\n`);
    });
  }

  if (result.warnings.length > 0) {
    console.log("⚠️  WARNINGS:\n");
    result.warnings.forEach((warning) => {
      console.log(`   [${warning.bridgeId}] ${warning.field}`);
      console.log(`   → ${warning.message}\n`);
    });
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("SUMMARY:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log(`Bridges Registered: ${bridges.length}`);
  console.log(`Errors: ${result.errors.length}`);
  console.log(`Warnings: ${result.warnings.length}`);
  console.log(`Status: ${result.valid ? "✅ VALID" : "❌ INVALID"}\n`);

  // Display registry capabilities
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("REGISTRY CAPABILITIES:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const sourceMap = new Map();
  const targetMap = new Map();

  bridges.forEach((bridge) => {
    if (!sourceMap.has(bridge.sourceId)) {
      sourceMap.set(bridge.sourceId, []);
    }
    sourceMap.get(bridge.sourceId).push(bridge.id);

    if (!targetMap.has(bridge.targetId)) {
      targetMap.set(bridge.targetId, []);
    }
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

  console.log("\n╔════════════════════════════════════════════════╗");
  console.log("║              VALIDATION COMPLETE               ║");
  console.log("╚════════════════════════════════════════════════╝\n");

  process.exit(result.valid ? 0 : 1);
}

main();
