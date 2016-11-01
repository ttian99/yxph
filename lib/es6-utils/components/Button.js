import connectChild from '../cocos/connectChild';
import {addLabel, addBMFLabel, changeSpriteRes} from '../cocos/base';

const Button = cc.Sprite.extend({
  getInitialState() {
    return {
      enabled: true,
      selected: false,
      highlighted: false,
      isPushed: false, // 是否按下了
    };
  },

  defaultProps: {
    normalRes: null,  // 普通状态资源
    activeRes: null,  // 按下状态资源
    disableRes: null, // 禁用状态资源
    title: null,      // 文字，默认居中
    titleSize: 22,    // 文字大小
    titleColor: cc.color.WHITE, // 文字颜色
    titleStrokeColor: null,
    titleWeight: null,
    titleOffX: 0,
    titleOffY: 0,
    fntFile: null,    // 如果设置了则绘制文字时使用BMFont
    fntScale: 1,
    disabled: false,  // 是否是禁用状态
    zoomTouchDown: true, // 触摸是否放大
    onTouchDown: () => { }, // 按下
    onTouchUpInside: () => { }, // 在Button区域内弹起
    onTouchUpOutside: () => { }, // 在Button区域外弹起
  },

  ctor() {
    const defaultImg = (this.props.disabled ? this.props.disableRes : this.props.normalRes);
    this._super(defaultImg);

    this.__touchListener = cc.EventListener.create({
      event: cc.EventListener.TOUCH_ONE_BY_ONE,
      swallowTouches: true,
      onTouchBegan: (touch) => {
        if (!this.isTouchInside(touch) || !this.isEnabled() || !this.isVisible() || !this.hasVisibleParents()) {
          return false;
        }
        this.state.isPushed = true;
        this.setHighlighted(true);

        // touchdown event
        this.props.onTouchDown();
        return true;
      },
      onTouchMoved: (touch) => {
        if (!this.state.enabled || !this.state.isPushed || this.state.selected) {
          if (this.state.highlighted) this.setHighlighted(false);
          return;
        }

        const isTouchMoveInside = this.isTouchInside(touch);
        if (isTouchMoveInside && !this.state.highlighted) {
          this.setHighlighted(true);
          // touch drag enter
        } else if (isTouchMoveInside && this.state.highlighted) {
          // touch drag inside
        } else if (!isTouchMoveInside && this.state.highlighted) {
          this.setHighlighted(false);
          // touch drag exit
        } else if (!isTouchMoveInside && !this.state.highlighted) {
          // touch drag outside
        }
      },
      onTouchEnded: (touch) => {
        this.state.isPushed = false;
        this.setHighlighted(false);

        if (this.isTouchInside(touch)) {
          // touch up inside
          this.props.onTouchUpInside(this);
        } else {
          this.props.onTouchUpOutside();
        }
      },
      onTouchCanceled: () => {
        this.state.isPushed = false;
        this.setHighlighted(false);
        // touch cancel
      },
    });
    cc.eventManager.addListener(this.__touchListener, this);

    this.render();
  },

  onExit() {
    cc.eventManager.removeListener(this.__touchListener);
    this._super();
  },

  isEnabled() {
    return !this.props.disabled;
  },

  setIsDisabled(bvar) {
    this.props.disabled = bvar;
    if (this.props.disableRes) {
      this.render();
    }
  },

  isDisabled() {
    return this.props.disabled;
  },

  setSelected(selected) {
    if (this.state.selected !== selected) {
      this.state.selected = selected;
      this.render();
    }
  },

  isSelected() {
    return this.state.selected;
  },

  setHighlighted(highlighted) {
    if (this.state.highlighted !== highlighted) {
      this.state.highlighted = highlighted;
      this.render();
    }

    if (this.props.zoomTouchDown) {
      const scaleValue = (this.isHighlighted() && this.isEnabled() && !this.isSelected()) ? 1.1 : 1.0;
      this.scale = scaleValue;
    }
  },

  isHighlighted() {
    return this.state.highlighted;
  },

  hasVisibleParents() {
    const parent = this.getParent();
    for (let c = parent; c !== null; c = c.getParent()) {
      if (!c.isVisible()) return false;
    }
    return true;
  },

  render() {
    if (this.props.disabled) {
      if (!this.props.disableRes) console.error(new Error('no disableRes'));
      changeSpriteRes(this, this.props.disableRes);
    } else {
      changeSpriteRes(this, this.props.normalRes);
    }

    if (this.props.title) {
      if (!this.refs.title) {
        if (this.props.fntFile) {
          this.refs.title = addBMFLabel(this, this.props.title, this.props.fntFile, {
            x: this.width / 2 + this.props.titleOffX,
            y: this.height / 2 + this.props.titleOffY,
            scale: this.props.fntScale,
          });
        } else {
          this.refs.title = addLabel(this, this.props.title, {
            x: this.width / 2 + this.props.titleOffX,
            y: this.height / 2 + this.props.titleOffY,
            size: this.props.titleSize,
            color: this.props.titleColor,
            strokeColor: this.props.titleStrokeColor,
          });
          if (!cc.sys.isNative && this.props.titleWeight) this.refs.title._setFontWeight(this.props.titleWeight);
        }
        this.refs.title.zIndex = 1;
      } else {
        this.refs.title.setString(this.props.title);
      }
    }
  },

  isTouchInside(touch) {
    let touchLocation = touch.getLocation(); // Get the touch position
    touchLocation = this.getParent().convertToNodeSpace(touchLocation);
    return cc.rectContainsPoint(this.getBoundingBox(), touchLocation);
  },
});

const NewButton = connectChild(Button);

export default NewButton;
