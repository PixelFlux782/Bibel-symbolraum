'use client';

import type { ResonanceConnection } from '@/lib/resonance/types';
import { getNodeById } from '@/lib/symbolism';
import type { SymbolGraph } from '@/lib/symbolism';

interface ResonanceGroupProps {
  nodeId: string;
  resonanceConnections: ResonanceConnection[];
  graph: SymbolGraph;
}

export function ResonanceGroup({ nodeId, resonanceConnections, graph }: ResonanceGroupProps) {
  // Filter connections that involve this node (both incoming and outgoing)
  const relevantConnections = resonanceConnections.filter(
    (conn) => conn.sourceId === nodeId || conn.targetId === nodeId
  );

  if (relevantConnections.length === 0) {
    return null;
  }

  // Get all connected node names
  const connectedNodeIds = new Set<string>();
  relevantConnections.forEach((conn) => {
    if (conn.sourceId === nodeId) {
      connectedNodeIds.add(conn.targetId);
    } else {
      connectedNodeIds.add(conn.sourceId);
    }
  });

  const connectedNodeNames = Array.from(connectedNodeIds)
    .map((id) => getNodeById(graph, id)?.label ?? id)
    .filter(Boolean);

  const centerNodeLabel = getNodeById(graph, nodeId)?.label ?? nodeId;

  // Build the summary statement
  const summaryStatement =
    connectedNodeNames.length > 0
      ? `${centerNodeLabel} resoniert mit ${connectedNodeNames.join(', ')}.`
      : null;

  return (
    <div className="mt-6 space-y-4 border-t border-gold/10 pt-6">
      {summaryStatement && (
        <p className="font-serif text-sm italic text-gold/80">
          {summaryStatement}
        </p>
      )}

      {relevantConnections.length > 0 && (
        <div className="space-y-3">
          {relevantConnections.map((connection) => {
            const sourceNode = getNodeById(graph, connection.sourceId);
            const targetNode = getNodeById(graph, connection.targetId);
            const sourceName = sourceNode?.label ?? connection.sourceId;
            const targetName = targetNode?.label ?? connection.targetId;

            return (
              <div
                key={connection.id}
                className="flex items-start gap-3 rounded-lg bg-gold/[0.03] p-3 transition-colors hover:bg-gold/[0.08]"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-[0.1em] text-muted-soft mb-1">
                    {sourceName} → {targetName}
                  </p>
                  <p className="text-sm text-foreground-strong leading-relaxed">
                    {connection.shortResonance || connection.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
