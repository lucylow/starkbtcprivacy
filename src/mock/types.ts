// src/mock/types.ts

export type Hex = `0x${string}`;

export interface MockAccount {
  address: Hex;
  publicKey: Hex;
  alias: string;
  avatarUrl?: string;
}

export interface MockUtxo {
  id: string; // local id
  commitment: Hex;
  nullifier: Hex;
  merkleIndex: number;
  amount: bigint; // in satoshis or smallest unit
  tokenSymbol: string; // 'wBTC', 'Z-BTC'
  createdAt: number; // unix millis
  spent: boolean;
  spentTxHash?: Hex;
  note: string;
}

export interface MockUtxoTreeSnapshot {
  root: Hex;
  depth: number;
  leaves: Hex[]; // ordered by index
  createdAt: number;
}

export type ProposalState =
  | 'Pending'
  | 'Active'
  | 'Succeeded'
  | 'Defeated'
  | 'Queued'
  | 'Executed'
  | 'Expired'
  | 'Canceled';

export interface MockDaoVote {
  voter: Hex;
  support: 'against' | 'for' | 'abstain';
  weight: bigint;
  txHash: Hex;
  timestamp: number;
}

export interface MockDaoProposal {
  id: bigint;
  title: string;
  description: string;
  proposer: Hex;
  createdAt: number;
  startBlock: number;
  endBlock: number;
  eta?: number;
  targets: Hex[];
  values: bigint[];
  calldatas: Hex[];
  forVotes: bigint;
  againstVotes: bigint;
  abstainVotes: bigint;
  quorumBps: number;
  approvalThresholdBps: number;
  state: ProposalState;
  votes: MockDaoVote[];
}

export interface MockNft {
  tokenId: bigint;
  owner: Hex;
  collectionAddress: Hex;
  name: string;
  image: string;
  description: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  commitment: Hex; // UTXO commitment used for mint gating
  identityCommitment?: Hex;
  mintedAt: number;
  mintTxHash: Hex;
}

export interface MockNetworkConfig {
  name: 'starknet-mainnet' | 'starknet-sepolia' | 'starknet-devnet';
  rpcUrl: string;
  chainId: string;
  blockExplorerUrl: string;
  contracts: {
    zephyrUtxo: Hex;
    zephyrNft: Hex;
    zephyrDao: Hex;
    commitmentLib: Hex;
    verifier: Hex;
  };
}

export interface MockPriceFeed {
  base: string;
  quote: string;
  price: number; // e.g. 41250.23
  updatedAt: number;
  source: 'coingecko' | 'coinmarketcap' | 'mock';
}

export interface MockTx {
  hash: Hex;
  from: Hex;
  to: Hex;
  method: string;
  status: 'PENDING' | 'ACCEPTED_ON_L2' | 'REJECTED';
  timestamp: number;
  feePaid: bigint;
  calldataSummary: string;
  label?: string;
}

