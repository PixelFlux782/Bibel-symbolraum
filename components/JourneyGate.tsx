"use client";

type JourneyGateProps = {
  title: string;
  bridgeText?: string;
  journeyText?: string;
  hebrew: string;
  onComplete: () => void;
};

export function JourneyGate({
  title,
  bridgeText,
  journeyText,
  hebrew,
  onComplete,
}: JourneyGateProps) {
  return (
    <section className="journey-gate" aria-label="Bedeutungsschwelle" aria-live="polite">
      <div className="journey-gate__glow" aria-hidden="true" />
      <div className="journey-gate__thread" aria-hidden="true" />
      <div className="journey-gate__content">
        <p className="journey-gate__kicker">Bedeutungsschwelle</p>
        <p className="journey-gate__hebrew" lang="he" dir="rtl">{hebrew}</p>
        <h2 className="journey-gate__title">{title}</h2>
        {bridgeText ? <p className="journey-gate__bridge">{bridgeText}</p> : null}
        {journeyText && journeyText !== bridgeText ? (
          <p className="journey-gate__journey">{journeyText}</p>
        ) : null}
        <button type="button" onClick={onComplete} className="journey-gate__skip">
          Weiter
        </button>
      </div>
    </section>
  );
}
