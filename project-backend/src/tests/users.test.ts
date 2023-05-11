import { requestAuthRegisterV2, requestAuthLoginV2, requestUserProfileV2, requestAuthLogoutV1, requestUsersAllV1, requestUserProfileSetnameV1, requestUserProfileSetemailV1, requestUserProfileSethandleV1, requestClearV1, requestChannelsCreateV2, requestGetUserStats, requestChannelJoinV2, requestChannelLeaveV1, requestDmCreate, requestDmLeave, requestDmRemove, requestMessageSendV1, requestDmSend, requestDmSendLater, requestMessageSendLater, requestStandupStartV1, requestStandupSendV1, requestGetUsersStats, requestMessageRemoveV1 } from './helper';
const sleep = require('atomic-sleep');
// had to use a require statement instead of import as import gave errors

beforeEach(() => {
  requestClearV1();
});

afterEach(() => {
  requestClearV1();
});

import config from '../config.json';

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

const defaultPfpUrl = `http://${HOST}:${PORT}/img/default.jpg`;

// declaring variable that will be used in tests
const invalidToken = 'smellyUnderwear';
const email1 = 'danielfu@gmail.com';
const password1 = 'Hdwausd!3n';
const firstName1 = 'Daniel';
const lastName1 = 'Fu';
const email2 = 'smellypoo@gmail.com';
const password2 = 'Jfd8274d@3';
const firstName2 = 'Tyrone';
const lastName2 = 'Smith';
const email3 = 'minecraftman123@gmail.com';
const password3 = 'Poskdwu23!';
const firstName3 = 'Michael';
const lastName3 = 'Jordan';
const handlestr1 = (firstName1 + lastName1).toLowerCase();
const handlestr2 = (firstName2 + lastName2).toLowerCase();
const handlestr3 = (firstName3 + lastName3).toLowerCase();

const invalidName2 = '';
const invalidName5 = 'g'.repeat(1000);
const validName4 = 'a'.repeat(50);
const handle1 = 'bobb';
const handle2 = 'ryg';
const handle3 = 'lalal';

const validName1 = 'COMP1531';
const validName2 = 'COMP1511';
const validName3 = 'Basketball';

describe('test for user/all/v1', () => {
  // test if invalid token request list
  test('error when token is invalid', () => {
    requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    expect(requestUsersAllV1(invalidToken)).toEqual(403);
  });

  // test when valid used request list
  test('valid input and lists all users', () => {
    const user1 = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const uId1: number = user1.authUserId;
    const uId2: number = requestAuthRegisterV2(email2, password2, firstName2, lastName2).authUserId;
    const uId3: number = requestAuthRegisterV2(email3, password3, firstName3, lastName3).authUserId;
    expect(requestUsersAllV1(user1.token)).toStrictEqual({
      users:
      [
        {
          uId: uId1,
          email: email1,
          nameFirst: firstName1,
          nameLast: lastName1,
          handleStr: handlestr1,
          profileImgUrl: defaultPfpUrl
        },
        {
          uId: uId2,
          email: email2,
          nameFirst: firstName2,
          nameLast: lastName2,
          handleStr: handlestr2,
          profileImgUrl: defaultPfpUrl
        },
        {
          uId: uId3,
          email: email3,
          nameFirst: firstName3,
          nameLast: lastName3,
          handleStr: handlestr3,
          profileImgUrl: defaultPfpUrl
        }
      ]
    }
    );
  });
});

describe('test for user profile', () => {
  // test for error edge cases
  test('empty user detail', () => {
    expect(requestUserProfileV2(invalidToken, 1)).toEqual(403);
  });

  test('check for not existing user when there are user registered', () => {
    const id = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    expect(requestUserProfileV2(id.token, id.authUserId + 1)).toEqual(400);
  });

  test('invalid token checking existing user', () => {
    const id = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    expect(requestUserProfileV2(id.token + 'c', id.authUserId)).toEqual(403);
  });

  test('error check for non existing user', () => {
    const id = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    expect(requestUserProfileV2(id.token, id.authUserId + 1)).toEqual(400);
  });

  test('user logged in and logged out invalid token', () => {
    const id = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    requestAuthLogoutV1(id.token);
    expect(requestUserProfileV2(id.token, id.authUserId)).toEqual(403);
  });

  // single user returning the correct details
  test('one user returned the correct detail', () => {
    const id = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    expect(requestUserProfileV2(id.token, id.authUserId)).toStrictEqual({
      user: {
        uId: id.authUserId,
        email: email1,
        nameFirst: firstName1,
        nameLast: lastName1,
        handleStr: expect.any(String),
        profileImgUrl: defaultPfpUrl
      }
    });
  });

  test('multiple user logged in and return the correct detail', () => {
    requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const id1 = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const id2 = requestAuthLoginV2(email2, password2);
    expect(requestUserProfileV2(id2.token, id1.authUserId)).toStrictEqual({
      user: {
        uId: id1.authUserId,
        email: email2,
        nameFirst: firstName2,
        nameLast: lastName2,
        handleStr: expect.any(String),
        profileImgUrl: defaultPfpUrl
      }
    });
  });
});

