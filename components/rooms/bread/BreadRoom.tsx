"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { RoomPersonalTraceCard } from "@/components/rooms/engine/RoomPersonalTraceCard";
import {
  FIRST_JOURNEY_SUMMARY_ROUTE,
  hasFirstJourneyCompleted,
} from "@/lib/firstJourneySummary";
import { recordActivatedLetter, recordRoomVisitForRoute } from "@/lib/pathActivity";
import type { RoomContext } from "@/lib/rooms/roomContext";
import { getSymbolPathConfig } from "@/lib/symbols/symbolPathConfig";
import { visualAssets } from "@/lib/visualAssets";

type BreadRoomProps = {
  initialStateId?: string;
  roomContext?: RoomContext;
};

type BreadThreshold = {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  text: string;
  revelation?: string;
  image: string;
  alt: string;
};

const thresholds: BreadThreshold[] = [
  {
    id: "hunger",
    label: "Hunger",
    eyebrow: "Bedürftigkeit",
    title: "Brot beginnt nicht beim Besitz.",
    text: "Nach der Wüste ist der Mensch leer, still und angewiesen. Er kommt nicht als Besitzer, sondern als Empfangender.",
    revelation: "Hunger ist nicht nur Mangel. Hunger zeigt, wovon der Mensch lebt.",
    image: visualAssets.brotGrain,
    alt: "Dunkler Steinboden mit kaum sichtbaren Brotkrumen und ferner warmer Lichtquelle",
  },
  {
    id: "gabe",
    label: "Gabe",
    eyebrow: "Manna",
    title: "Brot ist Gabe, bevor es Besitz ist.",
    text: "In die Leere fällt nicht Überfluss, sondern etwas Feines: genug, leise, täglich.",
    revelation: "Was Leben gibt, kommt nicht zuerst aus der Hand des Menschen.",
    image: visualAssets.brotManna,
    alt: "Feine helle Lichtkörner wie Tau auf dunklem Boden",
  },
  {
    id: "lechem",
    label: "Lechem",
    eyebrow: "לֶחֶם / Lechem",
    title: "Ein einfaches Wort trägt Hunger, Gabe, Ringen und Leben.",
    text: "Lechem ist kein Lexikon im Raum. Die Buchstaben werden zu einem Körper aus Korn, Wasser, Feuer und Wort.",
    revelation: "Brot ist nicht nur weich. Brot steht im Ringen ums Leben.",
    image: visualAssets.archivHero,
    alt: "Sakraler Archivraum mit hebräischen Zeichen und warmem Licht",
  },
  {
    id: "tagesmass",
    label: "Tagesmaß",
    eyebrow: "Heute",
    title: "Heute reicht.",
    text: "Das tägliche Brot ist kein Besitz für immer. Es ist Vertrauen für heute.",
    revelation: "Was ich brauche, darf ich empfangen. Was ich empfange, muss ich nicht festhalten wie einen Gott.",
    image: visualAssets.brotDew,
    alt: "Reduzierte Lichtkörner in einem dunklen Raum als Bild für Tagesmaß",
  },
  {
    id: "teilen",
    label: "Teilen",
    eyebrow: "Brechen",
    title: "Brot, das gebrochen wird, wird Gemeinschaft.",
    text: "Brot erfüllt sich nicht im Festhalten. Im Brechen wird Gabe sichtbar, und die Mitte wird teilbar.",
    revelation: "Ich empfange nicht nur für mich.",
    image: visualAssets.brotPath,
    alt: "Warme Lichtspuren und Krumen in einem dunklen Tischraum",
  },
  {
    id: "wort",
    label: "Wort",
    eyebrow: "Leben",
    title: "Der Mensch lebt nicht vom Brot allein.",
    text: "Brot nährt den Leib. Das Wort nährt den Weg. Im Einfachen öffnet sich das Geheimnis des Lebens.",
    revelation: "Brot wird Zeichen, wenn es auf das Leben verweist.",
    image: visualAssets.lichtCinema,
    alt: "Tiefe blaue Lichtachse mit warmen goldenen Reflexen",
  },
  {
    id: "tisch",
    label: "Tisch",
    eyebrow: "Rückkehr",
    title: "Brot sammelt die Reise und macht sie teilbar.",
    text: "Was aus der Tiefe kam, was sichtbar wurde, was geprüft wurde und was in der Wüste empfangen wurde, liegt nun als Brot in der Mitte.",
    revelation: "Am Tisch wird Gabe zu neuer Gemeinschaft.",
    image: visualAssets.brotHero,
    alt: "Sakrales Brotsymbol aus warmem Licht in einem dunklen Raum",
  },
];

