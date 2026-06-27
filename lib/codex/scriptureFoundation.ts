import { breakdownHebrewWord } from "../hebrew/gematria";
import { hebrewLetters } from "../hebrew/hebrewLetters";
import { hebrewWords } from "../hebrew/hebrewWords";
import { meaningJourneys } from "../meaning/meaningJourneys";
import { meaningNodes } from "../meaning/meaningNodes";
import { getOntologyEntity, getOntologyEntityTitle } from "../ontology";
import type { MeaningNodeId } from "../../types/meaningGraph";
import type { HebrewWord } from "../../types/hebrew";

import { resolveCodexEntry } from "./resolveCodexEntry";
import type { CodexEntry } from "./types";

export type ScriptureFoundationLetter = {
  label: string;
  codexId?: string;
  active: boolean;
};

export type ScriptureFoundationCoreWord = {
  order: number;
  hebrew: string;
  transliteration: string;
  german: string;
  codexId?: string;
  note?: string;
  letters?: ScriptureFoundationLetter[];
  meaningIds?: MeaningNodeId[];
  symbolIds?: string[];
  roomIds?: string[];
  numberIds?: string[];
};

export type ScriptureFoundationPassiveWord = {
  order: number;
  hebrew: string;
  transliteration: string;
  german: string;
  note?: string;
  meaningIds?: MeaningNodeId[];
};

export type ScriptureFoundationEntry = {
  id: "genesis-1-1" | "genesis-1-2" | "genesis-1-3" | "exodus-14";
  label: string;
  foundationTitle: string;
  foundationSubtitle: string;
  hebrewText: string;
  germanWorkingText: string;
  sceneSummary: string;
  coreWords: ScriptureFoundationCoreWord[];
  passiveWords: ScriptureFoundationPassiveWord[];
  linkedLetters: ScriptureFoundationLetter[];
  openedSymbols: string[];
  openedRooms: string[];
  openedMeanings: MeaningNodeId[];
  openedJourneys: string[];
  openedPatterns: string[];
  openedNumbers: string[];
  growingRooms: { id: string; label: string; note: string }[];
};

export type ScriptureFoundationLink = {
  id: string;
  label: string;
  href?: string;
};

export type ScriptureFoundationWord = {
  hebrew: string;
  transliteration: string;
  meaning: string;
  note?: string;
  codexHref?: string;
  existingWord?: HebrewWord;
  gematria?: number;
  letters: {
    id?: string;
    glyph: string;
    label: string;
    href?: string;
    value?: number;
  }[];
  symbols: ScriptureFoundationLink[];
  rooms: ScriptureFoundationLink[];
  meaningFields: ScriptureFoundationLink[];
  numbers: ScriptureFoundationLink[];
};

export type ScriptureFoundationModel = {
  label: string;
  foundationTitle: string;
  foundationSubtitle: string;
  sceneSummary: string;
  hebrewText: string;
  germanText: string;
  words: ScriptureFoundationWord[];
  connections: {
    words: ScriptureFoundationLink[];
    letters: ScriptureFoundationLink[];
    symbols: ScriptureFoundationLink[];
    rooms: ScriptureFoundationLink[];
    meaningFields: ScriptureFoundationLink[];
    journeys: ScriptureFoundationLink[];
    patterns: ScriptureFoundationLink[];
    numbers: ScriptureFoundationLink[];
  };
  growingRooms: (ScriptureFoundationLink & { note: string })[];
};

const letter = (label: string): ScriptureFoundationLetter => ({
  label,
  codexId: resolveCodexEntry(label)?.id,
  active: Boolean(resolveCodexEntry(label)),
});

