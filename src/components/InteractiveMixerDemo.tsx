import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Users, 
  Clock, 
  EyeOff,
  ArrowRight,
  Zap,
  Bitcoin
} from 'lucide-react';

const steps = [
  { id: 1, title: 'Deposit', icon: Bitcoin, color: 'text-glow-orange' },
  { id: 2, title: 'Mix', icon: Users, color: 'text-secondary' },
  { id: 3, title: 'Wait', icon: Clock, color: 'text-glow-orange' },
  { id: 4, title: 'Withdraw', icon: EyeOff, color: 'text-glow-green' },
];

const privacyOptions = [
  { id: 'standard', label: 'Standard', delay: '24h', fee: '0.15%' },
  { id: 'high', label: 'High', delay: '72h', fee: '0.10%' },
  { id: 'maximum', label: 'Maximum', delay: '168h', fee: '0.05%' },
];

export default function InteractiveMixerDemo() {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(0.05);
  const [privacyLevel, setPrivacyLevel] = useState('standard');
  const [progress, setProgress] = useState(0);
  const [isMixing, setIsMixing] = useState(false);

  useEffect(() => {
    if (isMixing && progress < 100) {
      const timer = setTimeout(() => {
        setProgress(prev => {
          const next = Math.min(prev + 5, 100);
          if (next >= 25 && next < 50 && step < 2) setStep(2);
          if (next >= 50 && next < 75 && step < 3) setStep(3);
          if (next >= 75 && step < 4) setStep(4);
          return next;
        });
      }, 200);
      return () => clearTimeout(timer);
    }
    if (progress >= 100) {
      setIsMixing(false);
    }
  }, [progress, isMixing, step]);

  const startMixing = () => {
    setIsMixing(true);
    setProgress(0);
    setStep(1);
  };

  const cancelMixing = () => {
    setIsMixing(false);
    setProgress(0);
    setStep(1);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Interactive Demo</h3>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span>Testnet • No Real BTC</span>
        </div>
      </div>

      {/* Step Progress */}
      <div className="mb-8">
        <div className="flex justify-between mb-4">
          {steps.map((s) => (
            <div key={s.id} className="flex flex-col items-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 border-2 transition-colors
                  ${step >= s.id ? 'border-primary bg-primary/20' : 'border-muted bg-muted/20'}`}
              >
                <s.icon className={`w-5 h-5 ${step >= s.id ? s.color : 'text-muted-foreground'}`} />
              </motion.div>
              <span className={`text-xs ${step >= s.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                {s.title}
              </span>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Amount Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3">Amount to Mix</label>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="range"
              min="0.001"
              max="1"
              step="0.001"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              disabled={isMixing}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0.001 BTC</span>
              <span>1 BTC</span>
            </div>
          </div>
          <div className="glass px-4 py-2 rounded-lg min-w-[110px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xl font-bold font-mono">{amount.toFixed(3)}</span>
              <Bitcoin className="w-5 h-5 text-glow-orange" />
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Level Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3">Privacy Level</label>
        <div className="grid grid-cols-3 gap-3">
          {privacyOptions.map((option) => (
            <motion.button
              key={option.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => !isMixing && setPrivacyLevel(option.id)}
              disabled={isMixing}
              className={`p-3 rounded-xl border-2 transition-all ${
                privacyLevel === option.id
                  ? 'border-primary bg-primary/10'
                  : 'border-muted hover:border-muted-foreground'
              } ${isMixing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="text-center">
                <div className="font-semibold text-sm">{option.label}</div>
                <div className="text-xs text-muted-foreground">{option.delay}</div>
                <div className="text-xs text-glow-green mt-1">Fee: {option.fee}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Live Mixing Visualization */}
      <AnimatePresence>
        {isMixing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="glass p-4 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Mixing in Progress</span>
                <span className="text-sm text-primary">{progress}%</span>
              </div>

              <div className="flex items-center justify-center gap-3">
                {/* Source */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 glass rounded-full flex items-center justify-center">
                    <Bitcoin className="w-5 h-5 text-glow-orange" />
                  </div>
                  <div className="text-xs mt-1 text-muted-foreground">Source</div>
                  <div className="text-xs font-mono bg-muted px-2 py-0.5 rounded mt-1">1A1z...e8f</div>
                </div>

                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                >
                  <ArrowRight className="w-5 h-5 text-primary" />
                </motion.div>

                {/* Mixing Pool */}
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    className="w-14 h-14 bg-gradient-primary rounded-full flex items-center justify-center"
                  >
                    <Users className="w-7 h-7" />
                  </motion.div>
                  <div className="absolute -top-1 -right-1 bg-glow-green text-xs rounded-full px-1.5 py-0.5 font-semibold">
                    {Math.floor(Math.random() * 500) + 1000}
                  </div>
                </div>

                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.5 }}
                >
                  <ArrowRight className="w-5 h-5 text-primary" />
                </motion.div>

                {/* Destination */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 glass rounded-full flex items-center justify-center">
                    <EyeOff className="w-5 h-5 text-glow-green" />
                  </div>
                  <div className="text-xs mt-1 text-muted-foreground">Destination</div>
                  <div className="text-xs font-mono bg-muted px-2 py-0.5 rounded mt-1">bc1q...xyz</div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Zap className="w-4 h-4 text-glow-orange animate-pulse" />
                <span>Generating ZK Proofs...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: isMixing ? 1 : 1.02 }}
          whileTap={{ scale: isMixing ? 1 : 0.98 }}
          onClick={startMixing}
          disabled={isMixing}
          className={`flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
            ${isMixing
              ? 'bg-muted cursor-not-allowed'
              : 'bg-gradient-primary shadow-glow-blue hover:shadow-glow-purple'
            }`}
        >
          {isMixing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-5 h-5 border-2 border-foreground border-t-transparent rounded-full"
              />
              <span>Mixing...</span>
            </>
          ) : (
            <>
              <Shield className="w-5 h-5" />
              <span>Start Private Mixing</span>
            </>
          )}
        </motion.button>

        {isMixing && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={cancelMixing}
            className="px-5 py-3.5 bg-destructive/20 border border-destructive rounded-xl font-bold hover:bg-destructive/30 transition-colors"
          >
            Cancel
          </motion.button>
        )}
      </div>

      {/* Privacy Metrics */}
      <div className="mt-6 pt-5 border-t border-border">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-lg font-bold text-glow-green">99.9%</div>
            <div className="text-xs text-muted-foreground">Unlinkability</div>
          </div>
          <div>
            <div className="text-lg font-bold text-primary">ZK-STARK</div>
            <div className="text-xs text-muted-foreground">Technology</div>
          </div>
          <div>
            <div className="text-lg font-bold text-secondary">Non-custodial</div>
            <div className="text-xs text-muted-foreground">Your keys</div>
          </div>
        </div>
      </div>
    </div>
  );
}
