import { getHash } from '../auth';
import { requestAuthLoginV2, requestAuthRegisterV2, requestAuthLogoutV1, requestUserProfileV2, requestUsersAllV1, requestClearV1, requestRequestPasswordReset, requestReset } from './helper';

import config from '../config.json';

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

const defaultPfpUrl = `http://${HOST}:${PORT}/img/default.jpg`;

const u1Email = 'abc@gmail.com';
const u1Password = 'goodpassword';
const u1FirstName = 'Example';
const u1LastName = 'Person1';

const u2Email = 'hello@gmail.com';
const u2Password = 'acceptable';
const u2FirstName = 'Another';
const u2LastName = 'Person2';

const u3Email = 'p3@gmail.com';
const u3Password = 'bravo password';
const u3FirstName = 'The third';
const u3LastName = 'Person';

const sampleUser1 = {
  uId: expect.any(Number),
  email: u1Email,
  nameFirst: u1FirstName,
  nameLast: u1LastName,
  handleStr: (u1FirstName + u1LastName).toLowerCase(),
  profileImgUrl: defaultPfpUrl
};

const sampleUser2 = {
  uId: expect.any(Number),
  email: u2Email,
  nameFirst: u2FirstName,
  nameLast: u2LastName,
  handleStr: (u2FirstName + u2LastName).toLowerCase(),
  profileImgUrl: defaultPfpUrl
};

beforeEach(() => {
  requestClearV1();
});
afterEach(() => {
  requestClearV1();
});

