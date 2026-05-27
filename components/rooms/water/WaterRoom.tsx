"use client";

import Image from "next/image";
import { useState } from "react";
import {
  parseStoredReflections,
  REFLECTION_STORAGE_KEY,
  WATER_REFLECTION_QUESTION,
  type StoredReflection,
} from "@/lib/reflections";

const MEANING_LAYERS = [
  {
    title: "Biblisch",
    terms: "Urflut · Schöpfung · Exodus · Taufe",
    text: "Wasser steht am Anfang, bevor etwas fest wird. Es trägt Leben, aber es markiert auch die Grenze: Wer hindurchgeht, kommt nicht unverändert zurück.",
  },
  {
    title: "Hebräisch",
    terms: "מים · מ י ם",
    text: "Majim klingt wie ein Wort aus Bewegung. Man kann vorsichtig sagen: Es hält offene Tiefe, einen kleinen Anfang und eine verborgene Tiefe zusammen.",
  },
  {
    title: "Persönlich",
    terms: "Tiefe · Reinigung · Übergang · neues Leben",
    text: "Wasser fragt nicht nach deiner Erklärung. Es berührt, was schwer geworden ist, und erinnert dich daran, dass Wandlung oft leise beginnt.",
  },
];

const HEBREW_LETTERS = [
  {
    letter: "מ",
    title: "Mem",
    text: "Mem wird traditionell mit Wasser verbunden. Es öffnet den Blick auf Tiefe, Herkunft und das noch Ungeformte.",
  },
  {
    letter: "י",
    title: "Jod",
    text: "Jod ist klein und doch nicht leer. Es kann an den ersten Punkt erinnern, an den leisen Beginn einer Bewegung.",
  },
  {
    letter: "ם",
    title: "Finales Mem",
    text: "Das finale Mem schließt die Form. Die Tiefe verschwindet nicht; sie wird zu einem inneren Raum.",
  },
];

const JOURNEY_PANELS = [
  {
    src: "/Visuals/wasser_tiefenbild.png",
    title: "Die Tiefe",
    text: "Unter der Oberfläche beginnt der Bereich, in dem Worte langsamer werden. Wasser zeigt nicht alles, aber es bewahrt, was noch nicht ausgesprochen ist.",
  },
  {
    src: "/Visuals/wasser_szenenbild.png",
    title: "Der Übergang",
    text: "Im Exodus ist Wasser nicht Dekoration, sondern Schwelle. Hinter dir liegt Enge, vor dir ein Weg, der erst im Gehen sichtbar wird.",
  },
  {
    src: "/Visuals/wasser_hebr_symbl.png",
    title: "Die lebendige Schrift",
    text: "מים ist kein Code, den man besitzt. Die Buchstaben laden ein, vorsichtig zu schauen: offene Tiefe, kleiner Anfang, gesammelte Verborgenheit.",
  },
  {
    src: "/Visuals/wasser_karte.png",
    title: "Die Ordnung",
    text: "Taufe und Reinigung erzählen von einem Durchgang. Nicht alles Alte wird verachtet; manches wird abgewaschen, damit das Lebendige wieder atmen kann.",
  },
  {
    src: "/Visuals/wasser_makro.png",
    title: "Die Spur im Stofflichen",
    text: "Der Geist über den Wassern ist kein lauter Eingriff. Eher ein Schweben, ein Atem über dem Noch-Nicht, eine zarte Ordnung vor dem ersten Wort.",
  },
];

export default function WaterRoom() {
  return (
    <div className="symbol-page water-room bg-[#02050b]">
      <WaterOpening />
      <WaterGlyphChamber />
      <MeaningLayers />
      <HebrewReveal />
      <SymbolJourney />
      <ReflectionRoom />
    </div>
  );
}

