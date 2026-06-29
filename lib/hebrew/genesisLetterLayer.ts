import { hebrewLetters } from "./hebrewLetters";
import { hebrewWords } from "./hebrewWords";

export const genesisLetterIds = [
  "aleph",
  "bet",
  "resh",
  "shin",
  "jod",
  "tav",
  "lamed",
  "he",
  "mem",
  "vav",
  "tsadi",
  "chet",
  "kaf",
  "ayin",
  "pe",
  "nun",
] as const;

export type GenesisLetterId = (typeof genesisLetterIds)[number];

export type GenesisWordLetterStep = {
  letterId: GenesisLetterId;
  form?: string;
  role: string;
};

export type GenesisWordMovement = {
  wordId: string;
  movement: string;
  letters: GenesisWordLetterStep[];
};

export type GenesisLetterDeepProfile = {
  id: GenesisLetterId;
  shortEssence: string;
  deeperMeaning: string;
  genesisRole: string;
  roomIds: string[];
  symbolIds: string[];
  meaningFieldLabels: string[];
  relatedLetterIds: GenesisLetterId[];
  contemplative: string;
};

export type GenesisVerseLetterLayer = {
  verseId: "genesis-1-1" | "genesis-1-2" | "genesis-1-3";
  title: string;
  movement: string;
  wordIds: string[];
  focusLetterIds: GenesisLetterId[];
  roomIds: string[];
  symbolIds: string[];
  note: string;
};

const waterRoomLetters: GenesisLetterId[] = ["mem", "jod", "tav", "he", "vav", "resh", "chet", "ayin", "pe", "nun", "kaf"];
const lightRoomLetters: GenesisLetterId[] = ["aleph", "mem", "resh", "jod", "he", "vav"];

export const genesisRoomLetterCarriers = {
  wasser: waterRoomLetters,
  licht: lightRoomLetters,
} satisfies Record<"wasser" | "licht", GenesisLetterId[]>;

