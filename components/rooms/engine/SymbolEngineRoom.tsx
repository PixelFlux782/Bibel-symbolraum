"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import type { SymbolEngineData } from "@/types/engine";
import { recordRoomVisitForRoute } from "@/lib/pathActivity";
import {
  getReflectionPreview,
  getRoomReflectionForSymbol,
  readStoredReflections,
  STORED_REFLECTIONS_UPDATED_EVENT,
  type StoredReflection,
} from "@/lib/reflections";
import { getResonanceRoom } from "@/lib/resonance";
import type { RoomContext } from "@/lib/rooms/roomContext";
import { getCodexHref, getSymbolNetworkHref, getSymbolPathConfig } from "@/lib/symbols/symbolPathConfig";
import { getNextJourneyStep, getSymbolJourneyForSymbol } from "@/lib/symbols/symbolJourneys";
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

function getRoomTitle(symbolLabel: string) {
  return `${symbolLabel}-Raum`;
}

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
      <Link href={context.returnHref} className="symbol-engine__entry-return">
        {context.returnLabel}
      </Link>
    </div>
  );
}

function WaterFirstEntryNotice({ symbolSlug }: { symbolSlug: string }) {
  const [reflections, setReflections] = useState<StoredReflection[] | null>(null);

  useEffect(() => {
    function refreshReflections() {
      setReflections(readStoredReflections());
    }

    refreshReflections();

    window.addEventListener("storage", refreshReflections);
    window.addEventListener(STORED_REFLECTIONS_UPDATED_EVENT, refreshReflections);

    return () => {
      window.removeEventListener("storage", refreshReflections);
      window.removeEventListener(STORED_REFLECTIONS_UPDATED_EVENT, refreshReflections);
    };
  }, []);

  const hasPersonalWaterTrace = useMemo(() => {
    if (!reflections) return false;

    const reflection = getRoomReflectionForSymbol(reflections, symbolSlug);

    return Boolean(reflection && getReflectionPreview(reflection));
  }, [reflections, symbolSlug]);

  if (symbolSlug !== "wasser" || hasPersonalWaterTrace) {
    return null;
  }

  return (
    <aside className="symbol-engine__first-entry" aria-label="Erster Eintritt">
      <p className="symbol-engine__first-entry-title">Erster Eintritt</p>
      <p className="symbol-engine__first-entry-copy">
        Der Wasser-Raum oeffnet sich in der Tiefe. Wenn du antwortest, bleibt hier dein erster Nachklang.
      </p>
    </aside>
  );
}

const nextRoomNotices: Record<string, {
  blockedBySymbol: string;
  buttonLabel: string;
  copy: ReactNode;
  fallbackHref: string;
  nextSymbol: string;
}> = {
  wasser: {
    blockedBySymbol: "licht",
    buttonLabel: "Den Licht-Raum betreten",
    copy: "Aus der Tiefe hebt sich Licht. Eine leise Spur öffnet den Raum des Lichtes.",
    fallbackHref: "/raeume/licht",
    nextSymbol: "licht",
  },
  licht: {
    blockedBySymbol: "feuer",
    buttonLabel: "Den Feuer-Raum betreten",
    copy: (
      <>
        Wo Licht offenbar wird, beginnt auch Feuer: nicht als Zerst&ouml;rung, sondern als L&auml;uterung,
        W&auml;rme und innere Wandlung.
      </>
    ),
    fallbackHref: "/raeume/feuer",
    nextSymbol: "feuer",
  },
  feuer: {
    blockedBySymbol: "wueste",
    buttonLabel: "Den Wüste-Raum betreten",
    copy: (
      <>
        Was im Feuer gel&auml;utert wurde, tritt in die W&uuml;ste: in den Raum der Leere, der Pr&uuml;fung
        und der h&ouml;rbaren Stimme.
      </>
    ),
    fallbackHref: "/raeume/wueste",
    nextSymbol: "wueste",
  },
  wueste: {
    blockedBySymbol: "brot",
    buttonLabel: "Den Brot-Raum betreten",
    copy: (
      <>
        In der W&uuml;ste wird der Mangel h&ouml;rbar. Dort, wo nichts festzuhalten bleibt, erscheint Brot
        als Gabe in der Leere.
      </>
    ),
    fallbackHref: "/raeume/brot",
    nextSymbol: "brot",
  },
};

