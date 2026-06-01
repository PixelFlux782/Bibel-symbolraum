import type { SymbolEngineData } from "@/types/engine";
import type { HebrewLetter, HebrewWord } from "@/types/hebrew";
import type { MeaningNode, MeaningNodeId, SymbolMeaningLink } from "@/types/meaningGraph";

import { fireEngineData } from "@/components/rooms/fire/fireEngineData";
import { lightEngineData } from "@/components/rooms/light/lightEngineData";
import { waterEngineData } from "@/components/rooms/water/waterEngineData";
import { wuesteEngineData } from "@/components/rooms/wueste/wuesteEngineData";
import { getSymbolHebrewProfile } from "@/lib/hebrew/getSymbolHebrewProfile";
import { meaningNodes } from "@/lib/meaning/meaningNodes";
import { symbolMeaningLinks } from "@/lib/meaning/meaningMappings";
import { meaningRelations } from "@/lib/meaning/meaningRelations";

const engines = [waterEngineData, lightEngineData, fireEngineData, wuesteEngineData];
const roomHrefs: Record<string, string> = {
  wasser: "/raeume/wasser",
  licht: "/raeume/licht",
  feuer: "/raeume/feuer",
  wueste: "/raeume/wueste",
};

type PathDefinition = {
  id: string;
  label: string;
  from: string;
  to: string;
  fromMeaningId: MeaningNodeId;
  toMeaningId: MeaningNodeId;
  relationId?: string;
  hebrewMeaningFieldId?: string;
  preferredReference?: string;
  fallbackEvidence?: string;
};

const pathDefinitions: PathDefinition[] = [
  {
    id: "creation",
    label: "Schöpfung",
    from: "wasser",
    to: "licht",
    fromMeaningId: "depth",
    toMeaningId: "revelation",
    relationId: "light-revelation",
    preferredReference: "Genesis 1",
  },
  {
    id: "cleansing",
    label: "Reinigung",
    from: "wasser",
    to: "feuer",
    fromMeaningId: "purification",
    toMeaningId: "transformation",
    relationId: "transformation-purification",
    fallbackEvidence: "Maleachi 3,2-3",
  },
  {
    id: "revelation",
    label: "Offenbarung",
    from: "feuer",
    to: "licht",
    fromMeaningId: "fire",
    toMeaningId: "revelation",
    hebrewMeaningFieldId: "esh-fire",
    preferredReference: "Exodus 13,21",
  },
  {
    id: "desert-water",
    label: "Mangel und Quelle",
    from: "wueste",
    to: "wasser",
    fromMeaningId: "lack",
    toMeaningId: "dependence",
    relationId: "lack-dependence",
    fallbackEvidence: "Exodus 16",
  },
  {
    id: "desert-light",
    label: "Fuehrung",
    from: "wueste",
    to: "licht",
    fromMeaningId: "desert",
    toMeaningId: "guidance",
    relationId: "desert-guidance",
    fallbackEvidence: "Exodus 13,21",
  },
  {
    id: "desert-fire",
    label: "Feuersaeule",
    from: "wueste",
    to: "feuer",
    fromMeaningId: "guidance",
    toMeaningId: "presence",
    preferredReference: "Exodus 13,21",
  },
];

export type SymbolMeaningNetworkNode = {
  id: string;
  label: string;
  hebrew: string;
  transliteration: string;
  shortMeaning: string;
  roomHref: string;
};

export type SymbolMeaningSatellite = {
  id: MeaningNodeId;
  label: string;
  shortMeaning: string;
};

export type SymbolMeaningSatelliteLink = {
  symbolId: string;
  meaningId: MeaningNodeId;
};

export type SymbolMeaningJoint = {
  letter: string;
  letterName: string;
  symbolIds: string[];
  note: string;
  meanings: string[];
};

export type SymbolMeaningPath = {
  id: string;
  label: string;
  from: string;
  to: string;
  evidence: string;
  fromMeaning: string;
  toMeaning: string;
  summary: string;
  joint?: SymbolMeaningJoint;
};

export type SymbolMeaningNetwork = {
  nodes: SymbolMeaningNetworkNode[];
  meaningNodes: SymbolMeaningSatellite[];
  meaningLinks: SymbolMeaningSatelliteLink[];
  paths: SymbolMeaningPath[];
};

function getEngine(slug: string): SymbolEngineData {
  const engine = engines.find((item) => item.slug === slug);

  if (!engine) {
    throw new Error(`Symbol Engine fuer "${slug}" fehlt.`);
  }

  return engine;
}

function getSymbolLink(slug: string): SymbolMeaningLink {
  const link = symbolMeaningLinks.find((item) => item.symbolId === slug);

  if (!link) {
    throw new Error(`Meaning-Graph-Link fuer "${slug}" fehlt.`);
  }

  return link;
}

