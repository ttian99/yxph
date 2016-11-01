import logger from '../es6-utils/cocos/console.js';
const console = logger('BattleReadyLayer');
import {resIn} from '../loader/resource.js';
import {changeSpriteRes} from '../es6-utils/cocos/base';

const BattleEffectLayer = cc.Layer.extend({
  _fromP: null,
  _toP: null,
  _props: null,
  _ptArr: [],
  ctor(props) {
    this._super();
    this._props = props;

    const fromPoint = this._fromP = new cc.Sprite(resIn.piece.Ltc_XQ_point_white);
    props.layer.addChild(fromPoint, 1);
    const toPoint = this._toP = new cc.Sprite(resIn.piece.Ltc_XQ_pieceLight);
    toPoint.setScale(props.scale);
    props.layer.addChild(toPoint, 1);
    this.setV(false);
  },

  moveEffect(from, to, isMyMove) {
    if (this._fromP) {
      if (isMyMove) {
        changeSpriteRes(this._fromP, resIn.piece.Ltc_XQ_point_white);
      } else {
        changeSpriteRes(this._fromP, resIn.piece.Ltc_XQ_point_red);
      }
      this._fromP.setPosition(cc.p(from.x, from.y - 3));
    }
    if (this._toP) {
      this._toP.setPosition(to);
    }
    this.setV(true);
  },

  hideEffect() {
    this.setV(false);
    this.removePointEffect();
  },

  setV(bvar) {
    if (this._fromP) {
      this._fromP.setVisible(bvar);
    }
    if (this._toP) {
      this._toP.setVisible(bvar);
    }
  },

  popEffect(type) {
    const temp = this.getChildByTag(10);
    if (temp && cc.sys.isObjectValid(temp)) {
      this.removeChild(temp);
    }
    const spRes = this.getPopResByType(type);
    const sp = new cc.ProgressTimer(new cc.Sprite(spRes));
    sp.type = cc.ProgressTimer.TYPE_RADIAL;
    sp.setPercentage(0);
    sp.setPosition(cc.p(cc.visibleRect.center.x, cc.visibleRect.center.y + 20));
    sp.setTag(10);
    this.addChild(sp);
    sp.runAction(cc.sequence(cc.progressTo(0.3, 100), cc.delayTime(1.0), cc.fadeOut(0.5), cc.callFunc(() => {
      sp.removeFromParent(true);
    })));
  },

  getPopResByType(type) {
    const resArr = [
      resIn.ui.Ltc_XQ_jiangIcon,
      resIn.ui.Ltc_XQ_eatIcon,
      resIn.ui.Ltc_XQ_skillIcon,
      resIn.ui.Ltc_XQ_dieIcon,
    ];
    if (type < 0 || type >= resArr.length) {
      console.log('error ===->types : ' + type);
      return null;
    }
    return resArr[type];
  },

  pointEffect(arr) {
    if (this._ptArr.length !== 0) {
      this.removePointEffect();
    }
    arr.forEach((point, idx) => {
      this._ptArr[idx] = new cc.Sprite(resIn.piece.Ltc_XQ_point_green);
      this._ptArr[idx].setPosition(cc.p(point.x, point.y - 3));
      this.addChild(this._ptArr[idx]);
    });
  },

  removePointEffect() {
    if (this._ptArr.length === 0) return;
    this._ptArr.forEach((pt) => {
      if (pt && cc.sys.isObjectValid(pt)) {
        pt.removeFromParent(true);
      }
    });
    this._ptArr = [];
  },
});

export default BattleEffectLayer;
