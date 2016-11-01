import logger from '../es6-utils/cocos/console.js';
const console = logger('BattleReadyLayer');
import {addSprite} from '../es6-utils/cocos/base';
import {resIn} from '../loader/resource.js';
import Button from '../es6-utils/components/Button.js';
import Ltc from '../public/Ltc.js';
// import MaskLayer from '../es6-utils/components/MaskLayer.js';
import Events from '../public/Events.js';
import UserInfo from '../public/UserInfo.js';
import OtherInfo from '../public/OtherInfo.js';
import {playEffect} from '../es6-utils/cocos/audio.js';
import BattleData from '../battle/BattleData.js';
import PublicDialog from '../publicDialog/PublicDialog.js';

const BattleReadyLayer = Ltc.Layer.extend({
  ctor() {
    this._super();
    // const mask = new MaskLayer({color: cc.color(255, 255, 255, 0)});
    // this.addChild(mask);
    // 准备UI
    this._readySp = [];
    [0, 1].forEach((i) =>{
      const offSet = i === 0 ? -120 : 160;
      this._readySp[i] = addSprite(this, resIn.ui.Ltc_XQ_readyIcon, {
        x: cc.visibleRect.center.x, y: cc.visibleRect.center.y + offSet,
      });
      this._readySp[i].setVisible(false);
    });
    // 增加换桌和准备按钮
    this.initBtns();
    // 增加事件
    this.addEvts();
  },

  initBtns() {
    // 准备
    const readyBtn = this.readyBtn = new Button({
      normalRes: resIn.ui.Ltc_XQ_startBtn,
      disableRes: resIn.ui.Ltc_XQ_startBtn_grey,
      onTouchUpInside: () => {
        playEffect(res.audio.Ltc_XQ_room_btn_clicked_mp3);
        if (BattleData.status === 0) {
          this.offLineAc();
          return;
        }
        net.ready();
        readyBtn.setIsDisabled(true);
        Ltc.sendEvent(Events.Battle_clean_chess);
      },
    });
    readyBtn.setPosition(cc.p(cc.visibleRect.center.x + 90, cc.visibleRect.center.y + 17));
    this.addChild(readyBtn);

    // 换桌
    const changeDeskBtn = this.changeDeskBtn = new Button({
      normalRes: resIn.ui.Ltc_XQ_changeTablebtn,
      onTouchUpInside: () => {
        playEffect(res.audio.Ltc_XQ_room_btn_clicked_mp3);
        if (BattleData.status === 0) {
          this.offLineAc();
          return;
        }
        net.changeTable();
      },
    });
    changeDeskBtn.setPosition(cc.p(cc.visibleRect.center.x - 90, readyBtn.y));
    this.addChild(changeDeskBtn);
  },

  offLineAc() {
    PublicDialog.tipsPop({txt: '您因长久未操作，与房间失联，请重新进入', fontSize: 20});
    this.runAction(cc.sequence(cc.delayTime(2.0), cc.callFunc(()=>{
      net.leaveRoom(false);
      // 退出房间
      // Ltc.sendEvent('START_SCENE', 'ROOM_LAYER');
      Ltc.sendEvent('START_SCENE', 'FIELD_LAYER');
    })));
  },

  addEvts() {
    // 检测用户准备
    this.addEvent(Events.Battle_player_ready, (event, data) => {
      console.log('玩家QQ : ' + data + '准备!');
      const qq = data;
      if (qq === UserInfo.getMyQQ()) {
        this._readySp[0].setVisible(true);
      } else {
        this._readySp[1].setVisible(true);
      }
    });
    this.addEvent(Events.Battle_user_ready, (event, data) => {
      const seat = data;
      if (seat === UserInfo.getMySeat()) {
        this._readySp[0].setVisible(true);
      } else {
        this._readySp[1].setVisible(true);
      }
    });
    this.addEvent(Events.Battle_user_leave, (event, data) => {
      const qq = data;
      if (qq === OtherInfo.getOtherQQ()) {
        this._readySp[1].setVisible(false);
      }
    });

    // 监听桌面状态
    this.addEvent(Events.Battle_update_status, (event, dt) => {
      const myStatus = UserInfo.getMySeat() === 0 ? dt.chair0 : dt.chair1;
      const otherStatus = UserInfo.getMySeat() === 0 ? dt.chair1 : dt.chair0;
      if (myStatus !== 2) {
        this._readySp[0].setVisible(false);
        this.readyBtn.setIsDisabled(false);
      } else {
        this._readySp[0].setVisible(true);
      }
      if (otherStatus !== 2) {
        this._readySp[1].setVisible(false);
      } else {
        this._readySp[1].setVisible(true);
      }
    });

    this.addEvent(Events.Battle_readyLayer_disabled, () => {
      this.changeDeskBtn.setIsDisabled(true);
      this.readyBtn.setIsDisabled(true);
    });
    this.addEvent(Events.Battle_readyLayer_enabled, (event, dt) => {
      const isAutoReady = dt;
      this.changeDeskBtn.setIsDisabled(false);
      if (isAutoReady) {
        net.ready();
        this.readyBtn.setIsDisabled(true);
        Ltc.sendEvent(Events.Battle_clean_chess);
      } else {
        this.readyBtn.setIsDisabled(false);
      }
    });
  },
});

export default BattleReadyLayer;
