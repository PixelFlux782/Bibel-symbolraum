'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { name: 'Start', path: '/' },
  { name: 'Symbole', path: '/symbole' },
  { name: 'Reise', path: '/reise' },
  { name: 'Impuls', path: '/impuls' },
  { name: 'Mein Pfad', path: '/mein-pfad' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-5xl">
      <nav className="glass backdrop-blur-md px-5 py-3 rounded-2xl flex items-center justify-between shadow-md">
        <Link href="/" className="pointer-events-auto">
          <div className="text-xs font-sans uppercase tracking-[0.5em] text-foreground-strong group-hover:text-gold transition-colors duration-400">
            Bibel-Symbolraum
          </div>
        </Link>

        <ul className="hidden md:flex gap-8 items-center">
          {NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <Link href={item.path} className="relative pointer-events-auto">
                <span className={`text-[11px] font-sans uppercase tracking-[0.28em] transition-colors duration-300 ${
                  pathname === item.path ? 'text-gold' : 'text-muted-soft hover:text-foreground'
                }`}>
                  {item.name}
                </span>
                {pathname === item.path && (
                  <div className="absolute -bottom-2 left-0 right-0 h-px bg-gold/40" />
                )}
              </Link>
            </li>
          ))}
        </ul>

        <div className="md:hidden text-sm font-sans text-muted-soft">Bibel‑Symbolraum</div>
      </nav>
    </header>
  );
}