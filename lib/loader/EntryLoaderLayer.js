import cfg from '../constants';
const console = cfg.logger('EntryLoaderLayer');
import { res } from './resource.js';

import { logoBase64, titleBase64, pbgBase64, pppBase64, starBase64 } from './wanbaLoaderRes.js';
import { addSprite, addLabel } from '../es6-utils/cocos/base.js';

const EnterLoaderLayer = cc.Layer.extend({
  ctor() {
    this._super();
    this.init();
    return true;
  },

  init() {
    if (cfg.isWanba) {
      this.renderWanba();
    } else {
      this.renderSlogan();
    }
  },

  renderWanba() {
    const bg = new cc.LayerColor(cc.color.WHITE);
    this.addChild(bg);

    // logo
    const center = cc.visibleRect.center;
    addSprite(this, logoBase64, { x: center.x, y: center.y + 200 });
    addSprite(this, titleBase64, { x: center.x, y: center.y + 40 });
    const lb = addLabel(this, '首次加载时间稍长，请耐心登录...', { size: 22, x: center.x, y: center.y - 192, color: cc.color(128, 128, 128) });

    const pbg = this.pbg = addSprite(this, pbgBase64, { x: center.x, y: lb.y - 48 });
    const star = this.star = addSprite(pbg, starBase64, { y: pbg.height / 2 });
    star.runAction(cc.repeatForever(cc.rotateBy(1.5, 360)));

    this.renderProgress(pbg, pppBase64);
  },

  renderSlogan() {
    const center = cc.visibleRect.center;
    addSprite(this, res.loading.slogan_bg_png, { x: center.x, y: center.y });
    const pbg = addSprite(this, res.loading.loadbg_png, { x: center.x, y: 200});
    this.renderProgress(pbg, res.loading.load_png);
  },

  renderProgress(pbg, img) {
    const ppp = new cc.Sprite(img);
    const progress = this.progress = new cc.ProgressTimer(ppp);
    progress.type = cc.ProgressTimer.TYPE_BAR; // 水平进度条
    progress.minPoint = cc.p(1, 0);
    progress.setPosition(pbg.width / 2, pbg.height / 2);
    progress.setMidpoint(cc.p(0, 0)); // 从左起点开始
    progress.setBarChangeRate(cc.p(1, 0)); // 长度和高度变化的大小
    progress.setPercentage(0); // 当前进度
    pbg.addChild(progress);
  },

  onProgress(percent) {
    console.debug('EntryLoaderLayer onProgress', percent);
    this.progress.setPercentage(percent);

    if (this.star) this.star.x = this.pbg.width / 100 * percent;
  },
});

export default EnterLoaderLayer;
