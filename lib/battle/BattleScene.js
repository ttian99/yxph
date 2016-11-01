import logger from '../es6-utils/cocos/console.js';
const console = logger('BattleLayer');
import {addSprite} from '../es6-utils/cocos/base';
import {res} from '../loader/resource.js';
import _ from 'lodash';
import Piece from './Piece.js';
import Ltc from '../public/Ltc.js';
import Events from '../public/Events.js';
import TouchLayer from './TouchLayer.js';
import BattleData from './BattleData.js';
import {PieceType, ColorType} from './PieceOpt.js';
import QiPuMoveCmdStruct from './QiPuMoveCmdStruct.js';
import BattleUiLayer from './BattleUiLayer.js';
import BattleReadyLayer from './BattleReadyLayer.js';
import ResultLayer from './ResultLayer.js';
import UserInfo from '../public/UserInfo.js';
import OtherInfo from '../public/OtherInfo.js';
import PublicDialog from '../publicDialog/PublicDialog.js';
import ChatLayer from '../chat/ChatLayer.js';
import BattleEffectLayer from './BattleEffectLayer.js';
import {playEffect} from '../es6-utils/cocos/audio.js';

const BattleLayer = Ltc.Layer.extend({
  _chessBoard: null, // 棋盘
  _pieces: [], // 储存棋子数组
  _distance: 79,  // 棋盘路线间距
  _scale: 1, // 棋盘缩放比例
  _pR: 30, // 棋子半径
  _selectedid: -1, // 选中的棋子id
  _step: [], // 走步信息
  _isMymove: false, // 是否是我移动棋子
  _isDanger: false, // 移动前我是否被将军
  ctor() {
    this._super();
    // 创建背景
    const bg = addSprite(this, res.public.Ltc_XQ_bg_jpg, {
      x: cc.visibleRect.center.x, y: cc.visibleRect.center.y,
    });
    // 创建棋盘
    this._chessBoard = addSprite(bg, res.battle.Ltc_XQ_checkerboard_png, {
      x: bg.width / 2, y: bg.height / 2,
    });
    const sc = this._scale = cc.visibleRect.width / this._chessBoard.width;
    this._chessBoard.setScale(sc);
    this._distance = this._scale * this._distance;

    // 创建棋子
    this.createPieces();

    // 监控事件
    this.addEvts();
  },

  onExit() {
    this._step = [];
    this._super();
  },
  // 添加事件
  addEvts() {
    // 检测触摸事件选中或移动棋子
    this.addEvent(Events.Battle_valid_touch, (event, data) => {
      // 判断是否点击到棋盘坐标点
      const clickCoord = this.getClickedCoord(data);
      if (!clickCoord) return;
      // 判断点击点有无棋子
      const piece = this.getPieceByCoord(clickCoord);
      // 未选择棋子
      if (this._selectedid < 0) {
        // 1.如果点击位置没有棋子，则放弃选择
        if (!piece) {
          console.log('该点没有棋子，放弃选择！');
          return;
        }
        // 2.如果不是本方棋子，则放弃选择
        if (piece.getColorType() !== BattleData.myColor) {
          console.log('不是本方棋子，放弃选择!');
          return;
        }
        this.setSelectPiece(piece.getID());
      } else { // 已经选择棋子
        // 移动棋子
        this.doMovePiece(this._selectedid, clickCoord);
      }
    });

    // 监测游戏开始事件
    this.addEvent(Events.Battle_game_start, () => {
      this.startGame();
      this.hideEffect();
    });

    // 监听移动棋子事件
    this.addEvent(Events.Battle_move_Piece, (event, data) => {
      const moveData = data;
      const piece = this.getPiece(moveData.chessIndex);
      if (piece && cc.pointEqualToPoint(piece.getPos(), cc.p(moveData.xSrc, moveData.ySrc))) {
        this.setSelectPiece(moveData.chessIndex);
        this.doMovePiece(this._selectedid, cc.p(moveData.xDist, moveData.yDist), () => {
          BattleData.setCtrlSeat(data.curOrder);
        });
      }
    });

    // 监听同步游戏数据事件
    this.addEvent(Events.Battle_game_context, (event, data) => {
      this.synchronizationPieces(data);
    });
    this.addEvent(Events.Battle_game_Board, (event, data) => {
      this.synchronizationPieces(data);
    });

    // 同步棋子移动记录数组
    this.addEvent(Events.Battle_game_record, (event, data) => {
      this.synchronizationStepArray(data);
    });

    // // 检测游戏结果事件
    // this.addEvent(Events.Battle_game_result, () => {
    //   this.showEffect(2);
    // });
    // // 棋力评测结果事件
    // this.addEvent(Events.Battle_game_end_result, () => {
    //   this.showEffect(2);
    // });

    // 清除棋子， 清除特效
    this.addEvent(Events.Battle_clean_chess, () => {
      this.hidePieces();
      this.hideEffect();
    });
  },

  // 创建棋子
  createPieces() {
    this._pieces = [];
    _.range(0, 32).forEach((i) => {
      this._pieces[i] = new Piece(i);
      this._pieces[i].setOriginSc(this._scale);
      this._pieces[i].setVisible(false);
      this.addChild(this._pieces[i], 10);
    });
  },

  hidePieces() {
    _.range(0, 32).forEach((i) => {
      this._pieces[i] && this._pieces[i].setVisible(false);
    });
  },

  // 重置棋子属性(开局调用)
  resetPieces() {
    _.range(0, 32).forEach((i) => {
      this._pieces[i].reset();
      this.layoutPiece(i);
    });
  },

  // 同步棋子(同步棋盘调用)
  synchronizationPieces(data) {
    _.range(0, 32).forEach((i) => {
      this._pieces[i].reset();
      if (data.pointChessman[i].x !== 0 && data.pointChessman[i].y !== 0) {
        this._pieces[i].setPos(data.pointChessman[i].x, data.pointChessman[i].y);
        this.layoutPiece(i);
      } else {
        this._pieces[i].setDead(true);
      }
    });
    this.synchronizationMoveEffect(data.pointBoxFrom, data.pointBoxTo, data.iSide);
  },

  synchronizationStepArray(moveResult) {
    this._step = [];
    for (let i = 0; i < moveResult.length; i++) {
      if (moveResult[i].nStepSeq === 0) break;
      const moveCmd = new QiPuMoveCmdStruct();
      moveCmd.chessIndex = moveResult[i].chess; // 移动棋子id
      moveCmd.ySrc = moveResult[i].x; // 移动前Y坐标
      moveCmd.xSrc = moveResult[i].y; // 移动前X坐标
      moveCmd.yDst = moveResult[i].xTo; // 移动后Y坐标
      moveCmd.xDst = moveResult[i].yTo; // 移动后X坐标
      moveCmd.order = moveResult[i].nStepSeq; // 表示是总棋谱中的第几步走子。从1开始
      // 添加进数组
      this._step.push(moveCmd);
    }
    BattleData.setStepCnt(this._step.length);
  },

  // 同步棋盘后增加移动棋子的效果
  synchronizationMoveEffect(from, to, iside) {
    console.log('from : ' + JSON.stringify(from));
    console.log('to : ' + JSON.stringify(to));
    console.log('iside : ' + iside);
    if (from.x === 0 || from.y === 0 || to.x === 0 || to.y === 0) {
      return;
    }
    let isMyMove = false;
    if (iside === UserInfo.getMySeat()) {
      isMyMove = true;
    }
    this.moveEffect(this.coord2Pos(from), this.coord2Pos(to), isMyMove);
  },
  // 布局棋子
  layoutPiece(idx) {
    this._pieces[idx].setPosition(this.coord2Pos(this._pieces[idx].getPos()));
    this._pieces[idx].setVisible(true);
  },

  // 游戏正式开始
  startGame() {
    BattleData.resetRecord();
    this._step = [];
    this.resetPieces();
  },

  // 棋盘坐标转换成屏幕点
  coord2Pos(coord) {
    let xx;
    let yy;
    if (BattleData.getRedSide() === 1) {
      if (BattleData.myColor === ColorType.RED) {
        xx = cc.visibleRect.center.x + (5 - coord.x) * this._distance - 1;
        yy = cc.visibleRect.center.y + (coord.y - 5.5) * this._distance + 23;
      } else {
        xx = cc.visibleRect.center.x + (coord.x - 5) * this._distance - 1;
        yy = cc.visibleRect.center.y + (5.5 - coord.y) * this._distance + 23;
      }
    } else {
      if (BattleData.myColor === ColorType.RED) {
        xx = cc.visibleRect.center.x + (coord.x - 5) * this._distance - 1;
        yy = cc.visibleRect.center.y + (5.5 - coord.y) * this._distance + 23;
      } else {
        xx = cc.visibleRect.center.x + (5 - coord.x) * this._distance - 1;
        yy = cc.visibleRect.center.y + (coord.y - 5.5) * this._distance + 23;
      }
    }
    return cc.p(xx, yy);
  },

  // 通过坐标获取对应棋子
  getPieceByCoord(coord) {
    for (let i = 0; i < 32; i++) {
      const piece = this.getPiece(i);
      if (piece && cc.pointEqualToPoint(coord, piece.getPos())) {
        return piece;
      }
    }
    return null;
  },

  // 通过触摸点获取对应的坐标
  getClickedCoord(touchPos) {
    for (let i = 1; i <= 9; i++) {
      for (let j = 1; j <= 10; j++) {
        const pt = this.coord2Pos(cc.p(i, j));
        if (cc.pDistance(pt, touchPos) < this._pR) {
          return cc.p(i, j);
        }
      }
    }
    return null;
  },

  // 设置选中棋子
  setSelectPiece(newid) {
    if (this._selectedid >= 0) {
      const selectedPiece = this.getPiece(this._selectedid);
      if (selectedPiece) {
        selectedPiece.setSelected(false);
      }
    }
    const newPiece = this.getPiece(newid);
    if (newPiece) {
      newPiece.setSelected(true);
      console.debug('选中' + newPiece.getColorType() + '色棋子:' + newPiece.getType());
      this._selectedid = newid;
      // 增加棋子能移动的位置提示(是我选中棋子)
      if (BattleData.ctrlEnable()) {
        this.pointEffect(newid);
      }
    }
  },

  // 从棋子数组中获取单个棋子(id:[0, 31])
  getPiece(id) {
    if (!this._pieces[id].getDead()) {
      return this._pieces[id];
    }
    return null;
  },

  // 移动棋子
  doMovePiece(selectid, coord, cb) {
    // 选择的棋子
    const selectedPiece = this.getPiece(selectid);
    // 点击点（判断点击点有无棋子）
    const piece = this.getPieceByCoord(coord);
    if (!selectedPiece) return;
    // 如果coord坐标有棋子，即新点击棋子
    if (piece) {
      // 如果新点击棋子颜色与上次选择的棋子颜色相同，则将选择棋子变更为新点击棋子，同时放弃移动棋子
      if (selectedPiece.getColorType() === piece.getColorType()) {
        this.setSelectPiece(piece.getID());
        return;
      }
    }

    const bMove = this.isCanMove(selectid, coord);
    if (!bMove) {
      console.log('棋子:' + selectedPiece.getType() + '不符合移动规则，放弃移动！');
      return;
    }
    // 走步结构体,用于记录走步信息
    const moveCmd = new QiPuMoveCmdStruct();
    moveCmd.chessIndex = selectid; // 移动棋子id
    moveCmd.redBlack = selectedPiece.getColorType() === ColorType.RED ? 1 : 0; // 颜色红为1，黑为0
    moveCmd.ySrc = selectedPiece.getPos().y; // 移动前Y坐标
    moveCmd.xSrc = selectedPiece.getPos().x; // 移动前X坐标
    moveCmd.yDst = coord.y; // 移动后Y坐标
    moveCmd.xDst = coord.x; // 移动后X坐标
    moveCmd.order = this._step.length + 1; // 表示是总棋谱中的第几步走子。从1开始
    moveCmd.killIndex = -1;
    if (piece) {
      moveCmd.killIndex = piece.getID();
    }

    // 添加进数组
    this._step.push(moveCmd);

    // 移除棋子可以移动的位置提示
    this.removePointEffect();

    // 是我移动的棋子
    this._isMymove = false;
    this._isDanger = false;
    if (BattleData.ctrlEnable()) {
      // 是我移动
      this._isMymove = true;
      // 检测移动前我是否被将军
      this._isDanger = this.checkDangerOfme();
    }

    // 更改棋子位置
    selectedPiece.setPos(coord.x, coord.y);
    // 更改被吃掉的棋子属性
    if (piece) {
      piece.setDead(true);
    }
    // 如果移动前我被将军，移动后我仍被将军，则放弃
    if (this._isMymove && this._isDanger) {
      if (this.checkDangerOfme()) {
        // 警告提示
        PublicDialog.tipsPop({ txt: '您正在被将军中，请重新走棋' });
        // 自动悔棋
        this.back();
        return;
      }
    } else if (this._isMymove && !this._isDanger) {
      // 检测我是否被将军
      if (this.checkDangerOfme()) {
        // 警告提示
        PublicDialog.tipsPop({ txt: '生命诚可贵，不能送将军' });
        // 自动悔棋
        this.back();
        return;
      }
      // 检测对将
      if (this.checkJiangFaceToFace()) {
        // 警告提示
        PublicDialog.tipsPop({ txt: '生命诚可贵，不能送对将' });
        // 自动悔棋
        this.back();
        return;
      }
    }
    if (this._isMymove) {
      // 交出移动棋子控制权
      BattleData.resetCtrl();
    }
    // 更改棋子层级
    selectedPiece.setLocalZOrder(selectedPiece.getLocalZOrder() + 1);

    // 移动棋子
    const to = this.coord2Pos(coord);
    selectedPiece.runAction(cc.sequence(
      cc.moveTo(0.1, to),
      cc.callFunc((movePiece, killPiece) => {
        this.moveEnd(movePiece, killPiece);
        if (cb) cb();
      }, this, piece)
    ));
  },

  isCanMove(selectid, coord) {
    // 选择的棋子
    const selectedPiece = this.getPiece(selectid);
    if (!selectedPiece) return false;
    let bMove = false;
    switch (selectedPiece.getType()) {
      case PieceType.JIANG:
        bMove = this.isCanMoveJiang(selectid, coord);
        break;
      case PieceType.SHI:
        bMove = this.isCanMoveShi(selectid, coord);
        break;
      case PieceType.XIANG:
        bMove = this.isCanMoveXiang(selectid, coord);
        break;
      case PieceType.CHE:
        bMove = this.isCanMoveChe(selectid, coord);
        break;
      case PieceType.MA:
        bMove = this.isCanMoveMa(selectid, coord);
        break;
      case PieceType.PAO:
        bMove = this.isCanMovePao(selectid, coord);
        break;
      case PieceType.BING:
        bMove = this.isCanMoveBing(selectid, coord);
        break;
      default:
        break;
    }
    return bMove;
  },

  // 将的走棋规则
  isCanMoveJiang(selectid, coord) {
    // 规则：在九宫格内一次走一格，且只能横向或纵向移动
    const distPiece = this.getPieceByCoord(coord);
    // 将的对杀
    if (distPiece && distPiece.getType() === PieceType.JIANG) {
      return this.isCanMoveChe(selectid, coord);
    }

    // 选择的棋子
    const selectedPiece = this.getPiece(selectid);
    if (!selectedPiece) return false;
    const selectedCoord = selectedPiece.getPos();
    const offsetX = Math.abs(selectedCoord.x - coord.x);
    const offsetY = Math.abs(selectedCoord.y - coord.y);
    // 1.一次走一格(offsetX <=1 && offsetY <=1) 2.只能横向或纵向移动(offsetX ^ offsetY) 3.在九宫格内
    if (!(offsetX <= 1 && offsetY <= 1)) {
      return false;
    }
    if (!(offsetX ^ offsetY)) {
      return false;
    }
    // 横坐标超出九宫格
    if (coord.x < 4 || coord.x > 6) {
      return false;
    }
    // 如果移动的是坐标小于等于3的将
    if (selectedPiece.getPos().y <= 3) {
      // 纵坐标超出九宫格
      if (coord.y < 1 || coord.y > 3) {
        return false;
      }
    } else {
      // 纵坐标超出九宫格
      if (coord.y < 8 || coord.y > 10) {
        return false;
      }
    }
    return true;
  },

  // 士的走棋规则
  isCanMoveShi(selectid, coord) {
    // 规则：在九宫格内对角线移动且一次只能走一格
    // 选择的棋子
    const selectedPiece = this.getPiece(selectid);
    if (!selectedPiece) return false;
    const selectedCoord = selectedPiece.getPos();
    const offsetX = Math.abs(selectedCoord.x - coord.x);
    const offsetY = Math.abs(selectedCoord.y - coord.y);
    // 1.一次走一格(offsetX <=1 && offsetY <=1)(offsetX, offsetY不能同时为0) 2.只能斜着移动!(offsetX ^ offsetY) 3.在九宫格内
    if (!(offsetX <= 1 && offsetY <= 1)) {
      return false;
    }
    if (offsetX === 0 && offsetY === 0) {
      return false;
    }
    // 非斜着移动
    if ((offsetX ^ offsetY)) {
      return false;
    }
    // 横坐标超出九宫格
    if (coord.x < 4 || coord.x > 6) {
      return false;
    }
    // 如果移动的是坐标小于等于3的士
    if (selectedPiece.getPos().y <= 3) {
      // 纵坐标超出九宫格
      if (coord.y < 1 || coord.y > 3) {
        return false;
      }
    } else {
      // 纵坐标超出九宫格
      if (coord.y < 8 || coord.y > 10) {
        return false;
      }
    }
    return true;
  },

  // 相的走棋规则
  isCanMoveXiang(selectid, coord) {
    // 规则：走田字（x,y 各移动2个单位），不能过楚河, 中点不能有棋子
    // 选择的棋子
    const selectedPiece = this.getPiece(selectid);
    if (!selectedPiece) return false;
    const selectedCoord = selectedPiece.getPos();
    const offsetX = Math.abs(selectedCoord.x - coord.x);
    const offsetY = Math.abs(selectedCoord.y - coord.y);
    // 判断是否是田字
    if (offsetX !== 2 || offsetY !== 2) {
      return false;
    }
    // 判断中间是否有棋子
    const centerX = (selectedCoord.x + coord.x) / 2;
    const centerY = (selectedCoord.y + coord.y) / 2;
    const tmp = this.getPieceByCoord(cc.p(centerX, centerY));
    if (tmp) {
      return false;
    }
    // 不能过楚河
    if (selectedPiece.getPos().y <= 5) {
      if (coord.y > 5) {
        return false;
      }
    } else {
      if (coord.y < 6) {
        return false;
      }
    }
    return true;
  },

  // 车的走棋规则
  isCanMoveChe(selectid, coord) {
    // 规则走直线，中间无遮挡
    // 选择的棋子
    const selectedPiece = this.getPiece(selectid);
    if (!selectedPiece) return false;
    const selectedCoord = selectedPiece.getPos();
    if (this.getPieceCount(selectedCoord, coord) !== 0) {
      return false;
    }
    return true;
  },

  // 马的走棋规则
  isCanMoveMa(selectid, coord) {
    // 走日字，不能绊马腿
    // 选择的棋子
    const selectedPiece = this.getPiece(selectid);
    if (!selectedPiece) return false;
    const selectedCoord = selectedPiece.getPos();
    const offsetX = Math.abs(selectedCoord.x - coord.x);
    const offsetY = Math.abs(selectedCoord.y - coord.y);
    // 同一条直线上不能移动
    if (selectedCoord.x === coord.x || selectedCoord.y === coord.y) {
      return false;
    }
    // 日字(offsetX + offsetY === 3)
    if (offsetX + offsetY !== 3) {
      return false;
    }
    // 绊马腿坐标点
    let xx;
    let yy;
    if (offsetX === 2) {
      xx = (selectedCoord.x + coord.x) / 2;
      yy = selectedCoord.y;
    } else if (offsetY === 2) {
      xx = selectedCoord.x;
      yy = (selectedCoord.y + coord.y) / 2;
    } else {
      return false;
    }
    // 获取绊马腿坐标点是否有棋子，有棋子则不能移动
    const tmp = this.getPieceByCoord(cc.p(xx, yy));
    if (tmp) {
      return false;
    }
    return true;
  },

  // 炮的走棋规则
  isCanMovePao(selectid, coord) {
    // 规则：1.当触摸点上有一个对方棋子， 且两点之间只有一个棋子，吃掉触摸点上的棋子； 2.当触摸点没有棋子，两点之间不能有棋子
    // 选择的棋子
    const selectedPiece = this.getPiece(selectid);
    if (!selectedPiece) return false;
    const selectedCoord = selectedPiece.getPos();
    // 获取触摸点是否有棋子
    const distPiece = this.getPieceByCoord(coord);
    // 触摸点有棋子，选择的棋子与触摸点棋子颜色不同，中间有一个棋子
    if (distPiece && distPiece.getColorType() !== selectedPiece.getColorType() && this.getPieceCount(selectedCoord, coord) === 1) {
      return true;
    }
    // 触摸点没有棋子，中间没有棋子
    if (!distPiece && this.getPieceCount(selectedCoord, coord) === 0) {
      return true;
    }
    return false;
  },

  // 兵的走棋规则
  isCanMoveBing(selectid, coord) {
    // 规则：未过楚河前只能向前方移动，不能左右移动，不能后退，过楚河后能够左右移动，一次移动一个单位，不能斜着移动
    // 选择的棋子
    const selectedPiece = this.getPiece(selectid);
    if (!selectedPiece) return false;
    const selectedCoord = selectedPiece.getPos();
    const offsetX = Math.abs(selectedCoord.x - coord.x);
    const offsetY = Math.abs(selectedCoord.y - coord.y);
    // 1.一次走一格(offsetX <=1 && offsetY <=1) 2.只能横向或纵向移动(offsetX ^ offsetY)
    if (!(offsetX <= 1 && offsetY <= 1)) {
      return false;
    }
    if (!(offsetX ^ offsetY)) {
      return false;
    }
    if ((selectedPiece.getColorType() === ColorType.RED && BattleData.getRedSide() === 1) ||
      (selectedPiece.getColorType() === ColorType.BLACK && BattleData.getRedSide() === 0)) {
      // 限制棋子不能后退
      if (coord.y < selectedCoord.y) {
        return false;
      }
      // 没有过楚河，不能左右移动
      if (selectedCoord.y <= 5 && selectedCoord.y === coord.y) {
        return false;
      }
    } else {
      // 限制对方棋子不能后退
      if (coord.y > selectedCoord.y) {
        return false;
      }
      // 没有过楚河，不能左右移动
      if (selectedCoord.y >= 6 && selectedCoord.y === coord.y) {
        return false;
      }
    }
    return true;
  },

  // 获取两点组成的直线间棋子数量，-1表示两点不在直线或两点相等
  getPieceCount(coord1, coord2) {
    let cnt = 0;
    if (cc.pointEqualToPoint(coord1, coord2)) {
      return -1;
    }
    if (coord1.x !== coord2.x && coord1.y !== coord2.y) {
      return -1;
    }
    // 竖线
    if (coord1.x === coord2.x) {
      for (let i = Math.min(coord1.y, coord2.y) + 1; i < Math.max(coord1.y, coord2.y); i++) {
        const tmp = this.getPieceByCoord(cc.p(coord1.x, i));
        if (tmp) {
          cnt++;
        }
      }
    }
    // 横线
    if (coord1.y === coord2.y) {
      for (let i = Math.min(coord1.x, coord2.x) + 1; i < Math.max(coord1.x, coord2.x); i++) {
        const tmp = this.getPieceByCoord(cc.p(i, coord1.y));
        if (tmp) {
          cnt++;
        }
      }
    }
    return cnt;
  },

  // 悔棋
  back() {
    if (this._step.length === 0) {
      return;
    }
    const moveCmd = this._step[this._step.length - 1];
    console.log('moveCmd : ' + JSON.stringify(moveCmd));
    // 恢复走棋前得坐标
    const piece = this.getPiece(moveCmd.chessIndex);
    piece.setPos(moveCmd.xSrc, moveCmd.ySrc);
    piece.setPosition(this.coord2Pos(piece.getPos()));

    // 取消棋子的选中状态
    piece.setSelected(false);
    this._selectedid = -1;

    // 恢复吃掉的棋子
    if (moveCmd.killIndex >= 0) {
      // 复活吃掉的棋子
      this._pieces[moveCmd.killIndex].setDead(false);
    }
    // 移除最后一步
    this._step.pop();
  },

  moveEnd(movePiece, killPiece) {
    if (!movePiece) return;
    // 取消棋子的选中状态
    this._selectedid = -1;
    // 设回棋子层级
    movePiece.setLocalZOrder(movePiece.getLocalZOrder() - 1);
    // 检测有无将军,播放将军相关特效
    const pRed = this.checkDanger();
    if (pRed) {
      this.showEffect(0);
      // 播放将军音效
      const isMan = this._isMymove ? UserInfo.getGenderIsMan() : OtherInfo.getGenderIsMan();
      const effectFile = isMan ? res.audio.Ltc_XQ_jiangjun_man_mp3 : res.audio.Ltc_XQ_jiangjun_women_mp3;
      playEffect(effectFile);
    }
    // 如果有吃棋子播放相关特效
    let isEat = false;
    if (killPiece) {
      console.log(' => ' + killPiece.getColorType() + '方棋子【' + killPiece.getType() + '】被对方棋子【' + movePiece.getType() + '】吃掉!');
      // 播放吃子动画
      if (killPiece.getType() !== PieceType.JIANG && !pRed) {
        // 播放吃子动画
        this.showEffect(1);
        // 播放吃子音效
        const isMan = this._isMymove ? UserInfo.getGenderIsMan() : OtherInfo.getGenderIsMan();
        const effectFile = isMan ? res.audio.Ltc_XQ_kill_man_mp3 : res.audio.Ltc_XQ_kill_women_mp3;
        playEffect(effectFile);
      }
      isEat = true;
    }
    // 播放走棋音效
    if (!pRed && !isEat) {
      playEffect(res.audio.Ltc_XQ_move_piece_mp3);
    }
    // 播放吃子动画，取消棋子的选中状态
    movePiece.eatEffect(isEat);
    // 显示棋子移动标记(起点，终点)
    const moveCmd = this._step[this._step.length - 1];
    const fromPos = this.coord2Pos(cc.p(moveCmd.xSrc, moveCmd.ySrc));
    const toPos = this.coord2Pos(cc.p(moveCmd.xDst, moveCmd.yDst));
    this.moveEffect(fromPos, toPos, this._isMymove);
    // 发送移动棋子消息给服务器
    if (this._isMymove) {
      net.movePiece(moveCmd.chessIndex, moveCmd.xSrc, moveCmd.ySrc, moveCmd.xDst, moveCmd.yDst);
    }
  },

  // 检测我是否被将军
  checkDangerOfme() {
    // 检测有无将军
    const pRed = this.checkDanger();
    if (pRed) {
      if (pRed === BattleData.myColor) {
        return true;
      }
    }
    return false;
  },

  // 检测将军
  checkDanger() {
    let nRet = null;
    const jiang0 = this.getPiece(0);
    const jiang16 = this.getPiece(16);
    if (!jiang0 || !jiang16) {
      return nRet;
    }
    for (let i = 0; i < 16; i++) {
      if (this.isCanMove(i, jiang16.getPos())) {
        nRet = jiang16.getColorType();
        break;
      }
    }
    for (let i = 16; i < 32; i++) {
      if (this.isCanMove(i, jiang0.getPos())) {
        nRet = jiang0.getColorType();
        break;
      }
    }
    return nRet;
  },
  // 检测棋子能够移动到哪些位置
  getCanMovePosArr(selectid) {
    let tmpPiece = null;
    let coord = null;
    const posArr = [];
    for (let i = 1; i <= 9; i++) {
      for (let j = 1; j <= 10; j++) {
        coord = cc.p(i, j);
        tmpPiece = this.getPieceByCoord(coord);
        if (!tmpPiece) {
          if (this.isCanMove(selectid, coord)) {
            posArr.push(this.coord2Pos(coord));
          }
        }
      }
    }
    return posArr;
  },
  // 检测对将
  checkJiangFaceToFace() {
    let nRet = false;
    const jiang0 = this.getPiece(0);
    const jiang16 = this.getPiece(16);
    if (!jiang0 || !jiang16) {
      return nRet;
    }
    if (this.getPieceCount(jiang0.getPos(), jiang16.getPos()) === 0) {
      nRet = true;
    }
    return nRet;
  },
  // 移动棋子标记
  moveEffect(from, to, isMyMove) {
    const effectLayer = this.getEffectLayer();
    effectLayer.moveEffect(from, to, isMyMove);
  },
  // 隐藏棋子标记
  hideEffect() {
    const effectLayer = this.getEffectLayer();
    effectLayer.hideEffect();
  },
  // 将军，吃子，绝杀等特效
  showEffect(type) {
    const effectLayer = this.getEffectLayer();
    effectLayer.popEffect(type);
  },
  // 棋子能落点标记
  pointEffect(selectid) {
    const arr = this.getCanMovePosArr(selectid);
    if (arr.length === 0) return;
    const effectLayer = this.getEffectLayer();
    effectLayer.pointEffect(arr);
  },
  removePointEffect() {
    const effectLayer = this.getEffectLayer();
    effectLayer.removePointEffect();
  },

  getEffectLayer() {
    if (this.getParent().getChildByTag(100)) {
      return this.getParent().getChildByTag(100);
    }
    return null;
  },
});

