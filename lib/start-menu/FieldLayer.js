import logger from '../es6-utils/cocos/console.js';
const console = logger('FieldLayer');
import {addSprite} from '../es6-utils/cocos/base';
import {res} from '../loader/resource.js';
import _ from 'lodash';
import Button from '../es6-utils/components/Button.js';
import Ltc from '../public/Ltc.js';
import CommMenu from './CommMenu.js';
import cfg from '../constants';
import {playEffect} from '../es6-utils/cocos/audio';
import InfoUi from './InfoUi.js';
import Events from '../public/Events.js';

const FieldLayer = Ltc.Layer.extend({
  ctor() {
    this._super();
    this.initStatic();
    this.bindEvent();
  },
  bindEvent() {
    this.addEvent(Events.Update_selfInfo, () => {
      console.log('-- FieldLayer Events.Update_selfInfo --');
      this.fresh();
    });
  },
  initStatic() {
    // 背景
    const bg = addSprite(this, res.startMenu.Ltc_XQ_start_bg_jpg, {
      x: cc.visibleRect.center.x, y: cc.visibleRect.center.y,
    });
    console.log(bg.width, bg.height);
    console.log(bg.scale);
    console.log(cc.visibleRect);
    // 场景按钮
    _.range(0, 3).forEach((some, id) => {
      const btn = new Button({
        normalRes: resIn.select['Ltc_XQ_field_btn_' + id],
        disableRes: resIn.select['Ltc_XQ_field_btn_' + id],
        onTouchUpInside: () => {
          playEffect(res.audio.Ltc_XQ_btn_clicked_mp3);
          const sceneId = cfg.field['' + id].sceneId;
          // Ltc.sendEvent('ROOM_LAYER', sceneId);
          Ltc.sendEvent('BATTLE_SCENE', sceneId);
        },
      });
      btn.x = cc.visibleRect.width / 2;
      btn.y = cc.visibleRect.top.y;
      // btn.y = cc.visibleRect.top.y - 170 - (id * 188);
      // 增加按钮动画
      const moveTo = cc.moveBy(1, 0, -170 - (id * 188));
      btn.runAction(new cc.EaseBounceOut(moveTo));
      this.addChild(btn);
    });
    // // 公用菜单
    const commMenu = new CommMenu('field');
    this.addChild(commMenu);

    // 添加个人的信息面板
    const infoUi = this.infoUi = new InfoUi();
    infoUi.x = cc.visibleRect.bottom.x;
    infoUi.y = cc.visibleRect.bottom.y;
    this.addChild(infoUi);
  },
  fresh() {
    console.log('-- fresh field layer --');
    this.infoUi.fresh();
  },
});

export default FieldLayer;
