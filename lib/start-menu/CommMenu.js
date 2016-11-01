import logger from '../es6-utils/cocos/console.js';
const console = logger('CommMenu');
import {resIn} from '../loader/resource.js';
import Button from '../es6-utils/components/Button.js';
import Ltc from '../public/Ltc.js';
import {playEffect} from '../es6-utils/cocos/audio';

const CommMenu = Ltc.Layer.extend({
  type: null, // 定义在哪个layer
  ctor(type) {
    this._super();
    this.type = type;
    this.y = cc.visibleRect.top.y - 45;
    this.initStatic();
  },
  initStatic() {
    // 返回按钮
    const returnBtn = new Button({
      normalRes: resIn.comm.Ltc_XQ_menu_return_btn,
      onTouchUpInside: () => {
        playEffect(res.audio.Ltc_XQ_btn_clicked_mp3);
        console.log('------ touch the returnBtn ------');
        this.clickReturn();
      },
    });
    returnBtn.x = cc.visibleRect.topRight.x - 40;
    this.addChild(returnBtn);

    // 排行榜按钮
    const btn = new Button({
      normalRes: resIn.comm.Ltc_XQ_menu_rank_btn,
      onTouchUpInside: () => {
        playEffect(res.audio.Ltc_XQ_btn_clicked_mp3);
        this.sendEvent('RANK_LAYER');
      },
    });
    btn.x = cc.visibleRect.topRight.x - 40 - 56 - 20;
    this.addChild(btn);
  },
  clickReturn() {
    if (this.type === 'room') {
      this.sendEvent('FIELD_LAYER');
    } else if (this.type === 'field') {
      this.sendEvent('START_LAYER');
    } else {
      this.sendEvent('START_LAYER');
    }
  },
});

export default CommMenu;
