"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { RoomPersonalTraceCard } from "@/components/rooms/engine/RoomPersonalTraceCard";
import { recordRoomVisitForRoute } from "@/lib/pathActivity";
import type { RoomContext } from "@/lib/rooms/roomContext";
import { getSymbolPathConfig } from "@/lib/symbols/symbolPathConfig";
import { visualAssets } from "@/lib/visualAssets";

type WaterRoomProps = {
  initialStateId?: string;
  roomContext?: RoomContext;
};

type WaterThreshold = {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  text: string;
  revelation?: string;
  image: string;
  alt: string;
};

const thresholds: WaterThreshold[] = [
  {
    id: "depth",
    label: "Tiefe",
    eyebrow: "Vor der Form",
    title: "Am Anfang ist Wasser nicht romantisch.",
    text: "Es ist das Noch-nicht-Geformte. Die Tiefe, in der alles verborgen liegt.",
    revelation: "Sie ist nicht leer. Sie wartet darauf, angesprochen zu werden.",
    image: visualAssets.wasserCinema,
    alt: "Dunkle Wasserfläche in Nebel vor der Form",
  },
  {
    id: "ruach",
    label: "Ruach",
    eyebrow: "Atem über den Wassern",
    title: "Das Erste, was die Tiefe berührt, ist Gottes Nähe.",
    text: "Über den Wassern ist Atem. Nicht Gewalt. Nicht Erklärung. Ein Schweben.",
    revelation: "Finsternis über der Tiefe. Und Gottes Atem über den Wassern.",
    image: visualAssets.wasserDepth,
    alt: "Feiner Lichtatem und Nebel über dunklem Wasser",
  },
  {
    id: "majim",
    label: "Majim",
    eyebrow: "מַיִם · Wasser",
    title: "Wasser trägt den Punkt des Werdens in sich.",
    text: "Ein Wort im Pluralklang. Wasser ist nie ganz einzeln. Es trägt Bewegung, Beziehung und Strömung.",
    image: visualAssets.wasserHebrew,
    alt: "Hebräische Wasserzeichen in einer dunklen Tiefe",
  },
  {
    id: "birth",
    label: "Geburt",
    eyebrow: "Getragen vor dem Atem",
    title: "Alles Lebendige kommt durch Wasser.",
    text: "Der Mensch wird im Wasser getragen, bevor er atmet. Auch die Schöpfung steht zuerst im Wasser, bevor sie Welt wird.",
    image: visualAssets.wasserMacro,
    alt: "Ein feiner Lichtkeim steigt aus dunklem Wasser",
  },
  {
    id: "passage",
    label: "Übergang",
    eyebrow: "Wasser wird Weg",
    title: "Man bleibt nicht einfach am Wasser. Man geht hindurch.",
    text: "Wasser trennt. Aber es trennt nicht nur ab. Es öffnet einen Weg. Wer durch Wasser geht, kommt nicht als derselbe heraus.",
    revelation: "Das Meer wird nicht erklärt. Es öffnet sich.",
    image: visualAssets.wasserScene,
    alt: "Eine lichte Schneise öffnet sich durch dunkles Wasser",
  },
  {
    id: "reflection",
    label: "Spiegel",
    eyebrow: "Reinigung · Spiegel",
    title: "Was nicht zu dir gehört, darf abfließen.",
    text: "Wasser reinigt nicht, indem es verurteilt. Es nimmt mit. Es löst. Es macht wieder empfänglich.",
    revelation: "Wasser zeigt nicht, indem es festhält. Es zeigt, indem es empfängt.",
    image: visualAssets.wasserMap,
    alt: "Eine ruhige spiegelnde Wasserfläche mit forttreibenden Partikeln",
  },
  {
    id: "light",
    label: "Licht",
    eyebrow: "Tiefe · Ruach · Wort",
    title: "Die Tiefe wird nicht vernichtet. Sie wird angesprochen.",
    text: "Das Wort Gottes gibt dem Wasser Grenze. Und aus Grenze wird Welt.",
    revelation: "Wenn die Tiefe berührt ist, kann das Licht gesprochen werden.",
    image: visualAssets.wasserRoomHero,
    alt: "Eine warme Lichtlinie erscheint über ruhigem tiefem Wasser",
  },
];

