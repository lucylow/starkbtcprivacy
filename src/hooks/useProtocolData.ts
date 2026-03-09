import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProtocolStats {
  tvl: number;
  tvlUnit: string;
  totalUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  avgAnonymitySet: number;
  merkleTreeDepth: number;
  networkFeeGwei: string;
  volumeSparkline: number[];
  pools: { name: string; deposits: number; apy: number }[];
  recentEvents: { type: string; amount: string; timeAgo: string }[];
  lastUpdated: string;
}

export interface PriceFeed {
  btc: { price: number; change24h: number; symbol: string };
  strkBTC: { price: number; ratio: number; symbol: string };
  eth: { price: number; symbol: string };
  strk: { price: number; symbol: string };
  priceHistory: number[];
  gas: { low: number; medium: number; high: number; unit: string };
  lastUpdated: string;
}

async function fetchProtocolStats(): Promise<ProtocolStats> {
  const { data, error } = await supabase.functions.invoke("protocol-stats");
  if (error) throw error;
  return data as ProtocolStats;
}

async function fetchPriceFeed(): Promise<PriceFeed> {
  const { data, error } = await supabase.functions.invoke("price-feed");
  if (error) throw error;
  return data as PriceFeed;
}

export function useProtocolStats() {
  return useQuery<ProtocolStats>({
    queryKey: ["protocolStats"],
    queryFn: fetchProtocolStats,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function usePriceFeed() {
  return useQuery<PriceFeed>({
    queryKey: ["priceFeed"],
    queryFn: fetchPriceFeed,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}
