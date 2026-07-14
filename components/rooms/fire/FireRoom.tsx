"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { RoomPersonalTraceCard } from "@/components/rooms/engine/RoomPersonalTraceCard";
import { recordRoomVisitForRoute } from "@/lib/pathActivity";
import type { RoomContext } from "@/lib/rooms/roomContext";
import { getSymbolPathConfig } from "@/lib/symbols/symbolPathConfig";
import { visualAssets } from "@/lib/visualAssets";

type FireRoomProps = {
  initialStateId?: string;
  roomContext?: RoomContext;
};

type FireThreshold = {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  text: string;
  revelation?: string;
  image: string;
};

const thresholds: FireThreshold[] = [
  {
    id: "glut",
    label: "Glut",
    eyebrow: "Verborgenes Brennen",
    title: "Feuer beginnt nicht laut.",
    text: "Es beginnt als verborgenes Brennen. Gesammelt. Innerlich. Noch ohne Flamme.",
    revelation: "Nicht alles, was brennt, zerstoert. Manches Feuer ruft.",
    image: visualAssets.tiefenraum,
  },
  {
    id: "ruf",
    label: "Ruf",
    eyebrow: "Dornbusch",
    title: "Das Feuer ruft, bevor es erklaert.",
    text: "Mose sieht ein Feuer, das brennt und nicht verbraucht. Naehe haelt ihn auf.",
    revelation: "Zieh deine Schuhe aus. Nicht weil der Boden anders aussieht, sondern weil Gegenwart ihn heiligt.",
    image: visualAssets.feuerHero,
  },
  {
    id: "esh",
    label: "Esh",
    eyebrow: "Esh / Feuer",
    title: "Ein kurzes Wort traegt Hitze, Atem und Zeichen.",
    text: "Esh traegt Ruf, Naehe, Gefahr und Verwandlung. Sichtbare Naehe des Unsichtbaren.",
    image: visualAssets.feuerSmoke,
  },
  {
    id: "gegenwart",
    label: "Gegenwart",
    eyebrow: "Heilige Naehe",
    title: "Feuer ist Naehe, die nicht besessen werden kann.",
    text: "Es zieht an und haelt Abstand. Es offenbart Gegenwart und setzt Grenze.",
    revelation: "Gottes Gegenwart waermt nicht nur. Sie setzt Grenze.",
    image: visualAssets.archivHero,
  },
  {
    id: "pruefung",
    label: "Pruefung",
    eyebrow: "Was bleibt",
    title: "Feuer fragt nicht: Wie glaenzt du?",
    text: "Feuer fragt: Was bleibt? Was nur Oberflaeche ist, verliert seine Stimme.",
    revelation: "Licht macht sichtbar. Feuer macht wahr.",
    image: visualAssets.feuerGlut,
  },
  {
    id: "reinigung",
    label: "Reinigung",
    eyebrow: "Laeuterung",
    title: "Wasser loest. Feuer laeutert.",
    text: "Schlacke loest sich. Gold bleibt. Das Echte wird vom Unechten getrennt.",
    revelation: "Was durch Wasser weich wurde, wird im Feuer klar.",
    image: visualAssets.feuerAsh,
  },
  {
    id: "sendung",
    label: "Sendung",
    eyebrow: "Weg / Wueste",
    title: "Feuer bleibt nicht im Heiligtum.",
    text: "Was im Feuer klar geworden ist, muss den Weg betreten.",
    revelation: "Feuer wird Auftrag.",
    image: visualAssets.wuestePath,
  },
];

const stateToThreshold: Record<string, string> = {
  "hidden-fire": "glut",
  "burning-bush": "ruf",
  "pillar-of-fire": "sendung",
  "refining-fire": "reinigung",
  spark: "glut",
  presence: "gegenwart",
  calling: "ruf",
  purification: "reinigung",
  transformation: "reinigung",
};

const eshLetters = [
  {
    glyph: "\u05d0",
    name: "Aleph",
    mode: "aleph",
    note: "Das Feuer beginnt im Unsichtbaren.",
    detail: "Ursprung, Atem, verborgene Gegenwart, goettlicher Anfang.",
  },
  {
    glyph: "\u05e9",
    name: "Shin",
    mode: "shin",
    note: "Die Flamme trennt, was bleibt, von dem, was vergeht.",
    detail: "Zahn, Flamme, Dreiheit, Verzehren, Verwandeln, goettlicher Abdruck.",
  },
] as const;

const archiveExits = [
  ["Feuer", "/codex/feuer"],
  ["Esch", "/codex/esch"],
  ["Dornbusch", "/codex/exodus-3-2"],
  ["Reinigung", "/codex/reinigung"],
  ["Wandlung", "/codex/wandlung"],
  ["Korban", "/codex/korban"],
  ["Pfingstspur", "/codex/feuer?spur=pfingsten"],
  ["Wueste", "/codex/wueste"],
] as const;

const presenceEchoes = ["Dornbusch", "Altar", "Opfer", "Feuersaeule", "Tempellicht", "Pfingstflammen"];
const refiningWords = ["sichtbar", "geprueft", "gelaeutert", "klar"];

