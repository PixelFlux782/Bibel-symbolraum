import { hebrewLetters } from "@/lib/hebrew/hebrewLetters";
import { hebrewWords } from "@/lib/hebrew/hebrewWords";
import {
  genesisRoomLetterCarriers,
  getGenesisLetterProfile,
  getGenesisVerseLetterLayer,
  getGenesisWordMovement,
  getGenesisWordsForLetter,
} from "@/lib/hebrew/genesisLetterLayer";
import { symbolHebrewMappings } from "@/lib/hebrew/symbolHebrewMappings";
import { biblicalReferences } from "@/lib/meaning/biblicalReferences";
import { biblicalMeaningLinks, hebrewMeaningLinks, symbolMeaningLinks } from "@/lib/meaning/meaningMappings";
import { meaningJourneys } from "@/lib/meaning/meaningJourneys";
import { SYMBOLS, SYMBOL_NETWORK, type SymbolData, type SymbolItem } from "@/lib/symbols";

import type { CodexEntry, CodexRelation, CodexSourceKind } from "./types";

const CODEX_ENTRY_IDS = [
  "anfang",
  "schoepfung",
  "ursprung",
  "ordnung",
  "himmel",
  "erde",
  "majim",
  "or",
  "esch",
  "midbar",
  "lechem",
  "wasser",
  "licht",
  "feuer",
  "wueste",
  "brot",
  "tiefe",
  "geist",
  "ruach",
  "wort",
  "tehom",
  "davar",
  "qol",
  "offenbarung",
  "reinigung",
  "uebergang",
  "geburt",
  "verborgenheit",
  "wandlung",
  "mem",
  "aleph",
  "bet",
  "dalet",
  "resh",
  "shin",
  "jod",
  "tav",
  "lamed",
  "he",
  "vav",
  "tsadi",
  "chet",
  "kaf",
  "ayin",
  "pe",
  "qof",
  "nun",
  "genesis-1",
  "genesis-1-1",
  "genesis-1-2",
  "genesis-1-3",
  "exodus-14",
  "schoepfung-wasser",
  "schilfmeer",
  "felswasser",
  "zahl-1",
  "zahl-40",
  "zahl-90",
  "journey-chaos-ordnung",
  "journey-wasser-geist",
  "journey-wueste-offenbarung",
  "davar-qol-or",
  "tehom-davar-qol-or",
  "tehom-ruach-davar-qol-or",
] as const;

export type CodexEntryId = (typeof CODEX_ENTRY_IDS)[number];

const CODEX_ALIASES = {
  anfang: ["Anfang", "Beginn", "Ursprung"],
  schoepfung: ["Schöpfung", "Creation"],
  ursprung: ["Urgrund", "Quelle des Anfangs", "erster Ursprung"],
  ordnung: ["Kosmos", "Unterscheidung", "geordnetes Licht"],
  himmel: ["Himmel", "Heaven", "Schamajim"],
  erde: ["Erde", "Earth", "Adamah"],
  majim: ["Wasser", "Majim", "\u05de\u05d9\u05dd", "wasser"],
  or: ["Licht", "Or", "\u05d0\u05d5\u05e8", "licht"],
  esch: ["Feuer", "Esch", "\u05d0\u05e9", "feuer"],
  midbar: ["W\u00fcste", "Wüste", "Midbar", "\u05de\u05d3\u05d1\u05e8", "wueste"],
  lechem: ["Brot", "Lechem", "\u05dc\u05d7\u05dd", "brot"],
  wasser: ["Wasser", "majim", "mayim"],
  licht: ["Licht", "or"],
  feuer: ["Feuer", "esch"],
  brot: ["Brot", "lechem"],
  wueste: ["Wüste", "midbar"],
  tiefe: ["Tiefe", "Urtiefe", "Tehom"],
  geist: ["Geistfeld", "Atemfeld", "bewegte Gegenwart"],
  ruach: ["Ruach", "\u05e8\u05d5\u05d7", "Geist", "Wind", "Atem", "bewegte Gegenwart", "unsichtbare Bewegung"],
  wort: ["Wort", "Sprache", "Davar"],
  tehom: ["Tehom", "\u05ea\u05d4\u05d5\u05dd", "Tiefe", "Urtiefe", "verborgener Ursprung", "Vor dem Licht"],
  davar: ["Davar", "דבר", "Wort", "Sache", "Ereignis", "Wirklichkeit"],
  qol: ["Qol", "קול", "Stimme", "Klang", "Ruf", "hörbare Gegenwart"],
  offenbarung: ["Offenbarung", "Sichtbarwerden", "Revelation"],
  reinigung: ["Reinigung", "Läuterung", "Klärung"],
  uebergang: ["Übergang", "Durchgang", "Schwelle", "Passage"],
  geburt: ["Geburt", "Neuwerden", "Hervorkommen", "neuer Anfang"],
  verborgenheit: ["Verborgenheit", "verborgene Tiefe", "Möglichkeit vor Sichtbarkeit"],
  wandlung: ["Wandlung", "Verwandlung", "Transformation"],
  mem: ["Mem"],
  aleph: ["Aleph"],
  bet: ["Bet", "\u05d1", "Beth"],
  dalet: ["Dalet", "\u05d3", "Daleth"],
  resh: ["Resh", "\u05e8", "Resch"],
  shin: ["Shin", "\u05e9", "Schin"],
  jod: ["Jod", "Yod", "\u05d9"],
  tav: ["Tav", "\u05ea"],
  lamed: ["Lamed", "\u05dc"],
  he: ["He", "\u05d4"],
  vav: ["Vav", "Waw", "\u05d5"],
  tsadi: ["Tsade", "Tsadi", "\u05e6", "\u05e5"],
  chet: ["Chet", "Het", "\u05d7"],
  kaf: ["Kaf", "Kaph", "\u05db", "\u05da"],
  ayin: ["Ayin", "Ajin", "\u05e2"],
  pe: ["Pe", "Peh", "\u05e4"],
  qof: ["Qof", "\u05e7", "Kof"],
  nun: ["Nun", "\u05e0"],
  "genesis-1": ["Genesis 1", "1 Mose 1", "Bereschit 1", "Schöpfungsanfang"],
  "genesis-1-1": ["Genesis 1,1", "1 Mose 1,1", "Bereschit 1:1", "Im Anfang"],
  "genesis-1-2": ["Genesis 1,2", "1 Mose 1,2", "Bereschit 1:2", "Tohu wabohu", "Ruach"],
  "genesis-1-3": ["Genesis 1,3", "1 Mose 1,3", "Bereschit 1:3", "Es werde Licht", "Jehi or"],
  "exodus-14": ["Exodus 14", "2 Mose 14", "Schilfmeer", "Meer als Durchgang", "Rettung am Meer"],
  "schoepfung-wasser": ["Wasser der Schöpfung", "Anfangswasser", "Geist über den Wassern"],
  schilfmeer: ["Schilfmeer", "Meer als Durchgang", "Exodus Wasser"],
  felswasser: ["Wasser aus dem Felsen", "Felswasser", "Wasser in der Wüste"],
  "zahl-1": ["Zahl 1", "Eins", "Alephwert", "Ursprungszahl", "Einheit im Codex"],
  "zahl-40": ["Zahl 40", "Vierzig", "Memwert", "Schwellenzahl", "Wasserzeit"],
  "zahl-90": ["Zahl 90", "Neunzig", "Majimwert", "Wasserzahl", "Mem-Jod-Mem"],
  "journey-chaos-ordnung": ["Spur Chaos Ordnung", "Chaos Ordnung Spur", "Von Chaos zu Ordnung"],
  "journey-wasser-geist": ["Spur Wasser Geist", "Wasser und Geist Spur"],
  "journey-wueste-offenbarung": ["Spur Wüste Offenbarung", "Wüste zur Offenbarung"],
  "davar-qol-or": ["Vom Wort zum Licht", "Davar Qol Or", "Wort Stimme Licht"],
  "tehom-davar-qol-or": ["Von der Tiefe zum Licht", "Tehom Davar Qol Or", "Tiefe Wort Stimme Licht", "Vor dem Licht"],
  "tehom-ruach-davar-qol-or": ["Vom Ursprung zum Licht", "Tehom Ruach Davar Qol Or", "Genesis-Achse", "Über den Wassern"],
} satisfies Record<CodexEntryId, string[]>;

function aliasesFor(entryId: CodexEntryId): string[] {
  return CODEX_ALIASES[entryId];
}

function findSymbol(id: string): { network?: SymbolData; legacy?: SymbolItem } {
  return {
    network: SYMBOL_NETWORK.find((symbol) => symbol.id === id),
    legacy: SYMBOLS.find((symbol) => symbol.slug === id),
  };
}

function findSymbolTitle(id: string): string {
  const symbol = findSymbol(id);
  return symbol.network?.name ?? symbol.legacy?.name ?? id;
}

function symbolMeaningFields(symbolId: string) {
  return symbolMeaningLinks.find((link) => link.symbolId === symbolId)?.nodeIds ?? [];
}

function hebrewMeaningFields(hebrewWordId: string) {
  return hebrewMeaningLinks.find((link) => link.hebrewWordId === hebrewWordId)?.nodeIds ?? [];
}

function biblicalMeaningFields(biblicalReferenceId: string) {
  return biblicalMeaningLinks.find((link) => link.biblicalReferenceId === biblicalReferenceId)?.nodeIds ?? [];
}

function journeyIdsForSymbol(symbolId: string): string[] {
  return meaningJourneys
    .filter((journey) => journey.symbolPath.includes(symbolId))
    .map((journey) => journey.id);
}

function journeyIdsForScripture(referenceId: string): string[] {
  return meaningJourneys
    .filter((journey) => journey.biblicalReferences.includes(referenceId))
    .map((journey) => journey.id);
}

const LETTER_CODEX_PROFILES: Record<string, {
  glyph: string;
  transliteration: string;
  essence: string;
  meaningFields: CodexEntry["meaningFields"];
  searchTerms: string[];
  scriptureAnchors: CodexEntry["scriptureAnchors"];
  extraRelations: CodexRelation[];
}> = {
  mem: {
    glyph: "\u05de",
    transliteration: "m / Mem",
    essence:
      "Mem ist die Wasserform des Werdens. Sie umhüllt, trägt und verbirgt den Ursprung im Inneren: offen als fliessendes Wasser, geschlossen als bewahrte Tiefe.",
    meaningFields: ["depth", "chaos", "birth", "transition", "purification", "life", "hiddenness", "desert", "word"],
    searchTerms: ["Majim", "Wasserbuchstabe", "finales Mem", "geschlossene Tiefe"],
    scriptureAnchors: [
      {
        id: "genesis-1-2",
        reference: "Genesis 1,2",
        label: "Wasser am Anfang",
        note: "Mem ist über majim mit den Wassern der ersten Tiefe verbunden.",
        source: "hebrew-letter",
      },
      {
        id: "exodus-14",
        reference: "Exodus 14",
        label: "Meer als Durchgang",
        note: "Das Wasser wird Grenze, Schwelle und Weg der Befreiung.",
        source: "hebrew-letter",
      },
      {
        id: "matthew-3-13-17",
        reference: "Matthaeus 3,13-17",
        label: "Taufe und Neugeburt",
        note: "Wasser trägt den Übergang in eine neue Ausrichtung.",
        source: "hebrew-letter",
      },
    ],
    extraRelations: [
      { targetId: "genesis-1-2", type: "anchors-scripture", label: "Mem klingt im Wasserfeld von Genesis 1,2 an.", source: "hebrew-letter" },
      { targetId: "tehom", type: "shares-meaning", label: "Mem öffnet die symbolische Tiefe unter der sichtbaren Ordnung.", source: "hebrew-letter" },
    ],
  },
  aleph: {
    glyph: "\u05d0",
    transliteration: "\u02be / Aleph",
    essence:
      "Aleph ist der stille Anfang vor dem gesprochenen Wort. Es trägt die Einheit, aus der Licht und Feuer hervortreten.",
    meaningFields: ["light", "revelation", "awareness", "guidance", "presence", "fire", "calling", "hiddenness", "word"],
    searchTerms: ["Alef", "Anfangsbuchstabe", "stiller Atem", "Ursprung", "Einheit"],
    scriptureAnchors: [
      {
        id: "genesis-1-3",
        reference: "Genesis 1,3",
        label: "Licht wird gerufen",
        note: "Aleph steht im Wort or als stiller Anfang des Sichtbarwerdens.",
        source: "hebrew-letter",
      },
      {
        id: "john-1-4-5",
        reference: "Johannes 1,4-5",
        label: "Licht und Leben",
        note: "Die Lichtspur verbindet Ursprung, Gegenwart und Leben.",
        source: "hebrew-letter",
      },
      {
        id: "exodus-3-2",
        reference: "Exodus 3,2",
        label: "Feuer der Gegenwart",
        note: "Im Feuer wird Gegenwart sichtbar, ohne sich zu verbrauchen.",
        source: "hebrew-letter",
      },
    ],
    extraRelations: [
      { targetId: "genesis-1-3", type: "anchors-scripture", label: "Aleph steht im Lichtwort or als stiller Ursprung.", source: "hebrew-letter" },
      { targetId: "davar", type: "shares-meaning", label: "Vor dem gesprochenen Wort liegt der stille Atem des Aleph.", source: "hebrew-letter" },
      { targetId: "offenbarung", type: "shares-meaning", label: "Im Aleph beginnt das Hervortreten des Verborgenen.", source: "hebrew-letter" },
    ],
  },
};

function uniqueMeaningFields(fields: CodexEntry["meaningFields"]): CodexEntry["meaningFields"] {
  return Array.from(new Set(fields));
}

