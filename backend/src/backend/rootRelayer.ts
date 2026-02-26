import { Account } from 'starknet';
import { CONTRACTS } from '../starknet/contracts';

export async function updateRoot(relayer: Account, root: string) {
  return relayer.execute({
    contractAddress: CONTRACTS.merkle.address,
    entrypoint: 'set_root',
    calldata: [root]
  });
}

