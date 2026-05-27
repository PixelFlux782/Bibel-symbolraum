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
import 'reactflow/dist/style.css';
import { SYMBOL_NETWORK, type SymbolNetworkItem } from '@/lib/symbols';

type SymbolNodeData = SymbolNetworkItem & {
  isActive: boolean;
};

const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  wasser: { x: 390, y: 250 },
  meer: { x: 130, y: 145 },
  quelle: { x: 650, y: 130 },
  taufe: { x: 155, y: 390 },
  geist: { x: 640, y: 390 },
  licht: { x: 420, y: 35 },
  wueste: { x: 365, y: 500 },
  fels: { x: 35, y: 545 },
  brot: { x: 690, y: 570 },
  baum: { x: 870, y: 300 },
};

const SYMBOL_LOOKUP = new Map(SYMBOL_NETWORK.map((symbol) => [symbol.id, symbol]));

function SymbolNode({ data }: NodeProps<SymbolNodeData>) {
  return (
    <div className="group relative cursor-pointer">
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />

      <div
        className={`light-pulse absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl transition-opacity duration-1000 ${
          data.isActive
            ? 'bg-gold/25 opacity-80'
            : 'bg-[#6dc8df]/12 opacity-35 group-hover:opacity-50'
        }`}
      />
      <div
        className={`absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-opacity duration-1000 ${
          data.isActive
            ? 'border-gold/20 opacity-80 shadow-[0_0_48px_rgba(189,160,109,0.1)]'
            : 'border-white/0 opacity-0 group-hover:border-gold/10 group-hover:opacity-55'
        }`}
      />

      <div
        className={`symbol-node-pulse relative min-w-32 border px-6 py-5 text-center backdrop-blur-md transition-colors duration-[1200ms] ${
          data.isActive
            ? 'border-gold/40 bg-[#08090e]/80'
            : 'border-white/10 bg-black/30 group-hover:border-gold/20 group-hover:bg-white/[0.035]'
        }`}
      >
        <p className="symbol-breathe font-serif text-4xl leading-none text-gold/90 transition-colors duration-1000 group-hover:text-gold/95">
          {data.hebrew}
        </p>
        <p className="mt-3 text-[10px] uppercase tracking-[0.38em] text-[#d8d1c2]/72 transition-colors duration-1000 group-hover:text-foreground">
          {data.name}
        </p>
      </div>
    </div>
  );
}

const nodeTypes = {
  symbol: SymbolNode,
};

function buildEdges(): Edge[] {
  const edgeIds = new Set<string>();

  return SYMBOL_NETWORK.flatMap((symbol) =>
    symbol.relatedSymbols
      .filter((target) => SYMBOL_LOOKUP.has(target))
      .map((target) => {
        const id = [symbol.id, target].sort().join('-');

        if (edgeIds.has(id)) {
          return null;
        }

        edgeIds.add(id);

        return {
          id,
          source: symbol.id,
          target,
          type: 'smoothstep',
          style: {
            stroke: 'rgba(189,160,109,0.2)',
            strokeWidth: 0.8,
          },
        } satisfies Edge;
      })
      .filter(Boolean)
  ) as Edge[];
}

export default function SymbolNetwork() {
  const [activeId, setActiveId] = useState('wasser');
  const activeSymbol = SYMBOL_LOOKUP.get(activeId) ?? SYMBOL_NETWORK[0];
  const mobileSymbols = useMemo(
    () => [
      SYMBOL_LOOKUP.get('wasser'),
      ...SYMBOL_NETWORK.filter((symbol) => symbol.id !== 'wasser'),
    ].filter(Boolean) as SymbolNetworkItem[],
    []
  );

  const nodes = useMemo<Node<SymbolNodeData>[]>(
    () =>
      SYMBOL_NETWORK.map((symbol) => ({
        id: symbol.id,
        type: 'symbol',
        position: NODE_POSITIONS[symbol.id] ?? { x: 0, y: 0 },
        data: {
          ...symbol,
          isActive: symbol.id === activeId,
        },
      })),
    [activeId]
  );

  const edges = useMemo(() => buildEdges(), []);

  return (
    <section className="symbol-page symbol-section relative min-h-screen pb-24 pt-40 md:pt-36">
      <div className="absolute inset-0">
        <Image
          src="/Visuals/symbolnetz_backround.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="sacred-drift object-cover opacity-[0.18]"
        />
        <div className="light-pulse absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(189,160,109,0.08),transparent_29%),linear-gradient(180deg,rgba(2,5,12,0.84),rgba(2,5,12,0.5)_44%,rgba(2,5,12,0.96))]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_34%,rgba(0,0,0,0.62)_78%,rgba(0,0,0,0.88)_100%)]" />
      </div>

      <div className="symbol-fade-in relative z-10 mx-auto grid max-w-7xl gap-8 overflow-hidden lg:grid-cols-[minmax(0,1fr)_23rem]">
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

          <div className="symbol-mobile-journey mt-8 md:hidden" aria-label="Gefuehrte Symbolauswahl">
            {mobileSymbols.map((symbol, index) => {
              const isActive = symbol.id === activeId;

              return (
                <div key={symbol.id} className="symbol-mobile-step">
                  <button
                    type="button"
                    onClick={() => setActiveId(symbol.id)}
                    aria-pressed={isActive}
                    className={`symbol-mobile-seal ${isActive ? 'is-active' : ''}`}
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

          <div className="symbol-panel relative mt-10 hidden h-[560px] overflow-hidden md:block sm:h-[620px]">
            <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_44%,transparent_36%,rgba(2,5,12,0.72)_100%)]" />
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              connectionMode={ConnectionMode.Loose}
              fitView
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

        <aside className="scroll-reveal symbol-panel symbol-detail-panel self-end p-7">
          <p className="symbol-kicker text-cyan-soft">
            Aktiver Ort
          </p>
          <p className="symbol-breathe mt-8 font-serif text-7xl leading-none text-gold/90">
            {activeSymbol.hebrew}
          </p>
          <h2 className="mt-7 font-serif text-4xl italic text-foreground-strong">
            {activeSymbol.name}
          </h2>
          <p className="symbol-copy mt-6 text-lg">
            {activeSymbol.shortMeaning}
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {activeSymbol.relatedSymbols.map((id) => {
              const related = SYMBOL_LOOKUP.get(id);

              if (!related) {
                return null;
              }

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveId(id)}
                  className="border border-white/10 bg-white/[0.025] px-3 py-2 text-[10px] uppercase tracking-[0.24em] text-[#d8d1c2]/62 transition-colors duration-[1200ms] hover:border-gold/20 hover:text-gold/75"
                >
                  {related.name}
                </button>
              );
            })}
          </div>
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
            <div className="mt-10 border border-white/10 bg-white/[0.025] px-5 py-4 text-center text-[11px] uppercase tracking-[0.28em] text-[#d8d1c2]/45">
              Raum in Vorbereitung
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
