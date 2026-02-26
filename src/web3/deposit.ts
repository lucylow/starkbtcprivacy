import { Account, uint256 } from "starknet";
import { CONTRACTS } from "@/starknet/contracts";

export interface DepositParams {
  account: Account;
  commitment: string;
  amountSats: bigint;
}

export interface DepositResult {
  txHash: string;
}

/**
 * Submit a deposit to the ZephyrMixer contract.
 * 
 * Prerequisites:
 * 1. User must have approved the mixer contract to spend `amountSats` of the ERC20 token.
 * 2. Commitment must be generated off-chain: Poseidon(secret, nullifier, amount_low, amount_high, randomness)
 * 
 * The mixer contract will:
 * - Transfer tokens from the user to the contract via transferFrom
 * - Record the commitment in the Merkle tree
 * - Emit a Deposit event with the leaf index
 */
export async function submitDeposit({
  account,
  commitment,
  amountSats,
}: DepositParams): Promise<DepositResult> {
  const contractAddress = CONTRACTS.deposit.address;
  if (!contractAddress) {
    throw new Error("Mixer contract address not configured. Set VITE_MIXER_CONTRACT in your environment.");
  }

  const amount = uint256.bnToUint256(amountSats);

  const call = {
    contractAddress,
    entrypoint: "deposit",
    calldata: [commitment, amount.low.toString(), amount.high.toString()],
  };

  const res = await account.execute(call);

  return {
    txHash: res.transaction_hash,
  };
}

/**
 * Approve the mixer contract to spend tokens on behalf of the user.
 * Must be called before deposit.
 */
export async function approveToken({
  account,
  tokenAddress,
  amountSats,
}: {
  account: Account;
  tokenAddress: string;
  amountSats: bigint;
}): Promise<string> {
  const mixerAddress = CONTRACTS.mixer.address;
  if (!mixerAddress) {
    throw new Error("Mixer contract address not configured.");
  }

  const amount = uint256.bnToUint256(amountSats);

  const call = {
    contractAddress: tokenAddress,
    entrypoint: "approve",
    calldata: [mixerAddress, amount.low.toString(), amount.high.toString()],
  };

  const res = await account.execute(call);
  return res.transaction_hash;
}
