import { ChannelId, Message, MessageId, Reacts, ReturnAuth, dmId } from '../types';
import { requestAuthRegisterV2, requestClearV1, requestMessageSendV1, requestMessageEditV1, requestMessageRemoveV1, requestDmCreate, requestDmSend, requestChannelsCreateV2, requestChannelMessagesV2, requestChannelJoinV2, requestDmMessages, requestMessageReact, requestMessageUnReact, requestMessagePin, requestMessageUnPin, requestMessageSendLater } from './helper';
const sleep = require('atomic-sleep');
// had to use a require statement instead of import as import gave errors

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
const channelName = 'anton c';
const public1 = true;
const stdMsg = 'bananas';

const email2 = 'aj@gmail.com';
const password2 = 'nadpassword';
const firstName2 = 'ajj';
const lastName2 = 'goog';

const email3 = 'garyjab@gmail.com';
const password3 = 'IamGary';
const firstName3 = 'gary';
const lastName3 = 'jab';

describe('test message send', () => {
  test('error when token is invalid', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const channel = requestChannelsCreateV2(user.token, channelName, public1);
    expect(requestMessageSendV1(invalidToken, channel.channelId, stdMsg)).toEqual(403);
  });
  test('error when channelId is invalid', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const channel = requestChannelsCreateV2(user.token, channelName, public1);
    expect(requestMessageSendV1(user.token, channel.channelId + 1, stdMsg)).toEqual(400);
  });
  test('error when msg is invalid length', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const channel = requestChannelsCreateV2(user.token, channelName, public1);
    const msgTooLong = 'a'.repeat(1001);
    const msgTooShort = '';
    expect(requestMessageSendV1(user.token, channel.channelId, msgTooLong)).toEqual(400);
    expect(requestMessageSendV1(user.token, channel.channelId, msgTooShort)).toEqual(400);
  });
  test('msg is just right length', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const channel = requestChannelsCreateV2(user.token, channelName, public1);
    const justBigEnough = 'a';
    const justSmallEnough = 'a'.repeat(1000);
    expect(requestMessageSendV1(user.token, channel.channelId, justBigEnough)).toStrictEqual({ messageId: expect.any(Number) });
    expect(requestMessageSendV1(user.token, channel.channelId, justSmallEnough)).toStrictEqual({ messageId: expect.any(Number) });
  });
  test('user is not part of channel returns error', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user2: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const channel = requestChannelsCreateV2(user.token, channelName, public1);
    expect(requestMessageSendV1(user2.token, channel.channelId, stdMsg)).toEqual(403);
  });
  test('correct return type', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const channel = requestChannelsCreateV2(user.token, channelName, public1);
    expect(requestMessageSendV1(user.token, channel.channelId, stdMsg)).toStrictEqual({ messageId: expect.any(Number) });
  });
  test('correct functionality', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const channel = requestChannelsCreateV2(user.token, channelName, public1);
    requestMessageSendV1(user.token, channel.channelId, stdMsg);
    const msg: Message = {
      messageId: expect.any(Number),
      uId: user.authUserId,
      message: stdMsg,
      timeSent: expect.any(Number),
      reacts: [],
      isPinned: false
    };
    expect(requestChannelMessagesV2(user.token, channel.channelId, 0)).toStrictEqual({ messages: [msg], start: 0, end: -1 });
    const msg2: Message = {
      messageId: expect.any(Number),
      uId: user.authUserId,
      message: stdMsg + 'lol',
      timeSent: expect.any(Number),
      reacts: [],
      isPinned: false
    };
    requestMessageSendV1(user.token, channel.channelId, stdMsg + 'lol');
    expect(requestChannelMessagesV2(user.token, channel.channelId, 0)).toStrictEqual({ messages: [msg2, msg], start: 0, end: -1 });
  });
});

