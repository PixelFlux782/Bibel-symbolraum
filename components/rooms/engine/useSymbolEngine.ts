"use client";

import { useState } from "react";
import type { EngineDimension, SymbolEngineData } from "@/types/engine";

export function useSymbolEngine(data: SymbolEngineData) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeDimension, setActiveDimension] = useState<EngineDimension>("hebrew");
  const [activeHebrewLetterId, setActiveHebrewLetterId] = useState(data.states[0].hebrewLetterIds[0]);

  const activeState = data.states[activeIndex];
  const activeHebrewLetter =
    data.hebrew.letters.find((letter) => letter.id === activeHebrewLetterId) ?? data.hebrew.letters[0];
  const visualState = activeState.visual;
  const reflectionQuestion = activeState.reflection;
  const biblicalScenes = data.scenes.filter((scene) => activeState.biblicalSceneIds.includes(scene.id));
  const symbolConnections = data.connections.filter((connection) => activeState.connectionIds.includes(connection.id));
  const atmosphereProfile = visualState.atmosphere;
  const isFirst = activeIndex === 0;
  const isLast = activeIndex === data.states.length - 1;

  const selectState = (index: number) => {
    const nextState = data.states[index];

    setActiveIndex(index);
    setActiveHebrewLetterId(nextState.hebrewLetterIds[0] ?? data.hebrew.letters[0].id);
  };

  const advance = () => selectState(isLast ? 0 : activeIndex + 1);
  const retreat = () => selectState(Math.max(0, activeIndex - 1));

  return {
    activeDimension,
    activeHebrewLetter,
    activeIndex,
    activeState,
    advance,
    atmosphereProfile,
    biblicalScenes,
    isFirst,
    isLast,
    reflectionQuestion,
    retreat,
    selectHebrewLetter: setActiveHebrewLetterId,
    selectState,
    setActiveDimension,
    symbolConnections,
    visualState,
  };
}
