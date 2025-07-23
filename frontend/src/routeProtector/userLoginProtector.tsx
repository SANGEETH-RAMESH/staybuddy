import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { loginSuccess } from "../redux/userAuthSlice";

interface ProtectivePropsCheck {
  element: React.ReactNode;
}

const UserLoginProtector: React.FC<ProtectivePropsCheck> = ({ element }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const accessToken = queryParams.get('userAccessToken');
  const refreshToken = queryParams.get('userRefreshToken');
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    if (accessToken && refreshToken) {
      localStorage.setItem("userRefreshToken", refreshToken);
      dispatch(
        loginSuccess({
          accessToken,
          refreshToken,
          isLoggedIn: true
        })
      );
    }
    
    const storedRefreshToken = localStorage.getItem("userRefreshToken");
    if (!storedRefreshToken) {
      navigate('/login');
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
  }, [accessToken, refreshToken, dispatch, navigate]);
  
  if (isAuthenticated === null) {
    return null;
  }
  
  return isAuthenticated ? element : null;
};

export default UserLoginProtector;