import logger from '../es6-utils/cocos/console.js';
const console = logger('PlayerInfo');
import {addSprite, addLabel} from '../es6-utils/cocos/base';
import {resIn} from '../loader/resource.js';
import Ltc from '../public/Ltc.js';
import {sliceLabel} from '../public/Extra.js';

const PlayerInfo = Ltc.Layer.extend({
  ctor(data) {
    this._super();
    this.mockData(data);
    this.initStatic();
  },
  mockData(data) {
    this.data = {nick: '', points: '', money: '', qq: '', gender: '', win: '', lose: '', tie: '', escRate: '', winRate: '' };
    this.data = data;
  },
  initStatic() {
    const data = this.data;
    // 背景
    const bg = this.bg = addSprite(this, resIn.ui.Ltc_XQ_playerInfobg, {
      x: 0, y: 0, align: 'center',
    });
    // 点击背景以外区域
    this.bgTouchesEvent(bg);
    const delY = 30;
    console.log('data = ' + JSON.stringify(this.data));
    let nickStr = (data.gender === '女') ? ('♀' + data.nick) : '♂' + data.nick;
    const pointStr = '积分: ' + data.points;
    const recordStr = '战绩: 胜' + data.win + '/负' + data.lose + '/和' + data.tie;
    const winRateStr = '胜率: ' + data.winRate + '%';
    // const rankStr = '排名: 101';
    const escRateStr = '逃跑率: ' + data.escRate + '%';

    nickStr = sliceLabel(nickStr, 30, 7);
    // 昵称
    addLabel(bg, nickStr, {
      x: 20, y: bg.height - 20, align: 'top-left', size: 30, color: cc.color(255, 235, 225),
    });
    // 积分
    addLabel(bg, pointStr, {
      x: 20, y: bg.height - 55, align: 'top-left', size: 18, color: cc.color(106, 40, 21),
    });
    // 战绩
    addLabel(bg, recordStr, {
      x: 20, y: bg.height - 55 - delY, align: 'top-left', size: 18, color: cc.color(106, 40, 21),
    });
    // 胜率
    addLabel(bg, winRateStr, {
      x: 20, y: bg.height - 55 - 2 * delY, align: 'top-left', size: 18, color: cc.color(106, 40, 21),
    });
    // 财富
    // const moneylb1 = addLabel(bg, '财富: ', {
    //   x: 20, y: bg.height - 55 - 3 * delY, align: 'top-left', size: 18, color: cc.color(106, 40, 21),
    // });
    // const moneylb2 = addSprite(bg, resIn.comm.coin, {
    //   x: moneylb1.x + moneylb1.width, y: bg.height - 57 - 3 * delY, align: 'top-left', size: 18, scale: 0.4,
    // });
    // addLabel(bg, data.money + '', {
    //   x: moneylb2.x + moneylb2.width * moneylb2.scale + 5, y: bg.height - 55 - 3 * delY, align: 'top-left', size: 18, color: cc.color(106, 40, 21),
    // });
    // 排名
    // addLabel(bg, rankStr, {
    //   x: bg.width / 2 + 20, y: bg.height - 55, align: 'top-left', size: 18, color: cc.color(106, 40, 21),
    // });
    // 逃跑
    addLabel(bg, escRateStr, {
      x: bg.width / 2 + 20, y: bg.height - 55 - 2 * delY, align: 'top-left', size: 18, color: cc.color(106, 40, 21),
    });
  },
  setPos(x, y) {
    this.bg.setPosition(cc.p(x, y));
  },
  setAnc(x, y) {
    this.bg.setAnchorPoint(cc.p(x, y));
  },
});

export default PlayerInfo;
