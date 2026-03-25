import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Fraunces } from 'next/font/google';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AppProviders } from '@/components/providers/app-providers';
import { BRAND } from '@/lib/brand';
import './globals.css';

const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const fontDisplay = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#f59e0b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme: 'light',
};

export const metadata: Metadata = {
  title: BRAND.fullTitle,
  description: BRAND.metaDescription,
  keywords: [
    'DuckPass',
    'cruise duck',
    'rubber duck',
    'duck tracking',
    'QR code',
    'NFC',
    'passport',
  ],
  applicationName: BRAND.name,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: BRAND.name,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${fontSans.variable} ${fontDisplay.variable} cq-app-shell flex min-h-[100dvh] flex-col text-slate-900 antialiased`}
      >
        <AppProviders>
          <Header />
          <main className="flex w-full min-w-0 flex-1 flex-col">{children}</main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
