import { requestAuthRegisterV2, requestClearV1, requestChannelMessagesV2, requestChannelsCreateV2, requestStandupStartV1, requestStandupActiveV1, requestStandupSendV1, requestChannelJoinV2 } from './helper';
import { ReturnAuth } from '../types';
const sleep = require('atomic-sleep');

const u1Email = 'abc@gmail.com';
const u1Password = 'goodpassword';
const u1FirstName = 'Example';
const u1LastName = 'Person1';

const u2Email = 'hello@gmail.com';
const u2Password = 'acceptable';
const u2FirstName = 'Another';
const u2LastName = 'Person2';

const u3Email = 'morning@gmail.com';
const u3Password = 'maybegood';
const u3FirstName = 'Good';
const u3LastName = 'morning';

const invalidToken = 'bob';
const channelName = 'Ryannnn';
const public1 = true;
const duration = 2;
const invalidDuration = -5;
const message1 = 'hello Ryan';
const message2 = 'good morning!';
const message3 = 'good night';

const justBigEnough = 'a';
const justSmallEnough = 'a'.repeat(1000);
const msgTooLong = 'a'.repeat(1001);
const msgTooShort = '';

const SentMessage1 = (u1FirstName + u1LastName).toLowerCase() + ': ' + message1;
const SentMessage2 = (u2FirstName + u2LastName).toLowerCase() + ': ' + message2;
const SentMessage3 = (u3FirstName + u3LastName).toLowerCase() + ': ' + message3;

const messageCombine = SentMessage1 + '\n' + SentMessage2 + '\n' + SentMessage3;
beforeEach(() => {
  requestClearV1();
});
afterEach(() => {
  requestClearV1();
});

describe('test for standupStartV1', () => {
  test('error when the token is invalid', () => {
    const user: ReturnAuth = requestAuthRegisterV2(u1Email, u1Password, u1FirstName, u1LastName);
    const channel = requestChannelsCreateV2(user.token, channelName, public1);
    expect(requestStandupStartV1(invalidToken, channel.channelId, duration)).toEqual(403);
  });
  test('error when the channelId is invalid', () => {
    const user: ReturnAuth = requestAuthRegisterV2(u1Email, u1Password, u1FirstName, u1LastName);
    const channel = requestChannelsCreateV2(user.token, channelName, public1);
    expect(requestStandupStartV1(user.token, channel.channelId + 1, duration)).toEqual(400);
  });
  test('error when the duration is invalid', () => {
    const user: ReturnAuth = requestAuthRegisterV2(u1Email, u1Password, u1FirstName, u1LastName);
    const channel = requestChannelsCreateV2(user.token, channelName, public1);
    expect(requestStandupStartV1(user.token, channel.channelId, invalidDuration)).toEqual(400);
  });
  test('not channel member starting standup', () => {
    const user1 : ReturnAuth = requestAuthRegisterV2(u1Email, u1Password, u1FirstName, u1LastName);
    const channel = requestChannelsCreateV2(user1.token, channelName, public1);
    const user2 : ReturnAuth = requestAuthRegisterV2(u2Email, u2Password, u2FirstName, u2LastName);
    expect(requestStandupStartV1(user2.token, channel.channelId, duration)).toEqual(403);
  });
  test('a valid standup happening channel', () => {
    const user: ReturnAuth = requestAuthRegisterV2(u1Email, u1Password, u1FirstName, u1LastName);
    const channel = requestChannelsCreateV2(user.token, channelName, public1);
    const currentTime = Math.floor((new Date()).getTime() / 1000);
    expect(requestStandupStartV1(user.token, channel.channelId, duration)).toEqual({ timeFinish: currentTime + duration });
  });
  test('error when a standup is currently happening', () => {
    const user1: ReturnAuth = requestAuthRegisterV2(u1Email, u1Password, u1FirstName, u1LastName);
    const channel = requestChannelsCreateV2(user1.token, channelName, public1);
    const user2 : ReturnAuth = requestAuthRegisterV2(u2Email, u2Password, u2FirstName, u2LastName);
    requestChannelJoinV2(user2.token, channel.channelId);
    requestStandupStartV1(user1.token, channel.channelId, duration);
    expect(requestStandupStartV1(user1.token, channel.channelId, duration)).toEqual(400);
    expect(requestStandupStartV1(user2.token, channel.channelId, duration)).toEqual(400);
  });
  test('no message returned due to empty input', () => {
    const user : ReturnAuth = requestAuthRegisterV2(u1Email, u1Password, u1FirstName, u1LastName);
    const channel = requestChannelsCreateV2(user.token, channelName, public1);
    requestStandupStartV1(user.token, channel.channelId, duration);
    expect(requestChannelMessagesV2(user.token, channel.channelId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1
    });
  });

  test('multiple messages inputted check', () => {
    const user : ReturnAuth = requestAuthRegisterV2(u1Email, u1Password, u1FirstName, u1LastName);
    const channel = requestChannelsCreateV2(user.token, channelName, public1);
    const user2 : ReturnAuth = requestAuthRegisterV2(u2Email, u2Password, u2FirstName, u2LastName);
    const user3 : ReturnAuth = requestAuthRegisterV2(u3Email, u3Password, u3FirstName, u3LastName);
    requestChannelJoinV2(user2.token, channel.channelId);
    requestChannelJoinV2(user3.token, channel.channelId);
    requestStandupStartV1(user.token, channel.channelId, duration);
    const finishTime: number = Math.floor((new Date()).getTime() / 1000) + duration;
    requestStandupSendV1(user.token, channel.channelId, message1);
    expect(requestStandupSendV1(user2.token, channel.channelId, message2)).not.toEqual(400);
    requestStandupSendV1(user3.token, channel.channelId, message3);
    expect(requestChannelMessagesV2(user.token, channel.channelId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1
    });
    sleep((duration + 1) * 1000);
    expect(requestChannelMessagesV2(user.token, channel.channelId, 0)).toStrictEqual({
      messages: [
        {
          message: messageCombine,
          messageId: expect.any(Number),
          uId: expect.any(Number),
          timeSent: finishTime,
          isPinned: false,
          reacts: [],
        }
      ],
      start: 0,
      end: -1
    });
  });
});

