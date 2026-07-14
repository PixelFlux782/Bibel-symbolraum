import {
  addPersonalPathEvent,
  getPersonalPathEvents,
  markArchiveRead,
  type PersonalPathEvent,
} from "@/lib/personalPathState";
import {
  PATH_ACTIVITY_STORAGE_KEY,
  parseStoredPathActivity,
  type StoredPathActivity,
} from "@/lib/pathActivity";

export const FIRST_JOURNEY_SUMMARY_ROUTE = "/wege/tiefe-bis-brot";
export const FIRST_JOURNEY_SUMMARY_EVENT_ID = "wegzeichen-tiefe-bis-brot";

export const FIRST_JOURNEY_SYMBOLS = ["wasser", "licht", "feuer", "wueste", "brot"] as const;

export type FirstJourneySymbol = (typeof FIRST_JOURNEY_SYMBOLS)[number];

export const FIRST_JOURNEY_SUMMARY_CONTEXT =
  "Du bist durch Wasser, Licht, Feuer, Wüste und Brot gegangen.\nDer Weg zeigt eine Ordnung:\nAus Tiefe wird Sichtbarkeit.\nAus Sichtbarkeit wird Prüfung.\nAus Prüfung wird Vertrauen.\nAus Vertrauen wird Gabe.";

function readStoredPathActivity(): StoredPathActivity {
  try {
    const storage = typeof window !== "undefined" ? window.localStorage : undefined;

    return parseStoredPathActivity(storage?.getItem(PATH_ACTIVITY_STORAGE_KEY) ?? null);
  } catch {
    return parseStoredPathActivity(null);
  }
}

function collectVisitedRoomIds(events: PersonalPathEvent[], pathActivity: StoredPathActivity) {
  const visited = new Set<string>();

  for (const event of events) {
    if (event.type === "room_entered") {
      visited.add(event.roomId ?? event.targetId);
    }
  }

  for (const visit of pathActivity.roomVisits) {
    visited.add(visit.symbolId);
  }

  return visited;
}

export function getFirstJourneyState(input?: {
  events?: PersonalPathEvent[];
  pathActivity?: StoredPathActivity;
}) {
  const events = input?.events ?? getPersonalPathEvents();
  const pathActivity = input?.pathActivity ?? readStoredPathActivity();
  const visited = collectVisitedRoomIds(events, pathActivity);
  const missing = FIRST_JOURNEY_SYMBOLS.filter((symbolId) => !visited.has(symbolId));
  const hasSummaryMarker = events.some((event) => (
    event.id === FIRST_JOURNEY_SUMMARY_EVENT_ID ||
    event.targetId === "tiefe-bis-brot"
  ));

  return {
    completed: missing.length === 0,
    hasSummaryMarker,
    missing,
    nextSymbol: missing[0],
    visited,
  };
}

export function hasFirstJourneyCompleted(input?: {
  events?: PersonalPathEvent[];
  pathActivity?: StoredPathActivity;
}) {
  return getFirstJourneyState(input).completed;
}

export function recordFirstJourneySummaryOpened() {
  const state = getFirstJourneyState();

  if (!state.completed) return null;

  markArchiveRead("tiefe-bis-brot", "journey");

  return addPersonalPathEvent({
    id: FIRST_JOURNEY_SUMMARY_EVENT_ID,
    type: "marker_added",
    targetId: "tiefe-bis-brot",
    targetType: "journey",
    label: "Wegzeichen: Von der Tiefe zum Brot",
    sourceRoute: FIRST_JOURNEY_SUMMARY_ROUTE,
    context: FIRST_JOURNEY_SUMMARY_CONTEXT,
  });
}
