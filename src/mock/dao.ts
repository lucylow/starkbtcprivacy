// src/mock/dao.ts

import {
  mulberry32,
  randomAddress,
  randomHex,
  randomBigInt,
  daysAgo,
  minutesAgo,
} from './utils';
import { MockDaoProposal, MockDaoVote, Hex } from './types';

/**
 * Generate a suite of mock DAO proposals with various states.
 */
export function createMockDaoProposals(
  voters: Hex[],
  seed = 4242,
): MockDaoProposal[] {
  const rng = mulberry32(seed);

  const titles = [
    'Reduce base withdrawal fee from 0.15% to 0.10%',
    'Increase anonymity set target to 10,000 UTXOs',
    'Enable NFT-gated premium mixing pool',
    'Add new data provider for BTC price oracle',
    'Adjust governance quorum from 4% to 6%',
    'Migrate verifier contract to version 2.0',
  ];

  const descriptions = [
    'This proposal decreases the base fee to improve competitiveness while keeping protocol revenues sustainable.',
    'This proposal increases the minimum anonymity set size required before fast withdrawals are enabled.',
    'This proposal introduces a premium pool where only NFT holders can access ultra-fast exits.',
    'This proposal adds an additional oracle source to improve BTC pricing robustness.',
    'This proposal slightly raises quorum to strengthen governance legitimacy.',
    'This proposal migrates the STARK verifier to a more gas-efficient implementation.',
  ];

  const nowBlock = 1_000_000;
  const proposals: MockDaoProposal[] = [];

  for (let i = 0; i < titles.length; i++) {
    const id = BigInt(i + 1);
    const proposer = randomAddress(rng);
    const createdAt = daysAgo(14 - 2 * i);
    const startBlock = nowBlock - 10_000 + i * 1000;
    const endBlock = startBlock + 720; // ~half-day in blocks

    const targets: Hex[] = [randomAddress(rng)];
    const values: bigint[] = [0n];
    const calldatas: Hex[] = [randomHex(rng)];

    const quorumBps = i === 4 ? 600 : 400;
    const approvalThresholdBps = 5000;

    const votes: MockDaoVote[] = [];
    let forVotes = 0n;
    let againstVotes = 0n;
    let abstainVotes = 0n;

    // generate random voting pattern per proposal
    for (const voter of voters) {
      if (rng() < 0.2) continue; // 20% skip voting

      const supportRoll = rng();
      const support: MockDaoVote['support'] =
        supportRoll < 0.2 ? 'against' : supportRoll < 0.8 ? 'for' : 'abstain';

      const weight = randomBigInt(rng, BigInt(500_000_000_000)); // up to 5 BTC equiv
      const txHash = randomHex(rng);
      const timestamp = minutesAgo(60 + Math.floor(rng() * 360));

      if (support === 'for') forVotes += weight;
      else if (support === 'against') againstVotes += weight;
      else abstainVotes += weight;

      votes.push({ voter, support, weight, txHash, timestamp });
    }

    // derive state
    const totalVotes = forVotes + againstVotes + abstainVotes;
    let state: MockDaoProposal['state'] = 'Pending';
    const quorumOk = totalVotes > 0n; // simplified; you can compute actual quorum

    if (!quorumOk) {
      state = 'Defeated';
    } else if (forVotes > againstVotes) {
      state = 'Succeeded';
    } else {
      state = 'Defeated';
    }

    // Add some diversity to states for UI
    if (i === 0) state = 'Queued';
    if (i === 1) state = 'Executed';
    if (i === 2) state = 'Active';
    if (i === 3) state = 'Pending';
    if (i === 4) state = 'Defeated';
    if (i === 5) state = 'Expired';

    const eta =
      state === 'Queued' || state === 'Executed'
        ? Date.now() - 3_600_000
        : undefined;

    proposals.push({
      id,
      title: titles[i],
      description: descriptions[i],
      proposer,
      createdAt,
      startBlock,
      endBlock,
      eta,
      targets,
      values,
      calldatas,
      forVotes,
      againstVotes,
      abstainVotes,
      quorumBps,
      approvalThresholdBps,
      state,
      votes,
    });
  }

  return proposals;
}