describe('test message edit', () => {
  test('error when token invalid', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    const mId = requestDmSend(user.token, dm.dmId, stdMsg);
    const mId2 = requestMessageSendV1(user.token, channel.channelId, stdMsg);
    expect(requestMessageEditV1(invalidToken, mId.messageId, 'hi')).toEqual(403);
    expect(requestMessageEditV1(invalidToken, mId2.messageId, 'hi')).toEqual(403);
  });
  test('error when message is incorrect length', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    const mId = requestDmSend(user.token, dm.dmId, stdMsg);
    const mId2 = requestMessageSendV1(user.token, channel.channelId, stdMsg);
    const msgTooLong = 'a'.repeat(1001);
    expect(requestMessageEditV1(user.token, mId.messageId, msgTooLong)).toEqual(400);
    expect(requestMessageEditV1(user.token, mId2.messageId, msgTooLong)).toEqual(400);
    const msgPerfect = 'a'.repeat(1000);
    expect(requestMessageEditV1(user.token, mId.messageId, msgPerfect)).toStrictEqual({});
    expect(requestMessageEditV1(user.token, mId2.messageId, msgPerfect)).toStrictEqual({});
  });
  test('error when messageId is invalid', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    const mId = requestDmSend(user.token, dm.dmId, stdMsg);
    const mId2 = requestMessageSendV1(user.token, channel.channelId, stdMsg);
    expect(requestMessageEditV1(user.token, mId.messageId + 5050, 'hi')).toEqual(400);
    expect(requestMessageEditV1(user.token, mId2.messageId + 5050, 'hi')).toEqual(400);
  });
  test('error when user does not have required permissions', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    const mId = requestDmSend(user.token, dm.dmId, stdMsg);
    const mId2 = requestMessageSendV1(user.token, channel.channelId, stdMsg);
    expect(requestMessageEditV1(user1.token, mId.messageId, 'hi')).toEqual(403);
    expect(requestMessageEditV1(user1.token, mId2.messageId, 'hi')).toEqual(403);
    expect(requestChannelJoinV2(user1.token, channel.channelId)).toStrictEqual({});
    expect(requestMessageEditV1(user1.token, mId2.messageId, 'hi')).toEqual(403);
  });
  test('correct return type', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    const mId = requestDmSend(user.token, dm.dmId, stdMsg);
    const mId2 = requestMessageSendV1(user.token, channel.channelId, stdMsg);
    const mId3 = requestDmSend(user1.token, dm.dmId, stdMsg);
    expect(requestMessageEditV1(user.token, mId.messageId, 'hi')).toStrictEqual({});
    expect(requestMessageEditV1(user.token, mId2.messageId, 'hi')).toStrictEqual({});
    expect(requestMessageEditV1(user1.token, mId3.messageId, 'hi')).toStrictEqual({});
  });
  test('channel admin and global admin can edit message', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const user2: ReturnAuth = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const channel: ChannelId = requestChannelsCreateV2(user1.token, channelName, public1);
    requestChannelJoinV2(user2.token, channel.channelId);
    const mId2 = requestMessageSendV1(user2.token, channel.channelId, stdMsg);
    expect(requestMessageEditV1(user.token, mId2.messageId, 'hi')).toStrictEqual({});
    expect(requestMessageEditV1(user1.token, mId2.messageId, 'lol')).toStrictEqual({});
  });
  test('correct functionality', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    const mId = requestDmSend(user.token, dm.dmId, stdMsg);
    const mId2 = requestMessageSendV1(user.token, channel.channelId, stdMsg);
    const mId3 = requestDmSend(user1.token, dm.dmId, stdMsg);
    expect(requestMessageEditV1(user.token, mId.messageId, 'hi')).toStrictEqual({});
    expect(requestMessageEditV1(user.token, mId2.messageId, 'hi')).toStrictEqual({});
    expect(requestMessageEditV1(user1.token, mId3.messageId, 'bye')).toStrictEqual({});
    const msg: Message = {
      messageId: expect.any(Number),
      timeSent: expect.any(Number),
      message: 'hi',
      uId: user.authUserId,
      reacts: [],
      isPinned: false
    };
    const msg2: Message = {
      messageId: expect.any(Number),
      timeSent: expect.any(Number),
      message: 'bye',
      uId: user1.authUserId,
      reacts: [],
      isPinned: false
    };
    expect(requestChannelMessagesV2(user.token, channel.channelId, 0)).toStrictEqual({
      messages: [msg],
      start: 0,
      end: -1
    });
    expect(requestDmMessages(user.token, dm.dmId, 0)).toStrictEqual({
      messages: [msg2, msg],
      start: 0,
      end: -1
    });
    expect(requestMessageEditV1(user.token, mId3.messageId, 'blob')).toStrictEqual({});
    msg2.message = 'blob';
    expect(requestDmMessages(user.token, dm.dmId, 0)).toStrictEqual({
      messages: [msg, msg2],
      start: 0,
      end: -1
    });
    expect(requestMessageEditV1(user.token, mId3.messageId, '')).toStrictEqual({});
    expect(requestDmMessages(user.token, dm.dmId, 0)).toStrictEqual({
      messages: [msg],
      start: 0,
      end: -1
    });
  });
});

