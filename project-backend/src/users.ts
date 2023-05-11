import HTTPError from 'http-errors';
import { getHash } from './auth';
import { userReturn, UserInfo, EmptyReturn, UsersReturn, UserStatsReturn, userStats, WorkspaceStatsReturn, workspaceStats, UstatChannel, UstatDm, UstatMessages } from './types';
import config from './config.json';
import validator from 'validator';
import request from 'sync-request';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import schema from './schema';

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

/**
*  checks if a user it part of the data object
*  @param {number} id - id of the user to check
*  @returns {bool} - bool of whether the user is in the object
*/
async function checkUser(id: number): Promise<boolean> {
  const user = schema.Users.findOne({ uId: id });
  if (user === null) {
    return false;
  } else {
    return true;
  }
}

/**
  * Takes in a token and checks that it is present within the datastore
  *
  * @param {string} token - unique identifier for each user for each session
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
  * Takes in a token and imgurl and crops it to the dimensions parameters, uplaods it to server
  *
  * @param {string} token - users token
  * @param {string} imgUrl - query string
  * @param {number} xStart - dimension parameter
  * @param {number} xEnd - dimension parameter
  * @param {number} yStart - dimension parameter
  * @param {number} yEnd - dimension parameter
  * ...
  *
  * @returns {Message[]} - message array of valid messages
*/
export async function userPfpUpload(token: string, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number): Promise<EmptyReturn> {
  if (xEnd <= xStart || yEnd <= yStart) {
    throw HTTPError(400, 'cropping invalid');
  } else if (!/^http(?!s).*\.jpg$/.test(imgUrl)) {
    throw HTTPError(400, 'img url invalid');
  }
  const validToken = await checkToken(token);
  if (!validToken) {
    throw HTTPError(403, 'token does not refer to a valid user');
  }

  try {
    const hashedToken = getHash(token);
    const user = await schema.Tokens.findOne({ token: hashedToken });
    const res = request('GET', imgUrl);
    const body = res.getBody();
    const buffer = await sharp(body).extract({ left: xStart, top: yStart, width: xEnd - xStart, height: yEnd - yStart }).toBuffer();

    const fileName = `${user.uId}.jpg`;
    const appImgDir = path.join(__dirname, '../img');
    const filePath = path.join(appImgDir, fileName);
    fs.writeFileSync(filePath, buffer);
    schema.Users.findOneAndUpdate({ uId: user.uId }, { profileImgUrl: `http://${HOST}:${PORT}/img/${fileName}` });
    return {};
  } catch (err) {
    throw HTTPError(400, 'url invalid');
  }
}

/**
 * @param token - unique identifier for each user for each session
 * @returns { UsersReturn }
 */
export async function usersAllV2 (token: string): Promise<UsersReturn> {
  const validToken = await checkToken(token);
  if (!validToken) {
    throw HTTPError(403, 'token does not refer to a valid user');
  }
  const users: UserInfo[] = await schema.Users.find({}).select({ _id: 0, uId: 1, email: 1, nameFirst: 1, nameLast: 1, handleStr: 1, profileImgUrl: 1 });

  return { users: users };
}

/**
 * Takes in a token from a current logged in user and an uid to check
 * if both token and uId are valid then return user destails of that uId
 * if token or uId is invalid return error
 * @param token - unique identifier for each user for each session
 * @param uId - user id number
 * @returns { userReturn  }
 */
export async function userProfileV3(token: string, uId: number): Promise<userReturn> {
  const validToken = await checkToken(token);
  if (!validToken) {
    throw HTTPError(403, 'token does not refer to a valid user');
  }
  const validUser = await checkUser(uId);
  if (!validUser) {
    throw HTTPError(400, 'non existing user');
  }
  const user: UserInfo = await schema.Users.findOne({ uId: uId }).select({ _id: 0, uId: 1, email: 1, nameFirst: 1, nameLast: 1, handleStr: 1, profileImgUrl: 1 }).exec();
  if (user === null) {
    throw HTTPError(400, 'non existing user');
  }

  return { user: user };
}

/**
 * For a valid token, find the uId of that token and go to the users section to change their name
 * if token is invalid or name is too long or short return error
 * @param token - unique identifier for each user for each session
 * @param nameFirst - user first name
 * @param nameLast - user last name
 * @returns { EmptyReturn  }
 */
export async function userProfileSetnameV2(token: string, nameFirst: string, nameLast: string): Promise<EmptyReturn> {
  const validToken = await checkToken(token);
  if (!validToken) {
    throw HTTPError(403, 'token does not refer to a valid user');
  }
  if (nameFirst.length > 50 || nameFirst.length < 1 || nameLast.length > 50 || nameLast.length < 1) {
    throw HTTPError(400, 'invalid name length');
  }
  const hashedToken = getHash(token);
  const target = await schema.Tokens.findOne({ token: hashedToken });

  await schema.Users.findOneAndUpdate({ uId: target.uId }, { nameFirst: nameFirst, nameLast: nameLast });
  return {};
}

/**
 * For a valid token, find the uId of that token and go to the users section to change their email
 * if token or email is invalid or email is used by others return error
 * @param token - unique identifier for each user for each session
 * @param email - user email
 * @returns { EmptyReturn  }
 */
