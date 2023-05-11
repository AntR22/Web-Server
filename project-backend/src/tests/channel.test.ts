import { Message } from '../types';
import { requestAuthRegisterV2, requestChannelsCreateV2, requestChannelDetailsV2, requestChannelJoinV2, requestChannelInviteV2, requestChannelMessagesV2, requestChannelLeaveV1, requestChannelAddownerV1, requestChannelRemoveownerV1, requestMessageSendV1 } from './helper';
import { requestClearV1 } from './helper';

import config from '../config.json';

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

const defaultPfpUrl = `http://${HOST}:${PORT}/img/default.jpg`;

const EMPTY = {};

beforeEach(() => {
  requestClearV1();
});
afterEach(() => {
  requestClearV1();
});

function getArrayOfA(): Message[] {
  const arr: Message[] = [];
  for (let i = 0; i < 50; i++) {
    const msg: Message = {
      message: 'my name is Harambe and the recipe for elixir is.........',
      messageId: 50 - i,
      timeSent: expect.any(Number),
      uId: expect.any(Number),
      reacts: [],
      isPinned: false
    };
    arr.push(msg);
  }
  return arr;
}

const channelName1 = 'Alpha';
const channelName2 = 'Dawmm';
const channelName3 = 'Gamma';

// User #1
const email1 = 'ram.gan35h@gmail.com';
const password1 = 'BRuhbrUH';
const firstName1 = 'Eren';
const lastName1 = 'Yeager';

// User #2
const email2 = 'erenyeager@gmail.com';
const password2 = 'timeforthai';
const firstName2 = 'Shithead';
const lastName2 = 'Quaseem';

// User #3
const email3 = 'gangnamstyle@gmail.com';
const password3 = 'arghhhhh';
const firstName3 = 'Joe';
const lastName3 = 'Biden';

// handles
const handle1 = 'erenyeager';
const handle2 = 'shitheadquaseem';
const handle3 = 'joebiden';

const messageList: Message[] = getArrayOfA();

describe('test channel details', () => {
  test('error when token is invalid', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    const channelId1: number = requestChannelsCreateV2(token1, channelName1, true).channelId;
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    requestChannelsCreateV2(token2, channelName1, true);
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    requestChannelsCreateV2(token3, channelName3, true);
    expect(requestChannelDetailsV2('yeahhhh', channelId1)).toEqual(403);
  });
  test('error when channel id is invalid', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    requestChannelsCreateV2(token1, channelName1, true);
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    requestChannelsCreateV2(token2, channelName1, true);
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    requestChannelsCreateV2(token3, channelName3, true);
    expect(requestChannelDetailsV2(token1, 16666)).toEqual(400);
  });
  test('error when auth usr is not in channel', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    const channelId1: number = requestChannelsCreateV2(token1, channelName1, true).channelId;
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    requestChannelsCreateV2(token2, channelName1, true);
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    requestChannelsCreateV2(token3, channelName3, true);
    expect(requestChannelDetailsV2(token2, channelId1)).toEqual(403);
  });
  test('correct behaviour', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    const uId1: number = auth1.authUserId;
    const channelId1: number = requestChannelsCreateV2(token1, channelName1, true).channelId;
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    requestChannelsCreateV2(token2, channelName1, true);
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    requestChannelsCreateV2(token3, channelName3, true);
    expect(requestChannelDetailsV2(token1, channelId1)).toStrictEqual(
      {
        name: channelName1,
        isPublic: true,
        ownerMembers: [{
          uId: uId1,
          email: email1,
          nameFirst: firstName1,
          nameLast: lastName1,
          handleStr: handle1,
          profileImgUrl: defaultPfpUrl
        }],
        allMembers: [{
          uId: uId1,
          email: email1,
          nameFirst: firstName1,
          nameLast: lastName1,
          handleStr: handle1,
          profileImgUrl: defaultPfpUrl
        }]
      }
    );
  });
});

