import { Message } from '../types';
import { requestAuthRegisterV2, requestClearV1, requestDmCreate, requestDmDetails, requestDmLeave, requestDmList, requestDmMessages, requestDmRemove, requestDmSend, requestDmSendLater } from './helper';
const sleep = require('atomic-sleep');
// had to use a require statement instead of import as import gave errors

import config from '../config.json';

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

const defaultPfpUrl = `http://${HOST}:${PORT}/img/default.jpg`;

beforeEach(() => {
  requestClearV1();
});
afterEach(() => {
  requestClearV1();
});

const invalidToken = 'bob';
const email = 'anton@gmail.com';
const password = 'goodpassword';
const firstName = 'anton';
const lastName = 'ragusa';

const email2 = 'aj@gmail.com';
const password2 = 'nadpassword';
const firstName2 = 'ajj';
const lastName2 = 'goog';

const email3 = 'garyjab@gmail.com';
const password3 = 'IamGary';
const firstName3 = 'gary';
const lastName3 = 'jab';

describe('test dm create errors', () => {
  test('error when token is invalid', () => {
    const user = requestAuthRegisterV2(email2, password2, firstName2, lastName2).authUserId;
    const uIds: number[] = [user];
    expect(requestDmCreate(invalidToken, uIds)).toEqual(403);
  });
  test('error when a uid is invalid', () => {
    const token: string = requestAuthRegisterV2(email, password, firstName, lastName).token;
    const user1: number = requestAuthRegisterV2(email2, password2, firstName2, lastName2).authUserId;
    const invalidUId = (user1 + 100);
    const uIds: number[] = [invalidUId];
    expect(requestDmCreate(token, uIds)).toEqual(400);
  });
  test('error when there is a duplicate uid in the uids', () => {
    const token: string = requestAuthRegisterV2(email, password, firstName, lastName).token;
    const user1: number = requestAuthRegisterV2(email2, password2, firstName2, lastName2).authUserId;
    const uIds: number[] = [user1, user1];
    expect(requestDmCreate(token, uIds)).toEqual(400);
  });
});

describe('test dm creation, removal and listing', () => {
  test('creates and list one dm correctly', () => {
    const user1 = requestAuthRegisterV2(email, password, firstName, lastName);
    const user2 = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const uIds: number[] = [user2.authUserId];
    const dm = requestDmCreate(user1.token, uIds);
    expect(dm.dmId).toStrictEqual(expect.any(Number));
    const name = firstName2 + lastName2 + ', ' + firstName + lastName;
    expect(requestDmList(user1.token)).toStrictEqual({ dms: [{ dmId: dm.dmId, name: name }] });
    expect(requestDmList(user2.token)).toStrictEqual({ dms: [{ dmId: dm.dmId, name: name }] });
  });
  test('creates and list two dm correctly', () => {
    const user1 = requestAuthRegisterV2(email, password, firstName, lastName);
    const user2 = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const user3 = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const uIds: number[] = [user2.authUserId];
    const dm = requestDmCreate(user1.token, uIds);
    const dm2 = requestDmCreate(user3.token, uIds);
    expect(dm.dmId).toStrictEqual(expect.any(Number));
    const name = firstName2 + lastName2 + ', ' + firstName + lastName;
    const name2 = firstName2 + lastName2 + ', ' + firstName3 + lastName3;
    expect(requestDmList(user2.token)).toStrictEqual({ dms: [{ dmId: dm.dmId, name: name }, { dmId: dm2.dmId, name: name2 }] });
  });
  test('removes dms correctly', () => {
    const user1 = requestAuthRegisterV2(email, password, firstName, lastName);
    const user2 = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const user3 = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const uIds: number[] = [user2.authUserId];
    const dm = requestDmCreate(user1.token, uIds);
    const dm2 = requestDmCreate(user3.token, uIds);
    expect(dm.dmId).toStrictEqual(expect.any(Number));
    const name2 = firstName2 + lastName2 + ', ' + firstName3 + lastName3;
    expect(requestDmRemove(user1.token, dm.dmId)).toStrictEqual({});
    expect(requestDmList(user3.token)).toStrictEqual({ dms: [{ dmId: dm2.dmId, name: name2 }] });
  });
});

describe('test dm list error', () => {
  test('error when token is invalid', () => {
    expect(requestDmList(invalidToken)).toEqual(403);
  });
});

