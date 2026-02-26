use starknet::ContractAddress;

#[starknet::interface]
pub trait IMixer<TContractState> {
    /// Deposit funds into the mixer by providing a commitment hash.
    /// The commitment = Poseidon(secret, nullifier, amount, randomness).
    /// Caller must have approved the mixer to spend `amount` of the ERC20 token.
    fn deposit(ref self: TContractState, commitment: felt252, amount_low: u128, amount_high: u128);

    /// Withdraw funds from the mixer by providing a ZK proof.
    /// The proof demonstrates knowledge of a valid commitment in the Merkle tree
    /// without revealing which one.
    fn withdraw(
        ref self: TContractState,
        nullifier_hash: felt252,
        recipient: ContractAddress,
        amount_low: u128,
        amount_high: u128,
        merkle_root: felt252,
        proof: Span<felt252>,
    );

    /// Batch deposit multiple commitments in a single transaction.
    fn batch_deposit(
        ref self: TContractState,
        commitments: Span<felt252>,
        amounts_low: Span<u128>,
        amounts_high: Span<u128>,
    );

    // --- View functions ---

    /// Check if a commitment exists in the tree.
    fn is_known_commitment(self: @TContractState, commitment: felt252) -> bool;

    /// Check if a nullifier has been spent.
    fn is_spent_nullifier(self: @TContractState, nullifier_hash: felt252) -> bool;

    /// Get the current Merkle root.
    fn get_current_root(self: @TContractState) -> felt252;

    /// Get the number of deposits (leaf count).
    fn get_deposit_count(self: @TContractState) -> u32;

    /// Check if the mixer is paused.
    fn is_paused(self: @TContractState) -> bool;

    // --- Admin functions ---

    /// Pause the mixer (admin only).
    fn pause(ref self: TContractState);

    /// Unpause the mixer (admin only).
    fn unpause(ref self: TContractState);

    /// Set the fee in basis points (admin only).
    fn set_fee(ref self: TContractState, fee_bps: u64);

    /// Set the verifier contract address (admin only).
    fn set_verifier(ref self: TContractState, verifier: ContractAddress);

    /// Set the Merkle tree contract address (admin only).
    fn set_merkle_tree_contract(ref self: TContractState, merkle_tree: ContractAddress);

    /// Transfer admin role (admin only).
    fn transfer_ownership(ref self: TContractState, new_admin: ContractAddress);
}
