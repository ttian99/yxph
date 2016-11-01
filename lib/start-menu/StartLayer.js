import logger from '../es6-utils/cocos/console.js';
const console = logger('StartLayer');
import {addSprite} from '../es6-utils/cocos/base';
import {res, resIn} from '../loader/resource.js';
import Button from '../es6-utils/components/Button.js';
import Ltc from '../public/Ltc.js';
import Events from '../public/Events.js';
import SelfNet from '../public/SelfNet.js';
import cfg from '../constants';
import {playEffect} from '../es6-utils/cocos/audio';
import InfoUi from './InfoUi.js';
import UserInfo from '../public/UserInfo.js';

const StartLayer = Ltc.Layer.extend({
  idx: 1,
  ctor(dt) {
    this._super();
    this.initStatic();
    this.bindEvent();
    this.selfLogin(dt);
  },
  selfLogin(dt) {
    if (!dt) {
      this.showBtns();
      return;
    }
    this.showBtns();
    const obj = {
      openid: '' + dt.qq,
      nick: '' + dt.nick,
      points: UserInfo.getMyPoints(),
      money: UserInfo.getMyMoney(),
    };
    Ltc.sendEvent('BLOCKING');
    SelfNet.login(obj, (err, response) => {
      Ltc.sendEvent('RELEASEING');
      this.showBtns();
      if (err) {
        console.error('-- SelfNet login error : ' + err + ' --');
      } else {
        console.debug('-- SelfNet login success : ' + JSON.stringify(response) + '--');
        // DataMgr.user = response;
        // DataMgr.user.openid = json.qq;
      }
    });
  },
  bindEvent() {
    this.addEvent(Events.Update_selfInfo, () => {
      console.log('-- StartLayer Events.Update_selfInfo --');
      this.fresh();
    });
  },
  initStatic() {
    const bg = addSprite(this, res.startMenu.Ltc_XQ_start_bg_jpg, {
      x: cc.visibleRect.center.x, y: cc.visibleRect.center.y,
    });

    addSprite(bg, resIn.start.Ltc_XQ_start_title, {
      x: bg.width / 2, y: bg.height / 2 + 200, algin: 'center',
    });

    addSprite(this, resIn.start.Ltc_XQ_flower, {
      x: cc.visibleRect.topLeft.x, y: cc.visibleRect.topLeft.y, align: 'top-left',
    });

    // 竞技场
    const arenaBtn = this.arenaBtn = new Button({
      normalRes: resIn.start.Ltc_XQ_arena_btn,
      onTouchUpInside: () => {
        playEffect(res.audio.Ltc_XQ_btn_clicked_mp3);
        this.sendEvent('FIELD_LAYER');
      },
    });
    arenaBtn.setPosition(cc.p(bg.width / 2, bg.height / 2 - 50));
    bg.addChild(arenaBtn);
    arenaBtn.setScale(0);
    arenaBtn.setIsDisabled(true);
    // 快速开始
    const startBtn = this.startBtn = new Button({
      normalRes: resIn.start.Ltc_XQ_quick_start_btn,
      onTouchUpInside: () => {
        playEffect(res.audio.Ltc_XQ_btn_clicked_mp3);
        const dataId = cfg.field[0].sceneId;
        Ltc.sendEvent('BLOCKING');
        Ltc.sendEvent('BATTLE_SCENE', dataId);
      },
    });
    startBtn.setPosition(cc.p(bg.width / 2, bg.height / 2 - 180));
    bg.addChild(startBtn);
    startBtn.setScale(0);
    startBtn.setIsDisabled(true);

    // 添加个人的信息面板
    const infoUi = this.infoUi = new InfoUi();
    infoUi.x = cc.visibleRect.bottom.x;
    infoUi.y = cc.visibleRect.bottom.y;
    this.addChild(infoUi);
  },
  fresh() {
    console.log('-- fresh start layer --');
    this.infoUi.fresh();
  },

  showBtns() {
    this.arenaBtn.setIsDisabled(false);
    this.startBtn.setIsDisabled(false);
    this.arenaBtn.runAction(cc.sequence(
      cc.scaleTo(0.3, 1.2),
      cc.scaleTo(0.11, 0.9),
      cc.scaleTo(0.19, 1.05),
      cc.scaleTo(0.15, 1.0),
    ));
    this.startBtn.runAction(cc.sequence(
      cc.scaleTo(0.3, 1.2),
      cc.scaleTo(0.1, 0.9),
      cc.scaleTo(0.18, 1.05),
      cc.scaleTo(0.12, 1.0),
    ));
  },
});

export default StartLayer;
