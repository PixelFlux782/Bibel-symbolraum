export type HebrewLetterValue = {
  letter: string;
  value: number;
};

export type HebrewWordBreakdown = {
  word: string;
  letters: HebrewLetterValue[];
  value: number;
};

export const HEBREW_LETTER_VALUES: Readonly<Record<string, number>> = {
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

const HEBREW_MARKS_PATTERN = /[\u0591-\u05BD\u05BF-\u05C7]/u;

export function getHebrewLetterValue(letter: string): number {
  return HEBREW_LETTER_VALUES[letter] ?? 0;
}

export function calculateGematria(word: string): number {
  return breakdownHebrewWord(word).value;
}

export function breakdownHebrewWord(word: string): HebrewWordBreakdown {
  const letters = Array.from(word)
    .filter((letter) => !HEBREW_MARKS_PATTERN.test(letter))
    .map((letter): HebrewLetterValue => ({
      letter,
      value: getHebrewLetterValue(letter),
    }));

  return {
    word,
    letters,
    value: letters.reduce((sum, letter) => sum + letter.value, 0),
  };
}
