import CinematicRoom from "@/components/CinematicRoom";

export default function WasserSzenePage() {
  return (
    <CinematicRoom
      eyebrow="Wasser / Szene"
      title="Biblische Szene"
      copy="Hier wird das Symbol erzählerisch: Wasser steht am Rand von Aufbruch, Rettung, Taufe, Durst und neuer Orientierung."
      links={[
        { href: "/symbol/wasser", label: "Wasser-Raum", meta: "Symbol" },
        { href: "/symbolnetz", label: "Symbolnetz", meta: "Übersicht" },
      ]}
    />
  );
}