describe('test dm remove', () => {
  test('error when token is invalid', () => {
    const token: string = requestAuthRegisterV2(email, password, firstName, lastName).token;
    const user1: number = requestAuthRegisterV2(email2, password2, firstName2, lastName2).authUserId;
    const uIds: number[] = [user1];
    const dm = requestDmCreate(token, uIds);
    expect(dm.dmId).toStrictEqual(expect.any(Number));
    expect(requestDmRemove(invalidToken, dm.dmId)).toEqual(403);
  });
  test('error when dmid is invalid', () => {
    const token: string = requestAuthRegisterV2(email, password, firstName, lastName).token;
    const user1: number = requestAuthRegisterV2(email2, password2, firstName2, lastName2).authUserId;
    const uIds: number[] = [user1];
    const dm = requestDmCreate(token, uIds);
    expect(dm.dmId).toStrictEqual(expect.any(Number));
    expect(requestDmRemove(invalidToken, dm.dmId + 1)).toEqual(400);
  });
  test('error when removal owner is not creator', () => {
    const user = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1 = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    expect(dm.dmId).toStrictEqual(expect.any(Number));
    expect(requestDmRemove(user1.token, dm.dmId)).toEqual(403);
  });
  test('error when user is not in the dm', () => {
    const token: string = requestAuthRegisterV2(email, password, firstName, lastName).token;
    const user1: number = requestAuthRegisterV2(email2, password2, firstName2, lastName2).authUserId;
    const token1: string = requestAuthRegisterV2(email3, password3, firstName3, lastName3).token;
    const uIds: number[] = [user1];
    const dm = requestDmCreate(token, uIds);
    expect(dm.dmId).toStrictEqual(expect.any(Number));
    expect(requestDmRemove(token1, dm.dmId)).toEqual(403);
  });
});

describe('test dm leave and dm details', () => {
  test('correctly leaves as a member', () => {
    const user1 = requestAuthRegisterV2(email, password, firstName, lastName);
    const user2 = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const uIds: number[] = [user2.authUserId];
    const dm = requestDmCreate(user1.token, uIds);
    expect(dm.dmId).toStrictEqual(expect.any(Number));
    const name = firstName2 + lastName2 + ', ' + firstName + lastName;
    expect(requestDmLeave(user2.token, dm.dmId)).toStrictEqual({});
    expect(requestDmDetails(user1.token, dm.dmId)).toStrictEqual({
      name: name,
      members: [
        {
          uId: user1.authUserId,
          email: email,
          nameFirst: firstName,
          nameLast: lastName,
          handleStr: (firstName + lastName),
          profileImgUrl: defaultPfpUrl
        }
      ]
    }
    );
  });
  test('correctly leaves as an owner', () => {
    const user1 = requestAuthRegisterV2(email, password, firstName, lastName);
    const user2 = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user2.token, uIds);
    expect(dm.dmId).toStrictEqual(expect.any(Number));
    const name = firstName2 + lastName2 + ', ' + firstName + lastName;
    expect(requestDmLeave(user2.token, dm.dmId)).toStrictEqual({});
    expect(requestDmDetails(user1.token, dm.dmId)).toStrictEqual({
      name: name,
      members: [
        {
          uId: user1.authUserId,
          email: email,
          nameFirst: firstName,
          nameLast: lastName,
          handleStr: (firstName + lastName),
          profileImgUrl: defaultPfpUrl
        }
      ]
    }
    );
  });
});

