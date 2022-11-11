import { BotisimoLoyaltyApi } from './botisimo-loyalty-api';

type Payload<TMethod> = TMethod extends (options: infer Options) => any
  ? Options
  : never;
type Response<TMethod> = TMethod extends () => Promise<infer Response>
  ? Response
  : never;

export type GetMediaUrlPayload = Payload<BotisimoLoyaltyApi['getMediaUrl']>; // prettier-ignore
export type GetMediaUrlResponse = Response<BotisimoLoyaltyApi['getMediaUrl']>; // prettier-ignore
export type ForgotPasswordPayload = Payload<BotisimoLoyaltyApi['forgotPassword']>; // prettier-ignore
export type ForgotPasswordResponse = Response<BotisimoLoyaltyApi['forgotPassword']>; // prettier-ignore
export type LoginPayload = Payload<BotisimoLoyaltyApi['login']>; // prettier-ignore
export type LoginResponse = Response<BotisimoLoyaltyApi['login']>; // prettier-ignore
export type ResetPasswordPayload = Payload<BotisimoLoyaltyApi['resetPassword']>; // prettier-ignore
export type ResetPasswordResponse = Response<BotisimoLoyaltyApi['resetPassword']>; // prettier-ignore
export type SignupPayload = Payload<BotisimoLoyaltyApi['signup']>; // prettier-ignore
export type SignupResponse = Response<BotisimoLoyaltyApi['signup']>; // prettier-ignore
export type ConfirmUpdateMembershipPayload = Payload<BotisimoLoyaltyApi['confirmUpdateMembership']>; // prettier-ignore
export type ConfirmUpdateMembershipResponse = Response<BotisimoLoyaltyApi['confirmUpdateMembership']>; // prettier-ignore
export type ManageBillingPayload = Payload<BotisimoLoyaltyApi['manageBilling']>; // prettier-ignore
export type ManageBillingResponse = Response<BotisimoLoyaltyApi['manageBilling']>; // prettier-ignore
export type UpdateMembershipPayload = Payload<BotisimoLoyaltyApi['updateMembership']>; // prettier-ignore
export type UpdateMembershipResponse = Response<BotisimoLoyaltyApi['updateMembership']>; // prettier-ignore
export type ListCreatorsPayload = Payload<BotisimoLoyaltyApi['listCreators']>; // prettier-ignore
export type ListCreatorsResponse = Response<BotisimoLoyaltyApi['listCreators']>; // prettier-ignore
export type ListEventsPayload = Payload<BotisimoLoyaltyApi['listEvents']>; // prettier-ignore
export type ListEventsResponse = Response<BotisimoLoyaltyApi['listEvents']>; // prettier-ignore
export type ReadEventPayload = Payload<BotisimoLoyaltyApi['readEvent']>; // prettier-ignore
export type ReadEventResponse = Response<BotisimoLoyaltyApi['readEvent']>; // prettier-ignore
export type ListMembershipsPayload = Payload<BotisimoLoyaltyApi['listMemberships']>; // prettier-ignore
export type ListMembershipsResponse = Response<BotisimoLoyaltyApi['listMemberships']>; // prettier-ignore
export type ReadMembershipPayload = Payload<BotisimoLoyaltyApi['readMembership']>; // prettier-ignore
export type ReadMembershipResponse = Response<BotisimoLoyaltyApi['readMembership']>; // prettier-ignore
export type CompleteMissionPayload = Payload<BotisimoLoyaltyApi['completeMission']>; // prettier-ignore
export type CompleteMissionResponse = Response<BotisimoLoyaltyApi['completeMission']>; // prettier-ignore
export type ListMissionsPayload = Payload<BotisimoLoyaltyApi['listMissions']>; // prettier-ignore
export type ListMissionsResponse = Response<BotisimoLoyaltyApi['listMissions']>; // prettier-ignore
export type ReadMissionPayload = Payload<BotisimoLoyaltyApi['readMission']>; // prettier-ignore
export type ReadMissionResponse = Response<BotisimoLoyaltyApi['readMission']>; // prettier-ignore
export type ListShopItemsPayload = Payload<BotisimoLoyaltyApi['listShopItems']>; // prettier-ignore
export type ListShopItemsResponse = Response<BotisimoLoyaltyApi['listShopItems']>; // prettier-ignore
export type ReadShopItemPayload = Payload<BotisimoLoyaltyApi['readShopItem']>; // prettier-ignore
export type ReadShopItemResponse = Response<BotisimoLoyaltyApi['readShopItem']>; // prettier-ignore
export type RedeemShopItemPayload = Payload<BotisimoLoyaltyApi['redeemShopItem']>; // prettier-ignore
export type RedeemShopItemResponse = Response<BotisimoLoyaltyApi['redeemShopItem']>; // prettier-ignore
export type GetTeamPayload = Payload<BotisimoLoyaltyApi['getTeam']>; // prettier-ignore
export type GetTeamResponse = Response<BotisimoLoyaltyApi['getTeam']>; // prettier-ignore
export type ListTiersPayload = Payload<BotisimoLoyaltyApi['listTiers']>; // prettier-ignore
export type ListTiersResponse = Response<BotisimoLoyaltyApi['listTiers']>; // prettier-ignore
export type ReadTierPayload = Payload<BotisimoLoyaltyApi['readTier']>; // prettier-ignore
export type ReadTierResponse = Response<BotisimoLoyaltyApi['readTier']>; // prettier-ignore
export type ListTransactionsPayload = Payload<BotisimoLoyaltyApi['listTransactions']>; // prettier-ignore
export type ListTransactionsResponse = Response<BotisimoLoyaltyApi['listTransactions']>; // prettier-ignore
export type CreateShopifyMultipassSessionPayload = Payload<BotisimoLoyaltyApi['createShopifyMultipassSession']>; // prettier-ignore
export type CreateShopifyMultipassSessionResponse = Response<BotisimoLoyaltyApi['createShopifyMultipassSession']>; // prettier-ignore
export type DisconnectPlatformFromProfilePayload = Payload<BotisimoLoyaltyApi['disconnectPlatformFromProfile']>; // prettier-ignore
export type DisconnectPlatformFromProfileResponse = Response<BotisimoLoyaltyApi['disconnectPlatformFromProfile']>; // prettier-ignore
export type GetUserPayload = Payload<BotisimoLoyaltyApi['getUser']>; // prettier-ignore
export type GetUserResponse = Response<BotisimoLoyaltyApi['getUser']>; // prettier-ignore
export type ListUsersPayload = Payload<BotisimoLoyaltyApi['listUsers']>; // prettier-ignore
export type ListUsersResponse = Response<BotisimoLoyaltyApi['listUsers']>; // prettier-ignore
export type RequestEmailVerificationPayload = Payload<BotisimoLoyaltyApi['requestEmailVerification']>; // prettier-ignore
export type RequestEmailVerificationResponse = Response<BotisimoLoyaltyApi['requestEmailVerification']>; // prettier-ignore
export type UpdateUserPayload = Payload<BotisimoLoyaltyApi['updateUser']>; // prettier-ignore
export type UpdateUserResponse = Response<BotisimoLoyaltyApi['updateUser']>; // prettier-ignore
export type UploadAvatarPayload = Payload<BotisimoLoyaltyApi['uploadAvatar']>; // prettier-ignore
export type UploadAvatarResponse = Response<BotisimoLoyaltyApi['uploadAvatar']>; // prettier-ignore
export type VerifyEmailPayload = Payload<BotisimoLoyaltyApi['verifyEmail']>; // prettier-ignore
export type VerifyEmailResponse = Response<BotisimoLoyaltyApi['verifyEmail']>; // prettier-ignore
export type ListNotificationsPayload = Payload<BotisimoLoyaltyApi['listNotifications']>; // prettier-ignore
export type ListNotificationsResponse = Response<BotisimoLoyaltyApi['listNotifications']>; // prettier-ignore
