import './globals.css';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import Providers from '@/components/providers/Providers';
import PageTransition from '@/components/ui/PageTransition';
import WhatsAppChat from '@/components/ui/WhatsAppChat';

const display = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-display' });
const body = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-body' });

export const metadata = {
  metadataBase: new URL('https://GardenGrace.pk'),
  title: 'GardenGrace | Premium Furniture & Home Decor',
  description: 'A world-class luxury ecommerce experience for premium furniture and home decor.',
  icons: {
    icon: [
      { url: '/images/logo.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/images/logo.png',
    apple: '/images/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${display.variable} ${body.variable}`}>
        <Providers>
          <PageTransition>{children}</PageTransition>
          <WhatsAppChat />
        </Providers>
      </body>
    </html>
  );
}