"use client";

import { useRef, useState } from "react";
import type { ReflectionPrompt, SymbolEngineData, SymbolJourneyState } from "@/types/engine";
import { symbolraumAudioEngine } from "@/lib/audio/symbolraumAudio";
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

function getReflectionSourceLabel(roomContext: RoomContext | undefined, fallback: string) {
  return roomContext?.pathLabel ? `Deine Spur aus: ${roomContext.pathLabel}` : fallback;
}

export function ReflectionOverlay({ data, reflection, roomContext, state }: ReflectionOverlayProps) {
  const [saved, setSaved] = useState(false);
  const answerRef = useRef<HTMLTextAreaElement>(null);
  const symbolBridge = getSymbolPathConfig(data.slug);
  const isWaterRoom = data.slug === "wasser";

  function saveReflection() {
    const trimmedAnswer = answerRef.current?.value.trim() ?? "";

    if (!trimmedAnswer) return;

    saveStoredReflection({
      id: createReflectionId(data.slug, state.id),
      symbol: data.symbolLabel,
      symbolSlug: data.slug,
      room: data.slug,
      hebrew: data.hebrew.word,
      title: data.symbolLabel,
      sourceType: "room",
      sourceId: symbolBridge?.reflectionSource.sourceId ?? data.slug,
      source: roomContext?.source ?? "room",
      sourceLabel: getReflectionSourceLabel(roomContext, symbolBridge?.reflectionSource.contextLabel ?? `Spur aus dem ${data.symbolLabel}-Raum`),
      codexHref: symbolBridge?.codexHref ?? `/codex/${data.slug}`,
      question: reflection.question,
      answer: trimmedAnswer,
      text: trimmedAnswer,
      stateId: state.id,
      stateTitle: state.title,
      roomHref: symbolBridge?.roomHref ?? `/raeume/${data.slug}`,
      pathLabel: roomContext?.pathLabel,
      from: roomContext?.source,
      path: roomContext?.pathId,
      pathContext: roomContext ? { from: roomContext.source, path: roomContext.pathId, symbol: roomContext.symbolId } : undefined,
      createdAt: new Date().toISOString(),
    });
    if (answerRef.current) {
      answerRef.current.value = "";
    }
    setSaved(true);
    symbolraumAudioEngine.playInteraction("save_trace", {
      trigger: `room-trace:${data.slug}:${state.id}`,
      dedupeKey: `save-trace:room:${data.slug}:${state.id}`,
      dedupeMs: 800,
    });
    window.setTimeout(() => setSaved(false), 1600);
  }

  return (
    <section className="symbol-engine__reflection" aria-label="Reflexionsfrage">
      <p>{isWaterRoom ? "Eine Spur aufnehmen" : "Spur aus diesem Raum"}</p>
      <blockquote>{reflection.question}</blockquote>
      {isWaterRoom ? (
        <span className="symbol-engine__reflection-hint">Antworte leise. Die Spur bleibt in deinem Pfad.</span>
      ) : null}
      <textarea
        ref={answerRef}
        aria-label={reflection.question}
        className="symbol-engine__reflection-input"
      />
      <div className="symbol-engine__reflection-actions">
        <button type="button" onClick={saveReflection}>
          Diese Spur bewahren
        </button>
        <span className={saved ? "is-visible" : ""}>Diese Spur wurde bewahrt.</span>
      </div>
    </section>
  );
}
