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
      <section className="relative flex min-h-screen items-center px-5 pb-24 pt-32 sm:px-8 lg:px-14">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-[12%] top-[44%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute inset-x-[8%] top-[56%] h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[1fr_0.72fr]">
          <div className="max-w-4xl">
            <p className="mb-7 text-[10px] uppercase tracking-[0.5em] text-gold/70">
              Biblisches Archiv für innere Bilder
            </p>
            <h1 className="font-serif text-[clamp(4.2rem,12vw,10.5rem)] italic leading-[0.86] text-foreground-strong">
              SYMBOLRAUM
            </h1>
            <p className="mt-8 max-w-2xl font-serif text-xl leading-relaxed text-[#d8d1c2]/78 sm:text-2xl">
              Eine visuelle Reise durch biblische Symbole, hebräische Sprache und innere Bedeutungsräume.
            </p>

            <div className="mt-12 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/raeume/wasser"
                className="group inline-flex items-center justify-center border border-gold/35 bg-gold/12 px-6 py-4 text-[11px] uppercase tracking-[0.32em] text-[#f2deae] backdrop-blur-md transition duration-500 hover:border-gold/70 hover:bg-gold/18"
              >
                Wasserraum betreten
                <span className="ml-4 h-px w-8 bg-gold/60 transition-all duration-500 group-hover:w-12" />
              </Link>
              <Link
                href="/symbolnetz"
                className="inline-flex items-center justify-center border border-white/10 bg-black/16 px-6 py-4 text-[11px] uppercase tracking-[0.32em] text-[#d8d1c2]/75 backdrop-blur-md transition duration-500 hover:border-white/25 hover:text-foreground"
              >
                Symbolnetz ansehen
              </Link>
            </div>
          </div>

          <div className="relative hidden min-h-[34rem] lg:block">
            <div className="absolute inset-y-0 right-0 w-full animate-depth-breathe">
              <Image
                src="/Visuals/Logo_hero.png"
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 38vw, 0vw"
                className="object-contain object-center opacity-75 mix-blend-screen"
              />
            </div>
            <div className="absolute inset-y-[12%] left-[18%] w-px bg-gradient-to-b from-transparent via-gold/35 to-transparent" />
            <div className="absolute bottom-[18%] right-[10%] h-24 w-24 border border-gold/15 bg-black/10 backdrop-blur-sm" />
          </div>
        </div>
      </section>

      <section className="relative px-5 pb-28 sm:px-8 lg:px-14">
        <div className="mx-auto grid max-w-6xl items-end gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="relative min-h-[28rem] overflow-hidden border border-white/10 bg-black/20 shadow-2xl shadow-black/40">
            <Image
              src="/Visuals/wasser_cinema_hero.png"
              alt="Cineastischer Wasserraum mit dunkler Tiefe und Licht"
              fill
              sizes="(min-width: 1024px) 54vw, 100vw"
              className="object-cover"
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

          <div className="pb-2">
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
                  className="border border-white/10 bg-white/[0.035] p-5 backdrop-blur-md transition duration-500 hover:border-gold/25 hover:bg-white/[0.055]"
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
