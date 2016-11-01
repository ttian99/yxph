import cfg from '../../constants';
import {Map} from 'immutable';
import {resFullSta, spendSta, addSta, addStaUpLimit, getCurrentSta} from './sta-utils';
import _ from 'lodash';

export function setState(state, newState) {
  return state.merge(newState);
}

const INIT_HEROINFO = {
  s0Lvl: 0,
  s1Lvl: 0,
  s2Lvl: 0,
  s3Lvl: 0,
  stepLvl: 0,
};

function changeStaOpts(state, rst) {
  let nextState = state;
  nextState = nextState.update('sta', () => rst.sta);
  nextState = nextState.update('lastNoFullStaTime', 0, () => rst.lastNoFullStaTime);
  nextState = nextState.update('resStaTime', 0, () => rst.resStaTime);
  if (rst.maxSta) {
    nextState = nextState.update('maxSta', 0, () => rst.maxSta);
  }
  return nextState;
}

// function updateWorldRank(state, score) {
//   let nextState = state;
//   let worldRank = nextState.getIn(['rankList', 'worldRanks'], []);
//   console.debug('========================worldRank : ' + JSON.stringify(worldRank));
//   let myInfo = _.find(worldRank, (obj) => obj.openid === cfg.openid);
//   if (myInfo) {
//     myInfo.weeklyScore = score;
//   } else if (worldRank[worldRank.length - 1].weeklyScore < score) {
//     myInfo = {
//       nick: cfg.nick,
//       face: cfg.face,
//       weeklyScore: score,
//       curHero: nextState.get('curHero'),
//       openid: cfg.openid,
//     };
//     worldRank.push(myInfo);
//   }
//   worldRank = _.sortByOrder(worldRank, ['weeklyScore'], ['desc']);
//   if (worldRank.length > 100) {
//     worldRank.pop();
//   }
//   nextState = nextState.updateIn(['rankList', 'worldRanks'], () => worldRank);
//   return nextState;
// }

export function freshSta(state) {
  let nextState = state;
  const rst = getCurrentSta(state.get('sta'), state.get('maxSta'), state.get('lastNoFullStaTime', 0));
  nextState = changeStaOpts(nextState, rst);
  return nextState;
}

function checkCanBuy(state, cy, price) {
  if (cy === 'rmb') return true;
  if (cy === 'coin' || cy === 'diam') {
    return (price <= state.get(cy));
  }
  if (cy === 'item') {
    const {itemid, num} = price;
    return (num <= state.getIn(['bag', String(itemid)], 0));
  }
}

export function buy(state, buyid) {
  const {cy, price, coin, diam, item, sta, fullSta, staUpLimit, gift} = cfg.buy[buyid];
  let nextState = state;
  if (checkCanBuy(state, cy, price)) {
    if (coin) {
      nextState = nextState.update('coin', count => count + coin);
    }
    if (diam) {
      nextState = nextState.update('diam', count => count + diam);
    }
    if (item) {
      const {itemid, num} = item;
      nextState = nextState.updateIn(['bag', String(itemid)], 0, count => count + num);
    }
    if (sta) {
      const rst = addSta(nextState.get('sta'), nextState.get('maxSta'), nextState.get('lastNoFullStaTime', 0), sta);
      nextState = changeStaOpts(nextState, rst);
    }
    if (staUpLimit) { // 增加体力上限
      const rst = addStaUpLimit(nextState.get('sta'), nextState.get('maxSta'), nextState.get('lastNoFullStaTime', 0), staUpLimit);
      nextState = changeStaOpts(nextState, rst);
    }
    if (fullSta) {
      const rst = resFullSta(nextState.get('sta'), nextState.get('maxSta'));
      nextState = changeStaOpts(nextState, rst);
    }
    if (gift && (typeof gift === 'object') ) {
      const giftid = cfg.buy[buyid].giftid;
      const isBuy = nextState.get(giftid, false);
      if (isBuy && giftid !== 'gift5') {
        return nextState;
      }
      nextState = nextState.update(giftid, () =>true);
      gift.forEach(obj =>{
        if (obj.item) {
          const {itemid, num} = obj.item;
          nextState = nextState.updateIn(['bag', String(itemid)], 0, count => count + num);
        }
        if (obj.coin) {
          nextState = nextState.update('coin', count => count + obj.coin);
        }
        if (obj.diam) {
          nextState = nextState.update('diam', count => count + obj.diam);
        }
        if (obj.hero) {
          const heroid = obj.hero;
          if (!state.hasIn(['heroes', heroid])) {
            nextState = nextState.setIn(['heroes', heroid], Map(INIT_HEROINFO));
          }
        }
      });
    }

    if (cy === 'coin' || cy === 'diam') {
      nextState = nextState.update(cy, count => count - price);
    } else if (cy === 'item') {
      const {itemid, num} = price;
      nextState = nextState.updateIn(['bag', String(itemid)], 0, count => count - num);
    }
  }
  return nextState;
}

