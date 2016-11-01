import logger from '../es6-utils/cocos/console.js';
const console = logger('ResultLayer');
import {addSprite, addLabel, addBMFLabel} from '../es6-utils/cocos/base';
import {resIn, res} from '../loader/resource.js';
import Button from '../es6-utils/components/Button.js';
import Ltc from '../public/Ltc.js';
import FaceNode from '../face/FaceNode.js';
import UserInfo from '../public/UserInfo.js';
import OtherInfo from '../public/OtherInfo.js';
import {getLvName, getNextLvOffsetScore} from '../public/Extra.js';
import Events from '../public/Events.js';
import _ from 'lodash';
import {playEffect} from '../es6-utils/cocos/audio';
import PublicDialog from '../publicDialog/PublicDialog.js';
import BattleData from './BattleData.js';
import SelfNet from '../public/SelfNet.js';

const ResultLayer = Ltc.Layer.extend({
  isEvaluating: false, // 是否是棋力评测结算
  ctor(data) {
    this._super();
    this.isEvaluating = data.isEvaluating;
    if (!this.isEvaluating) {
      this.mockData(data);
      this.initStatic();
      this.reportInfo();
    } else {
      this.initDt(data);
    }
  },
  // 上报个人分数到自己服务器
  reportInfo() {
    // 游戏结果
    const obj = {
      openid: UserInfo.getMyQQ(),
      nick: UserInfo.getMyName(),
      isGirl: UserInfo.data.gender === '女' ? true : false,
      face: UserInfo.data.faceid,
      score: UserInfo.data.points,
      coin: UserInfo.data.money,
      win: UserInfo.data.win,
      lose: UserInfo.data.lose,
      tie: UserInfo.data.tie,
    };
    // 上报结果到自己的服务器
    SelfNet.gameEnd(obj, (err, response) => {
      if (err) {
        console.log('-- selfNet gameEnd err : ' + err + ' --');
      } else {
        console.log('-- selfNet gameEnd success : ' + JSON.stringify(response) + '--');
      }
    });
  },
  playAudio(result) {
    if (result === 'tie') {
      return;
    }
    const mp3 = result === 'win' ? res.audio.Ltc_XQ_game_result_win_mp3 : res.audio.Ltc_XQ_game_result_failed_mp3;
    playEffect(mp3);
  },
  // 模拟数据
  mockData(data) {
    console.log('-- received data = ' + JSON.stringify(data));

    const defaultInfo = {
      seatid: '',       // 座位id
      nick: '',         // 昵称
      qq: '',           // qq号
      score: '',        // 积分
      getScore: '',     // 获取分数
      getCoin: '',      // 获得金币
      state: '',        // 特殊状态: 0-无 1-逃跑 2-认输 3-超时
    };
    const selfInfo = _.clone(defaultInfo);
    const oppInfo = _.clone(defaultInfo);
    selfInfo.seatid = UserInfo.data.seatid;
    selfInfo.nick = UserInfo.data.nick;
    selfInfo.qq = UserInfo.data.qq;
    selfInfo.score = UserInfo.data.points;
    oppInfo.seatid = OtherInfo.data.seatid;
    oppInfo.nick = OtherInfo.data.nick;
    oppInfo.qq = OtherInfo.data.qq;
    oppInfo.score = OtherInfo.data.points;

    // data.winer：胜利玩家的座位id(seatid), 0/1 表示对应 0/1玩家胜利, 2表示和局
    const result = (data.winer === 2) ? 'tie' : ((data.winer === selfInfo.seatid) ? 'win' : 'lose');

    selfInfo.getScore = data['score' + selfInfo.seatid];
    selfInfo.getCoin = data['money' + selfInfo.seatid];
    oppInfo.getScore = data['score' + oppInfo.seatid];
    oppInfo.getCoin = data['money' + oppInfo.seatid];

    /**
     * data.overType的类型：
     * overNone = 0,
     * overFlag = 1,    //军棋被扛
     * overNoChess = 2, //无棋可走
     * overTimeOut = 3, //超时5次
     * overGiveUp = 4,  //投降
     * overError = 5,   //系统错误,
     * overEscape = 6,  //逃跑
     * overWin = 7,     //胜利者
     * overJueSha = 8,
     * **/
    function getState(obj) {
      let state = 0;
      const overType = data['overType' + obj.seatid];
      switch (overType) {
        case 3:
          state = 3;
          break;
        case 4:
          state = 2;
          break;
        case 6:
          state = 1;
          break;
        default:
          state = 0;
      }
      obj.state = state;
    }

    getState(selfInfo);
    getState(oppInfo);

    this.data = {};
    this.data.result = result;     // 本局结果：胜-win 负-lose 和-tie
    this.data.selfInfo = selfInfo; // 自己信息
    this.data.oppInfo = oppInfo;   // 对手信息
    // 播放音效
    this.playAudio(result);
    console.log('-- resultlayer this.data --');
    console.log(this.data);
  },
  initStatic() {
    const data = this.data;
    this.swallowTouchesEvent();
    // 背景
    const bg = this.bg = addSprite(this, resIn.result.Ltc_XQ_result_bg, {
      x: cc.visibleRect.center.x, y: cc.visibleRect.center.y,
    });
    const midX = bg.width / 2 - 6;
    // 关闭按钮
    const closeBtn = new Button({
      normalRes: resIn.result.Ltc_XQ_result_close,
      onTouchUpInside: () => {
        if (this.isEvaluating) {
          net.leaveRoom(false);
          // 退出房间
          // Ltc.sendEvent('START_SCENE', 'ROOM_LAYER');
          Ltc.sendEvent('START_SCENE', 'FIELD_LAYER');
        } else {
          this.removeFromParent();
          Ltc.sendEvent(Events.Battle_readyLayer_enabled, false);
        }
      },
    });
    closeBtn.x = bg.width - 75;
    closeBtn.y = bg.height - 45;
    bg.addChild(closeBtn);
    // 结果icon
    addSprite(bg, resIn.result['Ltc_XQ_' + data.result], {
      x: midX, y: bg.height / 2 + 50,
    });
    // 分享
    const shareBtn = new Button({
      normalRes: resIn.result.Ltc_XQ_game_share,
      onTouchUpInside: () => {
        this.removeFromParent();
      },
    });
    shareBtn.x = midX - shareBtn.width / 2 - 25;
    shareBtn.y = 70;
    bg.addChild(shareBtn);
    // 再来一局
    const againBtn = new Button({
      normalRes: resIn.result.Ltc_XQ_game_again,
      onTouchUpInside: () => {
        if (BattleData.status === 0) {
          this.offLineAc();
          return;
        }
        this.removeFromParent();
        if (this.isEvaluating) {
          net.changeTable();
        } else {
          Ltc.sendEvent(Events.Battle_readyLayer_enabled, true);
        }
      },
    });
    againBtn.x = midX + againBtn.width / 2 + 25;
    againBtn.y = 70;
    bg.addChild(againBtn);

    if (!this.isEvaluating) {
      // 自己信息
      this.addInfo(data.selfInfo, true);
      // 对手信息
      this.addInfo(data.oppInfo);
    } else {
      this.addEvaluatingInfo(true);
      this.addEvaluatingInfo(false);
    }
  },
  addInfo(data, isSelf) {
    const posX = this.bg.width / 2 - 6;
    const posY = isSelf ? 192 : 438;
    const bgRes = isSelf ? resIn.result.Ltc_XQ_info_bg2 : resIn.result.Ltc_XQ_info_bg1;
    const infoBg = addSprite(this.bg, bgRes, {
      x: posX, y: posY,
    });
    const face = new FaceNode(data.qq);
    face.anchorX = 0;
    face.anchorY = 1;
    face.y = infoBg.height;
    face.scale = 0.85;
    infoBg.addChild(face);

    if (isSelf) {
      addBMFLabel(infoBg, '本家', res.font.Ltc_XQ_rst_yellow_fnt, {
        x: 35, y: infoBg.height + 17, scale: 0.9,
      });
    }

    const nick = addLabel(infoBg, data.nick, {
      x: 77, y: infoBg.height - 15, align: 'left', size: 20,
    });

    let stateRes = '';
    switch (data.state) {
      case 1:
        stateRes = resIn.result.Ltc_XQ_state_runAway;
        break;
      case 2:
        stateRes = resIn.result.Ltc_XQ_state_giveUp;
        break;
      case 3:
        stateRes = resIn.result.Ltc_XQ_state_overTime;
        break;
      default:
        stateRes = '';
        break;
    }
    if (stateRes !== '') {
      addSprite(infoBg, stateRes, {
        x: nick.x + 5 + nick.width, y: nick.y, align: 'left',
      });
    }
    // 个人分数
    const marksY = isSelf ? 73 : 47;
    const scoreStr = (data.getScore > 0) ? ('+' + data.getScore) : data.getScore + '';
    addBMFLabel(infoBg, scoreStr, res.font.Ltc_XQ_rst_green_fnt, {
      x: 77, y: marksY, align: 'left', scale: 0.6,
    });
    // 晋级分数提示
    const offsetScore = getNextLvOffsetScore(data.score);
    const offsetSp = addBMFLabel(infoBg, '' + offsetScore + '分', res.font.Ltc_XQ_rst_yellow_fnt, {
      x: infoBg.width - 8, y: marksY + 2, align: 'right', scale: 0.6,
    });
    addBMFLabel(infoBg, '晋级只需再多', res.font.Ltc_XQ_rst_normal_fnt, {
      x: offsetSp.x - 10 - offsetSp.width * offsetSp.getScale(), y: marksY, align: 'right', scale: 0.6, color: cc.color.BLACK,
    });
    // 积分等级
    const iconY = isSelf ? 30 : 17;
    const scoreIcon = addSprite(infoBg, resIn.comm.score, {
      x: 5, y: iconY, align: 'left', scale: 0.75,
    });
    // 累计积分
    addBMFLabel(infoBg, '积分等级', res.font.Ltc_XQ_rst_green_fnt, {
      x: scoreIcon.x + scoreIcon.width * scoreIcon.scale + 5, y: scoreIcon.y - 3, align: 'left', scale: 0.6,
    });
    const scoreNameStr = getLvName(data.score);
    addBMFLabel(infoBg, '【' + scoreNameStr + '】', res.font.Ltc_XQ_rst_yellow_fnt, {
      x: 220, y: scoreIcon.y - 3, align: 'left', scale: 0.6,
    });
    // // 金币icon
    // const coinIcon = addSprite(infoBg, resIn.comm.coin, {
    //   x: 9, y: 15, align: 'left', scale: 0.7,
    // });
    // // 累计金币
    // addBMFLabel(infoBg, '铜钱结算', res.font.Ltc_XQ_rst_yellow_fnt, {
    //   x: coinIcon.x + coinIcon.width * coinIcon.scale + 1, y: coinIcon.y, align: 'left', scale: 0.7,
    // });
    // const coinStr = (data.getCoin > 0) ? ('+' + data.getCoin) : data.getCoin + '';
    // addBMFLabel(infoBg, coinStr, res.font.Ltc_XQ_rst_yellow_fnt, {
    //   x: infoBg.width - 10, y: coinIcon.y, align: 'right', scale: 0.7,
    // });
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

  // //棋力评测UI
  // ////////////////////////////////////////////////////////////////////////////////
  initDt(dt) {
    dt.result = dt.bWinner === 2 ? 'tie' : (dt.bWinner === UserInfo.getMySeat() ? 'win' : 'lose');
    dt.bEscape = dt.GameEndType === 6;
    dt.qq = [];
    dt.qq[UserInfo.data.seatid] = UserInfo.getMyQQ();
    dt.qq[OtherInfo.data.seatid] = OtherInfo.getOtherQQ();
    dt.nick = [];
    dt.nick[UserInfo.data.seatid] = UserInfo.data.nick;
    dt.nick[OtherInfo.data.seatid] = OtherInfo.data.nick;
    this.data = dt;
    this.initStatic();
    // 播放音效
    this.playAudio(dt.result);
  },

  addEvaluatingInfo(isSelf) {
    const data = this.data;
    const idx = isSelf ? UserInfo.getMySeat() : OtherInfo.getOtherSeat();
    const posX = this.bg.width / 2 - 8;
    const posY = isSelf ? 192 : 438;
    const bgRes = isSelf ? resIn.result.Ltc_XQ_info_bg2 : resIn.result.Ltc_XQ_info_bg1;
    const infoBg = addSprite(this.bg, bgRes, {
      x: posX, y: posY,
    });
    const face = new FaceNode(data.qq[idx]);
    face.anchorX = 0;
    face.anchorY = 1;
    face.y = infoBg.height;
    face.scale = 0.85;
    infoBg.addChild(face);

    if (isSelf) {
      addBMFLabel(infoBg, '本家', res.font.Ltc_XQ_rst_yellow_fnt, {
        x: 35, y: infoBg.height + 17, scale: 0.9,
      });
      addSprite(infoBg, resIn.result.Ltc_XQ_result_icon1, {
        x: 290, y: 180,
      });
    }

    const nick = addLabel(infoBg, data.nick[idx], {
      x: 77, y: infoBg.height - 15, align: 'left', size: 20,
    });

    if (data.bEscape && !isSelf) {
      addSprite(infoBg, resIn.result.Ltc_XQ_state_runAway, {
        x: nick.x + 5 + nick.width, y: nick.y, align: 'left',
      });
    }

    // 下次晋级提示
    const marksY = isSelf ? 73 : 47;
    const pro1 = addBMFLabel(infoBg, '局晋级', res.font.Ltc_XQ_rst_normal_fnt, {
      x: infoBg.width - 8, y: marksY, align: 'right', scale: 0.6, color: cc.color.BLACK,
    });
    const pro2 = addBMFLabel(infoBg, '' + data.nLeftWinInningCountSame[idx], res.font.Ltc_XQ_rst_yellow_fnt, {
      x: pro1.x - pro1.width * pro1.getScale(), y: marksY + 2, align: 'right', scale: 0.6,
    });
    addBMFLabel(infoBg, '再胜', res.font.Ltc_XQ_rst_normal_fnt, {
      x: pro2.x - pro2.width * pro2.getScale(), y: marksY, align: 'right', scale: 0.6, color: cc.color.BLACK,
    });

    // 棋力等级icons
    const iconY = isSelf ? 30 : 17;
    const levelIcon = addSprite(infoBg, resIn.result.Ltc_XQ_result_icon2, {
      x: 5, y: iconY, align: 'left',
    });
    // 棋力等级
    addBMFLabel(infoBg, '棋力等级', res.font.Ltc_XQ_rst_green_fnt, {
      x: levelIcon.x + levelIcon.width * levelIcon.scale + 5, y: levelIcon.y - 2, align: 'left', scale: 0.6,
    });
    addBMFLabel(infoBg, '【' + data.szCurRankName[idx] + '】', res.font.Ltc_XQ_rst_yellow_fnt, {
      x: 220, y: levelIcon.y - 3, align: 'left', scale: 0.6,
    });
  },
  // ////////////////////////////////////////////////////////////////////////////////
});

export default ResultLayer;
