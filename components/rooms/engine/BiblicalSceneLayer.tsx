import type { BiblicalScene } from "@/types/engine";

export function BiblicalSceneLayer({ scenes }: { scenes: BiblicalScene[] }) {
  return (
    <section className="symbol-engine__layer symbol-engine__biblical-layer" aria-label="Biblische Szene">
      <p className="symbol-engine__layer-kicker">Biblische Szene</p>
      {scenes.map((scene) => (
        <article key={scene.id}>
          <p className="symbol-engine__scene-reference">{scene.reference}</p>
          <h3>{scene.title}</h3>
          <p>{scene.meaning}</p>
        </article>
      ))}
    </section>
  );
}
