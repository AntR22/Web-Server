import { requestClearV1, requestChannelsCreateV2, requestChannelJoinV2, requestChannelInviteV2, requestChannelAddownerV1, requestMessageSendV1, requestDmCreate, requestAuthRegisterV2, requestDmSend, requestUserProfileSetemailV1, requestUserProfileSetnameV1, requestUserProfileSethandleV1, requestSearchV1 } from './helper';
import { ReturnAuth, ChannelId } from '../types';

beforeEach(() => {
  requestClearV1();
});
afterEach(() => {
  requestClearV1();
});

describe('test for clearV1 function', () => {
  test('1 person registered', () => {
    requestAuthRegisterV2('abc@email.com', '123456', 'person', 'one');
    expect(requestClearV1()).toStrictEqual({});
  });

  test('multiple people registered', () => {
    requestAuthRegisterV2('abc@email.com', '123456', 'person', 'one');
    requestAuthRegisterV2('123@email.com', '3.14159', 'person', 'two');
    requestAuthRegisterV2('lalala@email.com', 'pouytt', 'person', 'three');
    expect(requestClearV1()).toStrictEqual({});
  });

  test('multiple people created multiple channels and joined and invited people', () => {
    const user1 = requestAuthRegisterV2('abc@email.com', '123456', 'person', 'one');
    const user2 = requestAuthRegisterV2('123@email.com', '3.14159', 'person', 'two');
    const user3 = requestAuthRegisterV2('lalala@email.com', 'pouytt', 'person', 'three');
    const channel1 = requestChannelsCreateV2(user1.token, 'persona', true);
    const channel3 = requestChannelsCreateV2(user3.token, 'someone', true);
    requestChannelJoinV2(user2.token, channel1.channelId);
    requestChannelInviteV2(user3.token, channel3.channelId, user2.authUserId);
    expect(requestClearV1()).toStrictEqual({});
  });

  // need to finish
  test('multiple people and channels and messages', () => {
    const user1 = requestAuthRegisterV2('abc@email.com', '123456', 'person', 'one');
    const user2 = requestAuthRegisterV2('123@email.com', '3.14159', 'person', 'two');
    const user3 = requestAuthRegisterV2('lalala@email.com', 'pouytt', 'person', 'three');
    const channel1 = requestChannelsCreateV2(user1.token, 'persona', true);
    const channel3 = requestChannelsCreateV2(user3.token, 'someone', true);
    requestChannelAddownerV1(user1.token, channel3.channelId, user2.authUserId);
    requestChannelAddownerV1(user3.token, channel3.channelId, user2.authUserId);
    requestMessageSendV1(user2.token, channel3.channelId, 'good morning');
    requestMessageSendV1(user3.token, channel1.channelId, 'good evening');
    expect(requestClearV1()).toStrictEqual({});
  });

  test('multiple people created multiple dms and send messages', () => {
    const user1 = requestAuthRegisterV2('abc@email.com', '123456', 'person', 'one');
    const user2 = requestAuthRegisterV2('123@email.com', '3.14159', 'person', 'two');
    const user3 = requestAuthRegisterV2('lalala@email.com', 'pouytt', 'person', 'three');
    const uId = [user2.authUserId];
    const dm1 = requestDmCreate(user1.token, uId);
    const dm2 = requestDmCreate(user3.token, uId);
    requestDmSend(user1.token, dm2.dmId, 'hi');
    requestDmSend(user3.token, dm1.dmId, 'hi');
    expect(requestClearV1()).toStrictEqual({});
  });

  test('multiple people change names, emails and handles', () => {
    const user1 = requestAuthRegisterV2('abc@email.com', '123456', 'person', 'one');
    const user2 = requestAuthRegisterV2('123@email.com', '3.14159', 'person', 'two');
    const user3 = requestAuthRegisterV2('lalala@email.com', 'pouytt', 'person', 'three');
    requestUserProfileSetemailV1(user1.token, 'hahaha@gmail.com');
    requestUserProfileSetnameV1(user2.token, 'someone', 'new');
    requestUserProfileSethandleV1(user3.token, 'newHandlestring');
    expect(requestClearV1()).toStrictEqual({});
  });
});