describe('test for authRegisterV2', () => {
  test.each([
    { email: '' },
    { email: 'comp1531' },
    { email: 'email@unsw' },
    { email: '@example.com' },
    { email: 'paul@.com' },
    { email: 'Abc.example.com' },
    { email: 'this is"not/ allowed@examle.com' },
    { email: 'just"not"right@example.com' },
  ])("Invalid email '$email'", ({ email }) => {
    const id = requestAuthRegisterV2(email, u1Password, u1FirstName, u1LastName);
    expect(id).toEqual(400);
    expect(requestUserProfileV2(id.token, id.authUserId)).toEqual(403);
  });

  test('email used more than once and two people registered correctly', () => {
    const id1 = requestAuthRegisterV2(u1Email, u1Password, u1FirstName, u1LastName);
    const id2 = requestAuthRegisterV2(u2Email, u2Password, u2FirstName, u2LastName);
    expect(requestAuthRegisterV2(u1Email, u1Password, u1FirstName, u1LastName)).toEqual(400);
    expect(requestUserProfileV2(id1.token, id1.authUserId)).toStrictEqual({ user: sampleUser1 });
    expect(requestUserProfileV2(id2.token, id2.authUserId)).toStrictEqual({ user: sampleUser2 });
    expect(requestUsersAllV1(id1.token)).toStrictEqual({
      users: [
        sampleUser1,
        sampleUser2,
      ]
    });
  });

  test.each([
    { password: '' },
    { password: 'just5' },
  ])("Invalid fistname '$password'", ({ password }) => {
    const id = requestAuthRegisterV2(u1Email, password, u1FirstName, u1LastName);
    expect(id).toEqual(400);
    expect(requestUserProfileV2(id.token, id.authUserId)).toEqual(403);
  });

  test('password length exactly 6 characters', () => {
    const id = requestAuthRegisterV2(u1Email, '6chars', u1FirstName, u1LastName);
    expect(requestUserProfileV2(id.token, id.authUserId)).toStrictEqual({ user: sampleUser1 });
  });

  test.each([
    { Firstname: '' },
    { Firstname: 'An extremely long name that is tooooooo complicated' },
  ])("Invalid fistname '$Firstname'", ({ Firstname }) => {
    const id = requestAuthRegisterV2(u1Email, u1Password, Firstname, u1LastName);
    expect(id).toEqual(400);
    expect(requestUserProfileV2(id.token, id.authUserId)).toEqual(403);
  });

  // Test for invalid Last name of the person
  test.each([
    { Lastname: '' },
    { Lastname: 'An extremely long name that is tooooooo complicated' },
  ])("Invalid last name '$Lastname'", ({ Lastname }) => {
    const id = requestAuthRegisterV2('abc@gmail.com', '1234567', 'good', Lastname);
    expect(id).toEqual(400);
    expect(requestUserProfileV2(id.token, id.authUserId)).toEqual(403);
  });

  test('Test for multiple user with the same handle str', () => {
    const id1 = requestAuthRegisterV2(u1Email, u1Password, 'hello', 'world');
    const id2 = requestAuthRegisterV2(u2Email, u2Password, 'hello', 'world');
    const id3 = requestAuthRegisterV2(u3Email, u3Password, 'hello', 'world0');
    const id4 = requestAuthRegisterV2('antonragusa@gmail.com', 'blahblah', 'hello', 'world');
    expect(requestUserProfileV2(id1.token, id1.authUserId)).toStrictEqual({
      user: {
        uId: id1.authUserId,
        email: u1Email,
        nameFirst: 'hello',
        nameLast: 'world',
        handleStr: 'helloworld',
        profileImgUrl: defaultPfpUrl
      }
    });
    expect(requestUserProfileV2(id1.token, id2.authUserId)).toStrictEqual({
      user: {
        uId: id2.authUserId,
        email: u2Email,
        nameFirst: 'hello',
        nameLast: 'world',
        handleStr: 'helloworld0',
        profileImgUrl: defaultPfpUrl
      }
    });
    expect(requestUserProfileV2(id1.token, id3.authUserId)).toStrictEqual({
      user: {
        uId: id3.authUserId,
        email: u3Email,
        nameFirst: 'hello',
        nameLast: 'world0',
        handleStr: 'helloworld00',
        profileImgUrl: defaultPfpUrl
      }
    });
    expect(requestUserProfileV2(id1.token, id4.authUserId)).toStrictEqual({
      user: {
        uId: id4.authUserId,
        email: 'antonragusa@gmail.com',
        nameFirst: 'hello',
        nameLast: 'world',
        handleStr: 'helloworld1',
        profileImgUrl: defaultPfpUrl
      }
    });
  });
  test('test for an extreme amount of same handle strings', () => {
    const id1 = requestAuthRegisterV2(u1Email, u1Password, 'hello', 'world');
    const id2 = requestAuthRegisterV2(u2Email, u2Password, 'hello', 'world');
    const id3 = requestAuthRegisterV2(u3Email, u3Password, 'hello', 'world');
    const id4 = requestAuthRegisterV2('anton@gmail.com', u1Password, 'hello', 'world');
    const id5 = requestAuthRegisterV2('antonragusa@gmail.com', u2Password, 'hello', 'world');
    const id6 = requestAuthRegisterV2('ryan@gmail.com', u3Password, 'hello', 'world');
    const id7 = requestAuthRegisterV2('ram@gmail.com', u1Password, 'hello', 'world');
    const id8 = requestAuthRegisterV2('daniel@gmail.com', u2Password, 'hello', 'world');
    const id9 = requestAuthRegisterV2('aiden@gmail.com', u3Password, 'hello', 'world');
    const id10 = requestAuthRegisterV2('sandeep@gmail.com', u1Password, 'hello', 'world');
    const id11 = requestAuthRegisterV2('tam@gmail.com', u1Password, 'hello', 'world');
    const id12 = requestAuthRegisterV2('idkanyoneelse@gmail.com', u1Password, 'hello', 'world');
    expect(requestUserProfileV2(id1.token, id1.authUserId)).toStrictEqual({
      user: {
        uId: id1.authUserId,
        email: u1Email,
        nameFirst: 'hello',
        nameLast: 'world',
        handleStr: 'helloworld',
        profileImgUrl: defaultPfpUrl
      }
    });
    expect(requestUserProfileV2(id1.token, id2.authUserId)).toStrictEqual({
      user: {
        uId: id2.authUserId,
        email: u2Email,
        nameFirst: 'hello',
        nameLast: 'world',
        handleStr: 'helloworld0',
        profileImgUrl: defaultPfpUrl
      }
    });
    expect(requestUserProfileV2(id1.token, id3.authUserId)).toStrictEqual({
      user: {
        uId: id3.authUserId,
        email: u3Email,
        nameFirst: 'hello',
        nameLast: 'world',
        handleStr: 'helloworld1',
        profileImgUrl: defaultPfpUrl
      }
    });
    expect(requestUserProfileV2(id1.token, id4.authUserId)).toStrictEqual({
      user: {
        uId: id4.authUserId,
        email: 'anton@gmail.com',
        nameFirst: 'hello',
        nameLast: 'world',
        handleStr: 'helloworld2',
        profileImgUrl: defaultPfpUrl
      }
    });
    expect(requestUserProfileV2(id1.token, id5.authUserId)).toStrictEqual({
      user: {
        uId: id5.authUserId,
        email: 'antonragusa@gmail.com',
        nameFirst: 'hello',
        nameLast: 'world',
        handleStr: 'helloworld3',
        profileImgUrl: defaultPfpUrl
      }
    });
    expect(requestUserProfileV2(id1.token, id6.authUserId)).toStrictEqual({
      user: {
        uId: id6.authUserId,
        email: 'ryan@gmail.com',
        nameFirst: 'hello',
        nameLast: 'world',
        handleStr: 'helloworld4',
        profileImgUrl: defaultPfpUrl
      }
    });
    expect(requestUserProfileV2(id1.token, id7.authUserId)).toStrictEqual({
      user: {
        uId: id7.authUserId,
        email: 'ram@gmail.com',
        nameFirst: 'hello',
        nameLast: 'world',
        handleStr: 'helloworld5',
        profileImgUrl: defaultPfpUrl
      }
    });
    expect(requestUserProfileV2(id1.token, id8.authUserId)).toStrictEqual({
      user: {
        uId: id8.authUserId,
        email: 'daniel@gmail.com',
        nameFirst: 'hello',
        nameLast: 'world',
        handleStr: 'helloworld6',
        profileImgUrl: defaultPfpUrl
      }
    });
    expect(requestUserProfileV2(id1.token, id9.authUserId)).toStrictEqual({
      user: {
        uId: id9.authUserId,
        email: 'aiden@gmail.com',
        nameFirst: 'hello',
        nameLast: 'world',
        handleStr: 'helloworld7',
        profileImgUrl: defaultPfpUrl
      }
    });
    expect(requestUserProfileV2(id1.token, id10.authUserId)).toStrictEqual({
      user: {
        uId: id10.authUserId,
        email: 'sandeep@gmail.com',
        nameFirst: 'hello',
        nameLast: 'world',
        handleStr: 'helloworld8',
        profileImgUrl: defaultPfpUrl
      }
    });
    expect(requestUserProfileV2(id1.token, id11.authUserId)).toStrictEqual({
      user: {
        uId: id11.authUserId,
        email: 'tam@gmail.com',
        nameFirst: 'hello',
        nameLast: 'world',
        handleStr: 'helloworld9',
        profileImgUrl: defaultPfpUrl
      }
    });
    expect(requestUserProfileV2(id1.token, id12.authUserId)).toStrictEqual({
      user: {
        uId: id12.authUserId,
        email: 'idkanyoneelse@gmail.com',
        nameFirst: 'hello',
        nameLast: 'world',
        handleStr: 'helloworld10',
        profileImgUrl: defaultPfpUrl
      }
    });
  });
});