function NextRoomNotice({ symbolSlug }: { symbolSlug: string }) {
  const [reflections, setReflections] = useState<StoredReflection[] | null>(null);
  const notice = nextRoomNotices[symbolSlug];

  useEffect(() => {
    function refreshReflections() {
      setReflections(readStoredReflections());
    }

    refreshReflections();

    window.addEventListener("storage", refreshReflections);
    window.addEventListener(STORED_REFLECTIONS_UPDATED_EVENT, refreshReflections);

    return () => {
      window.removeEventListener("storage", refreshReflections);
      window.removeEventListener(STORED_REFLECTIONS_UPDATED_EVENT, refreshReflections);
    };
  }, []);

  const nextStep = useMemo(() => {
    if (!notice) return undefined;

    const journey = getSymbolJourneyForSymbol(symbolSlug);

    return getNextJourneyStep(journey?.id, symbolSlug);
  }, [notice, symbolSlug]);

  const hasCurrentRoomTrace = useMemo(() => {
    if (!reflections) return false;

    const reflection = getRoomReflectionForSymbol(reflections, symbolSlug);

    return Boolean(reflection && getReflectionPreview(reflection));
  }, [reflections, symbolSlug]);

  const hasNextRoomTrace = useMemo(() => {
    if (!reflections || !notice) return false;

    const reflection = getRoomReflectionForSymbol(reflections, notice.blockedBySymbol);

    return Boolean(reflection && getReflectionPreview(reflection));
  }, [notice, reflections]);

  if (!notice || !hasCurrentRoomTrace || hasNextRoomTrace) {
    return null;
  }

  const href = nextStep?.symbol === notice.nextSymbol ? nextStep.roomHref : notice.fallbackHref;

  return (
    <aside className="symbol-engine__next-room" aria-label="Eine Spur öffnet sich">
      <p className="symbol-engine__next-room-title">Eine Spur öffnet sich</p>
      <p className="symbol-engine__next-room-copy">{notice.copy}</p>
      <Link href={href} className="symbol-engine__next-room-link">
        {notice.buttonLabel}
      </Link>
    </aside>
  );
}

function RoomOnwardLinks({ data, context }: { data: SymbolEngineData; context?: RoomContext }) {
  const codexHref = getCodexHref(data.slug);
  const symbolNetworkHref = getSymbolNetworkHref(data.slug);
  const defaultReturnHrefs = new Set<string>([codexHref, symbolNetworkHref]);
  const contextReturnLink = context && !defaultReturnHrefs.has(context.returnHref) ? context : undefined;

  return (
    <div className="symbol-engine__onward">
      <p>Von hier aus</p>
      <div>
        <Link href="/mein-pfad">Den Weg ansehen</Link>
        <Link href={codexHref}>{data.symbolLabel} im Codex lesen</Link>
        <Link href={symbolNetworkHref}>Zum Symbolnetz zurueckkehren</Link>
        {contextReturnLink ? <Link href={contextReturnLink.returnHref}>{contextReturnLink.returnLabel}</Link> : null}
      </div>
    </div>
  );
}

function ResonanceRoomReadout({ symbolSlug }: { symbolSlug: string }) {
  const resonanceRoom = getResonanceRoom(symbolSlug);

  if (resonanceRoom.statements.length === 0) {
    return null;
  }

  return (
    <section className="symbol-engine__resonance-room" aria-label="Resonanzraum">
      <p className="symbol-engine__resonance-room-title">Resonanzraum</p>
      <ul>
        {resonanceRoom.statements.map((statement) => (
          <li key={`${statement.type}-${statement.text}`}>{statement.text}</li>
        ))}
      </ul>
    </section>
  );
}

