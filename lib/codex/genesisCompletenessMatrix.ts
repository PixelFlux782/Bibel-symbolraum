import { hebrewLetters } from "@/lib/hebrew/hebrewLetters";
import { hebrewWords } from "@/lib/hebrew/hebrewWords";
import { getGenesisVerseLetterLayer } from "@/lib/hebrew/genesisLetterLayer";
import { biblicalMeaningLinks, hebrewMeaningLinks, symbolMeaningLinks } from "@/lib/meaning/meaningMappings";
import { meaningNodes } from "@/lib/meaning/meaningNodes";
import { getOntologyEntity, getOntologyRelationsForEntity } from "@/lib/ontology";
import { getAllResonanceConnections } from "@/lib/resonance";

import { codexRegistry } from "./codexRegistry";
import { getScriptureFoundation, type ScriptureFoundationEntry } from "./scriptureFoundation";

export const genesisCompletenessVerseIds = ["genesis-1-1", "genesis-1-2", "genesis-1-3"] as const;

export type GenesisCompletenessVerseId = (typeof genesisCompletenessVerseIds)[number];

export type GenesisCompletenessRelationType =
  | "belongs_to_scripture"
  | "appears_in_word"
  | "composed_of_letters"
  | "opens_room"
  | "points_to_symbol"
  | "carries_meaning"
  | "prepares"
  | "mirrors"
  | "deepens"
  | "leads_to";

export type GenesisCompletenessRelation = {
  sourceId: string;
  targetId: string;
  type: GenesisCompletenessRelationType;
  reversible: boolean;
};

export type GenesisCompletenessMatrixRow = {
  verseId: GenesisCompletenessVerseId;
  title: string;
  essence: string;
  hebrewWordIds: string[];
  letterIds: string[];
  symbolIds: string[];
  meaningIds: string[];
  roomIds: string[];
  codexPageIds: string[];
  archiveEntityIds: string[];
  symbolNetworkNodeIds: string[];
  relations: GenesisCompletenessRelation[];
  reflectionQuestions: string[];
  nextThreshold: string;
  openTodos: string[];
};

const expectedCoreWordIds: Record<GenesisCompletenessVerseId, string[]> = {
  "genesis-1-1": ["bereschit", "bara", "elohim", "schamajim", "erez"],
  "genesis-1-2": ["erez", "tohu", "bohu", "choschech", "tehom", "ruach", "majim"],
  "genesis-1-3": ["amar", "or", "wajehi", "tov"],
};

const expectedLetterIds = [
  "bet",
  "resh",
  "aleph",
  "shin",
  "jod",
  "tav",
  "mem",
  "he",
  "vav",
  "lamed",
  "chet",
  "qof",
  "dalet",
] as const;

const verseReflectionQuestions: Record<GenesisCompletenessVerseId, string[]> = {
  "genesis-1-1": [
    "Was wird gesetzt, bevor es erklaert wird?",
    "Welche Spannung tragen Himmel und Erde im Anfang?",
  ],
  "genesis-1-2": [
    "Wo ist die Tiefe ungeordnet, aber nicht leer?",
    "Welche Bewegung der Ruach liegt schon ueber dem Wasser?",
  ],
  "genesis-1-3": [
    "Was wird durch das Wort sichtbar?",
    "Welche erste Ordnung bereitet das Licht vor?",
  ],
};

const verseThresholds: Record<GenesisCompletenessVerseId, string> = {
  "genesis-1-1": "Weiter in die Tiefe von Genesis 1,2.",
  "genesis-1-2": "Weiter vom Wasser und Ruach zum gesprochenen Licht.",
  "genesis-1-3": "Weiter in den Licht-Raum und zur Gutheit von Genesis 1,4.",
};

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values));
}

function codexEntryExists(id: string) {
  return codexRegistry.some((entry) => entry.id === id);
}

function archiveEntityId(type: "letter" | "word" | "scripture" | "symbol" | "meaning", id: string) {
  return `${type}:${id}`;
}

