import logger from '../es6-utils/cocos/console.js';
const console = logger('PublicDialog');
import Ltc from '../public/Ltc.js';
import MaskLayer from '../es6-utils/components/MaskLayer.js';
import Button from '../es6-utils/components/Button.js';

const PublicDialog = {
  isLock: false,
  // 网络阻塞
  block(parent) {
    this.isLock = true;
    const scene = parent || cc.director.getRunningScene();
    if (scene.getChildByTag(44444444)) {
      return;
    }
    const layer = new Ltc.Layer();
    layer.addChild( new cc.LayerColor( cc.color(20, 20, 20, 150) ) );
    const blocking = new cc.Sprite( resIn.publicDialog.Ltc_XQ_blocking );
    blocking.attr({
      x: cc.winSize.width / 2,
      y: cc.winSize.height * 0.6,
    });
    layer.addChild(blocking);
    scene.addChild(layer, 100);
    blocking.runAction( cc.rotateBy(0.1, 15).repeatForever() );
    layer.swallowTouchesEvent();
    layer.setTag(44444444);
  },
  // 阻塞释放
  release(parent) {
    this.isLock = false;
    const scene = parent || cc.director.getRunningScene();
    const blockLayer = scene.getChildByTag(44444444);
    blockLayer && blockLayer.removeFromParent();
  },
  /**
   * 冒泡提示
   * obj = {txt: '你需要冒泡提示的内容' , time: '冒泡延迟消失的时间', cb: '冒泡后的回调'}
   */
  tipsPop(obj) {
    this.removeWaitPop();
    console.log('-- publicDialog.tipsPop : ' + obj.txt + ' --');
    const defaultObj = {};
    defaultObj.txt = obj.txt || '';
    defaultObj.time = obj.time || 2;
    defaultObj.cb = obj.cb || null;

    const scene = cc.director.getRunningScene();
    const layer = new cc.Layer();
    // 提示框
    const tip = new cc.Sprite(resIn.publicDialog.Ltc_XQ_tipspop_bg);
    tip.attr({
      x: cc.winSize.width / 2,
      y: cc.winSize.height * 0.6,
    });
    layer.addChild(tip);
    // 文字
    const msg = new cc.LabelTTF(defaultObj.txt, 'Arial', obj.fontSize || 32);
    msg.attr({
      x: tip.width / 2,
      y: tip.height / 2,
    });
    msg.fillStyle = cc.color(255, 255, 255);
    tip.addChild(msg);
    // 动画
    const delay = cc.delayTime(defaultObj.time);
    const move = cc.moveBy(0.5, 0, 200);
    const fade = cc.fadeOut(0.5);
    const cb = cc.callFunc(() => {
      layer.removeFromParent();
      defaultObj.cb && defaultObj.cb();
    });
    // 执行动画
    scene.addChild(layer, 100);
    tip.runAction(cc.sequence(delay, move, fade, cb));
  },

  addWaitPop(obj) {
    this.removeWaitPop();
    const scene = cc.director.getRunningScene();
    const layer = new MaskLayer({color: cc.color(0, 0, 0, 0)});
    layer.setTag(100010);
    scene.addChild(layer, 100);

    const tip = new cc.Sprite(resIn.publicDialog.Ltc_XQ_tipspop_bg);
    tip.attr({
      x: cc.winSize.width / 2,
      y: cc.winSize.height * 0.6,
    });
    layer.addChild(tip);

    const msg = new cc.LabelTTF(obj.txt, 'Arial', obj.fontSize || 25);
    msg.attr({
      x: tip.width / 2,
      y: tip.height / 2,
    });
    tip.addChild(msg);
  },

  removeWaitPop() {
    const scene = cc.director.getRunningScene();
    const layer = scene.getChildByTag(100010);
    if (layer && cc.sys.isObjectValid(layer)) {
      scene.removeChild(layer);
    }
  },

  confirmPop(obj, bvar) {
    const scene = cc.director.getRunningScene();
    if (scene.getChildByTag(100086)) return;

    const layer = new MaskLayer({color: cc.color(0, 0, 0, 0)});
    layer.setTag(100086);
    scene.addChild(layer, 20);

    const frame = new cc.Sprite(resIn.publicDialog.Ltc_XQ_popBg);
    frame.x = layer.width / 2;
    frame.y = layer.height / 2;
    layer.addChild(frame);

    let offsetX = 0;
    if (!obj.noCancel) {
      offsetX = 70;

      const rightRes = bvar === true ? resIn.publicDialog.Ltc_XQ_cancelbtn : resIn.publicDialog.Ltc_XQ_refuseBtn;
      const cancelBtn = new Button({
        normalRes: rightRes,
        onTouchUpInside: () => {
          if (obj.cb) {
            obj.cb(false);
          }
          layer.removeFromParent(true);
        },
      });
      cancelBtn.setPosition(cc.p(frame.width / 2 + offsetX, 50));
      frame.addChild(cancelBtn);
    }
    const leftRes = bvar === true ? resIn.publicDialog.Ltc_XQ_enterbtn : resIn.publicDialog.Ltc_XQ_agreeBtn;
    const confirmBtn = new Button({
      normalRes: leftRes,
      onTouchUpInside: () => {
        if (obj.cb) {
          obj.cb(true);
        }
        layer.removeFromParent(true);
      },
    });
    confirmBtn.setPosition(cc.p(frame.width / 2 - offsetX, 50));
    frame.addChild(confirmBtn);

    const context = new cc.LabelTTF(obj.txt, 'Arial', 22, cc.size(270, 0), cc.TEXT_ALIGNMENT_CENTER);
    context.x = frame.width / 2;
    context.y = frame.height / 2 + 25;
    context.setColor(cc.color.BROWN);
    frame.addChild(context);
  },
};

export default PublicDialog;
