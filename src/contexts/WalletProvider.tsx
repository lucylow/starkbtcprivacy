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
  status: { connected: false, address: null, chainId: null, isDemo: false },
  connect: async () => {},
  connectDemo: () => {},
  disconnect: () => {},
  switchNetwork: () => {},
  connectWallet: async () => {},
  disconnectWallet: () => {},
  refreshStatus: async () => {},
} as unknown as WalletConnection;

export const useWallet = (): WalletConnection => {
  const context = useContext(WalletContext);
  return context ?? defaultWallet;
};
