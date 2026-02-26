import { RpcProvider } from "starknet";

export type StarknetNetwork = "mainnet" | "sepolia" | "devnet";

const ENV_NETWORK =
  (import.meta.env.VITE_STARKNET_NETWORK as StarknetNetwork | undefined) ??
  "sepolia";

const RPC_URLS: Record<StarknetNetwork, string> = {
  mainnet: "https://starknet-mainnet.public.blastapi.io",
  sepolia: "https://starknet-sepolia.public.blastapi.io",
  devnet: "http://localhost:5050/rpc",
};

export const STARKNET_NETWORK: StarknetNetwork = ENV_NETWORK;

export const provider = new RpcProvider({
  nodeUrl: RPC_URLS[STARKNET_NETWORK],
});

