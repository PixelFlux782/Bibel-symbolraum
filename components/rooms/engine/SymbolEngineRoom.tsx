"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { SymbolEngineData } from "@/types/engine";
import type { SymbolNetworkRoomContext, SymbolNetworkRoomLens } from "@/lib/meaning/resolveRoomInitialStateId";
import { recordRoomVisitForRoute } from "@/lib/pathActivity";
import { getResonanceJourney } from "@/lib/resonance";
import { BiblicalSceneLayer } from "./BiblicalSceneLayer";
import { EngineNavigation } from "./EngineNavigation";
import { EngineStage } from "./EngineStage";
import { HebrewLayer } from "./HebrewLayer";
import { ReflectionOverlay } from "./ReflectionOverlay";
import { SymbolConnectionPanel } from "./SymbolConnectionPanel";
import { useSymbolEngine } from "./useSymbolEngine";

type SymbolEngineRoomProps = {
  data: SymbolEngineData;
  initialStateId?: string;
  symbolNetworkContext?: SymbolNetworkRoomContext;
};

const SYMBOL_NETWORK_LENS_HINTS: Partial<Record<SymbolNetworkRoomLens, (symbolLabel: string) => string>> = {
  meaning: (symbolLabel) => `Du betrittst ${symbolLabel} als Bedeutungsraum.`,
  hebrew: (symbolLabel) => `Du betrittst ${symbolLabel} von seiner hebraeischen Spur her.`,
  gematria: (symbolLabel) => `Du betrittst ${symbolLabel} von seiner Zahl her.`,
  story: (symbolLabel) => `Du betrittst ${symbolLabel} aus einer Erzaehlspur.`,
};

function buildSymbolNetworkReturnHref(context: SymbolNetworkRoomContext) {
  const params = new URLSearchParams({
    symbol: context.symbol,
    lens: context.lens,
  });

  if (context.path) {
    params.set("path", context.path);
  }

  return `/symbolnetz?${params.toString()}`;
}

function SymbolNetworkRoomTrace({
  context,
  symbolLabel,
}: {
  context: SymbolNetworkRoomContext;
  symbolLabel: string;
}) {
  const lensHint = SYMBOL_NETWORK_LENS_HINTS[context.lens]?.(symbolLabel);
  const resonanceJourney = context.path ? getResonanceJourney(context.path) : undefined;

  return (
    <div className="mb-8 max-w-xl border-l border-gold/20 pl-4 text-[10px] uppercase tracking-[0.18em] text-gold/70">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p>Aus dem Symbolnetz</p>
        <Link href={buildSymbolNetworkReturnHref(context)} className="text-cyan-soft/80 transition-colors hover:text-cyan-soft focus-visible:text-cyan-soft">
          Zur&uuml;ck zur Karte
        </Link>
      </div>
      {lensHint ? <p className="mt-2 normal-case tracking-normal text-foreground-strong/65">{lensHint}</p> : null}
      {resonanceJourney ? (
        <p className="mt-2 normal-case tracking-normal text-gold/75">
          Resonanzpfad: {resonanceJourney.title}
        </p>
      ) : null}
    </div>
  );
}

export function SymbolEngineRoom({ data, initialStateId, symbolNetworkContext }: SymbolEngineRoomProps) {
  const engine = useSymbolEngine(data, { initialStateId });
  const { activeState } = engine;

  useEffect(() => {
    recordRoomVisitForRoute({
      symbolId: data.slug,
      roomHref: `/raeume/${data.slug}`,
      routeKey: `room:${data.slug}`,
    });
  }, [data.slug]);

  return (
    <EngineStage state={activeState}>
      <EngineNavigation states={data.states} activeIndex={engine.activeIndex} onSelect={engine.selectState} />

      <section className="symbol-engine__content" key={`${activeState.id}-content`}>
        {symbolNetworkContext ? (
          <SymbolNetworkRoomTrace context={symbolNetworkContext} symbolLabel={data.symbolLabel} />
        ) : null}
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
          state={activeState}
        />
      </aside>
    </EngineStage>
  );
}
