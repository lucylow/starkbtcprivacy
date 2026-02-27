/**
 * Zephyr SDK – Frontend gateway to the privacy system.
 * All contract interactions and proof generation are routed through here.
 */

import { generateSecret, encryptSecret, storeSecret, listSecrets, type StoredSecret } from "./secure-storage";

export interface AnonymityStats {
  poolSize: number;
  averageAgeHours: number;
  depositCount24h: number;
  withdrawCount24h: number;
}

export interface ShieldedBalance {
  estimatedLow: number;
  estimatedHigh: number;
  utxoCount: number;
}

export interface Utxo {
  id: string;
  commitment: string;
  amount: string;
  timestamp: number;
  spent: boolean;
}

export interface WithdrawJob {
  commitment: string;
  nullifierHash: string;
  merkleRoot: string;
  merklePath: string[];
  amount: bigint;
  recipient: string;
}

export interface Proof {
  proofData: string[];
  publicInputs: string[];
}

export interface TxReceipt {
  txHash: string;
  status: "pending" | "success" | "failed";
  timestamp: number;
}

// Activity log entry
export interface ActivityEntry {
  id: string;
  type: "deposit" | "withdraw" | "proof" | "error";
  description: string;
  amount?: string;
  txHash?: string;
  status: "pending" | "success" | "failed";
  timestamp: number;
  note?: string;
}

const ACTIVITY_KEY = "zephyr_activity";

function getActivityLog(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addActivity(entry: ActivityEntry): void {
  const log = getActivityLog();
  log.unshift(entry);
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(log.slice(0, 200)));
}

export function listActivity(): ActivityEntry[] {
  return getActivityLog();
}

export function clearActivity(): void {
  localStorage.removeItem(ACTIVITY_KEY);
}

export function addActivityNote(id: string, note: string): void {
  const log = getActivityLog();
  const entry = log.find((e) => e.id === id);
  if (entry) {
    entry.note = note;
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(log));
  }
}

/** Generate a commitment from a secret and amount (mock Poseidon hash). */
export function computeCommitment(secret: Uint8Array, amount: bigint): string {
  // Mock: in production this would be a Poseidon hash
  let hash = 0n;
  for (const b of secret) hash = (hash * 256n + BigInt(b)) % (2n ** 251n);
  hash = (hash + amount) % (2n ** 251n);
  return "0x" + hash.toString(16).padStart(64, "0");
}

/** Full deposit flow (mock). */
export async function deposit(
  amount: bigint,
  passphrase: string,
  onStep?: (step: string) => void,
): Promise<TxReceipt> {
  onStep?.("Generating secret…");
  await sleep(500);
  const secret = generateSecret();
  const commitment = computeCommitment(secret, amount);

  onStep?.("Encrypting and storing secret locally…");
  await sleep(300);
  const ciphertext = encryptSecret(secret, passphrase);
  const id = crypto.randomUUID();
  storeSecret({
    id,
    commitment,
    ciphertext,
    amount: amount.toString(),
    timestamp: Date.now(),
    spent: false,
  });

  onStep?.("Approving strkBTC…");
  await sleep(1200);

  onStep?.("Submitting deposit transaction…");
  await sleep(1500);

  const txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

  const receipt: TxReceipt = {
    txHash,
    status: "success",
    timestamp: Date.now(),
  };

  addActivity({
    id,
    type: "deposit",
    description: `Shielded ${formatBtc(amount)} strkBTC`,
    amount: formatBtc(amount),
    txHash,
    status: "success",
    timestamp: Date.now(),
  });

  return receipt;
}

/** Prepare withdraw job (mock). */
export async function prepareWithdraw(
  recipient: string,
  utxo: Utxo,
): Promise<WithdrawJob> {
  await sleep(800);
  return {
    commitment: utxo.commitment,
    nullifierHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
    merkleRoot: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
    merklePath: Array.from({ length: 20 }, () =>
      "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
    ),
    amount: BigInt(utxo.amount),
    recipient,
  };
}

/** Generate ZK proof (mock with progress). */
export async function proveWithdraw(
  _job: WithdrawJob,
  onProgress?: (pct: number, stage: string) => void,
): Promise<Proof> {
  const stages = [
    "Gathering Merkle proof…",
    "Compiling circuits…",
    "Generating witness…",
    "Computing proof…",
    "Finalizing proof…",
  ];
  for (let i = 0; i < stages.length; i++) {
    onProgress?.(((i + 1) / stages.length) * 100, stages[i]);
    await sleep(800 + Math.random() * 600);
  }

  return {
    proofData: Array.from({ length: 8 }, () =>
      "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
    ),
    publicInputs: ["0x1", "0x2", "0x3", "0x4"],
  };
}

/** Submit withdraw tx (mock). */
export async function submitWithdraw(
  _proof: Proof,
  amount: bigint,
): Promise<TxReceipt> {
  await sleep(1500);
  const txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  const id = crypto.randomUUID();

  addActivity({
    id,
    type: "withdraw",
    description: `Unshielded ${formatBtc(amount)} strkBTC`,
    amount: formatBtc(amount),
    txHash,
    status: "success",
    timestamp: Date.now(),
  });

  return { txHash, status: "success", timestamp: Date.now() };
}

/** Get anonymity set stats (mock). */
export async function getAnonymitySet(): Promise<AnonymityStats> {
  await sleep(400);
  return {
    poolSize: 24300 + Math.floor(Math.random() * 500),
    averageAgeHours: 72 + Math.floor(Math.random() * 48),
    depositCount24h: 142 + Math.floor(Math.random() * 30),
    withdrawCount24h: 87 + Math.floor(Math.random() * 20),
  };
}

/** Get shielded balance estimate (mock). */
export async function getShieldedBalance(): Promise<ShieldedBalance> {
  const secrets = listSecrets().filter((s) => !s.spent);
  if (secrets.length === 0) return { estimatedLow: 0, estimatedHigh: 0, utxoCount: 0 };
  const total = secrets.reduce((s, u) => s + Number(u.amount), 0);
  const btcTotal = total / 1e8;
  return {
    estimatedLow: Math.max(0, btcTotal * 0.95),
    estimatedHigh: btcTotal * 1.05,
    utxoCount: secrets.length,
  };
}

/** List local UTXOs. */
export function listLocalUtxos(): Utxo[] {
  return listSecrets().map((s) => ({
    id: s.id,
    commitment: s.commitment,
    amount: s.amount,
    timestamp: s.timestamp,
    spent: s.spent,
  }));
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function formatBtc(sats: bigint): string {
  return (Number(sats) / 1e8).toFixed(4);
}