function idsFromFoundation(entry: ScriptureFoundationEntry) {
  const words = [...entry.coreWords, ...entry.passiveWords];
  const wordIds = uniqueStrings(words.flatMap((word) => word.codexId ? [word.codexId] : []));
  const letterIds = uniqueStrings([
    ...entry.linkedLetters.map((letter) => letter.label),
    ...words.flatMap((word) => word.letters?.map((letter) => letter.label) ?? []),
  ]);
  const symbolIds = uniqueStrings([
    ...entry.openedSymbols,
    ...words.flatMap((word) => word.symbolIds ?? []),
  ]);
  const roomIds = uniqueStrings([
    ...entry.openedRooms,
    ...words.flatMap((word) => word.roomIds ?? []),
  ]);
  const meaningIds = uniqueStrings([
    ...entry.openedMeanings,
    ...words.flatMap((word) => word.meaningIds ?? []),
  ]);

  return { words, wordIds, letterIds, symbolIds, roomIds, meaningIds };
}

function buildRelations(
  verseId: GenesisCompletenessVerseId,
  ids: ReturnType<typeof idsFromFoundation>,
): GenesisCompletenessRelation[] {
  const wordRelations = ids.wordIds.flatMap((wordId): GenesisCompletenessRelation[] => [
    { sourceId: wordId, targetId: verseId, type: "belongs_to_scripture", reversible: false },
    ...((hebrewWords.find((word) => word.id === wordId)?.letterIds ?? []).map((letterId) => ({
      sourceId: letterId,
      targetId: wordId,
      type: "appears_in_word" as const,
      reversible: true,
    }))),
    ...((hebrewWords.find((word) => word.id === wordId)?.letterIds ?? []).map((letterId) => ({
      sourceId: wordId,
      targetId: letterId,
      type: "composed_of_letters" as const,
      reversible: true,
    }))),
    ...(hebrewMeaningLinks
      .find((link) => link.hebrewWordId === wordId)
      ?.nodeIds.map((meaningId) => ({
        sourceId: wordId,
        targetId: meaningId,
        type: "carries_meaning" as const,
        reversible: false,
      })) ?? []),
  ]);

  const symbolRelations = ids.symbolIds.flatMap((symbolId): GenesisCompletenessRelation[] => [
    { sourceId: verseId, targetId: symbolId, type: "points_to_symbol", reversible: false },
    ...(symbolMeaningLinks
      .find((link) => link.symbolId === symbolId)
      ?.nodeIds.map((meaningId) => ({
        sourceId: symbolId,
        targetId: meaningId,
        type: "carries_meaning" as const,
        reversible: false,
      })) ?? []),
  ]);

  const roomRelations = ids.roomIds.map((roomId): GenesisCompletenessRelation => ({
    sourceId: verseId,
    targetId: roomId,
    type: "opens_room",
    reversible: false,
  }));

  const scriptureMeaningRelations = (biblicalMeaningLinks.find((link) => link.biblicalReferenceId === verseId)?.nodeIds ?? [])
    .map((meaningId): GenesisCompletenessRelation => ({
      sourceId: verseId,
      targetId: meaningId,
      type: "carries_meaning",
      reversible: false,
    }));

  const movementRelations: GenesisCompletenessRelation[] = [
    ...(verseId === "genesis-1-1"
      ? [{ sourceId: "genesis-1-1", targetId: "genesis-1-2", type: "prepares" as const, reversible: true }]
      : []),
    ...(verseId === "genesis-1-2"
      ? [
          { sourceId: "tehom", targetId: "ruach", type: "deepens" as const, reversible: true },
          { sourceId: "ruach", targetId: "genesis-1-3", type: "prepares" as const, reversible: true },
          { sourceId: "wasser", targetId: "licht", type: "leads_to" as const, reversible: true },
        ]
      : []),
    ...(verseId === "genesis-1-3"
      ? [
          { sourceId: "amar", targetId: "or", type: "leads_to" as const, reversible: true },
          { sourceId: "or", targetId: "tov", type: "prepares" as const, reversible: false },
          { sourceId: "genesis-1-3", targetId: "genesis-1-1", type: "mirrors" as const, reversible: true },
        ]
      : []),
  ];

  return uniqueStrings([
    ...wordRelations,
    ...symbolRelations,
    ...roomRelations,
    ...scriptureMeaningRelations,
    ...movementRelations,
  ].map((relation) => `${relation.sourceId}|${relation.type}|${relation.targetId}|${relation.reversible ? "1" : "0"}`))
    .map((key) => {
      const [sourceId, type, targetId, reversible] = key.split("|");

      return {
        sourceId,
        targetId,
        type: type as GenesisCompletenessRelationType,
        reversible: reversible === "1",
      };
    });
}

