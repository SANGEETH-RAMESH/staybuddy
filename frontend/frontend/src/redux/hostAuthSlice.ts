import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isLoggedIn : localStorage.getItem('hostAccessToken')?true:false,
    accessToken: localStorage.getItem("hostAccessToken") || "",
    refreshToken:localStorage.getItem("hostRefreshToken") || ""
}

const hostAuthSlice = createSlice({
    name:"hostAuth",
    initialState,
    reducers:{
        loginSuccess:(state,action) =>{
            localStorage.setItem('hostAccessToken',action.payload.accessToken);
            localStorage.setItem('hostRefreshToken',action.payload.refreshToken);
            state.isLoggedIn = action.payload.isLoggedIn;
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken
        },
        logout:(state,action) =>{
            localStorage.removeItem('hostAccessToken');
            localStorage.removeItem('hostRefreshToken');
            state.isLoggedIn = action.payload.isLoggedIn;
            state.accessToken = "";
            state.refreshToken = "";
        }
    }
})
export const {loginSuccess,logout} = hostAuthSlice.actions;

export default hostAuthSlice.reducer;