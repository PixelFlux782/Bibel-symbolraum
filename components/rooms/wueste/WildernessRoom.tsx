"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { RoomPersonalTraceCard } from "@/components/rooms/engine/RoomPersonalTraceCard";
import { recordRoomVisitForRoute } from "@/lib/pathActivity";
import type { RoomContext } from "@/lib/rooms/roomContext";
import { getSymbolPathConfig } from "@/lib/symbols/symbolPathConfig";
import { visualAssets } from "@/lib/visualAssets";

type WildernessRoomProps = {
  initialStateId?: string;
  roomContext?: RoomContext;
};

type WildernessThreshold = {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  text: string;
  revelation?: string;
  image: string;
  alt: string;
};

const thresholds: WildernessThreshold[] = [
  {
    id: "leere",
    label: "Leere",
    eyebrow: "Entzug",
    title: "Wüste beginnt dort, wo nichts mehr antwortet.",
    text: "Der Raum ist weit. Besitz, Lärm und Gewohnheit verlieren ihre Stimme.",
    revelation: "Nicht jede Leere ist Verlassenheit. Manche Leere macht hörbar.",
    image: visualAssets.wuesteHero,
    alt: "Dunkler Wüstenraum in Nachtblau mit trockenem Goldhorizont",
  },
  {
    id: "herausgefuehrt",
    label: "Herausgeführt",
    eyebrow: "Exodus",
    title: "Die Wüste beginnt nach der Befreiung.",
    text: "Israel kommt nicht zufällig in eine Landschaft. Es wird herausgeführt und steht zuerst nicht im Ziel.",
    revelation: "Freiheit beginnt oft als Wüste.",
    image: visualAssets.wuestePath,
    alt: "Feine Wegspur in einer dunklen trockenen Weite",
  },
  {
    id: "midbar",
    label: "Midbar",
    eyebrow: "מִדְבָּר / Midbar",
    title: "Ein Ort der Leere. Und doch klingt darin: dabar.",
    text: "Midbar ist kein Lexikonwort. Es wird zum Raum, in dem Zeichen aus Staub und Stille hervortreten.",
    revelation: "Die Wüste ist der Ort, an dem Wort in der Leere hörbar wird.",
    image: visualAssets.wuesteHebrew,
    alt: "Hebräische Zeichen aus Sand und Licht in einem dunklen Archivraum",
  },
  {
    id: "pruefung",
    label: "Prüfung",
    eyebrow: "Formung",
    title: "Die Wüste fragt nicht: Was besitzt du?",
    text: "Sie fragt: Wovon lebst du, wenn nichts dich ablenkt?",
    revelation: "In der Wüste wird sichtbar, ob Freiheit schon Vertrauen geworden ist.",
    image: visualAssets.wuesteDust,
    alt: "Weite trockene Fläche mit feinem Staub und kaum sichtbarer Wegspur",
  },
  {
    id: "manna",
    label: "Manna",
    eyebrow: "Tägliches Brot",
    title: "Manna ist Nahrung, die man nicht lagern kann.",
    text: "Es erscheint fein, überraschend und im Tagesmaß. Keine Vorratsmacht, keine Kontrolle.",
    revelation: "Das Brot der Wüste lehrt: Heute reicht.",
    image: visualAssets.brotManna,
    alt: "Helle Lichtkörner wie Tau auf dunklem Boden",
  },
  {
    id: "stimme",
    label: "Stimme",
    eyebrow: "Hörraum",
    title: "In der Wüste wird das Wort nicht lauter.",
    text: "Der Mensch wird leiser. Staub legt sich, und eine Linie von Stimme trägt durch den offenen Raum.",
    revelation: "Wo nichts mehr trägt, kann Stimme tragen.",
    image: visualAssets.archivHero,
    alt: "Stiller dunkler Archivraum mit fernen Zeichen und warmer Lichtlinie",
  },
  {
    id: "brot",
    label: "Brot / Heimat",
    eyebrow: "Gabe",
    title: "Die Wüste nimmt, damit der Mensch empfangen lernt.",
    text: "Aus den Lichtkörnern wird ein ruhiges Zeichen: Nahrung, Wort und Leben.",
    revelation: "Wer in der Wüste Brot empfängt, lernt Leben als Gabe.",
    image: visualAssets.brotHero,
    alt: "Sakrales Brotsymbol aus warmem Licht und stillen Körnern",
  },
];

