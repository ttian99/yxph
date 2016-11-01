export default (itemName) => ({getState}) => next => action => {
  const preState = getState();
  const returnValue = next(action);
  if (!(action.meta && action.meta.disLocal)) {
    if (cc.sys.localStorage && !preState.equals(getState())) {
      console.debug('save to localStorage');
      cc.sys.localStorage.setItem(itemName, JSON.stringify(getState().toJS()));
    }
  }

  return returnValue;
};