describe('test message remove', () => {
  test('error when token invalid', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    const mId = requestDmSend(user.token, dm.dmId, stdMsg);
    const mId2 = requestMessageSendV1(user.token, channel.channelId, stdMsg);
    expect(requestMessageRemoveV1(invalidToken, mId.messageId)).toEqual(403);
    expect(requestMessageRemoveV1(invalidToken, mId2.messageId)).toEqual(403);
  });
  test('error when messageId is invalid', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    const mId = requestDmSend(user.token, dm.dmId, stdMsg);
    const mId2 = requestMessageSendV1(user.token, channel.channelId, stdMsg);
    expect(requestMessageRemoveV1(user.token, mId.messageId + 5050)).toEqual(400);
    expect(requestMessageRemoveV1(user.token, mId2.messageId + 5050)).toEqual(400);
  });
  test('error when user does not have required permissions', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    const mId = requestDmSend(user.token, dm.dmId, stdMsg);
    const mId2 = requestMessageSendV1(user.token, channel.channelId, stdMsg);
    expect(requestMessageRemoveV1(user1.token, mId.messageId)).toEqual(403);
    expect(requestMessageRemoveV1(user1.token, mId2.messageId)).toEqual(403);
    expect(requestChannelJoinV2(user1.token, channel.channelId)).toStrictEqual({});
    expect(requestMessageRemoveV1(user1.token, mId2.messageId)).toEqual(403);
  });
  test('correct return type', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const uIds: number[] = [user1.authUserId];
    const dm: dmId = requestDmCreate(user.token, uIds);
    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    const mId: MessageId = requestDmSend(user.token, dm.dmId, stdMsg);
    const mId2: MessageId = requestMessageSendV1(user.token, channel.channelId, stdMsg);
    const mId3: MessageId = requestDmSend(user1.token, dm.dmId, stdMsg);
    expect(requestMessageRemoveV1(user.token, mId.messageId)).toStrictEqual({});
    expect(requestMessageRemoveV1(user.token, mId2.messageId)).toStrictEqual({});
    expect(requestMessageRemoveV1(user1.token, mId3.messageId)).toStrictEqual({});
  });
  test('correct functionality', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    const mId = requestDmSend(user.token, dm.dmId, stdMsg);
    const mId2 = requestMessageSendV1(user.token, channel.channelId, stdMsg);
    const mId3 = requestDmSend(user1.token, dm.dmId, stdMsg);
    const msg2: Message = {
      messageId: expect.any(Number),
      timeSent: expect.any(Number),
      message: stdMsg,
      uId: user1.authUserId,
      reacts: [],
      isPinned: false
    };
    expect(requestMessageRemoveV1(user.token, mId.messageId)).toStrictEqual({});
    expect(requestMessageRemoveV1(user.token, mId2.messageId)).toStrictEqual({});
    expect(requestChannelMessagesV2(user.token, channel.channelId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1
    });
    expect(requestDmMessages(user.token, dm.dmId, 0)).toStrictEqual({
      messages: [msg2],
      start: 0,
      end: -1
    });
    expect(requestMessageRemoveV1(user1.token, mId3.messageId)).toStrictEqual({});
    expect(requestDmMessages(user.token, dm.dmId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1
    });
  });
});

const validReactId = 1;
const invalidReactId = 5450;

