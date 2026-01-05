import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isLoggedIn :localStorage.getItem('adminAccessToken')?true:false,
    accessToken: localStorage.getItem("adminAccessToken") || "",
    refreshToken:localStorage.getItem("adminRefreshToken") || ""
}

const adminAuthSlice = createSlice({
    name:"adminAuth",
    initialState,
    reducers:{
        loginSuccess:(state,action) =>{
            localStorage.setItem('adminAccessToken',action.payload.accessToken);
            localStorage.setItem('adminRefreshToken',action.payload.refreshToken);
            state.isLoggedIn = action.payload.isLoggedIn
            state.accessToken = action.payload.accessToken
            state.refreshToken = action.payload.refreshToken
        },
        logout:(state,action) =>{
            localStorage.removeItem('adminAccessToken');
            localStorage.removeItem('adminRefreshToken');
            state.isLoggedIn = action.payload.isLoggedIn
            state.accessToken = ""
            state.refreshToken = ""
        }
    }
})

export const {loginSuccess,logout} = adminAuthSlice.actions;

export default adminAuthSlice.reducer;