const stateToThreshold: Record<string, string> = {
  "before-order": "depth",
  boundary: "passage",
  exodus: "passage",
  genesis: "ruach",
};

const depthWords = [
  ["Tiefe", "Die Tiefe ist nicht leer. Sie ist übervoll. Nur noch nicht ausgesprochen."],
  ["Verborgenheit", "Was verborgen ist, ist nicht abwesend. Es wartet in einer anderen Form."],
  ["Möglichkeit", "Noch ist nichts entschieden. Darum kann alles beginnen."],
  ["Angst", "Tiefe entzieht den Grund. Auch das gehört zu ihrer Wahrheit."],
  ["Geburt", "Bevor Leben sichtbar wird, wird es von Dunkelheit und Wasser getragen."],
  ["Übergang", "Wasser markiert die Grenze, an der ein anderes Leben beginnen kann."],
] as const;

const letters = [
  { glyph: "מ", name: "Mem", note: "Die Mem schließt ein. Wie der Mutterleib. Wie die Tiefe. Wie das Geheimnis, bevor es geboren wird.", mode: "mem" },
  { glyph: "י", name: "Jod", note: "Ein Punkt, ein Keim, ein Anfangsimpuls: Licht im Wasser.", mode: "jod" },
  { glyph: "ם", name: "End-Mem", note: "Die Tiefe schließt sich nicht als Gefängnis. Sie umfasst und trägt.", mode: "final-mem" },
] as const;

const archiveExits = [
  ["Wasser", "/codex/wasser"],
  ["Majim", "/codex/majim"],
  ["Mem", "/codex/mem"],
  ["Tiefe", "/codex/tiefe"],
  ["Genesis 1,2", "/codex/genesis-1-2"],
  ["Exodus 14", "/codex/exodus-14"],
  ["Reinigung", "/codex/reinigung"],
  ["Geburt", "/codex/geburt"],
  ["Übergang", "/codex/uebergang"],
] as const;