describe('test channel invite', () => {
  test('error when token is invalid', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    const channelId1: number = requestChannelsCreateV2(token1, channelName1, true).channelId;
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    const uId2: number = auth2.authUserId;
    requestChannelsCreateV2(token2, channelName1, true);
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    requestChannelsCreateV2(token3, channelName3, true);
    expect(requestChannelInviteV2('grrrrr', channelId1, uId2)).toEqual(403);
  });
  test('error when channelId is invalid', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    requestChannelsCreateV2(token1, channelName1, true);
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    const uId2: number = auth2.authUserId;
    requestChannelsCreateV2(token2, channelName1, true);
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    requestChannelsCreateV2(token3, channelName3, true);
    expect(requestChannelInviteV2(token1, 24726478, uId2)).toEqual(400);
  });
  test('error when uId is invalid', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    const channelId1: number = requestChannelsCreateV2(token1, channelName1, true).channelId;
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    requestChannelsCreateV2(token2, channelName1, true);
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    requestChannelsCreateV2(token3, channelName3, true);
    expect(requestChannelInviteV2(token1, channelId1, 769696)).toEqual(400);
  });
  test('error when uId is already in channel', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    const uId1: number = auth1.authUserId;
    const channelId1: number = requestChannelsCreateV2(token1, channelName1, true).channelId;
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    requestChannelsCreateV2(token2, channelName1, true);
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    requestChannelsCreateV2(token3, channelName3, true);
    expect(requestChannelInviteV2(token1, channelId1, uId1)).toEqual(400);
  });
  test('error when token user is not in channel', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    const channelId1: number = requestChannelsCreateV2(token1, channelName1, true).channelId;
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    const uId2: number = auth2.authUserId;
    requestChannelsCreateV2(token2, channelName1, true);
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    requestChannelsCreateV2(token3, channelName3, true);
    expect(requestChannelInviteV2(token2, channelId1, uId2)).toEqual(403);
  });
  test('correct output', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    const uId1: number = auth1.authUserId;
    const channelId1: number = requestChannelsCreateV2(token1, channelName1, true).channelId;
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    requestChannelsCreateV2(token2, channelName1, true);
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    const uId3: number = auth3.authUserId;
    requestChannelsCreateV2(token3, channelName3, true);
    requestChannelInviteV2(token1, channelId1, uId3);
    expect(requestChannelDetailsV2(token1, channelId1)).toStrictEqual(
      {
        name: channelName1,
        isPublic: true,
        ownerMembers: [{
          uId: uId1,
          email: email1,
          nameFirst: firstName1,
          nameLast: lastName1,
          handleStr: handle1,
          profileImgUrl: defaultPfpUrl
        }],
        allMembers: [{
          uId: uId1,
          email: email1,
          nameFirst: firstName1,
          nameLast: lastName1,
          handleStr: handle1,
          profileImgUrl: defaultPfpUrl
        }, {
          uId: uId3,
          email: email3,
          nameFirst: firstName3,
          nameLast: lastName3,
          handleStr: handle3,
          profileImgUrl: defaultPfpUrl
        }]
      }
    );
  });
});

describe('test channel join', () => {
  test('error when token is invalid', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    const channelId1: number = requestChannelsCreateV2(token1, channelName1, true).channelId;
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    requestChannelsCreateV2(token2, channelName1, true);
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    requestChannelsCreateV2(token3, channelName3, false);
    expect(requestChannelJoinV2('grrrrr', channelId1)).toEqual(403);
  });
  test('error when channelId is invalid', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    requestChannelsCreateV2(token1, channelName1, true);
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    requestChannelsCreateV2(token2, channelName1, true);
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    requestChannelsCreateV2(token3, channelName3, false);
    expect(requestChannelJoinV2(token1, 24726478)).toEqual(400);
  });
  test('error when channel is private an user isnt global', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    requestChannelsCreateV2(token1, channelName1, true);
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    requestChannelsCreateV2(token2, channelName1, true);
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    const channelId3: number = requestChannelsCreateV2(token3, channelName3, false).channelId;
    expect(requestChannelJoinV2(token2, channelId3)).toEqual(403);
  });
  test('error when token user is already in channel', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    const channelId1: number = requestChannelsCreateV2(token1, channelName1, true).channelId;
    requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    requestChannelsCreateV2(token3, channelName3, false);
    expect(requestChannelJoinV2(token1, channelId1)).toEqual(400);
  });
  test('correct output', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    const channelId1: number = requestChannelsCreateV2(token2, channelName1, true).channelId;
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    requestChannelsCreateV2(token3, channelName3, false);
    expect(requestChannelJoinV2(token1, channelId1)).toStrictEqual(EMPTY);
  });
  test('correct output of details', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    const uId1: number = auth1.authUserId;
    requestChannelsCreateV2(token1, channelName1, true);
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    const uId2: number = auth2.authUserId;
    const channelId2: number = requestChannelsCreateV2(token2, channelName2, true).channelId;
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    requestChannelsCreateV2(token3, channelName3, false);
    requestChannelJoinV2(token1, channelId2);
    expect(requestChannelDetailsV2(token1, channelId2)).toStrictEqual(
      {
        name: channelName2,
        isPublic: true,
        ownerMembers: [{
          uId: uId2,
          email: email2,
          nameFirst: firstName2,
          nameLast: lastName2,
          handleStr: handle2,
          profileImgUrl: defaultPfpUrl
        }],
        allMembers: [{
          uId: uId2,
          email: email2,
          nameFirst: firstName2,
          nameLast: lastName2,
          handleStr: handle2,
          profileImgUrl: defaultPfpUrl
        }, {
          uId: uId1,
          email: email1,
          nameFirst: firstName1,
          nameLast: lastName1,
          handleStr: handle1,
          profileImgUrl: defaultPfpUrl
        }]
      }
    );
  });
});

