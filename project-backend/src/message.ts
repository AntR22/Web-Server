import HTTPError from 'http-errors';
import { getHash } from './auth';
import { MessageId, Message, EmptyReturn, Reacts, Channel, DM } from './types';
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
  * Takes in a user token and message from the user and adds the message to the channel
  * specified in the channelid
  *
  * @param {string} token - token of the user sending
  * @param {number} channelId - id of destination channel
  * @param {string} message - the message being sent
  * ...
  *
  * @returns  - if invalid message length, token/channelid invalid or user is
  * not member of the dm
  *  @returns {MessageId} - if no errors
*/
export async function messageSendV2(token: string, channelId: number, message: string): Promise<MessageId> {
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

  const mId = (await schema.MessageCounter.findOne({}).sort('-count').limit(1).exec()).count + 1;
  schema.MessageCounter.create({ count: mId });
  const msgId = mId;

  if (channel.channelMembers.includes(id.uId) || channel.channelAdmins.includes(id.uId)) {
    const msg: Message = {
      uId: id.uId,
      messageId: msgId,
      timeSent: Math.floor(Date.now() / 1000),
      message: message,
      reacts: [],
      isPinned: false
    };
    await schema.Channels.findOneAndUpdate({ channelId: channelId }, { $push: { messages: msg } });

    const user = await schema.Users.findOne({ uId: id.uId });
    const latest = user.stats.messagesSent.slice(-1)[0];
    const curmsgs = latest.numMessagesSent + 1;
    await schema.Users.findOneAndUpdate({ uId: id.uId }, { $push: { 'stats.messagesSent': { numMessagesSent: curmsgs, timeStamp: Math.floor(Date.now() / 1000) } } });

    const currentmsgs = (await schema.MessagesExist.findOne({}).sort('-timeSent').limit(1).exec()).numMessagesExist + 1;
    await schema.MessagesExist.create({ numMessagesExist: currentmsgs, timeStamp: Math.floor(Date.now() / 1000) });

    return { messageId: msgId };
  } else {
    throw HTTPError(403, 'user is not a member of the channel');
  }
}

/**
  * Takes in a message id and checks it is present in the datas dms
  *
  * @param {number} msgId - message id
  * ...
  *
  * @returns {boolean} - true if its present, false if not
*/
async function isMessageInDms(msgId: number): Promise<boolean> {
  const dms = await schema.Dms.find({});
  dms.forEach((dm) => {
    if (dm.messages.find(x => x.messageId === msgId) !== undefined) {
      return true;
    }
  });
  return false;
}

/**
  * Takes in a msgid and checks if its present in the datas channels
  *
  * @param {number} msgId - message id
  * ...
  *
  * @returns {boolean} - true if its present, false if not
*/
async function isMessageInChannels(msgId: number): Promise<boolean> {
  const channels = await schema.Channels.find({});
  channels.forEach(channel => {
    if ((channel.messages.find(x => x.messageId === msgId)) !== undefined) {
      return true;
    }
  });
  return false;
}

/**
  * Takes in a userid and a msg id and checks if the user can interact with the channel
  *
  * @param {DataStore} data - the data to search through
  * @param {number} uId - user id
  * @param {number} msgId - message id
  * ...
  *
  * @returns {boolean} - true if can interact, false if cannot
*/
async function userCanInteractChannel(channel: Channel, uId: number, msgId: number) {
  const user = await schema.Users.findOne({ uId: uId });
  if (user.globalOwner === 2 && channel.isPublic) {
    return true;
  }
  if ((channel.messages.find(x => x.messageId === msgId)) !== undefined) {
    if (channel.channelAdmins.includes(uId)) {
      return true;
    }
  }
  return false;
}

/**
  * Takes in a userid and a msg id and checks if the user can interact with the dm
  *
  * @param {number} uId - user id
  * @param {number} msgId - message id
  * ...
  *
  * @returns {boolean} - true if can interact, false if cannot
*/
function userCanInteractDm(dm: DM, uId: number, msgId: number) {
  if ((dm.messages.find(x => x.messageId === msgId)) !== undefined) {
    if (dm.ownerId === uId) {
      return true;
    }
  }
  return false;
}

