import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SideContactTabs from '@/components/SideContactTabs';
import AutoPopupForm from '@/components/AutoPopupForm';
import MetaPixel from '@/components/MetaPixel';
import GoogleAnalytics from '@/components/GoogleAnalytics';

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
  themeColor: '#F7941D',
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-brand-ink antialiased min-h-screen flex flex-col justify-between relative">
        <GoogleAnalytics />
        <MetaPixel />
        <Header />
        <main className="flex-1 relative z-10">{children}</main>
        <Footer />
        <SideContactTabs />
        <AutoPopupForm />
      </body>
    </html>
  );
}
