import './globals.css';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import Providers from '@/components/providers/Providers';
import PageTransition from '@/components/ui/PageTransition';
import WhatsAppChat from '@/components/ui/WhatsAppChat';
import NotificationPermission from '@/components/ui/NotificationPermission';
import AdminNotifications from '@/components/ui/AdminNotifications';

const display = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-display' });
const body = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-body' });

export const metadata = {
  title: 'MAKHSOOS | Luxury Pakistani Clothing',
  description: 'A world-class luxury ecommerce experience for Pakistani fashion.',
  icons: {
    icon: '/images/logo.png',
    shortcut: '/images/logo.png',
    apple: '/images/logo.png'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
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
