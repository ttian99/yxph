import {res, resIn} from './resource.js';
import cfg from '../constants';
const console = cfg.logger('GameLoaderLayer');
import {addSprite} from '../es6-utils/cocos/base';

const GameLoaderLayer = cc.Layer.extend({
  ctor() {
    this._super();
    this.init();
    return true;
  },

  init() {
    const {center} = cc.visibleRect;
    // const pbg = addSprite(this, resIn.loading.progressBg, { x: center.x, y: center.y });
    // this.ani = addSprite(pbg, resIn.loading.walking0, {
    //   x: -12, y: 34,
    // });
    // const animation = new cc.Animate(cc.animationCache.getAnimation(res.ani.walking));
    // this.ani.runAction(cc.repeatForever(animation));

    // const progress = this.progress = new cc.ProgressTimer(new cc.Sprite(resIn.loading.progressFront));
    // progress.type = cc.ProgressTimer.TYPE_BAR;

    // progress.minPoint = cc.p(1, 0);
    // progress.setPosition(pbg.width / 2, pbg.height / 2);
    // progress.setMidpoint(cc.p(0, 0)); // 从左启动开始
    // progress.setBarChangeRate(cc.p(1, 0));
    // progress.setPercentage(0);
    // pbg.addChild(progress);

    const bg = addSprite(this, res.boot.Ltc_XQ_loding_bg_jpg, { x: center.x, y: center.y });
    const ld = addSprite(bg, resIn.loading.Ltc_XQ_loding, { x: bg.width / 2, y: bg.height / 2 });
    ld.runAction(cc.repeatForever(cc.rotateBy(1, 360)));
  },

  onProgress(percent) {
    console.debug('GameLoaderLayer onProgress', percent);
    // this.progress.setPercentage(percent);
    // this.ani.x = this.progress.width / 100 * percent - 12;
  },
});

export default GameLoaderLayer;
