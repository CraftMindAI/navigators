'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Mail,
  MapPin,
  Phone,
  Facebook,
  Instagram,
  LogIn,
  ChevronDown,
  Menu,
  X,
  Compass,
  Sparkles,
  User,
  ArrowRight,
  Shield,
  Plane
} from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';
import { supabase } from '@/lib/supabase';

// Curated destinations for mega-dropdown
const POPULAR_DESTINATIONS = [
  { name: 'Sikkim & Gangtok', slug: 'sikkim-tour-package', tag: 'Mountains', img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=400&q=80' },
  { name: 'Kashmir Valley', slug: 'kashmir-tour-package', tag: 'Paradise', img: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=400&q=80' },
  { name: 'Kerala Backwaters', slug: 'kerala-tour-packages', tag: 'Tropical', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=400&q=80' },
  { name: 'Andaman Islands', slug: 'andaman-tour-package', tag: 'Beaches', img: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=400&q=80' },
  { name: 'Bhutan Kingdom', slug: 'bhutan-tour-packages', tag: 'Himalayan', img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400&q=80' },
  { name: 'Bali & Tropics', slug: 'bali-tour-packages', tag: 'Island Escape', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80' },
];

export default function Header({ onOpenInquiry }: { onOpenInquiry?: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tourDropdownOpen, setTourDropdownOpen] = useState(false);
  const [authModal, setAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const session = localStorage.getItem('thenavigators_admin_session');
    if (session === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthMessage('');
    if (supabase) {
      const { data: isValid, error } = await supabase.rpc('verify_admin_login', {
        admin_email: authEmail,
        admin_password: authPassword,
      });

      if (error || !isValid) {
        setAuthMessage(error?.message || 'Invalid email or password.');
        setAuthLoading(false);
      } else {
        localStorage.setItem('thenavigators_admin_session', 'true');
        setIsAdmin(true);
        setTimeout(() => {
          setAuthModal(false);
          window.location.href = '/admin';
        }, 1200);
      }
    } else {
      setAuthMessage('Database connection not established.');
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('thenavigators_admin_session');
    setIsAdmin(false);
    if (window.location.pathname === '/admin') {
      window.location.href = '/';
    } else {
      window.location.reload();
    }
  };

  return (
    <>
      {/* Top Utility Bar */}
      <div className="bg-midnight/90 border-b border-white/[0.05] text-[11px] text-slate-300 py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-primaryCyan font-medium">
              <Sparkles className="w-3 h-3 text-gold" />
              <span>Tailor-Made Holiday Expeditions & Concierge</span>
            </span>
            <div className="h-3 w-[1px] bg-slate-700" />
            <a
              href={`mailto:${siteConfig.emailAddress}`}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Mail className="w-3 h-3 text-slate-400" />
              <span>{siteConfig.emailAddress}</span>
            </a>
            <div className="h-3 w-[1px] bg-slate-700" />
            <div className="flex items-center gap-1.5 text-slate-400">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{siteConfig.headOfficeAddress}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <a
                href={siteConfig.socialLinks.facebook}
                target="_blank"
                rel="noreferrer"
                className="w-6 h-6 rounded-full bg-white/[0.04] hover:bg-primaryCyan/20 hover:text-primaryCyan flex items-center justify-center transition-colors"
                title="Facebook"
              >
                <Facebook className="w-3 h-3" />
              </a>
              <a
                href={siteConfig.socialLinks.instagram}
                target="_blank"
                rel="noreferrer"
                className="w-6 h-6 rounded-full bg-white/[0.04] hover:bg-primaryCyan/20 hover:text-primaryCyan flex items-center justify-center transition-colors"
                title="Instagram"
              >
                <Instagram className="w-3 h-3" />
              </a>
            </div>

            <div className="h-3 w-[1px] bg-slate-700" />

            {isAdmin ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/admin"
                  className="flex items-center gap-1 text-primaryCyan hover:text-white transition-colors font-medium px-2 py-0.5 rounded bg-primaryCyan/10 border border-primaryCyan/30"
                >
                  <Shield className="w-3 h-3 text-primaryCyan" />
                  <span>Admin</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 font-medium px-2 py-0.5 rounded bg-red-950/40 border border-red-800/40"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModal(true)}
                className="flex items-center gap-1 hover:text-primaryCyan transition-colors font-medium text-slate-400"
              >
                <LogIn className="w-3 h-3 text-slate-400" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Floating Glass Navbar */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-midnight/90 backdrop-blur-2xl border-b border-white/[0.08] shadow-2xl py-2.5'
            : 'bg-midnight/70 backdrop-blur-xl border-b border-white/[0.05] py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img
                src="/Navigator.png"
                alt="The Navigators"
                className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 font-medium text-[13px] tracking-wide text-slate-200">
            <Link
              href="/"
              className="px-3.5 py-2 rounded-full hover:text-primaryCyan hover:bg-white/[0.04] transition-all"
            >
              Home
            </Link>

            {/* Tour Packages Mega Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-full hover:text-primaryCyan hover:bg-white/[0.04] transition-all">
                <span>Destinations</span>
                <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180 text-slate-400 group-hover:text-primaryCyan" />
              </button>

              {/* Mega Dropdown Panel */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[620px] p-4 bg-midnight/95 backdrop-blur-2xl border border-white/[0.1] rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-primaryCyan" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Handpicked Escapes & Regions
                    </span>
                  </div>
                  <Link
                    href="/#packages"
                    className="text-xs font-semibold text-primaryCyan hover:underline flex items-center gap-1"
                  >
                    View All Packages <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {POPULAR_DESTINATIONS.map((dest) => (
                    <Link
                      key={dest.slug}
                      href={`/location/${dest.slug}`}
                      className="group/item relative h-28 rounded-xl overflow-hidden border border-white/[0.06] hover:border-primaryCyan/40 transition-all flex flex-col justify-end p-2.5"
                    >
                      <img
                        src={dest.img}
                        alt={dest.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/50 to-transparent" />
                      <div className="relative z-10">
                        <span className="text-[9px] font-bold uppercase text-gold bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-xs">
                          {dest.tag}
                        </span>
                        <h4 className="text-xs font-bold text-white mt-1 group-hover/item:text-primaryCyan transition-colors line-clamp-1">
                          {dest.name}
                        </h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link
              href="/news"
              className="px-3.5 py-2 rounded-full hover:text-primaryCyan hover:bg-white/[0.04] transition-all"
            >
              Travel Journal
            </Link>

            <Link
              href="/contact"
              className="px-3.5 py-2 rounded-full hover:text-primaryCyan hover:bg-white/[0.04] transition-all"
            >
              Contact
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Phone Call CTA */}
            <a
              href={siteConfig.phoneCallUrl}
              className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-primaryCyan/40 hover:bg-white/[0.08] transition-all group"
            >
              <div className="w-7 h-7 rounded-full bg-primaryCyan/20 text-primaryCyan flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <div className="text-left pr-1">
                <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold leading-none">
                  24/7 Concierge
                </span>
                <span className="text-xs font-bold text-white group-hover:text-primaryCyan transition-colors leading-tight">
                  {siteConfig.phoneNumber}
                </span>
              </div>
            </a>

            {/* Quick Consultation Button */}
            <button
              onClick={() => onOpenInquiry ? onOpenInquiry() : window.location.href = '/contact'}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-primaryCyan to-blue-600 hover:from-blue-500 hover:to-primaryCyan text-white text-xs font-bold tracking-wide shadow-glow hover:shadow-cyanGlow transition-all duration-300 flex items-center gap-1.5 touch-manipulation"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Plan My Trip</span>
            </button>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-full bg-midnight/98 backdrop-blur-2xl border-b border-white/[0.1] shadow-2xl px-5 py-6 max-h-[85vh] overflow-y-auto custom-scrollbar animate-in slide-in-from-top-2 duration-300">
            <nav className="space-y-2">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-white/[0.06] hover:text-primaryCyan transition-colors"
              >
                Home
              </Link>

              {/* Mobile Destination Accordion */}
              <div>
                <button
                  onClick={() => setTourDropdownOpen(!tourDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-white/[0.06] hover:text-primaryCyan transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-primaryCyan" />
                    <span>Explore Destinations</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      tourDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {tourDropdownOpen && (
                  <div className="grid grid-cols-2 gap-2 mt-2 pl-2">
                    {POPULAR_DESTINATIONS.map((d) => (
                      <Link
                        key={d.slug}
                        href={`/location/${d.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:border-primaryCyan/40 text-xs font-bold text-slate-200 hover:text-primaryCyan"
                      >
                        {d.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/news"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-white/[0.06] hover:text-primaryCyan transition-colors"
              >
                Travel Journal & Guides
              </Link>

              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-white/[0.06] hover:text-primaryCyan transition-colors"
              >
                Contact Concierge
              </Link>
            </nav>

            <div className="mt-6 pt-5 border-t border-white/[0.08] space-y-3">
              <a
                href={siteConfig.phoneCallUrl}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm font-bold text-white hover:text-primaryCyan"
              >
                <Phone className="w-4 h-4 text-primaryCyan" />
                <span>Call {siteConfig.phoneNumber}</span>
              </a>

              <div className="flex items-center justify-between px-2 pt-2 text-xs text-slate-400">
                <span>Shimla, Himachal Pradesh</span>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModal(true);
                  }}
                  className="text-primaryCyan font-semibold"
                >
                  Admin Access
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Admin Sign In Modal */}
      {authModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel text-white w-full max-w-md p-6 rounded-2xl relative shadow-2xl">
            <button
              onClick={() => setAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2 text-primaryCyan">
              <Shield className="w-5 h-5 text-primaryCyan" />
              <span className="text-xs font-bold uppercase tracking-wider">The Navigators Portal</span>
            </div>

            <h3 className="text-xl font-bold text-white mb-1">Administrator Sign In</h3>
            <p className="text-xs text-slate-400 mb-5">
              Secure credentials required to manage tour packages, leads, and blogs.
            </p>

            {authMessage ? (
              <div className="p-3 bg-red-500/20 border border-red-500 text-red-200 rounded-xl text-xs mb-4">
                {authMessage}
              </div>
            ) : null}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Admin Email</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="admin@thenavigators.com"
                  className="w-full bg-midnight border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primaryCyan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-midnight border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primaryCyan"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-gradient-to-r from-primaryCyan to-blue-600 hover:brightness-110 text-white font-bold py-3 rounded-xl text-sm shadow-glow flex items-center justify-center gap-2 transition-all mt-2"
              >
                {authLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Sign In to Dashboard</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
