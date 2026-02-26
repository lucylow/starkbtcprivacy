import { provider } from '../starknet/provider';
import { CONTRACTS } from '../starknet/contracts';
import { MerkleTree } from '../cryptography/MerkleTree';
import { logger } from '../utils/logger';

const tree = new MerkleTree();

export async function syncDeposits(fromBlock: number) {
  const events = await provider.getEvents({
    address: CONTRACTS.deposit.address,
    from_block: { block_number: fromBlock },
    to_block: 'latest',
    keys: []
  } as any);

  for (const ev of events.events) {
    try {
      const commitment = ev.data[0];
      if (!commitment) continue;
      tree.insert(commitment);
    } catch (err) {
      logger.error({ err, event: ev }, 'Failed to index deposit event');
    }
  }

  const root = tree.getRoot();
  logger.info({ root, leafCount: tree.getLeafCount() }, 'Merkle root updated from indexer');
  return root;
}

