use crate::lib::poseidon_utils::{
    poseidon_hash_two,
    poseidon_hash_three,
    poseidon_hash_many,
    generate_commitment,
    generate_nullifier_hash,
};

#[test]
fn test_poseidon_hash_two_deterministic() {
    let h1 = poseidon_hash_two(1, 2);
    let h2 = poseidon_hash_two(1, 2);
    assert(h1 == h2, 'Hash should be deterministic');
}

#[test]
fn test_poseidon_hash_two_different_inputs() {
    let h1 = poseidon_hash_two(1, 2);
    let h2 = poseidon_hash_two(2, 1);
    assert(h1 != h2, 'Different inputs, different hash');
}

#[test]
fn test_poseidon_hash_three() {
    let h = poseidon_hash_three(1, 2, 3);
    assert(h != 0, 'Hash should be nonzero');
}

#[test]
fn test_poseidon_hash_many() {
    let mut inputs: Array<felt252> = ArrayTrait::new();
    inputs.append(1);
    inputs.append(2);
    inputs.append(3);
    inputs.append(4);
    let h = poseidon_hash_many(inputs.span());
    assert(h != 0, 'Hash should be nonzero');
}

#[test]
fn test_generate_commitment_nonzero() {
    let c = generate_commitment(
        123,   // secret
        456,   // nullifier
        1000,  // amount_low
        0,     // amount_high
        789,   // randomness
    );
    assert(c != 0, 'Commitment should be nonzero');
}

#[test]
fn test_generate_commitment_deterministic() {
    let c1 = generate_commitment(123, 456, 1000, 0, 789);
    let c2 = generate_commitment(123, 456, 1000, 0, 789);
    assert(c1 == c2, 'Commitment should be same');
}

#[test]
fn test_generate_commitment_different_secrets() {
    let c1 = generate_commitment(123, 456, 1000, 0, 789);
    let c2 = generate_commitment(999, 456, 1000, 0, 789);
    assert(c1 != c2, 'Different secrets = different C');
}

#[test]
fn test_generate_nullifier_hash_deterministic() {
    let n1 = generate_nullifier_hash(123, 0);
    let n2 = generate_nullifier_hash(123, 0);
    assert(n1 == n2, 'Nullifier should be same');
}

#[test]
fn test_generate_nullifier_hash_different_secrets() {
    let n1 = generate_nullifier_hash(123, 0);
    let n2 = generate_nullifier_hash(456, 0);
    assert(n1 != n2, 'Different secrets = different N');
}

#[test]
fn test_generate_nullifier_hash_different_indices() {
    let n1 = generate_nullifier_hash(123, 0);
    let n2 = generate_nullifier_hash(123, 1);
    assert(n1 != n2, 'Different indices = different N');
}

#[test]
fn test_commitment_nullifier_independence() {
    let c = generate_commitment(123, 456, 1000, 0, 789);
    let n = generate_nullifier_hash(123, 0);
    assert(c != n, 'Commitment != nullifier');
}
