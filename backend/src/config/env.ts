import { z } from 'zod';

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  HOST: z.string().default('0.0.0.0'),

  // Database
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),

  // Starknet
  STARKNET_RPC_URL: z.string(),
  STARKNET_CHAIN_ID: z.enum(['SN_MAIN', 'SN_GOERLI', 'SN_SEPOLIA']),
  MIXER_CONTRACT_ADDRESS: z.string(),
  VERIFIER_CONTRACT_ADDRESS: z.string(),
  BTC_BRIDGE_ADDRESS: z.string(),
  MERKLE_CONTRACT_ADDRESS: z.string().optional(),
  // Advanced privacy contracts (all optional)
  PRIVATE_ERC20_ADDRESS: z.string().optional(),
  PRIVATE_DEX_ADDRESS: z.string().optional(),
  ZK_IDENTITY_ADDRESS: z.string().optional(),
  PEDERSEN_HASH_LIB_ADDRESS: z.string().optional(),
  POSEIDON_HASH_LIB_ADDRESS: z.string().optional(),

  // Cryptography
  ZK_PROVER_URL: z.string().optional(),
  POSEIDON_PRIME: z
    .string()
    .default(
      '3618502788666131213697322783095070105623107215331596699973092056135872020481'
    ),

  // Security
  JWT_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().min(32),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

  // Monitoring
  SENTRY_DSN: z.string().optional(),
  PROMETHEUS_PORT: z.string().transform(Number).default('9090'),

  // External APIs
  BITCOIN_NODE_RPC: z.string().optional(),
  BLOCKCHAIN_EXPLORER_API: z.string().optional()
});

export type EnvConfig = z.infer<typeof envSchema>;

class Config {
  private static instance: Config;
  public config: EnvConfig;

  private constructor() {
    this.config = envSchema.parse(process.env);
  }

  static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  get<T extends keyof EnvConfig>(key: T): EnvConfig[T] {
    return this.config[key];
  }

  isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }
}

export const config = Config.getInstance();

