/// ZephyrMerkleTree: Standalone on-chain Merkle tree for commitment storage.
///
/// This can be used as a dedicated Merkle tree contract, or the mixer
/// can use its own internal incremental tree. This provides an external
/// interface for root relayers and DAO governance.

#[starknet::contract]
mod ZephyrMerkleTree {
    use starknet::{ContractAddress, get_caller_address};
    use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess};
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
    use core::num::traits::Zero;

    use crate::lib::poseidon_utils::poseidon_hash_two;
    use crate::lib::merkle_tree::TREE_DEPTH;

    #[storage]
    struct Storage {
        admin: ContractAddress,
        /// The current root
        current_root: felt252,
        /// Historical roots (ring buffer)
        roots: Map<u32, felt252>,
        root_count: u32,
        /// Next leaf index
        next_leaf_index: u32,
        /// Filled subtrees for incremental insertion
        filled_subtrees: Map<u32, felt252>,
        /// Leaves stored for proof generation
        leaves: Map<u32, felt252>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        LeafInserted: LeafInsertedEvent,
        RootSet: RootSetEvent,
    }

    #[derive(Drop, starknet::Event)]
    struct LeafInsertedEvent {
        #[key]
        leaf: felt252,
        index: u32,
        new_root: felt252,
    }

    #[derive(Drop, starknet::Event)]
    struct RootSetEvent {
        #[key]
        root: felt252,
        index: u32,
    }

    #[constructor]
    fn constructor(ref self: ContractState, admin: ContractAddress) {
        assert(!admin.is_zero(), 'MerkleTree: zero admin');
        self.admin.write(admin);
        self.next_leaf_index.write(0);
        self.root_count.write(0);
        self.current_root.write(0);
    }

    #[abi(embed_v0)]
    impl MerkleTreeImpl of IMerkleTreeExternal<ContractState> {
        /// Insert a new leaf and return the new root.
        fn insert(ref self: ContractState, leaf: felt252) -> felt252 {
            let caller = get_caller_address();
            assert(caller == self.admin.read(), 'MerkleTree: not admin');

            let leaf_index = self.next_leaf_index.read();
            self.leaves.write(leaf_index, leaf);

            let mut current = leaf;
            let mut index = leaf_index;
            let mut i: u32 = 0;

            loop {
                if i >= TREE_DEPTH {
                    break;
                }

                if index % 2 == 0 {
                    self.filled_subtrees.write(i, current);
                    current = poseidon_hash_two(current, 0);
                } else {
                    let left = self.filled_subtrees.read(i);
                    current = poseidon_hash_two(left, current);
                }

                index = index / 2;
                i += 1;
            };

            let new_root = current;
            let root_idx = self.root_count.read() + 1;
            self.roots.write(root_idx, new_root);
            self.root_count.write(root_idx);
            self.current_root.write(new_root);
            self.next_leaf_index.write(leaf_index + 1);

            self.emit(LeafInsertedEvent { leaf, index: leaf_index, new_root });

            new_root
        }

        /// Set root directly (for relayer / DAO governance).
        fn set_root(ref self: ContractState, root: felt252) {
            let caller = get_caller_address();
            assert(caller == self.admin.read(), 'MerkleTree: not admin');

            let root_idx = self.root_count.read() + 1;
            self.roots.write(root_idx, root);
            self.root_count.write(root_idx);
            self.current_root.write(root);

            self.emit(RootSetEvent { root, index: root_idx });
        }

        fn get_root(self: @ContractState) -> felt252 {
            self.current_root.read()
        }

        fn get_leaf(self: @ContractState, index: u32) -> felt252 {
            self.leaves.read(index)
        }

        fn get_leaf_count(self: @ContractState) -> u32 {
            self.next_leaf_index.read()
        }

        fn is_known_root(self: @ContractState, root: felt252) -> bool {
            let count = self.root_count.read();
            let mut i: u32 = 0;
            let max_check: u32 = if count > 100 { 100 } else { count };
            loop {
                if i >= max_check {
                    break false;
                }
                let idx = count - i;
                if self.roots.read(idx) == root {
                    break true;
                }
                i += 1;
            }
        }
    }

    #[starknet::interface]
    trait IMerkleTreeExternal<TContractState> {
        fn insert(ref self: TContractState, leaf: felt252) -> felt252;
        fn set_root(ref self: TContractState, root: felt252);
        fn get_root(self: @TContractState) -> felt252;
        fn get_leaf(self: @TContractState, index: u32) -> felt252;
        fn get_leaf_count(self: @TContractState) -> u32;
        fn is_known_root(self: @TContractState, root: felt252) -> bool;
    }
}
