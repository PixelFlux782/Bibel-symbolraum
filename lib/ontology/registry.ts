import type {
  OntologyEntity,
  OntologyNeighbor,
  OntologyRegistry,
  OntologyRelation,
  OntologyRelationType,
} from "./types";

export const ontologyEntities: OntologyEntity[] = [
  {
    id: "brunnen",
    type: "symbol",
    title: "Brunnen",
    primaryHierarchyId: "brunnen",
    tags: ["wasser", "unterraum", "tiefe", "begegnung"],
    summary: "Brunnen bindet Wasser an verborgene Tiefe, Schoepfen und Begegnung.",
  },
  {
    id: "manna",
    type: "symbol",
    title: "Manna",
    primaryHierarchyId: "manna",
    tags: ["brot", "wueste", "gabe", "versorgung"],
    summary: "Manna liest Brot als taegliche Gabe im Raum der Wueste.",
  },
  {
    id: "dornbusch",
    type: "symbol",
    title: "Dornbusch",
    primaryHierarchyId: "dornbusch",
    tags: ["feuer", "wueste", "ruf", "offenbarung"],
    summary: "Dornbusch verbindet Feuer, Stimme und Gegenwart ohne Verzehrung.",
  },
  {
    id: "weg",
    type: "symbol",
    title: "Weg",
    primaryHierarchyId: "weg",
    tags: ["wueste", "bewegung", "pruefung", "erzaehlung"],
    summary: "Weg macht Bewegung durch das Unbekannte als Pruefung und Erzaehlung sichtbar.",
  },
  {
    id: "wasser",
    type: "archetype",
    title: "Wasser",
    primaryHierarchyId: "wasser",
    tags: ["archetyp", "tiefe", "leben", "reinigung"],
    summary: "Wasser traegt Tiefe, Leben, Reinigung, Grenze und Uebergang.",
  },
  {
    id: "wueste",
    type: "archetype",
    title: "Wueste",
    primaryHierarchyId: "wueste",
    tags: ["archetyp", "mangel", "pruefung", "hoeren"],
    summary: "Wueste ist der Bedeutungsraum von Reduktion, Mangel, Stille und Pruefung.",
  },
  {
    id: "brot",
    type: "archetype",
    title: "Brot",
    primaryHierarchyId: "brot",
    tags: ["archetyp", "nahrung", "gabe", "gemeinschaft"],
    summary: "Brot deutet Nahrung, Gabe, Alltag, Teilung und Gemeinschaft.",
  },
  {
    id: "feuer",
    type: "archetype",
    title: "Feuer",
    primaryHierarchyId: "feuer",
    tags: ["archetyp", "gegenwart", "ruf", "wandlung"],
    summary: "Feuer sammelt Gegenwart, Ruf, Fuehrung, Laeuterung und Verwandlung.",
  },
  {
    id: "licht",
    type: "archetype",
    title: "Licht",
    primaryHierarchyId: "licht",
    tags: ["archetyp", "offenbarung", "orientierung", "klarheit"],
    summary: "Licht macht Klarheit, Offenbarung, Orientierung und Schoepfungsanfang lesbar.",
  },
  {
    id: "tau",
    type: "symbol",
    title: "Tau",
    primaryHierarchyId: "tau",
    tags: ["wasser", "himmel", "manna", "gabe"],
    summary: "Tau ist Wasser des Himmels und Schwelle, aus der Manna sichtbar wird.",
  },
  {
    id: "stimme",
    type: "symbol",
    title: "Stimme",
    primaryHierarchyId: "stimme",
    tags: ["wueste", "wort", "ruf", "offenbarung"],
    summary: "Stimme macht das Wort im stillen Raum hoerbar.",
  },
  {
    id: "pruefung",
    type: "symbol",
    title: "Pruefung",
    primaryHierarchyId: "pruefung",
    tags: ["wueste", "weg", "mensch", "innenraum"],
    summary: "Pruefung ist der Weg, auf dem das Innere sichtbar wird.",
  },
];

