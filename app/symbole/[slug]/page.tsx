import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllSymbols, getSymbolBySlug } from '@/lib/symbols';
import SymbolDetailClient from './SymbolDetailClient';

export const metadata: Metadata = {
  title: 'Symbol | Bibel-Symbolraum',
  description: 'Entdecke die Bedeutung deines gewählten Symbols im Bibel-Symbolraum.',
};

export function generateStaticParams() {
  return getAllSymbols().map((symbol) => ({ slug: symbol.slug }));
}

export default function SymbolPage({ params }: { params: { slug: string } }) {
  const symbol = getSymbolBySlug(params.slug);

  if (!symbol) {
    notFound();
  }

  return (
    <main className="min-h-screen py-24 px-6 relative">
      <div className="max-w-5xl mx-auto relative z-10 space-y-10">
        <div className="space-y-4 text-center">
          <p className="text-[10px] uppercase tracking-[0.5em] text-muted-soft">Zeichen</p>
          <h1 className="text-5xl md:text-6xl font-serif italic text-foreground-strong tracking-tight">
            {symbol.name}
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-soft font-serif italic">
            {symbol.shortMeaning}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10">
          <div className="space-y-8">
            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-md shadow-[0_24px_80px_-40px_rgba(255,255,255,0.35)]">
              <div className="flex flex-wrap items-center gap-4 text-sm uppercase tracking-[0.28em] text-muted-soft">
                <span>{symbol.hebrew}</span>
                <span className="text-gold/40">•</span>
                <span>{symbol.outerLevel}</span>
              </div>

              <div className="mt-8 space-y-6">
                <SectionLabel label="Symbolische Ebene" />
                <p className="text-lg leading-relaxed text-foreground-strong">{symbol.symbolicLevel}</p>

                <SectionLabel label="Hebräischer Hintergrund" />
                <p className="text-lg leading-relaxed text-muted-soft">{symbol.hebrewTrace}</p>

                <SectionLabel label="Zahlenbedeutung" />
                <p className="text-lg leading-relaxed text-muted-soft">{symbol.numberMeaning}</p>

                <SectionLabel label="Bibelreferenzen" />
                <ul className="space-y-2 text-muted-soft text-lg leading-relaxed list-disc list-inside">
                  {symbol.bibleReferences.map((reference) => (
                    <li key={reference}>{reference}</li>
                  ))}
                </ul>
              </div>
            </section>

            <SymbolDetailClient symbol={symbol} />
          </div>

          <aside className="space-y-8">
            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-md">
              <h2 className="text-sm uppercase tracking-[0.35em] text-muted-soft">Meditation</h2>
              <p className="mt-5 text-lg leading-relaxed text-muted-soft">{symbol.meditation}</p>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-md">
              <h2 className="text-sm uppercase tracking-[0.35em] text-muted-soft">Verbunden</h2>
              <div className="mt-5 space-y-3">
                {symbol.connectedSymbols.map((slug) => (
                  <ConnectedSymbolLink key={slug} slug={slug} />
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function SectionLabel({ label }: { label: string }) {
  return <p className="text-sm uppercase tracking-[0.35em] text-gold/50">{label}</p>;
}

function ConnectedSymbolLink({ slug }: { slug: string }) {
  const symbol = getAllSymbols().find((item) => item.slug === slug);

  if (!symbol) {
    return null;
  }

  return (
    <Link
      href={`/symbole/${symbol.slug}`}
      className="block rounded-2xl border border-white/10 bg-black/10 px-5 py-4 text-lg text-foreground-strong transition hover:border-gold/30 hover:bg-white/10"
    >
      <span className="font-serif italic">{symbol.name}</span>
      <span className="block text-sm text-muted-soft">{symbol.hebrew}</span>
    </Link>
  );
}
