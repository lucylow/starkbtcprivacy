import { Account } from "starknet";
import { CONTRACTS } from "@/starknet/contracts";

export interface WithdrawParams {
  account: Account;
  nullifier: string;
  recipient: string;
}

export interface WithdrawResult {
  txHash: string;
}

export async function submitWithdraw({
  account,
  nullifier,
  recipient,
}: WithdrawParams): Promise<WithdrawResult> {
  const call = {
    contractAddress: CONTRACTS.withdraw.address,
    entrypoint: "withdraw",
    calldata: [nullifier, recipient],
  };

  const res = await account.execute(call);

  return {
    txHash: res.transaction_hash,
  };
}