export const genesisLetterProfiles: Record<GenesisLetterId, GenesisLetterDeepProfile> = {
  aleph: {
    id: "aleph",
    shortEssence: "Ursprung, Atem, unsichtbare Einheit.",
    deeperMeaning: "Aleph ist der Anfang vor dem Klang. Es steht nicht laut am Rand, sondern wie ein Atemraum, aus dem Gott, Erde, Wort und Licht lesbar werden.",
    genesisRole: "In Genesis 1,1-3 verbindet Aleph Elohim, et, eretz, amar und or: Gott, Erde, Zeichen, Sprechen und Licht.",
    roomIds: ["licht"],
    symbolIds: ["ursprung", "wort", "licht", "offenbarung", "erde"],
    meaningFieldLabels: ["Ursprung", "Atem", "Gegenwart", "Offenbarung"],
    relatedLetterIds: ["bet", "mem", "resh", "tav"],
    contemplative: "Vor dem ersten Wort steht ein Atem. Aleph laesst den Anfang offen genug, dass Licht daraus hervortreten kann.",
  },
  bet: {
    id: "bet",
    shortEssence: "Haus, Innenraum, erster betretbarer Anfang.",
    deeperMeaning: "Bet macht Ursprung raeumlich. Der Anfang bleibt nicht abstrakt, sondern wird als Haus, Grenze und empfangender Innenraum betretbar.",
    genesisRole: "Bet oeffnet Bereschit und Bara; in Bohu zeigt es die leere Form, die noch auf Ordnung wartet.",
    roomIds: ["wueste"],
    symbolIds: ["anfang", "schoepfung", "verborgenheit"],
    meaningFieldLabels: ["Innenraum", "Empfang", "Anfang", "Leere"],
    relatedLetterIds: ["aleph", "resh", "he", "vav"],
    contemplative: "Der Anfang ist nicht nur Punkt, sondern Raum. Bet ist die Tuer, durch die der Text betreten wird.",
  },
  resh: {
    id: "resh",
    shortEssence: "Haupt, Richtung, aufgerichteter Anfang.",
    deeperMeaning: "Resh gibt dem Anfang Gesicht und Richtung. Es hebt die Bewegung aus dem Unbestimmten und fuehrt sie auf eine erkennbare Spur.",
    genesisRole: "Resh steht in Bereschit, Bara, Erez, Ruach, Rachaf, Amar und Or: Anfang, Erde, Atem, Schweben, Wort und Licht bekommen Richtung.",
    roomIds: ["wasser", "licht"],
    symbolIds: ["ursprung", "ruach", "wort", "licht", "erde"],
    meaningFieldLabels: ["Richtung", "Ausrichtung", "Atem", "Wort"],
    relatedLetterIds: ["aleph", "mem", "vav", "chet"],
    contemplative: "Was noch ungestaltet ist, bekommt einen Blick nach vorn. Resh neigt den Anfang in Richtung Licht.",
  },
  shin: {
    id: "shin",
    shortEssence: "Feuer, Spannung, verwandelnde Energie.",
    deeperMeaning: "Shin ist bewegte Kraft. In der Genesis-Spur haelt es Himmel und Finsternis in Spannung, bevor Licht die Unterscheidung sichtbar macht.",
    genesisRole: "Shin erscheint in Bereschit, Schamajim und Choschech: Anfang, Himmel und Dunkel tragen eine noch verborgene Energie.",
    roomIds: ["licht"],
    symbolIds: ["feuer", "himmel", "verborgenheit", "ordnung"],
    meaningFieldLabels: ["Spannung", "Energie", "Verwandlung", "Dunkel vor Licht"],
    relatedLetterIds: ["mem", "jod", "kaf", "tav"],
    contemplative: "Noch bevor das Licht erscheint, ist Bewegung im Dunkel. Shin ist die Glut im Anfangswort.",
  },
  jod: {
    id: "jod",
    shortEssence: "Punkt, Hand, Wirkimpuls.",
    deeperMeaning: "Jod ist klein und wirksam: der Punkt, an dem Moeglichkeit in Bewegung uebergeht. In Wasser und Licht wirkt es wie ein Same des Werdens.",
    genesisRole: "Jod erscheint in Bereschit, Elohim, Schamajim, Majim und Jehi; in Jehi wird der Impuls zum Ruf des Werdens.",
    roomIds: ["wasser", "licht"],
    symbolIds: ["wasser", "licht", "wandlung", "offenbarung"],
    meaningFieldLabels: ["Impuls", "Hand", "Same", "Werden"],
    relatedLetterIds: ["mem", "he", "vav", "aleph"],
    contemplative: "Ein winziger Punkt genuegt. Jod beruehrt die Tiefe und setzt Werden in Gang.",
  },
  tav: {
    id: "tav",
    shortEssence: "Zeichen, Grenze, markierte Vollendung.",
    deeperMeaning: "Tav setzt eine Spur an den Rand der Bewegung. Es ist Zeichen und Grenze: nicht Ende als Abbruch, sondern Lesbarkeit der Form.",
    genesisRole: "Tav steht in Bereschit, Et, Tohu, Tehom und Rachaf; Anfang, Zeichen und Tiefe werden markiert.",
    roomIds: ["wasser"],
    symbolIds: ["ordnung", "offenbarung", "tiefe", "ursprung"],
    meaningFieldLabels: ["Zeichen", "Grenze", "Gestalt", "Markierung"],
    relatedLetterIds: ["aleph", "he", "vav", "mem"],
    contemplative: "Tav macht die Spur beruehrbar. Wo Tiefe noch offen ist, setzt es ein Zeichen in den Rand.",
  },
  lamed: {
    id: "lamed",
    shortEssence: "Lernen, Aufrichtung, empfangende Ausrichtung.",
    deeperMeaning: "Lamed hebt sich aus dem Schriftband. Es richtet den Blick und macht den Gottesnamen als empfangene Gegenwart lesbar.",
    genesisRole: "Lamed steht in Elohim und im Versfeld von al; es verbindet Ursprung mit Ausrichtung und die Tiefe mit einem Ueber.",
    roomIds: ["licht"],
    symbolIds: ["offenbarung", "himmel", "wort"],
    meaningFieldLabels: ["Ausrichtung", "Lernen", "Empfangen", "Hoehe"],
    relatedLetterIds: ["aleph", "he", "jod", "ayin"],
    contemplative: "Lamed hebt den Blick, ohne den Boden zu verlassen. Es macht den Anfang lernbar.",
  },
  he: {
    id: "he",
    shortEssence: "Hauch, Fenster, Erscheinung.",
    deeperMeaning: "He ist offener Atem. Es laesst Verborgenes nicht ergreifen, sondern erscheinen: Zustand, Leere, Tiefe und Werden bekommen Luft.",
    genesisRole: "He steht in Elohim, Tohu, Bohu, Tehom, Haja und Jehi: Atem und Erscheinung zwischen Formlosigkeit und Werden.",
    roomIds: ["wasser", "licht"],
    symbolIds: ["offenbarung", "wandlung", "tiefe", "licht"],
    meaningFieldLabels: ["Atem", "Offenheit", "Erscheinen", "Werden"],
    relatedLetterIds: ["tav", "vav", "jod", "mem"],
    contemplative: "He oeffnet ein Fenster im Ungeformten. Durch diesen Hauch kann das Wort werden.",
  },
  mem: {
    id: "mem",
    shortEssence: "Wasser, Tiefe, Mutterraum.",
    deeperMeaning: "Mem ist der Wasserbuchstabe des Codex. Offen traegt er Bewegung, final sammelt er Tiefe; beide Formen halten sichtbares Wasser und verborgenen Ursprung zusammen.",
    genesisRole: "Mem erscheint in Elohim, Schamajim, Tehom, Majim und Amar; es verbindet Gottes Gegenwart, Himmel, Tiefe, Wasser und gesprochenes Licht.",
    roomIds: ["wasser", "licht"],
    symbolIds: ["wasser", "tiefe", "wort", "leben", "verborgenheit"],
    meaningFieldLabels: ["Wasser", "Tiefe", "Mutterraum", "Geburt", "Wort"],
    relatedLetterIds: ["jod", "aleph", "resh", "tav"],
    contemplative: "Mem ist die Tiefe, die nicht stumm bleibt. Aus Wasser wird Wort, aus Wort wird Licht.",
  },
  vav: {
    id: "vav",
    shortEssence: "Verbindung, Linie, Fortgang.",
    deeperMeaning: "Vav haelt auseinanderliegende Felder zusammen. Es ist die Linie zwischen Zustand und Ereignis, zwischen Tiefe und Licht.",
    genesisRole: "Vav erscheint in Tohu, Bohu, Tehom, Ruach, Or und Wajehi: es verbindet Formlosigkeit, Atem und Lichtwerdung.",
    roomIds: ["wasser", "licht"],
    symbolIds: ["uebergang", "wasser", "licht", "ruach"],
    meaningFieldLabels: ["Verbindung", "Fortgang", "Bruecke", "Und"],
    relatedLetterIds: ["he", "resh", "chet", "aleph"],
    contemplative: "Vav ist das leise Und. Nichts bleibt isoliert; Tiefe kann in Licht weitergehen.",
  },
  tsadi: {
    id: "tsadi",
    shortEssence: "Erde, Gestalt, aufgerichteter Boden.",
    deeperMeaning: "Tsadi schliesst Erez als finale Gestalt. Erde ist noch nicht geordnet, aber sie ist genannt und als tragender Boden markiert.",
    genesisRole: "Tsadi erscheint in Erez; die Erde wird im Anfang genannt, bevor sie bewohnbar geformt ist.",
    roomIds: ["wueste", "brot"],
    symbolIds: ["erde", "wueste", "brot"],
    meaningFieldLabels: ["Erde", "Aufrichtung", "Gestalt", "Boden"],
    relatedLetterIds: ["aleph", "resh", "tav"],
    contemplative: "Tsadi setzt den Fuss auf die noch ungeordnete Erde. Der Boden ist da, auch wenn die Ordnung noch kommt.",
  },
  chet: {
    id: "chet",
    shortEssence: "Lebensraum, Schutz, verborgene Lebendigkeit.",
    deeperMeaning: "Chet ist eingehegtes Leben. In Finsternis, Ruach und Rachaf bleibt Lebendigkeit verborgen, aber bereits wirksam.",
    genesisRole: "Chet steht in Choschech, Ruach und Rachaf: Dunkel, Atem und schwebende Naehe tragen verborgene Lebendigkeit.",
    roomIds: ["wasser"],
    symbolIds: ["leben", "ruach", "tiefe", "verborgenheit"],
    meaningFieldLabels: ["Leben", "Schutz", "Atem", "verborgene Lebendigkeit"],
    relatedLetterIds: ["resh", "vav", "pe", "kaf"],
    contemplative: "Chet sagt: im Dunkel ist nicht nichts. Leben atmet schon, bevor es sichtbar wird.",
  },
  kaf: {
    id: "kaf",
    shortEssence: "Handflaeche, Gefaess, bedeckte Form.",
    deeperMeaning: "Kaf fasst und bedeckt. Als Schlussform in Choschech zeigt es die Finsternis wie eine Hand, die Sichtbarkeit noch zurueckhaelt.",
    genesisRole: "Kaf erscheint in Choschech als finale Form; Dunkelheit wird zur bedeckten Schwelle vor dem Licht.",
    roomIds: ["wasser"],
    symbolIds: ["verborgenheit", "licht", "tiefe"],
    meaningFieldLabels: ["Fassen", "Gefaess", "Bedeckung", "Schwelle"],
    relatedLetterIds: ["chet", "shin", "ayin"],
    contemplative: "Kaf haelt das Noch-nicht-Sichtbare in der Hand. Die Finsternis ist bedeckt, nicht endgueltig.",
  },
  ayin: {
    id: "ayin",
    shortEssence: "Auge, Quelle, Wahrnehmung.",
    deeperMeaning: "Ayin steht an der Oberflaeche der Tiefe. Es ist Blick und Quelle zugleich: Wahrnehmung beginnt dort, wo Tiefe eine Flaeche hat.",
    genesisRole: "Ayin erscheint in al und pnei; Finsternis und Ruach werden ueber dem Angesicht der Tiefe und der Wasser verortet.",
    roomIds: ["wasser"],
    symbolIds: ["auge", "quelle", "offenbarung", "tiefe"],
    meaningFieldLabels: ["Blick", "Quelle", "Oberflaeche", "Wahrnehmung"],
    relatedLetterIds: ["lamed", "pe", "nun", "mem"],
    contemplative: "Ayin schaut nicht von aussen. Es steht an der Quelle, wo Tiefe sichtbar zu werden beginnt.",
  },
  pe: {
    id: "pe",
    shortEssence: "Mund, Oeffnung, Ausdruck.",
    deeperMeaning: "Pe ist die Oeffnung, durch die Inneres nach aussen tritt. In Rachaf und Pnei bereitet es die Schwelle zum spaeteren Sprechen vor.",
    genesisRole: "Pe steht in Rachaf/Merachefet und Pnei: Bewegung und Oberflaeche werden zum Ort, an dem Wort moeglich wird.",
    roomIds: ["wasser"],
    symbolIds: ["wort", "offenbarung", "ruach", "wasser"],
    meaningFieldLabels: ["Mund", "Oeffnung", "Ausdruck", "Schweben"],
    relatedLetterIds: ["resh", "chet", "nun", "ayin"],
    contemplative: "Pe ist noch nicht der ausgesprochene Satz. Es ist die Oeffnung, in der die Tiefe zur Stimme werden kann.",
  },
  nun: {
    id: "nun",
    shortEssence: "Keim, Fortgang, verborgenes Leben.",
    deeperMeaning: "Nun traegt das Leben, das noch unter der Oberflaeche waechst. In Pnei beruehrt es das Angesicht, auf dem Tiefe sichtbar wird.",
    genesisRole: "Nun erscheint in Pnei; die Oberflaeche der Tiefe wird als Angesicht lesbar, nicht als tote Grenze.",
    roomIds: ["wasser"],
    symbolIds: ["leben", "wasser", "offenbarung"],
    meaningFieldLabels: ["Keim", "Leben", "Fortgang", "Angesicht"],
    relatedLetterIds: ["pe", "jod", "ayin", "mem"],
    contemplative: "Nun bleibt nah an der Oberflaeche. Dort keimt Leben, bevor es einen Namen bekommt.",
  },
};