/**
  * Takes in a user token and message id and edits the message with a new
  * message if the user has required permissions
  *
  * @param {string} token - token of the user editing
  * @param {number} messageId - id of message to edit
  * @param {string} message - the new message to replace with
  * ...
  *
  * @returns  - if invalid message length, token/messageid invalid or user does
  * not have the required permissions
  *  @returns {EmptyReturn} - if no errors
*/
export async function messageEditV2(token: string, messageId: number, message: string): Promise<EmptyReturn> {
  const validToken = await checkToken(token);
  if (!validToken) {
    throw HTTPError(403, 'token does not refer to a valid user');
  }
  if (message.length > 1000) {
    throw HTTPError(400, 'invalid message length');
  }
  if (message.length === 0) {
    return messageRemoveV2(token, messageId);
  }
  if (!isMessageInChannels(messageId) && !isMessageInDms(messageId)) {
    throw HTTPError(400, 'message id invalid');
  }
  const hashedToken = getHash(token);
  const id = await schema.Tokens.findOne({ token: hashedToken });

  const channels = await schema.Channels.find({});
  for (const channel of channels) {
    const msg: Message = channel.messages.find(x => x.messageId === messageId);
    if (msg !== undefined) {
      if (msg.uId === id.uId || userCanInteractChannel(channel, id.uId, msg.messageId)) {
        msg.message = message;
        await channel.save();
      } else {
        throw HTTPError(403, 'user does not have authorisation');
      }
    }
  }
  const dms = await schema.Dms.find({});
  for (const dm of dms) {
    const msg = dm.messages.find(x => x.messageId === messageId);
    if (msg !== undefined) {
      if (msg.uId === id.uId || userCanInteractDm(dm, id.uId, msg.messageId)) {
        msg.message = message;
        await dm.save();
      } else {
        throw HTTPError(403, 'user does not have authorisation');
      }
    }
  }
  return {};
}

/**
  * Takes in a user token and message id and removes the message
  * if the user has required permissions
  *
  * @param {string} token - token of the user editing
  * @param {number} messageId - id of message to edit
  * ...
  *
  * @returns  - if token/messageid invalid or user does not have the required permissions
  *  @returns {EmptyReturn} - if no errors
*/
export async function messageRemoveV2(token: string, messageId: number): Promise<EmptyReturn> {
  const validToken = await checkToken(token);
  if (!validToken) {
    throw HTTPError(403, 'token does not refer to a valid user');
  }
  if (!isMessageInChannels(messageId) && !isMessageInDms(messageId)) {
    throw HTTPError(400, 'message id invalid');
  }
  const hashedToken = getHash(token);
  const id = await schema.Tokens.findOne({ token: hashedToken });

  const channels = await schema.Channels.find({});
  for (const channel of channels) {
    const msg: Message = channel.messages.find(x => x.messageId === messageId);
    if (msg !== undefined) {
      if (msg.uId === id.uId || userCanInteractChannel(channel, id.uId, msg.messageId)) {
        await schema.Channels.findOneAndUpdate({ channelId: channel.channelId }, { $pull: { messages: { messageId: messageId } } });
      } else {
        throw HTTPError(403, 'user does not have authorisation');
      }
    }
  }
  const dms = await schema.Dms.find({});
  for (const dm of dms) {
    const msg = dm.messages.find(x => x.messageId === messageId);
    if (msg !== undefined) {
      if (msg.uId === id.uId || userCanInteractDm(dm, id.uId, msg.messageId)) {
        await schema.Dms.findOneAndUpdate({ dmId: dm.dmId }, { $pull: { messages: { messageId: messageId } } });
      } else {
        throw HTTPError(403, 'user does not have authorisation');
      }
    }
  }
  const currentmsgs = (await schema.MessagesExist.findOne({}).sort('-timeSent').limit(1).exec()).numMessagesExist - 1;
  await schema.MessagesExist.create({ numMessagesExist: currentmsgs, timeStamp: Math.floor(Date.now() / 1000) });

  return {};
}

/**
  * checks if user is member of channel
  *
  * @param {number} channelId - channel id
  * @param {number} uId - user id
  * ...
  *
  * @returns {boolean}
*/
async function userIsMemberChannel(channelId: number, uId: number): Promise<boolean> {
  const channel = await schema.Channels.findOne({ channelId: channelId });
  return channel.channelMembers.includes(uId);
}

