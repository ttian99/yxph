/**
 * @param {float} delayTime - 单位为s
 */
export function moveIn(node, duration, {
  delayTime = 0, type = 'LEFT_IN', distance = 0,
  easingPeriod = 0.3, onEnd = () => {},
} = {}) {
  let action = null;
  switch (type) {
    case 'LEFT_IN':
      node.x -= distance;
      action = cc.moveBy(duration, cc.p(distance, 0)).easing(cc.easeElasticOut(easingPeriod));
      break;
    case 'RIGHT_IN':
      node.x += distance;
      action = cc.moveBy(duration, cc.p(-distance, 0)).easing(cc.easeElasticOut(easingPeriod));
      break;
    case 'TOP_IN':
      node.y += distance;
      action = cc.moveBy(duration, cc.p(0, -distance)).easing(cc.easeElasticOut(easingPeriod));
      break;
    case 'BOTTOM_IN':
      node.y -= distance;
      action = cc.moveBy(duration, cc.p(0, distance)).easing(cc.easeElasticOut(easingPeriod));
      break;
    case 'FADE_IN':
      node.opacity = 0;
      action = cc.fadeIn(duration);
      break;
    case 'SCALE_IN':
      node.scale = 0;
      action = cc.scaleTo(duration, 1);
      break;
    default:
      return console.log('unknown type', type);
  }
  const callFunc = cc.callFunc(onEnd, this);
  const seq = cc.sequence(cc.delayTime(delayTime), action, callFunc);
  node.runAction(seq);
}

export function moveOut(node, duration, {
  delayTime = 0, type = 'LEFT_OUT', distance = 0,
  easingPeriod = 0.3, onEnd = () => {},
}) {
  let action = null;
  switch (type) {
    case 'LEFT_OUT':
      action = cc.moveBy(duration, cc.p(-distance, 0)).easing(cc.easeElasticOut(easingPeriod));
      break;
    case 'RIGHT_OUT':
      action = cc.moveBy(duration, cc.p(distance, 0)).easing(cc.easeElasticOut(easingPeriod));
      break;
    case 'TOP_OUT':
      action = cc.moveBy(duration, cc.p(0, -distance)).easing(cc.easeElasticOut(easingPeriod));
      break;
    case 'BOTTOM_OUT':
      action = cc.moveBy(duration, cc.p(0, distance)).easing(cc.easeElasticOut(easingPeriod));
      break;
    case 'FADE_OUT':
      node.opacity = 100;
      action = cc.fadeOut(duration);
      break;
    case 'SCALE_OUT':
      action = cc.scaleTo(duration, 0);
      break;
    default:
      return console.log('unknown type', type);
  }
  const callFunc = cc.callFunc(onEnd, this);
  const seq = cc.sequence(cc.delayTime(delayTime), action, callFunc);
  node.runAction(seq);
}