describe('test for user profile setname', () => {
  // test for error cases
  test('no users', () => {
    expect(requestUserProfileSetnameV1(invalidToken, firstName2, lastName2)).toEqual(403);
  });
  test('not existing token', () => {
    const id = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    expect(requestUserProfileSetnameV1(id.token + 'c', firstName2, lastName2)).toEqual(403);
  });

  test('invalid token due to log out', () => {
    const id = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    requestAuthLogoutV1(id.token);
    expect(requestUserProfileSetnameV1(id.token, firstName2, lastName2)).toEqual(403);
  });

  test('invalid name length', () => {
    const id = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    expect(requestUserProfileSetnameV1(id.token, invalidName5, lastName1)).toEqual(400);
    expect(requestUserProfileSetnameV1(id.token, firstName1, invalidName5)).toEqual(400);
    expect(requestUserProfileSetnameV1(id.token, invalidName2, lastName1)).toEqual(400);
    expect(requestUserProfileSetnameV1(id.token, firstName1, invalidName2)).toEqual(400);
  });

  // test edge case at exactly 50 characters
  test('valid name length at exactly 50 characters', () => {
    const id = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    expect(requestUserProfileSetnameV1(id.token, validName4, lastName2)).toStrictEqual({});
    expect(requestUserProfileV2(id.token, id.authUserId)).toStrictEqual({
      user: {
        uId: id.authUserId,
        email: email1,
        nameFirst: validName4,
        nameLast: lastName2,
        handleStr: expect.any(String),
        profileImgUrl: defaultPfpUrl
      }
    });
    requestUserProfileSetnameV1(id.token, firstName2, validName4);
    expect(requestUserProfileV2(id.token, id.authUserId)).toStrictEqual({
      user: {
        uId: id.authUserId,
        email: email1,
        nameFirst: firstName2,
        nameLast: validName4,
        handleStr: expect.any(String),
        profileImgUrl: defaultPfpUrl
      }
    });
  });

  // test when a huge amount of people changing names
  test('multiple people all changing names', () => {
    const id1 = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const id2 = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const id3 = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    expect(requestUserProfileSetnameV1(id1.token, validName4, validName1)).toStrictEqual({});
    expect(requestUserProfileV2(id3.token, id1.authUserId)).toStrictEqual({
      user: {
        uId: id1.authUserId,
        email: email1,
        nameFirst: validName4,
        nameLast: validName1,
        handleStr: expect.any(String),
        profileImgUrl: defaultPfpUrl
      }
    });
    requestUserProfileSetnameV1(id3.token, validName2, validName3);
    expect(requestUserProfileV2(id2.token, id3.authUserId)).toStrictEqual({
      user: {
        uId: id3.authUserId,
        email: email3,
        nameFirst: validName2,
        nameLast: validName3,
        handleStr: expect.any(String),
        profileImgUrl: defaultPfpUrl
      }
    });
  });
});

describe('test for user set email', () => {
  // test for error returns
  test('no users', () => {
    expect(requestUserProfileSetemailV1(invalidToken, email1)).toEqual(403);
  });
  test('non existing token', () => {
    const id = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    expect(requestUserProfileSetemailV1(id.token + 'c', email2)).toEqual(403);
  });

  test('invalid token due to log out', () => {
    const id = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    requestAuthLogoutV1(id.token);
    expect(requestUserProfileSetemailV1(id.token, email2)).toEqual(403);
  });

  test.each([
    { email: '' },
    { email: 'comp1531' },
    { email: 'email@unsw' },
    { email: '@example.com' },
    { email: 'paul@.com' },
    { email: 'Abc.example.com' },
    { email: 'this is"not//[] allowed@example.com' },
    { email: 'just"not"right@example.com' },
  ])("Invalid email '$email'", ({ email }) => {
    const id = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    expect(requestUserProfileSetemailV1(id.token, email)).toEqual(400);
  });

  test('changed email already used by someone else', () => {
    requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const id = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    expect(requestUserProfileSetemailV1(id.token, email1)).toEqual(400);
  });

  // test when new person sets new email
  test('set single person new email', () => {
    const id = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    expect(requestUserProfileSetemailV1(id.token, email2)).toStrictEqual({});
    expect(requestUserProfileV2(id.token, id.authUserId)).toStrictEqual({
      user: {
        uId: id.authUserId,
        email: email2,
        nameFirst: firstName1,
        nameLast: lastName1,
        handleStr: expect.any(String),
        profileImgUrl: defaultPfpUrl
      }
    });
  });

  test('set multiple person getting multiple new email', () => {
    const id1 = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const id2 = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    requestUserProfileSetemailV1(id1.token, email3);
    expect(requestUserProfileV2(id2.token, id1.authUserId)).toStrictEqual({
      user: {
        uId: id1.authUserId,
        email: email3,
        nameFirst: firstName1,
        nameLast: lastName1,
        handleStr: expect.any(String),
        profileImgUrl: defaultPfpUrl
      }
    });
    requestUserProfileSetemailV1(id2.token, email1);
    expect(requestUserProfileV2(id1.token, id2.authUserId)).toStrictEqual({
      user: {
        uId: id2.authUserId,
        email: email1,
        nameFirst: firstName2,
        nameLast: lastName2,
        handleStr: expect.any(String),
        profileImgUrl: defaultPfpUrl
      }
    });
  });
});

