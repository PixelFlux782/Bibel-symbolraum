'use client';

import React, { memo } from 'react';

const AmbientBackground = memo(() => {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-[#fcfaf7] transform-gpu">
      {/* Primäre Lichtquelle */}
      <div
        className="absolute -top-[15%] -right-[10%] w-[80vw] h-[80vh] bg-amber-100/20 blur-[120px] rounded-full mix-blend-multiply animate-pulse-soft"
      />

      {/* Schwebende Nebelschicht */}
      <div
        className="absolute top-[20%] left-[-10%] w-[60vw] h-[60vw] bg-orange-50/10 blur-[120px] rounded-full opacity-40 animate-float-slow"
      />

      {/* Erdung */}
      <div
        className="absolute -bottom-[20%] left-[10%] w-[90vw] h-[50vh] bg-stone-100/40 blur-[130px] rounded-full opacity-20"
      />

      {/* Lichtschächte */}
      <div 
        className="absolute top-0 right-1/4 w-[2px] h-[150vh] bg-gradient-to-b from-amber-200/0 via-amber-200/10 to-transparent blur-[60px] -rotate-12 transform-gpu origin-top"
      />
      <div 
        className="absolute top-0 right-1/3 w-[1px] h-[150vh] bg-gradient-to-b from-amber-100/0 via-amber-100/10 to-transparent blur-[80px] -rotate-12 transform-gpu origin-top opacity-30"
      />
    </div>
  );
});

AmbientBackground.displayName = 'AmbientBackground';

export default AmbientBackground;