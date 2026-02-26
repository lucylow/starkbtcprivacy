import { poseidonHasher } from './Poseidon';

/**
 * Simple in-memory Poseidon Merkle tree.
 * This is used by the indexer; persistent roots are stored via the MerkleTree entity.
 *
 * The tree is position-based (not sorted): leaf indices are significant, and
 * when a level has an odd number of nodes the last node is duplicated.
 */
export class MerkleTree {
  private leaves: string[] = [];

  insert(commitment: string): void {
    this.leaves.push(commitment);
  }

  getLeafCount(): number {
    return this.leaves.length;
  }

  getLeaf(index: number): string | undefined {
    return this.leaves[index];
  }

  /**
   * Compute the Merkle root for the current set of leaves.
   */
  getRoot(): string {
    if (this.leaves.length === 0) {
      return '0x0';
    }

    let level: bigint[] = this.leaves.map((l) => BigInt(l));

    while (level.length > 1) {
      level = this.buildNextLevel(level);
    }

    return '0x' + level[0].toString(16);
  }

  /**
   * Return the Merkle proof (sibling hashes) for a given leaf index.
   * Proof ordering matches the standard convention used in the Cairo
   * circuits: the i-th element is the sibling at level i, starting
   * from the leaf level.
   */
  getProof(index: number): string[] {
    if (index < 0 || index >= this.leaves.length) {
      throw new Error('Leaf index out of range');
    }

    let idx = index;
    let level: bigint[] = this.leaves.map((l) => BigInt(l));
    const proof: string[] = [];

    while (level.length > 1) {
      const isRightNode = idx % 2 === 1;
      const siblingIndex = isRightNode ? idx - 1 : idx + 1;

      const sibling =
        siblingIndex < level.length ? level[siblingIndex] : level[idx];

      proof.push('0x' + sibling.toString(16));

      level = this.buildNextLevel(level);
      idx = Math.floor(idx / 2);
    }

    return proof;
  }

  /**
   * Verify a Merkle proof against an expected root.
   */
  static verifyProof(params: {
    leaf: string;
    index: number;
    proof: string[];
    expectedRoot: string;
  }): boolean {
    const { leaf, index, proof, expectedRoot } = params;
    let computed = BigInt(leaf);
    let idx = index;

    for (const siblingHex of proof) {
      const sibling = BigInt(siblingHex);
      let left: bigint;
      let right: bigint;

      if (idx % 2 === 0) {
        left = computed;
        right = sibling;
      } else {
        left = sibling;
        right = computed;
      }

      computed = poseidonHasher.hashTwo(left, right);
      idx = Math.floor(idx / 2);
    }

    const rootHex = '0x' + computed.toString(16);
    return rootHex.toLowerCase() === expectedRoot.toLowerCase();
  }

  private buildNextLevel(level: bigint[]): bigint[] {
    const next: bigint[] = [];

    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = i + 1 < level.length ? level[i + 1] : level[i];
      next.push(poseidonHasher.hashTwo(left, right));
    }

    return next;
  }
}

