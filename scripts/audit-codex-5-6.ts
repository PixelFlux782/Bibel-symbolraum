import { codexRegistry } from "../lib/codex/codexRegistry";
import { meaningNodes } from "../lib/meaning/meaningNodes";
import { ontologyEntities } from "../lib/ontology";
import { knownSymbolPathLabels, symbolPathConfigs } from "../lib/symbols/symbolPathConfig";
import { SYMBOL_NETWORK } from "../lib/symbols";

const linked = new Set<string>();
for (const config of Object.values(symbolPathConfigs)) {
  linked.add(config.symbolId);
  for (const gate of config.codexGates?.meaningFields ?? []) linked.add(gate.id);
  for (const gate of config.codexGates?.scriptureAnchors ?? []) linked.add(gate.id);
  for (const id of config.codexAnchorBridge?.anchorIds ?? []) linked.add(id);
}
for (const id of Object.keys(knownSymbolPathLabels)) linked.add(id);
for (const symbol of SYMBOL_NETWORK) {
  linked.add(symbol.id);
  for (const id of symbol.relatedSymbols) linked.add(id);
  for (const relation of symbol.relations ?? []) linked.add(relation.targetId);
}

const registryIds = new Set(codexRegistry.map((entry) => entry.id));
const fallbackIds = new Set([
  ...meaningNodes.map((node) => node.id),
  ...ontologyEntities.map((entity) => entity.id),
  ...Object.keys(knownSymbolPathLabels),
]);
const unresolved = [...linked].filter((id) => !registryIds.has(id) && !fallbackIds.has(id)).sort();
const outsideRegistry = [...linked].filter((id) => !registryIds.has(id)).sort();
const weak = codexRegistry.filter((entry) => entry.summary.length < 180 || entry.scriptureAnchors.length === 0 || entry.relations.length < 2);

console.log(JSON.stringify({
  visibleTargets: [...linked].sort(),
  counts: { visibleTargets: linked.size, registry: registryIds.size, unresolved: unresolved.length, weak: weak.length },
  unresolved,
  outsideRegistry,
  weak: weak.map((entry) => ({ id: entry.id, summaryLength: entry.summary.length, anchors: entry.scriptureAnchors.length, relations: entry.relations.length })),
}, null, 2));
