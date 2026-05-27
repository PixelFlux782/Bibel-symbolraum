'use client';

import Image from 'next/image';
import { memo, useMemo } from 'react';
import { usePathname } from 'next/navigation';

type BackgroundConfig = {
  image: string;
  position?: string;
  opacity?: number;
};

function getBackgroundConfig(pathname: string): BackgroundConfig {
  const rooms: Record<string, BackgroundConfig> = {
    '/': { image: '/Visuals/Logo_hero.png', position: 'center', opacity: 0.74 },
    '/symbolnetz': { image: '/Visuals/symbolnetz_backround.png', position: 'center', opacity: 0.78 },
    '/mein-pfad': { image: '/Visuals/hebr_archiv_waende_background.png', position: 'center', opacity: 0.76 },
    '/wasser': { image: '/Visuals/wasser_cinema_hero.png', position: 'center', opacity: 0.82 },
    '/raeume/wasser': { image: '/Visuals/wasser_cinema_hero.png', position: 'center', opacity: 0.82 },
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
  const roomOpacity = config.opacity ?? 0.82;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#02050b] text-transparent">
      <div className="absolute inset-[-4%] sacred-drift">
        <Image
          src="/Visuals/tiefenraum_backround.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-80"
          quality={82}
        />
      </div>

      <div className="absolute inset-[-3%] light-pulse mix-blend-screen">
        <Image
          src="/Visuals/cinem_lichtraum_backround.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-[0.42]"
          quality={78}
        />
      </div>

      <div className="absolute inset-[-2%] sacred-drift mix-blend-screen">
        <Image
          src="/Visuals/symbolnetz_backround.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-[0.18]"
          quality={74}
        />
      </div>

      <div className="absolute inset-0 opacity-[0.45] mix-blend-screen">
        <Image
          src={config.image}
          alt=""
          fill
          sizes="100vw"
          className="sacred-drift object-cover"
          style={{
            objectPosition: config.position,
            opacity: roomOpacity * 0.28,
          }}
          quality={76}
        />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(211,180,116,0.095),transparent_28%),radial-gradient(circle_at_56%_74%,rgba(42,110,136,0.1),transparent_32%)] mix-blend-screen" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(1,3,8,0.92),rgba(1,5,12,0.22)_48%,rgba(1,3,8,0.92))]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,12,0.9),rgba(2,5,12,0.2)_34%,rgba(2,5,12,0.95))]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.58)_74%,rgba(0,0,0,0.92)_100%)]" />
      <div className="absolute inset-0 opacity-[0.075] mix-blend-overlay [background-image:radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.9)_0,transparent_1px),radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.7)_0,transparent_1px),radial-gradient(circle_at_45%_80%,rgba(255,255,255,0.55)_0,transparent_1px)] [background-size:3px_3px,5px_5px,7px_7px]" />
    </div>
  );
});

AmbientBackground.displayName = 'AmbientBackground';

export default AmbientBackground;
