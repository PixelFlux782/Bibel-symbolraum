import Link from "next/link";

export default function StartPage() {
  const symbols = [
    { name: "Wasser", slug: "wasser" },
    { name: "Wüste", slug: "wueste" },
    { name: "Brot", slug: "brot" },
    { name: "Licht", slug: "licht" },
    { name: "Weg", slug: "weg" },
    { name: "Name", slug: "name" },
  ];

  return (
    <main className="flex flex-col items-center">
      <section className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center py-12">
        <div className="max-w-3xl space-y-8 animate-[fade-in-up_1s_ease-out]">
          <div className="hero-title-wrap mx-auto">
            <div className="hero-title-bg" aria-hidden="true" />
            <h1 className="font-serif text-4xl italic leading-[1.08] tracking-tight md:text-6xl text-foreground-strong warm-text-gradient">
              Die Bibel ist nicht nur Erinnerung.
              <br />
              <span className="block mt-3 text-lg font-serif text-muted-soft md:text-xl">
                Sie ist eine Sprache, in der das Leben selbst zu dir spricht.
              </span>
            </h1>
          </div>

          <p className="mx-auto max-w-lg font-serif text-lg italic leading-relaxed text-muted-soft md:text-xl">
            Tritt ein in eine digitale Bibliothek der Tiefe. Entdecke Symbole,
            die deine Geschichte weiten und Räume, die zur Stille einladen.
          </p>

          <div className="pt-8">
            <Link
              href="/symbole"
              className="group inline-flex items-center gap-4 rounded-full border border-white/8 bg-white/3 px-10 py-4 backdrop-blur-md transition-all duration-500 hover:bg-white/6"
            >
              <span className="font-sans text-[11px] uppercase tracking-[0.4em]">
                Das Archiv betreten
              </span>
              <span className="text-gold/60 transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="w-full max-w-5xl border-t border-white/6 px-6 py-28">
        <div className="space-y-12 text-center">
          <h2 className="font-sans text-[10px] uppercase tracking-[0.5em] text-muted-soft">
            Beginne mit einem Zeichen
          </h2>

          <div className="flex flex-wrap justify-center gap-6">
            {symbols.map((symbol) => (
              <Link
                key={symbol.slug}
                href={`/symbole/${symbol.slug}`}
                className="group relative block w-44 md:w-56"
              >
                <div className="rounded-2xl p-6 bg-gradient-to-b from-black/6 to-transparent border border-white/6 hover:bg-black/10 transition-all duration-400">
                  <span className="block text-3xl md:text-4xl font-serif italic text-foreground-strong transition-colors duration-400">
                    {symbol.name}
                  </span>
                  <div className="mt-3 text-xs text-muted-soft uppercase tracking-[0.35em]">Entdecken</div>
                </div>
                <div className="absolute -bottom-3 left-6 right-6 h-px bg-gold/20 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-36 text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="text-3xl text-gold/40">✦</div>
          <blockquote className="font-serif text-2xl italic leading-relaxed text-foreground-strong">
            In jedem Wort schläft eine Welt. Wer das Symbol öffnet, findet nicht
            eine Information, sondern einen Weg zu sich selbst.
          </blockquote>
          <div className="w-24 h-px bg-gradient-to-r from-gold/30 to-transparent mx-auto mt-4" />
        </div>
      </section>
    </main>
  );
}