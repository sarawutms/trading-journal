import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Noto_Sans_Thai } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' });
const notoSansThai = Noto_Sans_Thai({ subsets: ['thai'], weight: ['400', '600', '700'], variable: '--font-noto-thai' });

export const metadata: Metadata = {
  title: 'สมุดบันทึกการเทรด',
  description: 'บันทึกและติดตามผลการเทรดของคุณ',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // 🟢 เติม suppressHydrationWarning เข้าไปตรงนี้ครับ
    <html lang="th" suppressHydrationWarning>
      <body 
        className={`${inter.variable} ${jetbrains.variable} ${notoSansThai.variable} font-sans`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}