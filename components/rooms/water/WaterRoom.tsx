"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { recordRoomVisitForRoute } from "@/lib/pathActivity";
import type { RoomContext } from "@/lib/rooms/roomContext";
import { getSymbolPathConfig } from "@/lib/symbols/symbolPathConfig";
import { visualAssets } from "@/lib/visualAssets";
import { RoomPersonalTraceCard } from "@/components/rooms/engine/RoomPersonalTraceCard";

type WaterRoomProps = {
  initialStateId?: string;
  roomContext?: RoomContext;
};

type WaterMoment = {
  id: string;
  label: string;
  title: string;
  text?: string;
  secondLine?: string;
  hebrew?: string;
  transliteration?: string;
  image: string;
  alt: string;
};

const waterMoments: WaterMoment[] = [
  {
    id: "before-order",
    label: "Eintritt",
    title: "Vor der Form ist Tiefe.",
    text: "Du betrittst nicht einfach Wasser. Du betrittst die Tiefe vor der Ordnung.",
    image: visualAssets.wasserCinema,
    alt: "Dunkle Wasserfläche vor der Form",
  },
  {
    id: "depth",
    label: "Atem",
    title: "Und der Geist Gottes schwebte über den Wassern.",
    hebrew: "וְרוּחַ אֱלֹהִים",
    image: visualAssets.wasserDepth,
    alt: "Licht und feiner Nebel über dunklem Wasser",
  },
  {
    id: "majim",
    label: "Wort",
    title: "Die Tiefe ist nicht leer.",
    text: "Sie wartet auf das Wort.",
    hebrew: "מַיִם",
    transliteration: "MAJIM",
    image: visualAssets.wasserHebrew,
    alt: "Hebräische Zeichen unter einer dunklen Wasseroberfläche",
  },
  {
    id: "genesis",
    label: "Gegenwart",
    title: "Die Erde war wüst und leer, und Finsternis lag über der Tiefe.",
    secondLine: "Aber der Geist war schon da.",
    image: visualAssets.wasserInterface,
    alt: "Eine schwebende Bewegung über der Tiefe",
  },
  {
    id: "light",
    label: "Schwelle",
    title: "Aus der Tiefe ruft das Licht.",
    text: "Erlebe zuerst. Verstehe danach.",
    image: visualAssets.wasserRoomHero,
    alt: "Wasser zwischen dunkler Tiefe und anbrechendem Licht",
  },
];

const stateToMoment: Record<string, string> = {
  boundary: "majim",
  exodus: "light",
};

export default function WaterRoom({ initialStateId, roomContext }: WaterRoomProps) {
  const initialMomentId = stateToMoment[initialStateId ?? ""] ?? initialStateId;
  const initialIndex = Math.max(0, waterMoments.findIndex((moment) => moment.id === initialMomentId));
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const activeMoment = waterMoments[activeIndex];
  const isLastMoment = activeIndex === waterMoments.length - 1;
  const symbolPath = useMemo(() => getSymbolPathConfig("wasser"), []);

  useEffect(() => {
    recordRoomVisitForRoute({
      symbolId: "wasser",
      roomHref: symbolPath?.roomHref ?? "/raeume/wasser",
      routeKey: "room:wasser",
    });
  }, [symbolPath?.roomHref]);

  return (
    <main className={`water-experience water-experience--${activeMoment.id}`}>
      <div className="water-experience__scenes" aria-hidden="true">
        {waterMoments.map((moment, index) => (
          <div
            className={`water-experience__scene ${index === activeIndex ? "is-active" : ""}`}
            key={moment.id}
          >
            <Image
              src={moment.image}
              alt=""
              fill
              priority={index === 0}
              sizes="100vw"
              className="water-experience__image"
            />
          </div>
        ))}
      </div>
      <div className="water-experience__depth" aria-hidden="true" />
      <div className="water-experience__light" aria-hidden="true" />
      <div className="water-experience__mist" aria-hidden="true" />
      <div className="water-experience__surface" aria-hidden="true" />

      <nav className="water-experience__navigation" aria-label="Schwellen des Wasser-Raums">
        <p>Wasser-Raum</p>
        <ol>
          {waterMoments.map((moment, index) => (
            <li key={moment.id}>
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                className={index === activeIndex ? "is-active" : index < activeIndex ? "is-past" : ""}
                aria-current={index === activeIndex ? "step" : undefined}
                aria-label={`${index + 1}. ${moment.label}`}
              >
                <span aria-hidden="true" />
                <b>{moment.label}</b>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <section className="water-experience__moment" key={activeMoment.id} aria-live="polite">
        <p className="water-experience__counter">
          {String(activeIndex + 1).padStart(2, "0")} / {String(waterMoments.length).padStart(2, "0")}
        </p>

        {activeMoment.hebrew ? (
          <p className="water-experience__hebrew" lang="he" dir="rtl">
            {activeMoment.hebrew}
          </p>
        ) : null}
        {activeMoment.transliteration ? (
          <p className="water-experience__transliteration">{activeMoment.transliteration}</p>
        ) : null}

        <h1>{activeMoment.title}</h1>
        {activeMoment.text ? <p className="water-experience__copy">{activeMoment.text}</p> : null}
        {activeMoment.secondLine ? <p className="water-experience__revelation">{activeMoment.secondLine}</p> : null}

        {activeIndex === 0 && roomContext ? (
          <Link className="water-experience__return" href={roomContext.returnHref}>
            {roomContext.mobileText} · {roomContext.returnLabel}
          </Link>
        ) : null}

        {isLastMoment ? (
          <div className="water-experience__exits">
            <Link href="/raeume/licht?from=journey&path=journey-wasser-geist&symbol=licht" className="water-experience__primary-exit">
              Weiter zum Licht-Raum <span aria-hidden="true" />
            </Link>
            <div className="water-experience__codex-exits" aria-label="Im Codex vertiefen">
              <Link href="/codex/majim">MAJIM im Codex</Link>
              <Link href="/codex/genesis-1-2">Genesis 1,2 lesen</Link>
              <Link href="/codex/tiefe">Tiefe öffnen</Link>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="water-experience__continue"
            onClick={() => setActiveIndex((index) => Math.min(index + 1, waterMoments.length - 1))}
          >
            {activeIndex === 0 ? "In die Tiefe" : "Weiter lauschen"}
            <span aria-hidden="true" />
          </button>
        )}
      </section>

      <aside className="water-experience__trace">
        <RoomPersonalTraceCard symbolSlug="wasser" roomContext={roomContext} />
      </aside>
    </main>
  );
}
