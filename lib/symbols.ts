export type SymbolItem = {
  slug: string;
  name: string;
  hebrew: string;
  shortMeaning: string;
  outerLevel: string;
  symbolicLevel: string;
  bibleReferences: string[];
  hebrewTrace: string;
  numberMeaning: string;
  lifeQuestion: string;
  meditation: string;
  connectedSymbols: string[];
};

export type SymbolNetworkItem = {
  id: string;
  name: string;
  hebrew: string;
  shortMeaning: string;
  relatedSymbols: string[];
  roomHref?: string;
};

export const SYMBOL_NETWORK: SymbolNetworkItem[] = [
  {
    id: 'wasser',
    name: 'Wasser',
    hebrew: 'מים',
    shortMeaning: 'Tiefe, Leben, Reinigung und Übergang.',
    relatedSymbols: ['meer', 'quelle', 'taufe', 'geist', 'licht', 'wueste'],
    roomHref: '/raeume/wasser',
  },
  {
    id: 'meer',
    name: 'Meer',
    hebrew: 'ים',
    shortMeaning: 'Das große Ungeordnete, Grenze, Gefahr und Schwelle zur Rettung.',
    relatedSymbols: ['wasser', 'wueste', 'fels'],
  },
  {
    id: 'quelle',
    name: 'Quelle',
    hebrew: 'מעין',
    shortMeaning: 'Verborgenes Hervortreten von Leben, Ursprung und Versorgung.',
    relatedSymbols: ['wasser', 'baum', 'geist'],
  },
  {
    id: 'taufe',
    name: 'Taufe',
    hebrew: 'טבילה',
    shortMeaning: 'Eintauchen, Sterben des Alten und Auftauchen in neuer Geburt.',
    relatedSymbols: ['wasser', 'geist', 'licht'],
  },
  {
    id: 'geist',
    name: 'Geist',
    hebrew: 'רוח',
    shortMeaning: 'Atem, Wind und unsichtbare Bewegung, die Leben trägt.',
    relatedSymbols: ['wasser', 'taufe', 'licht', 'quelle'],
  },
  {
    id: 'licht',
    name: 'Licht',
    hebrew: 'אור',
    shortMeaning: 'Klarheit, Offenbarung und Orientierung im dunklen Raum.',
    relatedSymbols: ['wasser', 'geist', 'brot', 'baum'],
    roomHref: '/symbole/licht',
  },
  {
    id: 'wueste',
    name: 'Wüste',
    hebrew: 'מדבר',
    shortMeaning: 'Stille, Prüfung, Leere und der Ort, an dem das Wort hörbar wird.',
    relatedSymbols: ['wasser', 'meer', 'fels', 'brot'],
    roomHref: '/symbole/wueste',
  },
  {
    id: 'fels',
    name: 'Fels',
    hebrew: 'צור',
    shortMeaning: 'Stand, Schutz, Härte und die verborgene Quelle im Widerstand.',
    relatedSymbols: ['wueste', 'wasser', 'meer'],
  },
  {
    id: 'brot',
    name: 'Brot',
    hebrew: 'לחם',
    shortMeaning: 'Nahrung, Teilung, Alltag und die Gabe, die Gemeinschaft stiftet.',
    relatedSymbols: ['wueste', 'licht', 'baum'],
    roomHref: '/symbole/brot',
  },
  {
    id: 'baum',
    name: 'Baum',
    hebrew: 'עץ',
    shortMeaning: 'Wurzel, Frucht, Wachstum und Verbindung zwischen Erde und Himmel.',
    relatedSymbols: ['quelle', 'licht', 'brot'],
  },
];

export const SYMBOLS: SymbolItem[] = [
  {
    slug: 'wasser',
    name: 'Wasser',
    hebrew: 'מים',
    shortMeaning: 'Der Urstrom des Lebens, das Fließen und die Bereitschaft zur Wandlung.',
    outerLevel: 'Fluss, Regen, Tau, Quelle',
    symbolicLevel: 'Reinigung, Leben, Erneuerung, Übergang',
    bibleReferences: ['Johannes 4,14', 'Psalm 23,2', 'Ezechiel 47,1-12'],
    hebrewTrace: 'Wasser als Lebensquelle und heilige Reinigung im biblischen Vokabular.',
    numberMeaning: '2 – Dualität, Paarung, Verbindung von Ursprung und Erneuerung.',
    lifeQuestion: 'Wo in dir braucht es jetzt ein langsam fließendes Ja?',
    meditation: 'Stell dir vor, dein Inneres wird zu einem stillen Bach, der jede Verhärtung sanft umspült.',
    connectedSymbols: ['brot', 'licht', 'weg', 'wueste'],
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
    bibleReferences: ['Johannes 8,12', 'Psalm 119,105', '1. Johannes 1,5'],
    hebrewTrace: 'Licht als Urwort der Schöpfung und inneren Erlösung.',
    numberMeaning: '1 – Ursprung, Einzelheit und die klare Linie der Intention.',
    lifeQuestion: 'Welches kleine Licht willst du heute entzünden?',
    meditation: 'Atme sanft ein und stelle dir vor, ein heller Faden zieht durch dein Herz und macht den Weg sichtbar.',
    connectedSymbols: ['brot', 'weg', 'berg'],
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
    lifeQuestion: 'Wohin führt dein nächster Schritt, wenn du ehrlich vertraust?',
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
