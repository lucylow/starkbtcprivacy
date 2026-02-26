// Governance token interface for Zephyr DAO.
// Implement this on your private ERC20 or STRK-style token to support
// balance-based and snapshot-based voting.

#[starknet::interface]
trait IGovToken<TContractState> {
    fn balance_of(self: @TContractState, owner: starknet::ContractAddress) -> core::integer::u256;
    fn total_supply(self: @TContractState) -> core::integer::u256;

    /// Snapshot-based voting: voting power of `account` at `block_number`.
    /// For tokens without checkpoints, implement as: if block_number >= get_block_number() { balance_of(account) } else { 0 }.
    /// For Compound-style tokens, return checkpointed balance at that block.
    fn get_past_votes(
        self: @TContractState,
        account: starknet::ContractAddress,
        block_number: core::integer::u64,
    ) -> core::integer::u256;
}
