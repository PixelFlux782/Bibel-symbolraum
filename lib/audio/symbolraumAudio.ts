"use client";

export type SymbolraumAudioLayer = "base" | "water" | "light" | "fire" | "desert" | "bread";
export type SymbolraumRoom = "wasser" | "licht" | "feuer" | "wueste" | "brot";
export type SymbolraumInteractionSound = "button_press" | "hover" | "change_room" | "open_codex" | "save_trace";

export type SymbolraumMix = Record<SymbolraumAudioLayer, number>;
export type SymbolraumAudioDebugSnapshot = {
  currentRoom: SymbolraumRoom | null;
  assetLoadErrors: Partial<Record<SymbolraumAudioLayer | SymbolraumInteractionSound, string>>;
  interaction: {
    lastSound: SymbolraumInteractionSound | null;
    trigger: string | null;
    volume: number;
  };
};

const AUDIO_ROOT = "/audio/symbolraum";
const DEFAULT_CROSSFADE_MS = 5600;
const INTERACTION_POOL_SIZE = 4;
const DEFAULT_INTERACTION_DEDUPE_MS = 160;

const LAYERS: Record<SymbolraumAudioLayer, string> = {
  base: `${AUDIO_ROOT}/base_layer3.mp3`,
  water: `${AUDIO_ROOT}/water_layer1.mp3`,
  light: `${AUDIO_ROOT}/light_layer1.mp3`,
  fire: `${AUDIO_ROOT}/fire_layer1.mp3`,
  desert: `${AUDIO_ROOT}/desert_layer2.mp3`,
  bread: `${AUDIO_ROOT}/bread_layer1.mp3`,
};

