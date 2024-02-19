import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { routerReducer as routing, routerMiddleware } from "react-router-redux";
import promise from "redux-promise";

import { PLUGIN_REDUX_MIDDLEWARES } from "metabase/plugins";

import { ApiKeysApi } from "./redux/api";

export function getStore(reducers, history, intialState) {
  const reducer = combineReducers({
    ...reducers,
    routing,
    [ApiKeysApi.reducerPath]: ApiKeysApi.reducer, // TODO: move
  });

  return configureStore({
    reducer,
    preloadedState: intialState,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
      })
        .concat(ApiKeysApi.middleware)
        .concat([
          promise,
          ...(history ? [routerMiddleware(history)] : []),
          ...PLUGIN_REDUX_MIDDLEWARES,
        ]),
  });
}