function uniqueRelations(relations: CodexRelation[]): CodexRelation[] {
  const seen = new Set<string>();

  return relations.filter((relation) => {
    const key = `${relation.type}:${relation.targetId}:${relation.label ?? ""}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function normalizeLookupTerm(term: string): string {
  return term
    .trim()
    .replace(/Ã¤/g, "ae")
    .replace(/Ã¶/g, "oe")
    .replace(/Ã¼/g, "ue")
    .replace(/ÃŸ/g, "ss")
    .replace(/Ä/g, "Ae")
    .replace(/Ö/g, "Oe")
    .replace(/Ü/g, "Ue")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/ã¤/g, "ae")
    .replace(/ã¶/g, "oe")
    .replace(/ã¼/g, "ue")
    .toLocaleLowerCase("de-DE")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f\u0591-\u05c7]/g, "")
    .replace(/[\s:_,.;/\\]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function canonicalLookupTerms(terms: string[] | undefined, localSeen: Set<string>, globalOwners: Map<string, string>, entryId: string): string[] | undefined {
  const canonicalTerms = terms?.filter((term) => {
    const normalizedTerm = normalizeLookupTerm(term);

    if (!normalizedTerm || localSeen.has(normalizedTerm)) {
      return false;
    }

    const ownerId = globalOwners.get(normalizedTerm);

    if (ownerId && ownerId !== entryId) {
      return false;
    }

    localSeen.add(normalizedTerm);
    globalOwners.set(normalizedTerm, entryId);
    return true;
  });

  return canonicalTerms && canonicalTerms.length > 0 ? canonicalTerms : undefined;
}

const SCRIPTURE_ANCHOR_ID_ALIASES: Record<string, string> = {
  "majim-genesis-1-2": "genesis-1-2",
  "majim-exodus-14": "exodus-14",
  "majim-matthew-3": "matthew-3-13-17",
  "or-genesis-1-3": "genesis-1-3",
  "or-exodus-13-21": "exodus-13-21",
  "or-john-1-4-5": "john-1-4-5",
  "esh-exodus-3": "exodus-3-2",
  "esh-exodus-13-21": "exodus-13-21",
  "esh-malachi-3": "malachi-3-2-3",
  "midbar-exodus-16": "exodus-wilderness",
  "midbar-deuteronomy-8": "deuteronomy-8",
  "midbar-matthew-4": "matthew-4",
  "midbar-exodus-3": "exodus-3-2",
  "lechem-exodus-16": "exodus-16-4",
  "lechem-mark-4": "mark-4-26-29",
  "lechem-deuteronomy-8": "deuteronomy-8-3",
  "lechem-luke-24": "luke-24-30-31",
  "lechem-john-6": "john-6-35",
};

function canonicalizeCodexRegistry(entries: CodexEntry[]): CodexEntry[] {
  const entryIds = new Set(entries.map((entry) => entry.id));
  const externalTargetIds = new Set([
    ...hebrewLetters.map((letter) => letter.id),
    ...hebrewWords.map((word) => word.id),
    ...biblicalReferences.map((reference) => reference.id),
  ]);
  const symbolSlugs = new Set([
    ...SYMBOL_NETWORK.map((symbol) => symbol.id),
    ...SYMBOLS.map((symbol) => symbol.slug),
  ]);
  const scriptureReferenceIds = new Set(biblicalReferences.map((reference) => reference.id));
  const globalLookupOwners = new Map<string, string>();

  return entries.map((entry) => {
    const localLookupTerms = new Set<string>();
    const aliases = canonicalLookupTerms(entry.aliases, localLookupTerms, globalLookupOwners, entry.id);
    const searchTerms = canonicalLookupTerms(entry.searchTerms, localLookupTerms, globalLookupOwners, entry.id);

    return {
      ...entry,
      aliases,
      searchTerms,
      relations: entry.relations.filter((relation) =>
        entryIds.has(relation.targetId) ||
        externalTargetIds.has(relation.targetId) ||
        symbolSlugs.has(relation.targetId)
      ),
      scriptureAnchors: entry.scriptureAnchors.map((anchor) => {
        const anchorId = anchor.id ? SCRIPTURE_ANCHOR_ID_ALIASES[anchor.id] ?? anchor.id : undefined;

        return {
          ...anchor,
          id: anchorId && scriptureReferenceIds.has(anchorId) ? anchorId : undefined,
        };
      }),
      symbolRoomSlug: entry.symbolRoomSlug && symbolSlugs.has(entry.symbolRoomSlug) ? entry.symbolRoomSlug : null,
    };
  });
}

function scriptureAnchorsForSymbol(symbolId: string) {
  const symbol = findSymbol(symbolId);
  const references = symbol.network?.scriptureReferences ?? symbol.legacy?.scriptureReferences ?? [];

  return references.map((reference) => ({
    reference: reference.reference,
    label: reference.reference,
    note: reference.shortNote,
    source: "symbol-network" as const,
  }));
}

function symbolRelations(symbolId: string): CodexRelation[] {
  const symbol = findSymbol(symbolId);
  const relations = symbol.network?.relations ?? [];
  const connected = symbol.legacy?.connectedSymbols ?? [];
  const relationTargets = new Set(relations.map((relation) => relation.targetId));

  return [
    ...relations.map<CodexRelation>((relation) => ({
      targetId: relation.targetId,
      type: relation.relationType === "contrast" ? "contrasts" : relation.relationType === "transformation" ? "transforms" : "related",
      label: relation.explanation,
      strength: relation.strength,
      source: "symbol-network",
    })),
    ...connected
      .filter((targetId) => !relationTargets.has(targetId))
      .map<CodexRelation>((targetId) => ({
        targetId,
        type: "related",
        label: `Verbundenes Symbol: ${findSymbolTitle(targetId)}`,
        source: "symbol-list",
      })),
  ];
}

function symbolEntry(symbolId: "wasser" | "licht" | "feuer" | "wueste" | "brot", hebrewWordId: string): CodexEntry {
  const symbol = findSymbol(symbolId);
  const word = hebrewWords.find((entry) => entry.id === hebrewWordId);
  const mappedHebrewWordIds = symbolHebrewMappings
    .find((mapping) => mapping.symbolSlug === symbolId)
    ?.hebrewWordIds
    .filter((wordId) => wordId !== hebrewWordId)
    .slice(0, 6) ?? [];
  const sources: CodexSourceKind[] = [
    ...(symbol.network ? (["symbol-network"] as const) : []),
    ...(symbol.legacy ? (["symbol-list"] as const) : []),
    ...(word ? (["hebrew-word"] as const) : []),
    "meaning-graph",
  ];
  const carryingLetterIds = genesisRoomLetterCarriers[symbolId as keyof typeof genesisRoomLetterCarriers] ?? [];

  return {
    id: symbolId,
    type: "symbol",
    title: symbol.network?.name ?? symbol.legacy?.name ?? symbolId,
    subtitle: symbol.network?.category ?? symbol.legacy?.shortMeaning ?? null,
    hebrew: word?.hebrew ?? symbol.network?.hebrew ?? symbol.legacy?.hebrew ?? null,
    transliteration: word?.transliteration ?? symbol.network?.transliteration ?? null,
    aliases: aliasesFor(symbolId),
    summary: symbol.network?.shortMeaning ?? symbol.legacy?.shortMeaning ?? "",
    meaningFields: symbolMeaningFields(symbolId),
    relations: [
      ...carryingLetterIds.map<CodexRelation>((targetId) => ({
        targetId,
        type: "contains-letter",
        label: `Dieser Buchstabe beruehrt den ${findSymbolTitle(symbolId)}-Raum als erste Schriftspur.`,
        source: "hebrew-letter",
      })),
      ...(word
        ? [
            {
              targetId: word.id,
              type: "has-hebrew-word",
              label: word.germanMeaning,
              source: "hebrew-word",
            } satisfies CodexRelation,
          ]
        : []),
      ...symbolRelations(symbolId),
      ...(symbolId === "wasser"
        ? [
            {
              targetId: "tehom",
              type: "related",
              label: "Majim / Wasser ist mit Tehom als Ursprungstiefe verbunden.",
              source: "hebrew-word",
            } satisfies CodexRelation,
          ]
        : []),
      ...mappedHebrewWordIds.map<CodexRelation>((targetId) => ({
        targetId,
        type: "related",
        label: "Wort im selben Bedeutungsfeld.",
        source: "hebrew-word",
      })),
    ],
    scriptureAnchors: scriptureAnchorsForSymbol(symbolId),
    symbolRoomSlug: symbolId,
    journeyIds: journeyIdsForSymbol(symbolId),
    meta: {
      status: "seed",
      source: sources,
      sourceIds: [symbolId, ...(word ? [word.id] : [])],
      tags: ["codex-seed", "symbol"],
    },
  };
}

function hebrewWordEntry(wordId: Extract<CodexEntryId, "majim" | "or" | "esch" | "midbar" | "lechem">): CodexEntry {
  const word = hebrewWords.find((entry) => entry.id === (wordId === "esch" ? "esch" : wordId));
  const symbolSlug = word?.relatedSymbolSlugs.find((slug) => ["wasser", "licht", "feuer", "wueste", "brot"].includes(slug)) ?? null;

  if (!word) {
    throw new Error(`HebrewWord "${wordId}" fehlt für Codex-Seed.`);
  }

  return {
    id: wordId,
    type: "hebrew-word",
    title: word.germanMeaning,
    subtitle: `${word.hebrew} / ${word.transliteration}`,
    hebrew: word.hebrew,
    transliteration: word.transliteration,
    aliases: aliasesFor(wordId),
    searchTerms: [
      word.id,
      word.slug,
      word.transliteration,
      ...word.relatedSymbolSlugs,
      ...word.meaningFields.flatMap((field) => [field.label, ...field.experienceFields]),
    ],
    summary: word.meaningFields.slice(0, 3).map((field) => field.description).join(" "),
    meaningFields: uniqueMeaningFields(hebrewMeaningFields(word.id)),
    relations: uniqueRelations([
      ...(symbolSlug
        ? [{
            targetId: symbolSlug,
            type: "symbolizes" as const,
            label: `${word.germanMeaning} bleibt als Raum-Slug ${symbolSlug} erreichbar.`,
            source: "symbol-network" as const,
          }]
        : []),
      ...word.letterIds.map<CodexRelation>((targetId) => ({
        targetId,
        type: "contains-letter",
        label: `Buchstabe ${targetId}`,
        source: "hebrew-letter",
      })),
    ]),
    scriptureAnchors: word.biblicalReferences.map((reference) => ({
      id: reference.id,
      reference: reference.reference,
      label: reference.relation,
      note: reference.context,
      source: "hebrew-word",
    })),
    symbolRoomSlug: symbolSlug,
    journeyIds: [
      ...journeyIdsForSymbol(word.id),
      ...(symbolSlug ? journeyIdsForSymbol(symbolSlug) : []),
    ],
    meta: {
      status: "seed",
      source: ["hebrew-word", "meaning-graph"],
      sourceIds: [word.id, ...(symbolSlug ? [symbolSlug] : [])],
      tags: ["codex-seed", "hebrew-word", "canonical-id", word.id, ...(symbolSlug ? [symbolSlug] : [])],
      notes: "Kanonischer Hebrew-Word-Knoten; deutsche Symbol-Slugs bleiben nur als Raum-/Legacy-Alias erhalten.",
    },
  };
}

function minimalMeaningEntry({
  id,
  title,
  subtitle,
  summary,
  meaningFields,
  relations = [],
}: {
  id: CodexEntryId;
  title: string;
  subtitle: string;
  summary: string;
  meaningFields: CodexEntry["meaningFields"];
  relations?: CodexRelation[];
}): CodexEntry {
  return {
    id,
    type: "meaning-field",
    title,
    subtitle,
    hebrew: null,
    transliteration: null,
    aliases: aliasesFor(id),
    summary,
    meaningFields,
    relations,
    scriptureAnchors: [],
    symbolRoomSlug: null,
    journeyIds: [],
    meta: {
      status: "seed",
      source: ["meaning-graph"],
      sourceIds: [id],
      tags: ["codex-seed", "relation-target"],
      notes: "Minimaler Codex-Zielanker für Genesis 1.",
    },
  };
}

function storyAnchorEntry({
  id,
  title,
  subtitle,
  summary,
  relations,
}: {
  id: Extract<CodexEntryId, "schoepfung-wasser" | "schilfmeer" | "felswasser">;
  title: string;
  subtitle: string;
  summary: string;
  relations: CodexRelation[];
}): CodexEntry {
  return {
    id,
    type: "meaning",
    title,
    subtitle,
    hebrew: null,
    transliteration: null,
    aliases: aliasesFor(id),
    summary,
    meaningFields: ["depth", "transition", "life"],
    relations,
    scriptureAnchors: [],
    symbolRoomSlug: "wasser",
    journeyIds: [],
    meta: {
      status: "seed",
      source: ["meaning-graph", "scripture-reference"],
      sourceIds: [id],
      tags: ["codex-seed", "story-anchor", "wasser"],
      notes: "Minimaler referenzierbarer Anker für den Tiefe-Zoom.",
    },
  };
}

function meaningEntry({
  id,
  title,
  subtitle,
  summary,
  meaningFields,
  relations,
  scriptureAnchors = [],
  searchTerms,
  sourceIds,
}: {
  id: CodexEntryId;
  title: string;
  subtitle: string;
  summary: string;
  meaningFields: CodexEntry["meaningFields"];
  relations: CodexRelation[];
  scriptureAnchors?: CodexEntry["scriptureAnchors"];
  searchTerms: string[];
  sourceIds: string[];
}): CodexEntry {
  return {
    id,
    type: "meaning",
    title,
    subtitle,
    hebrew: null,
    transliteration: null,
    aliases: aliasesFor(id),
    searchTerms,
    summary,
    meaningFields: uniqueMeaningFields(meaningFields),
    relations: uniqueRelations(relations),
    scriptureAnchors,
    symbolRoomSlug: null,
    journeyIds: [],
    meta: {
      status: "seed",
      source: ["meaning-graph", "symbol-network", "hebrew-word", "hebrew-letter", "scripture-reference"],
      sourceIds,
      tags: ["codex-seed", "meaning", "bedeutungsportal"],
      notes: "Kuratierter Meaning-Codex-Eintrag für den Bedeutung-Tab.",
    },
  };
}

function journeyEntry({
  id,
  title,
  subtitle,
  summary,
  meaningFields,
  relations,
  scriptureAnchors = [],
  searchTerms,
  sourceIds,
  steps,
}: {
  id: Extract<CodexEntryId, `journey-${string}`>;
  title: string;
  subtitle: string;
  summary: string;
  meaningFields: CodexEntry["meaningFields"];
  relations: CodexRelation[];
  scriptureAnchors?: CodexEntry["scriptureAnchors"];
  searchTerms: string[];
  sourceIds: string[];
  steps: NonNullable<CodexEntry["steps"]>;
}): CodexEntry {
  return {
    id,
    type: "journey",
    title,
    subtitle,
    hebrew: null,
    transliteration: null,
    aliases: aliasesFor(id),
    searchTerms,
    summary,
    meaningFields: uniqueMeaningFields(meaningFields),
    relations: uniqueRelations(relations),
    steps,
    scriptureAnchors,
    symbolRoomSlug: null,
    journeyIds: [],
    meta: {
      status: "seed",
      source: ["journey", "meaning-graph", "symbol-network", "scripture-reference"],
      sourceIds,
      tags: ["codex-seed", "journey", "bedeutungspfad"],
      notes: "Verbundenes Spurenfeld für den Codex.",
    },
  };
}

function letterEntry(letterId: string): CodexEntry {
  const letter = hebrewLetters.find((entry) => entry.id === letterId);

  if (!letter) {
    throw new Error(`HebrewLetter "${letterId}" fehlt für Codex-Seed.`);
  }

  const deepProfile = getGenesisLetterProfile(letterId);
  const profile = LETTER_CODEX_PROFILES[letterId] ?? {
    glyph: letter.glyph,
    transliteration: `${letter.transcription} / ${letter.name}`,
    essence: deepProfile
      ? `${deepProfile.shortEssence} ${deepProfile.deeperMeaning}`
      : `${letter.name} traegt die Spur ${letter.archetypalMeanings.slice(0, 3).join(", ")}. Der Buchstabe wird als Grundbewegung von Zeichen, Klang und Bedeutung gelesen.`,
    meaningFields: [] satisfies CodexEntry["meaningFields"],
    searchTerms: [
      letter.name,
      letter.id,
      letter.glyph,
      letter.transcription,
      ...letter.archetypalMeanings,
      ...(deepProfile?.meaningFieldLabels ?? []),
    ],
    scriptureAnchors: letter.biblicalReferences.map((reference) => ({
      reference: reference.reference,
      label: reference.context,
      note: reference.relation,
      source: "hebrew-letter" as const,
    })),
    extraRelations: [] satisfies CodexRelation[],
  };
  const genesisWords = getGenesisWordsForLetter(letter.id);
  const relatedWords = [
    ...hebrewWords.filter((word) => letter.relatedWordIds.includes(word.id)),
    ...genesisWords,
  ].filter((word, index, words) => words.findIndex((candidate) => candidate.id === word.id) === index);
  const relatedWordScriptureAnchors = relatedWords.flatMap((word) => word.biblicalReferences.map((reference) => ({
    reference: reference.reference,
    label: reference.context,
    note: reference.relation,
    source: "hebrew-word" as const,
  })));

  return {
    id: letter.id,
    type: "hebrew-letter",
    title: letter.name,
    subtitle: `Buchstabe ${letter.alphabetPosition}, Zahlkörper ${letter.numericValue}`,
    hebrew: profile.glyph,
    transliteration: profile.transliteration,
    aliases: aliasesFor(letterId as CodexEntryId),
    searchTerms: profile.searchTerms,
    summary: profile.essence,
    meaningFields: uniqueMeaningFields([
      ...profile.meaningFields,
      ...letter.relatedSymbolSlugs.flatMap(symbolMeaningFields),
      ...letter.relatedWordIds.flatMap(hebrewMeaningFields),
      ...(deepProfile?.symbolIds ?? []).flatMap(symbolMeaningFields),
      ...genesisWords.flatMap((word) => hebrewMeaningFields(word.id)),
    ]),
    relations: uniqueRelations([
      ...(deepProfile?.roomIds ?? []).map<CodexRelation>((targetId) => ({
        targetId,
        type: "symbolizes",
        label: `${letter.name} traegt diesen Raum als Genesis-Zeichen.`,
        source: "hebrew-letter",
      })),
      ...(deepProfile?.symbolIds ?? []).map<CodexRelation>((targetId) => ({
        targetId,
        type: "shares-meaning",
        label: `${letter.name} beruehrt das Feld ${findSymbolTitle(targetId)}.`,
        source: "hebrew-letter",
      })),
      ...letter.relatedSymbolSlugs.map<CodexRelation>((targetId) => ({
        targetId,
        type: "symbolizes",
        label: `Verwandtes Symbol: ${findSymbolTitle(targetId)}`,
        source: "hebrew-letter",
      })),
      ...relatedWords.map<CodexRelation>((word) => ({
        targetId: word.id,
        type: "has-hebrew-word",
        label: getGenesisWordMovement(word.id)?.movement ?? word.germanMeaning,
        source: "hebrew-letter",
      })),
      ...(deepProfile?.relatedLetterIds ?? []).map<CodexRelation>((targetId) => ({
        targetId,
        type: "related",
        label: `Nahe Buchstabenresonanz im Genesis-Feld.`,
        source: "hebrew-letter",
      })),
      ...profile.extraRelations,
    ]),
    scriptureAnchors: [...profile.scriptureAnchors, ...relatedWordScriptureAnchors],
    symbolRoomSlug: letter.relatedSymbolSlugs[0] ?? null,
    journeyIds: Array.from(new Set(letter.relatedSymbolSlugs.flatMap(journeyIdsForSymbol))),
    meta: {
      status: "seed",
      source: ["hebrew-letter", "hebrew-word", "meaning-graph", "scripture-reference"],
      sourceIds: [letter.id, ...relatedWords.map((word) => word.id), ...profile.scriptureAnchors.map((anchor) => anchor.id).filter((id): id is string => Boolean(id))],
      tags: ["codex-seed", "hebrew-letter", "letter-resonance"],
      notes: deepProfile
        ? `Genesis-Rolle: ${deepProfile.genesisRole} Bedeutungsfelder: ${deepProfile.meaningFieldLabels.join(", ")}. Kontemplativ: ${deepProfile.contemplative}`
        : undefined,
    },
  };
}

function scriptureEntry(referenceId: "genesis-1" | "genesis-1-1" | "genesis-1-2" | "genesis-1-3" | "exodus-14"): CodexEntry {
  const reference = biblicalReferences.find((entry) => entry.id === referenceId);
  const base = {
    "genesis-1": {
      title: "Genesis 1",
      subtitle: "Der Anfang als erste Symbolsequenz",
      reference: "Genesis 1",
      label: "Genesis 1",
      searchTerms: ["Bereshit 1", "Schöpfung", "Anfang", "Tiefe", "Licht"],
      summary:
        "Genesis 1 erzählt nicht nur den Beginn der Welt, sondern legt die erste Bewegung des Symbolraums frei: Aus Anfang und noch ungestalteter Tiefe treten Wort, Licht und Unterscheidung hervor. Der Abschnitt verbindet Ursprung, Wasser, Geist, Stimme und Sichtbarkeit zu einer Grundlinie, an der spätere Symbole lesbar werden.",
      meaningFields: ["birth", "chaos", "depth", "light", "revelation"] satisfies CodexEntry["meaningFields"],
      relations: [
        { targetId: "genesis-1-1", type: "continues-journey", label: "Die Sequenz beginnt mit Anfang, Himmel und Erde.", source: "scripture-reference" },
        { targetId: "genesis-1-2", type: "continues-journey", label: "Die Tiefe und der Geist treten als Zwischenraum hervor.", source: "scripture-reference" },
        { targetId: "genesis-1-3", type: "continues-journey", label: "Das Wort ruft Licht in die Sichtbarkeit.", source: "scripture-reference" },
      ] satisfies CodexRelation[],
      symbolRoomSlug: null,
    },
    "genesis-1-1": {
      title: "Genesis 1:1",
      subtitle: "Im Anfang: Himmel und Erde",
      reference: "Genesis 1,1",
      label: "Genesis 1,1",
      searchTerms: ["Bereshit bara", "Schöpfung", "Himmel", "Erde", "Ursprung"],
      summary:
        "Genesis 1,1 ist Ursprung. Vor jeder Bewegung steht der Anfang: Himmel und Erde werden als erste Spannung gesetzt. Der Vers wirkt nicht wie ein erklaerter Anfang, sondern wie der Moment, in dem Welt ueberhaupt einen Horizont bekommt.",
      meaningFields: ["birth", "life", "hiddenness"] satisfies CodexEntry["meaningFields"],
      relations: [
        { targetId: "anfang", type: "anchors-scripture", label: "Der Anfang steht vor jeder Bewegung.", source: "scripture-reference" },
        { targetId: "schoepfung", type: "anchors-scripture", label: "Schoepfung erscheint als erste Setzung von Welt.", source: "scripture-reference" },
        { targetId: "himmel", type: "anchors-scripture", label: "Himmel traegt die obere Weite der Ursprungsspannung.", source: "scripture-reference" },
        { targetId: "erde", type: "anchors-scripture", label: "Erde traegt die untere, noch offene Wirklichkeit.", source: "scripture-reference" },
        { targetId: "genesis-1-2", type: "continues-journey", label: "Der Blick geht weiter in Tiefe, Wasser und Geist.", source: "scripture-reference" },
      ] satisfies CodexRelation[],
      symbolRoomSlug: null,
    },
    "genesis-1-2": {
      title: reference?.label ?? "Genesis 1:2",
      subtitle: "Tiefe, Wasser und schwebender Geist",
      reference: reference?.reference ?? "Genesis 1,2",
      label: reference?.label ?? "Genesis 1,2",
      searchTerms: ["Bereshit 1:2", "Tehom", "Wasser", "Urtiefe", "Mem"],
      summary:
        "Genesis 1,2 ist Tiefe. Wasser, Finsternis und Ungeformtes liegen offen, noch vor jeder Ordnung. Die Ruach schwebt ueber den Wassern: nichts ist geordnet, aber alles ist schon beruehrt.",
      meaningFields: biblicalMeaningFields(referenceId),
      relations: [
        { targetId: "majim", type: "anchors-scripture", label: "Wasser liegt als Anfangsraum vor der Ordnung.", source: "meaning-graph" },
        { targetId: "tehom", type: "anchors-scripture", label: "Tiefe steht offen, bevor Unterscheidung beginnt.", source: "meaning-graph" },
        { targetId: "geist", type: "anchors-scripture", label: "Geist schwebt als beruehrende Gegenwart ueber den Wassern.", source: "scripture-reference" },
        { targetId: "mem", type: "contains-letter", label: "Mem ist über majim mit dem Wasser-Motiv verbunden.", source: "hebrew-letter" },
        { targetId: "genesis-1-3", type: "continues-journey", label: "Aus der Tiefe führt die Sequenz zum gesprochenen Licht.", source: "scripture-reference" },
      ] satisfies CodexRelation[],
      symbolRoomSlug: "wasser",
    },
    "genesis-1-3": {
      title: "Genesis 1,3",
      subtitle: "Es werde Licht",
      reference: reference?.reference ?? "Genesis 1,3",
      label: "Es werde Licht",
      searchTerms: ["Bereshit 1:3", "Es werde Licht", "Or", "Wort", "Offenbarung", "Aleph"],
      summary:
        "Genesis 1,3 ist Licht. Das Wort ruft, und Licht wird. Offenbarung beginnt hier nicht als Erklaerung, sondern als Ruf: Was verborgen war, tritt in Sichtbarkeit, und die erste Trennung wird moeglich.",
      meaningFields: biblicalMeaningFields(referenceId),
      relations: [
        { targetId: "or", type: "anchors-scripture", label: "Licht wird als erstes Sichtbarwerden gerufen.", source: "meaning-graph" },
        { targetId: "davar", type: "anchors-scripture", label: "Das Wort ruft, bevor die Szene erklaert wird.", source: "meaning-graph" },
        { targetId: "offenbarung", type: "anchors-scripture", label: "Offenbarung tritt als Ruf aus der Verborgenheit hervor.", source: "meaning-graph" },
        { targetId: "aleph", type: "contains-letter", label: "Aleph steht im Lichtwort or als stiller Ursprung.", source: "hebrew-letter" },
      ] satisfies CodexRelation[],
      symbolRoomSlug: "licht",
    },
    "exodus-14": {
      title: reference?.label ?? "Exodus 14",
      subtitle: "Wasser als Schwelle zwischen Knechtschaft und Weg",
      reference: reference?.reference ?? "Exodus 14",
      label: reference?.label ?? "Exodus 14",
      searchTerms: ["Schilfmeer", "Meer", "Durchzug", "Schwelle", "Rettung", "Befreiung", "Geburt eines Weges"],
      summary:
        "Exodus 14 ist Schwelle. Das Wasser steht vor den Fliehenden als Angst und Grenze, und gerade dort entsteht ein Weg. Rettung bedeutet hier Durchgang: vom Alten ins Freie, durch das Unmoegliche hindurch.",
      meaningFields: ["depth", "transition", "birth", "life", "desert", "guidance"] satisfies CodexEntry["meaningFields"],
      relations: [
        { targetId: "majim", type: "anchors-scripture", label: "Wasser wird zur Schwelle zwischen Angst und Rettung.", source: "scripture-reference" },
        { targetId: "midbar", type: "continues-journey", label: "Hinter dem Meer beginnt der offene Weg ins Freie.", source: "scripture-reference" },
        { targetId: "offenbarung", type: "shares-meaning", label: "Im Durchgang wird Rettung als sichtbarer Weg lesbar.", source: "meaning-graph" },
        { targetId: "tehom", type: "shares-meaning", label: "Die Tiefe bleibt gegenwaertig und wird doch begehbare Schwelle.", source: "meaning-graph" },
        { targetId: "schilfmeer", type: "related", label: "Der Schilfmeer-Anker sammelt die Wasserpassage als Durchgang.", source: "scripture-reference" },
      ] satisfies CodexRelation[],
      symbolRoomSlug: "wasser",
    },
  }[referenceId];

  const verseLayer = getGenesisVerseLetterLayer(referenceId);

  return {
    id: referenceId,
    type: "scripture",
    title: base.title,
    subtitle: base.subtitle,
    hebrew: null,
    transliteration: null,
    aliases: aliasesFor(referenceId),
    searchTerms: base.searchTerms,
    summary: base.summary,
    meaningFields: base.meaningFields,
    relations: uniqueRelations([
      ...base.relations,
      ...(verseLayer?.wordIds ?? []).map<CodexRelation>((targetId) => ({
        targetId,
        type: "has-hebrew-word",
        label: getGenesisWordMovement(targetId)?.movement ?? "Hebraeisches Wort dieses Verses.",
        source: "hebrew-word",
      })),
      ...(verseLayer?.focusLetterIds ?? []).map<CodexRelation>((targetId) => ({
        targetId,
        type: "contains-letter",
        label: getGenesisLetterProfile(targetId)?.genesisRole ?? "Tragendes Zeichen dieses Verses.",
        source: "hebrew-letter",
      })),
      ...(verseLayer?.roomIds ?? []).map<CodexRelation>((targetId) => ({
        targetId,
        type: "opens-to",
        label: `${verseLayer.movement} Dieser Raum wird durch die Zeichen des Verses beruehrt.`,
        source: "scripture-reference",
      })),
      ...(verseLayer?.symbolIds ?? []).map<CodexRelation>((targetId) => ({
        targetId,
        type: "shares-meaning",
        label: verseLayer.note,
        source: "scripture-reference",
      })),
    ]),
    scriptureAnchors: [
      {
        id: referenceId === "genesis-1" ? undefined : referenceId,
        reference: base.reference,
        label: base.label,
        source: "scripture-reference",
      },
    ],
    symbolRoomSlug: base.symbolRoomSlug,
    journeyIds: journeyIdsForScripture(referenceId),
    meta: {
      status: "seed",
      source: ["scripture-reference", "meaning-graph"],
      sourceIds: [referenceId],
      tags: ["codex-seed", "scripture"],
    },
  };
}

function numberEntry({
  id,
  title,
  subtitle,
  summary,
  meaningFields,
  relations,
  scriptureAnchors = [],
  sourceIds,
  tags,
}: {
  id: Extract<CodexEntryId, `zahl-${number}`>;
  title: string;
  subtitle: string;
  summary: string;
  meaningFields: CodexEntry["meaningFields"];
  relations: CodexRelation[];
  scriptureAnchors?: CodexEntry["scriptureAnchors"];
  sourceIds: string[];
  tags: string[];
}): CodexEntry {
  return {
    id,
    type: "number",
    title,
    subtitle,
    hebrew: null,
    transliteration: null,
    aliases: aliasesFor(id),
    searchTerms: [
      subtitle,
      ...relations.map((relation) => relation.label).filter((label): label is string => Boolean(label)),
    ],
    summary,
    meaningFields,
    relations,
    scriptureAnchors,
    symbolRoomSlug: null,
    journeyIds: [],
    meta: {
      status: "seed",
      source: ["hebrew-letter", "hebrew-word", "meaning-graph", "scripture-reference"],
      sourceIds,
      tags: ["codex-seed", "gematria", "number", ...tags],
      notes: "Manuelles Gematria-Referenzmodell; keine automatische Gematria-Engine.",
    },
  };
}

function generatedHebrewWordEntry(word: (typeof hebrewWords)[number]): CodexEntry {
  const symbolSlug = word.relatedSymbolSlugs.find((slug) => ["wasser", "licht", "feuer", "wueste", "brot"].includes(slug)) ?? null;
  const movement = getGenesisWordMovement(word.id);

  return {
    id: word.id,
    type: "hebrew-word",
    title: word.germanMeaning,
    subtitle: `${word.hebrew} / ${word.transliteration}`,
    hebrew: word.hebrew,
    transliteration: word.transliteration,
    aliases: [word.germanMeaning, word.transliteration, word.hebrew, word.slug],
    searchTerms: [
      word.id,
      word.slug,
      ...word.relatedSymbolSlugs,
      ...word.meaningFields.flatMap((field) => [field.label, ...field.experienceFields]),
    ],
    summary: word.meaningFields
      .slice(0, 3)
      .map((field) => field.description)
      .join(" "),
    meaningFields: uniqueMeaningFields(hebrewMeaningFields(word.id)),
    relations: uniqueRelations([
      ...(symbolSlug
        ? [{
            targetId: symbolSlug,
            type: "symbolizes" as const,
            label: `Nahe hebräische Resonanz im Raum ${findSymbolTitle(symbolSlug)}.`,
            source: "hebrew-word" as const,
          }]
        : []),
      ...word.relatedSymbolSlugs
        .filter((slug) => slug !== symbolSlug)
        .map<CodexRelation>((slug) => ({
          targetId: slug,
          type: "related",
          label: `Wort im selben Bedeutungsfeld: ${findSymbolTitle(slug)}.`,
          source: "hebrew-word",
        })),
      ...word.letterIds.map<CodexRelation>((targetId, index) => ({
        targetId,
        type: "contains-letter",
        label: movement?.letters[index]?.role ?? `Buchstabe ${targetId}`,
        source: "hebrew-letter",
      })),
    ]),
    scriptureAnchors: word.biblicalReferences.map((reference) => ({
      id: reference.id,
      reference: reference.reference,
      label: reference.relation,
      note: reference.context,
      source: "hebrew-word",
    })),
    symbolRoomSlug: symbolSlug,
    journeyIds: [
      ...journeyIdsForSymbol(word.id),
      ...(symbolSlug ? journeyIdsForSymbol(symbolSlug) : []),
    ],
    meta: {
      status: "seed",
      source: ["hebrew-word", "meaning-graph"],
      sourceIds: [word.id, ...(symbolSlug ? [symbolSlug] : [])],
      tags: ["codex-seed", "hebrew-word", "phase-36a", word.id, ...(symbolSlug ? [symbolSlug] : [])],
    },
  };
}

const seededCodexRegistry = [
  minimalMeaningEntry({
    id: "anfang",
    title: "Anfang",
    subtitle: "Ursprung und erster Schritt",
    summary: "Der Anfang markiert im Codex den ersten Raum, in dem Wirklichkeit erzählbar wird.",
    meaningFields: ["birth", "hiddenness"],
  }),
  minimalMeaningEntry({
    id: "schoepfung",
    title: "Schöpfung",
    subtitle: "Werden und Ordnung",
    summary: "Schöpfung beschreibt das Hervortreten von Gestalt aus noch ungeordnetem Raum.",
    meaningFields: ["birth", "life", "guidance"],
  }),
  meaningEntry({
    id: "ursprung",
    title: "Ursprung",
    subtitle: "Der stille Grund, aus dem Anfang lesbar wird",
    summary:
      "Ursprung ist der leise Raum vor der sichtbaren Gestalt: nicht Besitz des Anfangs, sondern Quelle, aus der Wasser, Licht und erste Richtung hervortreten.",
    meaningFields: ["birth", "hiddenness", "presence", "light", "life"],
    relations: [
      { targetId: "genesis-1-1", type: "anchors-scripture", label: "Genesis 1,1 setzt den Anfang als ersten Horizont.", source: "scripture-reference" },
      { targetId: "majim", type: "shares-meaning", label: "Wasser bewahrt den Ursprung als Tiefe vor der Form.", source: "symbol-network" },
      { targetId: "or", type: "shares-meaning", label: "Licht macht den Ursprung erstmals sichtbar.", source: "symbol-network" },
      { targetId: "anfang", type: "related", label: "Der Anfang ist die erste erzählbare Bewegung des Ursprungs.", source: "meaning-graph" },
      { targetId: "aleph", type: "contains-letter", label: "Aleph steht als stiller erster Atem am Ursprung.", source: "hebrew-letter" },
      { targetId: "zahl-1", type: "shares-meaning", label: "Die Eins sammelt Einheit und ersten Impuls.", source: "meaning-graph" },
      { targetId: "or", type: "has-hebrew-word", label: "or / Licht trägt das Sichtbarwerden des Ursprungs.", source: "hebrew-word" },
      { targetId: "majim", type: "has-hebrew-word", label: "majim / Wasser bewahrt die Anfangstiefe.", source: "hebrew-word" },
    ],
    scriptureAnchors: [
      { id: "genesis-1-1", reference: "Genesis 1,1", label: "Im Anfang", note: "Ursprung wird als erster Horizont der Schöpfung lesbar.", source: "scripture-reference" },
    ],
    searchTerms: ["Quellgrund", "Anfangsgrund", "Genesis Ursprung", "Bereschit Ursprung"],
    sourceIds: ["genesis-1-1", "wasser", "licht", "anfang", "aleph", "zahl-1", "or", "majim"],
  }),
  meaningEntry({
    id: "ordnung",
    title: "Ordnung",
    subtitle: "Unterscheidung, Licht und tragende Richtung",
    summary:
      "Ordnung entsteht im SYMBOLRAUM nicht als starres System, sondern als erste Lesbarkeit: Ein Wort trennt nicht kalt, sondern ruft Licht, Richtung und innere Orientierung hervor.",
    meaningFields: ["guidance", "word", "light", "revelation", "awareness"],
    relations: [
      { targetId: "genesis-1-3", type: "anchors-scripture", label: "Genesis 1,3 zeigt Ordnung als gesprochenes Licht.", source: "scripture-reference" },
      { targetId: "or", type: "shares-meaning", label: "Licht lässt Konturen und Unterscheidung hervortreten.", source: "symbol-network" },
      { targetId: "davar", type: "shares-meaning", label: "Das Wort gibt der Ordnung Stimme und Richtung.", source: "meaning-graph" },
      { targetId: "offenbarung", type: "continues-journey", label: "Ordnung wird zur Offenbarung, wo das Verborgene lesbar wird.", source: "meaning-graph" },
      { targetId: "or", type: "has-hebrew-word", label: "or / Licht ist der Wortklang von Sichtbarkeit.", source: "hebrew-word" },
      { targetId: "aleph", type: "contains-letter", label: "Aleph steht im Lichtwort or als stiller Anfang.", source: "hebrew-letter" },
      { targetId: "zahl-1", type: "shares-meaning", label: "Die Eins sammelt die erste ordnende Setzung.", source: "meaning-graph" },
    ],
    scriptureAnchors: [
      { id: "genesis-1-3", reference: "Genesis 1,3", label: "Es werde Licht", note: "Ordnung beginnt als Ruf in die Sichtbarkeit.", source: "scripture-reference" },
    ],
    searchTerms: ["Ausrichtung", "erste Ordnung", "es werde Licht", "Jehi or"],
    sourceIds: ["genesis-1-3", "licht", "wort", "offenbarung", "or", "aleph", "zahl-1"],
  }),
  minimalMeaningEntry({
    id: "himmel",
    title: "Himmel",
    subtitle: "Weite und obere Ordnung",
    summary: "Himmel steht hier als vorbereiteter Zielanker für die erste Unterscheidung von oben und unten.",
    meaningFields: ["guidance", "hiddenness"],
  }),
  minimalMeaningEntry({
    id: "erde",
    title: "Erde",
    subtitle: "Grund und zu formende Welt",
    summary: "Erde steht hier als vorbereiteter Zielanker für die noch zu ordnende Wirklichkeit der Schöpfung.",
    meaningFields: ["life", "hiddenness"],
  }),
  hebrewWordEntry("majim"),
  hebrewWordEntry("or"),
  hebrewWordEntry("esch"),
  hebrewWordEntry("midbar"),
  hebrewWordEntry("lechem"),
  symbolEntry("wasser", "majim"),
  symbolEntry("licht", "or"),
  symbolEntry("feuer", "esch"),
  symbolEntry("wueste", "midbar"),
  symbolEntry("brot", "lechem"),
  meaningEntry({
    id: "tiefe",
    title: "Tiefe",
    subtitle: "Urtiefe, Wasser und verborgene Schwelle",
    summary:
      "Tiefe ist der Raum unter der ersten Lesbarkeit. Sie ist nicht nur Chaos, sondern tragende Verborgenheit: Wasser, Mem und Vierzig halten die Zeit aus, bevor Gestalt sichtbar wird.",
    meaningFields: ["depth", "chaos", "hiddenness", "birth", "transition", "purification"],
    relations: [
      { targetId: "genesis-1-2", type: "anchors-scripture", label: "Genesis 1,2 führt in die Tiefe vor der ersten Ordnung.", source: "scripture-reference" },
      { targetId: "majim", type: "shares-meaning", label: "Wasser trägt im Codex die kosmische und innere Tiefe.", source: "symbol-network" },
      { targetId: "mem", type: "contains-letter", label: "Mem öffnet das Wasserfeld als Buchstabenraum.", source: "hebrew-letter" },
      { targetId: "zahl-40", type: "shares-meaning", label: "Vierzig ist die Schwellenzahl der Tiefe und Wasserzeit.", source: "meaning-graph" },
      { targetId: "majim", type: "has-hebrew-word", label: "majim / Wasser verdichtet die Tiefe sprachlich.", source: "hebrew-word" },
    ],
    scriptureAnchors: [
      { id: "genesis-1-2", reference: "Genesis 1,2", label: "Tiefe und Wasser", note: "Die Tiefe erscheint als noch ungeordneter Anfangsraum.", source: "scripture-reference" },
    ],
    searchTerms: ["Tiefe vor Ordnung", "Wassertiefe", "Mem Tiefe", "Vierzig Tiefe"],
    sourceIds: ["genesis-1-2", "wasser", "mem", "zahl-40", "majim"],
  }),
  minimalMeaningEntry({
    id: "geist",
    title: "Geist",
    subtitle: "Atem und bewegte Gegenwart",
    summary: "Geist bleibt als deutsches Bedeutungsfeld erhalten und verweist auf Ruach als kanonischen Hebrew-Word-Knoten.",
    meaningFields: ["presence", "voice", "life"],
    relations: [
      { targetId: "ruach", type: "has-hebrew-word", label: "Ruach ist die kanonische hebräische Wort-ID für Geist, Wind und Atem.", source: "hebrew-word" },
      { targetId: "majim", type: "related", label: "Genesis 1:2 verbindet Geist und Wasser im Anfangsraum.", source: "scripture-reference" },
    ],
  }),
  {
    id: "ruach",
    type: "hebrew-word",
    title: "Ruach",
    subtitle: "\u05e8\u05d5\u05d7 / ruach",
    hebrew: "\u05e8\u05d5\u05d7",
    transliteration: "ruach",
    aliases: aliasesFor("ruach"),
    searchTerms: [
      "Bewegung",
      "Gegenwart",
      "Offenbarung",
      "Leben",
      "Verbindung",
      "Genesis 1,2",
      "Tehom Ruach Davar Qol Or",
    ],
    summary:
      "Ruach bedeutet Geist, Wind und Atem.\n\nRuach ist unsichtbare Bewegung, die belebt, berührt und Richtung öffnet.\n\nSie wird nicht zuerst gesehen, sondern an ihrer Wirkung erkannt: im Atem, im Ruf, in der Bewegung zwischen Verborgenem und Erscheinendem.",
    meaningFields: uniqueMeaningFields(["presence", "life", "transition", "revelation", "voice", "word", "light"]),
    relations: uniqueRelations([
      { targetId: "tehom", type: "moves-over", label: "Ruach bewegt sich über Tehom, der uranfänglichen Tiefe.", source: "hebrew-word" },
      { targetId: "majim", type: "hovers-over", label: "Ruach schwebt über Majim / Wasser im Anfangsraum.", source: "scripture-reference" },
      { targetId: "davar", type: "carries", label: "Ruach trägt Davar, bevor das Wort hörbar wird.", source: "meaning-graph" },
      { targetId: "qol", type: "gives-voice-to", label: "Ruach gibt der Stimme Atem und Bewegung.", source: "meaning-graph" },
      { targetId: "or", type: "opens-to", label: "Ruach öffnet den Weg in Or / Licht.", source: "meaning-graph" },
      { targetId: "leben", type: "breathes-into", label: "Ruach haucht Leben als Atem und Bewegung ein.", source: "meaning-graph" },
      { targetId: "geist", type: "shares-meaning", label: "Der deutsche Geist-Knoten bleibt Alias- und Bedeutungsbrücke zu Ruach.", source: "meaning-graph" },
      { targetId: "resh", type: "contains-letter", label: "Resh: Haupt, Ursprung und Richtung.", source: "hebrew-letter" },
      { targetId: "vav", type: "contains-letter", label: "Vav: Verbindung, Brücke und Vermittlung.", source: "hebrew-letter" },
      { targetId: "chet", type: "contains-letter", label: "Chet: Leben, Atemraum und innere Bewegung.", source: "hebrew-letter" },
      { targetId: "genesis-1-2", type: "anchors-scripture", label: "Erste Schriftspur: Ruach schwebt über den Wassern.", source: "scripture-reference" },
    ]),
    scriptureAnchors: [
      { id: "genesis-1-2", reference: "Genesis 1,2", label: "Die Ruach Gottes schwebte über den Wassern.", note: "Ruach verbindet Tiefe, Wasser, Bewegung und den Anfang der Offenbarung.", source: "scripture-reference" },
    ],
    symbolRoomSlug: null,
    journeyIds: ["tehom-ruach-davar-qol-or"],
    meta: {
      status: "seed",
      source: ["hebrew-word", "hebrew-letter", "meaning-graph", "scripture-reference"],
      sourceIds: ["ruach", "resh", "vav", "chet", "genesis-1-2", "tehom", "majim", "davar", "qol", "or", "leben"],
      tags: ["codex-seed", "hebrew-word", "ruach", "geist", "wind", "atem", "genesis-achse"],
      notes: "Phase 34E: Ruach als kanonische Hebrew-Word-ID; geist bleibt deutscher Alias-/Brückenknoten.",
    },
  },
  minimalMeaningEntry({
    id: "wort",
    title: "Wort",
    subtitle: "Sprache, Ruf und Ordnung",
    summary: "Wort bezeichnet gesprochenen Sinn, der Richtung gibt und Wirklichkeit ordnet.",
    meaningFields: ["word", "voice", "guidance"],
  }),
  {
    id: "tehom",
    type: "hebrew-word",
    title: "Tehom",
    subtitle: "\u05ea\u05d4\u05d5\u05dd / tehom",
    hebrew: "\u05ea\u05d4\u05d5\u05dd",
    transliteration: "tehom",
    aliases: aliasesFor("tehom"),
    searchTerms: [
      "Ursprung",
      "Verborgenheit",
      "Potential",
      "Wasser",
      "Geburt",
      "Offenbarung",
      "Genesis 1,2",
      "Tehom Davar Qol Or",
    ],
    summary:
      "Tehom bezeichnet die uranfängliche Tiefe.\n\nSie ist nicht Chaos im modernen Sinn, sondern verborgener Raum des Ursprungs: dunkel, offen, noch nicht geordnet.\n\nTehom bewahrt Möglichkeit, bevor Gestalt, Wort und Licht unterscheidbar werden.",
    meaningFields: uniqueMeaningFields(["depth", "hiddenness", "chaos", "birth", "revelation", "word", "voice", "light"]),
    relations: uniqueRelations([
      { targetId: "majim", type: "source-of", label: "Tehom ist Ursprungstiefe vor Majim / Wasser, ohne einfach Wasser zu sein.", source: "hebrew-word" },
      { targetId: "ruach", type: "stirred-by", label: "Tehom wird von Ruach als unsichtbarer Bewegung berührt.", source: "hebrew-word" },
      { targetId: "davar", type: "gives-rise-to", label: "Aus der Tiefe erhebt sich Davar / Wort.", source: "hebrew-word" },
      { targetId: "midbar", type: "echoes-within", label: "Tehom hallt im Midbar als verborgener Raum des Hörens nach.", source: "hebrew-word" },
      { targetId: "or", type: "precedes", label: "Tehom steht vor Or / Licht als verborgener Anfang.", source: "hebrew-word" },
      { targetId: "mem", type: "expressed-through", label: "Das finale Mem bewahrt Tiefe, Wasser und verborgene Fülle.", source: "hebrew-letter" },
      { targetId: "tav", type: "contains-letter", label: "Tav: Zeichen, Vollendung und Siegel.", source: "hebrew-letter" },
      { targetId: "he", type: "contains-letter", label: "He: Atem, Offenheit und Fenster.", source: "hebrew-letter" },
      { targetId: "vav", type: "contains-letter", label: "Vav: Verbindung, Brücke und Vermittlung.", source: "hebrew-letter" },
      { targetId: "mem", type: "contains-letter", label: "Mem Sofit: Tiefe, Wasser und verborgene Fülle.", source: "hebrew-letter" },
      { targetId: "genesis-1-2", type: "anchors-scripture", label: "Erste Schriftspur: Finsternis liegt auf der Tiefe.", source: "scripture-reference" },
      { targetId: "ursprung", type: "shares-meaning", label: "Tehom bewahrt den Ursprung vor sichtbarer Gestalt.", source: "meaning-graph" },
      { targetId: "tehom", type: "shares-meaning", label: "Tehom ist der hebräische Ursprungsknoten der Tiefe.", source: "meaning-graph" },
      { targetId: "verborgenheit", type: "shares-meaning", label: "Tehom ist Verborgenheit vor der Offenbarung.", source: "meaning-graph" },
      { targetId: "geburt", type: "shares-meaning", label: "Aus der Tiefe kann Gestalt hervortreten.", source: "meaning-graph" },
      { targetId: "offenbarung", type: "shares-meaning", label: "Offenbarung beginnt in der Verborgenheit.", source: "meaning-graph" },
    ]),
    scriptureAnchors: [
      { id: "genesis-1-2", reference: "Genesis 1,2", label: "Und Finsternis lag auf der Tiefe.", note: "Die Tiefe erscheint vor Ordnung, Trennung und Licht.", source: "scripture-reference" },
    ],
    symbolRoomSlug: null,
    journeyIds: ["tehom-davar-qol-or", "tehom-ruach-davar-qol-or"],
    meta: {
      status: "seed",
      source: ["hebrew-word", "hebrew-letter", "meaning-graph", "scripture-reference"],
      sourceIds: ["tehom", "tav", "he", "vav", "mem", "genesis-1-2", "majim", "ruach", "davar", "midbar", "or"],
      tags: ["codex-seed", "hebrew-word", "tehom", "ursprungsknoten", "tiefe", "vor-dem-licht"],
      notes: "Phase 34C: Tehom als Ursprungsknoten der Tiefe aktiviert.",
    },
  },
  {
    id: "davar",
    type: "hebrew-word",
    title: "Davar",
    subtitle: "דבר / davar",
    hebrew: "דבר",
    transliteration: "davar",
    aliases: aliasesFor("davar"),
    searchTerms: [
      "Wort",
      "Sache",
      "Ereignis",
      "Wirklichkeit",
      "Sprache",
      "Ruf",
      "Begegnung",
      "Schöpfung",
      "Ordnung",
      "Midbar",
      "מדבר",
    ],
    summary:
      "Davar bedeutet Wort, Sache, Ereignis und Wirklichkeit.\n\nIm hebräischen Denken ist das Wort nicht bloße Information. Ein Davar geschieht. Es bringt hervor, ordnet und offenbart.\n\nDarum entsteht Licht durch das Wort, der Mensch lebt vom Wort, und im Herzen der Wüste verbirgt sich das Wort bereits.",
    meaningFields: uniqueMeaningFields(["word", "revelation", "guidance", "calling", "presence", "light", "nourishment"]),
    relations: uniqueRelations([
      { targetId: "or", type: "reveals", label: "Davar ruft Or / Licht in die Sichtbarkeit.", source: "hebrew-word" },
      { targetId: "qol", type: "expressed-through", label: "Davar wird durch Qol als Stimme hörbar.", source: "hebrew-word" },
      { targetId: "ruach", type: "moves-through", label: "Davar bewegt sich durch Ruach als Atem- und Geistbrücke.", source: "meaning-graph" },
      { targetId: "midbar", type: "hidden-within", label: "Im Wort Midbar bleibt Davar im Wüstenraum verborgen.", source: "hebrew-word" },
      { targetId: "lechem", type: "nourishes-as", label: "Das Wort nährt als innere Nahrung jenseits des Brotes.", source: "hebrew-word" },
      { targetId: "offenbarung", type: "shares-meaning", label: "Davar macht Verborgenes als Offenbarung lesbar.", source: "meaning-graph" },
      { targetId: "schoepfung", type: "shares-meaning", label: "Davar bringt hervor und ordnet den Anfang.", source: "meaning-graph" },
      { targetId: "ordnung", type: "shares-meaning", label: "Davar gibt dem offenen Raum Richtung und Gestalt.", source: "meaning-graph" },
      { targetId: "davar", type: "shares-meaning", label: "Davar ist der hebräische Wortkörper dieser Bedeutungsachse.", source: "hebrew-word" },
      { targetId: "begegnung", type: "related", label: "Davar wird hörbar, wo Begegnung geschieht.", source: "meaning-graph" },
      { targetId: "dalet", type: "contains-letter", label: "Dalet: Schwelle, Tür und Eintritt.", source: "hebrew-letter" },
      { targetId: "bet", type: "contains-letter", label: "Bet: Haus, Innenraum und Empfang.", source: "hebrew-letter" },
      { targetId: "resh", type: "contains-letter", label: "Resh: Haupt, Anfang und Ausrichtung.", source: "hebrew-letter" },
      { targetId: "genesis-1-3", type: "anchors-scripture", label: "Genesis 1,3: Licht entsteht durch das Wort.", source: "scripture-reference" },
      { targetId: "deuteronomy-8-3", type: "anchors-scripture", label: "Deuteronomium 8,3: Der Mensch lebt vom Wort.", source: "scripture-reference" },
    ]),
    scriptureAnchors: [
      { id: "genesis-1-3", reference: "Genesis 1,3", label: "Es werde Licht", note: "Licht entsteht durch das Wort.", source: "scripture-reference" },
      { id: "deuteronomy-8-3", reference: "Deuteronomium 8,3", label: "Nicht vom Brot allein", note: "Der Mensch lebt vom Wort als tieferer Nahrung.", source: "scripture-reference" },
    ],
    symbolRoomSlug: null,
    journeyIds: ["davar-qol-or", "tehom-davar-qol-or", "tehom-ruach-davar-qol-or"],
    meta: {
      status: "seed",
      source: ["hebrew-word", "hebrew-letter", "meaning-graph", "scripture-reference"],
      sourceIds: ["davar", "root-d-b-r", "dalet", "bet", "resh", "ruach", "genesis-1-3", "deuteronomy-8-3"],
      tags: ["codex-seed", "hebrew-word", "davar", "word-resonance", "midbar"],
      notes: "Phase 34B: Davar ist mit Qol als hörbar gewordenem Wort verbunden; die grosse Tehom-Achse bleibt vorbereitet.",
    },
  },
  {
    id: "qol",
    type: "hebrew-word",
    title: "Qol",
    subtitle: "קול / qol",
    hebrew: "קול",
    transliteration: "qol",
    aliases: aliasesFor("qol"),
    searchTerms: [
      "Stimme",
      "Klang",
      "Ruf",
      "Hören",
      "Offenbarung",
      "Führung",
      "Gegenwart",
      "Begegnung",
      "Wahrnehmung",
      "Midbar",
      "Davar",
      "Or",
      "קול",
      "מדבר",
    ],
    summary:
      "Qol bedeutet Stimme, Klang, Ruf oder hörbare Gegenwart.\n\nIm biblischen Denken ist die Stimme mehr als ein Geräusch. Sie ist das hörbar gewordene Wort.\n\nDie Stimme verbindet das Verborgene mit dem Offenbaren. Sie ruft, führt und eröffnet einen Weg.\n\nDarum begegnet der Mensch Gott oft zuerst durch eine Stimme, bevor er versteht, was gesprochen wird.",
    meaningFields: uniqueMeaningFields(["voice", "word", "revelation", "calling", "guidance", "presence", "awareness", "path", "light", "desert"]),
    relations: uniqueRelations([
      { targetId: "davar", type: "expresses", label: "Qol drückt Davar als hörbar gewordenes Wort aus.", source: "hebrew-word" },
      { targetId: "or", type: "leads-to", label: "Qol führt zu Or / Licht, weil gehörte Stimme Orientierung sichtbar macht.", source: "hebrew-word" },
      { targetId: "midbar", type: "heard-within", label: "Qol wird im Midbar, im entleerten Raum der Wüste, hörbar.", source: "hebrew-word" },
      { targetId: "ruach", type: "carried-by", label: "Qol wird von Ruach als Atem und bewegte Gegenwart getragen.", source: "meaning-graph" },
      { targetId: "geist", type: "shares-meaning", label: "Geist bleibt als deutscher Bedeutungsanker für Ruach lesbar.", source: "meaning-graph" },
      { targetId: "offenbarung", type: "shares-meaning", label: "Qol verbindet Stimme mit dem Hervortreten des Verborgenen.", source: "meaning-graph" },
      { targetId: "davar", type: "shares-meaning", label: "Qol ist das hörbar gewordene Wort.", source: "meaning-graph" },
      { targetId: "midbar", type: "shares-meaning", label: "Die Wüste wird zum Raum, in dem Qol gehört werden kann.", source: "symbol-network" },
      { targetId: "qof", type: "contains-letter", label: "Qof: Horizont, Grenze und Ruf aus der Ferne.", source: "hebrew-letter" },
      { targetId: "vav", type: "contains-letter", label: "Vav: Verbindung, Träger und Vermittlung.", source: "hebrew-letter" },
      { targetId: "lamed", type: "contains-letter", label: "Lamed: Ausrichtung, Lernen und Empfangen.", source: "hebrew-letter" },
    ]),
    scriptureAnchors: [],
    symbolRoomSlug: null,
    journeyIds: ["davar-qol-or", "tehom-davar-qol-or", "tehom-ruach-davar-qol-or"],
    meta: {
      status: "seed",
      source: ["hebrew-word", "hebrew-letter", "meaning-graph"],
      sourceIds: ["qol", "qof", "vav", "lamed", "davar", "ruach", "or", "midbar", "geist"],
      tags: ["codex-seed", "hebrew-word", "qol", "voice-resonance", "midbar", "davar-qol-or"],
      notes: "Phase 34B: Qol als Resonanzknoten nach Davar. Scripture-Anker 1 Samuel 3, Exodus 19 und 1 Könige 19 werden erst verknüpft, wenn entsprechende Anchor-IDs existieren.",
    },
  },
  meaningEntry({
    id: "offenbarung",
    title: "Offenbarung",
    subtitle: "Licht, das Verborgenes lesbar macht",
    summary:
      "Offenbarung ist kein lauter Effekt, sondern ein stilles Hervortreten: Licht berührt das Verborgene, Aleph gibt ihm ersten Atem, und die Eins sammelt es in eine sichtbare Spur.",
    meaningFields: ["revelation", "light", "awareness", "presence", "word"],
    relations: [
      { targetId: "or", type: "shares-meaning", label: "Im Licht wird das Verborgene sichtbar.", source: "meaning-graph" },
      { targetId: "aleph", type: "contains-letter", label: "Aleph steht als stiller Anfang im Lichtwort or.", source: "hebrew-letter" },
      { targetId: "zahl-1", type: "shares-meaning", label: "Die Eins sammelt den ersten Impuls des Sichtbarwerdens.", source: "meaning-graph" },
      { targetId: "genesis-1-3", type: "anchors-scripture", label: "Genesis 1,3 ruft Licht in die Sichtbarkeit.", source: "scripture-reference" },
      { targetId: "or", type: "has-hebrew-word", label: "or / Licht ist das hebräische Wortfeld der Offenbarung.", source: "hebrew-word" },
    ],
    scriptureAnchors: [
      { id: "genesis-1-3", reference: "Genesis 1,3", label: "Licht wird", note: "Offenbarung erscheint als gerufenes Licht.", source: "scripture-reference" },
    ],
    searchTerms: ["Enthüllung", "Lichtoffenbarung", "Aleph Licht", "Genesis Licht"],
    sourceIds: ["licht", "aleph", "zahl-1", "genesis-1-3", "or"],
  }),
  meaningEntry({
    id: "reinigung",
    title: "Reinigung",
    subtitle: "Klärung durch Wasser und Feuer",
    summary:
      "Reinigung meint im SYMBOLRAUM keine Auslöschung, sondern eine Klärung des Wesentlichen. Wasser löst und trägt, Feuer läutert und macht sichtbar, was bleiben kann.",
    meaningFields: ["purification", "fire", "transition", "life"],
    relations: [
      { targetId: "majim", type: "shares-meaning", label: "Wasser trägt Reinigung als Waschen, Geburt und Übergang.", source: "symbol-network" },
      { targetId: "esch", type: "shares-meaning", label: "Feuer trägt Reinigung als Läuterung und Freilegung.", source: "symbol-network" },
      { targetId: "genesis-1-2", type: "anchors-scripture", label: "Die Wasser des Anfangs bewahren den Raum vor neuer Ordnung.", source: "scripture-reference" },
      { targetId: "mem", type: "contains-letter", label: "Mem verbindet Reinigung mit Wasser und Schwelle.", source: "hebrew-letter" },
      { targetId: "aleph", type: "contains-letter", label: "Aleph steht im Feuerwort esh als erster Atem der Läuterung.", source: "hebrew-letter" },
      { targetId: "zahl-40", type: "shares-meaning", label: "Vierzig kann als Zeit der Klärung und Vorbereitung gelesen werden.", source: "meaning-graph" },
      { targetId: "majim", type: "has-hebrew-word", label: "majim / Wasser trägt die reinigende Schwelle.", source: "hebrew-word" },
      { targetId: "esch", type: "has-hebrew-word", label: "esch / Feuer trägt die läuternde Kraft.", source: "hebrew-word" },
    ],
    scriptureAnchors: [
      { id: "genesis-1-2", reference: "Genesis 1,2", label: "Wasser vor Ordnung", note: "Reinigung beginnt als tragender Raum vor neuer Gestalt.", source: "scripture-reference" },
      { id: "malachi-3-2-3", reference: "Maleachi 3,2-3", label: "Läuterndes Feuer", note: "Feuer klärt, ohne das Wesentliche zu vernichten.", source: "scripture-reference" },
    ],
    searchTerms: ["Waschung", "Feuer Reinigung", "Wasser Reinigung", "Mem Reinigung"],
    sourceIds: ["wasser", "feuer", "genesis-1-2", "malachi-3-2-3", "mem", "aleph", "zahl-40", "majim", "esch"],
  }),
  meaningEntry({
    id: "uebergang",
    title: "Übergang",
    subtitle: "Wasser als Schwelle und Durchgang",
    summary:
      "Übergang ist die stille Schwelle zwischen altem Zustand und neuem Weg. Wasser trennt, trägt und öffnet: Im Durchgang bleibt die Tiefe gegenwärtig, und doch beginnt dahinter eine andere Richtung.",
    meaningFields: ["transition", "depth", "desert", "guidance", "birth"],
    relations: [
      { targetId: "majim", type: "shares-meaning", label: "Wasser trägt den Übergang als Grenze und Durchgang.", source: "symbol-network" },
      { targetId: "exodus-14", type: "anchors-scripture", label: "Exodus 14 zeigt Wasser als Schwelle zwischen Knechtschaft und Weg.", source: "scripture-reference" },
      { targetId: "tehom", type: "shares-meaning", label: "Die Tiefe bleibt im Übergang nicht fern, sondern wird begehbare Schwelle.", source: "meaning-graph" },
      { targetId: "midbar", type: "continues-journey", label: "Hinter dem Wasser beginnt der offene Weg der Wüste.", source: "symbol-network" },
      { targetId: "pattern-schwelle-durch-wasser", type: "related", label: "Das Muster sammelt Wasser als Grenze, Durchgang und Neuwerden.", source: "meaning-graph" },
    ],
    scriptureAnchors: [
      { id: "exodus-14", reference: "Exodus 14", label: "Durchzug am Meer", note: "Wasser wird Grenze und Weg zugleich.", source: "scripture-reference" },
    ],
    searchTerms: ["Wasser Schwelle", "Durchgang", "Passage", "Exodus Übergang", "Weg durch Wasser"],
    sourceIds: ["wasser", "exodus-14", "tiefe", "wueste", "pattern-schwelle-durch-wasser"],
  }),
  meaningEntry({
    id: "geburt",
    title: "Geburt",
    subtitle: "Hervorkommen aus Tiefe in neuen Zustand",
    summary:
      "Geburt meint hier das Hervortreten eines neuen Zustands. Wasser ist Anfangsraum und Schwelle: Aus der Tiefe kommt Gestalt, aus dem Durchgang ein Weg, ohne den Ursprung eng zu machen.",
    meaningFields: ["birth", "depth", "hiddenness", "transition", "life"],
    relations: [
      { targetId: "majim", type: "shares-meaning", label: "Wasser bewahrt Geburt als Anfang, Tiefe und Neuwerden.", source: "symbol-network" },
      { targetId: "genesis-1-2", type: "anchors-scripture", label: "Genesis 1,2 zeigt die Tiefe als Möglichkeit vor Gestalt.", source: "scripture-reference" },
      { targetId: "exodus-14", type: "anchors-scripture", label: "Exodus 14 macht den Durchgang als Geburt eines Weges lesbar.", source: "scripture-reference" },
      { targetId: "ursprung", type: "shares-meaning", label: "Ursprung bleibt der stille Grund, aus dem Anfang hervorkommt.", source: "meaning-graph" },
      { targetId: "pattern-schwelle-durch-wasser", type: "related", label: "Die Schwelle durch Wasser verbindet Grenze und Neuwerdung.", source: "meaning-graph" },
    ],
    scriptureAnchors: [
      { id: "genesis-1-2", reference: "Genesis 1,2", label: "Wasser vor Gestalt", note: "Der Anfang liegt noch in Tiefe und Möglichkeit.", source: "scripture-reference" },
      { id: "exodus-14", reference: "Exodus 14", label: "Geburt eines Weges", note: "Der Durchzug öffnet einen neuen Zustand.", source: "scripture-reference" },
    ],
    searchTerms: ["Neugeburt", "Hervorkommen", "Wasser Geburt", "Anfang aus Tiefe", "Geburt eines Weges"],
    sourceIds: ["wasser", "genesis-1-2", "exodus-14", "ursprung", "pattern-schwelle-durch-wasser"],
  }),
  meaningEntry({
    id: "verborgenheit",
    title: "Verborgenheit",
    subtitle: "Bedeckte Tiefe vor Sichtbarkeit",
    summary:
      "Verborgenheit ist die bedeckende Tiefe, in der Form noch nicht offenbar ist. Wasser hält Möglichkeit vor Sichtbarkeit: nicht leer, sondern schützend dunkel, Ursprung vor dem ersten Hervortreten.",
    meaningFields: ["hiddenness", "depth", "birth", "revelation"],
    relations: [
      { targetId: "majim", type: "shares-meaning", label: "Wasser trägt Verborgenheit als bedeckende Tiefe.", source: "symbol-network" },
      { targetId: "tehom", type: "shares-meaning", label: "Tiefe sammelt das Noch-nicht-Sichtbare vor der ersten Form.", source: "meaning-graph" },
      { targetId: "genesis-1-2", type: "anchors-scripture", label: "Genesis 1,2 bewahrt Ursprung als Wasser, Tiefe und Dunkel.", source: "scripture-reference" },
      { targetId: "ursprung", type: "shares-meaning", label: "Ursprung liegt vor der sichtbaren Gestalt.", source: "meaning-graph" },
      { targetId: "offenbarung", type: "continues-journey", label: "Offenbarung beginnt, wenn Verborgenes lesbar hervortritt.", source: "meaning-graph" },
    ],
    scriptureAnchors: [
      { id: "genesis-1-2", reference: "Genesis 1,2", label: "Tiefe und Finsternis", note: "Möglichkeit liegt noch unter der sichtbaren Form.", source: "scripture-reference" },
    ],
    searchTerms: ["verborgene Tiefe", "Möglichkeit", "vor Sichtbarkeit", "Genesis Verborgenheit", "Ursprung verborgen"],
    sourceIds: ["wasser", "tiefe", "genesis-1-2", "ursprung", "offenbarung"],
  }),
  meaningEntry({
    id: "wandlung",
    title: "Wandlung",
    subtitle: "Übergang durch Wasser, Wüste und Feuer",
    summary:
      "Wandlung ist der Weg, auf dem ein innerer Zustand seine alte Form verliert und eine neue Gestalt empfängt. Wasser führt durch die Schwelle, Wüste entzieht Sicherheiten, Feuer verwandelt das Verborgene in Gegenwart.",
    meaningFields: ["transformation", "transition", "desert", "fire", "purification", "guidance", "hiddenness"],
    relations: [
      { targetId: "majim", type: "transforms", label: "Wasser macht Wandlung als Durchgang und Neugeburt erfahrbar.", source: "symbol-network" },
      { targetId: "midbar", type: "transforms", label: "Die Wüste verwandelt durch Reduktion, Mangel und neues Hören.", source: "symbol-network" },
      { targetId: "esch", type: "transforms", label: "Feuer verwandelt, indem es Energie, Ruf und Läuterung freilegt.", source: "symbol-network" },
      { targetId: "genesis-1-2", type: "anchors-scripture", label: "Vor der Ordnung liegt ein Zustand, der verwandelt werden kann.", source: "scripture-reference" },
      { targetId: "genesis-1-3", type: "continues-journey", label: "Wandlung führt aus der Tiefe in sichtbare Orientierung.", source: "scripture-reference" },
      { targetId: "mem", type: "contains-letter", label: "Mem hält Wandlung als Wasser- und Schwellenzeichen.", source: "hebrew-letter" },
      { targetId: "zahl-40", type: "shares-meaning", label: "Vierzig markiert im Codex die Zeit der Passage.", source: "meaning-graph" },
      { targetId: "majim", type: "has-hebrew-word", label: "majim / Wasser trägt den Übergang.", source: "hebrew-word" },
      { targetId: "midbar", type: "has-hebrew-word", label: "midbar / Wüste trägt den Wandlungsweg der Leere.", source: "hebrew-word" },
      { targetId: "esch", type: "has-hebrew-word", label: "esch / Feuer trägt die verwandelnde Energie.", source: "hebrew-word" },
    ],
    scriptureAnchors: [
      { id: "genesis-1-2", reference: "Genesis 1,2", label: "Tiefe vor Gestalt", note: "Wandlung beginnt im noch ungeordneten Zwischenraum.", source: "scripture-reference" },
      { id: "genesis-1-3", reference: "Genesis 1,3", label: "Licht wird", note: "Aus der Wandlung tritt Orientierung hervor.", source: "scripture-reference" },
      { id: "deuteronomy-8", reference: "Deuteronomium 8", label: "Wüstenweg", note: "Der Weg durch die Wüste wird als Lern- und Wandlungsraum erinnert.", source: "scripture-reference" },
    ],
    searchTerms: ["Wandlungsweg", "Übergang", "Passage", "Wüstenweg", "Feuerwandlung"],
    sourceIds: ["wasser", "wueste", "feuer", "genesis-1-2", "genesis-1-3", "deuteronomy-8", "mem", "zahl-40", "majim", "midbar", "esch"],
  }),
  journeyEntry({
    id: "journey-chaos-ordnung",
    title: "Chaos und Ordnung",
    subtitle: "Vom ungeformten Anfang zur lesbaren Richtung",
    summary:
      "Dieser Bedeutungspfad führt von der Tiefe des Anfangs über Wasser und Geist zum Wort, das Licht und Ordnung hervorruft. Chaos erscheint dabei nicht als Gegenwelt, sondern als Schwelle, an der neue Lesbarkeit beginnt.",
    meaningFields: ["chaos", "depth", "transition", "word", "light", "guidance", "revelation"],
    relations: [
      { targetId: "tehom", type: "shares-meaning", label: "Die Tiefe sammelt den ungeformten Anfang.", source: "meaning-graph" },
      { targetId: "majim", type: "shares-meaning", label: "Wasser trägt das Chaos als bewegte Ursprungstiefe.", source: "symbol-network" },
      { targetId: "geist", type: "continues-journey", label: "Der Geist bewegt sich über der Tiefe.", source: "scripture-reference" },
      { targetId: "davar", type: "continues-journey", label: "Das Wort ruft Richtung in den offenen Raum.", source: "meaning-graph" },
      { targetId: "ordnung", type: "continues-journey", label: "Ordnung wird als erste Lesbarkeit sichtbar.", source: "meaning-graph" },
      { targetId: "genesis-1-2", type: "anchors-scripture", label: "Genesis 1,2 zeigt die Tiefe vor der ersten Ordnung.", source: "scripture-reference" },
      { targetId: "genesis-1-3", type: "anchors-scripture", label: "Genesis 1,3 führt vom Wort zum Licht.", source: "scripture-reference" },
    ],
    scriptureAnchors: [
      { id: "genesis-1-2", reference: "Genesis 1,2", label: "Tiefe vor Ordnung", note: "Der Pfad beginnt im wüsten und leeren Zwischenraum.", source: "scripture-reference" },
      { id: "genesis-1-3", reference: "Genesis 1,3", label: "Es werde Licht", note: "Ordnung wird als gerufenes Licht lesbar.", source: "scripture-reference" },
    ],
    searchTerms: ["Chaos Ordnung Pfad", "Tiefe Licht Sequenz", "Genesis Ordnungspfad", "Bedeutungspfad Anfangstiefe"],
    sourceIds: ["tiefe", "wasser", "geist", "wort", "ordnung", "genesis-1-2", "genesis-1-3"],
    steps: [
      { id: "chaos-ordnung-1", label: "Tiefe", codexId: "tiefe", description: "Der Pfad beginnt im noch ungeformten Raum vor der ersten Unterscheidung." },
      { id: "chaos-ordnung-2", label: "Wasser", codexId: "wasser", description: "Wasser hält Bewegung, Ursprung und offene Möglichkeit zusammen." },
      { id: "chaos-ordnung-3", label: "Geist", codexId: "geist", description: "Der Geist markiert Gegenwart, die über der Tiefe in Bewegung kommt." },
      { id: "chaos-ordnung-4", label: "Wort", codexId: "wort", description: "Das Wort gibt dem offenen Raum Stimme und Richtung." },
      { id: "chaos-ordnung-5", label: "Ordnung", codexId: "ordnung", description: "Ordnung erscheint als lesbare Gestalt, nicht als starre Kontrolle." },
    ],
  }),
  journeyEntry({
    id: "journey-wasser-geist",
    title: "Wasser und Geist",
    subtitle: "Bewegte Gegenwart über der Tiefe",
    summary:
      "Dieser Pfad folgt der Verbindung von Wasser, Tiefe, Mem und Geist. Er liest Wasser als tragenden Zwischenraum und Geist als bewegte Gegenwart, die nicht aus der Tiefe flieht, sondern an ihrer Schwelle neues Leben vorbereitet.",
    meaningFields: ["depth", "chaos", "presence", "voice", "life", "transition", "hiddenness"],
    relations: [
      { targetId: "majim", type: "shares-meaning", label: "Wasser ist der Grundraum dieser Spur.", source: "symbol-network" },
      { targetId: "tehom", type: "shares-meaning", label: "Die Tiefe macht den Wasserraum als verborgenes Werden lesbar.", source: "meaning-graph" },
      { targetId: "geist", type: "continues-journey", label: "Geist wird über den Wassern als bewegte Gegenwart sichtbar.", source: "scripture-reference" },
      { targetId: "mem", type: "contains-letter", label: "Mem verdichtet Wasser, Tiefe und Werden im Buchstabenraum.", source: "hebrew-letter" },
      { targetId: "genesis-1-2", type: "anchors-scripture", label: "Genesis 1,2 verbindet Wasser und Geist im Anfangsraum.", source: "scripture-reference" },
      { targetId: "matthew-3-13-17", type: "anchors-scripture", label: "Die Taufe öffnet Wasser als Schwelle neuer Ausrichtung.", source: "scripture-reference" },
    ],
    scriptureAnchors: [
      { id: "genesis-1-2", reference: "Genesis 1,2", label: "Geist über den Wassern", note: "Wasser und Geist stehen gemeinsam am Anfang der Lesbarkeit.", source: "scripture-reference" },
      { id: "matthew-3-13-17", reference: "Matthaeus 3,13-17", label: "Taufe Jesu", note: "Wasser wird zur Schwelle, an der Geist und Stimme hervortreten.", source: "scripture-reference" },
    ],
    searchTerms: ["Wasser Geist Spur", "Ruach Wasser Sequenz", "Mem Geist Spur", "Taufe Bedeutungsspur"],
    sourceIds: ["wasser", "tiefe", "geist", "mem", "genesis-1-2", "matthew-3-13-17"],
    steps: [
      { id: "wasser-geist-1", label: "Wasser", codexId: "wasser", description: "Wasser trägt den Anfang als Tiefe, Schwelle und Möglichkeit." },
      { id: "wasser-geist-2", label: "Tiefe", codexId: "tiefe", description: "Die Tiefe bewahrt das noch Ungesagte unter der sichtbaren Oberfläche." },
      { id: "wasser-geist-3", label: "Mem", codexId: "mem", description: "Mem bindet Wasser, Werden und verborgene Schwelle an den Buchstabenraum." },
      { id: "wasser-geist-4", label: "Geist", codexId: "geist", description: "Geist bringt Bewegung und Gegenwart in den Wasserraum." },
      { id: "wasser-geist-5", label: "Genesis 1,2", codexId: "genesis-1-2", description: "Der Vers verankert die Spur im Anfangsbild von Wasser und Geist." },
    ],
  }),
  journeyEntry({
    id: "journey-wueste-offenbarung",
    title: "Wüste und Offenbarung",
    subtitle: "Reduktion, Ruf und Sichtbarwerden",
    summary:
      "Dieser Bedeutungspfad liest die Wüste als Raum der Reduktion: Sicherheiten werden entzogen, Stimme und Abhängigkeit werden hörbar, und Offenbarung tritt nicht als Flucht aus der Leere hervor, sondern mitten in ihr.",
    meaningFields: ["desert", "lack", "testing", "dependence", "trust", "voice", "revelation", "presence", "guidance"],
    relations: [
      { targetId: "midbar", type: "shares-meaning", label: "Die Wüste bildet den Erfahrungsraum der Reduktion.", source: "symbol-network" },
      { targetId: "wandlung", type: "continues-journey", label: "Wandlung geschieht im Entzug alter Sicherheiten.", source: "meaning-graph" },
      { targetId: "davar", type: "continues-journey", label: "In der Wüste wird Hören zur Orientierung.", source: "meaning-graph" },
      { targetId: "esch", type: "continues-journey", label: "Feuer zeigt Gegenwart als Ruf und Läuterung.", source: "symbol-network" },
      { targetId: "offenbarung", type: "continues-journey", label: "Offenbarung macht das Verborgene im Weg sichtbar.", source: "meaning-graph" },
      { targetId: "deuteronomy-8", type: "anchors-scripture", label: "Deuteronomium 8 erinnert die Wüste als Lernraum.", source: "scripture-reference" },
      { targetId: "exodus-3-2", type: "anchors-scripture", label: "Der Dornbusch zeigt Offenbarung im Wüstenraum.", source: "scripture-reference" },
    ],
    scriptureAnchors: [
      { id: "deuteronomy-8", reference: "Deuteronomium 8", label: "Wüstenweg", note: "Die Wüste wird als Schule von Vertrauen, Mangel und Erinnerung gelesen.", source: "scripture-reference" },
      { id: "exodus-3-2", reference: "Exodus 3,2", label: "Brennender Dornbusch", note: "Feuer und Ruf machen Gegenwart sichtbar, ohne den Ort zu verbrauchen.", source: "scripture-reference" },
    ],
    searchTerms: ["Wüste Offenbarung Spur", "Dornbusch Spur", "Reduktion Ruf Weg", "Midbar Offenbarungsspur"],
    sourceIds: ["wueste", "wandlung", "wort", "feuer", "offenbarung", "deuteronomy-8", "exodus-3-2"],
    steps: [
      { id: "wueste-offenbarung-1", label: "Wüste", codexId: "wueste", description: "Die Wüste reduziert das Sichtbare und macht innere Orientierung notwendig." },
      { id: "wueste-offenbarung-2", label: "Wandlung", codexId: "wandlung", description: "Im Entzug kann sich die alte Form lösen und eine neue Richtung bilden." },
      { id: "wueste-offenbarung-3", label: "Wort", codexId: "wort", description: "Das Wort wird im leeren Raum zur hörbaren Spur." },
      { id: "wueste-offenbarung-4", label: "Feuer", codexId: "feuer", description: "Feuer lässt Gegenwart als Ruf, Energie und Läuterung hervortreten." },
      { id: "wueste-offenbarung-5", label: "Offenbarung", codexId: "offenbarung", description: "Offenbarung sammelt den Weg in eine sichtbare, lesbare Gegenwart." },
    ],
  }),
  {
    id: "davar-qol-or",
    type: "journey",
    title: "Vom Wort zum Licht",
    subtitle: "Das Wort wird Stimme. Die Stimme wird Licht.",
    hebrew: null,
    transliteration: null,
    aliases: aliasesFor("davar-qol-or"),
    searchTerms: ["Davar Qol Or", "Wort Stimme Licht", "Vom Wort zum Licht", "קול", "דבר", "אור"],
    summary: "Das Wort wird Stimme. Die Stimme wird Licht.",
    meaningFields: uniqueMeaningFields(["word", "voice", "revelation", "calling", "guidance", "presence", "light"]),
    relations: uniqueRelations([
      { targetId: "davar", type: "continues-journey", label: "Der Pfad beginnt beim Wort als wirksamer Wirklichkeit.", source: "journey" },
      { targetId: "qol", type: "continues-journey", label: "Das Wort wird als Stimme hörbar.", source: "journey" },
      { targetId: "or", type: "continues-journey", label: "Die Stimme führt in Licht und Sichtbarkeit.", source: "journey" },
    ]),
    steps: [
      { id: "davar-qol-or-1", label: "Davar", codexId: "davar", description: "Das Wort trägt Wirklichkeit, Ruf und Ordnung." },
      { id: "davar-qol-or-2", label: "Qol", codexId: "qol", description: "Die Stimme macht das Wort hörbar." },
      { id: "davar-qol-or-3", label: "Or", codexId: "or", description: "Das Licht macht die gehörte Richtung sichtbar." },
    ],
    scriptureAnchors: [
      { id: "genesis-1-3", reference: "Genesis 1,3", label: "Es werde Licht", note: "Das Wort führt zur Sichtbarkeit des Lichts.", source: "scripture-reference" },
    ],
    symbolRoomSlug: null,
    journeyIds: ["davar-qol-or"],
    meta: {
      status: "seed",
      source: ["journey", "hebrew-word", "meaning-graph", "scripture-reference"],
      sourceIds: ["davar", "qol", "or", "genesis-1-3"],
      tags: ["codex-seed", "journey", "davar-qol-or", "wort-stimme-licht"],
      notes: "Phase 34B: Kleine Journey aktiviert, weil Davar, Qol und Or vorhanden sind. Tehom bleibt für eine spätere grosse Achse vorbereitet.",
    },
  },
  {
    id: "tehom-davar-qol-or",
    type: "journey",
    title: "Von der Tiefe zum Licht",
    subtitle: "Die Tiefe birgt das Wort. Das Wort wird Stimme. Die Stimme wird Licht.",
    hebrew: null,
    transliteration: null,
    aliases: aliasesFor("tehom-davar-qol-or"),
    searchTerms: [
      "\u05ea\u05d4\u05d5\u05dd",
      "\u05d3\u05d1\u05e8",
      "\u05e7\u05d5\u05dc",
      "\u05d0\u05d5\u05e8",
    ],
    summary:
      "Vor dem Licht\n\n\u05ea\u05d4\u05d5\u05dd\n\u2193\n\u05d3\u05d1\u05e8\n\u2193\n\u05e7\u05d5\u05dc\n\u2193\n\u05d0\u05d5\u05e8\n\nBevor Licht sichtbar wird, spricht die Schrift von der Tiefe.\n\nDie Offenbarung beginnt nicht im Licht.\n\nSie beginnt in der Verborgenheit.",
    meaningFields: uniqueMeaningFields(["depth", "hiddenness", "word", "voice", "revelation", "calling", "guidance", "presence", "light"]),
    relations: uniqueRelations([
      { targetId: "tehom", type: "continues-journey", label: "Der Pfad beginnt in der Tiefe vor Ordnung und Licht.", source: "journey" },
      { targetId: "davar", type: "continues-journey", label: "Aus der Tiefe erhebt sich das Wort.", source: "journey" },
      { targetId: "qol", type: "continues-journey", label: "Das Wort wird als Stimme hörbar.", source: "journey" },
      { targetId: "or", type: "continues-journey", label: "Die Stimme führt in Licht und Sichtbarkeit.", source: "journey" },
      { targetId: "genesis-1-2", type: "anchors-scripture", label: "Genesis 1,2 nennt die Tiefe vor dem Licht.", source: "scripture-reference" },
      { targetId: "genesis-1-3", type: "anchors-scripture", label: "Genesis 1,3 führt in das Licht.", source: "scripture-reference" },
    ]),
    steps: [
      { id: "tehom-davar-qol-or-1", label: "Tehom", codexId: "tehom", description: "Die Tiefe birgt den verborgenen Ursprung." },
      { id: "tehom-davar-qol-or-2", label: "Davar", codexId: "davar", description: "Aus der Tiefe erhebt sich das Wort." },
      { id: "tehom-davar-qol-or-3", label: "Qol", codexId: "qol", description: "Das Wort wird Stimme." },
      { id: "tehom-davar-qol-or-4", label: "Or", codexId: "or", description: "Die Stimme wird Licht." },
    ],
    scriptureAnchors: [
      { id: "genesis-1-2", reference: "Genesis 1,2", label: "Und Finsternis lag auf der Tiefe.", note: "Die Tiefe steht vor Ordnung und Licht.", source: "scripture-reference" },
      { id: "genesis-1-3", reference: "Genesis 1,3", label: "Es werde Licht", note: "Das Licht tritt aus dem gesprochenen Anfang hervor.", source: "scripture-reference" },
    ],
    symbolRoomSlug: null,
    journeyIds: ["tehom-davar-qol-or"],
    meta: {
      status: "seed",
      source: ["journey", "hebrew-word", "meaning-graph", "scripture-reference"],
      sourceIds: ["tehom", "davar", "qol", "or", "genesis-1-2", "genesis-1-3"],
      tags: ["codex-seed", "journey", "tehom-davar-qol-or", "vor-dem-licht"],
      notes: "Phase 34C: Grosse Achse Tehom -> Davar -> Qol -> Or aktiviert.",
    },
  },
  {
    id: "tehom-ruach-davar-qol-or",
    type: "journey",
    title: "Vom Ursprung zum Licht",
    subtitle: "Die Tiefe wird bewegt. Das Wort wird getragen. Die Stimme wird hörbar. Das Licht erscheint.",
    hebrew: null,
    transliteration: null,
    aliases: aliasesFor("tehom-ruach-davar-qol-or"),
    searchTerms: [
      "\u05ea\u05d4\u05d5\u05dd",
      "\u05e8\u05d5\u05d7",
      "\u05d3\u05d1\u05e8",
      "\u05e7\u05d5\u05dc",
      "\u05d0\u05d5\u05e8",
    ],
    summary:
      "Über den Wassern\n\n\u05ea\u05d4\u05d5\u05dd\n\u2193\n\u05e8\u05d5\u05d7\n\u2193\n\u05d3\u05d1\u05e8\n\u2193\n\u05e7\u05d5\u05dc\n\u2193\n\u05d0\u05d5\u05e8\n\nBevor gesprochen wird, bewegt sich die Ruach über den Wassern.\n\nDie Offenbarung beginnt nicht mit dem Wort.\n\nSie beginnt mit der Bewegung des Geistes.",
    meaningFields: uniqueMeaningFields(["depth", "hiddenness", "presence", "life", "word", "voice", "revelation", "light"]),
    relations: uniqueRelations([
      { targetId: "tehom", type: "continues-journey", label: "Der Pfad beginnt in der Tiefe vor Ordnung und Licht.", source: "journey" },
      { targetId: "ruach", type: "continues-journey", label: "Ruach bewegt sich über den Wassern.", source: "journey" },
      { targetId: "davar", type: "continues-journey", label: "Das Wort wird getragen.", source: "journey" },
      { targetId: "qol", type: "continues-journey", label: "Die Stimme wird hörbar.", source: "journey" },
      { targetId: "or", type: "continues-journey", label: "Das Licht erscheint.", source: "journey" },
      { targetId: "genesis-1-2", type: "anchors-scripture", label: "Genesis 1,2 verankert Ruach über den Wassern.", source: "scripture-reference" },
      { targetId: "genesis-1-3", type: "anchors-scripture", label: "Genesis 1,3 führt in das Licht.", source: "scripture-reference" },
    ]),
    steps: [
      { id: "tehom-ruach-davar-qol-or-1", label: "Tehom", codexId: "tehom", description: "Die Tiefe birgt den verborgenen Ursprung." },
      { id: "tehom-ruach-davar-qol-or-2", label: "Ruach", codexId: "ruach", description: "Die unsichtbare Bewegung schwebt über den Wassern." },
      { id: "tehom-ruach-davar-qol-or-3", label: "Davar", codexId: "davar", description: "Das Wort wird getragen." },
      { id: "tehom-ruach-davar-qol-or-4", label: "Qol", codexId: "qol", description: "Die Stimme wird hörbar." },
      { id: "tehom-ruach-davar-qol-or-5", label: "Or", codexId: "or", description: "Das Licht erscheint." },
    ],
    scriptureAnchors: [
      { id: "genesis-1-2", reference: "Genesis 1,2", label: "Die Ruach über den Wassern", note: "Der Anfangsraum wird durch unsichtbare Bewegung berührt.", source: "scripture-reference" },
      { id: "genesis-1-3", reference: "Genesis 1,3", label: "Es werde Licht", note: "Das Licht tritt aus dem getragenen Wort hervor.", source: "scripture-reference" },
    ],
    symbolRoomSlug: null,
    journeyIds: ["tehom-ruach-davar-qol-or"],
    meta: {
      status: "seed",
      source: ["journey", "hebrew-word", "meaning-graph", "scripture-reference"],
      sourceIds: ["tehom", "ruach", "davar", "qol", "or", "genesis-1-2", "genesis-1-3"],
      tags: ["codex-seed", "journey", "tehom-ruach-davar-qol-or", "genesis-achse", "ueber-den-wassern"],
      notes: "Phase 34E: Genesis-Achse Tehom -> Ruach -> Davar -> Qol -> Or aktiviert.",
    },
  },
  letterEntry("mem"),
  letterEntry("aleph"),
  letterEntry("bet"),
  letterEntry("dalet"),
  letterEntry("resh"),
  letterEntry("shin"),
  letterEntry("jod"),
  letterEntry("tav"),
  letterEntry("lamed"),
  letterEntry("he"),
  letterEntry("vav"),
  letterEntry("tsadi"),
  letterEntry("chet"),
  letterEntry("kaf"),
  letterEntry("ayin"),
  letterEntry("pe"),
  letterEntry("qof"),
  letterEntry("nun"),
  scriptureEntry("genesis-1"),
  scriptureEntry("genesis-1-1"),
  scriptureEntry("genesis-1-2"),
  scriptureEntry("genesis-1-3"),
  scriptureEntry("exodus-14"),
  storyAnchorEntry({
    id: "schoepfung-wasser",
    title: "Wasser der Schöpfung",
    subtitle: "Genesis 1:2",
    summary: "Der Geist schwebt über den Wassern.",
    relations: [
      { targetId: "majim", type: "anchors-scripture", label: "Wasser als Anfangstiefe.", source: "scripture-reference" },
      { targetId: "genesis-1-2", type: "anchors-scripture", label: "Genesis 1:2 verankert das Anfangswasser.", source: "scripture-reference" },
    ],
  }),
  storyAnchorEntry({
    id: "schilfmeer",
    title: "Schilfmeer",
    subtitle: "Wasser als Durchgang",
    summary: "Das Wasser wird zum Durchgang.",
    relations: [
      { targetId: "majim", type: "anchors-scripture", label: "Wasser wird Grenze und Weg.", source: "scripture-reference" },
    ],
  }),
  storyAnchorEntry({
    id: "felswasser",
    title: "Wasser aus dem Felsen",
    subtitle: "Quelle in der Wüste",
    summary: "In der Wüste wird der Fels zur Quelle.",
    relations: [
      { targetId: "majim", type: "anchors-scripture", label: "Wasser erscheint als Versorgung in der Wüste.", source: "scripture-reference" },
      { targetId: "midbar", type: "related", label: "Die Wüste macht den Mangel sichtbar.", source: "meaning-graph" },
    ],
  }),
  numberEntry({
    id: "zahl-1",
    title: "1",
    subtitle: "Aleph: Einheit und stiller Ursprung",
    summary:
      "Die Eins sammelt im SYMBOLRAUM den ersten Atem: nicht als mathematische Abstraktion, sondern als leiser Ursprung, aus dem Licht, Feuer, Wort und Offenbarung hervortreten.",
    meaningFields: ["light", "revelation", "awareness", "presence", "fire", "word", "hiddenness"],
    relations: [
      { targetId: "aleph", type: "contains-letter", label: "Aleph trägt im Codex den Zahlenwert 1.", source: "hebrew-letter" },
      { targetId: "or", type: "shares-meaning", label: "Die Eins öffnet das erste Sichtbarwerden.", source: "meaning-graph" },
      { targetId: "esch", type: "shares-meaning", label: "Im Feuer wird der Ursprung als wirksame Gegenwart spürbar.", source: "meaning-graph" },
      { targetId: "davar", type: "shares-meaning", label: "Vor dem Wort liegt der stille Anfang des Atems.", source: "meaning-graph" },
      { targetId: "offenbarung", type: "shares-meaning", label: "Die Eins ist Schwelle vom Verborgenen ins Sichtbare.", source: "meaning-graph" },
    ],
    sourceIds: ["aleph", "licht", "feuer", "wort", "offenbarung"],
    tags: ["aleph-zahl", "einheit", "ursprung"],
  }),
  numberEntry({
    id: "zahl-40",
    title: "40",
    subtitle: "Mem: Wasserzeit und Schwelle der Tiefe",
    summary:
      "Die Vierzig klingt im Codex als Mem-Zahl: eine Zeit der Tiefe, der Wüstenpassage und des Werdens, in der Wasser nicht erklärt, sondern als tragende Schwelle gelesen wird.",
    meaningFields: ["depth", "chaos", "birth", "transition", "purification", "life", "hiddenness", "desert"],
    relations: [
      { targetId: "mem", type: "contains-letter", label: "Mem trägt im Codex den Zahlenwert 40.", source: "hebrew-letter" },
      { targetId: "majim", type: "shares-meaning", label: "Vierzig bindet Mem an Wasser, Tiefe und Reinigung.", source: "meaning-graph" },
      { targetId: "midbar", type: "shares-meaning", label: "Die Vierzig kann als Zeit der Wüstenpassage gelesen werden.", source: "meaning-graph" },
      { targetId: "tehom", type: "shares-meaning", label: "Mem führt die Zahl in den Raum verborgener Tiefe.", source: "meaning-graph" },
    ],
    sourceIds: ["mem", "wasser", "wueste", "tiefe"],
    tags: ["mem-zahl", "wasser", "tiefe", "schwelle"],
  }),
  numberEntry({
    id: "zahl-90",
    title: "90",
    subtitle: "\u05de\u05d9\u05dd / Wasser: verdichtete Tiefe",
    summary:
      "Die Neunzig bewahrt die Wasserspur von majim: Mem, Jod und finales Mem verdichten sichtbare Tiefe, inneren Impuls und verborgene Tiefe zu einem stillen Bild des Anfangswassers.",
    meaningFields: ["depth", "chaos", "birth", "transition", "purification", "life", "hiddenness"],
    relations: [
      { targetId: "majim", type: "has-hebrew-word", label: "\u05de\u05d9\u05dd / majim wird im Codex als Wasser gelesen.", source: "hebrew-word" },
      { targetId: "manna", type: "shares-meaning", label: "Wasser und Manna teilen die Spur der 90: Gabe und Tiefe berühren sich.", source: "meaning-graph" },
      { targetId: "mem", type: "contains-letter", label: "Majim beginnt und endet mit Mem: 40 + 10 + 40.", source: "hebrew-letter" },
      { targetId: "genesis-1-2", type: "anchors-scripture", label: "Genesis 1,2 verankert die Wasser vor der ersten Ordnung.", source: "scripture-reference" },
    ],
    scriptureAnchors: [
      {
        id: "genesis-1-2",
        reference: "Genesis 1,2",
        label: "Wasser am Anfang",
        note: "Die Zahl 90 wird als manuelle Resonanz von majim im Anfangswasser gelesen.",
        source: "scripture-reference",
      },
    ],
    sourceIds: ["majim", "wasser", "manna", "mem", "genesis-1-2"],
    tags: ["majim-zahl", "wasser", "manna", "anfangswasser", "mem-jod-mem"],
  }),
] satisfies CodexEntry[];

const seededCodexEntryIds = new Set(seededCodexRegistry.map((entry) => entry.id));

export const codexRegistry = canonicalizeCodexRegistry([
  ...seededCodexRegistry,
  ...hebrewWords
    .filter((word) => !seededCodexEntryIds.has(word.id))
    .map(generatedHebrewWordEntry),
] satisfies CodexEntry[]);

export const codexEntryIds = CODEX_ENTRY_IDS;
