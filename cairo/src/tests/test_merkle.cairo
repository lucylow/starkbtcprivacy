use crate::lib::merkle_tree::{TREE_DEPTH, compute_zero_hashes, verify_merkle_proof};
use crate::lib::poseidon_utils::poseidon_hash_two;

#[test]
fn test_tree_depth() {
    assert(TREE_DEPTH == 20, 'Depth should be 20');
}

#[test]
fn test_compute_zero_hashes_length() {
    let zeros = compute_zero_hashes();
    // Should have TREE_DEPTH + 1 entries (level 0 through TREE_DEPTH)
    assert(zeros.len() == TREE_DEPTH + 1, 'Wrong zero hashes length');
}

#[test]
fn test_zero_hashes_first_is_zero() {
    let zeros = compute_zero_hashes();
    assert(*zeros.at(0) == 0, 'First zero hash should be 0');
}

#[test]
fn test_zero_hashes_consistency() {
    let zeros = compute_zero_hashes();
    // zeros[1] should equal Poseidon(zeros[0], zeros[0])
    let expected = poseidon_hash_two(*zeros.at(0), *zeros.at(0));
    assert(*zeros.at(1) == expected, 'Zero hash[1] inconsistent');
}

#[test]
fn test_verify_merkle_proof_trivial() {
    // Build a proof for a single-leaf tree by using zero hashes as siblings
    let leaf: felt252 = 12345;
    let zeros = compute_zero_hashes();

    // Build proof: all siblings are zero hashes at each level
    let mut proof: Array<felt252> = ArrayTrait::new();
    let mut i: u32 = 0;
    loop {
        if i >= TREE_DEPTH {
            break;
        }
        proof.append(*zeros.at(i));
        i += 1;
    };

    // Compute expected root
    let mut computed = leaf;
    let mut j: u32 = 0;
    loop {
        if j >= TREE_DEPTH {
            break;
        }
        // index 0 means always left child
        computed = poseidon_hash_two(computed, *zeros.at(j));
        j += 1;
    };

    let valid = verify_merkle_proof(leaf, 0, proof.span(), computed);
    assert(valid, 'Valid proof should pass');
}

#[test]
fn test_verify_merkle_proof_wrong_root_fails() {
    let leaf: felt252 = 12345;
    let zeros = compute_zero_hashes();

    let mut proof: Array<felt252> = ArrayTrait::new();
    let mut i: u32 = 0;
    loop {
        if i >= TREE_DEPTH {
            break;
        }
        proof.append(*zeros.at(i));
        i += 1;
    };

    // Wrong root
    let valid = verify_merkle_proof(leaf, 0, proof.span(), 99999);
    assert(!valid, 'Wrong root should fail');
}

#[test]
fn test_verify_merkle_proof_wrong_leaf_fails() {
    let leaf: felt252 = 12345;
    let zeros = compute_zero_hashes();

    let mut proof: Array<felt252> = ArrayTrait::new();
    let mut i: u32 = 0;
    loop {
        if i >= TREE_DEPTH {
            break;
        }
        proof.append(*zeros.at(i));
        i += 1;
    };

    // Compute root for correct leaf
    let mut computed = leaf;
    let mut j: u32 = 0;
    loop {
        if j >= TREE_DEPTH {
            break;
        }
        computed = poseidon_hash_two(computed, *zeros.at(j));
        j += 1;
    };

    // Verify with wrong leaf
    let valid = verify_merkle_proof(99999, 0, proof.span(), computed);
    assert(!valid, 'Wrong leaf should fail');
}
