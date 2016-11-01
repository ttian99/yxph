import MaskLayer from '../es6-utils/components/MaskLayer';
import {res, resIn} from '../loader/resource.js';
import {addSprite} from '../es6-utils/cocos/base.js';
import Button from '../es6-utils/components/Button';
import {isEnableMusic, enableMusic, disableMusic, isEnableEffect, enableEffect, disableEffect} from '../es6-utils/cocos/audio';
import {playEffect} from '../es6-utils/cocos/audio';
import Ltc from '../public/Ltc.js';
// import AboutLayer from '../start-menu/AboutLayer.js';
// import cfg from '../constants';

const SetLayer = Ltc.Layer.extend({

  ctor() {
    this._super();
    this.renderStatic();
  },

  renderStatic() {
    const maskLayer = new MaskLayer();
    this.addChild(maskLayer);

    const {x, y} = cc.visibleRect.center;
    this.bg = addSprite(maskLayer, resIn.set.Ltc_XQ_set_bg, { x, y });
    // this.bgTouchesEvent(setBg);
    this.swallowTouchesEvent();
    this.initBtn();
  },

  initBtn() {
    // 关闭按钮
    const closeBtn = new Button({
      normalRes: resIn.set.Ltc_XQ_set_closeBtn,
      onTouchUpInside: () => {
        playEffect(res.audio.Ltc_XQ_btn_clicked_mp3);
        console.log('--------- click closeBtn -------');
        this.close();
      },
    });
    closeBtn.x = this.bg.width - 26;
    closeBtn.y = this.bg.height - 22;
    // closeBtn.setAnchorPoint(cc.p(1.0, 1.0));
    this.bg.addChild(closeBtn);
    // 音乐按钮
    let musicBtn = null;
    const musicBtnProps = {
      normalRes: isEnableMusic() ? resIn.set.Ltc_XQ_set_onBtn : resIn.set.Ltc_XQ_set_offBtn,
      zoomTouchDown: false,
      onTouchUpInside: () => {
        console.log('click music btn');
        playEffect(res.audio.Ltc_XQ_btn_clicked_mp3);
        isEnableMusic() ? disableMusic() : enableMusic(res.audio.Ltc_XQ_room_bg_music_mp3);
        const newProps = {normalRes: isEnableMusic() ? resIn.set.Ltc_XQ_set_onBtn : resIn.set.Ltc_XQ_set_offBtn};
        musicBtn.mergeProps(newProps);
      },
    };
    musicBtn = new Button(musicBtnProps);
    musicBtn.x = this.bg.width - 85;
    musicBtn.y = 280;
    this.bg.addChild(musicBtn);

    // 音效按钮
    let effectBtn = null;
    const effectBtnProps = {
      normalRes: isEnableEffect() ? resIn.set.Ltc_XQ_set_onBtn : resIn.set.Ltc_XQ_set_offBtn,
      zoomTouchDown: false,
      onTouchUpInside: () => {
        console.log('click effect btn');
        playEffect(res.audio.Ltc_XQ_btn_clicked_mp3);
        isEnableEffect() ? disableEffect() : enableEffect();
        const newProps = {normalRes: isEnableEffect() ? resIn.set.Ltc_XQ_set_onBtn : resIn.set.Ltc_XQ_set_offBtn};
        effectBtn.mergeProps(newProps);
      },
    };
    effectBtn = new Button(effectBtnProps);
    effectBtn.x = this.bg.width - 85;
    effectBtn.y = 215;
    this.bg.addChild(effectBtn);

    // 版本更新按钮
    const updateBtn = new Button({
      normalRes: resIn.set.Ltc_XQ_set_updateBtn,
      disableRes: resIn.set.Ltc_XQ_set_updateBtn,
      zoomTouchDown: false,
      onTouchUpInside: () => {
        playEffect(res.audio.Ltc_XQ_btn_clicked_mp3);
        console.log('--------- click updateBtn -------');
      },
      disabled: true,
    });
    updateBtn.x = this.bg.width - 85;
    updateBtn.y = 140;
    this.bg.addChild(updateBtn);

    // 帮助按钮
    const helpBtn = new Button({
      normalRes: resIn.set.Ltc_XQ_set_helpBtn,
      onTouchUpInside: () => {
        playEffect(res.audio.Ltc_XQ_btn_clicked_mp3);
        console.log('--------- click helpBtn -------');
      },
    });
    helpBtn.x = this.bg.width - 85;
    helpBtn.y = 75;
    this.bg.addChild(helpBtn);
    // 关于按钮
    const aboutBtn = new Button({
      normalRes: resIn.set.Ltc_XQ_set_aboutBtn,
      onTouchUpInside: () => {
        playEffect(res.audio.Ltc_XQ_btn_clicked_mp3);
        console.log('--------- click aboutBtn -------');
      },
    });
    aboutBtn.x = 85;
    aboutBtn.y = 75;
    this.bg.addChild(aboutBtn);
  },

  close() {
    this.removeFromParent(true);
  },
});

export default SetLayer;
