import Ltc from '../public/Ltc.js';
import Events from '../public/Events.js';
import BattleData from './BattleData.js';

// 如果用手在屏幕上滑动超过_offset个像素，则本次触摸视为无效的点击事件，即，不选中任何棋子
const TouchLayer = cc.Layer.extend({
  _touchListener: null,
  _touchBeginPos: null,
  _touchEndPos: null,
  _offset: 25,
  ctor() {
    this._super();
    this.addListener();
  },

  onExit() {
    if (this._touchListener) {
      cc.eventManager.removeListener(this._touchListener);
    }
    this._super();
  },

  addListener() {
    this._touchListener = cc.EventListener.create({
      event: cc.EventListener.TOUCH_ONE_BY_ONE,
      swallowTouches: true,
      onTouchBegan: (touch) => {
        if (!BattleData.isGamePlaying) {
          console.log('游戏尚未开始');
          return false;
        }
        if (!BattleData.ctrlEnable()) {
          console.log('还未轮到我走棋');
          return false;
        }
        this._touchBeginPos = this.getParent().convertToNodeSpace(touch.getLocation());
        return true;
      },
      onTouchEnded: (touch) => {
        this._touchEndPos = this.getParent().convertToNodeSpace(touch.getLocation());
        const offsetX = Math.abs(this._touchEndPos.x - this._touchBeginPos.x);
        const offsetY = Math.abs(this._touchEndPos.y - this._touchBeginPos.y);
        if (offsetX <= this._offset && offsetY <= this._offset) {
          Ltc.sendEvent(Events.Battle_valid_touch, this._touchEndPos);
        }
      },
    });
    cc.eventManager.addListener(this._touchListener, this);
  },
});

export default TouchLayer;
