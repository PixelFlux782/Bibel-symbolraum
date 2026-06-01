import type { SymbolEngineData } from "@/types/engine";

function isOpacity(value: number | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}

export function validateSymbolEngineData(data: SymbolEngineData): string[] {
  const errors: string[] = [];
  const hebrewLetterIds = new Set(data.hebrew.letters.map((letter) => letter.id));
  const biblicalSceneIds = new Set(data.scenes.map((scene) => scene.id));
  const connectionIds = new Set(data.connections.map((connection) => connection.id));

  if (data.states.length < 3) {
    errors.push("states: Mindestens 3 States pro Symbol erforderlich.");
  }

  if (!data.states[0]?.hebrewLetterIds.length) {
    errors.push("states[0].hebrewLetterIds: Mindestens eine HebrewLetterId erforderlich.");
  }

  data.states.forEach((state, index) => {
    const statePath = `states[${index}]`;

    state.hebrewLetterIds.forEach((id) => {
      if (!hebrewLetterIds.has(id)) {
        errors.push(`${statePath}.hebrewLetterIds: Unbekannte HebrewLetterId "${id}".`);
      }
    });

    state.biblicalSceneIds.forEach((id) => {
      if (!biblicalSceneIds.has(id)) {
        errors.push(`${statePath}.biblicalSceneIds: Unbekannte BiblicalSceneId "${id}".`);
      }
    });

    state.connectionIds.forEach((id) => {
      if (!connectionIds.has(id)) {
        errors.push(`${statePath}.connectionIds: Unbekannte ConnectionId "${id}".`);
      }
    });

    if (!state.visual) {
      errors.push(`${statePath}.visual: VisualState erforderlich.`);
    } else {
      if (!state.visual.atmosphere) {
        errors.push(`${statePath}.visual.atmosphere: AtmosphereProfile erforderlich.`);
      } else if (!isOpacity(state.visual.atmosphere.density)) {
        errors.push(`${statePath}.visual.atmosphere.density: Wert zwischen 0 und 1 erforderlich.`);
      }

      if (!isOpacity(state.visual.veilOpacity)) {
        errors.push(`${statePath}.visual.veilOpacity: Wert zwischen 0 und 1 erforderlich.`);
      }

      if (state.visual.imageOpacity !== undefined && !isOpacity(state.visual.imageOpacity)) {
        errors.push(`${statePath}.visual.imageOpacity: Wert zwischen 0 und 1 erforderlich.`);
      }
    }

    if (!state.reflection) {
      errors.push(`${statePath}.reflection: Reflection erforderlich.`);
    }
  });

  return errors;
}
