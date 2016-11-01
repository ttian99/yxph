import logger from '../es6-utils/cocos/console.js';
const console = logger('StartLayer');
import FieldLayer from './FieldLayer.js';
import RoomLayer from './RoomLayer.js';
import ChargeLayer from '../charge/chargeLayer.js';
import StartLayer from './StartLayer.js';
import LoginLayer from './LoginLayer.js';
import RankLayer from '../rank/RankLayer.js';
import Ltc from '../public/Ltc.js';
import BattleData from '../battle/BattleData.js';
import SetLayer from '../set/SetLayer.js';

const StartScene = Ltc.Scene.extend({
  curLayer: null,
  ctor(type) {
    this._super();
    this.enterLayer(type);
    this.bindEvent();
  },
  enterLayer(type) {
    console.log('-- type = ' + type);
    if (!type) {
      this.addLoginLayer();
    } else if (type === 'FIELD_LAYER') {
      this.addFieldLayer();
    } else if (type === 'ROOM_LAYER') {
      if (!BattleData.sceneid) return;
      this.addRoomLayer(BattleData.sceneid);
    }
  },
  bindEvent() {
    this.addEvent('START_LAYER', (evt, dt) => {
      this.addStartLayer(dt);
    });

    this.addEvent('FIELD_LAYER', () => {
      this.addFieldLayer();
    });

    this.addEvent('ROOM_LAYER', (evt, data) => {
      this.addRoomLayer(data);
    });

    this.addEvent('CHARGE_LAYER', () => {
      this.addChargeLayer();
    });

    this.addEvent('RANK_LAYER', () => {
      this.addRankLayer();
    });

    this.addEvent('SET_LAYER', () => {
      this.addSetLayer();
    });
  },

  readyChange() {
    if (this.curLayer && cc.sys.isObjectValid(this.curLayer)) {
      this.curLayer.removeFromParent(true);
      this.curLayer = null;
    }
  },

  addLoginLayer() {
    this.readyChange();
    console.log('----------- login layer ----------');
    const layer = this.curLayer = new LoginLayer();
    this.addChild(layer);
  },
  addStartLayer(dt) {
    this.readyChange();
    console.log('------------- start layer ----------');
    const layer = this.curLayer = new StartLayer(dt);
    this.addChild(layer);
  },
  addFieldLayer() {
    this.readyChange();
    console.log('------------- field layer ----------');
    const layer = this.curLayer = new FieldLayer();
    this.addChild(layer);
  },
  addRoomLayer(data) {
    this.readyChange();
    console.log('------------- room layer ----------');
    const layer = this.curLayer = new RoomLayer(data);
    this.addChild(layer);
  },
  addChargeLayer() {
    console.log('------------- charge layer ----------');
    const layer = new ChargeLayer();
    this.addChild(layer);
  },
  addRankLayer() {
    console.log('------------- rank layer ----------');
    const layer = new RankLayer();
    this.addChild(layer);
  },

  addSetLayer() {
    console.log('------------- set layer -----------');
    const layer = new SetLayer();
    this.addChild(layer);
  },

  fresh() {
    console.log('----- fresh start scene -------- ');
    // if (this.curLayer) {
    //   this.curLayer.fresh && this.curLayer.fresh();
    // }
  },
});

export default StartScene;
