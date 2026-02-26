/// Interface for the ZK proof verifier contract.
/// Public inputs layout: [merkle_root, nullifier_hash, recipient, amount_low, amount_high]
#[starknet::interface]
pub trait IVerifier<TContractState> {
    /// Verify a single withdrawal proof.
    /// Returns true if the proof is valid for the given public inputs.
    fn verify_proof(
        self: @TContractState,
        proof: Span<felt252>,
        merkle_root: felt252,
        nullifier_hash: felt252,
        recipient: felt252,
        amount_low: u128,
        amount_high: u128,
    ) -> bool;

    /// Batch verify multiple proofs (for relayer efficiency).
    fn batch_verify(
        self: @TContractState,
        proofs: Span<Span<felt252>>,
        merkle_roots: Span<felt252>,
        nullifier_hashes: Span<felt252>,
        recipients: Span<felt252>,
        amounts_low: Span<u128>,
        amounts_high: Span<u128>,
    ) -> bool;
}
