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
    <section id="features" className="bg-white px-6 py-20 sm:px-12">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="space-y-4 text-center">
          <h2 className="font-display text-4xl text-gray-900">
            Why Choose <span className="text-purple-600">AmoraVibe</span>
          </h2>
          <p className="text-lg text-gray-700">
            Experience the most advanced dating platform designed to help you find meaningful
            connections
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="h-full bg-white border border-gray-200 hover:shadow-lg transition"
            >
              <div className="flex flex-col items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-2xl">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-sm text-gray-700">{feature.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