export const ontologyRelations: OntologyRelation[] = [
  {
    id: "ontology-brunnen-is-expression-of-wasser",
    sourceId: "brunnen",
    targetId: "wasser",
    type: "is_expression_of",
    title: "Brunnen ist Ausdruck von Wasser",
    shortResonance: "Die Tiefe des Brunnens ist ein Wasserraum.",
    explanation: "Im Brunnen sammelt sich Wasser als verborgene Tiefe.",
    strength: 1,
  },
  {
    id: "ontology-brunnen-is-threshold-to-begegnung",
    sourceId: "brunnen",
    targetId: "begegnung",
    type: "is_threshold_to",
    title: "Brunnen ist Schwelle zur Begegnung",
    shortResonance: "Am Brunnen wird Tiefe zum Ort der Begegnung.",
    explanation: "Wo Wasser geschoepft wird, koennen Wege einander begegnen.",
    strength: 0.75,
  },
  {
    id: "ontology-brunnen-opens-into-tiefe",
    sourceId: "brunnen",
    targetId: "tiefe",
    type: "opens_into",
    title: "Brunnen oeffnet in die Tiefe",
    shortResonance: "Der Brunnen macht verborgene Tiefe erreichbar.",
    explanation: "Der Brunnen fuehrt unter die Oberflaeche.",
    strength: 0.9,
  },
  {
    id: "ontology-manna-is-expression-of-brot",
    sourceId: "manna",
    targetId: "brot",
    type: "is_expression_of",
    title: "Manna ist Ausdruck von Brot",
    shortResonance: "Manna ist Brot als Gabe im Mangel.",
    explanation: "Manna zeigt Brot als taegliche Gabe auf dem Weg.",
    strength: 1,
  },
  {
    id: "ontology-manna-is-threshold-to-wueste",
    sourceId: "manna",
    targetId: "wueste",
    type: "is_threshold_to",
    title: "Manna ist Schwelle zur Wueste",
    shortResonance: "Im Mangel wird Versorgung als Gabe sichtbar.",
    explanation: "Die Wueste macht Manna als unerwartete Versorgung lesbar.",
    strength: 0.95,
  },
  {
    id: "ontology-manna-emerges-from-tau",
    sourceId: "manna",
    targetId: "tau",
    type: "emerges_from",
    title: "Manna aus dem Tau",
    shortResonance: "Die Gabe erscheint auf der Schwelle des Taus.",
    explanation: "Aus der feinen Feuchte des Morgens tritt die Gabe hervor.",
    strength: 0.85,
  },
  {
    id: "ontology-manna-appears-in-exodus-16",
    sourceId: "manna",
    targetId: "exodus-16",
    type: "appears_in_story",
    title: "Manna in Exodus 16",
    shortResonance: "Exodus 16 verankert Manna als Gabe in der Wueste.",
    explanation: "Die Erzaehlung der Wueste gibt Manna seinen Ort.",
    scriptureAnchors: ["exodus-16"],
  },
  {
    id: "ontology-dornbusch-is-expression-of-feuer",
    sourceId: "dornbusch",
    targetId: "feuer",
    type: "is_expression_of",
    title: "Dornbusch ist Ausdruck von Feuer",
    shortResonance: "Der Dornbusch ist Feuer als rufende Gegenwart.",
    explanation: "Im Dornbusch brennt Feuer als Gegenwart, die ruft.",
    strength: 1,
  },
  {
    id: "ontology-dornbusch-reveals-stimme",
    sourceId: "dornbusch",
    targetId: "stimme",
    type: "reveals",
    title: "Dornbusch offenbart Stimme",
    shortResonance: "Im Feuer wird die Stimme hoerbar.",
    explanation: "Im Feuer wird die Stimme hoerbar.",
    strength: 0.9,
  },
  {
    id: "ontology-dornbusch-appears-in-exodus-3-2",
    sourceId: "dornbusch",
    targetId: "exodus-3-2",
    type: "appears_in_story",
    title: "Dornbusch in Exodus 3:2",
    shortResonance: "Der brennende Dornbusch verankert Feuer als nicht verzehrende Gegenwart.",
    explanation: "Exodus 3:2 zeigt Feuer als Gegenwart, die brennt und nicht verzehrt.",
    scriptureAnchors: ["exodus-3-2"],
    strength: 1,
  },
  {
    id: "ontology-dornbusch-has-polarity-feuer",
    sourceId: "dornbusch",
    targetId: "feuer",
    type: "has_polarity",
    title: "Dornbusch traegt die Spannung des Feuers",
    shortResonance: "Feuer ist Gegenwart und kann doch verzehren.",
    explanation: "Im Dornbusch erscheint Feuer als Gegenwart, die brennt, aber nicht verzehrt.",
    strength: 0.85,
  },
  {
    id: "ontology-weg-is-threshold-to-wueste",
    sourceId: "weg",
    targetId: "wueste",
    type: "is_threshold_to",
    title: "Weg ist Schwelle zur Wueste",
    shortResonance: "Der Weg fuehrt durch den Raum der Reduktion.",
    explanation: "In der Wueste wird der Weg zur Pruefung und Erzaehlung.",
    strength: 1,
  },
  {
    id: "ontology-weg-contains-pattern-pruefung",
    sourceId: "weg",
    targetId: "pruefung",
    type: "contains_pattern",
    title: "Weg enthaelt das Muster der Pruefung",
    shortResonance: "Der Weg enthaelt Pruefung als wiederkehrendes Muster.",
    explanation: "Auf dem Weg wird Pruefung nicht Ziel, sondern Erfahrungsform.",
    strength: 0.8,
  },
  {
    id: "ontology-weg-passes-through-pruefung",
    sourceId: "weg",
    targetId: "pruefung",
    type: "passes_through",
    title: "Weg fuehrt durch Pruefung",
    shortResonance: "Der Weg macht sichtbar, was im Inneren traegt.",
    explanation: "Auf dem Weg zeigt sich, was im Inneren traegt.",
    strength: 0.85,
  },
];

let registry: OntologyRegistry | null = null;

