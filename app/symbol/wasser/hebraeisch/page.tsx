import CinematicRoom from "@/components/CinematicRoom";

export default function WasserHebraeischPage() {
  return (
    <CinematicRoom
      eyebrow="Wasser / Hebraeisch"
      title="Mayim"
      copy="Die hebraeische Spur betrachtet Wasser als lebendigen Zwischenraum: Klang, Zeichen, Ursprung und Bewegung zwischen Himmel und Erde."
      links={[
        { href: "/symbol/wasser/tiefe", label: "Zur Tiefe", meta: "Innen" },
        { href: "/symbol/wasser/szene", label: "Zur Szene", meta: "Bibel" },
        { href: "/archiv", label: "Archivraum", meta: "Hebraeisch" },
      ]}
    >
      <div className="inline-flex border border-white/10 bg-black/25 px-7 py-5 text-right backdrop-blur-md">
        <span className="font-serif text-5xl leading-none text-foreground-strong">מים</span>
      </div>
    </CinematicRoom>
  );
}
