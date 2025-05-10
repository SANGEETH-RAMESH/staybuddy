import { configureStore } from "@reduxjs/toolkit";
import userAuthReducer from './userAuthSlice'
import hostAuthReducer from './hostAuthSlice'
import adminAuthReducer from './adminAuthSlice'

const store = configureStore({
    reducer:{
        userAuth:userAuthReducer,
        hostAuth:hostAuthReducer,
        adminAuth:adminAuthReducer
    }
})

export type RootState = ReturnType<typeof store.getState>;

// export type AppDispatch = typeof store.dispatch;

export default store