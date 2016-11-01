import logger from '../es6-utils/cocos/console.js';
const console = logger('LoginLayer');
import {addSprite} from '../es6-utils/cocos/base';
import {res, resIn} from '../loader/resource.js';
import Ltc from '../public/Ltc.js';
import Events from '../public/Events.js';
// import SelfNet from '../public/SelfNet.js';
// import DataMgr from '../public/DataMgr.js';


const LoginLayer = Ltc.Layer.extend({
  ctor() {
    this._super();
    this.initStatic();
  },
  initStatic() {
    // TSDK初始化，并自动登陆
    net.initialize();

    const {center} = cc.visibleRect;
    const bg = addSprite(this, res.boot.Ltc_XQ_loding_bg_jpg, { x: center.x, y: center.y });
    const ld = addSprite(bg, resIn.loading.Ltc_XQ_loding, { x: bg.width / 2, y: bg.height / 2 });
    ld.runAction(cc.repeatForever(cc.rotateBy(1, 360)));

    this.addEvent(Events.Login_success, (evt, dt) => {
      console.log('登陆游戏成功!!!');
      this.sendEvent('START_LAYER', dt);
    });
    this.addEvent(Events.Login_failed, () => {
      Ltc.sendEvent('TIPSPOP', {txt: '登陆失败，请重新加载游戏!'});
    });
  },
});

export default LoginLayer;
