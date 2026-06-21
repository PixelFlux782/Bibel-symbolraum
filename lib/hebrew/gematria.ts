export type HebrewLetterBreakdown = {
  letter: string;
  value: number;
};

export type HebrewWordBreakdown = {
  word: string;
  letters: HebrewLetterBreakdown[];
  value: number;
};

const HEBREW_GEMATRIA_VALUES: Record<string, number> = {
  "\u05d0": 1,
  "\u05d1": 2,
  "\u05d2": 3,
  "\u05d3": 4,
  "\u05d4": 5,
  "\u05d5": 6,
  "\u05d6": 7,
  "\u05d7": 8,
  "\u05d8": 9,
  "\u05d9": 10,
  "\u05db": 20,
  "\u05da": 20,
  "\u05dc": 30,
  "\u05de": 40,
  "\u05dd": 40,
  "\u05e0": 50,
  "\u05df": 50,
  "\u05e1": 60,
  "\u05e2": 70,
  "\u05e4": 80,
  "\u05e3": 80,
  "\u05e6": 90,
  "\u05e5": 90,
  "\u05e7": 100,
  "\u05e8": 200,
  "\u05e9": 300,
  "\u05ea": 400,
};

const HEBREW_MARKS = /[\u0591-\u05BD\u05BF-\u05C7]/u;

export function getHebrewLetterValue(letter: string): number {
  return HEBREW_GEMATRIA_VALUES[letter] ?? 0;
}

export function calculateGematria(word: string): number {
  return breakdownHebrewWord(word).value;
}

export function breakdownHebrewWord(word: string): HebrewWordBreakdown {
  const letters = Array.from(word)
    .filter((letter) => !HEBREW_MARKS.test(letter))
    .map((letter) => ({
      letter,
      value: getHebrewLetterValue(letter),
    }));

  return {
    word,
    letters,
    value: letters.reduce((sum, letter) => sum + letter.value, 0),
  };
}

const mayimGematria = calculateGematria("\u05de\u05d9\u05dd");
const tehomGematria = calculateGematria("\u05ea\u05d4\u05d5\u05dd");

if (mayimGematria !== 90) {
  throw new Error(`Gematria validation failed for \u05de\u05d9\u05dd: expected 90, got ${mayimGematria}.`);
}

if (tehomGematria !== 451) {
  throw new Error(`Gematria validation failed for \u05ea\u05d4\u05d5\u05dd: expected 451, got ${tehomGematria}.`);
}
