import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Code,
  Terminal,
  Cpu,
  GitBranch,
  Package,
  Zap,
  Copy,
  Check
} from 'lucide-react';

const codeExamples = [
  {
    language: 'typescript',
    title: 'TypeScript SDK',
    code: `import { ZKBTCMixerSDK } from '@zkbtcmixer/sdk';

const mixer = new ZKBTCMixerSDK(
  '0x123...abc', // Mixer contract address
  provider
);

// Deposit with privacy settings
const deposit = await mixer.deposit({
  amount: '1.0',      // Amount in BTC
  privacyLevel: 'high', // 72h delay
});

// Generate ZK proof and withdraw
const withdrawal = await mixer.withdraw({
  secret: deposit.secret,
  recipient: '0x789...def',
  amount: '1.0'
});

console.log('TX Hash:', withdrawal.txHash);`
  },
  {
    language: 'cairo',
    title: 'Cairo Contract',
    code: `#[contract]
mod ZKBTCMixer {
    use starknet::ContractAddress;
    
    #[storage]
    struct Storage {
        merkle_root: felt252,
        nullifiers: LegacyMap<felt252, bool>,
    }

    #[external(v0)]
    fn deposit(
        ref self: ContractState,
        commitment: felt252,
        amount: u256
    ) -> felt252 {
        // Add commitment to Merkle tree
        let new_root = self._insert(commitment);
        self.merkle_root.write(new_root);
        
        // Transfer BTC from user
        self._transfer_from(caller, amount);
        
        self.emit(Deposit { commitment, amount });
        new_root
    }
}`
  },
  {
    language: 'bash',
    title: 'CLI Commands',
    code: `# Install the ZK-BTC Mixer SDK
npm install @zkbtcmixer/sdk starknet

# Configure environment
export STARKNET_RPC="https://starknet-mainnet.rpc.io"
export MIXER_CONTRACT="0x123...abc"

# Generate a new commitment
npx zkbtcmixer generate-commitment

# Deposit to the mixer
npx zkbtcmixer deposit \\
  --amount 0.5 \\
  --privacy-level high

# Withdraw after delay
npx zkbtcmixer withdraw \\
  --secret ./secret.json \\
  --recipient 0x789...def`
  }
];

const frameworks = [
  { name: 'Next.js', icon: '⚡' },
  { name: 'Hardhat', icon: '🛠️' },
  { name: 'Foundry', icon: '🔧' },
  { name: 'Vite', icon: '🚀' },
  { name: 'Remix', icon: '🌐' },
  { name: 'Wagmi', icon: '🔌' }
];

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

function FeatureCard({ icon, title, description, gradient }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex items-start space-x-4 p-4 glass rounded-xl"
    >
      <div className={`p-2 rounded-lg bg-gradient-to-r ${gradient} flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <h4 className="font-bold mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}

export default function IntegrationSection() {
  const [copied, setCopied] = useState(false);
  const [activeExample, setActiveExample] = useState(0);

  const copyCode = () => {
    navigator.clipboard.writeText(codeExamples[activeExample].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="docs" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Developer
              <span className="block text-gradient-primary">
                Integration
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Easy-to-use SDKs, comprehensive documentation, and battle-tested examples
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Code Examples */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-6">Code Examples</h3>

            {/* Language Tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              {codeExamples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setActiveExample(index)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeExample === index
                      ? 'bg-gradient-primary text-foreground'
                      : 'glass hover:bg-muted'
                  }`}
                >
                  {example.title}
                </button>
              ))}
            </div>

            {/* Code Editor */}
            <div className="glass-strong rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground font-mono">
                    {codeExamples[activeExample].language}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copyCode}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-glow-green" />
                      <span className="text-glow-green">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </motion.button>
              </div>

              <div className="p-4 overflow-x-auto max-h-[400px] overflow-y-auto">
                <pre className="text-sm font-mono">
                  <code className="text-glow-green whitespace-pre">
                    {codeExamples[activeExample].code}
                  </code>
                </pre>
              </div>
            </div>
          </motion.div>

          {/* SDK Features */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-6">SDK Features</h3>

            <div className="space-y-4 mb-8">
              <FeatureCard
                icon={<Code className="w-5 h-5" />}
                title="TypeScript SDK"
                description="Full TypeScript support with comprehensive type definitions"
                gradient="from-primary to-accent"
              />
              <FeatureCard
                icon={<Cpu className="w-5 h-5" />}
                title="WASM Proof Generation"
                description="WebAssembly-based proof generation in browser"
                gradient="from-secondary to-glow-pink"
              />
              <FeatureCard
                icon={<GitBranch className="w-5 h-5" />}
                title="GitHub Actions"
                description="Pre-built CI/CD workflows for automated testing"
                gradient="from-glow-green to-accent"
              />
              <FeatureCard
                icon={<Package className="w-5 h-5" />}
                title="Package Managers"
                description="Support for npm, yarn, pnpm, and bun"
                gradient="from-glow-orange to-destructive"
              />
            </div>

            {/* Framework Support */}
            <div>
              <h4 className="font-bold mb-4">Framework Support</h4>
              <div className="grid grid-cols-3 gap-3">
                {frameworks.map((framework, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className="glass rounded-lg p-3 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <div className="text-2xl mb-1">{framework.icon}</div>
                    <div className="text-sm font-medium">{framework.name}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Start */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-strong rounded-2xl p-8 text-center"
        >
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Get Started in 5 Minutes</h3>
            <p className="text-muted-foreground mb-6">
              Install the SDK and run your first private transaction
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-primary rounded-xl font-bold shadow-glow-blue hover:shadow-glow-purple transition-shadow"
              >
                📚 Documentation
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 glass rounded-xl font-bold hover:bg-muted transition-colors flex items-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Try in CodeSandbox
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