describe('test message reacting and unreacting', () => {
  test('error 400 when reactid is invalid - react', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);

    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const mId = requestDmSend(user.token, dm.dmId, stdMsg);

    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    const mId2 = requestMessageSendV1(user.token, channel.channelId, stdMsg);

    expect(requestMessageReact(user.token, mId.messageId, invalidReactId)).toStrictEqual(400);
    expect(requestMessageReact(user.token, mId2.messageId, invalidReactId)).toStrictEqual(400);
  });

  test('error 400 when reactid is invalid - unreact', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);

    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const mId = requestDmSend(user.token, dm.dmId, stdMsg);

    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    const mId2 = requestMessageSendV1(user.token, channel.channelId, stdMsg);
    requestMessageReact(user.token, mId, validReactId);
    requestMessageReact(user.token, mId2, validReactId);

    expect(requestMessageUnReact(user.token, mId.messageId, invalidReactId)).toStrictEqual(400);
    expect(requestMessageUnReact(user.token, mId2.messageId, invalidReactId)).toStrictEqual(400);
  });

  test('error 400 when message id is invalid - react', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);

    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const mId = requestDmSend(user.token, dm.dmId, stdMsg);

    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    const mId2 = requestMessageSendV1(user.token, channel.channelId, stdMsg);

    expect(requestMessageReact(user.token, mId.messageId + 5945, validReactId)).toStrictEqual(400);
    expect(requestMessageReact(user.token, mId2.messageId + 8935, validReactId)).toStrictEqual(400);
  });

  test('error 400 when message id is invalid - unreact', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);

    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const mId = requestDmSend(user.token, dm.dmId, stdMsg);

    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    const mId2 = requestMessageSendV1(user.token, channel.channelId, stdMsg);
    requestMessageReact(user.token, mId, validReactId);

    expect(requestMessageUnReact(user.token, mId.messageId + 879, validReactId)).toStrictEqual(400);
    expect(requestMessageUnReact(user.token, mId2.messageId + 354, validReactId)).toStrictEqual(400);
  });

  test('error 400 when user has already reacted', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);

    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const mId = requestDmSend(user.token, dm.dmId, stdMsg);

    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    const mId2 = requestMessageSendV1(user.token, channel.channelId, stdMsg);

    expect(requestMessageReact(user.token, mId.messageId, validReactId)).toStrictEqual({});
    expect(requestMessageReact(user.token, mId2.messageId, validReactId)).toStrictEqual({});
    expect(requestMessageReact(user.token, mId.messageId, validReactId)).toStrictEqual(400);
    expect(requestMessageReact(user.token, mId2.messageId, validReactId)).toStrictEqual(400);
  });

  test('error 400 when unreaacting and message doesnt contain reaction', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);

    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const mId = requestDmSend(user.token, dm.dmId, stdMsg);

    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    const mId2 = requestMessageSendV1(user.token, channel.channelId, stdMsg);

    expect(requestMessageUnReact(user.token, mId.messageId, validReactId)).toStrictEqual(400);
    expect(requestMessageUnReact(user.token, mId2.messageId, validReactId)).toStrictEqual(400);
  });

  test('error 403 token is invalid - reacting', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);

    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const mId = requestDmSend(user.token, dm.dmId, stdMsg);

    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    const mId2 = requestMessageSendV1(user.token, channel.channelId, stdMsg);

    expect(requestMessageReact(invalidToken, mId.messageId, validReactId)).toStrictEqual(403);
    expect(requestMessageReact(invalidToken, mId2.messageId, validReactId)).toStrictEqual(403);
  });

  test('error 403 token is invalid - unreacting', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);

    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const mId = requestDmSend(user.token, dm.dmId, stdMsg);

    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    const mId2 = requestMessageSendV1(user.token, channel.channelId, stdMsg);
    requestMessageReact(user.token, mId.messageId, validReactId);
    requestMessageReact(user.token, mId2.messageId, validReactId);

    expect(requestMessageUnReact(invalidToken, mId.messageId, validReactId)).toStrictEqual(403);
    expect(requestMessageUnReact(invalidToken, mId2.messageId, validReactId)).toStrictEqual(403);
  });

  test('error 403 user is not member of channel', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    const mId = requestMessageSendV1(user.token, channel.channelId, stdMsg);
    expect(requestMessageReact(user1.token, mId.messageId, validReactId)).toStrictEqual(403);
  });

  test('error 403 user is not member of dm', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const user2: ReturnAuth = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const mId = requestDmSend(user.token, dm.dmId, stdMsg);
    requestMessageReact(user2.token, mId.messageId, validReactId);
  });
  test('user who is not the original message sender can react', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);

    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const mId = requestDmSend(user.token, dm.dmId, stdMsg);
    expect(requestMessageReact(user1.token, mId.messageId, validReactId)).toStrictEqual({});

    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    const mId2 = requestMessageSendV1(user.token, channel.channelId, stdMsg);
    requestChannelJoinV2(user1.token, channel.channelId);
    expect(requestMessageReact(user1.token, mId2.messageId, validReactId)).toStrictEqual({});
  });
  test('user who is not the original message sender can unreact', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);

    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const mId = requestDmSend(user.token, dm.dmId, stdMsg);
    requestMessageReact(user1.token, mId.messageId, validReactId);
    expect(requestMessageUnReact(user1.token, mId.messageId, validReactId)).toStrictEqual({});

    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    const mId2 = requestMessageSendV1(user.token, channel.channelId, stdMsg);
    requestChannelJoinV2(user1.token, channel.channelId);
    requestMessageReact(user1.token, mId2.messageId, validReactId);
    expect(requestMessageUnReact(user1.token, mId2.messageId, validReactId)).toStrictEqual({});
  });
  test('correct functionality', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);

    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const mId = requestDmSend(user.token, dm.dmId, stdMsg);

    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    const mId2 = requestMessageSendV1(user.token, channel.channelId, stdMsg);
    expect(requestMessageReact(user.token, mId.messageId, validReactId)).toStrictEqual({});
    expect(requestMessageReact(user.token, mId2.messageId, validReactId)).toStrictEqual({});
    const reaction: Reacts = {
      reactId: validReactId,
      uIds: [user.authUserId],
      isThisUserReacted: true
    };
    const msg: Message = {
      messageId: expect.any(Number),
      timeSent: expect.any(Number),
      message: stdMsg,
      uId: user.authUserId,
      reacts: [reaction],
      isPinned: false
    };
    expect(requestDmMessages(user.token, mId.messageId, 0)).toStrictEqual({
      messages: [msg],
      start: 0,
      end: -1
    });
    expect(requestChannelMessagesV2(user.token, mId.messageId, 0)).toStrictEqual({
      messages: [msg],
      start: 0,
      end: -1
    });
    expect(requestMessageUnReact(user.token, mId.messageId, validReactId)).toStrictEqual({});
    expect(requestMessageUnReact(user.token, mId2.messageId, validReactId)).toStrictEqual({});
    const reaction2: Reacts = {
      reactId: validReactId,
      uIds: [],
      isThisUserReacted: false
    };
    const msg2: Message = {
      messageId: expect.any(Number),
      timeSent: expect.any(Number),
      message: stdMsg,
      uId: user.authUserId,
      reacts: [reaction2],
      isPinned: false
    };
    expect(requestDmMessages(user.token, mId.messageId, 0)).toStrictEqual({
      messages: [msg2],
      start: 0,
      end: -1
    });
    expect(requestChannelMessagesV2(user.token, mId.messageId, 0)).toStrictEqual({
      messages: [msg2],
      start: 0,
      end: -1
    });
  });
});

