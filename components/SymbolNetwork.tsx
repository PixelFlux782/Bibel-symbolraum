'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { RoomTransitionButton } from '@/components/transitions/RoomTransition';
import ReactFlow, {
  ConnectionMode,
  Edge,
  Handle,
  Node,
  NodeProps,
  Position,
} from 'reactflow';
import {
  getConnectedNodes,
  getEdgesForNode,
  getMostImportantRelation,
  getNodeById,
  getPrimaryPath,
  waterSymbolGraph,
  type MeaningEdge,
  type SymbolNode as EngineSymbolNode,
} from '@/lib/symbolism';

type SymbolNodeData = EngineSymbolNode & {
  isActive: boolean;
  isRelated: boolean;
};

const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  water: { x: 430, y: 310 },
  mayim: { x: 430, y: 78 },
  mem: { x: 245, y: 45 },
  yod: { x: 615, y: 45 },
  sea: { x: 104, y: 260 },
  well: { x: 760, y: 210 },
  spring: { x: 830, y: 430 },
  baptism: { x: 235, y: 475 },
  spirit: { x: 565, y: 475 },
  desert: { x: 60, y: 560 },
  rock: { x: 265, y: 650 },
  light: { x: 650, y: 650 },
  'genesis-1-2': { x: 770, y: 70 },
  'exodus-14': { x: 40, y: 390 },
};

function getNodePosition(symbolId: string, index: number, total: number) {
  const fixedPosition = NODE_POSITIONS[symbolId];

  if (fixedPosition) {
    return fixedPosition;
  }

  const radius = 300;
  const angle = (Math.PI * 2 * index) / Math.max(total, 1) - Math.PI / 2;

  return {
    x: 445 + Math.cos(angle) * radius,
    y: 305 + Math.sin(angle) * radius,
  };
}

function getRelationLabel(relation: MeaningEdge['relation']) {
  const labels: Record<MeaningEdge['relation'], string> = {
    contains: 'Enthält',
    'unfolds-into': 'Entfaltet sich',
    'letter-of': 'Buchstabenebene',
    'scene-of': 'Biblische Szene',
    transforms: 'Verwandelt',
    contrasts: 'Kontrastiert',
    reveals: 'Offenbart',
    'moves-over': 'Bewegt sich über',
    'breaks-through': 'Bricht hervor',
    feeds: 'Speist',
    'opens-path': 'Öffnet Weg',
  };

  return labels[relation];
}

function getLayerLabel(layer: MeaningEdge['layer']) {
  const labels: Record<MeaningEdge['layer'], string> = {
    surface: 'Symbol',
    biblical: 'Biblisch',
    hebrew: 'Hebräisch',
    letter: 'Buchstabe',
    spiritual: 'Geistlich',
    existential: 'Existentiell',
    visual: 'Visuell',
  };

  return labels[layer];
}

function getOtherNodeId(edge: MeaningEdge, nodeId: string) {
  return edge.source === nodeId ? edge.target : edge.source;
}

function SymbolGraphNode({ data }: NodeProps<SymbolNodeData>) {
  const nodeSize = data.id === waterSymbolGraph.centerId ? 'h-44 w-44' : 'h-36 w-36';
  const displayMark = data.hebrew ?? (data.type === 'scripture' ? data.label.replace('Genesis ', 'Gen ') : data.label);

  return (
    <div className="group relative cursor-pointer">
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />

      <div
        className={`light-pulse absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl transition-opacity duration-1000 ${
          data.isActive
            ? 'bg-gold/[0.22] opacity-75'
            : data.isRelated
              ? 'bg-[#6dc8df]/[0.12] opacity-[0.48]'
              : 'bg-[#6dc8df]/[0.08] opacity-20'
        }`}
      />
      <div
        className={`absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-opacity duration-1000 ${
          data.isActive
            ? 'border-gold/10 opacity-60 shadow-[0_0_48px_rgba(189,160,109,0.07)]'
            : data.isRelated
              ? 'border-cyan/10 opacity-[0.34] shadow-[0_0_38px_rgba(127,184,201,0.045)]'
              : 'border-white/0 opacity-0'
        }`}
      />

      <div
        className={`symbol-constellation-node relative grid ${nodeSize} place-items-center px-5 py-5 text-center transition-colors duration-[1200ms] ${
          data.isActive
            ? 'is-active'
            : data.isRelated
              ? 'is-related'
              : ''
        }`}
      >
        <div>
          <p
            className="symbol-breathe font-serif text-4xl leading-none transition-colors duration-1000"
            lang={data.hebrew ? 'he' : undefined}
            dir={data.hebrew ? 'rtl' : undefined}
          >
            {displayMark}
          </p>
          <p className="mt-3 text-[10px] uppercase tracking-[0.34em] transition-colors duration-1000">
            {data.label}
          </p>
        </div>
      </div>
    </div>
  );
}