export function SymbolEngineRoom({ data, initialStateId, roomContext }: SymbolEngineRoomProps) {
  const engine = useSymbolEngine(data, { initialStateId });
  const { activeState } = engine;
  const roomTitle = getRoomTitle(data.symbolLabel);

  useEffect(() => {
    const symbolPath = getSymbolPathConfig(data.slug);

    recordRoomVisitForRoute({
      symbolId: data.slug,
      roomHref: symbolPath?.roomHref ?? `/raeume/${data.slug}`,
      routeKey: `room:${data.slug}`,
    });
  }, [data.slug]);

  return (
    <EngineStage state={activeState}>
      <EngineNavigation states={data.states} activeIndex={engine.activeIndex} onSelect={engine.selectState} />

      <section className="symbol-engine__content" key={`${activeState.id}-content`}>
        <nav className="mb-4 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-foreground-strong/45" aria-label="Raumweg">
          <span>Raeume</span>
          <span aria-hidden="true">-&gt;</span>
          <span>{data.symbolLabel}</span>
        </nav>
        <p className="mb-3 text-[11px] uppercase tracking-[0.28em] text-gold/75">{roomTitle}</p>
        {roomContext ? <RoomEntryTrace context={roomContext} /> : null}
        {!roomContext ? <WaterFirstEntryNotice symbolSlug={data.slug} /> : null}
        <RoomPersonalTraceCard symbolSlug={data.slug} roomContext={roomContext} />
        <NextRoomNotice symbolSlug={data.slug} />
        <p className="symbol-engine__eyebrow">
          {String(engine.activeIndex + 1).padStart(2, "0")} / {String(data.states.length).padStart(2, "0")} ·{" "}
          {activeState.eyebrow}
        </p>
        <p className="symbol-engine__glyph" lang="he" dir="rtl">{data.hebrew.word}</p>
        <h1>{activeState.title}</h1>
        <p className="symbol-engine__text">{activeState.text}</p>
        <p className="symbol-engine__inscription">{activeState.inscription}</p>
        <ResonanceRoomReadout symbolSlug={data.slug} />
        <div className="symbol-engine__actions">
          {!engine.isFirst ? (
            <button type="button" className="symbol-engine__back" onClick={engine.retreat}>
              Zur vorherigen Tiefe
            </button>
          ) : null}
          <button type="button" className="symbol-engine__action" onClick={engine.advance}>
            {engine.isLast ? "Noch einmal in die Tiefe" : "Tiefer lauschen"}
            <span aria-hidden="true" />
          </button>
        </div>
        {engine.isLast ? <RoomOnwardLinks data={data} context={roomContext} /> : null}
      </section>

      <aside className="symbol-engine__layers">
        <div className="symbol-engine__dimension-bar">
          <p>Bedeutungsebene</p>
          <div>
            <button type="button" className={engine.activeDimension === "hebrew" ? "is-active" : ""} onClick={() => engine.setActiveDimension("hebrew")}>Hebraeisch</button>
            <button type="button" className={engine.activeDimension === "biblical" ? "is-active" : ""} onClick={() => engine.setActiveDimension("biblical")}>Bibelstelle</button>
            <button type="button" className={engine.activeDimension === "connections" ? "is-active" : ""} onClick={() => engine.setActiveDimension("connections")}>Symbolnetz</button>
          </div>
        </div>
        <div className="symbol-engine__active-layer" key={`${activeState.id}-${engine.activeDimension}`}>
          {engine.activeDimension === "hebrew" ? (
            <HebrewLayer
              activeLetter={engine.activeHebrewLetter}
              data={data}
              onSelect={engine.selectHebrewLetter}
              scenes={engine.biblicalScenes}
              state={activeState}
            />
          ) : null}
          {engine.activeDimension === "biblical" ? <BiblicalSceneLayer scenes={engine.biblicalScenes} /> : null}
          {engine.activeDimension === "connections" ? <SymbolConnectionPanel connections={engine.symbolConnections} /> : null}
        </div>
        <ReflectionOverlay
          data={data}
          reflection={engine.reflectionQuestion}
          roomContext={roomContext}
          state={activeState}
        />
      </aside>
    </EngineStage>
  );
}