describe('test dm details', () => {
  test('correct return type', () => {
    const user1 = requestAuthRegisterV2(email, password, firstName, lastName);
    const user2 = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const uIds: number[] = [user2.authUserId];
    const dm = requestDmCreate(user1.token, uIds);
    expect(dm.dmId).toStrictEqual(expect.any(Number));
    const name = firstName2 + lastName2 + ', ' + firstName + lastName;
    expect(requestDmDetails(user1.token, dm.dmId)).toStrictEqual({
      name: name,
      members: [
        {
          uId: user2.authUserId,
          email: email2,
          nameFirst: firstName2,
          nameLast: lastName2,
          handleStr: (firstName2 + lastName2),
          profileImgUrl: defaultPfpUrl
        },
        {
          uId: user1.authUserId,
          email: email,
          nameFirst: firstName,
          nameLast: lastName,
          handleStr: (firstName + lastName),
          profileImgUrl: defaultPfpUrl
        }
      ]
    }
    );
  });

  test('error when token is invalid', () => {
    const token: string = requestAuthRegisterV2(email, password, firstName, lastName).token;
    const user1: number = requestAuthRegisterV2(email2, password2, firstName2, lastName2).authUserId;
    const uIds: number[] = [user1];
    const dm = requestDmCreate(token, uIds);
    expect(dm.dmId).toStrictEqual(expect.any(Number));
    expect(requestDmDetails(invalidToken, dm.dmId)).toEqual(403);
  });

  test('error when dmid is invalid', () => {
    const token: string = requestAuthRegisterV2(email, password, firstName, lastName).token;
    const user1: number = requestAuthRegisterV2(email2, password2, firstName2, lastName2).authUserId;
    const uIds: number[] = [user1];
    const dm = requestDmCreate(token, uIds);
    expect(dm.dmId).toStrictEqual(expect.any(Number));
    expect(requestDmDetails(token, dm.dmId + 1)).toEqual(400);
  });

  test('error when user is not part of dm', () => {
    const token: string = requestAuthRegisterV2(email, password, firstName, lastName).token;
    const user1: number = requestAuthRegisterV2(email2, password2, firstName2, lastName2).authUserId;
    const token1: string = requestAuthRegisterV2(email3, password3, firstName3, lastName3).token;
    const uIds: number[] = [user1];
    const dm = requestDmCreate(token, uIds);
    expect(dm.dmId).toStrictEqual(expect.any(Number));
    expect(requestDmDetails(token1, dm.dmId)).toEqual(403);
  });
});

describe('test dm leave', () => {
  test('error when token is invalid', () => {
    const token: string = requestAuthRegisterV2(email, password, firstName, lastName).token;
    const user1: number = requestAuthRegisterV2(email2, password2, firstName2, lastName2).authUserId;
    const uIds: number[] = [user1];
    const dm = requestDmCreate(token, uIds);
    expect(dm.dmId).toStrictEqual(expect.any(Number));
    expect(requestDmLeave(invalidToken, dm.dmId)).toEqual(403);
  });
  test('error when dmid is invalid', () => {
    const token: string = requestAuthRegisterV2(email, password, firstName, lastName).token;
    const user1: number = requestAuthRegisterV2(email2, password2, firstName2, lastName2).authUserId;
    const uIds: number[] = [user1];
    const dm = requestDmCreate(token, uIds);
    expect(dm.dmId).toStrictEqual(expect.any(Number));
    expect(requestDmLeave(token, dm.dmId + 1)).toEqual(400);
  });
  test('error when user is not part of dm', () => {
    const token: string = requestAuthRegisterV2(email, password, firstName, lastName).token;
    const user1: number = requestAuthRegisterV2(email2, password2, firstName2, lastName2).authUserId;
    const token1: string = requestAuthRegisterV2(email3, password3, firstName3, lastName3).token;
    const uIds: number[] = [user1];
    const dm = requestDmCreate(token, uIds);
    expect(dm.dmId).toStrictEqual(expect.any(Number));
    expect(requestDmLeave(token1, dm.dmId)).toEqual(403);
  });
});

describe('test dm messages', () => {
  test('error when token is invalid', () => {
    const token: string = requestAuthRegisterV2(email, password, firstName, lastName).token;
    const user1: number = requestAuthRegisterV2(email2, password2, firstName2, lastName2).authUserId;
    const uIds: number[] = [user1];
    const dm = requestDmCreate(token, uIds);
    expect(dm.dmId).toStrictEqual(expect.any(Number));
    expect(requestDmMessages(invalidToken, dm.dmId, 0)).toEqual(403);
  });
  test('error when dmid is invalid', () => {
    const token: string = requestAuthRegisterV2(email, password, firstName, lastName).token;
    const user1: number = requestAuthRegisterV2(email2, password2, firstName2, lastName2).authUserId;
    const uIds: number[] = [user1];
    const dm = requestDmCreate(token, uIds);
    expect(dm.dmId).toStrictEqual(expect.any(Number));
    expect(requestDmMessages(token, dm.dmId + 1, 0)).toEqual(400);
  });
  test('error when start is invalid', () => {
    const token: string = requestAuthRegisterV2(email, password, firstName, lastName).token;
    const user1: number = requestAuthRegisterV2(email2, password2, firstName2, lastName2).authUserId;
    const uIds: number[] = [user1];
    const dm = requestDmCreate(token, uIds);
    expect(dm.dmId).toStrictEqual(expect.any(Number));
    expect(requestDmMessages(token, dm.dmId, 1)).toEqual(400);
  });
  test('error when user is not part of dm', () => {
    const token: string = requestAuthRegisterV2(email, password, firstName, lastName).token;
    const user1: number = requestAuthRegisterV2(email2, password2, firstName2, lastName2).authUserId;
    const token1: string = requestAuthRegisterV2(email3, password3, firstName3, lastName3).token;
    const uIds: number[] = [user1];
    const dm = requestDmCreate(token, uIds);
    expect(dm.dmId).toStrictEqual(expect.any(Number));
    expect(requestDmMessages(token1, dm.dmId, 0)).toEqual(403);
  });
});

