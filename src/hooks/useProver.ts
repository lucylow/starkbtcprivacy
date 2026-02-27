import { useCallback, useState } from "react";
import {
  prepareWithdraw,
  proveWithdraw,
  submitWithdraw,
  type Utxo,
  type WithdrawJob,
  type Proof,
  type TxReceipt,
} from "@/lib/zephyr-sdk";

export type ProverStage = "idle" | "preparing" | "proving" | "submitting" | "done" | "error";

export function useProver() {
  const [stage, setStage] = useState<ProverStage>("idle");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [receipt, setReceipt] = useState<TxReceipt | null>(null);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (recipient: string, utxo: Utxo) => {
      setStage("preparing");
      setError(null);
      setReceipt(null);
      setProgress(0);

      try {
        const job: WithdrawJob = await prepareWithdraw(recipient, utxo);
        
        setStage("proving");
        const proof: Proof = await proveWithdraw(job, (pct, label) => {
          setProgress(pct);
          setProgressLabel(label);
        });

        setStage("submitting");
        const tx = await submitWithdraw(proof, BigInt(utxo.amount));
        setReceipt(tx);
        setStage("done");
        return tx;
      } catch (e: any) {
        setError(e?.message ?? "Withdraw failed");
        setStage("error");
        return null;
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setStage("idle");
    setProgress(0);
    setProgressLabel("");
    setReceipt(null);
    setError(null);
  }, []);

  return { execute, reset, stage, progress, progressLabel, receipt, error };
}
