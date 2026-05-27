'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { name: 'Start', path: '/' },
  { name: 'Symbolnetz', path: '/symbolnetz' },
  { name: 'Wasser', path: '/raeume/wasser' },
  { name: 'Mein Pfad', path: '/mein-pfad' },
  { name: 'Archiv', path: '/archiv' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed left-1/2 top-3 z-50 w-[calc(100%-1.5rem)] max-w-6xl -translate-x-1/2 sm:top-4 sm:w-[94%]">
      <nav className="symbol-panel flex flex-col gap-3 px-4 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.24)] sm:px-5 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="pointer-events-auto shrink-0">
          <div className="text-[11px] font-sans uppercase tracking-[0.42em] text-foreground-strong transition-colors duration-1000 hover:text-gold sm:text-xs sm:tracking-[0.5em]">
            SYMBOLRAUM
          </div>
        </Link>

        <ul className="flex items-center gap-5 overflow-x-auto pb-1 md:gap-8 md:overflow-visible md:pb-0">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.path || (item.path !== '/' && pathname?.startsWith(item.path));

            return (
              <li key={item.path}>
                <Link href={item.path} className="relative pointer-events-auto">
                  <span
                    className={`whitespace-nowrap text-[10px] font-sans uppercase tracking-[0.24em] transition-colors duration-1000 md:text-[11px] md:tracking-[0.28em] ${
                      active ? 'text-gold' : 'text-muted-soft hover:text-foreground'
                    }`}
                  >
                    {item.name}
                  </span>
                  {active && <div className="absolute -bottom-2 left-0 right-0 h-px bg-gold/40" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
