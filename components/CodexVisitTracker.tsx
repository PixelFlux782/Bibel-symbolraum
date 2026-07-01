"use client";

import { useEffect } from "react";
import {
  addPersonalPathEvent,
  getTargetTypeForCodexEntry,
  markArchiveRead,
  type PersonalPathTargetType,
} from "@/lib/personalPathState";

type CodexVisitTrackerProps = {
  entryId: string;
  entryType: string;
  label: string;
  roomId?: string | null;
};

function getPersonalTargetType(targetType: PersonalPathTargetType) {
  return targetType === "room" ? "symbol" : targetType;
}

export function CodexVisitTracker({ entryId, entryType, label, roomId }: CodexVisitTrackerProps) {
  useEffect(() => {
    const targetType = getTargetTypeForCodexEntry(entryType);
    const personalTargetType = getPersonalTargetType(targetType);
    const sourceRoute = `${window.location.pathname}${window.location.search}`;

    addPersonalPathEvent({
      type: "codex_visited",
      targetId: entryId,
      targetType: personalTargetType,
      label,
      sourceRoute,
      codexId: entryId,
      roomId: roomId ?? undefined,
    });
    markArchiveRead(entryId, targetType);
  }, [entryId, entryType, label, roomId]);

  return null;
}
