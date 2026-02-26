import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from '../config/env';
import { Deposit } from './entities/Deposit';
import { Withdrawal } from './entities/Withdrawal';
import { MerkleTree } from './entities/MerkleTree';
import { User } from './entities/User';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: config.get('DATABASE_URL'),
  entities: [Deposit, Withdrawal, MerkleTree, User],
  synchronize: false,
  logging: false,
  migrations: ['dist/database/migrations/*.js']
});

