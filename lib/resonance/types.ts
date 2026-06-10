export type ResonanceType =
  | "meaning"
  | "story"
  | "hebrew"
  | "gematria"
  | "shared_letter"
  | "polarity"
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
