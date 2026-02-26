// src/components/DashboardMock.tsx

import React from "react";
import { useZephyrMock } from "@/mock/zephyrMockProvider";

const DashboardMock: React.FC = () => {
  const {
    accounts,
    utxosByAccount,
    utxoTree,
    daoProposals,
    nfts,
    prices,
    networks,
  } = useZephyrMock();

  const me = accounts[0];
  const myUtxos = utxosByAccount.get(me.address) ?? [];
  const btcPrice = prices.find((p) => p.base === "BTC" && p.quote === "USD");
  const currentNetwork = networks[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Zephyr Mock Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Deterministic mock data for UTXOs, DAO, NFTs, transactions, and
            networks. Controlled via <code>VITE_USE_ZEPHYR_MOCKS</code>.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border bg-card p-4 shadow-sm space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Primary Account
            </h2>
            <div className="space-y-1">
              <div className="font-medium">{me.alias}</div>
              <div className="text-xs text-muted-foreground">
                {me.address.slice(0, 10)}…
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              UTXOs owned:{" "}
              <span className="font-semibold text-foreground">
                {myUtxos.length}
              </span>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-sm space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Network Snapshot
            </h2>
            <div className="text-sm font-medium">{currentNetwork.name}</div>
            <div className="text-xs text-muted-foreground">
              Chain ID: {currentNetwork.chainId}
            </div>
            {btcPrice && (
              <div className="mt-3 text-xs">
                BTC Price:{" "}
                <span className="font-semibold">
                  ${btcPrice.price.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h3 className="text-xs font-semibold text-muted-foreground">
              UTXO Tree
            </h3>
            <div className="mt-2 text-sm">
              Root:{" "}
              <span className="font-mono text-xs">
                {utxoTree.root.slice(0, 18)}…
              </span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Depth: {utxoTree.depth} • Leaves: {utxoTree.leaves.length}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h3 className="text-xs font-semibold text-muted-foreground">
              DAO Proposals
            </h3>
            <div className="mt-2 text-2xl font-bold">
              {daoProposals.length}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              States:{" "}
              {Array.from(
                new Set(daoProposals.map((p) => p.state)),
              ).join(", ")}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h3 className="text-xs font-semibold text-muted-foreground">
              NFT Passes
            </h3>
            <div className="mt-2 text-2xl font-bold">{nfts.length}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Collection:{" "}
              <span className="font-mono">
                {nfts[0]?.collectionAddress.slice(0, 10)}…
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardMock;


