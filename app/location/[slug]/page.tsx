'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getTours } from '@/lib/supabase';
import { TourPackage } from '@/types';
import TourPackageCard from '@/components/TourPackageCard';
import InquiryModal from '@/components/InquiryModal';
import SectionTitle from '@/components/SectionTitle';
import { ChevronRight } from 'lucide-react';
import FilterSidebar, { StarLabel, emptyFilters, passesGroup, passesPrice, type FilterValues } from '@/components/FilterSidebar';

const durationKey = (t: TourPackage) => `${t.durationNights}-${t.durationDays}`;
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export default function LocationPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [tours, setTours] = useState<TourPackage[]>([]);
  const [selectedTour, setSelectedTour] = useState<TourPackage | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterValues>(emptyFilters);

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

  // Filter options come from the packages listed for this destination
  const priceRange = useMemo(() => {
    const prices = tours.map((t) => t.price).filter((p) => p > 0);
    return prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : undefined;
  }, [tours]);

  const filterGroups = useMemo(() => {
    const durations = new Map<string, TourPackage>();
    tours.forEach((t) => durations.set(durationKey(t), t));
    const sortedDurations = [...durations.values()].sort((a, b) => a.durationNights - b.durationNights || a.durationDays - b.durationDays);
    const ratings = [...new Set(tours.map((t) => Math.round(t.rating || 0)).filter((r) => r >= 1 && r <= 5))].sort((a, b) => b - a);
    return [
      {
        id: 'duration',
        title: 'Duration',
        options: sortedDurations.map((t) => ({
          value: durationKey(t),
          label: `${plural(t.durationNights, 'Night')} To ${plural(t.durationDays, 'Day')}`,
        })),
      },
      { id: 'rating', title: 'Star Rating', options: ratings.map((r) => ({ value: String(r), label: <StarLabel count={r} /> })) },
    ];
  }, [tours]);

  const visibleTours = tours.filter(
    (t) =>
      passesPrice(filters, t.price) &&
      passesGroup(filters, 'duration', durationKey(t)) &&
      passesGroup(filters, 'rating', String(Math.round(t.rating || 0)))
  );

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
            light={visibleTours.length > 0 ? `${visibleTours.length} Packages` : 'Curated'}
            bold={visibleTours.length > 0 ? 'Available' : 'Packages'}
            subtitle={`Browse our masterfully crafted holiday packages for ${locationTitle.toLowerCase()} featuring verified boutique stays, private chauffeur transfers, and 24/7 dedicated travel concierge.`}
          />

          {/* Loading Spinner */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row lg:items-start gap-[30px]">
              <FilterSidebar
                price={priceRange}
                groups={filterGroups}
                value={filters}
                onChange={setFilters}
                resultCount={visibleTours.length}
              />

              <div className="flex-1 min-w-0">
                {visibleTours.length === 0 ? (
                  <div className="bg-white border border-[#ddd] p-10 text-center">
                    <p className="text-sm text-brand-ink mb-3">No packages match these filters.</p>
                    <button type="button" onClick={() => setFilters(emptyFilters())} className="text-sm text-brand-blue hover:underline">
                      Reset all filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-[30px]">
                    {visibleTours?.map((t) => (
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
