import cfg from './constants';
const console = cfg.logger('app');
import {res, resIn} from './loader/resource.js';
// import Net from './public/Net.js';

function initCocosProps() {
  console.log('initCocosProps');
  cc.color.BROWN = cc.color(94, 38, 18);
  // 设定2D投影
  cc.director.setProjection(cc.Director.PROJECTION_2D);

  if (!cc.sys.isNative && document.getElementById('cocosLoading')) {
    // If referenced loading.js, please remove it
    document.body.removeChild(document.getElementById('cocosLoading'));
  }

  // Adjust viewport meta
  cc.view.adjustViewPort(true);
  cc.view.enableAutoFullScreen(true);
  cc.view.enableRetina(true);
  if (cfg.canOpenGL) {
    // console.log('support OpenGL');
    // Pass true to enable retina display, on Android disabled by default to improve performance
    // cc.view.enableRetina(true);
    // cc.director.setContentScaleFactor(1.0);
  }

  // Setup the resolution policy and design resolution size
  const RP = cc.ResolutionPolicy.FIXED_HEIGHT;
  const [width, height] = [450, 800];
  // if (!cc.sys.isMobile && !cc.sys.isNative) {
  //   // 电脑屏幕
  //   RP = cc.ResolutionPolicy.SHOW_ALL;
  // }
  cc.view.setDesignResolutionSize(width, height, RP);
  // The game will be resized when browser size change
  cc.view.resizeWithBrowserSize(true);
}

function preStart() {
  console.log('preStart');
  cfg.init();
  window.cfg = cfg;
  window.res = res;
  window.resIn = resIn;
  // window.net = new Net();
}

function onLoaded() {
  console.log('onLoaded');
  const sceneMgr = require('./public/sceneMgr.js');
  sceneMgr.init();
}

cc.game.es6Start = async function gameStart() {
  preStart();
  initCocosProps();

  const loader = require('./loader/loader.js');
  // 1. 加载资源
  // 2. 初始化store，数据有可能需要从服务器同步，因此是异步的
  await Promise.all([loader.preload(['boot']), cfg.initStore()]);

  onLoaded();
};
