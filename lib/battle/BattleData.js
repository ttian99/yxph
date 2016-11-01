import UserInfo from '../public/UserInfo.js';
import logger from '../es6-utils/cocos/console.js';
const console = logger('BattleData');

const cltype = {
  RED: '红',
  BLACK: '黑',
};

const BattleData = {
  DEFAULT_ORDER: -1, // 表示我已经移动棋子，正向服务器发送移动棋子命令，过程中回收玩家对棋盘的控制
  myColor: cltype.BLACK,
  ctrlSeat: 0, // 该谁走步
  chair0State: 0, // 表示座位0状态
  chair1State: 0, // 表示座位1状态
  redSide: 1, // 红色棋子座位号
  wMins: 0,  // 局时分
  wSecs: 0,  // 局时秒
  wStepMins: 0, // 步时分
  wStepSecs: 0, // 步时秒
  wLastMin: 0,  // 读秒分
  wLastSec: 0,  // 读秒秒
  unBaseMoney: 0, // 基础游戏币
  totalTime: 0, // 局时转换为秒
  totalStepTime: 0, // 步时转换为秒
  totalLastTime: 0, // 读秒转换为秒
  isSetStepTime: true, // 是否设置步时
  isSetLastTime: true, // 是否设置读秒
  isGamePlaying: false, // 是否游戏中
  isReConnect: false, // 是否是断线重连
  sceneid: null,  // 场景id
  roomid: null,   // 房间ID
  tableid: null,  // 桌子ID
  stepNum: 0, // 走棋总步数
  status: 0, // 0离开房间， 1进入房间
  record: [], // 用于记录玩家当前步已经悔棋，或者已经求和
  changeCtrlColor() {
    if (this.ctrlColor === '红') {
      this.ctrlColor = '黑';
    } else {
      this.ctrlColor = '红';
    }
  },

  resetRecord() {
    this.record = [];
  },

  setRecordSum(bvar) {
    if (!this.record[this.stepNum]) {
      this.record[this.stepNum] = [];
    }
    this.record[this.stepNum].sum = bvar;
  },

  getRecordSum() {
    if (!this.record[this.stepNum]) return false;
    return this.record[this.stepNum].sum;
  },

  setRecordUndo(bvar) {
    if (!this.record[this.stepNum]) {
      this.record[this.stepNum] = [];
    }
    this.record[this.stepNum].undo = bvar;
  },

  getRecordUndo() {
    if (!this.record[this.stepNum]) return false;
    return this.record[this.stepNum].undo;
  },

  setStepCnt(cnt) {
    this.stepNum = cnt;
    console.log('已经走步 ：' + this.stepNum);
  },

  getStepCnt() {
    return this.stepNum;
  },

  setGamePram(wMins, wSecs, wStepMins, wStepSecs, wLastMin, wLastSec, unBaseMoney) {
    this.wMins = wMins;
    this.wSecs = wSecs;
    this.wStepMins = wStepMins;
    this.wStepSecs = wStepSecs;
    this.wLastMin = wLastMin;
    this.wLastSec = wLastSec;
    this.unBaseMoney = unBaseMoney;
    this.totalTime = 60 * wMins + wSecs;
    this.totalStepTime = 60 * wStepMins + wStepSecs;
    this.totalLastTime = 60 * wLastMin + wLastSec;
    if (this.totalStepTime > this.totalTime) {
      this.isSetStepTime = false;
    } else {
      this.isSetStepTime = true;
    }
    if (this.totalLastTime === 0) {
      this.isSetLastTime = false;
    } else {
      this.isSetLastTime = true;
    }
  },

  getGamePram() {
    const data = {
      wMins: this.wMins,
      wSecs: this.wSecs,
      wStepMins: this.wStepMins,
      wStepSecs: this.wStepSecs,
      wLastMin: this.wLastMin,
      wLastSec: this.wLastSec,
      unBaseMoney: this.unBaseMoney,
    };
    return data;
  },

  getTotalTime() {
    return this.totalTime;
  },

  getStepTime() {
    return this.totalStepTime;
  },

  getLastTime() {
    return this.totalLastTime;
  },

  setRedSide(cCurOrder) {
    this.redSide = cCurOrder;
  },

  getRedSide() {
    return this.redSide;
  },

  setMyColor(str) {
    this.myColor = str;
  },

  getMyColor() {
    return this.myColor;
  },

  // 设置是否是掉线重连
  setIsReconnect(bvar) {
    this.isReConnect = bvar;
  },

  // 获取是否是断线重连
  getIsReconnect() {
    return this.isReConnect;
  },

  // 设置当前控制棋盘的座位ID
  setCtrlSeat(curOrder) {
    this.ctrlSeat = curOrder;
  },
  // 获取当前控制棋盘的座位ID
  getCtrlSeat() {
    return this.ctrlSeat;
  },

  resetCtrl() {
    this.setCtrlSeat(this.DEFAULT_ORDER);
  },

  // 是否拥有控制权
  ctrlEnable() {
    if (this.ctrlSeat === UserInfo.getMySeat()) {
      return true;
    }
    return false;
  },
  // 设置座位状态
  setChairState(state0, state1) {
    this.chair0State = state0;
    this.chair1State = state1;
  },
  // 获取座位状态
  getChairState(chair) {
    if (chair === 0) {
      return this.chair0State;
    } else if (chair === 1) {
      return this.chair1State;
    }
    return 0;
  },

  // 是否能够认输
  isCanGiveUp() {
    if (this.stepNum >= 10 && this.ctrlEnable()) {
      return true;
    }
    return false;
  },
};

export default BattleData;
