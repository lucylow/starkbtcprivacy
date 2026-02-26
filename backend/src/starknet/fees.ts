import { Account, InvocationsDetails, UniversalDeployerContractPayload } from 'starknet';

type Invocation =
  | {
      contractAddress: string;
      entrypoint: string;
      calldata?: Array<string | bigint>;
    }
  | UniversalDeployerContractPayload;

export async function estimateSafeFee(
  account: Account,
  call: Invocation | Invocation[]
) {
  const estimate = await account.estimateInvokeFee(call as any);
  return {
    suggestedMaxFee: (estimate.suggestedMaxFee * 12n) / 10n // +20%
  };
}

