
export interface UstatChannel {
  numChannelsJoined: number;
  timeStamp: number;
}

export interface UstatDm {
  numDmsJoined: number;
  timeStamp: number;
}

export interface UstatMessages {
  numMessagesSent: number;
  timeStamp: number;
}

export interface userStats {
  channelsJoined: UstatChannel[];
  dmsJoined: UstatDm[];
  messagesSent: UstatMessages[];
  involvementRate: number;
}

export interface User {
  uId: number;
  email: string;
  nameFirst: string;
  nameLast: string;
  handleStr: string;
  password: string;
  globalOwner: number;
  profileImgUrl: string;
  stats: userStats;
}

export interface WstatChannel {
  numChannelsExist: number;
  timeStamp: number;
}

export interface WstatDm {
  numDmsExist: number;
  timeStamp: number;
}

export interface WstatMessages {
  numMessagesExist: number;
  timeStamp: number;
}

export interface workspaceStats {
  channelsExist: WstatChannel[];
  dmsExist: WstatDm[];
  messagesExist: WstatMessages[];
  utilizationRate: number;
}

export interface WorkspaceStatsReturn {
  workspaceStats: workspaceStats;
}

export interface UserStatsReturn {
  userStats: userStats;
}

export interface Reacts {
  reactId: number;
  uIds: number[];
  isThisUserReacted: boolean;
}

export interface Message {
  messageId: number;
  uId: number;
  message: string;
  timeSent: number;
  reacts: Reacts[];
  isPinned: boolean;
}

export interface Channel {
  channelId: number;
  name: string;
  channelAdmins: number[];
  channelMembers: number[];
  isPublic: boolean;
  messages: Message[];
  activeStandupTime: number;
  standupMessages: string[];
}

export interface Token {
  token: string;
  uId: number;
}

export interface DM {
  dmName: string;
  dmId: number;
  ownerId: number;
  recipientsId: number[];
  messages: Message[];
}

export interface ResetCode {
  email: string;
  code: string;
}

export interface DataStore {
  users: User[];
  channels: Channel[];
  messageIdCount: number;
  tokens: Token[];
  dms: DM[];
  resetCodes: ResetCode[];
  stats: workspaceStats;
}

export interface UserInfo {
  uId: number;
  email: string;
  nameFirst: string;
  nameLast: string;
  handleStr: string;
  profileImgUrl: string;
}

export interface UsersReturn {
  users: UserInfo[];
}

export interface dmDetail {
  name: string;
  members: UserInfo[];
}

export interface userReturn {
  user: UserInfo;
}

export interface dmId {
  dmId: number;
}

export interface dmInfo {
  dmId: number;
  name: string;
}

export interface dmsReturn {
  dms: dmInfo[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EmptyReturn {}

export interface ChannelId {
  channelId: number;
}

export interface ChannelInfo {
  channelId: number;
  name: string;
}

export interface Channels {
  channels: ChannelInfo[];
}

export interface ReturnUserId {
  authUserId: number
}

export interface ReturnAuth {
  token: string;
  authUserId: number;
}

export interface MessageReturn {
  messages: Message[];
  start: number;
  end: number;
}

export interface MessageId {
  messageId: number;
}

export interface Messages50 {
  messages: Message[];
  end: number;
}

export interface ChannelDetails {
  name: string;
  isPublic: boolean;
  ownerMembers: UserInfo[];
  allMembers: UserInfo[];
}

export interface Notification {
  channelId: number;
  dmId: number;
  notificationMessage: string;
}

export interface Notifications {
  notifications: Notification[];
}

export interface StandupStatus {
  isActive: boolean;
  timeFinish: number|null;
}

export interface finishTime {
  timeFinish: number;
}
