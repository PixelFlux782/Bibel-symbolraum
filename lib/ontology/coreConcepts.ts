export const CORE_CONCEPT_IDS = [
  "ursprung",
  "offenbarung",
  "ordnung",
  "erkenntnis",
  "leben",
  "himmel",
] as const;

export type CoreConceptId = (typeof CORE_CONCEPT_IDS)[number];

export function isCoreConceptId(id: string): id is CoreConceptId {
  return CORE_CONCEPT_IDS.includes(id as CoreConceptId);
}