describe('test for standup active', () => {
  test('error when the token is invalid', () => {
    const user = requestAuthRegisterV2(u1Email, u1Password, u1FirstName, u1LastName);
    const channel = requestChannelsCreateV2(user.token, channelName, public1);
    expect(requestStandupActiveV1(invalidToken, channel.channelId)).toEqual(403);
  });
  test('error when the channelId is invalid', () => {
    const user = requestAuthRegisterV2(u1Email, u1Password, u1FirstName, u1LastName);
    const channel = requestChannelsCreateV2(user.token, channelName, public1);
    expect(requestStandupActiveV1(user.token, channel.channelId + 1)).toEqual(400);
  });
  test('not channel member checking standup active', () => {
    const user1 = requestAuthRegisterV2(u1Email, u1Password, u1FirstName, u1LastName);
    const channel = requestChannelsCreateV2(user1.token, channelName, public1);
    const user2 = requestAuthRegisterV2(u2Email, u2Password, u2FirstName, u2LastName);
    expect(requestStandupActiveV1(user2.token, channel.channelId)).toEqual(403);
  });
  test('inactive channel - no previous standups', () => {
    const user = requestAuthRegisterV2(u1Email, u1Password, u1FirstName, u1LastName);
    const channel = requestChannelsCreateV2(user.token, channelName, public1);
    expect(requestStandupActiveV1(user.token, channel.channelId)).toStrictEqual({ isActive: false, timeFinish: null });
  });
  test('inactive channel - have previous standups', () => {
    const user = requestAuthRegisterV2(u1Email, u1Password, u1FirstName, u1LastName);
    const channel = requestChannelsCreateV2(user.token, channelName, public1);
    requestStandupStartV1(user.token, channel.channelId, duration);
    sleep((duration + 1) * 1000);
    expect(requestStandupActiveV1(user.token, channel.channelId)).toStrictEqual({ isActive: false, timeFinish: null });
  });
  test('active standups in progress', () => {
    const user = requestAuthRegisterV2(u1Email, u1Password, u1FirstName, u1LastName);
    const channel = requestChannelsCreateV2(user.token, channelName, public1);
    requestStandupStartV1(user.token, channel.channelId, duration);
    const finishTime = Math.floor((new Date()).getTime() / 1000) + duration;
    expect(requestStandupActiveV1(user.token, channel.channelId)).toStrictEqual({ isActive: true, timeFinish: finishTime });
    sleep((duration + 1) * 1000);
    expect(requestStandupActiveV1(user.token, channel.channelId)).toStrictEqual({ isActive: false, timeFinish: null });
  });
});

