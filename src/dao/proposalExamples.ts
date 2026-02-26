/**
 * Zephyr DAO proposal examples: selectors and calldata layout for your stack.
 * Use these to build create_proposal( targets, values, selectors, calldata_flattened, calldata_lengths, description_hash ).
 *
 * Starknet selectors: use getSelectorFromName from 'starknet' (e.g. hash.getSelectorFromName or top-level).
 */

import { getSelectorFromName } from "starknet";

// --- Selectors (Starknet: hash of function name) ---

export const SELECTORS = {
  /** Merkle tree: set new root (used by rootRelayer). */
  set_root: () => getSelectorFromName("set_root"),
  /** Typical admin: transfer ownership to new address. */
  transfer_ownership: () => getSelectorFromName("transfer_ownership"),
  /** Typical admin: set admin address. */
  set_admin: () => getSelectorFromName("set_admin"),
  /** Typical fee setter. */
  set_fee: () => getSelectorFromName("set_fee"),
  /** Pause contract. */
  pause: () => getSelectorFromName("pause"),
  /** Unpause. */
  unpause: () => getSelectorFromName("unpause"),
  /** Update merkle tree contract (e.g. mixer). */
  set_merkle_tree_contract: () =>
    getSelectorFromName("set_merkle_tree_contract"),
  /** DEX: set fee recipient. */
  set_fee_recipient: () => getSelectorFromName("set_fee_recipient"),
  /** DEX: set pool fee (basis points or similar). */
  set_pool_fee: () => getSelectorFromName("set_pool_fee"),
} as const;

// --- Proposal payload type (matches ZephyrDAO.create_proposal) ---

export interface ProposalAction {
  target: string;
  value?: string;
  selector: string;
  calldata: string[];
}

export interface ZephyrProposalPayload {
  targets: string[];
  values: string[];
  selectors: string[];
  calldataFlattened: string[];
  calldataLengths: number[];
  descriptionHash: string;
}

/**
 * Build the flattened calldata and lengths arrays from a list of actions.
 * DAO expects: calldata_flattened = concat of all action calldatas, calldata_lengths = [len1, len2, ...].
 */
export function buildProposalPayload(
  actions: ProposalAction[],
  descriptionHash: string
): ZephyrProposalPayload {
  const targets: string[] = [];
  const values: string[] = [];
  const selectors: string[] = [];
  const calldataFlattened: string[] = [];
  const calldataLengths: number[] = [];

  for (const a of actions) {
    targets.push(a.target);
    values.push(a.value ?? "0");
    selectors.push(a.selector);
    calldataLengths.push(a.calldata.length);
    calldataFlattened.push(...a.calldata);
  }

  return {
    targets,
    values,
    selectors,
    calldataFlattened,
    calldataLengths,
    descriptionHash,
  };
}

// --- Example 1: Merkle set_root (matches backend rootRelayer) ---

/**
 * Single-action proposal: update Merkle root.
 * Target: MERKLE_CONTRACT_ADDRESS, selector: set_root, calldata: [root].
 */
export function buildMerkleSetRootProposal(
  merkleContractAddress: string,
  root: string,
  descriptionHash: string
): ZephyrProposalPayload {
  return buildProposalPayload(
    [
      {
        target: merkleContractAddress,
        value: "0",
        selector: SELECTORS.set_root(),
        calldata: [root],
      },
    ],
    descriptionHash
  );
}

// --- Example 2: ERC20 / private token admin ---

/**
 * Transfer ownership of a token contract to the DAO (or another address).
 * Calldata: [new_owner_felt].
 */
export function buildTransferOwnershipProposal(
  tokenContractAddress: string,
  newOwnerFelt: string,
  descriptionHash: string
): ZephyrProposalPayload {
  return buildProposalPayload(
    [
      {
        target: tokenContractAddress,
        value: "0",
        selector: SELECTORS.transfer_ownership(),
        calldata: [newOwnerFelt],
      },
    ],
    descriptionHash
  );
}

/**
 * Set admin on a contract. Calldata: [admin_felt].
 */
export function buildSetAdminProposal(
  targetContractAddress: string,
  adminFelt: string,
  descriptionHash: string
): ZephyrProposalPayload {
  return buildProposalPayload(
    [
      {
        target: targetContractAddress,
        value: "0",
        selector: SELECTORS.set_admin(),
        calldata: [adminFelt],
      },
    ],
    descriptionHash
  );
}

/**
 * Set fee (e.g. basis points). Calldata: [fee_low, fee_high] for u256 or [fee] for u64.
 * Adjust to match your contract ABI.
 */
export function buildSetFeeProposal(
  targetContractAddress: string,
  feeLow: string,
  feeHigh: string,
  descriptionHash: string
): ZephyrProposalPayload {
  return buildProposalPayload(
    [
      {
        target: targetContractAddress,
        value: "0",
        selector: SELECTORS.set_fee(),
        calldata: [feeLow, feeHigh],
      },
    ],
    descriptionHash
  );
}

// --- Example 3: Mixer / core protocol ---

/**
 * Update the Merkle tree contract address (e.g. on mixer). Calldata: [merkle_contract_felt].
 */
export function buildSetMerkleTreeContractProposal(
  mixerContractAddress: string,
  merkleContractFelt: string,
  descriptionHash: string
): ZephyrProposalPayload {
  return buildProposalPayload(
    [
      {
        target: mixerContractAddress,
        value: "0",
        selector: SELECTORS.set_merkle_tree_contract(),
        calldata: [merkleContractFelt],
      },
    ],
    descriptionHash
  );
}

// --- Example 4: DEX ---

/**
 * Set fee recipient on DEX. Calldata: [recipient_felt].
 */
export function buildSetFeeRecipientProposal(
  dexContractAddress: string,
  recipientFelt: string,
  descriptionHash: string
): ZephyrProposalPayload {
  return buildProposalPayload(
    [
      {
        target: dexContractAddress,
        value: "0",
        selector: SELECTORS.set_fee_recipient(),
        calldata: [recipientFelt],
      },
    ],
    descriptionHash
  );
}

/**
 * Set pool fee (e.g. basis points). Calldata: [fee_low, fee_high] or [fee] depending on ABI.
 */
export function buildSetPoolFeeProposal(
  dexContractAddress: string,
  feeLow: string,
  feeHigh: string,
  descriptionHash: string
): ZephyrProposalPayload {
  return buildProposalPayload(
    [
      {
        target: dexContractAddress,
        value: "0",
        selector: SELECTORS.set_pool_fee(),
        calldata: [feeLow, feeHigh],
      },
    ],
    descriptionHash
  );
}

// --- Example 5: Multi-action proposal (e.g. set root + pause) ---

/**
 * Multi-action: update Merkle root and pause mixer (if both are valid entrypoints).
 */
export function buildMerkleSetRootAndPauseProposal(
  merkleContractAddress: string,
  mixerContractAddress: string,
  root: string,
  descriptionHash: string
): ZephyrProposalPayload {
  return buildProposalPayload(
    [
      {
        target: merkleContractAddress,
        value: "0",
        selector: SELECTORS.set_root(),
        calldata: [root],
      },
      {
        target: mixerContractAddress,
        value: "0",
        selector: SELECTORS.pause(),
        calldata: [],
      },
    ],
    descriptionHash
  );
}
