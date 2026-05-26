import CinematicRoom from "@/components/CinematicRoom";

export default function ArchivPage() {
  return (
    <CinematicRoom
      eyebrow="Archiv"
      title="Hebraeischer Archivraum"
      copy="Der Archivraum sammelt Zeichen, Waende und Spuren. Er ist kein Katalog, sondern ein gedimmter Ort fuer genaue Aufmerksamkeit."
      links={[
        { href: "/symbol/wasser/hebraeisch", label: "Mayim ansehen", meta: "מים" },
        { href: "/symbolnetz", label: "Zur Symboluebersicht", meta: "Netz" },
      ]}
    />
  );
}
