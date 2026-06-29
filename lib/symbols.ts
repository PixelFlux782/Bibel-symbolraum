import { calculateGematria, getHebrewLetterValue } from './hebrew/gematria';
import { visualAssets } from './visualAssets';

export type SymbolItem = {
  slug: string;
  name: string;
  hebrew: string;
  shortMeaning: string;
  outerLevel: string;
  symbolicLevel: string;
  bibleReferences: string[];
  firstOccurrences?: FirstOccurrence[];
  scriptureReferences?: SymbolScriptureReference[];
  hebrewTrace: string;
  numberMeaning: string;
  lifeQuestion: string;
  meditation: string;
  connectedSymbols: string[];
};

export type SymbolRelationType =
  | 'same_root'
  | 'shared_letters'
  | 'gematria_link'
  | 'biblical_scene'
  | 'thematic_link'
  | 'archetype'
  | 'contrast'
  | 'transformation'
  | 'sequence';

export type SymbolRelation = {
  targetId: string;
  relationType: SymbolRelationType;
  strength: number;
  explanation: string;
};

export type LetterBreakdownItem = {
  letter: string;
  name: string;
  transliteration?: string;
  meaning?: string;
  numericValue?: number;
};

export type GematriaInfo = {
  value: number;
  method?: string;
  explanation?: string;
};

export type SymbolScriptureReference = {
  reference: string;
  book: string;
  chapter: number;
  verseRange: string;
  shortNote: string;
  symbolicRole: string;
  relatedSymbols: string[];
};

export type FirstOccurrence = SymbolScriptureReference;

export type SymbolVerse = SymbolScriptureReference & {
  text?: string;
  layer?: 'biblical' | 'hebrew' | 'life' | 'poetic';
  note?: string;
};

export type SymbolImageAsset = {
  src: string;
  alt: string;
  role?: 'hero' | 'background' | 'texture' | 'thumbnail' | 'icon';
};

export type SymbolData = {
  id: string;
  name: string;
  hebrew?: string;
  transliteration?: string;
  root?: string;
  category?: string;
  shortMeaning?: string;
  poeticIntro?: string;
  biblicalLayer?: string;
  hebrewLayer?: string;
  lifeLayer?: string;
  reflectionQuestion?: string;
  letterBreakdown?: LetterBreakdownItem[];
  gematria?: GematriaInfo;
  firstOccurrences?: FirstOccurrence[];
  scriptureReferences?: SymbolScriptureReference[];
  verses?: SymbolVerse[];
  relatedSymbols?: string[];
  relations?: SymbolRelation[];
  symbolRelations?: SymbolRelation[];
  imageAssets?: SymbolImageAsset[];
  roomHref?: string;
};

export type SymbolNetworkItem = SymbolData & {
  hebrew: string;
  shortMeaning: string;
  relatedSymbols: string[];
};

const WATER_SCRIPTURE_REFERENCES: SymbolScriptureReference[] = [
  {
    reference: 'Genesis 1,2',
    book: 'Genesis',
    chapter: 1,
    verseRange: '2',
    shortNote: 'Der Geist Gottes schwebt über den Wassern am Anfang der Schöpfung.',
    symbolicRole: 'Im SYMBOLRAUM kann dies als Urtiefe, Anfangsraum und noch ungeordnete Schöpfung gelesen werden.',
    relatedSymbols: ['geist', 'tiefe', 'schoepfung'],
  },
  {
    reference: 'Genesis 1,6-10',
    book: 'Genesis',
    chapter: 1,
    verseRange: '6-10',
    shortNote: 'Die Wasser werden getrennt und gesammelt, sodass Himmel, Meer und trockenes Land unterscheidbar werden.',
    symbolicRole: 'Symbolisch erscheint Wasser hier als Grenze, Ordnung und Formwerdung aus der Tiefe.',
    relatedSymbols: ['meer', 'himmel', 'erde', 'ordnung'],
  },
  {
    reference: 'Exodus 14',
    book: 'Exodus',
    chapter: 14,
    verseRange: '1-31',
    shortNote: 'Israel zieht durch das Meer aus der Enge in die Freiheit.',
    symbolicRole: 'Im SYMBOLRAUM wird dies als Durchgang, Schwelle und Befreiungsbewegung verstanden.',
    relatedSymbols: ['meer', 'exodus', 'befreiung', 'weg'],
  },
  {
    reference: 'Numeri 20,2-13',
    book: 'Numeri',
    chapter: 20,
    verseRange: '2-13',
    shortNote: 'In der Wüste kommt Wasser aus dem Felsen für die durstige Gemeinde.',
    symbolicRole: 'Wasser aus dem Felsen kann als Gabe im Mangel und als Leben aus dem Widerstand gelesen werden.',
    relatedSymbols: ['felsen', 'wueste', 'quelle', 'versorgung'],
  },
  {
    reference: 'Josua 3',
    book: 'Josua',
    chapter: 3,
    verseRange: '1-17',
    shortNote: 'Beim Jordan-Übergang öffnet sich der Weg in das verheissene Land.',
    symbolicRole: 'Symbolisch erscheint Wasser als Grenze, die zum Übergang in eine neue Ordnung werden kann.',
    relatedSymbols: ['jordan', 'weg', 'uebergang', 'verheissung'],
  },
  {
    reference: 'Matthaeus 3,13-17',
    book: 'Matthaeus',
    chapter: 3,
    verseRange: '13-17',
    shortNote: 'Jesus wird im Jordan getauft; Wasser, Geist und Stimme treten zusammen.',
    symbolicRole: 'Die Szene kann als Verbindung von Taufe, Geist, Berufung und neuer Ausrichtung gelesen werden.',
    relatedSymbols: ['taufe', 'geist', 'jordan', 'berufung'],
  },
  {
    reference: 'Johannes 4,7-15',
    book: 'Johannes',
    chapter: 4,
    verseRange: '7-15',
    shortNote: 'Jesus spricht am Brunnen vom lebendigen Wasser.',
    symbolicRole: 'Lebendiges Wasser kann symbolisch als Gabe, inneres Leben, Durst und Erneuerung erscheinen.',
    relatedSymbols: ['quelle', 'leben', 'brunnen', 'erneuerung'],
  },
];

