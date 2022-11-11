import { ExpiringStore } from './expiring-store';
import { normalizeError } from './normalize-response';
import {
  Creator,
  Event,
  LoyaltyMembership,
  LoyaltyTier,
  Mission,
  Notification,
  ShopItem,
  Team,
  Transaction,
  User,
} from './types';
export * from './types';

type LocalStorage = {
  getItem: (name: string) => string | null;
  setItem: (name: string, value: string) => void;
};

type Fetch = (
  url: string,
  options?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  },
) => Promise<{
  ok: boolean;
  json: () => Promise<any>;
}>;

export class BotisimoLoyaltyApi {
  public cache: ExpiringStore;
  localStorage: LocalStorage;
  fetch: Fetch;
  baseUrl: string;

  constructor(
    teamName: string,
    {
      defaultCacheTtl = 5 * 60 * 1000,
      fetch,
      localStorage,
    }: {
      /** Time in ms for cache entries to expires (default: 5 minutes) */
      defaultCacheTtl?: number;
      /**
       * If you're using this outside the browser, you may need to provide an
       * object that satisfies the localStorage interface
       */
      localStorage?: LocalStorage;
      /**
       * If you're using this outside the browser, you may need to provide an
       * object that satisfies the fetch interface. For nodejs, you can use
       * `node-fetch`
       */
      fetch?: Fetch;
    } = {},
  ) {
    // Setup localStorage
    try {
      this.localStorage = localStorage ?? window.localStorage;
    } catch {
      this.localStorage = {
        getItem: (name: string) => (this.localStorage as any)[name] ?? null,
        setItem: (name: string, value: any) =>
          ((this.localStorage as any)[name] = value),
      };
    }

    // Setup fetch
    try {
      this.fetch = fetch ?? window.fetch;
    } catch {
      throw new Error(
        'You must provide a fetch implementation if you are not using this in a browser',
      );
    }

    this.cache = new ExpiringStore(defaultCacheTtl);
    this.baseUrl = teamName.startsWith('http')
      ? teamName
      : `https://botisimo.com/api/v1/loyalty/${teamName}`;
  }

