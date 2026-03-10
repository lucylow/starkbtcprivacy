import { Account, type Call } from "starknet";

/**
 * Robust helper for signing + submitting a Starknet transaction.
 * Provides clear, user-facing error messages.
 */
export async function sendSignedTx(
  account: Account,
  call: Call | Call[],
): Promise<{ transaction_hash: string }> {
  try {
    const res = await account.execute(call);
    console.info("[Zephyr] submitTx", res.transaction_hash);
    return res;
  } catch (err: any) {
    const msg = err?.message ?? "";

    // Map common wallet errors to friendly messages
    if (msg.includes("User abort") || msg.includes("reject")) {
      throw new Error("Transaction rejected. You cancelled the signature request.");
    }
    if (msg.includes("insufficient") || msg.includes("balance")) {
      throw new Error("Insufficient balance or fees. Please check your wallet balance.");
    }
    if (msg.includes("nonce")) {
      throw new Error("Transaction nonce error. Please try again.");
    }
    if (msg.includes("network") || msg.includes("chain")) {
      throw new Error("Network mismatch. Please switch your wallet to the correct network.");
    }

    console.error("[Zephyr] tx failed:", err);
    throw new Error(msg || "Transaction failed. Please try again.");
  }
}
