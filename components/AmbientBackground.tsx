'use client';

import { memo, useMemo } from 'react';
import { usePathname } from 'next/navigation';

type BackgroundConfig = {
  image: string;
  position?: string;
  opacity?: number;
};

function getBackgroundConfig(pathname: string): BackgroundConfig {
  const rooms: Record<string, BackgroundConfig> = {
    '/': { image: '/Visuals/Logo_hero.png', position: 'center', opacity: 0.82 },
    '/symbolnetz': { image: '/Visuals/symbolnetz_backround.png', position: 'center', opacity: 0.84 },
    '/symbol/wasser': { image: '/Visuals/wasser_cinema_hero.png', position: 'center', opacity: 0.86 },
    '/symbol/wasser/tiefe': { image: '/Visuals/wasser_tiefenbild.png', position: 'center', opacity: 0.86 },
    '/symbol/wasser/hebraeisch': { image: '/Visuals/wasser_hebr_symbl.png', position: 'center', opacity: 0.84 },
    '/symbol/wasser/szene': { image: '/Visuals/wasser_szenenbild.png', position: 'center', opacity: 0.84 },
    '/archiv': { image: '/Visuals/hebr_archiv_waende_background.png', position: 'center', opacity: 0.82 },
    '/symbole': { image: '/Visuals/symbolnetz_backround.png', position: 'center', opacity: 0.84 },
    '/symbole/wasser': { image: '/Visuals/wasser_cinema_hero.png', position: 'center', opacity: 0.86 },
  };

  return rooms[pathname] ?? { image: '/Visuals/tiefenraum_backround.png', position: 'center', opacity: 0.82 };
}

const AmbientBackground = memo(() => {
  const pathname = usePathname() ?? '/';
  const config = useMemo(() => getBackgroundConfig(pathname), [pathname]);

  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden bg-[#03050a] text-transparent">
      <div
        className="absolute inset-0 animate-drift-slow bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url(${config.image})`,
          backgroundPosition: config.position,
          opacity: config.opacity,
        }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,4,10,0.84),rgba(2,4,10,0.24)_45%,rgba(2,4,10,0.86))]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,5,10,0.88),transparent_32%,rgba(3,5,10,0.92))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_20%,rgba(218,198,154,0.13),transparent_25%),radial-gradient(circle_at_75%_72%,rgba(77,142,174,0.12),transparent_24%)] mix-blend-screen" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:88px_88px] opacity-20" />
    </div>
  );
});

AmbientBackground.displayName = 'AmbientBackground';

export default AmbientBackground;
