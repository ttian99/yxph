/* global jest, describe, it, expect */
jest.autoMockOff();

const cfg = require('../../../constants');
cfg.init();

import {fromJS} from 'immutable';
const reducer = require('../index');

describe('reducer', () => {
  it('handles buy', () => {
    const state = fromJS({
      coin: 100,
      bag: [{id: 0, num: 1}],
    });
    const action = { type: 'BUY', buyid: 0 };
    const nextState = reducer(state, action);
    expect(nextState.equals(fromJS({
      coin: 20,
      bag: [{id: 0, num: 1}],
    }))).toBe(true);
  });

  it('handles skillLvlUp', () => {
    const state = fromJS({
      heroes: {
        pobaby: { s0Lvl: 0, s1Lvl: 1, s2Lvl: 2, s3Lvl: 3 },
      },
      coin: 5000,
    });

    const actions = [
      { type: 'SKILL_LVL_UP', heroid: 'pobaby', skillIdx: 0 },
      { type: 'SKILL_LVL_UP', heroid: 'pobaby', skillIdx: 0 },
      { type: 'SKILL_LVL_UP', heroid: 'pobaby', skillIdx: 0 },
      { type: 'SKILL_LVL_UP', heroid: 'pobaby', skillIdx: 0 },
      { type: 'SKILL_LVL_UP', heroid: 'pobaby', skillIdx: 0 },
      { type: 'SKILL_LVL_UP', heroid: 'pobaby', skillIdx: 0 },
    ];

    const nextState = actions.reduce(reducer, state);
    expect(nextState.equals(fromJS({
      heroes: {
        pobaby: { s0Lvl: 5, s1Lvl: 1, s2Lvl: 2, s3Lvl: 3 },
      },
      coin: 5000 - 4350,
    }))).toBe(true);
  });

  it('handles stepLvlUp', () => {
    const state = fromJS({
      heroes: {
        pobaby: { s0Lvl: 0, s1Lvl: 1, s2Lvl: 2, s3Lvl: 3, stepLvl: 0 },
      },
      coin: 168700,
    });

    const actions = [
      { type: 'STEP_LVL_UP', heroid: 'pobaby' },
      { type: 'STEP_LVL_UP', heroid: 'pobaby' },
      { type: 'STEP_LVL_UP', heroid: 'pobaby' },
      { type: 'STEP_LVL_UP', heroid: 'pobaby' },
      { type: 'STEP_LVL_UP', heroid: 'pobaby' },
      { type: 'STEP_LVL_UP', heroid: 'pobaby' },
      { type: 'STEP_LVL_UP', heroid: 'pobaby' },
      { type: 'STEP_LVL_UP', heroid: 'pobaby' },
    ];

    const nextState = actions.reduce(reducer, state);
    expect(nextState.equals(fromJS({
      heroes: {
        pobaby: { s0Lvl: 0, s1Lvl: 1, s2Lvl: 2, s3Lvl: 3, stepLvl: 8 },
      },
      coin: 0,
    }))).toBe(true);
  });
});
