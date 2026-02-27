import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  deposit as sdkDeposit,
  getShieldedBalance,
  getAnonymitySet,
  listLocalUtxos,
  listActivity,
  type TxReceipt,
  type ShieldedBalance,
  type AnonymityStats,
  type Utxo,
  type ActivityEntry,
} from "@/lib/zephyr-sdk";

export function useShieldedBalance() {
  return useQuery<ShieldedBalance>({
    queryKey: ["shieldedBalance"],
    queryFn: getShieldedBalance,
    refetchInterval: 30000,
  });
}

export function useAnonymitySet() {
  return useQuery<AnonymityStats>({
    queryKey: ["anonymitySet"],
    queryFn: getAnonymitySet,
    refetchInterval: 60000,
  });
}

export function useLocalUtxos(): Utxo[] {
  // This is synchronous local data so no need for react-query
  return listLocalUtxos();
}

export function useActivityLog(): ActivityEntry[] {
  return listActivity();
}

export function useDeposit() {
  const [isDepositing, setIsDepositing] = useState(false);
  const [step, setStep] = useState("");
  const [receipt, setReceipt] = useState<TxReceipt | null>(null);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (amount: bigint, passphrase: string) => {
      setIsDepositing(true);
      setError(null);
      setReceipt(null);
      try {
        const tx = await sdkDeposit(amount, passphrase, setStep);
        setReceipt(tx);
        return tx;
      } catch (e: any) {
        setError(e?.message ?? "Deposit failed");
        return null;
      } finally {
        setIsDepositing(false);
        setStep("");
      }
    },
    [],
  );

  return { execute, isDepositing, step, receipt, error };
}
