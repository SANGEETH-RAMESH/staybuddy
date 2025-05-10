import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isLoggedIn : localStorage.getItem('adminToken')?true:false,
    accessToken: localStorage.getItem("adminToken") || "",
    refreshToken:localStorage.getItem("adminToken") || ""
}

const adminAuthSlice = createSlice({
    name:"adminAuth",
    initialState,
    reducers:{
        loginSuccess:(state,action) =>{
            localStorage.setItem('adminToken',action.payload.token)
            state.isLoggedIn = action.payload.isLoggedIn
            state.accessToken = action.payload.accessToken
            state.refreshToken = action.payload.refreshToken
        },
        logout:(state,action) =>{
            localStorage.removeItem('adminToken');
            state.isLoggedIn = action.payload.isLoggedIn
            state.accessToken = ""
            state.refreshToken = ""
        }
    }
})

export const {loginSuccess,logout} = adminAuthSlice.actions;

export default adminAuthSlice.reducer;