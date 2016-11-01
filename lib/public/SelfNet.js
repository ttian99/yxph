import fetch from '../es6-utils/cocos/fetch.js';
import cfg from '../constants';
const console = cfg.logger('Selfnet');
// import _ from 'lodash';

const SelfNet = {
  loading: null,
  /* gain ={openid, nick} */
  login(gain, cb) {
    gain.cmd = 'login';
    fetch(gain, (err, response) => {
      if (!err) {
        cb(null, response);
      } else {
        cb(err);
      }
    });
  },

  /** gain = {} **/
  getRankList(gain, cb, isFriendRank = false) {
    gain.cmd = 'world-rank';
    if (isFriendRank) gain.cmd = 'friend-rank';
    fetch(gain, (err, response) => {
      if (!err) {
        cb(null, response);
      } else {
        cb(err);
      }
    });
  },


  /* gain = {openid, nick, isGirl, face, score, coin, win, lose, tie} */
  gameEnd(gain, cb) {
    gain.cmd = 'game-end';
    fetch(gain, (err, data) => {
      if (!err) {
        cb && cb(null, data);
      } else {
        cb(err);
      }
    });
  },

  /** arr = [{item, coin, diam}]*/
  dayGift(prop, param, arr, cb) {
    param.openid = cfg.openid;
    param.openkey = cfg.openkey;
    param.os = cfg.os;
    param.ch = cfg.ch;
    param.cmd = 'day-gift';
    param.gain = JSON.stringify(arr);
    fetch(param, (err, response) => {
      if (!err) {
        response.type = param.type;
        prop.dayGift(arr, response);
        cb && cb(err, response);
      } else {
        cb && cb(err, response);
        console.log('net dayGift err !');
        if (err.indexOf('network_timeout') > 0) {
          this.renderTip('连接超时，请检查你的网络');
        }
      }
    });
  },
};

export default SelfNet;
