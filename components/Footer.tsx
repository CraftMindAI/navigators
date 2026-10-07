'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, Facebook, Instagram, Heart, Headphones, ClipboardCheck, BadgeCheck, MessageCircle, ShieldCheck } from 'lucide-react';
import { subscribeNewsletter, submitCallbackRequest } from '@/lib/supabase';
import { siteConfig } from '@/config/siteConfig';

const LINK_COLUMNS = [
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Travel Journal', href: '/news' },
    ],
  },
  {
    title: 'Products',
    links: [
      { label: 'Flight Booking', href: '/flights' },
      { label: 'Hotel Booking', href: '/hotels' },
      { label: 'Holiday Packages', href: '/#top-selling' },
    ],
  },
  {
    title: 'Destinations',
    links: [
      { label: 'Himachal Pradesh', href: '/location/shimla-manali-tour-package' },
      { label: 'Jammu & Kashmir', href: '/location/kashmir-tour-package' },
      { label: 'Sikkim & Darjeeling', href: '/location/sikkim-tour-package' },
      { label: 'Kerala', href: '/location/kerala-tour-packages' },
    ],
  },
  {
    title: 'Get In Touch',
    links: [
      { label: 'Why Choose Us', href: '/#destinations' },
      { label: 'Get a free Quote', href: '/contact' },
      { label: 'Photo Credits', href: '/credits' },
    ],
  },
];