const stateToThreshold: Record<string, string> = {
  grain: "hunger",
  manna: "gabe",
  breaking: "teilen",
  "bread-of-life": "wort",
};

const lechemLetters = [
  {
    glyph: "ל",
    name: "Lamed",
    mode: "lamed",
    letterId: "lamed",
    note: "Brot lehrt den Menschen, woher Leben kommt.",
    detail: "Stab, Lernen, Richtung: das Herz wird geführt.",
  },
  {
    glyph: "ח",
    name: "Chet",
    mode: "chet",
    letterId: "chet",
    note: "Brot schafft einen Innenraum, in dem Leben wohnen kann.",
    detail: "Zaun, Grenze, Schutz: Gabe wird bewohnbarer Raum.",
  },
  {
    glyph: "ם",
    name: "Mem",
    mode: "mem",
    letterId: "mem",
    note: "Auch im Brot bleibt die Tiefe des Wassers verborgen.",
    detail: "Wasser, Tiefe, Mutterraum: das Umhüllende bleibt im Brotlicht.",
  },
] as const;

const dailyMovement = ["Manna", "Tagesmaß", "Vertrauen", "Dank"];
const giftMovement = ["leer", "empfangen", "danken", "leben"];
const tableEchoes = ["Wasser", "Licht", "Feuer", "Wüste", "Brot"];
const sharingEchoes = ["Abraham", "Manna", "Viele", "Emmaus", "Tisch"];
const wordEchoes = ["Manna", "Tora", "tägliches Brot", "Brot des Lebens", "Wort", "Leib", "Leben"];

const archiveExits = [
  ["Brot", "/codex/brot"],
  ["Lechem", "/codex/lechem"],
  ["Manna", "/codex/manna"],
  ["Tägliches Brot", "/codex/deuteronomy-8-3"],
  ["Brot vom Himmel", "/codex/brot-vom-himmel"],
  ["Gabe", "/codex/gabe"],
  ["Nahrung", "/codex/nahrung"],
  ["Teilen", "/codex/teilen"],
  ["Wort", "/codex/wort"],
  ["Leben", "/codex/leben"],
] as const;