export default function WaterRoom({ initialStateId, roomContext }: WaterRoomProps) {
  const initialId = stateToThreshold[initialStateId ?? ""] ?? initialStateId;
  const initialIndex = Math.max(0, thresholds.findIndex((item) => item.id === initialId));
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [depthReveal, setDepthReveal] = useState<string>(depthWords[0][1]);
  const [letterMode, setLetterMode] = useState<(typeof letters)[number]["mode"]>("jod");
  const [letterNote, setLetterNote] = useState<string>(letters[1].note);
  const active = thresholds[activeIndex];
  const symbolPath = useMemo(() => getSymbolPathConfig("wasser"), []);

  useEffect(() => {
    recordRoomVisitForRoute({
      symbolId: "wasser",
      roomHref: symbolPath?.roomHref ?? "/raeume/wasser",
      routeKey: "room:wasser",
    });
  }, [symbolPath?.roomHref]);

  const selectThreshold = (index: number) => {
    setActiveIndex(index);
    window.requestAnimationFrame(() => document.querySelector(".water-experience")?.scrollIntoView({ behavior: "smooth" }));
  };

  return (
    <main className={`water-experience water-experience--${active.id} water-experience--letter-${letterMode}`}>
      <div className="water-experience__scenes" aria-hidden="true">
        {thresholds.map((item, index) => (
          <div className={`water-experience__scene ${index === activeIndex ? "is-active" : ""}`} key={item.id}>
            <Image src={item.image} alt="" fill priority={index === 0} sizes="100vw" className="water-experience__image" />
          </div>
        ))}
      </div>
      <div className="water-experience__depth" aria-hidden="true" />
      <div className="water-experience__light" aria-hidden="true" />
      <div className="water-experience__mist" aria-hidden="true" />
      <div className="water-experience__surface" aria-hidden="true" />
      <div className="water-experience__particles" aria-hidden="true" />
      {active.id === "passage" ? <div className="water-experience__path" aria-hidden="true" /> : null}

      <nav className="water-experience__navigation" aria-label="Sieben Schwellen des Wasser-Raums">
        <p>Wasser-Raum</p>
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

      <section className="water-experience__moment" key={active.id} aria-live="polite">
        <p className="water-experience__counter">{String(activeIndex + 1).padStart(2, "0")} / 07 · {active.eyebrow}</p>

        {active.id === "majim" ? (
          <div className="water-experience__letters" aria-label="Die Buchstaben von Majim">
            {letters.map((letter) => (
              <button
                type="button"
                key={letter.name}
                className={letterMode === letter.mode ? "is-active" : ""}
                onClick={() => { setLetterMode(letter.mode); setLetterNote(letter.note); }}
                onFocus={() => { setLetterMode(letter.mode); setLetterNote(letter.note); }}
                aria-label={`${letter.name}: ${letter.note}`}
              >
                <span lang="he" dir="rtl">{letter.glyph}</span>
                <small>{letter.name}</small>
              </button>
            ))}
          </div>
        ) : null}

        <h1>{active.title}</h1>
        <p className="water-experience__copy">{active.text}</p>
        {active.revelation ? <p className="water-experience__revelation">{active.revelation}</p> : null}

        {active.id === "depth" ? (
          <div className="water-experience__word-field">
            <div>{depthWords.map(([word, note]) => (
              <button type="button" key={word} onMouseEnter={() => setDepthReveal(note)} onFocus={() => setDepthReveal(note)}>{word}</button>
            ))}</div>
            <p>{depthReveal}</p>
          </div>
        ) : null}

        {active.id === "majim" ? <p className="water-experience__letter-note">{letterNote}</p> : null}

        {active.id === "birth" ? (
          <div className="water-experience__birth-rhythm" aria-label="Bewegung der Geburt">
            {["verborgen", "getragen", "geöffnet", "geboren"].map((word) => <span key={word}>{word}</span>)}
          </div>
        ) : null}

        {active.id === "passage" ? (
          <p className="water-experience__echoes" aria-label="Biblische Wasserdurchgänge">
            <span>Noah</span><span>Schilfmeer</span><span>Jona</span><span>Jordan</span><span>Taufe Jesu</span>
          </p>
        ) : null}

        {active.id === "reflection" ? (
          <blockquote className="water-experience__question">
            Was in dir ist noch ungeformt?<br />Was wartet darauf, von Gottes Atem berührt zu werden?
          </blockquote>
        ) : null}

        {active.id === "light" ? (
          <>
            <p className="water-experience__formula">Tiefe <i>+</i> Ruach <i>+</i> Wort <i>=</i> Anfang der Ordnung</p>
            <div className="water-experience__exits">
              <Link href="/raeume/licht?from=journey&path=journey-wasser-geist&symbol=licht" className="water-experience__primary-exit">
                Aus der Tiefe ins Licht gehen <span aria-hidden="true" />
              </Link>
              <div className="water-experience__codex-exits" aria-label="Leise Spuren zur Vertiefung">
                {archiveExits.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
              </div>
            </div>
          </>
        ) : (
          <button type="button" className="water-experience__continue" onClick={() => selectThreshold(activeIndex + 1)}>
            {activeIndex === 0 ? "In die Tiefe" : "Weiter durch das Wasser"} <span aria-hidden="true" />
          </button>
        )}

        {activeIndex === 0 && roomContext ? (
          <Link className="water-experience__return" href={roomContext.returnHref}>
            {roomContext.mobileText} · {roomContext.returnLabel}
          </Link>
        ) : null}
      </section>

      <aside className="water-experience__trace">
        <RoomPersonalTraceCard symbolSlug="wasser" roomContext={roomContext} />
      </aside>
    </main>
  );
}
