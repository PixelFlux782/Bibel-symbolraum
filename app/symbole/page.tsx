import { Metadata } from 'next';
import Link from 'next/link';
import { getAllSymbols, type SymbolItem } from '@/lib/symbols';

export const metadata: Metadata = {
  title: 'Das Archiv der Zeichen | Bibel-Symbolraum',
  description: 'Entdecke die tiefen Schichten biblischer Symbole in einer kontemplativen Umgebung.',
};

const SYMBOLS = getAllSymbols();

export default function SymbolOverview() {
  return (
    <main className="min-h-screen py-24 px-6 relative">
      <div className="max-w-6xl mx-auto relative z-10">
        <header className="symbol-fade-in text-center mb-32 space-y-6">
          <h1 className="text-5xl font-serif italic text-foreground tracking-tight">Das Archiv der Zeichen</h1>
          <p className="text-muted font-serif italic max-w-xl mx-auto text-lg leading-relaxed">
            Jedes Symbol ist ein Fenster. Klicke auf ein Artefakt, um tiefer in den Raum der Bedeutung einzutreten.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {SYMBOLS.map((symbol) => (
            <SymbolCard key={symbol.slug} symbol={symbol} />
          ))}
        </div>
      </div>
    </main>
  );
}

function SymbolCard({ symbol }: { symbol: SymbolItem }) {
  return (
    <Link 
      href={`/symbole/${symbol.slug}`} 
      className="group block relative focus:outline-none focus:ring-2 focus:ring-gold/30 rounded-2xl" 
      aria-label={`Symbol ${symbol.name} explorieren`}
    >
      {/* Warmer Lichteffekt im Hintergrund beim Hover */}
      <div className="light-pulse absolute -inset-2 bg-gold/10 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-35 transition-opacity duration-1000 pointer-events-none" />
      
      {/* Die Artefakt-Karte */}
      <article className="relative h-full aspect-[4/5] p-10 flex flex-col justify-between 
                      bg-white/[0.03] backdrop-blur-md border border-white/10 
                      rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] 
                      group-hover:border-gold/20
                      transition-colors duration-1000">
        
        {/* Oben: Hebräische Lettern & Dekoration */}
        <div className="flex justify-between items-start">
          <span className="symbol-breathe text-3xl font-serif text-muted group-hover:text-gold/45 transition-colors duration-1000 uppercase tracking-widest leading-none">
            {symbol.hebrew}
          </span>
          <span className="text-gold/20 group-hover:text-gold/45 transition-colors duration-1000 text-lg">✨</span>
        </div>

        {/* Mitte: Name & Kurze Deutung */}
        <div className="space-y-4">
          <h2 className="text-3xl font-serif text-foreground transition-colors duration-1000 leading-tight">
            {symbol.name}
          </h2>
          <p className="text-muted font-serif leading-relaxed text-lg italic">
            {symbol.shortMeaning}
          </p>
        </div>

        {/* Unten: Resonanz-Zeile */}
        <div className="pt-6 border-t border-white/5">
          <p className="text-sm text-muted/50 font-serif italic leading-snug">
            {symbol.outerLevel}
          </p>
        </div>

        {/* Subtile Lichtkante innen */}
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5 pointer-events-none" />
      </article>
    </Link>
  );
}
