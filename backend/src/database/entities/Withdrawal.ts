import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from 'typeorm';

@Entity('withdrawals')
export class Withdrawal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  nullifier!: string;

  @Column()
  recipientAddress!: string;

  @Column('decimal', { precision: 36, scale: 18 })
  amount!: string;

  @Column('decimal', { precision: 36, scale: 18 })
  fee!: string;

  @Column()
  proofHash!: string;

  @Column('text')
  proof!: string; // JSON stringified ZK proof

  @Column()
  merkleRoot!: string;

  @Column({ nullable: true })
  txHash!: string | null;

  @Column({ default: 'pending' })
  status!:
    | 'pending'
    | 'processing'
    | 'proved'
    | 'submitted'
    | 'confirmed'
    | 'failed';

  @Column({ nullable: true })
  error!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  provedAt!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  confirmedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @Index()
  @Column({ nullable: true })
  depositId!: string | null;

  @Column()
  userId!: string;

  @Column('jsonb', { nullable: true })
  metadata!:
    | {
        gasUsed?: number;
        gasPrice?: string;
        blockNumber?: number;
        anonymitySetSize?: number;
        proofGenerationTime?: number;
        urgency?: string;
      }
    | null;
}