export function switchHero(state, heroid) {
  let nextState = state;
  if (state.hasIn(['heroes', heroid])) {
    nextState = nextState.update('curHero', () => heroid);
  }
  return nextState;
}

export function skillLvlUp(state, heroid, skillIdx) {
  const skillPath = ['heroes', heroid, 's' + skillIdx + 'Lvl'];
  if (state.hasIn(skillPath)) {
    const maxLvl = cfg.hero[heroid].skillGrowCount;
    const curLvl = state.getIn(skillPath);
    if (curLvl < maxLvl) {
      const price = cfg.skillUpPrice[maxLvl][curLvl];
      if (price <= state.get('coin')) {
        return state.updateIn(skillPath, 0, lvl => lvl + 1)
                .update('coin', coin => coin - price);
      }
    }
  }
  return state;
}

export function stepLvlUp(state, heroid) {
  const stepPath = ['heroes', heroid, 'stepLvl'];
  if (state.hasIn(stepPath)) {
    const maxLvl = cfg.hero[heroid].stepGrowCount;
    const curLvl = state.getIn(stepPath);
    if (curLvl < maxLvl) {
      const price = cfg.stepUpPrice[maxLvl][curLvl];
      if (price <= state.get('coin')) {
        return state.updateIn(stepPath, 0, lvl => lvl + 1)
                  .update('coin', coin => coin - price);
      }
    }
  }
  return state;
}

export function gainHero(state, heroid) {
  if (state.hasIn(['heroes', heroid])) {
    console.error('this hero is exist', heroid);
    return state;
  }

  const {cy, price} = cfg.hero[heroid].gain;
  let nextState = state;
  if (cy === 'coin') {
    const coinNum = state.get('coin');
    if (price > coinNum) {
      console.error('coin is not enough', coinNum, price);
      return state;
    }
    nextState = state.set('coin', coinNum - price);
  } else if (cy === 'diam') {
    const diamNum = state.get('diam');
    if (price > diamNum) {
      console.error('diam is not enough', diamNum, price);
      return state;
    }
    nextState = state.set('diam', diamNum - price);
  } else if (cy === 'item') {
    const {itemid, num} = price;
    const itemNum = state.getIn(['bag', String(itemid)], 0);
    if (num > itemNum) {
      console.error('item is not enough', itemNum, num);
      return state;
    }
    nextState = state.setIn(['bag', String(itemid)], itemNum - num);
  }
  return nextState.set('curHero', heroid)
    .setIn(['heroes', heroid], Map(INIT_HEROINFO));
}

export function gainSomething(state, gain) {
  let nextState = state;
  if (gain.coin) {
    nextState = nextState.update('coin', 0, (coin) => coin + gain.coin);
  }

  if (gain.diam) {
    nextState = nextState.update('diam', 0, (diam) => diam + gain.diam);
  }

  if (gain.item) {
    nextState = nextState.updateIn(['bag', String(gain.item.itemid)], 0, (num) => num + gain.item.num);
  }

  return nextState;
}