const stateToThreshold: Record<string, string> = {
  emptiness: "leere",
  testing: "pruefung",
  guidance: "herausgefuehrt",
  voice: "stimme",
  midbar: "midbar",
  manna: "manna",
};

const midbarLetters = [
  {
    glyph: "\u05de",
    name: "Mem",
    mode: "mem",
    note: "Die Tiefe geht mit. Auch in der Trockenheit.",
    detail: "Tiefe, Wasser, Ursprung, das Umhüllende.",
  },
  {
    glyph: "\u05d3",
    name: "Dalet",
    mode: "dalet",
    note: "Die Wüste ist eine Tür, nicht nur ein Ende.",
    detail: "Tür, Schwelle, Durchgang.",
  },
  {
    glyph: "\u05d1",
    name: "Bet",
    mode: "bet",
    note: "Im Nichts kann ein inneres Haus entstehen.",
    detail: "Haus, Innenraum, Wohnung.",
  },
  {
    glyph: "\u05e8",
    name: "Resch",
    mode: "resh",
    note: "Der Weg bekommt Richtung.",
    detail: "Haupt, Anfang, Ausrichtung.",
  },
] as const;

const archiveExits = [
  ["Wüste", "/codex/wueste"],
  ["Midbar", "/codex/midbar"],
  ["Exodus", "/codex/exodus-14"],
  ["Manna", "/codex/manna"],
  ["Deuteronomium 8", "/codex/deuteronomy-8"],
  ["Versuchung", "/codex/matthew-4"],
  ["Stimme", "/codex/qol"],
  ["Weg", "/codex/wandlung"],
  ["Brot", "/codex/brot"],
] as const;

const exodusMovement = ["heraus", "hindurch", "leer", "geführt"];
const testingWords = ["Hunger", "Durst", "Ungeduld", "Angst", "Kontrolle", "Vertrauen"];
const mannaMovement = ["Hunger", "Empfang", "Maß", "Vertrauen"];
const voiceEchoes = ["Mose", "Sinai", "Propheten", "Jesus", "Stille", "Gehorsam", "Weg"];

