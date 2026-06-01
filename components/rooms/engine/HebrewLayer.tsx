import type { HebrewLetterMeaning } from "@/types/engine";

type HebrewLayerProps = {
  word: string;
  transliteration: string;
  letters: HebrewLetterMeaning[];
  summary: string;
};

export function HebrewLayer({ word, transliteration, letters, summary }: HebrewLayerProps) {
  return (
    <section className="symbol-engine__layer symbol-engine__hebrew-layer" aria-label="Hebraeische Bedeutung">
      <div className="symbol-engine__layer-heading">
        <p>Hebraeisch</p>
        <span lang="he" dir="rtl">{word}</span>
        <i>{transliteration}</i>
      </div>
      <div className="symbol-engine__hebrew-letters">
        {letters.map((letter) => (
          <article key={letter.id}>
            <span lang="he" dir="rtl">{letter.letter}</span>
            <div>
              <h3>{letter.name}</h3>
              <p>{letter.meaning}</p>
            </div>
          </article>
        ))}
      </div>
      <p className="symbol-engine__layer-copy">{summary}</p>
    </section>
  );
}
