import validator from 'validator';
import uniqid from 'uniqid';
import HTTPError from 'http-errors';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { User, EmptyReturn, ReturnAuth, userStats, UstatChannel, UstatDm, UstatMessages } from './types';
import config from './config.json';
import schema from './schema';
const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

const defaultPfpUrl = `http://${HOST}:${PORT}/img/default.jpg`;
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
  * Takes in an email and checks if it already exists
  *
  * @param {string} email - email to be checked
  * ...
  *
  * @returns {number} - uId of the user with that email or -1
*/
async function emailExists(email: string): Promise<number> {
  const query = await schema.Users.findOne({ email: email }).exec();
  if (query !== null) {
    return query.uId;
  } else {
    return -1;
  }
}

/**
  * Takes in a string value and returns a hash of it with the salt
  *
  * @param {string} value - the string which needs to be hashed
  * ...
  *
  * @returns {string} - hashed value of the string value
*/
export function getHash(value: string): string {
  const salt = 'can I say the Fword on here';
  const hash = crypto.createHash('sha256').update(value + salt).digest('hex');
  return hash;
}

/**
*  authRegisterV2 takes and validates an email from the user
*  it also test if the password, first and last name satisfies the requirements
*  once all requirements are satisfied, a handle string, token, unique id and a global owner status is created
*  info is stored and return the token and uId
*
*  @param { string } email - Users Email
*  @param { string } password - Users password
*  @param { string } nameFirst - Users first name
*  @param { string } nameLast - Users last name
*  @returns { { authUserId: number } } - User iD within an object
*/
export async function authRegisterV3(email: string, password: string, nameFirst: string, nameLast: string): Promise<ReturnAuth> {
  if (!validator.isEmail(email)) {
    throw HTTPError(400, 'email is not valid');
  }
  if (password.length < 6) {
    throw HTTPError(400, 'Password length is too short');
  }

  const emailExist = await emailExists(email);
  if (emailExist !== -1) {
    throw HTTPError(400, 'email already exists');
  }

  if (nameFirst.length < 1 || nameFirst.length > 50 || nameLast.length < 1 || nameLast.length > 50) {
    throw HTTPError(400, 'invalid first name or last name');
  }
  const userId: number = await generateUniqueId();
  const newToken: string = uniqid();
  const tokenHash = getHash(newToken);
  const newHandle: string = await handleCreate(nameFirst, nameLast);
  let globalStatus: number;
  const res = await schema.Users.exists({}).exec();
  if (res === null) {
    globalStatus = 2;
  } else {
    globalStatus = 1;
  }
  const defaultStats: userStats = {
    channelsJoined: [],
    dmsJoined: [],
    messagesSent: [],
    involvementRate: 0
  };
  const hashedPassword = getHash(password);
  const newUser: User = {
    uId: userId,
    email: email,
    nameFirst: nameFirst,
    nameLast: nameLast,
    handleStr: newHandle,
    password: hashedPassword,
    globalOwner: globalStatus,
    profileImgUrl: defaultPfpUrl,
    stats: defaultStats
  };
  const defaultCJoins: UstatChannel = {
    numChannelsJoined: 0,
    timeStamp: Math.floor(Date.now() / 1000)
  };
  newUser.stats.channelsJoined.push(defaultCJoins);
  const defaultDmJoins: UstatDm = {
    numDmsJoined: 0,
    timeStamp: Math.floor(Date.now() / 1000)
  };
  newUser.stats.dmsJoined.push(defaultDmJoins);
  const defaultMsgSends: UstatMessages = {
    numMessagesSent: 0,
    timeStamp: Math.floor(Date.now() / 1000)
  };
  newUser.stats.messagesSent.push(defaultMsgSends);
  await schema.Tokens.create({ uId: userId, token: tokenHash });
  await schema.Users.create(newUser);
  return {
    token: newToken,
    authUserId: userId
  };
}

/**
 * Takes in an email and look for its password. If the password and email are available and correct then logging in
 * Return a new token and uId for the user.
 * @param email
 * @param password
 * @returns {ReturnAuth | ERROR}
 */
