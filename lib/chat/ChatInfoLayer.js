import logger from '../es6-utils/cocos/console.js';
const console = logger('ChatInfoLayer');
import {addSprite, addLabel} from '../es6-utils/cocos/base';
import {resIn} from '../loader/resource.js';
import Ltc from '../public/Ltc.js';

/**
 * type: 0-自己 1-对手
 * */
const ChatInfoLayer = Ltc.Layer.extend({
  type: 0,
  msg: null,
  ctor(type) {
    this._super();
    this.initStatic(type);
  },
  initStatic(type) {
    const str = '';
    const align1 = type ? 'top' : 'bottom';
    console.log('type = ' + type + ' | align = ' + align1);
    const bgRes = resIn.chat['Ltc_XQ_chat_info_bg' + type];
    // chat背景
    const bg = this.bg = addSprite(this, bgRes, {
      x: 0, y: 0, align: align1,
    });

    // 信息
    this.label = addLabel(bg, str, {
      x: 0, y: 0, size: 20, color: cc.color(200, 200, 200), dimensions: cc.size(260, 0),
    });
    bg.setVisible(false);
  },
  // 展示信息
  show(msg) {
    console.log(msg);
    this.bg.stopAllActions();
    this.msg = msg;
    const tempTxt = new cc.LabelTTF(msg, 'arial', 20);
    if (tempTxt.width < 260) {
      this.label.setDimensions(0, 0);
    } else {
      this.label.setDimensions(260, 0);
    }
    if (this.type === 0) {
      this.label.setPosition(cc.p(this.bg.width / 2 - 1, this.bg.height / 2 + 7));
    } else {
      this.label.setPosition(cc.p(this.bg.width / 2 - 1, this.bg.height / 2 - 3));
    }
    console.log('== type == ' + this.type );
    console.log(this.msg.length);
    console.log(this.label.x, this.label.y);
    this.label.setString(this.msg);
    this.bg.setVisible(true);
    this.bg.runAction(cc.sequence(
      cc.delayTime(2),
      cc.callFunc(() => {
        this.bg.setVisible(false);
        this.msg = '';
      })
    ));
  },
});

export default ChatInfoLayer;
