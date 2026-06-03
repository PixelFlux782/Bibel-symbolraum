"use client";

import { useEffect } from "react";
import type { SymbolEngineData } from "@/types/engine";
import { recordRoomVisitForRoute } from "@/lib/pathActivity";
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
};

export function SymbolEngineRoom({ data, initialStateId }: SymbolEngineRoomProps) {
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
