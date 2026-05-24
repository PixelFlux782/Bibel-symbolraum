'use client';

import React from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Edge,
  Node,
  Position,
  Handle,
  ConnectionMode,
} from "reactflow";
import 'reactflow/dist/style.css';

const SymbolNode = ({ data }: { data: { label: string, isRoot?: boolean } }) => (
  <div className="group relative">
    <Handle type="target" position={Position.Top} className="opacity-0" />
    
    <div className={`
      px-8 py-4 rounded-full backdrop-blur-xl transition-all duration-1000
      border border-white/5 group-hover:border-amber-200/30
      ${data.isRoot ? 'bg-amber-50/5 scale-105 shadow-[0_0_40px_rgba(189,160,109,0.05)]' : 'bg-white/[0.02]'}
    `}>
      <div className="relative flex items-center justify-center">
        <div className={`
          absolute inset-0 blur-3xl rounded-full transition-opacity duration-1000 opacity-10 group-hover:opacity-40
          ${data.isRoot ? 'bg-gold' : 'bg-blue-100'}
        `} />
        
        <span className={`
          relative z-10 font-serif italic tracking-[0.15em] whitespace-nowrap transition-colors duration-700
          ${data.isRoot ? 'text-foreground text-xl' : 'text-muted text-xs group-hover:text-foreground'}
        `}>
          {data.label}
        </span>
      </div>
    </div>

    <Handle type="source" position={Position.Bottom} className="opacity-0" />
  </div>
);

const nodeTypes = {
  symbol: SymbolNode,
};

const initialNodes: Node[] = [
  { id: 'wasser', type: 'symbol', data: { label: 'Wasser', isRoot: true }, position: { x: 250, y: 150 } },
  { id: 'noah', type: 'symbol', data: { label: 'Noah' }, position: { x: 450, y: 50 } },
  { id: 'jordan', type: 'symbol', data: { label: 'Jordan' }, position: { x: 50, y: 250 } },
  { id: 'taufe', type: 'symbol', data: { label: 'Taufe' }, position: { x: 100, y: 400 } },
  { id: 'traenen', type: 'symbol', data: { label: 'Tränen' }, position: { x: 400, y: 320 } },
  { id: 'geburt', type: 'symbol', data: { label: 'Geburt' }, position: { x: 300, y: -50 } },
];

const initialEdges: Edge[] = [
  { id: 'e1', source: 'wasser', target: 'noah', animated: true, style: { stroke: '#bda06d', strokeWidth: 0.5, opacity: 0.1 } },
  { id: 'e2', source: 'wasser', target: 'jordan', animated: true, style: { stroke: '#bda06d', strokeWidth: 0.5, opacity: 0.1 } },
  { id: 'e3', source: 'jordan', target: 'taufe', style: { stroke: '#bda06d', strokeWidth: 0.3, opacity: 0.1 } },
  { id: 'e4', source: 'wasser', target: 'traenen', style: { stroke: '#bda06d', strokeWidth: 0.3, opacity: 0.1 } },
  { id: 'e5', source: 'wasser', target: 'geburt', style: { stroke: '#bda06d', strokeWidth: 0.3, opacity: 0.1 } },
];

export default function SymbolNetwork() {
  return (
    <div className="w-full h-[500px] md:h-[600px] relative overflow-hidden">
      <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_100px_rgba(252,250,247,1)]" />
      
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        proOptions={{ hideAttribution: true }}
        nodesDraggable={true}
        nodesConnectable={false}
        zoomOnScroll={false}
        panOnScroll={true}
        panOnDrag={true}
        preventScrolling={false}
        className="bg-transparent"
      >
        <Background
  variant={BackgroundVariant.Dots}
  color="#e2e8f0"
  gap={60}
  size={1}
  className="opacity-50"
/>
      </ReactFlow>
      
      <div className="absolute bottom-4 right-4 z-20 text-[10px] uppercase tracking-[0.3em] text-slate-300 pointer-events-none font-sans">
        Interaktives Beziehungsgeflecht
      </div>
    </div>
  );
}