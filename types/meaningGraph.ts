export type MeaningNodeId =
  | "depth"
  | "chaos"
  | "birth"
  | "transition"
  | "purification"
  | "life"
  | "hiddenness";

export interface MeaningNode {
  id: MeaningNodeId;
  label: string;
  description: string;
}

export interface MeaningRelation {
  id: string;
  fromNodeId: MeaningNodeId;
  toNodeId: MeaningNodeId;
  description: string;
}

export interface MeaningField {
  id: string;
  label: string;
  description: string;
  nodeIds: MeaningNodeId[];
  relationIds?: string[];
}

export interface SymbolMeaningLink {
  id: string;
  symbolId: string;
  label: string;
  aliases?: string[];
  nodeIds: MeaningNodeId[];
  relationIds?: string[];
}

export interface HebrewMeaningLink {
  id: string;
  hebrewWordId: string;
  hebrew: string;
  transliteration: string;
  nodeIds: MeaningNodeId[];
  relationIds?: string[];
}

export interface BiblicalReference {
  id: string;
  reference: string;
  label: string;
  aliases?: string[];
}

export interface BiblicalMeaningLink {
  id: string;
  biblicalReferenceId: string;
  label: string;
  aliases?: string[];
  nodeIds: MeaningNodeId[];
  relationIds?: string[];
}

export interface MeaningProfileOrigin {
  hebrew: HebrewMeaningLink[];
  symbols: SymbolMeaningLink[];
  biblical: BiblicalMeaningLink[];
}

export interface MeaningProfile {
  nodes: MeaningNode[];
  relations: MeaningRelation[];
  origin: MeaningProfileOrigin;
}
