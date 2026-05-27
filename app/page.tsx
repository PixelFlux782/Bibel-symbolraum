import Image from "next/image";
import Link from "next/link";
import { PathPreview } from "@/components/home/PathPreview";
import { RoomTransitionButton } from "@/components/transitions/RoomTransition";

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
    <div className="symbol-page">
      <section className="symbol-section relative flex min-h-screen items-center justify-center pb-24 pt-40 md:pt-36">
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute inset-x-[14%] top-[46%] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          <div className="absolute inset-x-[8%] top-[58%] h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
          <div className="light-pulse absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(189,160,109,0.08),transparent_62%)]" />
        </div>

        <div className="symbol-fade-in relative z-10 mx-auto w-full max-w-[20rem] text-center sm:max-w-5xl">
          <p className="symbol-kicker mb-8">
            Biblisches Archiv für innere Bilder
          </p>
          <h1 className="symbol-breathe max-w-full overflow-hidden font-serif text-[clamp(2rem,9vw,11rem)] italic leading-[0.86] text-foreground-strong sm:text-[clamp(4rem,13vw,11rem)]">
            SYMBOLRAUM
          </h1>
          <p className="symbol-copy mx-auto mt-9 max-w-[20rem] text-lg sm:max-w-2xl sm:text-2xl">
            Eine visuelle Reise durch biblische Symbole, hebräische Sprache und innere Bedeutungsräume.
          </p>

          <div className="mt-12 flex flex-col justify-center gap-3 sm:flex-row">
            <RoomTransitionButton
              href="/raeume/wasser"
              className="symbol-cta group mx-auto max-w-[19rem]"
            >
              Wasserraum betreten
              <span className="ml-4 h-px w-8 bg-gold/60 transition-opacity duration-1000 group-hover:opacity-80" />
            </RoomTransitionButton>
            <Link
              href="/symbolnetz"
              className="symbol-cta symbol-cta-secondary mx-auto max-w-[19rem]"
            >
              Symbolnetz ansehen
            </Link>
          </div>
        </div>
      </section>

      <PathPreview />

      <section className="symbol-section relative pb-28">
        <div className="mx-auto grid max-w-6xl items-end gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="scroll-reveal symbol-panel relative min-h-[28rem] overflow-hidden shadow-2xl shadow-black/40">
            <Image
              src="/Visuals/wasser_cinema_hero.png"
              alt="Cineastischer Wasserraum mit dunkler Tiefe und Licht"
              fill
              sizes="(min-width: 1024px) 54vw, 100vw"
              className="sacred-drift object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,5,12,0.72),rgba(2,5,12,0.08)_52%,rgba(2,5,12,0.42))]" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <p className="symbol-kicker">
                Erster Raum
              </p>
              <h2 className="mt-3 font-serif text-5xl italic leading-none text-foreground-strong sm:text-7xl">
                מים
              </h2>
            </div>
          </div>

          <div className="scroll-reveal pb-2">
            <p className="symbol-kicker">
              Majim / Wasser
            </p>
            <h3 className="mt-5 font-serif text-4xl italic leading-tight text-foreground-strong sm:text-5xl">
              Tiefe, Leben, Reinigung und Übergang.
            </h3>

            <div className="mt-10 grid gap-3">
              {WATER_LAYERS.map((layer) => (
                <article
                  key={layer.title}
                  className="symbol-panel p-5 transition-colors duration-1000 hover:border-gold/20 hover:bg-white/[0.045]"
                >
                  <p className="symbol-kicker">
                    {layer.title}
                  </p>
                  <p className="symbol-copy mt-3 text-lg">
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
