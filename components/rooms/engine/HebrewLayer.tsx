import type { HebrewLetterMeaning } from "@/types/engine";

type HebrewLayerProps = {
  activeLetter: HebrewLetterMeaning;
  word: string;
  transliteration: string;
  letters: HebrewLetterMeaning[];
  stateLetterIds: string[];
  summary: string;
  onSelect: (letterId: string) => void;
};

export function HebrewLayer({ activeLetter, word, transliteration, letters, stateLetterIds, summary, onSelect }: HebrewLayerProps) {
  return (
    <section className="symbol-engine__layer symbol-engine__hebrew-layer" aria-label="Hebraeische Bedeutung">
      <div className="symbol-engine__layer-heading">
        <p>Hebraeisch</p>
        <span lang="he" dir="rtl">{word}</span>
        <i>{transliteration}</i>
      </div>
      <div className="symbol-engine__hebrew-letters">
        {letters.map((letter) => (
          <button
            type="button"
            key={letter.id}
            className={`${letter.id === activeLetter.id ? "is-active" : ""} ${stateLetterIds.includes(letter.id) ? "is-related" : ""}`}
            onClick={() => onSelect(letter.id)}
            aria-pressed={letter.id === activeLetter.id}
          >
            <span lang="he" dir="rtl">{letter.letter}</span>
            <i>{letter.position}</i>
          </button>
        ))}
      </div>
      <article className="symbol-engine__hebrew-explanation">
        <h3>{activeLetter.name}</h3>
        <p>{activeLetter.meaning}</p>
        <p>{activeLetter.detail}</p>
      </article>
      <p className="symbol-engine__layer-copy">{summary}</p>
    </section>
  );
}
