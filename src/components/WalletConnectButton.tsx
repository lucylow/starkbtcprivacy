import React from "react";
import { Button } from "@/components/ui/button";
import {
  Network,
  useWalletConnection,
} from "@/hooks/useWalletConnection";
import { Download, XCircle } from "lucide-react";

interface WalletConnectButtonProps {
  network?: Network;
  className?: string;
  children?: React.ReactNode;
}

const WALLET_DATA = {
  argentX: {
    name: "Argent X",
    url: "https://argent.xyz/argent-x",
    icon: "https://assets-global.website-files.com/626ad1f3d0839b4088c2bc65/626b7d1d7ba9014662e884d3_icon_argent.svg",
  },
  braavos: {
    name: "Braavos",
    url: "https://braavos.app/",
    icon: "https://braavos.app/assets/images/braavos-logo.svg",
  },
};

export const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({
  network = "sepolia",
  className = "",
  children,
}) => {
  const { status, connectWallet, disconnectWallet } =
    useWalletConnection(network);

  if (status.isConnecting) {
    return (
      <Button disabled className={className} variant="outline">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          Connecting...
        </div>
      </Button>
    );
  }

  if (status.isConnected) {
    return (
      <div
        className={`flex items-center gap-2 rounded-lg border bg-background/60 px-2 py-1 text-xs ${className}`}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-[10px] font-bold text-white">
          {status.address?.slice(-4)}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium">Connected</span>
          <span className="text-[10px] text-muted-foreground">
            {status.address?.slice(0, 6)}...{status.address?.slice(-4)}
          </span>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={disconnectWallet}
          className="ml-1 h-6 w-6 p-0"
        >
          <XCircle className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <Button
        onClick={() => connectWallet()}
        className="h-9 gap-2 px-3 text-xs"
        size="sm"
      >
        <Download className="h-3 w-3" />
        {children ?? "Connect Wallet"}
      </Button>

      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <span>or install:</span>
        <div className="flex gap-1">
          {Object.entries(WALLET_DATA).map(([id, data]) => (
            <a
              key={id}
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-sm p-0.5 transition-colors hover:text-primary"
            >
              <img src={data.icon} alt={data.name} className="h-3 w-3" />
              <span>{data.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

