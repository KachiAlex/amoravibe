import Link from 'next/link';

const footerLinks = [
  {
    label: 'Features',
    href: '#features',
  },
  {
    label: 'How It Works',
    href: '#how-it-works',
  },
  {
    label: 'Success Stories',
    href: '#success-stories',
  },
  {
    label: 'Pricing',
    href: '#pricing',
  },
];

export function Footer() {
  return (
    <footer className="aurora-section py-12 text-white/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 shadow-inner shadow-black/50">
              <span className="text-lg text-white">♥</span>
            </div>
            <p className="font-display text-2xl text-white">AmoraVibe</p>
          </div>
          <p className="mt-2 text-sm">
            Find your perfect match and start your love story today.
          </p>
        </div>
        <nav className="flex flex-wrap gap-6 text-sm">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="mt-6 text-center text-xs text-white/60">
        © {new Date().getFullYear()} AmoraVibe. All rights reserved.
      </p>
    </footer>
  );
}
