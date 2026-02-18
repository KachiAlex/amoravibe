import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { OnboardingModalProvider } from '@/app/providers/OnboardingModalProvider';
import { SignInModalProvider } from '@/app/providers/SignInModalProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Lovedate Trust Center',
  description: 'Onboarding, verification, and safety tooling for the Lovedate platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable}`}>
        <OnboardingModalProvider>
          <SignInModalProvider>{children}</SignInModalProvider>
        </OnboardingModalProvider>
      </body>
    </html>
  );
}
