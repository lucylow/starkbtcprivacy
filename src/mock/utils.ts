// src/mock/utils.ts

import {
  Hex,
  MockAccount,
  MockNetworkConfig,
  MockPriceFeed,
} from './types';

/**
 * Deterministic pseudo-random generator so fixtures are stable
 */
export function mulberry32(seed: number): () => number {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomHex(rng: () => number, bytes = 32): Hex {
  let out = '0x';
  for (let i = 0; i < bytes; i++) {
    const v = Math.floor(rng() * 256);
    out += v.toString(16).padStart(2, '0');
  }
  return out as Hex;
}

export function randomAddress(rng: () => number): Hex {
  return randomHex(rng, 32);
}

export function randomBigInt(rng: () => number, max: bigint): bigint {
  // very simple bounded bigint
  const hi = BigInt(Math.floor(rng() * Number.MAX_SAFE_INTEGER));
  return hi % max;
}

export function daysAgo(days: number): number {
  const now = Date.now();
  return now - days * 24 * 60 * 60 * 1000;
}

export function minutesAgo(mins: number): number {
  const now = Date.now();
  return now - mins * 60 * 1000;
}

/**
 * Create N deterministic mock accounts.
 */
export function createMockAccounts(count: number, seed = 1337): MockAccount[] {
  const rng = mulberry32(seed);
  const aliases = ['alice', 'bob', 'carol', 'dave', 'erin', 'frank', 'grace'];
  const result: MockAccount[] = [];
  for (let i = 0; i < count; i++) {
    result.push({
      address: randomAddress(rng),
      publicKey: randomHex(rng),
      alias: `${aliases[i % aliases.length]}_${i}`,
      avatarUrl: `https://api.dicebear.com/6.x/identicon/svg?seed=${i}`,
    });
  }
  return result;
}

/**
 * Simple BTC-like price series for charts.
 */
export function createMockPriceFeeds(): MockPriceFeed[] {
  const now = Date.now();
  return [
    {
      base: 'BTC',
      quote: 'USD',
      price: 41250.23,
      updatedAt: now - 5 * 60 * 1000,
      source: 'mock',
    },
    {
      base: 'STRK',
      quote: 'USD',
      price: 1.85,
      updatedAt: now - 3 * 60 * 1000,
      source: 'mock',
    },
  ];
}

/**
 * Simple network configs for toggling envs in UI.
 */
export const MOCK_NETWORKS: MockNetworkConfig[] = [
  {
    name: 'starknet-devnet',
    rpcUrl: 'http://localhost:5050',
    chainId: '0x534e5f4445564e4554', // "SN_DEVNET"
    blockExplorerUrl: 'http://localhost:5050/explorer',
    contracts: {
      zephyrUtxo: '0x0111devnetutxo',
      zephyrNft: '0x0111devnetnft0',
      zephyrDao: '0x0111devnetdao0',
      commitmentLib: '0x0111devnetcomm',
      verifier: '0x0111devnetveri',
    },
  },
  {
    name: 'starknet-sepolia',
    rpcUrl: 'https://starknet-sepolia.public.blastapi.io',
    chainId: '0x534e5f5345504f4c4941',
    blockExplorerUrl: 'https://sepolia.voyager.online',
    contracts: {
      zephyrUtxo: '0x0520sepoliautxo',
      zephyrNft: '0x0520sepolianft',
      zephyrDao: '0x0520sepoliadao',
      commitmentLib: '0x0520sepoliacom',
      verifier: '0x0520sepoliaver',
    },
  },
];

