import {
  addPersonalPathEvent,
  markArchiveDiscovered,
  markArchiveRead,
} from "@/lib/personalPathState";
import { getSymbolPathConfig } from "@/lib/symbols/symbolPathConfig";

export const PATH_ACTIVITY_STORAGE_KEY = "bibel-symbolraum-path-activity";

const DEDUPE_WINDOW_MS = 5000;
const ROOM_ROUTE_GUARD_WINDOW_MS = 5000;
const ROOM_ROUTE_GUARD_STORAGE_KEY = `${PATH_ACTIVITY_STORAGE_KEY}:room-route-guards`;

const roomRouteGuards = new Map<string, number>();

export type StoredRoomVisit = {
  id: string;
  symbolId: string;
  roomHref: string;
  createdAt: string;
};

export type StoredJourneyStart = {
  id: string;
  journeyId: string;
  createdAt: string;
};

export type StoredActivatedLetter = {
  id: string;
  letterId: string;
  symbolId?: string;
  pathId?: string;
  createdAt: string;
};

export type StoredPathActivity = {
  roomVisits: StoredRoomVisit[];
  journeyStarts: StoredJourneyStart[];
  activatedLetters: StoredActivatedLetter[];
};

const EMPTY_ACTIVITY: StoredPathActivity = {
  roomVisits: [],
  journeyStarts: [],
  activatedLetters: [],
};

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function limitNewest<T extends { createdAt: string }>(items: T[], limit = 80): T[] {
  return [...items]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

function getTimestamp(value: string): number {
  const timestamp = new Date(value).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function sameOptionalValue(a?: string, b?: string): boolean {
  return (a ?? "") === (b ?? "");
}

function isWithinWindow(a: string, b: string, windowMs = DEDUPE_WINDOW_MS): boolean {
  return Math.abs(getTimestamp(a) - getTimestamp(b)) <= windowMs;
}

function dedupeRecentDuplicates<T extends { createdAt: string }>(
  items: T[],
  isDuplicate: (item: T, candidate: T) => boolean,
): T[] {
  const deduped: T[] = [];

  for (const item of limitNewest(items, Number.MAX_SAFE_INTEGER)) {
    const duplicate = deduped.some((candidate) => isDuplicate(item, candidate) && isWithinWindow(item.createdAt, candidate.createdAt));

    if (!duplicate) {
      deduped.push(item);
    }
  }

  return deduped;
}

function normalizePathActivity(activity: StoredPathActivity): StoredPathActivity {
  return {
    roomVisits: dedupeRecentDuplicates(
      activity.roomVisits,
      (visit, candidate) => visit.symbolId === candidate.symbolId && visit.roomHref === candidate.roomHref,
    ),
    journeyStarts: dedupeRecentDuplicates(
      activity.journeyStarts,
      (start, candidate) => start.journeyId === candidate.journeyId,
    ),
    activatedLetters: dedupeRecentDuplicates(
      activity.activatedLetters,
      (activation, candidate) =>
        activation.letterId === candidate.letterId &&
        sameOptionalValue(activation.symbolId, candidate.symbolId) &&
        sameOptionalValue(activation.pathId, candidate.pathId),
    ),
  };
}

function isStoredRoomVisit(value: unknown): value is StoredRoomVisit {
  if (!value || typeof value !== "object") return false;

  const visit = value as Record<string, unknown>;

  return (
    typeof visit.id === "string" &&
    typeof visit.symbolId === "string" &&
    typeof visit.roomHref === "string" &&
    typeof visit.createdAt === "string"
  );
}

function isStoredJourneyStart(value: unknown): value is StoredJourneyStart {
  if (!value || typeof value !== "object") return false;

  const journey = value as Record<string, unknown>;

  return (
    typeof journey.id === "string" &&
    typeof journey.journeyId === "string" &&
    typeof journey.createdAt === "string"
  );
}

function isStoredActivatedLetter(value: unknown): value is StoredActivatedLetter {
  if (!value || typeof value !== "object") return false;

  const letter = value as Record<string, unknown>;

  return (
    typeof letter.id === "string" &&
    typeof letter.letterId === "string" &&
    (letter.symbolId === undefined || typeof letter.symbolId === "string") &&
    (letter.pathId === undefined || typeof letter.pathId === "string") &&
    typeof letter.createdAt === "string"
  );
}

export function parseStoredPathActivity(raw: string | null): StoredPathActivity {
  if (!raw) return EMPTY_ACTIVITY;

  try {
    const parsed = JSON.parse(raw) as Partial<StoredPathActivity>;

    return normalizePathActivity({
      roomVisits: Array.isArray(parsed.roomVisits) ? parsed.roomVisits.filter(isStoredRoomVisit) : [],
      journeyStarts: Array.isArray(parsed.journeyStarts) ? parsed.journeyStarts.filter(isStoredJourneyStart) : [],
      activatedLetters: Array.isArray(parsed.activatedLetters) ? parsed.activatedLetters.filter(isStoredActivatedLetter) : [],
    });
  } catch {
    return EMPTY_ACTIVITY;
  }
}

export function loadPathActivity(): StoredPathActivity {
  return parseStoredPathActivity(window.localStorage.getItem(PATH_ACTIVITY_STORAGE_KEY));
}

export function savePathActivity(activity: StoredPathActivity) {
  const normalized = normalizePathActivity(activity);

  window.localStorage.setItem(
    PATH_ACTIVITY_STORAGE_KEY,
    JSON.stringify({
      roomVisits: limitNewest(normalized.roomVisits),
      journeyStarts: limitNewest(normalized.journeyStarts),
      activatedLetters: limitNewest(normalized.activatedLetters),
    })
  );
}

function hasRecentRoomVisit(activity: StoredPathActivity, input: { symbolId: string; roomHref: string }, createdAt: string): boolean {
  return activity.roomVisits.some(
    (visit) =>
      visit.symbolId === input.symbolId &&
      visit.roomHref === input.roomHref &&
      isWithinWindow(visit.createdAt, createdAt),
  );
}

function hasRecentJourneyStart(activity: StoredPathActivity, journeyId: string, createdAt: string): boolean {
  return activity.journeyStarts.some(
    (start) => start.journeyId === journeyId && isWithinWindow(start.createdAt, createdAt),
  );
}

function hasRecentActivatedLetter(
  activity: StoredPathActivity,
  input: { letterId: string; symbolId?: string; pathId?: string },
  createdAt: string,
): boolean {
  return activity.activatedLetters.some(
    (activation) =>
      activation.letterId === input.letterId &&
      sameOptionalValue(activation.symbolId, input.symbolId) &&
      sameOptionalValue(activation.pathId, input.pathId) &&
      isWithinWindow(activation.createdAt, createdAt),
  );
}

function readRoomRouteGuards(): Record<string, number> {
  try {
    return JSON.parse(window.sessionStorage.getItem(ROOM_ROUTE_GUARD_STORAGE_KEY) ?? "{}") as Record<string, number>;
  } catch {
    return {};
  }
}

function writeRoomRouteGuards(guards: Record<string, number>) {
  window.sessionStorage.setItem(ROOM_ROUTE_GUARD_STORAGE_KEY, JSON.stringify(guards));
}

function claimRoomRouteGuard(routeKey: string, now = Date.now()): boolean {
  const memoryTimestamp = roomRouteGuards.get(routeKey);

  if (memoryTimestamp && now - memoryTimestamp <= ROOM_ROUTE_GUARD_WINDOW_MS) {
    return false;
  }

  const guards = readRoomRouteGuards();
  const storedTimestamp = guards[routeKey];

  if (storedTimestamp && now - storedTimestamp <= ROOM_ROUTE_GUARD_WINDOW_MS) {
    roomRouteGuards.set(routeKey, storedTimestamp);
    return false;
  }

  const freshGuards = Object.fromEntries(
    Object.entries(guards).filter(([, timestamp]) => now - timestamp <= ROOM_ROUTE_GUARD_WINDOW_MS)
  );

  freshGuards[routeKey] = now;
  roomRouteGuards.set(routeKey, now);
  writeRoomRouteGuards(freshGuards);

  return true;
}

export function recordRoomVisit(input: { symbolId: string; roomHref: string }): boolean {
  const activity = loadPathActivity();
  const createdAt = new Date().toISOString();

  if (hasRecentRoomVisit(activity, input, createdAt)) {
    return false;
  }

  savePathActivity({
    ...activity,
    roomVisits: [
      {
        id: createId("room"),
        symbolId: input.symbolId,
        roomHref: input.roomHref,
        createdAt,
      },
      ...activity.roomVisits,
    ],
  });
  addPersonalPathEvent({
    type: "room_entered",
    targetId: input.symbolId,
    targetType: "room",
    label: getSymbolPathConfig(input.symbolId)?.roomLabel ?? input.symbolId,
    sourceRoute: input.roomHref,
    timestamp: createdAt,
    roomId: input.symbolId,
  });
  markArchiveRead(input.symbolId, "room", createdAt);

  return true;
}

export function recordRoomVisitForRoute(input: { symbolId: string; roomHref: string; routeKey?: string }): boolean {
  const routeKey = input.routeKey ?? input.roomHref;

  if (!claimRoomRouteGuard(routeKey)) {
    return false;
  }

  return recordRoomVisit(input);
}

export function recordJourneyStart(journeyId: string): boolean {
  const activity = loadPathActivity();
  const createdAt = new Date().toISOString();

  if (hasRecentJourneyStart(activity, journeyId, createdAt)) {
    return false;
  }

  savePathActivity({
    ...activity,
    journeyStarts: [
      {
        id: createId("journey"),
        journeyId,
        createdAt,
      },
      ...activity.journeyStarts,
    ],
  });
  addPersonalPathEvent({
    type: "marker_added",
    targetId: journeyId,
    targetType: "journey",
    label: journeyId,
    sourceRoute: "/symbolnetz",
    timestamp: createdAt,
  });
  markArchiveDiscovered(journeyId, "journey", createdAt);

  return true;
}

export function recordActivatedLetter(input: { letterId: string; symbolId?: string; pathId?: string }): boolean {
  const activity = loadPathActivity();
  const createdAt = new Date().toISOString();

  if (hasRecentActivatedLetter(activity, input, createdAt)) {
    return false;
  }

  savePathActivity({
    ...activity,
    activatedLetters: [
      {
        id: createId("letter"),
        letterId: input.letterId,
        symbolId: input.symbolId,
        pathId: input.pathId,
        createdAt,
      },
      ...activity.activatedLetters,
    ],
  });
  addPersonalPathEvent({
    type: "marker_added",
    targetId: input.letterId,
    targetType: "letter",
    label: input.letterId,
    sourceRoute: input.pathId ? `/codex/${input.pathId}` : "/symbolnetz",
    timestamp: createdAt,
    context: input.pathId,
    roomId: input.symbolId,
  });
  markArchiveDiscovered(input.letterId, "letter", createdAt);

  return true;
}