export const scriptureFoundationEntries: ScriptureFoundationEntry[] = [
  {
    id: "genesis-1-1",
    label: "Thora-Fundament",
    foundationTitle: "Ursprungskammer",
    foundationSubtitle: "Hier liegt der Text, aus dem der Symbolraum waechst.",
    hebrewText: "\u05d1\u05b0\u05bc\u05e8\u05b5\u05d0\u05e9\u05b4\u05c1\u05d9\u05ea \u05d1\u05b8\u05bc\u05e8\u05b8\u05d0 \u05d0\u05b1\u05dc\u05b9\u05d4\u05b4\u05d9\u05dd \u05d0\u05b5\u05ea \u05d4\u05b7\u05e9\u05b8\u05bc\u05c1\u05de\u05b7\u05d9\u05b4\u05dd \u05d5\u05b0\u05d0\u05b5\u05ea \u05d4\u05b8\u05d0\u05b8\u05e8\u05b6\u05e5",
    germanWorkingText: "Im Anfang schuf Gott den Himmel und die Erde.",
    sceneSummary: "Vor allem steht der Anfang. Himmel und Erde werden als Ursprungsspannung sichtbar.",
    coreWords: [
      { order: 1, hebrew: "\u05d1\u05b0\u05bc\u05e8\u05b5\u05d0\u05e9\u05b4\u05c1\u05d9\u05ea", transliteration: "bereschit", german: "im Anfang", note: "Der Vers beginnt nicht mit Erklaerung, sondern mit Ursprung.", symbolIds: ["anfang", "schoepfung"], meaningIds: ["birth", "hiddenness"] },
      { order: 2, hebrew: "\u05d1\u05b8\u05bc\u05e8\u05b8\u05d0", transliteration: "bara", german: "schaffen", letters: [letter("bet"), letter("resh"), letter("aleph")], symbolIds: ["schoepfung", "licht"], meaningIds: ["revelation", "word", "birth"] },
      { order: 4, hebrew: "\u05e9\u05b8\u05c1\u05de\u05b7\u05d9\u05b4\u05dd", transliteration: "schamajim", german: "Himmel", letters: [letter("shin"), letter("mem"), letter("jod"), letter("mem")], symbolIds: ["himmel", "wasser", "licht"], roomIds: ["licht"], meaningIds: ["light", "revelation", "depth"] },
      { order: 5, hebrew: "\u05d0\u05b8\u05e8\u05b6\u05e5", transliteration: "erez", german: "Erde / Land", letters: [letter("aleph"), letter("resh"), letter("tsadi")], symbolIds: ["erde", "brot", "wueste"], roomIds: ["brot", "wueste"], meaningIds: ["life", "nourishment", "path"] },
    ],
    passiveWords: [
      { order: 3, hebrew: "\u05d0\u05b1\u05dc\u05b9\u05d4\u05b4\u05d9\u05dd", transliteration: "elohim", german: "Gott", note: "Als Gottesname im Pilot passiv sichtbar, noch ohne eigenen Codex-Eintrag." },
    ],
    linkedLetters: [letter("aleph"), letter("mem")],
    openedSymbols: ["anfang", "schoepfung", "himmel", "erde"],
    openedRooms: ["licht", "wasser", "wueste", "brot"],
    openedMeanings: ["birth", "hiddenness", "life", "revelation"],
    openedJourneys: ["tehom-ruach-davar-qol-or"],
    openedPatterns: [],
    openedNumbers: ["zahl-1", "zahl-40"],
    growingRooms: [
      { id: "schoepfung", label: "Schoepfung", note: "Der Symbolraum beginnt als gesetzter Anfang." },
      { id: "licht", label: "Licht", note: "Himmel und Anfang bereiten Sichtbarkeit vor." },
      { id: "brot", label: "Erde", note: "Erde wird der spaetere Raum von Nahrung, Boden und Frucht." },
    ],
  },
  {
    id: "genesis-1-2",
    label: "Thora-Fundament",
    foundationTitle: "Ursprungskammer",
    foundationSubtitle: "Hier liegt der Text, aus dem der Symbolraum waechst.",
    hebrewText: "\u05d5\u05b0\u05d4\u05b8\u05d0\u05b8\u05e8\u05b6\u05e5 \u05d4\u05b8\u05d9\u05b0\u05ea\u05b8\u05d4 \u05ea\u05b9\u05d4\u05d5\u05bc \u05d5\u05b8\u05d1\u05b9\u05d4\u05d5\u05bc \u05d5\u05b0\u05d7\u05b9\u05e9\u05b6\u05c1\u05da\u05b0 \u05e2\u05b7\u05dc\u05be\u05e4\u05b0\u05bc\u05e0\u05b5\u05d9 \u05ea\u05b0\u05d4\u05d5\u05b9\u05dd \u05d5\u05b0\u05e8\u05d5\u05bc\u05d7\u05b7 \u05d0\u05b1\u05dc\u05b9\u05d4\u05b4\u05d9\u05dd \u05de\u05b0\u05e8\u05b7\u05d7\u05b6\u05e4\u05b6\u05ea \u05e2\u05b7\u05dc\u05be\u05e4\u05b0\u05bc\u05e0\u05b5\u05d9 \u05d4\u05b7\u05de\u05b8\u05bc\u05d9\u05b4\u05dd",
    germanWorkingText: "Und die Erde war wuest und leer; Finsternis lag auf der Tiefe, und der Geist Gottes schwebte ueber den Wassern.",
    sceneSummary: "Die Tiefe liegt offen. Der Geist schwebt ueber den Wassern.",
    coreWords: [
      { order: 1, hebrew: "\u05d0\u05b6\u05e8\u05b6\u05e5", transliteration: "erez", german: "Erde / Land", letters: [letter("aleph"), letter("resh"), letter("tsadi")], symbolIds: ["erde"], roomIds: ["wueste", "brot"], meaningIds: ["life", "path"] },
      { order: 5, codexId: "tehom", hebrew: "\u05ea\u05b0\u05d4\u05d5\u05b9\u05dd", transliteration: "tehom", german: "Tiefe / Urflut", letters: [letter("tav"), letter("he"), letter("vav"), letter("mem")], symbolIds: ["tiefe", "wasser"], roomIds: ["wasser"], meaningIds: ["depth", "hiddenness", "chaos"], numberIds: ["zahl-40"] },
      { order: 6, codexId: "ruach", hebrew: "\u05e8\u05d5\u05bc\u05d7\u05b7", transliteration: "ruach", german: "Geist / Atem / Wind", letters: [letter("resh"), letter("vav"), letter("chet")], symbolIds: ["geist", "licht", "wasser"], roomIds: ["wasser", "licht"], meaningIds: ["presence", "life", "voice"] },
      { order: 8, codexId: "majim", hebrew: "\u05de\u05b8\u05bc\u05d9\u05b4\u05dd", transliteration: "majim", german: "Wasser", letters: [letter("mem"), letter("jod"), letter("mem")], symbolIds: ["wasser", "tiefe"], roomIds: ["wasser"], meaningIds: ["depth", "birth", "hiddenness"], numberIds: ["zahl-90", "zahl-40"] },
    ],
    passiveWords: [
      { order: 2, hebrew: "\u05ea\u05b9\u05d4\u05d5\u05bc", transliteration: "tohu", german: "Wuestheit", note: "Im Pilot passiv sichtbar; ein eigener Wort-Codex ist noch nicht angelegt.", meaningIds: ["chaos", "hiddenness"] },
      { order: 3, hebrew: "\u05d1\u05b9\u05d4\u05d5\u05bc", transliteration: "bohu", german: "Leere", note: "Im Pilot passiv sichtbar; keine kuenstliche Vollstaendigkeit.", meaningIds: ["chaos", "hiddenness"] },
      { order: 4, hebrew: "\u05d7\u05b9\u05e9\u05b6\u05c1\u05da\u05b0", transliteration: "choschech", german: "Finsternis", note: "Noch ohne eigenen Codex-Eintrag, aber als Verskraft sichtbar.", meaningIds: ["hiddenness", "chaos"] },
      { order: 7, hebrew: "\u05d0\u05b1\u05dc\u05b9\u05d4\u05b4\u05d9\u05dd", transliteration: "elohim", german: "Gott", note: "Als Gottesname im Pilot passiv sichtbar." },
    ],
    linkedLetters: [letter("mem"), letter("aleph")],
    openedSymbols: ["wasser", "tiefe", "geist"],
    openedRooms: ["wasser", "licht"],
    openedMeanings: ["chaos", "depth", "hiddenness", "presence", "life"],
    openedJourneys: ["journey-wasser-geist", "tehom-ruach-davar-qol-or", "tehom-davar-qol-or"],
    openedPatterns: [],
    openedNumbers: ["zahl-40", "zahl-90"],
    growingRooms: [
      { id: "wasser", label: "Wasser", note: "Wasser wurzelt hier als Anfangsraum vor der Ordnung." },
      { id: "tiefe", label: "Tiefe", note: "Tehom macht den Raum unter der sichtbaren Oberflaeche lesbar." },
      { id: "ruach", label: "Geist / Ruach", note: "Die Bewegung des Geistes beruehrt die Wasser, bevor Licht gerufen wird." },
      { id: "schoepfung", label: "Ordnungsvorbereitung", note: "Noch nicht Ordnung, aber der Raum, aus dem Ordnung wachsen kann." },
    ],
  },
  {
    id: "genesis-1-3",
    label: "Thora-Fundament",
    foundationTitle: "Ursprungskammer",
    foundationSubtitle: "Hier liegt der Text, aus dem der Symbolraum waechst.",
    hebrewText: "\u05d5\u05b7\u05d9\u05b9\u05bc\u05d0\u05de\u05b6\u05e8 \u05d0\u05b1\u05dc\u05b9\u05d4\u05b4\u05d9\u05dd \u05d9\u05b0\u05d4\u05b4\u05d9 \u05d0\u05d5\u05b9\u05e8 \u05d5\u05b7\u05d9\u05b0\u05d4\u05b4\u05d9\u05be\u05d0\u05d5\u05b9\u05e8",
    germanWorkingText: "Und Gott sprach: Licht werde. Und Licht wurde.",
    sceneSummary: "Das Wort ruft Licht. Offenbarung beginnt nicht als Erklaerung, sondern als Ruf.",
    coreWords: [
      { order: 1, codexId: "davar", hebrew: "\u05d5\u05b7\u05d9\u05b9\u05bc\u05d0\u05de\u05b6\u05e8", transliteration: "wajomer", german: "und er sprach", note: "Der vorhandene Codex fasst diese Kraft im Wortkoerper Davar.", letters: [letter("dalet"), letter("bet"), letter("resh")], symbolIds: ["wort", "offenbarung"], roomIds: ["licht"], meaningIds: ["word", "voice", "revelation"] },
      { order: 4, codexId: "or", hebrew: "\u05d0\u05d5\u05b9\u05e8", transliteration: "or", german: "Licht", letters: [letter("aleph"), letter("vav"), letter("resh")], symbolIds: ["licht", "offenbarung"], roomIds: ["licht"], meaningIds: ["light", "revelation", "awareness"], numberIds: ["zahl-1"] },
    ],
    passiveWords: [
      { order: 2, hebrew: "\u05d0\u05b1\u05dc\u05b9\u05d4\u05b4\u05d9\u05dd", transliteration: "elohim", german: "Gott", note: "Als Gottesname im Pilot passiv sichtbar." },
      { order: 3, hebrew: "\u05d9\u05b0\u05d4\u05b4\u05d9", transliteration: "jehi", german: "es werde", note: "Die Rufbewegung bleibt sichtbar, ohne eigenen Eintrag zu erzwingen.", meaningIds: ["calling", "word"] },
    ],
    linkedLetters: [letter("aleph")],
    openedSymbols: ["licht", "wort", "offenbarung", "ordnung"],
    openedRooms: ["licht"],
    openedMeanings: ["word", "voice", "light", "revelation", "guidance"],
    openedJourneys: ["davar-qol-or", "tehom-davar-qol-or", "tehom-ruach-davar-qol-or"],
    openedPatterns: [],
    openedNumbers: ["zahl-1"],
    growingRooms: [
      { id: "licht", label: "Licht", note: "Das Licht ist hier nicht Idee, sondern gerufene Sichtbarkeit." },
      { id: "wort", label: "Wort", note: "Der Raum des Wortes wurzelt im ersten Ruf." },
      { id: "offenbarung", label: "Offenbarung", note: "Sichtbarkeit waechst aus dem gesprochenen Anfang." },
      { id: "ordnung", label: "Ordnung", note: "Licht bereitet Unterscheidung vor." },
    ],
  },
  {
    id: "exodus-14",
    label: "Thora-Fundament",
    foundationTitle: "Ursprungskammer",
    foundationSubtitle: "Hier liegt der Text, aus dem der Symbolraum waechst.",
    hebrewText: "\u05d5\u05b7\u05d9\u05b5\u05bc\u05d8 \u05de\u05b9\u05e9\u05b6\u05c1\u05d4 \u05d0\u05b6\u05ea\u05be\u05d9\u05b8\u05d3\u05d5\u05b9 \u05e2\u05b7\u05dc\u05be\u05d4\u05b7\u05d9\u05b8\u05bc\u05dd \u05d5\u05b7\u05d9\u05bc\u05d5\u05b9\u05dc\u05b6\u05da\u05b0 \u05d9\u05b0\u05d4\u05d5\u05b8\u05d4 \u05d0\u05b6\u05ea\u05be\u05d4\u05b7\u05d9\u05b8\u05bc\u05dd \u05d1\u05b0\u05bc\u05e8\u05d5\u05bc\u05d7\u05b7 \u05e7\u05b8\u05d3\u05b4\u05d9\u05dd \u05e2\u05b7\u05d6\u05b8\u05bc\u05d4 \u05db\u05b8\u05bc\u05dc\u05be\u05d4\u05b7\u05dc\u05b7\u05bc\u05d9\u05b0\u05dc\u05b8\u05d4 \u05d5\u05b7\u05d9\u05b8\u05bc\u05e9\u05b6\u05c2\u05dd \u05d0\u05b6\u05ea\u05be\u05d4\u05b7\u05d9\u05b8\u05bc\u05dd \u05dc\u05b6\u05d7\u05b8\u05e8\u05b8\u05d1\u05b8\u05d4",
    germanWorkingText: "Mose streckte seine Hand ueber das Meer aus; und der HERR trieb das Meer durch einen starken Ostwind die ganze Nacht zurueck und machte das Meer zu trockenem Boden.",
    sceneSummary: "Das Wasser wird zur Schwelle. Der Weg entsteht dort, wo kein Weg war.",
    coreWords: [
      { order: 1, hebrew: "\u05d9\u05b8\u05bc\u05dd", transliteration: "jam", german: "Meer", letters: [letter("jod"), letter("mem")], symbolIds: ["wasser", "tiefe"], roomIds: ["wasser"], meaningIds: ["depth", "transition", "hiddenness"], numberIds: ["zahl-40"] },
      { order: 2, codexId: "majim", hebrew: "\u05de\u05b7\u05d9\u05b4\u05dd", transliteration: "majim", german: "Wasser", letters: [letter("mem"), letter("jod"), letter("mem")], symbolIds: ["wasser"], roomIds: ["wasser"], meaningIds: ["depth", "transition"], numberIds: ["zahl-90"] },
      { order: 3, codexId: "ruach", hebrew: "\u05e8\u05d5\u05bc\u05d7\u05b7", transliteration: "ruach", german: "Wind / Geist", letters: [letter("resh"), letter("vav"), letter("chet")], symbolIds: ["geist"], roomIds: ["wasser", "licht"], meaningIds: ["presence", "transition"] },
      { order: 4, hebrew: "\u05d3\u05b6\u05bc\u05e8\u05b6\u05da\u05b0", transliteration: "derech", german: "Weg", letters: [letter("dalet"), letter("resh"), letter("kaf")], symbolIds: ["uebergang"], roomIds: ["wueste"], meaningIds: ["path", "guidance", "transition"] },
    ],
    passiveWords: [
      { order: 5, hebrew: "\u05d7\u05b8\u05e8\u05b8\u05d1\u05b8\u05d4", transliteration: "charavah", german: "trockenes Land", note: "Der Durchgang wird im Pilot sichtbar, ohne neuen Wort-Codex." },
    ],
    linkedLetters: [letter("mem"), letter("aleph")],
    openedSymbols: ["wasser", "uebergang", "offenbarung", "schilfmeer"],
    openedRooms: ["wasser", "wueste"],
    openedMeanings: ["depth", "transition", "guidance", "trust", "path"],
    openedJourneys: ["journey-chaos-ordnung", "journey-wasser-geist"],
    openedPatterns: ["pattern-schwelle-durch-wasser"],
    openedNumbers: ["zahl-40", "zahl-90"],
    growingRooms: [
      { id: "wasser", label: "Wasser", note: "Das Wasser wird Grenze, Schwelle und Weg." },
      { id: "schilfmeer", label: "Schwelle", note: "Der Durchgang sammelt die Exodus-Wasserpassage." },
      { id: "offenbarung", label: "Rettung", note: "Rettung wird als oeffnender Weg sichtbar." },
      { id: "midbar", label: "Weg", note: "Hinter dem Wasser beginnt der offene Weg in die Wuestenweite." },
    ],
  },
];

