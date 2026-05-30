import type { CSSProperties } from "react";
import type { MeaningQuality, SymbolGraph } from "@/lib/symbolism";

export type RoomImageAsset = {
  src: string;
  alt: string;
};

export type ExperienceState = {
  mood: string;
  motion: string;
  light: string;
  density: number;
  transition: string;
};

export type RoomEntranceConfig = {
  symbolNodeId: string;
  kickerPrefix: string;
  statement: string;
  ctaLabel: string;
  ctaHref: string;
  heroImage: RoomImageAsset;
  backgroundImage: RoomImageAsset;
};

export type RoomEncounter = {
  id: string;
  symbolNodeId: string;
  state: string;
  impulse: string;
  experienceState: ExperienceState;
};

export type RoomRevealConfig = {
  kicker: string;
  symbolNodeId: string;
  statement: string;
};

export type RoomDecisionConfig = {
  kicker: string;
  reflectionQuestion: string;
  textareaLabel: string;
  placeholder: string;
  storageNotice: string;
  saveLabel: string;
  savedMessage: string;
  emptyMessage: string;
};

export type RoomTransitionConfig = {
  symbolNodeId: string;
};

export type RoomEchoRule = {
  keywords: string[];
  nodes: string[];
  interpretation: string;
};

export type RoomEchoConfig = {
  rules: RoomEchoRule[];
  fallback: RoomEchoRule;
  inputPlaceholder: string;
  inputLabel: string;
  submitLabel: string;
  idleKicker: string;
  answerKicker: string;
  detailAnswerKicker: string;
  idleStatement: string;
  inscriptionKicker: string;
};

export type RoomTheme = {
  id: string;
  colors: {
    background: string;
    accentRgb: string;
    ambientRgb: string;
  };
  atmosphere: string;
  motion: string;
  overlayStyle: CSSProperties;
  encounterImage: RoomImageAsset;
  journeyKicker: string;
  journeyStatement: string;
  meaningQualityLabels: Record<MeaningQuality, string>;
  primaryMeaningQualities: MeaningQuality[];
  fallbackQualities: string[];
};

export type SymbolRoomDefinition = {
  id: string;
  slug: string;
  graph: SymbolGraph;
  centerNodeId: string;
  entrance: RoomEntranceConfig;
  encounters: RoomEncounter[];
  reveal?: RoomRevealConfig;
  decision: RoomDecisionConfig;
  transition: RoomTransitionConfig;
  echo?: RoomEchoConfig;
  theme: RoomTheme;
};
