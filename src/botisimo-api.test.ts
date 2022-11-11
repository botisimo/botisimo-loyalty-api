import { MockServer } from './test/server.mock';
import { BotisimoApi } from './botisimo-api';
import fetch from 'node-fetch';

const Random = {
  string: () => Math.random().toString(36).substring(7),
  number: () => Math.floor(Math.random() * 1000),
  id: () => Math.floor(Math.random() * 1000),
};

const createMockServer = () => {
  const server = new MockServer();

  server.get = jest.fn();
  server.post = jest.fn();
  server.put = jest.fn();
  server.delete = jest.fn();

  return server as jest.Mocked<MockServer>;
};

const createApi = (url: string) => {
  return new BotisimoApi(url, {
    fetch,
  });
};

describe('BotisimoApi', () => {
  // Default timeout for all tests in this suite is 200ms
  jest.setTimeout(200);
  let server: ReturnType<typeof createMockServer>;
  let api: ReturnType<typeof createApi>;

  beforeEach(() => {
    server = createMockServer();
    api = createApi(server.url);
  });

  afterEach(() => {
    server.destroy();
  });

  it('should fail if fetch is not provided', () => {
    expect(() => new BotisimoApi('test')).toThrowError(
      'You must provide a fetch implementation',
    );
  });

  describe('login', () => {
    it('should return a token', async () => {
      server.post.mockResolvedValue({
        user: { id: 1 },
        token: 'token',
      });
      const { token, user } = await api.login({} as any);
      expect(server.post).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/login' }),
      );
      expect(token).toEqual('token');
      expect(user).toEqual({ id: 1 });
    });

    it('should fail with invalid credentials', async () => {
      server.post.mockRejectedValue({ message: 'Invalid credentials' });
      await expect(
        api.login({
          email: 'test',
          password: 'test',
        }),
      ).rejects.toEqual({ error: 'Invalid credentials' });
    });

    it('should store the token on localStorage', async () => {
      server.post.mockResolvedValue({
        user: { id: 1 },
        token: 'token',
      });
      await api.login({
        email: 'test',
        password: 'test',
      });
      expect(api.localStorage.getItem('botisimo-auth-token')).toEqual('token');
    });

    it('should send the token on subsequent requests', async () => {
      server.post.mockResolvedValue({
        user: { id: 1 },
        token: 'token',
      });
      server.get.mockResolvedValue({ id: 1 });
      await api.login({
        email: 'test',
        password: 'test',
      });
      await api.getUser();
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({ 'x-user-auth-token': 'token' }),
        }),
      );
    });
  });

  describe('logout', () => {
    it('should remove the token from localStorage', async () => {
      await api.login({
        email: 'test',
        password: 'test',
      });
      api.logout();
      expect(api.localStorage.getItem('botisimo-auth-token')).toBeFalsy();
    });

    it('should not send the token on subsequent requests', async () => {
      await api.login({
        email: 'test',
        password: 'test',
      });
      api.logout();
      await api.getUser();
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'x-user-auth-token': 'token',
          }),
        }),
      );
    });
  });

  describe('getUser', () => {
    it('should return the user', async () => {
      server.get.mockResolvedValue({ id: 1 });
      const user = await api.getUser();
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/user' }),
      );
      expect(user).toEqual({ id: 1 });
    });

    it('should fail with an invalid token', async () => {
      server.get.mockRejectedValue({ message: 'Invalid token' });
      await expect(api.getUser()).rejects.toEqual({ error: 'Invalid token' });
    });

    it('should only hit the api once, and cache the result', async () => {
      server.get.mockResolvedValue({ user: { id: Random.id() } });
      const { user } = await api.getUser();
      expect(user).toHaveProperty('id', expect.any(Number));
      const { user: user2 } = await api.getUser();
      expect(server.get).toHaveBeenCalledTimes(1);
      expect(user2).toHaveProperty('id', user.id);
    });
  });

  describe('getMediaUrl', () => {
    it('should return the media url', async () => {
      const url = await api.getMediaUrl({ resourceId: 'resourceId' });

      expect(url).toEqual(
        'https://s3.amazonaws.com/prod.botisimo.com/resource/resourceId',
      );
    });
  });

  describe('getTeam', () => {
    it('should return a team', async () => {
      server.get.mockResolvedValue({ team: { id: 1 } });
      const { team } = await api.getTeam();

      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/' }),
      );

      expect(team).toEqual({ id: 1 });
    });
  });

  describe('signup', () => {
    it('should POST to /signup', async () => {
      await api.signup({} as any);
      expect(server.post).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/signup' }),
      );
    });

    it('should store the token on localStorage', async () => {
      server.post.mockResolvedValue({
        user: { id: 1 },
        token: 'token',
      });
      await api.signup({} as any);
      expect(api.localStorage.getItem('botisimo-auth-token')).toEqual('token');
    });
  });

  describe('forgotPassword', () => {
    it('should POST to /password/forgot', async () => {
      await api.forgotPassword({} as any);
      expect(server.post).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/password/forgot' }),
      );
    });
  });

  describe('resetPassword', () => {
    it('should POST to /password/reset', async () => {
      await api.resetPassword({} as any);

      expect(server.post).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/password/reset' }),
      );
    });

    it('should store the token on localStorage', async () => {
      const token = Random.string();
      server.post.mockResolvedValue({ token });
      await api.resetPassword({} as any);
      expect(api.localStorage.getItem('botisimo-auth-token')).toEqual(token);
    });
  });

  describe('listUsers', () => {
    it('should GET /user/list', async () => {
      await api.listUsers();
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/user/list' }),
      );
    });
  });

  describe('updateUser', () => {
    it('should PUT /user', async () => {
      await api.updateUser({} as any);
      expect(server.put).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/user' }),
      );
    });

    it('should invalidate the cache', async () => {
      await api.getUser();
      await api.updateUser({} as any);
      await api.getUser();
      expect(server.get).toHaveBeenCalledTimes(2);
    });

    it(`shouldn't fail if nothing is passed in`, async () => {
      const promise = api.updateUser();
      await expect(promise).resolves.not.toThrow();
    });
  });

  describe('requestEmailVerification', () => {
    it('should POST /email/request', async () => {
      await api.requestEmailVerification({
        returnPath: 'returnPath',
      });
      expect(server.post).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/email/request' }),
      );
    });
  });

  describe('verifyEmail', () => {
    it('should POST /email/verify', async () => {
      await api.verifyEmail({ token: 'token' });
      expect(server.post).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/email/verify' }),
      );
    });
  });

  describe('uploadAvatar', () => {
    it('should GET /resource', async () => {
      await api.uploadAvatar({} as any);
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/resource' }),
      );
    });
  });

  describe('createShopifyMultipassSession', () => {
    it('should GET /user/multipass', async () => {
      const shopifyPath = Random.string();
      await api.createShopifyMultipassSession({ shopifyPath });
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({
          url: `/user/multipass?shopifyPath=${shopifyPath}`,
        }),
      );
    });
  });

  describe('disconnectPlatformFromProfile', () => {
    it('should DELETE: /user/profile/$platform', async () => {
      const platform = Random.string();
      await api.disconnectPlatformFromProfile({ platform });
      expect(server.delete).toHaveBeenCalledWith(
        expect.objectContaining({ url: `/user/profile/${platform}` }),
      );
    });
  });

  describe('updateMembership', () => {
    it('should GET /billing/update', async () => {
      const interval = Random.string();
      const membership = Random.id();
      const returnPath = Random.string();

      await api.updateMembership({ interval, membership, returnPath });
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({
          url: `/billing/update?interval=${interval}&membership=${membership}&returnPath=${returnPath}`,
        }),
      );
    });
  });

  describe('confirmUpdateMembership', () => {
    it('should GET /billing/confirm', async () => {
      const interval = Random.string();
      const membership = Random.id();
      const returnPath = Random.string();

      await api.confirmUpdateMembership({ interval, membership, returnPath });
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({
          url: `/billing/confirm?interval=${interval}&membership=${membership}&returnPath=${returnPath}`,
        }),
      );
    });

    it('should be ok if returnPath is omitted', async () => {
      const interval = Random.string();
      const membership = Random.id();
      const returnPath = undefined;

      await api.confirmUpdateMembership({ interval, membership, returnPath });
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({
          url: `/billing/confirm?interval=${interval}&membership=${membership}&returnPath=`,
        }),
      );
    });
  });

  describe('manageBilling', () => {
    it('should GET /billing/manage', async () => {
      const returnPath = Random.string();
      await api.manageBilling({ returnPath });
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({
          url: `/billing/manage?returnPath=${returnPath}`,
        }),
      );
    });
  });

  describe('listMemberships', () => {
    it('should GET /membership/list', async () => {
      await api.listMemberships();
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/membership/list' }),
      );
    });
  });

  describe('readMembership', () => {
    it('should GET /membership/$id', async () => {
      const id = Random.id();
      await api.readMembership({ id });
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: `/membership/${id}` }),
      );
    });
  });

  describe('listTiers', () => {
    it('should GET /tier/list', async () => {
      await api.listTiers();
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/tier/list' }),
      );
    });
  });

  describe('readTier', () => {
    it('should GET /tier/$id', async () => {
      const id = Random.id();
      await api.readTier({ id });
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: `/tier/${id}` }),
      );
    });
  });

  describe('listCreators', () => {
    it('should GET /creator/list', async () => {
      await api.listCreators();
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/creator/list' }),
      );
    });
  });

  describe('listMissions', () => {
    it('should GET /mission/list', async () => {
      await api.listMissions();
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/mission/list' }),
      );
    });
  });

  describe('readMission', () => {
    it('should GET /mission/$id', async () => {
      const id = Random.id();
      await api.readMission({ id });
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: `/mission/${id}` }),
      );
    });
  });

  describe('completeMission', () => {
    it('should PUT /mission/$id/complete', async () => {
      const id = Random.id();
      await api.completeMission({ id });
      expect(server.put).toHaveBeenCalledWith(
        expect.objectContaining({ url: `/mission/${id}/complete` }),
      );
    });
  });

  describe('listShopItems', () => {
    it('should GET /shopItem/list', async () => {
      await api.listShopItems();
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/shopItem/list' }),
      );
    });
  });

  describe('readShopItem', () => {
    it('should GET /shopItem/$id', async () => {
      const id = Random.id();
      await api.readShopItem({ id });
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: `/shopItem/${id}` }),
      );
    });
  });

  describe('redeemShopItem', () => {
    it('should PUT /shopItem/$id/redeem', async () => {
      const id = Random.id();
      await api.redeemShopItem({ id });
      expect(server.put).toHaveBeenCalledWith(
        expect.objectContaining({ url: `/shopItem/${id}/redeem` }),
      );
    });
  });

  describe('listEvents', () => {
    it('should GET /event/list', async () => {
      await api.listEvents();
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/event/list' }),
      );
    });
  });

  describe('readEvent', () => {
    it('should GET /event/$id', async () => {
      const id = Random.id();
      await api.readEvent({ id });
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: `/event/${id}` }),
      );
    });
  });

  describe('listTransactions', () => {
    it('should GET /transaction/list', async () => {
      await api.listTransactions();
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/transaction/list' }),
      );
    });
  });

  describe('listNotifications', () => {
    it('should GET /notification/list', async () => {
      await api.listNotifications();
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/notification/list' }),
      );
    });
  });
});
