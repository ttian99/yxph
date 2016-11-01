import logger from '../es6-utils/cocos/console.js';
const console = logger('ChatLayer');
import {addSprite} from '../es6-utils/cocos/base';
import {resIn} from '../loader/resource.js';
import Button from '../es6-utils/components/Button.js';
import Cnt from '../public/Const.js';
import Ltc from '../public/Ltc.js';

const ChatLayer = Ltc.Layer.extend({
  ctor() {
    this._super();
    this.msg = '';
    this.initStatic();
  },
  initStatic() {
    // chat背景
    const bg = this.bg = addSprite(this, resIn.chat.Ltc_XQ_chat_bg, {
      x: cc.visibleRect.center.x, y: cc.visibleRect.center.y,
    });
    this.bgTouchesEvent(bg);

    // 输入框editbox
    const eb1 = new cc.Sprite(resIn.chat.Ltc_XQ_chat_editbox);
    const box = this.box = new cc.EditBox(cc.size(220, 30), eb1);
    box.x = bg.width / 2 - 40;
    box.y = bg.height - 50;
    box.fontSize = 20;
    box.maxLength = 26;
    box.setPlaceHolder('请输入,最多26个字');
    box.setPlaceholderFontSize(22);
    box.editBoxEditingDidBegin = () => { };
    box.editBoxEditingDidEnd = () => { };
    box.editBoxTextChanged = (editBox, text) => {
      this.msg = text;
    };
    box.editBoxReturn = () => { };
    box.setDelegate(box);
    bg.addChild(box);

    // 发送按钮
    const sendBtn = new Button({
      normalRes: resIn.chat.Ltc_XQ_chat_send_btn,
      onTouchUpInside: () => {
        this.sendMsg(this.msg);
      },
    });
    sendBtn.x = bg.width - 45;
    sendBtn.y = bg.height - 50;
    bg.addChild(sendBtn);

    // 常用短语菜单
    const menu = this.menu = new cc.Menu();
    const arr = Cnt.chatStrArr;
    arr.forEach((some, idx) => {
      const label = new cc.LabelTTF(some, 'Arial', 20);
      label.color = cc.color(59, 23, 3);
      const menuItem = new cc.MenuItemLabel(label, this.clickMenuItem, this);
      menuItem.anchorX = 0;
      menuItem.y = -1 * 38 * idx;
      menu.addChild(menuItem, idx + 10000);
    }, this);
    console.log(menu.anchorX, menu.anchorY);
    menu.x = 30;
    menu.y = bg.height - 105;
    bg.addChild(menu);
  },
  // 短语点击回调
  clickMenuItem(sender) {
    const self = this;
    const idx = sender.getLocalZOrder() - 10000;
    const arr = Cnt.chatStrArr;
    self.msg = arr[idx];
    self.sendMsg(this.msg, true);
  },
  // 发送消息
  sendMsg(msg, isClose) {
    console.log('-- sendMsg: ' + msg + ' --');
    if (msg.length === 0) {
      console.log('发送消息不能为空！');
      return;
    }

    // const obj = this.checkSenWords(msg);
    // console.log(obj);
    // if (obj.isSenWords) {
    //   this.box.setString(msg);
    //   console.log('含有非法字符，请重新输入！');
    //   return;
    // }

    // 发送消息到服务端
    net.sendChat(msg);
    // 关闭本层
    if (isClose) {
      this.removeFromParent(true);
    }
  },
  // 检测是否包含敏感词
  checkSenWords(str) {
    console.log('--------------- checkSenwords -----------------');
    console.log(str);
    let unShow;
    const ret = {isSenWords: false};
    const senWordsArr = Cnt.senWordsArr;
    for (let i = 0; i < senWordsArr.length; i++) {
      const senStr = senWordsArr[i];
      const pattern = new RegExp(senStr, 'g');
      unShow = pattern.test(str);

      if (unShow) {
        ret.str = senStr;
        ret.isSenWords = true;
        break;
      } else {
        ret.str = '';
        ret.isSenWords = false;
      }
    }
    return ret;
  },
});

export default ChatLayer;
