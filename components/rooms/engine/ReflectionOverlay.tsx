"use client";

import { useState } from "react";
import type { ReflectionPrompt, SymbolEngineData, SymbolJourneyState } from "@/types/engine";
import { saveStoredReflection } from "@/lib/reflections";
import type { RoomContext } from "@/lib/rooms/roomContext";
import { getSymbolPathConfig } from "@/lib/symbols/symbolPathConfig";

type ReflectionOverlayProps = {
  data: SymbolEngineData;
  reflection: ReflectionPrompt;
  roomContext?: RoomContext;
  state: SymbolJourneyState;
};

function createReflectionId(symbolId: string, stateId: string) {
  return `reflection-${symbolId}-${stateId}-${Date.now()}`;
}

export function ReflectionOverlay({ data, reflection, roomContext, state }: ReflectionOverlayProps) {
  const [answer, setAnswer] = useState("");
  const [saved, setSaved] = useState(false);
  const symbolBridge = getSymbolPathConfig(data.slug);

  function saveReflection() {
    const trimmedAnswer = answer.trim();

    if (!trimmedAnswer) return;

    saveStoredReflection({
      id: createReflectionId(data.slug, state.id),
      symbol: data.symbolLabel,
      symbolSlug: data.slug,
      hebrew: data.hebrew.word,
      title: data.symbolLabel,
      sourceType: "room",
      sourceId: symbolBridge?.reflectionSource.sourceId ?? data.slug,
      codexHref: symbolBridge?.codexHref ?? `/codex/${data.slug}`,
      question: reflection.question,
      answer: trimmedAnswer,
      stateId: state.id,
      stateTitle: state.title,
      roomHref: symbolBridge?.roomHref ?? `/raeume/${data.slug}`,
      pathLabel: roomContext?.mobileTitle,
      pathContext: roomContext ? { from: roomContext.source, path: roomContext.pathId, symbol: roomContext.symbolId } : undefined,
      createdAt: new Date().toISOString(),
    });
    setAnswer("");
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  return (
    <section className="symbol-engine__reflection" aria-label="Reflexionsfrage">
      <p>Spur aus diesem Raum</p>
      <blockquote>{reflection.question}</blockquote>
      <textarea
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
        aria-label={reflection.question}
        className="symbol-engine__reflection-input"
      />
      <div className="symbol-engine__reflection-actions">
        <button type="button" onClick={saveReflection} disabled={!answer.trim()}>
          Diese Spur bewahren
        </button>
        <span className={saved ? "is-visible" : ""}>Diese Spur wurde bewahrt.</span>
      </div>
    </section>
  );
}
