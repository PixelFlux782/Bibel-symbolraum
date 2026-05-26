import Image from "next/image";

const MEANING_LAYERS = [
  {
    title: "Biblisch",
    terms: "Urflut · Meer · Exodus · Taufe",
    text: "Wasser ist Ursprung und Grenze. Es steht vor der Schöpfung, vor dem Auszug, vor der neuen Geburt.",
  },
  {
    title: "Hebräisch",
    terms: "מים · מ י ם",
    text: "Das Wort öffnet einen Raum aus Tiefe, Mitte und geschlossener Verborgenheit.",
  },
  {
    title: "Persönlich",
    terms: "Tiefe · Reinigung · Übergang · neues Leben",
    text: "Wasser berührt, was getragen werden will, und löst, was nicht mehr bleiben kann.",
  },
];

const HEBREW_LETTERS = [
  {
    letter: "מ",
    title: "Mem",
    text: "Wasser, Mutterleib, Tiefe, Ursprung.",
  },
  {
    letter: "י",
    title: "Jod",
    text: "Same, Punkt, göttlicher Impuls.",
  },
  {
    letter: "ם",
    title: "Finales Mem",
    text: "Geschlossene Tiefe, verborgener Raum.",
  },
];

const JOURNEY_PANELS = [
  {
    src: "/Visuals/wasser_tiefenbild.png",
    title: "Die Tiefe",
    text: "Unter der Oberfläche beginnt ein Raum, der nicht erklärt, sondern erinnert.",
  },
  {
    src: "/Visuals/wasser_szenenbild.png",
    title: "Der Übergang",
    text: "Das Wasser wird zur Schwelle: bedrohlich, offen, unmöglich und doch begehbar.",
  },
  {
    src: "/Visuals/wasser_hebr_symbl.png",
    title: "Die lebendige Schrift",
    text: "Die Buchstaben stehen nicht auf dem Wasser. Sie bewegen sich wie Zeichen aus Licht.",
  },
  {
    src: "/Visuals/wasser_karte.png",
    title: "Die Ordnung",
    text: "Eine Karte im Dunkel. Nicht als Erklärung, sondern als leise Orientierung.",
  },
  {
    src: "/Visuals/wasser_makro.png",
    title: "Die Spur im Stofflichen",
    text: "Im Nahen wird das Symbol materiell: Oberfläche, Salz, Licht, Atem.",
  },
];

export default function WaterRoom() {
  return (
    <div className="relative overflow-hidden bg-[#02050b]">
      <WaterOpening />
      <MeaningLayers />
      <HebrewReveal />
      <SymbolJourney />
      <ReflectionRoom />
    </div>
  );
}

function WaterOpening() {
  return (
    <section className="relative flex min-h-screen items-end overflow-hidden px-5 pb-16 pt-32 sm:px-8 lg:px-14">
      <Image
        src="/Visuals/wasser_cinema_hero.png"
        alt="Dunkler cineastischer Wasserraum"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-[0.86]"
      />
      <Image
        src="/Visuals/wasser_interface_backround.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="sacred-drift object-cover opacity-[0.18] mix-blend-screen"
      />

      <div className="light-pulse absolute inset-0 bg-[radial-gradient(circle_at_46%_24%,rgba(216,184,116,0.16),transparent_24%),radial-gradient(circle_at_70%_66%,rgba(73,154,180,0.14),transparent_30%)] mix-blend-screen" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,12,0.42),rgba(2,5,12,0.16)_36%,rgba(2,5,12,0.94))]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(1,3,8,0.9),rgba(1,3,8,0.2)_52%,rgba(1,3,8,0.8))]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_32%,rgba(0,0,0,0.58)_78%,rgba(0,0,0,0.9)_100%)]" />
      <div className="absolute inset-x-[8%] top-[48%] h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent" />

      <div className="symbol-fade-in relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10 lg:grid lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
        <div>
          <p className="text-[10px] uppercase tracking-[0.52em] text-gold/75">
            Raum / Wasser
          </p>
          <h1 className="symbol-breathe mt-7 font-serif text-[clamp(7rem,24vw,19rem)] leading-[0.78] text-gold/90 drop-shadow-[0_0_30px_rgba(189,160,109,0.14)]">
            מים
          </h1>
        </div>

        <div className="max-w-2xl pb-4">
          <p className="text-[11px] uppercase tracking-[0.44em] text-[#7fb8c9]/80">
            Majim · Wasser
          </p>
          <p className="mt-7 font-serif text-2xl leading-relaxed text-[#ddd4c2]/82 sm:text-3xl">
            Wasser trägt und bedroht. Es ist Anfang, Tiefe und neue Geburt.
          </p>
          <a
            href="#tiefe"
            className="mt-12 inline-flex items-center gap-4 border border-gold/25 bg-black/[0.22] px-5 py-4 text-[10px] uppercase tracking-[0.34em] text-[#f2deae] backdrop-blur-md transition-colors duration-1000 hover:border-gold/40 hover:bg-gold/[0.055]"
          >
            In die Tiefe gehen
            <span className="h-px w-10 bg-gold/55" />
          </a>
        </div>
      </div>
    </section>
  );
}

