import Link from "next/link";

export default function Home() {
  const symbols = ["Wasser", "Wüste", "Brot", "Licht", "Name", "Weg", "Berg", "Ägypten"];

  return (
    <main className="min-h-screen px-6 py-24">
      <section className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <p className="mb-4 text-sm uppercase tracking-[0.35em] text-amber-200/70">
          Bibel · Symbol · Begegnung
        </p>

        <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white md:text-7xl">
          Die verborgene Sprache der Bibel entdecken
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">
          Ein interaktiver Raum für Symbole, Geschichten, hebräische Tiefen
          und persönliche Begegnung.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/symbole"
            className="rounded-full bg-amber-200 px-6 py-3 text-sm font-medium text-black hover:bg-amber-100"
          >
            Mit einem Symbol beginnen
          </Link>

          <Link
            href="/impuls"
            className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/80 hover:bg-white/10"
          >
            Täglicher Impuls
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {symbols.map((symbol) => (
            <span
              key={symbol}
              className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70"
            >
              {symbol}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}