describe('test for user set handle string', () => {
  // test for error returns
  test('no users existing', () => {
    expect(requestUserProfileSethandleV1(invalidToken, handle1)).toEqual(403);
  });
  test('non existing token', () => {
    const id = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    expect(requestUserProfileSethandleV1(id.token + 'c', handle1)).toEqual(403);
  });

  test('invalid token due to log out', () => {
    const id = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    requestAuthLogoutV1(id.token);
    expect(requestUserProfileSethandleV1(id.token, handle1)).toEqual(403);
  });

  test.each([
    { handle: '' },
    { handle: '{unicorns}' },
    { handle: '*unicorns' },
    { handle: '!@#$%^&*' },
    { handle: '{}[]+=_-?><' },
    { handle: 'a' },
    { handle: 'ab' },
    { handle: 'handleStrlongerthan20' },
  ])("Invalid handle '$handle'", ({ handle }) => {
    const id = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    expect(requestUserProfileSethandleV1(id.token, handle)).toEqual(400);
  });

  test('set single person new handle string', () => {
    const id = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    expect(requestUserProfileSethandleV1(id.token, handle2)).toStrictEqual({});
    expect(requestUserProfileV2(id.token, id.authUserId)).toStrictEqual({
      user: {
        uId: id.authUserId,
        email: email1,
        nameFirst: firstName1,
        nameLast: lastName1,
        handleStr: handle2,
        profileImgUrl: defaultPfpUrl
      }
    });
  });

  test('set handle string taken by someone existing', () => {
    const id1 = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const id2 = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    expect(requestUserProfileSethandleV1(id1.token, handle3)).toStrictEqual({});
    expect(requestUserProfileSethandleV1(id2.token, handle3)).toEqual(400);
  });

  test('set multiple person getting multiple new email', () => {
    const id1 = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const id2 = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const id3 = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    requestUserProfileSethandleV1(id1.token, handle3);

    // sets person 1 to handle 3 then change it to handle 1, change person 3 to take handle 3 after change
    expect(requestUserProfileV2(id2.token, id1.authUserId)).toStrictEqual({
      user: {
        uId: id1.authUserId,
        email: email1,
        nameFirst: firstName1,
        nameLast: lastName1,
        handleStr: handle3,
        profileImgUrl: defaultPfpUrl
      }
    });
    requestUserProfileSethandleV1(id1.token, handle1);
    requestUserProfileSethandleV1(id3.token, handle3);
    expect(requestUserProfileV2(id1.token, id3.authUserId)).toStrictEqual({
      user: {
        uId: id3.authUserId,
        email: email3,
        nameFirst: firstName3,
        nameLast: lastName3,
        handleStr: handle3,
        profileImgUrl: defaultPfpUrl
      }
    });
  });
});

