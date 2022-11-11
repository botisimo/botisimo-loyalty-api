//
// Test the build files in dist/ folder to make sure they are working
//
import { BotisimoLoyaltyApi } from '../../../botisimo-loyalty-api';
import { MockServer } from './server.mock';
import fetch from 'node-fetch';

describe('BotisimoLoyaltyApi', () => {
  const makeServer = () => new MockServer();
  const makeApi = (server: MockServer) => {
    const api = new BotisimoLoyaltyApi('test', {
      fetch,
    });
    api.baseUrl = server.url;
    return api;
  };
  let server: MockServer;
  let api: BotisimoLoyaltyApi;

  beforeEach(() => {
    server = makeServer();
    api = makeApi(server);
  });

  afterEach(() => {
    server.destroy();
  });

  it('should make a basic api call', async () => {
    server.post = jest.fn().mockResolvedValue({ token: 'test' });
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
