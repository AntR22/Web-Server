import request from 'sync-request';
import { port, url } from '../config.json';
const SERVER_URL = `${url}:${port}`;

export function requestAuthRegisterV2(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request('POST', SERVER_URL + '/auth/register/v3', { json: { email, password, nameFirst, nameLast } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

export function requestAuthLoginV2(email: string, password: string) {
  const res = request('POST', SERVER_URL + '/auth/login/v3', { json: { email, password } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

export function requestRequestPasswordReset(email: string) {
  const res = request('POST', SERVER_URL + '/auth/passwordreset/request/v1', { json: { email } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

export function requestReset(resetCode: string, newPassword: string) {
  const res = request('POST', SERVER_URL + '/auth/passwordreset/reset/v1', { json: { resetCode, newPassword } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

export function requestSearchV1(token: string, queryStr: string) {
  const res = request('GET', SERVER_URL + '/search/v1', { headers: { token: `${token}` }, qs: { queryStr } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

export function requestChannelsCreateV2(token: string, name: string, isPublic: boolean) {
  const res = request('POST', SERVER_URL + '/channels/create/v3', { headers: { token: `${token}` }, json: { name, isPublic } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

export function requestChannelsListV2(token: string) {
  const res = request('GET', SERVER_URL + '/channels/list/v3', { headers: { token: `${token}` } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

export function requestChannelsListallV2(token: string) {
  const res = request('GET', SERVER_URL + '/channels/listall/v3', { headers: { token: `${token}` } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

export function requestChannelDetailsV2(token: string, channelId: number) {
  const res = request('GET', SERVER_URL + '/channel/details/v3', { headers: { token: `${token}` }, qs: { channelId: channelId } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

export function requestChannelJoinV2(token: string, channelId: number) {
  const res = request('POST', SERVER_URL + '/channel/join/v3', { headers: { token: `${token}` }, json: { channelId } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

export function requestChannelInviteV2(token: string, channelId: number, uId: number) {
  const res = request('POST', SERVER_URL + '/channel/invite/v3', { headers: { token: `${token}` }, json: { channelId, uId } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

export function requestChannelMessagesV2(token: string, channelId: number, start: number) {
  const res = request('GET', SERVER_URL + '/channel/messages/v3', { headers: { token: `${token}` }, qs: { channelId: channelId, start: start } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

export function requestUserProfileV2(token: string, uId: number) {
  const res = request('GET', SERVER_URL + '/user/profile/v3', { headers: { token: `${token}` }, qs: { uId: uId } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

export function requestClearV1() {
  const res = request('DELETE', SERVER_URL + '/clear/v1', { qs: {} });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  const data = JSON.parse(res.getBody() as string);
  return data;
}

export function requestAuthLogoutV1(token: string) {
  const res = request('POST', SERVER_URL + '/auth/logout/v2', { headers: { token: `${token}` } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

export function requestChannelLeaveV1(token: string, channelId: number) {
  const res = request('POST', SERVER_URL + '/channel/leave/v2', { headers: { token: `${token}` }, json: { channelId } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

export function requestChannelAddownerV1(token: string, channelId: number, uId: number) {
  const res = request('POST', SERVER_URL + '/channel/addowner/v2', { headers: { token: `${token}` }, json: { channelId, uId } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

export function requestChannelRemoveownerV1(token: string, channelId: number, uId: number) {
  const res = request('POST', SERVER_URL + '/channel/removeowner/v2', { headers: { token: `${token}` }, json: { channelId, uId } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

export function requestMessageSendV1(token: string, channelId: number, message: string) {
  const res = request('POST', SERVER_URL + '/message/send/v2', { headers: { token: `${token}` }, json: { channelId, message } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

export function requestMessageEditV1(token: string, messageId: number, message: string) {
  const res = request('PUT', SERVER_URL + '/message/edit/v2', { headers: { token: `${token}` }, json: { messageId, message } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

export function requestMessageRemoveV1(token: string, messageId: number) {
  const res = request('DELETE', SERVER_URL + '/message/remove/v2', { headers: { token: `${token}` }, qs: { messageId: messageId } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

export function requestDmCreate(token: string, uIds: number[]) {
  const res = request('POST', SERVER_URL + '/dm/create/v2', { headers: { token: `${token}` }, json: { uIds } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody('utf-8') as string);
}

export function requestDmList(token: string) {
  const res = request('GET', SERVER_URL + '/dm/list/v2', { headers: { token: `${token}` } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody('utf-8') as string);
}

export function requestDmRemove(token: string, dmId: number) {
  const res = request('DELETE', SERVER_URL + '/dm/remove/v2', { headers: { token: `${token}` }, qs: { dmId: dmId } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody('utf-8') as string);
}

export function requestDmDetails(token: string, dmId: number) {
  const res = request('GET', SERVER_URL + '/dm/details/v2', { headers: { token: `${token}` }, qs: { dmId: dmId } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody('utf-8') as string);
}

export function requestDmLeave(token: string, dmId: number) {
  const res = request('POST', SERVER_URL + '/dm/leave/v2', { headers: { token: `${token}` }, json: { dmId } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody('utf-8') as string);
}

export function requestDmMessages(token: string, dmId: number, start: number) {
  const res = request('GET', SERVER_URL + '/dm/messages/v2', { headers: { token: `${token}` }, qs: { dmId: dmId, start: start } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody('utf-8') as string);
}

export function requestDmSend(token: string, dmId: number, message: string) {
  const res = request('POST', SERVER_URL + '/message/senddm/v2', { headers: { token: `${token}` }, json: { dmId, message } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody('utf-8') as string);
}

export function requestMessageReact(token: string, messageId: number, reactId: number) {
  const res = request('POST', SERVER_URL + '/message/react/v1', { headers: { token: `${token}` }, json: { messageId, reactId } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody('utf-8') as string);
}

export function requestMessageUnReact(token: string, messageId: number, reactId: number) {
  const res = request('POST', SERVER_URL + '/message/unreact/v1', { headers: { token: `${token}` }, json: { messageId, reactId } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody('utf-8') as string);
}

export function requestMessagePin(token: string, messageId: number) {
  const res = request('POST', SERVER_URL + '/message/pin/v1', { headers: { token: `${token}` }, json: { messageId } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody('utf-8') as string);
}

export function requestMessageUnPin(token: string, messageId: number) {
  const res = request('POST', SERVER_URL + '/message/unpin/v1', { headers: { token: `${token}` }, json: { messageId } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody('utf-8') as string);
}

export function requestMessageSendLater(token: string, channelId: number, message: string, timeSent: number) {
  const res = request('POST', SERVER_URL + '/message/sendlater/v1', { headers: { token: `${token}` }, json: { channelId, message, timeSent } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody('utf-8') as string);
}

export function requestDmSendLater(token: string, dmId: number, message: string, timeSent: number) {
  const res = request('POST', SERVER_URL + '/message/sendlaterdm/v1', { headers: { token: `${token}` }, json: { dmId, message, timeSent } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody('utf-8') as string);
}

export function requestUsersAllV1(token: string) {
  const res = request('GET', SERVER_URL + '/users/all/v2', { headers: { token: `${token}` } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

export function requestUserProfileSetnameV1(token: string, nameFirst: string, nameLast: string) {
  const res = request('PUT', SERVER_URL + '/user/profile/setname/v2', { headers: { token: `${token}` }, json: { nameFirst, nameLast } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

export function requestUserProfileSetemailV1(token: string, email: string) {
  const res = request('PUT', SERVER_URL + '/user/profile/setemail/v2', { headers: { token: `${token}` }, json: { email } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

export function requestUserProfileSethandleV1(token: string, handleStr: string) {
  const res = request('PUT', SERVER_URL + '/user/profile/sethandle/v2', { headers: { token: `${token}` }, json: { handleStr } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

/*
export function requestUploadPhoto(token: string, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number) {
  const res = request('POST', '/user/profile/uploadphoto/v1', { headers: { token: `${token}` }, json: { imgUrl, xStart, yStart, xEnd, yEnd } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

export function requestPhoto(url: string) {
  const res = request('GET', url);
  return res.statusCode;
}
*/

export function requestStandupStartV1(token: string, channelId: number, length: number) {
  const res = request('POST', SERVER_URL + '/standup/start/v1', { headers: { token: `${token}` }, json: { channelId, length } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody('utf-8') as string);
}

export function requestStandupActiveV1(token: string, channelId: number) {
  const res = request('GET', SERVER_URL + '/standup/active/v1', { headers: { token: `${token}` }, qs: { channelId } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody('utf-8') as string);
}

export function requestStandupSendV1(token: string, channelId: number, message: string) {
  const res = request('POST', SERVER_URL + '/standup/send/v1', { headers: { token: `${token}` }, json: { channelId, message } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody('utf-8') as string);
}

export function requestGetUserStats(token: string) {
  const res = request('GET', SERVER_URL + '/user/stats/v1', { headers: { token: `${token}` } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody('utf-8') as string);
}

export function requestGetUsersStats(token: string) {
  const res = request('GET', SERVER_URL + '/users/stats/v1', { headers: { token: `${token}` } });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody('utf-8') as string);
}
