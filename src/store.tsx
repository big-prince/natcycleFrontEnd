// configure store with redux
import { configureStore } from "@reduxjs/toolkit";

// import reducers
import rootReducer from "./reducers/rootReducer";

// create store
export const store = configureStore({
  reducer: rootReducer,
});

// export type of RootState
export type RootState = ReturnType<typeof store.getState>;

// export type of AppDispatch
export type AppDispatch = typeof store.dispatch;

// export default store
export default store;
