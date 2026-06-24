export type RoomHebrewMovementStation = {
  id: string;
  label: string;
  hebrew: string;
  meaning: string;
  codexId: string;
};

export type RoomHebrewMovement = {
  symbolId: string;
  title: string;
  summary: string;
  stations: RoomHebrewMovementStation[];
};

export const roomHebrewMovements: RoomHebrewMovement[] = [
  {
    symbolId: "wasser",
    title: "Hebraeische Spur durch diesen Raum",
    summary: "Aus Tiefe wird Atem, aus Atem wird Wasser, aus Wasser wird Uebergang.",
    stations: [
      { id: "wasser-tehom", label: "tehom", hebrew: "\u05ea\u05d4\u05d5\u05dd", meaning: "Die Tiefe birgt, was noch keine Gestalt hat.", codexId: "tehom" },
      { id: "wasser-ruach", label: "ruach", hebrew: "\u05e8\u05d5\u05d7", meaning: "Der Atem bewegt die Tiefe, bevor etwas sichtbar wird.", codexId: "ruach" },
      { id: "wasser-majim", label: "majim", hebrew: "\u05de\u05d9\u05dd", meaning: "Wasser sammelt Ursprung, Leben und verborgene Bewegung.", codexId: "majim" },
      { id: "wasser-mikwe", label: "mikwe", hebrew: "\u05de\u05e7\u05d5\u05d4", meaning: "Die Sammlung wird zum Ort der Reinigung und Erwartung.", codexId: "mikwe" },
      { id: "wasser-jordan", label: "jordan", hebrew: "\u05d9\u05e8\u05d3\u05df", meaning: "Der Fluss wird zur Schwelle in ein anderes Land.", codexId: "jordan" },
    ],
  },
  {
    symbolId: "licht",
    title: "Die Bewegung dieses Raums",
    summary: "Licht wird Antlitz, Antlitz wird Gewicht, Gewicht wird Weisheit.",
    stations: [
      { id: "licht-or", label: "or", hebrew: "\u05d0\u05d5\u05e8", meaning: "Licht macht sichtbar, was im Dunkel noch ungeordnet liegt.", codexId: "or" },
      { id: "licht-panim", label: "panim", hebrew: "\u05e4\u05e0\u05d9\u05dd", meaning: "Das Sichtbare wird zum Angesicht, das Antwort erwartet.", codexId: "panim" },
      { id: "licht-kavod", label: "kavod", hebrew: "\u05db\u05d1\u05d5\u05d3", meaning: "Herrlichkeit gibt dem Licht Gewicht und Gegenwart.", codexId: "kavod" },
      { id: "licht-chokma", label: "chokma", hebrew: "\u05d7\u05db\u05de\u05d4", meaning: "Weisheit erkennt die Ordnung, die im Licht aufscheint.", codexId: "chokma" },
      { id: "licht-bina", label: "bina", hebrew: "\u05d1\u05d9\u05e0\u05d4", meaning: "Einsicht unterscheidet, was das Licht verbunden zeigt.", codexId: "bina" },
    ],
  },
  {
    symbolId: "feuer",
    title: "Die Bewegung dieses Raums",
    summary: "Aus Anfang wird Flamme, aus Flamme Naehe, aus Naehe Atem.",
    stations: [
      { id: "feuer-aleph", label: "aleph", hebrew: "\u05d0", meaning: "Aleph steht still am Anfang, bevor die Flamme spricht.", codexId: "aleph" },
      { id: "feuer-esch", label: "esch", hebrew: "\u05d0\u05e9", meaning: "Feuer macht Gegenwart sichtbar, ohne sie verfuegbar zu machen.", codexId: "esch" },
      { id: "feuer-mizbeach", label: "mizbeach", hebrew: "\u05de\u05d6\u05d1\u05d7", meaning: "Der Altar sammelt Naehe, Grenze und Hingabe an einem Ort.", codexId: "mizbeach" },
      { id: "feuer-korban", label: "korban", hebrew: "\u05e7\u05e8\u05d1\u05df", meaning: "Die Gabe wird zur Bewegung des Naeherkommens.", codexId: "korban" },
      { id: "feuer-ruach", label: "ruach", hebrew: "\u05e8\u05d5\u05d7", meaning: "Aus dem Brennen bleibt Atem, der weitertraegt.", codexId: "ruach" },
    ],
  },
  {
    symbolId: "wueste",
    title: "Hebraeische Spur durch diesen Raum",
    summary: "Leere wird Weg, Weg wird Zeichen, Zeichen wird Stimme.",
    stations: [
      { id: "wueste-midbar", label: "midbar", hebrew: "\u05de\u05d3\u05d1\u05e8", meaning: "Die Wueste ist der Raum, in dem Leere hoerbar wird.", codexId: "midbar" },
      { id: "wueste-derech", label: "derech", hebrew: "\u05d3\u05e8\u05da", meaning: "Der Weg entsteht, waehrend man ihn geht.", codexId: "derech" },
      { id: "wueste-nes", label: "nes", hebrew: "\u05e0\u05e1", meaning: "Das Zeichen hebt Orientierung aus dem Offenen hervor.", codexId: "nes" },
      { id: "wueste-sinai", label: "sinai", hebrew: "\u05e1\u05d9\u05e0\u05d9", meaning: "Sinai sammelt Warten, Furcht und Offenbarung am Berg.", codexId: "sinai" },
      { id: "wueste-qol", label: "qol", hebrew: "\u05e7\u05d5\u05dc", meaning: "Die Stimme macht aus Stille einen Ruf.", codexId: "qol" },
    ],
  },
  {
    symbolId: "brot",
    title: "Die Bewegung dieses Raums",
    summary: "Gabe wird Korn, Korn wird Brot, Brot wird Teilen.",
    stations: [
      { id: "brot-manna", label: "manna", hebrew: "\u05de\u05df", meaning: "Manna ist Gabe, bevor Besitz daraus werden kann.", codexId: "manna" },
      { id: "brot-dagan", label: "dagan", hebrew: "\u05d3\u05d2\u05df", meaning: "Korn traegt die verborgene Geduld des Wachsens.", codexId: "dagan" },
      { id: "brot-lechem", label: "lechem", hebrew: "\u05dc\u05d7\u05dd", meaning: "Brot macht Nahrung greifbar und gemeinsam.", codexId: "lechem" },
      { id: "brot-shever", label: "shever", hebrew: "\u05e9\u05d1\u05e8", meaning: "Im Brechen wird sichtbar, dass Gabe teilbar ist.", codexId: "shever" },
      { id: "brot-seudah", label: "seudah", hebrew: "\u05e1\u05e2\u05d5\u05d3\u05d4", meaning: "Das Mahl verwandelt Nahrung in Gemeinschaft.", codexId: "seudah" },
    ],
  },
];

export function getRoomHebrewMovement(symbolId: string): RoomHebrewMovement | undefined {
  return roomHebrewMovements.find((movement) => movement.symbolId === symbolId);
}
