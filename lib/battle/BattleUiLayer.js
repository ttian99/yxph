import logger from '../es6-utils/cocos/console.js';
const console = logger('BattleUiLayer');
import {addSprite} from '../es6-utils/cocos/base';
import {resIn} from '../loader/resource.js';
import Ltc from '../public/Ltc.js';
import Button from '../es6-utils/components/Button.js';
import Events from '../public/Events.js';
import UserInfo from '../public/UserInfo.js';
import OtherInfo from '../public/OtherInfo.js';
import BattleSetLayer from './BattleSetLayer.js';
import BattleData from './BattleData.js';
import s from 'underscore.string';
import _ from 'lodash';
import ChatInfoLayer from '../chat/ChatInfoLayer.js';
import PlayerInfo from '../battle/PlayerInfo.js';
import {getLvName} from '../public/Extra.js';
import {playEffect} from '../es6-utils/cocos/audio.js';

const BattleUiLayer = Ltc.Layer.extend({
  _readySp: null,
  _scale: 1,
  _boardHeight: 0,
  _myMoney: null,
  _globalTime: null,
  _stepTime: null,
  _offy: null,
  m_myTimeTotal: 0,
  m_otherTimeTotal: 0,
  m_myStepTime: 0,
  m_otherStepTime: 0,
  m_myLastTime: 0,
  m_otherLastTime: 0,
  m_myPro: 0,
  m_otherPro: 0,
  m_myProTotal: 0,
  m_otherProTotal: 0,
  isChange: false,
  limit_time: 10, // 房间无读秒时，步时或局时小于该数值时进行读秒
  isLastTime: false,  // 我是否进入读秒读秒
  isOtherLastTime: false, // 对手是否进入读秒读秒
  isStepTime: false, // 是否进入步时读秒（局时读秒与步时读秒互斥)
  isOtherStepTime: false, // 对手是否进入步时读秒（局时读秒与步时读秒互斥)
  isTotalTime: false, // 是否进入局时读秒（局时读秒与步时读秒互斥）
  isOtherTotalTime: false, // 对手是否进入局时读秒（局时读秒与步时读秒互斥）
  ctor(data) {
    this._super();
    // 棋盘缩小比例
    this._scale = data.scale || 1;
    this._boardHeight = data.height;
    console.log('this._boardHeight : ' + this._boardHeight);
    // 初始化一些按钮
    this.initBtns();
    // 个人信息
    this.selfInfoNode();
    // 他人信息
    this.otherInfoNode();
    // 聊天信息框
    this.addChatInfoLayer();
    // 添加事件
    this.addEvts();
    // 添加定时器
    this.schedule(this.timerCallBack, 1.0);
  },

  initBtns() {
    const offY = this._offy = 38;

    // 添加菜单
    const menuBg = new cc.Sprite(resIn.ui.Ltc_XQ_menuBg);
    menuBg.setPosition(cc.p(cc.visibleRect.left.x + menuBg.width / 2, offY));
    this.addChild(menuBg);

    // 设置
    const setBtn = new Button({
      normalRes: resIn.ui.Ltc_XQ_menuBtn,
      onTouchUpInside: () => {
        const battleLayer = new BattleSetLayer(this._offy);
        this.addChild(battleLayer);
      },
    });
    setBtn.setPosition(cc.p(35, menuBg.height / 2));
    menuBg.addChild(setBtn);

    // 聊天
    const chatBtn = new Button({
      normalRes: resIn.ui.Ltc_XQ_messageBtn,
      onTouchUpInside: () => {
        Ltc.sendEvent(Events.Chat_layer);
      },
    });
    chatBtn.setPosition(cc.p(menuBg.width - 35, menuBg.height / 2));
    menuBg.addChild(chatBtn);
  },

  selfInfoNode() {
    const offY = cc.visibleRect.center.y - this._boardHeight * this._scale / 2 + 35;
    const lz = 400 - this._boardHeight * this._scale / 2;
    const sc = lz / 128;

    const root = this.myRoot = new cc.Sprite();
    root.setContentSize(450, 128);
    root.setAnchorPoint(cc.p(0, 1));
    root.setScale(sc);
    root.setPosition(cc.p(cc.visibleRect.center.x, offY));
    this.addChild(root);
    // 我的名称
    const name = this.myName = new cc.LabelTTF('', 'Arial', 18);
    name.setPosition(cc.p(0, 108));
    name.setColor(cc.color(106, 40, 21));
    root.addChild(name);
    // 个人信息背景
    const myInfoBg = this.myInfoBg = addSprite(root, resIn.ui.Ltc_XQ_infoBg, {
      x: 0, y: 60,
    });
    // 头像框按钮
    const photoFrame = this.myInfoBtn = new Button({
      normalRes: resIn.ui.Ltc_XQ_photoFrame,
      onTouchUpInside: () => {
        this.addInfoLayer(photoFrame, true);
      },
    });
    photoFrame.setPosition(cc.p(myInfoBg.width / 2, myInfoBg.height / 2));
    myInfoBg.addChild(photoFrame);
    // 我的头像
    this.myPhoto = addSprite(photoFrame, res.battle.Ltc_XQ_noPerson_png, {
      x: photoFrame.width / 2, y: photoFrame.height / 2,
    });
    // 走步提示progressTimer
    const timerPro = this._timerPro = new cc.ProgressTimer(new cc.Sprite(resIn.ui.Ltc_XQ_timerFrame));
    timerPro.type = cc.ProgressTimer.TYPE_RADIAL;
    timerPro.setPercentage(100);
    timerPro.setPosition(this.myPhoto.getPosition());
    timerPro.setVisible(false);
    photoFrame.addChild(timerPro);
    // 局时
    const globalTxt = new cc.LabelBMFont('局时', res.font.Ltc_XQ_timer_title_fnt);
    globalTxt.setPosition(cc.p(40, myInfoBg.height / 2 - 3));
    globalTxt.setScale(0.6);
    globalTxt.setColor(cc.color(253, 206, 142));
    myInfoBg.addChild(globalTxt);

    const globalTime = this._globalTime = new cc.LabelBMFont('00:00', res.font.Ltc_XQ_timer_title_fnt);
    globalTime.setAnchorPoint(cc.p(0, 0.5));
    globalTime.setPosition(cc.p(70, globalTxt.y));
    globalTime.setScale(0.5);
    globalTime.setColor(cc.color(253, 206, 142));
    myInfoBg.addChild(globalTime);
    // 步时
    const stepTxt = this._stepTxt = new cc.LabelBMFont('步时', res.font.Ltc_XQ_timer_title_fnt);
    stepTxt.setPosition(cc.p(240, globalTxt.y));
    stepTxt.setScale(0.6);
    stepTxt.setColor(cc.color(186, 221, 93));
    myInfoBg.addChild(stepTxt);

    const stepTime = this._stepTime = new cc.LabelBMFont('00:00', res.font.Ltc_XQ_timer_title_fnt);
    stepTime.setAnchorPoint(cc.p(0, 0.5));
    stepTime.setPosition(cc.p(270, globalTxt.y));
    stepTime.setScale(0.5);
    stepTime.setColor(cc.color(186, 221, 93));
    myInfoBg.addChild(stepTime);
    // 读秒
    const readSec = this._readSec = new cc.LabelBMFont('0', res.font.Ltc_XQ_sec_num_fnt);
    readSec.setPosition(cc.p(275, globalTxt.y - 3));
    readSec.setVisible(false);
    myInfoBg.addChild(readSec);
    // 称号
    const titleBg = addSprite(photoFrame, resIn.ui.Ltc_XQ_levelbg, {
      x: photoFrame.width / 2, y: -15,
    });
    const titleTxt = this.myTitle = new cc.LabelBMFont('', res.font.Ltc_XQ_lvName_fnt);
    titleTxt.setPosition(cc.p(titleBg.width / 2, titleBg.height / 2 - 1));
    titleBg.addChild(titleTxt);
  },

  otherInfoNode() {
    const offY = cc.visibleRect.center.y + this._boardHeight * this._scale / 2;
    const lz = 400 - this._boardHeight * this._scale / 2;
    const sc = lz / 128;

    const root = this.otherRoot = new cc.Sprite();
    root.setContentSize(450, 128);
    root.setAnchorPoint(cc.p(0, 0));
    root.setScale(sc);
    root.setPosition(cc.p(cc.visibleRect.center.x, offY));
    this.addChild(root);

    // 他人名称
    const name = this.otherName = new cc.LabelTTF('', 'Arial', 18);
    name.setPosition(cc.p(0, 108));
    name.setColor(cc.color(106, 40, 21));
    root.addChild(name);
    // 他人信息背景
    const otherInfoBg = this.otherInfoBg = addSprite(root, resIn.ui.Ltc_XQ_infoBg, {
      x: 0, y: 60,
    });
    // 头像框按钮
    const photoFrame = this.otherInfoBtn = new Button({
      normalRes: resIn.ui.Ltc_XQ_photoFrame,
      disableRes: resIn.ui.Ltc_XQ_photoFrame,
      onTouchUpInside: () => {
        this.addInfoLayer(photoFrame, false);
      },
      disabled: true,
    });
    photoFrame.setPosition(cc.p(otherInfoBg.width / 2, otherInfoBg.height / 2));
    otherInfoBg.addChild(photoFrame);
    // 他人的头像
    this.otherPhoto = addSprite(photoFrame, res.battle.Ltc_XQ_noPerson_png, {
      x: photoFrame.width / 2, y: photoFrame.height / 2,
    });
    // 走步提示progressTimer
    const timerPro = this._timerProOther = new cc.ProgressTimer(new cc.Sprite(resIn.ui.Ltc_XQ_timerFrame));
    timerPro.type = cc.ProgressTimer.TYPE_RADIAL;
    timerPro.setPercentage(100);
    timerPro.setPosition(this.otherPhoto.getPosition());
    timerPro.setVisible(false);
    photoFrame.addChild(timerPro);
    // 他人局时
    const globalTxtOther = new cc.LabelBMFont('局时', res.font.Ltc_XQ_timer_title_fnt);
    globalTxtOther.setPosition(cc.p(40, otherInfoBg.height / 2 - 3));
    globalTxtOther.setScale(0.6);
    globalTxtOther.setColor(cc.color(253, 206, 142));
    otherInfoBg.addChild(globalTxtOther);

    const globalTimeOther = this._globalTimeOther = new cc.LabelBMFont('00:00', res.font.Ltc_XQ_timer_title_fnt);
    globalTimeOther.setAnchorPoint(cc.p(0, 0.5));
    globalTimeOther.setPosition(cc.p(70, globalTxtOther.y));
    globalTimeOther.setScale(0.5);
    globalTimeOther.setColor(cc.color(253, 206, 142));
    otherInfoBg.addChild(globalTimeOther);
    // 他人步时
    const stepTxtOther = this._stepTxtOther = new cc.LabelBMFont('步时', res.font.Ltc_XQ_timer_title_fnt);
    stepTxtOther.setPosition(cc.p(240, globalTxtOther.y));
    stepTxtOther.setScale(0.6);
    stepTxtOther.setColor(cc.color(186, 221, 93));
    otherInfoBg.addChild(stepTxtOther);

    const stepTimeOther = this._stepTimeOther = new cc.LabelBMFont('00:00', res.font.Ltc_XQ_timer_title_fnt);
    stepTimeOther.setAnchorPoint(cc.p(0, 0.5));
    stepTimeOther.setPosition(cc.p(270, globalTxtOther.y));
    stepTimeOther.setScale(0.5);
    stepTimeOther.setColor(cc.color(186, 221, 93));
    otherInfoBg.addChild(stepTimeOther);
    // 他人读秒
    const readSecOther = this._readSecOther = new cc.LabelBMFont('0', res.font.Ltc_XQ_sec_num_fnt);
    readSecOther.setPosition(cc.p(275, globalTxtOther.y - 3));
    readSecOther.setVisible(false);
    otherInfoBg.addChild(readSecOther);
    // 称号
    const titleBgOther = addSprite(photoFrame, resIn.ui.Ltc_XQ_levelbg, {
      x: photoFrame.width / 2, y: -15,
    });
    const titleTxtOther = this.otherTitle = new cc.LabelBMFont('', res.font.Ltc_XQ_lvName_fnt);
    titleTxtOther.setPosition(cc.p(titleBgOther.width / 2, titleBgOther.height / 2 - 1));
    titleBgOther.addChild(titleTxtOther);
  },

  formatSeconds(value) {
    const sec = value % 60;
    const min = Math.floor(value / 60);
    return s.pad(min, 2, '0') + ':' + s.pad(sec, 2, '0');
  },

  // 添加事件
  addEvts() {
    this.addEvent(Events.Battle_user_sitdown, (event, data) => {
      if (data.qq === UserInfo.getMyQQ()) {
        this.myName.setString('【' + UserInfo.getMyName() + '】');
        const titleStr = getLvName(UserInfo.data.points);
        this.myTitle.setString(titleStr);
      } else {
        this.otherName.setString('【' + OtherInfo.getOtherName() + '】');
        const titleStr = getLvName(OtherInfo.data.points);
        this.otherTitle.setString(titleStr);
        this.otherInfoBtn.setIsDisabled(false);
      }
      this.loadPhoto(data.qq);
    });
    this.addEvent(Events.Battle_user_leave, (event, data) => {
      const qq = data;
      if (qq === OtherInfo.getOtherQQ()) {
        this.otherName.setString('');
        this.otherTitle.setString('');
        this.otherPhoto.setTexture(res.battle.Ltc_XQ_noPerson_png);
        this.otherInfoBtn.setIsDisabled(true);
      }
    });
    // 局时初始化
    this.addEvent(Events.Battle_game_pram, () => {
      this.initTime();
    });
    // 时间同步
    this.addEvent(Events.Battle_update_time, (event, data) => {
      this.setTime(data);
    });
    // 移动棋子事件，用于重置步时和读秒
    this.addEvent(Events.Battle_move_Piece, (event, data) => {
      this.resetStepOrLastTime(data);
    });
    // 发送聊天信息
    this.addEvent(Events.Chat_msg, (event, data) => {
      console.log('-------- data ----------');
      console.log(data);
      if (data.qq === UserInfo.getMyQQ()) {
        this.selfChatInfo.show(data.msg);
      } else {
        this.otherChatInfo.show(data.msg);
      }
    });
  },

  resetStepOrLastTime(data) {
    const order = data.curOrder === 0 ? 1 : 0;
    if (order === UserInfo.getMySeat()) {
      if (!this.isLastTime) {
        if (BattleData.isSetStepTime) {// 重置步时
          this.m_myStepTime = _.clone(BattleData.getStepTime(), true);
          this.m_myPro = _.clone(BattleData.getStepTime(), true);
          this._stepTime.setString(this.formatSeconds(this.m_myStepTime));
        }
        this.showStepUi();
      } else {
        if (BattleData.isSetLastTime) {// 重置读秒
          this.m_myLastTime = _.clone(BattleData.getLastTime(), true);
          this.m_myPro = _.clone(BattleData.getLastTime(), true);
          this._readSec.setString(this.m_myLastTime);
          this._readSec.setVisible(false);
        }
      }
    } else {
      if (!this.isOtherLastTime) {
        if (BattleData.isSetStepTime) {// 重置对手步时
          this.m_otherStepTime = _.clone(BattleData.getStepTime(), true);
          this.m_otherPro = _.clone(BattleData.getStepTime(), true);
          this._stepTimeOther.setString(this.formatSeconds(this.m_otherStepTime));
        }
        this.showOtherStepUi();
      } else {
        if (BattleData.isSetLastTime) {// 重置对手读秒
          this.m_otherLastTime = _.clone(BattleData.getLastTime(), true);
          this.m_otherPro = _.clone(BattleData.getLastTime(), true);
          this._readSecOther.setString(this.m_otherLastTime);
          this._readSecOther.setVisible(false);
        }
      }
    }
  },

  initTime() {
    console.log('初始化局时，步时');
    this.m_myTimeTotal = _.clone(BattleData.getTotalTime(), true);
    this.m_otherTimeTotal = _.clone(BattleData.getTotalTime(), true);
    this.m_myStepTime = _.clone(BattleData.getStepTime(), true);
    this.m_otherStepTime = _.clone(BattleData.getStepTime(), true);
    this.m_myLastTime = _.clone(BattleData.getLastTime(), true);
    this.m_otherLastTime = _.clone(BattleData.getLastTime(), true);

    // 初始化局时和步时，用于开局
    this._globalTime.setString(this.formatSeconds(this.m_myTimeTotal));
    this._globalTimeOther.setString(this.formatSeconds(this.m_otherTimeTotal));
    if (BattleData.isSetStepTime) {
      this._stepTime.setString(this.formatSeconds(this.m_myStepTime));
      this._stepTimeOther.setString(this.formatSeconds(this.m_otherStepTime));
    } else {
      this._stepTime.setString('不设置');
      this._stepTimeOther.setString('不设置');
    }
    // 隐藏读秒
    this._readSec.setVisible(false);
    this._readSecOther.setVisible(false);
    // 初始化变量
    this.isLastTime = false;
    this.isOtherLastTime = false;
    this.isStepTime = false;
    this.isOtherStepTime = false;
    this.isTotalTime = false;
    this.isOtherTotalTime = false;
    // 初始化pro
    this.initPro();
  },

  // 初始化pro
  initPro() {
    if (BattleData.isSetStepTime) {
      this.m_myPro = _.clone(BattleData.getStepTime(), true);
      this.m_otherPro = _.clone(BattleData.getStepTime(), true);
      this.m_myProTotal = _.clone(BattleData.getStepTime(), true);
      this.m_otherProTotal = _.clone(BattleData.getStepTime(), true);
    } else {
      this.m_myPro = _.clone(BattleData.getTotalTime(), true);
      this.m_otherPro = _.clone(BattleData.getTotalTime(), true);
      this.m_myProTotal = _.clone(BattleData.getTotalTime(), true);
      this.m_otherProTotal = _.clone(BattleData.getTotalTime(), true);
    }
  },

  setTime(data) {
    console.log('更新局时，步时或读秒！');
    let timeCount;
    let timeCountOther;
    let stepCount;
    let stepCountOther;
    let lastCount;
    let lastCountOther;
    if (UserInfo.getMySeat() === 0) {
      timeCount = data.nRoundTime - data.nTotal0;
      timeCountOther = data.nRoundTime - data.nTotal1;
      stepCount = data.nStepTime - data.nSeat0;
      stepCountOther = data.nStepTime - data.nSeat1;
      lastCount = data.nLastTime - data.nLast0;
      lastCountOther = data.nLastTime - data.nLast1;
    } else {
      timeCount = data.nRoundTime - data.nTotal1;
      timeCountOther = data.nRoundTime - data.nTotal0;
      stepCount = data.nStepTime - data.nSeat1;
      stepCountOther = data.nStepTime - data.nSeat0;
      lastCount = data.nLastTime - data.nLast1;
      lastCountOther = data.nLastTime - data.nLast0;
    }
    // 同步己方局时
    if (timeCount >= 0) {
      this.m_myTimeTotal = timeCount;
      this._globalTime.setString(this.formatSeconds(timeCount));
      if (!BattleData.isSetStepTime) {
        this.m_myPro = timeCount;
      }
    }
    if (timeCount <= 0) {
      this.inReadSecs();
    }
    // 同步对方局时
    if (timeCountOther >= 0) {
      this.m_otherTimeTotal = timeCountOther;
      this._globalTimeOther.setString(this.formatSeconds(timeCountOther));
      if (!BattleData.isSetStepTime) {
        this.m_otherPro = timeCountOther;
      }
    }
    if (timeCountOther <= 0) {
      this.otherInReadSecs();
    }
    // 同步步时或读秒
    if (BattleData.getIsReconnect()) {
      BattleData.setIsReconnect(false);
      // 如果局时大于0，房间有设置步时，且未进入读秒状态
      if (timeCount >= 0 && !this.isLastTime && BattleData.isSetStepTime) {
        // 初始化步时时间
        this.m_myStepTime = stepCount;
        this.m_myPro = stepCount;
        this._stepTime.setString(this.formatSeconds(this.m_myStepTime));
      } else if (this.isLastTime) { // 进入读秒
        // 初始化读秒时间
        this.m_myLastTime = lastCount;
        this.m_myPro = lastCount;
      }
      // 如果局时大于0，房间有设置步时，且未进入读秒状态
      if (timeCountOther >= 0 && !this.isOtherLastTime && BattleData.isSetStepTime) {
        // 初始化对手步时时间
        this.m_otherStepTime = stepCountOther;
        this.m_otherPro = stepCountOther;
        this._stepTimeOther.setString(this.formatSeconds(this.m_otherStepTime));
      } else if (this.isOtherLastTime) { // 进入读秒
        // 初始化对手读秒时间
        this.m_otherLastTime = lastCountOther;
        this.m_otherPro = lastCountOther;
      }
    }
  },
  // 我进入读秒
  inReadSecs() {
    // 进入读秒
    if (!this.isLastTime && BattleData.isSetLastTime) {
      this.isLastTime = true;
      this._stepTxt.setVisible(false);
      this._stepTime.setVisible(false);
      this.m_myPro = _.clone(BattleData.getLastTime(), true);
      this.m_myProTotal = _.clone(BattleData.getLastTime(), true);
      this._timerPro.setVisible(false);
    }
  },

  // 对手进入读秒
  otherInReadSecs() {
    // 进入读秒
    if (!this.isOtherLastTime && BattleData.isSetLastTime) {
      this.isOtherLastTime = true;
      this._stepTxtOther.setVisible(false);
      this._stepTimeOther.setVisible(false);
      this.m_otherPro = _.clone(BattleData.getLastTime(), true);
      this.m_otherProTotal = _.clone(BattleData.getLastTime(), true);
      this._timerProOther.setVisible(false);
    }
  },
  // 重置局时和步时，用于游戏结束
  resetAllTime() {
    this.m_myTimeTotal = 0;
    this.m_otherTimeTotal = 0;
    this.m_myStepTime = 0;
    this.m_otherStepTime = 0;
    this.m_myLastTime = 0;
    this.m_otherLastTime = 0;

    // 恢复步时文字
    this._stepTxt.setVisible(true);
    this._stepTxtOther.setVisible(true);
    // 重置步时和局时
    this._stepTime.setString(this.formatSeconds(this.m_myStepTime));
    this._stepTime.setVisible(true);
    this._stepTimeOther.setString(this.formatSeconds(this.m_otherStepTime));
    this._stepTimeOther.setVisible(true);
    this._globalTime.setString(this.formatSeconds(this.m_myTimeTotal));
    this._globalTimeOther.setString(this.formatSeconds(this.m_otherTimeTotal));
    // 隐藏读秒
    this._readSec.setVisible(false);
    this._readSecOther.setVisible(false);
    // 隐藏timer
    this._timerPro.setVisible(false);
    this._timerProOther.setVisible(false);
  },

  ac(node) {
    node.setOpacity(0);
    node.setScale(3.0);
    node.runAction(cc.sequence(
      cc.spawn(cc.fadeIn(0.2), cc.scaleTo(0.2, 0.7)),
      cc.scaleTo(0.1, 0.75),
      cc.scaleTo(0.3, 0.7)
    ));
    playEffect(res.audio.Ltc_XQ_timewarning_mp3);
  },

  totalTimeReadSecs(times) {
    if (times < 0) {
      return;
    }
    if (this._stepTxt.isVisible()) {
      this._stepTxt.setVisible(false);
      this._stepTime.setVisible(false);
    }
    if (!this._readSec.isVisible()) {
      this._readSec.setVisible(true);
    }
    this._readSec.setString(times);
    this.ac(this._readSec);
  },

  otherTotalTimeReadSecs(times) {
    if (times < 0) {
      return;
    }
    if (this._stepTxtOther.isVisible()) {
      this._stepTxtOther.setVisible(false);
      this._stepTimeOther.setVisible(false);
    }
    if (!this._readSecOther.isVisible()) {
      this._readSecOther.setVisible(true);
    }
    this._readSecOther.setString(times);
    this.ac(this._readSecOther);
  },

  stepTimeReadSecs(times) {
    if (times < 0) {
      return;
    }
    if (this._stepTxt.isVisible()) {
      this._stepTxt.setVisible(false);
      this._stepTime.setVisible(false);
    }
    if (!this._readSec.isVisible()) {
      this._readSec.setVisible(true);
    }
    this._readSec.setString(times);
    this.ac(this._readSec);
  },

  otherStepTimeReadSecs(times) {
    if (times < 0) {
      return;
    }
    if (this._stepTxtOther.isVisible()) {
      this._stepTxtOther.setVisible(false);
      this._stepTimeOther.setVisible(false);
    }
    if (!this._readSecOther.isVisible()) {
      this._readSecOther.setVisible(true);
    }
    this._readSecOther.setString(times);
    this.ac(this._readSecOther);
  },

  showStepUi() {
    if (!this._stepTxt.isVisible()) {
      this._stepTxt.setVisible(true);
      this._stepTime.setVisible(true);
    }
    if (this._readSec.isVisible()) {
      this._readSec.setVisible(false);
    }
    if (this.isStepTime) {
      this.isStepTime = false;
    }
  },

  showOtherStepUi() {
    if (!this._stepTxtOther.isVisible()) {
      this._stepTxtOther.setVisible(true);
      this._stepTimeOther.setVisible(true);
    }
    if (this._readSecOther.isVisible()) {
      this._readSecOther.setVisible(false);
    }
    if (this.isOtherStepTime) {
      this.isOtherStepTime = false;
    }
  },

  timerCallBack() {
    if (!BattleData.isGamePlaying) {
      if (this.isChange) {
        this.isChange = false;
        this.resetAllTime();
      }
      return;
    }
    if (!this.isChange) {
      this.isChange = true;
    }
    // -----------------------------------------------------------------------------------------
    if (BattleData.ctrlEnable()) {
      // 我的局时变更
      // 如果有读秒
      if (BattleData.isSetLastTime) {
        if (this.m_myTimeTotal > 0) {
          this.m_myTimeTotal--;
          this._globalTime.setString(this.formatSeconds(this.m_myTimeTotal));
        } else {
          // 进入读秒
          this.inReadSecs();
        }
      } else {
        if (this.m_myTimeTotal > this.limit_time || this.isStepTime) {
          this.m_myTimeTotal--;
          this._globalTime.setString(this.formatSeconds(this.m_myTimeTotal));
        } else if (this.m_myTimeTotal <= this.limit_time && this.m_myTimeTotal > 0) {
          if (!this.isTotalTime) {
            // 局时进入读秒
            this.isTotalTime = true;
          }
          this.m_myTimeTotal--;
          this._globalTime.setString(this.formatSeconds(this.m_myTimeTotal));
          this.totalTimeReadSecs(this.m_myTimeTotal);
        }
      }
      // 如果未进入读秒
      if (!this.isLastTime) {
        // 如果有步时
        if (BattleData.isSetStepTime) {
          // 如果有读秒
          // if (BattleData.isSetLastTime) {
          //   if (this.m_myStepTime > 0) {
          //     this.m_myStepTime--;
          //     this._stepTime.setString(this.formatSeconds(this.m_myStepTime));
          //   }
          // } else { // 如果无读秒
          if (this.m_myStepTime > this.limit_time || this.isTotalTime) {
            this.m_myStepTime--;
            this._stepTime.setString(this.formatSeconds(this.m_myStepTime));
          } else if (this.m_myStepTime <= this.limit_time && this.m_myStepTime > 0) {
            // 步时进入读秒
            if (!this.isStepTime) {
              this.isStepTime = true;
            }
            this.m_myStepTime--;
            this.stepTimeReadSecs(this.m_myStepTime);
          }
          // }
        }
      } else {
        // 如果进入读秒，且房间有设置读秒
        if (BattleData.isSetLastTime && this.m_myLastTime > 0) {
          if (this._readSec.isVisible()) {
            this.m_myLastTime--;
          } else {
            this._readSec.setVisible(true);
          }
          this._readSec.setString(this.m_myLastTime);
          this.ac(this._readSec);
        }
      }
      // 显示我的timer
      if (!this._timerPro.isVisible()) {
        this._timerPro.setVisible(true);
        this._timerPro.stopAllActions();
        const from = this.m_myPro / this.m_myProTotal * 100;
        this._timerPro.runAction(cc.progressFromTo(this.m_myPro, from, 0));
      }
      // 隐藏对手timer
      if (this._timerProOther.isVisible()) {
        this._timerProOther.setVisible(false);
        this._timerProOther.stopAllActions();
      }
    } else {// -----------------------------------------------------------------------------------------
      // 对手局时变更
      // 如果有读秒
      if (BattleData.isSetLastTime) {
        if (this.m_otherTimeTotal > 0) {
          this.m_otherTimeTotal--;
          this._globalTimeOther.setString(this.formatSeconds(this.m_otherTimeTotal));
        } else {
          // 进入读秒
          this.otherInReadSecs();
        }
      } else {
        if (this.m_otherTimeTotal > this.limit_time || this.isOtherStepTime) {
          this.m_otherTimeTotal--;
          this._globalTimeOther.setString(this.formatSeconds(this.m_otherTimeTotal));
        } else if (this.m_otherTimeTotal <= this.limit_time && this.m_otherTimeTotal > 0) {
          if (!this.isOtherTotalTime) {
            // 局时进入读秒
            this.isOtherTotalTime = true;
          }
          this.m_otherTimeTotal--;
          this._globalTimeOther.setString(this.formatSeconds(this.m_otherTimeTotal));
          this.otherTotalTimeReadSecs(this.m_otherTimeTotal);
        }
      }
      // 如果未进入读秒
      if (!this.isOtherLastTime) {
        // 如果有设置步时，且步时还大于0
        if (BattleData.isSetStepTime) {
          // 如果有读秒
          // if (BattleData.isSetLastTime) {
          //   if (this.m_otherStepTime > 0) {
          //     this.m_otherStepTime--;
          //     this._stepTimeOther.setString(this.formatSeconds(this.m_otherStepTime));
          //   }
          // } else { // 如果无读秒
          if (this.m_otherStepTime > this.limit_time || this.isOtherTotalTime) {
            this.m_otherStepTime--;
            this._stepTimeOther.setString(this.formatSeconds(this.m_otherStepTime));
          } else if (this.m_otherStepTime <= this.limit_time && this.m_otherStepTime > 0) {
            // 步时进入读秒
            if (!this.isOtherStepTime) {
              this.isOtherStepTime = true;
            }
            this.m_otherStepTime--;
            this.otherStepTimeReadSecs(this.m_otherStepTime);
          }
          // }
        }
      } else {
        // 如果进入读秒，且房间有设置读秒， 读秒时间大于0
        if (BattleData.isSetLastTime && this.m_otherLastTime > 0) {
          if (this._readSecOther.isVisible()) {
            this.m_otherLastTime--;
          } else {
            this._readSecOther.setVisible(true);
          }
          this._readSecOther.setString(this.m_otherLastTime);
          this.ac(this._readSecOther);
        }
      }
      // 隐藏我的timer
      if (this._timerPro.isVisible()) {
        this._timerPro.setVisible(false);
        this._timerPro.stopAllActions();
      }
      // 显示对手timer
      if (!this._timerProOther.isVisible()) {
        this._timerProOther.setVisible(true);
        this._timerProOther.stopAllActions();
        const from = this.m_otherPro / this.m_otherProTotal * 100;
        this._timerProOther.runAction(cc.progressFromTo(this.m_otherPro, from, 0));
      }
    }// -----------------------------------------------------------------------------------------
  },

  loadPhoto(qq) {
    cc.loader.loadImg('http://q.qlogo.cn/g?b=qq&nk=' + qq + '&s=100', {
      isCrossOrigin: true,
      width: 100,
      height: 100,
    }, (err, img) => {
      if (!err) {
        if (qq === UserInfo.getMyQQ()) {
          this.myPhoto.setTexture(img);
        } else {
          this.otherPhoto.setTexture(img);
        }
      } else {
        console.log('xxxxxxxxxxxxxxxxxxx : ' + err);
        if (qq === UserInfo.getMyQQ()) {
          if (this.myPhoto && cc.sys.isObjectValid(this.myPhoto)) {
            this.myPhoto.setTexture(res.battle.Ltc_XQ_noPerson_png);
          }
        } else {
          if (this.otherPhoto && cc.sys.isObjectValid(this.otherPhoto)) {
            this.otherPhoto.setTexture(res.battle.Ltc_XQ_noPerson_png);
          }
        }
      }
    });
  },

  addInfoLayer(node, isSelf) {
    console.log('-- addInfoLayer --');
    console.log('-- isSelf : ' + isSelf + ' --');
    const offY = 0;
    const data = isSelf ? UserInfo.data : OtherInfo.data;
    const playerInfo = new PlayerInfo(data);
    const anchorY = isSelf ? 0 : 1;
    const posX = cc.visibleRect.center.x + 30;
    const posY = isSelf ? this.myRoot.y + offY : this.otherRoot.y - offY;
    playerInfo.setAnc(0.5, anchorY);
    playerInfo.setPos(posX, posY);
    this.getParent().addChild(playerInfo, 10);
  },
  // 添加聊天信息显示框
  addChatInfoLayer() {
    const offY = 0;
    this.selfChatInfo = new ChatInfoLayer(0);
    this.selfChatInfo.x = cc.visibleRect.center.x;
    this.selfChatInfo.y = this.myRoot.y + offY;
    this.addChild(this.selfChatInfo);

    this.otherChatInfo = new ChatInfoLayer(1);
    this.otherChatInfo.x = cc.visibleRect.center.x;
    this.otherChatInfo.y = this.otherRoot.y - offY;
    this.addChild(this.otherChatInfo);
  },
});

export default BattleUiLayer;
