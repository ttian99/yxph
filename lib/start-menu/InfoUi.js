import logger from '../es6-utils/cocos/console.js';
const console = logger('InfoUi');
import {addSprite, addLabel} from '../es6-utils/cocos/base';
import {resIn} from '../loader/resource.js';
import Button from '../es6-utils/components/Button.js';
import Ltc from '../public/Ltc.js';
import {playEffect} from '../es6-utils/cocos/audio';
import FaceNode from '../face/FaceNode.js';
import UserInfo from '../public/UserInfo.js';
import {sliceLabel} from '../public/Extra.js';

const InfoUi = Ltc.Layer.extend({
  ctor() {
    this._super();
    this.initStatic();
  },
  initStatic() {
    // 背景
    const infoBg = addSprite(this, resIn.comm.Ltc_XQ_userInfo_bg, {
      x: 0, y: 0, align: 'bottom',
    });

    // 设置按钮
    const setBtn = new Button({
      normalRes: resIn.comm.Ltc_XQ_userInfo_set_btn,
      onTouchUpInside: () => {
        playEffect(res.audio.Ltc_XQ_btn_clicked_mp3);
        Ltc.sendEvent('SET_LAYER');
      },
    });
    setBtn.x = infoBg.width - 30;
    setBtn.y = 20;
    infoBg.addChild(setBtn);
    // 头像
    const face = this.face = new FaceNode(UserInfo.data.qq);
    face.x = 40;
    face.y = 35;
    face.scale = 0.85;
    infoBg.addChild(face);
    // 昵称
    this.nick = addLabel(infoBg, '', { x: 85, y: 23, align: 'left', color: cc.color(252, 230, 121), size: 16 });
    const scoreIcon = addSprite(infoBg, resIn.comm.score, { x: 230, y: 23, align: 'left', scale: 0.6 });
    this.score = addLabel(infoBg, '', { x: scoreIcon.x + 5 + scoreIcon.width * scoreIcon.scale, y: scoreIcon.y, align: 'left', color: cc.color(252, 230, 121), size: 16 });

    // 刷新数据
    this.fresh();
  },

  fresh() {
    console.log('-- fresh infoUi --');
    console.log(JSON.stringify(UserInfo.data));

    const name = sliceLabel(UserInfo.data.nick, 16, 7);
    // const
    this.nick.setString(name);
    this.score.setString(UserInfo.data.points);
    this.face.fresh(UserInfo.data.qq);
  },
});

export default InfoUi;
