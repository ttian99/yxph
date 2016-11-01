import logger from '../es6-utils/cocos/console.js';
const console = logger('Net');
import UserInfo from './UserInfo.js';
import OtherInfo from './OtherInfo.js';
import SceneInfo from './SceneInfo.js';
import BattleData from '../battle/BattleData.js';
import Ltc from './Ltc.js';
import Events from './Events.js';
import PublicDialog from '../publicDialog/PublicDialog.js';
import cfg from '../constants';

const Net = cc.Class.extend({
  ctor() {
    this.addNotice();
    this.onJsMode();
  },

  onJsMode() {
    LTC.JM.getInstance().jsMode = (isDebug) =>{
      cfg.DEBUG = isDebug;
    };
  },

  initialize() {
    LTC.JM.getInstance().initTSDK();
  },

  // nUIN 账号，pwd密码，登录
  login(nUIN, pwd) {
    LTC.JM.getInstance().login(nUIN, pwd);
  },
  // 进入场
  enterGame(sceneID) {
    LTC.JM.getInstance().enterGame(sceneID);
  },
  // 游戏准备
  ready() {
    LTC.JM.getInstance().ready();
  },
  // 换桌
  changeTable() {
    LTC.JM.getInstance().changeTable();
    Ltc.sendEvent('BLOCKING');
  },
  // 支付接口
  /*
  loginType	int	游戏当前账户类型 ， 1：QQ， 2：微信
  payValue	int	用户充值数量，即游戏币的个数.(必须是整数)
  isCanChange	boolean	充值数额是否可改。true：可改； false：不可改。
  payType	int	支付类型， 0 : 米大师 ， 1：商品
  payItem	String	购买明细,应用可以自己控制批价格式的定义，比如可为xxx*1;yyy*2,表示xxx一件和yyy两件。长度小于512字符。
  payInfo	String	购买描述,应用可以自己控制批价格式的定义，比如可为name*desc。长度小于255字符，utf8编码
  reqTime	String	请求发生的时间
  customMeta	String	透传参数
  */
  pay(payValue, payType, payItem, payInfo, reqTime, customMeta) {
    LTC.JM.getInstance().pay(payValue, payType, payItem, payInfo, reqTime, customMeta);
  },
  payCallback() {
    LTC.JM.getInstance().payCallback = (jsonstr) => {
      console.log('=>payCallback : ' + jsonstr);
    };
  },
  // 分享接口
  /*
  title	String	分享的标题, 最长30个字符。
  summary	String	分享的消息摘要，最长40个字。
  iconUrl	String	分享的缩略小图
  targetUrl	String	分享内容中携带的链接。
  localPicUrl	String	分享本地图片，图片地址。如："/storage/sdcard0/pkg/img/a.png"
  localPicTip	String	分享本地图片说明
  editTextTip	String	编辑框中默认填写的内容
  */
  share(title, summary, targetUrl, iconUrl, localPicUrl, localPicTip, editTextTip) {
    LTC.JM.getInstance().share(title, summary, targetUrl, iconUrl, localPicUrl, localPicTip, editTextTip);
  },
  shareCallback() {
    LTC.JM.getInstance().shareCallback = (jsonstr) => {
      console.log('=>shareCallback : ' + jsonstr);
    };
  },
  // 更新场信息如在线人数 和 用户信息
  updateSceneInfoAndUserInfo() {
    LTC.JM.getInstance().updateSceneInfoAndUserInfo();
  },
  // 离开房间
  leaveRoom(offLine) {
    LTC.JM.getInstance().leaveRoom(offLine);
  },
  // 发送聊天
  sendChat(msg) {
    const qq = UserInfo.getMyQQ();
    LTC.JM.getInstance().sendChat(qq, msg);
  },

  /**
    int chair；//座位号
    WORD wMins;//局时分
	  WORD wSecs;//局时秒
	  WORD wStepMins;//步时分
  	WORD wStepSecs;//步时秒
	  WORD wLastMin;//读秒分
	  WORD wLastSec;//读秒秒
	  unsigned int unBaseMoney;//基本游戏币
   */
  setTime(wMins, wSecs, wStepMins, wStepSecs, wLastMin, wLastSec, unBaseMoney) {
    const chair = UserInfo.getMySeat();
    LTC.JM.getInstance().setTime(chair, wMins, wSecs, wStepMins, wStepSecs, wLastMin, wLastSec, unBaseMoney);
  },

  /**
   * int chair；//座位号
   * BYTE pieceIndex;				// 起始棋子或STEP_EVENT
	   BYTE orignX;		BYTE orignY;	// 起始坐标
	   BYTE distX;	  BYTE distY;	// 目标地点坐标
   */
  movePiece(pieceIndex, orignX, orignY, distX, distY) {
    const chair = UserInfo.getMySeat();
    console.log('server =>移动棋子：' + pieceIndex + '从坐标[' + orignX + ', ' + orignY + ']移动到坐标[' + distX + ', ' + distY + ']');
    LTC.JM.getInstance().movePiece(chair, pieceIndex, orignX, orignY, distX, distY);
  },
  // 认输
  reqGiveUp() {
    const chair = UserInfo.getMySeat();
    LTC.JM.getInstance().reqGiveUp(chair);
  },
  // 求和
  reqPeace() {
    const chair = UserInfo.getMySeat();
    LTC.JM.getInstance().reqPeace(chair);
    PublicDialog.addWaitPop({txt: '正在等待对方确认求和...'});
  },
  // 应答求和
  ansPeace(isAgree) {
    const chair = UserInfo.getMySeat();
    LTC.JM.getInstance().ansPeace(chair, isAgree);
  },
  // 悔棋
  reqRegret() {
    const chair = UserInfo.getMySeat();
    LTC.JM.getInstance().reqRegret(chair);
    PublicDialog.addWaitPop({txt: '正在等待对方确认悔棋...'});
  },
  // 应答悔棋
  ansRegret(isAgree) {
    const chair = UserInfo.getMySeat();
    LTC.JM.getInstance().ansRegret(chair, isAgree);
  },
  // 超时
  playerTimeout() {
    const chair = UserInfo.getMySeat();
    LTC.JM.getInstance().playerTimeout(chair);
  },
  // 确认局时
  confirmTime(isAgree) {
    const chair = UserInfo.getMySeat();
    LTC.JM.getInstance().confirmTime(chair, isAgree);
  },

  // 监控各类信息，和各个请求的回调
  addNotice() {
    this.onLogin();
    this.onUserInfo();
    this.onOtherInfo();
    this.onSceneInfo();
    this.onEnterGame();
    this.onSitdown();
    this.onUserEnter();
    this.onSetRoomInfo();
    this.onUserExit();
    this.onLeaveRoom();
    this.onPlayerReady();
    this.onChairState();
    this.onGameStart();
    this.onMoveResult();
    this.onTimeUpdate();
    this.onTimeSet();
    this.onGameOver();
    this.onNotifyGameEnd();
    this.onGameContext();
    this.onGameBoard();
    this.onPeaceSet();
    this.onRegret();
    this.onDenyPeace();
    this.onAnsGiveUp();
    this.onTimeOut();
    this.onDangerOver();
    this.onConfirmTime();
    this.onMoveRecord();
    this.onRegretStep();
    this.onNotifyMsg();
    this.onShowMsg();
    this.onGameEndResult();
    this.onLongCatchOver();
    this.onNotifyRegretTimes();
    this.onGetReadyByTime();
    this.onSelfSetTime();
    this.onChatMsg();
  },

  // 登录成功或者失败信息
  onLogin() {
    LTC.JM.getInstance().OnGetQQBaseInfoSuccess = (jsonStr) => {
      console.log(' => login success!!! : ' + jsonStr);
      Ltc.sendEvent(Events.Login_success, JSON.parse(jsonStr));
    };
    LTC.JM.getInstance().OnGetQQBaseInfoFailed = () => {
      console.log(' => login failed!!! ');
      Ltc.sendEvent(Events.Login_failed);
    };
  },

  // 个人信息
  onUserInfo() {
    LTC.JM.getInstance().OnNotifyUserInfo = (qq, nick, gender, faceid, age, points, money, win, lose, tie, escRate, winRate, offRate) => {
      UserInfo.updateInfo(qq, nick, gender, faceid, age, points, money, win, lose, tie, escRate, winRate, offRate);
    };
  },

  // 他人信息
  onOtherInfo() {
    LTC.JM.getInstance().OnNotifyOtherInfo = (qq, nick, gender, faceid, age, points, money, win, lose, tie, escRate, winRate, offRate) => {
      OtherInfo.updateInfo(qq, nick, gender, faceid, age, points, money, win, lose, tie, escRate, winRate, offRate);
    };
  },

  // 场信息
  onSceneInfo() {
    LTC.JM.getInstance().OnNotifySceneOnlineInfo = (sceneId, sceneName, nOnline, lowLimit, upLimit, recommendLow, recommendUp) => {
      SceneInfo.updateInfo(sceneId, sceneName, nOnline, lowLimit, upLimit, recommendLow, recommendUp);
    };
  },

  // 进入场成功或者失败信息
  onEnterGame() {
    LTC.JM.getInstance().OnEnterRoomSuccess = () => {
      console.log(' => enterRoom success!!! ');
      Ltc.sendEvent('RELEASEING');
      Ltc.sendEvent(Events.Enter_room_success);
      BattleData.status = 1;
    };
    LTC.JM.getInstance().OnEnterRoomFailed = (err) => {
      console.log(' => err:  ' + err);
      Ltc.sendEvent('RELEASEING');
      Ltc.sendEvent(Events.Enter_room_failed);
      BattleData.status = 0;
    };
  },

  // 坐下成功或者失败信息(发出EnterGame后，进入场景成功后，棋力评测场自动返回)
  onSitdown() {
    LTC.JM.getInstance().OnSitDownSuccess = (roomid, tableid, seatid, level) => {
      PublicDialog.removeWaitPop();
      UserInfo.setSitInfo(roomid, tableid, seatid, level);
    };
  },

  onSetRoomInfo() {
    LTC.JM.getInstance().OnSetRoomInfo = (qq, tableid, seatid) => {
      if (qq === UserInfo.getMyQQ()) {
        console.log('server =>设置我的座位id: ' + seatid);
        UserInfo.setRoomInfo(tableid, seatid);
      } else {
        console.log('server =>设置对手的座位id: ' + seatid);
        OtherInfo.setRoomInfo(tableid, seatid);
      }
      const dt = {
        qq: qq,
        seatid: seatid,
      };
      Ltc.sendEvent(Events.Battle_user_sitdown, dt);
    };
  },

  // 监控玩家进入房间
  onUserEnter() {
    LTC.JM.getInstance().OnUserEnter = (qq, bIsPlayer) => {
      Ltc.sendEvent('RELEASEING');
      if (bIsPlayer) {
        console.log('server =>玩家QQ:' + qq + '进入房间!');
        if (qq === UserInfo.getMyQQ()) {
          BattleData.status = 1;
        }
      }
    };
  },
  // 监控玩家离开房间
  onUserExit() {
    LTC.JM.getInstance().OnUserExit = (qq) => {
      console.log('server =>玩家QQ:' + qq + '离开房间!');
      BattleData.isGamePlaying = false;
      Ltc.sendEvent(Events.Battle_user_leave, qq);
      if (qq === UserInfo.getMyQQ()) {
        BattleData.status = 0;
      }
    };
  },

  // 监控玩家退出房间
  onLeaveRoom() {
    LTC.JM.getInstance().OnLeaveRoom = () => {
      console.log('server =>离开房间!');
      BattleData.isGamePlaying = false;
      // Ltc.sendEvent(Events.Battle_self_LeaveRoom);
    };
  },
  // 监控玩家准备信息
  onPlayerReady() {
    LTC.JM.getInstance().OnPlayerReady = (qq) => {
      Ltc.sendEvent(Events.Battle_player_ready, qq);
    };
    // 由SO发出, 用于同步准备状态
    LTC.JM.getInstance().OnGameUserReady = (chair) => {
      Ltc.sendEvent(Events.Battle_user_ready, chair);
    };
  },
  // 监控桌面状态
  onChairState() {
    LTC.JM.getInstance().OnChairState = (state0, state1) => {
      console.log('server =>座位0的状态 ： ' + state0 + ' ，座位1的状态 ：' + state1);
      BattleData.setChairState(state0, state1);
      const dt = {
        chair0: state0,
        chair1: state1,
      };
      Ltc.sendEvent(Events.Battle_update_status, dt);
    };
  },
  // 监控游戏开始
  onGameStart() {
    LTC.JM.getInstance().OnGameStart = (playerNum, curOrder) => {
      console.log('server =>游戏开始--当前游戏人数 ' + playerNum + ',座位号为：' + curOrder + '先走棋子, 我的座位号为: ' + UserInfo.getMySeat());
      BattleData.setCtrlSeat(curOrder);
      BattleData.setRedSide(curOrder);
      const mycolor = BattleData.ctrlEnable() ? '红' : '黑';
      BattleData.setMyColor(mycolor);
      Ltc.sendEvent(Events.Battle_game_start);
      Ltc.sendEvent(Events.Battle_remove_readyLayer);
      BattleData.isGamePlaying = true;
      BattleData.setIsReconnect(false);
      BattleData.setStepCnt(0);
      PublicDialog.removeWaitPop();
    };
  },
  // 监控移动棋子
  onMoveResult() {
    LTC.JM.getInstance().OnMoveResult = (flag, curOrder, x, y, xTo, yTo, stepIndex, chess) => {
      console.log('server =>移动棋子：' + chess + '从坐标[' + x + ', ' + y + ']移动到坐标[' + xTo + ', ' + yTo + ']');
      console.log('server =>轮到座位id 为 :' + curOrder + '的玩家走棋');
      console.log('server =>当前共走棋' + stepIndex + '步, Flag: ' + flag);
      BattleData.setStepCnt(stepIndex);
      // 发送移动棋子事件
      const moveDt = {
        xSrc: x,
        ySrc: y,
        xDist: xTo,
        yDist: yTo,
        chessIndex: chess,
        curOrder: curOrder,
      };
      Ltc.sendEvent(Events.Battle_move_Piece, moveDt);
    };
  },
  // 局时同步检测
  onTimeUpdate() {
    LTC.JM.getInstance().OnTimeUpdate = (nTotal0, nTotal1, nSeat0, nSeat1, nLast0, nLast1, nRoundTime, nStepTime, nLastTime, nCountCur) => {
      console.log('server =>座位号为0的玩家已用局时 : ' + nTotal0);
      console.log('server =>座位号为1的玩家已用局时 : ' + nTotal1);
      console.log('server =>座位号为0的玩家已用步时 : ' + nSeat0);
      console.log('server =>座位号为1的玩家已用步时 : ' + nSeat1);
      console.log('server =>座位号为0的玩家已用读秒 : ' + nLast0);
      console.log('server =>座位号为1的玩家已用读秒 : ' + nLast1);
      console.log('server =>协商设定的本局的局时 : ' + nRoundTime);
      console.log('server =>协商设定的本局的步时 : ' + nStepTime);
      console.log('server =>协商设定的本局的读秒 : ' + nLastTime);
      console.log('server =>当前计时状态：0-座位号0的玩家未读秒；1-座位号0的玩家读秒；2-座位号1的玩家未读秒；3-座位号1的玩家读秒 : ' + nCountCur);
      if (BattleData.getIsReconnect()) {
        BattleData.setGamePram(Math.floor(nRoundTime / 60), nRoundTime % 60, Math.floor(nStepTime / 60), nStepTime % 60, Math.floor(nLastTime / 60), nLastTime % 60, 0);
        Ltc.sendEvent(Events.Battle_game_pram);
      }
      const timeDt = {
        nTotal0: nTotal0,
        nTotal1: nTotal1,
        nSeat0: nSeat0,
        nSeat1: nSeat1,
        nLast0: nLast0,
        nLast1: nLast1,
        nRoundTime: nRoundTime,
        nStepTime: nStepTime,
        nLastTime: nLastTime,
        nCountCur: nCountCur,
      };
      Ltc.sendEvent(Events.Battle_update_time, timeDt);
    };
  },
  // 局时设置
  onTimeSet() {
    LTC.JM.getInstance().OnTimeSet = (wMins, wSecs, wStepMins, wStepSecs, wLastMin, wLastSec, unBaseMoney) => {
      console.log('server =>局时分：' + wMins + ' ，局势秒' + wSecs + ' ，步时分：' + wStepMins + ' ,步时秒：' + wStepSecs);
      console.log('server =>读秒分' + wLastMin + '，读秒秒' + wLastSec + '， 基本游戏币' + unBaseMoney);
    };
  },
  // 游戏结束
  onGameOver() {
    LTC.JM.getInstance().OnGameOver = (chair, userid, overType, curOrder) => {
      console.log('server =>座位ID：' + chair + ' ,UID:' + userid + '，结束原因：' + overType + ' ，通知棋盘控制者 : ' + curOrder);
      BattleData.isGamePlaying = false;
      // 回收棋盘控制权
      if (BattleData.ctrlEnable()) {
        BattleData.resetCtrl();
      }
    };
  },
  // 宣告游戏结束
  onNotifyGameEnd() {
    LTC.JM.getInstance().OnNotifyGameEnd = (wSize, wReserved, gameEndtype, bIsValidScore, score0, score1, overType0, overType1, money0, money1, winer, lLookerOnWinMoney) => {
      BattleData.isGamePlaying = false;
      console.log('server =>宣告游戏结束!');
      console.log('server =>wSize : ' + wSize + ' ,wReserved :' + wReserved + ' ,gameEndtype: ' + gameEndtype);
      if (bIsValidScore) {
        console.log('server =>本局成绩有效!!!');
      } else {
        console.log('server =>本局成绩无效!');
      }
      // 回收棋盘控制权
      if (BattleData.ctrlEnable()) {
        BattleData.resetCtrl();
      }
      console.log('server =>score0 :' + score0 + ', score1:' + score1 + ', overType0:' + overType0 + 'overType1 :' + overType1 + ', money0:' + money0 + ' ,money1:' + money1 + ' ,winer: ' + winer + ' ,lLookerOnWinMoney :' + lLookerOnWinMoney);
      const result = {
        wSize: wSize, wReserved: wReserved, gameEndtype: gameEndtype, score0: score0, score1: score1, overType0: overType0, overType1: overType1, money0: money0, money1: money1, winer: winer, lLookerOnWinMoney: lLookerOnWinMoney,
      };
      Ltc.sendEvent(Events.Battle_game_result, result);
      // 步数清零
      BattleData.setStepCnt(0);
      // 移除求和等待等POP
      PublicDialog.removeWaitPop();
    };
  },
  // 同步棋盘数据（掉线重连）
  onGameContext() {
    LTC.JM.getInstance().OnGameContext = (jsonStr) => {
      console.log('server =>OnGameContext收到同步棋盘数据： ' + jsonStr);
      const data = JSON.parse(jsonStr);
      BattleData.setCtrlSeat(data.cCurOrder);
      BattleData.setRedSide(data.context.cRedSide);
      const mycolor = (data.context.cRedSide === UserInfo.getMySeat()) ? '红' : '黑';
      BattleData.setMyColor(mycolor);
      BattleData.isGamePlaying = true;
      BattleData.setIsReconnect(true);
      Ltc.sendEvent(Events.Battle_game_context, data);
    };
  },
  // 同步棋盘数据(悔棋等情况下调用)
  onGameBoard() {
    LTC.JM.getInstance().OnGameBoard = (jsonStr) => {
      console.log('server =>OnGameBoard收到同步棋盘数据： ' + jsonStr);
      const data = JSON.parse(jsonStr);
      BattleData.setCtrlSeat(data.cCurOrder);
      Ltc.sendEvent(Events.Battle_game_Board, data);
    };
  },
  // 收到别人的求和消息
  onPeaceSet() {
    LTC.JM.getInstance().OnPeaceSet = () => {
      PublicDialog.confirmPop({txt: '对手请求和棋，您是否同意？', cb: (isAgree) => {
        net.ansPeace(isAgree);
      }});
    };
  },
  // 收到别人的悔棋消息
  onRegret() {
    LTC.JM.getInstance().OnRegret = () => {
      PublicDialog.confirmPop({txt: '对手请求悔棋，您是否同意？', cb: (isAgree) =>{
        net.ansRegret(isAgree);
      }});
    };
  },
  // 收到拒绝和棋消息
  onDenyPeace() {
    LTC.JM.getInstance().OnDenyPeace = () => {
      if (BattleData.ctrlEnable()) {
        PublicDialog.tipsPop({txt: '对方拒绝了您的和棋请求！'});
        PublicDialog.removeWaitPop();
      }
    };
  },
  // 收到响应认输消息
  onAnsGiveUp() {
    LTC.JM.getInstance().OnAnsGiveUp = () => {
    };
  },
  // 收到超时消息
  onTimeOut() {
    LTC.JM.getInstance().OnTimeOut = (curOrder, count) => {
      console.log('server =>超时 : ' + curOrder + ' ,超时数: ' + count);
    };
  },
  // 收到长将违例消息
  onDangerOver() {
    LTC.JM.getInstance().OnDangerOver = () => {
    };
  },
  // 收到确认局时消息
  onConfirmTime() {
    LTC.JM.getInstance().OnConfirmTime = (isAgree) => {
      if (isAgree) console.log('玩家同意设置的局时');
    };
  },
  // 收到移动记录消息
  onMoveRecord() {
    LTC.JM.getInstance().OnMoveRecord = (record) => {
      console.log('收到移动记录消息 : ' + record);
      const moveResult = JSON.parse(record);
      Ltc.sendEvent(Events.Battle_game_record, moveResult);
    };
  },
  // 收到悔棋响应
  onRegretStep() {
    LTC.JM.getInstance().OnRegretStep = (isAgree) => {
      PublicDialog.removeWaitPop();
      if (BattleData.ctrlEnable()) return;
      if (isAgree) {
        PublicDialog.tipsPop({txt: '对方同意了您的悔棋请求！'});
      } else {
        PublicDialog.tipsPop({txt: '对方拒绝了您的悔棋请求！'});
      }
    };
  },
  // 收到通知消息
  onNotifyMsg() {
    LTC.JM.getInstance().OnNotifyMsg = (msg) => {
      console.log('收到消息 ： ' + msg);
      PublicDialog.tipsPop({txt: msg, fontSize: 20});
    };
  },
  // 收到通知消息
  onShowMsg() {
    LTC.JM.getInstance().OnShowMsg = (msg) => {
      console.log('收到消息 ： ' + msg);
      PublicDialog.tipsPop({txt: msg, fontSize: 20});
    };
  },
  // 段位评估游戏结束消息
  onGameEndResult() {
    LTC.JM.getInstance().OnGameEndResult = (result) => {
      const data = JSON.parse(result);
      // const bEscape = data.GameEndType === 6;
      // const idx = UserInfo.getMySeat();
      // const dt = {
      //   nResult: data.bWinner,
      //   bEscape: bEscape,
      //   eRankResult: data.cRankChange[idx],
      //   bGrandMaster: data.bGrandMaster[idx],
      //   nLeftWinInningCountSame: data.nLeftWinInningCountSame[idx],
      //   nLeftWinInningCountLow: data.nLeftWinInningCountLow[idx],
      //   nWinInningCount: data.nWinInningCount[idx],
      //   nLoseInningCount: data.nLoseInningCount[idx],
      //   nEqualInningCount: data.nEqualInningCount[idx],
      //   szCurRankName: data.szCurRankName[idx],
      //   nLeftInningCount: data.nLeftInningCount[idx],
      // };
      console.log('段位评估游戏结束消息 : ' + JSON.stringify(data));
      Ltc.sendEvent(Events.Battle_game_end_result, data);
    };
  },
  // 收到长捉违例消息
  onLongCatchOver() {
    LTC.JM.getInstance().OnLongCatchOver = () => {
      console.log('收到长捉违例消息!');
      PublicDialog.tipsPop({txt: '长捉违例'});
    };
  },
  // 收到悔棋次数消息
  onNotifyRegretTimes() {
    LTC.JM.getInstance().OnNotifyRegretTimes = (chair0Times, chair1Times) => {
      console.log('收到悔棋次数消息： 座位0悔棋次数' + chair0Times + '，座位1悔棋次数' + chair1Times);
    };
  },
  // 通知客户端按照指定时间开始游戏
  onGetReadyByTime() {
    LTC.JM.getInstance().OnGetReadyByTime = (wMins, wSecs, wStepMins, wStepSecs, wLastMin, wLastSec, unBaseMoney) => {
      console.log('server =>局时分：' + wMins + ' ，局势秒' + wSecs + ' ，步时分：' + wStepMins + ' ,步时秒：' + wStepSecs);
      console.log('server =>读秒分' + wLastMin + '，读秒秒' + wLastSec + '， 基本游戏币' + unBaseMoney);
      BattleData.setGamePram(wMins, wSecs, wStepMins, wStepSecs, wLastMin, wLastSec, unBaseMoney);
      Ltc.sendEvent(Events.Battle_game_pram);
    };
  },
  // 自设房间时间
  onSelfSetTime() {
    LTC.JM.getInstance().OnSelfSetTime = () => {
    };
  },
  // 聊天消息接收
  onChatMsg() {
    LTC.JM.getInstance().OnChatMsg = (qq, msg) => {
      console.log('发送消息QQ:' + qq);
      console.log('说 ： ' + msg);
      Ltc.sendEvent(Events.Chat_msg, {qq: qq, msg: msg });
    };
  },
});

export default Net;
