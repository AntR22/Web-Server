import HTTPError from 'http-errors';
import { getHash } from './auth';
import { dmInfo, EmptyReturn, UserInfo, DM, dmId, dmDetail, Message, MessageId, MessageReturn, dmsReturn } from './types';
import schema from './schema';

/**
  * Takes in a datastore and finds an available id in the dms
  *
  * ...
  *
  *  @returns {number} - the next available dmId (not been used)
*/
async function availableDmId (): Promise<number> {
  const dm = await schema.Dms.findOne({}).sort('-dmId').limit(1).exec();
  if (dm === null) {
    return 1;
  }
  return dm.dmId + 1;
}

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
  * Takes in a dm id num and checks that it is present within the datastore
  *
  * @param {number} id - dm id
  * ...
  *
  * @returns {boolean} - true if its present, false if not
*/
async function checkDmId(id: number): Promise<boolean> {
  const query = await schema.Dms.exists({ dmId: id }).exec();
  if (query !== null) {
    return true;
  } else {
    return false;
  }
}

/**
  * Takes in a array of ids and outputs a string of their sorted, comma separated
  * handles
  *
  * @param {number[]} ids - ids of all dm members
  * ...
  *
  * @returns {string} - sorted, comma separated handles of ids
*/
async function dmNameCreate(ids: number[]): Promise<string> {
  const handles: string[] = await schema.Users.find({ uId: { $in: ids } }).select({ _id: 0, handleStr: 1 }).lean();
  /*
  const handlesP: string[] = [];
  handles.forEach(x => {
    handlesP.push({ x.handleStr });
  });
  */
  const sortedHandles = handles.sort();
  const dmName = sortedHandles.join(', ');
  return dmName;
}

/**
  * Takes in a user token and array of user ids, creates a dm channel
  *
  * @param {string} token - token of the user creating the dm
  * @param {number[]} uIds - ids of the other dm participants
  * ...
  *
  * @returns  - if invalid token/uids
  *  @returns {dmId} - id of the dm if no errors
*/
export async function dmCreateV2(token: string, uIds: number[]): Promise<dmId> {
  const validToken = await checkToken(token);
  if (!validToken) {
    throw HTTPError(403, 'token does not refer to a valid user');
  }
  for (const id of uIds) {
    const validId = await schema.Users.findOne({ uId: id });
    if (validId === null) {
      throw HTTPError(400, 'one of the ids does not refer to a valid user');
    }
  }
  const uIdSet = new Set(uIds);
  if (uIdSet.size !== uIds.length) {
    throw HTTPError(400, 'duplicate present in the id array');
  }
  const hashedToken = getHash(token);
  const creator: number = (await schema.Tokens.findOne({ token: hashedToken })).uId;

  const dmId = await availableDmId();
  const ids = JSON.parse(JSON.stringify(uIds));
  ids.push(creator);
  const dmName = await dmNameCreate(ids);
  const dm: DM = {
    dmName: dmName,
    dmId: dmId,
    ownerId: creator,
    recipientsId: uIds,
    messages: []
  };
  schema.Dms.create(dm);

  const user = await schema.Users.findOne({ uId: creator });
  const latest = user.stats.dmsJoined.slice(-1)[0];
  const curChannels = latest.numDmsJoined + 1;
  await schema.Users.findOneAndUpdate({ uId: creator }, { $push: { 'stats.dmsJoined': { numDmsJoined: curChannels, timeStamp: Math.floor(Date.now() / 1000) } } });

  for (const id of uIds) {
    const user = await schema.Users.findOne({ uId: id });
    if (user === null) {
      continue;
    }
    const latest = user.stats.dmsJoined.slice(-1)[0];
    const curChannels = latest.numDmsJoined + 1;
    await schema.Users.findOneAndUpdate({ uId: id }, { $push: { 'stats.dmsJoined': { numDmsJoined: curChannels, timeStamp: Math.floor(Date.now() / 1000) } } });
  }

  const current = await schema.Dms.count({});
  await schema.DmsExist.create({ numDmsExist: current, timeStamp: Math.floor(Date.now() / 1000) });

  return { dmId: dmId };
}

