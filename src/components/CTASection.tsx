import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Users } from 'lucide-react';

interface FeatureHighlightProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureHighlight({ icon, title, description }: FeatureHighlightProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-12 h-12 glass rounded-xl flex items-center justify-center mb-3 text-primary">
        {icon}
      </div>
      <h4 className="font-bold mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export default function CTASection() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full mix-blend-multiply filter blur-[150px] animate-pulse-glow" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-strong rounded-3xl p-8 md:p-12 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Ready to Experience
              <span className="block text-gradient-primary mt-2">
                True Financial Privacy?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Join thousands of users who have already reclaimed their financial privacy
              with quantum-resistant ZK technology.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-10">
            <FeatureHighlight
              icon={<Zap className="w-6 h-6" />}
              title="Start in 2 Minutes"
              description="Connect wallet, deposit, and you're mixing"
            />
            <FeatureHighlight
              icon={<Shield className="w-6 h-6" />}
              title="Risk-Free Trial"
              description="Try on testnet with no real funds"
            />
            <FeatureHighlight
              icon={<Users className="w-6 h-6" />}
              title="24/7 Support"
              description="Get help from our privacy experts"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 50px -10px hsl(217 91% 60% / 0.8)' }}
              whileTap={{ scale: 0.95 }}
              type="button"
              className="px-10 py-4 bg-gradient-primary rounded-xl font-bold text-lg shadow-glow-blue flex items-center justify-center gap-2 transition-all"
              aria-label="Start mixing Bitcoin privately"
            >
              <Shield className="w-5 h-5" />
              Start Mixing Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              className="px-10 py-4 glass rounded-xl font-bold text-lg hover:bg-muted transition-colors"
              aria-label="Schedule a product demo"
            >
              Schedule Demo
            </motion.button>
          </div>

          <p className="text-sm text-muted-foreground">
            No registration required • Non-custodial • Open source
          </p>
        </motion.div>
      </div>
    </section>
  );
}
