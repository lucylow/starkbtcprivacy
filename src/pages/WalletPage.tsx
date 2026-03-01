import React from "react";
import { Link } from "react-router-dom";
import { Wallet as WalletIcon, Shield, ArrowRight, Activity } from "lucide-react";
import { PageHeader, StatusBadge, InfoTooltip } from "@/components/ui/page-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useShieldedBalance, useAnonymitySet, useActivityLog } from "@/hooks/useZephyr";
import { useWallet } from "@/contexts/WalletProvider";

export default function WalletPage() {
  const { data: balance } = useShieldedBalance();
  const { data: anonymity } = useAnonymitySet();
  const activity = useActivityLog();
  const { status } = useWallet();

  const privacyLevel = anonymity
    ? anonymity.poolSize > 20000
      ? "Excellent"
      : anonymity.poolSize > 5000
      ? "Good"
      : "Low"
    : "—";
  const privacyVariant = privacyLevel === "Excellent" ? "success" : privacyLevel === "Good" ? "warning" : "error";

  return (
    <>
      <PageHeader
        title="Wallet"
        description="Overview of your public and shielded strkBTC"
      />

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
              {activity.slice(0, 3).map((entry) => (
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
