import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, nullable: true })
  starknetAddress!: string | null;

  @Column({ unique: true, nullable: true })
  bitcoinAddress!: string | null;

  @Column({ unique: true, nullable: true })
  email!: string | null;

  @Column({ default: false })
  emailVerified!: boolean;

  @Column({ default: false })
  kycVerified!: boolean;

  @Column('jsonb', { nullable: true })
  kycData!:
    | {
        provider: string;
        level: string;
        verifiedAt: Date;
        expiresAt: Date;
      }
    | null;

  @Column('decimal', { precision: 36, scale: 18, default: '0' })
  totalMixed!: string;

  @Column({ default: 0 })
  totalTransactions!: number;

  @Column('decimal', { precision: 36, scale: 18, default: '0' })
  totalFeesPaid!: string;

  @Column({ default: 0 })
  anonymitySetContributions!: number;

  @Column('jsonb', { default: {} })
  preferences!: {
    defaultPrivacyLevel?: 'standard' | 'high' | 'maximum';
    autoWithdraw?: boolean;
    emailNotifications?: boolean;
    telegramNotifications?: boolean;
  };

  @Column('jsonb', { nullable: true })
  security!:
    | {
        lastLogin?: Date;
        loginAttempts?: number;
        twoFactorEnabled?: boolean;
        apiKeyHash?: string;
      }
    | null;

  @CreateDateColumn()
  createdAt!: Date;

  @Index()
  @Column({ default: true })
  active!: boolean;
}

