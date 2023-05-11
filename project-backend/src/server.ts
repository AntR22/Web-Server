import express, { json, Request, Response, NextFunction } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import { messageEditV2, messageReactV1, messageRemoveV2, messageSendLater, messageSendV2, messageUnReactV1, pinMessage, unPinMessage } from './message';
import { dmCreateV2, dmDetailsV2, dmLeaveV2, dmListV2, dmMessagesV2, dmRemoveV2, dmSendLater, sendDmV2 } from './dm';
import { authLoginV3, authLogoutV2, authRegisterV3, requestPasswordReset, resetPassword } from './auth';
import { clearV1, initialise, searchV1 } from './other';
import { channelsCreateV3, channelsListAllV3, channelsListV3 } from './channels';
import { channelAddownerV2, channelDetailsV3, channelInviteV3, channelJoinV3, channelLeaveV2, channelMessagesV3, channelRemoveownerV2 } from './channel';
import { getUsersStats, getUserStats, userPfpUpload, userProfileSetemailV2, userProfileSethandleV2, userProfileSetnameV2, userProfileV3, usersAllV2 } from './users';
import path from 'path';
import { standupActiveV1, standupSendV1, standupStartV1 } from './standups';
import mongoose from 'mongoose';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));

const uri = 'mongodb+srv://antonragusa:ustC1327%4089%3f@projects.qmbrp09.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(uri).then(() => console.log('Database connected')).catch((e) => console.log(e));

initialise();

/*
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.db = mongoose.createConnection(uri);
*/
const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

const imgDir = path.join(__dirname, '..', 'img');

app.use('/img', express.static(imgDir));

