import React from "react";
import { BookOpen, Code, Box, Shield, Link as LinkIcon, Copy } from "lucide-react";
import { PageHeader } from "@/components/ui/page-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

function CodeBlock({ code, lang = "typescript" }: { code: string; lang?: string }) {
  const { toast } = useToast();
  return (
    <div className="relative">
      <pre className="bg-muted rounded-lg p-4 text-xs font-mono overflow-x-auto whitespace-pre leading-relaxed">
        <code>{code}</code>
      </pre>
      <button
        onClick={() => { navigator.clipboard.writeText(code); toast({ title: "Copied!" }); }}
        className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-border transition-colors"
      >
        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
    </div>
  );
}

export default function DocsPage() {
  return (
    <>
      <PageHeader
        title="Developer Docs"
        description="Technical overview, SDK reference, and integration guides for Zephyr Protocol."
      />

      <div className="space-y-6 max-w-3xl">
        {/* Quickstart */}
        <Card className="glass border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Code className="w-4 h-4 text-primary" />
              <span>Quickstart</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CodeBlock code={`import { deposit, prepareWithdraw, proveWithdraw, submitWithdraw } from '@/lib/zephyr-sdk';

// Deposit 0.1 BTC
const receipt = await deposit(10000000n, 'my-passphrase');
console.log('Deposit tx:', receipt.txHash);

// Withdraw
const utxo = listLocalUtxos().find(u => !u.spent);
const job = await prepareWithdraw(recipientAddress, utxo);
const proof = await proveWithdraw(job, (pct, stage) => {
  console.log(\`\${stage}: \${pct}%\`);
});
const withdrawReceipt = await submitWithdraw(proof, BigInt(utxo.amount));`} />
          </CardContent>
        </Card>

        {/* Architecture */}
        <Card className="glass border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Box className="w-4 h-4 text-accent" />
              <span>Architecture</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="glass rounded-lg p-4 text-sm font-mono text-center space-y-2">
              <div className="flex items-center justify-center space-x-3 flex-wrap gap-y-2">
                <span className="px-3 py-1 bg-primary/20 rounded-lg">Wallet</span>
                <span className="text-muted-foreground">→</span>
                <span className="px-3 py-1 bg-accent/20 rounded-lg">Zephyr SDK</span>
                <span className="text-muted-foreground">→</span>
                <span className="px-3 py-1 bg-secondary/20 rounded-lg">Contracts</span>
              </div>
              <div className="flex items-center justify-center space-x-3 flex-wrap gap-y-2">
                <span className="px-3 py-1 bg-muted rounded-lg">Merkle Indexer</span>
                <span className="text-muted-foreground">↔</span>
                <span className="px-3 py-1 bg-muted rounded-lg">STWO Prover</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contract References */}
        <Card className="glass border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <LinkIcon className="w-4 h-4 text-info" />
              <span>Contract References</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              { name: "ZephyrMixer", env: "VITE_MIXER_CONTRACT" },
              { name: "ZephyrVerifier", env: "VITE_VERIFIER_CONTRACT" },
              { name: "ZephyrMerkleTree", env: "VITE_MERKLE_CONTRACT" },
            ].map((c) => (
              <div key={c.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="font-medium">{c.name}</span>
                <code className="text-xs text-muted-foreground font-mono">{c.env}</code>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="glass border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Shield className="w-4 h-4 text-success" />
              <span>Security & Audits</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Zephyr Protocol's smart contracts are designed to be formally verified and audited.</p>
            <ul className="list-disc list-inside space-y-1">
              <li>ZK proofs verified on-chain via STWO verifier</li>
              <li>Nullifiers prevent double-spending</li>
              <li>Incremental Merkle tree with root history ring buffer</li>
              <li>All secrets are client-side only — no server stores private data</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
