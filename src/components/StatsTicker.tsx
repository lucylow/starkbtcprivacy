import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Users, Shield, Zap } from 'lucide-react';

const stats = [
  { label: 'Total Value Mixed', value: '$42.7M', change: '+2.4%', icon: TrendingUp },
  { label: 'Active Users', value: '15,824', change: '+124', icon: Users },
  { label: 'Anonymity Set', value: '10.2K', change: '+256', icon: Shield },
  { label: 'Avg. Mix Time', value: '12.4h', change: '-0.8h', icon: Zap }
];

export default function StatsTicker() {
  const [currentStat, setCurrentStat] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = stats[currentStat].icon;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-10" aria-label="Live mixer statistics">
          <div className="flex items-center space-x-6">
            <span className="text-xs font-medium text-muted-foreground hidden sm:block">
              Live Stats:
            </span>

            <div
              className="flex items-center"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStat}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center space-x-3"
                >
                  <CurrentIcon className="w-4 h-4 text-primary" />
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm">{stats[currentStat].value}</span>
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {stats[currentStat].label}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      stats[currentStat].change.startsWith('+')
                        ? 'text-glow-green'
                        : 'text-glow-orange'
                    }`}
                  >
                    {stats[currentStat].change}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-glow-green rounded-full animate-pulse" />
              <span className="text-muted-foreground hidden md:inline">System Operational</span>
            </div>
            <span className="text-muted-foreground hidden lg:inline">
              Starknet Mainnet • v2.1.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