const nodeTypes = {
  symbol: SymbolGraphNode,
};

function buildEdges(activeId: string): Edge[] {
  return waterSymbolGraph.edges.map((edge, index) => {
    const strength = Math.max(0, Math.min(edge.weight, 1));
    const isActiveRelation = edge.source === activeId || edge.target === activeId;
    const opacity = isActiveRelation ? 0.09 + strength * 0.24 : 0.025 + strength * 0.06;
    const strokeWidth = isActiveRelation ? 0.85 + strength * 1.75 : 0.35 + strength * 0.42;

    return {
      id: `${edge.source}-${edge.target}-${index}`,
      source: edge.source,
      target: edge.target,
      type: 'default',
      className: isActiveRelation ? 'is-awake' : 'is-dormant',
      data: {
        relationType: edge.relation,
        strength: edge.weight,
        explanation: edge.explanation,
      },
      style: {
        stroke: isActiveRelation ? `rgba(189,160,109,${opacity})` : `rgba(127,184,201,${opacity})`,
        strokeWidth,
      },
    } satisfies Edge;
  });
}

export default function SymbolNetwork() {
  const [activeId, setActiveId] = useState(waterSymbolGraph.centerId);
  const activeSymbol = getNodeById(waterSymbolGraph, activeId) ?? waterSymbolGraph.nodes[0];
  const activeEdges = useMemo(
    () => getEdgesForNode(waterSymbolGraph, activeSymbol.id).sort((a, b) => b.weight - a.weight),
    [activeSymbol.id]
  );
  const importantRelation = useMemo(
    () => getMostImportantRelation(waterSymbolGraph, activeSymbol.id),
    [activeSymbol.id]
  );
  const primaryPath = useMemo(
    () => getPrimaryPath(waterSymbolGraph, activeSymbol.id),
    [activeSymbol.id]
  );
  const meaningLayers = useMemo(
    () => Array.from(new Set(activeEdges.map((edge) => edge.layer))),
    [activeEdges]
  );
  const relatedIds = useMemo(
    () => new Set(activeEdges.map((edge) => getOtherNodeId(edge, activeSymbol.id))),
    [activeEdges, activeSymbol.id]
  );
  const activeRelatedSymbols = useMemo(
    () => getConnectedNodes(waterSymbolGraph, activeSymbol.id),
    [activeSymbol.id]
  );
  const mobileSymbols = useMemo(
    () => [
      getNodeById(waterSymbolGraph, waterSymbolGraph.centerId),
      ...waterSymbolGraph.nodes.filter((symbol) => symbol.id !== waterSymbolGraph.centerId),
    ].filter(Boolean) as EngineSymbolNode[],
    []
  );

  const nodes = useMemo<Node<SymbolNodeData>[]>(
    () =>
      waterSymbolGraph.nodes.map((symbol, index) => ({
        id: symbol.id,
        type: 'symbol',
        position: getNodePosition(symbol.id, index, waterSymbolGraph.nodes.length),
        data: {
          ...symbol,
          isActive: symbol.id === activeId,
          isRelated: relatedIds.has(symbol.id),
        },
      })),
    [activeId, relatedIds]
  );

  const edges = useMemo(() => buildEdges(activeId), [activeId]);

  return (
    <section className="symbol-page symbol-section relative min-h-screen pb-32 pt-40 md:pt-36">
      <div className="absolute inset-0">
        <Image
          src="/Visuals/symbolnetz_backround.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="sacred-drift object-cover opacity-[0.18]"
        />
        <div className="light-pulse absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(189,160,109,0.055),transparent_25%),linear-gradient(180deg,rgba(2,5,12,0.9),rgba(2,5,12,0.64)_44%,rgba(2,5,12,0.98))]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_24%,rgba(0,0,0,0.7)_72%,rgba(0,0,0,0.94)_100%)]" />
      </div>

      <div className="symbol-fade-in relative z-10 mx-auto grid max-w-7xl gap-16 overflow-hidden lg:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="min-w-0">
          <p className="symbol-kicker">
            Lebendiges Bedeutungsnetz
          </p>
          <h1 className="mt-6 max-w-4xl font-serif text-5xl italic leading-tight text-foreground-strong sm:text-7xl">
            {waterSymbolGraph.title}
          </h1>
          <p className="symbol-copy mt-6 max-w-[20rem] text-base sm:max-w-2xl sm:text-xl">
            Bedeutung ist nicht nur Text. Sie bewegt sich zwischen Symbol, Hebräisch, Tiefe, Resonanz und biblischer Szene.
          </p>

          <div className="symbol-mobile-journey mt-10 md:hidden" aria-label="Gefuehrte Symbolauswahl">
            {mobileSymbols.map((symbol, index) => {
              const isActive = symbol.id === activeId;
              const isRelated = relatedIds.has(symbol.id);

              return (
                <div key={symbol.id} className="symbol-mobile-step">
                  <button
                    type="button"
                    onClick={() => setActiveId(symbol.id)}
                    aria-pressed={isActive}
                    className={`symbol-mobile-seal ${isActive ? 'is-active' : ''} ${isRelated ? 'is-related' : ''}`}
                  >
                    <span className="symbol-mobile-index">
                      {index === 0 ? 'Einstieg' : String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="symbol-mobile-hebrew symbol-breathe">
                      {symbol.hebrew ?? symbol.label}
                    </span>
                    <span className="symbol-mobile-name">
                      {symbol.label}
                    </span>
                    <span className="symbol-mobile-meaning">
                      {symbol.shortMeaning}
                    </span>
                  </button>
                  {index < mobileSymbols.length - 1 ? (
                    <span className="symbol-mobile-thread" aria-hidden="true" />
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="symbol-constellation-field relative mt-16 h-[620px] overflow-hidden max-md:absolute max-md:left-[-9999px] max-md:top-0 max-md:mt-0 max-md:h-px max-md:w-px max-md:opacity-0 sm:h-[700px]">
            <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_44%,transparent_30%,rgba(2,5,12,0.78)_100%)]" />
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              connectionMode={ConnectionMode.Loose}
              fitView
              fitViewOptions={{ padding: 0.22 }}
              minZoom={0.62}
              maxZoom={1.15}
              proOptions={{ hideAttribution: true }}
              nodesDraggable={false}
              nodesConnectable={false}
              zoomOnScroll={false}
              panOnScroll={false}
              panOnDrag
              preventScrolling={false}
              onNodeClick={(_, node) => setActiveId(node.id)}
              className="symbol-network-flow bg-transparent"
            />
          </div>
        </div>

        <aside className="scroll-reveal symbol-detail-panel symbol-archive-fragment self-end p-7">
          <p className="symbol-kicker text-cyan-soft">
            Ausgewählter Knoten
          </p>
          <p
            className="symbol-breathe mt-8 font-serif text-7xl leading-none text-gold/90"
            lang={activeSymbol.hebrew ? 'he' : undefined}
            dir={activeSymbol.hebrew ? 'rtl' : undefined}
          >
            {activeSymbol.hebrew ?? activeSymbol.label}
          </p>
          <h2 className="mt-7 font-serif text-4xl italic text-foreground-strong">
            {activeSymbol.label}
          </h2>
          {activeSymbol.transliteration ? (
            <p className="mt-3 text-[11px] uppercase tracking-[0.32em] text-[#d8d1c2]/50">
              {activeSymbol.transliteration}
            </p>
          ) : null}
          {activeSymbol.gematria ? (
            <p className="mt-3 text-[11px] uppercase tracking-[0.28em] text-gold/45">
              Gematria {activeSymbol.gematria}
            </p>
          ) : null}

          <p className="symbol-kicker mt-8 text-cyan-soft">
            Kurzdeutung
          </p>
          <p className="symbol-copy mt-6 text-lg">
            {activeSymbol.shortMeaning}
          </p>

          <div className="mt-8 border-t border-white/[0.055] pt-6">
            <p className="symbol-kicker text-cyan-soft">
              Bedeutungsebenen
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {meaningLayers.map((layer) => (
                <span
                  key={layer}
                  className="border border-white/[0.055] bg-white/[0.025] px-3 py-2 text-[10px] uppercase tracking-[0.24em] text-[#d8d1c2]/58"
                >
                  {getLayerLabel(layer)}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 border-t border-white/[0.055] pt-6">
            <p className="symbol-kicker text-cyan-soft">
              Verbundene Symbole
            </p>
            <div className="mt-5 grid gap-3">
              {activeRelatedSymbols.map((related) => {
                const edge = activeEdges.find(
                  (item) =>
                    (item.source === activeSymbol.id && item.target === related.id) ||
                    (item.target === activeSymbol.id && item.source === related.id)
                );

                return (
                  <button
                    key={related.id}
                    type="button"
                    onClick={() => setActiveId(related.id)}
                    className="group border-l border-cyan/[0.12] bg-white/[0.018] px-4 py-3 text-left transition-colors duration-[1200ms] hover:border-gold/[0.22] hover:bg-white/[0.035]"
                  >
                    <span className="block font-serif text-lg italic text-foreground-strong/80 group-hover:text-gold/80">
                      {related.label}
                      {edge ? (
                        <span className="ml-3 align-middle text-[10px] uppercase tracking-[0.22em] text-cyan-soft/55">
                          {Math.round(edge.weight * 100)}%
                        </span>
                      ) : null}
                    </span>
                    {edge ? (
                      <span className="mt-1 block text-[10px] uppercase tracking-[0.22em] text-[#d8d1c2]/45">
                        {getRelationLabel(edge.relation)}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 border-t border-white/[0.055] pt-6">
            <p className="symbol-kicker text-cyan-soft">
              Bibelpfad
            </p>
            <div className="mt-5 flex flex-wrap gap-x-3 gap-y-2 text-sm text-[#d8d1c2]/62">
              {primaryPath.map((pathNode, index) => (
                <button
                  key={`${pathNode.id}-${index}`}
                  type="button"
                  onClick={() => setActiveId(pathNode.id)}
                  className="font-serif italic transition-colors duration-700 hover:text-gold/80"
                >
                  {index > 0 ? <span className="mr-3 text-cyan-soft/35">/</span> : null}
                  {pathNode.label}
                </button>
              ))}
            </div>
          </div>

          {importantRelation ? (
            <div className="mt-8 border-t border-white/[0.055] pt-6">
              <p className="symbol-kicker text-cyan-soft">
                Wichtigste Relation
              </p>
              <p className="symbol-copy mt-4 text-sm">
                {importantRelation.explanation}
              </p>
            </div>
          ) : null}

          {activeSymbol.roomHref ? (
            <RoomTransitionButton
              href={activeSymbol.roomHref}
              className="symbol-cta mt-10 w-full"
            >
              Raum betreten
            </RoomTransitionButton>
          ) : (
            <div className="mt-10 border-y border-white/[0.055] bg-transparent px-5 py-4 text-center text-[11px] uppercase tracking-[0.28em] text-[#d8d1c2]/45">
              Raum in Vorbereitung
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
