import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from 'typeorm';

// NOTE: In the original spec this used typeorm-encrypted.
// Here we keep plain strings; plug in a transformer later if desired.

@Entity('deposits')
export class Deposit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  commitmentHash!: string;

  @Column('decimal', { precision: 36, scale: 18 })
  amount!: string; // in satoshis

  @Column()
  assetType!: string; // 'BTC', 'wBTC', 'tBTC'

  @Column()
  secret!: string;

  @Column()
  nullifier!: string;

  @Column()
  preimage!: string; // secret + nullifier + amount + randomness (application-level encrypted)

  @Column()
  leafIndex!: number;

  @Column()
  merkleRoot!: string;

  @Column({ nullable: true })
  txHash!: string | null;

  @Column({ default: 'pending' })
  status!: 'pending' | 'confirmed' | 'mixed' | 'withdrawn' | 'failed';

  @Column({ type: 'timestamp', nullable: true })
  confirmedAt!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  availableAt!: Date | null; // When withdrawal is allowed

  @Column()
  userId!: string;

  @Column('jsonb', { nullable: true })
  metadata!:
    | {
        ip: string;
        userAgent: string;
        referralCode?: string;
        privacyLevel: 'standard' | 'high' | 'maximum';
        expectedDelay: number; // in hours
      }
    | null;

  @CreateDateColumn()
  createdAt!: Date;

  @Index()
  @Column({ default: false })
  archived!: boolean;
}

