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
    <header className="fixed top-0 left-0 right-0 z-50 py-8 px-6 pointer-events-none">
      <nav className="max-w-5xl mx-auto flex justify-between items-center pointer-events-auto">
        <Link href="/" className="group">
          <div className="text-xs font-sans uppercase tracking-[0.6em] text-foreground/60 group-hover:text-gold transition-colors duration-500">
            Bibel-Symbolraum
          </div>
        </Link>

        <ul className="hidden md:flex gap-10 items-center">
          {NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <Link href={item.path} className="relative group">
                <span className={`text-[10px] font-sans uppercase tracking-[0.3em] transition-colors duration-500 ${
                  pathname === item.path ? 'text-gold' : 'text-foreground/40 group-hover:text-foreground'
                }`}>
                  {item.name}
                </span>
                {pathname === item.path && (
                  <div className="absolute -bottom-2 left-0 right-0 h-px bg-gold/40 transition-all duration-500" />
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}