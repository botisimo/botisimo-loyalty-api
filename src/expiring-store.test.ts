import { defaultKeyGenerator, ExpiringStore, sortKeys } from './expiring-store';

describe('ExpiringStore', () => {
  const store = new ExpiringStore(1000);

  describe('sortKeys()', () => {
    it('should sort keys', () => {
      expect(sortKeys({ b: 1, a: 2 })).toEqual({ a: 2, b: 1 });
    });
  });

  describe('defaultKeyGenerator()', () => {
    it('should generate a key', () => {
      expect(defaultKeyGenerator(['test', { a: 1, b: 2 }])).toEqual(
        '["test",{"a":1,"b":2}]',
      );
      // Mix up object keys and get same result
      expect(defaultKeyGenerator(['test', { b: 2, a: 1 }])).toEqual(
        '["test",{"a":1,"b":2}]',
      );
    });

    it('should generate a key for a string', () => {
      expect(defaultKeyGenerator('test')).toEqual('test');
    });
  });

  describe('get()', () => {
    it('should call the generator if the cached item is missing', async () => {
      const key = [Date.now(), Math.random()];
      const generator = jest.fn(() => 'value');
      const result = await store.get(key, generator);
      expect(result).toEqual('value');
      expect(generator).toHaveBeenCalledWith(key);
    });

    it('should not call the generator if the cached item is present', async () => {
      const key = [Date.now(), Math.random()];
      const generator = jest.fn();
      store.set(key, 'value');
      const result = await store.get(key, generator);
      expect(result).toEqual('value');
      expect(generator).not.toHaveBeenCalled();
    });

    it('should call the generator if the cached item is expired', async () => {
      jest.useFakeTimers();
      const key = [Date.now(), Math.random()];
      const generator = jest.fn(() => 'value');
      store.set(key, 'value');
      jest.advanceTimersByTime(1001);
      const result = await store.get(key, generator);
      expect(result).toEqual('value');
      expect(generator).toHaveBeenCalledWith(key);
    });
  });

  describe('set()', () => {
    it('should set a value', async () => {
      const key = [Date.now(), Math.random()];
      const generator = jest.fn();
      store.set(key, 'value');
      const result = await store.get(key, generator);
      expect(result).toEqual('value');
      expect(generator).not.toHaveBeenCalled();
    });
  });

  describe('clear()', () => {
    it('should clear the cache', async () => {
      const key = [Date.now(), Math.random()];
      const generator = jest.fn(() => 'value');
      store.set(key, 'value');
      store.clear();
      const result = await store.get(key, generator);
      expect(result).toEqual('value');
      expect(generator).toHaveBeenCalledWith(key);
    });
  });

  describe('invalidate()', () => {
    it('should invalidate a key', async () => {
      const key = [Date.now(), Math.random()];
      const generator = jest.fn(() => 'value');
      store.set(key, 'value');
      store.invalidate(key);
      const result = await store.get(key, generator);
      expect(result).toEqual('value');
      expect(generator).toHaveBeenCalledWith(key);
    });
  });
});
