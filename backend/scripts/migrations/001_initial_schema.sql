-- Initial schema for ZK-BTC mixer backend (simplified from spec)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    starknet_address VARCHAR(66) UNIQUE,
    bitcoin_address VARCHAR(100) UNIQUE,
    email VARCHAR(255) UNIQUE,
    email_verified BOOLEAN DEFAULT FALSE,
    kyc_verified BOOLEAN DEFAULT FALSE,
    kyc_data JSONB,
    total_mixed NUMERIC(36, 18) DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    total_fees_paid NUMERIC(36, 18) DEFAULT 0,
    anonymity_set_contributions INTEGER DEFAULT 0,
    preferences JSONB DEFAULT '{}'::jsonb,
    security JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT TRUE,
    archived_at TIMESTAMPTZ
);

-- Deposits table
CREATE TABLE IF NOT EXISTS deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    commitment_hash VARCHAR(66) UNIQUE NOT NULL,
    amount NUMERIC(36, 18) NOT NULL,
    asset_type VARCHAR(10) NOT NULL,
    secret TEXT NOT NULL,
    nullifier TEXT NOT NULL,
    preimage TEXT NOT NULL,
    leaf_index INTEGER NOT NULL,
    merkle_root VARCHAR(66) NOT NULL,
    tx_hash VARCHAR(66),
    status VARCHAR(20) DEFAULT 'pending',
    confirmed_at TIMESTAMPTZ,
    available_at TIMESTAMPTZ,
    user_id UUID REFERENCES users(id),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    archived BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);
CREATE INDEX IF NOT EXISTS idx_deposits_available_at ON deposits(available_at);
CREATE INDEX IF NOT EXISTS idx_deposits_commitment ON deposits(commitment_hash);

-- Withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nullifier VARCHAR(66) UNIQUE NOT NULL,
    recipient_address VARCHAR(66) NOT NULL,
    amount NUMERIC(36, 18) NOT NULL,
    fee NUMERIC(36, 18) NOT NULL,
    proof_hash VARCHAR(66) NOT NULL,
    proof TEXT NOT NULL,
    merkle_root VARCHAR(66) NOT NULL,
    tx_hash VARCHAR(66),
    status VARCHAR(20) DEFAULT 'pending',
    error TEXT,
    proved_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deposit_id UUID REFERENCES deposits(id),
    user_id UUID REFERENCES users(id),
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_nullifier ON withdrawals(nullifier);
CREATE INDEX IF NOT EXISTS idx_withdrawals_proof_hash ON withdrawals(proof_hash);

-- Merkle trees table
CREATE TABLE IF NOT EXISTS merkle_trees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    root VARCHAR(66) UNIQUE NOT NULL,
    depth INTEGER NOT NULL,
    zero_hashes TEXT[] NOT NULL,
    nodes JSONB NOT NULL,
    leaf_count INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

