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
  isDemo: boolean;
  publicBalance?: string;
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
  connectDemo: () => void;
  disconnectWallet: () => Promise<void>;
  switchNetwork: (network: Network) => Promise<void>;
  refreshStatus: () => Promise<void>;
}

const DEMO_ADDRESS = "0x04a3B82D7138C3FE9aE6Da24b3E012Bc7Fc8eF5dC91A72EfB7469cA08DfE249A";

export const useWalletConnection = (
  network: Network = "sepolia",
): WalletConnection => {
  const [status, setStatus] = useState<WalletStatus>({
    isConnected: false,
    isConnecting: false,
    supportedWallets: [],
    isDemo: false,
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

  const refreshStatus = useCallback(async () => {}, []);

  const connectDemo = useCallback(() => {
    // Seed demo data into localStorage
    seedDemoData();

    setStatus({
      isConnected: true,
      address: DEMO_ADDRESS,
      chainId: CHAIN_ID.SEPOLIA,
      account: undefined,
      wallet: undefined,
      isConnecting: false,
      supportedWallets: [],
      isDemo: true,
      publicBalance: "1.2500",
    });

    toast({
      title: "Demo Mode Active",
      description: "Exploring with mock data. No real funds involved.",
    });
  }, [toast]);

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
          isDemo: false,
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
      if (!status.isDemo) {
        await disconnect();
      }
      setStatus({
        isConnected: false,
        isConnecting: false,
        supportedWallets: [],
        address: undefined,
        chainId: undefined,
        account: undefined,
        wallet: undefined,
        isDemo: false,
      });
      toast({
        title: "Wallet Disconnected",
      });
    } catch (error) {
      console.error("Disconnect failed:", error);
    }
  }, [toast, status.isDemo]);

  const switchNetwork = useCallback(
    async (targetNetwork: Network) => {
      if (status.isDemo) {
        toast({ title: "Network Switched", description: `Switched to ${targetNetwork} (demo)` });
        return;
      }
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
    [status.wallet, status.isDemo, toast],
  );

  return {
    status,
    connectWallet,
    connectDemo,
    disconnectWallet,
    switchNetwork,
    refreshStatus,
  };
};

/** Seed realistic mock data for demo mode */
function seedDemoData() {
  // Only seed if no existing data
  const existingSecrets = localStorage.getItem("zephyr_secrets");
  if (existingSecrets) {
    try {
      const parsed = JSON.parse(existingSecrets);
      if (parsed.length > 0) return; // Already has data
    } catch {}
  }

  const now = Date.now();
  const hour = 3600000;

  // Seed mock shielded notes (UTXOs)
  const mockSecrets = [
    {
      id: "demo-utxo-1",
      commitment: "0x0a1b2c3d4e5f6789abcdef0123456789abcdef0123456789abcdef0123456789",
      ciphertext: "demo-encrypted",
      amount: "50000000", // 0.5 BTC
      timestamp: now - 96 * hour, // 4 days ago
      spent: false,
    },
    {
      id: "demo-utxo-2",
      commitment: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890",
      ciphertext: "demo-encrypted",
      amount: "10000000", // 0.1 BTC
      timestamp: now - 48 * hour, // 2 days ago
      spent: false,
    },
    {
      id: "demo-utxo-3",
      commitment: "0x2a3b4c5d6e7f8901abcdef2345678901abcdef2345678901abcdef2345678901",
      ciphertext: "demo-encrypted",
      amount: "100000000", // 1.0 BTC
      timestamp: now - 192 * hour, // 8 days ago
      spent: false,
    },
    {
      id: "demo-utxo-spent",
      commitment: "0x3a4b5c6d7e8f9012abcdef3456789012abcdef3456789012abcdef3456789012",
      ciphertext: "demo-encrypted",
      amount: "25000000", // 0.25 BTC
      timestamp: now - 240 * hour,
      spent: true,
    },
  ];

  localStorage.setItem("zephyr_secrets", JSON.stringify(mockSecrets));

  // Seed activity log
  const mockActivity = [
    {
      id: "demo-act-1",
      type: "deposit",
      description: "Shielded 1.0000 strkBTC",
      amount: "1.0000",
      txHash: "0x7a8b9c0d1e2f3456789abcdef01234567890abcdef01234567890abcdef012345",
      status: "success",
      timestamp: now - 192 * hour,
    },
    {
      id: "demo-act-2",
      type: "deposit",
      description: "Shielded 0.5000 strkBTC",
      amount: "0.5000",
      txHash: "0x4a5b6c7d8e9f0123456789abcdef12345678abcdef12345678abcdef12345678",
      status: "success",
      timestamp: now - 96 * hour,
    },
    {
      id: "demo-act-3",
      type: "withdraw",
      description: "Unshielded 0.2500 strkBTC",
      amount: "0.2500",
      txHash: "0x1122334455667788990011223344556677889900112233445566778899001122",
      status: "success",
      timestamp: now - 72 * hour,
    },
    {
      id: "demo-act-4",
      type: "deposit",
      description: "Shielded 0.1000 strkBTC",
      amount: "0.1000",
      txHash: "0xaabbccddee00112233445566778899aabbccddee00112233445566778899aabb",
      status: "success",
      timestamp: now - 48 * hour,
    },
    {
      id: "demo-act-5",
      type: "proof",
      description: "ZK proof generated successfully",
      status: "success",
      timestamp: now - 72 * hour,
      note: "Proof for 0.25 BTC withdrawal",
    },
  ];

  localStorage.setItem("zephyr_activity", JSON.stringify(mockActivity));
}
