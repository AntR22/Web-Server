import HTTPError from 'http-errors';
import { getHash } from './auth';
import { MessageReturn, Message, Messages50, User, ChannelDetails, EmptyReturn, UserInfo } from './types';
import schema from './schema';

/// ////////////////////// vvv HELPER FUNCTIONS vvv ///////////////////////////

// Used in channelMessages.
// copies up to 50 elements from an array: Message[] into a second array, which it returns
function copyArrayElements(arr: Message[], start: number): Messages50 {
  const messages = [];
  let end = -1;
  for (let i = start; i < arr.length && i < start + 50; i++) {
    const message: Message = {
      uId: arr[i].uId,
      message: arr[i].message,
      messageId: arr[i].messageId,
      timeSent: arr[i].timeSent,
      reacts: arr[i].reacts,
      isPinned: arr[i].isPinned,
    };
    messages.push(message);
    end = i + 1;
  }
  if (end < start + 50) {
    end = -1;
  }
  return { messages, end };
}

// Used by ChannelDetails
// takes either a channelAdmins ot channelMembers array and finds the data associated with its uIds
// it then copies that data into an array of type UserInfo[].
function UserInfoMaker(ids: number[], sourceArray: User[]) {
  const userArray = [];
  for (const id of ids) {
    const uIndex = sourceArray.findIndex(obj => obj.uId === id);
    if (uIndex !== -1) {
      const matchingObject = sourceArray[uIndex];
      userArray.push({
        uId: matchingObject.uId,
        email: matchingObject.email,
        nameFirst: matchingObject.nameFirst,
        nameLast: matchingObject.nameLast,
        handleStr: matchingObject.handleStr,
        profileImgUrl: matchingObject.profileImgUrl
      });
    }
  }
  return userArray;
}

/**
 * Sample stub for channelDetailsV2
 * @param {string} token - Authenticated User ID
 * @param {integer} channelId - Channel ID
 * @param {Integer} start - Index to start reading messages from
 * @returns {
*messages: string[],
*start: number,
*end: number
* }
*/
export async function channelMessagesV3 (token: string, channelId: number, start: number): Promise<MessageReturn> {
  const hashedToken = getHash(token);
  const authUserId = await schema.Tokens.findOne({ token: hashedToken });

  if (authUserId === null) {
    throw HTTPError(403, 'token is not valid');
  }

  const channel = await schema.Channels.findOne({ channelId: channelId }).lean();

  if (channel === null) {
    throw HTTPError(400, 'channel does not exist');
  } else if (!channel.channelMembers.includes(authUserId.uId)) {
    throw HTTPError(403, 'user is not a member in the channel');
  }

  const messageBoard = JSON.parse(JSON.stringify(channel.messages));

  if (start > messageBoard.length || start < 0) {
    throw HTTPError(400, 'start is not valid');
  }

  const product: Messages50 = copyArrayElements(messageBoard, start);
  product.messages = product.messages.reverse();
  return {
    messages: product.messages,
    start: start,
    end: product.end,
  };
}

/**
 * Sample stub for channelDetailsV2
 * @param {string} token - Authenticated User ID
 * @param {integer} channelId - Channel ID
 * @returns {
 *name: string,
 *isPublic: boolean,
 *ownerMembers: UserInfo[],
 *allMembers: UserInfo[]
 * }
 */

export async function channelDetailsV3(token: string, channelId: number): Promise<ChannelDetails> {
  const hashedToken = getHash(token);
  const userId = await schema.Tokens.findOne({ token: hashedToken });

  if (userId === null) {
    throw HTTPError(403, 'token is not valid');
  }

  const channel = await schema.Channels.findOne({ channelId: channelId });

  if (channel === null) {
    throw HTTPError(400, 'channel does not exist');
  }
  if (!channel.channelMembers.includes(userId.uId)) {
    throw HTTPError(403, 'user is not a member in the channel');
  }

  const userArray: User[] = await schema.Users.find({});
  const ownerInfo: UserInfo[] = UserInfoMaker(channel.channelAdmins, userArray);

  const memberInfo: UserInfo[] = UserInfoMaker(channel.channelMembers, userArray);

  const channelDetails: ChannelDetails = {
    name: channel.name,
    isPublic: channel.isPublic,
    ownerMembers: ownerInfo,
    allMembers: memberInfo
  };

  return channelDetails;
}

/**
 * Sample stub for channelJoinV2
 * @param {string} token - token linked to Authenticated User ID
 * @param {integer} channelId - channel ID
 * @param {integer} uId - User ID
 * @returns {} empty object
 */

export async function channelInviteV3 (token: string, channelId: number, uId: number): Promise<EmptyReturn> {
  const hashedToken = getHash(token);
  const authUserId = await schema.Tokens.findOne({ token: hashedToken });

  if (authUserId === null) {
    throw HTTPError(403, 'token is not valid');
  }

  const user = await schema.Users.findOne({ uId: uId });
  if (user === null) {
    throw HTTPError(400, 'uId is not valid');
  }

  const userT = await schema.Users.findOne({ uId: authUserId.uId });

  const channel = await schema.Channels.findOne({ channelId: channelId });

  if (channel === null) {
    throw HTTPError(400, 'channel does not exist');
  }

  if (!channel.channelMembers.includes(userT.uId)) {
    throw HTTPError(403, 'authorised user is not a member of the channel');
  }

  if (channel.channelMembers.includes(user.uId)) {
    throw HTTPError(400, 'uId is alreay in channel');
  }

  channel.channelMembers.push(user.uId);

  const latest = user.stats.channelsJoined.slice(-1)[0];
  const curChannels = latest.numChannelsJoined + 1;
  await schema.Users.findOneAndUpdate({ uId: user.uId }, { $push: { 'stats.channelsJoined': { numChannelsJoined: curChannels, timeStamp: Math.floor(Date.now() / 1000) } } });

  await channel.save();
  return {};
}