// Example get request
app.get('/echo', (req: Request, res: Response, next) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

app.post('/user/profile/uploadphoto/v1', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const { imgUrl, xStart, yStart, xEnd, yEnd } = req.body;
    const xS = parseInt(xStart);
    const yS = parseInt(yStart);
    const xE = parseInt(xEnd);
    const yE = parseInt(yEnd);
    const result = await userPfpUpload(token, imgUrl, xS, yS, xE, yE);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post('/auth/login/v3', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await authLoginV3(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post('/auth/register/v3', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, nameFirst, nameLast } = req.body;
    const result = await authRegisterV3(email, password, nameFirst, nameLast);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post('/channels/create/v3', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const { name, isPublic } = req.body;
    const iP = JSON.parse(isPublic);
    const result = await channelsCreateV3(token, name, iP);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.get('/channels/list/v3', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const result = await channelsListV3(token);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.get('/channels/listall/v3', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const result = await channelsListAllV3(token);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.get('/channel/details/v3', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const channelId = req.query.channelId as string;
    const id = parseInt(channelId);
    const result = await channelDetailsV3(token, id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post('/channel/join/v3', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const { channelId } = req.body;
    const id = parseInt(channelId);
    const result = await channelJoinV3(token, id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post('/channel/invite/v3', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const { channelId, uId } = req.body;
    const cId = parseInt(channelId);
    const uIds = parseInt(uId);
    const result = await channelInviteV3(token, cId, uIds);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.get('/channel/messages/v3', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const channelId = req.query.channelId as string;
    const id = parseInt(channelId);
    const start = req.query.start as string;
    const s = parseInt(start);
    const result = await channelMessagesV3(token, id, s);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.get('/user/profile/v3', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const id = req.query.uId as string;
    const uId = parseInt(id);
    const result = await userProfileV3(token, uId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.delete('/clear/v1', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await clearV1();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post('/auth/logout/v2', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const result = await authLogoutV2(token);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post('/channel/leave/v2', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const { channelId } = req.body;
    const id = parseInt(channelId);
    const result = await channelLeaveV2(token, id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post('/channel/addowner/v2', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const { channelId, uId } = req.body;
    const cId = parseInt(channelId);
    const uIds = parseInt(uId);
    const result = await channelAddownerV2(token, cId, uIds);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post('/channel/removeowner/v2', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const { channelId, uId } = req.body;
    const cId = parseInt(channelId);
    const uIds = parseInt(uId);
    const result = await channelRemoveownerV2(token, cId, uIds);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post('/message/send/v2', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const { channelId, message } = req.body;
    const cId = parseInt(channelId);
    const result = await messageSendV2(token, cId, message);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.put('/message/edit/v2', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const { messageId, message } = req.body;
    const mId = parseInt(messageId);
    const result = await messageEditV2(token, mId, message);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.delete('/message/remove/v2', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const messageId = parseInt(req.query.messageId as string);
    const result = await messageRemoveV2(token, messageId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post('/dm/create/v2', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const { uIds } = req.body;
    const result = await dmCreateV2(token, uIds);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.get('/dm/list/v2', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const result = await dmListV2(token);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.delete('/dm/remove/v2', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const dmId = req.query.dmId as string;
    const id = parseInt(dmId);
    const result = await dmRemoveV2(token, id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.get('/dm/details/v2', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const dmId = req.query.dmId as string;
    const id = parseInt(dmId);
    const result = await dmDetailsV2(token, id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post('/dm/leave/v2', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const { dmId } = req.body;
    const result = await dmLeaveV2(token, dmId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.get('/dm/messages/v2', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const dmId = req.query.dmId as string;
    const start = req.query.start as string;
    const s = parseInt(start);
    const id = parseInt(dmId);
    const result = await dmMessagesV2(token, id, s);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post('/message/senddm/v2', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const { dmId, message } = req.body;
    const result = await sendDmV2(token, dmId, message);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.get('/users/all/v2', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const result = await usersAllV2(token);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/setname/v2', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const { nameFirst, nameLast } = req.body;
    const result = await userProfileSetnameV2(token, nameFirst, nameLast);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/setemail/v2', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const { email } = req.body;
    const result = await userProfileSetemailV2(token, email);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/sethandle/v2', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const { handleStr } = req.body;
    const result = await userProfileSethandleV2(token, handleStr);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post('/standup/start/v1', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const { channelId, length } = req.body;
    const result = await standupStartV1(token, channelId, length);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.get('/standup/active/v1', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const channelId = req.query.channelId as string;
    const cId = parseInt(channelId);
    const result = await standupActiveV1(token, cId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post('/standup/send/v1', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const { channelId, message } = req.body;
    const result = await standupSendV1(token, channelId, message);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post('/message/react/v1', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const { messageId, reactId } = req.body;
    const mid = parseInt(messageId);
    const rid = parseInt(reactId);
    const result = await messageReactV1(token, mid, rid);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post('/message/unreact/v1', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const { messageId, reactId } = req.body;
    const mid = parseInt(messageId);
    const rid = parseInt(reactId);
    const result = await messageUnReactV1(token, mid, rid);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post('/message/pin/v1', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const { messageId } = req.body;
    const mid = parseInt(messageId);
    const result = await pinMessage(token, mid);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post('/message/unpin/v1', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const { messageId } = req.body;
    const mid = parseInt(messageId);
    const result = await unPinMessage(token, mid);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post('/message/sendlater/v1', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const { channelId, message, timeSent } = req.body;
    const cId = parseInt(channelId);
    const tS = parseInt(timeSent);
    const result = await messageSendLater(token, cId, message, tS);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post('/message/sendlaterdm/v1', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const { dmId, message, timeSent } = req.body;
    const dId = parseInt(dmId);
    const tS = parseInt(timeSent);
    const result = await dmSendLater(token, dId, message, tS);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post('/auth/passwordreset/request/v1', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const result = await requestPasswordReset(email);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post('/auth/passwordreset/reset/v1', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resetCode, newPassword } = req.body;
    const result = await resetPassword(resetCode, newPassword);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.get('/search/v1', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const qs = req.query.queryStr as string;
    const result = await searchV1(token, qs);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.get('/user/stats/v1', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const result = await getUserStats(token);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.get('/users/stats/v1', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const result = await getUsersStats(token);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Keep this BENEATH route definitions
// handles errors nicely
app.use(errorHandler());

// start server
const server = app.listen(8700, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  mongoose.disconnect();
  server.close(() => console.log('Shutting down server gracefully.'));
});
