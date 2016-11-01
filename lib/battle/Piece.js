import logger from '../es6-utils/cocos/console.js';
const console = logger('Piece');
import {changeSpriteRes} from '../es6-utils/cocos/base';
import {getInitData} from './PieceOpt.js';

/**
*
 id	 黑方棋子	id	红方棋子
  0	    将	   16	   帅
  1	  6路士	  17	四路仕
  2	  4路士	  18	六路仕
  3	  7路象	  19	三路相
  4	  3路象	  20	七路相
  5	  8路马	  21	二路马
  6	  2路马	  22	八路马
  7	  9路车	  23	一路车
  8	  1路车	  24	九路车
  9	  8路炮	  25	二路炮
  10	2路炮	  26	八路炮
  11	9路卒	  27	一路兵
  12	7路卒	  28	三路兵
  13	5路卒	  29	五路兵
  14	3路卒	  30	七路兵
  15	1路卒	  31	九路兵
*
*/
const BottomType = {
  NORMAL: 'normal',
  EAT: 'eat',
  SELECT: 'selected',
};

const Piece = cc.Sprite.extend({
  _data: null,
  _id: undefined, // 棋子ID(0~31)
  _x: undefined, // 棋子位置x
  _y: undefined, // 棋子位置y
  _color: null, // 棋子颜色
  _dead: false, // 是否被吃掉
  _type: null, // 棋子类型
  _selected: false, // 棋子的选中状态
  _originSc: 1.0, // 原始缩放比例
  title: null, // 棋子文字
  bottom: null, // 棋子底部木头

  ctor(id) {
    this._super();
    this.setDead(false);
    this.setID(id);
    this.reset();
  },

  // 设置棋子默认缩放比例
  setOriginSc(sc) {
    this._originSc = sc;
    this.setScale(sc);
  },

  // 设置棋子是否被吃掉
  setDead(bvar) {
    this._dead = bvar;
    if (bvar) {
      this.setVisible(false);
    } else {
      this.setVisible(true);
    }
  },

  // 棋子是否被吃掉
  getDead() {
    return this._dead;
  },

  // 重置棋子位置
  reset() {
    const id = this.getID();
    this.initData(id);
    if (!this._data) {
      console.error('piece data is null');
      return;
    }
    // 设置文字纹理
    this.setTitle(this._data.re);
    // 设置棋子底部纹理
    this.setBottom(BottomType.NORMAL);
    // 设置位置
    this.setPos(this._data.x, this._data.y);
    // 设置颜色
    this.setColorType(this._data.cl);
    // 设置类型
    this.setType(this._data.tp);
    // 设置生存
    this.setDead(false);
    // 设置选中
    this.setSelected(false);
  },

  // 棋子文字
  setTitle(titleRes) {
    if (!this.title) {
      const title = this.title = new cc.Sprite(titleRes);
      this.addChild(title, 2);
    } else {
      changeSpriteRes(this.title, titleRes);
    }
  },

  // 设置棋子底部
  setBottom(type) {
    if (!this.bottom) {
      const bottom = this.bottom = new cc.Sprite(resIn.piece['Ltc_XQ_bottom_' + type]);
      this.addChild(bottom, 1);
    } else {
      changeSpriteRes(this.bottom, resIn.piece['Ltc_XQ_bottom_' + type]);
    }
  },

  // 设置棋子ID
  setID(id) {
    this._id = id;
  },

  // 获取棋子id
  getID() {
    return this._id;
  },

  // 设置棋子颜色
  setColorType(cl) {
    this._color = cl;
  },

  // 获取棋子颜色
  getColorType() {
    return this._color;
  },

  // 设置棋子位置
  setPos(x, y) {
    this._x = x;
    this._y = y;
  },

  // 获取棋子位置
  getPos() {
    return { x: this._x, y: this._y };
  },

  // 设置棋子类型
  setType(type) {
    this._type = type;
  },

  // 获取棋子类型
  getType() {
    return this._type;
  },

  // 设置棋子的选中状态
  setSelected(bvar) {
    if (bvar === this._selected) return;
    if (bvar) {
      this.setTitle(this._data.se);
      this.setBottom(BottomType.SELECT);
    } else {
      this.setTitle(this._data.re);
      this.setBottom(BottomType.NORMAL);
    }
    this._selected = bvar;
  },

  // 获取棋子的选中状态
  getSeltected() {
    return this._selected;
  },

  eatEffect(isEat) {
    const cf1 = cc.callFunc(() =>{
      this.setTitle(this._data.te);
      this.setBottom(BottomType.EAT);
    });
    const delay = cc.delayTime(0.2);
    const cf2 = cc.callFunc(() =>{
      this.setSelected(false);
    });
    if (isEat) {
      this.runAction(cc.sequence(cf1, delay, cf2));
    } else {
      this.runAction(cf2);
    }
  },

  // 根据棋子ID，获取棋子初始化数据
  initData(id) {
    this._data = getInitData(id);
  },
});

export default Piece;
