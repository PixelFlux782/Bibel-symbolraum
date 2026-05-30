"use client";

import Image from "next/image";
import { useState } from "react";

type WaterJourneyStage = {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
  action: string;
  image: string;
  alt: string;
  glyph?: string;
  inscription?: string;
};

const waterJourney: WaterJourneyStage[] = [
  {
    id: "water",
    eyebrow: "Wasser",
    title: "Wasser trägt. Wasser trennt.",
    text: "Bleib einen Moment an der Oberfläche. Vor dir liegt kein Thema, sondern eine Schwelle.",
    action: "Unter die Oberfläche",
    image: "/Visuals/wasser_cinema_hero.png",
    alt: "Ein weiter Wasserraum zwischen Tiefe und Licht",
  },
  {
    id: "depth",
    eyebrow: "Tiefe",
    title: "Die Tiefe öffnet sich.",
    text: "Im Dunkel liegt nicht nur Gefahr. Mem, der Buchstabe des Wassers, trägt Chaos, Ursprung und Geburt zugleich.",
    action: "Der Spur folgen",
    image: "/Visuals/wasser_tiefenbild.png",
    alt: "Ein tiefer Wasserraum mit einem Lichtstrahl und hebräischen Zeichen",
    glyph: "מ",
    inscription: "Mem · Tiefe · Ursprung",
  },
  {
    id: "exodus",
    eyebrow: "Exodus 14",
    title: "Die Grenze wird zum Weg.",
    text: "Das Meer verschwindet nicht. Es teilt sich. Befreiung beginnt dort, wo du den ersten Schritt durch die Grenze wagst.",
    action: "Durch das Wasser gehen",
    image: "/Visuals/wasser_szenenbild.png",
    alt: "Der Weg durch das geteilte Meer im Exodus",
    inscription: "Grenze · Durchzug · Befreiung",
  },
  {
    id: "light",
    eyebrow: "Licht",
    title: "Aus der Tiefe steigt Licht.",
    text: "Du kehrst nicht an dieselbe Oberfläche zurück. Was Grenze war, ist Durchgang geworden.",
    action: "Die Reise erneut beginnen",
    image: "/Visuals/cinem_lichtraum_backround.png",
    alt: "Ein dunkler Raum, der sich durch einen goldenen Lichtstrahl öffnet",
    inscription: "Offenbarung · Neubeginn",
  },
];

export default function WaterRoom() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeStage = waterJourney[activeIndex];
  const isComplete = activeIndex === waterJourney.length - 1;

  const continueJourney = () => {
    setActiveIndex(isComplete ? 0 : activeIndex + 1);
  };

  return (
    <main className={`water-journey water-journey--${activeStage.id}`}>
      <div className="water-journey__scenes" aria-live="polite">
        {waterJourney.map((stage, index) => (
          <div
            key={stage.id}
            className={`water-journey__scene ${index === activeIndex ? "is-active" : ""}`}
            aria-hidden={index !== activeIndex}
          >
            <Image
              src={stage.image}
              alt={stage.alt}
              fill
              priority={index === 0}
              sizes="100vw"
              className="water-journey__image"
            />
          </div>
        ))}
      </div>

      <div className="water-journey__veil" aria-hidden="true" />
      <div className="water-journey__current" aria-hidden="true" />

      <nav className="water-journey__trail" aria-label="Spur durch den Wasserraum">
        <p className="water-journey__trail-label">Wasserraum</p>
        <ol>
          {waterJourney.map((stage, index) => (
            <li key={stage.id}>
              <button
                type="button"
                className={`water-journey__trail-step ${index === activeIndex ? "is-active" : ""} ${index < activeIndex ? "is-passed" : ""}`}
                onClick={() => setActiveIndex(index)}
                aria-current={index === activeIndex ? "step" : undefined}
                aria-label={`${stage.eyebrow}${index === activeIndex ? ", aktuelle Station" : ""}`}
              >
                <span className="water-journey__trail-mark" />
                <span>{stage.eyebrow}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <section className="water-journey__content" key={activeStage.id}>
        <p className="water-journey__eyebrow">
          {String(activeIndex + 1).padStart(2, "0")} / {String(waterJourney.length).padStart(2, "0")} · {activeStage.eyebrow}
        </p>
        {activeStage.glyph ? (
          <p className="water-journey__glyph" lang="he" dir="rtl">
            {activeStage.glyph}
          </p>
        ) : null}
        <h1 className="water-journey__title">{activeStage.title}</h1>
        <p className="water-journey__text">{activeStage.text}</p>
        {activeStage.inscription ? (
          <p className="water-journey__inscription">{activeStage.inscription}</p>
        ) : null}
        <div className="water-journey__actions">
          {activeIndex > 0 ? (
            <button
              type="button"
              className="water-journey__back"
              onClick={() => setActiveIndex(activeIndex - 1)}
            >
              Zurück
            </button>
          ) : null}
          <button type="button" className="water-journey__action" onClick={continueJourney}>
            {activeStage.action}
            <span aria-hidden="true" />
          </button>
        </div>
      </section>

      <p className="water-journey__hint">
        {isComplete ? "Die Spur ist sichtbar geworden." : "Eine Handlung führt weiter."}
      </p>
    </main>
  );
}
