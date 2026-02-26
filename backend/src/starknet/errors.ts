export function normalizeStarknetError(err: unknown): string {
  if (typeof err === 'string') {
    return 'Transaction failed';
  }

  const message =
    (typeof err === 'object' && err && 'message' in err
      ? // biome-ignore lint/suspicious/noExplicitAny: broad error normalization
        (err as any).message
      : undefined) ?? '';

  if (message.includes('NULLIFIER')) return 'Already withdrawn';
  if (message.includes('OUT_OF_GAS')) return 'Fee too low';
  if (message.includes('insufficient fee')) return 'Fee too low';

  return 'Unexpected error';
}

