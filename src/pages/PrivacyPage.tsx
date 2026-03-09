import React from "react";
import { Eye, Shield, Info, BarChart3, Zap } from "lucide-react";
import { PageHeader, StatusBadge, InfoTooltip } from "@/components/ui/page-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAnonymitySet, useLocalUtxos } from "@/hooks/useZephyr";
import { useProtocolStats } from "@/hooks/useProtocolData";

export default function PrivacyPage() {
  const { data: anonymity } = useAnonymitySet();
  const { data: stats } = useProtocolStats();
  const utxos = useLocalUtxos().filter((u) => !u.spent);

  const oldestUtxo = utxos.reduce((min, u) => Math.min(min, u.timestamp), Date.now());
  const ageHours = Math.round((Date.now() - oldestUtxo) / 3600000);
  const privacyScore = Math.min(100, (anonymity?.poolSize ?? 0) / 300 + Math.min(ageHours, 168) / 2);
  const privacyLevel = privacyScore > 70 ? "High" : privacyScore > 40 ? "Medium" : "Low";

  return (
    <>
      <PageHeader
        title="Privacy Health"
        description="Visual privacy dashboard. See how private your shielded strkBTC really is."
      />

      {/* Privacy Score */}
      <Card className="glass border-border mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Your Privacy Level</div>
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold">{Math.round(privacyScore)}</span>
                <StatusBadge variant={privacyLevel === "High" ? "success" : privacyLevel === "Medium" ? "warning" : "error"}>
                  {privacyLevel}
                </StatusBadge>
              </div>
            </div>
            <Shield className={`w-12 h-12 ${privacyLevel === "High" ? "text-success" : privacyLevel === "Medium" ? "text-warning" : "text-destructive"}`} />
          </div>
          <Progress value={privacyScore} className="h-3 mb-2" />
          <p className="text-xs text-muted-foreground">
            {privacyLevel === "High"
              ? "Excellent privacy. Your deposits are well-mixed in the anonymity set."
              : privacyLevel === "Medium"
              ? "Good privacy. Consider waiting longer before withdrawing."
              : "Low privacy. Wait for more deposits to enter the pool."}
          </p>
        </CardContent>
      </Card>

      {/* Live Network Stats from edge function */}
      {stats && (
        <Card className="glass border-border mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center space-x-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>Live Network</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">TVL</div>
                <div className="text-lg font-bold">{stats.tvl.toLocaleString()} BTC</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Total Users</div>
                <div className="text-lg font-bold">{stats.totalUsers.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Merkle Depth</div>
                <div className="text-lg font-bold">{stats.merkleTreeDepth}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Network Fee</div>
                <div className="text-lg font-bold">{stats.networkFeeGwei} gwei</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Global Pool Metrics */}
        <Card className="glass border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span>Global Pool</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Anonymity Set Size</span>
              <span className="font-bold">{anonymity?.poolSize.toLocaleString() ?? "—"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Average Age</span>
              <span className="font-bold">{anonymity ? `${anonymity.averageAgeHours}h` : "—"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">24h Deposits</span>
              <span className="font-bold text-success">{anonymity?.depositCount24h ?? "—"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">24h Withdrawals</span>
              <span className="font-bold">{anonymity?.withdrawCount24h ?? "—"}</span>
            </div>
          </CardContent>
        </Card>

        {/* User Relative */}
        <Card className="glass border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Eye className="w-4 h-4 text-accent" />
              <span>Your Privacy Factors</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Shielded Notes</span>
              <span className="font-bold">{utxos.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Oldest Note Age</span>
              <span className="font-bold">{utxos.length > 0 ? `${ageHours}h` : "—"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Time Recommendation
                <InfoTooltip text="Wait at least 72 hours for good privacy, 168 hours for maximum." />
              </span>
              <span className={`text-sm font-medium ${ageHours >= 168 ? "text-success" : ageHours >= 72 ? "text-warning" : "text-destructive"}`}>
                {ageHours >= 168 ? "Maximum ✓" : ageHours >= 72 ? "Good" : `Wait ${72 - ageHours}h more`}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metadata Info */}
      <Card className="glass border-border mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center space-x-2">
            <Info className="w-4 h-4 text-info" />
            <span>What's On-Chain vs. What's Private</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-foreground mb-2">On-Chain (Public)</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Commitments (hashed, unlinkable)</li>
                <li>• Nullifiers (prevent double-spend)</li>
                <li>• Merkle roots</li>
                <li>• ZK proof data</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-success mb-2">Private (Never Shared)</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Link between deposit and withdrawal</li>
                <li>• Your secret / passphrase</li>
                <li>• Exact amounts in cleartext</li>
                <li>• Your identity</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Educational */}
      <Card className="glass border-border">
        <CardContent className="pt-4">
          <h4 className="font-medium mb-2">🎱 How Anonymity Sets Work</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Imagine a bag of identical marbles. When you deposit, you add your marble to the bag.
            When you withdraw, you take <em>a</em> marble out — but no one can tell which marble was
            originally yours. The more marbles in the bag, the stronger your privacy. That's why
            waiting for more deposits matters.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
