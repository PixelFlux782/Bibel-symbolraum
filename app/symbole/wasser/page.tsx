import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import AmbientBackground from '../../../components/AmbientBackground';

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
    slug: 'haus',
    name: 'Haus',
    hebrew: 'בית',
    shortDeutung: 'Die schützende Hülle und der Raum der Empfängnis.',
    resonanz: 'Wo findet deine Seele ihren eigentlichen Wohnort?'
  },
  {
    slug: 'licht',
    name: 'Licht',
    hebrew: 'אור',
    shortDeutung: 'Die erste Regung der Schöpfung und die Klarheit des Geistes.',
    resonanz: 'Welcher Schatten in dir hütet ein verborgenes Leuchten?'
  },
  {
    slug: 'feuer',
    name: 'Feuer',
    hebrew: 'אש',
    shortDeutung: 'Die Kraft der Wandlung und die Glut der Sehnsucht.',
    resonanz: 'Was brennt in dir, ohne dich zu verzehren?'
  }
];

export default function SymbolOverview() {
  return (
    <main className="min-h-screen py-24 px-6 relative">
      {/* Background Ambience */}
      <AmbientBackground />

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="text-center mb-32 space-y-6">
          <h1 className="text-5xl font-serif italic text-slate-900 tracking-tight">Das Archiv der Zeichen</h1>
          <p className="text-slate-500 font-serif italic max-w-xl mx-auto text-lg leading-relaxed">
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
    <Link href={`/symbole/${symbol.slug}`} className="group block relative focus:outline-none focus:ring-2 focus:ring-amber-200 rounded-2xl transition-all" aria-label={`Symbol ${symbol.name} explorieren`}>
      {/* Warm Glow Effect (Hover) */}
      <div className="absolute -inset-2 bg-amber-200/20 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      {/* The Artifact Card */}
      <article className="relative h-full aspect-[4/5] p-10 flex flex-col justify-between 
                      bg-white/40 backdrop-blur-md border border-white/60 
                      rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.03)] 
                      group-hover:translate-y-[-4px] group-hover:shadow-[0_20px_40px_0_rgba(0,0,0,0.05)]
                      transition-all duration-500 ease-out">
        
        {/* Top: Hebrew & Visual Decoration */}
        <div className="flex justify-between items-start">
          <span className="text-3xl font-serif text-slate-300 group-hover:text-amber-600/40 transition-colors duration-500 uppercase tracking-widest">
            {symbol.hebrew}
          </span>
          <span className="text-slate-200 group-hover:text-amber-300 transition-colors duration-500 text-sm">✨</span>
        </div>

        {/* Middle: Name & Meaning */}
        <div className="space-y-4">
          <h2 className="text-3xl font-serif text-slate-900 group-hover:italic transition-all duration-500">
            {symbol.name}
          </h2>
          <p className="text-slate-600 font-serif leading-relaxed text-lg">
            {symbol.shortDeutung}
          </p>
        </div>

        {/* Bottom: Resonance Line */}
        <div className="pt-6 border-t border-slate-100/50">
          <p className="text-sm text-slate-400 font-serif italic leading-snug">
            {symbol.resonanz}
          </p>
        </div>

        {/* Subtle Inner Lighting (Glass effect detail) */}
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/50 pointer-events-none" />
      </article>
    </Link>
  );
}