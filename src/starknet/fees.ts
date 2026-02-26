import { Account } from "starknet";

export interface FeeEstimateResult {
  suggestedMaxFee: bigint;
}

export async function estimateSafeFee(
  account: Account,
  call: any,
): Promise<FeeEstimateResult> {
  const estimate = await account.estimateInvokeFee(call);
  const base = BigInt(estimate.suggestedMaxFee);
  const padded = (base * 12n) / 10n;

  return {
    suggestedMaxFee: padded,
  };
}