  protected async request<TResult>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    data?: any,
  ): Promise<TResult> {
    const performRequest = async () => {
      const parsedUrl = new URL(`${this.baseUrl}/${url}`);

      // Remove double slashes
      parsedUrl.pathname = parsedUrl.pathname.replace(/\/+/g, '/');

      if (method === 'get') {
        for (const [key, value] of Object.entries(data ?? {})) {
          parsedUrl.searchParams.append(key, String(value ?? ''));
        }
      }

      const body = method === 'get' ? undefined : JSON.stringify(data);
      const token = this.getToken();

      const result = await this.fetch(parsedUrl.toString(), {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'x-user-auth-token': token } : {}),
        },
        body,
      });

      // If the status is 2xx, return the result
      if (result.ok) return result.json().catch(() => ({}));
      // Otherwise return the error
      return result
        .json()
        .then((error) => {
          throw error;
        })
        .catch(normalizeError);
    };

    if (method === 'get') {
      return this.cache.get(url, performRequest);
    }

    return performRequest();
  }

  getToken() {
    return this.localStorage.getItem('botisimo-auth-token') ?? '';
  }

  private storeToken(token: string) {
    this.localStorage.setItem('botisimo-auth-token', token);
  }

  async getMediaUrl({
    resourceId,
  }: {
    /** The ID of the media resource as provided by the API */
    resourceId: string;
  }) {
    return `https://s3.amazonaws.com/prod.botisimo.com/resource/${resourceId}`;
  }

  // #region Team API

  async getTeam() {
    return this.request<{
      /** The team object */
      team: Team;
    }>('get', '');
  }

  // #endregion

  // #region Authentication API

  /** Sign up */
  async signup(options: {
    /** Date of birth formatted as MM/DD/YYYY */
    dateOfBirth: string;
    /** User email address */
    email: string;
    /** The billing interval. Should be month or year */
    interval: 'month' | 'year';
    /** User password */
    password: string;
    /** List of tag IDs the user is interested in */
    tags: number[];
    /** Membership ID */
    membership: number;
    /** The URL path to return to after stripe checkout */
    returnPath?: string;
    /** Custom username */
    username?: string;
    /** The ID from a referral link (this is the ID of another user) */
    referralId?: number;
  }) {
    return this.request<{
      token?: string;
    }>('post', 'signup', options).then((data) => {
      if (data.token) this.storeToken(data.token);
      return data;
    });
  }

  /** Log in */
  async login({
    email,
    password,
  }: {
    /** User email address */
    email: string;
    /** User password */
    password: string;
  }) {
    return this.request<{
      /** The user object */
      user: User;
      /** The user’s auth token */
      token: string;
    }>('post', 'login', { email, password })
      .then((data) => {
        if (data.token) this.storeToken(data.token);
        return data;
      })
      .catch(normalizeError);
  }

  /**
   * Log out
   *
   * This will delete the current session, clear the cache, delete the auth
   * token from local storage, and from the session headers.
   */
  async logout() {
    this.cache.clear();
    this.storeToken('');
  }

  /**
   * Forgot password
   *
   * After intiating a forgot password request, an email will be sent to the
   * user if the email exists in our system. The email will have a link with a
   * token in it. Your client should be able to handle this token when the user
   * clicks on the link. The link looks like this:
   *
   *     https://yourapp.com/?password_token=xxxxx
   *
   * When the user lands on this page, the user should be prompted to enter a
   * new password and you should submit the token and the new password to the
   * `/password/reset` endpoint
   *
   * **POST** /password/forgot
   */
  async forgotPassword({
    email,
    returnPath,
  }: {
    /** Email address used on the account */
    email: string;
    /** The URL path to link to in the forgot password email */
    returnPath: string;
  }) {
    return this.request('post', 'password/forgot', { email, returnPath });
  }

  /**
   * Reset Password
   *
   * This endpoint should ONLY be used if you have a token from a
   * /password/forgot request
   */
  async resetPassword({
    password,
    token,
  }: {
    /** The new password to set on the account */
    password: string;
    /** The token from the forgot password email */
    token: string;
  }) {
    return this.request<{
      /** The user’s auth token */
      token: string;
    }>('post', 'password/reset', { password, token }).then((data) => {
      if (data.token) this.storeToken(data.token);
      return data;
    });
  }

  // #endregion

  // #region User API

  /**
   * List Users
   *
   * List user leaderboard ranked by most points to least points (top 100)
   *
   * **GET** /user/list
   */
  async listUsers() {
    return this.request<{ users: User[] }>('get', 'user/list');
  }

  /**
   * Get User
   *
   * Get information about the authenticated user
   *
   * **GET** /user
   */
  async getUser() {
    return this.request<{
      /** The user object */
      user: User;
    }>('get', 'user');
  }

  /**
   * Update User
   *
   * Update profile information for the authenticated user
   *
   * **PUT** /user
   */
  async updateUser(
    options: {
      /** Update the email address */
      email?: string;
      /** Date of birth formatted as MM/DD/YYYY */
      dateOfBirth?: string;
      /** Shipping info for the user */
      shippingAddressCity?: string;
      /** Shipping info for the user */
      shippingAddressCountry?: string;
      /** Shipping info for the user */
      shippingAddressName?: string;
      /** Shipping info for the user */
      shippingAddressState?: string;
      /** Shipping info for the user */
      shippingAddressStreet?: string;
      /** Shipping info for the user */
      shippingAddressSuite?: string;
      /** Shipping info for the user */
      shippingAddressZip?: string;
      /** Update custom avatar resource (see Upload A Custom Avatar) */
      avatarResourceId?: number;
      /** Update custom username */
      username?: string;
      /** List of tag IDs the user is interested in */
      tags?: number[];
    } = {},
  ) {
    return this.request<{ user: User }>('put', 'user', options).then((data) => {
      this.cache.clear();
      return data;
    });
  }

  /**
   * Verify Email Address
   *
   * After intiating an email verification request, an email will be sent to the
   * user's inbox. The email will have a link with a token in it. Your client
   * should be able to handle this token when the user clicks on the link. The
   * link looks like this:
   *
   *     https://yourapp.com/?email_token=xxxxx
   *
   * When the user lands on this page, you should submit the token to the
   * `/email/verify` endpoint
   *
   * **POST** /email/request
   */
  async requestEmailVerification({
    returnPath,
  }: {
    /** The URL path to link to in the verification email */
    returnPath: string;
  }) {
    return this.request('post', 'email/request', { returnPath });
  }

  /**
   * Verify Email
   *
   * This endpoint should ONLY be used if you have a token from a
   * `/email/request` request
   *
   * **POST** /email/verify
   */
  async verifyEmail({
    token,
  }: {
    /** The token from the email verification */
    token: string;
  }) {
    return this.request('post', 'email/verify', { token });
  }

  /**
   * Upload Avatar
   *
   * Use this endpoint to get a URL for uploading a custom avatar
   *
   * **GET** /resource
   */
  async uploadAvatar(options: {
    /** The name of the file */
    name: string;
    /** The mime type of the file */
    type: string;
    /** Set to “true” to enable base64 upload */
    base64?: boolean;
  }) {
    return this.request<{ url: string; resourceId: number }>(
      'get',
      'resource',
      options,
    );
  }

  /**
   * Create Shopify Multipass Session
   *
   * Use this endpoint to request a URL for a Shopify Multipass session. The
   * authenticated user’s email address must be verified in our system for this
   * to work. Otherwise anyone could put any email address in their profile and
   * access that person’s Shopify account.
   *
   * Must be a Shopify Plus account holder. Contact support@botisimo.com to get
   * this feature enabled for your account.
   *
   * **GET** /user/multipass
   */
  async createShopifyMultipassSession({
    shopifyPath,
  }: {
    /** The URL path to the product to open */
    shopifyPath: string;
  }) {
    return this.request<{ href: string }>('get', 'user/multipass', {
      shopifyPath,
    });
  }

  /**
   * Disconnect Platform From Profile
   *
   * Use this input to disconnect a platform from their profile. You should
   * replace `:platform` with the platform you want to disconnect.
   *
   * Platform can be: `twitch`, `youtube`, `facebook`, `instagram`, `discord`,
   * `twitter`, `spotify`, `steam`, `battlenet`, `chess`, `tiktok`
   *
   * **DELETE** /user/profile/:platform
   */
  async disconnectPlatformFromProfile({
    platform,
  }: {
    /** The platform to disconnect */
    platform: string;
  }) {
    return this.request('delete', `user/profile/${platform}`);
  }

  // #region Billing API

  /**
   * Update Membership
   *
   * The update request should be made first when updating a subscription. If
   * the new membership is a free subscription, then the update will be
   * processed immediately. If the new membership is a paid subscription, then
   * it will return information about the update to be confirmed by the user. If
   * confirmation is required, then the client should ask the user to confirm
   * and then use the `/billing/confirm` endpoint
   *
   * **GET** /billing/update
   */
  async updateMembership({
    interval,
    membership,
    returnPath,
  }: {
    /** The billing interval. Should be `month` or `year` */
    interval: string;
    /** Membership ID */
    membership: number;
    /** The URL path to return to after stripe checkout */
    returnPath?: string;
  }) {
    return this.request<{
      /**
       * The amount due in cents to process the update. If included, the user
       * should be prompted to confirm the amount and then use the
       * `/billing/confirm` endpoint
       */
      amountDue?: number;
      /** If included, you should immediately redirect to this href */
      href?: string;
    }>('get', '/billing/update', {
      interval,
      membership,
      returnPath,
    });
  }

  /**
   * Confirm Update Membership
   *
   * This endpoint should ONLY be used after first using the `/billing/update`
   * endpoint and prompting the user to confirm the transaction.
   *
   * **GET** /billing/confirm
   */
  async confirmUpdateMembership({
    interval,
    membership,
    returnPath,
  }: {
    /** The billing interval. Should be `month` or `year` */
    interval: string;
    /** Membership ID */
    membership: number;
    /** The URL path to return to after stripe checkout */
    returnPath?: string;
  }) {
    return this.request<{
      /** If included, you should redirect to this href for adding a card */
      href?: string;
    }>('get', '/billing/confirm', { interval, membership, returnPath });
  }

  /**
   * Manage Billing
   *
   * Use this endpoint to request a URL for a billing management portal session
   *
   * **GET** /billing/manage
   */
  async manageBilling({
    returnPath,
  }: {
    /** The URL path to return to after stripe checkout */
    returnPath?: string;
  }) {
    return this.request<{
      /** The href to the billing management session */
      href: string;
    }>('get', '/billing/manage', {
      returnPath,
    });
  }

  // #region Membership API

  /**
   * List Memberships
   *
   * **GET** /membership/list
   */
  async listMemberships() {
    return this.request<{
      /** List of memberships */
      memberships: LoyaltyMembership[];
    }>('get', '/membership/list');
  }

  /**
   * Read Membership
   *
   * Read membership details
   *
   * **GET** /membership/:id
   */
  async readMembership({
    id,
  }: {
    /** The ID of the membership */
    id: number;
  }) {
    return this.request<{
      /** The membership object */
      membership: LoyaltyMembership;
    }>('get', `/membership/${id}`);
  }

  // #region Tier API

  /**
   * List Tiers
   *
   * List available tiers
   *
   * **GET** /tier/list
   */
  async listTiers() {
    return this.request<{
      /** List of tiers */
      tiers: LoyaltyTier[];
    }>('get', '/tier/list');
  }

  /**
   * Read Tier
   *
   * Read tier details
   *
   * **GET** /tier/:id
   */
  async readTier({
    id,
  }: {
    /** The ID of the tier */
    id: number;
  }) {
    return this.request<{ tier: LoyaltyTier }>('get', `/tier/${id}`);
  }

  // #region Creator API

  /**
   * List Creators
   *
   * List creators
   *
   * **GET** /creator/list
   */
  async listCreators() {
    return this.request<{
      /** List of creators */
      creators: Creator[];
    }>('get', '/creator/list');
  }

  // #region Mission API

  /**
   * List Missions
   *
   * List available missions
   *
   * **GET** /mission/list
   */
  async listMissions() {
    return this.request<{
      missions: Mission[];
    }>('get', '/mission/list');
  }

  /**
   * Read Mission
   *
   * Read mission details
   *
   * **GET** /mission/:id
   */
  async readMission({
    id,
  }: {
    /** The ID of the mission */
    id: number;
  }) {
    return this.request<{
      /** The mission object */
      mission: Mission;
    }>('get', `/mission/${id}`);
  }

  /**
   * Complete Mission
   *
   * Complete mission
   *
   * **PUT** /mission/:id/complete
   */
  async completeMission({
    id,
    code,
  }: {
    /** The ID of the mission */
    id: number;
    /** Required if code mission */
    code?: string;
  }) {
    return this.request<{
      /** The mission object */
      mission: Mission;
    }>('put', `/mission/${id}/complete`, {
      code,
    });
  }

  // #region Shop Item API

  /**
   * List Shop Items
   *
   * List available shop items
   *
   * **GET** /shopItem/list
   */
  async listShopItems() {
    return this.request<{
      /** List of shop items */
      shopItems: ShopItem[];
    }>('get', '/shopItem/list');
  }

  /**
   * Read Shop Item
   *
   * Read shop item details
   *
   * **GET** /shopItem/:id
   */
  async readShopItem({
    id,
  }: {
    /** The ID of the shop item */
    id: number;
  }) {
    return this.request<{
      /** The shop item object */
      shopItem: ShopItem;
    }>('get', `/shopItem/${id}`);
  }

  /**
   * Redeem Shop Item
   *
   * Redeem shop item
   *
   * **PUT** /shopItem/:id/redeem
   */
  async redeemShopItem({
    id,
  }: {
    /** The ID of the shop item */
    id: number;
  }) {
    return this.request<{
      /** The shop item object */
      shopItem: ShopItem;
    }>('put', `/shopItem/${id}/redeem`);
  }

  // #region Event API

  /**
   * List Events
   *
   * List scheduled events
   *
   * **GET** /event/list
   */
  async listEvents() {
    return this.request<{
      /** List of events */
      events: Event[];
    }>('get', '/event/list');
  }

  /**
   * Read Event
   *
   * Read event details
   *
   * **GET** /event/:id
   */
  async readEvent({
    id,
  }: {
    /** The ID of the event */
    id: number;
  }) {
    return this.request<{
      /** The event object */
      event: Event;
    }>('get', `/event/${id}`);
  }

  // #region Transaction API

  /**
   * List Transactions
   *
   * List transactions
   *
   * **GET** /transaction/list
   */
  async listTransactions() {
    return this.request<{
      /** List of transactions */
      transactions: Transaction[];
    }>('get', '/transaction/list');
  }

  // #region Notification API

  /**
   * List Notifications
   *
   * List notifications
   *
   * **GET** /notification/list
   */
  async listNotifications() {
    return this.request<{
      /** List of notifications */
      notifications: Notification[];
    }>('get', '/notification/list');
  }
}
