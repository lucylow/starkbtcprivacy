import { Account, Contract, RpcProvider } from "starknet";

type SignerOrProvider = Account | RpcProvider;

export function getContract(abi: any, address: string, signer: SignerOrProvider) {
  return new Contract(abi, address, signer);
}

