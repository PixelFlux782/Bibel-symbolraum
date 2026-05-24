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

      <section className="w-full max-w-5xl border-t border-white/5 px-6 py-32">
        <div className="space-y-20 text-center">
          <h2 className="font-sans text-[10px] uppercase tracking-[0.5em] text-muted">
            Beginne mit einem Zeichen
          </h2>

          <div className="flex flex-wrap justify-center gap-x-12 gap-y-16">
            {symbols.map((symbol) => (
              <Link
                key={symbol.slug}
                href={`/symbole/${symbol.slug}`}
                className="group relative block"
              >
                <span className="font-serif text-4xl italic text-foreground/20 transition-all duration-1000 group-hover:text-foreground md:text-6xl">
                  {symbol.name}
                </span>
                <div className="absolute -bottom-4 left-0 h-px w-0 bg-gold/30 transition-all duration-1000 group-hover:w-full" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-48 text-center opacity-80">
        <div className="mx-auto max-w-2xl space-y-8">
          <span className="text-2xl text-gold/40">✨</span>
          <blockquote className="font-serif text-2xl italic leading-relaxed text-muted/80">
            In jedem Wort schläft eine Welt. Wer das Symbol öffnet, findet nicht
            eine Information, sondern einen Weg zu sich selbst.
          </blockquote>
        </div>
      </section>
    </main>
  );
}