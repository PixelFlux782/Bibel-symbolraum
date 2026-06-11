import { hebrewLetters } from "@/lib/hebrew/hebrewLetters";
import { hebrewWords } from "@/lib/hebrew/hebrewWords";
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
  "wasser",
  "licht",
  "feuer",
  "wueste",
  "tiefe",
  "geist",
  "wort",
  "offenbarung",
  "reinigung",
  "wandlung",
  "mem",
  "aleph",
  "genesis-1",
  "genesis-1-1",
  "genesis-1-2",
  "genesis-1-3",
  "schoepfung-wasser",
  "schilfmeer",
  "felswasser",
  "zahl-1",
  "zahl-40",
  "zahl-90",
  "journey-chaos-ordnung",
  "journey-wasser-geist",
  "journey-wueste-offenbarung",
] as const;

export type CodexEntryId = (typeof CODEX_ENTRY_IDS)[number];

const CODEX_ALIASES = {
  anfang: ["Anfang", "Beginn", "Ursprung"],
  schoepfung: ["Schöpfung", "Creation"],
  ursprung: ["Urgrund", "Quelle des Anfangs", "erster Ursprung"],
  ordnung: ["Kosmos", "Unterscheidung", "geordnetes Licht"],
  himmel: ["Himmel", "Heaven", "Schamajim"],
  erde: ["Erde", "Earth", "Adamah"],
  wasser: ["Wasser", "majim", "mayim"],
  licht: ["Licht", "or"],
  feuer: ["Feuer", "esch", "esh"],
  wueste: ["Wüste", "midbar"],
  tiefe: ["Tiefe", "Urtiefe", "Tehom"],
  geist: ["Geist", "Atem", "Ruach"],
  wort: ["Wort", "Sprache", "Davar"],
  offenbarung: ["Offenbarung", "Sichtbarwerden", "Revelation"],
  reinigung: ["Reinigung", "Laeuterung", "Klaerung"],
  wandlung: ["Wandlung", "Verwandlung", "Transformation"],
  mem: ["Mem"],
  aleph: ["Aleph"],
  "genesis-1": ["Genesis 1", "1 Mose 1", "Bereschit 1", "Schoepfungsanfang"],
  "genesis-1-1": ["Genesis 1,1", "1 Mose 1,1", "Bereschit 1:1", "Im Anfang"],
  "genesis-1-2": ["Genesis 1,2", "1 Mose 1,2", "Bereschit 1:2", "Tohu wabohu", "Ruach"],
  "genesis-1-3": ["Genesis 1,3", "1 Mose 1,3", "Bereschit 1:3", "Es werde Licht", "Jehi or"],
  "schoepfung-wasser": ["Wasser der Schöpfung", "Anfangswasser", "Geist ueber den Wassern"],
  schilfmeer: ["Schilfmeer", "Meer als Durchgang", "Exodus Wasser"],
  felswasser: ["Wasser aus dem Felsen", "Felswasser", "Wasser in der Wueste"],
  "zahl-1": ["Zahl 1", "Eins", "Alephwert", "Ursprungszahl", "Einheit im Codex"],
  "zahl-40": ["Zahl 40", "Vierzig", "Memwert", "Schwellenzahl", "Wasserzeit"],
  "zahl-90": ["Zahl 90", "Neunzig", "Majimwert", "Wasserzahl", "Mem-Jod-Mem"],
  "journey-chaos-ordnung": ["Journey Chaos Ordnung", "Gefuehrter Pfad Chaos Ordnung", "Von Chaos zu Ordnung"],
  "journey-wasser-geist": ["Journey Wasser Geist", "Gefuehrter Pfad Wasser Geist", "Wasser und Geist Spur"],
  "journey-wueste-offenbarung": ["Journey Wueste Offenbarung", "Gefuehrter Pfad Wueste Offenbarung", "Wueste zur Offenbarung"],
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

const LETTER_CODEX_PROFILES = {
  mem: {
    glyph: "\u05de",
    transliteration: "m / Mem",
    essence:
      "Mem ist die Wasserform des Werdens. Sie umhuellt, traegt und verbirgt den Ursprung im Inneren: offen als fliessendes Wasser, geschlossen als bewahrte Tiefe.",
    meaningFields: ["depth", "chaos", "birth", "transition", "purification", "life", "hiddenness", "desert", "word"],
    searchTerms: ["Maim", "Mayim", "Majim", "Wasserbuchstabe", "finales Mem", "geschlossene Tiefe"],
    scriptureAnchors: [
      {
        id: "genesis-1-2",
        reference: "Genesis 1,2",
        label: "Wasser am Anfang",
        note: "Mem ist ueber majim mit den Wassern der ersten Tiefe verbunden.",
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
        note: "Wasser traegt den Uebergang in eine neue Ausrichtung.",
        source: "hebrew-letter",
      },
    ],
    extraRelations: [
      { targetId: "genesis-1-2", type: "anchors-scripture", label: "Mem klingt im Wasserfeld von Genesis 1,2 an.", source: "hebrew-letter" },
      { targetId: "tiefe", type: "shares-meaning", label: "Mem oeffnet die symbolische Tiefe unter der sichtbaren Ordnung.", source: "hebrew-letter" },
    ],
  },
  aleph: {
    glyph: "\u05d0",
    transliteration: "\u02be / Aleph",
    essence:
      "Aleph ist der stille Anfang vor dem gesprochenen Wort. Es traegt die Einheit, aus der Licht und Feuer hervortreten.",
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
      { targetId: "wort", type: "shares-meaning", label: "Vor dem gesprochenen Wort liegt der stille Atem des Aleph.", source: "hebrew-letter" },
      { targetId: "offenbarung", type: "shares-meaning", label: "Im Aleph beginnt das Hervortreten des Verborgenen.", source: "hebrew-letter" },
    ],
  },
} satisfies Record<"mem" | "aleph", {
  glyph: string;
  transliteration: string;
  essence: string;
  meaningFields: CodexEntry["meaningFields"];
  searchTerms: string[];
  scriptureAnchors: CodexEntry["scriptureAnchors"];
  extraRelations: CodexRelation[];
}>;

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

