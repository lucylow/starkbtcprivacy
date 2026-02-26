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

export async function submitDeposit({
  account,
  commitment,
  amountSats,
}: DepositParams): Promise<DepositResult> {
  const amount = uint256.bnToUint256(amountSats);

  const call = {
    contractAddress: CONTRACTS.deposit.address,
    entrypoint: "deposit",
    calldata: [commitment, amount.low.toString(), amount.high.toString()],
  };

  const res = await account.execute(call);

  return {
    txHash: res.transaction_hash,
  };
}

