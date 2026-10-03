'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getBlogs } from '@/lib/supabase';
import { Blog } from '@/types';
import { ArrowLeft, Calendar, User } from 'lucide-react';

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
      <div className="min-h-screen bg-midnight text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-primaryCyan border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-400">Loading Article...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-midnight py-24 px-4 text-center text-white">
        <div className="max-w-md mx-auto glass-panel p-8 rounded-3xl">
          <h2 className="text-2xl font-bold mb-3">Article Not Found</h2>
          <p className="text-slate-400 text-xs mb-6 font-light">The requested travel guide could not be located.</p>
          <Link
            href="/news"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primaryCyan text-white font-bold text-xs shadow-glow"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Travel Journal</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight text-white pb-20">
      {/* Editorial Hero Header */}
      <div className="relative w-full h-[50vh] sm:h-[60vh] overflow-hidden flex flex-col justify-end">
        <img 
          src={blog.image_url} 
          alt={blog.title} 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/70 to-midnight/20" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-12 w-full">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-primaryCyan mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Journal</span>
          </Link>
          
          <h1 className="editorial-heading text-3xl sm:text-4xl lg:text-6xl font-bold text-white leading-tight mb-4">
            {blog.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 bg-midnight/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/[0.1]">
              <Calendar className="w-3.5 h-3.5 text-gold" />
              <span>{blog.created_at ? new Date(blog.created_at).toLocaleDateString() : 'Recently'}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-midnight/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/[0.1]">
              <User className="w-3.5 h-3.5 text-primaryCyan" />
              <span>By {blog.author}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Editorial Article Body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 relative z-10">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/[0.08] shadow-card">
          <div className="prose prose-lg prose-invert max-w-none text-slate-200 font-light leading-relaxed space-y-6">
            {blog.content.split('\n').filter(p => p.trim() !== '').map((paragraph, idx) => (
              <p key={idx} className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-white/[0.08] flex items-center justify-between">
            <Link
              href="/news"
              className="text-xs font-semibold text-primaryCyan hover:underline flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>More Articles in Journal</span>
            </Link>

            <Link
              href="/#packages"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primaryCyan to-blue-600 text-white font-bold text-xs shadow-glow"
            >
              Explore Packages
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
