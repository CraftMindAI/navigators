'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MessageCircle } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';

// Vertical tabs pinned to the right edge (Call Us / Whatsapp / Get a free Quote).
const TABS = [
  { label: 'Call Us', href: siteConfig.phoneCallUrl, Icon: Phone, color: 'bg-[#f3923d]', external: false },
  {
    label: 'Whatsapp',
    href: `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent('Hi The Navigators, I would like to plan a trip.')}`,
    Icon: MessageCircle,
    color: 'bg-[#2fd36b]',
    external: true,
  },
  { label: 'Get a free Quote', href: '/contact', Icon: Mail, color: 'bg-brand-blue', external: false },
];

export default function SideContactTabs() {
  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2.5">
      {TABS?.map(({ label, href, Icon, color, external }) => {
        const cls = `${color} text-white w-8 md:w-[33px] rounded-l-md shadow-md flex flex-col items-center justify-center gap-2 py-3 hover:w-10 transition-all`;
        const inner = (
          <>
            <span className="text-[11px] md:text-xs font-medium whitespace-nowrap [writing-mode:vertical-rl] rotate-180">{label}</span>
            <Icon className="w-3.5 h-3.5 -rotate-90" />
          </>
        );
        return external ? (
          <a key={label} href={href} target="_blank" rel="noreferrer" className={cls} aria-label={label}>
            {inner}
          </a>
        ) : href.startsWith('/') ? (
          <Link key={label} href={href} className={cls} aria-label={label}>
            {inner}
          </Link>
        ) : (
          <a key={label} href={href} className={cls} aria-label={label}>
            {inner}
          </a>
        );
      })}
    </div>
  );
}
