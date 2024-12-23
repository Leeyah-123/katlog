import { Button } from '@/components/ui/button';
import { ArrowRight, Bell, Eye, Zap } from 'lucide-react';
import Link from 'next/link';

export default async function LandingPage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="text-center py-20 px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
          Monitor Your Solana Accounts with Ease
        </h1>
        <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
          Katlog helps you keep track of your Solana accounts, transactions, and
          more in real-time.
        </p>
        <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
          <Link href="/signup">
            Get Started <ArrowRight className="ml-2" />
          </Link>
        </Button>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 w-full bg-gray-900 bg-opacity-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center text-white">
            Key Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Eye className="w-10 h-10 text-purple-400" />}
              title="Real-time Monitoring"
              description="Watch your Solana accounts and receive instant updates on transactions and balance changes."
            />
            <FeatureCard
              icon={<Bell className="w-10 h-10 text-purple-400" />}
              title="Custom Alerts"
              description="Set up personalized notifications for specific events or threshold amounts."
            />
            <FeatureCard
              icon={<Zap className="w-10 h-10 text-purple-400" />}
              title="Fast & Secure"
              description="Built on cutting-edge technology to ensure speed, reliability, and security for your data."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-20 px-4">
        <h2 className="text-3xl font-bold mb-6 text-white">
          Ready to Take Control?
        </h2>
        <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
          Join Katlog today and experience a new level of Solana account
          management.
        </p>
        <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
          <Link href="/signup">
            Sign Up Now <ArrowRight className="ml-2" />
          </Link>
        </Button>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