/**
 * Sample stub for channelJoinV2
 * @param {string} token - token linked to Authenticated User ID
 * @param {integer} channelId - channel ID
 * @returns {} empty object
 */

export async function channelJoinV3 (token: string, channelId: number): Promise<EmptyReturn> {
  const hashedToken = getHash(token);
  const userId = await schema.Tokens.findOne({ token: hashedToken });

  if (userId === null) {
    throw HTTPError(403, 'token is not valid');
  }
  const channel = await schema.Channels.findOne({ channelId: channelId });

  if (channel === null) {
    throw HTTPError(400, 'channel does not exist');
  }

  const user = await schema.Users.findOne({ uId: userId.uId });
  const totalPerm: number = user.globalOwner;

  if (channel.channelMembers.includes(userId.uId)) {
    throw HTTPError(400, 'uId is alreay in channel');
  }

  if (channel.isPublic === false && totalPerm === 1) {
    throw HTTPError(403, 'channel is private, cannot join');
  }

  channel.channelMembers.push(userId.uId);
  await channel.save();

  const latest = user.stats.channelsJoined.slice(-1)[0];
  const curChannels = latest.numChannelsJoined + 1;
  await schema.Users.findOneAndUpdate({ uId: user.uId }, { $push: { 'stats.channelsJoined': { numChannelsJoined: curChannels, timeStamp: Math.floor(Date.now() / 1000) } } });

  return {};
}

/**
 * Sample stub for channelLeaveV1
 * @param {string} token - token linked to Authenticated User ID
 * @param {integer} channelId - channel ID
 * @returns {} empty object
 */

export async function channelLeaveV2 (token: string, channelId: number): Promise<EmptyReturn> {
  const hashedToken = getHash(token);
  const userId = await schema.Tokens.findOne({ token: hashedToken });

  if (userId === null) {
    throw HTTPError(403, 'token is not valid');
  }
  const channel = await schema.Channels.findOne({ channelId: channelId });

  if (channel === null || channel.activeStandupTime > Math.floor(Date.now() / 1000)) {
    throw HTTPError(400, 'channel does not exist');
  }

  if (!channel.channelMembers.includes(userId.uId)) {
    throw HTTPError(403, 'user is not in channel');
  }

  channel.channelMembers = channel.channelMembers.filter(x => x === userId.uId);
  channel.channelAdmins = channel.channelAdmins.filter(x => x === userId.uId);
  await channel.save();
  const user = await schema.Users.findOne({ uId: userId.uId });
  const latest = user.stats.channelsJoined.slice(-1)[0];
  const curChannels = latest.numChannelsJoined - 1;
  await schema.Users.findOneAndUpdate({ uId: user.uId }, { $push: { 'stats.channelsJoined': { numChannelsJoined: curChannels, timeStamp: Math.floor(Date.now() / 1000) } } });

  return {};
}

/**
 * Sample stub for channelAddownerV2
 * @param {string} token - token linked to Authenticated User ID
 * @param {integer} channelId - channel ID
 * @param {interger} uId - User ID
 * @returns {} empty object
 */

export async function channelAddownerV2 (token: string, channelId: number, uId: number): Promise<EmptyReturn> {
  const hashedToken = getHash(token);
  const userId = await schema.Tokens.findOne({ token: hashedToken });

  if (userId === null) {
    throw HTTPError(403, 'token is not valid');
  }

  const channel = await schema.Channels.findOne({ channelId: channelId });

  if (channel === null) {
    throw HTTPError(400, 'channel does not exist');
  }

  const user = await schema.Users.findOne({ uId: userId.uId });

  if (!channel.channelAdmins.includes(userId.uId) && user.globalOwner === 1) {
    throw HTTPError(403, 'user does not have perms in this channel');
  }

  if (!channel.channelMembers.includes(uId)) {
    throw HTTPError(400, 'uId is not in channel');
  }

  if (channel.channelAdmins.includes(uId)) {
    throw HTTPError(400, 'uId is alreay an owner');
  }

  channel.channelAdmins.push(uId);
  await channel.save();

  return {};
}

/**
 * Sample stub for channelRemoveownerV2
 * @param {string} token - token linked to Authenticated User ID
 * @param {integer} channelId - channel ID
 * @param {interger} uId - User ID
 * @returns {} empty object
 */

export async function channelRemoveownerV2 (token: string, channelId: number, uId: number): Promise<EmptyReturn> {
  const hashedToken = getHash(token);
  const userId = await schema.Tokens.findOne({ token: hashedToken });
  if (userId === null) {
    throw HTTPError(403, 'token is not valid');
  }
  const user = await schema.Users.findOne({ uId: userId.uId });
  const channel = await schema.Channels.findOne({ channelId: channelId });

  if (channel === null) {
    throw HTTPError(400, 'channel does not exist');
  }

  const uIdUser = await schema.Users.findOne({ uId: uId });

  if (uIdUser === null) {
    throw HTTPError(400, 'uId is not valid');
  }

  if (!channel.channelAdmins.includes(uId)) {
    throw HTTPError(400, 'uId is not in channel');
  }

  if (!(channel.channelAdmins.includes(user.uId)) && user.globalOwner !== 2) {
    throw HTTPError(403, 'user does not have perms in this channel');
  }

  if (!channel.channelAdmins.includes(uId)) {
    throw HTTPError(400, 'uId is not an admin');
  }

  if (channel.channelAdmins.length === 1) {
    throw HTTPError(400, 'cannot remove, only one admin left');
  }

  channel.channelAdmins = channel.channelAdmins.filter((x: number) => x === uId);
  await channel.save();
  return {};
}
