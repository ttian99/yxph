import shallowEqual from '../utils/shallowEqual';
import isPlainObject from '../utils/isPlainObject';
import wrapActionCreators from '../utils/wrapActionCreators';

const defaultMapStateToProps = () => ({});
const defaultMapDispatchToProps = dispatch => ({ dispatch });
const defaultMergeProps = (stateProps, dispatchProps, parentProps) => ({
  ...parentProps,
  ...stateProps,
  ...dispatchProps,
});

export default function connect(node, mapStateToProps, mapDispatchToProps, mergeProps) {
  const finalMapStateToProps = mapStateToProps || defaultMapStateToProps;
  const finalMapDispatchToProps = isPlainObject(mapDispatchToProps) ?
    wrapActionCreators(mapDispatchToProps) :
    mapDispatchToProps || defaultMapDispatchToProps;
  const finalMergeProps = mergeProps || defaultMergeProps;
  const shouldUpdateStateProps = finalMapStateToProps.length > 1;
  const shouldUpdateDispatchProps = finalMapDispatchToProps.length > 1;

  function computeStateProps(store, props) {
    const state = store.getState();
    const stateProps = shouldUpdateStateProps ?
      finalMapStateToProps(state, props) :
      finalMapStateToProps(state);

    return stateProps;
  }

  function computeDispatchProps(store, props) {
    const { dispatch } = store;
    const dispatchProps = shouldUpdateDispatchProps ?
      finalMapDispatchToProps(dispatch, props) :
      finalMapDispatchToProps(dispatch);

    return dispatchProps;
  }

  function computeNextState(stateProps, dispatchProps, parentProps) {
    const mergedProps = finalMergeProps(stateProps, dispatchProps, parentProps);

    return mergedProps;
  }

  return node.extend({
    ctor(props) {
      this.store = store;
      this.refs = {};
      this.originProps = props;
      this.stateProps = computeStateProps(this.store, props);
      this.dispatchProps = computeDispatchProps(this.store, props);
      this.props = {...this.defaultProps, ...props};
      if (this.getInitialState) {
        this.state = {storeState: this.store.getState(), ...this.getInitialState()};
      } else {
        this.state = {storeState: this.store.getState()};
      }
      this.updateState();
      this.props = {...this.props, ...this.nextState};

      this.trySubscribe();
      this._super();
    },

    shouldComponentUpdate(nextProps, nextState) {
      const storeChanged = nextState.storeState !== this.state.storeState;
      const propsChanged = !shallowEqual(nextProps, this.props);
      let mapStateProducedChange = false;
      let dispatchPropsChanged = false;

      if (storeChanged || (propsChanged && shouldUpdateStateProps)) {
        mapStateProducedChange = this.updateStateProps(nextProps);
      }

      if (propsChanged && shouldUpdateDispatchProps) {
        dispatchPropsChanged = this.updateDispatchProps(nextProps);
      }

      if (propsChanged || mapStateProducedChange || dispatchPropsChanged) {
        this.updateState(nextProps);
        return true;
      }

      if (!shallowEqual(this.state, nextState)) {
        return true;
      }

      return false;
    },

    handleChange() {
      if (!this.unsubscribe) {
        return;
      }

      this.setState({
        storeState: this.store.getState(),
      });
    },

    trySubscribe() {
      if (!this.unsubscribe) {
        this.unsubscribe = store.subscribe(::this.handleChange);
      }
    },

    tryUnsubscribe() {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
    },

    isSubscribed() {
      return typeof this.unsubscribe === 'function';
    },

    setState(state) {
      const nextState = {...this.state, ...state};
      if (this.shouldComponentUpdate(this.props, nextState)) {
        this.props = {...this.defaultProps, ...this.originProps, ...this.nextState};
        this.state = nextState;
        if (this.render) this.render();
      } else {
        this.props = {...this.defaultProps, ...this.originProps, ...this.nextState};
        this.state = nextState;
      }
    },

    updateProps(nextProps) {
      nextProps = {...this.defaultProps, ...nextProps};
      if (this.shouldComponentUpdate(nextProps, this.state)) {
        this.props = {...this.defaultProps, ...this.originProps, ...this.nextState};
        if (this.render) this.render();
      } else {
        this.props = {...this.defaultProps, ...this.originProps, ...this.nextState};
      }
    },

    computeNextState(props = this.props) {
      return computeNextState(
        this.stateProps,
        this.dispatchProps,
        props,
      );
    },

    updateStateProps(props = this.props) {
      const nextStateProps = computeStateProps(this.store, props);
      if (shallowEqual(nextStateProps, this.stateProps)) {
        return false;
      }

      this.stateProps = nextStateProps;
      return true;
    },

    updateDispatchProps(props = this.props) {
      const nextDispatchProps = computeDispatchProps(this.store, props);
      if (shallowEqual(nextDispatchProps, this.dispatchProps)) {
        return false;
      }

      this.dispatchProps = nextDispatchProps;
      return true;
    },

    updateState(props = this.props) {
      this.nextState = this.computeNextState(props);
    },

    onExit() {
      this.tryUnsubscribe();
      this._super();
    },
  });
}
