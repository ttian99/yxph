import Cnt from './Const.js';

/**
 * @param {Number} score - 个人积分
 * return {String} LvName - 等级称号
 */
export function getLvName(score = 0) {
  for (let i = Cnt.LvName.length - 1; i > 0; i--) {
    if (score >= Cnt.LvName[Cnt.LvName.length - 1].start) {
      return Cnt.LvName[Cnt.LvName.length - 1].name;
    } else if (score >= Cnt.LvName[i - 1].start && score < Cnt.LvName[i].start) {
      return Cnt.LvName[i - 1].name;
    }
  }
}

export function getNextLvOffsetScore(score) {
  for (let i = Cnt.LvName.length - 1; i > 0; i--) {
    if (score >= Cnt.LvName[Cnt.LvName.length - 1].start) {
      return 0;
    } else if (score >= Cnt.LvName[i - 1].start && score < Cnt.LvName[i].start) {
      return Cnt.LvName[i].start - score;
    }
  }
  return 0;
}

export function getStrLen(str) {
  let len = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    // 单字节加1
    if ((c >= 0x0001 && c <= 0x007e) || (c >= 0xff60 && c <= 0xff9f)) {
      len++;
    } else {
      len = len + 2;
    }
  }
  return len;
}


/**
 * 检测字符码是否为汉字
 * @param {Number} charCode - 需要检测的字符码(可通过string.charCodeAt(idx)获得字符码)
 * @return {Boolean} ret - true：汉字, false：非汉字
 * */
function isChineseLetter(charCode) {
  let ret;
  if ((charCode >= 0x0001 && charCode <= 0x007e) || (charCode >= 0xff60 && charCode <= 0xff9f)) {
    ret = false;
  } else {
    ret = true;
  }
  return ret;
}

/**
 * LabelTTF的宽度检测
 * @param {String} str - 需要检测的字符串
 * @param {Number} labelSize - 设定的label的size
 * @param {Number} labelWidth - 设定的label的最大宽度
 * return {Object} obj - 截取后的字符串
 * */
function checkLabelWidth(str, labelSize, labelWidth) {
  const obj = {
    str: str,  // 字符串
    renderArr: [], // 需要留下来的字符
    leftArr: [], // 需要截去的字符
    width: 0, // 字符串的总的宽度
  };
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    const letter = str.charAt(i);
    const check = isChineseLetter(c);
    if (check) {
      obj.width += labelSize;
    } else {
      obj.width += labelSize / 2;
    }
    if (obj.width <= labelWidth) {
      obj.renderArr.push(letter);
    } else {
      obj.leftArr.push(letter);
    }
  }
  return obj;
}

/**
 * 截取字符串
 * @param {String} str - 需要截取的字符串
 * @param {Number} labelSize - 设定的label的size
 * @param {Number} count - 需要截取的字符个数
 * return {String} sliceStr - 截取后的字符串
 * */
export function sliceLabel(str, labelSize, count) {
  let sliceStr = str;
  const labelWidth = labelSize * count;
  const checkObj = checkLabelWidth(str, labelSize, labelWidth);
  if (checkObj.width > labelWidth) {
    sliceStr = sliceStr.slice(0, checkObj.renderArr.length) + '..';
  }
  return sliceStr;
}