const channelName = 'bob';
const stdMsg = 'hi';
describe('test userStats channel functionality', () => {
  test('error when invalid token', () => {
    expect(requestGetUserStats(invalidToken)).toStrictEqual(403);
  });
  test('correct output', () => {
    const id1 = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const id2 = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const id3 = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    requestChannelsCreateV2(id1.token, channelName, true);
    const cId = requestChannelsCreateV2(id2.token, channelName + 'l', true);
    expect(requestGetUserStats(id1.token)).toStrictEqual({
      userStats: {
        channelsJoined: [{
          numChannelsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsJoined: 1,
          timeStamp: expect.any(Number)
        }],
        dmsJoined: [{
          numDmsJoined: 0,
          timeStamp: expect.any(Number)
        }],
        messagesSent: [{
          numMessagesSent: 0,
          timeStamp: expect.any(Number)
        }],
        involvementRate: 0.5
      }
    });
    requestChannelJoinV2(id1.token, cId.channelId);
    expect(requestGetUserStats(id1.token)).toStrictEqual({
      userStats: {
        channelsJoined: [{
          numChannelsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsJoined: 1,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsJoined: 2,
          timeStamp: expect.any(Number)
        }],
        dmsJoined: [{
          numDmsJoined: 0,
          timeStamp: expect.any(Number)
        }],
        messagesSent: [{
          numMessagesSent: 0,
          timeStamp: expect.any(Number)
        }],
        involvementRate: 1
      }
    });
    requestChannelLeaveV1(id1.token, cId.channelId);
    expect(requestGetUserStats(id1.token)).toStrictEqual({
      userStats: {
        channelsJoined: [{
          numChannelsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsJoined: 1,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsJoined: 2,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsJoined: 1,
          timeStamp: expect.any(Number)
        }],
        dmsJoined: [{
          numDmsJoined: 0,
          timeStamp: expect.any(Number)
        }],
        messagesSent: [{
          numMessagesSent: 0,
          timeStamp: expect.any(Number)
        }],
        involvementRate: 0.5
      }
    });
    requestChannelJoinV2(id1.token, cId.channelId);
    expect(requestGetUserStats(id1.token)).toStrictEqual({
      userStats: {
        channelsJoined: [{
          numChannelsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsJoined: 1,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsJoined: 2,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsJoined: 1,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsJoined: 2,
          timeStamp: expect.any(Number)
        }],
        dmsJoined: [{
          numDmsJoined: 0,
          timeStamp: expect.any(Number)
        }],
        messagesSent: [{
          numMessagesSent: 0,
          timeStamp: expect.any(Number)
        }],
        involvementRate: 1
      }
    });
    const cId2 = requestChannelsCreateV2(id3.token, channelName + 'hi', true);
    requestChannelsCreateV2(id2.token, channelName + 'hih', true);
    requestChannelJoinV2(id1.token, cId2.channelId);
    expect(requestGetUserStats(id1.token)).toStrictEqual({
      userStats: {
        channelsJoined: [{
          numChannelsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsJoined: 1,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsJoined: 2,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsJoined: 1,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsJoined: 2,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsJoined: 3,
          timeStamp: expect.any(Number)
        }],
        dmsJoined: [{
          numDmsJoined: 0,
          timeStamp: expect.any(Number)
        }],
        messagesSent: [{
          numMessagesSent: 0,
          timeStamp: expect.any(Number)
        }],
        involvementRate: 0.75
      }
    });
  });
  test('correct output dms', () => {
    const id1 = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const id2 = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const id3 = requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    const uIds: number[] = [id2.authUserId];
    const uIds2: number[] = [id1.authUserId];
    const dmId = requestDmCreate(id1.token, uIds).dmId;
    const dmId2 = requestDmCreate(id2.token, uIds2).dmId;
    expect(requestGetUserStats(id1.token)).toStrictEqual({
      userStats: {
        channelsJoined: [{
          numChannelsJoined: 0,
          timeStamp: expect.any(Number)
        }],
        dmsJoined: [{
          numDmsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 1,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 2,
          timeStamp: expect.any(Number)
        }],
        messagesSent: [{
          numMessagesSent: 0,
          timeStamp: expect.any(Number)
        }],
        involvementRate: 1
      }
    });
    requestDmLeave(id1.token, dmId);
    expect(requestGetUserStats(id1.token)).toStrictEqual({
      userStats: {
        channelsJoined: [{
          numChannelsJoined: 0,
          timeStamp: expect.any(Number)
        }],
        dmsJoined: [{
          numDmsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 1,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 2,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 1,
          timeStamp: expect.any(Number)
        }],
        messagesSent: [{
          numMessagesSent: 0,
          timeStamp: expect.any(Number)
        }],
        involvementRate: 0.5
      }
    });
    requestDmLeave(id1.token, dmId2);
    expect(requestGetUserStats(id1.token)).toStrictEqual({
      userStats: {
        channelsJoined: [{
          numChannelsJoined: 0,
          timeStamp: expect.any(Number)
        }],
        dmsJoined: [{
          numDmsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 1,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 2,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 1,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 0,
          timeStamp: expect.any(Number)
        }],
        messagesSent: [{
          numMessagesSent: 0,
          timeStamp: expect.any(Number)
        }],
        involvementRate: 0
      }
    });
    const dmId3 = requestDmCreate(id3.token, uIds2).dmId;
    expect(requestGetUserStats(id3.token)).toStrictEqual({
      userStats: {
        channelsJoined: [{
          numChannelsJoined: 0,
          timeStamp: expect.any(Number)
        }],
        dmsJoined: [{
          numDmsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 1,
          timeStamp: expect.any(Number)
        }],
        messagesSent: [{
          numMessagesSent: 0,
          timeStamp: expect.any(Number)
        }],
        involvementRate: (1 / 3)
      }
    });
    requestDmRemove(id3.token, dmId3);
    expect(requestGetUserStats(id1.token)).toStrictEqual({
      userStats: {
        channelsJoined: [{
          numChannelsJoined: 0,
          timeStamp: expect.any(Number)
        }],
        dmsJoined: [{
          numDmsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 1,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 2,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 1,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 1,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 0,
          timeStamp: expect.any(Number)
        }],
        messagesSent: [{
          numMessagesSent: 0,
          timeStamp: expect.any(Number)
        }],
        involvementRate: 0
      }
    });
    expect(requestGetUserStats(id3.token)).toStrictEqual({
      userStats: {
        channelsJoined: [{
          numChannelsJoined: 0,
          timeStamp: expect.any(Number)
        }],
        dmsJoined: [{
          numDmsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 1,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 0,
          timeStamp: expect.any(Number)
        }],
        messagesSent: [{
          numMessagesSent: 0,
          timeStamp: expect.any(Number)
        }],
        involvementRate: 0
      }
    });
  });
  test('correct messages output', () => {
    const id1 = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const id2 = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const uIds: number[] = [id2.authUserId];
    const uIds2: number[] = [id1.authUserId];
    const dmId = requestDmCreate(id1.token, uIds).dmId;
    requestDmCreate(id2.token, uIds2);
    const cId = requestChannelsCreateV2(id1.token, channelName, true).channelId;
    const cId2 = requestChannelsCreateV2(id2.token, channelName + 'l', true).channelId;
    expect(requestGetUserStats(id1.token)).toStrictEqual({
      userStats: {
        channelsJoined: [{
          numChannelsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsJoined: 1,
          timeStamp: expect.any(Number)
        }],
        dmsJoined: [{
          numDmsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 1,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 2,
          timeStamp: expect.any(Number)
        }],
        messagesSent: [{
          numMessagesSent: 0,
          timeStamp: expect.any(Number)
        }],
        involvementRate: 0.75
      }
    });
    expect(requestGetUserStats(id2.token)).toStrictEqual({
      userStats: {
        channelsJoined: [{
          numChannelsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsJoined: 1,
          timeStamp: expect.any(Number)
        }],
        dmsJoined: [{
          numDmsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 1,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 2,
          timeStamp: expect.any(Number)
        }],
        messagesSent: [{
          numMessagesSent: 0,
          timeStamp: expect.any(Number)
        }],
        involvementRate: 0.75
      }
    });
    requestMessageSendV1(id1.token, cId, stdMsg);
    expect(requestGetUserStats(id1.token)).toStrictEqual({
      userStats: {
        channelsJoined: [{
          numChannelsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsJoined: 1,
          timeStamp: expect.any(Number)
        }],
        dmsJoined: [{
          numDmsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 1,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 2,
          timeStamp: expect.any(Number)
        }],
        messagesSent: [{
          numMessagesSent: 0,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 1,
          timeStamp: expect.any(Number)
        }],
        involvementRate: (4 / 5)
      }
    });
    requestDmSend(id1.token, dmId, stdMsg);
    expect(requestGetUserStats(id1.token)).toStrictEqual({
      userStats: {
        channelsJoined: [{
          numChannelsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsJoined: 1,
          timeStamp: expect.any(Number)
        }],
        dmsJoined: [{
          numDmsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 1,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 2,
          timeStamp: expect.any(Number)
        }],
        messagesSent: [{
          numMessagesSent: 0,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 1,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 2,
          timeStamp: expect.any(Number)
        }],
        involvementRate: (5 / 6)
      }
    });
    requestDmSendLater(id1.token, dmId, stdMsg, Math.floor(Date.now() / 1000) + 5);
    sleep(10000);
    expect(requestGetUserStats(id1.token)).toStrictEqual({
      userStats: {
        channelsJoined: [{
          numChannelsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsJoined: 1,
          timeStamp: expect.any(Number)
        }],
        dmsJoined: [{
          numDmsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 1,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 2,
          timeStamp: expect.any(Number)
        }],
        messagesSent: [{
          numMessagesSent: 0,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 1,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 2,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 3,
          timeStamp: expect.any(Number)
        }],
        involvementRate: (6 / 7)
      }
    });
    requestMessageSendLater(id1.token, cId, stdMsg, Math.floor(Date.now() / 1000) + 5);
    sleep(10000);
    expect(requestGetUserStats(id1.token)).toStrictEqual({
      userStats: {
        channelsJoined: [{
          numChannelsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsJoined: 1,
          timeStamp: expect.any(Number)
        }],
        dmsJoined: [{
          numDmsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 1,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 2,
          timeStamp: expect.any(Number)
        }],
        messagesSent: [{
          numMessagesSent: 0,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 1,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 2,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 3,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 4,
          timeStamp: expect.any(Number)
        }],
        involvementRate: (7 / 8)
      }
    });
    requestStandupStartV1(id1.token, cId, 2);
    requestStandupSendV1(id1.token, cId, stdMsg);
    requestStandupSendV1(id1.token, cId, stdMsg);
    requestStandupSendV1(id1.token, cId, stdMsg);
    sleep(7000);
    expect(requestGetUserStats(id1.token)).toStrictEqual({
      userStats: {
        channelsJoined: [{
          numChannelsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsJoined: 1,
          timeStamp: expect.any(Number)
        }],
        dmsJoined: [{
          numDmsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 1,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 2,
          timeStamp: expect.any(Number)
        }],
        messagesSent: [{
          numMessagesSent: 0,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 1,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 2,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 3,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 4,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 5,
          timeStamp: expect.any(Number)
        }],
        involvementRate: (8 / 9)
      }
    });
    const mId = requestMessageSendV1(id2.token, cId2, stdMsg).messageId;
    expect(requestGetUserStats(id1.token)).toStrictEqual({
      userStats: {
        channelsJoined: [{
          numChannelsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsJoined: 1,
          timeStamp: expect.any(Number)
        }],
        dmsJoined: [{
          numDmsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 1,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 2,
          timeStamp: expect.any(Number)
        }],
        messagesSent: [{
          numMessagesSent: 0,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 1,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 2,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 3,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 4,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 5,
          timeStamp: expect.any(Number)
        }],
        involvementRate: (8 / 10)
      }
    });
    expect(requestGetUserStats(id2.token)).toStrictEqual({
      userStats: {
        channelsJoined: [{
          numChannelsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsJoined: 1,
          timeStamp: expect.any(Number)
        }],
        dmsJoined: [{
          numDmsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 1,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 2,
          timeStamp: expect.any(Number)
        }],
        messagesSent: [{
          numMessagesSent: 0,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 1,
          timeStamp: expect.any(Number)
        }],
        involvementRate: (4 / 10)
      }
    });
    requestMessageRemoveV1(id2.token, mId);
    expect(requestGetUserStats(id1.token)).toStrictEqual({
      userStats: {
        channelsJoined: [{
          numChannelsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsJoined: 1,
          timeStamp: expect.any(Number)
        }],
        dmsJoined: [{
          numDmsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 1,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 2,
          timeStamp: expect.any(Number)
        }],
        messagesSent: [{
          numMessagesSent: 0,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 1,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 2,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 3,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 4,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 5,
          timeStamp: expect.any(Number)
        }],
        involvementRate: (8 / 9)
      }
    });
    expect(requestGetUserStats(id2.token)).toStrictEqual({
      userStats: {
        channelsJoined: [{
          numChannelsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsJoined: 1,
          timeStamp: expect.any(Number)
        }],
        dmsJoined: [{
          numDmsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 1,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 2,
          timeStamp: expect.any(Number)
        }],
        messagesSent: [{
          numMessagesSent: 0,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 1,
          timeStamp: expect.any(Number)
        }],
        involvementRate: (4 / 9)
      }
    });
    requestDmSend(id2.token, dmId, stdMsg);
    expect(requestGetUserStats(id2.token)).toStrictEqual({
      userStats:
      {
        channelsJoined: [{
          numChannelsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsJoined: 1,
          timeStamp: expect.any(Number)
        }],
        dmsJoined: [{
          numDmsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 1,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 2,
          timeStamp: expect.any(Number)
        }],
        messagesSent: [{
          numMessagesSent: 0,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 1,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 2,
          timeStamp: expect.any(Number)
        }],
        involvementRate: (5 / 10)
      }
    });
    requestDmRemove(id1.token, dmId);
    expect(requestGetUserStats(id2.token)).toStrictEqual({
      userStats:
      {
        channelsJoined: [{
          numChannelsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsJoined: 1,
          timeStamp: expect.any(Number)
        }],
        dmsJoined: [{
          numDmsJoined: 0,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 1,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 2,
          timeStamp: expect.any(Number)
        },
        {
          numDmsJoined: 1,
          timeStamp: expect.any(Number)
        }],
        messagesSent: [{
          numMessagesSent: 0,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 1,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesSent: 2,
          timeStamp: expect.any(Number)
        }],
        involvementRate: (4 / 6)
      }
    });
  });
  test('correct timestamps', () => {
    let timeBefore = Math.floor(Date.now() / 1000);
    const id1 = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    sleep(500);
    let timeAfter = Math.floor(Date.now() / 1000);
    expect(requestGetUserStats(id1.token).userStats.channelsJoined[0].timeStamp).toBeGreaterThanOrEqual(timeBefore);
    expect(requestGetUserStats(id1.token).userStats.channelsJoined[0].timeStamp).toBeLessThanOrEqual(timeAfter);
    expect(requestGetUserStats(id1.token).userStats.dmsJoined[0].timeStamp).toBeGreaterThanOrEqual(timeBefore);
    expect(requestGetUserStats(id1.token).userStats.dmsJoined[0].timeStamp).toBeLessThanOrEqual(timeAfter);
    expect(requestGetUserStats(id1.token).userStats.messagesSent[0].timeStamp).toBeGreaterThanOrEqual(timeBefore);
    expect(requestGetUserStats(id1.token).userStats.messagesSent[0].timeStamp).toBeLessThanOrEqual(timeAfter);
    const id2 = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const uIds: number[] = [id2.authUserId];
    timeBefore = Math.floor(Date.now() / 1000);
    requestDmCreate(id1.token, uIds);
    const cId = requestChannelsCreateV2(id1.token, channelName, true).channelId;
    sleep(500);
    timeAfter = Math.floor(Date.now() / 1000);
    expect(requestGetUserStats(id1.token).userStats.channelsJoined[1].timeStamp).toBeGreaterThanOrEqual(timeBefore);
    expect(requestGetUserStats(id1.token).userStats.channelsJoined[1].timeStamp).toBeLessThanOrEqual(timeAfter);
    expect(requestGetUserStats(id1.token).userStats.dmsJoined[1].timeStamp).toBeGreaterThanOrEqual(timeBefore);
    expect(requestGetUserStats(id1.token).userStats.dmsJoined[1].timeStamp).toBeLessThanOrEqual(timeAfter);
    timeBefore = Math.floor(Date.now() / 1000);
    requestMessageSendV1(id1.token, cId, stdMsg);
    sleep(500);
    timeAfter = Math.floor(Date.now() / 1000);
    expect(requestGetUserStats(id1.token).userStats.messagesSent[1].timeStamp).toBeGreaterThanOrEqual(timeBefore);
    expect(requestGetUserStats(id1.token).userStats.messagesSent[1].timeStamp).toBeLessThanOrEqual(timeAfter);
  });
});

