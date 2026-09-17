import type { Metadata, Viewport } from 'next';
import { Hind_Siliguri } from 'next/font/google';
import './globals.css';
import BottomNav from '@/components/layout/BottomNav';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-hind-siliguri',
});

export const metadata: Metadata = {
  title: 'আমার ওষুধ | Medicine Reminder',
  description: 'মা-বাবার ওষুধের রিমাইন্ডার অ্যাপ',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'আমার ওষুধ',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className={hindSiliguri.variable}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className={`${hindSiliguri.className} bg-slate-50 text-slate-900 antialiased`}>
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
        <BottomNav />
        <ServiceWorkerRegistration />
        {/* Bottom nav spacer */}
        <div className="h-20" aria-hidden="true" />
      </body>
    </html>
  );
}
