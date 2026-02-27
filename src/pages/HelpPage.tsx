import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, Rocket, BookOpen, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const faqs = [
  {
    q: "Is this legal?",
    a: "Zephyr Protocol is a privacy tool built on open-source technology. Financial privacy is a fundamental right. We encourage compliance with local regulations. Zephyr is designed for legitimate privacy, not illicit activity.",
  },
  {
    q: "What happens if I lose my secret?",
    a: "Your secret is the only way to prove ownership of shielded funds. If you lose it, your funds cannot be recovered by anyone — that's the nature of trustless privacy. Always back up your encrypted secret file and remember your passphrase.",
  },
  {
    q: "How private is this really?",
    a: "Very. Your deposit and withdrawal are cryptographically unlinkable thanks to Zero-Knowledge proofs. No one — not even us — can determine which deposit corresponds to which withdrawal. The larger the anonymity set, the stronger your privacy.",
  },
  {
    q: "What wallets are supported?",
    a: "Zephyr works with any Starknet wallet, including Argent and Braavos. Simply connect your wallet to get started.",
  },
  {
    q: "What is strkBTC?",
    a: "strkBTC is Bitcoin bridged to Starknet. It's an ERC-20 token on Starknet that represents BTC 1:1. Zephyr shields strkBTC to make your Bitcoin transactions private on Starknet.",
  },
  {
    q: "How long should I wait before withdrawing?",
    a: "We recommend waiting at least 72 hours for good privacy. 168 hours (7 days) provides maximum privacy. The longer you wait, the more deposits enter the pool, making your transaction harder to trace.",
  },
];

const glossary = [
  { term: "Commitment", def: "A cryptographic hash of your secret and amount. Stored on-chain but reveals nothing about your identity." },
  { term: "Nullifier", def: "A unique value derived from your secret, used to prevent spending the same deposit twice." },
  { term: "Merkle Tree", def: "A data structure that efficiently proves a commitment exists in the pool without revealing which one." },
  { term: "Anonymity Set", def: "The group of deposits that are indistinguishable from each other. Larger = more private." },
  { term: "Shielded", def: "Funds that have been deposited into the privacy pool and are no longer linked to any public address." },
  { term: "ZK-STARK", def: "Zero-Knowledge Scalable Transparent Argument of Knowledge — a proof system that is quantum-resistant." },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full text-left glass rounded-lg p-4 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium pr-4">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      </div>
      {open && <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{a}</p>}
    </button>
  );
}

export default function HelpPage() {
  return (
    <>
      <PageHeader
        title="Help & Onboarding"
        description="Everything you need to get started with shielded strkBTC."
      />

      {/* Onboarding */}
      <Card className="glass border-border mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center space-x-2">
            <Rocket className="w-4 h-4 text-primary" />
            <span>Getting Started</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { step: "1", title: "Connect your wallet", desc: "Click 'Connect Wallet' in the top right. We support Argent, Braavos, and other Starknet wallets." },
              { step: "2", title: "Deposit a small test amount", desc: "Go to the Deposit page and shield a small amount of strkBTC (e.g., 0.01). Set a passphrase and save your backup." },
              { step: "3", title: "Wait for privacy", desc: "The longer you wait, the better your privacy. Check the Privacy page to see your privacy score improve over time." },
              { step: "4", title: "Withdraw to a fresh address", desc: "Go to Withdraw, select your shielded note, enter a recipient address, and generate a ZK proof. Your withdrawal is unlinkable to your deposit." },
            ].map((item) => (
              <div key={item.step} className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h4 className="text-sm font-medium">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4 flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-accent" />
          <span>Frequently Asked Questions</span>
        </h2>
        <div className="space-y-2">
          {faqs.map((faq) => <FaqItem key={faq.q} q={faq.q} a={faq.a} />)}
        </div>
      </div>

      {/* Glossary */}
      <Card className="glass border-border mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-info" />
            <span>Glossary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {glossary.map((g) => (
              <div key={g.term} className="py-2.5">
                <dt className="text-sm font-medium">{g.term}</dt>
                <dd className="text-xs text-muted-foreground mt-0.5">{g.def}</dd>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card className="glass border-border">
        <CardContent className="pt-4 flex items-start space-x-3">
          <MessageCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium mb-1">Need more help?</h4>
            <p className="text-xs text-muted-foreground">
              Join our community on Discord or open an issue on GitHub. We're here to help you
              protect your financial privacy.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