/**
  * Checks if user is member of dm
  *
  * @param {number} dmId - dm id
  * @param {number} uId - user id
  * ...
  *
  * @returns {boolean}
*/
async function userIsMemberDm(dmId: number, uId: number): Promise<boolean> {
  const dm = await schema.Dms.findOne({ dmId: dmId });
  if (dm.recipientsId.includes(uId) || dm.ownerId === uId) {
    return true;
  }
  return false;
}

/**
  * Adds a react from user to the message
  *
  * @param {string} token - users token
  * @param {number} messageId - id of the message
  * @param {number} reactId - id of the react
  * ...
  *
  * @returns {EmptyReturn} - if no errors
*/
export async function messageReactV1(token: string, messageId: number, reactId: number): Promise<EmptyReturn> {
  const validToken = await checkToken(token);
  if (!validToken) {
    throw HTTPError(403, 'token does not refer to a valid user');
  }
  if (!isMessageInChannels(messageId) && !isMessageInDms(messageId)) {
    throw HTTPError(400, 'message id invalid');
  }
  if (reactId !== 1) {
    throw HTTPError(400, 'reactid invalid');
  }
  const hashedToken = getHash(token);
  const id = await schema.Tokens.findOne({ token: hashedToken });

  const channels = await schema.Channels.find({});
  for (const channel of channels) {
    const msg: Message = channel.messages.find(x => x.messageId === messageId);
    if (msg !== undefined) {
      const reaction: Reacts = {
        reactId: reactId,
        isThisUserReacted: false,
        uIds: []
      };
      if (msg.reacts.length === 0) {
        msg.reacts.push(reaction);
      }
      if (msg.reacts.find(x => x.reactId === reactId).uIds.includes(id.uId)) {
        throw HTTPError(400, 'user has already reacted');
      }
      if (msg.uId === id.uId) {
        msg.reacts.find((x) => x.reactId === reactId).isThisUserReacted = true;
        msg.reacts.find((x) => x.reactId === reactId).uIds.push(id.uId);
      } else if (userIsMemberChannel(channel.channelId, id.uId)) {
        msg.reacts.find((x) => x.reactId === reactId).uIds.push(id.uId);
      } else {
        throw HTTPError(403, 'user does not have authorisation');
      }
      await channel.save();
    }
  }
  const dms = await schema.Dms.find({});
  for (const dm of dms) {
    const msg = dm.messages.find(x => x.messageId === messageId);
    if (msg !== undefined) {
      const reaction: Reacts = {
        reactId: reactId,
        isThisUserReacted: false,
        uIds: []
      };
      if (msg.reacts.length === 0) {
        msg.reacts.push(reaction);
      }
      if (msg.reacts.find(x => x.reactId === reactId).uIds.includes(id.uId)) {
        throw HTTPError(400, 'user has already reacted');
      }
      if (msg.uId === id.uId) {
        msg.reacts.find((x) => x.reactId === reactId).isThisUserReacted = true;
        msg.reacts.find((x) => x.reactId === reactId).uIds.push(id.uId);
      } else if (userIsMemberDm(dm.dmId, id.uId)) {
        msg.reacts.find((x) => x.reactId === reactId).uIds.push(id.uId);
      } else {
        throw HTTPError(403, 'user does not have authorisation');
      }
      dm.save();
    }
  }
  return {};
}

