'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Phone, Facebook, Instagram, ChevronDown, Menu, X, Shield } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';
import { supabase } from '@/lib/supabase';
import { DESTINATION_GROUPS } from '@/data/travelContent';

const regionHref = (slug?: string) => (slug ? `/location/${slug}` : '/#destinations');

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

  const openQuote = () => (onOpenInquiry ? onOpenInquiry() : (window.location.href = '/contact'));

  const navLink = (active = false) =>
    `relative h-full flex items-center px-3 text-[13px] font-medium transition-colors ${
      active ? 'text-brand-orange' : 'text-brand-nav hover:text-brand-orange'
    }`;

  return (
    <>
      <header className={`sticky top-0 z-50 bg-white transition-shadow ${scrolled ? 'shadow-[0_2px_8px_rgba(0,0,0,0.12)]' : ''}`}>
        {/* ---------- Desktop ---------- */}
        <div className="hidden lg:block relative h-[102px]">
          {/* Blue contact strip across the top */}
          <div className="absolute top-0 inset-x-0 h-10 bg-brand-blue" />

          {/* White logo panel with a diagonal right edge */}
          <div
            className="absolute top-0 left-0 bottom-0 w-[440px] xl:w-[33%] bg-white z-10"
            style={{ clipPath: 'polygon(0 0, 89% 0, 100% 100%, 0 100%)' }}
          >
            <Link href="/" className="absolute left-[50px] xl:left-[13%] top-1/2 -translate-y-1/2">
              <img src="/Navigator_logo_trim.jpeg" alt="The Navigators — Travel the world" className="h-[60px] w-auto object-contain" />
            </Link>
          </div>

          <div className="relative z-20 ml-auto w-[calc(100%-440px)] xl:w-[67%] h-full flex flex-col pr-6 xl:pr-[10%]">
            {/* Top strip content */}
            <div className="h-10 flex items-center justify-end gap-3 text-white text-[13px] font-medium">
              <a href={siteConfig.phoneCallUrl} className="hover:text-brand-orange">
                24/7 : {siteConfig.phoneNumber}
              </a>
              <span className="w-[26px] h-[22px] rounded-full bg-brand-orange text-[11px] flex items-center justify-center">OR</span>
              <a href={`mailto:${siteConfig.emailAddress}`} className="flex items-center gap-1.5 hover:text-brand-orange">
                <Mail className="w-3.5 h-3.5" /> {siteConfig.emailAddress}
              </a>
              <button onClick={openQuote} className="h-[34px] px-2 bg-brand-orange hover:bg-brand-orangeDark text-white text-[13px]">
                Get a free Quote
              </button>
              <a href={siteConfig.socialLinks.facebook} target="_blank" rel="noreferrer" className="hover:text-brand-orange" title="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href={siteConfig.socialLinks.instagram} target="_blank" rel="noreferrer" className="hover:text-brand-orange" title="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
            </div>

            {/* Main nav */}
            <nav className="flex-1 flex items-stretch justify-end">
              <div className="relative group">
                <button className={navLink(true)}>
                  Holiday <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                  <span className="absolute left-3 right-3 bottom-0 h-[2px] bg-brand-orange" />
                </button>
                <div className="absolute top-full right-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                  <div className="w-[720px] grid grid-cols-3 gap-6 p-6 bg-white border-t-2 border-brand-orange shadow-widget">
                    {DESTINATION_GROUPS.map((group) => (
                      <div key={group.title}>
                        <h4 className="text-[15px] font-medium text-brand-blue mb-0.5">{group.title}</h4>
                        <p className="text-[11px] text-brand-muted mb-3">{group.subtitle}</p>
                        <ul className="space-y-1.5">
                          {group.regions.map((r) => (
                            <li key={r.name}>
                              <Link href={regionHref(r.slug)} className="text-sm text-brand-ink hover:text-brand-orange">
                                {r.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <Link href="/flights" className={navLink()}>Flight</Link>
              <Link href="/hotels" className={navLink()}>Hotel</Link>
              <Link href="/#destinations" className={navLink()}>
                Destination <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
              </Link>
              <Link href="/news" className={navLink()}>Travel Journal</Link>
              <Link href="/contact" className={navLink()}>Contact Us</Link>
              {isAdmin ? (
                <div className="relative group">
                  <Link href="/admin" className={navLink()}>
                    My Account <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                  </Link>
                  <div className="absolute top-full right-0 w-40 bg-white shadow-widget border-t-2 border-brand-orange py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible">
                    <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-brand-blueLight">
                      <Shield className="w-4 h-4" /> Dashboard
                    </Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-brand-red hover:bg-brand-blueLight">
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAuthModal(true)} className={navLink()}>
                  My Account <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* ---------- Mobile ---------- */}
        <div className="lg:hidden relative h-[70px] px-4 flex items-center justify-between border-b border-[#eee]">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1 text-brand-blue" aria-label="Toggle Menu">
            {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <img src="/Navigator_logo_trim.jpeg" alt="The Navigators" className="h-12 w-auto object-contain" />
          </Link>
          <a href={siteConfig.phoneCallUrl} className="p-1 text-brand-blue" aria-label="Call us">
            <Phone className="w-6 h-6" />
          </a>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden absolute inset-x-0 top-full bg-white border-b border-[#ddd] shadow-widget max-h-[80vh] overflow-y-auto">
            <nav className="divide-y divide-[#eee]">
              <button
                onClick={() => setTourDropdownOpen(!tourDropdownOpen)}
                className="w-full flex items-center justify-between px-5 py-3 text-[15px] text-brand-orange"
              >
                <span>Holiday</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${tourDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {tourDropdownOpen && (
                <div className="px-5 py-3 space-y-3 bg-[#fafafa]">
                  {DESTINATION_GROUPS.map((group) => (
                    <div key={group.title}>
                      <p className="text-xs font-medium text-brand-blue mb-1">{group.title}</p>
                      <div className="grid grid-cols-2 gap-1">
                        {group.regions.map((r) => (
                          <Link key={r.name} href={regionHref(r.slug)} onClick={() => setMobileMenuOpen(false)} className="py-1 text-sm text-brand-ink">
                            {r.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {[
                { href: '/flights', label: 'Flight' },
                { href: '/hotels', label: 'Hotel' },
                { href: '/#destinations', label: 'Destination' },
                { href: '/news', label: 'Travel Journal' },
                { href: '/contact', label: 'Contact Us' },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-5 py-3 text-[15px] text-brand-ink hover:text-brand-orange"
                >
                  {l.label}
                </Link>
              ))}
              {isAdmin ? (
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-5 py-3 text-[15px] text-brand-ink">
                  My Account
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModal(true);
                  }}
                  className="block w-full text-left px-5 py-3 text-[15px] text-brand-ink"
                >
                  My Account
                </button>
              )}
            </nav>
            <div className="p-4 bg-brand-blue text-white text-sm space-y-1">
              <a href={siteConfig.phoneCallUrl} className="block">
                24/7 : {siteConfig.phoneNumber}
              </a>
              <a href={`mailto:${siteConfig.emailAddress}`} className="block">
                {siteConfig.emailAddress}
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Admin Sign In Modal */}
      {authModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-lg relative shadow-widget">
            <button
              onClick={() => setAuthModal(false)}
              className="absolute top-4 right-4 text-brand-muted hover:text-brand-ink w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2 text-brand-blue">
              <Shield className="w-5 h-5" />
              <span className="text-xs font-medium uppercase tracking-wider">The Navigators Portal</span>
            </div>

            <h3 className="text-xl font-medium text-brand-ink mb-1">Administrator Sign In</h3>
            <p className="text-xs text-brand-muted mb-5">Secure credentials required to manage tour packages, leads, and blogs.</p>

            {authMessage ? <div className="p-3 bg-red-50 border border-red-300 text-red-700 rounded text-xs mb-4">{authMessage}</div> : null}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-brand-blue mb-1">Admin Email</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="admin@thenavigators.com"
                  className="w-full bg-white border border-[#ccc] rounded px-3.5 py-2.5 text-sm text-brand-ink placeholder-[#999] focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="block text-sm text-brand-blue mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-[#ccc] rounded px-3.5 py-2.5 text-sm text-brand-ink placeholder-[#999] focus:outline-none focus:border-brand-blue"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-brand-blue hover:bg-brand-blueDark text-white py-3 rounded text-sm flex items-center justify-center gap-2 transition-colors mt-2"
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
