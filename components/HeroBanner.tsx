'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Calendar,
  Wallet,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Compass,
  Star,
  Users,
  ShieldCheck,
  Award
} from 'lucide-react';

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=2000&q=85',
    tag: 'Himalayan Expedition',
    title: 'Majestic Sikkim & Gangtok',
    subtitle: 'High Altitude Lakes, Ancient Monasteries & Kanchenjunga Panoramas',
    price: 'Starting from ₹12,499 / person',
  },
  {
    image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=2000&q=85',
    tag: 'Paradise on Earth',
    title: 'Kashmir Valley & Gulmarg',
    subtitle: 'Private Dal Lake Houseboats, Gondola Snow Peaks & Mughal Gardens',
    price: 'Starting from ₹11,999 / person',
  },
  {
    image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=2000&q=85',
    tag: 'Island Escapes',
    title: 'Andaman & Havelock Islands',
    subtitle: 'Crystal Lagoons, Radhanagar Sunset & Exotic Coral Reef Diving',
    price: 'Starting from ₹18,500 / person',
  },
  {
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=2000&q=85',
    tag: 'International Odyssey',
    title: 'Bali Sanctuary & Temples',
    subtitle: 'Ubud Rainforest Retreats, Uluwatu Cliff Sunsets & Private Pool Villas',
    price: 'Starting from ₹29,999 / person',
  },
];

const TRAVEL_MOODS = [
  { label: 'All Escapes', query: '' },
  { label: 'Honeymoon & Romance', query: 'honeymoon' },
  { label: 'Himalayas & Snow', query: 'sikkim' },
  { label: 'Tropical Islands', query: 'andaman' },
  { label: 'Kerala Backwaters', query: 'kerala' },
  { label: 'International', query: 'bali' },
];

export default function HeroBanner({ onSearch }: { onSearch?: (destination: string) => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState('all');
  const [budget, setBudget] = useState('all');
  const [activeMood, setActiveMood] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(destination);
    }
    // Scroll smoothly to package results
    const el = document.getElementById('packages');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMoodClick = (index: number, query: string) => {
    setActiveMood(index);
    setDestination(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <section className="relative min-h-[640px] lg:min-h-[720px] flex flex-col justify-between overflow-hidden bg-midnight text-white">
      {/* Background Image Carousel with Ken-Burns Motion */}
      {HERO_SLIDES.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-0' : 'opacity-0 -z-10'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className={`w-full h-full object-cover object-center transform transition-transform duration-[12000ms] ${
              index === currentSlide ? 'scale-110' : 'scale-100'
            }`}
          />
          {/* Multi-layer luxury darkening gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/60 to-midnight/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-midnight/80 via-transparent to-midnight/50" />
        </div>
      ))}

      {/* Floating Carousel Navigation Buttons */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-midnight/50 hover:bg-primaryCyan hover:text-white border border-white/[0.1] backdrop-blur-md text-slate-200 flex items-center justify-center transition-all duration-300 shadow-glass"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
        className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-midnight/50 hover:bg-primaryCyan hover:text-white border border-white/[0.1] backdrop-blur-md text-slate-200 flex items-center justify-center transition-all duration-300 shadow-glass"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Hero Center Text */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-8 flex-1 flex flex-col justify-center items-center text-center">
        {/* Editorial Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.15] backdrop-blur-md text-xs font-semibold mb-4 sm:mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-gold" />
          <span className="gold-gradient-text uppercase font-bold tracking-widest text-[11px]">
            {HERO_SLIDES[currentSlide].tag}
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-400" />
          <span className="text-slate-300 font-medium text-[11px]">
            {HERO_SLIDES[currentSlide].price}
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="editorial-heading text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-white mb-4 sm:mb-6 max-w-5xl leading-[1.1] drop-shadow-xl">
          {HERO_SLIDES[currentSlide].title}
        </h1>

        {/* Subtitle */}
        <p className="text-slate-200 text-sm sm:text-lg max-w-2xl mb-8 font-light leading-relaxed drop-shadow">
          {HERO_SLIDES[currentSlide].subtitle}
        </p>

        {/* Slide Progress Bars */}
        <div className="flex items-center gap-2 mb-8">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === currentSlide
                  ? 'w-10 bg-primaryCyan shadow-glow'
                  : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Mood Filter Quick Tags */}
        <div className="hidden sm:flex flex-wrap items-center justify-center gap-2 mb-6">
          {TRAVEL_MOODS.map((mood, idx) => (
            <button
              key={idx}
              onClick={() => handleMoodClick(idx, mood.query)}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                activeMood === idx
                  ? 'bg-primaryCyan text-white shadow-glow'
                  : 'bg-midnight/60 hover:bg-white/10 text-slate-300 border border-white/[0.08]'
              }`}
            >
              {mood.label}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Concierge Search Card */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 -mb-10 sm:-mb-12 w-full">
        <form
          onSubmit={handleSearchSubmit}
          className="glass-panel p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-end border border-white/[0.12]"
        >
          {/* Destination */}
          <div className="relative">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primaryCyan" />
              <span>Where to?</span>
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Sikkim, Kashmir, Bali..."
              className="w-full bg-midnight/90 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan transition-colors"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primaryCyan" />
              <span>Duration</span>
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-midnight/90 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-primaryCyan transition-colors"
            >
              <option value="all">Any Duration</option>
              <option value="3-5">Weekend (3-5 Days)</option>
              <option value="6-8">Explorer (6-8 Days)</option>
              <option value="9+">Grand Tour (9+ Days)</option>
            </select>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-primaryCyan" />
              <span>Budget per Person</span>
            </label>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full bg-midnight/90 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-primaryCyan transition-colors"
            >
              <option value="all">All Budgets</option>
              <option value="under15k">Under ₹15,000</option>
              <option value="15k-30k">₹15,000 - ₹30,000</option>
              <option value="30k+">Luxury (₹30,000+)</option>
            </select>
          </div>

          {/* Search CTA */}
          <div>
            <button
              type="submit"
              className="w-full h-[44px] bg-gradient-to-r from-primaryCyan to-blue-600 hover:from-blue-500 hover:to-primaryCyan text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-glow hover:shadow-cyanGlow transition-all duration-300 touch-manipulation"
            >
              <Search className="w-4 h-4" />
              <span>EXPLORE TOURS</span>
            </button>
          </div>
        </form>
      </div>

      {/* Spacing for floating search overlap */}
      <div className="h-10 sm:h-12" />
    </section>
  );
}
