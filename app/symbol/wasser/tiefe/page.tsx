import CinematicRoom from "@/components/CinematicRoom";

export default function WasserTiefePage() {
  return (
    <CinematicRoom
      eyebrow="Wasser / Tiefe"
      title="Innerer Raum"
      copy="Unter der Oberflaeche wird Wasser zum Bild fuer Erinnerung, Angst, Reinigung und die leise Bereitschaft, neu zu werden."
      links={[
        { href: "/symbol/wasser", label: "Zurueck zum Wasser-Raum", meta: "Symbol" },
        { href: "/symbol/wasser/hebraeisch", label: "Weiter zur Sprache", meta: "Hebraeisch" },
      ]}
    />
  );
}
