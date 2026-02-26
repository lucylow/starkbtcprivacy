export function normalizeStarknetError(err: any): string {
  if (typeof err === 'string') return 'Transaction failed';

  const message = err?.message || err?.toString?.() || '';

  if (message.includes('NULLIFIER')) return 'Already withdrawn';
  if (message.includes('OUT_OF_GAS') || message.includes('OUT_OF_RESOURCES')) {
    return 'Fee too low';
  }

  return 'Unexpected error';
}

