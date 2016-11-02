import logger from '../es6-utils/cocos/console.js';
const console = logger('StartLayer');
import Ltc from '../public/Ltc.js';

const StartScene = Ltc.Scene.extend({
  ctor() {
    this._super();
    this.bindEvent();
  },
  bindEvent() {
    this.addEvent('START_LAYER', (evt, data) => {
      console.log('------ start layer ---------');
      // console.log(data);
    });
  },
});

export default StartScene;
