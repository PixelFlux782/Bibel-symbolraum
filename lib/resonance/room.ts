import { getResonanceConnectionsForNode } from "./registry";
import type { ResonanceConnection } from "./types";
import { symbolJourneys } from "../symbols/symbolJourneys";
import { getSymbolPathConfig } from "../symbols/symbolPathConfig";

export type ResonanceStatement = {
  type: "returns" | "prepares" | "mirrors";
  text: string;
  href?: string;
};

export type ResonanceRoom = {
  symbolId: string;
  statements: ResonanceStatement[];
};

const VISIBLE_RESONANCE_SYMBOLS = new Set(["wasser", "licht", "feuer", "wueste", "brot"]);
const CANONICAL_RESONANCE_NODE_IDS: Record<string, string> = {
  wasser: "majim",
  licht: "or",
  feuer: "esch",
  wueste: "midbar",
  brot: "lechem",
  tiefe: "tehom",
  wort: "davar",
  stimme: "qol",
};

type StatementProjection = ResonanceStatement & {
  hasEvidence: (symbolId: string) => boolean;
};

function hasConnection(sourceId: string, targetId: string) {
  const canonicalSourceId = CANONICAL_RESONANCE_NODE_IDS[sourceId] ?? sourceId;
  const canonicalTargetId = CANONICAL_RESONANCE_NODE_IDS[targetId] ?? targetId;

  return getResonanceConnectionsForNode(canonicalSourceId).some((connection) =>
    connects(connection, canonicalSourceId, canonicalTargetId),
  );
}

function connects(connection: ResonanceConnection, sourceId: string, targetId: string) {
  return (
    connection.sourceId === sourceId && connection.targetId === targetId
  ) || (
    connection.sourceId === targetId && connection.targetId === sourceId
  );
}

function hasJourneyStep(from: string, to: string) {
  return symbolJourneys.some((journey) =>
    journey.steps.some((step, index) => step.symbol === from && journey.steps[index + 1]?.symbol === to),
  );
}

function hasMeaningField(symbolId: string, fieldId: string) {
  return getSymbolPathConfig(symbolId)?.codexGates?.meaningFields?.some((field) => field.id === fieldId) ?? false;
}

function codexHref(symbolId: string) {
  return getSymbolPathConfig(symbolId)?.codexHref ?? `/codex/${symbolId}`;
}

const statementProjections: Record<string, StatementProjection[]> = {
  wasser: [
    {
      type: "prepares",
      text: "Die Tiefe bereitet das Licht vor.",
      href: codexHref("licht"),
      hasEvidence: () => hasJourneyStep("wasser", "licht") && hasMeaningField("wasser", "tiefe"),
    },
    {
      type: "returns",
      text: "Wasser kehrt im Brot als Gabe wieder.",
      href: codexHref("brot"),
      hasEvidence: () => hasConnection("wasser", "brot") && hasMeaningField("brot", "gabe"),
    },
    {
      type: "prepares",
      text: "Der Durchgang durch das Wasser öffnet die Wüste.",
      href: codexHref("wueste"),
      hasEvidence: () => hasConnection("wasser", "wueste") && hasMeaningField("wasser", "uebergang"),
    },
  ],
  licht: [
    {
      type: "prepares",
      text: "Das Licht bereitet das Feuer vor.",
      href: codexHref("feuer"),
      hasEvidence: () => hasConnection("licht", "feuer") || hasJourneyStep("licht", "feuer"),
    },
    {
      type: "returns",
      text: "Licht kehrt im Wort als Sichtbarkeit wieder.",
      href: "/codex/wort",
      hasEvidence: () => hasConnection("licht", "wort") && hasMeaningField("brot", "wort"),
    },
    {
      type: "mirrors",
      text: "Licht spiegelt sich im Wasser als sichtbare Tiefe.",
      href: codexHref("wasser"),
      hasEvidence: () => hasConnection("wasser", "licht") || hasMeaningField("wasser", "tiefe"),
    },
  ],
  feuer: [
    {
      type: "returns",
      text: "Das Feuer kehrt im Wort als Ruf wieder.",
      href: "/codex/wort",
      hasEvidence: () => hasConnection("feuer", "wort") && hasMeaningField("feuer", "ruf"),
    },
    {
      type: "mirrors",
      text: "Feuer spiegelt sich im Licht als Offenbarung.",
      href: codexHref("licht"),
      hasEvidence: () => hasConnection("licht", "feuer") && hasMeaningField("licht", "offenbarung"),
    },
    {
      type: "prepares",
      text: "Das Feuer bereitet die Wüste als Ort der Stimme vor.",
      href: codexHref("wueste"),
      hasEvidence: () => hasJourneyStep("feuer", "wueste") && hasMeaningField("wueste", "stimme"),
    },
  ],
  wueste: [
    {
      type: "prepares",
      text: "Die Leere bereitet das Brot vor.",
      href: codexHref("brot"),
      hasEvidence: () => hasConnection("wueste", "brot") && hasMeaningField("wueste", "leere"),
    },
    {
      type: "returns",
      text: "Das Feuer ruft in der Wüste.",
      href: codexHref("feuer"),
      hasEvidence: () => hasJourneyStep("feuer", "wueste") && hasMeaningField("feuer", "ruf"),
    },
    {
      type: "mirrors",
      text: "Die Prüfung macht Versorgung sichtbar.",
      href: "/codex/pattern-pruefung-durch-entzug",
      hasEvidence: () => hasMeaningField("wueste", "pruefung") && hasMeaningField("brot", "gabe"),
    },
  ],
  brot: [
    {
      type: "returns",
      text: "Brot kehrt aus der Wüste als Gabe wieder.",
      href: codexHref("wueste"),
      hasEvidence: () => hasConnection("wueste", "brot") && hasMeaningField("brot", "gabe"),
    },
    {
      type: "returns",
      text: "Wasser kehrt im Brot als Gabe wieder.",
      href: codexHref("wasser"),
      hasEvidence: () => hasConnection("wasser", "brot") && hasMeaningField("brot", "gabe"),
    },
    {
      type: "mirrors",
      text: "Das Brot spiegelt das Wort als Nahrung.",
      href: "/codex/wort",
      hasEvidence: () => hasMeaningField("brot", "wort") && hasMeaningField("brot", "nahrung"),
    },
  ],
};

export function getResonanceRoom(symbolId: string): ResonanceRoom {
  if (!VISIBLE_RESONANCE_SYMBOLS.has(symbolId)) {
    return {
      symbolId,
      statements: [],
    };
  }

  return {
    symbolId,
    statements: (statementProjections[symbolId] ?? [])
      .filter((projection) => projection.hasEvidence(symbolId))
      .slice(0, 3)
      .map(({ type, text, href }) => ({ type, text, href })),
  };
}
