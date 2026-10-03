
import React from 'react';
import Link from 'next/link';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 bg-midnight text-white">
      <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl text-center border border-white/[0.1] shadow-2xl">
        <div className="w-16 h-16 rounded-3xl bg-primaryCyan/10 border border-primaryCyan/30 text-primaryCyan flex items-center justify-center mx-auto mb-6">
          <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '10s' }} />
        </div>

        <span className="gold-gradient-text uppercase font-bold tracking-widest text-xs mb-2 block">
          404 • Destination Unknown
        </span>

        <h2 className="editorial-heading text-3xl font-bold text-white mb-3">
          Off the Beaten Path
        </h2>

        <p className="text-slate-400 text-xs mb-8 font-light leading-relaxed">
          The page or itinerary you are seeking has drifted beyond our navigational charts.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-primaryCyan to-blue-600 hover:from-blue-500 hover:to-primaryCyan text-white font-bold text-xs uppercase tracking-wider shadow-glow hover:shadow-cyanGlow transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Exploration</span>
        </Link>
      </div>
    </div>
  );
}
