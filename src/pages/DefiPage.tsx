import React from "react";
import { Blocks, ArrowRightLeft, Landmark, Building2, Code } from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/ui/page-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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

export default function DefiPage() {
  return (
    <>
      <PageHeader
        title="DeFi Integrations"
        description="Use shielded strkBTC as a building block for private decentralized finance."
      />

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
                <Button variant="outline" size="sm" className="w-full">
                  Learn More
                </Button>
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