function getMeaningNode(id: MeaningNodeId): MeaningNode {
  const node = meaningNodes.find((item) => item.id === id);

  if (!node) {
    throw new Error(`Meaning Node "${id}" fehlt.`);
  }

  return node;
}

function getReferences(word?: HebrewWord): string[] {
  return word?.biblicalReferences.map((reference) => reference.reference) ?? [];
}

function findEvidence(definition: PathDefinition): string {
  if (!definition.preferredReference) {
    return definition.fallbackEvidence ?? getMeaningNode(definition.fromMeaningId).label;
  }

  const fromReferences = getReferences(getSymbolHebrewProfile(definition.from).hebrewWord);
  const toReferences = getReferences(getSymbolHebrewProfile(definition.to).hebrewWord);
  const preferredReference = definition.preferredReference;
  const isSharedReference = fromReferences.some((reference) => reference.startsWith(preferredReference))
    && toReferences.some((reference) => reference.startsWith(preferredReference));

  return isSharedReference ? preferredReference : definition.fallbackEvidence ?? preferredReference;
}

function findSharedLetter(from: string, to: string): HebrewLetter | undefined {
  const fromLetters = getSymbolHebrewProfile(from).letters;
  const toLetterIds = new Set(getSymbolHebrewProfile(to).letters.map((letter) => letter.id));

  return fromLetters.find((letter) => toLetterIds.has(letter.id));
}

function getJointMeanings(definition: PathDefinition, letter: HebrewLetter): string[] {
  const engineLetter = getEngine(definition.from).hebrew.letters.find((item) => item.hebrewLetterId === letter.id)
    ?? getEngine(definition.to).hebrew.letters.find((item) => item.hebrewLetterId === letter.id);

  return engineLetter?.meaning.split(",").map((meaning) => meaning.trim()) ?? letter.archetypalMeanings;
}

function buildJoint(definition: PathDefinition): SymbolMeaningJoint | undefined {
  const letter = findSharedLetter(definition.from, definition.to);

  if (!letter) {
    return undefined;
  }

  return {
    letter: letter.glyph,
    letterName: letter.name,
    symbolIds: [definition.from, definition.to],
    note: `${getEngine(definition.from).hebrew.word} und ${getEngine(definition.to).hebrew.word} teilen ${letter.name}.`,
    meanings: getJointMeanings(definition, letter),
  };
}

function buildNode(link: SymbolMeaningLink): SymbolMeaningNetworkNode {
  const engine = getEngine(link.symbolId);
  const profile = getSymbolHebrewProfile(engine);
  const meaning = getMeaningNode(link.nodeIds[0]);

  return {
    id: link.symbolId,
    label: link.label,
    hebrew: profile.hebrewWord?.hebrew ?? engine.hebrew.word,
    transliteration: profile.hebrewWord?.transliteration ?? engine.hebrew.transliteration,
    shortMeaning: meaning.description,
    roomHref: roomHrefs[link.symbolId],
  };
}

function buildPath(definition: PathDefinition): SymbolMeaningPath {
  const fromMeaning = getMeaningNode(definition.fromMeaningId);
  const toMeaning = getMeaningNode(definition.toMeaningId);
  const relation = meaningRelations.find((item) => item.id === definition.relationId);
  const hebrewMeaningField = [definition.from, definition.to]
    .flatMap((slug) => getSymbolHebrewProfile(slug).meaningFields)
    .find((field) => field.id === definition.hebrewMeaningFieldId);

  return {
    id: definition.id,
    label: definition.label,
    from: definition.from,
    to: definition.to,
    evidence: findEvidence(definition),
    fromMeaning: fromMeaning.label,
    toMeaning: toMeaning.label,
    summary: hebrewMeaningField?.description ?? relation?.description ?? `${fromMeaning.description} ${toMeaning.description}`,
    joint: buildJoint(definition),
  };
}

export function buildSymbolMeaningNetwork(): SymbolMeaningNetwork {
  const links = symbolMeaningLinks.map((link) => ({
    symbolId: link.symbolId,
    meaningIds: getSymbolLink(link.symbolId).nodeIds,
  }));
  const meaningNodeIds = new Set(links.flatMap((link) => link.meaningIds));

  return {
    nodes: symbolMeaningLinks.map(buildNode),
    meaningNodes: meaningNodes
      .filter((node) => meaningNodeIds.has(node.id))
      .map((node) => ({ id: node.id, label: node.label, shortMeaning: node.description })),
    meaningLinks: links.flatMap((link) =>
      link.meaningIds.map((meaningId) => ({ symbolId: link.symbolId, meaningId })),
    ),
    paths: pathDefinitions.map(buildPath),
  };
}
