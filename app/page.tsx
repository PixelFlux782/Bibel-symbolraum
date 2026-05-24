'use client';

import React from 'react';
import { motion } from 'framer-motion';
import SymbolNetwork from '@/components/SymbolNetwork';
import { Waves, Sparkles, Anchor, BookOpen } from 'lucide-react';

export default function WasserPage() {
  return (
    <div className="min-h-screen pt-48 pb-64">
      <article className="max-w-5xl mx-auto px-6 space-y-64">
        
        {/* Hero */}
        <header className="text-center space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Waves className="w-6 h-6 text-gold/30 mx-auto mb-12 opacity-50" />
            <h1 className="text-7xl md:text-[10rem] font-serif italic tracking-tighter mb-6 leading-none">Wasser</h1>
            <div className="text-3xl font-serif text-gold/15 tracking-[0.6em] ml-[0.6em]">מים</div>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 2 }}
            className="text-xl md:text-2xl font-serif italic text-muted/70 max-w-2xl mx-auto leading-relaxed"
          >
            Der Urgrund, aus dem alles Leben steigt. Das Element der Wandlung und der bedingungslosen Hingabe an den Fluss des Seins.
          </motion.p>
        </header>

        {/* The Constellation */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 2 }}
          className="relative px-4"
        >
          <div className="absolute inset-0 bg-gold/5 blur-[140px] rounded-full opacity-30" />
          <div className="relative glass rounded-[4rem] overflow-hidden border-white/5 shadow-2xl">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <span className="text-[10px] font-sans uppercase tracking-[0.4em] text-muted">Das Beziehungsgeflecht</span>
              <Anchor className="w-3 h-3 text-muted/20" />
            </div>
            <SymbolNetwork />
          </div>
        </motion.section>

        {/* Layers of Meaning */}
        <div className="grid md:grid-cols-2 gap-32 md:gap-48 items-start">
          <motion.section 
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5 }}
            className="space-y-10"
          >
             <div className="flex items-center gap-4 text-gold/60">
               <Sparkles size={14} className="opacity-40" />
               <h2 className="text-[10px] font-sans uppercase tracking-[0.4em] text-gold/50">Hebräische Spur</h2>
             </div>
             <p className="text-2xl font-serif leading-relaxed italic text-foreground/90 tracking-tight">
               Majim beginnt und endet mit dem Buchstaben Mem. Es umschließt das Geheimnis des Lebens wie ein schützender Schoß. In der Gematria verbindet es uns mit der Kraft der schöpferischen Quelle.
             </p>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.2 }}
            className="space-y-10 md:mt-24"
          >
             <div className="flex items-center gap-4 text-gold/60">
               <BookOpen size={14} className="opacity-40" />
               <h2 className="text-[10px] font-sans uppercase tracking-[0.4em] text-gold/50">Bibelstellen</h2>
             </div>
             <div className="space-y-12 italic font-serif text-muted/60">
               <p className="text-xl leading-relaxed">"...und der Geist Gottes schwebte über den Wassern." <br/><span className="text-[10px] font-sans uppercase tracking-[0.3em] block mt-4 opacity-50">— Gen 1,2</span></p>
               <p className="text-xl leading-relaxed">"Er führet mich zu stillen Wassern." <br/><span className="text-[10px] font-sans uppercase tracking-[0.3em] block mt-4 opacity-50">— Ps 23,2</span></p>
             </div>
          </motion.section>
        </div>

        {/* Reflection */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2 }}
          className="max-w-2xl mx-auto py-32 border-t border-white/5 text-center space-y-16"
        >
          <h3 className="text-4xl md:text-5xl font-serif italic text-foreground/80">Was will in dir wieder fließen?</h3>
          <div className="relative group">
            <textarea 
              placeholder="Überlass deine Gedanken dem Strom..."
              className="w-full bg-transparent border-none focus:ring-0 text-2xl font-serif italic text-foreground placeholder:text-muted/20 min-h-[200px] text-center resize-none transition-all duration-700"
            />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 group-focus-within:w-48 h-px bg-gold/20 transition-all duration-1000" />
          </div>
          <button className="text-[10px] font-sans uppercase tracking-[0.5em] text-gold/40 hover:text-gold transition-colors duration-700">
            In meinem Pfad bewahren
          </button>
        </motion.section>

      </article>
    </div>
  );
}