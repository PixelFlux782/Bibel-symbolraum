'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import SoundController from './audio/SoundController';

const NAV_ITEMS = [
  { name: 'Start', path: '/' },
  { name: 'Symbolnetz', path: '/symbolnetz' },
  { name: 'Mein Pfad', path: '/mein-pfad' },
  { name: 'Archiv', path: '/archiv' },
];

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 36);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`symbol-archive-header fixed left-1/2 top-3 z-50 w-[calc(100%-1.25rem)] max-w-6xl -translate-x-1/2 transition-all duration-[1600ms] sm:top-5 sm:w-[94%] ${
        isScrolled ? 'symbol-archive-header--quiet' : ''
      }`}
    >
      <nav className="symbol-archive-nav items-center gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="symbol-archive-brand pointer-events-auto shrink-0">
            <span>
              SYMBOLRAUM
            </span>
          </Link>

          <ul className="symbol-archive-list">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.path || (item.path !== '/' && pathname?.startsWith(item.path));

              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    aria-current={active ? 'page' : undefined}
                    className={`symbol-archive-mark pointer-events-auto ${active ? 'is-active' : ''}`}
                  >
                    <span>
                      {item.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="shrink-0">
          <SoundController />
        </div>
      </nav>
    </header>
  );
}