const POPULAR = [
  { label: 'Shimla Manali', href: '/location/shimla-manali-tour-package' },
  { label: 'Kashmir', href: '/location/kashmir-tour-package' },
  { label: 'Sikkim', href: '/location/sikkim-tour-package' },
  { label: 'Darjeeling', href: '/location/darjeeling-tour-packages' },
  { label: 'Kerala', href: '/location/kerala-tour-packages' },
  { label: 'Andaman', href: '/location/andaman-tour-package' },
  { label: 'Thailand', href: '/location/thailand-tour-package' },
  { label: 'Bali', href: '/location/bali-tour-packages' },
  { label: 'Maldives', href: '/location/maldives-tour-package' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [phone, setPhone] = useState('');
  const [callSent, setCallSent] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    const res = await subscribeNewsletter(email);
    setSubStatus(res);
    setSubmitting(false);
    setEmail('');
  };

  const handleCallBack = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitCallbackRequest(phone, 'footer');
    setCallSent(true);
    setPhone('');
  };

  return (
    <footer className="relative z-20 text-brand-ink">
      {/* ---------- Grey band: trust icons · call me now · newsletter ---------- */}
      <div className="bg-[#efefef]">
        <div className="max-w-[1366px] mx-auto px-4 md:px-10 py-4 grid lg:grid-cols-[1.1fr_1fr_1.1fr] gap-6 lg:gap-0 lg:divide-x divide-dashed divide-[#bbb]">
          <div className="grid grid-cols-3 gap-2 text-center text-[13px] leading-tight lg:pr-6">
            {[
              { Icon: Headphones, top: '24/7', bottom: 'Support' },
              { Icon: ClipboardCheck, top: 'Customised', bottom: 'Itineraries' },
              { Icon: BadgeCheck, top: 'The Navigators', bottom: 'Verified' },
            ]?.map(({ Icon, top, bottom }) => (
              <div key={top}>
                <Icon className="w-10 h-10 mx-auto text-brand-orange mb-1.5" strokeWidth={1.3} />
                <span className="block font-medium">{top}</span>
                <span className="block">{bottom}</span>
              </div>
            ))}
          </div>

          <div className="lg:px-10">
            <p className="text-[13px] font-medium">Call Me Now</p>
            <p className="text-sm text-[#555] mb-2.5">Fill In Your Number To Get An Instant Call Back.</p>
            {callSent ? (
              <p className="text-sm text-green-700">Thank you! We will call you shortly.</p>
            ) : (
              <form onSubmit={handleCallBack} className="flex h-[46px] max-w-[312px]">
                <span className="bg-[#e5e5e5] px-3 flex items-center text-[#555] text-base">+91</span>
                <input
                  required
                  type="tel"
                  pattern="[0-9]{10}"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter Your Cell No"
                  className="flex-1 min-w-0 px-3 text-lg bg-white placeholder-[#777] focus:outline-none"
                />
                <button type="submit" className="w-[41px] bg-[#3a3f94] text-white flex items-center justify-center" aria-label="Request call back">
                  <Phone className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          <div className="lg:pl-10">
            <p className="text-[13px] font-medium">Receive Exclusive Offers &amp; Savings</p>
            <p className="text-sm text-[#555] mb-2.5">Straight to your inbox by subscribing to our newsletter here.</p>
            {subStatus?.success ? (
              <p className="text-sm text-green-700">{subStatus.message}</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex h-[46px] max-w-[374px]">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 min-w-0 px-3 text-lg bg-white placeholder-[#777] focus:outline-none"
                />
                <button type="submit" disabled={submitting} className="w-[62px] bg-[#3a3f94] text-white text-2xl font-bold">
                  GO
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Link columns ---------- */}
      <div className="bg-[#f1f1f1]">
        <div className="bg-white">
          <div className="max-w-[1366px] mx-auto px-4 md:px-10 grid grid-cols-2 md:grid-cols-4">
            {LINK_COLUMNS?.map((c, i) => (
              <h4 key={c.title} className={`py-2.5 text-sm font-medium ${i === 0 ? 'text-brand-orange' : 'text-brand-ink'}`}>
                {c.title}
              </h4>
            ))}
          </div>
        </div>
        <div className="max-w-[1366px] mx-auto px-4 md:px-10 py-4 grid grid-cols-2 md:grid-cols-4 gap-y-6">
          {LINK_COLUMNS?.map((c) => (
            <ul key={c.title} className="space-y-3">
              <li className="md:hidden text-sm font-medium text-brand-orange">{c.title}</li>
              {c.links?.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[13px] text-brand-nav hover:text-brand-orange">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      {/* ---------- Logo, contact & popular destinations ---------- */}
      <div className="bg-white">
        <div className="container-bb py-8 grid lg:grid-cols-[1.4fr_1fr] gap-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="shrink-0">
              <Link href="/">
                <img src="/Navigator_logo_trim.jpeg" alt="The Navigators — Travel the world" className="h-[60px] w-auto object-contain" />
              </Link>
              <div className="flex gap-2.5 mt-5">
                <a href={siteConfig.socialLinks.facebook} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-[#3b5998] text-white flex items-center justify-center" title="Facebook">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href={siteConfig.socialLinks.instagram} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-[#517fa4] text-white flex items-center justify-center" title="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href={`https://wa.me/${siteConfig.whatsappNumber}`} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-[#25d366] text-white flex items-center justify-center" title="WhatsApp">
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>
            <div className="text-sm leading-[1.5] space-y-0.5">
              <p>
                24/7 Service :{' '}
                <a href={siteConfig.phoneCallUrl} className="text-[#007bff] hover:underline">
                  {siteConfig.phoneNumber}
                </a>
              </p>
              <p>
                Whatsapp Number :{' '}
                <a href={`https://wa.me/${siteConfig.whatsappNumber}`} target="_blank" rel="noreferrer" className="text-[#007bff] hover:underline">
                  {siteConfig.phoneNumber}
                </a>
              </p>
              <p>
                Mail Us :{' '}
                <a href={`mailto:${siteConfig.emailAddress}`} className="text-[#007bff] hover:underline">
                  {siteConfig.emailAddress}
                </a>
              </p>
              <p>Office : {siteConfig.headOfficeAddress}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold mb-2.5">Popular Destinations:</p>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR?.map((p) => (
                <Link
                  key={p.label}
                  href={p.href}
                  className="px-4 py-1 rounded-full bg-brand-blue border border-[#6c7bbf] text-white text-sm hover:bg-brand-blueDark"
                >
                  {p.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Bottom bar ---------- */}
      <div className="bg-brand-blue text-white text-[13px]">
        <div className="container-bb py-4 grid grid-cols-1 md:grid-cols-3 gap-2 items-center text-center md:text-left">
          <p>© {new Date().getFullYear()} The Navigators — Travel the world. All Rights Reserved.</p>
          <p className="md:text-center flex items-center justify-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 fill-brand-red text-brand-red" /> in India
          </p>
          <p className="md:text-right flex items-center justify-center md:justify-end gap-1">
            <ShieldCheck className="w-4 h-4" /> Secure Site
          </p>
        </div>
      </div>
    </footer>
  );
}