describe('test dm send', () => {
  test('error when token is invalid', () => {
    const token: string = requestAuthRegisterV2(email, password, firstName, lastName).token;
    const user1: number = requestAuthRegisterV2(email2, password2, firstName2, lastName2).authUserId;
    const uIds: number[] = [user1];
    const dm = requestDmCreate(token, uIds);
    expect(dm.dmId).toStrictEqual(expect.any(Number));
    expect(requestDmSend(invalidToken, dm.dmId, 'hi')).toEqual(403);
  });
  test('error when dmid is invalid', () => {
    const token: string = requestAuthRegisterV2(email, password, firstName, lastName).token;
    const user1: number = requestAuthRegisterV2(email2, password2, firstName2, lastName2).authUserId;
    const uIds: number[] = [user1];
    const dm = requestDmCreate(token, uIds);
    expect(dm.dmId).toStrictEqual(expect.any(Number));
    expect(requestDmSend(token, dm.dmId + 1, 'hi')).toEqual(400);
  });
  test('error when user is not part of dm', () => {
    const token: string = requestAuthRegisterV2(email, password, firstName, lastName).token;
    const user1: number = requestAuthRegisterV2(email2, password2, firstName2, lastName2).authUserId;
    const token1: string = requestAuthRegisterV2(email3, password3, firstName3, lastName3).token;
    const uIds: number[] = [user1];
    const dm = requestDmCreate(token, uIds);
    expect(dm.dmId).toStrictEqual(expect.any(Number));
    expect(requestDmSend(token1, dm.dmId, 'bob')).toEqual(403);
  });
  test('message is valid length checks', () => {
    const tooBig = 'a'.repeat(1001);
    const tooSmall = '';
    const justBigEnough = 'a';
    const justSmallEnough = 'a'.repeat(1000);
    const token: string = requestAuthRegisterV2(email, password, firstName, lastName).token;
    const user1: number = requestAuthRegisterV2(email2, password2, firstName2, lastName2).authUserId;
    const uIds: number[] = [user1];
    const dm = requestDmCreate(token, uIds);
    expect(dm.dmId).toStrictEqual(expect.any(Number));
    expect(requestDmSend(token, dm.dmId, tooBig)).toEqual(400);
    expect(requestDmSend(token, dm.dmId, tooSmall)).toEqual(400);
    expect(requestDmSend(token, dm.dmId, justBigEnough)).toStrictEqual({ messageId: expect.any(Number) });
    expect(requestDmSend(token, dm.dmId, justSmallEnough)).toStrictEqual({ messageId: expect.any(Number) });
  });
});