describe('test channel leave', () => {
  test('error when token is invalid', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    const channelId1: number = requestChannelsCreateV2(token1, channelName1, true).channelId;
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    requestChannelsCreateV2(token2, channelName1, true);
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    requestChannelsCreateV2(token3, channelName3, false);
    expect(requestChannelLeaveV1('grrrrr', channelId1)).toEqual(403);
  });
  test('error when channelId is invalid', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    requestChannelsCreateV2(token1, channelName1, true);
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    requestChannelsCreateV2(token2, channelName1, true);
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    requestChannelsCreateV2(token3, channelName3, false);
    expect(requestChannelLeaveV1(token1, 24726478)).toEqual(400);
  });
  test('memeber is not in the channel', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    requestChannelsCreateV2(token1, channelName1, true);
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    requestChannelsCreateV2(token2, channelName1, true);
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    const channelId3: number = requestChannelsCreateV2(token3, channelName3, false).channelId;
    expect(requestChannelLeaveV1(token2, channelId3)).toEqual(403);
  });
  test('correct output', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    const channelId2: number = requestChannelsCreateV2(token2, channelName1, true).channelId;
    requestChannelJoinV2(token1, channelId2);
    requestChannelLeaveV1(token1, channelId2);
    expect(requestChannelDetailsV2(token2, channelId2)).toStrictEqual(
      {
        name: channelName1,
        isPublic: true,
        ownerMembers: [],
        allMembers: [{
          uId: auth2.authUserId,
          email: email2,
          nameFirst: firstName2,
          nameLast: lastName2,
          handleStr: handle2,
          profileImgUrl: defaultPfpUrl
        }]
      }
    );
  });
});

describe('test channel addowner', () => {
  test('error when token is invalid', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    const uId1: number = auth1.authUserId;
    const channelId1: number = requestChannelsCreateV2(token1, channelName1, true).channelId;
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    requestChannelsCreateV2(token2, channelName1, true);
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    requestChannelsCreateV2(token3, channelName3, false);
    expect(requestChannelAddownerV1('grrrrr', channelId1, uId1)).toEqual(403);
  });
  test('error when channelId is invalid', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    const uId1: number = auth1.authUserId;
    requestChannelsCreateV2(token1, channelName1, true);
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    requestChannelsCreateV2(token2, channelName1, true);
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    requestChannelsCreateV2(token3, channelName3, false);
    expect(requestChannelAddownerV1(token1, 24726478, uId1)).toEqual(400);
  });
  test('uid is not in the channel', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    const uId1: number = auth1.authUserId;
    requestChannelsCreateV2(token1, channelName1, true);
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    requestChannelsCreateV2(token2, channelName1, true);
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    const channelId3: number = requestChannelsCreateV2(token3, channelName3, false).channelId;
    expect(requestChannelAddownerV1(token3, channelId3, uId1)).toEqual(400);
  });
  test('uid is alreay owner', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    requestChannelsCreateV2(token1, channelName1, true);
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    const uId2: number = auth2.authUserId;
    const channelId2: number = requestChannelsCreateV2(token2, channelName1, true).channelId;
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    requestChannelsCreateV2(token3, channelName3, false);
    expect(requestChannelAddownerV1(token2, channelId2, uId2)).toEqual(400);
  });
  test('token user does not have perms', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    requestChannelsCreateV2(token1, channelName1, true);
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    const uId2: number = auth2.authUserId;
    const channelId2: number = requestChannelsCreateV2(token2, channelName1, true).channelId;
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    requestChannelsCreateV2(token3, channelName3, false);
    expect(requestChannelAddownerV1(token3, channelId2, uId2)).toEqual(403);
  });
  test('correct output', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    const uId1: number = auth1.authUserId;
    requestChannelsCreateV2(token1, channelName1, true);
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    const uId2: number = auth2.authUserId;
    const channelId2: number = requestChannelsCreateV2(token2, channelName1, true).channelId;
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    requestChannelsCreateV2(token3, channelName3, false);
    requestChannelJoinV2(token1, channelId2);
    expect(requestChannelAddownerV1(token1, channelId2, uId1)).toStrictEqual(EMPTY);
    expect(requestChannelDetailsV2(token2, channelId2)).toStrictEqual(
      {
        name: channelName1,
        isPublic: true,
        ownerMembers: [{
          uId: uId2,
          email: email2,
          nameFirst: firstName2,
          nameLast: lastName2,
          handleStr: handle2,
          profileImgUrl: defaultPfpUrl
        }, {
          uId: uId1,
          email: email1,
          nameFirst: firstName1,
          nameLast: lastName1,
          handleStr: handle1,
          profileImgUrl: defaultPfpUrl
        }],
        allMembers: [{
          uId: uId2,
          email: email2,
          nameFirst: firstName2,
          nameLast: lastName2,
          handleStr: handle2,
          profileImgUrl: defaultPfpUrl
        }, {
          uId: uId1,
          email: email1,
          nameFirst: firstName1,
          nameLast: lastName1,
          handleStr: handle1,
          profileImgUrl: defaultPfpUrl
        }]
      }
    );
  });
});

