'use client';

import Image from 'next/image';
import Link from 'next/link';
import { OpenOnboardingButton } from '@/app/onboarding/OpenOnboardingButton';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useOnboardingModal } from '@/app/providers/OnboardingModalProvider';
import { useSignInModal } from '@/app/providers/SignInModalProvider';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Success Stories', href: '#success' },
  { label: 'Pricing', href: '#pricing' },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useOnboardingModal();
  const { openModal: openSignInModal } = useSignInModal();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/amoravibe.jpg"
              alt="AmoraVibe logo"
              width={48}
              height={48}
              priority
              className="w-12 h-12 rounded-full object-cover shadow-sm"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AmoraVibe
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-purple-600 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button
              type="button"
              onClick={openSignInModal}
              className="text-gray-700 hover:text-purple-600 transition-colors"
            >
              Sign In
            </button>
            <OpenOnboardingButton className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-full font-medium transition-all">
              Get Started
            </OpenOnboardingButton>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block py-2 text-gray-700 hover:text-purple-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => {
                  openSignInModal();
                  setMobileMenuOpen(false);
                }}
                className="block w-full py-2 text-left text-gray-700 hover:text-purple-600 transition-colors"
              >
                Sign In
              </button>
              <OpenOnboardingButton
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-full font-medium transition-all text-center"
              >
                Get Started
              </OpenOnboardingButton>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
