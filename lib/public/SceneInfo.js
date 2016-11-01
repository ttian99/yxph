import logger from '../es6-utils/cocos/console.js';
const console = logger('SceneInfo');
import Events from './Events.js';
import Ltc from './Ltc.js';

const SceneInfo = {
  data: {},

  /**
   * sceneId 场景ID，作为key
   * sceneName 场景名称
   * nOnline 在线人数
   * lowLimit 游戏筹码（游戏币，欢乐豆...）最低限制
   * upLimit 游戏筹码（游戏币，欢乐豆...)最高限制，-1表示没上限制
   * recommendLow 推荐玩家优先进入此场景的最低游戏筹码
   * recommendUp 推荐玩家优先进入此场景的最高游戏筹码
   */
  updateInfo(sceneId, sceneName, nOnline, lowLimit, upLimit, recommendLow, recommendUp) {
    this.data[sceneId] = this.data[sceneId] || {};
    this.data[sceneId].sceneName = sceneName;
    this.data[sceneId].nOnline = nOnline;
    this.data[sceneId].lowLimit = lowLimit;
    this.data[sceneId].upLimit = upLimit;
    this.data[sceneId].recommendLow = recommendLow;
    this.data[sceneId].recommendUp = recommendUp;
    console.log('sceneinfo : ' + JSON.stringify(this.data));
    Ltc.sendEvent(Events.Update_SceneInfo, this.data);
  },
};

export default SceneInfo;
