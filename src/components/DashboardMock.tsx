// src/components/DashboardMock.tsx

import React from "react";
import { useZephyrMock } from "@/mock/zephyrMockProvider";

const DashboardMock: React.FC = () => {
  const { accounts, utxosByAccount, utxoTree, daoProposals, nfts } =
    useZephyrMock();
  const me = accounts[0];
  const myUtxos = utxosByAccount.get(me.address) ?? [];

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-6 text-sm">
      <h2 className="text-lg font-semibold">Zephyr Mock Dashboard</h2>
      <p>
        <span className="font-medium">Account:</span> {me.alias} (
        {me.address.slice(0, 10)}…)
      </p>
      <p>
        <span className="font-medium">UTXO Tree Root:</span>{" "}
        {utxoTree.root.slice(0, 18)}…
      </p>
      <p>
        <span className="font-medium">My UTXOs:</span> {myUtxos.length}
      </p>
      <p>
        <span className="font-medium">DAO Proposals:</span>{" "}
        {daoProposals.length}
      </p>
      <p>
        <span className="font-medium">NFTs minted:</span> {nfts.length}
      </p>
    </div>
  );
};

export default DashboardMock;

