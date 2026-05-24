'use client';

import { useEffect, useState } from 'react';

const DAILY_IMPULSES = [
  {
    title: 'Montag – Innere Klarheit',
    text: 'Beginne die Woche mit einem ruhigen Atemzug. Was möchte heute endlich gesehen werden?',
  },
  {
    title: 'Dienstag – Vertrauen',
    text: 'Vertraue dem Weg, auch wenn er dich in unerwartete Räume führt. Das Ziel ist nicht sofort sichtbar.',
  },
  {
    title: 'Mittwoch – Achtsamkeit',
    text: 'Achte heute auf die leisen Bewegungen in deinem Inneren. Dort entfaltet sich die wahre Resonanz.',
  },
  {
    title: 'Donnerstag – Geschenke',
    text: 'Welche einfachen Zeichen am Wegende lassen dich erkennen, dass du getragen bist?',
  },
  {
    title: 'Freitag – Begegnung',
    text: 'Suche heute nach einem Moment der Stille, der dich mit etwas Größerem verbindet.',
  },
  {
    title: 'Samstag – Reflexion',
    text: 'Halte inne und frage dich: Was bleibt, wenn die äußere Bewegung verstummt?',
  },
  {
    title: 'Sonntag – Neuanfang',
    text: 'Erkenne den Tag als Einladung, deine Geschichte neu zu schreiben, ohne etwas zu erzwingen.',
  },
];

const WEEKDAY_LABELS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

export default function ImpulsPage() {
  const [today, setToday] = useState<number | null>(null);

  useEffect(() => {
    setToday(new Date().getDay());
  }, []);

  if (today === null) {
    return (
      <main className="min-h-screen py-24 px-6">
        <div className="max-w-4xl mx-auto text-center text-muted-soft">Lade deinen Tagesimpuls…</div>
      </main>
    );
  }

  const impulse = DAILY_IMPULSES[today];

  return (
    <main className="min-h-screen py-24 px-6 relative">
      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        <header className="space-y-4 text-center">
          <p className="text-[10px] uppercase tracking-[0.5em] text-muted-soft">Täglicher Impuls</p>
          <h1 className="text-5xl md:text-6xl font-serif italic text-foreground-strong tracking-tight">
            {WEEKDAY_LABELS[today]} im Bibel-Symbolraum
          </h1>
        </header>

        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-10 backdrop-blur-md text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-gold/50">Heute</p>
          <h2 className="mt-4 text-4xl font-serif italic text-foreground-strong">{impulse.title}</h2>
          <p className="mt-6 text-xl leading-relaxed text-muted-soft">{impulse.text}</p>
        </section>
      </div>
    </main>
  );
}
