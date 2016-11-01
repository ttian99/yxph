import logger from '../es6-utils/cocos/console.js';
const console = logger('Ltc');

const Ltc = {};

/**
* 添加常规CustomEvent
* @param {String} EventName 事件名
* @param {Function} func 回调函数
*
* 需要注意的是该方法注册的CustomEvent在移除时, 所有同名的事件都将被一起移除
*/
Ltc.addEvent = (EventName, func) => {
  cc.eventManager.addCustomListener(EventName, (event) => {
    func && func(event, event.getUserData());
  });
};

/**
* 添加隶属于node节点的CustomEvent
* @param {String} EventName 事件名
* @param {Function} func 回调函数
* @param {cc.Node} node 节点对象, 一般是Scene或者Layer
*
* 该方法注册的CustomEvent会在node被移除时自动移除, 不需要手动操作, 且其他的同名CustomEvent不受影响
*/
Ltc.addEventToNode = (EventName, func, node) => {
  if (!node) {
    console.log('Ltc.addEventToNode : node参数不能为空!');
    return;
  }
  if (!(node instanceof cc.Node)) {
    console.log('Ltc.addEventToNode: node不是cc.Node类型');
    return;
  }
  const listener = cc.EventListener.create({
    event: cc.EventListener.CUSTOM,
    eventName: EventName,
    callback: (event) => {
      if (func) {
        func(event, event.getUserData());
      }
    },
  });
  cc.eventManager.addListener(listener, node);
};

/**
* 触发CustomEvent
* @param {String} EventName 事件名
* @param {Any} userData 附加参数, 只能是一个, 若想同时传递多个, 请使用[]或者{}
*/
Ltc.sendEvent = (EventName, userData) =>{
  cc.eventManager.dispatchCustomEvent(EventName, userData);
};

/**
* 移除常规CustomEvent
* @param {String} EventName 事件名
*
* 需要注意的是该方法会将所有同名的事件都将被一起移除, 包括Ltc.addEvent和Ltc.addEventToNode添加的事件
*/
Ltc.removeEvent = (EventName) =>{
  cc.eventManager.removeCustomListeners(EventName);
};

/**
 * 建议在创建一般Layer是使用Ltc.Layer代替cc.Layer, 特性如下:
 * swallowTouchesEvent: 吞噬所用事件的传播
 * addEvent: 添加CustomEvent事件, 该事件将在Layer被移除时自动移除, 且不影响其他同名CustomEvent
 */
Ltc.Layer = cc.Layer.extend({
  swallowTouchesEvent() {
    this.touchListener = cc.EventListener.create({
      event: cc.EventListener.TOUCH_ONE_BY_ONE,
      swallowTouches: true,
      onTouchBegan: () => {
        this.clickEventCB && this.clickEventCB(this);
        return true;
      },
    });
    cc.eventManager.addListener(this.touchListener, this);
  },

  // 点击bg区域外关闭本layer
  bgTouchesEvent(bg) {
    this.touchListener1 = cc.EventListener.create({
      event: cc.EventListener.TOUCH_ONE_BY_ONE,
      swallowTouches: true,
      onTouchBegan: (touch, event) => {
        let touchLocation = touch.getLocation();
        touchLocation = this.getParent().convertToNodeSpace(touchLocation);
        const isTouchInside = cc.rectContainsPoint(bg.getBoundingBox(), touchLocation);
        if (!isTouchInside) {
          this.removeFromParent(true);
          // 防止事件向下层传递
          event.stopPropagation();
        }
        return true;
      },
      onTouchMoved: () => {},
      onTouchEnded: () => {},
      onTouchCanceled: () => {},
    });
    cc.eventManager.addListener(this.touchListener1, bg);
  },

  sendEvent(EventName, userData) {
    cc.eventManager.dispatchCustomEvent(EventName, userData);
  },

  addEvent(EventName, func) {
    if (!Ltc.addEventToNode) {
      console.log('Ltc.Layer->addEvent 依赖Ltc.addEventToNode');
      return;
    }
    Ltc.addEventToNode(EventName, func, this);
  },

  addClickEventListener(cb) {
    this.clickEventCB = cb;
  },

  dispatchClickEvent() {
    this.clickEventCB && this.clickEventCB(this);
  },
  // 用于判断是否点击在按钮区域
  isTouchInside(touch) {
    let touchLocation = touch.getLocation();
    touchLocation = this.getParent().convertToNodeSpace(touchLocation);
    return cc.rectContainsPoint(this.getBoundingBox(), touchLocation);
  },
  // 按钮在屏幕上被移动一定的位置后点击失效
  isNotMoveOut(touch) {
    const touchLocation = this.getParent().convertToWorldSpace(touch.getLocation());
    const rect = cc.rect(this._touchBeginWorldPos.x - 25, this._touchBeginWorldPos.y - 25, 50, 50);
    return cc.rectContainsPoint(rect, touchLocation);
  },
});

/**
 * 建议在创建一般Layer是使用Ltc.Layer代替cc.Layer, 特性如下:
 * addEvent: 添加CustomEvent事件, 该事件将在Scene被移除时自动移除, 且不影响其他同名CustomEvent
 */
Ltc.Scene = cc.Scene.extend({
  sendEvent(EventName, userData) {
    cc.eventManager.dispatchCustomEvent(EventName, userData);
  },
  addEvent(EventName, func) {
    if ( !Ltc.addEventToNode ) {
      console.log('Ltc.Layer->addEvent 依赖Ltc.addEventToNode');
      return;
    }
    Ltc.addEventToNode(EventName, func, this);
  },
});

export default Ltc;