export const genesisWordMovements: Record<string, GenesisWordMovement> = {
  bereschit: {
    wordId: "bereschit",
    movement: "Vom Haus des Anfangs ueber Richtung und stillen Ursprung in Feuer, Wirkimpuls und Zeichen.",
    letters: [
      { letterId: "bet", role: "Innenraum des Anfangs" },
      { letterId: "resh", role: "Richtung des Ursprungs" },
      { letterId: "aleph", role: "stiller Atem im Wort" },
      { letterId: "shin", role: "verborgene Energie" },
      { letterId: "jod", role: "Wirkimpuls" },
      { letterId: "tav", role: "Zeichen und Abschluss der Spur" },
    ],
  },
  bara: {
    wordId: "bara",
    movement: "Vom Raum ueber Richtung zum unsichtbaren Ursprung: Schaffen wird als erste Setzung lesbar.",
    letters: [
      { letterId: "bet", role: "Anfangsraum" },
      { letterId: "resh", role: "ausgerichtetes Hervorbringen" },
      { letterId: "aleph", role: "Ursprung, der nicht sichtbar verbraucht wird" },
    ],
  },
  elohim: {
    wordId: "elohim",
    movement: "Vom stillen Ursprung ueber Aufrichtung und Hauch zum Impuls und zur gesammelten Tiefe.",
    letters: [
      { letterId: "aleph", role: "stille Gegenwart" },
      { letterId: "lamed", role: "Ausrichtung nach oben" },
      { letterId: "he", role: "Hauch des Erscheinens" },
      { letterId: "jod", role: "Wirkimpuls" },
      { letterId: "mem", form: "\u05dd", role: "geschlossene Tiefe des Namens" },
    ],
  },
  et: {
    wordId: "et",
    movement: "Aleph und Tav halten Anfang und Zeichen in einer knappen grammatischen Schwelle zusammen.",
    letters: [
      { letterId: "aleph", role: "Anfang" },
      { letterId: "tav", role: "Zeichen und Grenze" },
    ],
  },
  schamajim: {
    wordId: "schamajim",
    movement: "Feuer/Spannung tritt in Wasser, Impuls und geschlossene Tiefe: Himmel klingt als Raum zwischen Wasser und Licht.",
    letters: [
      { letterId: "shin", role: "Weite und Spannung" },
      { letterId: "mem", role: "Wasserraum" },
      { letterId: "jod", role: "Wirkimpuls im Wasser" },
      { letterId: "mem", form: "\u05dd", role: "gesammelte, finale Tiefe" },
    ],
  },
  erez: {
    wordId: "erez",
    movement: "Ursprung richtet sich auf und findet Boden: Erde wird genannt, bevor sie bewohnbar ist.",
    letters: [
      { letterId: "aleph", role: "Ursprung" },
      { letterId: "resh", role: "Richtung" },
      { letterId: "tsadi", form: "\u05e5", role: "finale Erdgestalt" },
    ],
  },
  tohu: {
    wordId: "tohu",
    movement: "Zeichen, Hauch und Verbindung bilden den ungeformten Raum vor Ordnung.",
    letters: [
      { letterId: "tav", role: "markierte Grenze" },
      { letterId: "he", role: "offener Hauch" },
      { letterId: "vav", role: "Fortgang ohne Gestalt" },
    ],
  },
  bohu: {
    wordId: "bohu",
    movement: "Haus, Hauch und Verbindung zeigen Leere als empfangenden, noch unbewohnten Raum.",
    letters: [
      { letterId: "bet", role: "leerer Innenraum" },
      { letterId: "he", role: "offene Atemstelle" },
      { letterId: "vav", role: "Verbindung zur kommenden Ordnung" },
    ],
  },
  choschech: {
    wordId: "choschech",
    movement: "Verborgenes Leben, Spannung und finale Handflaeche bilden die bedeckte Sichtbarkeit vor dem Licht.",
    letters: [
      { letterId: "chet", role: "verborgenes Leben" },
      { letterId: "shin", role: "Dunkelspannung" },
      { letterId: "kaf", form: "\u05da", role: "bedeckte Schlussform" },
    ],
  },
  tehom: {
    wordId: "tehom",
    movement: "Zeichen und Hauch gehen durch Verbindung in geschlossenes Wasser: Tiefe wird als Ursprungskammer lesbar.",
    letters: [
      { letterId: "tav", role: "Zeichen der Tiefe" },
      { letterId: "he", role: "Hauch im Ungeformten" },
      { letterId: "vav", role: "verbindende Achse" },
      { letterId: "mem", form: "\u05dd", role: "geschlossene Urflut" },
    ],
  },
  ruach: {
    wordId: "ruach",
    movement: "Richtung, Verbindung und Lebensraum werden zu unsichtbarer Bewegung ueber der Tiefe.",
    letters: [
      { letterId: "resh", role: "Atemrichtung" },
      { letterId: "vav", role: "verbindende Linie" },
      { letterId: "chet", role: "lebendige Innenkraft" },
    ],
  },
  rachaf: {
    wordId: "rachaf",
    movement: "Richtung, verborgene Lebendigkeit und Mund-Oeffnung bilden das Schweben vor dem Wort.",
    letters: [
      { letterId: "resh", role: "gerichtete Naehe" },
      { letterId: "chet", role: "lebendige Waerme" },
      { letterId: "pe", form: "\u05e3", role: "finale Oeffnung des Schweigens" },
    ],
  },
  majim: {
    wordId: "majim",
    movement: "Offenes Mem wird durch Jod bewegt und sammelt sich im finalen Mem als erfuellter Wasserraum.",
    letters: [
      { letterId: "mem", role: "Wasser, Tiefe, Mutterraum" },
      { letterId: "jod", role: "Punkt, Hand, Wirkimpuls im Wasser" },
      { letterId: "mem", form: "\u05dd", role: "geschlossene Tiefe, erfuellter Wasserraum" },
    ],
  },
  al: {
    wordId: "al",
    movement: "Ayin oeffnet Wahrnehmung an der Tiefe; Lamed richtet sie als Ueber und Auf aus.",
    letters: [
      { letterId: "ayin", role: "Auge, Quelle, Oberflaeche" },
      { letterId: "lamed", role: "Ausrichtung ueber der Tiefe" },
    ],
  },
  pnei: {
    wordId: "pnei",
    movement: "Pe oeffnet, Nun laesst Leben keimen, Jod setzt den Wahrnehmungsimpuls: die Tiefe bekommt ein Angesicht.",
    letters: [
      { letterId: "pe", role: "Oeffnung und Mund der Oberflaeche" },
      { letterId: "nun", role: "verborgenes Leben am Angesicht" },
      { letterId: "jod", role: "Wirkimpuls des Blicks" },
    ],
  },
  amar: {
    wordId: "amar",
    movement: "Aus stillem Ursprung geht die Tiefe in Richtung: Sprechen hebt Licht aus dem Verborgenen.",
    letters: [
      { letterId: "aleph", role: "Atem vor dem Wort" },
      { letterId: "mem", role: "Tiefe, die Klang traegt" },
      { letterId: "resh", role: "Richtung des Sprechens" },
    ],
  },
  jehi: {
    wordId: "jehi",
    movement: "Jod setzt den Impuls, He oeffnet den Hauch, Jod bestaetigt das Werden.",
    letters: [
      { letterId: "jod", role: "erster Wirkimpuls" },
      { letterId: "he", role: "Fenster des Erscheinens" },
      { letterId: "jod", role: "zweiter Impuls: Werden wird konkret" },
    ],
  },
  or: {
    wordId: "or",
    movement: "Aleph atmet, Vav verbindet, Resh richtet aus: Licht wird Offenbarung.",
    letters: [
      { letterId: "aleph", role: "Ursprung/Atem vor dem Licht" },
      { letterId: "vav", role: "Linie in die Sichtbarkeit" },
      { letterId: "resh", role: "Richtung und bewusstes Sehen" },
    ],
  },
};

