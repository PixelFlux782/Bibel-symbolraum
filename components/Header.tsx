'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { name: 'Start', path: '/' },
  { name: 'Symbolnetz', path: '/symbolnetz' },
  { name: 'Wasser', path: '/raeume/wasser' },
  { name: 'Archiv', path: '/archiv' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed left-1/2 top-4 z-50 w-[95%] max-w-5xl -translate-x-1/2">
      <nav className="flex items-center justify-between border border-white/10 bg-black/30 px-5 py-3 shadow-md backdrop-blur-md">
        <Link href="/" className="pointer-events-auto">
          <div className="text-xs font-sans uppercase tracking-[0.5em] text-foreground-strong transition-colors duration-300 hover:text-gold">
            SYMBOLRAUM
          </div>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.path || (item.path !== '/' && pathname?.startsWith(item.path));

            return (
              <li key={item.path}>
                <Link href={item.path} className="relative pointer-events-auto">
                  <span
                    className={`text-[11px] font-sans uppercase tracking-[0.28em] transition-colors duration-300 ${
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

        <div className="md:hidden text-sm font-sans text-muted-soft">Raum</div>
      </nav>
    </header>
  );
}
