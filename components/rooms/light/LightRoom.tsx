"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { RoomPersonalTraceCard } from "@/components/rooms/engine/RoomPersonalTraceCard";
import { recordRoomVisitForRoute } from "@/lib/pathActivity";
import type { RoomContext } from "@/lib/rooms/roomContext";
import { getSymbolPathConfig } from "@/lib/symbols/symbolPathConfig";
import { visualAssets } from "@/lib/visualAssets";

type LightRoomProps = {
  initialStateId?: string;
  roomContext?: RoomContext;
};

type LightThreshold = {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  text: string;
  revelation?: string;
  image: string;
  alt: string;
};

const thresholds: LightThreshold[] = [
  {
    id: "darkness",
    label: "Finsternis",
    eyebrow: "Vor der Offenbarung",
    title: "Noch ist nichts sichtbar.",
    text: "Nicht, weil nichts da ist. Sondern weil es noch nicht gerufen wurde.",
    revelation: "Finsternis ist nicht das Ende. Sie ist der Raum vor der Offenbarung.",
    image: visualAssets.tiefenraum,
    alt: "Schwarzblauer Raum mit Nebel vor dem ersten Licht",
  },
  {
    id: "voice",
    label: "Stimme",
    eyebrow: "Wort vor Bild",
    title: "Nicht das Licht beginnt. Das Wort ruft es.",
    text: "Die Welt wird nicht angeleuchtet. Sie wird angesprochen.",
    revelation: "Wort wird Ruf. Ruf wird Erwartung. Erwartung oeffnet Sichtbarkeit.",
    image: visualAssets.lichtCinema,
    alt: "Dunkler Raum mit kaum sichtbarer goldener Schwingung",
  },
  {
    id: "or",
    label: "OR",
    eyebrow: "Or / Licht",
    title: "Ein Wort, das nicht nur hell macht.",
    text: "Aleph, Waw und Resch bilden eine Bewegung vom unsichtbaren Ursprung ueber Verbindung zur sichtbaren Gestalt.",
    revelation: "OR oeffnet Richtung.",
    image: visualAssets.lichtReflection,
    alt: "Goldene hebräische Lichtschrift in einem dunklen Archivraum",
  },
  {
    id: "genesis",
    label: "Genesis 1,3",
    eyebrow: "Jehi Or",
    title: "Und Gott sprach: Es werde Licht.",
    text: "Der Vers steht nicht als Karte im Raum. Er geschieht als ruhige Oeffnung.",
    revelation: "Das Licht ist nicht da, um zu blenden. Es ist da, damit gesehen werden kann.",
    image: visualAssets.lichtHero,
    alt: "Warme Lichtachse bricht ruhig durch einen tiefen blauen Raum",
  },
  {
    id: "boundary",
    label: "Scheidung",
    eyebrow: "Grenze / Ordnung",
    title: "Licht vernichtet die Finsternis nicht.",
    text: "Es unterscheidet sie. Wo Licht erscheint, beginnt Grenze. Und aus Grenze wird Welt.",
    revelation: "Schoepfung entsteht durch heilige Unterscheidung.",
    image: visualAssets.lichtOrderLine,
    alt: "Sanfte goldene Grenze zwischen Licht und Dunkel im Nebel",
  },
  {
    id: "tov",
    label: "Sehen / Tov",
    eyebrow: "Raah / Tov",
    title: "Gott sah das Licht. Und es war gut.",
    text: "Gut ist hier nicht Geschmack. Gut heisst: Es stimmt. Es traegt. Es findet seinen Ort.",
    revelation: "Licht macht Bedeutung lesbar.",
    image: visualAssets.archivHero,
    alt: "Kosmische Archivflaechen werden von warmem Goldlicht lesbar",
  },
  {
    id: "fire",
    label: "Feuer",
    eyebrow: "Sendung / Pruefung",
    title: "Licht zeigt. Feuer prueft.",
    text: "Was sichtbar geworden ist, kann verwandelt werden.",
    revelation: "Am Ende der Lichtachse sammelt sich ein heiliger Brennpunkt.",
    image: visualAssets.feuerGlut,
    alt: "Ruhiger bernsteinfarbener Glutkern am Ende einer Lichtachse",
  },
];

const stateToThreshold: Record<string, string> = {
  "before-light": "darkness",
  "let-there-be-light": "genesis",
  "light-seen-as-good": "tov",
  "light-on-the-way": "fire",
  "light-within": "tov",
};

const orLetters = [
  {
    glyph: "\u05d0",
    name: "Aleph",
    mode: "aleph",
    note: "Das Licht beginnt im Unsichtbaren.",
    detail: "Ursprung, Atem, das Unhoerbare vor dem Laut, goettliche Gegenwart.",
  },
  {
    glyph: "\u05d5",
    name: "Waw",
    mode: "waw",
    note: "Licht verbindet Oben und Unten.",
    detail: "Verbindung, Achse, Haken, das Oben und Unten bindet.",
  },
  {
    glyph: "\u05e8",
    name: "Resch",
    mode: "resch",
    note: "Licht gibt dem Verborgenen ein Gesicht.",
    detail: "Haupt, Anfang, Richtung, das Hervortreten einer Gestalt.",
  },
] as const;