describe('test for standup send messages', () => {
  test('error when the token is invalid', () => {
    const user: ReturnAuth = requestAuthRegisterV2(u1Email, u1Password, u1FirstName, u1LastName);
    const channel = requestChannelsCreateV2(user.token, channelName, public1);
    expect(requestStandupSendV1(invalidToken, channel.channelId, message1)).toEqual(403);
  });
  test('error when the channelId is invalid', () => {
    const user: ReturnAuth = requestAuthRegisterV2(u1Email, u1Password, u1FirstName, u1LastName);
    const channel = requestChannelsCreateV2(user.token, channelName, public1);
    expect(requestStandupSendV1(user.token, channel.channelId + 1, message1)).toEqual(400);
  });
  test('not a channel member checking standup active', () => {
    const user1 : ReturnAuth = requestAuthRegisterV2(u1Email, u1Password, u1FirstName, u1LastName);
    const channel = requestChannelsCreateV2(user1.token, channelName, public1);
    const user2 : ReturnAuth = requestAuthRegisterV2(u2Email, u2Password, u2FirstName, u2LastName);
    expect(requestStandupSendV1(user2.token, channel.channelId, message1)).toEqual(403);
  });
  test('invalid message length', () => {
    const user1 : ReturnAuth = requestAuthRegisterV2(u1Email, u1Password, u1FirstName, u1LastName);
    const channel = requestChannelsCreateV2(user1.token, channelName, public1);
    requestStandupStartV1(user1.token, channel.channelId, duration);
    expect(requestStandupSendV1(user1.token, channel.channelId, msgTooLong)).toEqual(400);
    expect(requestStandupSendV1(user1.token, channel.channelId, msgTooShort)).toEqual(400);
  });
  test('just valid message length', () => {
    const user1 : ReturnAuth = requestAuthRegisterV2(u1Email, u1Password, u1FirstName, u1LastName);
    const channel = requestChannelsCreateV2(user1.token, channelName, public1);
    requestStandupStartV1(user1.token, channel.channelId, duration);
    expect(requestStandupSendV1(user1.token, channel.channelId, justBigEnough)).toEqual({});
    expect(requestStandupSendV1(user1.token, channel.channelId, justSmallEnough)).toEqual({});
    sleep(3000);
    const msg = (u1FirstName + u1LastName).toLowerCase() + ': ' + justBigEnough + '\n' +
                (u1FirstName + u1LastName).toLowerCase() + ': ' + justSmallEnough;
    expect(requestChannelMessagesV2(user1.token, channel.channelId, 0)).toStrictEqual({
      messages: [
        {
          message: msg,
          messageId: expect.any(Number),
          uId: expect.any(Number),
          timeSent: expect.any(Number),
          isPinned: false,
          reacts: [],
        }
      ],
      start: 0,
      end: -1
    });
  });
  test('one message send during the standup', () => {
    const user : ReturnAuth = requestAuthRegisterV2(u1Email, u1Password, u1FirstName, u1LastName);
    const channel = requestChannelsCreateV2(user.token, channelName, public1);
    requestStandupStartV1(user.token, channel.channelId, duration);
    const finishTime: number = Math.floor((new Date()).getTime() / 1000) + duration;
    requestStandupSendV1(user.token, channel.channelId, message1);
    sleep((duration + 1) * 1000);
    expect(requestChannelMessagesV2(user.token, channel.channelId, 0)).toStrictEqual({
      messages: [
        {
          message: SentMessage1,
          messageId: expect.any(Number),
          uId: expect.any(Number),
          timeSent: finishTime,
          isPinned: false,
          reacts: [],
        }
      ],
      start: 0,
      end: -1
    });
  });
  test('multiple messages inputted during the standup', () => {
    const user : ReturnAuth = requestAuthRegisterV2(u1Email, u1Password, u1FirstName, u1LastName);
    const channel = requestChannelsCreateV2(user.token, channelName, public1);
    const user2 : ReturnAuth = requestAuthRegisterV2(u2Email, u2Password, u2FirstName, u2LastName);
    const user3 : ReturnAuth = requestAuthRegisterV2(u3Email, u3Password, u3FirstName, u3LastName);
    requestChannelJoinV2(user2.token, channel.channelId);
    requestChannelJoinV2(user3.token, channel.channelId);
    requestStandupStartV1(user.token, channel.channelId, duration);
    const finishTime: number = Math.floor((new Date()).getTime() / 1000) + duration;
    requestStandupSendV1(user.token, channel.channelId, message1);
    expect(requestStandupSendV1(user2.token, channel.channelId, message2)).toStrictEqual({});
    requestStandupSendV1(user3.token, channel.channelId, message3);
    sleep((duration + 1) * 1000);
    expect(requestChannelMessagesV2(user.token, channel.channelId, 0)).toStrictEqual({
      messages: [
        {
          message: messageCombine,
          messageId: expect.any(Number),
          uId: expect.any(Number),
          timeSent: finishTime,
          isPinned: false,
          reacts: [],
        }
      ],
      start: 0,
      end: -1
    });
  });
});