const scriptureFoundationById = new Map(scriptureFoundationEntries.map((entry) => [entry.id, entry]));
const symbolRoomIds = new Set(["wasser", "licht", "feuer", "wueste", "brot"]);

function humanizeId(value: string) {
  return value
    .replace(/^(pattern|ontology|rel)-/, "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toLocaleUpperCase("de-DE") + part.slice(1))
    .join(" ");
}

function uniqueStrings(items: string[]) {
  return Array.from(new Set(items));
}

function hasScriptureFoundationRoom(id: string) {
  return symbolRoomIds.has(id);
}

function buildScriptureFoundationRoomHref(id: string) {
  const params = new URLSearchParams({ from: "codex", symbol: id });

  return `/raeume/${id}?${params.toString()}`;
}

function getMeaningFieldLabel(fieldId: string) {
  return meaningNodes.find((node) => node.id === fieldId)?.label ?? humanizeId(fieldId);
}

function buildCodexLink(id: string): ScriptureFoundationLink {
  const codexEntry = resolveCodexEntry(id);
  const ontologyEntity = codexEntry ? undefined : getOntologyEntity(id);
  const linkedEntry = codexEntry ?? ontologyEntity;

  return {
    id,
    label: linkedEntry?.title ?? humanizeId(id),
    href: linkedEntry ? `/codex/${linkedEntry.id}` : undefined,
  };
}

function buildRoomLink(id: string): ScriptureFoundationLink {
  if (hasScriptureFoundationRoom(id)) {
    return {
      id,
      label: getOntologyEntityTitle(id) ?? humanizeId(id),
      href: buildScriptureFoundationRoomHref(id),
    };
  }

  return buildCodexLink(id);
}

function buildMeaningFieldLink(id: MeaningNodeId): ScriptureFoundationLink {
  const linkedEntry = resolveCodexEntry(id);

  return {
    id,
    label: getMeaningFieldLabel(id),
    href: linkedEntry ? `/codex/${linkedEntry.id}` : undefined,
  };
}

function buildLetterChip(item: ScriptureFoundationLetter, index: number, fallbackGlyphs: string[]) {
  const letterEntry = hebrewLetters.find((candidate) => candidate.id === item.label);
  const linkedEntry = item.codexId ? resolveCodexEntry(item.codexId) : undefined;

  return {
    id: item.label,
    glyph: fallbackGlyphs[index] ?? letterEntry?.glyph ?? item.label,
    label: letterEntry?.name ?? humanizeId(item.label),
    href: linkedEntry ? `/codex/${linkedEntry.id}` : undefined,
    value: letterEntry?.numericValue,
  };
}

function buildFoundationWord(seed: ScriptureFoundationCoreWord | ScriptureFoundationPassiveWord): ScriptureFoundationWord {
  const existingWord = "codexId" in seed && seed.codexId
    ? hebrewWords.find((word) => word.id === seed.codexId)
    : undefined;
  const linkedEntry = "codexId" in seed && seed.codexId ? resolveCodexEntry(seed.codexId) : undefined;
  const fallbackGlyphs = Array.from(seed.hebrew.replace(/[\u0591-\u05c7]/g, ""));
  const letters = "letters" in seed ? seed.letters ?? [] : [];
  const symbolIds = "symbolIds" in seed ? seed.symbolIds ?? existingWord?.relatedSymbolSlugs ?? [] : [];
  const roomIds = "roomIds" in seed ? seed.roomIds ?? [] : [];
  const numberIds = "numberIds" in seed ? seed.numberIds ?? [] : [];

  return {
    hebrew: seed.hebrew,
    transliteration: seed.transliteration,
    meaning: seed.german,
    note: seed.note,
    codexHref: linkedEntry ? `/codex/${linkedEntry.id}` : undefined,
    existingWord,
    gematria: existingWord?.gematria ?? ("codexId" in seed && seed.codexId ? breakdownHebrewWord(seed.hebrew).value : undefined),
    letters: letters.map((item, index) => buildLetterChip(item, index, fallbackGlyphs)),
    symbols: uniqueStrings(symbolIds).map((id) => buildCodexLink(id)),
    rooms: uniqueStrings(roomIds).map((id) => buildRoomLink(id)),
    meaningFields: (uniqueStrings(seed.meaningIds ?? []) as MeaningNodeId[]).map((id) => buildMeaningFieldLink(id)),
    numbers: uniqueStrings(numberIds).map((id) => buildCodexLink(id)),
  };
}

function buildFoundationLinks(ids: string[] | undefined, resolver: (id: string) => ScriptureFoundationLink = buildCodexLink) {
  return uniqueStrings(ids ?? []).map((id) => resolver(id));
}

export function getScriptureFoundation(entryId: string): ScriptureFoundationEntry | undefined {
  return scriptureFoundationById.get(entryId as ScriptureFoundationEntry["id"]);
}

export function hasScriptureFoundation(entryId: string): boolean {
  return scriptureFoundationById.has(entryId as ScriptureFoundationEntry["id"]);
}

export function getLinkedScriptureFoundationTargets(entryId: string) {
  const foundation = getScriptureFoundation(entryId);

  if (!foundation) {
    return [];
  }

  return uniqueStrings([
    ...foundation.coreWords.flatMap((word) => word.codexId ? [word.codexId] : []),
    ...foundation.linkedLetters.flatMap((item) => item.codexId && item.active ? [item.codexId] : []),
    ...foundation.openedSymbols,
    ...foundation.openedRooms,
    ...foundation.openedJourneys,
    ...foundation.openedPatterns,
    ...foundation.openedNumbers,
  ]);
}

export function buildScriptureFoundationModel(entry: CodexEntry): ScriptureFoundationModel | null {
  const foundation = getScriptureFoundation(entry.id);

  if (!foundation) {
    return null;
  }

  const wordLayer = [...foundation.coreWords, ...foundation.passiveWords]
    .sort((left, right) => left.order - right.order);

  return {
    label: foundation.label,
    foundationTitle: foundation.foundationTitle,
    foundationSubtitle: foundation.foundationSubtitle,
    sceneSummary: foundation.sceneSummary,
    hebrewText: foundation.hebrewText,
    germanText: foundation.germanWorkingText,
    words: wordLayer.map(buildFoundationWord),
    connections: {
      words: buildFoundationLinks(foundation.coreWords.flatMap((word) => word.codexId ? [word.codexId] : [])),
      letters: foundation.linkedLetters
        .filter((item) => item.active && item.codexId)
        .map((item) => buildCodexLink(item.codexId as string)),
      symbols: buildFoundationLinks(foundation.openedSymbols),
      rooms: buildFoundationLinks(foundation.openedRooms, buildRoomLink),
      meaningFields: (uniqueStrings(foundation.openedMeanings) as MeaningNodeId[]).map((id) => buildMeaningFieldLink(id)),
      journeys: buildFoundationLinks(foundation.openedJourneys),
      patterns: buildFoundationLinks(foundation.openedPatterns),
      numbers: buildFoundationLinks(foundation.openedNumbers),
    },
    growingRooms: foundation.growingRooms.map((room) => ({
      ...buildRoomLink(room.id),
      note: room.note,
      label: room.label,
    })),
  };
}

export function validateScriptureFoundationData() {
  const errors: string[] = [];
  const codexIds = new Set<string>();
  const letterIds = new Set(hebrewLetters.map((item) => item.id));
  const meaningIds = new Set(meaningNodes.map((node) => node.id));
  const journeyIds = new Set(meaningJourneys.map((journey) => journey.id));

  scriptureFoundationEntries.forEach((entry) => {
    if (!entry.id.trim()) errors.push(`ScriptureFoundation entry without id.`);
    if (!entry.hebrewText.trim()) errors.push(`ScriptureFoundation "${entry.id}" needs hebrewText.`);
    if (!entry.germanWorkingText.trim()) errors.push(`ScriptureFoundation "${entry.id}" needs germanWorkingText.`);

    entry.coreWords.forEach((word) => {
      if (word.codexId && !resolveCodexEntry(word.codexId)) {
        errors.push(`ScriptureFoundation "${entry.id}" core word "${word.transliteration}" links missing codexId "${word.codexId}".`);
      }

      word.letters?.forEach((item) => {
        if (!letterIds.has(item.label)) {
          errors.push(`ScriptureFoundation "${entry.id}" word "${word.transliteration}" uses missing letter "${item.label}".`);
        }

        if (item.active && (!item.codexId || !resolveCodexEntry(item.codexId))) {
          errors.push(`ScriptureFoundation "${entry.id}" word "${word.transliteration}" has active letter "${item.label}" without Codex target.`);
        }
      });

      word.roomIds?.forEach((roomId) => {
        if (!hasScriptureFoundationRoom(roomId)) {
          errors.push(`ScriptureFoundation "${entry.id}" word "${word.transliteration}" uses missing roomId "${roomId}".`);
        }
      });

      word.numberIds?.forEach((numberId) => {
        if (!resolveCodexEntry(numberId)) {
          errors.push(`ScriptureFoundation "${entry.id}" word "${word.transliteration}" uses missing numberId "${numberId}".`);
        }
      });

      word.meaningIds?.forEach((meaningId) => {
        if (!meaningIds.has(meaningId)) {
          errors.push(`ScriptureFoundation "${entry.id}" word "${word.transliteration}" uses missing meaningId "${meaningId}".`);
        }
      });
    });

    entry.linkedLetters.forEach((item) => {
      if (!letterIds.has(item.label)) {
        errors.push(`ScriptureFoundation "${entry.id}" links missing letter "${item.label}".`);
      }

      if (item.active && (!item.codexId || !resolveCodexEntry(item.codexId))) {
        errors.push(`ScriptureFoundation "${entry.id}" has active letter "${item.label}" without Codex target.`);
      }
    });

    entry.openedRooms.forEach((roomId) => {
      if (!hasScriptureFoundationRoom(roomId)) {
        errors.push(`ScriptureFoundation "${entry.id}" opens missing room "${roomId}".`);
      }
    });

    entry.openedNumbers.forEach((numberId) => {
      if (!resolveCodexEntry(numberId)) {
        errors.push(`ScriptureFoundation "${entry.id}" opens missing number "${numberId}".`);
      }
    });

    entry.openedMeanings.forEach((meaningId) => {
      if (!meaningIds.has(meaningId)) {
        errors.push(`ScriptureFoundation "${entry.id}" opens missing meaning "${meaningId}".`);
      }
    });

    entry.openedJourneys.forEach((journeyId) => {
      if (!resolveCodexEntry(journeyId) && !journeyIds.has(journeyId)) {
        errors.push(`ScriptureFoundation "${entry.id}" opens missing journey "${journeyId}".`);
      }
    });

    entry.openedPatterns.forEach((patternId) => {
      if (!getOntologyEntity(patternId) && !resolveCodexEntry(patternId)) {
        errors.push(`ScriptureFoundation "${entry.id}" opens missing pattern "${patternId}".`);
      }
    });
  });

  scriptureFoundationEntries.flatMap((entry) => entry.coreWords).forEach((word) => {
    if (word.codexId) codexIds.add(word.codexId);
  });

  return {
    valid: errors.length === 0,
    errors,
    stats: {
      entries: scriptureFoundationEntries.length,
      linkedCoreWords: codexIds.size,
    },
  };
}
