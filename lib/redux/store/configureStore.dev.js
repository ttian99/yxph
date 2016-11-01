import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import rootReducer from '../reducers';
import cocosLocalStorage from '../middleware/cocosLocalStorage';

const middlewareArr = [
  cocosLocalStorage('pobabyGameState'),
];

if (!cc.sys.isNative) {
  middlewareArr.push(
    thunkMiddleware,
    createLogger({
      stateTransformer: (state) => {
        // for support Immutable
        return state.toJS();
      },
    })
  );
}
const finalCreateStore = compose(
  // Enables your middleware:
  applyMiddleware(...middlewareArr) // any Redux middleware, e.g. redux-thunk
)(createStore);

export default function configureStore() {
  const store = finalCreateStore(rootReducer);
  return store;
}
