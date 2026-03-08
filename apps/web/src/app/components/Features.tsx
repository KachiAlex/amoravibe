import { Card } from '@lovedate/ui';

const features = [
  {
    icon: '✨',
    title: 'Smart Matching',
    description:
      'Our AI-powered algorithm finds compatible matches based on your interests and values.',
  },
  {
    icon: '🛡️',
    title: 'Safe & Secure',
    description:
      'Advanced verification and privacy controls keep your information safe and secure.',
  },
  {
    icon: '💬',
    title: 'Real-time Chat',
    description: 'Connect instantly with matches through our seamless messaging platform.',
  },
  {
    icon: '❤️',
    title: 'Meaningful Connections',
    description: 'Build genuine relationships with people who share your vision for the future.',
  },
  {
    icon: '👥',
    title: 'Active Community',
    description: 'Join millions of singles actively looking for their perfect match every day.',
  },
  {
    icon: '⚡',
    title: 'Quick Setup',
    description:
      'Create your profile in minutes and start connecting with potential matches instantly.',
  },
];

export function Features() {
  return (
    <section id="features" className="aurora-section py-24 text-white">
      <div className="mx-auto max-w-6xl space-y-12 px-6 sm:px-12">
        <div className="space-y-6 text-center">
          <span className="section-badge mx-auto text-white/80">Core capabilities</span>
          <h2 className="font-display text-4xl sm:text-5xl gradient-heading">
            Why Choose AmoraVibe
          </h2>
          <p className="text-lg text-white/75 max-w-3xl mx-auto">
            Experience a cinematic matchmaking ritual engineered for trust, intention, and serendipity
            across every culture.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="glass-panel h-full border-none bg-white/[0.04] p-6 text-white transition hover:scale-[1.01]"
            >
              <div className="flex flex-col items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl shadow-lg shadow-black/30">
                  <span aria-hidden>{feature.icon}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm text-white/75">{feature.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
