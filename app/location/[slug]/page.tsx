'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getTours } from '@/lib/supabase';
import { TourPackage } from '@/types';
import TourPackageCard from '@/components/TourPackageCard';
import InquiryModal from '@/components/InquiryModal';
import SectionTitle from '@/components/SectionTitle';
import { ChevronRight } from 'lucide-react';

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

  const bannerImage =
    tours[0]?.imageUrl ||
    'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1600&q=80';

  // Display-only title case for headings (e.g. "SHIMLA MANALI" -> "Shimla Manali").
  const displayTitle = locationTitle.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="relative min-h-screen bg-white text-brand-ink text-sm">
      {/* Page Banner */}
      <div className="relative w-full h-[220px] sm:h-[300px] overflow-hidden flex items-end">
        <img
          src={bannerImage}
          alt={`${locationTitle} tour packages`}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 container-bb pb-8">
          <nav className="flex flex-wrap items-center gap-1.5 text-[13px] text-white/85 mb-2">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">{displayTitle}</span>
          </nav>
          <h1 className="text-[26px] sm:text-[32px] md:text-[36px] font-medium text-white leading-tight">
            {displayTitle} Tour Packages
          </h1>
        </div>
      </div>

      <section className="bg-brand-cream py-10 md:py-12">
        <div className="container-bb">
          <SectionTitle
            light={tours.length > 0 ? `${tours.length} Packages` : 'Curated'}
            bold={tours.length > 0 ? 'Available' : 'Packages'}
            subtitle={`Browse our masterfully crafted holiday packages for ${locationTitle.toLowerCase()} featuring verified boutique stays, private chauffeur transfers, and 24/7 dedicated travel concierge.`}
          />

          {/* Loading Spinner */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[30px]">
              {tours?.map((t) => (
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
      </section>

      <InquiryModal
        tour={selectedTour}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