describe('test for authLoginV2', () => {
  test('unregistered email login', () => {
    const id = requestAuthLoginV2('notregistered@email.com', '135790');
    expect(id).toEqual(400);
    expect(requestUserProfileV2(id.token, id.authUserId)).toEqual(403);
  });

  test('logining in with incorrect password', () => {
    const id = requestAuthRegisterV2(u1Email, u1Password, u1FirstName, u1LastName);
    expect(requestAuthLoginV2(u1Email, u1Password + '1')).toEqual(400);
    expect(requestUserProfileV2(id.token, id.authUserId)).toStrictEqual({ user: sampleUser1 });
  });

  test('Test for correct email and password', () => {
    const id = requestAuthRegisterV2(u1Email, u1Password, u1FirstName, u1LastName);
    expect(requestAuthLoginV2(u1Email, u1Password)).toStrictEqual({
      token: expect.any(String),
      authUserId: expect.any(Number)
    });
    expect(requestUserProfileV2(id.token, id.authUserId)).toStrictEqual({ user: sampleUser1 });
  });

  test('Test for correct email and password with multiple members registered', () => {
    const id1 = requestAuthRegisterV2(u1Email, u1Password, u1FirstName, u1LastName);
    requestAuthRegisterV2(u2Email, u2Password, u2FirstName, u2LastName);
    const id3 = requestAuthRegisterV2(u3Email, u3Password, u3FirstName, u3LastName);

    expect(requestAuthLoginV2(u3Email, u3Password)).toStrictEqual({
      token: expect.any(String),
      authUserId: id3.authUserId
    });
    expect(requestAuthLoginV2(u1Email, u1Password)).toStrictEqual({
      token: expect.any(String),
      authUserId: id1.authUserId
    });
    const id4 = requestAuthLoginV2(u2Email, u2Password);
    expect(requestUserProfileV2(id4.token, id4.authUserId)).toStrictEqual({ user: sampleUser2 });
  });
});

