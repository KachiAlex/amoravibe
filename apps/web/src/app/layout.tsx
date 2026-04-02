import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { OnboardingModalProvider } from '@/app/providers/OnboardingModalProvider';
import { SignInModalProvider } from '@/app/providers/SignInModalProvider';
import { ThemeProvider } from '@/app/providers/ThemeProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Lovedate Trust Center',
  description: 'Onboarding, verification, and safety tooling for the Lovedate platform',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes',
  charset: 'utf-8',
  formatDetection: { telephone: false, email: false, address: false },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent' },
  icons: { icon: '/images/logo.jpg', apple: '/images/logo.jpg' },
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${spaceGrotesk.variable} flex flex-col min-h-screen w-full bg-white text-ink-900`}>
        <Suspense fallback={null}>
          <ThemeProvider>
            <OnboardingModalProvider>
              <SignInModalProvider>{children}</SignInModalProvider>
            </OnboardingModalProvider>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
