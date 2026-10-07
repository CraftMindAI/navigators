'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getBlogs } from '@/lib/supabase';
import { Blog } from '@/types';
import { ArrowLeft, Calendar, ChevronRight, User } from 'lucide-react';

// Static fallback data for the hardcoded blog posts
const FALLBACK_BLOGS: Blog[] = [
  {
    id: '1',
    title: 'Top 10 Must-Visit Places in Sikkim & Gangtok for 2026',
    slug: 'top-10-places-in-sikkim',
    image_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
    content: 'Sikkim is a beautiful destination in Northeast India. \n\nFrom the high-altitude Tsomgo Lake and Nathula Pass to the glass skywalk in Pelling, there is so much to explore. Ensure you book your permits in advance for restricted areas.',
    author: 'The Navigators Travel Team',
    created_at: '2026-02-15T00:00:00.000Z',
  },
  {
    id: '2',
    title: 'Kashmir Tour Planning Guide: Best Time, Houseboats & Cable Cars',
    slug: 'kashmir-tour-planning-guide',
    image_url: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80',
    content: 'Kashmir is truly the paradise on earth. \n\nWhen planning your trip, consider staying at least one night in a Dal Lake houseboat. Also, pre-book your Gulmarg Gondola tickets online to avoid long queues.',
    author: 'Priya Sharma',
    created_at: '2026-01-28T00:00:00.000Z',
  },
  {
    id: '3',
    title: 'How to Plan a Luxury Kerala Backwater Houseboat Vacation',
    slug: 'kerala-houseboat-vacation-guide',
    image_url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    content: 'Kerala offers lush green landscapes and serene backwaters. \n\nSpend a couple of days in the tea gardens of Munnar before heading down to Alleppey for a private luxury houseboat experience.',
    author: 'Ankit Roy',
    created_at: '2026-01-10T00:00:00.000Z',
  }
];

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBlog() {
      if (slug) {
        const dynamicBlogs = await getBlogs();
        const allBlogs = [...dynamicBlogs, ...FALLBACK_BLOGS];
        const found = allBlogs.find(b => b.slug === slug);
        setBlog(found || null);
      }
      setLoading(false);
    }
    loadBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-brand-ink flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-[13px] font-medium text-brand-muted">Loading Article...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-brand-cream py-24 px-4 text-center text-brand-ink">
        <div className="max-w-md mx-auto bg-white border border-[#ddd] shadow-[0_1px_4px_rgba(0,0,0,0.12)] p-8 rounded-sm">
          <h2 className="text-[26px] leading-tight mb-3">
            <span className="font-light text-brand-gray">Article</span> <span className="font-bold text-brand-orange">Not Found</span>
          </h2>
          <p className="text-sm text-brand-ink mb-6">The requested travel guide could not be located.</p>
          <Link
            href="/news"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-sm bg-brand-blue hover:bg-brand-blueDark text-white text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Travel Journal</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-cream text-brand-ink text-sm pb-14">
      {/* Hero banner */}
      <div className="relative w-full h-[260px] sm:h-[340px] overflow-hidden flex flex-col justify-end">
        <img src={blog.image_url} alt={blog.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 container-bb pb-8">
          <nav className="flex flex-wrap items-center gap-1.5 text-[13px] text-white/85 mb-3">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/news" className="hover:text-white">
              Travel Journal
            </Link>
          </nav>

          <h1 className="text-[24px] sm:text-[30px] md:text-[34px] font-medium text-white leading-tight mb-3 max-w-4xl">{blog.title}</h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-white/90">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{blog.created_at ? new Date(blog.created_at).toLocaleDateString() : 'Recently'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>By {blog.author}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Article body */}
      <div className="container-bb pt-8">
        <div className="max-w-[860px] mx-auto bg-white p-5 sm:p-8 rounded-sm border border-[#ddd] shadow-[0_1px_4px_rgba(0,0,0,0.12)]">
          <div className="max-w-none text-brand-ink space-y-4">
            {blog.content.split('\n').filter(p => p.trim() !== '')?.map((paragraph, idx) => (
              <p key={idx} className="text-sm sm:text-[15px] text-brand-ink leading-[1.7]">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-8 pt-5 border-t border-[#ddd] flex flex-wrap items-center justify-between gap-4">
            <Link href="/news" className="text-[13px] font-medium text-brand-blue hover:underline flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>More Articles in Journal</span>
            </Link>

            <Link
              href="/#packages"
              className="px-4 py-2 rounded-sm bg-brand-blue hover:bg-brand-blueDark text-white text-[13px] font-medium transition-colors"
            >
              Explore Packages
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