describe('test message pin', () => {
  test('error 400 when message id is invalid', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);

    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const mId = requestDmSend(user.token, dm.dmId, stdMsg);

    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    const mId2 = requestMessageSendV1(user.token, channel.channelId, stdMsg);
    expect(requestMessagePin(user.token, mId.messageId + mId2.messageId)).toStrictEqual(400);
  });
  test('error 400 when message is already pinned', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);

    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const mId = requestDmSend(user.token, dm.dmId, stdMsg);

    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    const mId2 = requestMessageSendV1(user.token, channel.channelId, stdMsg);
    expect(requestMessagePin(user.token, mId.messageId)).toStrictEqual({});
    expect(requestMessagePin(user.token, mId.messageId)).toStrictEqual(400);
    expect(requestMessagePin(user.token, mId2.messageId)).toStrictEqual({});
    expect(requestMessagePin(user.token, mId2.messageId)).toStrictEqual(400);
  });
  test('error 403 token invalid', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);

    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const mId = requestDmSend(user.token, dm.dmId, stdMsg);

    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    const mId2 = requestMessageSendV1(user.token, channel.channelId, stdMsg);
    expect(requestMessagePin(invalidToken, mId.messageId)).toStrictEqual(403);
    expect(requestMessagePin(invalidToken, mId2.messageId)).toStrictEqual(403);
  });
  test('error 403 when user does not have owner permissions', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);

    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const mId = requestDmSend(user.token, dm.dmId, stdMsg);

    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    requestChannelJoinV2(user1.token, channel.channelId);
    const mId2 = requestMessageSendV1(user.token, channel.channelId, stdMsg);
    expect(requestMessagePin(user1.token, mId.messageId)).toStrictEqual(403);
    expect(requestMessagePin(user1.token, mId2.messageId)).toStrictEqual(403);
  });
  test('error 400 when user is not in the channel', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);

    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    const mId = requestMessageSendV1(user.token, channel.channelId, stdMsg);
    expect(requestMessagePin(user1.token, mId.messageId)).toStrictEqual(400);
  });
  test('error 400 when user is not in the dm', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const user2: ReturnAuth = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const mId = requestDmSend(user.token, dm.dmId, stdMsg);

    expect(requestMessagePin(user2.token, mId.messageId)).toStrictEqual(400);
  });
  test('global owner can pin channel msg', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);

    const channel: ChannelId = requestChannelsCreateV2(user1.token, channelName, public1);
    const mId = requestMessageSendV1(user1.token, channel.channelId, stdMsg);
    expect(requestMessagePin(user.token, mId.messageId)).toStrictEqual(400);
    requestChannelJoinV2(user.token, channel.channelId);
    requestMessageUnPin(user1.token, mId.messageId);
    expect(requestMessagePin(user.token, mId.messageId)).toStrictEqual({});
  });
  test('correctly pins message', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);

    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    requestChannelJoinV2(user1.token, channel.channelId);
    const mId = requestMessageSendV1(user1.token, channel.channelId, stdMsg);
    expect(requestMessagePin(user.token, mId.messageId)).toStrictEqual({});
    const msg: Message = {
      messageId: expect.any(Number),
      timeSent: expect.any(Number),
      message: stdMsg,
      uId: user1.authUserId,
      reacts: [],
      isPinned: true
    };
    expect(requestChannelMessagesV2(user.token, channel.channelId, 0)).toStrictEqual({
      messages: [msg],
      start: 0,
      end: -1
    });
  });
  test('correct functionality', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);

    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const mId = requestDmSend(user.token, dm.dmId, stdMsg);

    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    const mId2 = requestMessageSendV1(user.token, channel.channelId, stdMsg);
    expect(requestMessagePin(user.token, mId.messageId)).toStrictEqual({});
    expect(requestMessagePin(user.token, mId2.messageId)).toStrictEqual({});
    const msg: Message = {
      messageId: expect.any(Number),
      timeSent: expect.any(Number),
      message: stdMsg,
      uId: user.authUserId,
      reacts: [],
      isPinned: true
    };
    expect(requestDmMessages(user.token, mId.messageId, 0)).toStrictEqual({
      messages: [msg],
      start: 0,
      end: -1
    });
    expect(requestChannelMessagesV2(user.token, mId.messageId, 0)).toStrictEqual({
      messages: [msg],
      start: 0,
      end: -1
    });
    expect(requestMessageUnPin(user.token, mId.messageId)).toStrictEqual({});
    expect(requestMessageUnPin(user.token, mId2.messageId)).toStrictEqual({});
    const msg2: Message = {
      messageId: expect.any(Number),
      timeSent: expect.any(Number),
      message: stdMsg,
      uId: user.authUserId,
      reacts: [],
      isPinned: false
    };
    expect(requestDmMessages(user.token, mId.messageId, 0)).toStrictEqual({
      messages: [msg2],
      start: 0,
      end: -1
    });
    expect(requestChannelMessagesV2(user.token, mId.messageId, 0)).toStrictEqual({
      messages: [msg2],
      start: 0,
      end: -1
    });
  });
});

