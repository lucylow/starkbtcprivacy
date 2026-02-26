import { poseidonHasher } from './Poseidon';

/**
 * Simple in-memory Poseidon Merkle tree.
 * This is used by the indexer; persistent roots are stored via the MerkleTree entity.
 */
export class MerkleTree {
  private leaves: string[] = [];

  insert(commitment: string): void {
    this.leaves.push(commitment);
  }

  getLeafCount(): number {
    return this.leaves.length;
  }

  getRoot(): string {
    if (this.leaves.length === 0) {
      return '0x0';
    }

    let level: bigint[] = this.leaves.map((l) => BigInt(l));

    while (level.length > 1) {
      const next: bigint[] = [];

      for (let i = 0; i < level.length; i += 2) {
        const left = level[i];
        const right = i + 1 < level.length ? level[i + 1] : level[i];
        next.push(poseidonHasher.hashTwo(left, right));
      }

      level = next;
    }

    return '0x' + level[0].toString(16);
  }
}

