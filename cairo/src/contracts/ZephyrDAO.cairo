// Zephyr DAO: proposal lifecycle, snapshot-based voting, timelock execution with calldata.
// Voting power = get_past_votes(account, proposal.creation_block).

mod ZephyrDAO {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp, get_block_number, call_contract};
    use starknet::storage::LegacyMap;
    use array::{ArrayTrait, SpanTrait};
    use core::integer::{u256, u64};
    use core::traits::Into;
    use core::bool::BoolTrait;

    use crate::interfaces::IGovToken::IGovTokenDispatcher;

    const VOTING_PERIOD_BLOCKS: u64 = 1440;
    const VOTING_DELAY_BLOCKS: u64 = 20;
    const EXECUTION_DELAY_SECS: u64 = 2 * 24 * 3600;
    const EXECUTION_GRACE_SECS: u64 = 7 * 24 * 3600;
    const QUORUM_BPS: u64 = 400;
    const APPROVAL_THRESHOLD_BPS: u64 = 5000;

    #[derive(Drop, Serde, Copy)]
    enum ProposalState {
        Pending,
        Active,
        Succeeded,
        Defeated,
        Queued,
        Executed,
        Expired,
        Canceled,
    }

    #[derive(Drop, Serde, starknet::Store)]
    struct Proposal {
        id: u256,
        proposer: ContractAddress,
        creation_block: u64,
        targets: array::Array<ContractAddress>,
        values: array::Array<u256>,
        selectors: array::Array<core::felt252>,
        calldata_flattened: array::Array<core::felt252>,
        calldata_lengths: array::Array<u32>,
        description_hash: core::felt252,

        start_block: u64,
        end_block: u64,
        eta: u64,

        for_votes: u256,
        against_votes: u256,
        abstain_votes: u256,

        canceled: bool,
        executed: bool,
    }

    #[derive(Drop, Serde, starknet::Store)]
    struct Receipt {
        has_voted: bool,
        support: u8,
        votes: u256,
    }

    #[storage]
    struct Storage {
        gov_token: ContractAddress,
        admin: ContractAddress,
        guardian: ContractAddress,

        proposals: LegacyMap<u256, Proposal>,
        latest_proposal_ids: LegacyMap<ContractAddress, u256>,
        next_proposal_id: u256,

        receipts: LegacyMap<(u256, ContractAddress), Receipt>,

        quorum_bps: u64,
        approval_threshold_bps: u64,
        voting_period_blocks: u64,
        voting_delay_blocks: u64,
        execution_delay_secs: u64,
        execution_grace_secs: u64,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        ProposalCreated: ProposalCreated,
        VoteCast: VoteCast,
        ProposalQueued: ProposalQueued,
        ProposalExecuted: ProposalExecuted,
        ProposalCanceled: ProposalCanceled,
        ParamsUpdated: ParamsUpdated,
    }

    #[derive(Drop, starknet::Event)]
    struct ProposalCreated {
        #[key]
        id: u256,
        #[key]
        proposer: ContractAddress,
        creation_block: u64,
        start_block: u64,
        end_block: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct VoteCast {
        #[key]
        voter: ContractAddress,
        #[key]
        proposal_id: u256,
        support: u8,
        votes: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct ProposalQueued {
        #[key]
        id: u256,
        eta: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct ProposalExecuted {
        #[key]
        id: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct ProposalCanceled {
        #[key]
        id: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct ParamsUpdated {
        quorum_bps: u64,
        approval_threshold_bps: u64,
        voting_period_blocks: u64,
        voting_delay_blocks: u64,
        execution_delay_secs: u64,
        execution_grace_secs: u64,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        gov_token: ContractAddress,
        admin: ContractAddress,
        guardian: ContractAddress,
    ) {
        self.gov_token.write(gov_token);
        self.admin.write(admin);
        self.guardian.write(guardian);
        self.next_proposal_id.write(1_u256);

        self.quorum_bps.write(QUORUM_BPS);
        self.approval_threshold_bps.write(APPROVAL_THRESHOLD_BPS);
        self.voting_period_blocks.write(VOTING_PERIOD_BLOCKS);
        self.voting_delay_blocks.write(VOTING_DELAY_BLOCKS);
        self.execution_delay_secs.write(EXECUTION_DELAY_SECS);
        self.execution_grace_secs.write(EXECUTION_GRACE_SECS);
    }

    #[abi(embed_v0)]
    impl DAOImpl of super::IZephyrDAO<ContractState> {
        fn create_proposal(
            ref self: ContractState,
            targets: array::Array<ContractAddress>,
            values: array::Array<u256>,
            selectors: array::Array<core::felt252>,
            calldata_flattened: array::Array<core::felt252>,
            calldata_lengths: array::Array<u32>,
            description_hash: core::felt252,
        ) -> u256 {
            let proposer = get_caller_address();
            let creation_block = get_block_number();

            assert(targets.len() > 0, 'DAO: empty proposal');
            assert(
                targets.len() == values.len() && values.len() == selectors.len(),
                'DAO: len mismatch'
            );
            assert(calldata_lengths.len() == targets.len(), 'DAO: calldata lengths len');

            let latest_id = self.latest_proposal_ids.read(proposer);
            if latest_id != 0_u256 {
                let state = self._state(latest_id);
                match state {
                    ProposalState::Pending | ProposalState::Active => {
                        panic('DAO: proposer has live proposal');
                    },
                    _ => {},
                }
            }

            let token = IGovTokenDispatcher { contract_address: self.gov_token.read() };
            let voting_power = token.get_past_votes(proposer, creation_block);
            assert(voting_power > 0_u256, 'DAO: no votes');

            let id = self.next_proposal_id.read();
            let start_block = creation_block + self.voting_delay_blocks.read();
            let end_block = start_block + self.voting_period_blocks.read();

            let prop = Proposal {
                id,
                proposer,
                creation_block,
                targets,
                values,
                selectors,
                calldata_flattened,
                calldata_lengths,
                description_hash,
                start_block,
                end_block,
                eta: 0,
                for_votes: 0_u256,
                against_votes: 0_u256,
                abstain_votes: 0_u256,
                canceled: false,
                executed: false,
            };

            self.proposals.write(id, prop);
            self.latest_proposal_ids.write(proposer, id);
            self.next_proposal_id.write(id + 1_u256);

            self.emit(ProposalCreated { id, proposer, creation_block, start_block, end_block });
            id
        }

        fn cast_vote(ref self: ContractState, proposal_id: u256, support: u8) {
            assert(support <= 2, 'DAO: invalid support');
            let voter = get_caller_address();
            let mut prop = self.proposals.read(proposal_id);
            assert(prop.id == proposal_id, 'DAO: unknown proposal');

            let state = self._state(proposal_id);
            assert(state == ProposalState::Active, 'DAO: not active');

            let receipt = self.receipts.read((proposal_id, voter));
            assert(!receipt.has_voted, 'DAO: already voted');

            let token = IGovTokenDispatcher { contract_address: self.gov_token.read() };
            let votes = token.get_past_votes(voter, prop.creation_block);
            assert(votes > 0_u256, 'DAO: no votes');

            if support == 0_u8 {
                prop.against_votes = prop.against_votes + votes;
            } else if support == 1_u8 {
                prop.for_votes = prop.for_votes + votes;
            } else {
                prop.abstain_votes = prop.abstain_votes + votes;
            }

            self.proposals.write(proposal_id, prop);

            let new_receipt = Receipt { has_voted: true, support, votes };
            self.receipts.write((proposal_id, voter), new_receipt);
            self.emit(VoteCast { voter, proposal_id, support, votes });
        }

        fn queue(ref self: ContractState, proposal_id: u256) {
            let mut prop = self.proposals.read(proposal_id);
            assert(prop.id == proposal_id, 'DAO: unknown proposal');
            let state = self._state(proposal_id);
            assert(state == ProposalState::Succeeded, 'DAO: not succeeded');

            let eta = get_block_timestamp() + self.execution_delay_secs.read();
            prop.eta = eta;
            self.proposals.write(proposal_id, prop);
            self.emit(ProposalQueued { id: proposal_id, eta });
        }

        fn execute(ref self: ContractState, proposal_id: u256) {
            let mut prop = self.proposals.read(proposal_id);
            assert(prop.id == proposal_id, 'DAO: unknown proposal');
            let state = self._state(proposal_id);
            assert(state == ProposalState::Queued, 'DAO: not queued');

            let timestamp = get_block_timestamp();
            assert(timestamp >= prop.eta, 'DAO: too early');
            assert(
                timestamp <= prop.eta + self.execution_grace_secs.read(),
                'DAO: grace period over'
            );
            assert(!prop.executed, 'DAO: already executed');

            let mut i: u32 = 0;
            let num_actions = prop.targets.len();
            loop {
                if i >= num_actions {
                    break;
                }

                let target = *prop.targets.at(i);
                let selector = *prop.selectors.at(i);

                let mut action_calldata = array::ArrayTrait::new();
                let start = self._calldata_start(@prop.calldata_lengths, i);
                let len = *prop.calldata_lengths.at(i);
                let mut j: u32 = 0;
                loop {
                    if j >= len {
                        break;
                    }
                    action_calldata.append(*prop.calldata_flattened.at(start + j));
                    j += 1;
                };

                let _ = call_contract(target, selector, action_calldata.span())
                    .expect('DAO: call failed');

                i += 1;
            };

            prop.executed = true;
            self.proposals.write(proposal_id, prop);
            self.emit(ProposalExecuted { id: proposal_id });
        }

        fn cancel(ref self: ContractState, proposal_id: u256) {
            let caller = get_caller_address();
            let mut prop = self.proposals.read(proposal_id);
            assert(prop.id == proposal_id, 'DAO: unknown proposal');
            assert(!prop.canceled, 'DAO: already canceled');
            assert(!prop.executed, 'DAO: already executed');

            let guardian = self.guardian.read();
            if caller == guardian {
                // guardian can always cancel
            } else {
                assert(caller == prop.proposer, 'DAO: not proposer/guardian');
                let token = IGovTokenDispatcher { contract_address: self.gov_token.read() };
                let votes = token.get_past_votes(prop.proposer, prop.creation_block);
                assert(votes == 0_u256, 'DAO: proposer still has votes');
            }

            prop.canceled = true;
            self.proposals.write(proposal_id, prop);
            self.emit(ProposalCanceled { id: proposal_id });
        }

        fn state(self: @ContractState, proposal_id: u256) -> ProposalState {
            self._state(proposal_id)
        }

        fn get_proposal(self: @ContractState, proposal_id: u256) -> Proposal {
            self.proposals.read(proposal_id)
        }

        fn get_receipt(
            self: @ContractState,
            proposal_id: u256,
            voter: ContractAddress,
        ) -> Receipt {
            self.receipts.read((proposal_id, voter))
        }

        fn update_params(
            ref self: ContractState,
            quorum_bps: u64,
            approval_threshold_bps: u64,
            voting_period_blocks: u64,
            voting_delay_blocks: u64,
            execution_delay_secs: u64,
            execution_grace_secs: u64,
        ) {
            let caller = get_caller_address();
            assert(caller == self.admin.read(), 'DAO: only admin');

            self.quorum_bps.write(quorum_bps);
            self.approval_threshold_bps.write(approval_threshold_bps);
            self.voting_period_blocks.write(voting_period_blocks);
            self.voting_delay_blocks.write(voting_delay_blocks);
            self.execution_delay_secs.write(execution_delay_secs);
            self.execution_grace_secs.write(execution_grace_secs);

            self.emit(ParamsUpdated {
                quorum_bps,
                approval_threshold_bps,
                voting_period_blocks,
                voting_delay_blocks,
                execution_delay_secs,
                execution_grace_secs,
            });
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn _state(self: @ContractState, proposal_id: u256) -> ProposalState {
            let prop = self.proposals.read(proposal_id);
            assert(prop.id == proposal_id, 'DAO: unknown proposal');

            if prop.canceled {
                return ProposalState::Canceled;
            }
            if prop.executed {
                return ProposalState::Executed;
            }

            let block = get_block_number();

            if block <= prop.start_block {
                return ProposalState::Pending;
            }
            if block > prop.start_block && block <= prop.end_block {
                return ProposalState::Active;
            }

            let token = IGovTokenDispatcher { contract_address: self.gov_token.read() };
            let total_supply = token.total_supply();
            let total_votes = prop.for_votes + prop.against_votes + prop.abstain_votes;

            let quorum_ok = self._check_bps(total_votes, total_supply, self.quorum_bps.read());
            if !quorum_ok {
                return ProposalState::Defeated;
            }

            let approval_ok = self._check_bps(
                prop.for_votes,
                total_votes,
                self.approval_threshold_bps.read(),
            );
            if !approval_ok {
                return ProposalState::Defeated;
            }

            if prop.eta == 0 {
                return ProposalState::Succeeded;
            }

            let timestamp = get_block_timestamp();
            if timestamp < prop.eta {
                return ProposalState::Queued;
            }
            if timestamp > prop.eta + self.execution_grace_secs.read() {
                return ProposalState::Expired;
            }

            ProposalState::Queued
        }

        fn _check_bps(
            self: @ContractState,
            numerator: u256,
            denominator: u256,
            bps: u64,
        ) -> bool {
            if denominator == 0_u256 {
                return false;
            }
            let scale: u256 = 10000_u128.into();
            let num_scaled = numerator * scale;
            let rhs = denominator * (bps.into());
            num_scaled >= rhs
        }

        fn _calldata_start(self: @ContractState, lengths: @array::Array<u32>, action_index: u32) -> u32 {
            let mut start: u32 = 0;
            let mut i: u32 = 0;
            loop {
                if i >= action_index {
                    break;
                }
                start += *lengths.at(i);
                i += 1;
            };
            start
        }
    }
}

#[starknet::interface]
trait IZephyrDAO<TContractState> {
    fn create_proposal(
        ref self: TContractState,
        targets: array::Array<starknet::ContractAddress>,
        values: array::Array<core::integer::u256>,
        selectors: array::Array<core::felt252>,
        calldata_flattened: array::Array<core::felt252>,
        calldata_lengths: array::Array<u32>,
        description_hash: core::felt252,
    ) -> core::integer::u256;

    fn cast_vote(ref self: TContractState, proposal_id: core::integer::u256, support: u8);
    fn queue(ref self: TContractState, proposal_id: core::integer::u256);
    fn execute(ref self: TContractState, proposal_id: core::integer::u256);
    fn cancel(ref self: TContractState, proposal_id: core::integer::u256);

    fn state(self: @TContractState, proposal_id: core::integer::u256) -> ZephyrDAO::ProposalState;
    fn get_proposal(self: @TContractState, proposal_id: core::integer::u256) -> ZephyrDAO::Proposal;
    fn get_receipt(
        self: @TContractState,
        proposal_id: core::integer::u256,
        voter: starknet::ContractAddress,
    ) -> ZephyrDAO::Receipt;

    fn update_params(
        ref self: TContractState,
        quorum_bps: u64,
        approval_threshold_bps: u64,
        voting_period_blocks: u64,
        voting_delay_blocks: u64,
        execution_delay_secs: u64,
        execution_grace_secs: u64,
    );
}
