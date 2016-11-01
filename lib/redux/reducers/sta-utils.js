import cfg from '../../constants';
import moment from 'moment';

/**
 * 主要有四个参数
 *   sta - 体力数
 *   maxSta - 最大体力数
 *   lastNoFullStaTime - 最近体力未满的时间(Date)，体力满的时候为0
 *   resStaTime - 距离恢复下一点体力所需时间(s)，如果当前体力满则为0
 * 主要配置参数
 *   RES_STA_INTERVAL - 恢复一点体力的间隔时间
 */

/**
 * 获取当前的体力值
 * @param {Number} sta
 * @param {Number} maxSta
 * @param {Date} lastNoFullStaTime
 *
 * @return
 *   sta
 *   lastNoFullStaTime
 *   resStaTime
 *
 * @step
 *   1. 先判断lastNoFullStaTime是否为0
 *   2. 计算当前时间和lastNoFullStaTime的差值，如果 > RES_STA_INTERVAL，则sta增加，并重新计算lastNoFullStaTime
 *   3. 判断sta >= maxSta，如果为真则lastNoFullStaTime置0，且sta = maxSta
 */
export function getCurrentSta(sta, maxSta, lastNoFullStaTime) {
  const rst = { sta: sta, lastNoFullStaTime: lastNoFullStaTime || 0, resStaTime: 0, maxSta: maxSta};
  if (lastNoFullStaTime && lastNoFullStaTime.valueOf() !== 0) {
    const diff = moment().diff(moment(lastNoFullStaTime), 'seconds');
    const tryResNum = Math.floor(diff / cfg.comm.RES_STA_INTERVAL);

    if (sta + tryResNum > maxSta) {
      rst.sta = maxSta;
      rst.lastNoFullStaTime = 0;
    } else if (tryResNum > 0) {
      rst.sta += tryResNum;
      rst.lastNoFullStaTime = moment(lastNoFullStaTime).add(tryResNum * cfg.comm.RES_STA_INTERVAL, 'seconds').toDate();
      rst.resStaTime = cfg.comm.RES_STA_INTERVAL - diff % cfg.comm.RES_STA_INTERVAL;
    } else {
      rst.resStaTime = cfg.comm.RES_STA_INTERVAL - diff;
    }
  }
  return rst;
}

/**
 * @note
 *   用于冒险模式，游戏结束获得新记录
 *   用于购买体力
 */
export function addSta(sta, maxSta, lastNoFullStaTime, addNum) {
  const rst = getCurrentSta(sta, maxSta, lastNoFullStaTime);
  rst.sta += addNum;
  if (rst.sta > maxSta) {
    rst.sta = maxSta;
    rst.lastNoFullStaTime = 0;
    rst.resStaTime = 0;
  }
  return rst;
}

/**
 * 增加体力上限
 */
export function addStaUpLimit(sta, maxSta, lastNoFullStaTime, addNum) {
  const maxStaTemp = maxSta + addNum;
  let lastNoFullStaTimeTemp = lastNoFullStaTime;
  if (!lastNoFullStaTime || lastNoFullStaTime.valueOf() === 0) {
    lastNoFullStaTimeTemp = moment().toDate();
  }
  const rst = getCurrentSta(sta, maxStaTemp, lastNoFullStaTimeTemp);
  return rst;
}

/**
 * @note
 *   用于游戏开始消耗体力
 */
export function spendSta(sta, maxSta, lastNoFullStaTime, spendNum) {
  const rst = getCurrentSta(sta, maxSta, lastNoFullStaTime);
  if (rst.sta < spendNum) {
    rst.isNotEnough = true;
  } else if (rst.sta === maxSta) {
    rst.sta -= spendNum;
    rst.lastNoFullStaTime = moment().toDate();
    rst.resStaTime = cfg.comm.RES_STA_INTERVAL;
  } else {
    rst.sta -= spendNum;
  }
  return rst;
}

/**
 * 恢复全量体力
 */
export function resFullSta(sta, maxSta) {
  return { sta: maxSta, lastNoFullStaTime: 0, resStaTime: 0, maxSta: maxSta };
}
