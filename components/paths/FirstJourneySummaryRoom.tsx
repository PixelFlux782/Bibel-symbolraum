"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FIRST_JOURNEY_SUMMARY_ROUTE,
  FIRST_JOURNEY_SYMBOLS,
  getFirstJourneyState,
  recordFirstJourneySummaryOpened,
  type FirstJourneySymbol,
} from "@/lib/firstJourneySummary";
import { getSymbolPathConfig } from "@/lib/symbols/symbolPathConfig";

const signTexts: Record<FirstJourneySymbol, string> = {
  wasser: "Die Tiefe wird berührt.",
  licht: "Das Verborgene wird sichtbar.",
  feuer: "Das Sichtbare wird geprüft.",
  wueste: "Die falschen Stützen fallen weg.",
  brot: "Leben wird Gabe und kann geteilt werden.",
};

const humanTexts: Record<FirstJourneySymbol, string> = {
  wasser: "das Ungeformte",
  licht: "das Erkennen",
  feuer: "die Prüfung dessen, was echt ist",
  wueste: "die Leere, in der falsche Sicherheiten schweigen",
  brot: "das Leben, das empfangen und geteilt wird",
};

const movement = ["Tiefe", "Sichtbarkeit", "Prüfung", "Vertrauen", "Gabe"];
const scriptureMovement = [
  ["Genesis 1,2", "Tiefe, Wasser, Ruach."],
  ["Genesis 1,3", "Das Wort ruft Licht."],
  ["Feuer", "Gegenwart, Ruf, Prüfung, Dornbusch."],
  ["Wüste", "Exodus, Weg, Manna, Stimme."],
  ["Brot", "Tagesmaß, Teilen, Wort, Leben."],
];

type SummaryState = ReturnType<typeof getFirstJourneyState>;

function LoadingRoom() {
  return (
    <main className="summary-room summary-room--locked">
      <section className="summary-room__locked">
        <p className="summary-room__kicker">Raum der Zusammenschau</p>
        <h1>Der Weg wird gelesen.</h1>
      </section>
    </main>
  );
}

