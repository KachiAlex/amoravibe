'use client';

import Image from 'next/image';
import Link from 'next/link';
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-midnight-900/70 backdrop-blur-2xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/default-avatar.png"
              alt="AmoraVibe logo"
              width={48}
              height={48}
              unoptimized
              className="w-12 h-12 rounded-full object-cover shadow-sm"
            />
            <span className="text-2xl font-bold gradient-heading">
              AmoraVibe
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-white/70 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center">
            <button
              type="button"
              onClick={openSignInModal}
              className="iridescent-button px-6 py-2 text-base"
            >
              Sign In
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-midnight-900/90 border-t border-white/10 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block py-2 text-white/70 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  openSignInModal();
                  setMobileMenuOpen(false);
                }}
                className="block w-full iridescent-button text-center"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
