import CinematicRoom from "@/components/CinematicRoom";

export default function WasserPage() {
  return (
    <CinematicRoom
      eyebrow="Symbol / Wasser"
      title="Wasser-Raum"
      copy="Wasser erscheint als Urelement, Grenze und Verwandlung. Dieser Raum sammelt die Schichten, ohne sie zu vermischen."
      links={[
        { href: "/symbol/wasser/tiefe", label: "Innerer Raum", meta: "Tiefe" },
        { href: "/symbol/wasser/hebraeisch", label: "Hebräische Analyse", meta: "Sprache" },
        { href: "/symbol/wasser/szene", label: "Biblische Szene", meta: "Erzählung" },
      ]}
    />
  );
}
