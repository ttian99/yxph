import StartScene from '../start-menu/StartScene.js';
import BattleScene from '../battle/BattleScene.js';
import loader from '../loader/loader.js';
import Ltc from './Ltc.js';
import PublicDialog from '../publicDialog/PublicDialog.js';
import {audioInit, playMusic, resumeMusic} from '../es6-utils/cocos/audio.js';
import BattleData from '../battle/BattleData.js';

const sceneMgr = {
  init() {
    loader.load(['startMenu', 'public', 'battle']).then(() => {
      this.bindEvent();
      Ltc.sendEvent('START_SCENE');
      // Ltc.sendEvent('BATTLE_SCENE');
    });

    audioInit('chessAudio');
  },

  bindEvent() {
    Ltc.addEvent('game_on_show', () => {
      console.log('--------- game_on_show ---------');
      resumeMusic();
    });

    Ltc.addEvent('START_SCENE', (evt, data) => {
      console.log('------------- start scene ----------');
      this.onEnterStartScene(data);
    });

    Ltc.addEvent('BATTLE_SCENE', (evt, sceneid) => {
      console.log('------------- battle scene ----------');
      this.onEnterBattleScene(sceneid);
    });

    // 冒泡提示
    Ltc.addEvent('TIPSPOP', (evt, obj) => {
      PublicDialog.tipsPop(obj);
    });
    // 阻塞
    Ltc.addEvent('BLOCKING', () => {
      PublicDialog.block();
    });
    // 阻塞释放
    Ltc.addEvent('RELEASEING', () => {
      PublicDialog.release();
    });

    // 处理android返回键
    const channel = 'native';
    if (channel === 'native') {
      console.log('== add native keyboard Listener ==');
      cc.eventManager.addListener(cc.EventListener.create({
        event: cc.EventListener.KEYBOARD,
        onKeyReleased: (keyCode) => {
          if (keyCode === cc.KEY.back) {
            if (BattleData.isGamePlaying) {
              PublicDialog.confirmPop({txt: '中途离开游戏将直接扣除金币和积分，你确定离开吗？', cb: (isConfirm) =>{
                if (isConfirm) {
                  net.leaveRoom(false);
                  // 退出房间
                  // Ltc.sendEvent('START_SCENE', 'ROOM_LAYER');
                  Ltc.sendEvent('START_SCENE', 'FIELD_LAYER');
                }
              }}, true);
            } else {
              PublicDialog.confirmPop({txt: '你确定退出游戏吗？', cb: (isConfirm) =>{
                if (isConfirm) {
                  cc.director.end();
                }
              }}, true);
            }
          }
        },
      }), -1);
      console.log('== add over =====');
    }
  },

  // 进入开始场景
  onEnterStartScene(data) {
    let scene = new StartScene(data);
    if (data) {
      scene = new cc.TransitionFade(0.2, scene, cc.color(0, 0, 0));
    }
    cc.director.runScene(scene);
    playMusic(res.audio.Ltc_XQ_room_bg_music_mp3);
  },

  onEnterBattleScene(sceneid) {
    BattleData.sceneid = sceneid;
    const scene = new BattleScene(sceneid);
    cc.director.runScene(new cc.TransitionFade(0.2, scene, cc.color(0, 0, 0)));
    playMusic(res.audio.Ltc_XQ_room_bg_music_mp3);
  },
};

export default sceneMgr;