/**
  * Takes in a user token and returns a list of dms the user
  * is a part of
  *
  * @param {string} token - token of the user requesting list
  * ...
  *
  * @returns  - if invalid token
  *  @returns {dmInfo[]} - array of dminfo types which the user is part of
*/
export async function dmListV2(token: string): Promise<dmsReturn> {
  const validToken = await checkToken(token);
  if (!validToken) {
    throw HTTPError(403, 'token does not refer to a valid user');
  }
  const hashedToken = getHash(token);
  const queryUser = (await schema.Tokens.findOne({ token: hashedToken }));

  const dms1 = await schema.Dms.find({ $or: [{ recipientsId: queryUser.uId }, { ownerId: queryUser.uId }] }).select({ dmId: 1, dmName: 1 });
  const dms: dmInfo[] = [];
  dms1.forEach(dm => {
    dms.push({ name: dm.dmName, dmId: dm.dmId });
  });
  return { dms: dms };
}

/**
  * Takes in a user token and a dmid, removes the dm with that id
  *
  * @param {string} token - token of the user within the dm with permissions
  * @param {number} dmId - id of the dm to remove
  * ...
  *
  * @returns  - if invalid token/dmid or the user does not have permissions
  *  @returns {EmptyReturn} - if no errors
*/
export async function dmRemoveV2(token: string, dmId: number): Promise<EmptyReturn> {
  const validDm = await checkDmId(dmId);
  if (!validDm) {
    throw HTTPError(400, 'dmId not valid');
  }
  const validToken = await checkToken(token);
  if (!validToken) {
    throw HTTPError(403, 'token does not refer to a valid user');
  }

  const hashedToken = getHash(token);

  const id = await schema.Tokens.findOne({ token: hashedToken });
  const dm = (await schema.Dms.findOne({ dmId: dmId }));
  const creatorId = dm.ownerId;
  if (creatorId !== id.uId) {
    throw HTTPError(403, 'user is not authorised to remove dm');
  }

  const user = await schema.Users.findOne({ uId: creatorId });
  const latest = user.stats.dmsJoined.slice(-1)[0];
  const curChannels = latest.numDmsJoined - 1;
  await schema.Users.findOneAndUpdate({ uId: creatorId }, { $push: { 'stats.dmsJoined': { numDmsJoined: curChannels, timeStamp: Math.floor(Date.now() / 1000) } } });

  for (const uId of dm.recipientsId) {
    const user = await schema.Users.findOne({ uId: uId });
    const latest = user.stats.dmsJoined.slice(-1)[0];
    const curChannels = latest.numDmsJoined - 1;
    await schema.Users.findOneAndUpdate({ uId: uId }, { $push: { 'stats.dmsJoined': { numDmsJoined: curChannels, timeStamp: Math.floor(Date.now() / 1000) } } });
  }

  const msgNumber = dm.messages.length;

  const current = await schema.Dms.count({});
  await schema.DmsExist.create({ numDmsExist: current - 1, timeStamp: Math.floor(Date.now() / 1000) });

  const currentmsgs = (await schema.MessagesExist.findOne({}).sort('-timeSent').limit(1).exec()).numMessagesExist - msgNumber;

  await schema.MessagesExist.create({ numMessagesExist: currentmsgs, timeStamp: Math.floor(Date.now() / 1000) });
  await schema.Dms.findOneAndRemove({ dmId: dmId }).exec();
  return {};
}

/**
  * Takes in an array of user Ids and outputs their user info
  *
  * @param {number[]} array - array of uId's
  * ...
  *
  *  @returns {UserInfo[]} - array of user info at each index
*/
async function userInfoArray(array: number[], token: string): Promise<UserInfo[]> {
  const users: UserInfo[] = [];
  const usr = await schema.Users.find({ uId: { $in: array } });
  usr.forEach((x) => {
    const user: UserInfo = {
      uId: x.uId,
      email: x.email,
      profileImgUrl: x.profileImgUrl,
      nameFirst: x.nameFirst,
      nameLast: x.nameLast,
      handleStr: x.handleStr
    };
    users.push(user);
  });
  return users.reverse();
}

/**
  * Takes in a user token and a dmid, provides details about the dm
  *
  * @param {string} token - token of the user requesting details
  * @param {number} dmId - id of the dm of details to return
  * ...
  *
  * @returns  - if invalid token/dmid or the user is not a channel member
  *  @returns {dmDetail} - object with dm details
*/
export async function dmDetailsV2(token: string, dmId: number): Promise<dmDetail> {
  const validDm = await checkDmId(dmId);
  if (!validDm) {
    throw HTTPError(400, 'dmId not valid');
  }
  const validToken = await checkToken(token);
  if (!validToken) {
    throw HTTPError(403, 'token does not refer to a valid user');
  }

  const hashedToken = getHash(token);
  const usr = await schema.Tokens.findOne({ token: hashedToken });
  const dm = await schema.Dms.findOne({ dmId: dmId });

  if (dm.ownerId === usr.uId || dm.recipientsId.includes(usr.uId)) {
    const members: number[] = dm.recipientsId;
    if (dm.ownerId !== -1) {
      members.push(dm.ownerId);
    }
    const users: UserInfo[] = await userInfoArray(members, token);
    return {
      name: dm.dmName,
      members: users
    };
  } else {
    throw HTTPError(403, 'user is not a member of this dm');
  }
}

