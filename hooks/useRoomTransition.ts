"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const FULL_TRANSITION_MS = 1050;
const REDUCED_TRANSITION_MS = 160;

type StartRoomTransitionOptions = {
  href: string;
};

export function useRoomTransition() {
  const router = useRouter();
  const [isEntering, setIsEntering] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const startRoomTransition = useCallback(
    ({ href }: StartRoomTransitionOptions) => {
      if (isEntering) {
        return;
      }

      setIsEntering(true);

      const duration = prefersReducedMotion
        ? REDUCED_TRANSITION_MS
        : FULL_TRANSITION_MS;

      timeoutRef.current = window.setTimeout(() => {
        router.push(href);
      }, duration);
    },
    [isEntering, prefersReducedMotion, router]
  );

  return {
    isEntering,
    startRoomTransition,
  };
}
