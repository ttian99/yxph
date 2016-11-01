import logger from '../es6-utils/cocos/console.js';
const console = logger('ChargeLayer');
import {addSprite, addLabel} from '../es6-utils/cocos/base';
import {resIn} from '../loader/resource.js';
import _ from 'lodash';
import Button from '../es6-utils/components/Button.js';
import cfg from '../constants';
import Ltc from '../public/Ltc.js';
import FaceNode from '../face/FaceNode.js';
import UserInfo from '../public/UserInfo.js';
import Events from '../public/Events.js';
import {playEffect} from '../es6-utils/cocos/audio.js';

const ChargeLayer = Ltc.Layer.extend({
  ctor() {
    this._super();
    this.initStatic();
    this.bindEvent();
  },
  bindEvent() {
    this.addEvent(Events.Update_selfInfo, () => {
      console.log('-- StartLayer Events.Update_selfInfo --');
      this.fresh();
    });
  },
  fresh() {
    console.log('-- charge layer fresh --');
    console.log(JSON.stringify(UserInfo.data));
    this.nick.setString(UserInfo.data.nick);
    this.coin.setString(UserInfo.data.money);
    this.face.fresh(UserInfo.data.qq);
  },
  initStatic() {
    // 防止触摸事件传递到下一层
    this.swallowTouchesEvent();
    // 背景
    addSprite(this, res.public.Ltc_XQ_bg_jpg, {
      x: cc.visibleRect.center.x, y: cc.visibleRect.center.y,
    });
    // 顶部标题栏
    const title = addSprite(this, resIn.comm.title_bg, {
      x: cc.visibleRect.width / 2, y: cc.visibleRect.top.y,
    });
    title.anchorY = 1;
    // 个人信息栏
    const infoBg = addSprite(this, resIn.charge.charge_infoBg, {
      x: cc.visibleRect.center.x, y: cc.visibleRect.top.y - 130,
    });

    this.face = new FaceNode(UserInfo.data.qq);
    this.face.x = 38;
    this.face.y = infoBg.height / 2;
    infoBg.addChild(this.face);

    this.nick = addLabel(infoBg, '', {
      x: this.face.width + 5, y: infoBg.height / 2 + 15, color: cc.color(254, 211, 95), align: 'left',
    });
    const coinIcon = addSprite(infoBg, resIn.comm.coin, {
      x: this.face.width + 5, y: infoBg.height / 2 - 15, align: 'left', scale: 0.7,
    });
    this.coin = addLabel(infoBg, '', {
      x: coinIcon.x + 5 + coinIcon.width * coinIcon.scale, y: coinIcon.y, color: cc.color(254, 211, 95), align: 'left',
    });
    // 返回按钮
    const returnBtn = new Button({
      normalRes: resIn.comm.title_return_btn,
      onTouchUpInside: () => {
        playEffect(res.audio.Ltc_XQ_btn_clicked_mp3);
        console.log('------ touch the returnBtn ------');
        this.removeFromParent();
        cc.director.getRunningScene().fresh();
      },
    });
    returnBtn.x = 40;
    returnBtn.y = title.height / 2 + 10;
    title.addChild(returnBtn);
    // 购买金币信息
    _.range(0, 3).forEach((id) => {
      const data = cfg.buy[id + ''];
      // 条目背景
      const itemBg = addSprite(this, resIn.charge.charge_itemBg, {
        x: cc.visibleRect.center.x, y: cc.visibleRect.top.y - 250 - (150 * id),
      });
      // 物品图标
      addSprite(itemBg, resIn.charge['charge_coin' + id], {
        x: 60, y: itemBg.height / 2,
      });
      // 多送比例
      const per = (data.addNum / data.coin).toFixed(2) * 100 + '%';
      console.log('per = ' + per);
      let str = '';
      // 物品描述
      const midX = itemBg.width / 2 - 20;
      const midY = itemBg.height / 2;
      if (data.addNum === 0) {
        str = '铜钱' + data.coin;
        const desc = new cc.LabelBMFont(str, res.font.Ltc_XQ_comm_fnt);
        desc.x = midX;
        desc.y = midY;
        desc.setColor(cc.color(255, 208, 180));
        itemBg.addChild(desc);
      } else {
        const desc1 = new cc.LabelBMFont('铜钱', res.font.Ltc_XQ_comm_fnt);
        const desc2 = new cc.LabelBMFont(data.coin, res.font.Ltc_XQ_comm_fnt);
        const desc3 = new cc.LabelBMFont('+' + data.addNum, res.font.Ltc_XQ_comm_fnt);
        const desc4 = new cc.LabelBMFont('多送' + per, res.font.Ltc_XQ_comm_fnt);
        desc1.setColor(cc.color(255, 208, 180));
        desc2.setColor(cc.color(255, 208, 180));
        desc3.setColor(cc.color(255, 228, 0));
        desc4.setColor(cc.color(255, 228, 0));
        desc1.x = midX;
        desc1.y = midY + 30;
        desc2.x = midX - (5 + desc3.width) / 2;
        desc2.y = midY;
        desc3.x = 5 + desc2.x + desc2.width;
        desc3.y = midY;
        desc4.x = midX;
        desc4.y = midY - 30;
        itemBg.addChild(desc1);
        itemBg.addChild(desc2);
        itemBg.addChild(desc3);
        itemBg.addChild(desc4);
      }
      // 购买按钮
      const buyBtn = new Button({
        normalRes: resIn.charge.charge_buy_btn,
        title: '¥' + data.price,
        fntFile: res.font.price_fnt,
        fntSacle: 0.7,
        titleOffY: -5,
        onTouchUpInside: () => {
          playEffect(res.audio.Ltc_XQ_btn_clicked_mp3);
          console.log('------ touch the buyBtn ------');
          this.clickBuyBtn();
        },
      });
      buyBtn.x = itemBg.width - 80;
      buyBtn.y = itemBg.height / 2 + 5;
      itemBg.addChild(buyBtn);
      const tipRes = (id === 2) ? resIn.charge.tip_sp : resIn.charge.tip_hot;
      const tip = addSprite(itemBg, tipRes, {
        x: 0, y: itemBg.height,
      });
      tip.anchorX = 0;
      tip.anchorY = 1;
    });

    this.fresh();
  },
  clickBuyBtn() {
    // const chat = new ChatLayer();
    // this.addChild(chat);
  },
});

export default ChargeLayer;
