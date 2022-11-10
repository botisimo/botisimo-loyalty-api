export type CacheEntry<TItem> = {
  item: Promise<TItem>;
  expires: number;
};

type Scalar = string | number | boolean | null | undefined;

export const sortKeys = <T extends object>(input: T): T => {
  return Object.keys(input)
    .sort()
    .reduce((result, key) => {
      // @ts-ignore
      result[key] = input[key];
      return result;
    }, {}) as any;
};

export type Key = Scalar | (Scalar | object)[] | object;

export const defaultKeyGenerator = (input: Key) => {
  if (typeof input === 'string') {
    return input;
  }

  const sorted = [input]
    .flat()
    .flat()
    .map((item) => {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        return sortKeys(item);
      } else {
        return item;
      }
    });

  return JSON.stringify(sorted);
};

/** A cache like the above, but items expire after a certain amount of time. */
export class ExpiringStore {
  private cache = new Map<string, CacheEntry<any>>();

  /** @param ttl Time to live in milliseconds */
  constructor(private readonly ttl: number) {}

  get<TItem, TKey extends Key>(
    id: TKey,
    fetch: (key: TKey) => TItem | Promise<TItem>,
  ): Promise<TItem> {
    const key = defaultKeyGenerator(id);
    const existing = this.cache.get(key);

    if (existing && existing.expires > Date.now()) {
      return existing.item;
    }

    // NOT awaited
    const item = fetch(id);

    this.set(key, item);

    return Promise.resolve(item);
  }

  set<TItem>(id: Key, item: TItem | Promise<TItem>) {
    const key = defaultKeyGenerator(id);

    this.cache.set(key, {
      item: Promise.resolve(item),
      expires: Date.now() + this.ttl,
    });
  }

  invalidate(id: Key) {
    const key = defaultKeyGenerator(id);

    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}