export async function userProfileSetemailV2(token: string, email: string): Promise<EmptyReturn> {
  const validToken = await checkToken(token);
  if (!validToken) {
    throw HTTPError(403, 'token does not refer to a valid user');
  }

  if (!validator.isEmail(email)) {
    throw HTTPError(400, 'invalid email input');
  }
  const checkEmail = await schema.Users.exists({ email: email }).exec();
  if (checkEmail !== null) {
    throw HTTPError(400, 'email already used');
  }
  const hashedToken = getHash(token);

  const target = await schema.Tokens.findOne({ token: hashedToken });

  await schema.Users.findOneAndUpdate({ uId: target.uId }, { email: email });
  return {};
}

/**
 * For a valid token, find the uId of that token and go to the users section to change their handle
 * if token or handle is invalid or handle is used by others return error
 * handle have to be length 3 - 20 inclusive and all alphanumeric characters
 * @param token - unique identifier for each user for each session
 * @param handleStr
 * @returns { EmptyReturn  }
 */
export async function userProfileSethandleV2(token: string, handleStr: string): Promise<EmptyReturn> {
  const validToken = await checkToken(token);
  if (!validToken) {
    throw HTTPError(403, 'token does not refer to a valid user');
  }

  if (/[^a-zA-Z0-9]/.test(handleStr) || handleStr.length > 20 || handleStr.length < 3) {
    throw HTTPError(400, 'invalid handle input');
  }
  const checkHandle = await schema.Users.exists({ handleStr: handleStr }).exec();
  if (checkHandle !== null) {
    throw HTTPError(400, 'handle string already used');
  }

  const hashedToken = getHash(token);
  const target = await schema.Tokens.findOne({ token: hashedToken });

  await schema.Users.findOneAndUpdate({ uId: target.uId }, { handleStr: handleStr });
  return {};
}

export async function getUserStats (token: string): Promise<UserStatsReturn> {
  const hashedToken = getHash(token);
  const target = await schema.Tokens.findOne({ token: hashedToken }).exec();
  if (target === null) {
    throw HTTPError(403, 'token is not valid');
  }
  const user = await schema.Users.findOne({ uId: target.uId });
  const msgsNum = (await schema.MessagesExist.findOne({}).sort('-timeSent').limit(1).exec()).numMessagesExist;
  const dmsNum = await schema.Dms.count({});
  const channelsExist = await schema.Channels.count({});
  const sumData = msgsNum + dmsNum + channelsExist;
  let involvement = 0;
  if (sumData === 0) {
    involvement = 0;
  } else {
    const sumUser = user.stats.channelsJoined.slice(-1)[0].numChannelsJoined + user.stats.dmsJoined.slice(-1)[0].numDmsJoined + user.stats.messagesSent.slice(-1)[0].numMessagesSent;
    involvement = sumUser / sumData;
    if (involvement > 1) {
      involvement = 1;
    }
  }
  let cStats: UstatChannel[] = [];
  user.stats.channelsJoined.forEach((x) => {
    cStats.push({ numChannelsJoined: x.numChannelsJoined, timeStamp: x.timeStamp });
  });
  cStats = cStats.reverse();
  let dStats: UstatDm[] = [];
  user.stats.dmsJoined.forEach(x => {
    dStats.push({ numDmsJoined: x.numDmsJoined, timeStamp: x.timeStamp });
  });
  dStats = dStats.reverse();
  let mStats: UstatMessages[] = [];
  user.stats.messagesSent.forEach(x => {
    mStats.push({ numMessagesSent: x.numMessagesSent, timeStamp: x.timeStamp });
  });
  mStats = mStats.reverse();
  const stats: userStats = {
    channelsJoined: JSON.parse(JSON.stringify(cStats)),
    dmsJoined: JSON.parse(JSON.stringify(dStats)),
    messagesSent: JSON.parse(JSON.stringify(mStats)),
    involvementRate: involvement
  };
  return { userStats: stats };
}

export async function getUsersStats (token: string): Promise<WorkspaceStatsReturn> {
  const hashedToken = getHash(token);
  const target = await schema.Tokens.findOne({ token: hashedToken }).exec();
  if (target === null) {
    throw HTTPError(403, 'token is not valid');
  }
  let numUserInChannelsOrDms = 0;
  let numUser = 0;
  const users = await schema.Users.find({}).exec();
  users.forEach((user) => {
    const channel = user.stats.channelsJoined.slice(-1)[0].numChannelsJoined;
    const dm = user.stats.dmsJoined.slice(-1)[0].numDmsJoined;
    numUser += 1;
    if ((channel + dm) > 0) {
      numUserInChannelsOrDms += 1;
    }
  });
  const utilisation = numUserInChannelsOrDms / numUser;
  const dms = await schema.DmsExist.find({}).select({ __v: 0, _id: 0 });
  const chls = await schema.ChannelsExist.find({}).select({ __v: 0, _id: 0 });
  const msgs = await schema.MessagesExist.find({}).select({ __v: 0, _id: 0 });
  const stats: workspaceStats = {
    dmsExist: JSON.parse(JSON.stringify(dms)),
    channelsExist: JSON.parse(JSON.stringify(chls)),
    messagesExist: JSON.parse(JSON.stringify(msgs)),
    utilizationRate: utilisation
  };
  return { workspaceStats: stats };
}
