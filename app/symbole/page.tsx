import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import AmbientBackground from '../../components/AmbientBackground';

export const metadata: Metadata = {
  title: 'Das Archiv der Zeichen | Bibel-Symbolraum',
  description: 'Entdecke die tiefen Schichten biblischer Symbole in einer kontemplativen Umgebung.',
};

interface Symbol {
  slug: string;
  name: string;
  hebrew: string;
  shortDeutung: string;
  resonanz: string;
}

const SYMBOLS: Symbol[] = [
  {
    slug: 'wasser',
    name: 'Wasser',
    hebrew: 'מים',
    shortDeutung: 'Der Urstrom des Lebens und die Hingabe an das Fließen.',
    resonanz: 'Was in dir ist erstarrt und wartet auf Tauwetter?'
  },
  {
    slug: 'wueste',
    name: 'Wüste',
    hebrew: 'מדבר',
    shortDeutung: 'Der Ort der Läuterung und das Hören in der Stille.',
    resonanz: 'Welche Stimme hörst du erst, wenn alles andere schweigt?'
  },
  {
    slug: 'brot',
    name: 'Brot',
    hebrew: 'לחם',
    shortDeutung: 'Das Wesentliche, das uns nährt und verbindet.',
    resonanz: 'Wonach hungert deine Seele wirklich?'
  },
  {
    slug: 'licht',
    name: 'Licht',
    hebrew: 'אור',
    shortDeutung: 'Die erste Regung der Schöpfung und die Klarheit des Geistes.',
    resonanz: 'Welcher Schatten in dir hütet ein verborgenes Leuchten?'
  },
  {
    slug: 'weg',
    name: 'Weg',
    hebrew: 'דרך',
    shortDeutung: 'Die Bewegung zwischen Aufbruch und Ziel.',
    resonanz: 'Bist du unterwegs oder wartest du noch?'
  },
  {
    slug: 'name',
    name: 'Name',
    hebrew: 'שם',
    shortDeutung: 'Die Essenz und die Berufung eines Wesens.',
    resonanz: 'Wer bist du, wenn niemand hinsieht?'
  },
  {
    slug: 'berg',
    name: 'Berg',
    hebrew: 'הר',
    shortDeutung: 'Die vertikale Ausrichtung und die Begegnung mit dem Heiligen.',
    resonanz: 'Welche Aussicht eröffnet sich dir in der Höhe?'
  },
  {
    slug: 'aegypten',
    name: 'Ägypten',
    hebrew: 'מצרים',
    shortDeutung: 'Der Ort der Enge und die Notwendigkeit des Auszugs.',
    resonanz: 'Welche Enge in dir verlangt nach Befreiung?'
  }
];

export default function SymbolOverview() {
  return (
    <main className="min-h-screen py-24 px-6 relative">
      {/* Atmosphärischer Hintergrund */}
      <AmbientBackground />

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="text-center mb-32 space-y-6 animate-[fade-in-up_1s_ease-out]">
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

function SymbolCard({ symbol }: { symbol: Symbol }) {
  return (
    <Link 
      href={`/symbole/${symbol.slug}`} 
      className="group block relative focus:outline-none focus:ring-2 focus:ring-gold/30 rounded-2xl transition-all" 
      aria-label={`Symbol ${symbol.name} explorieren`}
    >
      {/* Warmer Lichteffekt im Hintergrund beim Hover */}
      <div className="absolute -inset-2 bg-gold/10 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      {/* Die Artefakt-Karte */}
      <article className="relative h-full aspect-[4/5] p-10 flex flex-col justify-between 
                      bg-white/[0.03] backdrop-blur-md border border-white/10 
                      rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] 
                      group-hover:translate-y-[-4px] group-hover:border-gold/20
                      transition-all duration-500 ease-out">
        
        {/* Oben: Hebräische Lettern & Dekoration */}
        <div className="flex justify-between items-start">
          <span className="text-3xl font-serif text-muted group-hover:text-gold/40 transition-colors duration-500 uppercase tracking-widest leading-none">
            {symbol.hebrew}
          </span>
          <span className="text-gold/20 group-hover:text-gold/60 transition-colors duration-500 text-lg">✨</span>
        </div>

        {/* Mitte: Name & Kurze Deutung */}
        <div className="space-y-4">
          <h2 className="text-3xl font-serif text-foreground group-hover:italic transition-all duration-500 leading-tight">
            {symbol.name}
          </h2>
          <p className="text-muted font-serif leading-relaxed text-lg italic">
            {symbol.shortDeutung}
          </p>
        </div>

        {/* Unten: Resonanz-Zeile */}
        <div className="pt-6 border-t border-white/5">
          <p className="text-sm text-muted/50 font-serif italic leading-snug">
            {symbol.resonanz}
          </p>
        </div>

        {/* Subtile Lichtkante innen */}
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5 pointer-events-none" />
      </article>
    </Link>
  );
}