function symbolEntry(symbolId: "wasser" | "licht" | "feuer" | "wueste", hebrewWordId: string): CodexEntry {
  const symbol = findSymbol(symbolId);
  const word = hebrewWords.find((entry) => entry.id === hebrewWordId);
  const sources: CodexSourceKind[] = [
    ...(symbol.network ? (["symbol-network"] as const) : []),
    ...(symbol.legacy ? (["symbol-list"] as const) : []),
    ...(word ? (["hebrew-word"] as const) : []),
    "meaning-graph",
  ];

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
      notes: "Minimaler Codex-Zielanker fuer Genesis 1.",
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
      notes: "Minimaler referenzierbarer Anker fuer den Tiefe-Zoom.",
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
      notes: "Kuratierter Meaning-Codex-Eintrag fuer den Bedeutung-Tab.",
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
      notes: "Gefuehrter Codex-Pfad fuer den Journeys-Tab.",
    },
  };
}

function letterEntry(letterId: "mem" | "aleph"): CodexEntry {
  const letter = hebrewLetters.find((entry) => entry.id === letterId);
  const profile = LETTER_CODEX_PROFILES[letterId];

  if (!letter) {
    throw new Error(`HebrewLetter "${letterId}" fehlt fuer Codex-Seed.`);
  }

  const relatedWords = hebrewWords.filter((word) => letter.relatedWordIds.includes(word.id));
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
    subtitle: `Buchstabe ${letter.alphabetPosition}, Zahlkoerper ${letter.numericValue}`,
    hebrew: profile.glyph,
    transliteration: profile.transliteration,
    aliases: aliasesFor(letterId),
    searchTerms: profile.searchTerms,
    summary: profile.essence,
    meaningFields: uniqueMeaningFields([
      ...profile.meaningFields,
      ...letter.relatedSymbolSlugs.flatMap(symbolMeaningFields),
      ...letter.relatedWordIds.flatMap(hebrewMeaningFields),
    ]),
    relations: uniqueRelations([
      ...letter.relatedSymbolSlugs.map<CodexRelation>((targetId) => ({
        targetId,
        type: "symbolizes",
        label: `Verwandtes Symbol: ${findSymbolTitle(targetId)}`,
        source: "hebrew-letter",
      })),
      ...letter.relatedWordIds.map<CodexRelation>((targetId) => ({
        targetId,
        type: "has-hebrew-word",
        label: hebrewWords.find((word) => word.id === targetId)?.germanMeaning,
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
      sourceIds: [letter.id, ...letter.relatedWordIds, ...profile.scriptureAnchors.map((anchor) => anchor.id).filter((id): id is string => Boolean(id))],
      tags: ["codex-seed", "hebrew-letter", "letter-resonance"],
    },
  };
}

function scriptureEntry(referenceId: "genesis-1" | "genesis-1-1" | "genesis-1-2" | "genesis-1-3"): CodexEntry {
  const reference = biblicalReferences.find((entry) => entry.id === referenceId);
  const base = {
    "genesis-1": {
      title: "Genesis 1",
      subtitle: "Der Anfang als erste Symbolsequenz",
      reference: "Genesis 1",
      label: "Genesis 1",
      searchTerms: ["Bereshit 1", "Schoepfung", "Anfang", "Tiefe", "Licht"],
      summary:
        "Genesis 1 erzaehlt nicht nur den Beginn der Welt, sondern legt die erste Bewegung des Symbolraums frei: Aus Anfang und noch ungestalteter Tiefe treten Wort, Licht und Unterscheidung hervor. Der Abschnitt verbindet Ursprung, Wasser, Geist, Stimme und Sichtbarkeit zu einer Grundlinie, an der spaetere Symbole lesbar werden.",
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
      searchTerms: ["Bereshit bara", "Schoepfung", "Himmel", "Erde", "Ursprung"],
      summary:
        "Genesis 1:1 setzt den ersten Horizont: Im Anfang schafft Gott Himmel und Erde. Die Symbole Anfang, Schoepfung, Himmel und Erde markieren die Grundspannung von oben und unten, Ursprung und werdender Welt. Fuer das Symbolnetz ist der Vers der ruhige Startpunkt, von dem aus jede weitere Ordnung erst Sinn und Richtung bekommt.",
      meaningFields: ["birth", "life", "hiddenness"] satisfies CodexEntry["meaningFields"],
      relations: [
        { targetId: "anfang", type: "anchors-scripture", label: "Der Anfang als erster Ort der Erzaehlung.", source: "scripture-reference" },
        { targetId: "schoepfung", type: "anchors-scripture", label: "Schoepfung als Hervortreten von Welt und Ordnung.", source: "scripture-reference" },
        { targetId: "himmel", type: "anchors-scripture", label: "Himmel als obere Weite der ersten Unterscheidung.", source: "scripture-reference" },
        { targetId: "erde", type: "anchors-scripture", label: "Erde als untere, noch zu formende Wirklichkeit.", source: "scripture-reference" },
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
        "Genesis 1:2 fuehrt in den noch ungeordneten Zwischenraum: Erde ist wuest und leer, Finsternis liegt ueber der Tiefe, und Gottes Geist schwebt ueber den Wassern. Wasser, Tiefe, Chaos, Geist und Mem bilden hier das erste dichte Symbolfeld. Der Vers ist wichtig, weil er zeigt: Ordnung beginnt im Symbolraum nicht oberhalb der Tiefe, sondern an ihrer Schwelle.",
      meaningFields: biblicalMeaningFields(referenceId),
      relations: [
        { targetId: "wasser", type: "anchors-scripture", label: "Wasser als Urtiefe und Anfangsraum.", source: "meaning-graph" },
        { targetId: "tiefe", type: "anchors-scripture", label: "Tiefe als noch ungeformter Raum vor Unterscheidung.", source: "meaning-graph" },
        { targetId: "geist", type: "anchors-scripture", label: "Geist als bewegte Gegenwart ueber den Wassern.", source: "scripture-reference" },
        { targetId: "mem", type: "contains-letter", label: "Mem ist ueber majim mit dem Wasser-Motiv verbunden.", source: "hebrew-letter" },
        { targetId: "genesis-1-3", type: "continues-journey", label: "Aus der Tiefe fuehrt die Sequenz zum gesprochenen Licht.", source: "scripture-reference" },
      ] satisfies CodexRelation[],
      symbolRoomSlug: "wasser",
    },
    "genesis-1-3": {
      title: reference?.label ?? "Genesis 1:3",
      subtitle: "Das Wort ruft Licht",
      reference: reference?.reference ?? "Genesis 1,3",
      label: reference?.label ?? "Genesis 1 Licht",
      searchTerms: ["Bereshit 1:3", "Or", "Wort", "Offenbarung", "Aleph"],
      summary:
        "Genesis 1:3 laesst aus der Tiefe eine erste lesbare Gestalt hervortreten: Gott spricht, und Licht wird. Wort, Licht, Offenbarung und Aleph verbinden sich zu einem Motiv von Sichtbarkeit, Erkenntnis und Orientierung. Im Symbolnetz ist dieser Vers die Schwelle, an der das Verborgene nicht erklaert, sondern sichtbar gerufen wird.",
      meaningFields: biblicalMeaningFields(referenceId),
      relations: [
        { targetId: "licht", type: "anchors-scripture", label: "Licht als erstes Sichtbarwerden der Schoepfung.", source: "meaning-graph" },
        { targetId: "wort", type: "anchors-scripture", label: "Das gesprochene Wort eroeffnet Ordnung und Richtung.", source: "meaning-graph" },
        { targetId: "offenbarung", type: "anchors-scripture", label: "Offenbarung als Hervortreten aus der Verborgenheit.", source: "meaning-graph" },
        { targetId: "aleph", type: "contains-letter", label: "Aleph steht im Lichtwort or als stiller Ursprung.", source: "hebrew-letter" },
      ] satisfies CodexRelation[],
      symbolRoomSlug: "licht",
    },
  }[referenceId];

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
    relations: base.relations,
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

export const codexRegistry = [
  minimalMeaningEntry({
    id: "anfang",
    title: "Anfang",
    subtitle: "Ursprung und erster Schritt",
    summary: "Der Anfang markiert im Codex den ersten Raum, in dem Wirklichkeit erzaehlbar wird.",
    meaningFields: ["birth", "hiddenness"],
  }),
  minimalMeaningEntry({
    id: "schoepfung",
    title: "Schoepfung",
    subtitle: "Werden und Ordnung",
    summary: "Schoepfung beschreibt das Hervortreten von Gestalt aus noch ungeordnetem Raum.",
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
      { targetId: "wasser", type: "shares-meaning", label: "Wasser bewahrt den Ursprung als Tiefe vor der Form.", source: "symbol-network" },
      { targetId: "licht", type: "shares-meaning", label: "Licht macht den Ursprung erstmals sichtbar.", source: "symbol-network" },
      { targetId: "anfang", type: "related", label: "Der Anfang ist die erste erzaehlbare Bewegung des Ursprungs.", source: "meaning-graph" },
      { targetId: "aleph", type: "contains-letter", label: "Aleph steht als stiller erster Atem am Ursprung.", source: "hebrew-letter" },
      { targetId: "zahl-1", type: "shares-meaning", label: "Die Eins sammelt Einheit und ersten Impuls.", source: "meaning-graph" },
      { targetId: "or", type: "has-hebrew-word", label: "or / Licht traegt das Sichtbarwerden des Ursprungs.", source: "hebrew-word" },
      { targetId: "majim", type: "has-hebrew-word", label: "majim / Wasser bewahrt die Anfangstiefe.", source: "hebrew-word" },
    ],
    scriptureAnchors: [
      { id: "genesis-1-1", reference: "Genesis 1,1", label: "Im Anfang", note: "Ursprung wird als erster Horizont der Schoepfung lesbar.", source: "scripture-reference" },
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
      { targetId: "licht", type: "shares-meaning", label: "Licht laesst Konturen und Unterscheidung hervortreten.", source: "symbol-network" },
      { targetId: "wort", type: "shares-meaning", label: "Das Wort gibt der Ordnung Stimme und Richtung.", source: "meaning-graph" },
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
    summary: "Himmel steht hier als vorbereiteter Zielanker fuer die erste Unterscheidung von oben und unten.",
    meaningFields: ["guidance", "hiddenness"],
  }),
  minimalMeaningEntry({
    id: "erde",
    title: "Erde",
    subtitle: "Grund und zu formende Welt",
    summary: "Erde steht hier als vorbereiteter Zielanker fuer die noch zu ordnende Wirklichkeit der Schoepfung.",
    meaningFields: ["life", "hiddenness"],
  }),
  symbolEntry("wasser", "majim"),
  symbolEntry("licht", "or"),
  symbolEntry("feuer", "esh"),
  symbolEntry("wueste", "midbar"),
  meaningEntry({
    id: "tiefe",
    title: "Tiefe",
    subtitle: "Urtiefe, Wasser und verborgene Schwelle",
    summary:
      "Tiefe ist der Raum unter der ersten Lesbarkeit. Sie ist nicht nur Chaos, sondern tragende Verborgenheit: Wasser, Mem und Vierzig halten die Zeit aus, bevor Gestalt sichtbar wird.",
    meaningFields: ["depth", "chaos", "hiddenness", "birth", "transition", "purification"],
    relations: [
      { targetId: "genesis-1-2", type: "anchors-scripture", label: "Genesis 1,2 fuehrt in die Tiefe vor der ersten Ordnung.", source: "scripture-reference" },
      { targetId: "wasser", type: "shares-meaning", label: "Wasser traegt im Codex die kosmische und innere Tiefe.", source: "symbol-network" },
      { targetId: "mem", type: "contains-letter", label: "Mem oeffnet das Wasserfeld als Buchstabenraum.", source: "hebrew-letter" },
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
    summary: "Geist ist hier als bewegte Gegenwart ueber der Tiefe vorbereitet.",
    meaningFields: ["presence", "voice", "life"],
    relations: [{ targetId: "wasser", type: "related", label: "Genesis 1:2 verbindet Geist und Wasser im Anfangsraum.", source: "scripture-reference" }],
  }),
  minimalMeaningEntry({
    id: "wort",
    title: "Wort",
    subtitle: "Sprache, Ruf und Ordnung",
    summary: "Wort bezeichnet gesprochenen Sinn, der Richtung gibt und Wirklichkeit ordnet.",
    meaningFields: ["word", "voice", "guidance"],
  }),
  meaningEntry({
    id: "offenbarung",
    title: "Offenbarung",
    subtitle: "Licht, das Verborgenes lesbar macht",
    summary:
      "Offenbarung ist kein lauter Effekt, sondern ein stilles Hervortreten: Licht beruehrt das Verborgene, Aleph gibt ihm ersten Atem, und die Eins sammelt es in eine sichtbare Spur.",
    meaningFields: ["revelation", "light", "awareness", "presence", "word"],
    relations: [
      { targetId: "licht", type: "shares-meaning", label: "Im Licht wird das Verborgene sichtbar.", source: "meaning-graph" },
      { targetId: "aleph", type: "contains-letter", label: "Aleph steht als stiller Anfang im Lichtwort or.", source: "hebrew-letter" },
      { targetId: "zahl-1", type: "shares-meaning", label: "Die Eins sammelt den ersten Impuls des Sichtbarwerdens.", source: "meaning-graph" },
      { targetId: "genesis-1-3", type: "anchors-scripture", label: "Genesis 1,3 ruft Licht in die Sichtbarkeit.", source: "scripture-reference" },
      { targetId: "or", type: "has-hebrew-word", label: "or / Licht ist das hebraeische Wortfeld der Offenbarung.", source: "hebrew-word" },
    ],
    scriptureAnchors: [
      { id: "genesis-1-3", reference: "Genesis 1,3", label: "Licht wird", note: "Offenbarung erscheint als gerufenes Licht.", source: "scripture-reference" },
    ],
    searchTerms: ["Enthuellung", "Lichtoffenbarung", "Aleph Licht", "Genesis Licht"],
    sourceIds: ["licht", "aleph", "zahl-1", "genesis-1-3", "or"],
  }),
  meaningEntry({
    id: "reinigung",
    title: "Reinigung",
    subtitle: "Klaerung durch Wasser und Feuer",
    summary:
      "Reinigung meint im SYMBOLRAUM keine Ausloeschung, sondern eine Klaerung des Wesentlichen. Wasser loest und traegt, Feuer laeutert und macht sichtbar, was bleiben kann.",
    meaningFields: ["purification", "fire", "transition", "life"],
    relations: [
      { targetId: "wasser", type: "shares-meaning", label: "Wasser traegt Reinigung als Waschen, Geburt und Uebergang.", source: "symbol-network" },
      { targetId: "feuer", type: "shares-meaning", label: "Feuer traegt Reinigung als Laeuterung und Freilegung.", source: "symbol-network" },
      { targetId: "genesis-1-2", type: "anchors-scripture", label: "Die Wasser des Anfangs bewahren den Raum vor neuer Ordnung.", source: "scripture-reference" },
      { targetId: "mem", type: "contains-letter", label: "Mem verbindet Reinigung mit Wasser und Schwelle.", source: "hebrew-letter" },
      { targetId: "aleph", type: "contains-letter", label: "Aleph steht im Feuerwort esh als erster Atem der Laeuterung.", source: "hebrew-letter" },
      { targetId: "zahl-40", type: "shares-meaning", label: "Vierzig kann als Zeit der Klaerung und Vorbereitung gelesen werden.", source: "meaning-graph" },
      { targetId: "majim", type: "has-hebrew-word", label: "majim / Wasser traegt die reinigende Schwelle.", source: "hebrew-word" },
      { targetId: "esh", type: "has-hebrew-word", label: "esch / Feuer traegt die laeuternde Kraft.", source: "hebrew-word" },
    ],
    scriptureAnchors: [
      { id: "genesis-1-2", reference: "Genesis 1,2", label: "Wasser vor Ordnung", note: "Reinigung beginnt als tragender Raum vor neuer Gestalt.", source: "scripture-reference" },
      { id: "malachi-3-2-3", reference: "Maleachi 3,2-3", label: "Laeuterndes Feuer", note: "Feuer klaert, ohne das Wesentliche zu vernichten.", source: "scripture-reference" },
    ],
    searchTerms: ["Waschung", "Feuer Reinigung", "Wasser Reinigung", "Mem Reinigung"],
    sourceIds: ["wasser", "feuer", "genesis-1-2", "malachi-3-2-3", "mem", "aleph", "zahl-40", "majim", "esh"],
  }),
  meaningEntry({
    id: "wandlung",
    title: "Wandlung",
    subtitle: "Uebergang durch Wasser, Wueste und Feuer",
    summary:
      "Wandlung ist der Weg, auf dem ein innerer Zustand seine alte Form verliert und eine neue Gestalt empfaengt. Wasser fuehrt durch die Schwelle, Wueste entzieht Sicherheiten, Feuer verwandelt das Verborgene in Gegenwart.",
    meaningFields: ["transformation", "transition", "desert", "fire", "purification", "guidance", "hiddenness"],
    relations: [
      { targetId: "wasser", type: "transforms", label: "Wasser macht Wandlung als Durchgang und Neugeburt erfahrbar.", source: "symbol-network" },
      { targetId: "wueste", type: "transforms", label: "Die Wueste verwandelt durch Reduktion, Mangel und neues Hoeren.", source: "symbol-network" },
      { targetId: "feuer", type: "transforms", label: "Feuer verwandelt, indem es Energie, Ruf und Laeuterung freilegt.", source: "symbol-network" },
      { targetId: "genesis-1-2", type: "anchors-scripture", label: "Vor der Ordnung liegt ein Zustand, der verwandelt werden kann.", source: "scripture-reference" },
      { targetId: "genesis-1-3", type: "continues-journey", label: "Wandlung fuehrt aus der Tiefe in sichtbare Orientierung.", source: "scripture-reference" },
      { targetId: "mem", type: "contains-letter", label: "Mem haelt Wandlung als Wasser- und Schwellenzeichen.", source: "hebrew-letter" },
      { targetId: "zahl-40", type: "shares-meaning", label: "Vierzig markiert im Codex die Zeit der Passage.", source: "meaning-graph" },
      { targetId: "majim", type: "has-hebrew-word", label: "majim / Wasser traegt den Uebergang.", source: "hebrew-word" },
      { targetId: "midbar", type: "has-hebrew-word", label: "midbar / Wueste traegt den Wandlungsweg der Leere.", source: "hebrew-word" },
      { targetId: "esh", type: "has-hebrew-word", label: "esch / Feuer traegt die verwandelnde Energie.", source: "hebrew-word" },
    ],
    scriptureAnchors: [
      { id: "genesis-1-2", reference: "Genesis 1,2", label: "Tiefe vor Gestalt", note: "Wandlung beginnt im noch ungeordneten Zwischenraum.", source: "scripture-reference" },
      { id: "genesis-1-3", reference: "Genesis 1,3", label: "Licht wird", note: "Aus der Wandlung tritt Orientierung hervor.", source: "scripture-reference" },
      { id: "deuteronomy-8", reference: "Deuteronomium 8", label: "Wuestenweg", note: "Der Weg durch die Wueste wird als Lern- und Wandlungsraum erinnert.", source: "scripture-reference" },
    ],
    searchTerms: ["Wandlungsweg", "Uebergang", "Passage", "Wuestenweg", "Feuerwandlung"],
    sourceIds: ["wasser", "wueste", "feuer", "genesis-1-2", "genesis-1-3", "deuteronomy-8", "mem", "zahl-40", "majim", "midbar", "esh"],
  }),
  journeyEntry({
    id: "journey-chaos-ordnung",
    title: "Chaos und Ordnung",
    subtitle: "Vom ungeformten Anfang zur lesbaren Richtung",
    summary:
      "Dieser Bedeutungspfad fuehrt von der Tiefe des Anfangs ueber Wasser und Geist zum Wort, das Licht und Ordnung hervorruft. Chaos erscheint dabei nicht als Gegenwelt, sondern als Schwelle, an der neue Lesbarkeit beginnt.",
    meaningFields: ["chaos", "depth", "transition", "word", "light", "guidance", "revelation"],
    relations: [
      { targetId: "tiefe", type: "shares-meaning", label: "Die Tiefe sammelt den ungeformten Anfang.", source: "meaning-graph" },
      { targetId: "wasser", type: "shares-meaning", label: "Wasser traegt das Chaos als bewegte Ursprungstiefe.", source: "symbol-network" },
      { targetId: "geist", type: "continues-journey", label: "Der Geist bewegt sich ueber der Tiefe.", source: "scripture-reference" },
      { targetId: "wort", type: "continues-journey", label: "Das Wort ruft Richtung in den offenen Raum.", source: "meaning-graph" },
      { targetId: "ordnung", type: "continues-journey", label: "Ordnung wird als erste Lesbarkeit sichtbar.", source: "meaning-graph" },
      { targetId: "genesis-1-2", type: "anchors-scripture", label: "Genesis 1,2 zeigt die Tiefe vor der ersten Ordnung.", source: "scripture-reference" },
      { targetId: "genesis-1-3", type: "anchors-scripture", label: "Genesis 1,3 fuehrt vom Wort zum Licht.", source: "scripture-reference" },
    ],
    scriptureAnchors: [
      { id: "genesis-1-2", reference: "Genesis 1,2", label: "Tiefe vor Ordnung", note: "Der Pfad beginnt im wuesten und leeren Zwischenraum.", source: "scripture-reference" },
      { id: "genesis-1-3", reference: "Genesis 1,3", label: "Es werde Licht", note: "Ordnung wird als gerufenes Licht lesbar.", source: "scripture-reference" },
    ],
    searchTerms: ["Chaos Ordnung Pfad", "Tiefe Licht Sequenz", "Genesis Ordnungspfad", "Bedeutungspfad Anfangstiefe"],
    sourceIds: ["tiefe", "wasser", "geist", "wort", "ordnung", "genesis-1-2", "genesis-1-3"],
    steps: [
      { id: "chaos-ordnung-1", label: "Tiefe", codexId: "tiefe", description: "Der Pfad beginnt im noch ungeformten Raum vor der ersten Unterscheidung." },
      { id: "chaos-ordnung-2", label: "Wasser", codexId: "wasser", description: "Wasser haelt Bewegung, Ursprung und offene Moeglichkeit zusammen." },
      { id: "chaos-ordnung-3", label: "Geist", codexId: "geist", description: "Der Geist markiert Gegenwart, die ueber der Tiefe in Bewegung kommt." },
      { id: "chaos-ordnung-4", label: "Wort", codexId: "wort", description: "Das Wort gibt dem offenen Raum Stimme und Richtung." },
      { id: "chaos-ordnung-5", label: "Ordnung", codexId: "ordnung", description: "Ordnung erscheint als lesbare Gestalt, nicht als starre Kontrolle." },
    ],
  }),
  journeyEntry({
    id: "journey-wasser-geist",
    title: "Wasser und Geist",
    subtitle: "Bewegte Gegenwart ueber der Tiefe",
    summary:
      "Dieser Pfad folgt der Verbindung von Wasser, Tiefe, Mem und Geist. Er liest Wasser als tragenden Zwischenraum und Geist als bewegte Gegenwart, die nicht aus der Tiefe flieht, sondern an ihrer Schwelle neues Leben vorbereitet.",
    meaningFields: ["depth", "chaos", "presence", "voice", "life", "transition", "hiddenness"],
    relations: [
      { targetId: "wasser", type: "shares-meaning", label: "Wasser ist der Grundraum dieser Journey.", source: "symbol-network" },
      { targetId: "tiefe", type: "shares-meaning", label: "Die Tiefe macht den Wasserraum als verborgenes Werden lesbar.", source: "meaning-graph" },
      { targetId: "geist", type: "continues-journey", label: "Geist wird ueber den Wassern als bewegte Gegenwart sichtbar.", source: "scripture-reference" },
      { targetId: "mem", type: "contains-letter", label: "Mem verdichtet Wasser, Tiefe und Werden im Buchstabenraum.", source: "hebrew-letter" },
      { targetId: "genesis-1-2", type: "anchors-scripture", label: "Genesis 1,2 verbindet Wasser und Geist im Anfangsraum.", source: "scripture-reference" },
      { targetId: "matthew-3-13-17", type: "anchors-scripture", label: "Die Taufe oeffnet Wasser als Schwelle neuer Ausrichtung.", source: "scripture-reference" },
    ],
    scriptureAnchors: [
      { id: "genesis-1-2", reference: "Genesis 1,2", label: "Geist ueber den Wassern", note: "Wasser und Geist stehen gemeinsam am Anfang der Lesbarkeit.", source: "scripture-reference" },
      { id: "matthew-3-13-17", reference: "Matthaeus 3,13-17", label: "Taufe Jesu", note: "Wasser wird zur Schwelle, an der Geist und Stimme hervortreten.", source: "scripture-reference" },
    ],
    searchTerms: ["Wasser Geist Pfad", "Ruach Wasser Sequenz", "Mem Geist Journey", "Taufe Bedeutungspfad"],
    sourceIds: ["wasser", "tiefe", "geist", "mem", "genesis-1-2", "matthew-3-13-17"],
    steps: [
      { id: "wasser-geist-1", label: "Wasser", codexId: "wasser", description: "Wasser traegt den Anfang als Tiefe, Schwelle und Moeglichkeit." },
      { id: "wasser-geist-2", label: "Tiefe", codexId: "tiefe", description: "Die Tiefe bewahrt das noch Ungesagte unter der sichtbaren Oberflaeche." },
      { id: "wasser-geist-3", label: "Mem", codexId: "mem", description: "Mem bindet Wasser, Werden und verborgene Schwelle an den Buchstabenraum." },
      { id: "wasser-geist-4", label: "Geist", codexId: "geist", description: "Geist bringt Bewegung und Gegenwart in den Wasserraum." },
      { id: "wasser-geist-5", label: "Genesis 1,2", codexId: "genesis-1-2", description: "Der Vers verankert die Journey im Anfangsbild von Wasser und Geist." },
    ],
  }),
  journeyEntry({
    id: "journey-wueste-offenbarung",
    title: "Wueste und Offenbarung",
    subtitle: "Reduktion, Ruf und Sichtbarwerden",
    summary:
      "Dieser Bedeutungspfad liest die Wueste als Raum der Reduktion: Sicherheiten werden entzogen, Stimme und Abhaengigkeit werden hoerbar, und Offenbarung tritt nicht als Flucht aus der Leere hervor, sondern mitten in ihr.",
    meaningFields: ["desert", "lack", "testing", "dependence", "trust", "voice", "revelation", "presence", "guidance"],
    relations: [
      { targetId: "wueste", type: "shares-meaning", label: "Die Wueste bildet den Erfahrungsraum der Reduktion.", source: "symbol-network" },
      { targetId: "wandlung", type: "continues-journey", label: "Wandlung geschieht im Entzug alter Sicherheiten.", source: "meaning-graph" },
      { targetId: "wort", type: "continues-journey", label: "In der Wueste wird Hoeren zur Orientierung.", source: "meaning-graph" },
      { targetId: "feuer", type: "continues-journey", label: "Feuer zeigt Gegenwart als Ruf und Laeuterung.", source: "symbol-network" },
      { targetId: "offenbarung", type: "continues-journey", label: "Offenbarung macht das Verborgene im Weg sichtbar.", source: "meaning-graph" },
      { targetId: "deuteronomy-8", type: "anchors-scripture", label: "Deuteronomium 8 erinnert die Wueste als Lernraum.", source: "scripture-reference" },
      { targetId: "exodus-3-2", type: "anchors-scripture", label: "Der Dornbusch zeigt Offenbarung im Wuestenraum.", source: "scripture-reference" },
    ],
    scriptureAnchors: [
      { id: "deuteronomy-8", reference: "Deuteronomium 8", label: "Wuestenweg", note: "Die Wueste wird als Schule von Vertrauen, Mangel und Erinnerung gelesen.", source: "scripture-reference" },
      { id: "exodus-3-2", reference: "Exodus 3,2", label: "Brennender Dornbusch", note: "Feuer und Ruf machen Gegenwart sichtbar, ohne den Ort zu verbrauchen.", source: "scripture-reference" },
    ],
    searchTerms: ["Wueste Offenbarung Pfad", "Dornbusch Journey", "Reduktion Ruf Weg", "Midbar Offenbarungspfad"],
    sourceIds: ["wueste", "wandlung", "wort", "feuer", "offenbarung", "deuteronomy-8", "exodus-3-2"],
    steps: [
      { id: "wueste-offenbarung-1", label: "Wueste", codexId: "wueste", description: "Die Wueste reduziert das Sichtbare und macht innere Orientierung notwendig." },
      { id: "wueste-offenbarung-2", label: "Wandlung", codexId: "wandlung", description: "Im Entzug kann sich die alte Form loesen und eine neue Richtung bilden." },
      { id: "wueste-offenbarung-3", label: "Wort", codexId: "wort", description: "Das Wort wird im leeren Raum zur hoerbaren Spur." },
      { id: "wueste-offenbarung-4", label: "Feuer", codexId: "feuer", description: "Feuer laesst Gegenwart als Ruf, Energie und Laeuterung hervortreten." },
      { id: "wueste-offenbarung-5", label: "Offenbarung", codexId: "offenbarung", description: "Offenbarung sammelt den Weg in eine sichtbare, lesbare Gegenwart." },
    ],
  }),
  letterEntry("mem"),
  letterEntry("aleph"),
  scriptureEntry("genesis-1"),
  scriptureEntry("genesis-1-1"),
  scriptureEntry("genesis-1-2"),
  scriptureEntry("genesis-1-3"),
  storyAnchorEntry({
    id: "schoepfung-wasser",
    title: "Wasser der Schöpfung",
    subtitle: "Genesis 1:2",
    summary: "Der Geist schwebt ueber den Wassern.",
    relations: [
      { targetId: "wasser", type: "anchors-scripture", label: "Wasser als Anfangstiefe.", source: "scripture-reference" },
      { targetId: "genesis-1-2", type: "anchors-scripture", label: "Genesis 1:2 verankert das Anfangswasser.", source: "scripture-reference" },
    ],
  }),
  storyAnchorEntry({
    id: "schilfmeer",
    title: "Schilfmeer",
    subtitle: "Wasser als Durchgang",
    summary: "Das Wasser wird zum Durchgang.",
    relations: [
      { targetId: "wasser", type: "anchors-scripture", label: "Wasser wird Grenze und Weg.", source: "scripture-reference" },
    ],
  }),
  storyAnchorEntry({
    id: "felswasser",
    title: "Wasser aus dem Felsen",
    subtitle: "Quelle in der Wueste",
    summary: "In der Wueste wird der Fels zur Quelle.",
    relations: [
      { targetId: "wasser", type: "anchors-scripture", label: "Wasser erscheint als Versorgung in der Wueste.", source: "scripture-reference" },
      { targetId: "wueste", type: "related", label: "Die Wueste macht den Mangel sichtbar.", source: "meaning-graph" },
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
      { targetId: "aleph", type: "contains-letter", label: "Aleph traegt im Codex den Zahlenwert 1.", source: "hebrew-letter" },
      { targetId: "licht", type: "shares-meaning", label: "Die Eins oeffnet das erste Sichtbarwerden.", source: "meaning-graph" },
      { targetId: "feuer", type: "shares-meaning", label: "Im Feuer wird der Ursprung als wirksame Gegenwart spuerbar.", source: "meaning-graph" },
      { targetId: "wort", type: "shares-meaning", label: "Vor dem Wort liegt der stille Anfang des Atems.", source: "meaning-graph" },
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
      "Die Vierzig klingt im Codex als Mem-Zahl: eine Zeit der Tiefe, der Wuestenpassage und des Werdens, in der Wasser nicht erklaert, sondern als tragende Schwelle gelesen wird.",
    meaningFields: ["depth", "chaos", "birth", "transition", "purification", "life", "hiddenness", "desert"],
    relations: [
      { targetId: "mem", type: "contains-letter", label: "Mem traegt im Codex den Zahlenwert 40.", source: "hebrew-letter" },
      { targetId: "wasser", type: "shares-meaning", label: "Vierzig bindet Mem an Wasser, Tiefe und Reinigung.", source: "meaning-graph" },
      { targetId: "wueste", type: "shares-meaning", label: "Die Vierzig kann als Zeit der Wuestenpassage gelesen werden.", source: "meaning-graph" },
      { targetId: "tiefe", type: "shares-meaning", label: "Mem fuehrt die Zahl in den Raum verborgener Tiefe.", source: "meaning-graph" },
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
      { targetId: "wasser", type: "has-hebrew-word", label: "\u05de\u05d9\u05dd / majim wird im Codex als Wasser gelesen.", source: "hebrew-word" },
      { targetId: "manna", type: "shares-meaning", label: "Wasser und Manna teilen die Spur der 90: Gabe und Tiefe beruehren sich.", source: "meaning-graph" },
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

export const codexEntryIds = CODEX_ENTRY_IDS;
