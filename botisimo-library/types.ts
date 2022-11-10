/** A team */
export interface Team {
  /** The name of the team */
  name: string;
  /** The name of the loyalty points */
  currencyName: string;
  /** List of memberships */
  loyaltyMemberships: LoyaltyMembership[];
  /** List of tiers */
  loyaltyTiers: LoyaltyTier[];
  /** List of tags */
  tags: Tag[];
}

export interface ErrorResponse {
  message: string;
}

export interface Event {
  /** The ID of the event */
  id: number;
  /** The name of the event */
  name: string;
  /** The event description */
  description: string;
  /** The event URL */
  url: string;
  /** The label for the call to action button */
  callToAction: string;
  /** The location of the event */
  location: string;
  /** Unix timestamp of start of event */
  start: number;
  /** Unix timestamp of end of event */
  end: number;
  /** Status of the event (completed, upcoming, ongoing) */
  status: string;
  /** The resource ID of the event image */
  resourceId: number;
  /** List of tags */
  tags: Tag[];
}

export interface Features {}

/** Membership to a loyalty team */
export interface LoyaltyMembership {
  /** The ID of the membership */
  id: number;
  /** The name of the membership */
  name: string;
  /** The membership description */
  description: string;
  /** The cost of the membership per month in cents */
  priceMonth: number;
  /** The cost of the membership per year in cents */
  priceYear: number;
  /** The loyalty points multiplier for this membership */
  goldMultiplier: number;
  /** The resource ID of the membership image */
  resourceId: number;
  /** The resource ID of the membership badge */
  badgeResourceId: number;
}

/** A subscription level for a User to a Team */
export interface LoyaltyTier {
  /** The ID of the tier */
  id: number;
  /** The name of the tier */
  name: string;
  /** The tier description */
  description: string;
  /** The points required to achieve tier */
  gold: number;
  /** The resource ID of the tier image */
  resourceId: number;
  /** The resource ID of the tier badge */
  badgeResourceId: number;
}

export interface Mission {
  /** The ID of the mission */
  id: number;
  /** The name of the mission */
  name: string;
  /** The mission description */
  description: string;
  /** The mission type */
  type: string;
  /** The number of loyalty points rewarded */
  reward: number;
  /** The resource ID of the mission image */
  resourceId: number;
  /** List of tags */
  tags: Tag[];
  /** The secret for the mission */
  secret: string;
}

export interface Details {
  platform: string;
  connectionId: string;
}

export interface User {
  /** URL to to user avatar */
  avatar: string;
  /** When the user was created */
  createdAt: string;
  /** Date of birth formatted as MM/DD/YYYY */
  dateOfBirth: string;
  /** Number of loyalty points the user currently has available */
  gold: number;
  /** Number of loyalty points the user has earned all time */
  goldTotal: number;
  /** Number of loyalty points the user has spent */
  goldSpent: number;
  /** The ID of the user */
  id: number;
  /** The membership the user is subscribed to */
  loyaltyMembership: LoyaltyMembership;
  /** The tier the user is subscribed to */
  loyaltyTier: LoyaltyTier;
  /** The name of the user */
  name: string;
  /** The last time the user read the notifications formatted as ISO date string */
  notifications: string;
  /** Shipping info for the user */
  shippingAddressCity: string;
  /** Shipping info for the user */
  shippingAddressCountry: string;
  /** Shipping info for the user */
  shippingAddressName: string;
  /** Shipping info for the user */
  shippingAddressState: string;
  /** Shipping info for the user */
  shippingAddressStreet: string;
  /** Shipping info for the user */
  shippingAddressSuite: string;
  /** Shipping info for the user */
  shippingAddressZip: string;
  /** List of tags the user is interested in */
  tags: Tag[];
  guildId: number;
  lifeTimeValue: number;
  ipAddress: string;
  referrer: string;
  userAgent: string;
  userAgentPlatform: string;
  userAgentDevice: null;
  userAgentApp: string;
  userAgentVendor: null;
  continent: string;
  country: string;
  city: string;
  longitude: number;
  latitude: number;
  lastSynced: string;
  memberfulId: null;
  updatedAt: string;
  emailUser: EmailUser;
  twitchUser: null;
  youtubeUser: null;
  facebookUser: null;
  dliveUser: null;
  trovoUser: null;
  brimeUser: null;
  twitterUser: null;
  zoomUser: null;
  discordUser: null;
  slackUser: null;
  spotifyUser: null;
  steamUser: null;
  battlenetUser: null;
  chessUser: null;
  instagramUser: null;
  tiktokUser: null;
  loyaltyMembershipId: number;
  loyaltyTierId: null;
  stripeCustomerId: string;
  avatarResourceId: null;
  username: null;
  emailVerified: boolean;
}

