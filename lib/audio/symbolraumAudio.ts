"use client";

export type SymbolraumAudioLayer = "base" | "water" | "light" | "fire" | "desert" | "bread";
export type SymbolraumRoom = "wasser" | "licht" | "feuer" | "wueste" | "brot";

export type SymbolraumMix = Record<SymbolraumAudioLayer, number>;

const AUDIO_ROOT = "/audio/symbolraum";
const DEFAULT_CROSSFADE_MS = 5600;

const LAYERS: Record<SymbolraumAudioLayer, string> = {
  base: `${AUDIO_ROOT}/base_layer3.mp3`,
  water: `${AUDIO_ROOT}/water_layer1.mp3`,
  light: `${AUDIO_ROOT}/light_layer1.mp3`,
  fire: `${AUDIO_ROOT}/fire_layer1.mp3`,
  desert: `${AUDIO_ROOT}/desert_layer2.mp3`,
  bread: `${AUDIO_ROOT}/bread_layer1.mp3`,
};

const SILENCE_MIX: SymbolraumMix = {
  base: 0,
  water: 0,
  light: 0,
  fire: 0,
  desert: 0,
  bread: 0,
};

const ROOM_MIXES: Record<SymbolraumRoom, SymbolraumMix> = {
  wasser: {
    base: 1,
    water: 0.7,
    light: 0,
    fire: 0,
    desert: 0,
    bread: 0,
  },
  licht: {
    base: 1,
    water: 0.2,
    light: 0.7,
    fire: 0,
    desert: 0,
    bread: 0,
  },
  feuer: {
    base: 1,
    water: 0,
    light: 0.2,
    fire: 0.7,
    desert: 0,
    bread: 0,
  },
  wueste: {
    base: 1,
    water: 0,
    light: 0,
    fire: 0.1,
    desert: 0.6,
    bread: 0,
  },
  brot: {
    base: 1,
    water: 0,
    light: 0,
    fire: 0,
    desert: 0.1,
    bread: 0.7,
  },
};

function clampVolume(value: number) {
  return Math.min(1, Math.max(0, value));
}

function getRoomFromPath(pathname: string | null): SymbolraumRoom | null {
  if (!pathname) {
    return null;
  }

  const match = pathname.match(/^\/raeume\/(wasser|licht|feuer|wueste|brot)(?:\/|$)/);
  return match ? match[1] as SymbolraumRoom : null;
}

class SymbolraumAudioEngine {
  private elements = new Map<SymbolraumAudioLayer, HTMLAudioElement>();
  private layerLevels: SymbolraumMix = { ...SILENCE_MIX };
  private targetMix: SymbolraumMix = { ...SILENCE_MIX };
  private globalVolume = 0.52;
  private muted = false;
  private active = false;
  private initialized = false;
  private fadeFrame: number | null = null;

  activate() {
    if (typeof window === "undefined") {
      return Promise.resolve(false);
    }

    this.ensureElements();
    this.active = true;
    this.applyComputedVolumes();

    const playTasks = Array.from(this.elements.values()).map((audio) => {
      if (!audio.paused) {
        return Promise.resolve();
      }

      return audio.play().catch(() => undefined);
    });

    return Promise.all(playTasks).then(() => true);
  }

  deactivate() {
    this.active = false;
    this.fadeTo(SILENCE_MIX, 1800);
  }

  dispose() {
    this.cancelFade();
    this.elements.forEach((audio) => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    });
    this.elements.clear();
    this.initialized = false;
    this.active = false;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    this.applyComputedVolumes();
  }

  setGlobalVolume(volume: number) {
    this.globalVolume = clampVolume(volume);
    this.applyComputedVolumes();
  }

  setRoomFromPath(pathname: string | null, fadeMs = DEFAULT_CROSSFADE_MS) {
    const room = getRoomFromPath(pathname);
    this.setRoom(room, fadeMs);
    return room;
  }

  setRoom(room: SymbolraumRoom | null, fadeMs = DEFAULT_CROSSFADE_MS) {
    const nextMix = room ? ROOM_MIXES[room] : SILENCE_MIX;
    this.targetMix = { ...nextMix };

    if (!this.active) {
      this.layerLevels = { ...nextMix };
      this.applyComputedVolumes();
      return;
    }

    this.fadeTo(nextMix, fadeMs);
  }

  private ensureElements() {
    if (this.initialized || typeof window === "undefined") {
      return;
    }

    (Object.entries(LAYERS) as Array<[SymbolraumAudioLayer, string]>).forEach(([layer, src]) => {
      const audio = new Audio(src);
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = 0;
      audio.crossOrigin = "anonymous";
      this.elements.set(layer, audio);
    });

    this.initialized = true;
  }

  private fadeTo(nextMix: SymbolraumMix, durationMs: number) {
    if (typeof window === "undefined") {
      return;
    }

    this.ensureElements();
    this.cancelFade();

    const start = performance.now();
    const fromMix = { ...this.layerLevels };
    const duration = Math.max(4000, Math.min(7000, durationMs));

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      (Object.keys(LAYERS) as SymbolraumAudioLayer[]).forEach((layer) => {
        const from = fromMix[layer];
        const to = nextMix[layer];
        this.layerLevels[layer] = from + (to - from) * eased;
      });

      this.applyComputedVolumes();

      if (progress < 1) {
        this.fadeFrame = window.requestAnimationFrame(step);
        return;
      }

      this.layerLevels = { ...nextMix };
      this.fadeFrame = null;
      this.applyComputedVolumes();
    };

    this.fadeFrame = window.requestAnimationFrame(step);
  }

  private cancelFade() {
    if (this.fadeFrame === null || typeof window === "undefined") {
      return;
    }

    window.cancelAnimationFrame(this.fadeFrame);
    this.fadeFrame = null;
  }

  private applyComputedVolumes() {
    this.elements.forEach((audio, layer) => {
      audio.volume = this.muted ? 0 : clampVolume(this.layerLevels[layer] * this.globalVolume);
    });
  }
}

const symbolraumAudioEngine = new SymbolraumAudioEngine();

export {
  DEFAULT_CROSSFADE_MS,
  ROOM_MIXES,
  getRoomFromPath,
  symbolraumAudioEngine,
};