const technicalOntologyTextPatterns = [
  /existiert bereits/i,
  /als Unterraum/i,
  /semantisch erreicht/i,
  /\btarget\b/i,
  /Ontology/i,
  /CodexEntry/i,
  /\bID\b/,
  /Fallback/i,
  /extern/i,
  /interner/i,
  /modelliert/i,
  /TODO/i,
  /Semantic Zoom/i,
];

function normalizeOntologyText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeOntologyTextForComparison(value: string) {
  return normalizeOntologyText(value)
    .toLocaleLowerCase("de")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim();
}

function isUserFacingOntologyText(value: string) {
  const text = normalizeOntologyText(value);

  return text.length > 0 && !technicalOntologyTextPatterns.some((pattern) => pattern.test(text));
}

function areOntologyTextsNearDuplicate(left: string, right: string) {
  const normalizedLeft = normalizeOntologyTextForComparison(left);
  const normalizedRight = normalizeOntologyTextForComparison(right);

  if (!normalizedLeft || !normalizedRight) return false;
  if (normalizedLeft === normalizedRight) return true;
  if (normalizedLeft.includes(normalizedRight) || normalizedRight.includes(normalizedLeft)) return true;

  const leftWords = new Set(normalizedLeft.split(/\s+/));
  const rightWords = new Set(normalizedRight.split(/\s+/));
  const sharedWords = Array.from(leftWords).filter((word) => rightWords.has(word)).length;
  const unionSize = new Set([...leftWords, ...rightWords]).size;

  return unionSize > 0 && sharedWords / unionSize >= 0.82;
}

export function getOntologyDisplayText(relation: OntologyRelation): string {
  const shortResonance = normalizeOntologyText(relation.shortResonance);
  const explanation = normalizeOntologyText(relation.explanation);
  const hasShortResonance = isUserFacingOntologyText(shortResonance);
  const hasExplanation = isUserFacingOntologyText(explanation);

  if (hasShortResonance) {
    return shortResonance;
  }

  if (hasExplanation && !areOntologyTextsNearDuplicate(shortResonance, explanation)) {
    return explanation;
  }

  return "";
}

function createRegistry(): OntologyRegistry {
  const byId = new Map<string, OntologyEntity>();
  const relationsBySource = new Map<string, OntologyRelation[]>();
  const relationsByTarget = new Map<string, OntologyRelation[]>();
  const relationsByType = new Map<OntologyRelationType, OntologyRelation[]>();
  const entitiesByTag = new Map<string, OntologyEntity[]>();

  ontologyEntities.forEach((entity) => {
    byId.set(entity.id, entity);

    entity.tags.forEach((tag) => {
      const taggedEntities = entitiesByTag.get(tag) ?? [];
      taggedEntities.push(entity);
      entitiesByTag.set(tag, taggedEntities);
    });
  });

  ontologyRelations.forEach((relation) => {
    const sourceRelations = relationsBySource.get(relation.sourceId) ?? [];
    sourceRelations.push(relation);
    relationsBySource.set(relation.sourceId, sourceRelations);

    const targetRelations = relationsByTarget.get(relation.targetId) ?? [];
    targetRelations.push(relation);
    relationsByTarget.set(relation.targetId, targetRelations);

    const typeRelations = relationsByType.get(relation.type) ?? [];
    typeRelations.push(relation);
    relationsByType.set(relation.type, typeRelations);
  });

  return {
    entities: ontologyEntities,
    relations: ontologyRelations,
    byId,
    relationsBySource,
    relationsByTarget,
    relationsByType,
    entitiesByTag,
  };
}

export function getOntologyRegistry(): OntologyRegistry {
  registry ??= createRegistry();
  return registry;
}

export function getOntologyEntity(id: string): OntologyEntity | undefined {
  return getOntologyRegistry().byId.get(id);
}

export function getOntologyRelationsForEntity(id: string): OntologyRelation[] {
  const registry = getOntologyRegistry();

  return [
    ...(registry.relationsBySource.get(id) ?? []),
    ...(registry.relationsByTarget.get(id) ?? []),
  ];
}

export function getOntologyRelationsByType(type: OntologyRelationType): OntologyRelation[] {
  return getOntologyRegistry().relationsByType.get(type) ?? [];
}

export function getOntologyNeighbors(id: string): OntologyNeighbor[] {
  const registry = getOntologyRegistry();
  const sourceNeighbors = (registry.relationsBySource.get(id) ?? [])
    .flatMap((relation): OntologyNeighbor[] => {
      const entity = registry.byId.get(relation.targetId);

      return entity ? [{ entity, relation, direction: "target" }] : [];
    });
  const targetNeighbors = (registry.relationsByTarget.get(id) ?? [])
    .flatMap((relation): OntologyNeighbor[] => {
      const entity = registry.byId.get(relation.sourceId);

      return entity ? [{ entity, relation, direction: "source" }] : [];
    });

  return [...sourceNeighbors, ...targetNeighbors];
}

export function getOntologyEntitiesByTag(tag: string): OntologyEntity[] {
  return getOntologyRegistry().entitiesByTag.get(tag) ?? [];
}
