import cfg from '../constants';
const console = cfg.logger('runtimeLoader');

export default function load(groups) {
  cc.LoaderLayer.setConfig({
    background: { show: false },
    title: { show: false },
    logo: { show: false },
    progressBar: { show: true },
    tips: {
      show: true,
      tipsProgress(status, loaderLayer) {
        const lb = loaderLayer.getTipsLabel();
        if (lb) lb.setString('玩命加载中' + Math.floor(status.percent) + '%(仅需加载一次)');
      },
    },
    onEnter() {  // 参数layer，可以在上面画内容
      console.log('onEnter');
    },
    onExit() {
      console.log('onExit');
    },
  });

  return new Promise(resolve => cc.LoaderLayer.preload(groups, resolve));
}