const LIGHT_SCRIPTURE_REFERENCES: SymbolScriptureReference[] = [
  {
    reference: 'Genesis 1,3',
    book: 'Genesis',
    chapter: 1,
    verseRange: '3',
    shortNote: 'Gott spricht: Es werde Licht, und Licht wird.',
    symbolicRole: 'Im SYMBOLRAUM kann dies als erstes Sichtbarwerden, Offenbarung und Beginn von Orientierung gelesen werden.',
    relatedSymbols: ['wort', 'offenbarung', 'ordnung'],
  },
  {
    reference: 'Johannes 8,12',
    book: 'Johannes',
    chapter: 8,
    verseRange: '12',
    shortNote: 'Jesus spricht vom Licht des Lebens.',
    symbolicRole: 'Licht wird zur Spur von Leben, Gegenwart und Wegorientierung.',
    relatedSymbols: ['leben', 'weg', 'offenbarung'],
  },
];

export const SYMBOL_NETWORK: SymbolNetworkItem[] = [
  {
    id: 'wasser',
    name: 'Wasser',
    hebrew: 'מים',
    transliteration: 'Majim',
    root: 'מים',
    category: 'Schöpfung / Reinigung / Übergang',
    shortMeaning: 'Tiefe, Leben, Reinigung, Grenze, Übergang und neue Geburt.',
    poeticIntro:
      'Wasser kann als bewegter Raum gelesen werden: als Tiefe, die Leben trägt, Grenzen markiert, Reinigung andeutet und Übergänge möglich macht.',
    biblicalLayer:
      'Biblisch begegnet Wasser unter anderem in Genesis 1,2, in der Scheidung der Wasser, im Exodus am Meer, als Wasser aus dem Felsen, am Jordan und im Bild vom lebendigen Wasser. Diese Motive lassen Wasser symbolisch als Tiefe, Leben, Grenze, Reinigung, Übergang und neue Geburt lesen.',
    hebrewLayer:
      'Die Buchstaben מ י ם können symbolisch gelesen werden: מ als Tiefe, Wasser und Mutterraum; י als Punkt, Impuls oder Same; ם als geschlossenes finales Mem, das eine verborgene Tiefe andeuten kann.',
    lifeLayer:
      'Auf der Lebens-Ebene kann Wasser für innere Tiefe, Reinigung, Grenze, Übergang und neues Leben stehen.',
    reflectionQuestion: 'Wo zeigt sich in deinem Leben gerade eine Grenze, die vielleicht auch ein Übergang werden kann?',
    letterBreakdown: [
      {
        letter: 'מ',
        name: 'Mem',
        transliteration: 'm',
        meaning: 'Kann symbolisch mit Tiefe, Wasser und Mutterraum verbunden werden.',
        numericValue: getHebrewLetterValue('מ'),
      },
      {
        letter: 'י',
        name: 'Jod',
        transliteration: 'y',
        meaning: 'Kann als Punkt, Impuls oder Same gelesen werden.',
        numericValue: getHebrewLetterValue('י'),
      },
      {
        letter: 'ם',
        name: 'Mem Sofit',
        transliteration: 'm',
        meaning: 'Geschlossenes finales Mem; kann verborgene Tiefe andeuten.',
        numericValue: getHebrewLetterValue('ם'),
      },
    ],
    gematria: {
      value: calculateGematria('מים'),
      method: 'Standardgematria',
      explanation: 'Mem (40) + Jod (10) + Mem Sofit (40) = 90.',
    },
    firstOccurrences: WATER_SCRIPTURE_REFERENCES,
    scriptureReferences: WATER_SCRIPTURE_REFERENCES,
    verses: WATER_SCRIPTURE_REFERENCES.map((scriptureReference) => ({
      ...scriptureReference,
      layer: scriptureReference.reference.startsWith('Johannes') ? 'life' : 'biblical',
      note: scriptureReference.shortNote,
    })),
    relatedSymbols: ['meer', 'quelle', 'taufe', 'geist', 'tiefe', 'exodus', 'reinigung', 'leben', 'felsen', 'wueste', 'licht', 'brot', 'baum'],
    relations: [
      {
        targetId: 'meer',
        relationType: 'biblical_scene',
        strength: 0.9,
        explanation: 'Das Meer erweitert Wasser in Genesis und Exodus zum Bild von Tiefe, Grenze und möglichem Übergang.',
      },
      {
        targetId: 'quelle',
        relationType: 'archetype',
        strength: 0.86,
        explanation: 'Die Quelle kann Wasser als Ursprung, Gabe und hervortretendes Leben sichtbar machen.',
      },
      {
        targetId: 'taufe',
        relationType: 'transformation',
        strength: 0.94,
        explanation: 'Taufe kann Wasser als Zeichen von Reinigung, Übergang und neuer Ausrichtung lesen.',
      },
      {
        targetId: 'geist',
        relationType: 'biblical_scene',
        strength: 0.78,
        explanation: 'Genesis 1,2 verbindet Wasser mit dem Bild vom Geist über den Wassern.',
      },
      {
        targetId: 'tiefe',
        relationType: 'archetype',
        strength: 0.88,
        explanation: 'Wasser kann als Bild innerer und kosmischer Tiefe gelesen werden.',
      },
      {
        targetId: 'exodus',
        relationType: 'biblical_scene',
        strength: 0.84,
        explanation: 'Die Exodus-Erzählung am Meer macht Wasser zu einem Raum von Grenze und Durchzug.',
      },
      {
        targetId: 'leben',
        relationType: 'thematic_link',
        strength: 0.82,
        explanation: 'Wasser steht in vielen biblischen und lebensweltlichen Bildern nahe bei Leben und Lebendigkeit.',
      },
      {
        targetId: 'reinigung',
        relationType: 'transformation',
        strength: 0.8,
        explanation: 'Wasser kann symbolisch als Zeichen von Waschung, Klärung und Neubeginn gelesen werden.',
      },
      {
        targetId: 'felsen',
        relationType: 'biblical_scene',
        strength: 0.76,
        explanation: 'Numeri 20 kann als Szene gelesen werden, in der Wasser aus dem Felsen Leben im Mangel andeutet.',
      },
      {
        targetId: 'wueste',
        relationType: 'contrast',
        strength: 0.7,
        explanation: 'Die Wüste macht Wasser als Gabe im Mangel besonders sichtbar.',
      },
      {
        targetId: 'licht',
        relationType: 'contrast',
        strength: 0.62,
        explanation: 'Licht macht sichtbar, was Wasser als Tiefe zunächst verbirgt.',
      },
      {
        targetId: 'brot',
        relationType: 'thematic_link',
        strength: 0.58,
        explanation: 'Wasser und Brot bilden elementare Zeichen von Versorgung.',
      },
      {
        targetId: 'baum',
        relationType: 'thematic_link',
        strength: 0.66,
        explanation: 'Der Baum zeigt, wie Wasser in Wachstum und Fruchtbarkeit übergeht.',
      },
    ],
    symbolRelations: [
      {
        targetId: 'meer',
        relationType: 'biblical_scene',
        strength: 0.9,
        explanation: 'Das Meer erweitert Wasser in Genesis und Exodus zum Bild von Tiefe, Grenze und möglichem Übergang.',
      },
      {
        targetId: 'quelle',
        relationType: 'archetype',
        strength: 0.86,
        explanation: 'Die Quelle kann Wasser als Ursprung, Gabe und hervortretendes Leben sichtbar machen.',
      },
      {
        targetId: 'taufe',
        relationType: 'transformation',
        strength: 0.94,
        explanation: 'Taufe kann Wasser als Zeichen von Reinigung, Übergang und neuer Ausrichtung lesen.',
      },
      {
        targetId: 'geist',
        relationType: 'biblical_scene',
        strength: 0.78,
        explanation: 'Genesis 1,2 verbindet Wasser mit dem Bild vom Geist über den Wassern.',
      },
      {
        targetId: 'tiefe',
        relationType: 'archetype',
        strength: 0.88,
        explanation: 'Wasser kann als Bild innerer und kosmischer Tiefe gelesen werden.',
      },
      {
        targetId: 'exodus',
        relationType: 'biblical_scene',
        strength: 0.84,
        explanation: 'Die Exodus-Erzählung am Meer macht Wasser zu einem Raum von Grenze und Durchzug.',
      },
      {
        targetId: 'leben',
        relationType: 'thematic_link',
        strength: 0.82,
        explanation: 'Wasser steht in vielen biblischen und lebensweltlichen Bildern nahe bei Leben und Lebendigkeit.',
      },
      {
        targetId: 'reinigung',
        relationType: 'transformation',
        strength: 0.8,
        explanation: 'Wasser kann symbolisch als Zeichen von Waschung, Klärung und Neubeginn gelesen werden.',
      },
      {
        targetId: 'felsen',
        relationType: 'biblical_scene',
        strength: 0.76,
        explanation: 'Numeri 20 kann als Szene gelesen werden, in der Wasser aus dem Felsen Leben im Mangel andeutet.',
      },
      {
        targetId: 'meer',
        relationType: 'shared_letters',
        strength: 0.72,
        explanation: 'מים und ים teilen im Schriftbild Jod und finales Mem; das Meer kann so als verdichtete Wasser-Tiefe gelesen werden.',
      },
    ],
    imageAssets: [
      {
        src: visualAssets.wasserHero,
        alt: 'Dunkler Wasserraum mit bewegter Oberfläche',
        role: 'hero',
      },
      {
        src: visualAssets.symbolnetzHero,
        alt: 'Atmosphärischer Hintergrund des Symbolnetzes',
        role: 'background',
      },
    ],
    roomHref: '/raeume/wasser',
  },
  {
    id: 'meer',
    name: 'Meer',
    hebrew: 'ים',
    transliteration: 'Jam',
    category: 'Wasser / Grenze / Tiefe',
    shortMeaning: 'Das große Ungeordnete, Grenze, Gefahr und Schwelle zur Rettung.',
    poeticIntro: 'Das Meer ist Wasser in seiner Weite: unbeherrschbar, gefährlich und doch manchmal der Ort, an dem ein Weg aufgeht.',
    reflectionQuestion: 'Welche große Fläche in deinem Leben wirkt bedrohlich und könnte doch zur Schwelle werden?',
    relatedSymbols: ['wasser', 'tiefe', 'exodus', 'wueste', 'felsen'],
    relations: [
      {
        targetId: 'wasser',
        relationType: 'archetype',
        strength: 0.9,
        explanation: 'Das Meer verdichtet Wasser zur großen Tiefe und zur Grenze.',
      },
      {
        targetId: 'exodus',
        relationType: 'biblical_scene',
        strength: 0.86,
        explanation: 'Im Exodus wird das Meer zur Schwelle zwischen Enge und Befreiung.',
      },
      {
        targetId: 'tiefe',
        relationType: 'thematic_link',
        strength: 0.78,
        explanation: 'Meer und Tiefe teilen das Motiv des Unverfügbaren unter der Oberfläche.',
      },
    ],
  },
  {
    id: 'quelle',
    name: 'Quelle',
    hebrew: 'מעין',
    transliteration: "Ma'ajan",
    category: 'Wasser / Ursprung / Leben',
    shortMeaning: 'Verborgenes Hervortreten von Leben, Ursprung und Versorgung.',
    poeticIntro: 'Die Quelle zeigt Wasser nicht als Masse, sondern als Beginn: etwas tritt hervor, leise genug, um übersehen zu werden.',
    reflectionQuestion: 'Wo beginnt in dir etwas Kleines, das Nahrung und Zukunft tragen könnte?',
    relatedSymbols: ['wasser', 'leben', 'baum', 'geist', 'wueste'],
    relations: [
      {
        targetId: 'wasser',
        relationType: 'archetype',
        strength: 0.86,
        explanation: 'Die Quelle zeigt Wasser als Ursprung und Gabe.',
      },
      {
        targetId: 'leben',
        relationType: 'thematic_link',
        strength: 0.84,
        explanation: 'Aus der Quelle wird Wasser als lebenserhaltende Bewegung lesbar.',
      },
      {
        targetId: 'baum',
        relationType: 'thematic_link',
        strength: 0.74,
        explanation: 'Quelle und Baum verbinden Wasser, Wurzel, Wachstum und Frucht.',
      },
    ],
  },
  {
    id: 'taufe',
    name: 'Taufe',
    hebrew: 'טבילה',
    transliteration: 'Tevilah',
    category: 'Wasser / Reinigung / Übergang',
    shortMeaning: 'Eintauchen, Sterben des Alten und Auftauchen in neuer Geburt.',
    poeticIntro: 'Taufe liest Wasser als Durchgang: unter die Oberfläche gehen, berührt werden und anders wieder auftauchen.',
    reflectionQuestion: 'Was darf in dir untergehen, damit etwas Wahreres auftauchen kann?',
    relatedSymbols: ['wasser', 'geist', 'reinigung', 'leben', 'licht'],
    relations: [
      {
        targetId: 'wasser',
        relationType: 'transformation',
        strength: 0.94,
        explanation: 'Taufe macht Wasser zum Zeichen von Reinigung, Übergang und neuer Ausrichtung.',
      },
      {
        targetId: 'geist',
        relationType: 'biblical_scene',
        strength: 0.82,
        explanation: 'In der Taufszene Jesu treten Wasser, Geist und Berufung zusammen.',
      },
      {
        targetId: 'reinigung',
        relationType: 'thematic_link',
        strength: 0.8,
        explanation: 'Taufe und Reinigung teilen das Motiv eines geklärten Neubeginns.',
      },
    ],
  },
  {
    id: 'geist',
    name: 'Geist',
    hebrew: 'רוח',
    transliteration: 'Ruach',
    category: 'Atem / Wind / Bewegung',
    shortMeaning: 'Atem, Wind und unsichtbare Bewegung, die Leben trägt.',
    poeticIntro: 'Geist ist die unsichtbare Bewegung über dem Wasser: nicht Besitz, sondern Atem, Wehen und lebendige Gegenwart.',
    reflectionQuestion: 'Welche leise Bewegung bringt gerade Ordnung in dein Noch-Nicht?',
    relatedSymbols: ['wasser', 'taufe', 'licht', 'quelle', 'leben'],
    relations: [
      {
        targetId: 'wasser',
        relationType: 'biblical_scene',
        strength: 0.78,
        explanation: 'Genesis 1,2 verbindet den Geist mit dem Schweben über den Wassern.',
      },
      {
        targetId: 'taufe',
        relationType: 'biblical_scene',
        strength: 0.82,
        explanation: 'Die Taufe Jesu verbindet Wasser, Geist und Stimme.',
      },
      {
        targetId: 'leben',
        relationType: 'thematic_link',
        strength: 0.72,
        explanation: 'Atem und Geist stehen nahe bei Lebendigkeit und Belebung.',
      },
    ],
  },
  {
    id: 'tiefe',
    name: 'Tiefe',
    hebrew: 'תהום',
    transliteration: 'Tehom',
    category: 'Urtiefe / Verborgenes / Anfang',
    shortMeaning: 'Der verborgene Raum unter der Oberfläche, offen für Deutung und Wandlung.',
    poeticIntro: 'Tiefe ist der Raum, der nicht sofort antwortet. Sie liegt unter dem Sichtbaren und bewahrt das Ungeformte.',
    reflectionQuestion: 'Welche Tiefe in dir braucht nicht sofort eine Erklärung?',
    relatedSymbols: ['wasser', 'meer', 'geist', 'quelle'],
    relations: [
      {
        targetId: 'wasser',
        relationType: 'archetype',
        strength: 0.88,
        explanation: 'Wasser kann als Bild innerer und kosmischer Tiefe gelesen werden.',
      },
      {
        targetId: 'meer',
        relationType: 'thematic_link',
        strength: 0.78,
        explanation: 'Das Meer gibt der Tiefe eine sichtbare, unruhige Gestalt.',
      },
      {
        targetId: 'geist',
        relationType: 'biblical_scene',
        strength: 0.7,
        explanation: 'Am Anfang stehen Tiefe, Wasser und Geist im selben Deutungsraum.',
      },
    ],
  },
  {
    id: 'exodus',
    name: 'Exodus',
    hebrew: '',
    transliteration: '',
    category: 'Befreiung / Weg / Übergang',
    shortMeaning: 'Auszug, Befreiung und der Gang durch eine Grenze hindurch.',
    poeticIntro: 'Exodus ist Bewegung aus der Enge: der Schritt, bei dem das Wasser nicht verschwindet, sondern zum Durchgang wird.',
    reflectionQuestion: 'Aus welcher Enge führt dich ein Weg, der noch nicht ganz sichtbar ist?',
    relatedSymbols: ['wasser', 'meer', 'wueste', 'brot', 'felsen'],
    relations: [
      {
        targetId: 'meer',
        relationType: 'biblical_scene',
        strength: 0.86,
        explanation: 'Das Meer markiert im Exodus die dramatische Grenze des Auszugs.',
      },
      {
        targetId: 'wueste',
        relationType: 'sequence',
        strength: 0.78,
        explanation: 'Nach dem Durchzug beginnt der Weg durch die Wüste.',
      },
      {
        targetId: 'wasser',
        relationType: 'transformation',
        strength: 0.84,
        explanation: 'Wasser wird im Exodus von der Grenze zum Durchgang.',
      },
    ],
  },
  {
    id: 'leben',
    name: 'Leben',
    hebrew: 'חיים',
    transliteration: 'Chajim',
    category: 'Leben / Gabe / Wachstum',
    shortMeaning: 'Lebendigkeit, Gabe und die Kraft, neu aufzubrechen.',
    poeticIntro: 'Leben zeigt sich dort, wo Wasser nicht nur berührt, sondern nährt, bewegt und Zukunft möglich macht.',
    reflectionQuestion: 'Was in dir will nicht nur überleben, sondern wirklich lebendig werden?',
    relatedSymbols: ['wasser', 'quelle', 'baum', 'brot', 'geist'],
    relations: [
      {
        targetId: 'wasser',
        relationType: 'thematic_link',
        strength: 0.82,
        explanation: 'Wasser steht in vielen biblischen und lebensweltlichen Bildern nahe bei Leben.',
      },
      {
        targetId: 'quelle',
        relationType: 'archetype',
        strength: 0.84,
        explanation: 'Die Quelle macht Leben als hervortretende Gabe sichtbar.',
      },
      {
        targetId: 'baum',
        relationType: 'thematic_link',
        strength: 0.78,
        explanation: 'Baum und Leben teilen Wachstum, Frucht und Verwurzelung.',
      },
    ],
  },
  {
    id: 'reinigung',
    name: 'Reinigung',
    hebrew: 'טהרה',
    transliteration: 'Taharah',
    category: 'Reinigung / Klärung / Neubeginn',
    shortMeaning: 'Klärung, Waschung und symbolischer Neubeginn.',
    poeticIntro: 'Reinigung ist nicht Auslöschung, sondern Klärung: Wasser nimmt Schwere auf und macht den Blick wieder frei.',
    reflectionQuestion: 'Was müsste nicht verurteilt, sondern behutsam geklärt werden?',
    relatedSymbols: ['wasser', 'taufe', 'licht', 'leben'],
    relations: [
      {
        targetId: 'wasser',
        relationType: 'transformation',
        strength: 0.8,
        explanation: 'Wasser kann als Zeichen von Waschung, Klärung und Neubeginn gelesen werden.',
      },
      {
        targetId: 'taufe',
        relationType: 'thematic_link',
        strength: 0.8,
        explanation: 'Taufe nimmt Reinigung als Durchgang in eine neue Ausrichtung auf.',
      },
      {
        targetId: 'licht',
        relationType: 'thematic_link',
        strength: 0.68,
        explanation: 'Reinigung und Licht teilen das Motiv von Klarheit.',
      },
    ],
  },
  {
    id: 'licht',
    name: 'Licht',
    hebrew: 'אור',
    transliteration: 'Or',
    category: 'Schöpfung / Klarheit / Orientierung',
    shortMeaning: 'Klarheit, Offenbarung und Orientierung im dunklen Raum.',
    poeticIntro: 'Licht fällt auf die Wasser und macht Konturen sichtbar. Es trennt nicht kalt, sondern schenkt Orientierung.',
    reflectionQuestion: 'Welches kleine Licht würde gerade genügen, damit eine Spur sichtbar wird?',
    scriptureReferences: LIGHT_SCRIPTURE_REFERENCES,
    relatedSymbols: ['wasser', 'geist', 'reinigung', 'brot', 'baum'],
    relations: [
      {
        targetId: 'geist',
        relationType: 'thematic_link',
        strength: 0.72,
        explanation: 'Licht und Geist stehen für Orientierung, Bewegung und Offenbarung.',
      },
      {
        targetId: 'wasser',
        relationType: 'contrast',
        strength: 0.62,
        explanation: 'Licht macht sichtbar, was Wasser als Tiefe zunächst verbirgt.',
      },
      {
        targetId: 'reinigung',
        relationType: 'thematic_link',
        strength: 0.68,
        explanation: 'Reinigung und Licht teilen das Motiv von Klärung.',
      },
    ],
    roomHref: '/symbole/licht',
  },
  {
    id: 'wueste',
    name: 'Wüste',
    hebrew: 'מדבר',
    transliteration: 'Midbar',
    category: 'Mangel / Prüfung / Hören',
    shortMeaning: 'Stille, Prüfung, Leere und der Ort, an dem das Wort hörbar wird.',
    poeticIntro: 'Die Wüste entzieht. Gerade dort werden Wasser, Brot und Stimme nicht selbstverständlich, sondern Gabe.',
    reflectionQuestion: 'Welche Leere macht in dir hörbar, was im Überfluss untergeht?',
    relatedSymbols: ['wasser', 'exodus', 'meer', 'felsen', 'brot', 'quelle'],
    relations: [
      {
        targetId: 'exodus',
        relationType: 'sequence',
        strength: 0.78,
        explanation: 'Die Wüste folgt als Prüfungsraum auf den Auszug.',
      },
      {
        targetId: 'felsen',
        relationType: 'biblical_scene',
        strength: 0.74,
        explanation: 'In der Wüste wird der Felsen zum Ort unerwarteten Wassers.',
      },
      {
        targetId: 'brot',
        relationType: 'biblical_scene',
        strength: 0.7,
        explanation: 'Brot und Wüste verbinden Mangel, Versorgung und tägliche Gabe.',
      },
    ],
    roomHref: '/raeume/wueste',
  },
  {
    id: 'felsen',
    name: 'Felsen',
    hebrew: 'צור',
    transliteration: 'Zur',
    category: 'Stand / Widerstand / Versorgung',
    shortMeaning: 'Stand, Schutz, Härte und die verborgene Quelle im Widerstand.',
    poeticIntro: 'Der Felsen wirkt verschlossen. Doch im biblischen Bild kann gerade aus dem Harten Wasser kommen.',
    reflectionQuestion: 'Wo könnte aus Widerstand eine unerwartete Gabe hervortreten?',
    relatedSymbols: ['wasser', 'wueste', 'quelle', 'exodus', 'meer'],
    relations: [
      {
        targetId: 'wasser',
        relationType: 'biblical_scene',
        strength: 0.76,
        explanation: 'Numeri 20 kann als Szene gelesen werden, in der Wasser aus dem Felsen kommt.',
      },
      {
        targetId: 'wueste',
        relationType: 'biblical_scene',
        strength: 0.74,
        explanation: 'Der Felsen wird im Wüstenraum zum Ort der Versorgung.',
      },
      {
        targetId: 'quelle',
        relationType: 'contrast',
        strength: 0.64,
        explanation: 'Quelle und Felsen verbinden weiches Hervortreten mit hartem Widerstand.',
      },
    ],
  },
  {
    id: 'brot',
    name: 'Brot',
    hebrew: 'לחם',
    transliteration: 'Lechem',
    category: 'Nahrung / Gabe / Gemeinschaft',
    shortMeaning: 'Nahrung, Teilung, Alltag und die Gabe, die Gemeinschaft stiftet.',
    poeticIntro: 'Brot ist verdichtete Versorgung: nicht spektakulär, aber täglich, teilbar und gemeinschaftsstiftend.',
    reflectionQuestion: 'Welche einfache Gabe nährt gerade mehr, als sie auf den ersten Blick zeigt?',
    relatedSymbols: ['wueste', 'leben', 'wasser', 'licht', 'baum'],
    relations: [
      {
        targetId: 'wueste',
        relationType: 'biblical_scene',
        strength: 0.7,
        explanation: 'In der Wüste wird Nahrung als tägliche Gabe erfahrbar.',
      },
      {
        targetId: 'leben',
        relationType: 'thematic_link',
        strength: 0.72,
        explanation: 'Brot steht für Nahrung und damit für erhaltenes Leben.',
      },
      {
        targetId: 'wasser',
        relationType: 'thematic_link',
        strength: 0.58,
        explanation: 'Wasser und Brot bilden elementare Zeichen von Versorgung.',
      },
    ],
    roomHref: '/raeume/brot',
  },
  {
    id: 'baum',
    name: 'Baum',
    hebrew: 'עץ',
    transliteration: 'Etz',
    category: 'Wachstum / Frucht / Verwurzelung',
    shortMeaning: 'Wurzel, Frucht, Wachstum und Verbindung zwischen Erde und Himmel.',
    poeticIntro: 'Der Baum steht still und erzählt doch von Bewegung: Wasser steigt, Licht wird aufgenommen, Frucht wird möglich.',
    reflectionQuestion: 'Was braucht in dir Wurzel, Wasser und Licht, bevor es Frucht tragen kann?',
    relatedSymbols: ['quelle', 'wasser', 'leben', 'licht', 'brot'],
    relations: [
      {
        targetId: 'quelle',
        relationType: 'thematic_link',
        strength: 0.74,
        explanation: 'Die Quelle nährt den Baum als Bild von Wachstum und Frucht.',
      },
      {
        targetId: 'leben',
        relationType: 'thematic_link',
        strength: 0.78,
        explanation: 'Baum und Leben teilen die Motive von Wachstum, Frucht und Dauer.',
      },
      {
        targetId: 'licht',
        relationType: 'thematic_link',
        strength: 0.66,
        explanation: 'Licht macht Wachstum sichtbar und möglich.',
      },
    ],
  },
];

