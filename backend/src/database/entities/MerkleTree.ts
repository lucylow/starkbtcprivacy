import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('merkle_trees')
export class MerkleTree {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  root!: string;

  @Column()
  depth!: number; // Tree depth (e.g., 20 for 1M leaves)

  @Column('text', { array: true })
  zeroHashes!: string[]; // Precomputed zero hashes for each level

  @Column('jsonb')
  nodes!: Record<string, string>; // Sparse tree storage

  @Column()
  leafCount!: number;

  @Column({ default: 'active' })
  status!: 'active' | 'archived';

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  updatedAt!: Date | null;
}

