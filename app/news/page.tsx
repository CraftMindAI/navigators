'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, User, ArrowRight, ArrowLeft, BookOpen } from 'lucide-react';

import { getBlogs } from '@/lib/supabase';
import { Blog } from '@/types';

const STATIC_BLOGS = [
  {
    id: '1',
    title: 'Top 10 Must-Visit Places in Sikkim & Gangtok for 2026',
    slug: 'top-10-places-in-sikkim',
    category: 'Travel Guide',
    created_at: '2026-02-15T00:00:00.000Z',
    author: 'The Navigators Travel Team',
    content: 'From high-altitude Tsomgo Lake and Nathula Pass to the skywalk in Pelling, explore the best tourist attractions in Sikkim.',
    image_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    title: 'Kashmir Tour Planning Guide: Best Time, Houseboats & Cable Cars',
    slug: 'kashmir-tour-planning-guide',
    category: 'Kashmir Packages',
    created_at: '2026-01-28T00:00:00.000Z',
    author: 'Priya Sharma',
    content: 'Everything you need to know about booking Dal Lake houseboats, Gulmarg Gondola tickets, and visiting Betaab Valley.',
    image_url: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '3',
    title: 'How to Plan a Luxury Kerala Backwater Houseboat Vacation',
    slug: 'kerala-houseboat-vacation-guide',
    category: 'Honeymoon Deals',
    created_at: '2026-01-10T00:00:00.000Z',
    author: 'Ankit Roy',
    content: 'Experience serene tea gardens in Munnar and luxury private houseboats in Alleppey backwaters.',
    image_url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
  }
];

export default function BlogsPage() {
  const [blogs, setBlogs] = React.useState<Blog[]>([]);

  React.useEffect(() => {
    async function loadBlogs() {
      const dynamicBlogs = await getBlogs();
      // Combine dynamic blogs from DB with the static fallback blogs
      setBlogs([...dynamicBlogs, ...STATIC_BLOGS as Blog[]]);
    }
    loadBlogs();
  }, []);
  return (
    <div className="py-14 sm:py-16 relative min-h-screen bg-midnight text-white overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-primaryCyan/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-primaryCyan mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-semibold mb-3">
            <BookOpen className="w-3.5 h-3.5 text-primaryCyan" />
            <span className="gold-gradient-text uppercase font-bold tracking-widest text-[11px]">
              Travel Journal & Field Guides
            </span>
          </div>
          <h1 className="editorial-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            The Navigators Gazette
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-2 font-light">
            Expert insights, route recommendations, and insider advice from our destination coordinators.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {blogs.map((post) => (
            <Link
              href={`/news/${post.slug}`}
              key={post.id}
              className="group glass-card rounded-3xl overflow-hidden flex flex-col justify-between border border-white/[0.08] hover:border-primaryCyan/40 shadow-card hover:shadow-cardHover transition-all duration-500"
            >
              <div className="relative h-48 sm:h-52 overflow-hidden">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/30 to-transparent" />
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-slate-400 text-xs mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gold" />
                      <span>{post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Recently'}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-primaryCyan" />
                      <span>{post.author}</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base sm:text-lg leading-snug mb-3 group-hover:text-primaryCyan transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4 font-light">
                    {post.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs font-semibold text-primaryCyan">
                  <span>Read Full Article</span>
                  <div className="w-7 h-7 rounded-full bg-white/[0.05] group-hover:bg-primaryCyan group-hover:text-white flex items-center justify-center transition-all duration-300 transform group-hover:translate-x-1">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
