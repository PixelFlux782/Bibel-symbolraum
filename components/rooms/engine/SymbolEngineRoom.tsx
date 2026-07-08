"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { SymbolEngineData } from "@/types/engine";
import { recordRoomVisitForRoute } from "@/lib/pathActivity";
import type { RoomContext } from "@/lib/rooms/roomContext";
import { getSymbolPathConfig } from "@/lib/symbols/symbolPathConfig";
import { BiblicalSceneLayer } from "./BiblicalSceneLayer";
import { EngineNavigation } from "./EngineNavigation";
import { EngineStage } from "./EngineStage";
import { HebrewLayer } from "./HebrewLayer";
import { ReflectionOverlay } from "./ReflectionOverlay";
import { RoomPersonalTraceCard } from "./RoomPersonalTraceCard";
import { SymbolConnectionPanel } from "./SymbolConnectionPanel";
import { useSymbolEngine } from "./useSymbolEngine";

type SymbolEngineRoomProps = {
  data: SymbolEngineData;
  initialStateId?: string;
  roomContext?: RoomContext;
};

type RoomProfile = {
  essence: string;
  experience: string[];
  axes: string[];
};

const roomProfiles: Record<string, RoomProfile> = {
  wasser: {
    essence: "Eine dunkle Tiefe, die trägt, bevor Worte und Formen entstehen.",
    experience: [
      "Wasser empfängt, bevor es erklärt.",
      "In seiner Tiefe liegen Übergang, Reinigung und neuer Anfang dicht beieinander.",
      "Ruach berührt die Wasser; doch das Geheimnis bleibt größer als eine einzige Ursprungserzählung.",
    ],
    axes: ["Tiefe", "Übergang", "Reinigung", "Geburt"],
  },
  licht: {
    essence: "Eine warme Klarheit, in der Konturen hervortreten und Orientierung wächst.",
    experience: [
      "Licht macht nicht alles auf einmal sichtbar.",
      "Es öffnet einen stillen Abstand, in dem Sehen, Erkennen und Ordnen möglich werden.",
    ],
    axes: ["Offenbarung", "Sichtbarkeit", "Erkenntnis", "Ordnung"],
  },
  feuer: {
    essence: "Eine gesammelte Glut: Gegenwart, die wandelt, ohne zu überwältigen.",
    experience: [
      "Feuer zieht die Aufmerksamkeit in eine klare Mitte.",
      "Es prüft, läutert und verwandelt – ehrfürchtig, nicht aggressiv.",
    ],
    axes: ["Wandlung", "Prüfung", "Gegenwart", "Läuterung"],
  },
  wueste: {
    essence: "Eine weite Stille, in der Mangel, Weg und innere Stimme hörbar werden.",
    experience: [
      "Die Wüste ist kein Dekor aus Sand, sondern ein entleerter Innenraum.",
      "Was sonst übertönt wird, bekommt hier Zeit, Gewicht und Richtung.",
    ],
    axes: ["Mangel", "Weg", "Stille", "Prüfung"],
  },
  brot: {
    essence: "Eine schlichte Gabe, nah am Alltag und nah am Leben.",
    experience: [
      "Brot liegt in der Hand, wird gebrochen und geteilt.",
      "Gerade im Gewöhnlichen öffnet sich seine Tiefe: Nahrung, Haus, Gabe und Leben.",
    ],
    axes: ["Gabe", "Nahrung", "Alltag", "Leben"],
  },
};

function RoomEntryTrace({ context }: { context: RoomContext }) {
  return (
    <div className="symbol-engine__entry-trace">
      <div className="symbol-engine__entry-desktop">
        <p className="symbol-engine__entry-title">{context.title}</p>
        <p className="symbol-engine__entry-copy">{context.text}</p>
      </div>
      <div className="symbol-engine__entry-mobile">
        <p className="symbol-engine__entry-title">{context.mobileTitle}</p>
        <p className="symbol-engine__entry-copy">{context.mobileText}</p>
      </div>
      <Link href={context.returnHref} className="symbol-engine__entry-return">{context.returnLabel}</Link>
    </div>
  );
}

