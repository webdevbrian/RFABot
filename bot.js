(function () {
  var RastaFortuneSvc = {};
  var Command, RoomHelper, User, announceCurate, antispam, apiHooks, avgVoteRatioCommand, badQualityCommand, beggar, chatCommandDispatcher, chatUniversals, cmds, commandsCommand, cookieCommand, data, dieCommand, disconnectLookupCommand, downloadCommand, forceSkipCommand, handleNewSong, handleUserJoin, handleUserLeave, handleVote, hook, initEnvironment, initHooks, initialize, lockCommand, msToStr, newSongsCommand, overplayedCommand, popCommand, populateUserData, pupOnline, pushCommand, reloadCommand, resetAfkCommand, roomHelpCommand, rulesCommand, settings, skipCommand, sourceCommand, statusCommand, swapCommand, themeCommand, undoHooks, unhook, unhookCommand, unlockCommand, updateVotes, uservoiceCommand, voteRatioCommand, whyMehCommand, whyWootCommand, wootCommand, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref18, _ref19, _ref2, _ref20, _ref21, _ref22, _ref23, _ref24, _ref25, _ref26, _ref27, _ref28, _ref29, _ref3, _ref30, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, fortuneCommand,
    __bind = function (fn, me) { return function () { return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function (item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = {}.hasOwnProperty,
    __extends = function (child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  settings = (function () {
    function settings() {
      this.implode = __bind(this.implode, this);
      this.intervalMessages = __bind(this.intervalMessages, this);
      //this.startAfkInterval = __bind(this.startAfkInterval, this);
      this.setInternalWaitlist = __bind(this.setInternalWaitlist, this);
      this.userJoin = __bind(this.userJoin, this);
      this.getRoomUrlPath = __bind(this.getRoomUrlPath, this);
      this.startup = __bind(this.startup, this);
    }

    settings.prototype.currentsong = {};

    settings.prototype.users = {};

    settings.prototype.djs = [];

    settings.prototype.mods = [];

    settings.prototype.host = [];

    settings.prototype.hasWarned = false;

    settings.prototype.currentwoots = 0;

    settings.prototype.currentmehs = 0;

    settings.prototype.currentcurates = 0;

    settings.prototype.roomUrlPath = null;

    settings.prototype.internalWaitlist = [];

    settings.prototype.userDisconnectLog = [];

    settings.prototype.voteLog = {};

    settings.prototype.seshOn = false;

    settings.prototype.forceSkip = false;

    settings.prototype.seshMembers = [];

    settings.prototype.launchTime = null;

    settings.prototype.totalVotingData = {
      woots: 0,
      mehs: 0,
      curates: 0
    };

    settings.prototype.pupScriptUrl = '';

    settings.prototype.afkTime = 12 * 60 * 1000;

    settings.prototype.songIntervalMessages = [
      {
        interval: 15,
        offset: 0,
        msg: "Don't forget to jump in the wait list!"
      }
    ];

    settings.prototype.songCount = 0;

    settings.prototype.startup = function () {
      this.launchTime = new Date();
      return this.roomUrlPath = this.getRoomUrlPath();
    };

    settings.prototype.getRoomUrlPath = function () {
      return window.location.pathname.replace(/\//g, '');
    };

    settings.prototype.newSong = function () {
      this.totalVotingData.woots += this.currentwoots;
      this.totalVotingData.mehs += this.currentmehs;
      this.totalVotingData.curates += this.currentcurates;
      this.setInternalWaitlist();
      this.currentsong = API.getMedia();
      if (this.currentsong !== null) {
        return this.currentsong;
      } else {
        return false;
      }
    };

    settings.prototype.userJoin = function (u) {
      var userIds, _ref;
      userIds = Object.keys(this.users);
      if (_ref = u.id, __indexOf.call(userIds, _ref) >= 0) {
        return this.users[u.id].inRoom(true);
      } else {
        this.users[u.id] = new User(u);
        return this.voteLog[u.id] = {};
      }
    };

    settings.prototype.setInternalWaitlist = function () {
      var boothWaitlist, fullWaitList, lineWaitList;
      boothWaitlist = API.getDJ();
      lineWaitList = API.getWaitList();
      fullWaitList = lineWaitList;
      return this.internalWaitlist = fullWaitList;
    };

    settings.prototype.activity = function (obj) {
      if (obj.type === 'message') {
        return this.users[obj.fromID].updateActivity();
      }
    };

    settings.prototype.intervalMessages = function () {
      var msg, _i, _len, _ref, _results;
      this.songCount++;
      _ref = this.songIntervalMessages;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        msg = _ref[_i];
        if (((this.songCount + msg['offset']) % msg['interval']) === 0) {
          _results.push(API.sendChat(msg['msg']));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    settings.prototype.implode = function () {
      var item, val;
      for (item in this) {
        val = this[item];
        if (typeof this[item] === 'object') {
          delete this[item];
        }
      }
      return clearInterval(this.afkInterval);
    };

    settings.prototype.lockBooth = function (callback) {
      if (callback == null) {
        callback = null;
      }
      return $.ajax({
        url: "http://plug.dj/_/gateway/room.update_options",
        type: 'POST',
        data: JSON.stringify({
          service: "room.update_options",
          body: [
            this.roomUrlPath, {
              "boothLocked": true,
              "waitListEnabled": true,
              "maxPlays": 1,
              "maxDJs": 5
            }
          ]
        }),
        async: this.async,
        dataType: 'json',
        contentType: 'application/json'
      }).done(function () {
        if (callback != null) {
          return callback();
        }
      });
    };

    settings.prototype.unlockBooth = function (callback) {
      if (callback == null) {
        callback = null;
      }
      return $.ajax({
        url: "http://plug.dj/_/gateway/room.update_options",
        type: 'POST',
        data: JSON.stringify({
          service: "room.update_options",
          body: [
            this.roomUrlPath, {
              "boothLocked": false,
              "waitListEnabled": true,
              "maxPlays": 1,
              "maxDJs": 5
            }
          ]
        }),
        async: this.async,
        dataType: 'json',
        contentType: 'application/json'
      }).done(function () {
        if (callback != null) {
          return callback();
        }
      });
    };

    return settings;

  })();

  data = new settings();

  User = (function () {
    User.prototype.afkWarningCount = 0;

    User.prototype.lastWarning = null;

    User.prototype["protected"] = false;

    User.prototype.isInRoom = true;

    function User(user) {
      this.user = user;
      this.updateVote = __bind(this.updateVote, this);
      this.inRoom = __bind(this.inRoom, this);
      this.notDj = __bind(this.notDj, this);
      this.warn = __bind(this.warn, this);
      this.getIsDj = __bind(this.getIsDj, this);
      this.getWarningCount = __bind(this.getWarningCount, this);
      this.getUser = __bind(this.getUser, this);
      this.getLastWarning = __bind(this.getLastWarning, this);
      this.getLastActivity = __bind(this.getLastActivity, this);
      this.updateActivity = __bind(this.updateActivity, this);
      this.init = __bind(this.init, this);
      this.init();
    }

    User.prototype.init = function () {
      return this.lastActivity = new Date();
    };

    User.prototype.updateActivity = function () {
      this.lastActivity = new Date();
      this.afkWarningCount = 0;
      return this.lastWarning = null;
    };

    User.prototype.getLastActivity = function () {
      return this.lastActivity;
    };

    User.prototype.getLastWarning = function () {
      if (this.lastWarning === null) {
        return false;
      } else {
        return this.lastWarning;
      }
    };

    User.prototype.getUser = function () {
      return this.user;
    };

    User.prototype.getWarningCount = function () {
      return this.afkWarningCount;
    };

    User.prototype.getIsDj = function () {
      var isDj = false;
      var dj = API.getDJ();
      if (dj) {
        isDj = this.user.id === this.user.id;
      }
      return isDj;
    };

    User.prototype.warn = function () {
      this.afkWarningCount++;
      return this.lastWarning = new Date();
    };

    User.prototype.notDj = function () {
      this.afkWarningCount = 0;
      return this.lastWarning = null;
    };

    User.prototype.inRoom = function (online) {
      return this.isInRoom = online;
    };

    User.prototype.updateVote = function (v) {
      if (this.isInRoom) {
        return data.voteLog[this.user.id][data.currentsong.id] = v;
      }
    };

    return User;

  })();

  RoomHelper = (function () {
    function RoomHelper() { }

    RoomHelper.prototype.lookupUser = function (username) {
      var id, u, _ref;
      _ref = data.users;
      for (id in _ref) {
        u = _ref[id];
        if (u.getUser().username === username) {
          return u.getUser();
        }
      }
      return false;
    };

    RoomHelper.prototype.userVoteRatio = function (user) {
      var songId, songVotes, vote, votes;
      songVotes = data.voteLog[user.id];
      votes = {
        'woot': 0,
        'meh': 0
      };
      for (songId in songVotes) {
        vote = songVotes[songId];
        if (vote === 1) {
          votes['woot']++;
        } else if (vote === -1) {
          votes['meh']++;
        }
      }
      votes['positiveRatio'] = (votes['woot'] / (votes['woot'] + votes['meh'])).toFixed(2);
      return votes;
    };

    return RoomHelper;

  })();

  pupOnline = function () {
    //return API.sendChat("On :)");
  };

  populateUserData = function () {
    var u, users, _i, _len;
    users = API.getUsers();
    for (_i = 0, _len = users.length; _i < _len; _i++) {
      u = users[_i];
      data.users[u.id] = new User(u);
      data.voteLog[u.id] = {};
    }
  };

  initEnvironment = function () {
    //document.getElementById("button-vote-positive").click();
    //return document.getElementById("button-sound").click();
  };

  initialize = function () {
    pupOnline();
    populateUserData();
    initEnvironment();
    initHooks();
    data.startup();
    data.newSong();
    RastaFortuneSvc.init();
    //return data.startAfkInterval();
  };

  msToStr = function (msTime) {
    var ms, msg, timeAway;
    msg = '';
    timeAway = {
      'days': 0,
      'hours': 0,
      'minutes': 0,
      'seconds': 0
    };
    ms = {
      'day': 24 * 60 * 60 * 1000,
      'hour': 60 * 60 * 1000,
      'minute': 60 * 1000,
      'second': 1000
    };
    if (msTime > ms['day']) {
      timeAway['days'] = Math.floor(msTime / ms['day']);
      msTime = msTime % ms['day'];
    }
    if (msTime > ms['hour']) {
      timeAway['hours'] = Math.floor(msTime / ms['hour']);
      msTime = msTime % ms['hour'];
    }
    if (msTime > ms['minute']) {
      timeAway['minutes'] = Math.floor(msTime / ms['minute']);
      msTime = msTime % ms['minute'];
    }
    if (msTime > ms['second']) {
      timeAway['seconds'] = Math.floor(msTime / ms['second']);
    }
    if (timeAway['days'] !== 0) {
      msg += timeAway['days'].toString() + 'd';
    }
    if (timeAway['hours'] !== 0) {
      msg += timeAway['hours'].toString() + 'h';
    }
    if (timeAway['minutes'] !== 0) {
      msg += timeAway['minutes'].toString() + 'm';
    }
    if (timeAway['seconds'] !== 0) {
      msg += timeAway['seconds'].toString() + 's';
    }
    if (msg !== '') {
      return msg;
    } else {
      return false;
    }
  };

  Command = (function () {
    function Command(msgData) {
      this.msgData = msgData;
      this.init();
    }

    Command.prototype.init = function () {
      this.parseType = null;
      this.command = null;
      return this.rankPrivelege = null;
    };

    Command.prototype.functionality = function (data) { };

    Command.prototype.hasPrivelege = function () {
      var user;
      user = data.users[this.msgData.fromID].getUser();
      switch (this.rankPrivelege) {
        case 'host':
          return user.permission === 5;
        case 'cohost':
          return user.permission >= 4;
        case 'mod':
          return user.permission >= 3;
        case 'manager':
          return user.permission >= 3;
        case 'bouncer':
          return user.permission >= 2;
        case 'featured':
          return user.permission >= 1;
        default:
          return true;
      }
    };

    Command.prototype.commandMatch = function () {
      var command, msg, _i, _len, _ref;
      msg = this.msgData.message;
      if (typeof this.command === 'string') {
        if (this.parseType === 'exact') {
          if (msg === this.command) {
            return true;
          } else {
            return false;
          }
        } else if (this.parseType === 'startsWith') {
          if (msg.substr(0, this.command.length) === this.command) {
            return true;
          } else {
            return false;
          }
        } else if (this.parseType === 'contains') {
          if (msg.indexOf(this.command) !== -1) {
            return true;
          } else {
            return false;
          }
        }
      } else if (typeof this.command === 'object') {
        _ref = this.command;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          command = _ref[_i];
          if (this.parseType === 'exact') {
            if (msg === command) {
              return true;
            }
          } else if (this.parseType === 'startsWith') {
            if (msg.substr(0, command.length) === command) {
              return true;
            }
          } else if (this.parseType === 'contains') {
            if (msg.indexOf(command) !== -1) {
              return true;
            }
          }
        }
        return false;
      }
    };

    Command.prototype.evalMsg = function () {
      if (this.commandMatch() && this.hasPrivelege()) {
        this.functionality();
        return true;
      } else {
        return false;
      }
    };

    return Command;

  })();

  cookieCommand = (function (_super) {
    __extends(cookieCommand, _super);

    function cookieCommand() {
      _ref = cookieCommand.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    cookieCommand.prototype.init = function () {
      this.command = 'spliff';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'user';
    };

    cookieCommand.prototype.getCookie = function () {
      var c, cookies;
      cookies = ["a small joint", "an arizona green", "some white window", "some big bud", "some nice bubblegum quality", "some Holland hope", "sour diesel", "a vortex", "hmmm, silver haze", "some special queen", "a blue velvet", "some nice cinderalla quality"];
      c = Math.floor(Math.random() * cookies.length);
      return cookies[c];
    };

    cookieCommand.prototype.functionality = function () {
      var msg, r, user;
      msg = this.msgData.message;
      r = new RoomHelper();
      if (msg.substring(7, 8) === "@") {
        user = r.lookupUser(msg.substr(8));
        if (user === false) {
          API.sendChat("/em doesn't see '" + msg.substr(8) + "' in room and lights up by himself");
          return false;
        } else {
          return API.sendChat("@" + user.username + ", @" + this.msgData.from + " shares " + this.getCookie() + " with yuh. Puff, puff give.");
        }
      }
    };

    return cookieCommand;

  })(Command);

  newSongsCommand = (function (_super) {
    __extends(newSongsCommand, _super);

    function newSongsCommand() {
      _ref1 = newSongsCommand.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    newSongsCommand.prototype.init = function () {
      this.command = '!newsongs';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'user';
    };

    newSongsCommand.prototype.functionality = function () {
      //var arts, cMedia, chans, chooseRandom, mChans, msg, selections, u, _ref2;
      //mChans = this.memberChannels.slice(0);
      //chans = this.channels.slice(0);
      //arts = this.artists.slice(0);
      //chooseRandom = function (list) {
      //  var l, r;
      //  l = list.length;
      //  r = Math.floor(Math.random() * l);
      //  return list.splice(r, 1);
      //};
      //selections = {
      //  channels: [],
      //  artist: ''
      //};
      //u = data.users[this.msgData.fromID].getUser().username;
      //if (u.indexOf("MistaDubstep") !== -1) {
      //  selections['channels'].push('MistaDubstep');
      //} else if (u.indexOf("Underground Promotions") !== -1) {
      //  selections['channels'].push('UndergroundDubstep');
      //} else {
      //  selections['channels'].push(chooseRandom(mChans));
      //}
      //selections['channels'].push(chooseRandom(chans));
      //selections['channels'].push(chooseRandom(chans));
      //cMedia = API.getMedia();
      //if ((cMedia != null) && (_ref2 = cMedia.author, __indexOf.call(arts, _ref2) >= 0)) {
      //  selections['artist'] = cMedia.author;
      //} else {
      //  selections['artist'] = chooseRandom(arts);
      //}
      //msg = "Everyone's heard that " + selections['artist'] + " track! Get new music from http://youtube.com/" + selections['channels'][0] + " http://youtube.com/" + selections['channels'][1] + " or http://youtube.com/" + selections['channels'][2];
      return API.sendChat("That's a popular song...you wanna get some new music from youtube.com!");
    };

    newSongsCommand.prototype.memberChannels = ["Reggae"];

    newSongsCommand.prototype.channels = ["Reggae"];

    newSongsCommand.prototype.artists = ["Chronixx", "Busy Signal", "Vybz", "Reggae"];

    return newSongsCommand;

  })(Command);

  whyWootCommand = (function (_super) {
    __extends(whyWootCommand, _super);

    function whyWootCommand() {
      _ref2 = whyWootCommand.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    whyWootCommand.prototype.init = function () {
      this.command = '!whywoot';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'user';
    };

    whyWootCommand.prototype.functionality = function () {
      var msg, nameIndex;
      msg = "Pszzzzzt, yuh AFK? If you don't woot, yuh gone. Use our AutoWoot provided by: http://x.co/plugxx - get the RFA ext while you're at it http://x.co/rfaext";
      if ((nameIndex = this.msgData.message.indexOf('@')) !== -1) {
        return API.sendChat(this.msgData.message.substr(nameIndex) + ', ' + msg);
      } else {
        return API.sendChat(msg);
      }
    };

    return whyWootCommand;

  })(Command);

  themeCommand = (function (_super) {
    __extends(themeCommand, _super);

    function themeCommand() {
      _ref3 = themeCommand.__super__.constructor.apply(this, arguments);
      return _ref3;
    }

    themeCommand.prototype.init = function () {
      this.command = '!theme';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'user';
    };

    themeCommand.prototype.functionality = function () {
      var msg;
      msg = "All reggae all the time! ";
      msg += "Reggae, Rastadub, Reggae Dancehall";
      return API.sendChat(msg);
    };

    return themeCommand;

  })(Command);

  rulesCommand = (function (_super) {
    __extends(rulesCommand, _super);

    function rulesCommand() {
      _ref4 = rulesCommand.__super__.constructor.apply(this, arguments);
      return _ref4;
    }

    rulesCommand.prototype.init = function () {
      this.command = '!rules';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'user';
    };

    rulesCommand.prototype.functionality = function () {
      var msg;
      msg = "1) Play good sound quality music. ";
      msg += "2) Don't replay a song on the room history. 3) Max song limit 8 minutes. ";
      msg += "4) DO NOT GO AWAY FROM KEYBOARD ON DECK! Please WOOT on DJ Booth and respect your fellow DJs!";
      return API.sendChat(msg);
    };

    return rulesCommand;

  })(Command);

  roomHelpCommand = (function (_super) {
    __extends(roomHelpCommand, _super);

    function roomHelpCommand() {
      _ref5 = roomHelpCommand.__super__.constructor.apply(this, arguments);
      return _ref5;
    }

    roomHelpCommand.prototype.init = function () {
      this.command = '!roomhelp';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'user';
    };

    roomHelpCommand.prototype.functionality = function () {
      var msg1, msg2;
      msg1 = "Welcome to Reggae For All! ";
      msg1 += "Click the 'Join Waitlist' button and wait your turn to play music. Most reggae music allowed, type '!theme' for specifics. ";
      msg2 = "Stay active while waiting to play your song or a I'll remove you. Play good quality music that hasn't been played recently (check room history).";
      API.sendChat(msg1);
      return setTimeout((function () {
        return API.sendChat(msg2);
      }), 750);
    };

    return roomHelpCommand;

  })(Command);

  sourceCommand = (function (_super) {
    __extends(sourceCommand, _super);

    function sourceCommand() {
      _ref6 = sourceCommand.__super__.constructor.apply(this, arguments);
      return _ref6;
    }

    sourceCommand.prototype.init = function () {
      this.command = ['/source', '/sourcecode', '/author'];
      this.parseType = 'exact';
      return this.rankPrivelege = 'user';
    };

    sourceCommand.prototype.functionality = function () {
      var msg;
      msg = 'Ported from source by Backus - modified by webdevbrian and flanka_mon';
      return API.sendChat(msg);
    };

    return sourceCommand;

  })(Command);

  wootCommand = (function (_super) {
    __extends(wootCommand, _super);

    function wootCommand() {
      _ref7 = wootCommand.__super__.constructor.apply(this, arguments);
      return _ref7;
    }

    wootCommand.prototype.init = function () {
      this.command = '!woot';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'user';
    };

    wootCommand.prototype.functionality = function () {
      var msg, nameIndex;
      msg = "Please WOOT on DJ Booth and support your fellow DJs! AutoWoot: http://x.co/rfaext and http://x.co/plugxx";
      if ((nameIndex = this.msgData.message.indexOf('@')) !== -1) {
        return API.sendChat(this.msgData.message.substr(nameIndex) + ', ' + msg);
      } else {
        return API.sendChat(msg);
      }
    };

    return wootCommand;

  })(Command);

  badQualityCommand = (function (_super) {
    __extends(badQualityCommand, _super);

    function badQualityCommand() {
      _ref8 = badQualityCommand.__super__.constructor.apply(this, arguments);
      return _ref8;
    }

    badQualityCommand.prototype.init = function () {
      this.command = '.128';
      this.parseType = 'exact';
      return this.rankPrivelege = 'mod';
    };

    badQualityCommand.prototype.functionality = function () {
      var msg;
      msg = "Flagged for bad sound quality. Where do you get your music? The garbage can? Don't play this low quality tune again!";
      return API.sendChat(msg);
    };

    return badQualityCommand;

  })(Command);

  downloadCommand = (function (_super) {
    __extends(downloadCommand, _super);

    function downloadCommand() {
      _ref9 = downloadCommand.__super__.constructor.apply(this, arguments);
      return _ref9;
    }

    downloadCommand.prototype.init = function () {
      this.command = '!download';
      this.parseType = 'exact';
      return this.rankPrivelege = 'user';
    };

    downloadCommand.prototype.functionality = function () {
      var e, eAuthor, eTitle, msg;
      if (data.currentsong == null) {
        return;
      }
      e = encodeURIComponent;
      eAuthor = e(data.currentsong.author);
      eTitle = e(data.currentsong.title);
      msg = "Try this link for HIGH QUALITY DOWNLOAD: http://google.com/#hl=en&q=";
      msg += eAuthor + "%20-%20" + eTitle;
      msg += "%20site%3Azippyshare.com%20OR%20site%3Asoundowl.com%20OR%20site%3Ahulkshare.com%20OR%20site%3Asoundcloud.com";
      return API.sendChat(msg);
    };

    return downloadCommand;

  })(Command);

  statusCommand = (function (_super) {
    __extends(statusCommand, _super);

    function statusCommand() {
      _ref12 = statusCommand.__super__.constructor.apply(this, arguments);
      return _ref12;
    }

    statusCommand.prototype.init = function () {
      this.command = '!status';
      this.parseType = 'exact';
      return this.rankPrivelege = 'user';
    };

    statusCommand.prototype.functionality = function () {
      var day, hour, launch, lt, meridian, min, month, msg, t, totals;
      lt = data.launchTime;
      month = lt.getMonth() + 1;
      day = lt.getDate();
      hour = lt.getHours();
      meridian = hour % 12 === hour ? 'AM' : 'PM';
      min = lt.getMinutes();
      min = min < 10 ? '0' + min : min;
      t = data.totalVotingData;
      t['songs'] = data.songCount;
      launch = 'Initiated ' + month + '/' + day + ' ' + hour + ':' + min + ' ' + meridian + '. ';
      totals = '' + t.songs + ' songs have been played, accumulating ' + t.woots + ' woots, ' + t.mehs + ' mehs, and ' + t.curates + ' queues.';
      msg = launch + totals;
      return API.sendChat(msg);
    };

    return statusCommand;

  })(Command);

  unhookCommand = (function (_super) {
    __extends(unhookCommand, _super);

    function unhookCommand() {
      _ref13 = unhookCommand.__super__.constructor.apply(this, arguments);
      return _ref13;
    }

    unhookCommand.prototype.init = function () {
      this.command = '!unhook events all';
      this.parseType = 'exact';
      return this.rankPrivelege = 'host';
    };

    unhookCommand.prototype.functionality = function () {
      API.sendChat('Unhooking all events...');
      return undoHooks();
    };

    return unhookCommand;

  })(Command);

  dieCommand = (function (_super) {
    __extends(dieCommand, _super);

    function dieCommand() {
      _ref14 = dieCommand.__super__.constructor.apply(this, arguments);
      return _ref14;
    }

    dieCommand.prototype.init = function () {
      this.command = '!die';
      this.parseType = 'exact';
      return this.rankPrivelege = 'host';
    };

    dieCommand.prototype.functionality = function () {
      API.sendChat('Unhooking Events...');
      undoHooks();
      API.sendChat('Deleting bot data...');
      data.implode();
      return API.sendChat('Consider me dead');
    };

    return dieCommand;

  })(Command);

  reloadCommand = (function (_super) {
    __extends(reloadCommand, _super);

    function reloadCommand() {
      _ref15 = reloadCommand.__super__.constructor.apply(this, arguments);
      return _ref15;
    }

    reloadCommand.prototype.init = function () {
      this.command = '!reload';
      this.parseType = 'exact';
      return this.rankPrivelege = 'host';
    };

    reloadCommand.prototype.functionality = function () {
      var pupSrc;
      API.sendChat('brb');
      undoHooks();
      pupSrc = data.pupScriptUrl;
      data.implode();
      return $.getScript(pupSrc);
    };

    return reloadCommand;

  })(Command);

  lockCommand = (function (_super) {
    __extends(lockCommand, _super);

    function lockCommand() {
      _ref16 = lockCommand.__super__.constructor.apply(this, arguments);
      return _ref16;
    }

    lockCommand.prototype.init = function () {
      this.command = '!lock';
      this.parseType = 'exact';
      return this.rankPrivelege = 'mod';
    };

    lockCommand.prototype.functionality = function () {
      return data.lockBooth();
    };

    return lockCommand;

  })(Command);

  unlockCommand = (function (_super) {
    __extends(unlockCommand, _super);

    function unlockCommand() {
      _ref17 = unlockCommand.__super__.constructor.apply(this, arguments);
      return _ref17;
    }

    unlockCommand.prototype.init = function () {
      this.command = '!unlock';
      this.parseType = 'exact';
      return this.rankPrivelege = 'mod';
    };

    unlockCommand.prototype.functionality = function () {
      return data.unlockBooth();
    };

    return unlockCommand;

  })(Command);

  swapCommand = (function (_super) {
    __extends(swapCommand, _super);

    function swapCommand() {
      _ref18 = swapCommand.__super__.constructor.apply(this, arguments);
      return _ref18;
    }

    swapCommand.prototype.init = function () {
      this.command = '!swap';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'mod';
    };

    swapCommand.prototype.functionality = function () {
      var msg, r, swapRegex, userAdd, userRemove, users;
      msg = this.msgData.message;
      swapRegex = new RegExp("^/swap @(.+) for @(.+)$");
      users = swapRegex.exec(msg).slice(1);
      r = new RoomHelper();
      if (users.length === 2) {
        userRemove = r.lookupUser(users[0]);
        userAdd = r.lookupUser(users[1]);
        if (userRemove === false || userAdd === false) {
          API.sendChat('Error parsing one or both names');
          return false;
        } else {
          return data.lockBooth(function () {
            API.moderateRemoveDJ(userRemove.id);
            API.sendChat("Removing " + userRemove.username + "...");
            return setTimeout(function () {
              API.moderateAddDJ(userAdd.id);
              API.sendChat("Adding " + userAdd.username + "...");
              return setTimeout(function () {
                return data.unlockBooth();
              }, 1500);
            }, 1500);
          });
        }
      } else {
        return API.sendChat("Command didn't parse into two seperate usernames");
      }
    };

    return swapCommand;

  })(Command);

  popCommand = (function (_super) {
    __extends(popCommand, _super);

    function popCommand() {
      _ref19 = popCommand.__super__.constructor.apply(this, arguments);
      return _ref19;
    }

    popCommand.prototype.init = function () {
      this.command = '!pop';
      this.parseType = 'exact';
      return this.rankPrivelege = 'mod';
    };

    popCommand.prototype.functionality = function () {
      var waitList, popDj;
      waitList = API.getWaitList();
      popDj = waitList[waitList.length - 1];
      return API.moderateRemoveDJ(popDj.id);
    };

    return popCommand;

  })(Command);

  pushCommand = (function (_super) {
    __extends(pushCommand, _super);

    function pushCommand() {
      _ref20 = pushCommand.__super__.constructor.apply(this, arguments);
      return _ref20;
    }

    pushCommand.prototype.init = function () {
      this.command = '!push';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'mod';
    };

    pushCommand.prototype.functionality = function () {
      var msg, name, r, user;
      msg = this.msgData.message;
      if (msg.length > this.command.length + 2) {
        name = msg.substr(this.command.length + 2);
        r = new RoomHelper();
        user = r.lookupUser(name);
        if (user !== false) {
          return API.moderateAddDJ(user.id);
        }
      }
    };

    return pushCommand;

  })(Command);

  resetAfkCommand = (function (_super) {
    __extends(resetAfkCommand, _super);

    function resetAfkCommand() {
      _ref21 = resetAfkCommand.__super__.constructor.apply(this, arguments);
      return _ref21;
    }

    resetAfkCommand.prototype.init = function () {
      this.command = '!resetafk';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'mod';
    };

    resetAfkCommand.prototype.functionality = function () {
      var id, name, u, _ref22;
      if (this.msgData.message.length > 10) {
        name = this.msgData.message.substring(11);
        _ref22 = data.users;
        for (id in _ref22) {
          u = _ref22[id];
          if (u.getUser().username === name) {
            u.updateActivity();
            API.sendChat('@' + u.getUser().username + '\'s AFK time has been reset.');
            return;
          }
        }
        API.sendChat('Not sure who ' + name + ' is');
      } else {
        API.sendChat('Yo Gimme a name r-tard');
      }
    };

    return resetAfkCommand;

  })(Command);

  forceSkipCommand = (function (_super) {
    __extends(forceSkipCommand, _super);

    function forceSkipCommand() {
      _ref22 = forceSkipCommand.__super__.constructor.apply(this, arguments);
      return _ref22;
    }

    forceSkipCommand.prototype.init = function () {
      this.command = '!forceskip';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'mod';
    };

    forceSkipCommand.prototype.functionality = function () {
      var msg, param;
      msg = this.msgData.message;
      if (msg.length > 11) {
        param = msg.substr(11);
        if (param === 'enable') {
          data.forceSkip = true;
          return API.sendChat("Forced skipping enabled.");
        } else if (param === 'disable') {
          data.forceSkip = false;
          return API.sendChat("Forced skipping disabled.");
        }
      }
    };

    return forceSkipCommand;

  })(Command);

  overplayedCommand = (function (_super) {
    __extends(overplayedCommand, _super);

    function overplayedCommand() {
      _ref23 = overplayedCommand.__super__.constructor.apply(this, arguments);
      return _ref23;
    }

    overplayedCommand.prototype.init = function () {
      this.command = '!overplayed';
      this.parseType = 'exact';
      return this.rankPrivelege = 'user';
    };

    overplayedCommand.prototype.functionality = function () {
      return API.sendChat("View the list of songs we consider overplayed and suggest additions at http://reggaeforall.com");
    };

    return overplayedCommand;

  })(Command);

  uservoiceCommand = (function (_super) {
    __extends(uservoiceCommand, _super);

    function uservoiceCommand() {
      _ref24 = uservoiceCommand.__super__.constructor.apply(this, arguments);
      return _ref24;
    }

    uservoiceCommand.prototype.init = function () {
      this.command = ['/uservoice', '/idea'];
      this.parseType = 'exact';
      return this.rankPrivelege = 'user';
    };

    uservoiceCommand.prototype.functionality = function () {
      var msg;
      msg = 'Have an idea for the room, our bot, or an event?  Awesome! Submit it to our uservoice and we\'ll get started on it: http://reggaeforall.com';
      msg += ' (please don\'t ask for mod)';
      return API.sendChat(msg);
    };

    return uservoiceCommand;

  })(Command);

  skipCommand = (function (_super) {
    __extends(skipCommand, _super);

    function skipCommand() {
      _ref25 = skipCommand.__super__.constructor.apply(this, arguments);
      return _ref25;
    }

    skipCommand.prototype.init = function () {
      this.command = '!skip';
      this.parseType = 'exact';
      return this.rankPrivelege = 'bouncer';
    };

    skipCommand.prototype.functionality = function () {
      return API.moderateForceSkip();
    };

    return skipCommand;

  })(Command);

  whyMehCommand = (function (_super) {
    __extends(whyMehCommand, _super);

    function whyMehCommand() {
      _ref26 = whyMehCommand.__super__.constructor.apply(this, arguments);
      return _ref26;
    }

    whyMehCommand.prototype.init = function () {
      this.command = '!whymeh';
      this.parseType = 'exact';
      return this.rankPrivelege = 'user';
    };

    whyMehCommand.prototype.functionality = function () {
      var msg;
      msg = "Reserve Mehs for songs that are a) extremely overplayed b) off genre c) absolutely god awful or d) troll songs. ";
      msg += "If you simply aren't feeling a song, then remain neutral";
      return API.sendChat(msg);
    };

    return whyMehCommand;

  })(Command);

  commandsCommand = (function (_super) {
    __extends(commandsCommand, _super);

    function commandsCommand() {
      _ref27 = commandsCommand.__super__.constructor.apply(this, arguments);
      return _ref27;
    }

    commandsCommand.prototype.init = function () {
      this.command = '!commands';
      this.parseType = 'exact';
      return this.rankPrivelege = 'user';
    };

    commandsCommand.prototype.functionality = function () {
      var allowedUserLevels, c, cc, cmd, msg, user, _i, _j, _len, _len1, _ref28, _ref29;
      allowedUserLevels = [];
      user = API.getUser(this.msgData.fromID);
      window.capturedUser = user;
      if (user.permission > 2) {
        allowedUserLevels = ['user', 'mod', 'host'];
      } else if (user.permission > 1) {
        allowedUserLevels = ['user', 'bouncer', 'mod'];
      } else {
        allowedUserLevels = ['user'];
      }
      msg = '';
      for (_i = 0, _len = cmds.length; _i < _len; _i++) {
        cmd = cmds[_i];
        if (cmd) {
          c = new cmd('');
          if (_ref28 = c.rankPrivelege, __indexOf.call(allowedUserLevels, _ref28) >= 0) {
            if (typeof c.command === "string") {
              msg += c.command + ', ';
            } else if (typeof c.command === "object") {
              _ref29 = c.command;
              for (_j = 0, _len1 = _ref29.length; _j < _len1; _j++) {
                cc = _ref29[_j];
                msg += cc + ', ';
              }
            }
          }
        } else {
          console.log("Bad cmd or missing function definition: index: " + _i + " name: " + cmd);
        }
      }
      msg = msg.substring(0, msg.length - 2);
      return API.sendChat(msg);
    };

    return commandsCommand;

  })(Command);

  disconnectLookupCommand = (function (_super) {
    __extends(disconnectLookupCommand, _super);

    function disconnectLookupCommand() {
      _ref28 = disconnectLookupCommand.__super__.constructor.apply(this, arguments);
      return _ref28;
    }

    disconnectLookupCommand.prototype.init = function () {
      this.command = '!dclookup';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'mod';
    };

    disconnectLookupCommand.prototype.functionality = function () {
      var cmd, dcHour, dcLookupId, dcMeridian, dcMins, dcSongsAgo, dcTimeStr, dcUser, disconnectInstances, givenName, id, recentDisconnect, resp, u, _i, _len, _ref29, _ref30;
      cmd = this.msgData.message;
      if (cmd.length > 11) {
        givenName = cmd.slice(11);
        _ref29 = data.users;
        for (id in _ref29) {
          u = _ref29[id];
          if (u.getUser().username === givenName) {
            dcLookupId = id;
            disconnectInstances = [];
            _ref30 = data.userDisconnectLog;
            for (_i = 0, _len = _ref30.length; _i < _len; _i++) {
              dcUser = _ref30[_i];
              if (dcUser.id === dcLookupId) {
                disconnectInstances.push(dcUser);
              }
            }
            if (disconnectInstances.length > 0) {
              resp = u.getUser().username + ' has disconnected ' + disconnectInstances.length.toString() + ' time';
              if (disconnectInstances.length === 1) {
                resp += '. ';
              } else {
                resp += 's. ';
              }
              recentDisconnect = disconnectInstances.pop();
              dcHour = recentDisconnect.time.getHours();
              dcMins = recentDisconnect.time.getMinutes();
              if (dcMins < 10) {
                dcMins = '0' + dcMins.toString();
              }
              dcMeridian = dcHour % 12 === dcHour ? 'AM' : 'PM';
              dcTimeStr = '' + dcHour + ':' + dcMins + ' ' + dcMeridian;
              dcSongsAgo = data.songCount - recentDisconnect.songCount;
              resp += 'Their most recent disconnect was at ' + dcTimeStr + ' (' + dcSongsAgo + ' songs ago). ';
              if (recentDisconnect.waitlistPosition !== void 0) {
                resp += 'They were ' + recentDisconnect.waitlistPosition + ' song';
                if (recentDisconnect.waitlistPosition > 1) {
                  resp += 's';
                }
                resp += ' away from the DJ booth.';
              } else {
                resp += 'They were not on the waitlist.';
              }
              API.sendChat(resp);
              return;
            } else {
              API.sendChat("I haven't seen " + u.getUser().username + " disconnect.");
              return;
            }
          }
        }
        return API.sendChat("I don't see a user in the room named '" + givenName + "'.");
      }
    };

    return disconnectLookupCommand;

  })(Command);

  voteRatioCommand = (function (_super) {
    __extends(voteRatioCommand, _super);

    function voteRatioCommand() {
      _ref29 = voteRatioCommand.__super__.constructor.apply(this, arguments);
      return _ref29;
    }

    voteRatioCommand.prototype.init = function () {
      this.command = '!voteratio';
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'mod';
    };

    voteRatioCommand.prototype.functionality = function () {
      var msg, name, r, u, votes;
      r = new RoomHelper();
      msg = this.msgData.message;
      if (msg.length > 12) {
        name = msg.substr(12);
        u = r.lookupUser(name);
        if (u !== false) {
          votes = r.userVoteRatio(u);
          msg = u.username + " has wooted " + votes['woot'].toString() + " time";
          if (votes['woot'] === 1) {
            msg += ', ';
          } else {
            msg += 's, ';
          }
          msg += "and meh'd " + votes['meh'].toString() + " time";
          if (votes['meh'] === 1) {
            msg += '. ';
          } else {
            msg += 's. ';
          }
          msg += "Their woot:vote ratio is " + votes['positiveRatio'].toString() + ".";
          return API.sendChat(msg);
        } else {
          return API.sendChat("I don't recognize a user named '" + name + "'");
        }
      } else {
        return API.sendChat("I'm not sure what you want from me...");
      }
    };

    return voteRatioCommand;

  })(Command);

  avgVoteRatioCommand = (function (_super) {
    __extends(avgVoteRatioCommand, _super);

    function avgVoteRatioCommand() {
      _ref30 = avgVoteRatioCommand.__super__.constructor.apply(this, arguments);
      return _ref30;
    }

    avgVoteRatioCommand.prototype.init = function () {
      this.command = '!avgvoteratio';
      this.parseType = 'exact';
      return this.rankPrivelege = 'mod';
    };

    avgVoteRatioCommand.prototype.functionality = function () {
      var averageRatio, msg, r, ratio, roomRatios, uid, user, userRatio, votes, _i, _len, _ref31;
      roomRatios = [];
      r = new RoomHelper();
      _ref31 = data.voteLog;
      for (uid in _ref31) {
        votes = _ref31[uid];
        user = data.users[uid].getUser();
        userRatio = r.userVoteRatio(user);
        roomRatios.push(userRatio['positiveRatio']);
      }
      averageRatio = 0.0;
      for (_i = 0, _len = roomRatios.length; _i < _len; _i++) {
        ratio = roomRatios[_i];
        averageRatio += ratio;
      }
      averageRatio = averageRatio / roomRatios.length;
      msg = "Accounting for " + roomRatios.length.toString() + " user ratios, the average room ratio is " + averageRatio.toFixed(2).toString() + ".";
      return API.sendChat(msg);
    };

    return avgVoteRatioCommand;

  })(Command);

  fortuneCommand = (function (_super) {
    __extends(fortuneCommand, _super);

    function fortuneCommand() {
      var ref = fortuneCommand.__super__.constructor.apply(this, arguments);
      return ref;
    }

    fortuneCommand.prototype.init = function () {
      this.command = ['!fortune'];
      this.parseType = 'startsWith';
      return this.rankPrivelege = 'user';
    };

    fortuneCommand.prototype.functionality = function () {
      var fortune = RastaFortuneSvc.getFortune();
      return API.sendChat(fortune);
    };

    return fortuneCommand;

  })(Command);

  cmds = [cookieCommand, newSongsCommand, whyWootCommand, themeCommand, rulesCommand, roomHelpCommand, sourceCommand, wootCommand, badQualityCommand, downloadCommand, statusCommand, unhookCommand, dieCommand, reloadCommand, lockCommand, unlockCommand, swapCommand, popCommand, pushCommand, overplayedCommand, uservoiceCommand, whyMehCommand, skipCommand, commandsCommand, resetAfkCommand, forceSkipCommand, disconnectLookupCommand, voteRatioCommand, avgVoteRatioCommand, fortuneCommand];

  chatCommandDispatcher = function (chat) {
    var c, cmd, _i, _len, _results;
    chatUniversals(chat);
    _results = [];
    for (_i = 0, _len = cmds.length; _i < _len; _i++) {
      cmd = cmds[_i];
      if (cmd) {
        c = new cmd(chat);
        if (c.evalMsg()) {
          break;
        } else {
          _results.push(void 0);
        }
      } else {
        console.log("Bad cmd or missing function definition: index: " + _i + " name: " + cmd);
      }
    }
    return _results;
  };

  updateVotes = function (obj) {
    data.currentwoots = obj.positive;
    data.currentmehs = obj.negative;
    return data.currentcurates = obj.curates;
  };

  announceCurate = function (obj) {
    return API.sendChat("/em: " + obj.user.username + " grabbed this song!");
  };

  handleUserJoin = function (user) {
    data.userJoin(user);
    data.users[user.id].updateActivity();
    return API.sendChat("/em: " + user.username + " has joined the Room!");
  };

  handleNewSong = function (obj) {
    var songId;
    data.intervalMessages();
    if (data.currentsong === null) {
      data.newSong();
    } else {
      API.sendChat("/em: Just played " + data.currentsong.title + " by " + data.currentsong.author + ".");
      //API.sendChat("/em: Just played " + data.currentsong.title + " by " + data.currentsong.author + ". Stats: Woots: " + data.currentwoots + ", Mehs: " + data.currentmehs + ", Loves: " + data.currentcurates + ".");
      data.newSong();
      document.getElementById("woot").click();
    }
    if (data.forceSkip) {
      songId = obj.media.id;
      return setTimeout(function () {
        var cMedia;
        cMedia = API.getMedia();
        if (cMedia.id === songId) {
          return API.moderateForceSkip();
        }
      }, obj.media.duration * 1000);
    }
  };

  handleVote = function (obj) {
    data.users[obj.user.id].updateActivity();
    return data.users[obj.user.id].updateVote(obj.vote);
  };

  handleUserLeave = function (user) {
    var disconnectStats, i, u, _i, _len, _ref31;
    disconnectStats = {
      id: user.id,
      time: new Date(),
      songCount: data.songCount
    };
    i = 0;
    _ref31 = data.internalWaitlist;
    for (_i = 0, _len = _ref31.length; _i < _len; _i++) {
      u = _ref31[_i];
      if (u.id === user.id) {
        disconnectStats['waitlistPosition'] = i - 1;
        data.setInternalWaitlist();
        break;
      } else {
        i++;
      }
    }
    data.userDisconnectLog.push(disconnectStats);
    return data.users[user.id].inRoom(false);
  };

  antispam = function (chat) {
    var plugRoomLinkPatt, sender;
    plugRoomLinkPatt = /(\bhttps?:\/\/(www.)?plug\.dj[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    if (plugRoomLinkPatt.exec(chat.message)) {
      sender = API.getUser(chat.fromID);
      if (!sender.ambassador && !sender.moderator && !sender.owner && !sender.superuser) {
        if (!data.users[chat.fromID]["protected"]) {
          API.sendChat("Don't spam room links!");
          return API.moderateDeleteChat(chat.chatID);
        } else {
          return API.sendChat("I'm supposed to kick you, but you're just too darn pretty.");
        }
      }
    }
  };

  beggar = function (chat) {
    var msg, r, responses;
    msg = chat.message.toLowerCase();
    responses = ["No begging please!"];
    r = Math.floor(Math.random() * responses.length);
    if (msg.indexOf('fan me') !== -1 || msg.indexOf('fan for fan') !== -1 || msg.indexOf('fan pls') !== -1 || msg.indexOf('fan4fan') !== -1 || msg.indexOf('add me to fan') !== -1) {
      return API.sendChat(responses[r].replace("{beggar}", chat.from));
    }
  };

  chatUniversals = function (chat) {
    data.activity(chat);
    antispam(chat);
    return beggar(chat);
  };

  hook = function (apiEvent, callback) {
    return API.on(apiEvent, callback);
  };

  unhook = function (apiEvent, callback) {
    return API.off(apiEvent, callback);
  };

  apiHooks = [
    {
      'event': API.ROOM_SCORE_UPDATE,
      'callback': updateVotes
    }, {
      'event': API.CURATE_UPDATE,
      'callback': announceCurate
    }, {
      'event': API.USER_JOIN,
      'callback': handleUserJoin
    }, {
      'event': API.DJ_ADVANCE,
      'callback': handleNewSong
    }, {
      'event': API.VOTE_UPDATE,
      'callback': handleVote
    }, {
      'event': API.CHAT,
      'callback': chatCommandDispatcher
    }, {
      'event': API.USER_LEAVE,
      'callback': handleUserLeave
    }
  ];

  initHooks = function () {
    var pair, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = apiHooks.length; _i < _len; _i++) {
      pair = apiHooks[_i];
      _results.push(hook(pair['event'], pair['callback']));
    }
    return _results;
  };

  undoHooks = function () {
    var pair, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = apiHooks.length; _i < _len; _i++) {
      pair = apiHooks[_i];
      _results.push(unhook(pair['event'], pair['callback']));
    }
    return _results;
  };

  RastaFortuneSvc = {
    _fortuneLen: 40,
    _fortunes: new Array(),
    init: function () {
      this._fortunes[0] = "Everyting will come yuh way mon.";
      this._fortunes[1] = "Now is di time to try someting new.";
      this._fortunes[2] = "A handful of payshense is wort more dan a bushel of brains.";
      this._fortunes[3] = "Yuh hav an active mind and a keen imagination.";
      this._fortunes[4] = "Don't let doubt and suspicion bar yuh pragress.";
      this._fortunes[5] = "Yuh will mek a faatune wit yuh friend.";
      this._fortunes[6] = "Yuh emotional nature is strong and sensitive.";
      this._fortunes[7] = "Yuh will find a treasure at dis web site.";
      this._fortunes[8] = "Sing and rejoice mon, faatune is smiling pon yuh.";
      this._fortunes[9] = "Yuh have remarkable power which yuh are not using.";
      this._fortunes[10] = "Yuh venture will be a success.";
      this._fortunes[11] = "Accept di next proposition yuh hear.";
      this._fortunes[12] = "A cheerful letta or message is pon its way to yuh.";
      this._fortunes[13] = "Yuh are just beginning to liv mon.";
      this._fortunes[14] = "Love is a rolla coasta, ee hav ups and downs.";
      this._fortunes[15] = "Yuh will find a treasure at dis web site.";
      this._fortunes[16] = "Di great joy in life is doing what people seh yuh caa duh.";
      this._fortunes[17] = "Yuh are a bundle of energy, always on di go.";
      this._fortunes[18] = "Yuh dearest wish will come true.";
      this._fortunes[19] = "Yuh have at yuh command di wisdom of di ages - JAH Rastafari!";
      this._fortunes[20] = "Yuh will travel to many places. Guh check out Jamaica mon.";
      this._fortunes[21] = "Yuh careful & systematic in yuh business arrangements. Yuh mus ee smart.";
      this._fortunes[22] = "To one who waits, a moment seems a year.";
      this._fortunes[23] = "Yuh wisdom has kept yuh far away from danger.";
      this._fortunes[24] = "Yuh will have a fine capacity fi di enjoyment af life.";
      this._fortunes[25] = "Yuh will reach di height of success in whatever yuh duh.";
      this._fortunes[26] = "Consolidate radder dan expand yuh business in di near future.";
      this._fortunes[27] = "Yuh principles mean more to yuh dan any money ar success.";
      this._fortunes[28] = "Yuh have a deep appreciation of di arts and music - especially reggae, yuh knoa wha mi a seh.";
      this._fortunes[29] = "Yuh display di wonderful traits of charm and courtesy.";
      this._fortunes[30] = "Yuh talented in many ways.";
      this._fortunes[31] = "Good faatune awaits yuh at di end of di day. Chill out and smoke a spliff.";
      this._fortunes[32] = "Treat everyone as a bredren or a daughta.";
      this._fortunes[33] = "Yuh are di guiding star of his Excellence. Haile Selassie I, JAH, RASTAFARI!";
      this._fortunes[34] = "Yuh are open and honest in yuh philosophy of love.";
      this._fortunes[35] = "Simplicity should be yuh theme in dress.";
      this._fortunes[36] = "Yuh will be faatunate in di opportunities presented to yuh from JAH.";
      this._fortunes[37] = "Yuh can open doors with yuh charm and patience.";
      this._fortunes[38] = "Yuh talents will be recognized and suitably rewarded.";
      this._fortunes[39] = "Don't be hasty, prosperity will knock on yuh door soon. Light up a splif and drink some irish moss.";
    },
    getFortune: function () {
      var now = new Date();
      var seed = now.getTime() % 0xffffffff;

      seed = (0x015a4e35 * seed) % 0x7fffffff;
      var random = (seed >> 16) % this._fortuneLen;

      return this._fortunes[random];
    }

  };

  initialize();

}).call(this);