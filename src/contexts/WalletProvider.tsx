import React, { createContext, useContext, ReactNode } from "react";
import {
  Network,
  useWalletConnection,
  WalletConnection,
} from "@/hooks/useWalletConnection";

const WalletContext = createContext<WalletConnection | null>(null);

interface WalletProviderProps {
  children: ReactNode;
  defaultNetwork?: Network;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({
  children,
  defaultNetwork = "sepolia",
}) => {
  const walletConnection = useWalletConnection(defaultNetwork);

  return (
    <WalletContext.Provider value={walletConnection}>
      {children}
    </WalletContext.Provider>
  );
};

const defaultWallet = {
  status: { isConnected: false, isConnecting: false, supportedWallets: [], isDemo: false },
  connectWallet: async () => {},
  connectDemo: () => {},
  disconnectWallet: async () => {},
  switchNetwork: async () => {},
  refreshStatus: async () => {},
  adjustDemoBalance: () => {},
} as unknown as WalletConnection;

export const useWallet = (): WalletConnection => {
  const context = useContext(WalletContext);
  return context ?? defaultWallet;
};
