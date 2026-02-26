import { Account, uint256 } from "starknet";
import { CONTRACTS } from "@/starknet/contracts";

export interface WithdrawParams {
  account: Account;
  nullifierHash: string;
  recipient: string;
  amountSats: bigint;
  merkleRoot: string;
  proof: string[];
}

export interface WithdrawResult {
  txHash: string;
}

/**
 * Submit a withdrawal to the ZephyrMixer contract.
 * 
 * The withdrawal requires a valid ZK proof demonstrating:
 * 1. Knowledge of a secret for a commitment in the Merkle tree
 * 2. The commitment corresponds to the claimed amount
 * 3. The nullifier hash is correctly derived
 * 
 * The mixer contract will:
 * - Verify the ZK proof via the verifier contract
 * - Check the nullifier hasn't been spent (prevents double-spend)
 * - Check the Merkle root is valid
 * - Transfer tokens minus fee to the recipient
 */
export async function submitWithdraw({
  account,
  nullifierHash,
  recipient,
  amountSats,
  merkleRoot,
  proof,
}: WithdrawParams): Promise<WithdrawResult> {
  const contractAddress = CONTRACTS.withdraw.address;
  if (!contractAddress) {
    throw new Error("Mixer contract address not configured. Set VITE_MIXER_CONTRACT in your environment.");
  }

  const amount = uint256.bnToUint256(amountSats);

  // Build calldata: nullifier_hash, recipient, amount_low, amount_high, merkle_root, proof_len, ...proof
  const calldata = [
    nullifierHash,
    recipient,
    amount.low.toString(),
    amount.high.toString(),
    merkleRoot,
    proof.length.toString(),
    ...proof,
  ];

  const call = {
    contractAddress,
    entrypoint: "withdraw",
    calldata,
  };

  const res = await account.execute(call);

  return {
    txHash: res.transaction_hash,
  };
}
