import React from "react";
import { Blocks, ArrowRightLeft, Landmark, Building2, Code, TrendingUp, Users, Layers } from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/ui/page-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useProtocolStats, usePriceFeed } from "@/hooks/useProtocolData";

const integrations = [
  {
    icon: ArrowRightLeft,
    title: "Private DEX Swaps",
    desc: "Use shielded strkBTC in automated market makers without revealing exact amounts or your identity.",
    status: "Coming Soon" as const,
    link: "/docs",
  },
  {
    icon: Landmark,
    title: "Private Borrowing & Lending",
    desc: "Use shielded strkBTC as collateral for loans. Your position size stays private.",
    status: "Research" as const,
    link: "/docs",
  },
  {
    icon: Building2,
    title: "DAO Treasury Privacy",
    desc: "Manage treasury inflows and outflows with privacy. Prevent front-running and targeted attacks.",
    status: "Coming Soon" as const,
    link: "/docs",
  },
];

function VolumeChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-0.5 h-16">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t bg-primary/60 hover:bg-primary transition-colors min-w-[3px]"
          style={{ height: `${(v / max) * 100}%` }}
          title={`${v} txns`}
        />
      ))}
    </div>
  );
}

export default function DefiPage() {
  const { data: stats, isLoading: statsLoading } = useProtocolStats();
  const { data: prices } = usePriceFeed();

  return (
    <>
      <PageHeader
        title="DeFi Integrations"
        description="Use shielded strkBTC as a building block for private decentralized finance."
      />

      {/* Live Protocol Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="glass border-border">
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> TVL
            </div>
            <div className="text-xl font-bold">
              {statsLoading ? "—" : `${stats!.tvl.toLocaleString()} BTC`}
            </div>
            {prices && (
              <div className="text-[10px] text-muted-foreground">
                ≈ ${((stats?.tvl ?? 0) * prices.btc.price).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="glass border-border">
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Users className="w-3 h-3" /> Users
            </div>
            <div className="text-xl font-bold">{statsLoading ? "—" : stats!.totalUsers.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="glass border-border">
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Layers className="w-3 h-3" /> Total Deposits
            </div>
            <div className="text-xl font-bold">{statsLoading ? "—" : stats!.totalDeposits.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="glass border-border">
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground mb-1">Anonymity Set</div>
            <div className="text-xl font-bold">{statsLoading ? "—" : stats!.avgAnonymitySet.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* 24h Volume Chart */}
      {stats && (
        <Card className="glass border-border mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">24h Transaction Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <VolumeChart data={stats.volumeSparkline} />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>24h ago</span>
              <span>Now</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pool Breakdown */}
      {stats && (
        <Card className="glass border-border mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pool Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.pools.map((pool) => {
                const pct = (pool.deposits / stats.totalDeposits) * 100;
                return (
                  <div key={pool.name} className="flex items-center gap-3">
                    <span className="text-sm font-mono w-28 flex-shrink-0">{pool.name}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-16 text-right">{pool.deposits.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Protocol Events */}
      {stats && (
        <Card className="glass border-border mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Protocol Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.recentEvents.map((event, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${event.type === "deposit" ? "bg-success" : "bg-primary"}`} />
                    <span className="capitalize">{event.type}</span>
                    <span className="font-mono font-medium">{event.amount} strkBTC</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{event.timeAgo}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="glass border-border mb-8">
        <CardContent className="pt-4">
          <div className="flex items-start space-x-3">
            <Blocks className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium mb-1">Composable Privacy</h3>
              <p className="text-sm text-muted-foreground">
                Zephyr is designed as a privacy primitive. Other protocols can integrate shielded strkBTC
                to offer private DeFi — swaps, lending, governance — without sacrificing composability.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {integrations.map((item) => (
          <Card key={item.title} className="glass border-border flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-gradient-secondary flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-foreground" />
                </div>
                <StatusBadge variant={item.status === "Coming Soon" ? "info" : "pending"}>
                  {item.status}
                </StatusBadge>
              </div>
              <CardTitle className="text-base mt-3">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <p className="text-sm text-muted-foreground mb-4 flex-1">{item.desc}</p>
              <Link to={item.link}>
                <Button variant="outline" size="sm" className="w-full">Learn More</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Developer CTA */}
      <Card className="glass border-border">
        <CardContent className="pt-6 text-center">
          <Code className="w-10 h-10 text-primary mx-auto mb-3" />
          <h3 className="text-lg font-bold mb-2">Build on Zephyr</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Integrate shielded strkBTC into your protocol. Our SDK makes it easy to
            add privacy to any Starknet DeFi application.
          </p>
          <Link to="/docs">
            <Button className="bg-gradient-primary">View Developer Docs</Button>
          </Link>
        </CardContent>
      </Card>
    </>
  );
}
