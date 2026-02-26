// src/mock/index.ts

import { createMockAccounts, createMockPriceFeeds, MOCK_NETWORKS } from './utils';
import { createMockUtxosForUser, createMockUtxoTreeSnapshot } from './utxo';
import { createMockDaoProposals } from './dao';
import { createMockNfts, randomCollectionAddress } from './nft';
import { createMockTxHistoryForAddress } from './tx';

import {
  MockAccount,
  MockUtxo,
  MockUtxoTreeSnapshot,
  MockDaoProposal,
  MockNft,
  MockNetworkConfig,
  MockPriceFeed,
  MockTx,
} from './types';

export interface ZephyrMockBundle {
  accounts: MockAccount[];
  utxosByAccount: Map<string, MockUtxo[]>;
  utxoTree: MockUtxoTreeSnapshot;
  daoProposals: MockDaoProposal[];
  nfts: MockNft[];
  nftsByOwner: Map<string, MockNft[]>;
  txHistoryByAccount: Map<string, MockTx[]>;
  networks: MockNetworkConfig[];
  prices: MockPriceFeed[];
}

/**
 * Generate a full application-wide mock dataset:
 * - multiple accounts
 * - per-account UTXOs
 * - shared UTXO tree snapshot
 * - DAO proposals + votes
 * - NFT collection bound to UTXOs
 * - transaction history
 * - price feeds & network configs
 */
export function createZephyrMockBundle(): ZephyrMockBundle {
  // 1. Accounts
  const accounts = createMockAccounts(5, 42);

  // 2. UTXOs per account
  const utxosByAccount = new Map<string, MockUtxo[]>();
  let allUtxos: MockUtxo[] = [];
  accounts.forEach((acct, idx) => {
    const count = idx === 0 ? 10 : 6;
    const utxos = createMockUtxosForUser(acct.address, count, 500 + idx);
    utxosByAccount.set(acct.address, utxos);
    allUtxos = allUtxos.concat(utxos);
  });

  // 3. UTXO Tree snapshot
  const utxoTree = createMockUtxoTreeSnapshot(allUtxos, 20);

  // 4. DAO proposals
  const voterAddresses = accounts.map((a) => a.address);
  const daoProposals = createMockDaoProposals(voterAddresses, 888);

  // 5. NFT collection
  const collectionAddress = randomCollectionAddress();
  const nfts = createMockNfts(
    collectionAddress,
    accounts.map((a) => a.address),
    24,
    321,
  );
  const nftsByOwner = new Map<string, MockNft[]>();
  nfts.forEach((n) => {
    const key = n.owner;
    const arr = nftsByOwner.get(key) ?? [];
    arr.push(n);
    nftsByOwner.set(key, arr);
  });

  // 6. Tx history
  const txHistoryByAccount = new Map<string, MockTx[]>();
  accounts.forEach((acct, idx) => {
    const history = createMockTxHistoryForAddress(acct.address, 30, 900 + idx);
    txHistoryByAccount.set(acct.address, history);
  });

  // 7. Price feeds & networks
  const prices = createMockPriceFeeds();
  const networks = MOCK_NETWORKS;

  return {
    accounts,
    utxosByAccount,
    utxoTree,
    daoProposals,
    nfts,
    nftsByOwner,
    txHistoryByAccount,
    networks,
    prices,
  };
}

