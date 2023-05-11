import { requestAuthRegisterV2, requestChannelsCreateV2, requestChannelsListV2, requestChannelsListallV2 } from './helper';
import { requestClearV1 } from './helper';

beforeEach(() => {
  requestClearV1();
});
afterEach(() => {
  requestClearV1();
});

const invalidToken = 'smellyUnderwear';
const invalidName1 = 'supercalifragilisticexpialidocious';
const invalidName2 = '';
const invalidName3 = 'qwertyuiopasdfghjklzx';
const invalidName4 = 'qwertyuiopasdfghjklz';

const validName1 = 'COMP1531';
const validName2 = 'COMP1511';
const validName3 = 'Basketball';

// User #1
const email1 = 'danielfu@gmail.com';
const password1 = 'Hdwausd!3n';
const firstName1 = 'Daniel';
const lastName1 = 'Fu';

// User #2
const email2 = 'smellypoo@gmail.com';
const password2 = 'Jfd8274d@3';
const firstName2 = 'Tyrone';
const lastName2 = 'Smith';

// User #3
const email3 = 'minecraftman123@gmail.com';
const password3 = 'Poskdwu23!';
const firstName3 = 'Michael';
const lastName3 = 'Jordan';

describe('test channels create errors', () => {
  test('error when token is invalid', () => {
    expect(requestChannelsCreateV2(invalidToken, validName1, true)).toEqual(403);
  });
  test('error when name is long', () => {
    const token: string = requestAuthRegisterV2(email1, password1, firstName1, lastName1).token;
    expect(requestChannelsCreateV2(token, invalidName1, true)).toEqual(400);
  });
  test('error when name is too short', () => {
    const token: string = requestAuthRegisterV2(email1, password1, firstName1, lastName1).token;
    expect(requestChannelsCreateV2(token, invalidName2, true)).toEqual(400);
  });
  test('error when length of name is 21 characters', () => {
    const token: string = requestAuthRegisterV2(email1, password1, firstName1, lastName1).token;
    expect(requestChannelsCreateV2(token, invalidName3, true)).toEqual(400);
  });
  test('edge case when length of name is 20 characters', () => {
    const token: string = requestAuthRegisterV2(email1, password1, firstName1, lastName1).token;
    expect(requestChannelsCreateV2(token, invalidName4, true)).toStrictEqual({ channelId: expect.any(Number) });
  });
  test('valid input for all and creates a channel', () => {
    const token: string = requestAuthRegisterV2(email1, password1, firstName1, lastName1).token;
    expect(requestChannelsCreateV2(token, validName1, true)).toStrictEqual({ channelId: expect.any(Number) });
  });
});

describe('test channels list errors', () => {
  test('error when token is invalid', () => {
    expect(requestChannelsListV2(invalidToken)).toEqual(403);
  });
  test('valid token and lists channels user is part of', () => {
    const token1: string = requestAuthRegisterV2(email1, password1, firstName1, lastName1).token;
    const token2: string = requestAuthRegisterV2(email2, password2, firstName2, lastName2).token;
    const channelId1: number = requestChannelsCreateV2(token1, validName1, true).channelId;
    requestChannelsCreateV2(token2, validName2, true);
    expect(requestChannelsListV2(token1)).toStrictEqual({
      channels: [
        {
          channelId: channelId1,
          name: validName1
        }
      ]
    });
  });
});

describe('test channels list all errors', () => {
  test('error when token is invalid', () => {
    expect(requestChannelsListallV2(invalidToken)).toEqual(403);
  });
  test('valid token and lists all public channels', () => {
    const token1: string = requestAuthRegisterV2(email1, password1, firstName1, lastName1).token;
    const token2: string = requestAuthRegisterV2(email2, password2, firstName2, lastName2).token;
    const token3: string = requestAuthRegisterV2(email3, password3, firstName3, lastName3).token;
    const channelId1: number = requestChannelsCreateV2(token1, validName1, true).channelId;
    const channelId2: number = requestChannelsCreateV2(token2, validName2, true).channelId;
    const channelId3: number = requestChannelsCreateV2(token3, validName3, false).channelId;
    expect(requestChannelsListallV2(token1)).toStrictEqual({
      channels: [
        {
          channelId: channelId1,
          name: validName1
        },
        {
          channelId: channelId2,
          name: validName2
        },
        {
          channelId: channelId3,
          name: validName3
        }
      ]
    });
  });
});
