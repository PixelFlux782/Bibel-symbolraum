import Image from "next/image";
import Link from "next/link";

const WATER_LAYERS = [
  {
    title: "Biblisch",
    text: "Wasser erscheint als Ursprung, Grenze und Weg durch das Unbekannte.",
  },
  {
    title: "Hebräisch",
    text: "מים trägt Bewegung, Mehrzahl und die Resonanz einer lebendigen Tiefe.",
  },
  {
    title: "Persönlich",
    text: "Ein innerer Raum für Reinigung, Erinnerung und sanften Übergang.",
  },
];

export default function StartPage() {
  return (
    <div className="relative overflow-hidden">
      <section className="relative flex min-h-screen items-center justify-center px-5 pb-24 pt-36 sm:px-8 lg:px-14">
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute inset-x-[14%] top-[46%] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          <div className="absolute inset-x-[8%] top-[58%] h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
          <div className="light-pulse absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(189,160,109,0.08),transparent_62%)]" />
        </div>

        <div className="symbol-fade-in relative z-10 mx-auto max-w-5xl text-center">
          <p className="mb-8 text-[10px] uppercase tracking-[0.5em] text-gold/70">
            Biblisches Archiv für innere Bilder
          </p>
          <h1 className="symbol-breathe font-serif text-[clamp(4rem,13vw,11rem)] italic leading-[0.86] text-foreground-strong">
            SYMBOLRAUM
          </h1>
          <p className="mx-auto mt-9 max-w-2xl font-serif text-xl leading-relaxed text-[#d8d1c2]/80 sm:text-2xl">
            Eine visuelle Reise durch biblische Symbole, hebräische Sprache und innere Bedeutungsräume.
          </p>

          <div className="mt-12 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/raeume/wasser"
              className="group inline-flex items-center justify-center border border-gold/35 bg-gold/[0.1] px-6 py-4 text-[11px] uppercase tracking-[0.32em] text-[#f2deae] backdrop-blur-md transition-colors duration-1000 hover:border-gold/50 hover:bg-gold/[0.12]"
            >
              Wasserraum betreten
              <span className="ml-4 h-px w-8 bg-gold/60 transition-opacity duration-1000 group-hover:opacity-80" />
            </Link>
            <Link
              href="/symbolnetz"
              className="inline-flex items-center justify-center border border-white/10 bg-black/[0.2] px-6 py-4 text-[11px] uppercase tracking-[0.32em] text-[#d8d1c2]/75 backdrop-blur-md transition-colors duration-1000 hover:border-white/20 hover:text-foreground"
            >
              Symbolnetz ansehen
            </Link>
          </div>
        </div>
      </section>

      <section className="relative px-5 pb-28 sm:px-8 lg:px-14">
        <div className="mx-auto grid max-w-6xl items-end gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="scroll-reveal relative min-h-[28rem] overflow-hidden border border-white/10 bg-black/[0.2] shadow-2xl shadow-black/40">
            <Image
              src="/Visuals/wasser_cinema_hero.png"
              alt="Cineastischer Wasserraum mit dunkler Tiefe und Licht"
              fill
              sizes="(min-width: 1024px) 54vw, 100vw"
              className="sacred-drift object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,5,12,0.72),rgba(2,5,12,0.08)_52%,rgba(2,5,12,0.42))]" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <p className="text-[10px] uppercase tracking-[0.42em] text-gold/70">
                Erster Raum
              </p>
              <h2 className="mt-3 font-serif text-5xl italic leading-none text-foreground-strong sm:text-7xl">
                מים
              </h2>
            </div>
          </div>

          <div className="scroll-reveal pb-2">
            <p className="text-[10px] uppercase tracking-[0.46em] text-gold/70">
              Majim / Wasser
            </p>
            <h3 className="mt-5 font-serif text-4xl italic leading-tight text-foreground-strong sm:text-5xl">
              Tiefe, Leben, Reinigung und Übergang.
            </h3>

            <div className="mt-10 grid gap-3">
              {WATER_LAYERS.map((layer) => (
                <article
                  key={layer.title}
                  className="border border-white/10 bg-white/[0.035] p-5 backdrop-blur-md transition-colors duration-1000 hover:border-gold/20 hover:bg-white/[0.045]"
                >
                  <p className="text-[10px] uppercase tracking-[0.35em] text-gold/70">
                    {layer.title}
                  </p>
                  <p className="mt-3 font-serif text-lg leading-relaxed text-[#d8d1c2]/74">
                    {layer.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
