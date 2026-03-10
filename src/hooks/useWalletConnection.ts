import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  tokenBalances?: Record<string, string>;
  blockHeight?: number;
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
  adjustDemoBalance: (deltaBtc: number) => void;
}

const DEMO_ADDRESS = "0x04a3B82D7138C3FE9aE6Da24b3E012Bc7Fc8eF5dC91A72EfB7469cA08DfE249A";
const DEMO_STORAGE_KEY = "zephyr_demo_active";

const RPC_URLS: Record<Network, string> = {
  mainnet: "https://starknet-mainnet.public.blastapi.io",
  sepolia: "https://starknet-sepolia.public.blastapi.io",
  devnet: "http://localhost:5050/rpc",
};

/**
 * Extract address from various wallet object shapes.
 * Different wallet providers expose the address differently.
 */
function extractAddress(wallet: StarknetWindowObject): string | undefined {
  const w = wallet as any;
  return (
    w.selectedAddress ??
    w.account?.address ??
    w.provider?.selectedAddress ??
    undefined
  );
}

/**
 * Build a starknet.js Account from a connected wallet + provider.
 * Returns undefined if the wallet doesn't expose enough info.
 */
function buildAccount(
  wallet: StarknetWindowObject,
  address: string,
  rpcProvider: RpcProvider,
): Account | undefined {
  try {
    const w = wallet as any;
    // Prefer wallet's own account if it has execute()
    if (w.account && typeof w.account.execute === "function") {
      return w.account as Account;
    }
    // Fall back to constructing one from the wallet's provider
    const signer = w.provider ?? w;
    return new Account(rpcProvider, address, signer);
  } catch (err) {
    console.warn("[Zephyr] Could not build Account object:", err);
    return undefined;
  }
}

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
  const walletRef = useRef<StarknetWindowObject | null>(null);

  const provider = useMemo(() => {
    return new RpcProvider({ nodeUrl: RPC_URLS[network] });
  }, [network]);

  // ─── Event handlers for live wallet ───────────────────────────────
  const handleAccountsChanged = useCallback(
    (accounts?: string[]) => {
      console.info("[Zephyr] accountsChanged", accounts);
      const newAddr = accounts?.[0];
      if (!newAddr) {
        // Wallet locked or disconnected
        setStatus((prev) => ({
          ...prev,
          isConnected: false,
          address: undefined,
          account: undefined,
        }));
        toast({ title: "Wallet Disconnected", description: "Account no longer available." });
        return;
      }
      setStatus((prev) => {
        const acct = walletRef.current
          ? buildAccount(walletRef.current, newAddr, provider)
          : undefined;
        return { ...prev, address: newAddr, account: acct };
      });
    },
    [provider, toast],
  );

  const handleNetworkChanged = useCallback(
    (newChainId?: string) => {
      console.info("[Zephyr] networkChanged", newChainId);
      setStatus((prev) => ({ ...prev, chainId: newChainId }));

      const expectedChainId = CHAIN_ID[network.toUpperCase() as keyof typeof CHAIN_ID];
      if (newChainId && newChainId !== expectedChainId) {
        toast({
          variant: "destructive",
          title: "Network Mismatch",
          description: `Your wallet is on a different network. Please switch to Starknet ${network}.`,
        });
      }
    },
    [network, toast],
  );

  // Attach / detach wallet event listeners
  useEffect(() => {
    const wallet = walletRef.current as any;
    if (!wallet) return;

    wallet.on?.("accountsChanged", handleAccountsChanged);
    wallet.on?.("networkChanged", handleNetworkChanged);

    return () => {
      try {
        wallet.off?.("accountsChanged", handleAccountsChanged);
        wallet.off?.("networkChanged", handleNetworkChanged);
      } catch {
        // Some wallets don't support off()
      }
    };
  }, [handleAccountsChanged, handleNetworkChanged]);

  // ─── Auto-reconnect demo on mount ─────────────────────────────────
  useEffect(() => {
    const wasDemo = localStorage.getItem(DEMO_STORAGE_KEY);
    if (wasDemo === "true" && !status.isConnected) {
      const savedBalance = localStorage.getItem("zephyr_demo_balance") || "2.4500";
      setStatus(buildDemoStatus(savedBalance));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── refreshStatus ────────────────────────────────────────────────
  const refreshStatus = useCallback(async () => {
    const wallet = walletRef.current;
    if (!wallet) return;
    const address = extractAddress(wallet);
    if (!address) return;

    try {
      const chainId = await (wallet as any).provider?.getChainId?.();
      setStatus((prev) => ({
        ...prev,
        address,
        chainId: chainId ?? prev.chainId,
        account: buildAccount(wallet, address, provider),
      }));
    } catch (err) {
      console.warn("[Zephyr] refreshStatus failed:", err);
    }
  }, [provider]);

  // ─── connectDemo ──────────────────────────────────────────────────
  const connectDemo = useCallback(() => {
    seedDemoData();
    const initialBalance = "2.4500";
    localStorage.setItem(DEMO_STORAGE_KEY, "true");
    localStorage.setItem("zephyr_demo_balance", initialBalance);
    setStatus(buildDemoStatus(initialBalance));
    toast({
      title: "🎮 Demo Mode Active",
      description: "Exploring with mock data — no real funds involved.",
    });
  }, [toast]);

  // ─── adjustDemoBalance ────────────────────────────────────────────
  const adjustDemoBalance = useCallback((deltaBtc: number) => {
    setStatus((prev) => {
      if (!prev.isDemo) return prev;
      const current = parseFloat(prev.publicBalance || "0");
      const next = Math.max(0, current + deltaBtc).toFixed(4);
      localStorage.setItem("zephyr_demo_balance", next);
      return { ...prev, publicBalance: next };
    });
  }, []);

  // ─── connectWallet ────────────────────────────────────────────────
  const connectWallet = useCallback(
    async (_walletId?: string) => {
      if (status.isConnecting) return;
      setStatus((prev) => ({ ...prev, isConnecting: true }));

      try {
        console.debug("[Zephyr] connectAttempt");

        const wallet = await connect({
          modalMode: "alwaysAsk",
          modalTheme: "dark",
        });

        if (!wallet) {
          throw new Error("No wallet selected. Please choose Argent or Braavos.");
        }

        // Enable the wallet (some versions require this)
        try {
          await (wallet as any).enable?.({ starknetVersion: "v5" });
        } catch {
          // enable() not available or already enabled — continue
        }

        const address = extractAddress(wallet);
        if (!address) {
          throw new Error(
            "Wallet connected but no address returned. Please unlock your wallet and try again.",
          );
        }

        // Build Account object for transaction signing
        const account = buildAccount(wallet, address, provider);

        // Try to get chainId
        let chainId: string | undefined;
        try {
          chainId = await (wallet as any).provider?.getChainId?.();
        } catch {
          // chainId not available — non-fatal
        }

        walletRef.current = wallet;
        localStorage.removeItem(DEMO_STORAGE_KEY);

        const newStatus: WalletStatus = {
          isConnected: true,
          address: String(address),
          chainId,
          account,
          wallet,
          isConnecting: false,
          supportedWallets: [wallet],
          isDemo: false,
        };

        setStatus(newStatus);
        console.info("[Zephyr] connected", { address, chainId });

        // Warn if wrong network
        const expectedChainId = CHAIN_ID[network.toUpperCase() as keyof typeof CHAIN_ID];
        if (chainId && chainId !== expectedChainId) {
          toast({
            variant: "destructive",
            title: "Network Mismatch",
            description: `Switch your wallet to Starknet ${network} for this dApp.`,
          });
        } else {
          toast({ title: "Wallet Connected", description: `Connected with ${wallet.id ?? "wallet"}` });
        }
      } catch (error: any) {
        console.error("[Zephyr] connectFailed:", error);

        // User-friendly error messages
        let message = error?.message ?? "Failed to connect wallet";
        if (message.includes("User abort") || message.includes("reject")) {
          message = "Connection cancelled. Please try again when ready.";
        }

        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: message,
        });
        setStatus((prev) => ({ ...prev, isConnecting: false }));
      }
    },
    [status.isConnecting, toast, provider, network],
  );

  // ─── disconnectWallet ─────────────────────────────────────────────
  const disconnectWallet = useCallback(async () => {
    try {
      if (!status.isDemo) {
        try {
          await disconnect();
        } catch (err) {
          console.warn("[Zephyr] disconnect() error (non-fatal):", err);
        }
      }
      walletRef.current = null;
      localStorage.removeItem(DEMO_STORAGE_KEY);
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
      toast({ title: "Wallet Disconnected" });
    } catch (error) {
      console.error("[Zephyr] disconnect failed:", error);
    }
  }, [toast, status.isDemo]);

  // ─── switchNetwork ────────────────────────────────────────────────
  const switchNetwork = useCallback(
    async (targetNetwork: Network) => {
      if (status.isDemo) {
        toast({ title: "Network Switched", description: `Switched to ${targetNetwork} (demo)` });
        return;
      }
      const wallet = walletRef.current ?? status.wallet;
      if (!wallet) {
        toast({
          variant: "destructive",
          title: "No Wallet",
          description: "Connect a wallet first to switch networks.",
        });
        return;
      }
      try {
        const targetChainId = CHAIN_ID[targetNetwork.toUpperCase() as keyof typeof CHAIN_ID];
        await (wallet as any).request?.({
          type: "wallet_switchStarknetChain",
          params: { chainId: targetChainId },
        });
        toast({ title: "Network Switched", description: `Switched to ${targetNetwork}` });
      } catch (error: any) {
        console.error("[Zephyr] switchNetwork failed:", error);
        toast({
          variant: "destructive",
          title: "Network Switch Failed",
          description: error?.message ?? "Failed to switch network. Please switch manually in your wallet.",
        });
      }
    },
    [status.wallet, status.isDemo, toast],
  );

  return { status, connectWallet, connectDemo, disconnectWallet, switchNetwork, refreshStatus, adjustDemoBalance };
};

