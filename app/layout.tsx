import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import AutoPopupForm from '@/components/AutoPopupForm';

export const metadata: Metadata = {
  title: 'The Navigators | Travel Beyond Borders - Best Tour & Travel Packages',
  description: 'Book custom tour packages with The Navigators - Travel Beyond Borders. Discover premium domestic & international holiday destinations with 24/7 support.',
  keywords: 'The Navigators, Travel Beyond Borders, Sikkim tour package, Kashmir packages, Kerala houseboat, Darjeeling tour, Andaman holiday, Bhutan travel',
  icons: {
    icon: '/Navigator.png',
    shortcut: '/Navigator.png',
    apple: '/Navigator.png',
  },
  openGraph: {
    title: 'The Navigators | Travel Beyond Borders',
    description: 'Explore handpicked tour packages across India and international destinations with 24/7 customer support.',
    url: 'https://thenavigatorsholidays.com',
    siteName: 'The Navigators',
    locale: 'en_IN',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#0d0d2b',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-midnight text-slate-100 antialiased min-h-screen flex flex-col justify-between relative selection:bg-primaryCyan/30 selection:text-white">
        {/* Subtle Luxury Ambient Glows in Background */}
        <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-primaryCyan/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-ambient-glow" />
        <div className="fixed bottom-1/4 right-10 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[160px] pointer-events-none -z-10" />

        <Header />
        <main className="flex-1 relative z-10">{children}</main>
        <Footer />
        <WhatsAppWidget />
        <AutoPopupForm />
      </body>
    </html>
  );
}
