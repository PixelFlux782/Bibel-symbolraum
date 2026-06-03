"use client";

import { useState } from "react";
import type { ReflectionPrompt, SymbolEngineData, SymbolJourneyState } from "@/types/engine";
import { saveStoredReflection } from "@/lib/reflections";

type ReflectionOverlayProps = {
  data: SymbolEngineData;
  reflection: ReflectionPrompt;
  state: SymbolJourneyState;
};

function createReflectionId(symbolId: string, stateId: string) {
  return `reflection-${symbolId}-${stateId}-${Date.now()}`;
}

export function ReflectionOverlay({ data, reflection, state }: ReflectionOverlayProps) {
  const [answer, setAnswer] = useState("");
  const [saved, setSaved] = useState(false);

  function saveReflection() {
    const trimmedAnswer = answer.trim();

    if (!trimmedAnswer) return;

    saveStoredReflection({
      id: createReflectionId(data.slug, state.id),
      symbol: data.symbolLabel,
      symbolSlug: data.slug,
      hebrew: data.hebrew.word,
      question: reflection.question,
      answer: trimmedAnswer,
      stateId: state.id,
      stateTitle: state.title,
      roomHref: `/raeume/${data.slug}`,
      createdAt: new Date().toISOString(),
    });
    setAnswer("");
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  return (
    <section className="symbol-engine__reflection" aria-label="Reflexionsfrage">
      <p>{reflection.kicker}</p>
      <blockquote>{reflection.question}</blockquote>
      <textarea
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
        aria-label={reflection.question}
        className="symbol-engine__reflection-input"
      />
      <div className="symbol-engine__reflection-actions">
        <button type="button" onClick={saveReflection} disabled={!answer.trim()}>
          Reflexion speichern
        </button>
        <span className={saved ? "is-visible" : ""}>Gespeichert.</span>
      </div>
    </section>
  );
}