const BattleScene = Ltc.Scene.extend({
  ctor(sceneid) {
    this._super();
    // 添加触摸层
    const touchLayer = new TouchLayer();
    this.addChild(touchLayer);

    const battleLayer = new BattleLayer();
    this.addChild(battleLayer);

    const props = {
      layer: battleLayer,
      scale: battleLayer._scale,
      height: battleLayer._chessBoard.height,
    };
    const battleUiLayer = new BattleUiLayer(props);
    this.addChild(battleUiLayer);

    const battleEffectLayer = new BattleEffectLayer(props);
    battleEffectLayer.setTag(100);
    this.addChild(battleEffectLayer, 5);

    this.addEvts();

    this.enterGame(sceneid);
  },

  addReadyLayer() {
    if (this.readyLayer) return;
    const battleReadyLayer = this.readyLayer = new BattleReadyLayer();
    this.addChild(battleReadyLayer, 10);
  },

  removeReayLayer() {
    if (!this.readyLayer) return;
    this.readyLayer.removeFromParent(true);
    this.readyLayer = null;
  },

  addResultLayer(data) {
    net.updateSceneInfoAndUserInfo();

    // 游戏结果
    this.runAction(cc.sequence(cc.delayTime(2.0), cc.callFunc(() => {
      const resultLayer = new ResultLayer(data);
      this.addChild(resultLayer, 20);

      this.addReadyLayer();
      this.sendEvent(Events.Battle_readyLayer_disabled);
    })));
  },

  addEvaluatingResultLayer(dt) {
    net.updateSceneInfoAndUserInfo();
    dt.isEvaluating = true;
    this.runAction(cc.sequence(cc.delayTime(2.0), cc.callFunc(() => {
      const resultLayer = new ResultLayer(dt);
      this.addChild(resultLayer, 20);
    })));
  },

  addEvts() {
    // 监听游戏开始事件(移除准备层)
    this.addEvent(Events.Battle_remove_readyLayer, () => {
      this.removeReayLayer();
    });
    // 监听同步游戏数据事件
    this.addEvent(Events.Battle_game_context, () => {
      this.removeReayLayer();
    });
    this.addEvent(Events.Battle_user_leave, (evt, qq) => {
      if (qq === UserInfo.getMyQQ()) {
        // 离开房间在换桌也会调用
      }
    });
    // 正常游戏结束
    this.addEvent(Events.Battle_game_result, (evt, data) => {
      this.addResultLayer(data);
    });
    // 游戏评测游戏结束
    this.addEvent(Events.Battle_game_end_result, (evt, data) => {
      if (data.cRankChange[0] === 3) { // 没有找到合适的对手
        PublicDialog.addWaitPop({txt: '没有找到合适的对手...'});
        return;
      } else if (data.cRankChange[0] === 4) { // 游戏正在速配
        PublicDialog.addWaitPop({txt: '游戏正在速配...'});
        return;
      }
      this.addEvaluatingResultLayer(data);
    });
    this.addEvent(Events.Enter_room_success, () => {
      // 增加准备界面
      this.addReadyLayer();
    });
    this.addEvent(Events.Enter_room_failed, () => {
      // 退出房间
      PublicDialog.tipsPop({ txt: '进入房间失败，请重新进入！', fontSize: 25 });
      this.runAction(cc.sequence(cc.delayTime(2.0), cc.callFunc(() => {
        // Ltc.sendEvent('START_SCENE', 'ROOM_LAYER');
        Ltc.sendEvent('START_SCENE', 'FIELD_LAYER');
      })));
    });
    this.addEvent(Events.Chat_layer, () => {
      this.addChatLayer();
    });
  },

  addChatLayer() {
    // 聊天层
    const chatLayer = new ChatLayer();
    this.addChild(chatLayer, 15);
  },

  enterGame(sceneid) {
    console.log('sceneid : ' + sceneid);
    PublicDialog.block(this);
    this.runAction(cc.sequence(cc.delayTime(1.0), cc.callFunc(() => {
      net.enterGame(sceneid);
      // net.enterGame(4927);
    }), cc.delayTime(15.0), cc.callFunc(() => {
      if (BattleData.status === 0 && PublicDialog.isLock) {
        PublicDialog.tipsPop({ txt: '您的网络不给力，请检查网络设置重新进入！', fontSize: 20 });
        this.runAction(cc.sequence(cc.delayTime(2.0), cc.callFunc(() => {
          net.leaveRoom(false);
          // 退出房间
          // Ltc.sendEvent('START_SCENE', 'ROOM_LAYER');
          Ltc.sendEvent('START_SCENE', 'FIELD_LAYER');
        })));
      }
    })));
  },
});

export default BattleScene;
