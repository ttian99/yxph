import logger from '../es6-utils/cocos/console.js';
const console = logger('cfg');
import gameCfg from '../svr-client-cfg/chinaChess-comm-cfg.js';

const cfg = {
  logger: (name, subname) => logger(name, subname),
  gameName: 'chinaChess',
  ver: '0.0.1',
  svrUrl: 'http://203.195.202.198:9050/chinaChess/',
  // svrUrl: 'http://localhost:9050/chinaChess/',
  canOpenGL: true, // 是否支持openGL(支持openGL的时候使用大图片)
  store: null,  // redux-store

  init() {
    console.log('xxxxxxxxxcfg.init():::::');
    gameCfg(cfg);
    console.log('cfg = ' + JSON.stringify(cfg));
  },

  initStore() {
    console.log('xxxxxxxxxcfg.initStore():::');
  },
};

export default cfg;
