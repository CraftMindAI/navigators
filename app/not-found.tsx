import React from 'react';
import Link from 'next/link';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-brand-cream text-brand-ink">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-sm text-center border border-[#ddd] shadow-[0_1px_4px_rgba(0,0,0,0.12)]">
        <Compass className="w-14 h-14 text-brand-orange mx-auto mb-5" strokeWidth={1.3} />

        <p className="text-[13px] font-medium text-brand-muted mb-2">404 • Destination Unknown</p>

        <h2 className="text-[26px] md:text-[32px] leading-tight mb-3">
          <span className="font-light text-brand-gray">Off the</span> <span className="font-bold text-brand-orange">Beaten Path</span>
        </h2>

        <p className="text-sm text-brand-ink mb-7 leading-relaxed">
          The page or itinerary you are seeking has drifted beyond our navigational charts.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-sm bg-brand-blue hover:bg-brand-blueDark text-white text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Exploration</span>
        </Link>
      </div>
    </div>
  );
}