/**
  * Takes in a user token and a dmid, removes the user from the dm
  *
  * @param {string} token - token of the user requesting leave
  * @param {number} dmId - id of the dm to leave
  * ...
  *
  * @returns  - if invalid token/dmid or the user is not a channel member
  *  @returns {EmptyReturn} - if no errors
*/
export async function dmLeaveV2(token: string, dmId: number): Promise<EmptyReturn> {
  const validDm = await checkDmId(dmId);
  if (!validDm) {
    throw HTTPError(400, 'dmId not valid');
  }
  const validToken = await checkToken(token);
  if (!validToken) {
    throw HTTPError(403, 'token does not refer to a valid user');
  }

  const hashedToken = getHash(token);
  const usr = await schema.Tokens.findOne({ token: hashedToken });
  const dm = await schema.Dms.findOne({ dmId: dmId });

  if (dm.ownerId === usr.uId) {
    await schema.Dms.findOneAndUpdate({ dmId: dmId }, { ownerId: -1 });

    const user = await schema.Users.findOne({ uId: usr.uId });
    const latest = user.stats.dmsJoined.slice(-1)[0];
    const curChannels = latest.numDmsJoined - 1;
    await schema.Users.findOneAndUpdate({ uId: usr.uId }, { $push: { 'stats.dmsJoined': { numDmsJoined: curChannels, timeStamp: Math.floor(Date.now() / 1000) } } });

    return {};
  } else if (dm.recipientsId.includes(usr.uId)) {
    await schema.Dms.findOneAndUpdate({ dmId: dmId }, { $pull: { recipientsId: usr.uId } });

    const user = await schema.Users.findOne({ uId: usr.uId });
    const latest = user.stats.dmsJoined.slice(-1)[0];
    const curChannels = latest.numDmsJoined - 1;
    await schema.Users.findOneAndUpdate({ uId: usr.uId }, { $push: { 'stats.dmsJoined': { numDmsJoined: curChannels, timeStamp: Math.floor(Date.now() / 1000) } } });

    return {};
  } else {
    throw HTTPError(403, 'user is not a member of this dm');
  }
}

/**
  * Takes in a user token and a dmid, provides details about the dm
  *
  * @param {string} token - token of the user requesting messages
  * @param {number} dmId - id of the dm to view messages
  * @param {number} start - the index of the first 50 messages to return
  * ...
  *
  * @returns  - if invalid token/dmid or the user is not a channel member or
  * start is invalid
  *  @returns {MessageReturn} - object with messages and start/end details
*/
export async function dmMessagesV2(token: string, dmId: number, start: number): Promise<MessageReturn> {
  const validDm = await checkDmId(dmId);
  if (!validDm) {
    throw HTTPError(400, 'dmId not valid');
  }
  const validToken = await checkToken(token);
  if (!validToken) {
    throw HTTPError(403, 'token does not refer to a valid user');
  }

  const hashedToken = getHash(token);
  const id = await schema.Tokens.findOne({ token: hashedToken });
  const dm = await schema.Dms.findOne({ dmId: dmId }).lean();

  if (dm.messages.length < start) {
    throw HTTPError(400, 'start index invalid');
  }

  if (dm.ownerId === id.uId || dm.recipientsId.includes(id.uId)) {
    const messages = dm.messages.reverse();
    const msg50: Message[] = [];
    let end;
    if (start + 50 >= dm.messages.length) {
      end = -1;
      for (let i = start; i < messages.length; i++) {
        const message: Message = {
          uId: messages[i].uId,
          message: messages[i].message,
          messageId: messages[i].messageId,
          timeSent: messages[i].timeSent,
          reacts: messages[i].reacts,
          isPinned: messages[i].isPinned,
        };
        msg50.push(message);
      }
    } else {
      end = start + 50;
      for (let i = start; i < end; i++) {
        const message: Message = {
          uId: messages[i].uId,
          message: messages[i].message,
          messageId: messages[i].messageId,
          timeSent: messages[i].timeSent,
          reacts: messages[i].reacts,
          isPinned: messages[i].isPinned,
        };
        msg50.push(message);
      }
    }
    return {
      start: start,
      end: end,
      messages: msg50,
    };
  } else {
    throw HTTPError(403, 'user is not a member of this dm');
  }
}

