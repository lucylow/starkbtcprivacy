import React from "react";
import { Link } from "react-router-dom";
import { Wallet as WalletIcon, Shield, ArrowRight, Activity, Coins, TrendingUp, Copy, CheckCircle } from "lucide-react";
import { PageHeader, StatusBadge, InfoTooltip } from "@/components/ui/page-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useShieldedBalance, useAnonymitySet, useActivityLog } from "@/hooks/useZephyr";
import { useWallet } from "@/contexts/WalletProvider";
import { useToast } from "@/hooks/use-toast";

export default function WalletPage() {
  const { data: balance } = useShieldedBalance();
  const { data: anonymity } = useAnonymitySet();
  const activity = useActivityLog();
  const { status } = useWallet();
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const privacyLevel = anonymity
    ? anonymity.poolSize > 20000 ? "Excellent" : anonymity.poolSize > 5000 ? "Good" : "Low"
    : "—";
  const privacyVariant = privacyLevel === "Excellent" ? "success" : privacyLevel === "Good" ? "warning" : "error";

  const handleCopyAddress = () => {
    if (status.address) {
      navigator.clipboard.writeText(status.address);
      setCopied(true);
      toast({ title: "Address copied" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const totalShielded = balance && balance.utxoCount > 0
    ? ((balance.estimatedLow + balance.estimatedHigh) / 2).toFixed(4)
    : "0.0000";

  const totalPortfolio = status.isConnected
    ? (parseFloat(status.publicBalance || "0") + parseFloat(totalShielded)).toFixed(4)
    : "0.0000";

  return (
    <>
      <PageHeader
        title="Wallet"
        description="Overview of your public and shielded strkBTC"
      />

      {/* Address bar */}
      {status.isConnected && (
        <div className="flex items-center gap-3 mb-6 glass rounded-lg px-4 py-3">
          <div className={`w-3 h-3 rounded-full ${status.isDemo ? "bg-btc-orange animate-pulse" : "bg-success"}`} />
          <span className="text-xs font-mono text-muted-foreground flex-1 truncate">
            {status.address}
          </span>
          <button onClick={handleCopyAddress} className="text-muted-foreground hover:text-foreground transition-colors">
            {copied ? <CheckCircle className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
          </button>
          {status.isDemo && (
            <StatusBadge variant="warning">Demo</StatusBadge>
          )}
          {status.blockHeight && (
            <span className="text-[10px] text-muted-foreground font-mono">
              Block #{status.blockHeight.toLocaleString()}
            </span>
          )}
        </div>
      )}

      {/* Portfolio Total */}
      {status.isConnected && (
        <Card className="glass border-border mb-6">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Total Portfolio
                </div>
                <div className="text-4xl font-bold">{totalPortfolio} <span className="text-lg text-muted-foreground">strkBTC</span></div>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <div>≈ ${(parseFloat(totalPortfolio) * 67_342).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Public Balance */}
        <Card className="glass border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <WalletIcon className="w-4 h-4 text-btc-orange" />
              <span>Public Balance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">{status.publicBalance ?? "0.0000"} <span className="text-lg text-muted-foreground">strkBTC</span></div>
            <p className="text-xs text-muted-foreground mb-4">{status.isConnected ? (status.isDemo ? "Demo balance" : "On-chain balance") : "Connect wallet to see balance"}</p>
            <Link
              to="/deposit"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-primary rounded-lg text-sm font-medium transition-all hover:shadow-glow-blue"
            >
              <span>Shield BTC</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </CardContent>
        </Card>

        {/* Shielded Balance */}
        <Card className="glass border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Shield className="w-4 h-4 text-success" />
              <span>Shielded Balance</span>
              <InfoTooltip text="Shielded balance is an estimate based on your local secrets. Exact amounts are hidden for privacy." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">
              {balance && balance.utxoCount > 0
                ? `${balance.estimatedLow.toFixed(4)} – ${balance.estimatedHigh.toFixed(4)}`
                : "0.0000"}
              <span className="text-lg text-muted-foreground ml-2">strkBTC</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              {balance?.utxoCount ?? 0} shielded note{(balance?.utxoCount ?? 0) !== 1 ? "s" : ""}
            </p>
            <Link
              to="/withdraw"
              className="inline-flex items-center space-x-2 px-4 py-2 glass rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            >
              <span>Withdraw</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Token Balances */}
      {status.tokenBalances && (
        <Card className="glass border-border mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Coins className="w-4 h-4 text-primary" />
              <span>Token Balances</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(status.tokenBalances).map(([token, amount]) => (
                <div key={token} className="glass rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">{token}</div>
                  <div className="text-sm font-bold font-mono">{amount}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Anonymity Overview */}
      <Card className="glass border-border mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Privacy Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Pool Size</div>
              <div className="text-lg font-bold">{anonymity?.poolSize.toLocaleString() ?? "—"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Avg Age</div>
              <div className="text-lg font-bold">{anonymity ? `${anonymity.averageAgeHours}h` : "—"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">24h Deposits</div>
              <div className="text-lg font-bold">{anonymity?.depositCount24h ?? "—"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Privacy Level</div>
              <StatusBadge variant={privacyVariant as any}>{privacyLevel}</StatusBadge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="glass border-border">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <Link to="/activity" className="text-xs text-primary hover:underline">View all</Link>
        </CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No activity yet. <Link to="/deposit" className="text-primary hover:underline">Make your first deposit</Link>.
            </p>
          ) : (
            <div className="space-y-3">
              {activity.slice(0, 5).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center space-x-3">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">{entry.description}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <StatusBadge variant={entry.status === "success" ? "success" : entry.status === "failed" ? "error" : "pending"}>
                    {entry.status}
                  </StatusBadge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
