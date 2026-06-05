/**
 * Meaning Bridges System
 *
 * Provides a structured way to represent and manage semantic connections
 * between symbols, concepts, and biblical references.
 *
 * The bridge is not just a link, but a first-class citizen in the
 * meaning graph, with its own identity, meaning fields, and context.
 */

export type { MeaningBridge, MeaningBridgeId, HebrewConnection } from "./types";

export {
  getAllBridges,
  getBridgesFromSource,
  getBridgesFromTarget,
  getConnectedBridges,
  countBridges,
  getRegistry,
} from "./bridgeRegistry";

export {
  getMeaningBridge,
  getBridgeBySourceAndTarget,
  hasBridge,
  getBridgesByMeaningField,
  getBridgesByTag,
} from "./getMeaningBridge";

export {
  validateMeaningBridges,
  logValidationResults,
  type ValidationResult,
  type ValidationError,
  type ValidationWarning,
} from "./validateMeaningBridges";
