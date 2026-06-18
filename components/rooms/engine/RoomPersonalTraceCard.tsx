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
import type { RoomContext } from "@/lib/rooms/roomContext";
import { getCodexHref, getSymbolPathConfig } from "@/lib/symbols/symbolPathConfig";

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

  if (!reflection || !symbolBridge) {
    return null;
  }

  const preview = getReflectionPreview(reflection);

  if (!preview) {
    return null;
  }

  const contextLabel = roomContext?.source === "journey" ? undefined : getReflectionContextLabel(reflection);

  return (
    <aside className="symbol-engine__personal-trace" aria-label="Persoenliche Rueckkehr-Spur">
      <p className="symbol-engine__personal-trace-title">Du warst hier schon</p>
      {contextLabel ? (
        <p className="symbol-engine__personal-trace-context">{contextLabel}</p>
      ) : null}
      <p className="symbol-engine__personal-trace-preview">&bdquo;{preview}&ldquo;</p>
      <div className="symbol-engine__personal-trace-actions">
        <Link href="/mein-pfad">In Mein Pfad ansehen</Link>
        <Link href={reflection.codexHref ?? getCodexHref(symbolBridge.symbolId)}>Im Codex vertiefen</Link>
      </div>
    </aside>
  );
}