describe('test for authLogoutv1', () => {
  test('invalid token logout', () => {
    expect(requestAuthLogoutV1('demo')).toEqual(403);
  });

  test('many user logged in and non existing token logging out', () => {
    const id1 = requestAuthRegisterV2(u1Email, u1Password, u1FirstName, u1LastName);
    const id2 = requestAuthRegisterV2(u2Email, u2Password, u2FirstName, u2LastName);
    expect(requestAuthLogoutV1('random')).toEqual(403);
    expect(requestAuthLogoutV1(id1.token)).toStrictEqual({});
    expect(requestUserProfileV2(id1.token, id1.authUserId)).toEqual(403);
    expect(requestUsersAllV1(id2.token)).toStrictEqual({
      users: [
        sampleUser1,
        sampleUser2
      ]
    });
  });

  test('all people logging out', () => {
    const id1 = requestAuthRegisterV2(u1Email, u1Password, u1FirstName, u1LastName);
    const id2 = requestAuthRegisterV2(u2Email, u2Password, u2FirstName, u2LastName);
    const id3 = requestAuthLoginV2(u2Email, u2Password);
    expect(requestAuthLogoutV1(id1.token)).toStrictEqual({});
    expect(requestAuthLogoutV1(id2.token)).toStrictEqual({});
    expect(requestUsersAllV1(id3.token)).toStrictEqual({
      users: [
        sampleUser1,
        sampleUser2,
      ]
    });
  });
});

const validEmail = 'antonragusa0@gmail.com';
describe('test password request and reset', () => {
  test('correct return request', () => {
    const user = requestAuthRegisterV2(validEmail, 'bloblbobbd', 'anton', 'ragusa');
    expect(requestRequestPasswordReset(validEmail)).toStrictEqual({});
    expect(requestAuthLogoutV1(user.token)).toStrictEqual(403);
  });
  test('error when invalid resetCode', () => {
    requestAuthRegisterV2(validEmail, 'bloblbobbd', 'anton', 'ragusa');
    expect(requestRequestPasswordReset(validEmail)).toStrictEqual({});
    expect(requestReset('inavlid code', 'validpassword')).toStrictEqual(400);
  });
  test('error when invalid password', () => {
    requestAuthRegisterV2(validEmail, 'bloblgfs', 'anton', 'ragusa');
    expect(requestRequestPasswordReset(validEmail)).toStrictEqual({});
    const code = getHash(validEmail);
    expect(requestReset(code, 'bad')).toStrictEqual(400);
  });
  test('invalid email returns nothing', () => {
    requestAuthRegisterV2(validEmail, 'bloblgfs', 'anton', 'ragusa');
    expect(requestRequestPasswordReset('bademail')).toStrictEqual({});
  });
  test('correct functionality', () => {
    const oldPassword = 'bloblgfs';
    requestAuthRegisterV2(validEmail, oldPassword, 'anton', 'ragusa');
    expect(requestRequestPasswordReset(validEmail)).toStrictEqual({});
    const code = getHash(validEmail);
    expect(requestReset(code, 'good password')).toStrictEqual({});
    expect(requestAuthLoginV2(validEmail, 'good password')).toStrictEqual({
      authUserId: expect.any(Number),
      token: expect.any(String)
    });
    expect(requestAuthLoginV2(validEmail, oldPassword)).toStrictEqual(400);
  });
});
