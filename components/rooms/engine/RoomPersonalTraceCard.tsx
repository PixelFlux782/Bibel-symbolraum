"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getReflectionContextLabel,
  getReflectionPreview,
  getRoomReflectionForSymbol,
  readStoredReflections,
  STORED_REFLECTIONS_UPDATED_EVENT,
  type StoredReflection,
} from "@/lib/reflections";
import { deriveRoomWaymark, type RoomContext } from "@/lib/rooms/roomContext";
import { getCodexHref, getSymbolPathConfig } from "@/lib/symbols/symbolPathConfig";
import { derivePersonalWay } from "@/lib/personalWay";

type RoomPersonalTraceCardProps = {
  roomContext?: RoomContext;
  symbolSlug: string;
};

export function RoomPersonalTraceCard({ roomContext, symbolSlug }: RoomPersonalTraceCardProps) {
  const [reflections, setReflections] = useState<StoredReflection[] | null>(null);
  const symbolBridge = getSymbolPathConfig(symbolSlug);

  useEffect(() => {
    function refreshReflections() {
      setReflections(readStoredReflections());
    }

    refreshReflections();

    window.addEventListener("storage", refreshReflections);
    window.addEventListener(STORED_REFLECTIONS_UPDATED_EVENT, refreshReflections);

    return () => {
      window.removeEventListener("storage", refreshReflections);
      window.removeEventListener(STORED_REFLECTIONS_UPDATED_EVENT, refreshReflections);
    };
  }, []);

  const reflection = useMemo(() => {
    if (!reflections || !symbolBridge) return undefined;

    return getRoomReflectionForSymbol(reflections, symbolBridge.symbolId, {
      preferJourney: roomContext?.source === "journey",
    });
  }, [reflections, roomContext?.source, symbolBridge]);

  const waymark = useMemo(() => {
    if (!reflections || !symbolBridge) return null;

    return deriveRoomWaymark({
      personalWay: derivePersonalWay({ reflections }),
      roomContext,
      symbolId: symbolBridge.symbolId,
    });
  }, [reflections, roomContext, symbolBridge]);

  if (!symbolBridge) {
    return null;
  }

  const preview = reflection ? getReflectionPreview(reflection) : "";

  if (!preview && !waymark) {
    return null;
  }

  const contextLabel = reflection && roomContext?.source !== "journey" ? getReflectionContextLabel(reflection) : undefined;

  return (
    <aside className="symbol-engine__personal-trace" aria-label={preview ? "Persoenliche Rueckkehr-Spur" : "Wegmarke"}>
      {preview ? (
        <>
          <p className="symbol-engine__personal-trace-title">Wenn du zurueckkehrst</p>
          {contextLabel ? (
            <p className="symbol-engine__personal-trace-context">{contextLabel}</p>
          ) : null}
          <p className="symbol-engine__personal-trace-preview">&bdquo;{preview}&ldquo;</p>
        </>
      ) : null}
      {waymark ? (
        <p className="symbol-engine__personal-trace-waymark">{waymark.text}</p>
      ) : null}
      {reflection ? (
        <div className="symbol-engine__personal-trace-actions">
          <Link href="/mein-pfad">In Mein Pfad ansehen</Link>
          <Link href={reflection.codexHref ?? getCodexHref(symbolBridge.symbolId)}>Im Codex vertiefen</Link>
        </div>
      ) : null}
    </aside>
  );
}
