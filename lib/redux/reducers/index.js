import {setState, buy, skillLvlUp, stepLvlUp, switchHero, gainHero, gainSomething, gameBeg, gameEnd, rmbLuckyDraw, getRankList, freshSta, login, useItem, setName, setMission, dayGift, } from './core';
import {Map} from 'immutable';

function reducer(state = Map(), action) {
  switch (action.type) {
    case 'SET_STATE':
      return setState(state, action.state);
    case 'BUY':
      return buy(state, action.buyid);
    case 'SKILL_LVL_UP':
      return skillLvlUp(state, action.heroid, action.skillIdx);
    case 'STEP_LVL_UP':
      return stepLvlUp(state, action.heroid);
    case 'SWITCH_HERO':
      return switchHero(state, action.heroid);
    case 'GAIN_HERO':
      return gainHero(state, action.heroid);
    case 'GAIN_SOMETHING':
      return gainSomething(state, action.gain);
    case 'RMB_LUCKY_DRAW':
      return rmbLuckyDraw(state, action.gain);
    case 'GAME_BEG':
      return gameBeg(state);
    case 'GAME_END':
      return gameEnd(state, action.gain);
    case 'GET_RANK_LIST':
      return getRankList(state, action.gain);
    case 'FRESH_STA':
      return freshSta(state);
    case 'LOGIN':
      return login(state, action.gain);
    case 'USE_ITEM':
      return useItem(state, action.gain);
    case 'SET_NAME':
      return setName(state, action.gain);
    case 'SET_MISSION':
      return setMission(state, action.gain);
    case 'DAY_GIFT':
      return dayGift(state, action.gain, action.res);
    default:
      return state;
  }
}

export default reducer;
