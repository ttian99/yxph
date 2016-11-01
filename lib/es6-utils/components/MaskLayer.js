import connectChild from '../cocos/connectChild';
/**
 * 如果希望在onTouchBegan中直接删除自身，且不希望事件继续往下传递
 * 可调用event.stopPropagation()
 *
 * 建议执行完退出动画后再删除自身，这样就没这个问题
 */

const MaskLayer = cc.Layer.extend({
  defaultProps: {
    color: cc.color(0, 0, 0, 170), // 为null时则只屏蔽touch事件
    onTouchBegan: () => true, // true 过滤点击事件，false 透传点击事件
  },
  ctor() {
    this._super();

    if (this.props.color) {
      this.addChild(new cc.LayerColor(this.props.color));
    }

    this.__touchListener = cc.EventListener.create({
      event: cc.EventListener.TOUCH_ONE_BY_ONE,
      swallowTouches: true,
      onTouchBegan: (touch, event) => {
        return this.props.onTouchBegan(touch, event);
      },
    });
    cc.eventManager.addListener(this.__touchListener, this);
  },

  onExit() {
    cc.eventManager.removeListener(this.__touchListener);
    this._super();
  },
});

const NewMaskLayer = connectChild(MaskLayer);
export default NewMaskLayer;