export default function BreadRoom({ initialStateId, roomContext }: BreadRoomProps) {
  const initialId = stateToThreshold[initialStateId ?? ""] ?? initialStateId;
  const initialIndex = Math.max(0, thresholds.findIndex((item) => item.id === initialId));
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [letterMode, setLetterMode] = useState<(typeof lechemLetters)[number]["mode"]>("lamed");
  const [isJourneyComplete, setIsJourneyComplete] = useState(false);
  const active = thresholds[activeIndex];
  const activeLetter = lechemLetters.find((letter) => letter.mode === letterMode) ?? lechemLetters[0];
  const symbolPath = useMemo(() => getSymbolPathConfig("brot"), []);

  useEffect(() => {
    recordRoomVisitForRoute({
      symbolId: "brot",
      roomHref: symbolPath?.roomHref ?? "/raeume/brot",
      routeKey: "room:brot",
    });
    window.queueMicrotask(() => setIsJourneyComplete(hasFirstJourneyCompleted()));
  }, [symbolPath?.roomHref]);

  const selectThreshold = (index: number) => {
    const nextIndex = Math.max(0, Math.min(thresholds.length - 1, index));
    setActiveIndex(nextIndex);
    window.requestAnimationFrame(() => document.querySelector(".bread-sanctum")?.scrollIntoView({ behavior: "smooth" }));
  };

  const selectLetter = (mode: (typeof lechemLetters)[number]["mode"]) => {
    const nextLetter = lechemLetters.find((letter) => letter.mode === mode);

    setLetterMode(mode);
    if (nextLetter) {
      recordActivatedLetter({ letterId: nextLetter.letterId, symbolId: "brot", pathId: "lechem" });
    }
  };

  return (
    <main className={`bread-sanctum bread-sanctum--${active.id} bread-sanctum--letter-${letterMode}`}>
      <div className="bread-sanctum__scenes" aria-hidden="true">
        {thresholds.map((item, index) => (
          <div className={`bread-sanctum__scene ${index === activeIndex ? "is-active" : ""}`} key={item.id}>
            <Image src={item.image} alt="" fill priority={index === 0} sizes="100vw" className="bread-sanctum__image" />
          </div>
        ))}
      </div>
      <div className="bread-sanctum__veil" aria-hidden="true" />
      <div className="bread-sanctum__dust" aria-hidden="true" />
      <div className="bread-sanctum__grain" aria-hidden="true" />
      <div className="bread-sanctum__table" aria-hidden="true" />
      <div className="bread-sanctum__loaf" aria-hidden="true" />
      <div className="bread-sanctum__word-light" aria-hidden="true" />
      <div className="bread-sanctum__water-memory" aria-hidden="true" />

      <nav className="bread-sanctum__navigation" aria-label="Sieben Schwellen des Brot-Raums">
        <p>Brot-Raum</p>
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

      <section className="bread-sanctum__moment" key={active.id} aria-live="polite">
        <p className="bread-sanctum__counter">{String(activeIndex + 1).padStart(2, "0")} / 07 · {active.eyebrow}</p>

        {active.id === "lechem" ? (
          <div className="bread-sanctum__word" aria-label="Die Buchstaben von Lechem">
            <p lang="he" dir="rtl">לֶחֶם</p>
            <div>
              {lechemLetters.map((letter) => (
                <button
                  type="button"
                  key={letter.name}
                  className={letterMode === letter.mode ? "is-active" : ""}
                  onClick={() => selectLetter(letter.mode)}
                  onFocus={() => selectLetter(letter.mode)}
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
        <p className="bread-sanctum__copy">{active.text}</p>
        {active.revelation ? <p className="bread-sanctum__revelation">{active.revelation}</p> : null}

        {active.id === "gabe" ? (
          <p className="bread-sanctum__movement" aria-label="Bewegung der Gabe">
            {giftMovement.map((word) => <span key={word}>{word}</span>)}
          </p>
        ) : null}

        {active.id === "lechem" ? (
          <p className="bread-sanctum__letter-note">
            <strong>{activeLetter.note}</strong>
            <span>{activeLetter.detail}</span>
          </p>
        ) : null}

        {active.id === "tagesmass" ? (
          <p className="bread-sanctum__movement" aria-label="Bewegung des Tagesmaßes">
            {dailyMovement.map((word) => <span key={word}>{word}</span>)}
          </p>
        ) : null}

        {active.id === "teilen" ? (
          <p className="bread-sanctum__echoes" aria-label="Ferne Spuren des Teilens">
            {sharingEchoes.map((word) => <span key={word}>{word}</span>)}
          </p>
        ) : null}

        {active.id === "wort" ? (
          <p className="bread-sanctum__echoes" aria-label="Ferne Spuren von Wort und Leben">
            {wordEchoes.map((word) => <span key={word}>{word}</span>)}
          </p>
        ) : null}

        {active.id === "tisch" ? (
          <div className="bread-sanctum__exits">
            <p className="bread-sanctum__echoes" aria-label="Gesammelte Reise">
              {tableEchoes.map((word) => <span key={word}>{word}</span>)}
            </p>
            <p className="bread-sanctum__return-note">Was empfangen wurde, kehrt als Verbindung zurück.</p>
            <Link href={symbolPath?.symbolNetworkHref ?? "/symbolnetz?symbol=brot"} className="bread-sanctum__primary-exit">
              Brot im Symbolnetz wiedersehen <span aria-hidden="true" />
            </Link>
            {isJourneyComplete ? (
              <Link href={FIRST_JOURNEY_SUMMARY_ROUTE} className="bread-sanctum__primary-exit bread-sanctum__primary-exit--summary">
                Von der Tiefe zum Brot schauen <span aria-hidden="true" />
              </Link>
            ) : (
              <p className="bread-sanctum__summary-hint">
                Wenn der Weg vollständig gegangen ist, öffnet sich die Zusammenschau.
              </p>
            )}
            <div className="bread-sanctum__codex-exits" aria-label="Leise Spuren zur Vertiefung">
              {archiveExits.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
            </div>
          </div>
        ) : (
          <button type="button" className="bread-sanctum__continue" onClick={() => selectThreshold(activeIndex + 1)}>
            {activeIndex === 0 ? "Als Empfangender eintreten" : "Weiter zum Brot"} <span aria-hidden="true" />
          </button>
        )}

        {activeIndex === 0 && roomContext ? (
          <Link className="bread-sanctum__return" href={roomContext.returnHref}>
            {roomContext.mobileText} · {roomContext.returnLabel}
          </Link>
        ) : null}
      </section>

      <aside className="bread-sanctum__trace">
        <RoomPersonalTraceCard symbolSlug="brot" roomContext={roomContext} />
      </aside>
    </main>
  );
}