function LockedRoom({ state }: { state: SummaryState }) {
  const nextConfig = state.nextSymbol ? getSymbolPathConfig(state.nextSymbol) : undefined;

  return (
    <main className="summary-room summary-room--locked">
      <div className="summary-room__stars" aria-hidden="true" />
      <section className="summary-room__locked">
        <p className="summary-room__kicker">Raum der Zusammenschau</p>
        <h1>Dieser Raum öffnet sich erst, wenn der Weg gegangen wurde.</h1>
        <p>
          Die Zusammenschau ist kein Anfang.
          <br />
          Sie erscheint nach dem Durchschreiten.
        </p>
        <div className="summary-room__actions">
          <Link href="/raeume/wasser?from=journey&path=tiefe-bis-brot" className="summary-room__link">
            Beginne bei Wasser
          </Link>
          {nextConfig ? (
            <Link href={nextConfig.roomHref} className="summary-room__link summary-room__link--quiet">
              Zum nächsten offenen Raum
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  );
}

export default function FirstJourneySummaryRoom() {
  const [state, setState] = useState<SummaryState | null>(null);

  useEffect(() => {
    window.queueMicrotask(() => {
      const nextState = getFirstJourneyState();
      setState(nextState);

      if (nextState.completed) {
        recordFirstJourneySummaryOpened();
        setState(getFirstJourneyState());
      }
    });
  }, []);

  const signs = useMemo(
    () => FIRST_JOURNEY_SYMBOLS.map((symbolId) => ({
      symbolId,
      label: getSymbolPathConfig(symbolId)?.label ?? symbolId,
      text: signTexts[symbolId],
    })),
    []
  );

  if (!state) return <LoadingRoom />;
  if (!state.completed) return <LockedRoom state={state} />;

  return (
    <main className="summary-room" data-route={FIRST_JOURNEY_SUMMARY_ROUTE}>
      <div className="summary-room__stars" aria-hidden="true" />
      <div className="summary-room__axis" aria-hidden="true">
        <span className="summary-room__water" />
        <span className="summary-room__light" />
        <span className="summary-room__ember" />
        <span className="summary-room__dust" />
        <span className="summary-room__bread" />
      </div>

      <section className="summary-room__arrival">
        <p className="summary-room__kicker">Raum der Zusammenschau</p>
        <h1>Von der Tiefe zum Brot</h1>
        <p>
          Du bist nicht durch fünf Themen gegangen.
          <br />
          Du bist durch eine Ordnung gegangen.
        </p>
      </section>

      <section className="summary-room__section" aria-labelledby="summary-signs">
        <p className="summary-room__kicker">Die fünf Zeichen</p>
        <h2 id="summary-signs">Die Zeichen stehen nicht nebeneinander.</h2>
        <div className="summary-room__signs">
          {signs.map((sign, index) => (
            <article key={sign.symbolId} className={`summary-room__sign summary-room__sign--${sign.symbolId}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{sign.label}</h3>
              <p>{sign.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="summary-room__section summary-room__section--center" aria-labelledby="summary-movement">
        <p className="summary-room__kicker">Die innere Bewegung</p>
        <h2 id="summary-movement">Die Tora zeigt, wie Leben geformt wird.</h2>
        <p>
          Erst ist etwas verborgen. Dann wird es gerufen. Dann wird es geprüft.
          Dann wird der Mensch leer genug, um zu empfangen. Dann wird Gabe teilbar.
        </p>
        <div className="summary-room__movement" aria-label="Tiefe bis Gabe">
          {movement.map((item) => <span key={item}>{item}</span>)}
        </div>
      </section>

      <section className="summary-room__section" aria-labelledby="summary-tora">
        <p className="summary-room__kicker">Die Tora-Bewegung</p>
        <h2 id="summary-tora">Die Schrift beginnt nicht mit fertiger Welt.</h2>
        <p>
          Sie beginnt mit Tiefe. Dann kommt nicht Besitz. Es kommt Wort.
          Dann nicht sofort Heimat. Es kommen Weg, Prüfung, Hunger und Gabe.
        </p>
        <div className="summary-room__scripture">
          {scriptureMovement.map(([label, text]) => (
            <p key={label}>
              <strong>{label}</strong>
              <span>{text}</span>
            </p>
          ))}
        </div>
        <p className="summary-room__quiet">
          So wird Welt nicht einfach gemacht. Sie wird gerufen, unterschieden,
          geprüft, geführt und genährt.
        </p>
      </section>

      <section className="summary-room__section summary-room__section--human" aria-labelledby="summary-human">
        <p className="summary-room__kicker">Der Mensch darin</p>
        <h2 id="summary-human">Die Tora spricht vom Menschen, weil der Mensch selbst ein Weg ist.</h2>
        <div className="summary-room__human-grid">
          {FIRST_JOURNEY_SYMBOLS.map((symbolId) => (
            <p key={symbolId}>
              Auch im Menschen gibt es <strong>{getSymbolPathConfig(symbolId)?.label ?? symbolId}</strong>:
              <span>{humanTexts[symbolId]}.</span>
            </p>
          ))}
        </div>
      </section>

      <section className="summary-room__return" aria-labelledby="summary-return">
        <p className="summary-room__kicker">Rückkehr ins Symbolnetz</p>
        <h2 id="summary-return">Wenn du jetzt ins Symbolnetz zurückkehrst, siehst du Brot nicht mehr allein.</h2>
        <p>
          Du siehst Wasser darin, Licht, Feuer, Wüste und Gabe.
          Die Zeichen stehen nicht nebeneinander. Sie antworten einander.
        </p>
        <div className="summary-room__actions">
          <Link href="/symbolnetz?symbol=brot" className="summary-room__link">
            Zurück ins Symbolnetz
          </Link>
          <Link href="/raeume/wasser?from=journey&path=tiefe-bis-brot" className="summary-room__link summary-room__link--quiet">
            Die Reise von vorn beginnen
          </Link>
        </div>
      </section>
    </main>
  );
}