describe('test for search function', () => {
  test('querystrin is not valid', () => {
    const user: ReturnAuth = requestAuthRegisterV2('heello@gmail.com', 'googoog', 'ram', 'ganesh');
    const longString = 'a'.repeat(1001);
    const shortString = '';
    expect(requestSearchV1(user.token, longString)).toStrictEqual(400);
    expect(requestSearchV1(user.token, shortString)).toStrictEqual(400);
  });
  test('invalid token', () => {
    const user: ReturnAuth = requestAuthRegisterV2('heello@gmail.com', 'googoog', 'ram', 'ganesh');
    requestAuthRegisterV2('lalala@email.com', 'pouytt', 'person', 'three');
    const channel: ChannelId = requestChannelsCreateV2(user.token, 'channelName', true);
    requestMessageSendV1(user.token, channel.channelId, 'hello there');
    requestMessageSendV1(user.token, channel.channelId, 'hello nigh');
    requestMessageSendV1(user.token, channel.channelId, 'hello nay');
    requestMessageSendV1(user.token, channel.channelId, 'hello how');
    expect(requestSearchV1('blahblah', 'hello')).toStrictEqual(403);
  });
  test('user cannot retrieve message from ivnalid channel', () => {
    const user: ReturnAuth = requestAuthRegisterV2('heello@gmail.com', 'googoog', 'ram', 'ganesh');
    const user3 = requestAuthRegisterV2('lalala@email.com', 'pouytt', 'person', 'three');
    const channel: ChannelId = requestChannelsCreateV2(user.token, 'channelName', true);
    requestMessageSendV1(user.token, channel.channelId, 'hello there');
    requestMessageSendV1(user.token, channel.channelId, 'hello nigh');
    requestMessageSendV1(user.token, channel.channelId, 'hello nay');
    requestMessageSendV1(user.token, channel.channelId, 'hello how');
    expect(requestSearchV1(user3.token, 'hello')).toStrictEqual(
      {
        messages: []
      }
    );
  });
  test('global user can interact', () => {
    const user: ReturnAuth = requestAuthRegisterV2('heello@gmail.com', 'googoog', 'ram', 'ganesh');
    const user3 = requestAuthRegisterV2('lalala@email.com', 'pouytt', 'person', 'three');
    const channel: ChannelId = requestChannelsCreateV2(user3.token, 'channelName', true);
    requestMessageSendV1(user.token, channel.channelId, 'hello there');
    requestMessageSendV1(user.token, channel.channelId, 'hello nigh');
    requestMessageSendV1(user.token, channel.channelId, 'hello nay');
    requestMessageSendV1(user.token, channel.channelId, 'hello how');
    expect(requestSearchV1(user.token, 'hello')).toStrictEqual(
      {
        messages: []
      }
    );
  });
  test('correctly works with dms', () => {
    const user: ReturnAuth = requestAuthRegisterV2('heello@gmail.com', 'googoog', 'ram', 'ganesh');
    const user3 = requestAuthRegisterV2('lalala@email.com', 'pouytt', 'person', 'three');
    const user1 = requestAuthRegisterV2('abc@email.com', '123456', 'person', 'one');
    const uIds: number[] = [user3.authUserId];
    const dm = requestDmCreate(user.token, uIds);
    const mId = requestDmSend(user.token, dm.dmId, 'hi');
    expect(requestSearchV1(user1.token, 'hi')).toStrictEqual(
      {
        messages: []
      }
    );
    expect(requestSearchV1(user.token, 'hi')).toStrictEqual(
      {
        messages: [
          {
            messageId: mId.messageId,
            uId: user.authUserId,
            message: 'hi',
            timeSent: expect.any(Number),
            reacts: [],
            isPinned: false
          }
        ]
      }
    );
  });
  test('correct implementation', () => {
    const user: ReturnAuth = requestAuthRegisterV2('heello@gmail.com', 'googoog', 'ram', 'ganesh');
    const channel: ChannelId = requestChannelsCreateV2(user.token, 'channelName', true);
    const mes1 = requestMessageSendV1(user.token, channel.channelId, 'hello there');
    const mes2 = requestMessageSendV1(user.token, channel.channelId, 'hello nigh');
    const mes3 = requestMessageSendV1(user.token, channel.channelId, 'hello nay');
    const mes4 = requestMessageSendV1(user.token, channel.channelId, 'hello how');
    expect(requestSearchV1(user.token, 'hello')).toStrictEqual(
      {
        messages: [
          {
            messageId: mes1.messageId,
            uId: user.authUserId,
            message: 'hello there',
            timeSent: expect.any(Number),
            reacts: [],
            isPinned: false
          },
          {
            messageId: mes2.messageId,
            uId: user.authUserId,
            message: 'hello nigh',
            timeSent: expect.any(Number),
            reacts: [],
            isPinned: false
          },
          {
            messageId: mes3.messageId,
            uId: user.authUserId,
            message: 'hello nay',
            timeSent: expect.any(Number),
            reacts: [],
            isPinned: false
          },
          {
            messageId: mes4.messageId,
            uId: user.authUserId,
            message: 'hello how',
            timeSent: expect.any(Number),
            reacts: [],
            isPinned: false
          }
        ]
      }
    );
  });
});