export interface Creator {
  /** The ID of the creator */
  id: number;
  /** True if the creator has a Twitch connection */
  hasTwitch: boolean;
  /** List of Twitch connections */
  twitchConnections: TwitchConnection[];
  /** True if the creator has a YouTube connection */
  hasYoutube: boolean;
  /** List of YouTube connections */
  youtubeConnections: YoutubeConnection[];
  /** True if the creator has a Facebook connection */
  hasFacebook: boolean;
  /** List of Facebook connections */
  facebookConnections: FacebookConnection[];
  /** True if the creator has a Twitter connection */
  hasTwitter: boolean;
  /** List of Twitter connections */
  twitterConnections: TwitterConnection[];
  /** True if the creator is currently live */
  live: boolean;
  /** URL to the creator logo */
  logo: string;
}

interface ConnectionBase {
  /** True if the connection is enabled */
  enabled: boolean;
  /** True if the connection is currently live */
  online: boolean;
  /** Number of current viewers */
  currentViewers: number;
}

export interface TwitchConnection extends ConnectionBase {
  /** The ID of the Twitch connection */
  twitchId: string;
  /** URL to the Twitch logo */
  twitchLogo: string;
  /** The display name of the Twitch connection */
  twitchDisplayName: string;
}

export interface YoutubeConnection extends ConnectionBase {
  /** The ID of the YouTube connection */
  youtubeId: string;
  /** URL to the YouTube logo */
  youtubeLogo: string;
  /** The display name of the YouTube connection */
  youtubeDisplayName: string;
}

export interface FacebookConnection extends ConnectionBase {
  /** The ID of the Facebook connection */
  facebookId: string;
  /** URL to the Facebook logo */
  facebookLogo: string;
  /** The display name of the Facebook connection */
  facebookDisplayName: string;
}

export interface TwitterConnection extends ConnectionBase {
  /** The ID of the Twitter connection */
  twitterId: string;
  /** URL to the Twitter logo */
  twitterLogo: string;
  /** The display name of the Twitter connection */
  twitterDisplayName: string;
}

export interface EmailUser {
  id: number;
  email: string;
  name: string;
  chatName: string;
  displayName: null;
  avatar: null;
  avatarUrl: string;
  createdAt: string;
}

export interface Tag {
  /** The ID of the tag */
  id: number;
  /** The name of the tag */
  name: string;
}

export interface Notification {
  /** The ID of the notification */
  id: number;
  /** The ISO date of when the notification was created */
  timestamp: string;
  /** The notification display text */
  body: string;
  /** The event connected to the notification, if one exists */
  event?: Event;
  /** The mission connected to the notification, if one exists */
  mission?: Mission;
  /** The shop item connected to the notification, if one exists */
  rpgShopItem?: ShopItem;
  /**
   * The resource ID of the notification image. You should use the resource ID
   * from the event, mission, or rpgShopItem if they exist
   */
  resourceId?: number;
  /** The URL link related to the notification, if one exists */
  link?: string;
}

export interface ShopItem {
  /** The ID of the shop item */
  id: number;
  /** The name of the shop item */
  name: string;
  /** The shop item description */
  description: string;
  /** The shop item type */
  type: string;
  /** The price in loyalty points to redeem */
  price: number;
  /** The quantity available */
  quantity: number;
  /** The resource ID of the shop item image */
  resourceId: number;
  /** The minimum loyalty tier required */
  loyaltyTierId: number;
  /** List of tags */
  tags: Tag[];
}

export interface Transaction {
  /** The ID of the transaction */
  id: number;
  /** The amount of points for the transaction (may be positive or negative) */
  amount: number;
  /** The ISO date of when the transaction was created */
  createdAt: string;
  /** The transaction display text */
  description: string;
  /** The mission connected to the transaction, if one exists */
  mission?: Mission;
  /** The shop item connected to the transaction, if one exists */
  rpgShopItem?: ShopItem;
  /** The URL link related to the transaction, if one exists */
  link?: string;
}
