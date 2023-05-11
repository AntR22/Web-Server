import mongoose from 'mongoose';

const UstatChannel = new mongoose.Schema({
  numChannelsJoined: {
    type: Number,
    required: true
  },
  timeStamp: {
    type: Number,
    required: true
  }
});

const UstatDm = new mongoose.Schema({
  numDmsJoined: {
    type: Number,
    required: true
  },
  timeStamp: {
    type: Number,
    required: true
  }
});

const UstatMessages = new mongoose.Schema({
  numMessagesSent: {
    type: Number,
    required: true
  },
  timeStamp: {
    type: Number,
    required: true
  }
});

const userStatsSchema = new mongoose.Schema({
  channelsJoined: {
    type: [UstatChannel],
    required: true
  },
  dmsJoined: {
    type: [UstatDm],
    required: true
  },
  messagesSent: {
    type: [UstatMessages],
    required: true
  },
  involvementRate: {
    type: Number,
    required: true
  }
});

const userSchema = new mongoose.Schema({
  uId: {
    type: Number,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  nameFirst: {
    type: String,
    required: true
  },
  nameLast: {
    type: String,
    required: true
  },
  handleStr: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  globalOwner: {
    type: Number,
    required: true
  },
  profileImgUrl: {
    type: String,
    required: true
  },
  stats: {
    type: userStatsSchema,
    required: true
  }
});

const channelsExist = new mongoose.Schema({
  numChannelsExist: {
    type: Number,
    required: true
  },
  timeStamp: {
    type: Number,
    required: true
  }
});

const dmsExist = new mongoose.Schema({
  numDmsExist: {
    type: Number,
    required: true
  },
  timeStamp: {
    type: Number,
    required: true
  }
});

const messagesExist = new mongoose.Schema({
  numMessagesExist: {
    type: Number,
    required: true
  },
  timeStamp: {
    type: Number,
    required: true
  }
});

const ResetCode = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  }
});

const Reacts = new mongoose.Schema({
  reactId: {
    type: Number,
    required: true
  },
  uIds: {
    type: [Number],
    required: true
  },
  isThisUserReacted: {
    type: Boolean,
    required: true
  }
});

const Message = new mongoose.Schema({
  messageId: {
    type: Number,
    required: true
  },
  uId: {
    type: Number,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timeSent: {
    type: Number,
    required: true
  },
  reacts: {
    type: [Reacts],
    required: true
  },
  isPinned: {
    type: Boolean,
    required: true
  }
});

const Channel = new mongoose.Schema({
  channelId: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  channelAdmins: {
    type: [Number],
    required: true
  },
  channelMembers: {
    type: [Number],
    required: true
  },
  isPublic: {
    type: Boolean,
    required: true
  },
  messages: {
    type: [Message],
    required: true
  },
  activeStandupTime: {
    type: Number,
    required: true
  },
  standupMessages: {
    type: [String],
    required: true
  }
});

const DM = new mongoose.Schema({
  dmName: {
    type: String,
    required: true
  },
  dmId: {
    type: Number,
    required: true
  },
  ownerId: {
    type: Number,
    required: true
  },
  recipientsId: {
    type: [Number],
    required: true
  },
  messages: {
    type: [Message],
    required: true
  }
});

const Token = new mongoose.Schema({
  token: {
    type: String,
    required: true
  },
  uId: {
    type: Number,
    requied: true
  }
});

const MessageCounter = new mongoose.Schema({
  count: {
    type: Number,
    required: true
  }
});

export default {
  Users: mongoose.model('Users', userSchema),
  ChannelsExist: mongoose.model('ChannelsExist', channelsExist),
  DmsExist: mongoose.model('DmsExist', dmsExist),
  MessagesExist: mongoose.model('MessagesExists', messagesExist),
  ResetCodes: mongoose.model('ResetCodes', ResetCode),
  Dms: mongoose.model('Dms', DM),
  Channels: mongoose.model('Channels', Channel),
  Tokens: mongoose.model('Tokens', Token),
  MessageCounter: mongoose.model('MessageCounter', MessageCounter)
};
