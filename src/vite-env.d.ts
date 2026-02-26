/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Starknet
  readonly VITE_STARKNET_NETWORK?: string;
  readonly VITE_DEPOSIT_CONTRACT?: string;
  readonly VITE_WITHDRAW_CONTRACT?: string;
  readonly VITE_MERKLE_CONTRACT?: string;
  readonly VITE_MIXER_CONTRACT?: string;
  readonly VITE_VERIFIER_CONTRACT?: string;

  // Mock mode
  readonly VITE_USE_ZEPHYR_MOCK?: string;

  // Supabase (auto-generated)
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_SUPABASE_PROJECT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
