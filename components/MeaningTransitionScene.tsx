"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const FULL_SCENE_DURATION_MS = 1800;
const REDUCED_SCENE_DURATION_MS = 600;

export type MeaningTransitionSymbol = {
  label: string;
  hebrew: string;
};

type MeaningTransitionSceneProps = {
  fromSymbol: MeaningTransitionSymbol;
  toSymbol: MeaningTransitionSymbol;
  bridgeText?: string;
  journeyText?: string;
  meaningNodes: string[];
  onComplete: () => void;
};

export function MeaningTransitionScene({
  fromSymbol,
  toSymbol,
  bridgeText,
  journeyText,
  meaningNodes,
  onComplete,
}: MeaningTransitionSceneProps) {
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
      prefersReducedMotion ? REDUCED_SCENE_DURATION_MS : FULL_SCENE_DURATION_MS,
    );

    return () => window.clearTimeout(timeout);
  }, [complete, prefersReducedMotion]);

  return (
    <section className="meaning-transition-scene" aria-label="Bedeutungsbewegung" aria-live="polite">
      <div className="meaning-transition-scene__veil" aria-hidden="true" />
      <div className="meaning-transition-scene__content">
        <p className="meaning-transition-scene__kicker">Bedeutungsbewegung</p>
        <div className="meaning-transition-scene__path">
          <div className="meaning-transition-scene__symbol">
            <p className="meaning-transition-scene__hebrew" lang="he" dir="rtl">{fromSymbol.hebrew}</p>
            <p className="meaning-transition-scene__label">{fromSymbol.label}</p>
          </div>
          <span className="meaning-transition-scene__arrow" aria-hidden="true">&darr;</span>
          <div className="meaning-transition-scene__nodes">
            {meaningNodes.map((node, index) => (
              <p className="meaning-transition-scene__node" key={`${node}-${index}`}>{node}</p>
            ))}
          </div>
          <span className="meaning-transition-scene__arrow" aria-hidden="true">&darr;</span>
          <div className="meaning-transition-scene__symbol">
            <p className="meaning-transition-scene__hebrew" lang="he" dir="rtl">{toSymbol.hebrew}</p>
            <p className="meaning-transition-scene__label">{toSymbol.label}</p>
          </div>
        </div>
        {bridgeText ? <p className="meaning-transition-scene__bridge">{bridgeText}</p> : null}
        {journeyText && journeyText !== bridgeText ? (
          <p className="meaning-transition-scene__journey">{journeyText}</p>
        ) : null}
        <button type="button" onClick={complete} className="meaning-transition-scene__skip">
          Szene ueberspringen
        </button>
      </div>
    </section>
  );
}
