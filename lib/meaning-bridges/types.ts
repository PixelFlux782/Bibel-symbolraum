import type { MeaningNodeId } from "@/types/meaningGraph";

/**
 * A MeaningBridge represents a semantic connection between two symbols,
 * concepts, or biblical references. It's not just a link, but a
 * structured knowledge object that describes the relationship itself.
 *
 * The bridge has its own identity, meaning fields, and theological context.
 */
export type MeaningBridgeId =
  | "bridge-chaos-licht"
  | "bridge-wasser-licht"
  | "bridge-wueste-feuer"
  | "bridge-feuer-licht";

export type BridgeSourceId =
  | "genesis-1-2"
  | "majim"
  | "midbar"
  | "esch";

export type BridgeTargetId =
  | "genesis-1-3"
  | "or"
  | "esch";

export interface HebrewConnection {
  hebrewWordId?: string;
  hebrew?: string;
  transliteration?: string;
  meaning?: string;
}

export interface MeaningBridge {
  /** Unique identifier for this bridge */
  id: MeaningBridgeId;

  /** The source symbol, concept, or scripture reference */
  sourceId: BridgeSourceId;

  /** The target symbol, concept, or scripture reference */
  targetId: BridgeTargetId;

  /** Human-readable title of the bridge */
  title: string;

  /** Concise summary describing the bridge relationship */
  summary: string;

  /** Array of meaning node IDs that characterize this bridge */
  meaningFields: MeaningNodeId[];

  /** Bible references anchoring this bridge (optional) */
  scriptureAnchors?: string[];

  /** Related journeys that traverse or reference this bridge (optional) */
  journeyIds?: string[];

  /** Tags for categorization and discovery */
  tags?: string[];

  /** Optional Hebrew language connections */
  hebrewConnections?: HebrewConnection[];
}

/**
 * Bridge registry structure for efficient lookup
 */
export interface BridgeRegistry {
  bridges: MeaningBridge[];
  byId: Map<MeaningBridgeId, MeaningBridge>;
  bySource: Map<string, MeaningBridge[]>;
  byTarget: Map<string, MeaningBridge[]>;
}
