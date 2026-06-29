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
  letters?: ScriptureFoundationLetter[];
  meaningIds?: MeaningNodeId[];
  symbolIds?: string[];
  roomIds?: string[];
  numberIds?: string[];
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
  layer: "core" | "passive";
  codexHref?: string;
  existingWord?: HebrewWord;
  gematria?: number;
  letters: {
    id?: string;
    glyph: string;
    label: string;
    meaning?: string;
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
    foundationTitle: "Der Ursprung wird gesetzt",
    foundationSubtitle: "Himmel und Erde stehen noch vor sichtbarer Ordnung, aber der Anfang ist gesetzt: Bet oeffnet den Raum, Aleph bleibt im Wort verborgen.",
    hebrewText: "\u05d1\u05b0\u05bc\u05e8\u05b5\u05d0\u05e9\u05b4\u05c1\u05d9\u05ea \u05d1\u05b8\u05bc\u05e8\u05b8\u05d0 \u05d0\u05b1\u05dc\u05b9\u05d4\u05b4\u05d9\u05dd \u05d0\u05b5\u05ea \u05d4\u05b7\u05e9\u05b8\u05bc\u05c1\u05de\u05b7\u05d9\u05b4\u05dd \u05d5\u05b0\u05d0\u05b5\u05ea \u05d4\u05b8\u05d0\u05b8\u05e8\u05b6\u05e5",
    germanWorkingText: "Im Anfang schuf Gott den Himmel und die Erde.",
    sceneSummary: "Der Anfang wird gesetzt. Himmel und Erde treten als erste Weite auseinander, und die kommende Ordnung liegt noch still im Ursprung.",
    coreWords: [
      { order: 1, codexId: "bereschit", hebrew: "\u05d1\u05b0\u05bc\u05e8\u05b5\u05d0\u05e9\u05b4\u05c1\u05d9\u05ea", transliteration: "bereschit", german: "im Anfang", note: "Der Vers beginnt nicht mit Erklaerung, sondern mit Ursprung. Bet oeffnet den Innenraum, Resch richtet aus, Aleph bleibt der stille Anfang im Wort.", letters: [letter("bet"), letter("resh"), letter("aleph"), letter("shin"), letter("jod"), letter("tav")], symbolIds: ["anfang", "ursprung", "schoepfung"], meaningIds: ["birth", "hiddenness", "revelation"], numberIds: ["zahl-1"] },
      { order: 2, codexId: "bara", hebrew: "\u05d1\u05b8\u05bc\u05e8\u05b8\u05d0", transliteration: "bara", german: "schaffen", note: "Bara markiert Schaffen als gesetzten Anfang, nicht als dekorative Fantasie: Wirklichkeit bekommt ihren ersten Horizont.", letters: [letter("bet"), letter("resh"), letter("aleph")], symbolIds: ["schoepfung", "ordnung", "licht"], roomIds: ["licht"], meaningIds: ["revelation", "word", "birth", "hiddenness"], numberIds: ["zahl-1"] },
      { order: 3, codexId: "elohim", hebrew: "\u05d0\u05b1\u05dc\u05b9\u05d4\u05b4\u05d9\u05dd", transliteration: "elohim", german: "Gott", note: "Der Gottesname bleibt ehrfuerchtig sichtbar: nicht als Spekulation, sondern als Schriftkoerper von Ursprung, Gegenwart und Schaffen.", letters: [letter("aleph"), letter("lamed"), letter("he"), letter("jod"), letter("mem")], symbolIds: ["ursprung", "offenbarung"], meaningIds: ["presence", "hiddenness", "revelation"] },
      { order: 4, codexId: "schamajim", hebrew: "\u05e9\u05b8\u05c1\u05de\u05b7\u05d9\u05b4\u05dd", transliteration: "schamajim", german: "Himmel", note: "Schamajim oeffnet den oberen Raum: Wasserklang, Lichtweite und die erste Spannung von oben und unten.", letters: [letter("shin"), letter("mem"), letter("jod"), letter("mem")], symbolIds: ["himmel", "wasser", "licht", "ordnung"], roomIds: ["wasser", "licht"], meaningIds: ["light", "revelation", "depth", "guidance"], numberIds: ["zahl-40", "zahl-90"] },
      { order: 5, codexId: "erez", hebrew: "\u05d0\u05b8\u05e8\u05b6\u05e5", transliteration: "erez", german: "Erde / Land", note: "Erez ist der untere Raum, der noch nicht ausgeformt ist und doch schon als tragender Boden angesprochen wird.", letters: [letter("aleph"), letter("resh"), letter("tsadi")], symbolIds: ["erde", "brot", "wueste"], roomIds: ["brot", "wueste"], meaningIds: ["life", "nourishment", "path", "guidance"], numberIds: ["zahl-1", "zahl-90"] },
    ],
    passiveWords: [
      { order: 6, hebrew: "\u05d0\u05b5\u05ea", transliteration: "et", german: "Akkusativzeichen", note: "Et bleibt grammatisch sichtbar: Aleph und Tav umgreifen symbolisch gelesen die Spannweite von Anfang und Zeichen, ohne hier als eigener Codex-Weg aktiviert zu werden.", letters: [letter("aleph"), letter("tav")], meaningIds: ["hiddenness", "word"], numberIds: ["zahl-1"] },
    ],
    linkedLetters: [letter("bet"), letter("resh"), letter("aleph"), letter("shin"), letter("jod"), letter("tav"), letter("mem"), letter("he"), letter("lamed")],
    openedSymbols: ["anfang", "ursprung", "schoepfung", "ordnung", "himmel", "erde", "offenbarung"],
    openedRooms: ["licht", "wasser", "wueste", "brot"],
    openedMeanings: ["birth", "hiddenness", "life", "revelation", "word", "guidance"],
    openedJourneys: ["creation", "journey-chaos-ordnung", "tehom-ruach-davar-qol-or"],
    openedPatterns: ["pattern-chaos-ordnung-offenbarung"],
    openedNumbers: ["zahl-1", "zahl-40", "zahl-90"],
    growingRooms: [
      { id: "schoepfung", label: "Schoepfung", note: "Der Symbolraum beginnt als gesetzter Anfang: noch ruhig, aber bereits tragend." },
      { id: "licht", label: "Licht", note: "Himmel und Anfang bereiten Sichtbarkeit vor, ohne das Licht schon auszusprechen." },
      { id: "wasser", label: "Wasser", note: "Schamajim beruehrt den Wasserklang, der im naechsten Vers zur Tiefe wird." },
      { id: "brot", label: "Erde", note: "Erde wird der spaetere Raum von Boden, Nahrung und bewohnbarer Gestalt." },
      { id: "genesis-1-2", label: "Weiter in die Tiefe", note: "Der gesetzte Ursprung fuehrt in den ungeformten Raum von Wasser, Dunkel und Ruach." },
    ],
  },
  {
    id: "genesis-1-2",
    label: "Thora-Fundament",
    foundationTitle: "Die Tiefe ist noch ungeordnet, aber nicht leer von Gott",
    foundationSubtitle: "Tohu wa-bohu, Finsternis und Wasser sind kein Nichts. Ueber der Tiefe liegt Bewegung: Ruach schwebt, bevor Licht sichtbar wird.",
    hebrewText: "\u05d5\u05b0\u05d4\u05b8\u05d0\u05b8\u05e8\u05b6\u05e5 \u05d4\u05b8\u05d9\u05b0\u05ea\u05b8\u05d4 \u05ea\u05b9\u05d4\u05d5\u05bc \u05d5\u05b8\u05d1\u05b9\u05d4\u05d5\u05bc \u05d5\u05b0\u05d7\u05b9\u05e9\u05b6\u05c1\u05da\u05b0 \u05e2\u05b7\u05dc\u05be\u05e4\u05b0\u05bc\u05e0\u05b5\u05d9 \u05ea\u05b0\u05d4\u05d5\u05b9\u05dd \u05d5\u05b0\u05e8\u05d5\u05bc\u05d7\u05b7 \u05d0\u05b1\u05dc\u05b9\u05d4\u05b4\u05d9\u05dd \u05de\u05b0\u05e8\u05b7\u05d7\u05b6\u05e4\u05b6\u05ea \u05e2\u05b7\u05dc\u05be\u05e4\u05b0\u05bc\u05e0\u05b5\u05d9 \u05d4\u05b7\u05de\u05b8\u05bc\u05d9\u05b4\u05dd",
    germanWorkingText: "Und die Erde war wuest und leer; Finsternis lag auf der Tiefe, und der Geist Gottes schwebte ueber den Wassern.",
    sceneSummary: "Der gesetzte Ursprung ist noch nicht geformt. Tiefe, Dunkel und Wasser liegen offen; die Ruach bewegt sich ueber ihnen, bevor Licht gerufen wird.",
    coreWords: [
      { order: 1, codexId: "erez", hebrew: "\u05d0\u05b6\u05e8\u05b6\u05e5", transliteration: "erez", german: "Erde / Land", note: "Die Erde aus Genesis 1,1 ist jetzt noch ungestaltet. Der Boden ist genannt, aber noch nicht bewohnbar.", letters: [letter("aleph"), letter("resh"), letter("tsadi")], symbolIds: ["erde", "wueste", "brot"], roomIds: ["wueste", "brot"], meaningIds: ["life", "path", "hiddenness"] },
      { order: 2, codexId: "haja", hebrew: "\u05d4\u05b8\u05d9\u05b0\u05ea\u05b8\u05d4", transliteration: "hajeta / haja", german: "war / wurde", note: "Haja bleibt als Seins- und Werdensspur sichtbar: Der Vers beschreibt einen Zustand, der noch nicht Endgestalt ist.", letters: [letter("he"), letter("jod"), letter("tav"), letter("he")], symbolIds: ["wandlung"], meaningIds: ["hiddenness", "transition"] },
      { order: 3, codexId: "tohu", hebrew: "\u05ea\u05b9\u05d4\u05d5\u05bc", transliteration: "tohu", german: "Wuestheit / Formlosigkeit", note: "Tohu wird nicht romantisiert. Es benennt den ungeformten Raum, in dem Ordnung noch nicht lesbar ist.", letters: [letter("tav"), letter("he"), letter("vav")], symbolIds: ["wueste", "tiefe"], roomIds: ["wueste"], meaningIds: ["chaos", "hiddenness", "desert"] },
      { order: 4, codexId: "vohu", hebrew: "\u05d5\u05b8\u05d1\u05b9\u05d4\u05d5\u05bc", transliteration: "vohu", german: "und Leere", note: "Vohu bleibt als Leere sichtbar: kein Nichts, sondern ein noch unbesetzter Raum, der mit Tohu zusammen den Anfangszustand beschreibt.", letters: [letter("vav"), letter("bet"), letter("he"), letter("vav")], symbolIds: ["wueste"], roomIds: ["wueste"], meaningIds: ["chaos", "hiddenness", "lack"] },
      { order: 5, codexId: "choschech", hebrew: "\u05d7\u05b9\u05e9\u05b6\u05c1\u05da\u05b0", transliteration: "choschech", german: "Finsternis", note: "Choschech ist die bedeckte Sichtbarkeit vor dem Licht. Die Dunkelheit wird genannt, ohne schon aufgeloest zu sein.", letters: [letter("chet"), letter("shin"), letter("kaf")], symbolIds: ["verborgenheit"], meaningIds: ["hiddenness", "chaos"] },
      { order: 6, codexId: "tehom", hebrew: "\u05ea\u05b0\u05d4\u05d5\u05b9\u05dd", transliteration: "tehom", german: "Tiefe / Urflut", note: "Tehom ist die Tiefe unter der sichtbaren Ordnung: nicht einfach Wasser, sondern Ursprungstiefe vor Form.", letters: [letter("tav"), letter("he"), letter("vav"), letter("mem")], symbolIds: ["tiefe", "wasser", "ursprung"], roomIds: ["wasser"], meaningIds: ["depth", "hiddenness", "chaos", "birth"], numberIds: ["zahl-40"] },
      { order: 7, codexId: "ruach", hebrew: "\u05e8\u05d5\u05bc\u05d7\u05b7", transliteration: "ruach", german: "Geist / Atem / Wind", note: "Ruach ist die unsichtbare Bewegung ueber der Tiefe: Atem, Wind und Geist in einem verdichteten Wort.", letters: [letter("resh"), letter("vav"), letter("chet")], symbolIds: ["geist", "licht", "wasser", "offenbarung"], roomIds: ["wasser", "licht"], meaningIds: ["presence", "life", "voice", "word", "revelation"] },
      { order: 8, codexId: "merachefet", hebrew: "\u05de\u05b0\u05e8\u05b7\u05d7\u05b6\u05e4\u05b6\u05ea", transliteration: "merachefet", german: "schwebend / bruetend", note: "Merachefet ist eine behutsame Bewegung ueber dem Wasser, noch vor dem gesprochenen Licht.", letters: [letter("mem"), letter("resh"), letter("chet"), letter("pe"), letter("tav")], symbolIds: ["geist", "wasser"], roomIds: ["wasser"], meaningIds: ["presence", "life", "hiddenness"] },
      { order: 9, codexId: "majim", hebrew: "\u05de\u05b8\u05bc\u05d9\u05b4\u05dd", transliteration: "majim", german: "Wasser", note: "Majim macht den Wasser-Raum des Prototyps konkret: Mem, Jod und finales Mem halten sichtbare und verborgene Tiefe zusammen.", letters: [letter("mem"), letter("jod"), letter("mem")], symbolIds: ["wasser", "tiefe"], roomIds: ["wasser"], meaningIds: ["depth", "birth", "hiddenness", "transition"], numberIds: ["zahl-90", "zahl-40"] },
    ],
    passiveWords: [
      { order: 10, hebrew: "\u05d0\u05b1\u05dc\u05b9\u05d4\u05b4\u05d9\u05dd", transliteration: "elohim", german: "Gott", note: "Der Gottesname bleibt passiv sichtbar; die aktive Bewegung des Verses wird ueber Ruach, Tehom und Majim erschlossen.", letters: [letter("aleph"), letter("lamed"), letter("he"), letter("jod"), letter("mem")], meaningIds: ["presence", "hiddenness"] },
      { order: 11, hebrew: "\u05e4\u05b0\u05bc\u05e0\u05b5\u05d9", transliteration: "pnei", german: "Angesicht / Oberflaeche", note: "Pnei ist sichtbar, aber nicht als eigener Zielraum aktiviert: Die Bewegung geschieht an der Schwelle von Tiefe und Oberflaeche.", letters: [letter("pe"), letter("nun"), letter("jod")], meaningIds: ["presence", "transition"] },
    ],
    linkedLetters: [letter("tav"), letter("he"), letter("vav"), letter("mem"), letter("resh"), letter("chet"), letter("kaf"), letter("pe"), letter("jod"), letter("bet"), letter("shin"), letter("aleph")],
    openedSymbols: ["wasser", "tiefe", "geist", "verborgenheit", "wandlung", "ordnung"],
    openedRooms: ["wasser", "licht", "wueste"],
    openedMeanings: ["chaos", "depth", "hiddenness", "presence", "life", "transition", "voice", "word", "revelation"],
    openedJourneys: ["creation", "journey-chaos-ordnung", "journey-wasser-geist", "tehom-ruach-davar-qol-or", "tehom-davar-qol-or"],
    openedPatterns: ["pattern-schwelle-durch-wasser", "pattern-chaos-ordnung-offenbarung"],
    openedNumbers: ["zahl-40", "zahl-90"],
    growingRooms: [
      { id: "genesis-1-1", label: "Zurueck zum gesetzten Ursprung", note: "Die Tiefe ist nicht losgeloest; sie antwortet auf Himmel und Erde aus Genesis 1,1." },
      { id: "wasser", label: "Wasser", note: "Wasser wurzelt hier als Anfangsraum vor der Ordnung." },
      { id: "tiefe", label: "Tiefe", note: "Tehom macht den Raum unter der sichtbaren Oberflaeche lesbar." },
      { id: "ruach", label: "Geist / Ruach", note: "Die Bewegung des Geistes beruehrt die Wasser, bevor Licht gerufen wird." },
      { id: "licht", label: "Licht", note: "Licht ist noch nicht da, aber die Ruach bereitet den Rueckweg in Sichtbarkeit vor." },
      { id: "genesis-1-3", label: "Weiter zum gesprochenen Licht", note: "Aus Tiefe, Wasser und Geist fuehrt die Genesis-Achse zum Wort: Licht werde." },
    ],
  },
  {
    id: "genesis-1-3",
    label: "Thora-Fundament",
    foundationTitle: "Das Wort oeffnet Sichtbarkeit",
    foundationSubtitle: "Gott spricht, Or wird, und die erste Unterscheidbarkeit tritt hervor: Aleph, Waw und Resch tragen Licht als gerufene Ordnung.",
    hebrewText: "\u05d5\u05b7\u05d9\u05b9\u05bc\u05d0\u05de\u05b6\u05e8 \u05d0\u05b1\u05dc\u05b9\u05d4\u05b4\u05d9\u05dd \u05d9\u05b0\u05d4\u05b4\u05d9 \u05d0\u05d5\u05b9\u05e8 \u05d5\u05b7\u05d9\u05b0\u05d4\u05b4\u05d9\u05be\u05d0\u05d5\u05b9\u05e8",
    germanWorkingText: "Und Gott sprach: Licht werde. Und Licht wurde.",
    sceneSummary: "Das Wort tritt aus der bewegten Tiefe hervor. Licht wird gerufen, Sichtbarkeit beginnt, und die erste Unterscheidung wird vorbereitet.",
    coreWords: [
      { order: 1, codexId: "amar", hebrew: "\u05d0\u05b8\u05de\u05b7\u05e8", transliteration: "amar", german: "sprechen", note: "Amar ist das konkrete Sprechen; Davar und Qol bleiben die weiterfuehrenden Wort- und Stimme-Achsen.", letters: [letter("aleph"), letter("mem"), letter("resh")], symbolIds: ["wort", "offenbarung"], roomIds: ["licht"], meaningIds: ["word", "voice", "revelation", "calling"], numberIds: ["zahl-1", "zahl-40"] },
      { order: 2, codexId: "elohim", hebrew: "\u05d0\u05b1\u05dc\u05b9\u05d4\u05b4\u05d9\u05dd", transliteration: "elohim", german: "Gott", note: "Der Gottesname bleibt zurueckhaltend im Schriftkoerper und wird ueber Ursprung, Gegenwart und gesprochenes Licht gelesen.", letters: [letter("aleph"), letter("lamed"), letter("he"), letter("jod"), letter("mem")], symbolIds: ["ursprung", "offenbarung"], meaningIds: ["presence", "revelation", "hiddenness"] },
      { order: 3, codexId: "haja", hebrew: "\u05d9\u05b0\u05d4\u05b4\u05d9", transliteration: "jehi / haja", german: "es werde", note: "Haja erscheint als Werden im Ruf: noch nicht Besitz, sondern Uebergang von gesprochenem Sinn in sichtbare Wirklichkeit.", letters: [letter("jod"), letter("he"), letter("jod")], symbolIds: ["wandlung", "ordnung"], roomIds: ["licht"], meaningIds: ["calling", "word", "transition", "revelation"] },
      { order: 4, codexId: "or", hebrew: "\u05d0\u05d5\u05b9\u05e8", transliteration: "or", german: "Licht", note: "Or ist die erste gerufene Sichtbarkeit. Aleph, Vav und Resch verbinden stillen Ursprung, tragende Linie und Ausrichtung.", letters: [letter("aleph"), letter("vav"), letter("resh")], symbolIds: ["licht", "offenbarung", "ordnung"], roomIds: ["licht"], meaningIds: ["light", "revelation", "awareness", "guidance"], numberIds: ["zahl-1"] },
      { order: 5, codexId: "wajehi", hebrew: "\u05d5\u05b7\u05d9\u05b0\u05d4\u05b4\u05d9", transliteration: "wajehi", german: "und es wurde", note: "Das zweite Werden bestaetigt die Bewegung: Aus Ruf wird erfahrbare Sichtbarkeit.", letters: [letter("vav"), letter("jod"), letter("he"), letter("jod")], symbolIds: ["licht", "offenbarung"], roomIds: ["licht"], meaningIds: ["light", "revelation", "transition"] },
    ],
    passiveWords: [
      { order: 6, hebrew: "\u05e8\u05b8\u05d0\u05b8\u05d4", transliteration: "raah", german: "sehen", note: "Raah steht als vorbereitete Folgebeziehung zu Genesis 1,4: Licht wird nicht nur da sein, sondern gesehen werden. Noch kein aktiver Codex-Zielknoten.", letters: [letter("resh"), letter("aleph"), letter("he")], meaningIds: ["awareness", "revelation", "light"] },
      { order: 7, hebrew: "\u05d8\u05d5\u05b9\u05d1", transliteration: "tov", german: "gut", note: "Tov bleibt als vorsichtige Vorwegnahme der naechsten Auswertung sichtbar: Die Gutheit wird erst nach dem Licht ausgesprochen.", letters: [letter("tet"), letter("vav"), letter("bet")], meaningIds: ["life", "revelation", "guidance"] },
    ],
    linkedLetters: [letter("aleph"), letter("mem"), letter("resh"), letter("vav"), letter("he"), letter("jod"), letter("lamed")],
    openedSymbols: ["licht", "wort", "davar", "qol", "offenbarung", "ordnung"],
    openedRooms: ["licht"],
    openedMeanings: ["word", "voice", "light", "revelation", "guidance", "awareness", "calling", "transition"],
    openedJourneys: ["creation", "davar-qol-or", "tehom-davar-qol-or", "tehom-ruach-davar-qol-or", "journey-chaos-ordnung"],
    openedPatterns: ["pattern-chaos-ordnung-offenbarung"],
    openedNumbers: ["zahl-1", "zahl-40"],
    growingRooms: [
      { id: "genesis-1-2", label: "Rueckweg in die Tiefe", note: "Das Licht verliert seine Herkunft nicht: Es antwortet auf Tiefe, Wasser und Ruach." },
      { id: "licht", label: "Licht", note: "Das Licht ist hier nicht Idee, sondern gerufene Sichtbarkeit." },
      { id: "wort", label: "Wort", note: "Der Raum des Wortes wurzelt im ersten Ruf." },
      { id: "davar-qol-or", label: "Wort wird Licht", note: "Die kleine Journey macht die Bewegung von Wort, Stimme und Licht begehbar." },
      { id: "offenbarung", label: "Offenbarung", note: "Sichtbarkeit waechst aus dem gesprochenen Anfang." },
      { id: "ordnung", label: "Ordnung", note: "Licht bereitet Unterscheidung vor, ohne den ganzen Kosmos schon auszuerzaehlen." },
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
      { order: 1, hebrew: "\u05d9\u05b8\u05bc\u05dd", transliteration: "jam", german: "Meer", note: "Jam zeigt das Meer als Tiefe und Grenze, die im Exodus nicht verschwindet, sondern zur Schwelle wird.", letters: [letter("jod"), letter("mem")], symbolIds: ["wasser", "tiefe"], roomIds: ["wasser"], meaningIds: ["depth", "transition", "hiddenness"], numberIds: ["zahl-40"] },
      { order: 2, codexId: "majim", hebrew: "\u05de\u05b7\u05d9\u05b4\u05dd", transliteration: "majim", german: "Wasser", note: "Majim traegt hier nicht Anfangswasser, sondern Wasser als Grenze, Durchgang und neu geoeffneten Weg.", letters: [letter("mem"), letter("jod"), letter("mem")], symbolIds: ["wasser"], roomIds: ["wasser"], meaningIds: ["depth", "transition"], numberIds: ["zahl-90"] },
      { order: 3, codexId: "ruach", hebrew: "\u05e8\u05d5\u05bc\u05d7\u05b7", transliteration: "ruach", german: "Wind / Geist", note: "Ruach bewegt das Wasser auch hier: Die unsichtbare Kraft macht die blockierte Grenze durchlaessig.", letters: [letter("resh"), letter("vav"), letter("chet")], symbolIds: ["geist"], roomIds: ["wasser", "licht"], meaningIds: ["presence", "transition"] },
      { order: 4, hebrew: "\u05d3\u05b6\u05bc\u05e8\u05b6ך\u05b0", transliteration: "derech", german: "Weg", note: "Derech macht die Pointe sichtbar: Der Weg entsteht nicht neben der Tiefe, sondern durch sie hindurch.", letters: [letter("dalet"), letter("resh"), letter("kaf")], symbolIds: ["uebergang"], roomIds: ["wueste"], meaningIds: ["path", "guidance", "transition"] },
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
const completeTorahFoundationIds = ["genesis-1-1", "genesis-1-2", "genesis-1-3"] as const;
const torahFoundationRequirements = {
  "genesis-1-1": {
    words: ["bereschit", "bara", "elohim", "schamajim", "erez"],
    rooms: ["wasser", "licht"],
    meanings: ["birth", "hiddenness", "revelation", "word"],
    journeys: ["creation", "tehom-ruach-davar-qol-or"],
    patterns: ["pattern-chaos-ordnung-offenbarung"],
    minLetters: 8,
  },
  "genesis-1-2": {
    words: ["erez", "haja", "tohu", "vohu", "choschech", "tehom", "ruach", "merachefet", "majim"],
    rooms: ["wasser", "licht"],
    meanings: ["chaos", "depth", "hiddenness", "presence", "transition"],
    journeys: ["journey-wasser-geist", "tehom-ruach-davar-qol-or"],
    patterns: ["pattern-schwelle-durch-wasser", "pattern-chaos-ordnung-offenbarung"],
    minLetters: 10,
  },
  "genesis-1-3": {
    words: ["amar", "elohim", "haja", "or", "wajehi", "raah", "tov"],
    rooms: ["licht"],
    meanings: ["word", "voice", "light", "revelation", "awareness"],
    journeys: ["davar-qol-or", "tehom-ruach-davar-qol-or"],
    patterns: ["pattern-chaos-ordnung-offenbarung"],
    minLetters: 6,
  },
} satisfies Record<(typeof completeTorahFoundationIds)[number], {
  words: string[];
  rooms: string[];
  meanings: MeaningNodeId[];
  journeys: string[];
  patterns: string[];
  minLetters: number;
}>;

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
  const meaning = letterEntry
    ? letterEntry.archetypalMeanings[0] ?? letterEntry.symbolism[0]?.label ?? letterEntry.experienceFields[0]
    : undefined;

  return {
    id: item.label,
    glyph: fallbackGlyphs[index] ?? letterEntry?.glyph ?? item.label,
    label: letterEntry?.name ?? humanizeId(item.label),
    meaning,
    href: linkedEntry ? `/codex/${linkedEntry.id}` : undefined,
    value: letterEntry?.numericValue,
  };
}

function buildFoundationWord(
  seed: ScriptureFoundationCoreWord | ScriptureFoundationPassiveWord,
  layer: ScriptureFoundationWord["layer"],
): ScriptureFoundationWord {
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
    layer,
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

  const wordLayer = [
    ...foundation.coreWords.map((word) => ({ word, layer: "core" as const })),
    ...foundation.passiveWords.map((word) => ({ word, layer: "passive" as const })),
  ]
    .sort((left, right) => left.word.order - right.word.order);

  return {
    label: foundation.label,
    foundationTitle: foundation.foundationTitle,
    foundationSubtitle: foundation.foundationSubtitle,
    sceneSummary: foundation.sceneSummary,
    hebrewText: foundation.hebrewText,
    germanText: foundation.germanWorkingText,
    words: wordLayer.map(({ word, layer }) => buildFoundationWord(word, layer)),
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

  const validateWord = (
    entry: ScriptureFoundationEntry,
    word: ScriptureFoundationCoreWord | ScriptureFoundationPassiveWord,
    layer: "core" | "passive",
  ) => {
    if ("codexId" in word && word.codexId && !resolveCodexEntry(word.codexId)) {
      errors.push(`ScriptureFoundation "${entry.id}" ${layer} word "${word.transliteration}" links missing codexId "${word.codexId}".`);
    }

    if (!word.note?.trim()) {
      errors.push(`ScriptureFoundation "${entry.id}" ${layer} word "${word.transliteration}" needs symbolic note.`);
    }

    word.letters?.forEach((item) => {
      if (!letterIds.has(item.label)) {
        errors.push(`ScriptureFoundation "${entry.id}" word "${word.transliteration}" uses missing letter "${item.label}".`);
      }

      if (item.active && (!item.codexId || !resolveCodexEntry(item.codexId))) {
        errors.push(`ScriptureFoundation "${entry.id}" word "${word.transliteration}" has active letter "${item.label}" without Codex target.`);
      }
    });

    word.symbolIds?.forEach((symbolId) => {
      if (!resolveCodexEntry(symbolId) && !getOntologyEntity(symbolId)) {
        errors.push(`ScriptureFoundation "${entry.id}" word "${word.transliteration}" uses missing symbolId "${symbolId}".`);
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
  };

  scriptureFoundationEntries.forEach((entry) => {
    if (!entry.id.trim()) errors.push(`ScriptureFoundation entry without id.`);
    if (!entry.hebrewText.trim()) errors.push(`ScriptureFoundation "${entry.id}" needs hebrewText.`);
    if (!entry.germanWorkingText.trim()) errors.push(`ScriptureFoundation "${entry.id}" needs germanWorkingText.`);

    entry.coreWords.forEach((word) => validateWord(entry, word, "core"));
    entry.passiveWords.forEach((word) => validateWord(entry, word, "passive"));

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

    entry.openedSymbols.forEach((symbolId) => {
      if (!resolveCodexEntry(symbolId) && !getOntologyEntity(symbolId)) {
        errors.push(`ScriptureFoundation "${entry.id}" opens missing symbol "${symbolId}".`);
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

    entry.growingRooms.forEach((room) => {
      if (!hasScriptureFoundationRoom(room.id) && !resolveCodexEntry(room.id) && !getOntologyEntity(room.id)) {
        errors.push(`ScriptureFoundation "${entry.id}" growing room "${room.label}" points to missing id "${room.id}".`);
      }
    });
  });

  completeTorahFoundationIds.forEach((entryId) => {
    const entry = getScriptureFoundation(entryId);
    const requirements = torahFoundationRequirements[entryId];

    if (!entry) {
      errors.push(`ScriptureFoundation "${entryId}" is required as complete Torah foundation entry.`);
      return;
    }

    const words = [...entry.coreWords, ...entry.passiveWords];
    const transliterations = words.map((word) => word.transliteration.toLocaleLowerCase("de-DE"));
    const letterCount = uniqueStrings([
      ...entry.linkedLetters.map((item) => item.label),
      ...words.flatMap((word) => word.letters?.map((item) => item.label) ?? []),
    ]).length;

    requirements.words.forEach((requiredWord) => {
      if (!transliterations.some((transliteration) => transliteration.includes(requiredWord))) {
        errors.push(`ScriptureFoundation "${entry.id}" complete map misses word trace "${requiredWord}".`);
      }
    });

    requirements.rooms.forEach((requiredRoom) => {
      if (!entry.openedRooms.includes(requiredRoom)) {
        errors.push(`ScriptureFoundation "${entry.id}" complete map misses room "${requiredRoom}".`);
      }
    });

    requirements.meanings.forEach((requiredMeaning) => {
      if (!entry.openedMeanings.includes(requiredMeaning)) {
        errors.push(`ScriptureFoundation "${entry.id}" complete map misses meaning "${requiredMeaning}".`);
      }
    });

    requirements.journeys.forEach((requiredJourney) => {
      if (!entry.openedJourneys.includes(requiredJourney)) {
        errors.push(`ScriptureFoundation "${entry.id}" complete map misses journey "${requiredJourney}".`);
      }
    });

    requirements.patterns.forEach((requiredPattern) => {
      if (!entry.openedPatterns.includes(requiredPattern)) {
        errors.push(`ScriptureFoundation "${entry.id}" complete map misses pattern "${requiredPattern}".`);
      }
    });

    if (letterCount < requirements.minLetters) {
      errors.push(`ScriptureFoundation "${entry.id}" complete map needs at least ${requirements.minLetters} letter traces, found ${letterCount}.`);
    }

    if (entry.coreWords.length < 2 || entry.passiveWords.length < 1) {
      errors.push(`ScriptureFoundation "${entry.id}" complete map needs core and passive word layers.`);
    }
  });

  scriptureFoundationEntries.flatMap((entry) => entry.coreWords).forEach((word) => {
    if (word.codexId) codexIds.add(word.codexId);
  });

  return {
    valid: errors.length === 0,
    errors,
    stats: {
      entries: scriptureFoundationEntries.length,
      completeTorahFoundationEntries: completeTorahFoundationIds.length,
      linkedCoreWords: codexIds.size,
    },
  };
}
