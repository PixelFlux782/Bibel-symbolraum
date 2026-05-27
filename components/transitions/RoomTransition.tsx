"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { useRoomTransition } from "@/hooks/useRoomTransition";

type RoomTransitionProps = {
  active: boolean;
};

type RoomTransitionButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "onClick">;

export function RoomTransition({ active }: RoomTransitionProps) {
  if (!active) {
    return null;
  }

  return (
    <div className="room-transition" aria-hidden="true">
      <div className="room-transition__dark" />
      <div className="room-transition__cyan" />
      <div className="room-transition__symbol" lang="he" dir="rtl">
        {"\u05de\u05d9\u05dd"}
      </div>
    </div>
  );
}

export function RoomTransitionButton({
  href,
  children,
  className,
  disabled,
  ...buttonProps
}: RoomTransitionButtonProps) {
  const { isEntering, startRoomTransition } = useRoomTransition();

  return (
    <>
      <button
        {...buttonProps}
        type="button"
        disabled={disabled || isEntering}
        aria-busy={isEntering}
        className={className}
        onClick={() => startRoomTransition({ href })}
      >
        {children}
      </button>
      <RoomTransition active={isEntering} />
    </>
  );
}
