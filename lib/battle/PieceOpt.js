import {resIn} from '../loader/resource.js';
import BattleData from './BattleData.js';

export const PieceType = {
  JIANG: '将',
  SHI: '士',
  XIANG: '相',
  CHE: '车',
  MA: '马',
  PAO: '炮',
  BING: '兵',
};

export const ColorType = {
  RED: '红',
  BLACK: '黑',
};

// 棋盘根据座位id为1的绑定视角和棋子id
export function getInitData(id) {
  let dt;
  if (BattleData.getRedSide() === 1) {
    dt = [
      { x: 5, y: 10, cl: ColorType.BLACK, re: resIn.piece.Ltc_XQ_Bshuai, se: resIn.piece.Ltc_XQ_Bshuai_selected, te: resIn.piece.Ltc_XQ_Bshuai_eat, tp: PieceType.JIANG }, // 将                0
      { x: 4, y: 10, cl: ColorType.BLACK, re: resIn.piece.Ltc_XQ_Bshi, se: resIn.piece.Ltc_XQ_Bshi_selected, te: resIn.piece.Ltc_XQ_Bshi_eat, tp: PieceType.SHI },         // 6路士             1
      { x: 6, y: 10, cl: ColorType.BLACK, re: resIn.piece.Ltc_XQ_Bshi, se: resIn.piece.Ltc_XQ_Bshi_selected, te: resIn.piece.Ltc_XQ_Bshi_eat, tp: PieceType.SHI },         // 4路士             2
      { x: 3, y: 10, cl: ColorType.BLACK, re: resIn.piece.Ltc_XQ_Bxiang, se: resIn.piece.Ltc_XQ_Bxiang_selected, te: resIn.piece.Ltc_XQ_Bxiang_eat, tp: PieceType.XIANG }, // 7路象             3
      { x: 7, y: 10, cl: ColorType.BLACK, re: resIn.piece.Ltc_XQ_Bxiang, se: resIn.piece.Ltc_XQ_Bxiang_selected, te: resIn.piece.Ltc_XQ_Bxiang_eat, tp: PieceType.XIANG }, // 3路象             4
      { x: 2, y: 10, cl: ColorType.BLACK, re: resIn.piece.Ltc_XQ_Bma, se: resIn.piece.Ltc_XQ_Bma_selected, te: resIn.piece.Ltc_XQ_Bma_eat, tp: PieceType.MA },             // 8路馬             5
      { x: 8, y: 10, cl: ColorType.BLACK, re: resIn.piece.Ltc_XQ_Bma, se: resIn.piece.Ltc_XQ_Bma_selected, te: resIn.piece.Ltc_XQ_Bma_eat, tp: PieceType.MA },             // 2路馬             6
      { x: 1, y: 10, cl: ColorType.BLACK, re: resIn.piece.Ltc_XQ_Bche, se: resIn.piece.Ltc_XQ_Bche_selected, te: resIn.piece.Ltc_XQ_Bche_eat, tp: PieceType.CHE },         // 9路車             7
      { x: 9, y: 10, cl: ColorType.BLACK, re: resIn.piece.Ltc_XQ_Bche, se: resIn.piece.Ltc_XQ_Bche_selected, te: resIn.piece.Ltc_XQ_Bche_eat, tp: PieceType.CHE },         // 1路車             8
      { x: 2, y: 8, cl: ColorType.BLACK, re: resIn.piece.Ltc_XQ_Bpao, se: resIn.piece.Ltc_XQ_Bpao_selected, te: resIn.piece.Ltc_XQ_Bpao_eat, tp: PieceType.PAO },          // 8路炮             9
      { x: 8, y: 8, cl: ColorType.BLACK, re: resIn.piece.Ltc_XQ_Bpao, se: resIn.piece.Ltc_XQ_Bpao_selected, te: resIn.piece.Ltc_XQ_Bpao_eat, tp: PieceType.PAO },          // 2路炮             10
      { x: 1, y: 7, cl: ColorType.BLACK, re: resIn.piece.Ltc_XQ_Bbing, se: resIn.piece.Ltc_XQ_Bbing_selected, te: resIn.piece.Ltc_XQ_Bbing_eat, tp: PieceType.BING },      // 9路卒             11
      { x: 3, y: 7, cl: ColorType.BLACK, re: resIn.piece.Ltc_XQ_Bbing, se: resIn.piece.Ltc_XQ_Bbing_selected, te: resIn.piece.Ltc_XQ_Bbing_eat, tp: PieceType.BING },      // 7路卒             12
      { x: 5, y: 7, cl: ColorType.BLACK, re: resIn.piece.Ltc_XQ_Bbing, se: resIn.piece.Ltc_XQ_Bbing_selected, te: resIn.piece.Ltc_XQ_Bbing_eat, tp: PieceType.BING },      // 5路卒             13
      { x: 7, y: 7, cl: ColorType.BLACK, re: resIn.piece.Ltc_XQ_Bbing, se: resIn.piece.Ltc_XQ_Bbing_selected, te: resIn.piece.Ltc_XQ_Bbing_eat, tp: PieceType.BING },      // 3路卒             14
      { x: 9, y: 7, cl: ColorType.BLACK, re: resIn.piece.Ltc_XQ_Bbing, se: resIn.piece.Ltc_XQ_Bbing_selected, te: resIn.piece.Ltc_XQ_Bbing_eat, tp: PieceType.BING },      // 1路卒             15
      { x: 5, y: 1, cl: ColorType.RED, re: resIn.piece.Ltc_XQ_Rshuai, se: resIn.piece.Ltc_XQ_Rshuai_selected, te: resIn.piece.Ltc_XQ_Rshuai_eat, tp: PieceType.JIANG },    // 帅                16
      { x: 4, y: 1, cl: ColorType.RED, re: resIn.piece.Ltc_XQ_Rshi, se: resIn.piece.Ltc_XQ_Rshi_selected, te: resIn.piece.Ltc_XQ_Rshi_eat, tp: PieceType.SHI },            // 4路仕             17
      { x: 6, y: 1, cl: ColorType.RED, re: resIn.piece.Ltc_XQ_Rshi, se: resIn.piece.Ltc_XQ_Rshi_selected, te: resIn.piece.Ltc_XQ_Rshi_eat, tp: PieceType.SHI },       // 6路仕             18
      { x: 3, y: 1, cl: ColorType.RED, re: resIn.piece.Ltc_XQ_Rxiang, se: resIn.piece.Ltc_XQ_Rxiang_selected, te: resIn.piece.Ltc_XQ_Rxiang_eat, tp: PieceType.XIANG },   // 3路相             19
      { x: 7, y: 1, cl: ColorType.RED, re: resIn.piece.Ltc_XQ_Rxiang, se: resIn.piece.Ltc_XQ_Rxiang_selected, te: resIn.piece.Ltc_XQ_Rxiang_eat, tp: PieceType.XIANG },   // 7路相             20
      { x: 2, y: 1, cl: ColorType.RED, re: resIn.piece.Ltc_XQ_Rma, se: resIn.piece.Ltc_XQ_Rma_selected, te: resIn.piece.Ltc_XQ_Rma_eat, tp: PieceType.MA },         // 2路马             21
      { x: 8, y: 1, cl: ColorType.RED, re: resIn.piece.Ltc_XQ_Rma, se: resIn.piece.Ltc_XQ_Rma_selected, te: resIn.piece.Ltc_XQ_Rma_eat, tp: PieceType.MA },         // 8路马             22
      { x: 1, y: 1, cl: ColorType.RED, re: resIn.piece.Ltc_XQ_Rche, se: resIn.piece.Ltc_XQ_Rche_selected, te: resIn.piece.Ltc_XQ_Rche_eat, tp: PieceType.CHE },       // 1路车             23
      { x: 9, y: 1, cl: ColorType.RED, re: resIn.piece.Ltc_XQ_Rche, se: resIn.piece.Ltc_XQ_Rche_selected, te: resIn.piece.Ltc_XQ_Rche_eat, tp: PieceType.CHE },       // 9路车             24
      { x: 2, y: 3, cl: ColorType.RED, re: resIn.piece.Ltc_XQ_Rpao, se: resIn.piece.Ltc_XQ_Rpao_selected, te: resIn.piece.Ltc_XQ_Rpao_eat, tp: PieceType.PAO },       // 2路炮             25
      { x: 8, y: 3, cl: ColorType.RED, re: resIn.piece.Ltc_XQ_Rpao, se: resIn.piece.Ltc_XQ_Rpao_selected, te: resIn.piece.Ltc_XQ_Rpao_eat, tp: PieceType.PAO },       // 8路炮             26
      { x: 1, y: 4, cl: ColorType.RED, re: resIn.piece.Ltc_XQ_Rbing, se: resIn.piece.Ltc_XQ_Rbing_selected, te: resIn.piece.Ltc_XQ_Rbing_eat, tp: PieceType.BING },     // 1路兵             27
      { x: 3, y: 4, cl: ColorType.RED, re: resIn.piece.Ltc_XQ_Rbing, se: resIn.piece.Ltc_XQ_Rbing_selected, te: resIn.piece.Ltc_XQ_Rbing_eat, tp: PieceType.BING },     // 3路兵             28
      { x: 5, y: 4, cl: ColorType.RED, re: resIn.piece.Ltc_XQ_Rbing, se: resIn.piece.Ltc_XQ_Rbing_selected, te: resIn.piece.Ltc_XQ_Rbing_eat, tp: PieceType.BING },     // 5路兵             29
      { x: 7, y: 4, cl: ColorType.RED, re: resIn.piece.Ltc_XQ_Rbing, se: resIn.piece.Ltc_XQ_Rbing_selected, te: resIn.piece.Ltc_XQ_Rbing_eat, tp: PieceType.BING },     // 7路兵             30
      { x: 9, y: 4, cl: ColorType.RED, re: resIn.piece.Ltc_XQ_Rbing, se: resIn.piece.Ltc_XQ_Rbing_selected, te: resIn.piece.Ltc_XQ_Rbing_eat, tp: PieceType.BING },     // 9路兵             31
    ];
  } else {
    dt = [
      { x: 5, y: 10, cl: ColorType.RED, re: resIn.piece.Ltc_XQ_Rshuai, se: resIn.piece.Ltc_XQ_Rshuai_selected, te: resIn.piece.Ltc_XQ_Rshuai_eat, tp: PieceType.JIANG },   // 帅                0
      { x: 4, y: 10, cl: ColorType.RED, re: resIn.piece.Ltc_XQ_Rshi, se: resIn.piece.Ltc_XQ_Rshi_selected, te: resIn.piece.Ltc_XQ_Rshi_eat, tp: PieceType.SHI },       // 4路仕             1
      { x: 6, y: 10, cl: ColorType.RED, re: resIn.piece.Ltc_XQ_Rshi, se: resIn.piece.Ltc_XQ_Rshi_selected, te: resIn.piece.Ltc_XQ_Rshi_eat, tp: PieceType.SHI },       // 6路仕             2
      { x: 3, y: 10, cl: ColorType.RED, re: resIn.piece.Ltc_XQ_Rxiang, se: resIn.piece.Ltc_XQ_Rxiang_selected, te: resIn.piece.Ltc_XQ_Rxiang_eat, tp: PieceType.XIANG },   // 3路相             3
      { x: 7, y: 10, cl: ColorType.RED, re: resIn.piece.Ltc_XQ_Rxiang, se: resIn.piece.Ltc_XQ_Rxiang_selected, te: resIn.piece.Ltc_XQ_Rxiang_eat, tp: PieceType.XIANG },   // 7路相             4
      { x: 2, y: 10, cl: ColorType.RED, re: resIn.piece.Ltc_XQ_Rma, se: resIn.piece.Ltc_XQ_Rma_selected, te: resIn.piece.Ltc_XQ_Rma_eat, tp: PieceType.MA },         // 2路马             5
      { x: 8, y: 10, cl: ColorType.RED, re: resIn.piece.Ltc_XQ_Rma, se: resIn.piece.Ltc_XQ_Rma_selected, te: resIn.piece.Ltc_XQ_Rma_eat, tp: PieceType.MA },         // 8路马             6
      { x: 1, y: 10, cl: ColorType.RED, re: resIn.piece.Ltc_XQ_Rche, se: resIn.piece.Ltc_XQ_Rche_selected, te: resIn.piece.Ltc_XQ_Rche_eat, tp: PieceType.CHE },       // 1路车             7
      { x: 9, y: 10, cl: ColorType.RED, re: resIn.piece.Ltc_XQ_Rche, se: resIn.piece.Ltc_XQ_Rche_selected, te: resIn.piece.Ltc_XQ_Rche_eat, tp: PieceType.CHE },       // 9路车             8
      { x: 2, y: 8, cl: ColorType.RED, re: resIn.piece.Ltc_XQ_Rpao, se: resIn.piece.Ltc_XQ_Rpao_selected, te: resIn.piece.Ltc_XQ_Rpao_eat, tp: PieceType.PAO },        // 2路炮             9
      { x: 8, y: 8, cl: ColorType.RED, re: resIn.piece.Ltc_XQ_Rpao, se: resIn.piece.Ltc_XQ_Rpao_selected, te: resIn.piece.Ltc_XQ_Rpao_eat, tp: PieceType.PAO },        // 8路炮             10
      { x: 1, y: 7, cl: ColorType.RED, re: resIn.piece.Ltc_XQ_Rbing, se: resIn.piece.Ltc_XQ_Rbing_selected, te: resIn.piece.Ltc_XQ_Rbing_eat, tp: PieceType.BING },      // 1路兵             11
      { x: 3, y: 7, cl: ColorType.RED, re: resIn.piece.Ltc_XQ_Rbing, se: resIn.piece.Ltc_XQ_Rbing_selected, te: resIn.piece.Ltc_XQ_Rbing_eat, tp: PieceType.BING },      // 3路兵             12
      { x: 5, y: 7, cl: ColorType.RED, re: resIn.piece.Ltc_XQ_Rbing, se: resIn.piece.Ltc_XQ_Rbing_selected, te: resIn.piece.Ltc_XQ_Rbing_eat, tp: PieceType.BING },      // 5路兵             13
      { x: 7, y: 7, cl: ColorType.RED, re: resIn.piece.Ltc_XQ_Rbing, se: resIn.piece.Ltc_XQ_Rbing_selected, te: resIn.piece.Ltc_XQ_Rbing_eat, tp: PieceType.BING },      // 7路兵             14
      { x: 9, y: 7, cl: ColorType.RED, re: resIn.piece.Ltc_XQ_Rbing, se: resIn.piece.Ltc_XQ_Rbing_selected, te: resIn.piece.Ltc_XQ_Rbing_eat, tp: PieceType.BING },      // 9路兵             15
      { x: 5, y: 1, cl: ColorType.BLACK, re: resIn.piece.Ltc_XQ_Bshuai, se: resIn.piece.Ltc_XQ_Bshuai_selected, te: resIn.piece.Ltc_XQ_Bshuai_eat, tp: PieceType.JIANG },  // 将                16
      { x: 4, y: 1, cl: ColorType.BLACK, re: resIn.piece.Ltc_XQ_Bshi, se: resIn.piece.Ltc_XQ_Bshi_selected, te: resIn.piece.Ltc_XQ_Bshi_eat, tp: PieceType.SHI },      // 6路士             17
      { x: 6, y: 1, cl: ColorType.BLACK, re: resIn.piece.Ltc_XQ_Bshi, se: resIn.piece.Ltc_XQ_Bshi_selected, te: resIn.piece.Ltc_XQ_Bshi_eat, tp: PieceType.SHI },      // 4路士             18
      { x: 3, y: 1, cl: ColorType.BLACK, re: resIn.piece.Ltc_XQ_Bxiang, se: resIn.piece.Ltc_XQ_Bxiang_selected, te: resIn.piece.Ltc_XQ_Bxiang_eat, tp: PieceType.XIANG },  // 7路象             19
      { x: 7, y: 1, cl: ColorType.BLACK, re: resIn.piece.Ltc_XQ_Bxiang, se: resIn.piece.Ltc_XQ_Bxiang_selected, te: resIn.piece.Ltc_XQ_Bxiang_eat, tp: PieceType.XIANG },  // 3路象             20
      { x: 2, y: 1, cl: ColorType.BLACK, re: resIn.piece.Ltc_XQ_Bma, se: resIn.piece.Ltc_XQ_Bma_selected, te: resIn.piece.Ltc_XQ_Bma_eat, tp: PieceType.MA },        // 8路馬             21
      { x: 8, y: 1, cl: ColorType.BLACK, re: resIn.piece.Ltc_XQ_Bma, se: resIn.piece.Ltc_XQ_Bma_selected, te: resIn.piece.Ltc_XQ_Bma_eat, tp: PieceType.MA },        // 2路馬             22
      { x: 1, y: 1, cl: ColorType.BLACK, re: resIn.piece.Ltc_XQ_Bche, se: resIn.piece.Ltc_XQ_Bche_selected, te: resIn.piece.Ltc_XQ_Bche_eat, tp: PieceType.CHE },      // 9路車             23
      { x: 9, y: 1, cl: ColorType.BLACK, re: resIn.piece.Ltc_XQ_Bche, se: resIn.piece.Ltc_XQ_Bche_selected, te: resIn.piece.Ltc_XQ_Bche_eat, tp: PieceType.CHE },      // 1路車             24
      { x: 2, y: 3, cl: ColorType.BLACK, re: resIn.piece.Ltc_XQ_Bpao, se: resIn.piece.Ltc_XQ_Bpao_selected, te: resIn.piece.Ltc_XQ_Bpao_eat, tp: PieceType.PAO },      // 8路炮             25
      { x: 8, y: 3, cl: ColorType.BLACK, re: resIn.piece.Ltc_XQ_Bpao, se: resIn.piece.Ltc_XQ_Bpao_selected, te: resIn.piece.Ltc_XQ_Bpao_eat, tp: PieceType.PAO },      // 2路炮             26
      { x: 1, y: 4, cl: ColorType.BLACK, re: resIn.piece.Ltc_XQ_Bbing, se: resIn.piece.Ltc_XQ_Bbing_selected, te: resIn.piece.Ltc_XQ_Bbing_eat, tp: PieceType.BING },    // 9路卒             27
      { x: 3, y: 4, cl: ColorType.BLACK, re: resIn.piece.Ltc_XQ_Bbing, se: resIn.piece.Ltc_XQ_Bbing_selected, te: resIn.piece.Ltc_XQ_Bbing_eat, tp: PieceType.BING },    // 7路卒             28
      { x: 5, y: 4, cl: ColorType.BLACK, re: resIn.piece.Ltc_XQ_Bbing, se: resIn.piece.Ltc_XQ_Bbing_selected, te: resIn.piece.Ltc_XQ_Bbing_eat, tp: PieceType.BING },    // 5路卒             29
      { x: 7, y: 4, cl: ColorType.BLACK, re: resIn.piece.Ltc_XQ_Bbing, se: resIn.piece.Ltc_XQ_Bbing_selected, te: resIn.piece.Ltc_XQ_Bbing_eat, tp: PieceType.BING },    // 3路卒             30
      { x: 9, y: 4, cl: ColorType.BLACK, re: resIn.piece.Ltc_XQ_Bbing, se: resIn.piece.Ltc_XQ_Bbing_selected, te: resIn.piece.Ltc_XQ_Bbing_eat, tp: PieceType.BING },    // 1路卒             31
    ];
  }

  if (id < 0 || id > 31) {
    console.error('piece id is error!');
    return null;
  }
  return dt[id];
}
