'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Phone, Facebook, Instagram, ChevronDown, ChevronsRight, Menu, X, Shield, Eye, EyeOff } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';
import { supabase, getDestinations } from '@/lib/supabase';
import type { Destination } from '@/types';
import { DESTINATION_GROUPS } from '@/data/travelContent';

const regionHref = (slug?: string) => (slug ? `/location/${slug}` : '/#destinations');

/** Max destinations listed per column in the Destination menu; the rest are behind "… Destination »". */
const MENU_LIMIT = 10;

const DESTINATION_MENU = [
  { category: 'domestic', title: 'India', more: 'India Destination', moreHref: '/#destinations' },
  { category: 'international', title: 'International', more: 'International Destination', moreHref: '/#international-destinations' },
] as const;

export default function Header({ onOpenInquiry }: { onOpenInquiry?: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tourDropdownOpen, setTourDropdownOpen] = useState(false);
  const [destDropdownOpen, setDestDropdownOpen] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [authModal, setAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'user' | 'signup' | 'admin'>('user');

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

    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user || null);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthMessage('');
    
    if (authMode === 'admin') {
      if (
        authEmail === process.env.NEXT_PUBLIC_ADMIN_EMAIL &&
        authPassword === process.env.NEXT_PUBLIC_ADMIN_PASSWORD
      ) {
        localStorage.setItem('thenavigators_admin_session', 'true');
        setIsAdmin(true);
        setTimeout(() => {
          setAuthModal(false);
          window.location.href = '/admin';
        }, 1200);
        return;
      }

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
      }
    } else if (authMode === 'signup') {
      if (supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: { full_name: authName }
          }
        });
        
        // Supabase returns an empty identities array if the user already exists
        if (data?.user && data.user.identities && data.user.identities.length === 0) {
          setAuthMessage('This email address is already registered. Please login instead.');
          setAuthLoading(false);
          return;
        }

        if (error) {
          setAuthMessage(error.message);
        } else {
          if (data?.user?.id) {
            // Upsert name and phone explicitly
            await supabase.from('profiles').upsert({
              id: data.user.id,
              full_name: authName,
              phone: authPhone,
              updated_at: new Date().toISOString()
            });
            // Send the plain text password to our secure RPC to be hashed and stored in profiles
            await supabase.rpc('save_profile_password', { 
              p_user_id: data.user.id, 
              p_plain_password: authPassword 
            });
          }
          setAuthMessage('Success! Please check your email to verify your account.');
        }
      }
      setAuthLoading(false);
    } else {
      if (supabase) {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) {
          setAuthMessage(error.message);
        } else {
          setAuthModal(false);
          window.location.reload();
        }
      }
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('thenavigators_admin_session');
    setIsAdmin(false);
    if (supabase) {
      await supabase.auth.signOut();
    }
    if (window.location.pathname === '/admin') {
      window.location.href = '/';
    } else {
      window.location.reload();
    }
  };

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    if (supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) setAuthMessage(error.message);
    }
    setAuthLoading(false);
  };

  useEffect(() => {
    getDestinations().then(setDestinations);
  }, []);

  const destinationsIn = (category: Destination['category']) => destinations.filter((d) => d.category === category);

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
                    {DESTINATION_GROUPS?.map((group) => (
                      <div key={group.title}>
                        <h4 className="text-[15px] font-medium text-brand-blue mb-0.5">{group.title}</h4>
                        <p className="text-[11px] text-brand-muted mb-3">{group.subtitle}</p>
                        <ul className="space-y-1.5">
                          {group.regions?.map((r) => (
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
              <Link href="/hotels" className={navLink()}>Hotel</Link>
              <div className="relative group">
                <Link href="/#destinations" className={navLink()}>
                  Destination <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-brand-orange group-hover:rotate-180 transition-transform" />
                </Link>
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                  {/* Caret pointing at the menu item */}
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[9px] border-x-transparent border-b-[9px] border-b-white drop-shadow-[0_-1px_0_rgba(0,0,0,0.06)]" />
                  <div className="w-[560px] bg-white rounded-md shadow-widget px-12 py-8">
                    <div className="grid grid-cols-2 gap-x-14">
                      {DESTINATION_MENU?.map((col) => (
                        <div key={col.category}>
                          <h4 className="inline-block text-[19px] text-brand-ink pr-6 pb-1 mb-3 border-b-2 border-brand-green">{col.title}</h4>
                          <ul className="space-y-[13px]">
                            {destinationsIn(col.category).slice(0, MENU_LIMIT)?.map((d) => (
                              <li key={d.id}>
                                <Link href={regionHref(d.slug)} className="text-[14px] text-[#444] hover:text-brand-orange transition-colors">
                                  {d.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                          <Link href={col.moreHref} className="mt-6 inline-flex items-center text-[14px] text-brand-navy hover:text-brand-orange">
                            {col.more} <ChevronsRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      ))}
                    </div>
                    <Link href="/#destinations" className="mt-5 inline-flex items-center text-[14px] text-brand-navy hover:text-brand-orange">
                      All Destination <ChevronsRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
              <Link href="/news" className={navLink()}>Travel Journal</Link>
              <Link href="/contact" className={navLink()}>Contact Us</Link>
              {(isAdmin || user) ? (
                <div className="relative group">
                  <button className={navLink()}>
                    My Account <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                  <div className="absolute top-full right-0 w-48 bg-white shadow-widget border-t-2 border-brand-orange py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible">
                    {isAdmin && (
                      <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-brand-ink hover:bg-brand-blueLight hover:text-brand-blue transition-colors">
                        <Shield className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    )}
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-brand-ink hover:bg-brand-blueLight hover:text-brand-blue transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      My Profile
                    </Link>
                    <Link href="/cart" className="flex items-center gap-2 px-4 py-2 text-sm text-brand-ink hover:bg-brand-blueLight hover:text-brand-blue transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 0a2 2 0 100 4 2 2 0 000-4z" /></svg>
                      My Cart
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-brand-red hover:bg-red-50 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
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
                  {DESTINATION_GROUPS?.map((group) => (
                    <div key={group.title}>
                      <p className="text-xs font-medium text-brand-blue mb-1">{group.title}</p>
                      <div className="grid grid-cols-2 gap-1">
                        {group.regions?.map((r) => (
                          <Link key={r.name} href={regionHref(r.slug)} onClick={() => setMobileMenuOpen(false)} className="py-1 text-sm text-brand-ink">
                            {r.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => setDestDropdownOpen(!destDropdownOpen)}
                className="w-full flex items-center justify-between px-5 py-3 text-[15px] text-brand-ink"
              >
                <span>Destination</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${destDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {destDropdownOpen && (
                <div className="px-5 py-3 space-y-4 bg-[#fafafa]">
                  {DESTINATION_MENU?.map((col) => (
                    <div key={col.category}>
                      <p className="inline-block text-sm text-brand-ink border-b-2 border-brand-green pb-0.5 mb-2">{col.title}</p>
                      <div className="grid grid-cols-2 gap-1">
                        {destinationsIn(col.category).slice(0, MENU_LIMIT)?.map((d) => (
                          <Link key={d.id} href={regionHref(d.slug)} onClick={() => setMobileMenuOpen(false)} className="py-1 text-sm text-[#444]">
                            {d.name}
                          </Link>
                        ))}
                      </div>
                      <Link href={col.moreHref} onClick={() => setMobileMenuOpen(false)} className="mt-1 inline-flex items-center text-sm text-brand-navy">
                        {col.more} <ChevronsRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                  <Link href="/#destinations" onClick={() => setMobileMenuOpen(false)} className="inline-flex items-center text-sm text-brand-navy">
                    All Destination <ChevronsRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
              {[
                { href: '/hotels', label: 'Hotel' },
                { href: '/news', label: 'Travel Journal' },
                { href: '/contact', label: 'Contact Us' },
              ]?.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-5 py-3 text-[15px] text-brand-ink hover:text-brand-orange"
                >
                  {l.label}
                </Link>
              ))}
              {(isAdmin || user) ? (
                <>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-5 py-3 text-[15px] text-brand-ink hover:text-brand-orange">
                      Admin Dashboard
                    </Link>
                  )}
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="block px-5 py-3 text-[15px] text-brand-ink hover:text-brand-orange">
                    My Profile
                  </Link>
                  <Link href="/cart" onClick={() => setMobileMenuOpen(false)} className="block px-5 py-3 text-[15px] text-brand-ink hover:text-brand-orange">
                    My Cart
                  </Link>
                  <button onClick={() => { setMobileMenuOpen(false); handleLogout(); }} className="block w-full text-left px-5 py-3 text-[15px] text-brand-red">
                    Logout
                  </button>
                </>
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

      {/* Auth Modal */}
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

            <h3 className="text-xl font-medium text-brand-ink mb-1">
              {authMode === 'admin' ? 'Administrator Sign In' : authMode === 'signup' ? 'Create an Account' : 'Welcome Back'}
            </h3>
            <p className="text-xs text-brand-muted mb-5">
              {authMode === 'admin' ? 'Secure credentials required to manage the platform.' : 'Sign in to access your profile and bookings.'}
            </p>

            <div className="flex items-center gap-2 mb-6 bg-slate-100 p-1 rounded-lg">
               <button onClick={() => setAuthMode('user')} className={`flex-1 py-1.5 text-xs font-semibold rounded ${authMode === 'user' ? 'bg-white shadow text-brand-blue' : 'text-brand-muted'}`}>Login</button>
               <button onClick={() => setAuthMode('signup')} className={`flex-1 py-1.5 text-xs font-semibold rounded ${authMode === 'signup' ? 'bg-white shadow text-brand-blue' : 'text-brand-muted'}`}>Sign Up</button>
               <button onClick={() => setAuthMode('admin')} className={`flex-1 py-1.5 text-xs font-semibold rounded ${authMode === 'admin' ? 'bg-white shadow text-brand-blue' : 'text-brand-muted'}`}>Admin</button>
            </div>

            {authMessage ? <div className={`p-3 border rounded text-xs mb-4 ${authMessage.includes('Success') ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-red-50 border-red-300 text-red-700'}`}>{authMessage}</div> : null}

            {(authMode === 'user' || authMode === 'signup') && (
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded text-sm font-medium transition-colors mb-4"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </button>
            )}

            {(authMode === 'user' || authMode === 'signup') && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-400 font-medium uppercase">Or continue with email</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <>
                  <div>
                    <label className="block text-sm text-brand-blue mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="Rahul Sharma"
                      className="w-full bg-white border border-[#ccc] rounded px-3.5 py-2.5 text-sm text-brand-ink placeholder-[#999] focus:outline-none focus:border-brand-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-brand-blue mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full bg-white border border-[#ccc] rounded px-3.5 py-2.5 text-sm text-brand-ink placeholder-[#999] focus:outline-none focus:border-brand-blue"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm text-brand-blue mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white border border-[#ccc] rounded px-3.5 py-2.5 text-sm text-brand-ink placeholder-[#999] focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="block text-sm text-brand-blue mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-[#ccc] rounded pl-3.5 pr-10 py-2.5 text-sm text-brand-ink placeholder-[#999] focus:outline-none focus:border-brand-blue"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-brand-blue hover:bg-brand-blueDark text-white py-3 rounded text-sm flex items-center justify-center gap-2 transition-colors mt-2"
              >
                {authLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>{authMode === 'signup' ? 'Create Account' : 'Sign In'}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