const INTERACTION_SOUNDS: Record<SymbolraumInteractionSound, { src: string; volume: number }> = {
  button_press: { src: "/audio/button press/button_press1.mp3", volume: 0.2 },
  hover: { src: "/audio/hover/hover1.mp3", volume: 0.1 },
  change_room: { src: "/audio/change room/change_room1.mp3", volume: 0.18 },
  open_codex: { src: "/audio/open codex/open_codex.mp3", volume: 0.16 },
  save_trace: { src: "/audio/save_trace/save_trace1.mp3", volume: 0.17 },
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
    base: 0.6,
    water: 0.8,
    light: 0,
    fire: 0,
    desert: 0,
    bread: 0,
  },
  licht: {
    base: 0.4,
    water: 0.15,
    light: 0.75,
    fire: 0,
    desert: 0,
    bread: 0,
  },
  feuer: {
    base: 0.45,
    water: 0,
    light: 0.15,
    fire: 0.75,
    desert: 0,
    bread: 0,
  },
  wueste: {
    base: 0.25,
    water: 0,
    light: 0,
    fire: 0.08,
    desert: 0.6,
    bread: 0,
  },
  brot: {
    base: 0.35,
    water: 0,
    light: 0,
    fire: 0,
    desert: 0.08,
    bread: 0.75,
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

type AudioContextWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

function debugAudio(message: string, details?: unknown) {
  if (
    typeof window === "undefined" ||
    new URLSearchParams(window.location.search).get("audioDebug") !== "1"
  ) {
    return;
  }

  if (details === undefined) {
    console.log(`[symbolraum audio] ${message}`);
    return;
  }

  console.log(`[symbolraum audio] ${message}`, details);
}

function getAudioSnapshot(audio: HTMLAudioElement) {
  return {
    src: audio.currentSrc || audio.src,
    paused: audio.paused,
    muted: audio.muted,
    volume: audio.volume,
    readyState: audio.readyState,
    currentTime: audio.currentTime,
    error: audio.error,
  };
}

class SymbolraumAudioEngine {
  private elements = new Map<SymbolraumAudioLayer, HTMLAudioElement>();
  private interactionElements = new Map<SymbolraumInteractionSound, HTMLAudioElement[]>();
  private audioContext: AudioContext | null = null;
  private layerLevels: SymbolraumMix = { ...SILENCE_MIX };
  private targetMix: SymbolraumMix = { ...SILENCE_MIX };
  private globalVolume = 0.7;
  private muted = false;
  private active = false;
  private initialized = false;
  private fadeFrame: number | null = null;
  private currentRoom: SymbolraumRoom | null = null;
  private assetLoadErrors: Partial<Record<SymbolraumAudioLayer | SymbolraumInteractionSound, string>> = {};
  private lastInteractionSound: SymbolraumInteractionSound | null = null;
  private lastInteractionTrigger: string | null = null;
  private lastInteractionVolume = 0;
  private interactionDedupe = new Map<string, number>();

  async activate(options?: { pathname?: string | null; volume?: number; muted?: boolean }) {
    if (typeof window === "undefined") {
      return false;
    }

    this.cancelFade();
    this.ensureElements();
    this.setGlobalVolume(options?.volume ?? this.globalVolume);
    this.setMuted(Boolean(options?.muted));
    await this.resumeAudioContext();

    this.active = true;
    this.applyComputedVolumes();

    const playTasks = Array.from(this.elements.entries()).map(async ([layer, audio]) => {
      if (!audio.paused) {
        debugAudio("layer play called", { layer, alreadyPlaying: true });
        return;
      }

      debugAudio("layer play called", { layer, src: audio.currentSrc || audio.src });
      try {
        await audio.play();
      } catch (error) {
        debugAudio("layer play failed", { layer, error, audio: getAudioSnapshot(audio) });
      }
    });

    await Promise.all(playTasks);

    if (options?.pathname !== undefined) {
      debugAudio("current route", options.pathname);
      this.setRoomFromPath(options.pathname, 0);
    } else {
      this.setRoom(null, 0);
    }

    this.logLayerDiagnostics("after activate");
    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        this.logLayerFollowUpDiagnostics("2s after activate");
      }, 2000);
    }

    return true;
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
    this.interactionElements.forEach((pool) => {
      pool.forEach((audio) => {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      });
    });
    this.interactionElements.clear();
    this.initialized = false;
    this.active = false;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    debugAudio("muted state", muted);
    this.applyComputedVolumes();
    this.applyInteractionVolumes();
  }

  setGlobalVolume(volume: number) {
    this.globalVolume = clampVolume(volume);
    debugAudio("master volume", this.globalVolume);
    this.applyComputedVolumes();
    this.applyInteractionVolumes();
  }

  setRoomFromPath(pathname: string | null, fadeMs = DEFAULT_CROSSFADE_MS) {
    const room = getRoomFromPath(pathname);
    this.setRoom(room, fadeMs);
    return room;
  }

  getCurrentRoom() {
    return this.currentRoom;
  }

  setRoom(room: SymbolraumRoom | null, fadeMs = DEFAULT_CROSSFADE_MS) {
    const nextMix = room ? ROOM_MIXES[room] : SILENCE_MIX;
    this.currentRoom = room;
    this.targetMix = { ...nextMix };
    debugAudio("applied mix", { room, mix: nextMix });

    if (!this.active) {
      this.layerLevels = { ...nextMix };
      this.applyComputedVolumes();
      return;
    }

    if (fadeMs <= 0) {
      this.cancelFade();
      this.layerLevels = { ...nextMix };
      this.applyComputedVolumes();
      return;
    }

    this.fadeTo(nextMix, fadeMs);
  }

  async playTestTone() {
    if (typeof window === "undefined") {
      return false;
    }

    const context = this.ensureAudioContext();
    await this.resumeAudioContext();

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 440;
    gain.gain.value = this.muted ? 0 : Math.max(0.18, this.globalVolume * 0.25);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.18);
    debugAudio("test tone played", { contextState: context.state });
    return true;
  }

  playInteraction(
    sound: SymbolraumInteractionSound,
    options?: { trigger?: string; dedupeKey?: string; dedupeMs?: number },
  ) {
    if (typeof window === "undefined" || !this.active || this.muted) {
      return false;
    }

    this.ensureInteractionElements();

    const config = INTERACTION_SOUNDS[sound];
    const trigger = options?.trigger ?? sound;
    const dedupeKey = options?.dedupeKey ?? `${sound}:${trigger}`;
    const now = performance.now();
    const dedupeMs = options?.dedupeMs ?? DEFAULT_INTERACTION_DEDUPE_MS;
    const previousTrigger = this.interactionDedupe.get(dedupeKey);

    if (previousTrigger !== undefined && now - previousTrigger < dedupeMs) {
      return false;
    }

    this.interactionDedupe.set(dedupeKey, now);
    this.lastInteractionSound = sound;
    this.lastInteractionTrigger = trigger;
    this.lastInteractionVolume = config.volume;

    const pool = this.interactionElements.get(sound) ?? [];
    const audio = pool.find((item) => item.paused || item.ended) ?? pool[0];

    if (!audio) {
      return false;
    }

    try {
      audio.pause();
      audio.currentTime = 0;
      audio.muted = false;
      audio.volume = clampVolume(config.volume * this.globalVolume);
      const playTask = audio.play();
      if (playTask) {
        void playTask.catch((error: unknown) => {
          debugAudio("interaction play failed", { sound, trigger, error, audio: getAudioSnapshot(audio) });
        });
      }
      debugAudio("interaction played", { sound, trigger, volume: audio.volume });
      return true;
    } catch (error) {
      debugAudio("interaction play failed", { sound, trigger, error, audio: getAudioSnapshot(audio) });
      return false;
    }
  }

  getDebugSnapshot(): SymbolraumAudioDebugSnapshot {
    return {
      currentRoom: this.currentRoom,
      assetLoadErrors: { ...this.assetLoadErrors },
      interaction: {
        lastSound: this.lastInteractionSound,
        trigger: this.lastInteractionTrigger,
        volume: this.lastInteractionVolume,
      },
    };
  }

  async playBaseOnly() {
    if (typeof window === "undefined") {
      return false;
    }

    await this.activate({ pathname: null, volume: Math.max(this.globalVolume, 0.7), muted: false });
    this.setRoom(null, 0);
    this.layerLevels = { ...SILENCE_MIX, base: 1 };
    this.applyComputedVolumes();
    debugAudio("base only played");
    return true;
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
      audio.addEventListener("canplaythrough", () => {
        debugAudio("layer loaded", { layer, src });
      }, { once: true });
      audio.addEventListener("error", () => {
        const message = audio.error
          ? `${audio.error.code}: ${audio.error.message || "audio load failed"}`
          : "audio load failed";
        this.assetLoadErrors[layer] = `${src} (${message})`;
        debugAudio("layer load error", { layer, src, error: audio.error });
      });
      this.elements.set(layer, audio);
    });

    this.ensureInteractionElements();

    this.initialized = true;
  }

  private ensureInteractionElements() {
    if (typeof window === "undefined") {
      return;
    }

    (Object.entries(INTERACTION_SOUNDS) as Array<[SymbolraumInteractionSound, { src: string; volume: number }]>).forEach(([sound, config]) => {
      if (this.interactionElements.has(sound)) {
        return;
      }

      const pool = Array.from({ length: INTERACTION_POOL_SIZE }, () => {
        const audio = new Audio(config.src);
        audio.loop = false;
        audio.preload = "auto";
        audio.volume = 0;
        audio.crossOrigin = "anonymous";
        audio.addEventListener("canplaythrough", () => {
          debugAudio("interaction loaded", { sound, src: config.src });
        }, { once: true });
        audio.addEventListener("ended", () => {
          audio.currentTime = 0;
        });
        audio.addEventListener("error", () => {
          const message = audio.error
            ? `${audio.error.code}: ${audio.error.message || "audio load failed"}`
            : "audio load failed";
          this.assetLoadErrors[sound] = `${config.src} (${message})`;
          debugAudio("interaction load error", { sound, src: config.src, error: audio.error });
        });
        audio.load();
        return audio;
      });

      this.interactionElements.set(sound, pool);
    });
  }

  private ensureAudioContext() {
    if (this.audioContext) {
      return this.audioContext;
    }

    const audioWindow = window as AudioContextWindow;
    const AudioContextConstructor = audioWindow.AudioContext || audioWindow.webkitAudioContext;
    if (!AudioContextConstructor) {
      throw new Error("AudioContext is not available in this browser.");
    }

    this.audioContext = new AudioContextConstructor();
    return this.audioContext;
  }

  private async resumeAudioContext() {
    const context = this.ensureAudioContext();

    if (context.state === "suspended") {
      try {
        await context.resume();
      } catch (error) {
        debugAudio("audio context resume failed", error);
      }
    }

    debugAudio("audio context state", context.state);
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

  private applyInteractionVolumes() {
    this.interactionElements.forEach((pool, sound) => {
      const config = INTERACTION_SOUNDS[sound];

      pool.forEach((audio) => {
        audio.volume = this.muted ? 0 : clampVolume(config.volume * this.globalVolume);
      });
    });
  }

  private logLayerDiagnostics(label: string) {
    this.elements.forEach((audio, layer) => {
      debugAudio(`layer diagnostics ${label}`, {
        layer,
        ...getAudioSnapshot(audio),
      });
    });
  }

  private logLayerFollowUpDiagnostics(label: string) {
    this.elements.forEach((audio, layer) => {
      debugAudio(`layer diagnostics ${label}`, {
        layer,
        paused: audio.paused,
        currentTime: audio.currentTime,
        volume: audio.volume,
      });
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