export const genesisVerseLetterLayers: Record<GenesisVerseLetterLayer["verseId"], GenesisVerseLetterLayer> = {
  "genesis-1-1": {
    verseId: "genesis-1-1",
    title: "Zeichen dieses Verses",
    movement: "Anfang, Schoepfung, Himmel und Erde werden gesetzt.",
    wordIds: ["bereschit", "bara", "elohim", "et", "schamajim", "erez"],
    focusLetterIds: ["aleph", "bet", "resh", "shin", "jod", "tav", "lamed", "he", "mem", "tsadi"],
    roomIds: ["licht", "wasser", "wueste", "brot"],
    symbolIds: ["anfang", "schoepfung", "himmel", "erde"],
    note: "Bet oeffnet den Anfangsraum; Aleph bleibt als stiller Ursprung in Gott, Erde, Zeichen und Licht vorbereitet.",
  },
  "genesis-1-2": {
    verseId: "genesis-1-2",
    title: "Zeichen dieses Verses",
    movement: "Formlosigkeit, Tiefe, Finsternis, Ruach und Wasser tragen den Zwischenraum vor dem Licht.",
    wordIds: ["erez", "tohu", "bohu", "choschech", "al", "pnei", "tehom", "ruach", "rachaf", "majim"],
    focusLetterIds: ["tav", "he", "vav", "bet", "chet", "shin", "kaf", "ayin", "pe", "nun", "mem", "resh"],
    roomIds: ["wasser", "licht", "wueste"],
    symbolIds: ["wasser", "tiefe", "ruach", "verborgenheit"],
    note: "Mem traegt Wasser und Tiefe; Resh, Vav und Chet machen Ruach als bewegte Gegenwart erfahrbar.",
  },
  "genesis-1-3": {
    verseId: "genesis-1-3",
    title: "Zeichen dieses Verses",
    movement: "Wort, Werden und Licht treten aus der Tiefe hervor.",
    wordIds: ["amar", "elohim", "jehi", "or"],
    focusLetterIds: ["aleph", "mem", "resh", "jod", "he", "vav"],
    roomIds: ["licht"],
    symbolIds: ["wort", "licht", "offenbarung", "ordnung"],
    note: "Aleph, Mem und Resh tragen Amar; Jod und He tragen Jehi; Aleph, Vav und Resh tragen Or.",
  },
};

export function getGenesisLetterProfile(letterId: string) {
  return genesisLetterProfiles[letterId as GenesisLetterId];
}

export function getGenesisWordMovement(wordId: string) {
  return genesisWordMovements[wordId];
}

export function getGenesisVerseLetterLayer(verseId: string) {
  return genesisVerseLetterLayers[verseId as GenesisVerseLetterLayer["verseId"]];
}

export function getGenesisWordsForLetter(letterId: string) {
  return Object.values(genesisWordMovements)
    .filter((movement) => movement.letters.some((step) => step.letterId === letterId))
    .map((movement) => hebrewWords.find((word) => word.id === movement.wordId))
    .filter((word): word is NonNullable<typeof word> => Boolean(word));
}

export function getGenesisLettersForRoom(roomId: string) {
  return Object.values(genesisLetterProfiles)
    .filter((profile) => profile.roomIds.includes(roomId))
    .map((profile) => hebrewLetters.find((letter) => letter.id === profile.id))
    .filter((letter): letter is NonNullable<typeof letter> => Boolean(letter));
}