export default function FireRoom({ initialStateId, roomContext }: FireRoomProps) {
  const initialId = stateToThreshold[initialStateId ?? ""] ?? initialStateId;
  const initialIndex = Math.max(0, thresholds.findIndex((item) => item.id === initialId));
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [letterMode, setLetterMode] = useState<(typeof eshLetters)[number]["mode"]>("aleph");
  const active = thresholds[activeIndex];
  const activeLetter = eshLetters.find((letter) => letter.mode === letterMode) ?? eshLetters[0];
  const symbolPath = useMemo(() => getSymbolPathConfig("feuer"), []);

  useEffect(() => {
    recordRoomVisitForRoute({
      symbolId: "feuer",
      roomHref: symbolPath?.roomHref ?? "/raeume/feuer",
      routeKey: "room:feuer",
    });
  }, [symbolPath?.roomHref]);

  const selectThreshold = (index: number) => {
    const nextIndex = Math.max(0, Math.min(thresholds.length - 1, index));
    setActiveIndex(nextIndex);
    window.requestAnimationFrame(() => document.querySelector(".fire-trial")?.scrollIntoView({ behavior: "smooth" }));
  };

  return (
    <main className={`fire-trial fire-trial--${active.id} fire-trial--letter-${letterMode}`}>
      <div className="fire-trial__scenes" aria-hidden="true">
        {thresholds.map((item, index) => (
          <div className={`fire-trial__scene ${index === activeIndex ? "is-active" : ""}`} key={item.id}>
            <Image src={item.image} alt="" fill priority={index === 0} sizes="100vw" className="fire-trial__image" />
          </div>
        ))}
      </div>
      <div className="fire-trial__veil" aria-hidden="true" />
      <div className="fire-trial__smoke" aria-hidden="true" />
      <div className="fire-trial__ember" aria-hidden="true" />
      <div className="fire-trial__thorn" aria-hidden="true" />
      <div className="fire-trial__axis" aria-hidden="true" />
      <div className="fire-trial__particles" aria-hidden="true" />
      <div className="fire-trial__gold" aria-hidden="true" />
      <div className="fire-trial__horizon" aria-hidden="true" />

      <nav className="fire-trial__navigation" aria-label="Sieben Schwellen des Feuer-Raums">
        <p>Feuer-Raum</p>
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

      <section className="fire-trial__moment" key={active.id} aria-live="polite">
        <p className="fire-trial__counter">{String(activeIndex + 1).padStart(2, "0")} / 07 · {active.eyebrow}</p>

        {active.id === "esh" ? (
          <div className="fire-trial__word" aria-label="Die Buchstaben von Esh">
            <p lang="he" dir="rtl">{"\u05d0\u05e9"}</p>
            <div>
              {eshLetters.map((letter) => (
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
        <p className="fire-trial__copy">{active.text}</p>
        {active.revelation ? <p className="fire-trial__revelation">{active.revelation}</p> : null}

        {active.id === "esh" ? (
          <p className="fire-trial__letter-note">
            <strong>{activeLetter.note}</strong>
            <span>{activeLetter.detail}</span>
          </p>
        ) : null}

        {active.id === "ruf" ? (
          <p className="fire-trial__ground">stehen bleiben · hoeren · gerufen werden</p>
        ) : null}

        {active.id === "gegenwart" ? (
          <p className="fire-trial__echoes" aria-label="Ferne Feuer-Spuren">
            {presenceEchoes.map((word) => <span key={word}>{word}</span>)}
          </p>
        ) : null}

        {active.id === "pruefung" ? (
          <blockquote className="fire-trial__question">
            Was bleibt,<br />wenn der Glanz nicht mehr genuegt?
          </blockquote>
        ) : null}

        {active.id === "reinigung" ? (
          <p className="fire-trial__movement" aria-label="Bewegung der Laeuterung">
            {refiningWords.map((word) => <span key={word}>{word}</span>)}
          </p>
        ) : null}

        {active.id === "sendung" ? (
          <div className="fire-trial__exits">
            <Link href="/raeume/wueste?from=journey&path=journey-licht-feuer-wueste&symbol=wueste" className="fire-trial__primary-exit">
              Den geklaerten Weg betreten <span aria-hidden="true" />
            </Link>
            <div className="fire-trial__codex-exits" aria-label="Ruhige Archivspuren">
              {archiveExits.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
            </div>
          </div>
        ) : (
          <button type="button" className="fire-trial__continue" onClick={() => selectThreshold(activeIndex + 1)}>
            {activeIndex === 0 ? "Auf den Ruf warten" : "Weiter durch das Feuer"} <span aria-hidden="true" />
          </button>
        )}

        {activeIndex === 0 && roomContext ? (
          <Link className="fire-trial__return" href={roomContext.returnHref}>
            {roomContext.mobileText} · {roomContext.returnLabel}
          </Link>
        ) : null}
      </section>

      <aside className="fire-trial__trace">
        <RoomPersonalTraceCard symbolSlug="feuer" roomContext={roomContext} />
      </aside>
    </main>
  );
}
