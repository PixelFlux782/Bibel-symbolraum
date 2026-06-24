import { buildSymbolRoomHref, getSymbolPathConfig, type ConfiguredSymbolId } from "./symbolPathConfig";

export type RoomTransition = {
  sourceRoom: ConfiguredSymbolId;
  targetRoom: ConfiguredSymbolId;
  title: string;
  shortMeaning: string;
  prepares: readonly string[];
  keywords: readonly string[];
};

export const roomTransitions = [
  {
    sourceRoom: "wasser",
    targetRoom: "licht",
    title: "Aus der Tiefe hebt sich Licht",
    shortMeaning: "Was verborgen war, beginnt sichtbar zu werden.",
    prepares: ["Offenbarung", "Ordnung", "Erkenntnis"],
    keywords: ["Tiefe", "Sichtbarkeit", "Offenbarung", "Ordnung", "Erkenntnis"],
  },
  {
    sourceRoom: "licht",
    targetRoom: "feuer",
    title: "Was sichtbar wird, will verwandelt werden",
    shortMeaning: "Erkenntnis bleibt nicht Beobachtung.",
    prepares: ["Wandlung", "Reinigung", "Hingabe"],
    keywords: ["Sichtbarkeit", "Wandlung", "Reinigung", "Hingabe"],
  },
  {
    sourceRoom: "feuer",
    targetRoom: "wueste",
    title: "Nach der Glut bleibt die Weite",
    shortMeaning: "Nicht alles wird sofort erfuellt.",
    prepares: ["Pruefung", "Leere", "Hoeren"],
    keywords: ["Glut", "Weite", "Pruefung", "Leere", "Hoeren"],
  },
  {
    sourceRoom: "wueste",
    targetRoom: "brot",
    title: "Im Mangel erscheint die Gabe",
    shortMeaning: "Was traegt, entsteht oft erst in der Beduerftigkeit.",
    prepares: ["Vertrauen", "Versorgung", "Empfang"],
    keywords: ["Mangel", "Gabe", "Vertrauen", "Versorgung", "Empfang"],
  },
  {
    sourceRoom: "brot",
    targetRoom: "wasser",
    title: "Die Gabe erinnert an ihren Ursprung",
    shortMeaning: "Jede Speise verweist auf eine tiefere Quelle.",
    prepares: ["Leben", "Ursprung", "Tiefe"],
    keywords: ["Gabe", "Ursprung", "Quelle", "Leben", "Tiefe"],
  },
] as const satisfies RoomTransition[];

export type RoomTransitionId = `${ConfiguredSymbolId}->${ConfiguredSymbolId}`;

export function getRoomTransition(sourceRoom: string | null | undefined) {
  if (!sourceRoom) return undefined;

  return roomTransitions.find((transition) => transition.sourceRoom === sourceRoom);
}

export function getRoomTransitionInto(targetRoom: string | null | undefined) {
  if (!targetRoom) return undefined;

  return roomTransitions.find((transition) => transition.targetRoom === targetRoom);
}

export function getRoomTransitionId(transition: RoomTransition): RoomTransitionId {
  return `${transition.sourceRoom}->${transition.targetRoom}`;
}

export function getRoomTransitionLabels(transition: RoomTransition) {
  return {
    source: getSymbolPathConfig(transition.sourceRoom)?.label ?? transition.sourceRoom,
    target: getSymbolPathConfig(transition.targetRoom)?.label ?? transition.targetRoom,
  };
}

export function getRoomTransitionHref(transition: RoomTransition) {
  return buildSymbolRoomHref(transition.targetRoom, {
    from: "journey",
    path: getRoomTransitionId(transition),
    symbol: transition.targetRoom,
  });
}
