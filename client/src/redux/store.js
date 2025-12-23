"use client";
// TODO: read about combineReducers
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import loaderReducer from "./loaderSlice";
import usersReducer from "./usersSlice";
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

const persistConfig = {
    key: 'root',
    storage,
    // TODO: read about this parameter
    whitelist: ['users'] // only users slice will be persisted
}

const rootReducer = combineReducers({
    loader: loaderReducer,
    users: usersReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    reducer: persistedReducer,
    // TODO: read about middleware
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            // TODO: read about serializableCheck
            serializableCheck: false,
        }),
});

export const persistor = persistStore(store);
export default store;