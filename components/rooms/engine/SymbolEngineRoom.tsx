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
import { getRoomTransition, getRoomTransitionLabels } from "@/lib/symbols/roomTransitions";
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
        Beginne im Wasser. Der Anfang ist beruehrt, die Tiefe ist nicht leer, und deine Spur entsteht leise.
      </p>
    </aside>
  );
}

function RoomPreparationBlock({ symbolSlug }: { symbolSlug: string }) {
  const transition = getRoomTransition(symbolSlug);

  if (!transition) {
    return null;
  }

  const labels = getRoomTransitionLabels(transition);

  return (
    <aside className="symbol-engine__prepares-room" aria-label="Was dieser Raum vorbereitet">
      <p className="symbol-engine__prepares-room-title">Was dieser Raum vorbereitet</p>
      <p className="symbol-engine__prepares-room-target">-&gt; {labels.target}</p>
      <p className="symbol-engine__prepares-room-copy">{transition.title}.</p>
    </aside>
  );
}

const genesisRoomAnchors: Record<string, {
  title: string;
  text: string;
  traces: string[];
  codexHref: string;
  networkHref: string;
  onwardHref?: string;
  onwardLabel?: string;
}> = {
  wasser: {
    title: "Erste Bewegung",
    text: "Der Anfang ist beruehrt. Die Tiefe ist nicht leer. Der Geist schwebt ueber dem Wasser, bevor das Wort Licht oeffnet.",
    traces: ["Ursprung", "Tiefe", "Ruach", "Wort", "Licht"],
    codexHref: "/codex/genesis-1-2?from=raum&symbol=wasser",
    networkHref: "/symbolnetz?symbol=wasser&path=erste-bewegung",
    onwardHref: "/raeume/licht?from=wasser&path=erste-bewegung",
    onwardLabel: "Aus der Tiefe oeffnet sich das Licht",
  },
  licht: {
    title: "Erste Schriftspur: Genesis 1,3",
    text: "Das Wort oeffnet Licht. Was aus der Tiefe kam, wird sichtbar und beginnt zu unterscheiden.",
    traces: ["Wort", "Licht", "Offenbarung", "Unterscheidung"],
    codexHref: "/codex/genesis-1-3?from=raum&symbol=licht",
    networkHref: "/symbolnetz?symbol=licht&path=erste-bewegung",
  },
};

function GenesisRoomAnchor({ symbolSlug }: { symbolSlug: string }) {
  const anchor = genesisRoomAnchors[symbolSlug];

  if (!anchor) {
    return null;
  }

  return (
    <aside className="symbol-engine__prepares-room" aria-label={anchor.title}>
      <p className="symbol-engine__prepares-room-title">{anchor.title}</p>
      <p className="symbol-engine__prepares-room-copy">{anchor.text}</p>
      <p className="mt-3 text-[0.62rem] uppercase tracking-[0.16em] text-gold/70">
        {anchor.traces.join(" / ")}
      </p>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
        <Link href={anchor.codexHref} className="symbol-archive-action">Im Codex vertiefen</Link>
        <Link href={anchor.networkHref} className="symbol-archive-action">Im Symbolnetz ansehen</Link>
        {anchor.onwardHref && anchor.onwardLabel ? (
          <Link href={anchor.onwardHref} className="symbol-archive-action">{anchor.onwardLabel}</Link>
        ) : null}
      </div>
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
        Wo Licht offenbar wird, beginnt auch Feuer: nicht als Zerstörung, sondern als Läuterung,
        Wärme und innere Wandlung.
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
        Was im Feuer geläutert wurde, tritt in die Wüste: in den Raum der Leere, der Prüfung
        und der hörbaren Stimme.
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
        In der Wüste wird der Mangel hörbar. Dort, wo nichts festzuhalten bleibt, erscheint Brot
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
        <Link href={symbolNetworkHref}>Zum Symbolnetz zurückkehren</Link>
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
          <span>Räume</span>
          <span aria-hidden="true">-&gt;</span>
          <span>{data.symbolLabel}</span>
        </nav>
        <p className="mb-3 text-[11px] uppercase tracking-[0.28em] text-gold/75">{roomTitle}</p>
        {roomContext ? <RoomEntryTrace context={roomContext} /> : null}
        {!roomContext ? <WaterFirstEntryNotice symbolSlug={data.slug} /> : null}
        <RoomPersonalTraceCard symbolSlug={data.slug} roomContext={roomContext} />
        <GenesisRoomAnchor symbolSlug={data.slug} />
        <RoomPreparationBlock symbolSlug={data.slug} />
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
            <button type="button" className={engine.activeDimension === "hebrew" ? "is-active" : ""} onClick={() => engine.setActiveDimension("hebrew")}>Hebräisch</button>
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
