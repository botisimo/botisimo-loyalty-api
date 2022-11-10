import { BotisimoApi } from './botisimo-api';

type Payload<TMethod> = TMethod extends (options: infer Options) => any
  ? Options
  : never;
type Response<TMethod> = TMethod extends () => Promise<infer Response>
  ? Response
  : never;

export type GetMediaUrlPayload = Payload<BotisimoApi['getMediaUrl']>; // prettier-ignore
export type GetMediaUrlResponse = Response<BotisimoApi['getMediaUrl']>; // prettier-ignore
export type ForgotPasswordPayload = Payload<BotisimoApi['forgotPassword']>; // prettier-ignore
export type ForgotPasswordResponse = Response<BotisimoApi['forgotPassword']>; // prettier-ignore
export type LoginPayload = Payload<BotisimoApi['login']>; // prettier-ignore
export type LoginResponse = Response<BotisimoApi['login']>; // prettier-ignore
export type ResetPasswordPayload = Payload<BotisimoApi['resetPassword']>; // prettier-ignore
export type ResetPasswordResponse = Response<BotisimoApi['resetPassword']>; // prettier-ignore
export type SignupPayload = Payload<BotisimoApi['signup']>; // prettier-ignore
export type SignupResponse = Response<BotisimoApi['signup']>; // prettier-ignore
export type ConfirmUpdateMembershipPayload = Payload<BotisimoApi['confirmUpdateMembership']>; // prettier-ignore
export type ConfirmUpdateMembershipResponse = Response<BotisimoApi['confirmUpdateMembership']>; // prettier-ignore
export type ManageBillingPayload = Payload<BotisimoApi['manageBilling']>; // prettier-ignore
export type ManageBillingResponse = Response<BotisimoApi['manageBilling']>; // prettier-ignore
export type UpdateMembershipPayload = Payload<BotisimoApi['updateMembership']>; // prettier-ignore
export type UpdateMembershipResponse = Response<BotisimoApi['updateMembership']>; // prettier-ignore
export type ListCreatorsPayload = Payload<BotisimoApi['listCreators']>; // prettier-ignore
export type ListCreatorsResponse = Response<BotisimoApi['listCreators']>; // prettier-ignore
export type ListEventsPayload = Payload<BotisimoApi['listEvents']>; // prettier-ignore
export type ListEventsResponse = Response<BotisimoApi['listEvents']>; // prettier-ignore
export type ReadEventPayload = Payload<BotisimoApi['readEvent']>; // prettier-ignore
export type ReadEventResponse = Response<BotisimoApi['readEvent']>; // prettier-ignore
export type ListMembershipsPayload = Payload<BotisimoApi['listMemberships']>; // prettier-ignore
export type ListMembershipsResponse = Response<BotisimoApi['listMemberships']>; // prettier-ignore
export type ReadMembershipPayload = Payload<BotisimoApi['readMembership']>; // prettier-ignore
export type ReadMembershipResponse = Response<BotisimoApi['readMembership']>; // prettier-ignore
export type CompleteMissionPayload = Payload<BotisimoApi['completeMission']>; // prettier-ignore
export type CompleteMissionResponse = Response<BotisimoApi['completeMission']>; // prettier-ignore
export type ListMissionsPayload = Payload<BotisimoApi['listMissions']>; // prettier-ignore
export type ListMissionsResponse = Response<BotisimoApi['listMissions']>; // prettier-ignore
export type ReadMissionPayload = Payload<BotisimoApi['readMission']>; // prettier-ignore
export type ReadMissionResponse = Response<BotisimoApi['readMission']>; // prettier-ignore
export type ListShopItemsPayload = Payload<BotisimoApi['listShopItems']>; // prettier-ignore
export type ListShopItemsResponse = Response<BotisimoApi['listShopItems']>; // prettier-ignore
export type ReadShopItemPayload = Payload<BotisimoApi['readShopItem']>; // prettier-ignore
export type ReadShopItemResponse = Response<BotisimoApi['readShopItem']>; // prettier-ignore
export type RedeemShopItemPayload = Payload<BotisimoApi['redeemShopItem']>; // prettier-ignore
export type RedeemShopItemResponse = Response<BotisimoApi['redeemShopItem']>; // prettier-ignore
export type GetTeamPayload = Payload<BotisimoApi['getTeam']>; // prettier-ignore
export type GetTeamResponse = Response<BotisimoApi['getTeam']>; // prettier-ignore
export type ListTiersPayload = Payload<BotisimoApi['listTiers']>; // prettier-ignore
export type ListTiersResponse = Response<BotisimoApi['listTiers']>; // prettier-ignore
export type ReadTierPayload = Payload<BotisimoApi['readTier']>; // prettier-ignore
export type ReadTierResponse = Response<BotisimoApi['readTier']>; // prettier-ignore
export type ListTransactionsPayload = Payload<BotisimoApi['listTransactions']>; // prettier-ignore
export type ListTransactionsResponse = Response<BotisimoApi['listTransactions']>; // prettier-ignore
export type CreateShopifyMultipassSessionPayload = Payload<BotisimoApi['createShopifyMultipassSession']>; // prettier-ignore
export type CreateShopifyMultipassSessionResponse = Response<BotisimoApi['createShopifyMultipassSession']>; // prettier-ignore
export type DisconnectPlatformFromProfilePayload = Payload<BotisimoApi['disconnectPlatformFromProfile']>; // prettier-ignore
export type DisconnectPlatformFromProfileResponse = Response<BotisimoApi['disconnectPlatformFromProfile']>; // prettier-ignore
export type GetUserPayload = Payload<BotisimoApi['getUser']>; // prettier-ignore
export type GetUserResponse = Response<BotisimoApi['getUser']>; // prettier-ignore
export type ListUsersPayload = Payload<BotisimoApi['listUsers']>; // prettier-ignore
export type ListUsersResponse = Response<BotisimoApi['listUsers']>; // prettier-ignore
export type RequestEmailVerificationPayload = Payload<BotisimoApi['requestEmailVerification']>; // prettier-ignore
export type RequestEmailVerificationResponse = Response<BotisimoApi['requestEmailVerification']>; // prettier-ignore
export type UpdateUserPayload = Payload<BotisimoApi['updateUser']>; // prettier-ignore
export type UpdateUserResponse = Response<BotisimoApi['updateUser']>; // prettier-ignore
export type UploadAvatarPayload = Payload<BotisimoApi['uploadAvatar']>; // prettier-ignore
export type UploadAvatarResponse = Response<BotisimoApi['uploadAvatar']>; // prettier-ignore
export type VerifyEmailPayload = Payload<BotisimoApi['verifyEmail']>; // prettier-ignore
export type VerifyEmailResponse = Response<BotisimoApi['verifyEmail']>; // prettier-ignore
export type ListNotificationsPayload = Payload<BotisimoApi['listNotifications']>; // prettier-ignore
export type ListNotificationsResponse = Response<BotisimoApi['listNotifications']>; // prettier-ignore
