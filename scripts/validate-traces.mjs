import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredHelpers = [
  "STORED_REFLECTIONS_UPDATED_EVENT",
  "readStoredReflections",
  "parseStoredReflections",
  "isReflectionUsable",
  "getPersonalTraceForSymbol",
  "getLatestReflectionForSymbol",
  "getJourneyReflectionForStep",
  "getRoomReflectionForSymbol",
  "getReflectionPreview",
  "getReflectionContextLabel",
  "saveStoredReflection",
];

const requiredFiles = [
  "lib/reflections.ts",
  "components/CodexPersonalTraceCard.tsx",
  "components/rooms/engine/RoomPersonalTraceCard.tsx",
  "app/mein-pfad/page.tsx",
  "docs/personal-traces.md",
];

const requiredLabels = [
  "Den Weg ansehen",
  "Dein Nachklang",
  "Auf deinem Weg",
  "Wegmarke",
];

const forbiddenVisibleSnippets = [
  "symbolSlug",
  "sourceType",
  "from=journey",
  "journey-wasser-zum-brot",
  "Debug",
];

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assert(condition, message, errors) {
  if (!condition) {
    errors.push(message);
  }
}

function extractJsxText(source) {
  return Array.from(source.matchAll(/>([^<>{}]+)</g))
    .map((match) => match[1].replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

function main() {
  const errors = [];

  for (const relativePath of requiredFiles) {
    assert(fs.existsSync(path.join(root, relativePath)), `Missing trace file: ${relativePath}`, errors);
  }

  const reflectionsSource = fs.existsSync(path.join(root, "lib/reflections.ts"))
    ? readProjectFile("lib/reflections.ts")
    : "";

  for (const helper of requiredHelpers) {
    assert(
      new RegExp(`export\\s+(?:const|function)\\s+${helper}\\b`).test(reflectionsSource),
      `Missing exported reflection helper: ${helper}`,
      errors,
    );
  }

  const traceComponentPaths = [
    "components/CodexPersonalTraceCard.tsx",
    "components/rooms/engine/RoomPersonalTraceCard.tsx",
    "app/mein-pfad/page.tsx",
  ];
  const traceSources = traceComponentPaths
    .filter((relativePath) => fs.existsSync(path.join(root, relativePath)))
    .map((relativePath) => ({
      relativePath,
      source: readProjectFile(relativePath),
    }));
  const combinedTraceSource = traceSources.map((file) => file.source).join("\n");

  for (const label of requiredLabels) {
    assert(combinedTraceSource.includes(label), `Missing trace UI label: ${label}`, errors);
  }

  for (const { relativePath, source } of traceSources) {
    const visibleText = extractJsxText(source);

    for (const snippet of forbiddenVisibleSnippets) {
      assert(
        !visibleText.includes(snippet),
        `Forbidden technical label appears as visible JSX text in ${relativePath}: ${snippet}`,
        errors,
      );
    }
  }

  if (errors.length) {
    console.error("Trace validation failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log("Trace validation passed.");
}

main();
