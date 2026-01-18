import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload,
  Users,
  Clock,
  Download,
  CheckCircle,
  Key,
  Hash,
  ShieldCheck,
  Bitcoin
} from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Deposit',
    description: 'Send BTC to the mixer with a ZK commitment',
    icon: Upload,
    gradient: 'from-glow-green to-accent',
    details: {
      title: 'Commitment Generation',
      points: [
        'Generate a secret random number',
        'Create nullifier to prevent double-spends',
        'Compute commitment hash',
        'Deposit BTC with commitment'
      ],
      code: `// Generate commitment
const secret = randomBytes(32);
const nullifier = poseidonHash(secret);
const commitment = poseidonHash(nullifier, amount);`
    }
  },
  {
    id: 2,
    title: 'Mix',
    description: 'Join anonymity set with thousands of users',
    icon: Users,
    gradient: 'from-primary to-accent',
    details: {
      title: 'Anonymity Pool',
      points: [
        'Commitment added to Merkle tree',
        'Join pool of 10,000+ users',
        'Automatic amount mixing',
        'Time decoupling'
      ],
      code: `// Add to Merkle tree
tree.insert(commitment);
const root = tree.getRoot();
const proof = tree.getProof(index);`
    }
  },
  {
    id: 3,
    title: 'Wait',
    description: 'Optional delay period for enhanced privacy',
    icon: Clock,
    gradient: 'from-secondary to-glow-pink',
    details: {
      title: 'Timing Obfuscation',
      points: [
        'Standard: 24h (1,000+ users)',
        'High: 72h (10,000+ users)',
        'Maximum: 168h (100,000+ users)',
        'Random ±20% delay variation'
      ],
      code: `// Wait period verification
const minDelay = 24 * 60 * 60; // 24h
assert(currentTime - depositTime >= minDelay);`
    }
  },
  {
    id: 4,
    title: 'Withdraw',
    description: 'Generate ZK proof and receive clean BTC',
    icon: Download,
    gradient: 'from-glow-orange to-destructive',
    details: {
      title: 'ZK Proof Generation',
      points: [
        'Prove knowledge of secret',
        'Prove commitment in Merkle tree',
        'Prove nullifier not used',
        'Receive BTC to any address'
      ],
      code: `// Generate withdrawal proof
const zkProof = generateProof({
  secret,
  nullifier,
  root,
  recipient,
  amount
});`
    }
  }
];

interface ProofStepProps {
  label: string;
  value: string;
  verified: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

function ProofStep({ label, value, verified, icon: Icon }: ProofStepProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex items-center justify-between p-3 glass rounded-lg"
    >
      <div className="flex items-center space-x-3">
        <Icon className={`w-4 h-4 ${verified ? 'text-glow-green' : 'text-muted-foreground'}`} />
        <span className={`text-sm ${verified ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
      </div>
      <div className={`font-mono text-xs ${verified ? 'text-glow-green' : 'text-muted-foreground'}`}>
        {value}
      </div>
    </motion.div>
  );
}

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <section id="how-it-works" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              How
              <span className="block text-gradient-secondary">
                Zero-Knowledge Privacy Works
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A simple 4-step process for complete financial privacy
            </p>
          </motion.div>
        </div>

        <div className="relative">
          {/* Progress Line */}
          <div className="hidden md:block absolute left-0 right-0 top-6 h-0.5 bg-muted">
            <motion.div
              className="h-full bg-gradient-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Steps */}
          <div className="relative flex flex-col md:flex-row justify-between mb-12 gap-8 md:gap-0">
            {steps.map((step, index) => (
              <motion.button
                key={step.id}
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActiveStep(index)}
                className="flex flex-col items-center cursor-pointer group"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 border-2 transition-all
                  ${index <= activeStep
                    ? `bg-gradient-to-r ${step.gradient} border-transparent shadow-lg`
                    : 'bg-muted border-border group-hover:border-muted-foreground'
                  }`}
                >
                  <step.icon className={`w-5 h-5 ${index <= activeStep ? 'text-foreground' : 'text-muted-foreground'}`} />
                </div>
                <span className={`font-medium transition-colors ${index <= activeStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.title}
                </span>
                {index === activeStep && (
                  <motion.div
                    layoutId="activeStep"
                    className="absolute bottom-0 w-20 h-1 bg-gradient-primary rounded-full"
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-strong rounded-2xl p-8"
            >
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left: Description */}
                <div>
                  <div className="flex items-center space-x-4 mb-6">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${steps[activeStep].gradient}`}>
                      {React.createElement(steps[activeStep].icon, { className: 'w-6 h-6' })}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{steps[activeStep].title}</h3>
                      <p className="text-muted-foreground">{steps[activeStep].description}</p>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {steps[activeStep].details.points.map((point, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-3"
                      >
                        <CheckCircle className="w-5 h-5 text-glow-green flex-shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </motion.li>
                    ))}
                  </ul>

                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-primary hover:text-primary/80 flex items-center space-x-2 transition-colors"
                  >
                    <span>{showDetails ? 'Hide' : 'Show'} Technical Details</span>
                    <motion.span animate={{ rotate: showDetails ? 180 : 0 }}>↓</motion.span>
                  </button>
                </div>

                {/* Right: Interactive Diagram */}
                <div className="relative">
                  <div className="glass rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Key className="w-5 h-5 text-glow-orange" />
                        <span className="font-mono text-sm">ZK Proof Generation</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ShieldCheck className="w-5 h-5 text-glow-green" />
                        <span className="text-sm text-glow-green">Verified</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <ProofStep
                        label="Secret Input"
                        value="••••••••••••••••"
                        verified={activeStep >= 0}
                        icon={Key}
                      />
                      <ProofStep
                        label="Merkle Proof"
                        value={`Path length: ${activeStep * 5 + 3}`}
                        verified={activeStep >= 1}
                        icon={Hash}
                      />
                      <ProofStep
                        label="Nullifier Check"
                        value="Not spent ✓"
                        verified={activeStep >= 2}
                        icon={ShieldCheck}
                      />
                      <ProofStep
                        label="Amount Range"
                        value="Valid ✓"
                        verified={activeStep >= 3}
                        icon={CheckCircle}
                      />
                    </div>

                    <div className="mt-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Proof Completion</span>
                        <span>{Math.floor((activeStep + 1) * 25)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${(activeStep + 1) * 25}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  </div>

                  {activeStep === 3 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-3 -right-3 bg-gradient-accent text-background px-4 py-2 rounded-full font-bold shadow-lg"
                    >
                      Complete! 🎉
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Technical Details */}
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 overflow-hidden"
                  >
                    <div className="pt-6 border-t border-border">
                      <h4 className="text-lg font-bold mb-4">
                        {steps[activeStep].details.title}
                      </h4>
                      <div className="bg-background rounded-xl p-4 overflow-x-auto">
                        <pre className="text-glow-green text-sm font-mono">
                          <code>{steps[activeStep].details.code}</code>
                        </pre>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeStep === 0
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'glass hover:bg-muted'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
              disabled={activeStep === steps.length - 1}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeStep === steps.length - 1
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-gradient-primary hover:shadow-glow-blue'
              }`}
            >
              {activeStep === steps.length - 1 ? 'Complete!' : 'Next Step'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
