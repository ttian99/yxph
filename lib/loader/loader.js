/**
 * native, h5:
 *   [resload] (null) => cc.loader.load (loading) => (loaded) => (cached)
 *
 * runtime:
 *   [resGroup] (null) => cc.LoaderLayer.preload(分组数组) (ready)
 *   [resload] (null) => cc.loader.load (loading) => (loaded) => (cached)
 *
 * h5需支持动态预下载功能
 */
import {resGroup, resLoad} from './resource.js';
import _ from 'lodash';
import s from 'underscore.string';
import cfg from '../constants';
const console = cfg.logger('loader');
import loaderScene from './loaderScene.js';
import runtimeLoader from './runtimeLoader.js';

const STATUS = {
  LOADING: 'loading',
  LOADED: 'loaded',
  CACHED: 'CACHED',

  READY: 'READY',
};

// 获取单个分组下的资源文件列表
function getOneGroupFiles(name) {
  const files = [];
  const group = resLoad[name];
  _.keys(group).forEach(key => {
    if (key !== 'status') files.push(...group[key]);
  });
  return files;
}

// groupsName 如果是字符串，转数组
function toArray(groupsName) {
  let names = groupsName;
  if (_.isString(names)) names = [names];
  return names;
}

// 获取所列分组的文件列表
function getGroupsFiles(gNameArr) {
  let files = [];
  gNameArr.forEach(name => {
    getOneGroupFiles(name).forEach(file => files.push(file));
  });
  files = _.uniq(files);
  return files;
}

// 释放单个分组下的资源
function releaseOneGroup(gName) {
  const group = resGroup[gName];
  if (group.ani) {
    group.ani.forEach((aniInfo) => {
      const {name} = aniInfo;
      cc.animationCache.removeAnimation(name);
    });
  }

  const loadGroup = resLoad[gName];
  _.keys(loadGroup).forEach((fileType) => {
    switch (fileType) {
      case 'tp':
        loadGroup.tp.forEach((file) => {
          if (_.endsWith(file, '.plist')) {
            cc.spriteFrameCache.removeSpriteFramesFromFile(file);
          }
        });
        break;
      case 'img':
      case 'spine':
        loadGroup[fileType].forEach((file) => {
          if (_.endsWith(file, '.jpg') || _.endsWith(file, '.png')) {
            cc.textureCache.removeTextureForKey(file);
          }
        });
        break;
      default:
        return;
    }
  });
}

// 缓存资源
function cacheOneGroup(gName) {
  const loadGroup = resLoad[gName];
  _.keys(loadGroup).forEach((fileType) => {
    switch (fileType) {
      case 'tp':
        loadGroup.tp.forEach((file) => {
          if (_.endsWith(file, '.plist')) {
            cc.spriteFrameCache.addSpriteFrames(file);
          }
        });
        break;
      default:
        return;
    }
  });

  const group = resGroup[gName];
  if (group.ani) {
    group.ani.forEach((aniInfo) => {
      const {name, start, end, delay, stopAtLastFrame} = aniInfo;
      const frames = _.range(start, end + 1).map((i) => {
        return cc.spriteFrameCache.getSpriteFrame(name + i + '.png');
      });
      const ani = new cc.Animation(frames);
      ani.setDelayPerUnit(delay || 0.1);
      ani.setRestoreOriginalFrame(!stopAtLastFrame);
      cc.animationCache.addAnimation(ani, name);
    });
  }
}

function cacheGroups(gNameArr) {
  gNameArr.forEach(gName => cacheOneGroup(gName));
}

function getMainGroupsName(gNameArr) {
  let mainGroups = [];
  gNameArr.forEach((name) => mainGroups.push(s.strLeft(name, ':')));
  mainGroups = _.uniq(mainGroups);
  return mainGroups;
}

function setResLoadStatus(gNameArr, status) {
  const gsName = getMainGroupsName(gNameArr);
  gsName.forEach(name => {
    resLoad[name].status = status;
  });
}

//* for h5
function loadPromise(files, onProgress = (() => {})) {
  return new Promise(resolve => {
    cc.loader.load(files, (result, count, loadedCount) => {
      const percent = Math.floor(loadedCount / count * 100);
      onProgress(percent);
    }, () => {
      onProgress(100);
      resolve();
    });
  });
}
// */

function loadOnePromise(file) {
  return new Promise((resolve, reject) => {
    console.log('loadOnePromise', file);
    cc.loader.load(file, () => {}, (err) => {
      if (err) {
        console.error('loadOnePromise', err);
        return reject(err);
      }
      resolve();
    });
  });
}

async function loadGen(files, onProgress = (() => {})) {
  let loadedCount = 0;
  const count = files.length;
  for (const file of files) {
    await loadOnePromise(file);
    loadedCount++;
    const percent = Math.floor(loadedCount / count * 100);
    onProgress(percent);
  }
}

async function loadRes(gNameArr, onProgress) {
  const needLoadArr = gNameArr.filter(name => !resLoad[name].status);

  setResLoadStatus(needLoadArr, STATUS.LOADING);
  const files = getGroupsFiles(needLoadArr);
  try {
    if (cc.sys.isNative) {
      await loadGen(files, onProgress);
    } else {
      await loadPromise(files, onProgress);
    }
  } catch (e) {
    console.error('loadRes', e);
  }

  setResLoadStatus(needLoadArr, STATUS.LOADED);

  const needCacheArr = gNameArr.filter(name => (resLoad[name].status === STATUS.LOADED));
  cacheGroups(needCacheArr);
  setResLoadStatus(needCacheArr, STATUS.CACHED);
}

/**
 * runtime中下载分组资源
 */
async function tryDownloadRuntimeRes(gNameArr) {
  const mainGroups = getMainGroupsName(gNameArr);
  const needDownGroups = mainGroups.filter(name => !resGroup[name].status);

  console.debug('tryDownloadRuntimeRes needDownGroups', needDownGroups);

  if (needDownGroups.length > 0) {
    await runtimeLoader(needDownGroups);
  }

  needDownGroups.forEach(name => resGroup[name].status = STATUS.READY);
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default {
  /**
   * 游戏启动的的时候调用，无UI
   *   native和runtime 预加载公司的slogan，和preload所需的UI界面
   *   h5 预加载preload所需的UI界面
   */
  async preload(groupsName) {
    console.log('preload', groupsName);
    const gNameArr = toArray(groupsName);

    function onProgress(percent) {
      console.debug('preload percent', percent);
    }
    await loadRes(gNameArr, onProgress);
    console.log('preload complete');
  },

  /**
   * @param {boolean} isEntry 是否是应用最开始的资源加载（和后面的UI不同）
   *    isEntry = true, native和runtime显示slogon
   *                    h5(wanba)显示玩吧标准的进度页面
   */
  async load(groupsName, isEntry = false) {
    console.log('load', groupsName);
    const gNameArr = toArray(groupsName);
    const scene = loaderScene(isEntry);

    if (cc.runtime) {
      await timeout(0);
      await tryDownloadRuntimeRes(gNameArr);
      console.log('tryDownloadRuntimeRes end');
    }

    await loadRes(gNameArr, scene.onProgress.bind(scene));
  },

  /**
   * 静默加载资源，没有加载画面，可用于临时加载资源
   */
  async silentLoad(groupsName) {
    await this.preload(groupsName);
  },

  release(groupsName) {
    console.log('release', groupsName);
    const gNameArr = toArray(groupsName);
    gNameArr.forEach(gName => {
      releaseOneGroup(gName);
    });

    setResLoadStatus(gNameArr, STATUS.LOADED);
  },
};