function buildRow(verseId: GenesisCompletenessVerseId): GenesisCompletenessMatrixRow {
  const foundation = getScriptureFoundation(verseId);

  if (!foundation) {
    return {
      verseId,
      title: verseId,
      essence: "",
      hebrewWordIds: [],
      letterIds: [],
      symbolIds: [],
      meaningIds: [],
      roomIds: [],
      codexPageIds: [],
      archiveEntityIds: [],
      symbolNetworkNodeIds: [],
      relations: [],
      reflectionQuestions: verseReflectionQuestions[verseId],
      nextThreshold: verseThresholds[verseId],
      openTodos: [`ScriptureFoundation fuer ${verseId} anlegen.`],
    };
  }

  const ids = idsFromFoundation(foundation);
  const verseLayer = getGenesisVerseLetterLayer(verseId);
  const codexPageIds = uniqueStrings([
    verseId,
    ...ids.wordIds,
    ...ids.letterIds,
    ...ids.symbolIds,
    ...ids.roomIds,
    ...ids.meaningIds,
    ...foundation.openedJourneys,
    ...foundation.openedPatterns,
  ]).filter(codexEntryExists);
  const archiveEntityIds = uniqueStrings([
    archiveEntityId("scripture", verseId),
    ...ids.wordIds.map((id) => archiveEntityId("word", id)),
    ...ids.letterIds.map((id) => archiveEntityId("letter", id)),
    ...ids.symbolIds.map((id) => archiveEntityId("symbol", id)),
    ...ids.roomIds.map((id) => archiveEntityId("symbol", id)),
    ...ids.meaningIds.map((id) => archiveEntityId("meaning", id)),
  ]);
  const symbolNetworkNodeIds = uniqueStrings([
    verseId,
    ...(verseLayer?.wordIds ?? []),
    ...(verseLayer?.symbolIds ?? []),
    ...(verseLayer?.roomIds ?? []),
    ...foundation.growingRooms.map((room) => room.id),
  ]);
  const missingWords = expectedCoreWordIds[verseId].filter((wordId) => !hebrewWords.some((word) => word.id === wordId));
  const missingLetters = expectedLetterIds.filter((letterId) =>
    ids.letterIds.includes(letterId) && !hebrewLetters.some((letter) => letter.id === letterId)
  );
  const missingCodexPages = ids.wordIds.filter((wordId) => !codexEntryExists(wordId));
  const openTodos = [
    ...missingWords.map((wordId) => `Hebraeisches Kernwort "${wordId}" anlegen.`),
    ...missingLetters.map((letterId) => `Buchstabenschicht "${letterId}" anlegen.`),
    ...missingCodexPages.map((wordId) => `Codex-Seite fuer "${wordId}" verknuepfen.`),
  ];

  if (verseId === "genesis-1-3" && !getGenesisVerseLetterLayer(verseId)?.wordIds.includes("tov")) {
    openTodos.push("Tov bleibt bewusst als Folgeschwelle von Genesis 1,4 markiert, nicht als dominanter Genesis-1,3-Knoten.");
  }

  return {
    verseId,
    title: foundation.foundationTitle,
    essence: foundation.sceneSummary,
    hebrewWordIds: ids.wordIds,
    letterIds: ids.letterIds,
    symbolIds: ids.symbolIds,
    meaningIds: ids.meaningIds,
    roomIds: ids.roomIds,
    codexPageIds,
    archiveEntityIds,
    symbolNetworkNodeIds,
    relations: buildRelations(verseId, ids),
    reflectionQuestions: verseReflectionQuestions[verseId],
    nextThreshold: verseThresholds[verseId],
    openTodos,
  };
}

