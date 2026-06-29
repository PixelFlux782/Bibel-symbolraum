import path from "node:path";
import { fileURLToPath } from "node:url";
import createJiti from "jiti";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const jiti = createJiti(__filename, {
  alias: {
    "@": projectRoot,
    "@/": `${projectRoot}/`,
  },
});

const { hebrewLetters } = jiti("../lib/hebrew/hebrewLetters.ts");
const { hebrewWords } = jiti("../lib/hebrew/hebrewWords.ts");
const {
  genesisLetterIds,
  genesisLetterProfiles,
  genesisRoomLetterCarriers,
  genesisVerseLetterLayers,
  genesisWordMovements,
} = jiti("../lib/hebrew/genesisLetterLayer.ts");
const { resolveCodexEntry } = jiti("../lib/codex/resolveCodexEntry.ts");

const requiredWordIds = [
  "bereschit",
  "bara",
  "elohim",
  "et",
  "schamajim",
  "erez",
  "tohu",
  "bohu",
  "choschech",
  "tehom",
  "ruach",
  "rachaf",
  "majim",
  "amar",
  "jehi",
  "or",
];
const requiredRoomCarriers = {
  wasser: ["mem", "jod", "tav", "he", "vav", "resh", "chet", "ayin", "pe", "nun", "kaf"],
  licht: ["aleph", "mem", "resh", "jod", "he", "vav"],
};

function assert(condition, message, errors) {
  if (!condition) errors.push(message);
}

function unique(items) {
  return Array.from(new Set(items));
}

function main() {
  const errors = [];
  const letterIds = new Set(hebrewLetters.map((letter) => letter.id));
  const wordIds = new Set(hebrewWords.map((word) => word.id));
  const movementIds = new Set(Object.keys(genesisWordMovements));

  genesisLetterIds.forEach((letterId) => {
    assert(letterIds.has(letterId), `Missing HebrewLetter "${letterId}".`, errors);
    assert(Boolean(resolveCodexEntry(letterId)), `Missing Codex resolution for letter "${letterId}".`, errors);
    const profile = genesisLetterProfiles[letterId];
    assert(Boolean(profile), `Missing Genesis deep profile for letter "${letterId}".`, errors);
    assert(Boolean(profile?.deeperMeaning?.trim()), `Letter "${letterId}" lacks deeper meaning.`, errors);
    assert(Boolean(profile?.genesisRole?.trim()), `Letter "${letterId}" lacks Genesis role.`, errors);
    assert(Boolean(profile?.contemplative?.trim()), `Letter "${letterId}" lacks contemplative line.`, errors);

    const words = Object.values(genesisWordMovements).filter((movement) => (
      movement.letters.some((step) => step.letterId === letterId)
    ));
    assert(words.length > 0, `Letter "${letterId}" is not reachable from any Genesis word movement.`, errors);

    const letter = hebrewLetters.find((candidate) => candidate.id === letterId);
    const relatedWordIds = new Set(letter?.relatedWordIds ?? []);
    words.forEach((movement) => {
      assert(
        relatedWordIds.has(movement.wordId),
        `Letter "${letterId}" lacks relatedWordIds back-link to "${movement.wordId}".`,
        errors,
      );
    });
  });

  requiredWordIds.forEach((wordId) => {
    assert(wordIds.has(wordId), `Missing HebrewWord "${wordId}".`, errors);
    assert(Boolean(resolveCodexEntry(wordId)), `Missing Codex resolution for word "${wordId}".`, errors);
    assert(movementIds.has(wordId), `Genesis word "${wordId}" lacks letter movement.`, errors);

    const word = hebrewWords.find((candidate) => candidate.id === wordId);
    const movement = genesisWordMovements[wordId];
    if (word && movement) {
      assert(word.letterIds.length === movement.letters.length, `Word "${wordId}" letterIds and movement lengths differ.`, errors);
      movement.letters.forEach((step, index) => {
        assert(letterIds.has(step.letterId), `Word "${wordId}" movement references missing letter "${step.letterId}".`, errors);
        assert(step.letterId === word.letterIds[index], `Word "${wordId}" movement letter ${index + 1} does not match word.letterIds.`, errors);
        assert(Boolean(step.role?.trim()), `Word "${wordId}" movement step ${index + 1} lacks inline role.`, errors);
      });
    }
  });

  Object.values(genesisVerseLetterLayers).forEach((layer) => {
    assert(Boolean(resolveCodexEntry(layer.verseId)), `Missing Codex resolution for verse "${layer.verseId}".`, errors);
    layer.wordIds.forEach((wordId) => {
      assert(wordIds.has(wordId), `Verse "${layer.verseId}" references missing word "${wordId}".`, errors);
      assert(movementIds.has(wordId), `Verse "${layer.verseId}" word "${wordId}" lacks movement.`, errors);
    });
    layer.focusLetterIds.forEach((letterId) => {
      assert(letterIds.has(letterId), `Verse "${layer.verseId}" references missing letter "${letterId}".`, errors);
      assert(Boolean(resolveCodexEntry(letterId)), `Verse "${layer.verseId}" letter "${letterId}" lacks Codex resolution.`, errors);
    });
  });

  Object.entries(requiredRoomCarriers).forEach(([roomId, expected]) => {
    const actual = genesisRoomLetterCarriers[roomId] ?? [];
    expected.forEach((letterId) => {
      assert(actual.includes(letterId), `Room "${roomId}" lacks carrying letter "${letterId}".`, errors);
    });
    unique(actual).forEach((letterId) => {
      assert(letterIds.has(letterId), `Room "${roomId}" references missing letter "${letterId}".`, errors);
      assert(Boolean(resolveCodexEntry(letterId)), `Room "${roomId}" letter "${letterId}" lacks Codex resolution.`, errors);
    });
  });

  if (errors.length) {
    console.error("Genesis letter validation failed:");
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log("Genesis letter validation passed.");
}

main();
