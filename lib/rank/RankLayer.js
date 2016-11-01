import logger from '../es6-utils/cocos/console.js';
const console = logger('RankLayer');
import {addSprite, addBMFLabel, addLabel} from '../es6-utils/cocos/base';
import {res, resIn} from '../loader/resource.js';
import Button from '../es6-utils/components/Button.js';
import Ltc from '../public/Ltc.js';
// import Events from '../public/Events.js';
import FaceNode from '../face/FaceNode.js';
import UserInfo from '../public/UserInfo.js';
import {getLvName, sliceLabel} from '../public/Extra.js';
import SelfNet from '../public/SelfNet.js';
import {playEffect} from '../es6-utils/cocos/audio.js';

const RankTableViewCell = cc.TableViewCell.extend({
  draw(ctx) {
    this._super(ctx);
  },
});

const RankLayer = Ltc.Layer.extend({
  rankType: null, // 当前排行榜类型
  listData: [], // 当前排行榜
  selfData: null, // 当前排行榜个人信息
  count: 0,
  ctor(type) {
    this._super();
    this.rankType = type || 'score';
    this.initStatic();      // 静态文件
    this.initBtn();         // 按钮初始化
    this.freshPointRank();
    this.addSelfInfo();     // 创建个人信息栏
  },
  fresh() {
    console.log('------- rank fresh | rankType: ---------- ' + this.rankType);
    this.freshPointRank();
  },

  // 获取排行榜数据
  getRankList(type = 'score', cb) {
    Ltc.sendEvent('BLOCKING');
    const isMoneyRank = type === 'money' ? true : false;
    SelfNet.getRankList({}, (err, response) => {
      Ltc.sendEvent('RELEASEING');
      if (!err) {
        console.log('---- rank ---');
        console.log(JSON.stringify(response));
        this.listData = response.rank;
        cb && cb();
      } else {
        this.listData = [];
        cb && cb();
      }
    }, isMoneyRank);
  },
  // 模拟排行榜数据
  mockData() {
    this.listData = [];
    this.listData = [
      {'openid': '176553610', 'isGirl': false, 'nick': '特太太1', 'face': '0', 'weeklyScore': 1001, 'coin': 9000, 'win': 50, 'lose': 33, 'tie': 12},
      {'openid': '176553612', 'isGirl': true, 'nick': '特太太2', 'face': '0', 'weeklyScore': 998, 'coin': 9000, 'win': 50, 'lose': 33, 'tie': 12},
      {'openid': '176553613', 'isGirl': false, 'nick': '加粉2333jjyy哈哈哈', 'face': '0', 'weeklyScore': 994, 'coin': 9000, 'win': 50, 'lose': 33, 'tie': 12},
      {'openid': '176553614', 'isGirl': true, 'nick': '特太太4', 'face': '0', 'weeklyScore': 992, 'coin': 9000, 'win': 50, 'lose': 33, 'tie': 12},
      {'openid': '176553615', 'isGirl': false, 'nick': '中国好声音第三季', 'face': '0', 'weeklyScore': 990, 'coin': 9000, 'win': 50, 'lose': 33, 'tie': 12},
      {'openid': '176553616', 'isGirl': true, 'nick': '1234567890', 'face': '0', 'weeklyScore': 990, 'coin': 9000, 'win': 50, 'lose': 33, 'tie': 12},
      {'openid': '176553617', 'isGirl': true, 'nick': '特太太7', 'face': '0', 'weeklyScore': 990, 'coin': 9000, 'win': 50, 'lose': 33, 'tie': 12},
      {'openid': '1872275114', 'isGirl': false, 'nick': '风波小子', 'face': '0', 'weeklyScore': 990, 'coin': 9000, 'win': 50, 'lose': 33, 'tie': 12},
    ];
    this.getSelfData();
    this.sortSelfRank();
    this.addTableView();
    this.addSelfInfo();
  },
  initStatic() {
    // 防止触摸事件传递到下一层
    this.swallowTouchesEvent();

    this.bg = addSprite(this, res.startMenu.Ltc_XQ_start_bg_jpg, {
      x: cc.visibleRect.center.x,
      y: cc.visibleRect.center.y,
    });
    // 排行榜背景
    this.rankBg = addSprite(this, resIn.rank.Ltc_XQ_rank_bg, {
      x: cc.visibleRect.center.x,
      y: cc.visibleRect.center.y,
      align: 'ceter',
    });

    this.titleBg = addSprite(this, resIn.rank.Ltc_XQ_rank_title_bg, {
      x: cc.visibleRect.top.x,
      y: cc.visibleRect.top.y,
      align: 'top',
    });
  },
  initBtn() {
    // 返回按钮
    const returnBtn = new Button({
      normalRes: resIn.comm.Ltc_XQ_menu_return_btn,
      onTouchUpInside: () => {
        playEffect(res.audio.Ltc_XQ_btn_clicked_mp3);
        console.log('------ touch the returnBtn ------');
        this.removeFromParent();
        cc.director.getRunningScene().fresh();
      },
    });
    returnBtn.x = this.titleBg.width - 40;
    returnBtn.y = this.titleBg.height / 2 + 10;
    this.titleBg.addChild(returnBtn);
  },
  // 刷新积分榜
  freshPointRank() {
    // 模拟排行榜数据
    this.mockData();
    // 获取排行榜数据
    // this.getRankList('score', () => {
    //   this.getSelfData();
    //   this.sortSelfRank();
    //   this.addTableView();
    //   this.addSelfInfo();
    // });
  },
  // 获取自己的数据
  getSelfData() {
    this.selfData = {};
    this.selfData.openid = UserInfo.getMyQQ();
    this.selfData.nick = UserInfo.getMyName();
    this.selfData.isGirl = UserInfo.data.gender === '女' ? true : false;
    this.selfData.weeklyScore = UserInfo.data.points;
    this.selfData.coin = UserInfo.data.money;
    this.selfData.win = UserInfo.data.win;
    this.selfData.lose = UserInfo.data.lose;
    this.selfData.tie = UserInfo.data.tie;
  },
  // 获取自己的排名
  sortSelfRank() {
    this.selfData.rankNum = '排名之外';
    this.listData.forEach((obj, idx) => {
      console.log(idx, JSON.stringify(obj));
      console.log(this.selfData.openid, obj.openid);
      if (this.selfData.openid.toString() === obj.openid) {
        this.selfData.rankNum = idx + 1;
        return;
      }
    });
  },
  // 添加自己的信息栏
  addSelfInfo() {
    let selfData = this.selfData;
    if (!selfData) {
      selfData = {
        openid: '',
        nick: '',
        isGirl: '',
        face: '',
        weeklyScore: '',
        coin: '',
        win: '',
        lose: '',
        tie: '',
        rankNum: '',
      };
    }
    // 个人信息栏目
    const infoBg = this.infoBg = addSprite(this, resIn.rank.Ltc_XQ_rank_info_bg, {
      x: cc.visibleRect.bottom.x,
      y: cc.visibleRect.bottom.y,
      align: 'bottom',
    });

    const rankStr = selfData.rankNum || '排名之外';
    console.log('== rankStr = ' + rankStr);
    this.selfRank = addLabel(infoBg, rankStr, {
      x: 65, y: infoBg.height / 2, color: cc.color(250, 232, 198),
    });
    // 头像
    const face = this.myFace = new FaceNode(selfData.openid);
    face.x = 180;
    face.y = infoBg.height / 2 - 10;
    infoBg.addChild(face, 5);

    let nickStr = selfData.nick;
    const labelSize = 18; // 昵称的size
    // 超过9个中文字符宽度的字符串需要截取
    nickStr = sliceLabel(nickStr, labelSize, 9);
    // 姓名
    addLabel(infoBg, nickStr, {
      x: face.x + face.width / 2 + 5, y: infoBg.height - 25, align: 'left', color: cc.color(255, 247, 153), size: labelSize,
    });
    // 称号
    const lvName = getLvName(selfData.weeklyScore);
    addBMFLabel(infoBg, '【' + lvName + '】', res.font.Ltc_XQ_rst_yellow_fnt, {
      x: infoBg.width - 12, y: infoBg.height - 57, align: 'right', scale: 0.5,
    });
    // 积分
    const pointIcon = addSprite(infoBg, resIn.rank.Ltc_XQ_icon_point, {
      x: face.x + face.width / 2 + 5, y: infoBg.height - 57, align: 'left',
    });
    addBMFLabel(infoBg, selfData.weeklyScore, res.font.Ltc_XQ_comm_fnt, {
      x: pointIcon.x + pointIcon.width + 5, y: pointIcon.y, align: 'left', scale: 0.7, color: cc.color(250, 217, 143),
    });
    // 战绩
    const recordIcon = addSprite(infoBg, resIn.rank.Ltc_XQ_icon_record, {
      x: face.x + face.width / 2 + 5, y: infoBg.height - 88, align: 'left',
    });
    const recordStr = selfData.win + '胜/' + selfData.lose + '负/' + selfData.tie + '和';
    addBMFLabel(infoBg, recordStr, res.font.Ltc_XQ_comm_fnt, {
      x: recordIcon.x + recordIcon.width + 5, y: infoBg.height - 88, align: 'left', scale: 0.8, color: cc.color(250, 217, 143),
    });
  },
  addTableView() {
    this.rankBg.removeChildByTag(999);
    const tableView = this.tableView = new cc.TableView(this, cc.size(418, 588));
    tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
    tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
    tableView.x = 0;
    tableView.y = 50;
    tableView.tag = 999;
    tableView.setDelegate(this);
    this.rankBg.addChild(tableView);
  },
  scrollViewDidScroll() {},
  scrollViewDidZoom() {},
  // 获取点击到的cell
  tableCellTouched(table, cell) {
    cc.log('cell touched at index: ' + cell.getIdx());
  },
  // 每个cell的大小
  tableCellSizeForIndex() {
    return cc.size(418, 98);
  },
  // tabelview的cell总数
  numberOfCellsInTableView() {
    return this.listData.length || 0;
  },
  // 创建cell
  tableCellAtIndex(table, idx) {
    let cell = table.dequeueCell();
    const data = this.listData[idx];
    let node;
    if (!cell) {
      cell = new RankTableViewCell();
      node = this.drawNode(idx, data);
      cell.addChild(node);
    } else {
      cell.removeAllChildren(true);
      node = this.drawNode(idx, data);
      cell.addChild(node);
    }
    return cell;
  },
  // 绘制cell里面的node
  drawNode(idx, data) {
    const node = cc.Node.create();
    const rankNum = (idx + 1).toFixed(0);
    // console.log('----- rankNum = ' + rankNum);
    let nodeData = data;

    if (!nodeData) {
      nodeData = {
        openid: '',
        nick: '',
        isGirl: '',
        face: '',
        weeklyScore: '',
        coin: '',
        win: '' || 0,
        lose: '' || 0,
        tie: '' || 0,
      };
    }

    // 横线
    addSprite(node, resIn.rank.Ltc_XQ_line, {x: this.rankBg.width / 2, y: 0});
    // 排名
    let rankTxt;
    if (idx < 3) {
      rankTxt = addSprite(node, resIn.rank['Ltc_XQ_rank_num_' + (idx + 1)], {
        x: 45, y: 50,
      });
    } else {
      rankTxt = addBMFLabel(node, rankNum, res.font.Ltc_XQ_rank_num_fnt, {
        x: 40, y: 50,
      });
    }
    // 头像
    const face = new FaceNode(nodeData.openid);
    face.scale = 1;
    face.x = 115;
    face.y = rankTxt.y;
    node.addChild(face, 5);

    // 名字信息
    const itemBg = addSprite(node, resIn.rank.Ltc_XQ_rank_item_bg, {
      x: face.x - 20 + face.width / 2, y: face.y, align: 'left',
    });

    const genderRes = data.isGirl ? resIn.comm.Ltc_XQ_woman : resIn.comm.Ltc_XQ_man;
    const gender = addSprite(itemBg, genderRes, {
      x: 25, y: itemBg.height / 2 + 5, align: 'bottom-left',
    });

    let nickStr = data.nick;
    const labelSize = 16; // 昵称的size
    // 超过7个中文字符宽度的字符串需要截取
    nickStr = sliceLabel(nickStr, labelSize, 7);
    addLabel(itemBg, nickStr, {
      x: gender.x + gender.width + 5, y: itemBg.height / 2 + 5, align: 'bottom-left', size: labelSize,
    });

    const lvName = getLvName(data.weeklyScore);
    addBMFLabel(itemBg, '【' + lvName + '】', res.font.Ltc_XQ_rst_yellow_fnt, {
      x: itemBg.width - 5, y: itemBg.height / 2 + 5, align: 'bottom-right', scale: 0.5,
    });

    // 其他信息
    const recordStr = nodeData.win + '胜/' + nodeData.lose + '负/' + nodeData.tie + '和';
    addBMFLabel(itemBg, recordStr, res.font.Ltc_XQ_rank_green_fnt, {
      x: 25, y: itemBg.height / 2 - 10, align: 'top-left', scale: 1,
    });
    addBMFLabel(itemBg, nodeData.weeklyScore + '分', res.font.Ltc_XQ_rank_yellow_fnt, {
      x: itemBg.width - 5, y: itemBg.height / 2 - 10, align: 'top-right', scale: 1,
    });
    return node;
  },
});

export default RankLayer;
