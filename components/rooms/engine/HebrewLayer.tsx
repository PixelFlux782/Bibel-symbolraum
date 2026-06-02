import Link from "next/link";
import { useMemo } from "react";
import type { BiblicalScene, HebrewLetterMeaning, SymbolEngineData, SymbolJourneyState } from "@/types/engine";
import { getSymbolHebrewProfile } from "@/lib/hebrew/getSymbolHebrewProfile";
import { buildSymbolMeaningNetwork } from "@/lib/meaning/buildSymbolMeaningNetwork";
import { getMeaningProfile } from "@/lib/meaning/meaningMappings";

type HebrewLayerProps = {
  activeLetter: HebrewLetterMeaning;
  data: SymbolEngineData;
  scenes: BiblicalScene[];
  state: SymbolJourneyState;
  onSelect: (letterId: string) => void;
};

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  return items.filter((item, index) => items.findIndex((candidate) => candidate.id === item.id) === index);
}

export function HebrewLayer({ activeLetter, data, scenes, state, onSelect }: HebrewLayerProps) {
  const codex = useMemo(() => getSymbolHebrewProfile(data), [data]);
  const network = useMemo(() => buildSymbolMeaningNetwork(), []);
  const graphNodes = useMemo(() => {
    const symbolNodes = getMeaningProfile(data.slug).nodes;
    const wordNodes = codex.hebrewWord ? getMeaningProfile(codex.hebrewWord.id).nodes : [];

    return uniqueById([...symbolNodes, ...wordNodes]);
  }, [codex.hebrewWord, data.slug]);
  const meaningFields = state.hebrewMeaningFieldIds?.length
    ? codex.meaningFields.filter((field) => state.hebrewMeaningFieldIds?.includes(field.id))
    : codex.meaningFields;
  const references = useMemo(() => {
    const engineReferences = scenes.map((scene) => ({
      id: scene.id,
      reference: scene.reference,
      relation: scene.meaning,
    }));
    const wordReferences = codex.hebrewWord?.biblicalReferences ?? [];

    return uniqueById([...engineReferences, ...wordReferences]).slice(0, 3);
  }, [codex.hebrewWord, scenes]);
  const connections = useMemo(() => network.paths
    .filter((path) => path.from === data.slug || path.to === data.slug)
    .map((path) => {
      const symbolId = path.from === data.slug ? path.to : path.from;
      return {
        ...path,
        symbol: network.nodes.find((node) => node.id === symbolId),
      };
    })
    .filter((path) => path.symbol)
    .slice(0, 4), [data.slug, network]);

  return (
    <section className="symbol-engine__layer symbol-engine__hebrew-layer symbol-engine__living-codex" aria-label="Lebendiger Hebrew Codex">
      <p className="symbol-engine__layer-kicker">Living Codex</p>
      <div className="symbol-engine__codex-flow" aria-hidden="true" />

      <div className="symbol-engine__codex-stage symbol-engine__codex-word">
        <p>Symbol</p>
        <strong>{data.symbolLabel}</strong>
        <span lang="he" dir="rtl">{codex.hebrewWord?.hebrew ?? data.hebrew.word}</span>
        <i>{codex.hebrewWord?.transliteration ?? data.hebrew.transliteration}</i>
      </div>

      <div className="symbol-engine__codex-stage">
        <p>Buchstaben</p>
        <div className="symbol-engine__hebrew-letters">
          {data.hebrew.letters.map((letter) => (
            <button
              type="button"
              key={letter.id}
              className={`${letter.id === activeLetter.id ? "is-active" : ""} ${state.hebrewLetterIds.includes(letter.id) ? "is-related" : ""}`}
              onClick={() => onSelect(letter.id)}
              aria-pressed={letter.id === activeLetter.id}
            >
              <span lang="he" dir="rtl">{letter.letter}</span>
              <i>{letter.position}</i>
            </button>
          ))}
        </div>

        <article className="symbol-engine__hebrew-explanation">
          <h3>{activeLetter.name}</h3>
          <p>{activeLetter.meaning}</p>
          <p>{activeLetter.detail}</p>
        </article>
      </div>

      <div className="symbol-engine__codex-stage">
        <p>Bedeutungsfelder</p>
        <div className="symbol-engine__codex-cluster">
          {meaningFields.map((field) => <span key={field.id}>{field.label}</span>)}
          {graphNodes.map((node) => <span key={node.id} className="is-graph-node">{node.label}</span>)}
        </div>
      </div>

      <div className="symbol-engine__codex-stage">
        <p>Bibelstellen</p>
        <div className="symbol-engine__codex-references">
          {references.map((reference) => (
            <span key={reference.id} title={reference.relation}>{reference.reference}</span>
          ))}
        </div>
      </div>

      <div className="symbol-engine__codex-stage">
        <p>Verbundene Symbole</p>
        <div className="symbol-engine__codex-connections">
          {connections.map((connection) => (
            <Link key={connection.id} href={connection.symbol!.roomHref} title={connection.summary}>
              <span lang="he" dir="rtl">{connection.symbol!.hebrew}</span>
              {connection.symbol!.label}
            </Link>
          ))}
        </div>
      </div>

      <p className="symbol-engine__layer-copy">{state.hebrewSummary}</p>
    </section>
  );
}