export const SYMBOLS: SymbolItem[] = [
  {
    slug: 'wasser',
    name: 'Wasser',
    hebrew: 'מים',
    shortMeaning: 'Tiefe, Leben, Reinigung, Grenze, Übergang und neue Geburt.',
    outerLevel: 'Meer, Quelle, Taufe, Jordan, Wasser aus dem Felsen',
    symbolicLevel: 'Im SYMBOLRAUM kann Wasser als Tiefe, Leben, Reinigung, Grenze, Übergang und neue Geburt gelesen werden.',
    bibleReferences: ['Genesis 1,2', 'Genesis 1,6-10', 'Exodus 14', 'Numeri 20,2-13', 'Josua 3', 'Matthäus 3,13-17', 'Johannes 4,7-15'],
    firstOccurrences: WATER_SCRIPTURE_REFERENCES,
    scriptureReferences: WATER_SCRIPTURE_REFERENCES,
    hebrewTrace: 'מים / Majim: מ kann als Wasser, Tiefe, Mutterraum und Ursprung gelesen werden; י als Punkt, Same und Impuls; ם als finales Mem und geschlossene, verborgene Tiefe.',
    numberMeaning: '90 – Mem (40) + Jod (10) + finales Mem (40); im SYMBOLRAUM kann die Zahl als Verdichtung von Tiefe, Impuls und verborgener Tiefe betrachtet werden.',
    lifeQuestion: 'Wo zeigt sich in deinem Leben gerade eine Grenze, die vielleicht auch ein Übergang werden kann?',
    meditation: 'Stell dir Wasser als stillen Raum vor: Es berührt, klärt und öffnet vorsichtig den Weg zu neuem Leben.',
    connectedSymbols: ['meer', 'quelle', 'taufe', 'geist', 'tiefe', 'exodus', 'reinigung', 'leben', 'felsen'],
  },
  {
    slug: 'wueste',
    name: 'Wüste',
    hebrew: 'מדבר',
    shortMeaning: 'Ein Raum der Reduktion, der Stille und der inneren Prüfung.',
    outerLevel: 'Sand, Stille, Weite',
    symbolicLevel: 'Initiation, Prüfung, Offenbarung',
    bibleReferences: ['Matthäus 4,1-11', 'Exodus 3', 'Jesaja 35,1-2'],
    hebrewTrace: 'Die Wüste als Ort, an dem Gott spricht und die Seele sich formt.',
    numberMeaning: '7 – Vollendung und spirituelle Reife mitten in der Leere.',
    lifeQuestion: 'Welche innere Wüste fordert dich auf, langsamer zu werden?',
    meditation: 'Gehe gedanklich durch eine weite Ebene und höre, wie jedes Geräusch deiner Seele einen Raum findet.',
    connectedSymbols: ['wasser', 'berg', 'aegypten', 'weg'],
  },
  {
    slug: 'brot',
    name: 'Brot',
    hebrew: 'לחם',
    shortMeaning: 'Das Fundament der Gemeinschaft und das sichtbare Zeichen von Nahrung.',
    outerLevel: 'Brotlaib, Mahl, Tisch',
    symbolicLevel: 'Nahrung, Fürsorge, Teilung, Fülle aus Einfachheit',
    bibleReferences: ['Matthäus 6,11', 'Johannes 6,35', 'Markus 8,6-8'],
    hebrewTrace: 'Brot als Zeichen des täglichen Geschenks und des heiligen Teilens.',
    numberMeaning: '5 – Offenheit, Empfangen und die Menschlichkeit des täglichen Gebrauchs.',
    lifeQuestion: 'Wie nährst du dich selbst und andere in deiner Gegenwart?',
    meditation: 'Stell dir vor, du teilst ein einfaches Brot in Stille und lässt Dankbarkeit in dir wachsen.',
    connectedSymbols: ['wasser', 'licht', 'name'],
  },
  {
    slug: 'licht',
    name: 'Licht',
    hebrew: 'אור',
    shortMeaning: 'Die Klarheit, die das Verborgene offenlegt und Orientierung schenkt.',
    outerLevel: 'Sonne, Lampe, Strahl',
    symbolicLevel: 'Erkenntnis, Hoffnung, Schöpfung',
    bibleReferences: ['Genesis 1,3', 'Johannes 8,12', 'Psalm 119,105', '1. Johannes 1,5'],
    firstOccurrences: LIGHT_SCRIPTURE_REFERENCES,
    scriptureReferences: LIGHT_SCRIPTURE_REFERENCES,
    hebrewTrace: 'Licht als Urwort der Schöpfung und inneren Erlösung.',
    numberMeaning: '1 – Ursprung, Einzelheit und die klare Linie der Intention.',
    lifeQuestion: 'Welches kleine Licht willst du heute entzünden?',
    meditation: 'Atme sanft ein und stelle dir vor, ein heller Faden zieht durch dein Herz und macht den Weg sichtbar.',
    connectedSymbols: ['brot', 'weg', 'berg'],
  },
  {
    slug: 'feuer',
    name: 'Feuer',
    hebrew: 'אש',
    shortMeaning: 'Potential, Gegenwart, Führung, Läuterung und Verwandlung.',
    outerLevel: 'Glut, Funke, Flamme, Feuersäule',
    symbolicLevel: 'Offenbarung, Ruf, Führung, Reinigung',
    bibleReferences: ['Exodus 3,2', 'Exodus 13,21', 'Maleachi 3,2-3'],
    hebrewTrace: 'אש / Esch: Aleph kann als stiller Ursprung und Shin als bewegtes Feuer und verwandelnde Kraft gelesen werden.',
    numberMeaning: '301 – Aleph (1) + Shin (300); im SYMBOLRAUM kann die Zahl als Verbindung von Ursprung und verwandelnder Energie betrachtet werden.',
    lifeQuestion: 'Was glimmt bereits in dir?',
    meditation: 'Nimm wahr, was in dir leise Wärme trägt und noch keine große Flamme sein muss.',
    connectedSymbols: ['licht', 'weg', 'wueste'],
  },
  {
    slug: 'weg',
    name: 'Weg',
    hebrew: 'דרך',
    shortMeaning: 'Die Bewegung von einem Ort zum anderen, der Schritt ins Unbekannte.',
    outerLevel: 'Pfad, Straße, Spur',
    symbolicLevel: 'Wahl, Reise, Richtung',
    bibleReferences: ['Johannes 14,6', 'Psalm 23,3', 'Jesaja 30,21'],
    hebrewTrace: 'Der Weg als Lebensspur und Ruf zur Entscheidung.',
    numberMeaning: '3 – Entwicklung, Weg und das Gelenk zwischen Anfang und Ziel.',
    lifeQuestion: 'Welche Spur öffnet sich, wenn du ehrlich vertraust?',
    meditation: 'Stell dir einen schmalen Pfad vor, der vor dir auftaucht und dich ruhig weiterführt.',
    connectedSymbols: ['licht', 'wasser', 'berg'],
  },
  {
    slug: 'name',
    name: 'Name',
    hebrew: 'שם',
    shortMeaning: 'Die Essenz und Identität, die tiefer spricht als Worte.',
    outerLevel: 'Bezeichnung, Ruf, Wort',
    symbolicLevel: 'Berufung, Wahrheit, Offenbarung',
    bibleReferences: ['Psalm 8,1', 'Matthäus 1,21', 'Exodus 3,14'],
    hebrewTrace: 'Name als Träger von Sinn, Gegenwart und geheimem Klang.',
    numberMeaning: '4 – Stabilität, Struktur und das, was dich in der Welt einbettet.',
    lifeQuestion: 'Welcher Name hat in deinem Inneren Gewicht?',
    meditation: 'Höre in dich hinein und lass ein Wort auftauchen, das dich ernst nimmt und zugleich frei macht.',
    connectedSymbols: ['brot', 'licht', 'aegypten'],
  },
  {
    slug: 'berg',
    name: 'Berg',
    hebrew: 'הר',
    shortMeaning: 'Die Erhebung, der Ort der Begegnung mit dem Höheren.',
    outerLevel: 'Stein, Gipfel, Kuppe',
    symbolicLevel: 'Gotteskontakt, Ruhe, höherer Blick',
    bibleReferences: ['Matthäus 17,1-8', '2. Mose 19,20', 'Psalm 121,1'],
    hebrewTrace: 'Berg als heilige Schwelle und Ort innerer Weite.',
    numberMeaning: '8 – Transzendenz, neuer Beginn jenseits des Gewohnten.',
    lifeQuestion: 'Welche Höhe will deine Seele heute betreten?',
    meditation: 'Stell dir vor, du bist an einem Gipfel und betrachtest die Welt mit ruhigen Augen.',
    connectedSymbols: ['weg', 'wueste', 'licht'],
  },
  {
    slug: 'aegypten',
    name: 'Ägypten',
    hebrew: 'מצרים',
    shortMeaning: 'Der Ort der Enge, des Überflusses und des Auszugs in die Freiheit.',
    outerLevel: 'Palmen, Flussufer, Mauer',
    symbolicLevel: 'Gefangenschaft, Erinnerung, Befreiung',
    bibleReferences: ['2. Mose 12', '2. Mose 14', 'Psalm 90,1'],
    hebrewTrace: 'Ägypten als Bild von Fremdheit und dem Ruf zur Heimkehr.',
    numberMeaning: '9 – Vollendung der alten Ordnung und die Schwelle zur Befreiung.',
    lifeQuestion: 'Welches vertraute Gefängnis spürst du in deinem Alltag?',
    meditation: 'Betrachte einen Ort, der dich einengt, und atme bewusst den Wunsch nach Aufbruch.',
    connectedSymbols: ['wueste', 'name', 'brot'],
  },
];

export function getAllSymbols() {
  return SYMBOLS;
}

export function getSymbolBySlug(slug: string) {
  return SYMBOLS.find((symbol) => symbol.slug === slug);
}

export function getConnectedSymbols(slugs: string[]) {
  return SYMBOLS.filter((symbol) => slugs.includes(symbol.slug));
}
