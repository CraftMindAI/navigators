'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  MapPin,
  Sparkles,
  Mountain,
  Palmtree,
  Castle,
  TreePine,
  Umbrella,
  Building2,
  ChevronLeft,
  ChevronRight,
  Compass,
  ArrowRight,
  Plane,
  PhoneCall
} from 'lucide-react';
import { TourPackage } from '@/types';
import { getTours } from '@/lib/supabase';

// Lazy loaded components for fast initial bundle
const HeroBanner = dynamic(() => import('@/components/HeroBanner'), { ssr: false });
const TourPackageCard = dynamic(() => import('@/components/TourPackageCard'), { ssr: false });
const PopularDestinations = dynamic(() => import('@/components/PopularDestinations'), { ssr: false });
const Testimonials = dynamic(() => import('@/components/Testimonials'), { ssr: false });
const InquiryModal = dynamic(() => import('@/components/InquiryModal'), { ssr: false });

// Destination display name mapping
const DESTINATION_NAMES: Record<string, string> = {
  'andamantourpackage': 'Andaman Islands',
  'darjeelingtourpackages': 'Darjeeling Tea Hills',
  'gangtoktourpackage': 'Gangtok & East Sikkim',
  'shimlamanalitourpackage': 'Shimla & Manali Valleys',
  'kashmirtourpackage': 'Kashmir Paradise',
  'kerala-tour-packages': 'Kerala Backwaters & Munnar',
  'bhutan-tour-packages': 'Bhutan Kingdom',
  'thailand-tour-package': 'Thailand Tropical Escapes',
  'bali-tour-packages': 'Bali Island Sanctuary',
  'maldives-tour-package': 'Maldives Atolls',
  'sikkim-tour-package': 'Sikkim Himalayan Heights',
  'leh-ladakh-package': 'Leh Ladakh Frontiers',
  'lakshadweep-tour-packages': 'Lakshadweep Lagoons',
  'uttarakhand-tour-package': 'Uttarakhand Spiritual Hills',
  'spiti-valley-tour-packages': 'Spiti Valley Rugged Trails',
  'himachal-tour-package': 'Himachal Pradesh Expeditions',
  'rajasthan-tour-packages': 'Rajasthan Royal Heritage',
};

// Destination icons
const DESTINATION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'andamantourpackage': Umbrella,
  'darjeelingtourpackages': Mountain,
  'gangtoktourpackage': Mountain,
  'shimlamanalitourpackage': Mountain,
  'kashmirtourpackage': Mountain,
  'kerala-tour-packages': Palmtree,
  'bhutan-tour-packages': TreePine,
  'thailand-tour-package': Palmtree,
  'bali-tour-packages': Palmtree,
  'maldives-tour-package': Umbrella,
  'sikkim-tour-package': Mountain,
  'leh-ladakh-package': Mountain,
  'lakshadweep-tour-packages': Umbrella,
  'uttarakhand-tour-package': Mountain,
  'spiti-valley-tour-packages': Mountain,
  'himachal-tour-package': Mountain,
  'rajasthan-tour-packages': Castle,
};

