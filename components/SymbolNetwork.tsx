'use client';

import Image from 'next/image';
import Link from 'next/link';
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
import { SYMBOL_NETWORK, type SymbolNetworkItem, type SymbolRelation } from '@/lib/symbols';

type SymbolNodeData = SymbolNetworkItem & {
  isActive: boolean;
  isRelated: boolean;
};

const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  wasser: { x: 400, y: 250 },
  meer: { x: 155, y: 150 },
  quelle: { x: 640, y: 140 },
  taufe: { x: 180, y: 370 },
  geist: { x: 625, y: 370 },
  tiefe: { x: 400, y: 120 },
  exodus: { x: 115, y: 285 },
  leben: { x: 720, y: 245 },
  reinigung: { x: 395, y: 395 },
  licht: { x: 420, y: 50 },
  wueste: { x: 375, y: 470 },
  fels: { x: 90, y: 485 },
  brot: { x: 675, y: 505 },
  baum: { x: 825, y: 300 },
};

const SYMBOL_LOOKUP = new Map(SYMBOL_NETWORK.map((symbol) => [symbol.id, symbol]));

type NetworkRelation = SymbolRelation & {
  id: string;
  sourceId: string;
};

function relationId(sourceId: string, targetId: string) {
  return [sourceId, targetId].sort().join('-');
}

const SYMBOL_RELATIONS = Array.from(
  SYMBOL_NETWORK.reduce((relations, symbol) => {
    symbol.symbolRelations?.forEach((relation) => {
      if (!SYMBOL_LOOKUP.has(relation.targetId) || relation.targetId === symbol.id) {
        return;
      }

      const id = relationId(symbol.id, relation.targetId);
      const existingRelation = relations.get(id);

      if (!existingRelation || relation.strength > existingRelation.strength) {
        relations.set(id, {
          ...relation,
          id,
          sourceId: symbol.id,
        });
      }
    });

    return relations;
  }, new Map<string, NetworkRelation>())
  .values()
);

function getRelatedIds(symbolId: string) {
  return new Set(
    SYMBOL_RELATIONS.flatMap((relation) => {
      if (relation.sourceId === symbolId) {
        return [relation.targetId];
      }

      if (relation.targetId === symbolId) {
        return [relation.sourceId];
      }

      return [];
    })
  );
}

function getRelatedSymbols(symbolId: string) {
  return Array.from(getRelatedIds(symbolId))
    .map((id) => SYMBOL_LOOKUP.get(id))
    .filter(Boolean) as SymbolNetworkItem[];
}

function getPrimaryRelation(symbolId: string) {
  return SYMBOL_RELATIONS
    .filter((relation) => relation.sourceId === symbolId || relation.targetId === symbolId)
    .sort((a, b) => b.strength - a.strength)[0];
}

function getOtherRelationSymbol(relation: NetworkRelation, symbolId: string) {
  const relatedId = relation.sourceId === symbolId ? relation.targetId : relation.sourceId;

  return SYMBOL_LOOKUP.get(relatedId);
}

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

function SymbolNode({ data }: NodeProps<SymbolNodeData>) {
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
        className={`symbol-constellation-node relative min-w-32 px-6 py-5 text-center transition-colors duration-[1200ms] ${
          data.isActive
            ? 'is-active'
            : data.isRelated
              ? 'is-related'
              : ''
        }`}
      >
        <p className="symbol-breathe font-serif text-4xl leading-none transition-colors duration-1000">
          {data.hebrew}
        </p>
        <p className="mt-3 text-[10px] uppercase tracking-[0.38em] transition-colors duration-1000">
          {data.name}
        </p>
      </div>
    </div>
  );
}

const nodeTypes = {
  symbol: SymbolNode,
};

function buildEdges(activeId: string): Edge[] {
  return SYMBOL_RELATIONS.map((relation) => {
    const strength = Math.max(0, Math.min(relation.strength, 1));
    const isActiveRelation = relation.sourceId === activeId || relation.targetId === activeId;
    const opacity = isActiveRelation ? 0.08 + strength * 0.16 : 0.03 + strength * 0.07;
    const strokeWidth = isActiveRelation ? 0.55 + strength * 0.85 : 0.35 + strength * 0.45;

    return {
      id: relation.id,
      source: relation.sourceId,
      target: relation.targetId,
      type: 'default',
      className: isActiveRelation ? 'is-awake' : 'is-dormant',
      data: {
        relationType: relation.relationType,
        strength: relation.strength,
        explanation: relation.explanation,
      },
      style: {
        stroke: isActiveRelation ? `rgba(189,160,109,${opacity})` : `rgba(127,184,201,${opacity})`,
        strokeWidth,
      },
    } satisfies Edge;
  });
}

