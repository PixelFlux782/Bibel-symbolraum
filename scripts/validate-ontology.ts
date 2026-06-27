import path from "node:path";
import createJiti from "jiti";

const projectRoot = path.resolve(__dirname, "..");
const jiti = createJiti(__filename, {
  alias: {
    "@": projectRoot,
    "@/": `${projectRoot}/`,
  },
});

const { validateOntology } = jiti("../lib/ontology/validateOntology.ts") as typeof import("../lib/ontology/validateOntology");
const { validateScriptureFoundationData } = jiti("../lib/codex/scriptureFoundation.ts") as typeof import("../lib/codex/scriptureFoundation");

const result = validateOntology();
const scriptureResult = validateScriptureFoundationData();

console.log("");
console.log("SYMBOLRAUM Ontology Validation");
console.log("--------------------------------");

if (result.errors.length === 0 && scriptureResult.errors.length === 0) {
  console.log("Ontology validation passed.");
} else {
  console.error("Ontology validation failed.");
}

console.log(`${result.errors.length} errors`);
console.log(`${result.warnings.length} warnings`);
console.log(`${scriptureResult.errors.length} scripture foundation errors`);

if (result.errors.length > 0) {
  console.log("");
  console.log("Errors:");
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
}

if (result.warnings.length > 0) {
  console.log("");
  console.log("Warnings:");
  for (const warning of result.warnings) {
    console.warn(`- ${warning}`);
  }
  console.log("");
  console.log("Warnings do not fail the script. Review them before adding new ontology seeds.");
  console.log("Tip: See docs/ontology-seeding.md for seeding rules.");
}

if (scriptureResult.errors.length > 0) {
  console.log("");
  console.log("Scripture Foundation Errors:");
  for (const error of scriptureResult.errors) {
    console.error(`- ${error}`);
  }
}

process.exit(result.errors.length > 0 || scriptureResult.errors.length > 0 ? 1 : 0);