/**
  * Removes a react from user to the message
  *
  * @param {string} token - users token
  * @param {number} messageId - id of the message
  * @param {number} reactId - id of the react
  * ...
  *
  * @returns {EmptyReturn} - if no errors
*/
export async function messageUnReactV1(token: string, messageId: number, reactId: number): Promise<EmptyReturn> {
  const validToken = await checkToken(token);
  if (!validToken) {
    throw HTTPError(403, 'token does not refer to a valid user');
  }
  if (!isMessageInChannels(messageId) && !isMessageInDms(messageId)) {
    throw HTTPError(400, 'message id invalid');
  }
  if (reactId !== 1) {
    throw HTTPError(400, 'reactid invalid');
  }
  const hashedToken = getHash(token);
  const id = await schema.Tokens.findOne({ token: hashedToken });

  const channels = await schema.Channels.find({});
  for (const channel of channels) {
    const msg: Message = channel.messages.find(x => x.messageId === messageId);
    if (msg !== undefined) {
      const reaction: Reacts = {
        reactId: reactId,
        isThisUserReacted: false,
        uIds: []
      };
      if (msg.reacts.length === 0) {
        msg.reacts.push(reaction);
      }
      const r = msg.reacts.find(x => x.reactId === reactId);
      if (!(r.uIds.includes(id.uId))) {
        throw HTTPError(400, 'user has not reacted');
      }
      if (msg.uId === id.uId) {
        r.isThisUserReacted = false;
        r.uIds = r.uIds.filter(x => x !== id.uId);
      } else if (userIsMemberChannel(channel.channelId, id.uId)) {
        r.uIds = r.uIds.filter(x => x !== id.uId);
      }
      await channel.save();
    }
  }
  const dms = await schema.Dms.find({});
  for (const dm of dms) {
    const msg = dm.messages.find(x => x.messageId === messageId);
    if (msg !== undefined) {
      const reaction: Reacts = {
        reactId: reactId,
        isThisUserReacted: false,
        uIds: []
      };
      if (msg.reacts.length === 0) {
        msg.reacts.push(reaction);
      }
      const r = msg.reacts.find(x => x.reactId === reactId);
      if (!(r.uIds.includes(id.uId))) {
        throw HTTPError(400, 'user has not reacted');
      }
      if (msg.uId === id.uId) {
        r.isThisUserReacted = false;
        r.uIds = r.uIds.filter(x => x !== id.uId);
      } else if (userIsMemberDm(dm.dmId, id.uId)) {
        r.uIds = r.uIds.filter(x => x !== id.uId);
      }
      await dm.save();
    }
  }
  return {};
}
/**
  * Checks if user ig global owner
  *
  * @param {number} id - user id
  * ...
  *
  * @returns {boolean} - if user is global owner
*/
async function isUserGlobalOwner(id: number): Promise<boolean> {
  const userPerms = (await schema.Users.findOne({ uId: id })).globalOwner;
  if (userPerms === 2) {
    return true;
  }
  return false;
}