describe('test message unpin', () => {
  test('error 400 when message id is invalid', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);

    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const mId = requestDmSend(user.token, dm.dmId, stdMsg);

    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    const mId2 = requestMessageSendV1(user.token, channel.channelId, stdMsg);
    expect(requestMessageUnPin(user.token, mId.messageId + mId2.messageId)).toStrictEqual(400);
  });
  test('error 400 when message is already unpinned', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);

    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const mId = requestDmSend(user.token, dm.dmId, stdMsg);

    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    const mId2 = requestMessageSendV1(user.token, channel.channelId, stdMsg);
    requestMessagePin(user.token, mId.messageId);
    requestMessagePin(user.token, mId2.messageId);
    expect(requestMessageUnPin(user.token, mId.messageId)).toStrictEqual({});
    expect(requestMessageUnPin(user.token, mId.messageId)).toStrictEqual(400);
    expect(requestMessageUnPin(user.token, mId2.messageId)).toStrictEqual({});
    expect(requestMessageUnPin(user.token, mId2.messageId)).toStrictEqual(400);
  });
  test('error 403 token invalid', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);

    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const mId = requestDmSend(user.token, dm.dmId, stdMsg);

    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    const mId2 = requestMessageSendV1(user.token, channel.channelId, stdMsg);
    requestMessagePin(user.token, mId.messageId);
    requestMessagePin(user.token, mId2.messageId);
    expect(requestMessageUnPin(invalidToken, mId.messageId)).toStrictEqual(403);
    expect(requestMessageUnPin(invalidToken, mId2.messageId)).toStrictEqual(403);
  });
  test('error 403 when user does not have owner permissions', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);

    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const mId = requestDmSend(user.token, dm.dmId, stdMsg);

    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    const mId2 = requestMessageSendV1(user.token, channel.channelId, stdMsg);
    requestChannelJoinV2(user1.token, channel.channelId);
    requestMessagePin(user.token, mId.messageId);
    requestMessagePin(user.token, mId2.messageId);
    expect(requestMessageUnPin(user1.token, mId.messageId)).toStrictEqual(403);
    expect(requestMessageUnPin(user1.token, mId2.messageId)).toStrictEqual(403);
  });
  test('error 400 when user is not in the channel', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);

    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    const mId = requestMessageSendV1(user.token, channel.channelId, stdMsg);
    requestMessagePin(user.token, mId.messageId);
    expect(requestMessageUnPin(user1.token, mId.messageId)).toStrictEqual(400);
  });
  test('error 400 when user is not in the dm', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const user2: ReturnAuth = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const uIds: number[] = [user1.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const mId = requestDmSend(user.token, dm.dmId, stdMsg);
    requestMessagePin(user.token, mId.messageId);
    expect(requestMessageUnPin(user2.token, mId.messageId)).toStrictEqual(400);
  });
  test('global owner can unpin channel msg', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);

    const channel: ChannelId = requestChannelsCreateV2(user1.token, channelName, public1);
    const mId = requestMessageSendV1(user1.token, channel.channelId, stdMsg);
    expect(requestMessagePin(user1.token, mId.messageId)).toStrictEqual({});
    requestChannelJoinV2(user.token, channel.channelId);
    expect(requestMessageUnPin(user.token, mId.messageId)).toStrictEqual({});
  });
});

