import { getSymbolPathConfig } from "@/lib/symbols/symbolPathConfig";

export const PERSONAL_PATH_EVENTS_STORAGE_KEY = "symbolraum-personal-path-events";
export const ARCHIVE_DISCOVERY_STORAGE_KEY = "symbolraum-archive-discovery-state";

const LEGACY_PATH_ACTIVITY_STORAGE_KEY = "bibel-symbolraum-path-activity";
const LEGACY_REFLECTION_STORAGE_KEY = "bibel-symbolraum-reflections";
const MIGRATION_STORAGE_KEY = "symbolraum-personal-path-migrated";
const EVENT_LIMIT = 160;
const DISCOVERY_LIMIT = 500;

export type PersonalPathEventType =
  | "room_entered"
  | "codex_visited"
  | "question_answered"
  | "resonance_saved"
  | "marker_added";

export type PersonalPathTargetType =
  | "room"
  | "symbol"
  | "word"
  | "letter"
  | "scripture"
  | "meaning"
  | "journey";

export type ArchiveDiscoveryStatus = "undiscovered" | "discovered" | "read";

export type PersonalPathEvent = {
  id: string;
  type: PersonalPathEventType;
  targetId: string;
  targetType: PersonalPathTargetType;
  label: string;
  sourceRoute: string;
  timestamp: string;
  context?: string;
  answer?: string;
  questionId?: string;
  roomId?: string;
  codexId?: string;
};

export type ArchiveDiscoveryState = {
  entityId: string;
  entityType: PersonalPathTargetType;
  status: ArchiveDiscoveryStatus;
  firstSeenAt?: string;
  lastReadAt?: string;
};

export type AddPersonalPathEventInput = Omit<PersonalPathEvent, "id" | "timestamp" | "sourceRoute"> & {
  id?: string;
  timestamp?: string;
  sourceRoute?: string;
};

const FIRST_MOVEMENT_STATIONS: Record<string, {
  label: string;
  targetType: PersonalPathTargetType;
  roomId?: string;
  codexId?: string;
  context: string;
}> = {
  "genesis-1-1": {
    label: "Ursprung beruehrt",
    targetType: "scripture",
    codexId: "genesis-1-1",
    context: "Du hast den Anfang beruehrt.",
  },
  "genesis-1-2": {
    label: "Tiefe beruehrt",
    targetType: "scripture",
    roomId: "wasser",
    codexId: "genesis-1-2",
    context: "Du hast die Tiefe beruehrt.",
  },
  "genesis-1-3": {
    label: "Licht beruehrt",
    targetType: "scripture",
    roomId: "licht",
    codexId: "genesis-1-3",
    context: "Du hast das erste Licht beruehrt.",
  },
};

export const FIRST_MOVEMENT_COMPLETION_EVENT_ID = "erste-bewegung-ursprung-zum-licht";

function getStorage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getCurrentRoute() {
  try {
    return `${window.location.pathname}${window.location.search}`;
  } catch {
    return "";
  }
}

function getValidTimestamp(value: unknown) {
  if (typeof value !== "string") return undefined;

  return Number.isNaN(new Date(value).getTime()) ? undefined : value;
}

function normalizeTargetType(value: unknown): PersonalPathTargetType | undefined {
  if (
    value === "room" ||
    value === "symbol" ||
    value === "word" ||
    value === "letter" ||
    value === "scripture" ||
    value === "meaning" ||
    value === "journey"
  ) {
    return value;
  }

  return undefined;
}

function normalizeEventType(value: unknown): PersonalPathEventType | undefined {
  if (
    value === "room_entered" ||
    value === "codex_visited" ||
    value === "question_answered" ||
    value === "resonance_saved" ||
    value === "marker_added"
  ) {
    return value;
  }

  return undefined;
}

function normalizeStatus(value: unknown): ArchiveDiscoveryStatus | undefined {
  if (value === "undiscovered" || value === "discovered" || value === "read") {
    return value;
  }

  return undefined;
}

function normalizePersonalPathEvent(value: unknown): PersonalPathEvent | null {
  if (!value || typeof value !== "object") return null;

  const event = value as Record<string, unknown>;
  const type = normalizeEventType(event.type);
  const targetType = normalizeTargetType(event.targetType);
  const timestamp = getValidTimestamp(event.timestamp);

  if (
    !type ||
    !targetType ||
    typeof event.id !== "string" ||
    typeof event.targetId !== "string" ||
    typeof event.label !== "string" ||
    !timestamp
  ) {
    return null;
  }

  return {
    id: event.id,
    type,
    targetId: event.targetId,
    targetType,
    label: event.label,
    sourceRoute: typeof event.sourceRoute === "string" ? event.sourceRoute : "",
    timestamp,
    context: typeof event.context === "string" ? event.context : undefined,
    answer: typeof event.answer === "string" ? event.answer : undefined,
    questionId: typeof event.questionId === "string" ? event.questionId : undefined,
    roomId: typeof event.roomId === "string" ? event.roomId : undefined,
    codexId: typeof event.codexId === "string" ? event.codexId : undefined,
  };
}