// ─── Helpers ──────────────────────────────────────────────────────────

function buildDemoStatus(balance: string): WalletStatus {
  return {
    isConnected: true,
    address: DEMO_ADDRESS,
    chainId: CHAIN_ID.SEPOLIA,
    account: undefined,
    wallet: undefined,
    isConnecting: false,
    supportedWallets: [],
    isDemo: true,
    publicBalance: balance,
    blockHeight: 847_231 + Math.floor(Math.random() * 100),
    tokenBalances: {
      strkBTC: balance,
      STRK: (1_247.83 + Math.random() * 100).toFixed(2),
      ETH: (0.85 + Math.random() * 0.3).toFixed(4),
      USDC: (3_420.50 + Math.random() * 200).toFixed(2),
    },
  };
}

/** Seed realistic mock data for demo mode */
function seedDemoData() {
  const existingSecrets = localStorage.getItem("zephyr_secrets");
  if (existingSecrets) {
    try {
      const parsed = JSON.parse(existingSecrets);
      if (parsed.length > 0) return;
    } catch {}
  }

  const now = Date.now();
  const hour = 3600000;

  const mockSecrets = [
    { id: "demo-utxo-1", commitment: "0x0a1b2c3d4e5f6789abcdef0123456789abcdef0123456789abcdef0123456789", ciphertext: "demo-encrypted", amount: "50000000", timestamp: now - 96 * hour, spent: false },
    { id: "demo-utxo-2", commitment: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890", ciphertext: "demo-encrypted", amount: "10000000", timestamp: now - 48 * hour, spent: false },
    { id: "demo-utxo-3", commitment: "0x2a3b4c5d6e7f8901abcdef2345678901abcdef2345678901abcdef2345678901", ciphertext: "demo-encrypted", amount: "100000000", timestamp: now - 192 * hour, spent: false },
    { id: "demo-utxo-4", commitment: "0x4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c", ciphertext: "demo-encrypted", amount: "25000000", timestamp: now - 24 * hour, spent: false },
    { id: "demo-utxo-5", commitment: "0x5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d", ciphertext: "demo-encrypted", amount: "5000000", timestamp: now - 12 * hour, spent: false },
    { id: "demo-utxo-spent-1", commitment: "0x3a4b5c6d7e8f9012abcdef3456789012abcdef3456789012abcdef3456789012", ciphertext: "demo-encrypted", amount: "25000000", timestamp: now - 240 * hour, spent: true },
    { id: "demo-utxo-spent-2", commitment: "0x6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e", ciphertext: "demo-encrypted", amount: "75000000", timestamp: now - 168 * hour, spent: true },
  ];

  localStorage.setItem("zephyr_secrets", JSON.stringify(mockSecrets));

  const mockActivity = [
    { id: "demo-act-1", type: "deposit", description: "Shielded 1.0000 strkBTC", amount: "1.0000", txHash: "0x7a8b9c0d1e2f3456789abcdef01234567890abcdef01234567890abcdef012345", status: "success", timestamp: now - 192 * hour },
    { id: "demo-act-2", type: "deposit", description: "Shielded 0.7500 strkBTC", amount: "0.7500", txHash: "0x8b9c0d1e2f34567890abcdef12345678901abcdef12345678901abcdef1234567", status: "success", timestamp: now - 168 * hour },
    { id: "demo-act-3", type: "withdraw", description: "Unshielded 0.7500 strkBTC", amount: "0.7500", txHash: "0x9c0d1e2f345678901abcdef23456789012abcdef23456789012abcdef23456789", status: "success", timestamp: now - 144 * hour, note: "Sent to relay address" },
    { id: "demo-act-4", type: "deposit", description: "Shielded 0.5000 strkBTC", amount: "0.5000", txHash: "0x4a5b6c7d8e9f0123456789abcdef12345678abcdef12345678abcdef12345678", status: "success", timestamp: now - 96 * hour },
    { id: "demo-act-5", type: "proof", description: "ZK proof generated (Poseidon circuit)", status: "success", timestamp: now - 72 * hour, note: "Proof for 0.25 BTC withdrawal — 4.2s" },
    { id: "demo-act-6", type: "withdraw", description: "Unshielded 0.2500 strkBTC", amount: "0.2500", txHash: "0x1122334455667788990011223344556677889900112233445566778899001122", status: "success", timestamp: now - 72 * hour },
    { id: "demo-act-7", type: "deposit", description: "Shielded 0.1000 strkBTC", amount: "0.1000", txHash: "0xaabbccddee00112233445566778899aabbccddee00112233445566778899aabb", status: "success", timestamp: now - 48 * hour },
    { id: "demo-act-8", type: "deposit", description: "Shielded 0.2500 strkBTC", amount: "0.2500", txHash: "0xbbccddee00112233445566778899aabbccddee00112233445566778899aabbcc", status: "success", timestamp: now - 24 * hour },
    { id: "demo-act-9", type: "deposit", description: "Shielded 0.0500 strkBTC", amount: "0.0500", txHash: "0xccddee00112233445566778899aabbccddee00112233445566778899aabbccdd", status: "success", timestamp: now - 12 * hour },
    { id: "demo-act-10", type: "error", description: "Failed deposit — insufficient balance", amount: "5.0000", status: "failed", timestamp: now - 6 * hour },
    { id: "demo-act-11", type: "proof", description: "ZK proof generation in progress", status: "pending", timestamp: now - 1 * hour, note: "Waiting for witness computation" },
  ];

  localStorage.setItem("zephyr_activity", JSON.stringify(mockActivity));
}
