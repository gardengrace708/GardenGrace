import './globals.css';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import Providers from '@/components/providers/Providers';
import PageTransition from '@/components/ui/PageTransition';
import WhatsAppChat from '@/components/ui/WhatsAppChat';
import NotificationPermission from '@/components/ui/NotificationPermission';
import AdminNotifications from '@/components/ui/AdminNotifications';
import StructuredData, { OrganizationSchema, WebSiteSchema } from '@/components/seo/StructuredData';

const display = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-display' });
const body = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-body' });

export const metadata = {
  title: {
    default: 'MAKHSOOS | Luxury Men\'s Clothing in Pakistan',
    template: '%s | MAKHSOOS - Premium Men\'s Fashion'
  },
  description: 'Shop premium men\'s clothing at MAKHSOOS. Discover luxury Pakistani fashion including kurtas, shalwar kameez, waistcoats, and traditional wear. COD available across Pakistan.',
  keywords: ['men\'s clothing Pakistan', 'luxury menswear', 'Pakistani men fashion', 'kurta for men', 'shalwar kameez', 'waistcoat men', 'traditional Pakistani clothing', 'premium menswear', 'MAKHSOOS', 'men\'s fashion online'],
  authors: [{ name: 'MAKHSOOS' }],
  creator: 'MAKHSOOS',
  publisher: 'MAKHSOOS',
  metadataBase: new URL('https://makhsoos.shop'),
  alternates: {
    canonical: 'https://makhsoos.shop',
  },
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: 'https://makhsoos.shop',
    title: 'MAKHSOOS | Luxury Men\'s Clothing in Pakistan',
    description: 'Shop premium men\'s clothing at MAKHSOOS. Discover luxury Pakistani fashion including kurtas, shalwar kameez, waistcoats, and traditional wear.',
    siteName: 'MAKHSOOS',
    images: [
      {
        url: '/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'MAKHSOOS - Luxury Men\'s Clothing'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MAKHSOOS | Luxury Men\'s Clothing in Pakistan',
    description: 'Shop premium men\'s clothing at MAKHSOOS. Discover luxury Pakistani fashion including kurtas, shalwar kameez, waistcoats, and traditional wear.',
    images: ['/images/logo.png'],
    creator: '@makhsoos_men'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code'
  },
  icons: {
    icon: '/images/logo.png',
    shortcut: '/images/logo.png',
    apple: '/images/logo.png'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <OrganizationSchema />
        <WebSiteSchema />
      </head>
      <body className={`${display.variable} ${body.variable}`}>
        <Providers>
          <PageTransition>{children}</PageTransition>
          <WhatsAppChat />
          <NotificationPermission />
          <AdminNotifications />
        </Providers>
      </body>
    </html>
  );
}