export default function WildernessRoom({ initialStateId, roomContext }: WildernessRoomProps) {
  const initialId = stateToThreshold[initialStateId ?? ""] ?? initialStateId;
  const initialIndex = Math.max(0, thresholds.findIndex((item) => item.id === initialId));
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [letterMode, setLetterMode] = useState<(typeof midbarLetters)[number]["mode"]>("mem");
  const active = thresholds[activeIndex];
  const activeLetter = midbarLetters.find((letter) => letter.mode === letterMode) ?? midbarLetters[0];
  const symbolPath = useMemo(() => getSymbolPathConfig("wueste"), []);

  useEffect(() => {
    recordRoomVisitForRoute({
      symbolId: "wueste",
      roomHref: symbolPath?.roomHref ?? "/raeume/wueste",
      routeKey: "room:wueste",
    });
  }, [symbolPath?.roomHref]);

  const selectThreshold = (index: number) => {
    const nextIndex = Math.max(0, Math.min(thresholds.length - 1, index));
    setActiveIndex(nextIndex);
    window.requestAnimationFrame(() => document.querySelector(".wilderness-way")?.scrollIntoView({ behavior: "smooth" }));
  };

  return (
    <main className={`wilderness-way wilderness-way--${active.id} wilderness-way--letter-${letterMode}`}>
      <div className="wilderness-way__scenes" aria-hidden="true">
        {thresholds.map((item, index) => (
          <div className={`wilderness-way__scene ${index === activeIndex ? "is-active" : ""}`} key={item.id}>
            <Image src={item.image} alt="" fill priority={index === 0} sizes="100vw" className="wilderness-way__image" />
          </div>
        ))}
      </div>
      <div className="wilderness-way__veil" aria-hidden="true" />
      <div className="wilderness-way__dust" aria-hidden="true" />
      <div className="wilderness-way__horizon" aria-hidden="true" />
      <div className="wilderness-way__path" aria-hidden="true" />
      <div className="wilderness-way__threshold" aria-hidden="true" />
      <div className="wilderness-way__grain" aria-hidden="true" />
      <div className="wilderness-way__voice-line" aria-hidden="true" />
      <div className="wilderness-way__bread-sign" aria-hidden="true" />

      <nav className="wilderness-way__navigation" aria-label="Sieben Schwellen des Wüsten-Raums">
        <p>Wüsten-Raum</p>
        <ol>
          {thresholds.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => selectThreshold(index)}
                className={index === activeIndex ? "is-active" : index < activeIndex ? "is-past" : ""}
                aria-current={index === activeIndex ? "step" : undefined}
                aria-label={`${index + 1}. ${item.label}`}
              >
                <span aria-hidden="true" />
                <b>{item.label}</b>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <section className="wilderness-way__moment" key={active.id} aria-live="polite">
        <p className="wilderness-way__counter">{String(activeIndex + 1).padStart(2, "0")} / 07 · {active.eyebrow}</p>

        {active.id === "midbar" ? (
          <div className="wilderness-way__word" aria-label="Die Buchstaben von Midbar">
            <p lang="he" dir="rtl">{"\u05de\u05b4\u05d3\u05b0\u05d1\u05b8\u05bc\u05e8"}</p>
            <div>
              {midbarLetters.map((letter) => (
                <button
                  type="button"
                  key={letter.name}
                  className={letterMode === letter.mode ? "is-active" : ""}
                  onClick={() => setLetterMode(letter.mode)}
                  onFocus={() => setLetterMode(letter.mode)}
                  aria-label={`${letter.name}: ${letter.note}`}
                >
                  <span lang="he" dir="rtl">{letter.glyph}</span>
                  <small>{letter.name}</small>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <h1>{active.title}</h1>
        <p className="wilderness-way__copy">{active.text}</p>
        {active.revelation ? <p className="wilderness-way__revelation">{active.revelation}</p> : null}

        {active.id === "herausgefuehrt" ? (
          <p className="wilderness-way__movement" aria-label="Bewegung des Exodus">
            {exodusMovement.map((word) => <span key={word}>{word}</span>)}
          </p>
        ) : null}

        {active.id === "midbar" ? (
          <p className="wilderness-way__letter-note">
            <strong>{activeLetter.note}</strong>
            <span>{activeLetter.detail}</span>
          </p>
        ) : null}

        {active.id === "pruefung" ? (
          <p className="wilderness-way__echoes" aria-label="Ferne Prüfungsworte">
            {testingWords.map((word) => <span key={word}>{word}</span>)}
          </p>
        ) : null}

        {active.id === "manna" ? (
          <p className="wilderness-way__movement" aria-label="Bewegung des Manna">
            {mannaMovement.map((word) => <span key={word}>{word}</span>)}
          </p>
        ) : null}

        {active.id === "stimme" ? (
          <p className="wilderness-way__echoes" aria-label="Ferne Offenbarungsspuren">
            {voiceEchoes.map((word) => <span key={word}>{word}</span>)}
          </p>
        ) : null}

        {active.id === "brot" ? (
          <div className="wilderness-way__exits">
            <Link href="/raeume/brot?from=journey&path=journey-wueste-brot&symbol=brot" className="wilderness-way__primary-exit">
              Brot als Gabe empfangen <span aria-hidden="true" />
            </Link>
            <div className="wilderness-way__codex-exits" aria-label="Leise Spuren zur Vertiefung">
              {archiveExits.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
            </div>
          </div>
        ) : (
          <button type="button" className="wilderness-way__continue" onClick={() => selectThreshold(activeIndex + 1)}>
            {activeIndex === 0 ? "In die Stille gehen" : "Weiter durch die Wüste"} <span aria-hidden="true" />
          </button>
        )}

        {activeIndex === 0 && roomContext ? (
          <Link className="wilderness-way__return" href={roomContext.returnHref}>
            {roomContext.mobileText} · {roomContext.returnLabel}
          </Link>
        ) : null}
      </section>

      <aside className="wilderness-way__trace">
        <RoomPersonalTraceCard symbolSlug="wueste" roomContext={roomContext} />
      </aside>
    </main>
  );
}
