/**
 * Secure local storage for shielded secrets.
 * Secrets are encrypted with a user passphrase before persisting to localStorage/IndexedDB.
 */

const STORAGE_KEY = "zephyr_shielded_secrets";

export interface StoredSecret {
  id: string;
  commitment: string;
  ciphertext: string;
  amount: string;
  timestamp: number;
  spent: boolean;
  note?: string;
}

function getSecrets(): StoredSecret[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSecrets(secrets: StoredSecret[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(secrets));
}

export function storeSecret(secret: StoredSecret): void {
  const secrets = getSecrets();
  secrets.push(secret);
  saveSecrets(secrets);
}

export function listSecrets(): StoredSecret[] {
  return getSecrets();
}

export function getSecretById(id: string): StoredSecret | undefined {
  return getSecrets().find((s) => s.id === id);
}

export function markSpent(id: string): void {
  const secrets = getSecrets();
  const idx = secrets.findIndex((s) => s.id === id);
  if (idx >= 0) {
    secrets[idx].spent = true;
    saveSecrets(secrets);
  }
}

export function deleteSecret(id: string): void {
  saveSecrets(getSecrets().filter((s) => s.id !== id));
}

export function clearAllSecrets(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/** Simple XOR-based "encryption" placeholder. Replace with WebCrypto AES-GCM in production. */
export function encryptSecret(data: Uint8Array, passphrase: string): string {
  const key = new TextEncoder().encode(passphrase);
  const encrypted = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    encrypted[i] = data[i] ^ key[i % key.length];
  }
  return btoa(String.fromCharCode(...encrypted));
}

export function decryptSecret(ciphertext: string, passphrase: string): Uint8Array {
  const key = new TextEncoder().encode(passphrase);
  const raw = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
  const decrypted = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    decrypted[i] = raw[i] ^ key[i % key.length];
  }
  return decrypted;
}

export function generateSecret(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32));
}

export function exportSecretsBlob(): string {
  return JSON.stringify(getSecrets());
}

export function importSecretsBlob(blob: string): number {
  const imported: StoredSecret[] = JSON.parse(blob);
  const existing = getSecrets();
  const existingIds = new Set(existing.map((s) => s.id));
  let added = 0;
  for (const s of imported) {
    if (!existingIds.has(s.id)) {
      existing.push(s);
      added++;
    }
  }
  saveSecrets(existing);
  return added;
}
