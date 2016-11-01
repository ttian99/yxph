/* global jest, describe, it, expect */
jest.autoMockOff();

const cfg = require('../../../constants');
cfg.init();
import {fromJS} from 'immutable';
const initState = require('../../../constants/initState');
const core = require('../core');

describe('application logic', () => {
  describe('buy', () => {
    it('buy itemid 0', () => {
      const buy = core.buy;
      const state = fromJS(initState);
      const nextState = buy(state, 0);

      // expect(nextState.toJSON()).toEqual({
      //   coin: 20,
      //   bag: [],
      // });

      // expect(nextState.equals(fromJS(initState))).toBe(true);
    });

    it('switch to exist hero', () => {
      const state = fromJS({
        curHero: 'pobaby',
        heroes: {
          pobaby: {},
          xy: {},
        },
      });
      const nextState = core.switchHero(state, 'xy');
      expect(nextState.equals(fromJS({
        curHero: 'xy',
        heroes: {
          pobaby: {},
          xy: {},
        },
      }))).toBe(true);
    });

    it('switch to unexist hero', () => {
      const state = fromJS({
        curHero: 'pobaby',
        heroes: {
          pobaby: {},
          xy: {},
        },
      });
      const nextState = core.switchHero(state, 'noxx');
      expect(nextState.equals(fromJS({
        curHero: 'pobaby',
        heroes: {
          pobaby: {},
          xy: {},
        },
      }))).toBe(true);
    });

    it('skill lvl up succ', () => {
      const state = fromJS({
        heroes: {
          pobaby: {s0Lvl: 0, s1Lvl: 0, s2Lvl: 1, s3Lvl: 2},
        },
        coin: 800,
      });
      const nextState = core.skillLvlUp(state, 'pobaby', 0);
      expect(nextState.equals(fromJS({
        heroes: {
          pobaby: {s0Lvl: 1, s1Lvl: 0, s2Lvl: 1, s3Lvl: 2},
        },
        coin: 700,
      }))).toBe(true);
    });

    it('skill lvl up on unexist hero', () => {
      const state = fromJS({
        heroes: {
          pobaby: {s0Lvl: 0, s1Lvl: 0, s2Lvl: 1, s3Lvl: 2},
        },
        coin: 800,
      });
      const nextState = core.skillLvlUp(state, 'pobabyxx', 0);
      expect(nextState.equals(fromJS({
        heroes: {
          pobaby: {s0Lvl: 0, s1Lvl: 0, s2Lvl: 1, s3Lvl: 2},
        },
        coin: 800,
      }))).toBe(true);
    });

    it('skill lvl up on unexist skillIdx', () => {
      const state = fromJS({
        heroes: {
          pobaby: {s0Lvl: 0, s1Lvl: 0, s2Lvl: 1, s3Lvl: 2},
        },
        coin: 800,
      });
      const nextState = core.skillLvlUp(state, 'pobaby', 4);
      expect(nextState.equals(fromJS({
        heroes: {
          pobaby: {s0Lvl: 0, s1Lvl: 0, s2Lvl: 1, s3Lvl: 2},
        },
        coin: 800,
      }))).toBe(true);
    });

    it('step lvl up succ', () => {
      const state = fromJS({
        heroes: {
          pobaby: {s0Lvl: 0, s1Lvl: 0, s2Lvl: 1, s3Lvl: 2, stepLvl: 0},
        },
        coin: 800,
      });
      const nextState = core.stepLvlUp(state, 'pobaby');
      expect(nextState.equals(fromJS({
        heroes: {
          pobaby: {s0Lvl: 0, s1Lvl: 0, s2Lvl: 1, s3Lvl: 2, stepLvl: 1},
        },
        coin: 600,
      }))).toBe(true);
    });

    it('step lvl up on unexist heroid', () => {
      const state = fromJS({
        heroes: {
          pobaby: {s0Lvl: 0, s1Lvl: 0, s2Lvl: 1, s3Lvl: 2, stepLvl: 1},
        },
        coin: 800,
      });
      const nextState = core.stepLvlUp(state, 'pobabyxx');
      expect(nextState.equals(fromJS({
        heroes: {
          pobaby: {s0Lvl: 0, s1Lvl: 0, s2Lvl: 1, s3Lvl: 2, stepLvl: 1},
        },
        coin: 800,
      }))).toBe(true);
    });

    it('gain hero succ', () => {
      const state = fromJS({
        curHero: 'pobaby',
        heroes: {
          pobaby: { s0Lvl: 0, s1Lvl: 0, s2Lvl: 0, s3Lvl: 0, stepLvl: 0 },
          xy: { s0Lvl: 0, s1Lvl: 0, s2Lvl: 0, s3Lvl: 0, stepLvl: 0 },
        },
        coin: 8880,
        bag: { 0: 30 },
      });

      const nextState = core.gainHero(state, 'bnz');
      expect(nextState.equals(fromJS({
        curHero: 'bnz',
        heroes: {
          pobaby: { s0Lvl: 0, s1Lvl: 0, s2Lvl: 0, s3Lvl: 0, stepLvl: 0 },
          xy: { s0Lvl: 0, s1Lvl: 0, s2Lvl: 0, s3Lvl: 0, stepLvl: 0 },
          bnz: { s0Lvl: 0, s1Lvl: 0, s2Lvl: 0, s3Lvl: 0, stepLvl: 0 },
        },
        coin: 8880,
        bag: { 0: 30 - cfg.hero.bnz.gain.price.num },
      }))).toBe(true);
    });

    it('gain here failed, have not enough coin', () => {
      const state = fromJS({
        curHero: 'pobaby',
        heroes: {
          pobaby: { s0Lvl: 0, s1Lvl: 0, s2Lvl: 0, s3Lvl: 0, stepLvl: 0 },
          xy: { s0Lvl: 0, s1Lvl: 0, s2Lvl: 0, s3Lvl: 0, stepLvl: 0 },
        },
        coin: 888,
        bag: { 0: 30 },
      });

      const nextState = core.gainHero(state, 'hfh');
      expect(nextState.equals(fromJS({
        curHero: 'pobaby',
        heroes: {
          pobaby: { s0Lvl: 0, s1Lvl: 0, s2Lvl: 0, s3Lvl: 0, stepLvl: 0 },
          xy: { s0Lvl: 0, s1Lvl: 0, s2Lvl: 0, s3Lvl: 0, stepLvl: 0 },
        },
        coin: 888,
        bag: { 0: 30 },
      }))).toBe(true);
    });

  });
});