function MeaningLayers() {
  return (
    <section id="tiefe" className="relative px-5 py-28 sm:px-8 lg:px-14">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      <div className="mx-auto max-w-6xl">
        <p className="text-[10px] uppercase tracking-[0.46em] text-gold/70">
          Bedeutungs-Ebenen
        </p>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {MEANING_LAYERS.map((layer) => (
            <article
              key={layer.title}
              className="scroll-reveal min-h-80 border border-white/10 bg-[#03060d]/[0.72] p-7 backdrop-blur-md transition-colors duration-1000 hover:border-gold/20 hover:bg-white/[0.028]"
            >
              <div className="mb-12 h-px w-24 bg-gradient-to-r from-gold/60 via-[#7fb8c9]/35 to-transparent" />
              <h2 className="font-serif text-4xl italic text-foreground-strong">
                {layer.title}
              </h2>
              <p className="mt-5 text-[10px] uppercase tracking-[0.3em] text-[#7fb8c9]/64">
                {layer.terms}
              </p>
              <p className="mt-8 font-serif text-lg leading-relaxed text-[#d8d1c2]/72">
                {layer.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HebrewReveal() {
  return (
    <section className="relative px-5 py-32 sm:px-8 lg:px-14">
      <div className="absolute left-1/2 top-1/2 h-[44rem] w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(189,160,109,0.1),transparent_62%)]" />
      <div className="relative mx-auto max-w-5xl">
        <p className="text-center text-[10px] uppercase tracking-[0.48em] text-gold/70">
          Hebräische Buchstaben-Offenbarung
        </p>
        <div className="mt-18 grid gap-8 md:grid-cols-3">
          {HEBREW_LETTERS.map((item, index) => (
            <article
              key={item.letter}
              className="scroll-reveal min-h-[28rem] border border-gold/15 bg-[#03050b]/[0.86] p-8 text-center backdrop-blur-md"
              style={{ animationDelay: `${index * 140}ms` }}
            >
              <div className="mx-auto mb-12 h-px w-16 bg-gold/45" />
              <p className="symbol-breathe font-serif text-[8rem] leading-none text-gold/90 sm:text-[10rem]">
                {item.letter}
              </p>
              <h3 className="mt-10 text-[10px] uppercase tracking-[0.42em] text-[#7fb8c9]/70">
                {item.title}
              </h3>
              <p className="mx-auto mt-8 max-w-xs font-serif text-xl leading-relaxed text-[#d8d1c2]/72">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SymbolJourney() {
  return (
    <section className="relative px-5 py-24 sm:px-8 lg:px-14">
      <div className="mx-auto max-w-6xl">
        <p className="text-[10px] uppercase tracking-[0.46em] text-gold/70">
          Symbolreise
        </p>
        <div className="mt-14 grid gap-20">
          {JOURNEY_PANELS.map((panel, index) => (
            <article
              key={panel.src}
              className={`scroll-reveal grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center ${
                index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div className="relative min-h-[25rem] overflow-hidden border border-white/10 bg-black/25 shadow-2xl shadow-black/40 sm:min-h-[34rem] lg:min-h-[40rem]">
                <Image
                  src={panel.src}
                  alt={panel.title}
                  fill
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="sacred-drift object-cover"
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_34%,rgba(107,195,217,0.16),transparent_28%),linear-gradient(180deg,rgba(2,5,12,0.08),rgba(2,5,12,0.58)_72%,rgba(2,5,12,0.9))]" />
                <div className="absolute inset-x-8 bottom-8 h-px bg-gradient-to-r from-gold/45 to-transparent" />
              </div>
              <div className="max-w-xl lg:px-4">
                <p className="text-[10px] uppercase tracking-[0.42em] text-[#7fb8c9]/72">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-6 font-serif text-4xl italic leading-tight text-foreground-strong sm:text-6xl">
                  {panel.title}
                </h2>
                <p className="mt-8 font-serif text-xl leading-relaxed text-[#d8d1c2]/72 sm:text-2xl">
                  {panel.text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReflectionRoom() {
  return (
    <section className="relative px-5 pb-32 pt-24 sm:px-8 lg:px-14">
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-[#7fb8c9]/18 to-transparent" />
      <div className="relative mx-auto max-w-4xl border-y border-gold/15 py-16 text-center">
        <p className="text-[10px] uppercase tracking-[0.46em] text-gold/70">
          Reflexionsraum
        </p>
        <h2 className="mx-auto mt-8 max-w-3xl font-serif text-4xl italic leading-tight text-foreground-strong sm:text-6xl">
          Wo begegnet dir Wasser gerade in deinem Leben?
        </h2>
        <textarea
          aria-label="Reflexion zum Wasserraum"
          placeholder="Still notieren..."
          className="mt-12 min-h-52 w-full resize-y border border-white/10 bg-[#03060d]/[0.76] p-6 font-serif text-xl leading-relaxed text-[#f5f1e8] outline-none backdrop-blur-md transition-colors duration-1000 placeholder:text-[#d8d1c2]/[0.34] focus:border-gold/35 focus:bg-white/[0.035]"
        />
      </div>
    </section>
  );
}
