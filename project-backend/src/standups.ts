import HTTPError from 'http-errors';
import { EmptyReturn, Message, StandupStatus, finishTime } from './types';
import { getHash } from './auth';
import schema from './schema';

/**
  * Takes in a token and checks that it is present within the datastore
  *
  * @param {string} token - user token
  * ...
  *
  * @returns {boolean} - true if its present, false if not
*/
async function checkToken(token: string): Promise<boolean> {
  const hashedToken = getHash(token);
  const query = await schema.Tokens.exists({ token: hashedToken }).exec();
  if (query !== null) {
    return true;
  } else {
    return false;
  }
}

/**
  * Takes in a channel id num and checks that it is present within the datastore
  *
  * @param {number} id -channel id
  * ...
  *
  * @returns {boolean} - true if its present, false if not
*/
async function checkChannelId(id: number): Promise<boolean> {
  const query = await schema.Channels.exists({ channelId: id }).exec();
  if (query !== null) {
    return true;
  } else {
    return false;
  }
}

/**
 * For a valid token, channelId, length, if the user is a member of the channel,
 * start an standup buffer that takes go on for length seconds, messages are compressed to one messages
 * If there are no standups there should be no message sent
 * @param token
 * @param channelId
 * @param length
 * @returns HTTP errors and finishing time
 */
export async function standupStartV1 (token: string, channelId: number, length: number): Promise<finishTime> {
  const validChannel = await checkChannelId(channelId);
  if (!validChannel) {
    throw HTTPError(400, 'channel id invalid');
  }
  const validToken = await checkToken(token);
  if (!validToken) {
    throw HTTPError(403, 'token does not refer to a valid user');
  }
  if (length < 0) {
    throw HTTPError(400, 'invalid length of duration');
  }

  const hashedToken = getHash(token);
  const id = await schema.Tokens.findOne({ token: hashedToken });
  const channel = await schema.Channels.findOne({ channelId: channelId });

  if (!channel.channelMembers.includes(id.uId)) {
    throw HTTPError(403, 'user is not a member of the channel');
  }

  async function sendingMessages() {
    if (channel.standupMessages.length > 0) {
      const msgText = channel.standupMessages.join('\n');

      const mId = (await schema.MessageCounter.findOne({}).sort('-count').limit(1).exec()).count + 1;
      schema.MessageCounter.create({ count: mId });
      const msgId = mId;

      const msg: Message = {
        uId: id.uId,
        messageId: msgId,
        timeSent: Math.floor(Date.now() / 1000),
        message: msgText,
        reacts: [],
        isPinned: false
      };
      channel.messages.push(msg);
      channel.standupMessages.length = 0;

      const user = await schema.Users.findOne({ uId: id.uId });
      const latest = user.stats.messagesSent.slice(-1)[0];
      const curmsgs = latest.numMessagesSent + 1;
      await schema.Users.findOneAndUpdate({ uId: id.uId }, { $push: { 'stats.messagesSent': { numMessagesSent: curmsgs, timeStamp: Math.floor(Date.now() / 1000) } } });

      const currentmsgs = (await schema.MessagesExist.findOne({}).sort('-timeSent').limit(1).exec()).numMessagesExist + 1;
      await schema.MessagesExist.create({ numMessagesExist: currentmsgs, timeStamp: Math.floor(Date.now() / 1000) });

      await channel.save();
    }
  }

  if (channel.activeStandupTime <= Math.floor((new Date()).getTime() / 1000) || channel.activeStandupTime === undefined) {
    const finishTime: number = Math.floor((new Date()).getTime() / 1000) + length;
    channel.activeStandupTime = finishTime;
    await channel.save();
    setTimeout(sendingMessages, length * 1000);
    return { timeFinish: finishTime };
  }

  throw HTTPError(400, 'already a standup in the channel');
}

/**
 * Tkes in a channelId from a user's token, check if the channel, user is valid and user is a member
 * returns the status of the channel standup { isActive: boolean, timeFinish: number }
 * @param token
 * @param channelId
 * @returns HTTP error or standup returns
 */
export async function standupActiveV1 (token: string, channelId: number): Promise<StandupStatus> {
  const validChannel = await checkChannelId(channelId);
  if (!validChannel) {
    throw HTTPError(400, 'channel id invalid');
  }
  const validToken = await checkToken(token);
  if (!validToken) {
    throw HTTPError(403, 'token does not refer to a valid user');
  }

  const hashedToken = getHash(token);
  const id = await schema.Tokens.findOne({ token: hashedToken });
  const channel = await schema.Channels.findOne({ channelId: channelId });

  if (channel.channelMembers.includes(id.uId) || channel.channelAdmins.includes(id.uId)) {
    if (channel.activeStandupTime > Math.floor((new Date()).getTime() / 1000)) {
      return { isActive: true, timeFinish: channel.activeStandupTime };
    }
    return { isActive: false, timeFinish: null };
  } else {
    throw HTTPError(403, 'user is not a member of the channel');
  }
}

/**
 * The function takes in a token, channelId and message, if valid and user is a member of the channel
 * the message is sent into the buffer string of the channelStandup buffer
 * @param token inputted from the server url
 * @param channelId about the channel to have standups
 * @param message message inputted into the buffer string
 */
export async function standupSendV1 (token: string, channelId: number, message: string): Promise<EmptyReturn> {
  const validChannel = await checkChannelId(channelId);
  if (!validChannel) {
    throw HTTPError(400, 'channel id invalid');
  }
  const validToken = await checkToken(token);
  if (!validToken) {
    throw HTTPError(403, 'token does not refer to a valid user');
  }

  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'message is invalid length');
  }

  const hashedToken = getHash(token);
  const id = await schema.Tokens.findOne({ token: hashedToken });
  const channel = await schema.Channels.findOne({ channelId: channelId });
  const user = await schema.Users.findOne({ uId: id.uId });

  if (channel.channelMembers.includes(id.uId) || channel.channelAdmins.includes(id.uId)) {
    if (channel.activeStandupTime > Math.floor((new Date()).getTime() / 1000)) {
      const handle = user.handleStr;
      const input = handle + ': ' + message;
      channel.standupMessages.push(input);
      await channel.save();
      return {};
    }
    throw HTTPError(400, 'already a standup in the channel');
  }
  throw HTTPError(403, 'user is not a member of the channel');
}
