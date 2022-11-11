import { ExpiringStore } from './expiring-store';

export type Fetch = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export class Http {
  headers: Record<string, string> = {};

  constructor(public fetch: Fetch, public cache: ExpiringStore) {}

  get(input: RequestInfo | URL, init?: RequestInit) {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
        ? input.href
        : input.url;

    const result = this.cache.get([url], () =>
      this.fetch(input, {
        ...init,
        headers: { ...this.headers, ...init?.headers },
        method: 'GET',
      }),
    );

    return result;
  }

  post(input: RequestInfo | URL, init?: RequestInit) {
    return this.fetch(input, {
      ...init,
      headers: { ...this.headers, ...init?.headers },
      method: 'POST',
    });
  }

  put(input: RequestInfo | URL, init?: RequestInit) {
    return this.fetch(input, {
      ...init,
      headers: { ...this.headers, ...init?.headers },
      method: 'PUT',
    });
  }

  delete(input: RequestInfo | URL, init?: RequestInit) {
    return this.fetch(input, {
      ...init,
      headers: { ...this.headers, ...init?.headers },
      method: 'DELETE',
    });
  }

  patch(input: RequestInfo | URL, init?: RequestInit) {
    return this.fetch(input, {
      ...init,
      headers: { ...this.headers, ...init?.headers },
      method: 'PATCH',
    });
  }
}
