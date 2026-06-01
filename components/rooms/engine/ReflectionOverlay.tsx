import type { ReflectionPrompt } from "@/types/engine";

export function ReflectionOverlay({ reflection }: { reflection: ReflectionPrompt }) {
  return (
    <section className="symbol-engine__reflection" aria-label="Reflexionsfrage">
      <p>{reflection.kicker}</p>
      <blockquote>{reflection.question}</blockquote>
    </section>
  );
}
