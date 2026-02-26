#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Zephyr Protocol - Starknet Deployment Script
# ============================================================
# Prerequisites:
#   - Scarb installed (>= 2.11.0)
#   - starkli installed
#   - Account configured (STARKNET_ACCOUNT, STARKNET_KEYSTORE)
#
# Environment variables:
#   STARKNET_RPC       - RPC endpoint (default: Sepolia)
#   TOKEN_ADDRESS      - strkBTC / wBTC ERC20 address
#   ADMIN_ADDRESS      - Admin wallet address
#   FEE_BPS            - Fee in basis points (default: 30 = 0.3%)
#   FEE_RECIPIENT      - Fee recipient address
# ============================================================

STARKNET_RPC="${STARKNET_RPC:-https://starknet-sepolia.public.blastapi.io}"
FEE_BPS="${FEE_BPS:-30}"

echo "╔══════════════════════════════════════════╗"
echo "║   Zephyr Protocol Deployment             ║"
echo "╚══════════════════════════════════════════╝"

# --- Step 1: Build contracts ---
echo ""
echo "▶ Building contracts..."
scarb build

echo "✅ Build successful"

# --- Step 2: Declare contracts ---
echo ""
echo "▶ Declaring contracts..."

VERIFIER_CLASS_HASH=$(starkli declare \
  --rpc "$STARKNET_RPC" \
  target/dev/zephyr_protocol_ZephyrVerifier.contract_class.json \
  2>&1 | grep -oP '0x[0-9a-fA-F]+' | head -1)
echo "  Verifier class hash: $VERIFIER_CLASS_HASH"

MERKLE_CLASS_HASH=$(starkli declare \
  --rpc "$STARKNET_RPC" \
  target/dev/zephyr_protocol_ZephyrMerkleTree.contract_class.json \
  2>&1 | grep -oP '0x[0-9a-fA-F]+' | head -1)
echo "  MerkleTree class hash: $MERKLE_CLASS_HASH"

MIXER_CLASS_HASH=$(starkli declare \
  --rpc "$STARKNET_RPC" \
  target/dev/zephyr_protocol_ZephyrMixer.contract_class.json \
  2>&1 | grep -oP '0x[0-9a-fA-F]+' | head -1)
echo "  Mixer class hash: $MIXER_CLASS_HASH"

DAO_CLASS_HASH=$(starkli declare \
  --rpc "$STARKNET_RPC" \
  target/dev/zephyr_protocol_ZephyrDAO.contract_class.json \
  2>&1 | grep -oP '0x[0-9a-fA-F]+' | head -1)
echo "  DAO class hash: $DAO_CLASS_HASH"

# --- Step 3: Deploy contracts ---
echo ""
echo "▶ Deploying Verifier..."
VERIFIER_ADDRESS=$(starkli deploy \
  --rpc "$STARKNET_RPC" \
  "$VERIFIER_CLASS_HASH" \
  "$ADMIN_ADDRESS" \
  0x0 \
  2>&1 | grep -oP '0x[0-9a-fA-F]+' | head -1)
echo "  Verifier deployed at: $VERIFIER_ADDRESS"

echo ""
echo "▶ Deploying MerkleTree..."
MERKLE_ADDRESS=$(starkli deploy \
  --rpc "$STARKNET_RPC" \
  "$MERKLE_CLASS_HASH" \
  "$ADMIN_ADDRESS" \
  2>&1 | grep -oP '0x[0-9a-fA-F]+' | head -1)
echo "  MerkleTree deployed at: $MERKLE_ADDRESS"

echo ""
echo "▶ Deploying Mixer..."
MIXER_ADDRESS=$(starkli deploy \
  --rpc "$STARKNET_RPC" \
  "$MIXER_CLASS_HASH" \
  "$ADMIN_ADDRESS" \
  "$TOKEN_ADDRESS" \
  "$VERIFIER_ADDRESS" \
  "$FEE_BPS" \
  "$FEE_RECIPIENT" \
  2>&1 | grep -oP '0x[0-9a-fA-F]+' | head -1)
echo "  Mixer deployed at: $MIXER_ADDRESS"

# --- Step 4: Summary ---
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   Deployment Summary                     ║"
echo "╠══════════════════════════════════════════╣"
echo "║ Verifier:   $VERIFIER_ADDRESS"
echo "║ MerkleTree: $MERKLE_ADDRESS"
echo "║ Mixer:      $MIXER_ADDRESS"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "Set these in your .env:"
echo "  VITE_MIXER_CONTRACT=$MIXER_ADDRESS"
echo "  VITE_VERIFIER_CONTRACT=$VERIFIER_ADDRESS"
echo "  VITE_MERKLE_CONTRACT=$MERKLE_ADDRESS"
echo ""
echo "✅ Deployment complete!"
