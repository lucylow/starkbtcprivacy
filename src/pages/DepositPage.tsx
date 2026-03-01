import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownToLine, Info, CheckCircle } from "lucide-react";
import { PageHeader, StepIndicator, InfoTooltip } from "@/components/ui/page-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useDeposit } from "@/hooks/useZephyr";
import { useWallet } from "@/contexts/WalletProvider";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const steps = ["Amount", "Secret & Backup", "Approve & Deposit", "Confirmation"];

export default function DepositPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [amountBtc, setAmountBtc] = useState("0.1");
  const [passphrase, setPassphrase] = useState("");
  const { execute, isDepositing, step, receipt, error } = useDeposit();
  const { status, adjustDemoBalance } = useWallet();
  const { toast } = useToast();

  const amountSats = BigInt(Math.round(parseFloat(amountBtc || "0") * 1e8));
  const publicBal = parseFloat(status.publicBalance || "0");
  const amountNum = parseFloat(amountBtc || "0");
  const insufficientBalance = status.isConnected && amountNum > publicBal;

  const handleGenerateSecret = () => {
    if (!passphrase || passphrase.length < 6) {
      toast({ variant: "destructive", title: "Passphrase too short", description: "Use at least 6 characters." });
      return;
    }
    setCurrentStep(2);
  };

  const handleDeposit = async () => {
    const tx = await execute(amountSats, passphrase);
    if (tx) {
      // Deduct from demo public balance
      adjustDemoBalance(-amountNum);
      setCurrentStep(3);
      toast({ title: "Deposit successful!", description: "Your BTC is now shielded." });
    }
  };

  return (
    <>
      <PageHeader
        title="Shield BTC"
        description="Convert public strkBTC to shielded strkBTC. Your secret stays on your device."
      />

      <StepIndicator steps={steps} current={currentStep} />

      {currentStep === 0 && (
        <Card className="glass border-border max-w-lg">
          <CardHeader>
            <CardTitle className="text-base flex items-center space-x-2">
              <ArrowDownToLine className="w-4 h-4 text-primary" />
              <span>Choose Amount</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {status.isConnected && (
              <div className="text-xs text-muted-foreground">
                Available: <span className="font-mono font-medium text-foreground">{status.publicBalance} strkBTC</span>
              </div>
            )}
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Amount (strkBTC)</label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                max="10"
                value={amountBtc}
                onChange={(e) => setAmountBtc(e.target.value)}
                className="bg-muted border-border text-lg font-mono"
                placeholder="0.1"
              />
              {insufficientBalance && (
                <p className="text-xs text-destructive mt-1">Insufficient balance</p>
              )}
            </div>

            <div className="flex gap-2">
              {["0.01", "0.1", "0.5", "1.0"].map((v) => (
                <button
                  key={v}
                  onClick={() => setAmountBtc(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    amountBtc === v ? "bg-primary text-primary-foreground border-primary" : "glass border-border hover:bg-muted"
                  }`}
                >
                  {v} BTC
                </button>
              ))}
              {status.isConnected && publicBal > 0 && (
                <button
                  onClick={() => setAmountBtc(publicBal.toFixed(4))}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-btc-orange/50 text-btc-orange hover:bg-btc-orange/10 transition-colors"
                >
                  MAX
                </button>
              )}
            </div>

            <div className="glass rounded-lg p-3 text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between"><span>Estimated fee</span><span>~0.0001 strkBTC</span></div>
              <div className="flex justify-between"><span>You receive (shielded)</span><span className="text-foreground font-medium">{amountBtc} strkBTC</span></div>
              <div className="flex justify-between">
                <span>Recommended wait <InfoTooltip text="Waiting longer before withdrawing increases your privacy by letting more deposits enter the pool." /></span>
                <span className="text-success">72h (Good)</span>
              </div>
            </div>

            <Button onClick={() => setCurrentStep(1)} className="w-full bg-gradient-primary" disabled={insufficientBalance || amountNum <= 0}>
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStep === 1 && (
        <Card className="glass border-border max-w-lg">
          <CardHeader>
            <CardTitle className="text-base">Secret & Backup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="glass rounded-lg p-4 text-sm">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">
                  A 32-byte secret will be generated and encrypted with your passphrase.
                  <strong className="text-foreground"> This secret is essential for withdrawing.</strong>{" "}
                  Store your passphrase safely.
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Passphrase (min 6 chars)</label>
              <Input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Enter a strong passphrase"
                className="bg-muted border-border"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep(0)}>Back</Button>
              <Button onClick={handleGenerateSecret} className="flex-1 bg-gradient-primary">
                Generate Secret & Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card className="glass border-border max-w-lg">
          <CardHeader>
            <CardTitle className="text-base">Approve & Deposit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="glass rounded-lg p-4 text-sm space-y-2">
              <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-mono">{amountBtc} strkBTC</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Fee</span><span className="font-mono">~0.0001 strkBTC</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Remaining public balance</span><span className="font-mono">{Math.max(0, publicBal - amountNum).toFixed(4)} strkBTC</span></div>
            </div>

            {isDepositing && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">{step}</div>
                <Progress value={step.includes("Approving") ? 50 : step.includes("Submitting") ? 80 : 30} className="h-2" />
              </div>
            )}

            {error && (
              <div className="glass rounded-lg p-3 text-sm text-destructive border-destructive/30 border">{error}</div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep(1)} disabled={isDepositing}>Back</Button>
              <Button onClick={handleDeposit} disabled={isDepositing} className="flex-1 bg-gradient-primary">
                {isDepositing ? "Processing…" : "Submit Deposit"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && receipt && (
        <Card className="glass border-border max-w-lg">
          <CardContent className="pt-6 text-center space-y-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
              <CheckCircle className="w-16 h-16 text-success mx-auto" />
            </motion.div>
            <h3 className="text-xl font-bold">Deposit Successful!</h3>
            <p className="text-sm text-muted-foreground">
              Your {amountBtc} strkBTC is now shielded. Consider waiting 72+ hours before withdrawing for maximum privacy.
            </p>
            <div className="glass rounded-lg p-3 text-xs font-mono break-all text-muted-foreground">
              Tx: {receipt.txHash}
            </div>
            <div className="flex gap-3 justify-center">
              <Link to="/wallet"><Button variant="outline">View Wallet</Button></Link>
              <Link to="/withdraw"><Button className="bg-gradient-primary">Withdraw</Button></Link>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
