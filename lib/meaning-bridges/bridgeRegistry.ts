import { meaningBridgesData } from "./data";
import type { BridgeRegistry, MeaningBridge, MeaningBridgeId } from "./types";

let _registry: BridgeRegistry | null = null;

/**
 * Initialize the bridge registry from the data set.
 * Creates efficient lookup maps for fast access.
 */
function initRegistry(): BridgeRegistry {
  const bridges = meaningBridgesData;
  const byId = new Map<MeaningBridgeId, MeaningBridge>();
  const bySource = new Map<string, MeaningBridge[]>();
  const byTarget = new Map<string, MeaningBridge[]>();

  bridges.forEach((bridge) => {
    byId.set(bridge.id, bridge);

    // Index by source
    if (!bySource.has(bridge.sourceId)) {
      bySource.set(bridge.sourceId, []);
    }
    bySource.get(bridge.sourceId)!.push(bridge);

    // Index by target
    if (!byTarget.has(bridge.targetId)) {
      byTarget.set(bridge.targetId, []);
    }
    byTarget.get(bridge.targetId)!.push(bridge);
  });

  return {
    bridges,
    byId,
    bySource,
    byTarget,
  };
}

/**
 * Get the initialized registry (lazy initialization)
 */
export function getRegistry(): BridgeRegistry {
  if (!_registry) {
    _registry = initRegistry();
  }
  return _registry;
}

/**
 * Get all meaning bridges
 */
export function getAllBridges(): MeaningBridge[] {
  return getRegistry().bridges;
}

/**
 * Get bridges originating from a source
 */
export function getBridgesFromSource(sourceId: string): MeaningBridge[] {
  return getRegistry().bySource.get(sourceId) || [];
}

/**
 * Get bridges leading to a target
 */
export function getBridgesFromTarget(targetId: string): MeaningBridge[] {
  return getRegistry().byTarget.get(targetId) || [];
}

/**
 * Get all bridges connected to a node (either source or target)
 */
export function getConnectedBridges(nodeId: string): MeaningBridge[] {
  const registry = getRegistry();
  const fromSource = registry.bySource.get(nodeId) || [];
  const fromTarget = registry.byTarget.get(nodeId) || [];
  return [...fromSource, ...fromTarget];
}

/**
 * Count all bridges
 */
export function countBridges(): number {
  return getRegistry().bridges.length;
}
