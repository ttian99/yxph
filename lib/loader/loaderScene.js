import EntryLoaderLayer from './EntryLoaderLayer.js';
import GameLoaderLayer from './GameLoaderLayer.js';
import cfg from '../constants';
const console = cfg.logger('loaderScene');

const LoaderScene = cc.Scene.extend({
  _className: 'LoaderScene',
  layer: null,

  init(isEntry) {
    this.layer = isEntry ? new EntryLoaderLayer() : new GameLoaderLayer();
    this.addChild(this.layer);
  },

  onEnter() {
    this._super();
    console.log('LoaderScene onEnter');
  },

  onExit() {
    this._super();
    console.log('LoaderScene onExit');
  },

  onProgress(percent) {
    this.layer && this.layer.onProgress(percent);
  },
});

export default function loaderScene(isEntry) {
  cc.loaderScene = new LoaderScene();
  cc.loaderScene.init(isEntry);
  cc.director.runScene(cc.loaderScene);
  return cc.loaderScene;
}
