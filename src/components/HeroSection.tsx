import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Lock, ArrowRightLeft } from 'lucide-react';
import CountUp from 'react-countup';
import InteractiveMixerDemo from './InteractiveMixerDemo';
import NetworkVisualizer from './NetworkVisualizer';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  subtext: string;
}

function StatCard({ icon, label, value, subtext }: StatCardProps) {
  return (
    <div className="glass p-4 rounded-xl">
      <div className="flex items-center space-x-2 mb-2">
        <div className="text-primary">{icon}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-glow-green mt-1">{subtext}</div>
    </div>
  );
}

export default function HeroSection() {
  const [stats, setStats] = useState({
    totalMixed: 847.5,
    anonymitySet: 12.4,
    avgDelay: 12.5,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        totalMixed: prev.totalMixed + Math.random() * 0.3,
        anonymitySet: prev.anonymitySet + Math.random() * 0.1,
        avgDelay: 12 + Math.random() * 2,
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen pt-24 pb-16 px-4 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/20 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse-glow" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-secondary/20 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full mix-blend-multiply filter blur-[150px] animate-pulse-glow" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full mb-6"
            >
              <Shield className="w-4 h-4 text-glow-green" />
              <span className="text-sm font-medium">
                Quantum-Resistant Privacy • Starknet Mainnet
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1]">
              Private Bitcoin
              <span className="block text-gradient-primary">
                On Starknet
              </span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-xl leading-relaxed">
              Break the on-chain link between your Bitcoin deposits and withdrawals
              using Zero-Knowledge proofs. Quantum-resistant privacy for BTC DeFi.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px -10px hsl(217 91% 60% / 0.8)' }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-primary rounded-xl font-bold text-lg shadow-glow-blue transition-all"
              >
                Start Mixing
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 glass rounded-xl font-bold text-lg hover:bg-muted transition-colors"
              >
                Watch Demo
              </motion.button>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={<Zap className="w-5 h-5" />}
                label="Total Mixed"
                value={<CountUp end={stats.totalMixed} suffix=" BTC" decimals={1} duration={2} />}
                subtext="+2.4% today"
              />
              <StatCard
                icon={<Lock className="w-5 h-5" />}
                label="Anonymity Set"
                value={<CountUp end={stats.anonymitySet} suffix="k+" decimals={1} duration={2} />}
                subtext="Active users"
              />
              <StatCard
                icon={<Shield className="w-5 h-5" />}
                label="Security Score"
                value="99.9%"
                subtext="Audited"
              />
              <StatCard
                icon={<ArrowRightLeft className="w-5 h-5" />}
                label="Avg. Delay"
                value={<CountUp end={stats.avgDelay} suffix="h" decimals={1} duration={2} />}
                subtext="For full privacy"
              />
            </div>
          </motion.div>

          {/* Right Column - Interactive Demo */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Network Visualization Background */}
            <div className="absolute inset-0 -z-10 scale-150">
              <NetworkVisualizer />
            </div>

            {/* Interactive Mixer Demo */}
            <div className="glass-strong rounded-2xl shadow-2xl">
              <InteractiveMixerDemo />
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute -top-4 -left-4 bg-gradient-secondary w-12 h-12 rounded-2xl flex items-center justify-center shadow-glow-cyan"
            >
              <Lock className="w-6 h-6" />
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 3, delay: 1.5 }}
              className="absolute -bottom-4 -right-4 bg-gradient-primary w-12 h-12 rounded-2xl flex items-center justify-center shadow-glow-purple"
            >
              <Shield className="w-6 h-6" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