export const genesisCompletenessMatrix = genesisCompletenessVerseIds.map(buildRow);

export function validateGenesisCompletenessMatrix() {
  const errors: string[] = [];
  const warnings: string[] = [];
  const wordIds = new Set(hebrewWords.map((word) => word.id));
  const letterIds = new Set(hebrewLetters.map((letter) => letter.id));
  const meaningIds = new Set<string>(meaningNodes.map((meaning) => meaning.id));
  const resonanceIds = new Set(getAllResonanceConnections().flatMap((connection) => [connection.sourceId, connection.targetId]));

  genesisCompletenessMatrix.forEach((row) => {
    expectedCoreWordIds[row.verseId].forEach((wordId) => {
      if (!wordIds.has(wordId)) {
        errors.push(`GenesisCompleteness "${row.verseId}" misses Hebrew word "${wordId}".`);
      }
    });

    row.letterIds.forEach((letterId) => {
      if (!letterIds.has(letterId)) {
        errors.push(`GenesisCompleteness "${row.verseId}" references missing letter "${letterId}".`);
      }
    });

    row.meaningIds.forEach((meaningId) => {
      if (!meaningIds.has(meaningId)) {
        errors.push(`GenesisCompleteness "${row.verseId}" references missing meaning "${meaningId}".`);
      }
    });

    row.relations.forEach((relation) => {
      const hasReverse =
        genesisCompletenessMatrix.some((candidateRow) =>
          candidateRow.relations.some((candidate) => candidate.sourceId === relation.targetId && candidate.targetId === relation.sourceId)
        ) ||
        getOntologyRelationsForEntity(relation.sourceId).some((candidate) =>
          (candidate.sourceId === relation.targetId && candidate.targetId === relation.sourceId) ||
          (candidate.sourceId === relation.sourceId && candidate.targetId === relation.targetId)
        ) ||
        resonanceIds.has(relation.sourceId) && resonanceIds.has(relation.targetId);

      if (relation.reversible && !hasReverse) {
        warnings.push(`GenesisCompleteness "${row.verseId}" relation ${relation.sourceId} -> ${relation.targetId} is reversible but only traced through matrix context.`);
      }
    });

    row.roomIds.forEach((roomId) => {
      if (!["wasser", "licht", "feuer", "wueste", "brot"].includes(roomId)) {
        errors.push(`GenesisCompleteness "${row.verseId}" opens unknown room "${roomId}".`);
      }
    });

    row.symbolIds.forEach((symbolId) => {
      if (!codexEntryExists(symbolId) && !getOntologyEntity(symbolId)) {
        errors.push(`GenesisCompleteness "${row.verseId}" points to missing symbol "${symbolId}".`);
      }
    });
  });

  expectedLetterIds.forEach((letterId) => {
    if (!letterIds.has(letterId)) {
      errors.push(`GenesisCompleteness expected letter "${letterId}" is missing.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      rows: genesisCompletenessMatrix.length,
      relations: genesisCompletenessMatrix.flatMap((row) => row.relations).length,
      codexPages: new Set(genesisCompletenessMatrix.flatMap((row) => row.codexPageIds)).size,
      archiveEntities: new Set(genesisCompletenessMatrix.flatMap((row) => row.archiveEntityIds)).size,
    },
  };
}
