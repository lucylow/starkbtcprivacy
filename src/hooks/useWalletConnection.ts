import { useCallback, useEffect, useMemo, useState } from "react";
import {
  connect,
  disconnect,
  getStarknet,
  StarknetWindowObject,
} from "@starknet-io/get-starknet";
import {
  Account,
  constants,
  RpcProvider,
} from "starknet";
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
  MAINNET: constants.ChainId.SN_MAIN,
  SEPOLIA: constants.ChainId.SN_SEPOLIA,
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
    try {
      const starknet = getStarknet();
      const { account, isConnected } = starknet;

      if (isConnected && account) {
        const chainId = await account.getChainId();
        setStatus({
          isConnected: true,
          address: account.address,
          chainId,
          account: account as Account,
          wallet: starknet,
          isConnecting: false,
          supportedWallets: starknet.accounts.map((w) => w.wallet!),
        });
      } else {
        setStatus({
          isConnected: false,
          isConnecting: false,
          supportedWallets: [],
          address: undefined,
          chainId: undefined,
          account: undefined,
          wallet: undefined,
        });
      }
    } catch (error) {
      console.error("Failed to refresh wallet status:", error);
      setStatus((prev) => ({ ...prev, isConnected: false }));
    }
  }, [provider]);

  const connectWallet = useCallback(
    async (walletId?: string) => {
      if (status.isConnecting) return;

      setStatus((prev) => ({ ...prev, isConnecting: true }));

      try {
        const modalMode = status.isConnected ? "neverAsk" : "alwaysAsk";

        const wallet = await connect({
          modalMode,
          modalTheme: "dark",
          ...(walletId && { preferredWallets: [walletId] }),
        });

        if (!wallet) {
          throw new Error("No wallet selected");
        }

        await wallet.enable({ showModal: false });

        const chainId = await wallet.request("starknet_chainId", []);
        const address = wallet.account?.address;

        if (!address) {
          throw new Error("No address returned from wallet");
        }

        setStatus({
          isConnected: true,
          address,
          chainId,
          account: wallet.account as Account,
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
    [status.isConnecting, status.isConnected, toast],
  );

  const disconnectWallet = useCallback(async () => {
    try {
      if (status.wallet) {
        await status.wallet.request("starknet_disconnect", []);
      }
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
  }, [status.wallet, toast]);

  const switchNetwork = useCallback(
    async (targetNetwork: Network) => {
      if (!status.wallet) return;

      try {
        const targetChainId =
          CHAIN_ID[targetNetwork.toUpperCase() as keyof typeof CHAIN_ID];
        await status.wallet.request("starknet_switchChain", [targetChainId]);

        await refreshStatus();

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
    [status.wallet, refreshStatus, toast],
  );

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    const starknet = getStarknet();

    const handleAccountChange = () => {
      void refreshStatus();
    };
    const handleChainChange = () => {
      void refreshStatus();
    };

    starknet.on("change:accounts", handleAccountChange);
    starknet.on("change:chainId", handleChainChange);

    return () => {
      starknet.off("change:accounts", handleAccountChange);
      starknet.off("change:chainId", handleChainChange);
    };
  }, [refreshStatus]);

  return {
    status,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    refreshStatus,
  };
};

