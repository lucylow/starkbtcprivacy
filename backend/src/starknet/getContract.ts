import { Account, Contract, RpcProvider } from 'starknet';

export function getContract(
  abi: any,
  address: string,
  signer: Account | RpcProvider
) {
  return new Contract(abi as any, address, signer);
}