export default function SymbolNetwork() {
  const [activeId, setActiveId] = useState('wasser');
  const activeSymbol = SYMBOL_LOOKUP.get(activeId) ?? SYMBOL_NETWORK[0];
  const primaryRelation = getPrimaryRelation(activeSymbol.id);
  const primaryRelationSymbol = primaryRelation
    ? getOtherRelationSymbol(primaryRelation, activeSymbol.id)
    : undefined;
  const relatedIds = useMemo(
    () => getRelatedIds(activeSymbol.id),
    [activeSymbol.id]
  );
  const activeRelatedSymbols = useMemo(
    () => getRelatedSymbols(activeSymbol.id),
    [activeSymbol.id]
  );
  const mobileSymbols = useMemo(
    () => [
      SYMBOL_LOOKUP.get('wasser'),
      ...SYMBOL_NETWORK.filter((symbol) => symbol.id !== 'wasser'),
    ].filter(Boolean) as SymbolNetworkItem[],
    []
  );

  const nodes = useMemo<Node<SymbolNodeData>[]>(
    () =>
      SYMBOL_NETWORK.map((symbol, index) => ({
        id: symbol.id,
        type: 'symbol',
        position: getNodePosition(symbol.id, index, SYMBOL_NETWORK.length),
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

      <div className="symbol-fade-in relative z-10 mx-auto grid max-w-7xl gap-16 overflow-hidden lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          <p className="symbol-kicker">
            Lebendiges Bedeutungsnetz
          </p>
          <h1 className="mt-6 max-w-4xl font-serif text-5xl italic leading-tight text-foreground-strong sm:text-7xl">
            Symbolnetz
          </h1>
          <p className="symbol-copy mt-6 max-w-[20rem] text-base sm:max-w-2xl sm:text-xl">
            Ein stilles Archiv aus Beziehungen. Jeder Ort leuchtet aus den Zeichen, die ihn umgeben.
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
                      {symbol.hebrew}
                    </span>
                    <span className="symbol-mobile-name">
                      {symbol.name}
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
            Hebräisch
          </p>
          <p className="symbol-breathe mt-8 font-serif text-7xl leading-none text-gold/90">
            {activeSymbol.hebrew}
          </p>
          <h2 className="mt-7 font-serif text-4xl italic text-foreground-strong">
            {activeSymbol.name}
          </h2>
          {activeSymbol.transliteration ? (
            <p className="mt-3 text-[11px] uppercase tracking-[0.32em] text-[#d8d1c2]/50">
              {activeSymbol.transliteration}
            </p>
          ) : null}
          <p className="symbol-kicker mt-8 text-cyan-soft">
            Kurzdeutung
          </p>
          <p className="symbol-copy mt-6 text-lg">
            {activeSymbol.shortMeaning}
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {activeRelatedSymbols.map((related) => {
              return (
                <button
                  key={related.id}
                  type="button"
                  onClick={() => setActiveId(related.id)}
                  className="border-b border-white/[0.06] bg-transparent px-1 py-2 text-[10px] uppercase tracking-[0.24em] text-[#d8d1c2]/60 transition-colors duration-[1200ms] hover:border-gold/[0.15] hover:text-gold/70"
                >
                  {related.name}
                </button>
              );
            })}
          </div>
          {primaryRelation ? (
            <div className="mt-8 border-t border-white/[0.055] pt-6">
              <p className="symbol-kicker text-cyan-soft">
                Wichtigste Relation
              </p>
              <p className="symbol-copy mt-4 text-sm">
                {primaryRelationSymbol ? `${primaryRelationSymbol.name}: ` : ''}
                {primaryRelation.explanation}
              </p>
            </div>
          ) : null}
          {activeSymbol.roomHref === '/raeume/wasser' ? (
            <RoomTransitionButton
              href={activeSymbol.roomHref}
              className="symbol-cta mt-10 w-full"
            >
              Wasserraum betreten
            </RoomTransitionButton>
          ) : activeSymbol.roomHref ? (
            <Link href={activeSymbol.roomHref} className="symbol-cta mt-10 w-full">
              Raum betreten
            </Link>
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
