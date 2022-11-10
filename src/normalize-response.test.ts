import { normalizeError } from './normalize-response';

describe('hasError', () => {
  it('should detect error field', async () => {
    const promise = normalizeError({ error: 'error' } as any);

    await expect(promise).rejects.toEqual({ error: 'error' });
  });
});

describe('normalizeError', () => {
  it('should return string error', async () => {
    const promise = normalizeError('error' as any);

    await expect(promise).rejects.toEqual({ error: 'error' });
  });

  it('should return Unknown error', async () => {
    const promise = normalizeError(undefined as any);

    await expect(promise).rejects.toEqual({ error: 'Unknown error' });
  });
});
