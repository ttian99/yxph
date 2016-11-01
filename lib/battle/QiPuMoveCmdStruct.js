
const QiPuMoveCmdStruct = cc.Class.extend({
  chessIndex: undefined, // 表示是哪个棋子: [0~31]
  reserved: 32,
  redBlack: undefined, // 表示此步走子为红方还是黑方，1代表红方，0代表黑方。默认红方先走
  ySrc: undefined, // 走步前该棋子的纵坐标位置
  xSrc: undefined, // 走步前该棋子的横坐标位置
  yDst: undefined, // 走步后该棋子的纵坐标位置
  xDst: undefined, // 走步后该棋子的横坐标位置
  reserved2: 0,
  order: 0,  // 表示是总棋谱中的第几步走子。从1开始
  reserved3: 0,
  killIndex: -1, // 表示吃掉的棋子: [0~31]
  ctor() {
  },
});

export default QiPuMoveCmdStruct;
