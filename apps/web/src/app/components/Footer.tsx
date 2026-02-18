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
    <footer className="bg-gray-900 py-10 text-gray-400">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
              <span className="text-lg">♥</span>
            </div>
            <p className="font-display text-2xl text-white">AmoraVibe</p>
          </div>
          <p className="mt-2 text-sm text-gray-400">
            Find your perfect match and start your love story today.
          </p>
        </div>
        <nav className="flex flex-wrap gap-6 text-sm text-gray-400">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="mt-6 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} AmoraVibe. All rights reserved.
      </p>
    </footer>
  );
}