const archiveExits = [
  ["Licht", "/codex/licht"],
  ["OR", "/codex/or"],
  ["Genesis 1,3", "/codex/genesis-1-3"],
  ["Tov", "/codex/tov"],
  ["Raah", "/codex/raah"],
  ["Ordnung", "/codex/ordnung"],
  ["Feuer", "/codex/feuer"],
] as const;

export default function LightRoom({ initialStateId, roomContext }: LightRoomProps) {
  const initialId = stateToThreshold[initialStateId ?? ""] ?? initialStateId;
  const initialIndex = Math.max(0, thresholds.findIndex((item) => item.id === initialId));
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [letterMode, setLetterMode] = useState<(typeof orLetters)[number]["mode"]>("aleph");
  const active = thresholds[activeIndex];
  const activeLetter = orLetters.find((letter) => letter.mode === letterMode) ?? orLetters[0];
  const symbolPath = useMemo(() => getSymbolPathConfig("licht"), []);

  useEffect(() => {
    recordRoomVisitForRoute({
      symbolId: "licht",
      roomHref: symbolPath?.roomHref ?? "/raeume/licht",
      routeKey: "room:licht",
    });
  }, [symbolPath?.roomHref]);

  const selectThreshold = (index: number) => {
    const nextIndex = Math.max(0, Math.min(thresholds.length - 1, index));
    setActiveIndex(nextIndex);
    window.requestAnimationFrame(() => document.querySelector(".light-revelation")?.scrollIntoView({ behavior: "smooth" }));
  };

  return (
    <main className={`light-revelation light-revelation--${active.id} light-revelation--letter-${letterMode}`}>
      <div className="light-revelation__scenes" aria-hidden="true">
        {thresholds.map((item, index) => (
          <div className={`light-revelation__scene ${index === activeIndex ? "is-active" : ""}`} key={item.id}>
            <Image src={item.image} alt="" fill priority={index === 0} sizes="100vw" className="light-revelation__image" />
          </div>
        ))}
      </div>
      <div className="light-revelation__veil" aria-hidden="true" />
      <div className="light-revelation__mist" aria-hidden="true" />
      <div className="light-revelation__waterline" aria-hidden="true" />
      <div className="light-revelation__voice" aria-hidden="true" />
      <div className="light-revelation__axis" aria-hidden="true" />
      <div className="light-revelation__boundary" aria-hidden="true" />
      <div className="light-revelation__particles" aria-hidden="true" />
      <div className="light-revelation__ember" aria-hidden="true" />

      <nav className="light-revelation__navigation" aria-label="Sieben Schwellen des Licht-Raums">
        <p>Licht-Raum</p>
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

      <section className="light-revelation__moment" key={active.id} aria-live="polite">
        <p className="light-revelation__counter">{String(activeIndex + 1).padStart(2, "0")} / 07 · {active.eyebrow}</p>

        {active.id === "or" ? (
          <div className="light-revelation__word" aria-label="Die Buchstaben von Or">
            <p lang="he" dir="rtl">{"\u05d0\u05d5\u05e8"}</p>
            <div>
              {orLetters.map((letter) => (
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

        {active.id === "genesis" ? <p className="light-revelation__formula" lang="he" dir="rtl">{"\u05d9\u05b0\u05d4\u05b4\u05d9 \u05d0\u05d5\u05b9\u05e8"}</p> : null}

        <h1>{active.title}</h1>
        <p className="light-revelation__copy">{active.text}</p>
        {active.revelation ? <p className="light-revelation__revelation">{active.revelation}</p> : null}

        {active.id === "or" ? (
          <p className="light-revelation__letter-note">
            <strong>{activeLetter.note}</strong>
            <span>{activeLetter.detail}</span>
          </p>
        ) : null}

        {active.id === "boundary" ? (
          <p className="light-revelation__trace-line" aria-label="Ruhige Archivspuren">
            <span>Scheidung</span><span>Grenze</span><span>Ordnung</span><span>Tag / Nacht</span>
          </p>
        ) : null}

        {active.id === "tov" ? (
          <p className="light-revelation__movement" aria-label="Bewegung von Licht zu Gut">
            <span>Licht</span><i aria-hidden="true" /><span>Sehen</span><i aria-hidden="true" /><span>Gut</span><i aria-hidden="true" /><span>Ordnung</span>
          </p>
        ) : null}

        {active.id === "fire" ? (
          <div className="light-revelation__exits">
            <Link href="/raeume/feuer?from=journey&path=journey-licht-feuer-wort&symbol=feuer" className="light-revelation__primary-exit">
              Das Sichtbare im Feuer pruefen <span aria-hidden="true" />
            </Link>
            <div className="light-revelation__codex-exits" aria-label="Ruhige Archivspuren">
              {archiveExits.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
            </div>
          </div>
        ) : (
          <button type="button" className="light-revelation__continue" onClick={() => selectThreshold(activeIndex + 1)}>
            {activeIndex === 0 ? "Auf das Wort warten" : "Weiter ins Sichtbarwerden"} <span aria-hidden="true" />
          </button>
        )}

        {activeIndex === 0 && roomContext ? (
          <Link className="light-revelation__return" href={roomContext.returnHref}>
            {roomContext.mobileText} · {roomContext.returnLabel}
          </Link>
        ) : null}
      </section>

      <aside className="light-revelation__trace">
        <RoomPersonalTraceCard symbolSlug="licht" roomContext={roomContext} />
      </aside>
    </main>
  );
}
