'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, ArrowLeft, Sparkles, MessageCircle } from 'lucide-react';
import { submitContact } from '@/lib/supabase';
import { siteConfig } from '@/config/siteConfig';

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

  return (
    <div className="py-14 sm:py-16 relative min-h-screen bg-midnight text-white overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-primaryCyan/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-primaryCyan mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span className="gold-gradient-text uppercase font-bold tracking-widest text-[11px]">
              24/7 Dedicated Concierge
            </span>
          </div>

          <h1 className="editorial-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            Connect with The Navigators
          </h1>

          <p className="text-slate-300 text-sm sm:text-base mt-3 font-light">
            Whether you are dreaming of a serene Himalayan getaway or an exotic island voyage, our dedicated travel curators are on standby 24/7.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Details Cards */}
          <div className="space-y-4">
            <div className="glass-panel p-6 rounded-3xl flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primaryCyan/10 border border-primaryCyan/30 text-primaryCyan flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Call & WhatsApp Hotline</h4>
                <a
                  href={siteConfig.phoneCallUrl}
                  className="text-xs text-primaryCyan block mt-1 font-semibold hover:underline"
                >
                  {siteConfig.phoneNumber} (24/7 Instant Line)
                </a>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/30 text-gold flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Email Consultation</h4>
                <a
                  href={`mailto:${siteConfig.emailAddress}`}
                  className="text-xs text-slate-300 hover:text-white block mt-1 transition-colors"
                >
                  {siteConfig.emailAddress}
                </a>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-slate-300 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primaryCyan" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Headquarters</h4>
                <p className="text-xs text-slate-300 mt-1 font-light leading-relaxed">
                  {siteConfig.headOfficeAddress}
                </p>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Service Hours</h4>
                <p className="text-xs text-slate-300 mt-1 font-light">
                  Monday – Sunday: 24/7 Priority Support
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 glass-panel p-6 sm:p-10 rounded-3xl border border-white/[0.12]">
            <h3 className="editorial-heading text-2xl font-bold text-white mb-2">
              Send a Voyage Inquiry
            </h3>
            <p className="text-xs text-slate-400 mb-6 font-light">
              Submit your inquiry and our destination specialist will contact you with a customized proposal within 15 minutes.
            </p>

            {submitted ? (
              <div className="p-8 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl text-center space-y-3">
                <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
                <h4 className="text-xl font-bold text-white">Inquiry Dispatched</h4>
                <p className="text-xs text-slate-300 font-light max-w-sm mx-auto">
                  Thank you for contacting The Navigators. Our senior travel coordinator will be in touch shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-midnight border border-white/[0.1] rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Phone / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full bg-midnight border border-white/[0.1] rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-midnight border border-white/[0.1] rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Your Travel Vision / Questions</label>
                  <textarea
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your preferred destinations, number of guests, travel dates, or special requests..."
                    className="w-full bg-midnight border border-white/[0.1] rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primaryCyan transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-primaryCyan to-blue-600 hover:from-blue-500 hover:to-primaryCyan text-white font-bold text-xs uppercase tracking-wider shadow-glow hover:shadow-cyanGlow transition-all duration-300 flex items-center justify-center gap-2"
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
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
