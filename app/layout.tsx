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
    <html lang="en">
      <body className="bg-lightBg text-slate-200 antialiased min-h-screen flex flex-col justify-between">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppWidget />
        <AutoPopupForm />
      </body>
    </html>
  );
}