function DestinationSection({
  location,
  tours,
  displayName,
  Icon,
  onEnquire,
}: {
  location: string;
  tours: TourPackage[];
  displayName: string;
  Icon: React.ComponentType<{ className?: string }>;
  onEnquire: (tour: TourPackage) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  return (
    <div className="mb-14 last:mb-0">
      {/* Destination Sub-Header */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-primaryCyan">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="editorial-heading text-xl sm:text-2xl font-bold text-white tracking-wide">
              {displayName}
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">
              {tours.length} Curated Itinerar{tours.length !== 1 ? 'ies' : 'y'}
            </span>
          </div>
        </div>

        {/* Carousel Arrow Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={scrollLeft}
            className="w-9 h-9 rounded-full bg-white/[0.04] hover:bg-primaryCyan hover:text-white border border-white/[0.08] text-slate-300 flex items-center justify-center transition-all duration-200 active:scale-95"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={scrollRight}
            className="w-9 h-9 rounded-full bg-white/[0.04] hover:bg-primaryCyan hover:text-white border border-white/[0.08] text-slate-300 flex items-center justify-center transition-all duration-200 active:scale-95"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Tour Slider */}
      <div
        ref={scrollRef}
        className="flex gap-5 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar scroll-smooth"
      >
        {tours.map((tour) => (
          <div key={tour.id} className="min-w-[290px] sm:min-w-[330px] md:min-w-[350px] snap-start shrink-0">
            <TourPackageCard tour={tour} onEnquire={onEnquire} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [tours, setTours] = useState<TourPackage[]>([]);
  const [filteredTours, setFilteredTours] = useState<TourPackage[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'domestic' | 'international'>('all');
  const [selectedTourForInquiry, setSelectedTourForInquiry] = useState<TourPackage | null>(null);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      const data = await getTours();
      setTours(data);
      setFilteredTours(data);
    }
    loadData();
  }, []);

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredTours(tours);
      return;
    }
    const lower = searchTerm.toLowerCase();
    const filtered = tours.filter(
      (t) =>
        t.title.toLowerCase().includes(lower) ||
        t.location.toLowerCase().includes(lower) ||
        t.highlights.some((h) => h.toLowerCase().includes(lower))
    );
    setFilteredTours(filtered);
  };

  const handleTabChange = (tab: 'all' | 'domestic' | 'international') => {
    setActiveTab(tab);
    if (tab === 'all') {
      setFilteredTours(tours);
    } else {
      setFilteredTours(tours.filter((t) => t.category === tab));
    }
  };

  const openInquiry = (tour: TourPackage) => {
    setSelectedTourForInquiry(tour);
    setInquiryModalOpen(true);
  };

  // Group tours by destination
  const toursByDestination = useMemo(() => {
    const grouped: Record<string, TourPackage[]> = {};
    filteredTours.forEach((tour) => {
      const key = tour.location;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(tour);
    });
    return grouped;
  }, [filteredTours]);

  // Sort destinations
  const sortedDestinations = useMemo(() => {
    const destinations = Object.keys(toursByDestination);
    return destinations.sort((a, b) => {
      const aIsDomestic = !['thailand-tour-package', 'bali-tour-packages', 'maldives-tour-package'].includes(a);
      const bIsDomestic = !['thailand-tour-package', 'bali-tour-packages', 'maldives-tour-package'].includes(b);
      if (aIsDomestic && !bIsDomestic) return -1;
      if (!aIsDomestic && bIsDomestic) return 1;
      return a.localeCompare(b);
    });
  }, [toursByDestination]);

  return (
    <>
      {/* Hero Banner Section with Concierge Search */}
      <HeroBanner onSearch={handleSearch} />

      {/* Popular Destinations Editorial Showcase */}
      <PopularDestinations />

      {/* Main Tour Packages Showcase */}
      <section id="packages" className="py-20 sm:py-24 relative overflow-hidden bg-midnight text-white">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-primaryCyan/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Section Header & Category Filter Tabs */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 sm:mb-16 gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span className="gold-gradient-text uppercase font-bold tracking-widest text-[11px]">
                  Handcrafted Holiday Itineraries
                </span>
              </div>
              <h2 className="editorial-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                Featured Tour Packages
              </h2>
              <p className="text-slate-300 text-sm sm:text-base mt-2 font-light">
                Carefully planned domestic and international journeys complete with verified boutique hotels, private transfers, and 24/7 dedicated trip coordination.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center p-1.5 rounded-2xl bg-midnightLight border border-white/[0.08] text-xs font-bold gap-1 shadow-glass self-start lg:self-end">
              <button
                onClick={() => handleTabChange('all')}
                className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                  activeTab === 'all'
                    ? 'bg-primaryCyan text-white shadow-glow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Packages ({tours.length})
              </button>
              <button
                onClick={() => handleTabChange('domestic')}
                className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                  activeTab === 'domestic'
                    ? 'bg-primaryCyan text-white shadow-glow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Domestic India
              </button>
              <button
                onClick={() => handleTabChange('international')}
                className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                  activeTab === 'international'
                    ? 'bg-primaryCyan text-white shadow-glow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                International Escapes
              </button>
            </div>
          </div>

          {/* Grouped Destination Packages */}
          {sortedDestinations.length > 0 ? (
            sortedDestinations.map((location) => (
              <DestinationSection
                key={location}
                location={location}
                tours={toursByDestination[location]}
                displayName={DESTINATION_NAMES[location] || location}
                Icon={DESTINATION_ICONS[location] || MapPin}
                onEnquire={openInquiry}
              />
            ))
          ) : (
            <div className="text-center py-20 bg-midnightLight rounded-3xl border border-white/[0.08]">
              <Compass className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">No tours found matching your search</h3>
              <p className="text-xs text-slate-400 mb-4">Try clearing your search keyword or switching categories.</p>
              <button
                onClick={() => handleTabChange('all')}
                className="px-5 py-2.5 rounded-xl bg-primaryCyan text-white font-bold text-xs shadow-glow"
              >
                View All Tours
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Bespoke Itinerary Customization Banner */}
      <section className="py-16 sm:py-20 relative overflow-hidden bg-midnightLight border-y border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="relative glass-panel rounded-3xl p-8 sm:p-12 overflow-hidden border border-white/[0.12] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Ambient image background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primaryCyan/20 via-transparent to-transparent pointer-events-none" />

            <div className="max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 text-gold border border-gold/30 text-[10px] font-bold uppercase tracking-widest mb-3">
                <Sparkles className="w-3 h-3" />
                <span>Bespoke Travel Planning</span>
              </div>
              <h3 className="editorial-heading text-2xl sm:text-4xl font-bold text-white leading-tight mb-3">
                Need a Completely Tailored Vacation?
              </h3>
              <p className="text-sm text-slate-300 font-light leading-relaxed">
                Whether you desire a multi-destination honeymoon across Kashmir & Ladakh, or a private island hopping yacht experience in Andaman, our master itinerary architects will craft it effortlessly.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 w-full sm:w-auto">
              <button
                onClick={() => setInquiryModalOpen(true)}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-primaryCyan to-blue-600 hover:from-blue-500 hover:to-primaryCyan text-white font-bold text-xs uppercase tracking-wider shadow-glow hover:shadow-cyanGlow transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>Plan Custom Trip</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials & Verified Guest Feedback */}
      <Testimonials />

      {/* Global Concierge Quotation Modal */}
      <InquiryModal
        tour={selectedTourForInquiry}
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
      />
    </>
  );
}
