import logger from '../es6-utils/cocos/console.js';
const console = logger('RoomLayer');
import {addSprite, addBMFLabel} from '../es6-utils/cocos/base';
import {res} from '../loader/resource.js';
import _ from 'lodash';
import Button from '../es6-utils/components/Button.js';
import Ltc from '../public/Ltc.js';
import CommMenu from './CommMenu.js';
import cfg from '../constants';
// import Events from '../public/Events.js';
import SceneInfo from '../public/SceneInfo.js';
import {playEffect} from '../es6-utils/cocos/audio';

const RoomLayer = Ltc.Layer.extend({
  ctor(sceneId) {
    this._super();
    this.initStatic(sceneId);
    this.bindEvent();
  },
  bindEvent() {
    // this.addEvent(Events.Enter_room_success, () => {
    //   // Ltc.sendEvent('RELEASEING');
    //   // Ltc.sendEvent('BATTLE_SCENE', 'i am the send msg');
    // });
    // this.addEvent(Events.Enter_room_failed, () => {
    //   Ltc.sendEvent('RELEASEING');
    //   Ltc.sendEvent('TIPSPOP', { txt: '入场失败，请重试！' });
    // });
  },
  initStatic(sceneId) {
    console.log('-- room layer sceneId : ' + sceneId);
    const dataId = sceneId;
    // 背景
    addSprite(this, res.startMenu.Ltc_XQ_start_bg_jpg, {
      x: cc.visibleRect.center.x, y: cc.visibleRect.center.y,
    });
    // 场景按钮
    _.range(0, 3).forEach((some, id) => {
      const btn = new Button({
        normalRes: resIn.select['Ltc_XQ_room_btn_' + id],
        disableRes: resIn.select['Ltc_XQ_room_btn_' + id],
        onTouchUpInside: () => {
          playEffect(res.audio.Ltc_XQ_btn_clicked_mp3);
          Ltc.sendEvent('BLOCKING');
          console.log('-- dataId : ' + dataId);
          Ltc.sendEvent('BATTLE_SCENE', dataId);
        },
      });
      btn.x = cc.visibleRect.width / 2;
      btn.y = cc.visibleRect.top.y - 170 - (id * 188);
      this.addChild(btn);

      const data = cfg.room[id + ''];
      const info = new cc.Node();
      info.x = 15;
      info.y = 30;
      const desc = addBMFLabel(info, '每局最小消耗', res.font.Ltc_XQ_comm_fnt, { align: 'bottom-left', color: cc.color(255, 208, 180) });
      const coin = addSprite(info, resIn.comm.Ltc_XQ_coin, { x: desc.x + desc.width * desc.scale, scale: 0.8, align: 'bottom-left' });
      const cost = addBMFLabel(info, data.cost, res.font.Ltc_XQ_comm_fnt, { x: coin.x + (coin.scale * coin.width), align: 'bottom-left', color: cc.color(255, 208, 180) });
      console.log(cost.x);
      btn.addChild(info);
      // 收益
      addBMFLabel(btn, data.ante, res.font.Ltc_XQ_price_fnt, { x: btn.width - 20, y: 20, align: 'bottom-right' });
    });
    // 公用菜单
    const commMenu = new CommMenu('room');
    this.addChild(commMenu);
    console.log('sceneinfo = ' + JSON.stringify(SceneInfo.data));
  },
  removeSelf(id = 0) {
    console.log('room id = ' + id);
    this.removeFromParent(true);
  },
});

export default RoomLayer;
