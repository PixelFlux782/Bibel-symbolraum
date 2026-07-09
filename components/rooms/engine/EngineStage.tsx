import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import type { SymbolJourneyState } from "@/types/engine";

type EngineStageProps = {
  state: SymbolJourneyState;
  children: ReactNode;
};

export function EngineStage({ state, children }: EngineStageProps) {
  const { visual } = state;

  return (
    <main
      className={`symbol-engine symbol-room-shell symbol-engine--${state.id}`}
      data-atmosphere={visual.atmosphere.id}
      data-light={visual.atmosphere.light}
      data-mood={visual.atmosphere.mood}
      data-motion={visual.atmosphere.motion}
      style={
        {
          "--symbol-engine-density": visual.atmosphere.density,
          "--symbol-engine-image-opacity": visual.imageOpacity ?? 1,
          "--symbol-engine-veil-opacity": visual.veilOpacity,
        } as CSSProperties
      }
    >
      <div className="symbol-engine__scenes" aria-hidden="true">
        <div className="symbol-engine__scene" key={`${state.id}-scene`}>
          <Image
            src={visual.image}
            alt={visual.alt}
            fill
            priority
            sizes="100vw"
            className="symbol-engine__image"
          />
          {visual.backgroundImage ? (
            <Image
              src={visual.backgroundImage}
              alt=""
              fill
              sizes="100vw"
              className="symbol-engine__background-image"
            />
          ) : null}
        </div>
      </div>
      <div className="symbol-engine__veil" />
      <div className="symbol-engine__current" />
      {children}
    </main>
  );
}