describe('test users stats', () => {
  test('error when invalid token', () => {
    expect(requestGetUsersStats(invalidToken)).toStrictEqual(403);
  });
  test('correct utilisation', () => {
    const id1 = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const id2 = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const uIds: number[] = [id2.authUserId];
    const uIds2: number[] = [id1.authUserId];
    requestDmCreate(id1.token, uIds);
    requestDmCreate(id2.token, uIds2);
    expect(requestGetUsersStats(id1.token)).toStrictEqual({
      workspaceStats: {
        channelsExist: [{
          numChannelsExist: 0,
          timeStamp: expect.any(Number)
        }],
        dmsExist: [{
          numDmsExist: 0,
          timeStamp: expect.any(Number)
        },
        {
          numDmsExist: 1,
          timeStamp: expect.any(Number)
        },
        {
          numDmsExist: 2,
          timeStamp: expect.any(Number)
        }],
        messagesExist: [{
          numMessagesExist: 0,
          timeStamp: expect.any(Number)
        }],
        utilizationRate: 1
      }
    });
    requestChannelsCreateV2(id1.token, channelName, true);
    requestChannelsCreateV2(id2.token, channelName + 'l', true);
    expect(requestGetUsersStats(id1.token)).toStrictEqual({
      workspaceStats: {
        channelsExist: [{
          numChannelsExist: 0,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsExist: 1,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsExist: 2,
          timeStamp: expect.any(Number)
        }],
        dmsExist: [{
          numDmsExist: 0,
          timeStamp: expect.any(Number)
        },
        {
          numDmsExist: 1,
          timeStamp: expect.any(Number)
        },
        {
          numDmsExist: 2,
          timeStamp: expect.any(Number)
        }],
        messagesExist: [{
          numMessagesExist: 0,
          timeStamp: expect.any(Number)
        }],
        utilizationRate: 1
      }
    });
    requestAuthRegisterV2(email3, password3, firstName3, lastName3);
    expect(requestGetUsersStats(id1.token)).toStrictEqual({
      workspaceStats: {
        channelsExist: [{
          numChannelsExist: 0,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsExist: 1,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsExist: 2,
          timeStamp: expect.any(Number)
        }],
        dmsExist: [{
          numDmsExist: 0,
          timeStamp: expect.any(Number)
        },
        {
          numDmsExist: 1,
          timeStamp: expect.any(Number)
        },
        {
          numDmsExist: 2,
          timeStamp: expect.any(Number)
        }],
        messagesExist: [{
          numMessagesExist: 0,
          timeStamp: expect.any(Number)
        }],
        utilizationRate: (2 / 3)
      }
    });
  });
  test('messages exist functionality', () => {
    const id1 = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    const id2 = requestAuthRegisterV2(email2, password2, firstName2, lastName2);
    const uIds: number[] = [id2.authUserId];
    const uIds2: number[] = [id1.authUserId];
    const dmId2 = requestDmCreate(id1.token, uIds).dmId;
    const dmId = requestDmCreate(id2.token, uIds2).dmId;
    expect(requestGetUsersStats(id1.token)).toStrictEqual({
      workspaceStats: {
        channelsExist: [{
          numChannelsExist: 0,
          timeStamp: expect.any(Number)
        }],
        dmsExist: [{
          numDmsExist: 0,
          timeStamp: expect.any(Number)
        },
        {
          numDmsExist: 1,
          timeStamp: expect.any(Number)
        },
        {
          numDmsExist: 2,
          timeStamp: expect.any(Number)
        }],
        messagesExist: [{
          numMessagesExist: 0,
          timeStamp: expect.any(Number)
        }],
        utilizationRate: 1
      }
    });
    const cId = requestChannelsCreateV2(id1.token, channelName, true).channelId;
    requestChannelsCreateV2(id2.token, channelName + 'l', true);
    expect(requestGetUsersStats(id1.token)).toStrictEqual({
      workspaceStats: {
        channelsExist: [{
          numChannelsExist: 0,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsExist: 1,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsExist: 2,
          timeStamp: expect.any(Number)
        }],
        dmsExist: [{
          numDmsExist: 0,
          timeStamp: expect.any(Number)
        },
        {
          numDmsExist: 1,
          timeStamp: expect.any(Number)
        },
        {
          numDmsExist: 2,
          timeStamp: expect.any(Number)
        }],
        messagesExist: [{
          numMessagesExist: 0,
          timeStamp: expect.any(Number)
        }],
        utilizationRate: 1
      }
    });
    requestDmSend(id2.token, dmId, stdMsg);
    requestDmSend(id2.token, dmId, stdMsg);
    requestDmSendLater(id1.token, dmId, stdMsg, Math.floor(Date.now() / 1000) + 5);
    expect(requestGetUsersStats(id1.token)).toStrictEqual({
      workspaceStats: {
        channelsExist: [{
          numChannelsExist: 0,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsExist: 1,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsExist: 2,
          timeStamp: expect.any(Number)
        }],
        dmsExist: [{
          numDmsExist: 0,
          timeStamp: expect.any(Number)
        },
        {
          numDmsExist: 1,
          timeStamp: expect.any(Number)
        },
        {
          numDmsExist: 2,
          timeStamp: expect.any(Number)
        }],
        messagesExist: [{
          numMessagesExist: 0,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 1,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 2,
          timeStamp: expect.any(Number)
        }],
        utilizationRate: 1
      }
    });
    sleep(10000);
    expect(requestGetUsersStats(id1.token)).toStrictEqual({
      workspaceStats: {
        channelsExist: [{
          numChannelsExist: 0,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsExist: 1,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsExist: 2,
          timeStamp: expect.any(Number)
        }],
        dmsExist: [{
          numDmsExist: 0,
          timeStamp: expect.any(Number)
        },
        {
          numDmsExist: 1,
          timeStamp: expect.any(Number)
        },
        {
          numDmsExist: 2,
          timeStamp: expect.any(Number)
        }],
        messagesExist: [{
          numMessagesExist: 0,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 1,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 2,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 3,
          timeStamp: expect.any(Number)
        }],
        utilizationRate: 1
      }
    });
    requestDmRemove(id2.token, dmId);
    expect(requestGetUsersStats(id1.token)).toStrictEqual({
      workspaceStats: {
        channelsExist: [{
          numChannelsExist: 0,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsExist: 1,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsExist: 2,
          timeStamp: expect.any(Number)
        }],
        dmsExist: [{
          numDmsExist: 0,
          timeStamp: expect.any(Number)
        },
        {
          numDmsExist: 1,
          timeStamp: expect.any(Number)
        },
        {
          numDmsExist: 2,
          timeStamp: expect.any(Number)
        },
        {
          numDmsExist: 1,
          timeStamp: expect.any(Number)
        }],
        messagesExist: [{
          numMessagesExist: 0,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 1,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 2,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 3,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 0,
          timeStamp: expect.any(Number)
        }],
        utilizationRate: 1
      }
    });
    const mId = requestDmSend(id2.token, dmId2, stdMsg);
    expect(requestGetUsersStats(id1.token)).toStrictEqual({
      workspaceStats: {
        channelsExist: [{
          numChannelsExist: 0,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsExist: 1,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsExist: 2,
          timeStamp: expect.any(Number)
        }],
        dmsExist: [{
          numDmsExist: 0,
          timeStamp: expect.any(Number)
        },
        {
          numDmsExist: 1,
          timeStamp: expect.any(Number)
        },
        {
          numDmsExist: 2,
          timeStamp: expect.any(Number)
        },
        {
          numDmsExist: 1,
          timeStamp: expect.any(Number)
        }],
        messagesExist: [{
          numMessagesExist: 0,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 1,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 2,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 3,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 0,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 1,
          timeStamp: expect.any(Number)
        }],
        utilizationRate: 1
      }
    });
    const mId2 = requestMessageSendV1(id1.token, cId, stdMsg);
    requestMessageSendLater(id1.token, cId, stdMsg, Math.floor(Date.now() / 1000) + 5);
    expect(requestGetUsersStats(id1.token)).toStrictEqual({
      workspaceStats: {
        channelsExist: [{
          numChannelsExist: 0,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsExist: 1,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsExist: 2,
          timeStamp: expect.any(Number)
        }],
        dmsExist: [{
          numDmsExist: 0,
          timeStamp: expect.any(Number)
        },
        {
          numDmsExist: 1,
          timeStamp: expect.any(Number)
        },
        {
          numDmsExist: 2,
          timeStamp: expect.any(Number)
        },
        {
          numDmsExist: 1,
          timeStamp: expect.any(Number)
        }],
        messagesExist: [{
          numMessagesExist: 0,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 1,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 2,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 3,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 0,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 1,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 2,
          timeStamp: expect.any(Number)
        }],
        utilizationRate: 1
      }
    });
    sleep(10000);
    expect(requestGetUsersStats(id1.token)).toStrictEqual({
      workspaceStats: {
        channelsExist: [{
          numChannelsExist: 0,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsExist: 1,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsExist: 2,
          timeStamp: expect.any(Number)
        }],
        dmsExist: [{
          numDmsExist: 0,
          timeStamp: expect.any(Number)
        },
        {
          numDmsExist: 1,
          timeStamp: expect.any(Number)
        },
        {
          numDmsExist: 2,
          timeStamp: expect.any(Number)
        },
        {
          numDmsExist: 1,
          timeStamp: expect.any(Number)
        }],
        messagesExist: [{
          numMessagesExist: 0,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 1,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 2,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 3,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 0,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 1,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 2,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 3,
          timeStamp: expect.any(Number)
        }],
        utilizationRate: 1
      }
    });
    requestMessageRemoveV1(id2.token, mId.messageId);
    requestMessageRemoveV1(id1.token, mId2.messageId);
    expect(requestGetUsersStats(id1.token)).toStrictEqual({
      workspaceStats: {
        channelsExist: [{
          numChannelsExist: 0,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsExist: 1,
          timeStamp: expect.any(Number)
        },
        {
          numChannelsExist: 2,
          timeStamp: expect.any(Number)
        }],
        dmsExist: [{
          numDmsExist: 0,
          timeStamp: expect.any(Number)
        },
        {
          numDmsExist: 1,
          timeStamp: expect.any(Number)
        },
        {
          numDmsExist: 2,
          timeStamp: expect.any(Number)
        },
        {
          numDmsExist: 1,
          timeStamp: expect.any(Number)
        }],
        messagesExist: [{
          numMessagesExist: 0,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 1,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 2,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 3,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 0,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 1,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 2,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 3,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 2,
          timeStamp: expect.any(Number)
        },
        {
          numMessagesExist: 1,
          timeStamp: expect.any(Number)
        }],
        utilizationRate: 1
      }
    });
  });
});

