import Image from "next/image";
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
      <section className="symbol-section symbol-portal relative flex min-h-screen items-center justify-center overflow-hidden pb-28 pt-36 md:pt-32">
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
          <div className="symbol-portal-depth absolute inset-0" />
          <div className="symbol-portal-noise absolute inset-0" />
          <div className="symbol-portal-breath absolute left-1/2 top-1/2 h-[44rem] w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full" />
          <div className="absolute left-1/2 top-1/2 h-[min(72vw,42rem)] w-[min(72vw,42rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/[0.045]" />
          <div className="absolute left-1/2 top-1/2 h-[min(56vw,31rem)] w-[min(56vw,31rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.035]" />
          <div className="absolute inset-x-[12%] top-[50%] h-px bg-gradient-to-r from-transparent via-gold/[0.16] to-transparent" />
          <div className="absolute inset-x-[24%] top-[50%] h-px -translate-y-8 bg-gradient-to-r from-transparent via-cyan/[0.08] to-transparent" />
          <span className="symbol-portal-glyph left-[8%] top-[26%] hidden sm:block">מ</span>
          <span className="symbol-portal-glyph right-[10%] top-[32%] hidden sm:block">י</span>
          <span className="symbol-portal-glyph bottom-[22%] left-[18%]">ם</span>
          <span className="symbol-portal-glyph bottom-[18%] right-[16%] hidden md:block">א</span>
        </div>

        <div className="symbol-fade-in relative z-10 mx-auto grid w-full max-w-[21rem] justify-items-center text-center sm:max-w-6xl">
          <p className="symbol-kicker mb-7 text-gold/55">
            Archiv der Zeichen
          </p>
          <h1 className="symbol-portal-title max-w-full overflow-hidden font-serif text-[clamp(3rem,17vw,13rem)] italic leading-[0.78] text-foreground-strong">
            SYMBOLRAUM
          </h1>
          <p className="symbol-copy mx-auto mt-9 max-w-[16rem] text-base italic text-muted-soft sm:max-w-xl sm:text-xl">
            Ein stiller Raum biblischer Bilder.
          </p>

          <RoomTransitionButton
            href="/raeume/wasser"
            className="symbol-portal-entry group mt-16"
          >
            <span className="symbol-portal-entry-mark" aria-hidden="true" />
            <span>Wasserraum betreten</span>
          </RoomTransitionButton>
        </div>
      </section>

      <PathPreview />

      <section className="symbol-section relative pb-36">
        <div className="mx-auto grid max-w-6xl items-end gap-14 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="scroll-reveal relative min-h-[28rem] overflow-hidden shadow-[0_34px_120px_rgba(0,0,0,0.34)]">
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

            <div className="mt-12 grid gap-7">
              {WATER_LAYERS.map((layer) => (
                <article
                  key={layer.title}
                  className="border-t border-white/[0.045] pt-7"
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
