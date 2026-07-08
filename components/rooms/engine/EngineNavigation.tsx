import type { SymbolJourneyState } from "@/types/engine";

type EngineNavigationProps = {
  states: SymbolJourneyState[];
  activeIndex: number;
  labels?: string[];
  onSelect: (index: number) => void;
};

export function EngineNavigation({ states, activeIndex, labels, onSelect }: EngineNavigationProps) {
  const visibleStates = states.slice(0, 4);

  return (
    <nav className="symbol-engine__navigation" aria-label="Bedeutungsachsen des Raums">
      <p className="symbol-engine__navigation-label">Bedeutungsachsen</p>
      <ol>
        {visibleStates.map((state, index) => (
          <li key={state.id}>
            <button
              type="button"
              className={`symbol-engine__navigation-step ${index === activeIndex ? "is-active" : ""}`}
              onClick={() => onSelect(index)}
              aria-pressed={index === activeIndex}
            >
              <span className="symbol-engine__navigation-mark" />
              <span>{labels?.[index] ?? state.navigationLabel}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
