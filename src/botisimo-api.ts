import axios, { AxiosInstance } from 'axios';
import { withCache } from './axios-cache-decorator';
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

globalThis.localStorage =
  // @ts-ignore
  this.localStorage ||
  (() => {
    const result = {
      // @ts-ignore
      getItem: (name: string) => result[name],
      // @ts-ignore
      setItem: (name: string, value: any) => (result[name] = value),
    };

    return result;
  })();

export class BotisimoApi {
  protected axios: AxiosInstance;
  public cache: ExpiringStore;

  constructor(
    teamName: string,
    {
      defaultCacheTtl = 5 * 60 * 1000,
    }: {
      /** Time in ms for cache entries to expires (default: 5 minutes) */
      defaultCacheTtl?: number;
    } = {},
  ) {
    this.cache = new ExpiringStore(defaultCacheTtl);
    const endpoint = teamName.startsWith('http')
      ? teamName
      : `https://botisimo.com/api/v1/loyalty/${teamName}`;
    // Make axios use the cache
    this.axios = withCache(
      axios.create({
        baseURL: endpoint,
        headers: {
          ['x-user-auth-token']: this.getToken(),
        },
      }),
      this.cache,
    );
  }

  private getToken() {
    return localStorage.getItem('botisimo-auth-token') ?? '';
  }

  private storeToken(token: string) {
    localStorage.setItem('botisimo-auth-token', token);
    this.axios.defaults.headers.common['x-user-auth-token'] = token;
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
    return this.axios
      .get<{
        /** The team object */
        team: Team;
      }>('')
      .then((r) => r.data)
      .catch(normalizeError);
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
    return this.axios
      .post('/signup', options)
      .then((r) => r.data)
      .then((data) => {
        if (data.token) {
          this.storeToken(data.token);
        }

        return data;
      })
      .catch(normalizeError);
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
    return (
      this.axios
        .post<{
          /** The user object */
          user: User;
          /** The user’s auth token */
          token: string;
        }>('/login', { email, password })
        .then((r) => r.data)
        // Store auth tokens
        .then((data) => {
          if (data.token) {
            this.storeToken(data.token);
          }

          return data;
        })
        .catch(normalizeError)
    );
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
    return this.axios
      .post('/password/forgot', { email, returnPath })
      .then((r) => r.data)
      .catch(normalizeError);
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
    return this.axios
      .post('/password/reset', { password, token })
      .then((r) => r.data)
      .then((data) => {
        if (data.token) {
          this.storeToken(data.token);
        }

        return data;
      })
      .catch(normalizeError);
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
    return this.axios
      .get<{
        /** List of users */
        users: User[];
      }>('/user/list')
      .then((r) => r.data)
      .catch(normalizeError);
  }

  /**
   * Get User
   *
   * Get information about the authenticated user
   *
   * **GET** /user
   */
  async getUser() {
    return this.axios
      .get<{
        /** The user object */
        user: User;
      }>('/user')
      .then((r) => r.data)
      .catch(normalizeError);
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
    return this.axios
      .put<{
        /** The user object */
        user: User;
      }>('/user', options)
      .then((r) => {
        this.cache.clear();
        return r.data;
      })
      .catch(normalizeError);
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
    return this.axios
      .post('/email/request', { returnPath })
      .then((r) => r.data)
      .catch(normalizeError);
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
    return this.axios
      .post('/email/verify', { token })
      .then((r) => r.data)
      .catch(normalizeError);
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
    return this.axios
      .get<{
        /** The URL to upload the image to */
        url: string;
        /** The ID of the resource */
        resourceId: number;
      }>('/resource', { params: options })
      .then((r) => r.data)
      .catch(normalizeError);
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
    return this.axios
      .get<{
        /** The URL to open in the Shopify Multipass session */
        href: string;
      }>('/user/multipass', {
        params: { shopifyPath },
      })
      .then((r) => r.data)
      .catch(normalizeError);
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
    return this.axios
      .delete(`/user/profile/${platform}`)
      .then((r) => r.data)
      .catch(normalizeError);
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
    return this.axios
      .get<{
        /**
         * The amount due in cents to process the update. If included, the user
         * should be prompted to confirm the amount and then use the
         * `/billing/confirm` endpoint
         */
        amountDue?: number;
        /** If included, you should immediately redirect to this href */
        href?: string;
      }>('/billing/update', {
        params: { interval, membership, returnPath },
      })
      .then((r) => r.data)
      .catch(normalizeError);
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
    return this.axios
      .get<{
        /** If included, you should redirect to this href for adding a card */
        href?: string;
      }>('/billing/confirm', {
        params: { interval, membership, returnPath },
      })
      .then((r) => r.data)
      .catch(normalizeError);
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
    return this.axios
      .get<{
        /** The href to the billing management session */
        href: string;
      }>('/billing/manage', {
        params: { returnPath },
      })
      .then((r) => r.data)
      .catch(normalizeError);
  }

