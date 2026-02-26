/// ZephyrMixer: The core privacy mixer contract for shielded BTC transactions on Starknet.
///
/// Users deposit by providing a Poseidon commitment and ERC20 tokens.
/// Users withdraw by providing a ZK proof that they know a secret for a
/// commitment in the Merkle tree, without revealing which one.

#[starknet::contract]
mod ZephyrMixer {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp, get_contract_address};
    use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess};
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
    use core::num::traits::Zero;

    use crate::interfaces::IERC20::{IERC20Dispatcher, IERC20DispatcherTrait};
    use crate::interfaces::IVerifier::{IVerifierDispatcher, IVerifierDispatcherTrait};
    use crate::lib::merkle_tree::{TREE_DEPTH, verify_merkle_proof};

    // ── Storage ──────────────────────────────────────────────────────────

    #[storage]
    struct Storage {
        // Admin
        admin: ContractAddress,
        paused: bool,

        // Token
        token: ContractAddress,  // strkBTC / wBTC ERC20 address

        // Verifier
        verifier: ContractAddress,

        // Merkle tree state (on-chain sparse representation)
        commitments: Map<felt252, bool>,
        nullifiers: Map<felt252, bool>,
        roots: Map<u32, felt252>,          // historical roots
        current_root_index: u32,
        current_root: felt252,
        next_leaf_index: u32,

        // Filled subtrees for incremental Merkle tree
        filled_subtrees: Map<u32, felt252>,

        // Fee (basis points, e.g. 30 = 0.3%)
        fee_bps: u64,
        fee_recipient: ContractAddress,

        // Deposit tracking
        deposit_count: u32,
    }

    // ── Events ───────────────────────────────────────────────────────────

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        Deposit: DepositEvent,
        Withdrawal: WithdrawalEvent,
        Paused: PausedEvent,
        Unpaused: UnpausedEvent,
        AdminTransferred: AdminTransferredEvent,
        FeeUpdated: FeeUpdatedEvent,
        VerifierUpdated: VerifierUpdatedEvent,
    }

    #[derive(Drop, starknet::Event)]
    struct DepositEvent {
        #[key]
        commitment: felt252,
        leaf_index: u32,
        timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct WithdrawalEvent {
        #[key]
        nullifier_hash: felt252,
        recipient: ContractAddress,
        amount_low: u128,
        amount_high: u128,
        fee_low: u128,
        fee_high: u128,
    }

    #[derive(Drop, starknet::Event)]
    struct PausedEvent {}

    #[derive(Drop, starknet::Event)]
    struct UnpausedEvent {}

    #[derive(Drop, starknet::Event)]
    struct AdminTransferredEvent {
        #[key]
        old_admin: ContractAddress,
        #[key]
        new_admin: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct FeeUpdatedEvent {
        old_fee_bps: u64,
        new_fee_bps: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct VerifierUpdatedEvent {
        #[key]
        old_verifier: ContractAddress,
        #[key]
        new_verifier: ContractAddress,
    }

    // ── Constructor ──────────────────────────────────────────────────────

    #[constructor]
    fn constructor(
        ref self: ContractState,
        admin: ContractAddress,
        token: ContractAddress,
        verifier: ContractAddress,
        fee_bps: u64,
        fee_recipient: ContractAddress,
    ) {
        assert(!admin.is_zero(), 'Mixer: zero admin');
        assert(!token.is_zero(), 'Mixer: zero token');
        assert(!verifier.is_zero(), 'Mixer: zero verifier');
        assert(fee_bps <= 1000, 'Mixer: fee > 10%');

        self.admin.write(admin);
        self.token.write(token);
        self.verifier.write(verifier);
        self.fee_bps.write(fee_bps);
        self.fee_recipient.write(fee_recipient);
        self.paused.write(false);
        self.current_root_index.write(0);
        self.next_leaf_index.write(0);
        self.deposit_count.write(0);

        // Initialize root as zero hash
        self.current_root.write(0);
        self.roots.write(0, 0);
    }

    // ── External implementation ──────────────────────────────────────────

    #[abi(embed_v0)]
    impl MixerImpl of crate::interfaces::IMixer::IMixer<ContractState> {
        fn deposit(
            ref self: ContractState,
            commitment: felt252,
            amount_low: u128,
            amount_high: u128,
        ) {
            self._assert_not_paused();
            assert(commitment != 0, 'Mixer: zero commitment');
            assert(!self.commitments.read(commitment), 'Mixer: duplicate commitment');

            let amount: u256 = u256 { low: amount_low, high: amount_high };
            assert(amount > 0, 'Mixer: zero amount');

            // Transfer tokens from caller to this contract
            let caller = get_caller_address();
            let this = get_contract_address();
            let token = IERC20Dispatcher { contract_address: self.token.read() };
            let success = token.transfer_from(caller, this, amount);
            assert(success, 'Mixer: transfer failed');

            // Record commitment
            self.commitments.write(commitment, true);

            // Insert into Merkle tree (incremental)
            let leaf_index = self.next_leaf_index.read();
            self._insert_leaf(commitment);

            let count = self.deposit_count.read();
            self.deposit_count.write(count + 1);

            self.emit(DepositEvent {
                commitment,
                leaf_index,
                timestamp: get_block_timestamp(),
            });
        }

        fn withdraw(
            ref self: ContractState,
            nullifier_hash: felt252,
            recipient: ContractAddress,
            amount_low: u128,
            amount_high: u128,
            merkle_root: felt252,
            proof: Span<felt252>,
        ) {
            self._assert_not_paused();
            assert(!recipient.is_zero(), 'Mixer: zero recipient');
            assert(!self.nullifiers.read(nullifier_hash), 'Mixer: nullifier spent');
            assert(self._is_known_root(merkle_root), 'Mixer: unknown root');

            // Verify ZK proof
            let verifier = IVerifierDispatcher { contract_address: self.verifier.read() };
            let recipient_felt: felt252 = recipient.into();
            let valid = verifier.verify_proof(
                proof, merkle_root, nullifier_hash, recipient_felt, amount_low, amount_high,
            );
            assert(valid, 'Mixer: invalid proof');

            // Mark nullifier as spent
            self.nullifiers.write(nullifier_hash, true);

            // Calculate fee
            let amount: u256 = u256 { low: amount_low, high: amount_high };
            let fee_bps: u256 = self.fee_bps.read().into();
            let fee: u256 = (amount * fee_bps) / 10000;
            let payout: u256 = amount - fee;

            let token = IERC20Dispatcher { contract_address: self.token.read() };

            // Transfer payout to recipient
            if payout > 0 {
                let success = token.transfer(recipient, payout);
                assert(success, 'Mixer: payout failed');
            }

            // Transfer fee to fee recipient
            if fee > 0 {
                let fee_recipient = self.fee_recipient.read();
                if !fee_recipient.is_zero() {
                    let success = token.transfer(fee_recipient, fee);
                    assert(success, 'Mixer: fee transfer failed');
                }
            }

            self.emit(WithdrawalEvent {
                nullifier_hash,
                recipient,
                amount_low,
                amount_high,
                fee_low: fee.low,
                fee_high: fee.high,
            });
        }

        fn batch_deposit(
            ref self: ContractState,
            commitments: Span<felt252>,
            amounts_low: Span<u128>,
            amounts_high: Span<u128>,
        ) {
            self._assert_not_paused();
            assert(commitments.len() > 0, 'Mixer: empty batch');
            assert(commitments.len() == amounts_low.len(), 'Mixer: len mismatch');
            assert(commitments.len() == amounts_high.len(), 'Mixer: len mismatch');

            let mut i: u32 = 0;
            loop {
                if i >= commitments.len() {
                    break;
                }
                let commitment = *commitments.at(i);
                let amount_low = *amounts_low.at(i);
                let amount_high = *amounts_high.at(i);

                // Inline deposit logic
                assert(commitment != 0, 'Mixer: zero commitment');
                assert(!self.commitments.read(commitment), 'Mixer: duplicate commitment');

                let amount: u256 = u256 { low: amount_low, high: amount_high };
                assert(amount > 0, 'Mixer: zero amount');

                let caller = get_caller_address();
                let this = get_contract_address();
                let token = IERC20Dispatcher { contract_address: self.token.read() };
                let success = token.transfer_from(caller, this, amount);
                assert(success, 'Mixer: transfer failed');

                self.commitments.write(commitment, true);
                let leaf_index = self.next_leaf_index.read();
                self._insert_leaf(commitment);

                let count = self.deposit_count.read();
                self.deposit_count.write(count + 1);

                self.emit(DepositEvent {
                    commitment,
                    leaf_index,
                    timestamp: get_block_timestamp(),
                });

                i += 1;
            };
        }

        fn is_known_commitment(self: @ContractState, commitment: felt252) -> bool {
            self.commitments.read(commitment)
        }

        fn is_spent_nullifier(self: @ContractState, nullifier_hash: felt252) -> bool {
            self.nullifiers.read(nullifier_hash)
        }

        fn get_current_root(self: @ContractState) -> felt252 {
            self.current_root.read()
        }

        fn get_deposit_count(self: @ContractState) -> u32 {
            self.deposit_count.read()
        }

        fn is_paused(self: @ContractState) -> bool {
            self.paused.read()
        }

        fn pause(ref self: ContractState) {
            self._assert_admin();
            assert(!self.paused.read(), 'Mixer: already paused');
            self.paused.write(true);
            self.emit(PausedEvent {});
        }

        fn unpause(ref self: ContractState) {
            self._assert_admin();
            assert(self.paused.read(), 'Mixer: not paused');
            self.paused.write(false);
            self.emit(UnpausedEvent {});
        }

        fn set_fee(ref self: ContractState, fee_bps: u64) {
            self._assert_admin();
            assert(fee_bps <= 1000, 'Mixer: fee > 10%');
            let old = self.fee_bps.read();
            self.fee_bps.write(fee_bps);
            self.emit(FeeUpdatedEvent { old_fee_bps: old, new_fee_bps: fee_bps });
        }

        fn set_verifier(ref self: ContractState, verifier: ContractAddress) {
            self._assert_admin();
            assert(!verifier.is_zero(), 'Mixer: zero verifier');
            let old = self.verifier.read();
            self.verifier.write(verifier);
            self.emit(VerifierUpdatedEvent { old_verifier: old, new_verifier: verifier });
        }

        fn set_merkle_tree_contract(ref self: ContractState, _merkle_tree: ContractAddress) {
            self._assert_admin();
            // Reserved for external Merkle tree contract delegation
        }

        fn transfer_ownership(ref self: ContractState, new_admin: ContractAddress) {
            self._assert_admin();
            assert(!new_admin.is_zero(), 'Mixer: zero admin');
            let old = self.admin.read();
            self.admin.write(new_admin);
            self.emit(AdminTransferredEvent { old_admin: old, new_admin });
        }
    }

    // ── Internal helpers ─────────────────────────────────────────────────

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn _assert_admin(self: @ContractState) {
            let caller = get_caller_address();
            assert(caller == self.admin.read(), 'Mixer: not admin');
        }

        fn _assert_not_paused(self: @ContractState) {
            assert(!self.paused.read(), 'Mixer: paused');
        }

        fn _is_known_root(self: @ContractState, root: felt252) -> bool {
            // Check against stored historical roots (ring buffer of 100)
            let current_idx = self.current_root_index.read();
            let mut i: u32 = 0;
            let max_roots: u32 = 100;
            loop {
                if i >= max_roots {
                    break false;
                }
                let idx = if current_idx >= i {
                    current_idx - i
                } else {
                    break false;
                };
                if self.roots.read(idx) == root {
                    break true;
                }
                i += 1;
            }
        }

        /// Insert a leaf into the incremental Merkle tree and update the root.
        fn _insert_leaf(ref self: ContractState, leaf: felt252) {
            let mut current = leaf;
            let mut index = self.next_leaf_index.read();
            let mut i: u32 = 0;

            loop {
                if i >= TREE_DEPTH {
                    break;
                }

                if index % 2 == 0 {
                    // Left child: store as filled subtree, pair with zero
                    self.filled_subtrees.write(i, current);
                    // Zero hash at this level (simplified: use 0)
                    current = crate::lib::poseidon_utils::poseidon_hash_two(current, 0);
                } else {
                    // Right child: pair with stored left sibling
                    let left = self.filled_subtrees.read(i);
                    current = crate::lib::poseidon_utils::poseidon_hash_two(left, current);
                }

                index = index / 2;
                i += 1;
            };

            // Update root
            let new_root_index = self.current_root_index.read() + 1;
            self.current_root_index.write(new_root_index);
            self.current_root.write(current);
            self.roots.write(new_root_index, current);

            // Increment leaf index
            let next = self.next_leaf_index.read() + 1;
            self.next_leaf_index.write(next);
        }
    }
}