describe('send and dm messages tests', () => {
  test('dm send functionality + dm messages functionality', () => {
    const user = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1 = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    expect(dm.dmId).toStrictEqual(expect.any(Number));
    let messages = [];
    for (let i = 0; i < 49; i++) {
      const msg = 'hi' + i.toString();
      const message: Message = {
        messageId: expect.any(Number),
        uId: user.authUserId,
        message: msg,
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      };
      messages.push(message);
      requestDmSend(user.token, dm.dmId, msg);
    }
    messages = messages.reverse();
    expect(requestDmMessages(user.token, dm.dmId, 0)).toStrictEqual({
      messages: messages,
      start: 0,
      end: -1
    });
  });
  test('50 dm send functionality + dm messages functionality', () => {
    const user = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1 = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    expect(dm.dmId).toStrictEqual(expect.any(Number));
    let messages = [];
    for (let i = 0; i < 50; i++) {
      const msg = 'hi' + i.toString();
      const message: Message = {
        messageId: expect.any(Number),
        uId: user.authUserId,
        message: 'hi' + i.toString(),
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      };
      messages.push(message);
      requestDmSend(user.token, dm.dmId, msg);
    }
    messages = messages.reverse();
    expect(requestDmMessages(user.token, dm.dmId, 0)).toStrictEqual({
      messages: messages,
      start: 0,
      end: -1
    });
  });
  test('51 dm send functionality + dm messages functionality', () => {
    const user = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1 = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    expect(dm.dmId).toStrictEqual(expect.any(Number));
    let messages = [];
    for (let i = 0; i < 51; i++) {
      const msg = 'hi' + i.toString();
      const message: Message = {
        messageId: expect.any(Number),
        uId: user.authUserId,
        message: 'hi' + i.toString(),
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      };
      if (i !== 0) {
        messages.push(message);
      }
      requestDmSend(user.token, dm.dmId, msg);
    }
    messages = messages.reverse();
    expect(requestDmMessages(user.token, dm.dmId, 0)).toStrictEqual({
      messages: messages,
      start: 0,
      end: 50
    });
  });
  test('2 dm send functionality + dm messages functionality', () => {
    const user = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1 = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    expect(dm.dmId).toStrictEqual(expect.any(Number));
    requestDmSend(user.token, dm.dmId, 'hi');
    requestDmSend(user1.token, dm.dmId, 'hi2');
    expect(requestDmMessages(user.token, dm.dmId, 0)).toStrictEqual({
      messages: [{
        messageId: expect.any(Number),
        uId: user1.authUserId,
        message: 'hi2',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      },
      {
        messageId: expect.any(Number),
        uId: user.authUserId,
        message: 'hi',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      }],
      start: 0,
      end: -1
    });
  });
});

describe('test dm message send later endpoints', () => {
  test('correct return', () => {
    const user = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1 = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const timeSend = Math.floor((Date.now() + 1000) / 1000) + 10;
    expect(requestDmSendLater(user.token, dm.dmId, stdMsg, timeSend)).toStrictEqual({ messageId: expect.any(Number) });
    sleep(15000);
    expect(requestDmMessages(user.token, dm.dmId, 0)).toStrictEqual({
      start: 0,
      end: -1,
      messages: [{
        messageId: expect.any(Number),
        uId: user.authUserId,
        message: stdMsg,
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      }],
    });
  });
  test('error when token invalid', () => {
    const user = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1 = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const timeSend = Math.floor((Date.now() + 1000) / 1000) + 1500;
    expect(requestDmSendLater(invalidToken, dm.dmId, stdMsg, timeSend)).toStrictEqual(403);
  });
  test('user not in channel', () => {
    const user = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1 = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const user2 = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const timeSend = Math.floor((Date.now() + 1000) / 1000) + 1500;
    expect(requestDmSendLater(user2.token, dm.dmId, stdMsg, timeSend)).toStrictEqual(403);
  });
  test('invalid channel id', () => {
    const user = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1 = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const timeSend = Math.floor((Date.now() + 1000) / 1000) + 1500;
    expect(requestDmSendLater(user.token, dm.dmId + 1, stdMsg, timeSend)).toStrictEqual(400);
  });
  test('invalid message length', () => {
    const user = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1 = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const timeSend = Math.floor((Date.now() + 1000) / 1000) + 1500;
    const msgTooLong = 'a'.repeat(1001);
    const msgTooShort = '';
    expect(requestDmSendLater(user.token, dm.dmId, msgTooLong, timeSend)).toStrictEqual(400);
    expect(requestDmSendLater(user.token, dm.dmId, msgTooShort, timeSend)).toStrictEqual(400);
  });
  test('invalid time', () => {
    const user = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1 = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const timeSend = Math.floor((Date.now() - 1000) / 1000) - 1500;
    expect(requestDmSendLater(user.token, dm.dmId, stdMsg, timeSend)).toStrictEqual(400);
  });
});

