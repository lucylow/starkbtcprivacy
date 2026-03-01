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

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
};
