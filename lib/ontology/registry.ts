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
    id: "ontology-brunnen-belongs-to-wasser",
    sourceId: "brunnen",
    targetId: "wasser",
    type: "belongs_to",
    title: "Brunnen gehoert zu Wasser",
    shortResonance: "Die Tiefe des Brunnens ist ein Wasserraum.",
    explanation: "Der Brunnen bleibt im Semantic Zoom unter Wasser sichtbar, bekommt aber im Ontologie-Layer eigene Bedeutungsbeziehungen.",
    strength: 1,
  },
  {
    id: "ontology-brunnen-resonates-with-begegnung",
    sourceId: "brunnen",
    targetId: "begegnung",
    type: "resonates_with",
    title: "Brunnen und Begegnung",
    shortResonance: "Am Brunnen wird Tiefe zum Ort der Begegnung.",
    explanation: "Begegnung ist hier ein externer Bedeutungsanker, bis ein eigener Ontologie-Knoten angelegt wird.",
    strength: 0.75,
  },
  {
    id: "ontology-brunnen-resonates-with-tiefe",
    sourceId: "brunnen",
    targetId: "tiefe",
    type: "resonates_with",
    title: "Brunnen und Tiefe",
    shortResonance: "Der Brunnen macht verborgene Tiefe erreichbar.",
    explanation: "Tiefe bleibt vorerst ein externer Bedeutungsanker aus dem Codex-Kontext.",
    strength: 0.9,
  },
  {
    id: "ontology-manna-belongs-to-brot",
    sourceId: "manna",
    targetId: "brot",
    type: "belongs_to",
    title: "Manna gehoert zu Brot",
    shortResonance: "Manna ist Brot als Gabe im Mangel.",
    explanation: "Der primaere Anzeige-Kontext von Manna bleibt Brot, die Ontologie kann zugleich Wuesten- und Versorgungsspuren halten.",
    strength: 1,
  },
  {
    id: "ontology-manna-resonates-with-wueste",
    sourceId: "manna",
    targetId: "wueste",
    type: "resonates_with",
    title: "Manna und Wueste",
    shortResonance: "Im Mangel wird Versorgung als Gabe sichtbar.",
    explanation: "Manna resoniert mit Wueste, obwohl der primaere Hierarchie-Kontext Brot ist.",
    strength: 0.95,
  },
  {
    id: "ontology-manna-emerges-from-tau",
    sourceId: "manna",
    targetId: "tau",
    type: "emerges_from",
    title: "Manna aus dem Tau",
    shortResonance: "Die Gabe erscheint auf der Schwelle des Taus.",
    explanation: "Tau wird als interner Ontologie-Knoten gefuehrt, weil er bereits als Unterraum von Wasser existiert.",
    strength: 0.85,
  },
  {
    id: "ontology-manna-nourishes-brot",
    sourceId: "manna",
    targetId: "brot",
    type: "nourishes",
    title: "Manna naehrt Brot",
    shortResonance: "Manna verdichtet Brot zur taeglichen Versorgung.",
    explanation: "Die Relation beschreibt keine Taxonomie, sondern eine Bedeutungsrolle von Manna innerhalb des Brot-Feldes.",
    strength: 0.8,
  },
  {
    id: "ontology-manna-appears-in-exodus-16",
    sourceId: "manna",
    targetId: "exodus-16",
    type: "appears_in_story",
    title: "Manna in Exodus 16",
    shortResonance: "Exodus 16 verankert Manna als Gabe in der Wueste.",
    explanation: "Exodus 16 bleibt vorerst ein externer String-Target, solange kein CodexEntry existiert.",
    scriptureAnchors: ["exodus-16"],
  },
  {
    id: "ontology-dornbusch-belongs-to-feuer",
    sourceId: "dornbusch",
    targetId: "feuer",
    type: "belongs_to",
    title: "Dornbusch gehoert zu Feuer",
    shortResonance: "Der Dornbusch ist Feuer als rufende Gegenwart.",
    explanation: "Der Anzeige-Kontext Feuer bleibt erhalten, waehrend der Ontologie-Layer Stimme und Offenbarung mitfuehrt.",
    strength: 1,
  },
  {
    id: "ontology-dornbusch-reveals-stimme",
    sourceId: "dornbusch",
    targetId: "stimme",
    type: "reveals",
    title: "Dornbusch offenbart Stimme",
    shortResonance: "Im Feuer wird die Stimme hoerbar.",
    explanation: "Stimme existiert bereits als Unterraum der Wueste und kann vom Dornbusch aus semantisch erreicht werden.",
    strength: 0.9,
  },
  {
    id: "ontology-dornbusch-appears-in-exodus-3-2",
    sourceId: "dornbusch",
    targetId: "exodus-3-2",
    type: "appears_in_story",
    title: "Dornbusch in Exodus 3:2",
    shortResonance: "Der brennende Dornbusch verankert Feuer als nicht verzehrende Gegenwart.",
    explanation: "Exodus 3:2 ist als Versanker vorhanden, aber hier bewusst als Ziel-ID der Story-Relation modelliert.",
    scriptureAnchors: ["exodus-3-2"],
    strength: 1,
  },
  {
    id: "ontology-weg-belongs-to-wueste",
    sourceId: "weg",
    targetId: "wueste",
    type: "belongs_to",
    title: "Weg gehoert zu Wueste",
    shortResonance: "Der Weg fuehrt durch den Raum der Reduktion.",
    explanation: "Der Weg bleibt im Anzeige-Modell unter Wueste, kann aber mit Erzaehlung, Pruefung und Licht resonieren.",
    strength: 1,
  },
  {
    id: "ontology-weg-resonates-with-erzaehlung",
    sourceId: "weg",
    targetId: "erzaehlung",
    type: "resonates_with",
    title: "Weg und Erzaehlung",
    shortResonance: "Ein Weg wird lesbar, wenn er erzaehlt wird.",
    explanation: "Erzaehlung bleibt vorerst ein externer Bedeutungsanker.",
    strength: 0.7,
  },
  {
    id: "ontology-weg-tests-pruefung",
    sourceId: "weg",
    targetId: "pruefung",
    type: "tests",
    title: "Weg prueft",
    shortResonance: "Der Weg macht sichtbar, was im Inneren traegt.",
    explanation: "Pruefung ist ein vorhandener Unterraum der Wueste und wird als interner Ontologie-Knoten referenziert.",
    strength: 0.85,
  },
];

let registry: OntologyRegistry | null = null;

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
