'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
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
        className={`absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl transition duration-1000 ${
          data.isActive
            ? 'bg-gold/35 opacity-100'
            : 'bg-[#6dc8df]/18 opacity-45 group-hover:opacity-80'
        }`}
      />
      <div
        className={`absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border transition duration-1000 ${
          data.isActive
            ? 'border-gold/25 opacity-100 shadow-[0_0_80px_rgba(189,160,109,0.16)]'
            : 'border-white/0 opacity-0 group-hover:border-gold/10 group-hover:opacity-100'
        }`}
      />

      <div
        className={`symbol-node-pulse relative min-w-32 border px-6 py-5 text-center backdrop-blur-md transition duration-700 ${
          data.isActive
            ? 'border-gold/40 bg-[#08090e]/80'
            : 'border-white/10 bg-black/30 group-hover:border-gold/28 group-hover:bg-white/[0.045]'
        }`}
      >
        <p className="font-serif text-4xl leading-none text-gold/90 transition duration-700 group-hover:text-gold">
          {data.hebrew}
        </p>
        <p className="mt-3 text-[10px] uppercase tracking-[0.38em] text-[#d8d1c2]/72 transition duration-700 group-hover:text-foreground">
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
    <section className="relative min-h-screen overflow-hidden px-5 pb-20 pt-32 sm:px-8 lg:px-14">
      <div className="absolute inset-0">
        <Image
          src="/Visuals/symbolnetz_backround.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.28]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(189,160,109,0.12),transparent_27%),linear-gradient(180deg,rgba(2,5,12,0.82),rgba(2,5,12,0.38)_42%,rgba(2,5,12,0.96))]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_34%,rgba(0,0,0,0.62)_78%,rgba(0,0,0,0.88)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_23rem]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.5em] text-gold/70">
            Lebendiges Bedeutungsnetz
          </p>
          <h1 className="mt-6 max-w-4xl font-serif text-5xl italic leading-tight text-foreground-strong sm:text-7xl">
            Symbolnetz
          </h1>
          <p className="mt-6 max-w-2xl font-serif text-xl leading-relaxed text-[#d8d1c2]/72">
            Ein stilles Archiv aus Beziehungen. Jeder Ort leuchtet aus den Zeichen, die ihn umgeben.
          </p>

          <div className="relative mt-10 h-[620px] overflow-hidden border border-white/10 bg-black/[0.18] backdrop-blur-sm">
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

        <aside className="self-end border border-gold/15 bg-[#05070d]/[0.78] p-7 backdrop-blur-md">
          <p className="text-[10px] uppercase tracking-[0.42em] text-[#7fb8c9]/70">
            Aktiver Ort
          </p>
          <p className="mt-8 font-serif text-7xl leading-none text-gold/90">
            {activeSymbol.hebrew}
          </p>
          <h2 className="mt-7 font-serif text-4xl italic text-foreground-strong">
            {activeSymbol.name}
          </h2>
          <p className="mt-6 font-serif text-lg leading-relaxed text-[#d8d1c2]/72">
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
                  className="border border-white/10 bg-white/[0.025] px-3 py-2 text-[10px] uppercase tracking-[0.24em] text-[#d8d1c2]/62 transition duration-500 hover:border-gold/25 hover:text-gold/80"
                >
                  {related.name}
                </button>
              );
            })}
          </div>
          {activeSymbol.roomHref ? (
            <Link
              href={activeSymbol.roomHref}
              className="mt-10 inline-flex w-full items-center justify-center border border-gold/30 bg-gold/[0.08] px-5 py-4 text-[11px] uppercase tracking-[0.32em] text-[#f2deae] transition duration-500 hover:border-gold/60 hover:bg-gold/[0.13]"
            >
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
