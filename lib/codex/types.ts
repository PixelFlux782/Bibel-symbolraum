import type { MeaningNodeId } from "@/types/meaningGraph";

export type CodexEntryType =
  | "symbol"
  | "hebrew-word"
  | "hebrew-letter"
  | "number"
  | "scripture"
  | "meaning-field"
  | "meaning"
  | "journey";

export type CodexRelationType =
  | "symbolizes"
  | "contains-letter"
  | "has-hebrew-word"
  | "anchors-scripture"
  | "shares-meaning"
  | "continues-journey"
  | "reveals"
  | "hidden-within"
  | "nourishes-as"
  | "expresses"
  | "leads-to"
  | "heard-within"
  | "revealed-at"
  | "expressed-through"
  | "source-of"
  | "gives-rise-to"
  | "echoes-within"
  | "precedes"
  | "carried-by"
  | "moves-over"
  | "hovers-over"
  | "carries"
  | "gives-voice-to"
  | "opens-to"
  | "breathes-into"
  | "stirred-by"
  | "moves-through"
  | "contrasts"
  | "transforms"
  | "related";

export type CodexSourceKind =
  | "symbol-network"
  | "symbol-list"
  | "hebrew-word"
  | "hebrew-letter"
  | "meaning-graph"
  | "scripture-reference"
  | "journey";

export interface CodexRelation {
  targetId: string;
  type: CodexRelationType;
  label?: string;
  strength?: number;
  source?: CodexSourceKind;
}

export interface CodexScriptureAnchor {
  id?: string;
  reference: string;
  label?: string;
  note?: string;
  source?: CodexSourceKind;
}

export interface CodexJourneyStep {
  id: string;
  label: string;
  codexId: string;
  description?: string;
}

export interface CodexMeta {
  status: "seed" | "draft" | "stable";
  source: CodexSourceKind[];
  sourceIds: string[];
  tags?: string[];
  notes?: string;
}

export interface CodexEntry {
  id: string;
  type: CodexEntryType;
  title: string;
  subtitle: string | null;
  hebrew: string | null;
  transliteration: string | null;
  aliases?: string[];
  searchTerms?: string[];
  summary: string;
  meaningFields: MeaningNodeId[];
  relations: CodexRelation[];
  steps?: CodexJourneyStep[];
  scriptureAnchors: CodexScriptureAnchor[];
  symbolRoomSlug: string | null;
  journeyIds: string[];
  meta: CodexMeta;
}
