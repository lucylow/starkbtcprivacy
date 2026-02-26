/// ZephyrVerifier: ZK proof verification contract.
///
/// This contract verifies withdrawal proofs. In production, this would integrate
/// with the STWO prover/verifier. This implementation provides the interface
/// and structure for STWO integration.
///
/// Public inputs layout: [merkle_root, nullifier_hash, recipient, amount_low, amount_high]

#[starknet::contract]
mod ZephyrVerifier {
    use starknet::{ContractAddress, get_caller_address};
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
    use core::num::traits::Zero;

    #[storage]
    struct Storage {
        admin: ContractAddress,
        /// Verification key hash (set during deployment, derived from circuit)
        vk_hash: felt252,
        /// Whether the verifier is active
        active: bool,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        ProofVerified: ProofVerifiedEvent,
        VKUpdated: VKUpdatedEvent,
    }

    #[derive(Drop, starknet::Event)]
    struct ProofVerifiedEvent {
        #[key]
        nullifier_hash: felt252,
        valid: bool,
    }

    #[derive(Drop, starknet::Event)]
    struct VKUpdatedEvent {
        old_vk_hash: felt252,
        new_vk_hash: felt252,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        admin: ContractAddress,
        vk_hash: felt252,
    ) {
        assert(!admin.is_zero(), 'Verifier: zero admin');
        self.admin.write(admin);
        self.vk_hash.write(vk_hash);
        self.active.write(true);
    }

    #[abi(embed_v0)]
    impl VerifierImpl of crate::interfaces::IVerifier::IVerifier<ContractState> {
        fn verify_proof(
            self: @ContractState,
            proof: Span<felt252>,
            merkle_root: felt252,
            nullifier_hash: felt252,
            recipient: felt252,
            amount_low: u128,
            amount_high: u128,
        ) -> bool {
            assert(self.active.read(), 'Verifier: inactive');
            assert(proof.len() > 0, 'Verifier: empty proof');

            // Construct public inputs
            let mut public_inputs: Array<felt252> = ArrayTrait::new();
            public_inputs.append(merkle_root);
            public_inputs.append(nullifier_hash);
            public_inputs.append(recipient);
            public_inputs.append(amount_low.into());
            public_inputs.append(amount_high.into());

            // STWO verification placeholder:
            // In production, this calls the STWO Cairo verifier with:
            //   stwo::verify(proof, public_inputs.span(), self.vk_hash.read())
            //
            // For hackathon/testnet: verify proof structure is valid
            let valid = self._verify_proof_internal(proof, public_inputs.span());

            valid
        }

        fn batch_verify(
            self: @ContractState,
            proofs: Span<Span<felt252>>,
            merkle_roots: Span<felt252>,
            nullifier_hashes: Span<felt252>,
            recipients: Span<felt252>,
            amounts_low: Span<u128>,
            amounts_high: Span<u128>,
        ) -> bool {
            assert(self.active.read(), 'Verifier: inactive');
            let count = proofs.len();
            assert(count > 0, 'Verifier: empty batch');
            assert(count == merkle_roots.len(), 'Verifier: len mismatch');
            assert(count == nullifier_hashes.len(), 'Verifier: len mismatch');
            assert(count == recipients.len(), 'Verifier: len mismatch');
            assert(count == amounts_low.len(), 'Verifier: len mismatch');
            assert(count == amounts_high.len(), 'Verifier: len mismatch');

            let mut i: u32 = 0;
            loop {
                if i >= count {
                    break true;
                }

                let valid = self.verify_proof(
                    *proofs.at(i),
                    *merkle_roots.at(i),
                    *nullifier_hashes.at(i),
                    *recipients.at(i),
                    *amounts_low.at(i),
                    *amounts_high.at(i),
                );

                if !valid {
                    break false;
                }

                i += 1;
            }
        }
    }

    // ── Admin functions ──────────────────────────────────────────────────

    #[external(v0)]
    fn update_vk(ref self: ContractState, new_vk_hash: felt252) {
        let caller = get_caller_address();
        assert(caller == self.admin.read(), 'Verifier: not admin');
        let old = self.vk_hash.read();
        self.vk_hash.write(new_vk_hash);
        self.emit(VKUpdatedEvent { old_vk_hash: old, new_vk_hash });
    }

    #[external(v0)]
    fn set_active(ref self: ContractState, active: bool) {
        let caller = get_caller_address();
        assert(caller == self.admin.read(), 'Verifier: not admin');
        self.active.write(active);
    }

    #[external(v0)]
    fn get_vk_hash(self: @ContractState) -> felt252 {
        self.vk_hash.read()
    }

    // ── Internal ─────────────────────────────────────────────────────────

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        /// Internal proof verification.
        /// Production: Replace with STWO verifier call.
        /// Current: Validates proof structure and performs basic checks.
        fn _verify_proof_internal(
            self: @ContractState,
            proof: Span<felt252>,
            public_inputs: Span<felt252>,
        ) -> bool {
            // Proof must have at least 8 elements (typical STARK proof structure)
            if proof.len() < 8 {
                return false;
            }

            // Public inputs must have exactly 5 elements
            if public_inputs.len() != 5 {
                return false;
            }

            // Verify proof is bound to the correct verification key
            let vk = self.vk_hash.read();
            let proof_vk = *proof.at(0);

            // The first element of the proof should reference the VK
            // (In STWO, the circuit is bound to the VK during proof generation)
            if vk != 0 && proof_vk != vk {
                return false;
            }

            // STWO integration point:
            // let result = stwo_cairo_verifier::verify(
            //     proof,
            //     public_inputs,
            //     vk
            // );
            // return result == StwoStatus::Accept;

            // For testnet: accept valid-structure proofs
            true
        }
    }
}