describe('test channel remove owner', () => {
  test('error when token is invalid', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    const uId1: number = auth1.authUserId;
    const channelId1: number = requestChannelsCreateV2(token1, channelName1, true).channelId;
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    requestChannelsCreateV2(token2, channelName1, true);
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    requestChannelsCreateV2(token3, channelName3, false);
    expect(requestChannelRemoveownerV1('grrrrr', channelId1, uId1)).toEqual(403);
  });
  test('error when channelId is invalid', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    const uId1: number = auth1.authUserId;
    requestChannelsCreateV2(token1, channelName1, true);
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    requestChannelsCreateV2(token2, channelName1, true);
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    requestChannelsCreateV2(token3, channelName3, false);
    expect(requestChannelRemoveownerV1(token1, 24726478, uId1)).toEqual(400);
  });
  test('uid is not valid', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    requestChannelsCreateV2(token1, channelName1, true);
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    requestChannelsCreateV2(token2, channelName1, true);
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    const channelId3: number = requestChannelsCreateV2(token3, channelName3, false).channelId;
    expect(requestChannelRemoveownerV1(token3, channelId3, 6969)).toEqual(400);
    expect(requestChannelRemoveownerV1(token3, channelId3, auth1.authUserId)).toEqual(400);
  });
  test('uid is not an onwer', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    const uId1: number = auth1.authUserId;
    requestChannelsCreateV2(token1, channelName1, true);
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    const channelId2: number = requestChannelsCreateV2(token2, channelName1, true).channelId;
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    requestChannelsCreateV2(token3, channelName3, false);
    requestChannelJoinV2(token1, channelId2);
    expect(requestChannelRemoveownerV1(token2, channelId2, uId1)).toEqual(400);
  });
  test('token user does not have perms', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    requestChannelsCreateV2(token1, channelName1, true);
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    const uId2: number = auth2.authUserId;
    const channelId2: number = requestChannelsCreateV2(token2, channelName1, true).channelId;
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    requestChannelsCreateV2(token3, channelName3, false);
    expect(requestChannelRemoveownerV1(token3, channelId2, uId2)).toEqual(403);
  });
  test('uId is the only owner', () => {
    requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    const uId2: number = auth2.authUserId;
    const channelId2: number = requestChannelsCreateV2(token2, channelName1, true).channelId;
    requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    expect(requestChannelRemoveownerV1(token2, channelId2, uId2)).toEqual(400);
  });
  test('correct output', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    const uId1: number = auth1.authUserId;
    requestChannelsCreateV2(token1, channelName1, true);
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    const uId2: number = auth2.authUserId;
    const channelId2: number = requestChannelsCreateV2(token1, channelName2, true).channelId;
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    requestChannelsCreateV2(token3, channelName3, false);
    requestChannelInviteV2(token1, channelId2, uId2);
    requestChannelAddownerV1(token1, channelId2, uId2);
    expect(requestChannelRemoveownerV1(token2, channelId2, uId1)).toStrictEqual(EMPTY);
    expect(requestChannelDetailsV2(token2, channelId2)).toStrictEqual({

      name: channelName2,
      isPublic: true,
      ownerMembers: [{
        uId: uId2,
        email: email2,
        nameFirst: firstName2,
        nameLast: lastName2,
        handleStr: handle2,
        profileImgUrl: defaultPfpUrl
      }],
      allMembers: [{
        uId: uId1,
        email: email1,
        nameFirst: firstName1,
        nameLast: lastName1,
        handleStr: handle1,
        profileImgUrl: defaultPfpUrl
      },
      {
        uId: uId2,
        email: email2,
        nameFirst: firstName2,
        nameLast: lastName2,
        handleStr: handle2,
        profileImgUrl: defaultPfpUrl
      }]
    });
  });
});