/**
  * Takes in a user token, dmid and message, add message to the dm
  *
  * @param {string} token - token of the user sending the message
  * @param {number} dmId - id of the dm to send the message
  * @param {string} message - message to add to dm
  * ...
  *
  * @returns  - if invalid token/dmid or the user is not a channel member or
  * the message string is invalid length
  *  @returns {MessageReturn} - object with messages and start/end details
*/
export async function sendDmV2(token: string, dmId: number, message: string): Promise<MessageId> {
  const validDm = await checkDmId(dmId);
  if (!validDm) {
    throw HTTPError(400, 'dmId not valid');
  }
  const validToken = await checkToken(token);
  if (!validToken) {
    throw HTTPError(403, 'token does not refer to a valid user');
  }
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'message is incorrect length');
  }
  const hashedToken = getHash(token);
  const id = await schema.Tokens.findOne({ token: hashedToken });
  const dm = await schema.Dms.findOne({ dmId: dmId });

  const mId = (await schema.MessageCounter.findOne({}).sort('-count').limit(1).exec()).count + 1;
  schema.MessageCounter.create({ count: mId });
  const msgId = mId;

  if (dm.ownerId === id.uId || dm.recipientsId.includes(id.uId)) {
    const msg: Message = {
      uId: id.uId,
      messageId: msgId,
      timeSent: Math.floor(Date.now() / 1000),
      message: message,
      reacts: [],
      isPinned: false
    };
    await schema.Dms.findOneAndUpdate({ dmId: dmId }, { $push: { messages: msg } });

    const currentmsgs = (await schema.MessagesExist.findOne({}).sort('-timeSent').limit(1).exec()).numMessagesExist + 1;
    await schema.MessagesExist.create({ numMessagesExist: currentmsgs, timeStamp: Math.floor(Date.now() / 1000) });

    const user = await schema.Users.findOne({ uId: id.uId });
    const latest = user.stats.messagesSent.slice(-1)[0];
    const curmsgs = latest.numMessagesSent + 1;
    await schema.Users.findOneAndUpdate({ uId: id.uId }, { $push: { 'stats.messagesSent': { numMessagesSent: curmsgs, timeStamp: Math.floor(Date.now() / 1000) } } });

    return { messageId: msgId };
  } else {
    throw HTTPError(403, 'user is not a member of this dm');
  }
}

async function dmSend(msg: Message, dmId: number, id: number) {
  const validDm = await checkDmId(dmId);
  if (validDm) {
    await schema.Dms.findOneAndUpdate({ dmId: dmId }, { $push: { messages: msg } });
    const currentmsgs = (await schema.MessagesExist.findOne({}).sort('-timeSent').limit(1).exec()).numMessagesExist + 1;
    await schema.MessagesExist.create({ numMessagesExist: currentmsgs, timeStamp: Math.floor(Date.now() / 1000) });

    const user = await schema.Users.findOne({ uId: id });
    const latest = user.stats.messagesSent.slice(-1)[0];
    const curmsgs = latest.numMessagesSent + 1;
    await schema.Users.findOneAndUpdate({ uId: id }, { $push: { 'stats.messagesSent': { numMessagesSent: curmsgs, timeStamp: Math.floor(Date.now() / 1000) } } });
  }
}

export async function dmSendLater(token: string, dmId: number, message: string, timeSent: number): Promise<MessageId> {
  const sendIn = (timeSent * 1000 - Date.now());
  if (sendIn < 0) {
    throw HTTPError(400, 'time sent is invalid');
  }
  const validDm = await checkDmId(dmId);
  if (!validDm) {
    throw HTTPError(400, 'dmId not valid');
  }
  const validToken = await checkToken(token);
  if (!validToken) {
    throw HTTPError(403, 'token does not refer to a valid user');
  }
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'message is incorrect length');
  }
  const hashedToken = getHash(token);
  const id = await schema.Tokens.findOne({ token: hashedToken });
  const dm = await schema.Dms.findOne({ dmId: dmId });

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
  if (dm.ownerId === id.uId || dm.recipientsId.includes(id.uId)) {
    setTimeout((msg, dm, id) => dmSend(msg, dm.dmId, id.uId), sendIn, msg, dm, id);
    return { messageId: msgId };
  } else {
    throw HTTPError(403, 'user is not a member of this dm');
  }
}
