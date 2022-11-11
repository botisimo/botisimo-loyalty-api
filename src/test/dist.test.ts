import { BotisimoLoyaltyApi } from '../../';
import { MockServer } from './server.mock';
import fetch from 'node-fetch';

describe('BotisimoLoyaltyApi', () => {
  it('should make a basic api call', async () => {
    const server = new MockServer();
    server.post = jest.fn().mockResolvedValue({ token: 'test' });
    const api = new BotisimoLoyaltyApi(server.url, {
      fetch,
    });
    const promise = api.login({ email: 'test', password: 'test' });
    await expect(promise).resolves.toEqual({ token: 'test' });
    expect(server.post).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/login',
        body: { email: 'test', password: 'test' },
      }),
    );
  });
});
