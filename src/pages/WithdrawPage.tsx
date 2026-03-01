import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpFromLine, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { PageHeader, StepIndicator, StatusBadge } from "@/components/ui/page-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useProver } from "@/hooks/useProver";
import { useLocalUtxos } from "@/hooks/useZephyr";
import { useWallet } from "@/contexts/WalletProvider";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const steps = ["Recipient & Amount", "Load Secret", "Build Proof", "Submit Transaction"];

export default function WithdrawPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [recipient, setRecipient] = useState("");
  const [selectedUtxo, setSelectedUtxo] = useState<string | null>(null);
  const utxos = useLocalUtxos().filter((u) => !u.spent);
  const { execute, reset, stage, progress, progressLabel, receipt, error } = useProver();
  const { adjustDemoBalance } = useWallet();
  const { toast } = useToast();

  const chosen = utxos.find((u) => u.id === selectedUtxo);

  const handleStartProving = async () => {
    if (!chosen || !recipient) return;
    setCurrentStep(2);
    const tx = await execute(recipient, chosen);
    if (tx) {
      // Add back to public balance
      const btcAmount = Number(chosen.amount) / 1e8;
      adjustDemoBalance(btcAmount);
      setCurrentStep(3);
      toast({ title: "Withdrawal successful!", description: "Your strkBTC has been unshielded." });
    }
  };

  const totalShielded = utxos.reduce((sum, u) => sum + Number(u.amount), 0) / 1e8;

  return (
    <>
      <PageHeader
        title="Unshield BTC"
        description="Withdraw shielded strkBTC to any address with a ZK proof. No one can link your deposit to this withdrawal."
      />

      <StepIndicator steps={steps} current={currentStep} />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {currentStep === 0 && (
            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center space-x-2">
                  <ArrowUpFromLine className="w-4 h-4 text-accent" />
                  <span>Recipient & Amount</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Recipient Address (Starknet)</label>
                  <Input
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="0x…"
                    className="bg-muted border-border font-mono text-sm"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-muted-foreground">Select Shielded Note</label>
                    <span className="text-xs text-muted-foreground">Total shielded: <span className="font-mono text-foreground">{totalShielded.toFixed(4)}</span> strkBTC</span>
                  </div>
                  {utxos.length === 0 ? (
                    <div className="glass rounded-lg p-4 text-sm text-muted-foreground text-center">
                      No shielded notes found. <Link to="/deposit" className="text-primary hover:underline">Make a deposit first</Link>.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {utxos.map((u) => {
                        const ageHours = Math.round((Date.now() - u.timestamp) / 3600000);
                        const privacyOk = ageHours >= 72;
                        return (
                          <button
                            key={u.id}
                            onClick={() => setSelectedUtxo(u.id)}
                            className={`w-full text-left glass rounded-lg p-3 transition-colors border ${
                              selectedUtxo === u.id ? "border-primary ring-1 ring-primary" : "border-border hover:bg-muted"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="font-mono text-sm font-medium">{(Number(u.amount) / 1e8).toFixed(4)} strkBTC</span>
                                <span className="text-xs text-muted-foreground ml-2">({ageHours}h old)</span>
                              </div>
                              <StatusBadge variant={privacyOk ? "success" : "warning"}>
                                {privacyOk ? "Ready" : `Wait ${72 - ageHours}h`}
                              </StatusBadge>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => setCurrentStep(1)}
                  disabled={!recipient || !selectedUtxo}
                  className="w-full bg-gradient-primary"
                >
                  Continue
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === 1 && (
            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="text-base">Verify Secret</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="glass rounded-lg p-4 text-sm flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    Secret found locally for this note. Your encrypted secret is stored on this device.
                  </p>
                </div>

                <div className="glass rounded-lg p-3 text-xs space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-mono">{chosen ? (Number(chosen.amount) / 1e8).toFixed(4) : "—"} strkBTC</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Recipient</span><span className="font-mono truncate max-w-[200px]">{recipient}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Note ID</span><span className="font-mono truncate max-w-[200px]">{chosen?.id}</span></div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setCurrentStep(0)}>Back</Button>
                  <Button onClick={handleStartProving} className="flex-1 bg-gradient-primary">
                    Generate ZK Proof
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="text-base">Building Proof</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"
                  />
                  <p className="text-sm text-muted-foreground mb-2">{progressLabel || "Initializing…"}</p>
                  <Progress value={progress} className="h-2 max-w-xs mx-auto" />
                  <p className="text-xs text-muted-foreground mt-1">{Math.round(progress)}%</p>
                </div>

                {error && (
                  <div className="glass rounded-lg p-3 text-sm text-destructive border-destructive/30 border">
                    {error}
                    <Button variant="outline" size="sm" className="ml-3" onClick={() => { reset(); setCurrentStep(1); }}>
                      Retry
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && receipt && (
            <Card className="glass border-border">
              <CardContent className="pt-6 text-center space-y-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                  <CheckCircle className="w-16 h-16 text-success mx-auto" />
                </motion.div>
                <h3 className="text-xl font-bold">Withdrawal Successful!</h3>
                <p className="text-sm text-muted-foreground">
                  Your strkBTC has been unshielded and sent to the recipient address.
                </p>
                <div className="glass rounded-lg p-3 text-xs font-mono break-all text-muted-foreground">
                  Tx: {receipt.txHash}
                </div>
                <div className="flex gap-3 justify-center">
                  <Link to="/wallet"><Button variant="outline">View Wallet</Button></Link>
                  <Link to="/activity"><Button className="bg-gradient-primary">View Activity</Button></Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Privacy Reminder Sidebar */}
        <div className="space-y-4">
          <Card className="glass border-border">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center space-x-2 text-sm font-medium">
                <Info className="w-4 h-4 text-info" />
                <span>Privacy Tips</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li>• Use a different recipient address than your deposit address</li>
                <li>• Wait at least 72 hours after depositing</li>
                <li>• Withdraw at a different time of day</li>
                <li>• Use standard amounts (0.1, 0.5, 1.0 BTC)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass border-border">
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <span>Important</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Your ZK proof is generated locally. No server sees your secret or knows which deposit is yours.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
