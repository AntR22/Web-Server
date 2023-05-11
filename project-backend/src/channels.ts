import HTTPError from 'http-errors';
import { getHash } from './auth';
import { Channel, ChannelId, Channels } from './types';
import schema from './schema';
/**
*  checks if a user it part of the data object
*  @returns {number} - the current highest channel Id or 0 if no channels exist
*/
async function checkHighestId (): Promise<number> {
  const channel = (await schema.Channels.findOne({}).sort('-ChannelId').limit(1).exec());
  if (channel === null) {
    return 1;
  }
  return channel.channelId + 1;
}

/**
 *
 * @param {string} data - datastore containing a users array
 * @param {string} token - unique token of each user
 * @returns {bool} - bool of whether the user is in the object
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
 * Lets a user create a new channel that is either public or private.
 * @param {string} token - unique identifier for each user for each session
 * @param {string} name - name of the channel
 * @param {bool} isPublic - publicity state of the channel
 * @returns {channelId} - the channel ID
 */
export async function channelsCreateV3(token: string, name: string, isPublic: boolean): Promise<ChannelId> {
  if (name.length < 1 || name.length > 20) {
    throw HTTPError(400, 'invalid channel name');
  }
  const validToken = await checkToken(token);
  if (!validToken) {
    throw HTTPError(403, 'token does not refer to a valid user');
  }
  const hashedToken = getHash(token);
  const id = await schema.Tokens.findOne({ token: hashedToken });
  const cId = await checkHighestId();

  const channel: Channel = {
    channelId: 0,
    name: '',
    isPublic: false,
    channelAdmins: [],
    channelMembers: [],
    messages: [],
    standupMessages: [],
    activeStandupTime: undefined,
  };
  channel.channelId = cId;
  channel.name = name;
  channel.isPublic = isPublic;
  channel.channelAdmins = [];
  channel.channelMembers = [];
  channel.messages = [];
  channel.activeStandupTime = 0;
  channel.standupMessages = [];
  channel.channelAdmins.push(id.uId);
  channel.channelMembers.push(id.uId);
  await schema.Channels.create(channel);

  const user = await schema.Users.findOne({ uId: id.uId });
  const latest = user.stats.channelsJoined.slice(-1)[0];
  const curChannels = latest.numChannelsJoined + 1;
  await schema.Users.findOneAndUpdate({ uId: id.uId }, { $push: { 'stats.ChannelsJoined': { numChannelsJoined: curChannels, timeStamp: Math.floor(Date.now() / 1000) } } });

  const current = await schema.Channels.count({});
  await schema.ChannelsExist.create({ numChannelsExist: current, timeStamp: Math.floor(Date.now() / 1000) });

  return { channelId: cId };
}

/**
 * Lets a user create a new channel that is either public or private.
 * @param {string} token - unique identifier for each user for each session
 * @returns {channels} - list of all public channels
 */
export async function channelsListV3 (token: string): Promise<Channels> {
  const validToken = await checkToken(token);
  if (!validToken) {
    throw HTTPError(403, 'token does not refer to a valid user');
  }
  const hashedToken = getHash(token);
  const id = await schema.Tokens.findOne({ token: hashedToken });
  const channels: Channel[] = await schema.Channels.find({ channelMembers: id.uId }).select({ _id: 0, channelId: 1, name: 1 });

  return { channels: channels };
}

/**
 *
 * @param token - unique identifier for each user for each session
 * @returns {channels} - lst of all channels
 */
export async function channelsListAllV3 (token: string): Promise<Channels> {
  const validToken = await checkToken(token);
  if (!validToken) {
    throw HTTPError(403, 'token does not refer to a valid user');
  }
  const channels: Channel[] = await schema.Channels.find({}).select({ _id: 0, channelId: 1, name: 1 });

  return { channels: channels };
}
