import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isLoggedIn : localStorage.getItem('userAccessToken')?true:false,
    accessToken: localStorage.getItem('userAccessToken') || "",
    refreshToken:localStorage.getItem('userRefreshToken') || ""
}

const userAuthSlice = createSlice({
    name:'userAuth',
    initialState,
    reducers:{
        loginSuccess:(state,action) =>{
            localStorage.setItem('userAccessToken',action.payload.accessToken)
            localStorage.setItem('userRefreshToken',action.payload.refreshToken)
            state.isLoggedIn = action.payload.isLoggedIn
            state.accessToken = action.payload.accessToken
            state.refreshToken = action.payload.refreshToken
        },
        logout:(state,action) =>{
            localStorage.removeItem('userAccessToken');
            localStorage.removeItem('userRefreshToken');
            state.isLoggedIn = action.payload.isLoggedIn
            state.accessToken = ""
            state.refreshToken = ""
        }
    }
})

export const {loginSuccess,logout} = userAuthSlice.actions;

export default userAuthSlice.reducer;