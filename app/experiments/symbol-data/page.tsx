import { SYMBOL_ENTRIES, type SymbolEntry } from "@/lib/symbolraum/symbols";

type SymbolEntryWithLetters = SymbolEntry & {
  letters?: NonNullable<SymbolEntry["letterBreakdown"]>;
};

function getLetters(symbol: SymbolEntry) {
  return symbol.letterBreakdown ?? (symbol as SymbolEntryWithLetters).letters ?? [];
}

function getRelations(symbol: SymbolEntry) {
  return symbol.relations ?? symbol.symbolRelations ?? [];
}

function formatGematria(symbol: SymbolEntry) {
  if (!symbol.gematria) {
    return "n/a";
  }

  return symbol.gematria.method
    ? `${symbol.gematria.value} (${symbol.gematria.method})`
    : `${symbol.gematria.value}`;
}

function DataBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-white/[0.045] pt-5">
      <h3 className="symbol-kicker text-cyan-soft">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function SymbolDataExperimentPage() {
  const symbolCount = SYMBOL_ENTRIES.length;
  const relationCount = SYMBOL_ENTRIES.reduce((sum, symbol) => sum + getRelations(symbol).length, 0);
  const verseCount = SYMBOL_ENTRIES.reduce((sum, symbol) => sum + (symbol.verses?.length ?? 0), 0);

  return (
    <main className="symbol-page min-h-screen bg-[#02050b] px-4 pb-24 pt-28 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <header className="border-b border-gold/[0.08] pb-10">
          <p className="symbol-kicker">Experiment / Daten-Explorer</p>
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <h1 className="font-serif text-5xl italic leading-tight text-foreground-strong sm:text-7xl">
                SYMBOLRAUM Daten
              </h1>
              <p className="symbol-copy mt-5 max-w-3xl text-lg">
                Interner Blick auf SymbolEntry-Datensätze, Relationen, Verse, Buchstaben,
                Gematria und Bildreferenzen.
              </p>
            </div>
            <dl className="grid grid-cols-3 gap-3 text-center">
              <div className="symbol-panel px-5 py-4">
                <dt className="symbol-kicker text-cyan-soft">Symbole</dt>
                <dd className="mt-2 font-serif text-3xl text-gold/90">{symbolCount}</dd>
              </div>
              <div className="symbol-panel px-5 py-4">
                <dt className="symbol-kicker text-cyan-soft">Relationen</dt>
                <dd className="mt-2 font-serif text-3xl text-gold/90">{relationCount}</dd>
              </div>
              <div className="symbol-panel px-5 py-4">
                <dt className="symbol-kicker text-cyan-soft">Verse</dt>
                <dd className="mt-2 font-serif text-3xl text-gold/90">{verseCount}</dd>
              </div>
            </dl>
          </div>
        </header>

        <div className="mt-10 grid gap-4">
          {SYMBOL_ENTRIES.map((symbol) => {
            const letters = getLetters(symbol);
            const relations = getRelations(symbol);
            const verses = symbol.verses ?? [];
            const imageAssets = symbol.imageAssets ?? [];

            return (
              <details
                key={symbol.id}
                className="symbol-panel group overflow-hidden px-5 py-5 open:border-gold/[0.12] sm:px-7"
              >
                <summary className="grid cursor-pointer list-none gap-5 marker:hidden lg:grid-cols-[minmax(11rem,1.1fr)_minmax(8rem,0.8fr)_minmax(9rem,0.8fr)_minmax(9rem,0.8fr)_minmax(10rem,0.9fr)_6rem_5rem] lg:items-center">
                  <div>
                    <p className="font-serif text-3xl italic leading-tight text-foreground-strong">
                      {symbol.name}
                    </p>
                    <p className="symbol-kicker mt-2 text-cyan-soft">{symbol.id}</p>
                  </div>
                  <div>
                    <p className="symbol-kicker">Hebräisch</p>
                    <p className="mt-2 font-serif text-3xl text-gold/90">{symbol.hebrew || "n/a"}</p>
                  </div>
                  <div>
                    <p className="symbol-kicker">Translit.</p>
                    <p className="symbol-copy mt-2 text-base">{symbol.transliteration || "n/a"}</p>
                  </div>
                  <div>
                    <p className="symbol-kicker">Gematria</p>
                    <p className="symbol-copy mt-2 text-base">{formatGematria(symbol)}</p>
                  </div>
                  <div>
                    <p className="symbol-kicker">Kategorie</p>
                    <p className="symbol-copy mt-2 text-base">{symbol.category || "n/a"}</p>
                  </div>
                  <div>
                    <p className="symbol-kicker">Relationen</p>
                    <p className="mt-2 font-serif text-2xl text-gold/80">{relations.length}</p>
                  </div>
                  <div>
                    <p className="symbol-kicker">Verse</p>
                    <p className="mt-2 font-serif text-2xl text-gold/80">{verses.length}</p>
                  </div>
                </summary>

                <div className="mt-8 grid gap-8 border-t border-gold/[0.06] pt-8">
                  <DataBlock title="Letters">
                    {letters.length > 0 ? (
                      <div className="grid gap-3 md:grid-cols-3">
                        {letters.map((letter, index) => (
                          <article key={`${letter.letter}-${index}`} className="border border-white/[0.045] p-4">
                            <p className="font-serif text-4xl text-gold/90">{letter.letter}</p>
                            <p className="symbol-kicker mt-3 text-cyan-soft">{letter.name}</p>
                            <p className="symbol-copy mt-3 text-sm">
                              {letter.transliteration ? `${letter.transliteration} · ` : ""}
                              {letter.numericValue ? `${letter.numericValue} · ` : ""}
                              {letter.meaning ?? "Keine Deutung hinterlegt."}
                            </p>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className="symbol-copy text-sm">Keine Buchstaben hinterlegt.</p>
                    )}
                  </DataBlock>

                  <DataBlock title="Verses">
                    {verses.length > 0 ? (
                      <div className="grid gap-3">
                        {verses.map((verse, index) => (
                          <article key={`${verse.reference}-${index}`} className="border border-white/[0.045] p-4">
                            <p className="font-serif text-xl text-foreground-strong">{verse.reference}</p>
                            <p className="symbol-kicker mt-2 text-cyan-soft">
                              {verse.book} {verse.chapter},{verse.verseRange}
                              {verse.layer ? ` · ${verse.layer}` : ""}
                            </p>
                            <p className="symbol-copy mt-3 text-sm">{verse.shortNote}</p>
                            <p className="symbol-copy mt-2 text-sm text-muted-soft">{verse.symbolicRole}</p>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className="symbol-copy text-sm">Keine Verse hinterlegt.</p>
                    )}
                  </DataBlock>

                  <DataBlock title="Relations">
                    {relations.length > 0 ? (
                      <div className="grid gap-3 md:grid-cols-2">
                        {relations.map((relation, index) => (
                          <article key={`${relation.targetId}-${relation.relationType}-${index}`} className="border border-white/[0.045] p-4">
                            <p className="font-serif text-xl text-foreground-strong">{relation.targetId}</p>
                            <p className="symbol-kicker mt-2 text-cyan-soft">
                              {relation.relationType} · {relation.strength}
                            </p>
                            <p className="symbol-copy mt-3 text-sm">{relation.explanation}</p>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className="symbol-copy text-sm">Keine Relationen hinterlegt.</p>
                    )}
                  </DataBlock>

                  <DataBlock title="ImageAssets">
                    {imageAssets.length > 0 ? (
                      <div className="grid gap-3 md:grid-cols-2">
                        {imageAssets.map((asset, index) => (
                          <article key={`${asset.src}-${index}`} className="border border-white/[0.045] p-4">
                            <p className="break-all font-mono text-xs text-gold/80">{asset.src}</p>
                            <p className="symbol-kicker mt-3 text-cyan-soft">{asset.role ?? "asset"}</p>
                            <p className="symbol-copy mt-3 text-sm">{asset.alt}</p>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className="symbol-copy text-sm">Keine Bildreferenzen hinterlegt.</p>
                    )}
                  </DataBlock>
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </main>
  );
}
