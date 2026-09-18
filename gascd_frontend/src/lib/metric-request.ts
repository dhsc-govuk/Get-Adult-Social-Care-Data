export function parseMetricIds(input: unknown, maximum: number): string[] {
  if (
    !Array.isArray(input) ||
    input.length === 0 ||
    input.length > maximum ||
    input.some(
      (id) =>
        typeof id !== 'string' ||
        id.length > 128 ||
        !/^[a-zA-Z0-9_]+$/.test(id.trim())
    )
  ) {
    throw new Error(`Supply between 1 and ${maximum} valid metric IDs`);
  }
  return [...new Set(input.map((id) => (id as string).trim()))];
}

export async function readMetricRequest(
  request: Request,
  maximumBytes = 32768
): Promise<unknown> {
  if (!request.body) throw new Error('Missing request body');
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximumBytes) {
        await reader.cancel();
        throw new Error('Metric request is too large');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}
