"use client";

import { useState } from "react";
import { saveStoredReflection, type StoredReflection } from "@/lib/reflections";

type CodexReflectionCardProps = {
  title: string;
  hebrew?: string | null;
  question: string;
  sourceType: NonNullable<StoredReflection["sourceType"]>;
  sourceId: string;
  codexHref: string;
  roomHref?: string;
  pathLabel?: string;
  pathContext?: StoredReflection["pathContext"];
};

function createReflectionId(sourceId: string) {
  return `reflection-${sourceId}-${Date.now()}`;
}

export function CodexReflectionCard({
  title,
  hebrew,
  question,
  sourceType,
  sourceId,
  codexHref,
  roomHref,
  pathLabel,
  pathContext,
}: CodexReflectionCardProps) {
  const [answer, setAnswer] = useState("");
  const [saved, setSaved] = useState(false);

  function saveReflection() {
    const trimmedAnswer = answer.trim();

    if (!trimmedAnswer) return;

    saveStoredReflection({
      id: createReflectionId(sourceId),
      symbol: title,
      symbolSlug: roomHref ? sourceId : undefined,
      hebrew: hebrew ?? "",
      title,
      sourceType,
      sourceId,
      codexHref,
      roomHref,
      pathLabel,
      pathContext,
      question,
      answer: trimmedAnswer,
      createdAt: new Date().toISOString(),
    });
    setAnswer("");
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <section className="symbol-archive-fragment p-5 sm:p-6" aria-label="Spur aufnehmen">
      <p className="symbol-kicker text-cyan-soft">Spur aufnehmen</p>
      {pathLabel ? (
        <p className="mt-3 font-serif text-lg italic text-gold/80">{pathLabel}</p>
      ) : null}
      <h2 className="mt-4 font-serif text-2xl italic leading-tight text-foreground-strong">
        {question}
      </h2>
      <textarea
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
        aria-label={question}
        className="symbol-reflection-field mt-5 min-h-28 w-full resize-y px-4 py-3 font-serif text-base leading-relaxed"
      />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={saveReflection} disabled={!answer.trim()} className="symbol-cta">
          In Mein Pfad bewahren
        </button>
        <p className={`symbol-copy text-sm italic text-cyan-soft transition-opacity duration-500 ${saved ? "opacity-100" : "opacity-0"}`}>
          Diese Spur wurde in Mein Pfad bewahrt.
        </p>
      </div>
    </section>
  );
}
