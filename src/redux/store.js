import { configureStore } from "@reduxjs/toolkit"
import createSagaMiddleware from "redux-saga";
import rootReducer from './rootReducer';
import rootSaga from "@/middleware/rootSaga";
import {
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware(
      {
        thunk: false,
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      },
    ).prepend(sagaMiddleware);
  }
})
export const persistor = persistStore(store);
sagaMiddleware.run(rootSaga);