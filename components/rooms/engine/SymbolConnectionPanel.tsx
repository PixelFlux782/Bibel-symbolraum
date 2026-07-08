import type { SymbolConnection } from "@/types/engine";

export function SymbolConnectionPanel({ connections }: { connections: SymbolConnection[] }) {
  return (
    <section className="symbol-engine__layer symbol-engine__connections" aria-label="Symbolverbindungen">
      <p className="symbol-engine__layer-kicker">Symbolnetz</p>
      <ul>
        {connections.map((connection) => (
          <li key={connection.id}>
            <span>{connection.label}</span>
            <p>{connection.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
