export function setState(state) {
  return {
    meta: { disLocal: true },
    type: 'SET_STATE',
    state,
  };
}

export function buy(buyid) {
  return {
    type: 'BUY',
    buyid,
  };
}

export function skillLvlUp(heroid, skillIdx) {
  return {
    type: 'SKILL_LVL_UP',
    heroid,
    skillIdx,
  };
}

export function stepLvlUp(heroid) {
  return {
    type: 'STEP_LVL_UP',
    heroid,
  };
}

export function switchHero(heroid) {
  return {
    type: 'SWITCH_HERO',
    heroid,
  };
}

export function gainHero(heroid) {
  return {
    type: 'GAIN_HERO',
    heroid,
  };
}

/**
 * gain {object}
 */
export function gainSomething(gain) {
  return {
    type: 'GAIN_SOMETHING',
    gain,
  };
}

export function gameBeg() {
  return {
    type: 'GAME_BEG',
  };
}

export function gameEnd(gain) {
  return {
    type: 'GAME_END',
    gain,
  };
}

export function rmbLuckyDraw(gain) {
  return {
    type: 'RMB_LUCKY_DRAW',
    gain,
  };
}

export function getRankList(gain) {
  return {
    type: 'GET_RANK_LIST',
    gain,
  };
}

export function freshSta() {
  return {
    type: 'FRESH_STA',
  };
}

export function login(gain) {
  return {
    type: 'LOGIN',
    gain,
  };
}

export function useItem(gain) {
  return {
    type: 'USE_ITEM',
    gain,
  };
}

export function setName(gain) {
  return {
    type: 'SET_NAME',
    gain,
  };
}

export function setMission(gain) {
  return {
    type: 'SET_MISSION',
    gain,
  };
}

export function dayGift(gain, res) {
  return {
    type: 'DAY_GIFT',
    gain,
    res,
  };
}