export function useItem(state, gain) {
  let nextState = state;
  const itemNum = nextState.getIn(['bag', String(gain.itemid)], 0);
  const useNum = gain.itemNum || 1;
  if (itemNum < useNum) {
    console.error('item is not enough', itemNum, useNum);
    return state;
  }
  nextState = nextState.updateIn(['bag', String(gain.itemid)], 0, (num) => num - useNum);
  return nextState;
}

export function rmbLuckyDraw(state, gain) {
  if (!_.isArray(gain)) {
    console.error('data is not array!');
    return state;
  }
  let nextState = state;
  const useKeyNum = gain.length;
  const keyNum = nextState.getIn(['bag', '20'], 0);
  // 处理钥匙或者元宝数量
  if (keyNum >= useKeyNum) {
    nextState = nextState.updateIn(['bag', '20'], 0, (num) => num - useKeyNum);
  } else {
    const diamNum = nextState.get('diam', 0);
    const useDiamNum = (useKeyNum === 1) ? (cfg.buy['300'].price) : (cfg.buy['301'].price);
    console.debug('diamNum : ' + diamNum);
    console.debug('useDiamNum : ' + useDiamNum);
    if (diamNum < useDiamNum) {
      console.error('diam is not enough!');
      return nextState;
    }
    nextState = nextState.update('diam', (num) => num - useDiamNum);
  }
  // 增加抽出的物品
  gain.forEach((obj) =>{
    nextState = gainSomething(nextState, obj);
  });
  return nextState;
}

// 游戏结算获得过关奖励
// 扣除体力
export function gameEnd(state, gain) {
  let nextState = state;
  if (gain.score) {
    nextState = nextState.update('bestScore', 0, bestScore => gain.score > bestScore ? gain.score : bestScore);
  }

  if (gain.score) {
    // if (gain.score > nextState.get('weeklyScore', 0)) {
    //   nextState = updateWorldRank(nextState, gain.score);
    // }
    nextState = nextState.update('weeklyScore', 0, weeklyScore => gain.score > weeklyScore ? gain.score : weeklyScore);
  }

  if (gain.mostEliminate) {
    nextState = nextState.update('mostEliminate', 0, mostEliminate => gain.mostEliminate > mostEliminate ? gain.mostEliminate : mostEliminate);
  }

  if (gain.mostDays) {
    nextState = nextState.update('mostDays', 0, mostDays => gain.mostDays > mostDays ? gain.mostDays : mostDays);
  }

  nextState = nextState.update('gameEndTimes', 0, times => times + 1);
  return gainSomething(nextState, gain);
}

export function gameBeg(state) {
  let nextState = state;
  nextState = freshSta(state);
  const rst = spendSta(nextState.get('sta'), nextState.get('maxSta'), nextState.get('lastNoFullStaTime', 0), cfg.comm.SPEND_STA_STAGE);
  nextState = changeStaOpts(nextState, rst);
  if (rst.isNotEnough) {
    console.error('sta not enough!');
  }
  return nextState;
}

const initRank = [{nick: cfg.nick, face: cfg.face, weeklyScore: 0, curHero: 'pobaby', openid: cfg.openid}];

export function getRankList(state, gain) {
  let nextState = state;
  if (gain.nextfreshRankTimer) {
    nextState = nextState.updateIn(['rankList', 'nextfreshRankTimer'], () =>gain.nextfreshRankTimer);
  }
  if (gain.cmd === 'world-rank') {
    if (gain.rank && gain.rank.length > 0) {
      nextState = nextState.setIn(['rankList', 'worldRanks'], gain.rank);
    } else {
      initRank.weeklyScore = nextState.get('weeklyScore', 0);
      initRank.curHero = nextState.get('curHero');
      nextState = nextState.setIn(['rankList', 'worldRanks'], initRank);
    }
  } else if (gain.cmd === 'friend-rank') {
    if (gain.rank && gain.rank.length > 0) {
      nextState = nextState.setIn(['rankList', 'friendRanks'], gain.rank);
    } else {
      initRank.weeklyScore = nextState.get('weeklyScore', 0);
      initRank.curHero = nextState.get('curHero');
      nextState = nextState.setIn(['rankList', 'friendRanks'], initRank);
    }
  }
  return nextState;
}

