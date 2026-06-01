import type { SymbolJourneyState } from "@/types/engine";

type EngineNavigationProps = {
  states: SymbolJourneyState[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

export function EngineNavigation({ states, activeIndex, onSelect }: EngineNavigationProps) {
  return (
    <nav className="symbol-engine__navigation" aria-label="Stationen der Symbolreise">
      <p className="symbol-engine__navigation-label">Symbolreise</p>
      <ol>
        {states.map((state, index) => (
          <li key={state.id}>
            <button
              type="button"
              className={`symbol-engine__navigation-step ${index === activeIndex ? "is-active" : ""} ${
                index < activeIndex ? "is-passed" : ""
              }`}
              onClick={() => onSelect(index)}
              aria-current={index === activeIndex ? "step" : undefined}
            >
              <span className="symbol-engine__navigation-mark" />
              <span>{state.navigationLabel}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