function normalizeArchiveDiscoveryState(value: unknown): ArchiveDiscoveryState | null {
  if (!value || typeof value !== "object") return null;

  const state = value as Record<string, unknown>;
  const entityType = normalizeTargetType(state.entityType);
  const status = normalizeStatus(state.status);

  if (!entityType || !status || typeof state.entityId !== "string") {
    return null;
  }

  return {
    entityId: state.entityId,
    entityType,
    status,
    firstSeenAt: getValidTimestamp(state.firstSeenAt),
    lastReadAt: getValidTimestamp(state.lastReadAt),
  };
}

function parseJsonArray(raw: string | null): unknown[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function eventTime(event: PersonalPathEvent) {
  const timestamp = new Date(event.timestamp).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getEventDedupeKey(event: PersonalPathEvent) {
  return [
    event.type,
    event.targetType,
    event.targetId,
    event.questionId ?? "",
    event.answer ?? "",
    event.roomId ?? "",
    event.codexId ?? "",
  ].join("|");
}

function normalizeEvents(events: PersonalPathEvent[]) {
  const seen = new Set<string>();

  return [...events]
    .sort((a, b) => eventTime(b) - eventTime(a))
    .filter((event) => {
      const key = getEventDedupeKey(event);

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, EVENT_LIMIT);
}

function normalizeDiscovery(states: ArchiveDiscoveryState[]) {
  const byKey = new Map<string, ArchiveDiscoveryState>();

  for (const state of states) {
    const key = `${state.entityType}:${state.entityId}`;
    const current = byKey.get(key);

    if (!current) {
      byKey.set(key, state);
      continue;
    }

    byKey.set(key, {
      ...current,
      status: current.status === "read" || state.status === "read"
        ? "read"
        : current.status === "discovered" || state.status === "discovered"
          ? "discovered"
          : "undiscovered",
      firstSeenAt: [current.firstSeenAt, state.firstSeenAt].filter(Boolean).sort()[0],
      lastReadAt: [current.lastReadAt, state.lastReadAt].filter(Boolean).sort().at(-1),
    });
  }

  return Array.from(byKey.values()).slice(0, DISCOVERY_LIMIT);
}

function readEventsWithoutMigration(storage: Storage | null = getStorage()) {
  return normalizeEvents(
    parseJsonArray(storage?.getItem(PERSONAL_PATH_EVENTS_STORAGE_KEY) ?? null)
      .map(normalizePersonalPathEvent)
      .filter((event): event is PersonalPathEvent => Boolean(event))
  );
}

function readDiscoveryWithoutMigration(storage: Storage | null = getStorage()) {
  return normalizeDiscovery(
    parseJsonArray(storage?.getItem(ARCHIVE_DISCOVERY_STORAGE_KEY) ?? null)
      .map(normalizeArchiveDiscoveryState)
      .filter((state): state is ArchiveDiscoveryState => Boolean(state))
  );
}

function writeEvents(events: PersonalPathEvent[], storage: Storage | null = getStorage()) {
  storage?.setItem(PERSONAL_PATH_EVENTS_STORAGE_KEY, JSON.stringify(normalizeEvents(events)));
}

function writeDiscovery(states: ArchiveDiscoveryState[], storage: Storage | null = getStorage()) {
  storage?.setItem(ARCHIVE_DISCOVERY_STORAGE_KEY, JSON.stringify(normalizeDiscovery(states)));
}

function readLegacyPathActivity(storage: Storage) {
  const raw = storage.getItem(LEGACY_PATH_ACTIVITY_STORAGE_KEY);
  const empty = { roomVisits: [], journeyStarts: [], activatedLetters: [] } as {
    roomVisits: Array<Record<string, unknown>>;
    journeyStarts: Array<Record<string, unknown>>;
    activatedLetters: Array<Record<string, unknown>>;
  };

  if (!raw) return empty;

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;

    return {
      roomVisits: Array.isArray(parsed.roomVisits) ? parsed.roomVisits : [],
      journeyStarts: Array.isArray(parsed.journeyStarts) ? parsed.journeyStarts : [],
      activatedLetters: Array.isArray(parsed.activatedLetters) ? parsed.activatedLetters : [],
    };
  } catch {
    return empty;
  }
}

function readLegacyReflections(storage: Storage) {
  return parseJsonArray(storage.getItem(LEGACY_REFLECTION_STORAGE_KEY)).filter(
    (item): item is Record<string, unknown> => Boolean(item && typeof item === "object")
  );
}

function getString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function inferTargetTypeFromCodexType(type: string | undefined): PersonalPathTargetType {
  if (type === "hebrew-word") return "word";
  if (type === "hebrew-letter") return "letter";
  if (type === "scripture") return "scripture";
  if (type === "meaning" || type === "meaning-field") return "meaning";
  if (type === "journey") return "journey";

  return "symbol";
}

function buildLegacyMigration(storage: Storage) {
  const events: PersonalPathEvent[] = [];
  const discovery: ArchiveDiscoveryState[] = [];
  const pathActivity = readLegacyPathActivity(storage);
  const reflections = readLegacyReflections(storage);

  for (const visit of pathActivity.roomVisits) {
    const symbolId = getString(visit.symbolId);
    const timestamp = getValidTimestamp(visit.createdAt);

    if (!symbolId || !timestamp) continue;

    const config = getSymbolPathConfig(symbolId);

    events.push({
      id: getString(visit.id) ?? `migrated-room-${symbolId}-${timestamp}`,
      type: "room_entered",
      targetId: symbolId,
      targetType: "room",
      label: config?.roomLabel ?? symbolId,
      sourceRoute: getString(visit.roomHref) ?? `/raeume/${symbolId}`,
      timestamp,
      roomId: symbolId,
    });
    discovery.push({
      entityId: symbolId,
      entityType: "room",
      status: "read",
      firstSeenAt: timestamp,
      lastReadAt: timestamp,
    });
  }

  for (const journey of pathActivity.journeyStarts) {
    const journeyId = getString(journey.journeyId);
    const timestamp = getValidTimestamp(journey.createdAt);

    if (!journeyId || !timestamp) continue;

    events.push({
      id: getString(journey.id) ?? `migrated-journey-${journeyId}-${timestamp}`,
      type: "marker_added",
      targetId: journeyId,
      targetType: "journey",
      label: journeyId,
      sourceRoute: "/symbolnetz",
      timestamp,
      context: "Legacy journey start",
    });
    discovery.push({
      entityId: journeyId,
      entityType: "journey",
      status: "discovered",
      firstSeenAt: timestamp,
    });
  }

  for (const activation of pathActivity.activatedLetters) {
    const letterId = getString(activation.letterId);
    const timestamp = getValidTimestamp(activation.createdAt);

    if (!letterId || !timestamp) continue;

    events.push({
      id: getString(activation.id) ?? `migrated-letter-${letterId}-${timestamp}`,
      type: "marker_added",
      targetId: letterId,
      targetType: "letter",
      label: letterId,
      sourceRoute: "/symbolnetz",
      timestamp,
      context: getString(activation.pathId),
      roomId: getString(activation.symbolId),
    });
    discovery.push({
      entityId: letterId,
      entityType: "letter",
      status: "discovered",
      firstSeenAt: timestamp,
    });
  }

  for (const reflection of reflections) {
    const answer = getString(reflection.answer) ?? getString(reflection.text) ?? getString(reflection.reflection);
    const timestamp = getValidTimestamp(reflection.createdAt) ?? new Date().toISOString();
    const targetId = getString(reflection.sourceId) ?? getString(reflection.symbolSlug) ?? getString(reflection.room) ?? getString(reflection.symbol);
    const label = getString(reflection.title) ?? getString(reflection.symbol) ?? targetId;

    if (!answer || !targetId || !label) continue;

    events.push({
      id: getString(reflection.id) ?? `migrated-question-${targetId}-${timestamp}`,
      type: "question_answered",
      targetId,
      targetType: getString(reflection.room) ? "room" : "symbol",
      label,
      sourceRoute: getString(reflection.roomHref) ?? getString(reflection.codexHref) ?? "",
      timestamp,
      context: getString(reflection.stateTitle) ?? getString(reflection.pathLabel),
      answer,
      questionId: getString(reflection.question) ?? targetId,
      roomId: getString(reflection.room),
      codexId: getString(reflection.codexHref)?.replace(/^\/codex\//, ""),
    });
  }

  return { events, discovery };
}

export function migrateLegacyPathState() {
  const storage = getStorage();

  if (!storage || storage.getItem(MIGRATION_STORAGE_KEY) === "1") return;

  const migrated = buildLegacyMigration(storage);

  writeEvents([...readEventsWithoutMigration(storage), ...migrated.events], storage);
  writeDiscovery([...readDiscoveryWithoutMigration(storage), ...migrated.discovery], storage);
  storage.setItem(MIGRATION_STORAGE_KEY, "1");
}

export function getPersonalPathEvents(): PersonalPathEvent[] {
  migrateLegacyPathState();

  return readEventsWithoutMigration();
}

export function addPersonalPathEvent(input: AddPersonalPathEventInput): PersonalPathEvent | null {
  const storage = getStorage();

  if (!storage) return null;

  migrateLegacyPathState();

  const event: PersonalPathEvent = {
    ...input,
    id: input.id ?? createId(input.type),
    timestamp: input.timestamp ?? new Date().toISOString(),
    sourceRoute: input.sourceRoute ?? getCurrentRoute(),
  };

  writeEvents([event, ...readEventsWithoutMigration(storage)], storage);

  return event;
}

export function addFirstMovementStationEvent(stationId: "genesis-1-1" | "genesis-1-2" | "genesis-1-3") {
  const station = FIRST_MOVEMENT_STATIONS[stationId];

  return addPersonalPathEvent({
    type: "marker_added",
    targetId: stationId,
    targetType: station.targetType,
    label: station.label,
    sourceRoute: `/symbolnetz?path=erste-bewegung&symbol=${station.roomId ?? "wasser"}`,
    context: station.context,
    roomId: station.roomId,
    codexId: station.codexId,
  });
}

export function addFirstMovementCompletionEvent() {
  return addPersonalPathEvent({
    id: FIRST_MOVEMENT_COMPLETION_EVENT_ID,
    type: "marker_added",
    targetId: "erste-bewegung",
    targetType: "journey",
    label: "Vom Ursprung zum Licht",
    sourceRoute: "/symbolnetz?path=erste-bewegung",
    context: "Deine erste Bewegung fuehrt vom Ursprung zum Licht.",
  });
}

export function getPersonalPathEventSentence(event: PersonalPathEvent) {
  if (event.type === "room_entered" && event.roomId === "wasser") {
    return "Du bist ins Wasser eingetreten.";
  }

  if (event.type === "room_entered") {
    return `Du bist in den ${event.label} eingetreten.`;
  }

  if (event.type === "codex_visited" && event.targetId === "genesis-1-2") {
    return "Du hast Genesis 1,2 beruehrt: die Tiefe.";
  }

  if (event.type === "codex_visited" && event.targetId === "genesis-1-1") {
    return "Du hast Genesis 1,1 beruehrt: den Anfang.";
  }

  if (event.type === "codex_visited" && event.targetId === "genesis-1-3") {
    return "Du hast Genesis 1,3 beruehrt: das Licht.";
  }

  if (event.type === "codex_visited") {
    return `Du hast ${event.label} im Codex beruehrt.`;
  }

  if (event.type === "question_answered") {
    if (event.roomId === "wasser" || event.targetId === "wasser" || event.targetId.startsWith("genesis-1-")) {
      return "Du hast die Frage nach dem Anfang beantwortet.";
    }

    return "Du hast eine Reflexionsfrage beantwortet.";
  }

  if (event.type === "resonance_saved") {
    return `Du hast eine Resonanz zu ${event.label} bewahrt.`;
  }

  return event.context ?? `Du hast ${event.label} als Wegmarke gesetzt.`;
}

function upsertArchiveState(
  entityId: string,
  entityType: PersonalPathTargetType,
  status: Exclude<ArchiveDiscoveryStatus, "undiscovered">,
  timestamp = new Date().toISOString(),
) {
  const storage = getStorage();

  if (!storage) return;

  migrateLegacyPathState();

  const states = readDiscoveryWithoutMigration(storage);
  const index = states.findIndex((state) => state.entityId === entityId && state.entityType === entityType);
  const current = index >= 0 ? states[index] : undefined;
  const next: ArchiveDiscoveryState = {
    entityId,
    entityType,
    status: status === "read" || current?.status === "read" ? "read" : "discovered",
    firstSeenAt: current?.firstSeenAt ?? timestamp,
    lastReadAt: status === "read" ? timestamp : current?.lastReadAt,
  };

  if (index >= 0) {
    states[index] = next;
  } else {
    states.unshift(next);
  }

  writeDiscovery(states, storage);
}

export function markArchiveDiscovered(entityId: string, entityType: PersonalPathTargetType, timestamp?: string) {
  upsertArchiveState(entityId, entityType, "discovered", timestamp);
}

export function markArchiveRead(entityId: string, entityType: PersonalPathTargetType, timestamp?: string) {
  upsertArchiveState(entityId, entityType, "read", timestamp);
}

export function getArchiveDiscoveryState(): ArchiveDiscoveryState[] {
  migrateLegacyPathState();

  return readDiscoveryWithoutMigration();
}

export function getTargetTypeForCodexEntry(type: string | undefined) {
  return inferTargetTypeFromCodexType(type);
}
