import CinematicRoom from "@/components/CinematicRoom";

export default function SymbolnetzPage() {
  return (
    <CinematicRoom
      eyebrow="Symbolnetz"
      title="Uebersicht der Zeichen"
      copy="Das Netz zeigt nicht alles auf einmal. Es laesst einzelne Linien sichtbar werden: Wasser als Ursprung, Schwelle, Reinigung und Bewegung."
      links={[
        { href: "/symbol/wasser", label: "Wasser betreten", meta: "Kernsymbol" },
        { href: "/symbol/wasser/tiefe", label: "In die Tiefe", meta: "Innerer Raum" },
        { href: "/symbol/wasser/hebraeisch", label: "Hebraeische Spur", meta: "Analyse" },
      ]}
    >
      <div className="grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
        {["Quelle", "Flut", "Taufe", "Traenen"].map((item) => (
          <div key={item} className="border border-white/10 bg-black/20 px-4 py-5 text-center backdrop-blur-md">
            <span className="font-serif text-lg italic text-foreground-strong">{item}</span>
          </div>
        ))}
      </div>
    </CinematicRoom>
  );
}
