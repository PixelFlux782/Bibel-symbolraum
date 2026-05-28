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
  א: 1,
  ב: 2,
  ג: 3,
  ד: 4,
  ה: 5,
  ו: 6,
  ז: 7,
  ח: 8,
  ט: 9,
  י: 10,
  כ: 20,
  ך: 20,
  ל: 30,
  מ: 40,
  ם: 40,
  נ: 50,
  ן: 50,
  ס: 60,
  ע: 70,
  פ: 80,
  ף: 80,
  צ: 90,
  ץ: 90,
  ק: 100,
  ר: 200,
  ש: 300,
  ת: 400,
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

const mayimGematria = calculateGematria('מים');

if (mayimGematria !== 90) {
  throw new Error(`Gematria validation failed for מים: expected 90, got ${mayimGematria}.`);
}