  // #region Membership API

  /**
   * List Memberships
   *
   * **GET** /membership/list
   */
  async listMemberships() {
    return this.axios
      .get<{
        /** List of memberships */
        memberships: LoyaltyMembership[];
      }>('/membership/list')
      .then((r) => r.data)
      .catch(normalizeError);
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
    return this.axios
      .get<{
        /** The membership object */
        membership: LoyaltyMembership;
      }>(`/membership/${id}`)
      .then((r) => r.data)
      .catch(normalizeError);
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
    return this.axios
      .get<{
        /** List of tiers */
        tiers: LoyaltyTier[];
      }>('/tier/list')
      .then((r) => r.data)
      .catch(normalizeError);
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
    return this.axios
      .get<{ tier: LoyaltyTier }>(`/tier/${id}`)
      .then((r) => r.data)
      .catch(normalizeError);
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
    return this.axios
      .get<{
        /** List of creators */
        creators: Creator[];
      }>('/creator/list')
      .then((r) => r.data)
      .catch(normalizeError);
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
    return this.axios
      .get<{
        missions: Mission[];
      }>('/mission/list')
      .then((r) => r.data)
      .catch(normalizeError);
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
    return this.axios
      .get<{
        /** The mission object */
        mission: Mission;
      }>(`/mission/${id}`)
      .then((r) => r.data)
      .catch(normalizeError);
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
    return this.axios
      .put<{
        /** The mission object */
        mission: Mission;
      }>(`/mission/${id}/complete`, {
        code,
      })
      .then((r) => r.data)
      .catch(normalizeError);
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
    return this.axios
      .get<{
        /** List of shop items */
        shopItems: ShopItem[];
      }>('/shopItem/list')
      .then((r) => r.data)
      .catch(normalizeError);
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
    return this.axios
      .get<{
        /** The shop item object */
        shopItem: ShopItem;
      }>(`/shopItem/${id}`)
      .then((r) => r.data)
      .catch(normalizeError);
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
    return this.axios
      .put<{
        /** The shop item object */
        shopItem: ShopItem;
      }>(`/shopItem/${id}/redeem`)
      .then((r) => r.data)
      .catch(normalizeError);
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
    return this.axios
      .get<{
        /** List of events */
        events: Event[];
      }>('/event/list')
      .then((r) => r.data)
      .catch(normalizeError);
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
    return this.axios
      .get<{
        /** The event object */
        event: Event;
      }>(`/event/${id}`)
      .then((r) => r.data)
      .catch(normalizeError);
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
    return this.axios
      .get<{
        /** List of transactions */
        transactions: Transaction[];
      }>('/transaction/list')
      .then((r) => r.data)
      .catch(normalizeError);
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
    return this.axios
      .get<{
        /** List of notifications */
        notifications: Notification[];
      }>('/notification/list')
      .then((r) => r.data)
      .catch(normalizeError);
  }
}
