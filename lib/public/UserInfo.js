import logger from '../es6-utils/cocos/console.js';
const console = logger('SceneInfo');
import Events from './Events.js';
import Ltc from './Ltc.js';

const UserInfo = {
  data: {
    nick: '',
    points: '0',
    money: '0',
    faceid: '1',
  },

// 		int qq;
// 		std::string nick;
// 		std::string gender;
// 		int faceid;
// 		int age;
// 		int points; // 游戏积分
// 		int money; // 游戏币
// 		int win; // 胜局
// 		int lose; //  负局
// 		int tie; // 平局
// 		unsigned char escRate; // 退出率
// 		unsigned char winRate; // 胜率
// 		unsigned char offRate; // 掉线率
//    mySeat: 0, // 我的位置ID
//    roomid: 0, // 房间ID
//    tableid: 0, // 桌子id
//    level: 0 // 等级
  updateInfo(qq, nick, gender, faceid, age, points, money, win, lose, tie, escRate, winRate, offRate) {
    this.data.qq = qq;
    this.data.nick = nick;
    if (gender === 77 || gender === 1) {
      this.data.gender = '男';
    } else {
      this.data.gender = '女';
    }
    this.data.faceid = faceid;
    this.data.age = age;
    this.data.points = points;
    this.data.money = money;
    this.data.win = win;
    this.data.lose = lose;
    this.data.tie = tie;
    this.data.escRate = escRate;
    this.data.winRate = winRate;
    this.data.offRate = offRate;
    console.log('UserInfo : ' + JSON.stringify(this.data));
    Ltc.sendEvent(Events.Update_selfInfo, this.data);
  },

  setSitInfo(roomid, tableid, seatid, level) {
    this.data.roomid = roomid;
    this.data.tableid = tableid;
    this.data.seatid = seatid;
    this.data.level = level;
  },

  setRoomInfo(tableid, seatid) {
    this.data.tableid = tableid;
    this.data.seatid = seatid;
  },

  getMyQQ() {
    return this.data.qq;
  },

  getMyName() {
    return this.data.nick;
  },

  getMySeat() {
    return this.data.seatid;
  },

  getMyRoom() {
    return this.data.roomid;
  },

  getMyTable() {
    return this.data.tableid;
  },

  getMyPoints() {
    return this.data.points;
  },

  getMyMoney() {
    return this.data.money;
  },
  // 离开房间清空房间，桌子，座位等信息
  levelRoom() {
    this.data.seatid = undefined;
    this.data.roomid = undefined;
    this.data.tableid = undefined;
  },

  getGenderIsMan() {
    if (this.data.gender === '男') {
      return true;
    }
    return false;
  },
};

export default UserInfo;
