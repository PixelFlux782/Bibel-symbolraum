import { getRegistry } from "./bridgeRegistry";
import type { MeaningBridge, MeaningBridgeId } from "./types";

/**
 * Get a specific meaning bridge by ID
 *
 * @param bridgeId - The ID of the bridge to retrieve
 * @returns The MeaningBridge object, or undefined if not found
 */
export function getMeaningBridge(
  bridgeId: MeaningBridgeId
): MeaningBridge | undefined {
  return getRegistry().byId.get(bridgeId);
}

/**
 * Get bridge by source and target
 * Useful for finding the bridge relationship between two nodes
 *
 * @param sourceId - The source node ID
 * @param targetId - The target node ID
 * @returns The bridge connecting source to target, or undefined if no direct bridge exists
 */
export function getBridgeBySourceAndTarget(
  sourceId: string,
  targetId: string
): MeaningBridge | undefined {
  const fromSource = getRegistry().bySource.get(sourceId) || [];
  return fromSource.find((bridge) => bridge.targetId === targetId);
}

/**
 * Check if a bridge exists between two nodes
 */
export function hasBridge(sourceId: string, targetId: string): boolean {
  return getBridgeBySourceAndTarget(sourceId, targetId) !== undefined;
}

/**
 * Get all bridges that include a specific meaning field
 */
export function getBridgesByMeaningField(meaningFieldId: string): MeaningBridge[] {
  return getRegistry().bridges.filter((bridge) =>
    bridge.meaningFields.includes(meaningFieldId as any)
  );
}

/**
 * Get all bridges with a specific tag
 */
export function getBridgesByTag(tag: string): MeaningBridge[] {
  return getRegistry().bridges.filter(
    (bridge) => bridge.tags && bridge.tags.includes(tag)
  );
}
