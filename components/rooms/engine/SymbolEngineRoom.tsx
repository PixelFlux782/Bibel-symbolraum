"use client";

import { useState } from "react";
import type { SymbolEngineData } from "@/types/engine";
import { BiblicalSceneLayer } from "./BiblicalSceneLayer";
import { EngineNavigation } from "./EngineNavigation";
import { EngineStage } from "./EngineStage";
import { HebrewLayer } from "./HebrewLayer";
import { ReflectionOverlay } from "./ReflectionOverlay";
import { SymbolConnectionPanel } from "./SymbolConnectionPanel";

export function SymbolEngineRoom({ data }: { data: SymbolEngineData }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeState = data.states[activeIndex];
  const isFirst = activeIndex === 0;
  const isLast = activeIndex === data.states.length - 1;
  const letters = data.hebrew.letters.filter((letter) => activeState.hebrewLetterIds.includes(letter.id));
  const scenes = data.scenes.filter((scene) => activeState.biblicalSceneIds.includes(scene.id));
  const connections = data.connections.filter((connection) => activeState.connectionIds.includes(connection.id));

  const advance = () => setActiveIndex(isLast ? 0 : activeIndex + 1);

  return (
    <EngineStage state={activeState}>
      <EngineNavigation states={data.states} activeIndex={activeIndex} onSelect={setActiveIndex} />

      <section className="symbol-engine__content" key={`${activeState.id}-content`}>
        <p className="symbol-engine__eyebrow">
          {String(activeIndex + 1).padStart(2, "0")} / {String(data.states.length).padStart(2, "0")} ·{" "}
          {activeState.eyebrow}
        </p>
        <p className="symbol-engine__glyph" lang="he" dir="rtl">{data.hebrew.word}</p>
        <h1>{activeState.title}</h1>
        <p className="symbol-engine__text">{activeState.text}</p>
        <p className="symbol-engine__inscription">{activeState.inscription}</p>
        <div className="symbol-engine__actions">
          {!isFirst ? (
            <button type="button" className="symbol-engine__back" onClick={() => setActiveIndex(activeIndex - 1)}>
              Zurueck
            </button>
          ) : null}
          <button type="button" className="symbol-engine__action" onClick={advance}>
            {isLast ? "Reise erneut beginnen" : "Naechste Station"}
            <span aria-hidden="true" />
          </button>
        </div>
      </section>

      <aside className="symbol-engine__layers">
        <HebrewLayer
          word={data.hebrew.word}
          transliteration={data.hebrew.transliteration}
          letters={letters}
          summary={activeState.hebrewSummary}
        />
        <BiblicalSceneLayer scenes={scenes} />
        <SymbolConnectionPanel connections={connections} />
        <ReflectionOverlay reflection={activeState.reflection} />
      </aside>
    </EngineStage>
  );
}
