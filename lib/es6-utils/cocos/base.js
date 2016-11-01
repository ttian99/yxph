let fontFamily = 'Tahoma,Roboto,"Droid Sans"';
import _ from 'lodash';

export default function init(_fontFamily = 'Arial') {
  fontFamily = _fontFamily;
}

export function getFontFamily() {
  return fontFamily;
}

function getAlign(align = 'center') {
  switch (align) {
    case 'top-left': return cc.p(0.0, 1.0);
    case 'top': return cc.p(0.5, 1.0);
    case 'top-right': return cc.p(1.0, 1.0);
    case 'left': return cc.p(0.0, 0.5);
    case 'right': return cc.p(1.0, 0.5);
    case 'bottom-left': return cc.p(0.0, 0.0);
    case 'bottom': return cc.p(0.5, 0.0);
    case 'bottom-right': return cc.p(1.0, 0.0);
    default: return cc.p(0.5, 0.5);
  }
}

export function addSprite(target, filename, { x = 0, y = 0, align = 'center', scale = 1 } = {}) {
  const s = new cc.Sprite(filename);
  s.x = x;
  s.y = y;
  s.scale = scale;
  s.setAnchorPoint(getAlign(align));
  target.addChild(s);
  return s;
}

/**
 * @param {cc.size} dimensions - 可显示区域，超过区域则自动换行
 */
export function addLabel(target, title, {
  x = 0, y = 0, size = 22, color = cc.color.BLACK,
  align = 'center', dimensions = null,
  strokeColor = null, strokeSize = 1.4,
} = {}) {
  const lb = new cc.LabelTTF(title, fontFamily, size, dimensions);
  lb.x = x;
  lb.y = y;
  lb.color = color;
  lb.setAnchorPoint(getAlign(align));
  if (strokeColor) lb.enableStroke(strokeColor, strokeSize);
  target.addChild(lb);
  return lb;
}

export function addBMFLabel(target, title, fntFile, {
  x = 0, y = 0, scale = 1, color = null, align = 'center',
} = {}) {
  const lb = new cc.LabelBMFont(title, fntFile);
  lb.x = x;
  lb.y = y;
  lb.scale = scale;
  lb.setAnchorPoint(getAlign(align));
  if (color) lb.setColor(color);
  target.addChild(lb);
  return lb;
}

export function showFPS(enabled = true) {
  cc.director.setDisplayStats(enabled);
  const {config, CONFIG_KEY} = cc.game;
  config[CONFIG_KEY.showFPS] = enabled;
}

export function setBMFontColor(fnt, sub0, color, xScale = 1.0, yScale = 1.0) {
  const sub = '' + sub0;
  const str = fnt.getString();
  const ret = [];
  let startIndex = 0;
  for (let i = 0; i < sub.length; i++) {
    const chr = sub[i];
    const index = str.indexOf(chr, startIndex);
    if (index >= 0) {
      ret.push(index);
      const subFnt = fnt.getChildByTag(index);
      if (!subFnt) {
        continue;
      }
      subFnt.setColor(color);
      subFnt.setScale(xScale, yScale);
      startIndex = index + 1;
    }
  }
  return ret;
}

export function setBMFontColorPro(fnt, baseColor, changeList) {
  const str = fnt.getString();
  const cache = {};
  changeList.forEach((change) => {
    const indexs = setBMFontColor(fnt, change.str, change.color);
    indexs.forEach((index) => {
      cache[index] = true;
    });
  });
  for (let i = 0; i < str.length; i++) {
    if (cache[i]) {
      continue;
    }
    const subFnt = fnt.getChildByTag(i);
    if (!subFnt) {
      continue;
    }
    subFnt.setColor(baseColor);
  }
}

export function changeSpriteRes(sprite, filename) {
  if (filename[0] === '#') {
    filename = _.trimLeft(filename, '#');
    sprite.initWithSpriteFrameName(filename);
  } else {
    sprite.initWithFile(filename);
  }
}
