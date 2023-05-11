import { EmptyReturn, Message } from './types';
import { getHash } from './auth';
import HTTPError from 'http-errors';
import schema from './schema';

/**
*  Clears all data from the dataStore
*  @param none
*  @returns {}
*/
export async function clearV1(): Promise<EmptyReturn> {
  await schema.Channels.deleteMany({});
  await schema.Dms.deleteMany({});
  await schema.MessageCounter.deleteMany({});
  await schema.ResetCodes.deleteMany({});
  await schema.Tokens.deleteMany({});
  await schema.Users.deleteMany({});
  await schema.ChannelsExist.deleteMany({});
  await schema.DmsExist.deleteMany({});
  await schema.MessagesExist.deleteMany({});
  await schema.MessageCounter.create({ count: 0 });
  await schema.ChannelsExist.create({ numChannelsExist: 0, timeStamp: Math.floor(Date.now() / 1000) });
  await schema.DmsExist.create({ numDmsExist: 0, timeStamp: Math.floor(Date.now() / 1000) });
  await schema.MessagesExist.create({ numMessagesExist: 0, timeStamp: Math.floor(Date.now() / 1000) });
  return {};
}

export async function initialise() {
  const data = await schema.MessageCounter.countDocuments({});
  if (data === 0) {
    await schema.MessageCounter.create({ count: 0 });
    await schema.ChannelsExist.create({ numChannelsExist: 0, timeStamp: Math.floor(Date.now() / 1000) });
    await schema.DmsExist.create({ numDmsExist: 0, timeStamp: Math.floor(Date.now() / 1000) });
    await schema.MessagesExist.create({ numMessagesExist: 0, timeStamp: Math.floor(Date.now() / 1000) });
  }
}

/**
  * Takes in a token and checks that it is present within the datastore
  *
  * @param {DataStore} data - the data to search through
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
  * Takes in a token and query string and returns the message which contain the string
  *
  * @param {String} token - users token
  * @param {String} queryStr - query string
  * ...
  *
  * @returns {Message[]} - message array of valid messages
*/
export async function searchV1(token: string, queryStr: string): Promise<{ messages: Message[]}> {
  const validToken = await checkToken(token);
  if (!validToken) {
    throw HTTPError(403, 'invalid token');
  }
  const hashedToken = getHash(token);
  const id = (await schema.Tokens.findOne({ token: hashedToken })).uId;

  if (queryStr.length > 1000 || queryStr.length < 1) {
    throw HTTPError(400, 'query string is not valid');
  }

  const regex = new RegExp(queryStr, 'i');
  const mesArray: Message[] = [];

  const user = await schema.Users.findOne({ uId: id });
  let interacts = [];
  if (user.globalOwner === 2) {
    interacts = await schema.Channels.find({ channelMembers: id, isPublic: true });
  } else {
    interacts = await schema.Channels.find({ channelMembers: id });
  }

  const dms = await schema.Dms.find({ $or: [{ recipientsId: id }, { ownerId: id }] });

  interacts.forEach((channel) => {
    channel.messages.forEach(msg => {
      if (regex.test(msg.message)) {
        const message: Message = {
          uId: msg.uId,
          message: msg.message,
          messageId: msg.messageId,
          timeSent: msg.timeSent,
          reacts: msg.reacts,
          isPinned: msg.isPinned,
        };
        mesArray.push(message);
      }
    });
  });

  dms.forEach((dm) => {
    dm.messages.forEach((msg) => {
      if (regex.test(msg.message)) {
        const message: Message = {
          uId: msg.uId,
          message: msg.message,
          messageId: msg.messageId,
          timeSent: msg.timeSent,
          reacts: msg.reacts,
          isPinned: msg.isPinned,
        };
        mesArray.push(message);
      }
    });
  });

  return { messages: mesArray };
}
