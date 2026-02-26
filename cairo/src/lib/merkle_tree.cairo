use crate::lib::poseidon_utils::poseidon_hash_two;

/// Depth of the Merkle tree. 2^20 = ~1M leaves.
pub const TREE_DEPTH: u32 = 20;

/// Zero value for empty leaves.
pub const ZERO_VALUE: felt252 = 0;

/// Compute zero hashes for each level of the tree.
/// zero_hashes[0] = ZERO_VALUE
/// zero_hashes[i] = Poseidon(zero_hashes[i-1], zero_hashes[i-1])
pub fn compute_zero_hashes() -> Array<felt252> {
    let mut zeros: Array<felt252> = ArrayTrait::new();
    zeros.append(ZERO_VALUE);
    let mut i: u32 = 1;
    loop {
        if i > TREE_DEPTH {
            break;
        }
        let prev = *zeros.at(i - 1);
        let next = poseidon_hash_two(prev, prev);
        zeros.append(next);
        i += 1;
    };
    zeros
}

/// Verify a Merkle proof.
/// Given a leaf, its index, and a proof (array of sibling hashes from leaf to root),
/// compute the root and compare against the expected root.
pub fn verify_merkle_proof(
    leaf: felt252,
    index: u32,
    proof: Span<felt252>,
    expected_root: felt252,
) -> bool {
    assert(proof.len() == TREE_DEPTH, 'Invalid proof length');

    let mut computed = leaf;
    let mut idx = index;
    let mut i: u32 = 0;

    loop {
        if i >= TREE_DEPTH {
            break;
        }

        let sibling = *proof.at(i);
        let is_right = idx % 2;

        if is_right == 1 {
            computed = poseidon_hash_two(sibling, computed);
        } else {
            computed = poseidon_hash_two(computed, sibling);
        }

        idx = idx / 2;
        i += 1;
    };

    computed == expected_root
}