function WaterOpening() {
  return (
    <section className="symbol-section water-chamber relative flex min-h-screen items-end overflow-hidden pb-24 pt-40 md:pt-36">
      <Image
        src="/Visuals/wasser_cinema_hero.png"
        alt="Dunkler cineastischer Wasserraum"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-[0.78]"
      />
      <Image
        src="/Visuals/wasser_interface_backround.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="sacred-drift object-cover opacity-[0.18] mix-blend-screen"
      />

      <div className="light-pulse absolute inset-0 bg-[radial-gradient(circle_at_46%_24%,rgba(216,184,116,0.12),transparent_26%),radial-gradient(circle_at_70%_66%,rgba(73,154,180,0.11),transparent_32%)] mix-blend-screen" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,12,0.5),rgba(2,5,12,0.24)_36%,rgba(2,5,12,0.94))]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(1,3,8,0.9),rgba(1,3,8,0.2)_52%,rgba(1,3,8,0.8))]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_32%,rgba(0,0,0,0.58)_78%,rgba(0,0,0,0.9)_100%)]" />
      <div className="absolute inset-x-[8%] top-[48%] h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent" />

      <div className="symbol-fade-in relative z-10 mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-16 lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-end">
        <div className="min-w-0">
          <p className="symbol-kicker">
            Raum / Wasser
          </p>
          <h1 className="symbol-breathe mt-7 max-w-full overflow-hidden font-serif text-[clamp(5rem,24vw,19rem)] leading-[0.78] text-gold/90 drop-shadow-[0_0_30px_rgba(189,160,109,0.14)]">
            מים
          </h1>
        </div>

        <div className="max-w-[20rem] min-w-0 pb-4 sm:max-w-2xl">
          <p className="symbol-kicker text-cyan-soft">
            Majim · Wasser
          </p>
          <p className="symbol-copy mt-7 text-lg sm:text-3xl">
            Wasser ist Anfang und Schwelle. Es trägt, trennt, reinigt und ruft in einen Raum, den man nicht trocken durchquert.
          </p>
          <a
            href="#tiefe"
            className="symbol-cta mt-14 gap-4"
          >
            In die Tiefe gehen
            <span className="h-px w-10 bg-gold/[0.42]" />
          </a>
        </div>
      </div>
    </section>
  );
}

function WaterGlyphChamber() {
  return (
    <section className="symbol-section water-chamber water-glyph-chamber relative grid min-h-screen place-items-center overflow-hidden py-32">
      <div className="water-chamber-breath absolute left-1/2 top-1/2 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full" />
      <div className="absolute inset-x-[18%] top-1/2 h-px bg-gradient-to-r from-transparent via-gold/[0.16] to-transparent" />
      <div className="relative text-center">
        <p className="symbol-breathe font-serif text-[clamp(8rem,32vw,24rem)] leading-none text-gold/85">
          מים
        </p>
      </div>
    </section>
  );
}

