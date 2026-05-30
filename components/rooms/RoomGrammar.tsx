import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type { ExperienceState, RoomEncounter } from "@/components/rooms/types";

type RoomStageProps = ComponentPropsWithoutRef<"section"> & {
  children: ReactNode;
};

function RoomStage({ children, className = "", ...props }: RoomStageProps) {
  return (
    <section {...props} className={`symbol-section ${className}`}>
      {children}
    </section>
  );
}

export function RoomEntrance(props: RoomStageProps) {
  return <RoomStage {...props} />;
}

export function RoomExperience(props: RoomStageProps) {
  return <RoomStage {...props} />;
}

export function RoomDecision(props: RoomStageProps) {
  return <RoomStage {...props} />;
}

export function RoomTransitionStage(props: RoomStageProps) {
  return <RoomStage {...props} />;
}
