import CinematicRoom from "@/components/CinematicRoom";

export default function StartPage() {
  return (
    <CinematicRoom
      eyebrow="Startscreen"
      title="SYMBOLRAUM"
      copy="Ein dunkler, stiller Bildraum fuer biblische Zeichen. Jede Szene oeffnet nur eine Bedeutungsschicht, damit das Symbol atmen kann."
      align="center"
      links={[
        { href: "/symbolnetz", label: "Symboluebersicht", meta: "Netz" },
        { href: "/symbol/wasser", label: "Wasser-Raum", meta: "Symbol" },
        { href: "/archiv", label: "Hebraeisches Archiv", meta: "Archiv" },
      ]}
    />
  );
}
