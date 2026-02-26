use core::poseidon::PoseidonTrait;
use core::hash::{HashStateTrait, HashStateExTrait};

/// Hash two field elements using Poseidon.
pub fn poseidon_hash_two(a: felt252, b: felt252) -> felt252 {
    let mut state = PoseidonTrait::new();
    state = state.update(a);
    state = state.update(b);
    state.finalize()
}

/// Hash three field elements using Poseidon.
pub fn poseidon_hash_three(a: felt252, b: felt252, c: felt252) -> felt252 {
    let mut state = PoseidonTrait::new();
    state = state.update(a);
    state = state.update(b);
    state = state.update(c);
    state.finalize()
}

/// Hash an arbitrary span of field elements using Poseidon.
pub fn poseidon_hash_many(inputs: Span<felt252>) -> felt252 {
    let mut state = PoseidonTrait::new();
    let mut i: u32 = 0;
    loop {
        if i >= inputs.len() {
            break;
        }
        state = state.update(*inputs.at(i));
        i += 1;
    };
    state.finalize()
}

/// Generate a commitment: Poseidon(secret, nullifier, amount_low, amount_high, randomness)
pub fn generate_commitment(
    secret: felt252,
    nullifier: felt252,
    amount_low: felt252,
    amount_high: felt252,
    randomness: felt252,
) -> felt252 {
    let mut state = PoseidonTrait::new();
    state = state.update(secret);
    state = state.update(nullifier);
    state = state.update(amount_low);
    state = state.update(amount_high);
    state = state.update(randomness);
    state.finalize()
}

/// Generate a nullifier hash: Poseidon(secret, leaf_index)
pub fn generate_nullifier_hash(secret: felt252, leaf_index: felt252) -> felt252 {
    poseidon_hash_two(secret, leaf_index)
}
