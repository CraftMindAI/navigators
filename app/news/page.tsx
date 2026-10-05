'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, User, ChevronRight, ChevronsRight } from 'lucide-react';
import SectionTitle from '@/components/SectionTitle';

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
    <div className="bg-white text-brand-ink text-sm">
      {/* Breadcrumb */}
      <div className="bg-brand-cream border-b border-[#ddd]">
        <div className="container-bb py-2.5 flex items-center gap-1.5 text-[13px] text-brand-muted">
          <Link href="/" className="text-brand-blue hover:underline">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Travel Journal</span>
        </div>
      </div>

      <section className="py-10 md:py-12">
        <div className="container-bb">
          <SectionTitle
            light="Travel"
            bold="Journal"
            subtitle="Expert insights, route recommendations, and insider advice from our destination coordinators."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[30px]">
            {blogs.map((post) => (
              <Link
                href={`/news/${post.slug}`}
                key={post.id}
                className="group bg-white flex flex-col border border-[#ddd] border-b-2 border-b-brand-blue shadow-[0_1px_4px_rgba(0,0,0,0.12)]"
              >
                <div className="relative h-[190px] overflow-hidden">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="p-3 flex-1 flex flex-col">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-brand-muted text-[13px] mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-orange" strokeWidth={1.5} />
                      <span>{post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Recently'}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-brand-orange" strokeWidth={1.5} />
                      <span>{post.author}</span>
                    </span>
                  </div>

                  <h3 className="text-sm font-medium text-brand-ink leading-snug mb-2 group-hover:text-brand-blue transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-[13px] text-brand-muted line-clamp-3 leading-relaxed mb-3">{post.content}</p>

                  <span className="mt-auto inline-flex items-center gap-1 text-[13px] font-medium text-brand-blue group-hover:underline">
                    Read More <ChevronsRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
