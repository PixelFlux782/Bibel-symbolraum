"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const FULL_GATE_DURATION_MS = 2200;
const REDUCED_GATE_DURATION_MS = 700;

type JourneyGateProps = {
  title: string;
  bridgeText?: string;
  journeyText?: string;
  hebrew: string;
  onComplete: () => void;
};

export function JourneyGate({
  title,
  bridgeText,
  journeyText,
  hebrew,
  onComplete,
}: JourneyGateProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => typeof window !== "undefined"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const hasCompletedRef = useRef(false);
  const complete = useCallback(() => {
    if (hasCompletedRef.current) {
      return;
    }

    hasCompletedRef.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(
      complete,
      prefersReducedMotion ? REDUCED_GATE_DURATION_MS : FULL_GATE_DURATION_MS,
    );

    return () => window.clearTimeout(timeout);
  }, [complete, prefersReducedMotion]);

  return (
    <section className="journey-gate" aria-label="Bedeutungsschwelle" aria-live="polite">
      <div className="journey-gate__glow" aria-hidden="true" />
      <div className="journey-gate__thread" aria-hidden="true" />
      <div className="journey-gate__content">
        <p className="journey-gate__kicker">Bedeutungsschwelle</p>
        <p className="journey-gate__hebrew" lang="he" dir="rtl">{hebrew}</p>
        <h2 className="journey-gate__title">{title}</h2>
        {bridgeText ? <p className="journey-gate__bridge">{bridgeText}</p> : null}
        {journeyText && journeyText !== bridgeText ? (
          <p className="journey-gate__journey">{journeyText}</p>
        ) : null}
        <button type="button" onClick={complete} className="journey-gate__skip">
          Schwelle ueberspringen
        </button>
      </div>
    </section>
  );
}
