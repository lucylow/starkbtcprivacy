// src/mock/nft.ts

import { mulberry32, randomAddress, randomHex, daysAgo } from './utils';
import { Hex, MockNft } from './types';

/**
 * Generate a mock NFT collection for ZephyrNFT.
 */
export function createMockNfts(
  collectionAddress: Hex,
  holders: Hex[],
  count = 32,
  seed = 999,
): MockNft[] {
  const rng = mulberry32(seed);
  const items: MockNft[] = [];

  for (let i = 0; i < count; i++) {
    const tokenId = BigInt(i);
    const owner = holders[i % holders.length];
    const rarityRoll = rng();
    const rarity =
      rarityRoll < 0.02
        ? 'mythic'
        : rarityRoll < 0.1
        ? 'legendary'
        : rarityRoll < 0.3
        ? 'rare'
        : 'common';

    const commitment = randomHex(rng);
    const identityCommitment = randomHex(rng);
    const mintedAt = daysAgo(30 - i);
    const mintTxHash = randomHex(rng);

    const name = `Zephyr Pass #${tokenId.toString()}`;
    const image = `https://dummyimage.com/600x600/000/fff&text=ZEPHYR+${tokenId}`;
    const description =
      'A privacy-gated access NFT minted by proving ownership of shielded BTC on Starknet.';

    const attrs: MockNft['attributes'] = [
      { trait_type: 'Rarity', value: rarity },
      {
        trait_type: 'Tier',
        value:
          rarity === 'mythic'
            ? 4
            : rarity === 'legendary'
            ? 3
            : rarity === 'rare'
            ? 2
            : 1,
      },
      { trait_type: 'BoundToUTXO', value: `${commitment.slice(0, 10)}…` },
    ];

    items.push({
      tokenId,
      owner,
      collectionAddress,
      name,
      image,
      description,
      attributes: attrs,
      commitment,
      identityCommitment,
      mintedAt,
      mintTxHash,
    });
  }

  return items;
}

/**
 * Quick lookup maps for UI.
 */
export function indexNftsByOwner(nfts: MockNft[]): Map<Hex, MockNft[]> {
  const map = new Map<Hex, MockNft[]>();
  for (const nft of nfts) {
    const list = map.get(nft.owner) ?? [];
    list.push(nft);
    map.set(nft.owner, list);
  }
  return map;
}

export function indexNftsByTokenId(nfts: MockNft[]): Map<string, MockNft> {
  const map = new Map<string, MockNft>();
  for (const nft of nfts) {
    map.set(nft.tokenId.toString(), nfts[Number(nft.tokenId)]);
  }
  return map;
}

/**
 * Optional: generate a dummy collection address if needed.
 */
export function randomCollectionAddress(seed = 77): Hex {
  const rng = mulberry32(seed);
  return randomAddress(rng);
}

