export type HebrewLetterMeaning = {
  id: string;
  letter: string;
  name: string;
  position: string;
  meaning: string;
  detail: string;
};

export type HebrewLogic = {
  word: string;
  transliteration: string;
  translation: string;
  letters: HebrewLetterMeaning[];
  summary: string;
};

export type BiblicalScene = {
  id: string;
  reference: string;
  title: string;
  text: string;
  meaning: string;
};

export type SymbolConnection = {
  id: string;
  label: string;
  relation: string;
  detail: string;
};

export type AtmosphereProfile = {
  id: string;
  mood: string;
  motion: string;
  light: string;
  density: number;
};

export type VisualState = {
  image: string;
  alt: string;
  backgroundImage?: string;
  atmosphere: AtmosphereProfile;
  veilOpacity: number;
  imageOpacity?: number;
};

export type ReflectionPrompt = {
  kicker: string;
  question: string;
};

export type SymbolJourneyState = {
  id: string;
  navigationLabel: string;
  eyebrow: string;
  title: string;
  text: string;
  inscription: string;
  visual: VisualState;
  hebrewLetterIds: string[];
  hebrewSummary: string;
  biblicalSceneIds: string[];
  connectionIds: string[];
  reflection: ReflectionPrompt;
};

export type SymbolEngineData = {
  id: string;
  slug: string;
  title: string;
  symbolLabel: string;
  hebrew: HebrewLogic;
  scenes: BiblicalScene[];
  connections: SymbolConnection[];
  states: SymbolJourneyState[];
};
