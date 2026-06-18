"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const FULL_TRANSITION_MS = 1600;
const REDUCED_TRANSITION_MS = 240;

type StartRoomTransitionOptions = {
  href: string;
};

export function useRoomTransition() {
  const router = useRouter();
  const [isEntering, setIsEntering] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

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
