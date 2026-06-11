import { validateOntology } from "../lib/ontology/validateOntology";

const result = validateOntology();

console.log("");
console.log("SYMBOLRAUM Ontology Validation");
console.log("--------------------------------");

if (result.errors.length === 0) {
  console.log("Ontology validation passed.");
} else {
  console.error("Ontology validation failed.");
}

console.log(`${result.errors.length} errors`);
console.log(`${result.warnings.length} warnings`);

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

process.exit(result.errors.length > 0 ? 1 : 0);
