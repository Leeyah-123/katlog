import { Alert, AlertDescription } from '@/components/ui/alert';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, LineChart, Shield, Zap } from 'lucide-react';
import * as motion from 'motion/react-client';
import Link from 'next/link';

export default function LandingPage() {
  const features = [
    {
      icon: <Eye className="w-6 h-6" />,
      title: 'Real-time Monitoring',
      description:
        'Track your Solana accounts and transactions with instant updates and live monitoring.',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Instant Notifications',
      description:
        'Stay informed with blazing-fast alerts powered by QuickNode Streams.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure & Private',
      description: 'Enterprise-grade security for your data.',
    },
    {
      icon: <LineChart className="w-6 h-6" />,
      title: 'Analytics Dashboard (Coming Soon)',
      description:
        'Visualize your portfolio performance with interactive charts and metrics.',
    },
  ];

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-6 py-20">
      <Alert className="mb-8 border-yellow-500/50 bg-yellow-500/10">
        <AlertDescription className="text-yellow-300">
          🚧 Currently live on Solana Devnet only. Mainnet support coming soon!
        </AlertDescription>
      </Alert>

      <div className="text-center mb-20">
        <motion.h2
          className="text-5xl md:text-6xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Monitor Your Solana
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            {' '}
            Universe
          </span>
        </motion.h2>

        <motion.p
          className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Take control of your Solana accounts with real-time monitoring,
          instant notifications, and powerful analytics - all in one beautiful
          dashboard.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Link
            href="/signup"
            className={buttonVariants({
              className:
                'bg-purple-500 hover:bg-purple-600 text-white px-8 py-6 rounded-full text-lg',
            })}
          >
            Get Started
          </Link>
        </motion.div>
      </div>

      <motion.div
        className="grid md:grid-cols-2 gap-6 mt-20"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        {features.map((feature, index) => (
          <Card
            key={index}
            className="bg-white/10 border-0 backdrop-blur-lg hover:bg-white/15 transition-all duration-300"
          >
            <CardContent className="p-6">
              <div className="mb-4 text-purple-400">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-300">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <motion.div
        className="text-center mt-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        <h3 className="text-3xl font-bold text-white mb-6">
          Ready to Take Control?
        </h3>
        <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
          Join thousands of Solana users who trust Katlog for their portfolio
          management needs.
        </p>
        <Link
          href="/signup"
          className={buttonVariants({
            className:
              'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-6 rounded-full text-lg',
          })}
        >
          Sign Up Now
        </Link>
      </motion.div>
    </div>
  );
}
