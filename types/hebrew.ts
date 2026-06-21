export type HebrewCodexProvenance =
  | "textual"
  | "semantic"
  | "canonical"
  | "interpretive"
  | "contemplative";

export type HebrewRootType = "biliteral" | "triliteral" | "quadriliteral" | "other";

export interface HebrewBiblicalReference {
  id: string;
  reference: string;
  context: string;
  relation: string;
  provenance: HebrewCodexProvenance;
}

export interface HebrewMeaningField {
  id: string;
  label: string;
  description: string;
  provenance: HebrewCodexProvenance;
  experienceFields: string[];
}

export interface HebrewLetterSymbolism {
  id: string;
  label: string;
  description: string;
  provenance: "interpretive" | "contemplative";
}

export interface HebrewLetter {
  id: string;
  glyph: string;
  name: string;
  transcription: string;
  numericValue: number;
  alphabetPosition: number;
  openForm?: string;
  closedForm?: string;
  finalForm?: string;
  symbolism: HebrewLetterSymbolism[];
  archetypalMeanings: string[];
  relatedSymbolSlugs: string[];
  relatedWordIds: string[];
  biblicalReferences: HebrewBiblicalReference[];
  experienceFields: string[];
}

export interface HebrewRoot {
  id: string;
  radicals: string[];
  letterIds: string[];
  rootType: HebrewRootType;
  coreSemanticField: string;
  meaningFields: HebrewMeaningField[];
  relatedRootIds: string[];
  notes?: string;
  sources: string[];
}

export interface HebrewWord {
  id: string;
  slug: string;
  hebrew: string;
  transliteration: string;
  germanMeaning: string;
  gematria?: number;
  category?: "word";
  letterIds: string[];
  possibleRootIds: string[];
  rootNote?: string;
  meaningFields: HebrewMeaningField[];
  relatedSymbolSlugs: string[];
  biblicalReferences: HebrewBiblicalReference[];
}

export interface HebrewSymbolMapping {
  id: string;
  symbolSlug: string;
  hebrewWordIds: string[];
  primaryHebrewWordId: string;
  note?: string;
}