function RoomThresholds({ data }: { data: SymbolEngineData }) {
  const config = getSymbolPathConfig(data.slug);
  const gates = config?.codexGates;
  const meaningFields = gates?.meaningFields?.slice(0, 3) ?? [];
  const scripture = gates?.scriptureAnchors?.slice(0, 1) ?? [];

  return (
    <section className="symbol-engine__thresholds" aria-label="Codex-Schwellen">
      <p>Codex-Schwellen</p>
      <div>
        <Link href={config?.codexHref ?? `/codex/${data.slug}`}>{data.symbolLabel} vertiefen</Link>
        {meaningFields.map((gate) => gate.href ? <Link key={gate.id} href={gate.href}>{gate.label}</Link> : null)}
        {scripture.map((gate) => gate.href ? <Link key={gate.id} href={gate.href}>{gate.label}</Link> : null)}
      </div>
    </section>
  );
}

export function SymbolEngineRoom({ data, initialStateId, roomContext }: SymbolEngineRoomProps) {
  const engine = useSymbolEngine(data, { initialStateId });
  const { activeState } = engine;
  const profile = roomProfiles[data.slug] ?? {
    essence: activeState.text,
    experience: [activeState.text],
    axes: data.states.slice(0, 4).map((state) => state.navigationLabel),
  };
  const symbolPath = getSymbolPathConfig(data.slug);

  useEffect(() => {
    recordRoomVisitForRoute({
      symbolId: data.slug,
      roomHref: symbolPath?.roomHref ?? `/raeume/${data.slug}`,
      routeKey: `room:${data.slug}`,
    });
  }, [data.slug, symbolPath?.roomHref]);

  return (
    <EngineStage state={activeState}>
      <EngineNavigation
        states={data.states}
        activeIndex={engine.activeIndex}
        labels={profile.axes}
        onSelect={engine.selectState}
      />

      <section className="symbol-engine__content" key={`${activeState.id}-content`}>
        <p className="symbol-engine__room-label">{data.symbolLabel}-Raum</p>
        <p className="symbol-engine__glyph" lang="he" dir="rtl">{data.hebrew.word}</p>
        <h1>{data.symbolLabel}</h1>
        <p className="symbol-engine__essence">{profile.essence}</p>

        <section className="symbol-engine__first-experience" aria-label="Erste Erfahrung">
          {profile.experience.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </section>

        {roomContext ? <RoomEntryTrace context={roomContext} /> : null}
        <RoomPersonalTraceCard symbolSlug={data.slug} roomContext={roomContext} />

        <div className="symbol-engine__active-axis">
          <p className="symbol-engine__eyebrow">{activeState.eyebrow}</p>
          <h2>{activeState.title}</h2>
          <p className="symbol-engine__text">{activeState.text}</p>
          <p className="symbol-engine__inscription">{activeState.inscription}</p>
        </div>

        <RoomThresholds data={data} />
        <Link
          href={symbolPath?.symbolNetworkHref ?? `/symbolnetz?symbol=${data.slug}`}
          className="symbol-engine__map-return"
        >
          Zur Karte · {data.symbolLabel} im Symbolnetz
        </Link>
      </section>

      <aside className="symbol-engine__layers">
        <div className="symbol-engine__dimension-bar">
          <p>Verwandte Zeichen</p>
          <div>
            <button type="button" className={engine.activeDimension === "connections" ? "is-active" : ""} onClick={() => engine.setActiveDimension("connections")}>Felder</button>
            <button type="button" className={engine.activeDimension === "biblical" ? "is-active" : ""} onClick={() => engine.setActiveDimension("biblical")}>Schriftanker</button>
            <button type="button" className={engine.activeDimension === "hebrew" ? "is-active" : ""} onClick={() => engine.setActiveDimension("hebrew")}>Wort &amp; Buchstaben</button>
          </div>
        </div>
        <div className="symbol-engine__active-layer" key={`${activeState.id}-${engine.activeDimension}`}>
          {engine.activeDimension === "hebrew" ? (
            <HebrewLayer activeLetter={engine.activeHebrewLetter} data={data} onSelect={engine.selectHebrewLetter} scenes={engine.biblicalScenes} state={activeState} />
          ) : null}
          {engine.activeDimension === "biblical" ? <BiblicalSceneLayer scenes={engine.biblicalScenes.slice(0, 2)} /> : null}
          {engine.activeDimension === "connections" ? <SymbolConnectionPanel connections={engine.symbolConnections.slice(0, 3)} /> : null}
        </div>
        <ReflectionOverlay data={data} reflection={engine.reflectionQuestion} roomContext={roomContext} state={activeState} />
      </aside>
    </EngineStage>
  );
}
