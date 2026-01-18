import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Zap, 
  Users, 
  Lock, 
  Cpu,
  Globe
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Quantum-Resistant Privacy',
    description: 'ZK-STARK proofs that are secure against quantum computers',
    details: 'Unlike ZK-SNARKs, our STARK-based system requires no trusted setup and is quantum-resistant.',
    gradient: 'from-primary to-accent',
    stats: '99.9% security guarantee'
  },
  {
    icon: Zap,
    title: 'Instant Verification',
    description: 'Sub-second proof verification on Starknet',
    details: "Leverage Starknet's scalability for near-instant private transactions.",
    gradient: 'from-secondary to-glow-pink',
    stats: '< 1s verification time'
  },
  {
    icon: Users,
    title: 'Dynamic Anonymity Sets',
    description: 'Larger anonymity sets for stronger privacy',
    details: 'Automatic pooling with thousands of users for maximum privacy.',
    gradient: 'from-glow-green to-accent',
    stats: '10k+ active users'
  },
  {
    icon: Lock,
    title: 'Non-Custodial Design',
    description: 'Your keys, your coins - always',
    details: 'Never lose control of your funds. The mixer only handles proofs, not assets.',
    gradient: 'from-glow-orange to-destructive',
    stats: '0 custodial risk'
  },
  {
    icon: Cpu,
    title: 'Gas Optimized',
    description: 'Lowest cost privacy on Starknet',
    details: 'Optimized Cairo contracts and batch verification minimize gas costs.',
    gradient: 'from-glow-orange to-primary',
    stats: '~$0.50 per mix'
  },
  {
    icon: Globe,
    title: 'Cross-Chain Ready',
    description: 'Privacy across multiple chains',
    details: 'Future-proof architecture for Bitcoin, Ethereum, and beyond.',
    gradient: 'from-primary to-secondary',
    stats: '3+ chains planned'
  }
];

const metrics = [
  { id: 'unlinkability', label: 'Unlinkability', max: 100 },
  { id: 'speed', label: 'Speed', max: 10 },
  { id: 'cost', label: 'Cost Efficiency', max: 10 },
  { id: 'security', label: 'Security', max: 100 }
];

const levels = [
  { name: 'Standard', color: 'bg-primary', values: [85, 9, 8, 90] },
  { name: 'High', color: 'bg-secondary', values: [95, 7, 7, 95] },
  { name: 'Maximum', color: 'bg-glow-green', values: [99, 5, 6, 99] }
];

function PrivacyComparison() {
  const [selectedMetric, setSelectedMetric] = useState('unlinkability');

  return (
    <div className="glass-strong rounded-2xl p-6">
      <div className="flex flex-wrap gap-3 mb-6">
        {metrics.map((metric) => (
          <button
            key={metric.id}
            onClick={() => setSelectedMetric(metric.id)}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedMetric === metric.id
                ? 'bg-gradient-primary text-foreground font-semibold'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {metric.label}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {levels.map((level, index) => {
          const valueIndex = metrics.findIndex(m => m.id === selectedMetric);
          const value = level.values[valueIndex];
          const max = metrics[valueIndex].max;

          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{level.name}</span>
                <span className="text-muted-foreground">{value} / {max}</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(value / max) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: index * 0.15 }}
                  className={`h-full ${level.color} rounded-full`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  return (
    <section id="features" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Enterprise-Grade
              <span className="block text-gradient-primary">
                Privacy Infrastructure
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Built with cutting-edge cryptography and Starknet's scalability
              for institutional-grade privacy.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => setActiveFeature(index)}
              onMouseLeave={() => setActiveFeature(null)}
              className="relative group"
            >
              {/* Hover glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500`} />

              <div className="relative glass h-full rounded-2xl p-6 hover:border-primary/50 transition-colors">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>

                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground mb-4">{feature.description}</p>

                <div className="inline-block px-3 py-1 bg-muted rounded-full text-sm mb-4">
                  {feature.stats}
                </div>

                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: activeFeature === index ? 'auto' : 0,
                    opacity: activeFeature === index ? 1 : 0
                  }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 border-t border-border">
                    <p className="text-muted-foreground text-sm">{feature.details}</p>
                    <button className="mt-3 text-sm text-primary hover:text-primary/80 flex items-center space-x-1">
                      <span>Learn more</span>
                      <span>→</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Privacy Comparison */}
        <div>
          <h3 className="text-3xl font-bold text-center mb-8">
            Compare Privacy Levels
          </h3>
          <PrivacyComparison />
        </div>
      </div>
    </section>
  );
}
