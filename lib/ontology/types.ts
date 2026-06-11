export type OntologyEntityType =
  | "archetype"
  | "symbol"
  | "story_anchor"
  | "verse_anchor"
  | "hebrew_word"
  | "letter"
  | "number"
  | "meta"
  | "concept";

export type OntologyRelationType =
  | "belongs_to"
  | "resonates_with"
  | "emerges_from"
  | "transforms_into"
  | "opposes"
  | "fulfills"
  | "reveals"
  | "nourishes"
  | "tests"
  | "shares_letter"
  | "shares_number"
  | "appears_in_story";

export interface OntologyEntity {
  id: string;
  type: OntologyEntityType;
  title: string;
  primaryHierarchyId?: string;
  tags: string[];
  summary: string;
}

export interface OntologyRelation {
  id: string;
  sourceId: string;
  targetId: string;
  type: OntologyRelationType;
  title: string;
  shortResonance: string;
  explanation: string;
  strength?: number;
  scriptureAnchors?: string[];
  hebrewAnchors?: string[];
}

export interface OntologyRegistry {
  entities: OntologyEntity[];
  relations: OntologyRelation[];
  byId: Map<string, OntologyEntity>;
  relationsBySource: Map<string, OntologyRelation[]>;
  relationsByTarget: Map<string, OntologyRelation[]>;
  relationsByType: Map<OntologyRelationType, OntologyRelation[]>;
  entitiesByTag: Map<string, OntologyEntity[]>;
}

export interface OntologyNeighbor {
  entity: OntologyEntity;
  relation: OntologyRelation;
  direction: "source" | "target";
}

export interface OntologyValidationResult {
  errors: string[];
  warnings: string[];
  stats: {
    entities: number;
    relations: number;
    externalTargets: number;
  };
}
