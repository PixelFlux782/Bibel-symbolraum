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

export type OntologyEntityDomain =
  | "element"
  | "place"
  | "action"
  | "ritual"
  | "body"
  | "divine"
  | "time"
  | "number"
  | "letter"
  | "word"
  | "story"
  | "concept"
  | "pattern"
  | "threshold"
  | "unknown";

export const ONTOLOGY_ENTITY_DOMAINS = [
  "element",
  "place",
  "action",
  "ritual",
  "body",
  "divine",
  "time",
  "number",
  "letter",
  "word",
  "story",
  "concept",
  "pattern",
  "threshold",
  "unknown",
] as const satisfies readonly OntologyEntityDomain[];

export type OntologyFirstMention = {
  ref: string;
  role: string;
};

export type OntologyPolarity = {
  axis: string;
  upperPole?: string;
  lowerPole?: string;
  leftPole?: string;
  rightPole?: string;
  visiblePole?: string;
  hiddenPole?: string;
  note?: string;
};

export type OntologyVisibleHidden = {
  visible: string;
  hidden: string;
};

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
  | "appears_in_story"
  | "is_expression_of"
  | "is_threshold_to"
  | "opens_into"
  | "contrasts_with"
  | "contains_pattern"
  | "fulfills_pattern_of"
  | "has_polarity"
  | "structures_journey"
  | "passes_through";

export const ONTOLOGY_RELATION_TYPES = [
  "belongs_to",
  "resonates_with",
  "emerges_from",
  "transforms_into",
  "opposes",
  "fulfills",
  "reveals",
  "nourishes",
  "tests",
  "shares_letter",
  "shares_number",
  "appears_in_story",
  "is_expression_of",
  "is_threshold_to",
  "opens_into",
  "contrasts_with",
  "contains_pattern",
  "fulfills_pattern_of",
  "has_polarity",
  "structures_journey",
  "passes_through",
] as const satisfies readonly OntologyRelationType[];

export interface OntologyEntity {
  id: string;
  type: OntologyEntityType;
  title: string;
  primaryHierarchyId?: string;
  tags: string[];
  summary: string;
  hebrew?: string;
  transliteration?: string;
  gematria?: number;
  rootId?: string;
  aliases?: string[];
  archetypalRole?: string;
  firstMention?: OntologyFirstMention;
  domain?: OntologyEntityDomain;
  imageSymbol?: string;
  movementSteps?: string[];
  leadsTo?: string[];
  visibleHidden?: OntologyVisibleHidden;
  /**
   * Inner polarity of this entity itself. Use has_polarity only when the polarity
   * is modeled as a separate concept/pattern entity.
   */
  polarity?: OntologyPolarity;
  clusterId?: string;
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
