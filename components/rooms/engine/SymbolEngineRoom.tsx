"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { SymbolEngineData } from "@/types/engine";
import { recordRoomVisitForRoute } from "@/lib/pathActivity";
import type { RoomContext } from "@/lib/rooms/roomContext";
import { getCodexHref, getSymbolNetworkHref, getSymbolPathConfig } from "@/lib/symbols/symbolPathConfig";
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

function RoomOnwardLinks({ data, context }: { data: SymbolEngineData; context?: RoomContext }) {
  const codexHref = getCodexHref(data.slug);
  const symbolNetworkHref = getSymbolNetworkHref(data.slug);
  const defaultReturnHrefs = new Set<string>([codexHref, symbolNetworkHref]);
  const contextReturnLink = context && !defaultReturnHrefs.has(context.returnHref) ? context : undefined;

  return (
    <div className="symbol-engine__onward">
      <p>Weiter vertiefen</p>
      <div>
        <Link href="/mein-pfad">In Mein Pfad ansehen</Link>
        <Link href={codexHref}>Zurueck zu {data.symbolLabel} im Codex</Link>
        <Link href={symbolNetworkHref}>Zum Symbolnetz zurueckkehren</Link>
        {contextReturnLink ? <Link href={contextReturnLink.returnHref}>{contextReturnLink.returnLabel}</Link> : null}
      </div>
    </div>
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
        <nav className="mb-4 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-foreground-strong/45" aria-label="Raumpfad">
          <span>Raeume</span>
          <span aria-hidden="true">-&gt;</span>
          <span>{data.symbolLabel}</span>
        </nav>
        <p className="mb-3 text-[11px] uppercase tracking-[0.28em] text-gold/75">{roomTitle}</p>
        {roomContext ? <RoomEntryTrace context={roomContext} /> : null}
        <RoomPersonalTraceCard symbolSlug={data.slug} roomContext={roomContext} />
        <p className="symbol-engine__eyebrow">
          {String(engine.activeIndex + 1).padStart(2, "0")} / {String(data.states.length).padStart(2, "0")} ·{" "}
          {activeState.eyebrow}
        </p>
        <p className="symbol-engine__glyph" lang="he" dir="rtl">{data.hebrew.word}</p>
        <h1>{activeState.title}</h1>
        <p className="symbol-engine__text">{activeState.text}</p>
        <p className="symbol-engine__inscription">{activeState.inscription}</p>
        <div className="symbol-engine__actions">
          {!engine.isFirst ? (
            <button type="button" className="symbol-engine__back" onClick={engine.retreat}>
              Zurueck
            </button>
          ) : null}
          <button type="button" className="symbol-engine__action" onClick={engine.advance}>
            {engine.isLast ? "Reise erneut beginnen" : "Naechste Station"}
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
