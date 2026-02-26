import { useCallback, useEffect, useMemo, useState } from "react";
import { connect, disconnect } from "@starknet-io/get-starknet";
import type { StarknetWindowObject } from "@starknet-io/get-starknet";
import { Account, RpcProvider } from "starknet";
import { useToast } from "@/components/ui/use-toast";

export interface WalletStatus {
  isConnected: boolean;
  address?: string;
  chainId?: string;
  account?: Account;
  wallet?: StarknetWindowObject;
  isConnecting: boolean;
  supportedWallets: StarknetWindowObject[];
}

export const CHAIN_ID = {
  MAINNET: "0x534e5f4d41494e",
  SEPOLIA: "0x534e5f5345504f4c4941",
  DEVNET: "0x534e5f4445564e4554",
} as const;

export type Network = "mainnet" | "sepolia" | "devnet";

export interface WalletConnection {
  status: WalletStatus;
  connectWallet: (walletId?: string) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  switchNetwork: (network: Network) => Promise<void>;
  refreshStatus: () => Promise<void>;
}

export const useWalletConnection = (
  network: Network = "sepolia",
): WalletConnection => {
  const [status, setStatus] = useState<WalletStatus>({
    isConnected: false,
    isConnecting: false,
    supportedWallets: [],
  });
  const { toast } = useToast();

  const RPC_URLS: Record<Network, string> = useMemo(
    () => ({
      mainnet: "https://starknet-mainnet.public.blastapi.io",
      sepolia: "https://starknet-sepolia.public.blastapi.io",
      devnet: "http://localhost:5050/rpc",
    }),
    [],
  );

  const provider = useMemo(() => {
    return new RpcProvider({ nodeUrl: RPC_URLS[network] });
  }, [network, RPC_URLS]);

  const refreshStatus = useCallback(async () => {
    // No-op for now; status is updated on connect/disconnect
  }, []);

  const connectWallet = useCallback(
    async (_walletId?: string) => {
      if (status.isConnecting) return;

      setStatus((prev) => ({ ...prev, isConnecting: true }));

      try {
        const wallet = await connect({
          modalMode: "alwaysAsk",
          modalTheme: "dark",
        });

        if (!wallet) {
          throw new Error("No wallet selected");
        }

        const address = (wallet as any).selectedAddress || (wallet as any).account?.address;

        if (!address) {
          throw new Error("No address returned from wallet");
        }

        setStatus({
          isConnected: true,
          address: String(address),
          chainId: undefined,
          account: undefined,
          wallet,
          isConnecting: false,
          supportedWallets: [wallet],
        });

        toast({
          title: "Wallet Connected",
          description: `Connected with ${wallet.id}`,
        });
      } catch (error: any) {
        console.error("Wallet connection failed:", error);
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: error?.message ?? "Failed to connect wallet",
        });
        setStatus((prev) => ({ ...prev, isConnecting: false }));
      }
    },
    [status.isConnecting, toast],
  );

  const disconnectWallet = useCallback(async () => {
    try {
      await disconnect();
      setStatus({
        isConnected: false,
        isConnecting: false,
        supportedWallets: [],
        address: undefined,
        chainId: undefined,
        account: undefined,
        wallet: undefined,
      });
      toast({
        title: "Wallet Disconnected",
      });
    } catch (error) {
      console.error("Disconnect failed:", error);
    }
  }, [toast]);

  const switchNetwork = useCallback(
    async (targetNetwork: Network) => {
      if (!status.wallet) return;

      try {
        const targetChainId =
          CHAIN_ID[targetNetwork.toUpperCase() as keyof typeof CHAIN_ID];
        await (status.wallet as any).request?.({ type: "wallet_switchStarknetChain", params: { chainId: targetChainId } });

        toast({
          title: "Network Switched",
          description: `Switched to ${targetNetwork}`,
        });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Network Switch Failed",
          description: error?.message ?? "Failed to switch network",
        });
      }
    },
    [status.wallet, toast],
  );

  return {
    status,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    refreshStatus,
  };
};
