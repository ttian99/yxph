/* global bows */

/**
 * 在模块内使用const console = cfg.logger('name'):
 *   PC浏览器环境下使用bows
 *   手机浏览器使用CocosLogger，可以手动开启bows（用于PC上模拟调试）
 *   Native和runtime使用CocosLogger
 *
 * 在模块外直接使用console:
 *   浏览器环境不做重载，使用默认的使用方式
 *   Native环境，重载了debug, info, warn, error方法，最终都使用console.log方法（除了log方法，其它方法支持多个参数传入，以及支持js object直接做为参数
 *
 * 日志上报到服务器
 *   采用bows的时候不支持日志上报（只在浏览器环境支持!cc.sys.isNative）
 */
import moment from 'moment';
import _ from 'lodash';
import s from 'underscore.string';
import util from 'util';
import cfg from '../../constants';

const opts = {
  useBows: !(cc.sys.isNative || cc.sys.isMobile),
  remoteUrl: null,
};

// 只会在PC chrome的情况下会用到
export function forceUseBowsLog() {
  opts.useBows = true;
}

export function setRemoteUrl(url) {
  opts.remoteUrl = url;
}

const loggerType = ['debug', 'info', 'log', 'warn', 'error'];

function timeStr() {
  return moment().format('HH:mm:ss.SSS');
}

function formatArgs(...args) {
  const rst = args.map(arg => {
    if (arg instanceof Error) {
      return arg.stack || arg.message || arg;
    } else if (_.isObject(arg)) {
      return util.format(arg);
    }
    return arg;
  });
  return rst.join(' ');
}

function output(type, mName, ...args) {
  // native环境
  const pre = mName + ':' + s.rpad(type, 6);
  if (cc && cc.sys.isNative) {
    // outputArgs(type, pre, ...args);
    if (cfg.DEBUG) {
      const ctime = timeStr();
      const clog = formatArgs(...args);
      console.log(`${pre}[${ctime}] ${clog}`);
    }
  } else {
    console[type](pre, ...args);
  }
}

const newConsole = {};
loggerType.forEach((type) => {
  newConsole[type] = (...args) => {
    output(type, 'global', ...args);
  };
});

if (cc && cc.sys.isNative) {
  // read-only at cocos env
  // console.log = newConsole.log;
  console.info = newConsole.info;
  console.debug = newConsole.debug;
  console.warn = newConsole.warn;
  console.error = newConsole.error;
}

class CocosLogger {
  constructor(mName) {
    this.mName = mName;

    loggerType.forEach(type => {
      this[type] = (...args) => {
        output(type, this.mName, ...args);
      };
    });
  }

  tabel = () => {};
}


function logger(mName) {
  if (opts.useBows && bows) {
    // _.compact这里是为了支持多个参数
    const log = bows(..._.compact(arguments));
    // 支持table方法，方便页面调试
    log.table = () => console.table.call(console, arguments);
    return log;
  }
  return new CocosLogger(mName);
}

export default logger;