export async function authLoginV3(email: string, password: string): Promise<ReturnAuth> {
  const hashedPassword = getHash(password);
  const user = await schema.Users.findOne({ email: email }).exec();
  if (user === null) {
    throw HTTPError(400, 'email does not exist');
  }
  if (user.password === hashedPassword) {
    const userToken = uniqid();
    const hashedToken = getHash(userToken);
    schema.Tokens.create({ token: hashedToken, uId: user.uId });
    return {
      authUserId: user.uId,
      token: userToken
    };
  } else {
    throw HTTPError(400, 'incorrect password');
  }
}

/**
 * Takes in a token and relete the token
 * @param token
 * @returns ERROR|EmptyReturn
 */
export async function authLogoutV2(token: string): Promise<EmptyReturn> {
  const hashedToken = getHash(token);
  const validToken = await checkToken(token);
  if (!validToken) {
    throw HTTPError(403, 'invalid token');
  }
  await schema.Tokens.findOneAndRemove({ token: hashedToken });
  return {};
}

/**
*  generate uniqueId find the greatest id number amongst the user and add 1 to it
*  then the new generated id is returned
*
*  @returns { number } - User iD
*/
async function generateUniqueId (): Promise<number> {
  const user = await schema.Users.findOne({}).sort('-uId').limit(1).exec();
  const currentMaxId = user ? user.uId : 0;
  const newId = currentMaxId + 1;
  return newId;
}

/**
*  handleCreate takes in the first and last name from the user
*  it compresses it into length of 20 then compare to existing handle string
*  if the string exist then make a new one for the user
*
*  @param {string} nameFirst - Users first name
*  @param {string} nameLast - Users last name
*  @returns {string} - new handle string
*/
async function handleCreate (nameFirst: string, nameLast: string): Promise<string> {
  let initialHandle = nameFirst.replace(/\W/g, '');
  initialHandle += nameLast.replace(/\W/g, '');
  initialHandle = initialHandle.toLowerCase();
  initialHandle = initialHandle.slice(0, 20);

  let newHandle = initialHandle;
  let counter = 0;
  let handleUnique = false;
  const userExists = await schema.Users.findOne({ handleStr: newHandle });
  if (userExists === null) {
    handleUnique = true;
  }
  while (!handleUnique) {
    handleUnique = true;
    newHandle = initialHandle + counter.toString();
    const userExists = await schema.Users.findOne({ handleStr: newHandle });
    if (userExists !== null) {
      counter++;
      newHandle = initialHandle;
      handleUnique = false;
    }
  }
  return newHandle;
}

/**
  * get the email of the user based on input code
  *
  * @param {string} code - special code sent to user
  *
  * @returns {string} email of user
*/
async function getEmail(code: string) {
  const usr = await schema.ResetCodes.findOne({ code: code });
  if (usr === null) {
    return false;
  } else {
    return usr.email;
  }
}

/**
  * Send a reset code email to the email specified
  *
  * @param {string} email - sends an email to this email
  * @param {string} resetCode - sends this reset code in the body
  * ...
  *
*/
function sendEmail(email: string, resetCode: string) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
      user: "put user here",
      pass: "put apikey here"
    }
  });
  const mail = {
    from: 'h11baeromemes@gmail.com',
    to: email,
    subject: 'Password reset code',
    text: resetCode
  };
  transporter.sendMail(mail);
}

/**
  * requests a password reset for the user
  *
  * @param {string} email - email of user to reset password
  *
  * @returns {EmptyReturn} - always
*/
export async function requestPasswordReset(email: string): Promise<EmptyReturn> {
  const userId = await emailExists(email);
  if (userId === -1) {
    return {};
  }
  await schema.Tokens.deleteMany({ uId: userId });
  const resetCode = getHash(email);
  await schema.ResetCodes.create({ email: email, code: resetCode });
  sendEmail(email, resetCode);
  return {};
}

/**
  * resets the users password if the code and password are valid
  *
  * @param {string} code - unique code to reset password
  * @param {string} newPassword - new password of user
  * ...
  *
  * @returns {EmptyReturn} - if no errors
*/
export async function resetPassword(code: string, newPassword: string): Promise<EmptyReturn> {
  const email = await getEmail(code);
  if (email === false) {
    throw HTTPError(400, 'invalid resetcode');
  } else if (newPassword.length < 6) {
    throw HTTPError(400, 'invalid password');
  }
  const hashedPass = getHash(newPassword);
  await schema.Users.findOneAndUpdate({ email: email }, { password: hashedPass });
  await schema.ResetCodes.deleteMany({ code: code });
  return {};
}
