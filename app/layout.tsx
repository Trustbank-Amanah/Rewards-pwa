import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700'],
  style: ['italic'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: 'Trustbank Amanah — Credit Rewards',
  description: 'Jouw loyalty voucher',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${inter.className} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}