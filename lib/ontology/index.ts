export type {
  OntologyEntity,
  OntologyEntityType,
  OntologyNeighbor,
  OntologyRegistry,
  OntologyRelation,
  OntologyRelationType,
  OntologyValidationResult,
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