function MeaningLayers() {
  return (
    <section id="tiefe" className="symbol-section water-chamber relative py-24 md:py-32">
      <div className="pointer-events-none absolute inset-x-[10%] top-0 h-px bg-gradient-to-r from-transparent via-gold/[0.08] to-transparent" />
      <div className="mx-auto max-w-5xl">
        <p className="symbol-kicker text-center md:text-left">
          Bedeutungs-Ebenen
        </p>
        <div className="mt-16 grid gap-24 md:gap-32">
          {MEANING_LAYERS.map((layer) => (
            <article
              key={layer.title}
              className="scroll-reveal water-statement relative grid min-h-[72svh] content-center border-y border-white/[0.035] py-20 md:min-h-[78vh] md:py-28"
            >
              <div className="water-chamber-breath absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-55" />
              <div className="relative mx-auto max-w-3xl text-center">
                <p className="symbol-kicker text-cyan-soft">
                  {layer.terms}
                </p>
                <h2 className="mt-9 font-serif text-5xl italic leading-tight text-foreground-strong sm:text-7xl">
                  {layer.title}
                </h2>
                <p className="symbol-copy mx-auto mt-12 max-w-2xl text-xl italic sm:text-3xl">
                  {layer.text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HebrewReveal() {
  return (
    <section className="symbol-section water-chamber relative py-24 md:py-32">
      <div className="absolute left-1/2 top-1/2 h-[44rem] w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(189,160,109,0.07),transparent_62%)]" />
      <div className="relative mx-auto max-w-4xl">
        <p className="symbol-kicker text-center">
          Hebräische Buchstaben
        </p>
        <div className="mt-16 grid gap-20 md:gap-28">
          {HEBREW_LETTERS.map((item, index) => (
            <article
              key={item.letter}
              className="scroll-reveal water-letter-station relative grid min-h-[76svh] place-items-center border-y border-gold/[0.055] py-20 text-center md:min-h-[82vh]"
              style={{ animationDelay: `${index * 140}ms` }}
            >
              <div className="water-chamber-breath absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-45" />
              <div className="relative">
                <p className="symbol-breathe font-serif text-[11rem] leading-none text-gold/88 sm:text-[16rem]">
                  {item.letter}
                </p>
                <h3 className="symbol-kicker mt-10 text-cyan-soft">
                  {item.title}
                </h3>
                <p className="symbol-copy mx-auto mt-10 max-w-xl text-xl italic sm:text-2xl">
                  {item.text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SymbolJourney() {
  return (
    <section className="symbol-section water-chamber relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <p className="symbol-kicker text-center md:text-left">
          Symbolreise
        </p>
        <div className="mt-16 grid gap-32 md:gap-44">
          {JOURNEY_PANELS.map((panel, index) => (
            <article
              key={panel.src}
              className="scroll-reveal water-journey-station relative grid min-h-[88svh] items-end overflow-hidden py-10 md:min-h-screen md:py-16"
            >
              <div className="absolute inset-0 shadow-[0_34px_120px_rgba(0,0,0,0.34)]">
                <Image
                  src={panel.src}
                  alt={panel.title}
                  fill
                  sizes="100vw"
                  className="sacred-drift object-cover opacity-[0.74]"
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_34%,rgba(107,195,217,0.14),transparent_30%),linear-gradient(180deg,rgba(2,5,12,0.18),rgba(2,5,12,0.7)_70%,rgba(2,5,12,0.96))]" />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(1,3,8,0.82),rgba(1,3,8,0.22)_54%,rgba(1,3,8,0.72))]" />
              </div>
              <div className={`relative max-w-2xl pb-8 ${index % 2 === 1 ? "md:ml-auto" : ""}`}>
                <p className="symbol-kicker text-cyan-soft">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-7 font-serif text-5xl italic leading-tight text-foreground-strong sm:text-7xl">
                  {panel.title}
                </h2>
                <p className="symbol-copy mt-10 text-xl italic sm:text-3xl">
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
  const [answer, setAnswer] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "empty">("idle");

  const handleSave = () => {
    const trimmedAnswer = answer.trim();

    if (!trimmedAnswer) {
      setSaveStatus("empty");
      return;
    }

    const savedReflections = parseStoredReflections(
      window.localStorage.getItem(REFLECTION_STORAGE_KEY)
    );
    const reflection: StoredReflection = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}`,
      symbol: "Wasser",
      hebrew: "מים",
      question: WATER_REFLECTION_QUESTION,
      answer: trimmedAnswer,
      createdAt: new Date().toISOString(),
    };

    window.localStorage.setItem(
      REFLECTION_STORAGE_KEY,
      JSON.stringify([reflection, ...savedReflections])
    );

    setAnswer("");
    setSaveStatus("saved");
  };

  return (
    <section className="symbol-section water-chamber relative min-h-screen pb-40 pt-32">
      <div className="absolute inset-x-[10%] top-1/2 h-px bg-gradient-to-r from-transparent via-[#7fb8c9]/[0.12] to-transparent" />
      <div className="relative mx-auto max-w-4xl border-y border-gold/[0.08] py-20 text-center">
        <p className="symbol-kicker">
          Reflexionsraum
        </p>
        <h2 className="mx-auto mt-8 max-w-3xl font-serif text-4xl italic leading-tight text-foreground-strong sm:text-6xl">
          Was in dir steht an einer Schwelle?
        </h2>
        <p className="symbol-copy mx-auto mt-7 max-w-2xl text-lg sm:text-xl">
          Wo braucht es Reinigung, ohne Härte? Wo darf etwas Altes loslassen, damit ein neuer Weg entstehen kann?
        </p>
        <textarea
          aria-label="Reflexion zum Wasserraum"
          placeholder="Still notieren..."
          value={answer}
          onChange={(event) => {
            setAnswer(event.target.value);
            setSaveStatus("idle");
          }}
          className="symbol-reflection-field mt-14 min-h-52 w-full resize-y p-6 font-serif text-xl leading-relaxed"
        />
        <div className="mt-5 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="symbol-copy text-left text-sm sm:text-base">
            Deine Reflexion bleibt nur auf diesem Gerät gespeichert.
          </p>
          <button
            type="button"
            onClick={handleSave}
            className="symbol-cta shrink-0"
          >
            Reflexion speichern
          </button>
        </div>
        <p className="symbol-copy mt-5 min-h-7 text-sm text-cyan-soft" aria-live="polite">
          {saveStatus === "saved"
            ? "Gespeichert. Du findest den Gedanken unter Mein Pfad."
            : saveStatus === "empty"
              ? "Schreibe zuerst eine kurze Reflexion."
              : ""}
        </p>
      </div>
    </section>
  );
}