export function login(state, gain) {
  let nextState = state;
  if (gain.msg && cfg.isNet) {
    nextState = nextState.update('sta', () => gain.sta);
    nextState = nextState.update('maxSta', () => gain.maxSta);
    nextState = nextState.update('lastNoFullStaTime', () => gain.lastNoFullStaTime);
    nextState = nextState.update('nick', () => gain.nick);
    nextState = nextState.update('face', () => gain.face);
    nextState = nextState.update('gameEndTimes', () => gain.gameEndCount);
    nextState = nextState.update('curHero', () => gain.curHero);
    nextState = nextState.update('mission', () => gain.mission);

    // 处理英雄对象
    nextState = nextState.delete('heroes');
    nextState = nextState.set('heroes', Map());
    gain.heroes.forEach((obj) =>{
      const uni = obj.id;
      const heroids = Reflect.ownKeys(cfg.hero);
      heroids.forEach((id) => {
        if (cfg.hero[id].uni === uni) {
          nextState = nextState.setIn(['heroes', id], Map(obj));
        }
      });
    });

    // 处理背包对象
    nextState = nextState.delete('bag');
    nextState = nextState.set('bag', Map());
    gain.bag.forEach((obj) => {
      const id = obj.id;
      nextState = nextState.setIn(['bag', String(id)], obj.num);
    });

    nextState = nextState.update('coin', () => gain.coin);
    nextState = nextState.update('diam', () => gain.diam);

    nextState = nextState.update('bestScore', () => gain.bestScore);
    nextState = nextState.update('weeklyScore', () => gain.weeklyScore);
    nextState = nextState.update('mostEliminate', () => gain.mostEliminate);
    nextState = nextState.update('mostDays', () => gain.mostDays);
    nextState = nextState.set('gift1', gain.gift1);
    nextState = nextState.set('gift2', gain.gift2);
    nextState = nextState.set('gift3', gain.gift3);
    nextState = nextState.set('gift4', gain.gift4);
    nextState = nextState.set('gift5', gain.gift5);
  } else if (!cfg.isNet) {
    // 初始化排行榜
    initRank.weeklyScore = nextState.get('weeklyScore', 0);
    initRank.curHero = nextState.get('curHero');
    nextState = nextState.setIn(['rankList', 'worldRanks'], initRank);
    nextState = nextState.setIn(['rankList', 'friendRanks'], initRank);
  }
  nextState = freshSta(nextState);
  cc.sys.localStorage.setItem('mission', nextState.get('mission'));
  return nextState;
}

export function setName(state, gain) {
  let nextState = state;
  nextState = nextState.update('nick', () => gain.nick);
  nextState = nextState.update('face', () => gain.face);
  return nextState;
}

export function setMission(state, gain) {
  let nextState = state;
  nextState = nextState.update('mission', () => gain.mission);
  return nextState;
}

export function dayGift(state, gain, res) {
  if (!_.isArray(gain)) {
    console.error('data is not array!');
    return state;
  }
  console.log('--------- res -------------');
  console.log(JSON.stringify(res));
  let nextState = state;
  nextState = nextState.update('haveDayGift', () => res.haveDayGift);
  nextState = nextState.update('getGiftDaies', () => res.getGiftDaies);
  console.log('------------ res.type --------' + res.type);
  if (res.type === 'getDayGift') {    
    // 增加得到的物品
    gain.forEach((obj) =>{
      nextState = gainSomething(nextState, obj);
    });
  }
  return nextState;
}