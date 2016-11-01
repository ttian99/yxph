import logger from '../es6-utils/cocos/console.js';
const console = logger('BattleSetLayer');
import {addSprite} from '../es6-utils/cocos/base';
import {resIn} from '../loader/resource.js';
import Button from '../es6-utils/components/Button.js';
import BattleData from './BattleData.js';
import PublicDialog from '../publicDialog/PublicDialog.js';
import Ltc from '../public/Ltc.js';
import {playEffect} from '../es6-utils/cocos/audio.js';

const BattleSetLayer = cc.Layer.extend({
  ctor(offY) {
    this._super();

    this.__touchListener = cc.EventListener.create({
      event: cc.EventListener.TOUCH_ONE_BY_ONE,
      swallowTouches: true,
      onTouchBegan: () => {
        return true;
      },
      onTouchEnded: (touch) => {
        if (this.touchInside(touch)) {
          return;
        }
        this.close();
      },
    });
    cc.eventManager.addListener(this.__touchListener, this);

    console.log('offY : ' + offY);
    this.initUi(offY);
    // 添加定时器
    this.schedule(this.timerCallBack, 1 / 60);
  },

  touchInside(touch) {
    let touchLocation = touch.getLocation();
    touchLocation = this.setBg.getParent().convertToNodeSpace(touchLocation);
    return cc.rectContainsPoint(this.setBg.getBoundingBox(), touchLocation);
  },

  onExit() {
    cc.eventManager.removeListener(this.__touchListener);
    this._super();
  },

  initUi(offY) {
    const setBg = this.setBg = addSprite(this, resIn.ui.Ltc_XQ_popFrame, {
      x: 225, y: offY + 80,
    });

    // 认输
    const resignBtn = this.resignBtn = new Button({
      normalRes: resIn.ui.Ltc_XQ_resignbtn,
      disableRes: resIn.ui.Ltc_XQ_resignbtn1,
      onTouchUpInside: () => {
        PublicDialog.confirmPop({txt: '您确定要认输吗？', cb: (isConfirm) => {
          if (isConfirm) {
            net.reqGiveUp();
          }
        }}, true);
        this.close();
      },
    });
    resignBtn.setPosition(cc.p(setBg.width / 2 - 150, 80));
    setBg.addChild(resignBtn);
    // 求和
    const sumBtn = this.sumBtn = new Button({
      normalRes: resIn.ui.Ltc_XQ_sumbtn,
      disableRes: resIn.ui.Ltc_XQ_sumbtn1,
      onTouchUpInside: () => {
        net.reqPeace();
        BattleData.setRecordSum(true);
        this.close();
      },
    });
    sumBtn.setPosition(cc.p(setBg.width / 2 - 50, 80));
    setBg.addChild(sumBtn);
    // 悔棋
    const undoBtn = this.undoBtn = new Button({
      normalRes: resIn.ui.Ltc_XQ_undobtn,
      disableRes: resIn.ui.Ltc_XQ_undobtn1,
      onTouchUpInside: () => {
        net.reqRegret();
        BattleData.setRecordUndo(true);
        this.close();
      },
    });
    undoBtn.setPosition(cc.p(setBg.width / 2 + 50, 80));
    setBg.addChild(undoBtn);
    // 离开
    const leaveBtn = new Button({
      normalRes: resIn.ui.Ltc_XQ_leaveRoom,
      onTouchUpInside: () => {
        playEffect(res.audio.Ltc_XQ_room_btn_clicked_mp3);
        if (!BattleData.isGamePlaying) {
          net.leaveRoom(false);
          this.close();
          // 退出房间
          // Ltc.sendEvent('START_SCENE', 'ROOM_LAYER');
          Ltc.sendEvent('START_SCENE', 'FIELD_LAYER');
        } else {
          this.close();
          PublicDialog.confirmPop({txt: '中途离开游戏将直接扣除金币和积分，你确定离开吗？', cb: (isConfirm) => {
            if (isConfirm) {
              net.leaveRoom(false);
              // 退出房间
              // Ltc.sendEvent('START_SCENE', 'ROOM_LAYER');
              Ltc.sendEvent('START_SCENE', 'FIELD_LAYER');
            }
          }}, true);
        }
      },
    });
    leaveBtn.setPosition(cc.p(setBg.width / 2 + 150, 80));
    setBg.addChild(leaveBtn);
  },

  close() {
    this.removeFromParent(true);
  },

  timerCallBack() {
    if (!BattleData.isGamePlaying) {
      this.resignBtn.setIsDisabled(true);
      this.sumBtn.setIsDisabled(true);
      this.undoBtn.setIsDisabled(true);
    } else {
      if (BattleData.ctrlEnable()) {
        if (this.resignBtn.isDisabled() && BattleData.isCanGiveUp()) {
          this.resignBtn.setIsDisabled(false);
        } else if (!this.resignBtn.isDisabled() && !BattleData.isCanGiveUp()) {
          this.resignBtn.setIsDisabled(true);
        }
        if (this.sumBtn.isDisabled() && !BattleData.getRecordSum()) {
          this.sumBtn.setIsDisabled(false);
        } else if (!this.sumBtn.isDisabled() && BattleData.getRecordSum()) {
          this.sumBtn.setIsDisabled(true);
        }
        if (!this.undoBtn.isDisabled()) {
          this.undoBtn.setIsDisabled(true);
        }
      } else {
        if (this.undoBtn.isDisabled() && BattleData.getStepCnt() !== 0 && !BattleData.getRecordUndo()) {
          this.undoBtn.setIsDisabled(false);
        } else if (!this.undoBtn.isDisabled() && BattleData.getRecordUndo()) {
          this.undoBtn.setIsDisabled(true);
        } else if (!this.undoBtn.isDisabled() && BattleData.getStepCnt() === 0) {
          this.undoBtn.setIsDisabled(true);
        }
        if (!this.resignBtn.isDisabled()) {
          this.resignBtn.setIsDisabled(true);
        }
        if (!this.sumBtn.isDisabled()) {
          this.sumBtn.setIsDisabled(true);
        }
      }
    }
  },
});

export default BattleSetLayer;