/*
const goodUrl = 'http://staffmobility.eu/sites/default/files/isewtweetbg.jpg';
describe('test user profile photo', () => {
  test('can correctly get default', () => {
    requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    expect(requestPhoto(defaultPfpUrl)).toStrictEqual(200);
  });
  test('can upload a photo correctly', () => {
    const user = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    expect(requestUploadPhoto(user.token, goodUrl, 0, 0, 500, 500)).toStrictEqual({});
    const photoPath = `https://localhost:8700/img/${user.uId}.jpg`;
    sleep(2000);
    expect(requestPhoto(photoPath)).toStrictEqual(200);
  });
  test('request photo invalid crop', () => {
    const user = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    expect(requestUploadPhoto(user.token, goodUrl, 50, 0, 20, 500)).toStrictEqual(400);
    expect(requestUploadPhoto(user.token, goodUrl, 0, 600, 20, 500)).toStrictEqual(400);
  });
  test('invalid url', () => {
    const user = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    expect(requestUploadPhoto(user.token, 'httd://localhost:3000/here', 0, 0, 500, 500)).toStrictEqual(400);
  });
  test('invalid token', () => {
    requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    expect(requestUploadPhoto(invalidToken, goodUrl, 0, 0, 500, 500)).toStrictEqual(403);
  });
  test('invalid url', () => {
    const user = requestAuthRegisterV2(email1, password1, firstName1, lastName1);
    expect(requestUploadPhoto(user.token, 'http://staffmobility.eu/sites/default/files/thisisworng/isewtweetbg.jpg', 0, 0, 500, 500)).toStrictEqual(400);
  });
});
*/