describe('test channel messages', () => {
  test('error when token is invalid', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    const channelId1: number = requestChannelsCreateV2(token1, channelName1, true).channelId;
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    requestChannelsCreateV2(token2, channelName1, true);
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    requestChannelsCreateV2(token3, channelName3, true);
    for (let i = 0; i < 51; i++) {
      requestMessageSendV1(token1, channelId1, 'my name is Harambe and the recipe for elixir is.........');
    }
    expect(requestChannelMessagesV2('yeahhhh', channelId1, 1)).toEqual(403);
  });
  test('error when channel id is invalid', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    const channelId1: number = requestChannelsCreateV2(token1, channelName1, true).channelId;
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    requestChannelsCreateV2(token2, channelName1, true);
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    requestChannelsCreateV2(token3, channelName3, true);
    for (let i = 0; i < 51; i++) {
      requestMessageSendV1(token1, channelId1, 'my name is Harambe and the recipe for elixir is.........');
    }
    expect(requestChannelMessagesV2(token1, 16666, 1)).toEqual(400);
  });
  test('error when auth usr is not in channel', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    const channelId1: number = requestChannelsCreateV2(token1, channelName1, true).channelId;
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    requestChannelsCreateV2(token2, channelName1, true);
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    requestChannelsCreateV2(token3, channelName3, true);
    for (let i = 0; i < 51; i++) {
      requestMessageSendV1(token1, channelId1, 'my name is Harambe and the recipe for elixir is.........');
    }
    expect(requestChannelMessagesV2(token2, channelId1, 1)).toEqual(403);
  });
  test('error start param is higher than the amount of messages', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    const channelId1: number = requestChannelsCreateV2(token1, channelName1, true).channelId;
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    requestChannelsCreateV2(token2, channelName1, true);
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    requestChannelsCreateV2(token3, channelName3, true);
    for (let i = 0; i < 51; i++) {
      requestMessageSendV1(token1, channelId1, 'my name is Harambe and the recipe for elixir is.........');
    }
    expect(requestChannelMessagesV2(token1, channelId1, 100)).toEqual(400);
  });
  test('correct behaviour', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    const channelId1: number = requestChannelsCreateV2(token1, channelName1, true).channelId;
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    requestChannelsCreateV2(token2, channelName1, true);
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    requestChannelsCreateV2(token3, channelName3, true);
    for (let i = 0; i < 51; i++) {
      requestMessageSendV1(token1, channelId1, 'my name is Harambe and the recipe for elixir is.........');
    }
    expect(requestChannelMessagesV2(token1, channelId1, 0)).toStrictEqual(
      {
        messages: messageList,
        start: 0,
        end: 50
      }
    );
  });
  test('correct behaviour', () => {
    const auth1: {token: string, authUserId: number } = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const token1: string = auth1.token;
    const channelId1: number = requestChannelsCreateV2(token1, channelName1, true).channelId;
    const auth2: {token: string, authUserId: number } = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const token2: string = auth2.token;
    requestChannelsCreateV2(token2, channelName1, true);
    const auth3: {token: string, authUserId: number } = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const token3: string = auth3.token;
    requestChannelsCreateV2(token3, channelName3, true);
    for (let i = 0; i < 51; i++) {
      requestMessageSendV1(token1, channelId1, 'my name is Harambe and the recipe for elixir is.........');
    }
    expect(requestChannelMessagesV2(token1, channelId1, 50)).toStrictEqual(
      {
        messages: [{
          message: 'my name is Harambe and the recipe for elixir is.........',
          messageId: 51,
          timeSent: expect.any(Number),
          uId: expect.any(Number),
          reacts: [],
          isPinned: false
        }],
        start: 50,
        end: -1
      }
    );
  });
});