/**
  * Pins a message
  *
  * @param {string} token - users token
  * @param {number} messageId - id of the message
  * ...
  *
  * @returns {EmptyReturn} - if no errors
*/
export async function pinMessage(token: string, messageId: number): Promise<EmptyReturn> {
  const validToken = await checkToken(token);
  if (!validToken) {
    throw HTTPError(403, 'token does not refer to a valid user');
  }
  if (!isMessageInChannels(messageId) && !isMessageInDms(messageId)) {
    throw HTTPError(400, 'message id invalid');
  }
  const hashedToken = getHash(token);
  const id = await schema.Tokens.findOne({ token: hashedToken });

  const channels = await schema.Channels.find({});
  for (const channel of channels) {
    const msg: Message = channel.messages.find(x => x.messageId === messageId);
    if (msg !== undefined) {
      if (msg.isPinned) {
        throw HTTPError(400, 'message is already pinned');
      }
      if (channel.channelAdmins.includes(id.uId) || (isUserGlobalOwner(id.uId) && channel.channelMembers.includes(id.uId))) {
        msg.isPinned = true;
      } else if (channel.channelMembers.includes(id.uId)) {
        throw HTTPError(403, 'user does not have permission to pin');
      } else {
        throw HTTPError(400, 'user is not a member of channel');
      }
      await channel.save();
    }
  }
  const dms = await schema.Dms.find({});
  for (const dm of dms) {
    const msg = dm.messages.find(x => x.messageId === messageId);
    if (msg !== undefined) {
      if (msg.isPinned) {
        throw HTTPError(400, 'message is already pinned');
      }
      if (dm.ownerId === id.uId) {
        msg.isPinned = true;
      } else if (dm.recipientsId.includes(id.uId)) {
        throw HTTPError(403, 'user does not have permission to pin');
      } else {
        throw HTTPError(400, 'user is not a member of the dm');
      }
      await dm.save();
    }
  }
  return {};
}
/**
  * unpins a message
  *
  * @param {string} token - users token
  * @param {number} messageId - id of the message
  * ...
  *
  * @returns {EmptyReturn} - if no errors
*/
export async function unPinMessage(token: string, messageId: number): Promise<EmptyReturn> {
  const validToken = await checkToken(token);
  if (!validToken) {
    throw HTTPError(403, 'token does not refer to a valid user');
  }
  if (!isMessageInChannels(messageId) && !isMessageInDms(messageId)) {
    throw HTTPError(400, 'message id invalid');
  }
  const hashedToken = getHash(token);
  const id = await schema.Tokens.findOne({ token: hashedToken });

  const channels = await schema.Channels.find({});
  for (const channel of channels) {
    const msg: Message = channel.messages.find(x => x.messageId === messageId);
    if (msg !== undefined) {
      if (!msg.isPinned) {
        throw HTTPError(400, 'message is already unpinned');
      }
      if (channel.channelAdmins.includes(id.uId) || (isUserGlobalOwner(id.uId) && channel.channelMembers.includes(id.uId))) {
        msg.isPinned = false;
      } else if (channel.channelMembers.includes(id.uId)) {
        throw HTTPError(403, 'user does not have permission to unpin');
      } else {
        throw HTTPError(400, 'user is not a member of channel');
      }
      channel.save();
    }
  }
  const dms = await schema.Dms.find({});
  for (const dm of dms) {
    const msg = dm.messages.find(x => x.messageId === messageId);
    if (msg !== undefined) {
      if (!msg.isPinned) {
        throw HTTPError(400, 'message is already unpinned');
      }
      if (dm.ownerId === id.uId) {
        msg.isPinned = false;
      } else if (dm.recipientsId.includes(id.uId)) {
        throw HTTPError(403, 'user does not have permission to unpin');
      } else {
        throw HTTPError(400, 'user is not a member of the dm');
      }
      dm.save();
    }
  }
  return {};
}

/**
  * Sends a message
  *
  * @param {Message} msg - msg to send
  * @param {number} channelId - channel to send to
  * ...
  *
*/
async function sendMessage(msg: Message, channelId: number, id: number) {
  await schema.Channels.findOneAndUpdate({ channelId: channelId }, { $push: { messages: msg } });

  const user = await schema.Users.findOne({ uId: id });
  const latest = user.stats.messagesSent.slice(-1)[0];
  const curmsgs = latest.numMessagesSent + 1;
  await schema.Users.findOneAndUpdate({ uId: id }, { $push: { 'stats.messagesSent': { numMessagesSent: curmsgs, timeStamp: Math.floor(Date.now() / 1000) } } });

  const currentmsgs = (await schema.MessagesExist.findOne({}).sort('-timeSent').limit(1).exec()).numMessagesExist + 1;
  await schema.MessagesExist.create({ numMessagesExist: currentmsgs, timeStamp: Math.floor(Date.now() / 1000) });
}

/**
  * Send a message at specified time in future
  *
  * @param {string} token - users token
  * @param {string} message - message to send
  * @param {number} channelId - channel to send message
  * @param {number} timeSent - time to send message (unix)
  * ...
  *
  * @returns {MessageId} - id of message sent
*/
export async function messageSendLater(token: string, channelId: number, message: string, timeSent: number): Promise<MessageId> {
  const sendIn = (timeSent * 1000 - Date.now());
  if (sendIn < 0) {
    throw HTTPError(400, 'time sent is invalid');
  }
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

  const mId = (await schema.MessageCounter.findOne({}).sort('-count').limit(1).exec()).count + 1;
  schema.MessageCounter.create({ count: mId });
  const msgId = mId;

  const msg: Message = {
    uId: id.uId,
    messageId: msgId,
    timeSent: timeSent,
    message: message,
    reacts: [],
    isPinned: false
  };
  if (channel.channelMembers.includes(id.uId) || channel.channelAdmins.includes(id.uId)) {
    setTimeout((msg, channel, id) => sendMessage(msg, channel.channelId, id.uId), sendIn, msg, channel, id);
    return { messageId: msgId };
  } else {
    throw HTTPError(403, 'user is not a member of the channel');
  }
}