describe('test message send later endpoints', () => {
  test('correct return', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    requestChannelJoinV2(user1.token, channel.channelId);
    const timeSend = Math.floor((Date.now() + 1000) / 1000) + 10;
    expect(requestMessageSendLater(user.token, channel.channelId, stdMsg, timeSend)).toStrictEqual({ messageId: expect.any(Number) });
    sleep(15000);
    expect(requestChannelMessagesV2(user1.token, channel.channelId, 0)).toStrictEqual({
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
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    requestChannelJoinV2(user1.token, channel.channelId);
    const timeSend = Math.floor((Date.now() + 1000) / 1000) + 1500;
    expect(requestMessageSendLater(invalidToken, channel.channelId, stdMsg, timeSend)).toStrictEqual(403);
  });
  test('user not in channel', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    const timeSend = Math.floor((Date.now() + 1000) / 1000) + 1500;
    expect(requestMessageSendLater(user1.token, channel.channelId, stdMsg, timeSend)).toStrictEqual(403);
  });
  test('invalid channel id', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    requestChannelJoinV2(user1.token, channel.channelId);
    const timeSend = Math.floor((Date.now() + 1000) / 1000) + 1500;
    expect(requestMessageSendLater(user.token, channel.channelId + 1, stdMsg, timeSend)).toStrictEqual(400);
  });
  test('invalid message length', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    requestChannelJoinV2(user1.token, channel.channelId);
    const timeSend = Math.floor((Date.now() + 1000) / 1000) + 1500;
    const msgTooLong = 'a'.repeat(1001);
    const msgTooShort = '';
    expect(requestMessageSendLater(user.token, channel.channelId, msgTooLong, timeSend)).toStrictEqual(400);
    expect(requestMessageSendLater(user.token, channel.channelId, msgTooShort, timeSend)).toStrictEqual(400);
  });
  test('invalid time', () => {
    const user: ReturnAuth = requestAuthRegisterV2(email, password, firstName, lastName);
    const user1: ReturnAuth = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const channel: ChannelId = requestChannelsCreateV2(user.token, channelName, public1);
    requestChannelJoinV2(user1.token, channel.channelId);
    const timeSend = Math.floor((Date.now() - 1000) / 1000) - 1000;
    expect(requestMessageSendLater(user.token, channel.channelId, stdMsg, timeSend)).toStrictEqual(400);
  });
});
/*
jest.useFakeTimers();

describe('test message send later', () => {
  beforeEach(() => {
    clearV1();
  });
  afterEach(() => {
    clearV1();
  });
  test('invalid channel id', () => {
    const user: ReturnAuth = authRegisterV3(email, password, firstName, lastName);
    const user1: ReturnAuth = authRegisterV3(email2, password2, firstName2, lastName2);

    const channel: ChannelId = channelsCreateV3(user.token, channelName, public1);
    channelJoinV3(user1.token, channel.channelId);
    const timeSend = Math.floor((Date.now() + 1000) / 1000) + 5;
    try {
      messageSendLater(user.token, channel.channelId + 1, stdMsg, timeSend);
    } catch (error) {
      expect(error.statusCode).toStrictEqual(400);
    }
    jest.runAllTimers();
  });
  test('invalid message length', () => {
    const user: ReturnAuth = authRegisterV3(email, password, firstName, lastName);
    const user1: ReturnAuth = authRegisterV3(email2, password2, firstName2, lastName2);

    const channel: ChannelId = channelsCreateV3(user.token, channelName, public1);
    channelJoinV3(user1.token, channel.channelId);
    const timeSend = Math.floor((Date.now() + 1000) / 1000) + 5;
    const msgTooLong = 'a'.repeat(1001);
    const msgTooShort = '';
    try {
      messageSendLater(user.token, channel.channelId, msgTooLong, timeSend);
    } catch (error) {
      expect(error.statusCode).toStrictEqual(400);
    }
    try {
      messageSendLater(user.token, channel.channelId, msgTooShort, timeSend);
    } catch (error) {
      expect(error.statusCode).toStrictEqual(400);
    }
    jest.runAllTimers();
  });
  test('invalid token', () => {
    const user: ReturnAuth = authRegisterV3(email, password, firstName, lastName);
    const user1: ReturnAuth = authRegisterV3(email2, password2, firstName2, lastName2);
    const channel: ChannelId = channelsCreateV3(user.token, channelName, public1);
    channelJoinV3(user1.token, channel.channelId);
    const timeSend = Math.floor((Date.now() + 1000) / 1000) + 5;
    try {
      messageSendLater(invalidToken, channel.channelId, stdMsg, timeSend);
    } catch (error) {
      expect(error.statusCode).toStrictEqual(403);
    }
    jest.runAllTimers();
  });
  test('invalid time sent', () => {
    const user: ReturnAuth = authRegisterV3(email, password, firstName, lastName);
    const user1: ReturnAuth = authRegisterV3(email2, password2, firstName2, lastName2);
    const channel: ChannelId = channelsCreateV3(user.token, channelName, public1);
    channelJoinV3(user1.token, channel.channelId);
    const invalidTimeSend = Math.floor(Date.now() / 1000) - 5;
    try {
      messageSendLater(user.token, channel.channelId, stdMsg, invalidTimeSend);
    } catch (error) {
      expect(error.statusCode).toStrictEqual(400);
    }
    jest.runAllTimers();
  });
  test('user is not a channel member', () => {
    const user: ReturnAuth = authRegisterV3(email, password, firstName, lastName);
    const user1: ReturnAuth = authRegisterV3(email2, password2, firstName2, lastName2);
    const channel: ChannelId = channelsCreateV3(user.token, channelName, public1);
    const timeSend = Math.floor((Date.now() + 1000) / 1000) + 5;
    try {
      messageSendLater(user1.token, channel.channelId, 'hi2', timeSend);
    } catch (error) {
      expect(error.statusCode).toStrictEqual(403);
    }
    jest.runAllTimers();
  });
  test('correct functionality', () => {
    const user: ReturnAuth = authRegisterV3(email, password, firstName, lastName);
    const user1: ReturnAuth = authRegisterV3(email2, password2, firstName2, lastName2);
    const channel: ChannelId = channelsCreateV3(user.token, channelName, public1);
    channelJoinV3(user1.token, channel.channelId);
    const timeSend = Math.floor((Date.now() + 1000) / 1000) + 5;
    const mId = messageSendLater(user.token, channel.channelId, 'hi', timeSend + 2);
    const mId2 = messageSendLater(user1.token, channel.channelId, 'hi2', timeSend);
    expect(channelMessagesV3(user.token, channel.channelId, 0)).toStrictEqual(
      {
        start: 0,
        end: -1,
        messages: [],
      }
    );
    jest.runAllTimers();
    expect(channelMessagesV3(user.token, channel.channelId, 0)).toStrictEqual(
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
