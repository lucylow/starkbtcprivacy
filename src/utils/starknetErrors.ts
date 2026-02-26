export function normalizeStarknetError(err: unknown): string {
  if (typeof err === "string") {
    return "Transaction failed";
  }

  const message =
    (typeof err === "object" && err && "message" in err
      ? (err as any).message
      : undefined) ?? "";

  // Mixer-specific errors
  if (message.includes("Mixer: paused")) return "Mixer is currently paused";
  if (message.includes("Mixer: duplicate commitment")) return "Commitment already exists";
  if (message.includes("Mixer: nullifier spent")) return "Already withdrawn (double-spend prevented)";
  if (message.includes("Mixer: unknown root")) return "Invalid Merkle root";
  if (message.includes("Mixer: invalid proof")) return "Invalid ZK proof";
  if (message.includes("Mixer: transfer failed")) return "Token transfer failed - check approval";
  if (message.includes("Mixer: zero amount")) return "Amount must be greater than zero";
  if (message.includes("Mixer: zero recipient")) return "Invalid recipient address";
  if (message.includes("Mixer: not admin")) return "Admin access required";

  // Verifier errors
  if (message.includes("Verifier: inactive")) return "Verifier is inactive";
  if (message.includes("Verifier: empty proof")) return "Empty proof provided";

  // Generic Starknet errors
  if (message.includes("NULLIFIER")) return "Already withdrawn";
  if (message.includes("OUT_OF_GAS")) return "Fee too low";
  if (message.includes("insufficient fee")) return "Fee too low";
  if (message.includes("insufficient balance")) return "Insufficient token balance";
  if (message.includes("u256_sub Overflow")) return "Insufficient balance for operation";

  return "Unexpected error";
}
