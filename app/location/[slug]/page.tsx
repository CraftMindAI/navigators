'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getTours } from '@/lib/supabase';
import { TourPackage } from '@/types';
import TourPackageCard from '@/components/TourPackageCard';
import InquiryModal from '@/components/InquiryModal';
import { MapPin, ArrowLeft, Sparkles, Compass } from 'lucide-react';

export default function LocationPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [tours, setTours] = useState<TourPackage[]>([]);
  const [selectedTour, setSelectedTour] = useState<TourPackage | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const all = await getTours();
      if (slug) {
        const filtered = all.filter(
          (t) => t.slug.includes(slug) || slug.includes(t.slug) || t.location.toLowerCase().includes(slug.split('-')[0])
        );
        setTours(filtered.length > 0 ? filtered : all);
      } else {
        setTours(all);
      }
      setLoading(false);
    }
    loadData();
  }, [slug]);

  const locationTitle = slug
    ? slug.replace(/-/g, ' ').replace('tour package', '').replace('packages', '').trim().toUpperCase()
    : 'ALL DESTINATIONS';

  return (
    <div className="py-14 sm:py-16 relative min-h-screen bg-midnight text-white overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primaryCyan/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-10 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-primaryCyan mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Destination Header */}
        <div className="mb-10 sm:mb-12 border-b border-white/[0.08] pb-6 sm:pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-semibold mb-3">
            <Compass className="w-3.5 h-3.5 text-primaryCyan" />
            <span className="gold-gradient-text uppercase font-bold tracking-widest text-[11px]">
              Destination Expeditions
            </span>
          </div>

          <h1 className="editorial-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            {locationTitle} TOUR PACKAGES
          </h1>

          <p className="text-slate-300 text-sm sm:text-base mt-2 font-light max-w-3xl">
            Browse our masterfully crafted holiday packages for {locationTitle.toLowerCase()} featuring verified boutique stays, private chauffeur transfers, and 24/7 dedicated travel concierge.
          </p>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-2 border-primaryCyan border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {tours.map((t) => (
              <TourPackageCard
                key={t.id}
                tour={t}
                onEnquire={(tour) => {
                  setSelectedTour(tour);
                  setModalOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <InquiryModal
        tour={selectedTour}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
