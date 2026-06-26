"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { getSymbolHebrewProfile } from "@/lib/hebrew/getSymbolHebrewProfile";
import { hebrewLetters } from "@/lib/hebrew/hebrewLetters";
import { hebrewWords } from "@/lib/hebrew/hebrewWords";
import { buildSymbolMeaningNetwork } from "@/lib/meaning/buildSymbolMeaningNetwork";
import { getMeaningProfile } from "@/lib/meaning/meaningMappings";

type LetterOverlayProps = {
  initialLetterId: string;
  bridgeContext?: {
    fromLabel: string;
    toLabel: string;
  };
  onActiveLetterChange?: (letterId: string) => void;
  visibleLetterIds?: string[];
  onClose: () => void;
};

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  return items.filter((item, index) => items.findIndex((candidate) => candidate.id === item.id) === index);
}

export function LetterOverlay({ initialLetterId, bridgeContext, onActiveLetterChange, visibleLetterIds, onClose }: LetterOverlayProps) {
  const [activeLetterId, setActiveLetterId] = useState(initialLetterId);
  const visibleLetterIdSet = useMemo(() => visibleLetterIds ? new Set(visibleLetterIds) : undefined, [visibleLetterIds]);
  const network = useMemo(() => buildSymbolMeaningNetwork(), []);
  const activeLetter = hebrewLetters.find((letter) => letter.id === activeLetterId) ?? hebrewLetters[0];
  const words = useMemo(
    () => hebrewWords.filter((word) => word.letterIds.includes(activeLetter.id)),
    [activeLetter.id],
  );
  const symbols = useMemo(
    () => network.nodes.filter((symbol) =>
      getSymbolHebrewProfile(symbol.id).letters.some((letter) => letter.id === activeLetter.id)),
    [activeLetter.id, network.nodes],
  );
  const meaningFields = useMemo(
    () => uniqueById(words.flatMap((word) => word.meaningFields)),
    [words],
  );
  const graphNodes = useMemo(
    () => uniqueById(words.flatMap((word) => getMeaningProfile(word.id).nodes)),
    [words],
  );
  const emergenceSequence = useMemo(
    () => [
      ...graphNodes.map((node) => node.label),
      ...symbols.map((symbol) => symbol.label),
    ],
    [graphNodes, symbols],
  );
  const activeBridgeContext = activeLetter.id === initialLetterId ? bridgeContext : undefined;

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  useEffect(() => {
    onActiveLetterChange?.(activeLetter.id);
  }, [activeLetter.id, onActiveLetterChange]);

  return createPortal(
    <div className="symbol-engine__letter-overlay" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="letter-overlay-title"
        className="symbol-engine__letter-dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="symbol-engine__letter-dialog-header">
          <div>
            <p>Hebrew Codex</p>
            <h2 id="letter-overlay-title">{activeBridgeContext ? "Dieser Buchstabe verbindet." : "Wo erscheint dieser Buchstabe?"}</h2>
            {activeBridgeContext ? (
              <strong className="symbol-engine__letter-bridge-context">
                Dieser Buchstabe verbindet {activeBridgeContext.fromLabel} und {activeBridgeContext.toLabel}.
              </strong>
            ) : null}
          </div>
          <button type="button" onClick={onClose} aria-label="Letter Overlay schliessen">Schliessen</button>
        </header>

        <nav className="symbol-engine__letter-alphabet" aria-label="Hebräische Buchstaben">
          {hebrewLetters.map((letter) => {
            const isVisible = visibleLetterIdSet ? visibleLetterIdSet.has(letter.id) : true;

            return (
              <button
                type="button"
                key={letter.id}
                className={letter.id === activeLetter.id ? "is-active" : ""}
                onClick={() => setActiveLetterId(letter.id)}
                aria-pressed={letter.id === activeLetter.id}
                disabled={!isVisible}
                title={isVisible ? letter.name : `${letter.name} ist im Archiv noch verborgen`}
              >
                <span lang="he" dir="rtl">{letter.glyph}</span>
                <i>{isVisible ? letter.name : "verborgen"}</i>
              </button>
            );
          })}
        </nav>

        <div className="symbol-engine__letter-detail">
          <section className="symbol-engine__letter-intro">
            <span lang="he" dir="rtl">{activeLetter.glyph}</span>
            <div>
              <p>{String(activeLetter.alphabetPosition).padStart(2, "0")} / 22 · Zahlenwert {activeLetter.numericValue}</p>
              <h3>{activeLetter.name}</h3>
              <i>{activeLetter.transcription}</i>
              <strong>
                {activeLetter.archetypalMeanings.length
                  ? activeLetter.archetypalMeanings.join(" · ")
                  : "Im Hebrew Codex noch nicht kuratiert."}
              </strong>
            </div>
          </section>

          <section>
            <h4>Kurzdeutung</h4>
            {activeLetter.symbolism.length ? (
              <div className="symbol-engine__letter-symbolism">
                {activeLetter.symbolism.map((symbolism) => (
                  <article key={symbolism.id}>
                    <strong>{symbolism.label}</strong>
                    <p>{symbolism.description}</p>
                  </article>
                ))}
              </div>
            ) : <p className="symbol-engine__letter-empty">Für diesen Buchstaben ist noch keine Kurzdeutung im Codex hinterlegt.</p>}
          </section>

          <section>
            <h4>Meaning Fields</h4>
            <div className="symbol-engine__letter-cluster">
              {meaningFields.map((field) => <span key={field.id} title={field.description}>{field.label}</span>)}
              {graphNodes.map((node) => <span key={node.id} className="is-graph-node" title={node.description}>{node.label}</span>)}
              {!meaningFields.length && !graphNodes.length ? <p className="symbol-engine__letter-empty">Noch keine verknüpften Meaning Fields.</p> : null}
            </div>
          </section>

          <section>
            <h4>Was entsteht aus diesem Buchstaben?</h4>
            {emergenceSequence.length ? (
              <ol className="symbol-engine__letter-emergence">
                {emergenceSequence.map((item, index) => (
                  <li key={`${item}-${index}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{item}</strong>
                  </li>
                ))}
              </ol>
            ) : <p className="symbol-engine__letter-empty">Noch keine verknüpften Meaning Nodes oder Symbolräume.</p>}
          </section>

          <section>
            <h4>Erscheint in: Wörter</h4>
            <div className="symbol-engine__letter-links">
              {words.map((word) => {
                const room = symbols.find((symbol) => getSymbolHebrewProfile(symbol.id).hebrewWord?.id === word.id);

                return room ? (
                  <Link key={word.id} href={room.roomHref}>
                    <span lang="he" dir="rtl">{word.hebrew}</span>
                    <strong>{word.transliteration}</strong>
                    <i>{word.germanMeaning}</i>
                  </Link>
                ) : (
                  <span key={word.id}>
                    <span lang="he" dir="rtl">{word.hebrew}</span>
                    <strong>{word.transliteration}</strong>
                    <i>{word.germanMeaning}</i>
                  </span>
                );
              })}
              {!words.length ? <p className="symbol-engine__letter-empty">Noch keine verknüpften Wörter.</p> : null}
            </div>
          </section>

          <section>
            <h4>Führt zu: Symbolräume</h4>
            <div className="symbol-engine__letter-links">
              {symbols.map((symbol) => (
                <Link key={symbol.id} href={symbol.roomHref}>
                  <span lang="he" dir="rtl">{symbol.hebrew}</span>
                  <strong>{symbol.label}</strong>
                  <i>Raum betreten</i>
                </Link>
              ))}
              {!symbols.length ? <p className="symbol-engine__letter-empty">Noch keine verknüpften Symbolräume.</p> : null}
            </div>
          </section>
        </div>
      </section>
    </div>,
    document.body,
  );
}