const stdMsg = 'bobbery';
/*
const wait = 4;
const invalidMessage = 'a'.repeat(1001);
jest.useFakeTimers();

describe('test dm send later', () => {
  beforeEach(() => {
    clearV1();
  });
  afterEach(() => {
    clearV1();
  });
  test('invalid dm id', () => {
    const user: ReturnAuth = authRegisterV3(email, password, firstName, lastName);
    const user1: ReturnAuth = authRegisterV3(email2, password2, firstName2, lastName2);
    const uIds: number[] = [user1.authUserId];
    const dm: dmId = dmCreateV2(user.token, uIds);
    const timeSend = Math.floor(Date.now() / 1000) + wait;
    try {
      dmSendLater(user.token, dm.dmId + 1, stdMsg, timeSend);
    } catch (error) {
      expect(error.statusCode).toStrictEqual(400);
    }
    jest.runAllTimers();
  });
  test('invalid message length', () => {
    const user: ReturnAuth = authRegisterV3(email, password, firstName, lastName);
    const user1: ReturnAuth = authRegisterV3(email2, password2, firstName2, lastName2);
    const uIds: number[] = [user1.authUserId];
    const dm: dmId = dmCreateV2(user.token, uIds);
    const timeSend = Math.floor(Date.now() / 1000) + wait;
    try {
      dmSendLater(user.token, dm.dmId, invalidMessage, timeSend);
    } catch (error) {
      expect(error.statusCode).toStrictEqual(400);
    }
    jest.runAllTimers();
  });
  test('invalid token', () => {
    const user: ReturnAuth = authRegisterV3(email, password, firstName, lastName);
    const user1: ReturnAuth = authRegisterV3(email2, password2, firstName2, lastName2);
    const uIds: number[] = [user1.authUserId];
    const dm: dmId = dmCreateV2(user.token, uIds);
    const timeSend = Math.floor(Date.now() / 1000) + wait;
    try {
      dmSendLater(invalidToken, dm.dmId, stdMsg, timeSend);
    } catch (error) {
      expect(error.statusCode).toStrictEqual(403);
    }
    jest.runAllTimers();
  });
  test('invalid time sent', () => {
    const user: ReturnAuth = authRegisterV3(email, password, firstName, lastName);
    const user1: ReturnAuth = authRegisterV3(email2, password2, firstName2, lastName2);
    const uIds: number[] = [user1.authUserId];
    const dm: dmId = dmCreateV2(user.token, uIds);
    const invalidTimeSend = Math.floor(Date.now() / 1000) - wait;
    try {
      dmSendLater(user.token, dm.dmId, stdMsg, invalidTimeSend);
    } catch (error) {
      expect(error.statusCode).toStrictEqual(400);
    }
    jest.runAllTimers();
  });
  test('user is not a dm member', () => {
    const user: ReturnAuth = authRegisterV3(email, password, firstName, lastName);
    const user1: ReturnAuth = authRegisterV3(email2, password2, firstName2, lastName2);
    const user2: ReturnAuth = authRegisterV3(email3, password3, firstName3, lastName3);
    const uIds: number[] = [user1.authUserId];
    const dm: dmId = dmCreateV2(user.token, uIds);
    const timeSend = Math.floor(Date.now() / 1000) + wait;
    try {
      dmSendLater(user2.token, dm.dmId, stdMsg, timeSend);
    } catch (error) {
      expect(error.statusCode).toStrictEqual(403);
    }
    jest.runAllTimers();
  });
  test('correct functionality', () => {
    // make sure to check if overlap affects messageid
    const user: ReturnAuth = authRegisterV3(email, password, firstName, lastName);
    const user1: ReturnAuth = authRegisterV3(email2, password2, firstName2, lastName2);
    const uIds: number[] = [user1.authUserId];
    const dm: dmId = dmCreateV2(user.token, uIds);
    const timeSend = Math.floor(Date.now() / 1000) + wait;
    const mId = dmSendLater(user.token, dm.dmId, 'hi', timeSend + 2);
    const mId2 = dmSendLater(user1.token, dm.dmId, 'hi2', timeSend);
    expect(dmMessagesV2(user.token, dm.dmId, 0)).toStrictEqual(
      {
        start: 0,
        end: -1,
        messages: [],
      }
    );
    jest.runAllTimers();
    expect(dmMessagesV2(user.token, dm.dmId, 0)).toStrictEqual(
      {
        start: 0,
        end: -1,
        messages: [{
          messageId: mId.messageId,
          uId: user.authUserId,
          message: 'hi',
          timeSent: timeSend + 2,
          reacts: [],
          isPinned: false
        },
        {
          messageId: mId2.messageId,
          uId: user1.authUserId,
          message: 'hi2',
          timeSent: timeSend,
          reacts: [],
          isPinned: false
        }],
      }
    );
  });
});
*/
