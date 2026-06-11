export type {
  OntologyEntity,
  OntologyEntityDomain,
  OntologyEntityType,
  OntologyFirstMention,
  OntologyNeighbor,
  OntologyPolarity,
  OntologyRegistry,
  OntologyRelation,
  OntologyRelationType,
  OntologyValidationResult,
} from "./types";

export {
  ONTOLOGY_ENTITY_DOMAINS,
} from "./types";

export {
  getOntologyEntitiesByTag,
  getOntologyDisplayText,
  getOntologyEntity,
  getOntologyNeighbors,
  getOntologyRegistry,
  getOntologyRelationsByType,
  getOntologyRelationsForEntity,
  ontologyEntities,
  ontologyRelations,
} from "./registry";

export { validateOntology } from "./validateOntology";
