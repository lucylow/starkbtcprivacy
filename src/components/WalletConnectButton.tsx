import React from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletProvider";
import { Download, XCircle, Play } from "lucide-react";

interface WalletConnectButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({
  className = "",
  children,
}) => {
  const { status, connectWallet, connectDemo, disconnectWallet } = useWallet();

  if (status.isConnecting) {
    return (
      <Button disabled className={className} variant="outline">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Connecting...
        </div>
      </Button>
    );
  }

  if (status.isConnected) {
    return (
      <div
        className={`flex items-center gap-2 rounded-lg border border-border bg-background/60 px-2 py-1 text-xs ${className}`}
      >
        <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-primary-foreground ${
          status.isDemo ? "bg-gradient-to-r from-btc-orange to-amber-500" : "bg-gradient-to-r from-purple-500 to-pink-500"
        }`}>
          {status.isDemo ? "D" : status.address?.slice(-4)}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium">
            {status.isDemo ? "Demo Mode" : "Connected"}
          </span>
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
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        onClick={() => connectWallet()}
        className="h-9 gap-2 px-3 text-xs"
        size="sm"
      >
        <Download className="h-3 w-3" />
        {children ?? "Connect"}
      </Button>
      <Button
        onClick={connectDemo}
        variant="outline"
        className="h-9 gap-2 px-3 text-xs border-btc-orange/50 text-btc-orange hover:bg-btc-orange/10"
        size="sm"
      >
        <Play className="h-3 w-3" />
        Demo
      </Button>
    </div>
  );
};
