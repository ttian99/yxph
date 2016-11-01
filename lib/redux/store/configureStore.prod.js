import { createStore, applyMiddleware } from 'redux';
import rootReducer from '../reducers';
import cocosLocalStorage from '../middleware/cocosLocalStorage';

const createStoreWithMiddleware = applyMiddleware(
  cocosLocalStorage('pobabyGameState')
)(createStore);

export default function configureStore() {
  const store = createStoreWithMiddleware(rootReducer);
  return store;
}
