import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CHAIN_ID,
  Network,
} from "@/hooks/useWalletConnection";
import { useWallet } from "@/contexts/WalletProvider";
import { AlertTriangle } from "lucide-react";

interface NetworkSelectorProps {
  className?: string;
}

const NETWORK_LABELS: Record<Network, string> = {
  mainnet: "Mainnet",
  sepolia: "Sepolia",
  devnet: "Devnet",
};

const NETWORK_COLORS: Record<Network, string> = {
  mainnet: "bg-orange-500",
  sepolia: "bg-blue-500",
  devnet: "bg-green-500",
};

export const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  className = "",
}) => {
  const { status, switchNetwork } = useWallet();

  const currentNetwork: Network = status.chainId
    ? (["mainnet", "sepolia", "devnet"] as Network[]).find(
        (key) =>
          CHAIN_ID[key.toUpperCase() as keyof typeof CHAIN_ID] ===
          status.chainId,
      ) ?? "sepolia"
    : "sepolia";

  return (
    <div className={className}>
      <Select
        value={currentNetwork}
        onValueChange={(value: Network) => switchNetwork(value)}
      >
        <SelectTrigger className="h-9 w-[150px] text-xs">
          <SelectValue placeholder="Select network" />
        </SelectTrigger>
        <SelectContent>
          {(["mainnet", "sepolia", "devnet"] as Network[]).map((network) => (
            <SelectItem key={network} value={network}>
              <div className="flex items-center gap-2">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${NETWORK_COLORS[network]}`}
                />
                <span>{NETWORK_LABELS[network]}</span>
                {status.chainId &&
                  status.chainId !==
                    CHAIN_ID[network.toUpperCase() as keyof typeof CHAIN_ID] && (
                    <AlertTriangle className="ml-auto h-3 w-3 text-yellow-500" />
                  )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

