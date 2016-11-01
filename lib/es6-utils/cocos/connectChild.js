import shallowEqual from '../utils/shallowEqual';

export default function connectChild(node) {
  return node.extend({
    ctor(props) {
      this.props = {...this.defaultProps, ...props};
      this.refs = {};
      if (this.getInitialState) {
        this.state = {...this.getInitialState()};
      } else {
        this.state = {};
      }
      this._super();
    },

    setState(state) {
      const nextState = {...this.state, ...state};
      if (!shallowEqual(this.state, nextState)) {
        this.state = nextState;
        if (this.render) this.render();
      }
    },

    updateProps(nextProps) {
      nextProps = {...this.defaultProps, ...nextProps};
      if (!shallowEqual(this.props, nextProps)) {
        this.props = nextProps;
        if (this.render) this.render();
      }
    },

    mergeProps(newProps) {
      newProps = {...this.defaultProps, ...this.props, ...newProps};
      if (!shallowEqual(this.props, newProps)) {
        this.props = newProps;
        if (this.render) {
          console.log('try render');
          this.render();
        }
      }
    },
  });
}
