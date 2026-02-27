import React from "react";
import { motion } from "framer-motion";
import { Shield, ArrowRight, Lock, Eye, Blocks, Zap, ArrowRightLeft } from "lucide-react";
import CountUp from "react-countup";
import { Link } from "react-router-dom";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

function FeatureCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass rounded-2xl p-6 flex flex-col items-start space-y-3"
    >
      <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
        <Icon className="w-5 h-5 text-foreground" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navigation />

      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center pt-20 pb-16 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/15 rounded-full filter blur-[120px] animate-pulse-glow" />
          <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-secondary/15 rounded-full filter blur-[120px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full mb-6"
          >
            <Shield className="w-4 h-4 text-success" />
            <span className="text-sm font-medium">Quantum-Resistant Privacy on Starknet</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-[1.1]"
          >
            Private Bitcoin{" "}
            <span className="text-gradient-primary block sm:inline">on Starknet</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Shield your strkBTC with Zero-Knowledge proofs. Break the on-chain link between
            deposits and withdrawals. Privacy is a right, not a feature.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Link to="/deposit">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-4 bg-gradient-primary rounded-xl font-bold text-lg shadow-glow-blue transition-all inline-flex items-center space-x-2"
              >
                <span>Start Shielding</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link to="/help" className="px-8 py-4 glass rounded-xl font-bold text-lg hover:bg-muted transition-colors text-center">
              How It Works
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {[
              { label: "Total Shielded", value: 847, suffix: " BTC", icon: Zap },
              { label: "Anonymity Set", value: 24300, suffix: "+", icon: Lock },
              { label: "Security Score", value: 99.9, suffix: "%", icon: Shield },
              { label: "Avg. Wait", value: 12, suffix: "h", icon: ArrowRightLeft },
            ].map((s) => (
              <div key={s.label} className="glass p-4 rounded-xl text-center">
                <s.icon className="w-4 h-4 text-primary mx-auto mb-1" />
                <div className="text-sm text-muted-foreground">{s.label}</div>
                <div className="text-xl font-bold">
                  <CountUp end={s.value} suffix={s.suffix} decimals={s.suffix === "%" ? 1 : 0} duration={2} />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why <span className="text-gradient-primary">Zephyr</span>?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={Lock}
              title="Shield your BTC"
              desc="Deposit strkBTC into a shielded pool. Your commitment is stored on-chain; your secret stays on your device."
            />
            <FeatureCard
              icon={Eye}
              title="Withdraw with Unlinkability"
              desc="Generate a ZK-STARK proof and withdraw to any address. No one can link your deposit to your withdrawal."
            />
            <FeatureCard
              icon={Blocks}
              title="DeFi, but Private"
              desc="Use shielded strkBTC as a building block for private swaps, lending, and DAO treasury management."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">How It Works</h2>
          <div className="space-y-6">
            {[
              { step: "1", title: "Deposit", desc: "Approve strkBTC, generate a secret, and deposit into the shielded pool." },
              { step: "2", title: "Wait", desc: "Let time pass. The larger the anonymity set, the stronger your privacy." },
              { step: "3", title: "Withdraw", desc: "Generate a ZK proof that you own a valid commitment, then withdraw to any address." },
              { step: "4", title: "Use in DeFi", desc: "Optionally route your shielded strkBTC into private DeFi integrations." },
            ].map((item) => (
              <div key={item.step} className="glass rounded-xl p-6 flex items-start space-x-4 text-left">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-strong rounded-2xl p-8 lg:p-12">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4 animate-shield-pulse" />
            <h2 className="text-2xl lg:text-3xl font-bold mb-3">Ready to protect your Bitcoin?</h2>
            <p className="text-muted-foreground mb-6">
              Connect your wallet and make your first shielded deposit in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <WalletConnectButton />
              <Link to="/help" className="px-6 py-2.5 glass rounded-xl font-medium hover:bg-muted transition-colors">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
