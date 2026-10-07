'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, ChevronRight } from 'lucide-react';
import { submitContact } from '@/lib/supabase';
import { siteConfig } from '@/config/siteConfig';
import SectionTitle from '@/components/SectionTitle';

const inputCls =
  'w-full bg-white border border-[#ccc] rounded-sm px-3 py-2 text-sm text-brand-ink placeholder-[#6c757d] focus:outline-none focus:border-brand-blue transition-colors';
const labelCls = 'block text-sm font-medium text-brand-blue mb-1';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await submitContact({
        name,
        email,
        phone,
        message,
      });
      setSubmitted(true);
    } catch (err) {
      alert('Error sending message. Please try again or call us directly.');
    } finally {
      setLoading(false);
    }
  };

  const details = [
    {
      Icon: Phone,
      title: 'Call & WhatsApp Hotline',
      body: (
        <a href={siteConfig.phoneCallUrl} className="text-[13px] font-medium text-brand-blue hover:underline">
          {siteConfig.phoneNumber} (24/7 Instant Line)
        </a>
      ),
    },
    {
      Icon: Mail,
      title: 'Email Consultation',
      body: (
        <a href={`mailto:${siteConfig.emailAddress}`} className="text-[13px] font-medium text-brand-blue hover:underline break-all">
          {siteConfig.emailAddress}
        </a>
      ),
    },
    {
      Icon: MapPin,
      title: 'Headquarters',
      body: <p className="text-[13px] text-brand-muted leading-relaxed">{siteConfig.headOfficeAddress}</p>,
    },
    {
      Icon: Clock,
      title: 'Service Hours',
      body: <p className="text-[13px] text-brand-muted">Monday – Sunday: 24/7 Priority Support</p>,
    },
  ];

  return (
    <div className="bg-white text-brand-ink text-sm">
      {/* Breadcrumb */}
      <div className="bg-brand-cream border-b border-[#ddd]">
        <div className="container-bb py-2.5 flex items-center gap-1.5 text-[13px] text-brand-muted">
          <Link href="/" className="text-brand-blue hover:underline">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Contact Us</span>
        </div>
      </div>

      <section className="py-10 md:py-12">
        <div className="container-bb">
          <SectionTitle
            light="Contact"
            bold="Us"
            subtitle="Whether you are dreaming of a serene Himalayan getaway or an exotic island voyage, our dedicated travel curators are on standby 24/7."
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-[30px]">
            {/* Contact Details */}
            <div className="space-y-4">
              {details?.map(({ Icon, title, body }) => (
                <div key={title} className="bg-white border border-[#ddd] shadow-[0_1px_4px_rgba(0,0,0,0.12)] rounded-sm p-4 flex items-start gap-4">
                  <Icon className="w-8 h-8 text-brand-orange flex-shrink-0" strokeWidth={1.3} />
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-brand-ink mb-1">{title}</h4>
                    {body}
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="lg:col-span-2 bg-white border border-[#ddd] shadow-[0_1px_4px_rgba(0,0,0,0.12)] rounded-sm">
              <div className="bg-brand-blue text-white px-5 py-3 rounded-t-sm">
                <h3 className="text-base font-medium">Send a Voyage Inquiry</h3>
              </div>
              <div className="p-5 sm:p-6">
                <p className="text-sm text-brand-muted mb-5">
                  Submit your inquiry and our destination specialist will contact you with a customized proposal within 15 minutes.
                </p>

                {submitted ? (
                  <div className="p-6 bg-green-50 border border-green-200 rounded-sm text-center space-y-2">
                    <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" strokeWidth={1.5} />
                    <h4 className="text-lg font-medium text-brand-ink">Inquiry Dispatched</h4>
                    <p className="text-sm text-brand-muted max-w-sm mx-auto">
                      Thank you for contacting The Navigators. Our senior travel coordinator will be in touch shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Your Full Name *</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className={inputCls}
                        />
                      </div>

                      <div>
                        <label className={labelCls}>Phone / WhatsApp *</label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 9876543210"
                          className={inputCls}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Your Travel Vision / Questions</label>
                      <textarea
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us about your preferred destinations, number of guests, travel dates, or special requests..."
                        className={inputCls}
                      />
                    </div>

                    <div className="text-center sm:text-left">
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-w-[180px] h-[45px] px-8 rounded-full bg-brand-blue hover:bg-brand-blueDark disabled:opacity-70 text-white text-[15px] font-medium transition-colors"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Send Consultation Request</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
