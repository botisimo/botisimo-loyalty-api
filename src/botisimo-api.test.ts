import { MockServer } from './test/server.mock';
import { BotisimoApi } from './botisimo-api';

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

describe('BotisimoApi', () => {
  // Default timeout for all tests in this suite is 200ms
  jest.setTimeout(200);

  describe('login', () => {
    it('should return a token', async () => {
      const server = createMockServer();
      server.post.mockResolvedValue({
        user: { id: 1 },
        token: 'token',
      });
      const api = new BotisimoApi(server.url);
      const { token, user } = await api.login({} as any);
      expect(server.post).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/login' }),
      );
      expect(token).toEqual('token');
      expect(user).toEqual({ id: 1 });
    });

    it('should fail with invalid credentials', async () => {
      const server = createMockServer();
      server.post.mockRejectedValue({ message: 'Invalid credentials' });
      const api = new BotisimoApi(server.url);
      await expect(
        api.login({
          email: 'test',
          password: 'test',
        }),
      ).rejects.toEqual({ error: 'Invalid credentials' });
    });

    it('should store the token on localStorage', async () => {
      const server = createMockServer();
      server.post.mockResolvedValue({
        user: { id: 1 },
        token: 'token',
      });
      const api = new BotisimoApi(server.url);
      await api.login({
        email: 'test',
        password: 'test',
      });
      expect(globalThis.localStorage.getItem('botisimo-auth-token')).toEqual(
        'token',
      );
    });

    it('should send the token on subsequent requests', async () => {
      const server = createMockServer();
      server.post.mockResolvedValue({
        user: { id: 1 },
        token: 'token',
      });
      server.get.mockResolvedValue({ id: 1 });
      const api = new BotisimoApi(server.url);
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
      const server = createMockServer();
      const api = new BotisimoApi(server.url);
      await api.login({
        email: 'test',
        password: 'test',
      });
      api.logout();
      expect(
        globalThis.localStorage.getItem('botisimo-auth-token'),
      ).toBeFalsy();
    });

    it('should not send the token on subsequent requests', async () => {
      const server = createMockServer();
      const api = new BotisimoApi(server.url);
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
      const server = createMockServer();
      server.get.mockResolvedValue({ id: 1 });
      const api = new BotisimoApi(server.url);
      const user = await api.getUser();
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/user' }),
      );
      expect(user).toEqual({ id: 1 });
    });

    it('should fail with an invalid token', async () => {
      const server = createMockServer();
      server.get.mockRejectedValue({ message: 'Invalid token' });
      const api = new BotisimoApi(server.url);
      await expect(api.getUser()).rejects.toEqual({ error: 'Invalid token' });
    });

    it('should only hit the api once, and cache the result', async () => {
      const server = createMockServer();
      server.get.mockResolvedValue({ user: { id: Random.id() } });
      const api = new BotisimoApi(server.url);
      const { user } = await api.getUser();
      expect(user).toHaveProperty('id', expect.any(Number));
      const { user: user2 } = await api.getUser();
      expect(server.get).toHaveBeenCalledTimes(1);
      expect(user2).toHaveProperty('id', user.id);
    });
  });

  describe('getMediaUrl', () => {
    it('should return the media url', async () => {
      const api = new BotisimoApi('');
      const url = await api.getMediaUrl({ resourceId: 'resourceId' });

      expect(url).toEqual(
        'https://s3.amazonaws.com/prod.botisimo.com/resource/resourceId',
      );
    });
  });

  describe('getTeam', () => {
    it('should return a team', async () => {
      const server = createMockServer();
      server.get.mockResolvedValue({ team: { id: 1 } });
      const api = new BotisimoApi(server.url);
      const { team } = await api.getTeam();

      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/' }),
      );

      expect(team).toEqual({ id: 1 });
    });
  });

  describe('signup', () => {
    it('should POST to /signup', async () => {
      const server = createMockServer();
      const api = new BotisimoApi(server.url);
      await api.signup({} as any);
      expect(server.post).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/signup' }),
      );
    });

    it('should store the token on localStorage', async () => {
      const server = createMockServer();
      server.post.mockResolvedValue({
        user: { id: 1 },
        token: 'token',
      });
      const api = new BotisimoApi(server.url);
      await api.signup({} as any);
      expect(globalThis.localStorage.getItem('botisimo-auth-token')).toEqual(
        'token',
      );
    });
  });

  describe('forgotPassword', () => {
    it('should POST to /password/forgot', async () => {
      const server = createMockServer();
      const api = new BotisimoApi(server.url);
      await api.forgotPassword({} as any);
      expect(server.post).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/password/forgot' }),
      );
    });
  });

  describe('resetPassword', () => {
    it('should POST to /password/reset', async () => {
      const server = createMockServer();
      const api = new BotisimoApi(server.url);
      await api.resetPassword({} as any);

      expect(server.post).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/password/reset' }),
      );
    });

    it('should store the token on localStorage', async () => {
      const token = Random.string();
      const server = createMockServer();
      server.post.mockResolvedValue({ token });
      const api = new BotisimoApi(server.url);
      await api.resetPassword({} as any);
      expect(globalThis.localStorage.getItem('botisimo-auth-token')).toEqual(
        token,
      );
    });
  });

  describe('listUsers', () => {
    it('should GET /user/list', async () => {
      const server = createMockServer();
      const api = new BotisimoApi(server.url);
      await api.listUsers();
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/user/list' }),
      );
    });
  });

  describe('updateUser', () => {
    it('should PUT /user', async () => {
      const server = createMockServer();
      const api = new BotisimoApi(server.url);
      await api.updateUser({} as any);
      expect(server.put).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/user' }),
      );
    });

    it('should invalidate the cache', async () => {
      const server = createMockServer();
      const api = new BotisimoApi(server.url);
      await api.getUser();
      await api.updateUser({} as any);
      await api.getUser();
      expect(server.get).toHaveBeenCalledTimes(2);
    });

    it(`shouldn't fail if nothing is passed in`, async () => {
      const server = createMockServer();
      const api = new BotisimoApi(server.url);
      const promise = api.updateUser();
      await expect(promise).resolves.not.toThrow();
    });
  });

  describe('requestEmailVerification', () => {
    it('should POST /email/request', async () => {
      const server = createMockServer();
      const api = new BotisimoApi(server.url);
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
      const server = createMockServer();
      const api = new BotisimoApi(server.url);
      await api.verifyEmail({ token: 'token' });
      expect(server.post).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/email/verify' }),
      );
    });
  });

  describe('uploadAvatar', () => {
    it('should GET /resource', async () => {
      const server = createMockServer();
      const api = new BotisimoApi(server.url);
      await api.uploadAvatar({} as any);
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/resource' }),
      );
    });
  });

  describe('createShopifyMultipassSession', () => {
    it('should GET /user/multipass', async () => {
      const server = createMockServer();
      const api = new BotisimoApi(server.url);
      await api.createShopifyMultipassSession({} as any);
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/user/multipass' }),
      );
    });
  });

  describe('disconnectPlatformFromProfile', () => {
    it('should DELETE: /user/profile/$platform', async () => {
      const platform = Random.string();
      const server = createMockServer();
      const api = new BotisimoApi(server.url);
      await api.disconnectPlatformFromProfile({ platform });
      expect(server.delete).toHaveBeenCalledWith(
        expect.objectContaining({ url: `/user/profile/${platform}` }),
      );
    });
  });

  describe('updateMembership', () => {
    it('should GET /billing/update', async () => {
      const server = createMockServer();
      const api = new BotisimoApi(server.url);
      await api.updateMembership({} as any);
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/billing/update' }),
      );
    });
  });

  describe('confirmUpdateMembership', () => {
    it('should GET /billing/confirm', async () => {
      const server = createMockServer();
      const api = new BotisimoApi(server.url);
      await api.confirmUpdateMembership({} as any);
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/billing/confirm' }),
      );
    });
  });

  describe('manageBilling', () => {
    it('should GET /billing/manage', async () => {
      const returnPath = Random.string();
      const server = createMockServer();
      const api = new BotisimoApi(server.url);
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
      const server = createMockServer();
      const api = new BotisimoApi(server.url);
      await api.listMemberships();
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/membership/list' }),
      );
    });
  });

  describe('readMembership', () => {
    it('should GET /membership/$id', async () => {
      const id = Random.id();
      const server = createMockServer();
      const api = new BotisimoApi(server.url);
      await api.readMembership({ id });
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: `/membership/${id}` }),
      );
    });
  });

  describe('listTiers', () => {
    it('should GET /tier/list', async () => {
      const server = createMockServer();
      const api = new BotisimoApi(server.url);
      await api.listTiers();
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/tier/list' }),
      );
    });
  });

  describe('readTier', () => {
    it('should GET /tier/$id', async () => {
      const id = Random.id();
      const server = createMockServer();
      const api = new BotisimoApi(server.url);
      await api.readTier({ id });
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: `/tier/${id}` }),
      );
    });
  });

  describe('listCreators', () => {
    it('should GET /creator/list', async () => {
      const server = createMockServer();
      const api = new BotisimoApi(server.url);
      await api.listCreators();
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/creator/list' }),
      );
    });
  });

  describe('listMissions', () => {
    it('should GET /mission/list', async () => {
      const server = createMockServer();
      const api = new BotisimoApi(server.url);
      await api.listMissions();
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/mission/list' }),
      );
    });
  });

  describe('readMission', () => {
    it('should GET /mission/$id', async () => {
      const id = Random.id();
      const server = createMockServer();
      const api = new BotisimoApi(server.url);
      await api.readMission({ id });
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: `/mission/${id}` }),
      );
    });
  });

  describe('completeMission', () => {
    it('should PUT /mission/$id/complete', async () => {
      const id = Random.id();
      const server = createMockServer();
      const api = new BotisimoApi(server.url);
      await api.completeMission({ id });
      expect(server.put).toHaveBeenCalledWith(
        expect.objectContaining({ url: `/mission/${id}/complete` }),
      );
    });
  });

  describe('listShopItems', () => {
    it('should GET /shopItem/list', async () => {
      const server = createMockServer();
      const api = new BotisimoApi(server.url);
      await api.listShopItems();
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/shopItem/list' }),
      );
    });
  });

  describe('readShopItem', () => {
    it('should GET /shopItem/$id', async () => {
      const id = Random.id();
      const server = createMockServer();
      const api = new BotisimoApi(server.url);
      await api.readShopItem({ id });
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: `/shopItem/${id}` }),
      );
    });
  });

  describe('redeemShopItem', () => {
    it('should PUT /shopItem/$id/redeem', async () => {
      const id = Random.id();
      const server = createMockServer();
      const api = new BotisimoApi(server.url);
      await api.redeemShopItem({ id });
      expect(server.put).toHaveBeenCalledWith(
        expect.objectContaining({ url: `/shopItem/${id}/redeem` }),
      );
    });
  });

  describe('listEvents', () => {
    it('should GET /event/list', async () => {
      const server = createMockServer();
      const api = new BotisimoApi(server.url);
      await api.listEvents();
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/event/list' }),
      );
    });
  });

  describe('readEvent', () => {
    it('should GET /event/$id', async () => {
      const id = Random.id();
      const server = createMockServer();
      const api = new BotisimoApi(server.url);
      await api.readEvent({ id });
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: `/event/${id}` }),
      );
    });
  });

  describe('listTransactions', () => {
    it('should GET /transaction/list', async () => {
      const server = createMockServer();
      const api = new BotisimoApi(server.url);
      await api.listTransactions();
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/transaction/list' }),
      );
    });
  });

  describe('listNotifications', () => {
    it('should GET /notification/list', async () => {
      const server = createMockServer();
      const api = new BotisimoApi(server.url);
      await api.listNotifications();
      expect(server.get).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/notification/list' }),
      );
    });
  });
});
