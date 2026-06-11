export type ResonanceType =
  | "meaning"
  | "story"
  | "hebrew"
  | "number"
  | "gematria"
  | "shared_letter"
  | "polarity"
  | "pattern"
  | "threshold"
  | "expression"
  | "revelation"
  | "journey";

export interface ResonanceConnection {
  id: string;
  sourceId: string;
  targetId: string;
  resonanceType: ResonanceType;
  title: string;
  shortResonance: string;
  explanation: string;
  strength: number;
  scriptureAnchors: string[];
  hebrewAnchors: string[];
  sourceRelationId?: string;
  derivedFromOntology?: boolean;
}

export interface ResonanceJourney {
  id: string;
  title: string;
  summary: string;
  nodePath: string[];
  connectionIds: string[];
  scriptureAnchors: string[];
}

export interface ResonanceRegistry {
  connections: ResonanceConnection[];
  byId: Map<string, ResonanceConnection>;
  bySource: Map<string, ResonanceConnection[]>;
  byTarget: Map<string, ResonanceConnection[]>;
}
