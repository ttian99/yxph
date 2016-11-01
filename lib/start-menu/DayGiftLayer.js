import logger from '../es6-utils/cocos/console.js';
const console = logger('DayGiftLayer');
import {addSprite, addBMFLabel } from '../es6-utils/cocos/base';
import {resIn} from '../loader/resource.js';
import _ from 'lodash';
import Button from '../es6-utils/components/Button.js';
import Ltc from '../public/Ltc.js';
import cfg from '../constants';

const DayGiftLayer = Ltc.Layer.extend({
  ctor() {
    this._super();
    this.initStatic();
  },
  initStatic() {
    this.swallowTouchesEvent();
    // 背景
    const bg = addSprite(this, resIn.dayGift.Ltc_XQ_dayGift_bg, {
      x: cc.visibleRect.center.x, y: cc.visibleRect.center.y,
    });
    const tip = addBMFLabel(bg, '您已经连续登陆2天', res.font.Ltc_XQ_comm_fnt, { x: bg.width / 2, y: bg.height - 70, algin: 'center', color: cc.color(250, 210, 182) });
    console.log(tip.x);
    const data = cfg.dayGift;
    // 每日物品
    _.range(0, 7).forEach((id) => {
      const type = data[id + ''].gains.type;
      const num = data[id + ''].gains.num;
      let iconRes = resIn.dayGift.Ltc_XQ_coin1;
      if (type === 'coin') {
        if (_.inRange(num, 0, 350)) {
          iconRes = resIn.dayGift.Ltc_XQ_coin1;
        } else if (_.inRange(num, 350, 550)) {
          iconRes = resIn.dayGift.Ltc_XQ_coin2;
        } else if (_.inRange(num, 550, 650)) {
          iconRes = resIn.dayGift.Ltc_XQ_coin3;
        } else if (_.inRange(num, 650, 750)) {
          iconRes = resIn.dayGift.Ltc_XQ_coin4;
        } else if (_.inRange(num, 750, 200000)) {
          iconRes = resIn.dayGift.Ltc_XQ_coin5;
        }
        console.log('-- iconRes --' + iconRes);
      }
      const itemRes = (id === 6) ? resIn.dayGift.Ltc_XQ_dayGift_item_bg2 : resIn.dayGift.Ltc_XQ_dayGift_item_bg1;
      const arr = [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [1, 2]];
      const delX = 120;
      const delY = 150;
      const posX = bg.width / 2 + delX * (arr[id][0] - 1);
      const posY = bg.height - 160 - arr[id][1] * delY;
      const itemBg = addSprite(bg, itemRes, { x: posX, y: posY });
      addSprite(itemBg, iconRes, { x: itemBg.width / 2, y: itemBg.height - 15, scale: 0.8, align: 'top' });
      console.log("data.[id+''].num = " + data[id + ''].num);
      addBMFLabel(itemBg, data[id + ''].gains.num, res.font.Ltc_XQ_comm_fnt, { x: itemBg.width / 2, y: itemBg.height - 90, algin: 'top', color: cc.color(255, 228, 0) });
      addBMFLabel(itemBg, data[id + ''].name, res.font.Ltc_XQ_comm_fnt, { x: itemBg.width / 2, y: 15, algin: 'center' });
      const btn = new Button({
        normalRes: resIn.dayGift.Ltc_XQ_dayGift_get_btn,
        disableRes: resIn.dayGift.Ltc_XQ_dayGift_get_btn,
        onTouchUpInside: () => {
          this.removeFromParent();
        },
      });
      btn.x = bg.width / 2;
      btn.y = 60;
      bg.addChild(btn);
    });
  },
});

export default DayGiftLayer;
