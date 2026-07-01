import Image from "next/image";
import Link from "next/link";
import { PathPreview } from "@/components/home/PathPreview";
import { visualAssets } from "@/lib/visualAssets";

const MEANING_FLOW = [
  "Hebräischer Buchstabe",
  "Symbol",
  "Raum",
  "Spur",
  "Mein Pfad",
];

const CURRENT_ROOMS = [
  "Wasser",
  "Licht",
  "Feuer",
  "Wüste",
  "Brot",
];

const FIRST_MOVEMENT = [
  "Ursprung",
  "Tiefe",
  "Ruach",
  "Wort",
  "Licht",
];

export default function StartPage() {
  return (
    <div className="symbol-page">
      <section className="symbol-section symbol-portal relative flex min-h-screen items-center justify-center overflow-hidden pb-28 pt-36 md:pt-32">
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
          <Image
            src={visualAssets.startHero}
            alt=""
            fill
            priority
            sizes="100vw"
            className="sacred-drift object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,12,0.66),rgba(2,5,12,0.24)_42%,rgba(2,5,12,0.78))]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(2,5,12,0.1)_0%,rgba(2,5,12,0.44)_68%,rgba(2,5,12,0.84)_100%)]" />
          <div className="symbol-portal-depth absolute inset-0" />
          <div className="symbol-portal-noise absolute inset-0" />
          <div className="symbol-portal-breath absolute left-1/2 top-1/2 h-[44rem] w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full" />
          <div className="absolute left-1/2 top-1/2 h-[min(72vw,42rem)] w-[min(72vw,42rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/[0.045]" />
          <div className="absolute left-1/2 top-1/2 h-[min(56vw,31rem)] w-[min(56vw,31rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.035]" />
          <div className="absolute inset-x-[12%] top-[50%] h-px bg-gradient-to-r from-transparent via-gold/[0.16] to-transparent" />
          <div className="absolute inset-x-[24%] top-[50%] h-px -translate-y-8 bg-gradient-to-r from-transparent via-cyan/[0.08] to-transparent" />
          <span className="symbol-portal-glyph left-[8%] top-[26%] hidden sm:block">{"\u05de"}</span>
          <span className="symbol-portal-glyph right-[10%] top-[32%] hidden sm:block">{"\u05d9"}</span>
          <span className="symbol-portal-glyph bottom-[22%] left-[18%]">{"\u05dd"}</span>
          <span className="symbol-portal-glyph bottom-[18%] right-[16%] hidden md:block">{"\u05d0"}</span>
        </div>

        <div className="symbol-fade-in relative z-10 mx-auto grid w-full max-w-full justify-items-center text-center sm:max-w-6xl">
          <p className="symbol-kicker mb-7 text-gold/55">
            Archiv der Zeichen
          </p>
          <h1 className="symbol-portal-title max-w-full overflow-visible font-serif text-[clamp(3rem,17vw,13rem)] italic leading-[0.78] text-foreground-strong">
            SYMBOLRAUM
          </h1>
          <p className="symbol-copy mx-auto mt-9 max-w-[16rem] text-base italic text-muted-soft sm:max-w-xl sm:text-xl">
            Eine Spur öffnet sich im Wasser.
          </p>

          <p className="symbol-copy mx-auto mt-7 max-w-[20rem] text-sm text-muted-soft sm:max-w-2xl sm:text-lg">
            Beginne im Wasser. Beruehre den Anfang, geh durch Tiefe, Ruach und Wort, bis Licht sich oeffnet.
          </p>

          <p className="symbol-copy mx-auto mt-5 max-w-[18rem] text-xs uppercase tracking-[0.18em] text-gold/60 sm:max-w-2xl">
            Erste Bewegung: {FIRST_MOVEMENT.join(" / ")}
          </p>

          <div className="mt-16 flex flex-col items-center gap-6">
            <Link href="/raeume/wasser" className="symbol-portal-entry group">
              <span className="symbol-portal-entry-mark" aria-hidden="true" />
              <span>Wasser-Raum betreten</span>
            </Link>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
              <Link href="/symbolnetz?symbol=wasser&path=erste-bewegung" className="symbol-cta">
                Erste Bewegung ansehen
              </Link>
              <Link href="/mein-pfad" className="symbol-cta symbol-cta-secondary">
                Mein Pfad ansehen
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PathPreview />

      <section className="symbol-section relative pb-36">
        <div className="mx-auto grid max-w-6xl items-end gap-14 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="scroll-reveal relative min-h-[28rem] overflow-hidden shadow-[0_34px_120px_rgba(0,0,0,0.34)]">
            <Image
              src={visualAssets.symbolnetzHero}
              alt="Dunkles Symbolnetz mit leuchtenden Verbindungen"
              fill
              sizes="(min-width: 1024px) 54vw, 100vw"
              className="sacred-drift object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,5,12,0.72),rgba(2,5,12,0.08)_52%,rgba(2,5,12,0.42))]" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <p className="symbol-kicker">
                Lebendige Karte
              </p>
              <h2 className="mt-3 font-serif text-5xl italic leading-none text-foreground-strong sm:text-7xl">
                {"\u05d0\u05d5\u05ea"}
              </h2>
            </div>
          </div>

          <div className="scroll-reveal pb-2">
            <p className="symbol-kicker">
              Bedeutungsbewegung
            </p>
            <h3 className="mt-5 font-serif text-4xl italic leading-tight text-foreground-strong sm:text-5xl">
              Aus Zeichen werden Räume. Aus Räumen werden Spuren.
            </h3>

            <div className="mt-12 grid gap-4">
              {MEANING_FLOW.map((step, index) => (
                <article
                  key={step}
                  className="grid grid-cols-[2.4rem_1fr] items-center border-t border-white/[0.045] pt-4"
                >
                  <p className="font-serif text-2xl italic text-gold/55">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="symbol-copy text-lg">
                    {step}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-12 border-t border-gold/[0.08] pt-7">
              <p className="symbol-kicker">Aktuelle Räume im Netz</p>
              <p className="symbol-copy mt-4 text-lg">
                {CURRENT_ROOMS.join(" / ")}
              </p>
              <Link href="/symbolnetz" className="symbol-cta mt-6">
                Symbolnetz öffnen
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
