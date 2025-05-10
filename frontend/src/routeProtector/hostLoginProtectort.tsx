import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
// import { RootState } from "../redux/store";
import { loginSuccess } from "../redux/hostAuthSlice";

interface ProtectivePropsCheck {
  element: React.ReactNode;
}


const HostLoginProtector: React.FC<ProtectivePropsCheck> = ({ element }) => {

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const dispatch = useDispatch()

  const accessToken = queryParams.get('accessToken')
  const refreshToken = queryParams.get('refreshToken')

  if (accessToken && refreshToken) {
    dispatch(
      loginSuccess({
        accessToken: accessToken,
        refreshToken: refreshToken,
        isLoggedIn: true
      })
    )
  }


  // const isHostLoggedIn = useSelector((state: RootState) => state.hostAuth.accessToken) ;
  const newRefreshToken = localStorage.getItem("hostRefreshToken")
  console.log(newRefreshToken,'tokesn')
  // console.log(isHostLoggedIn)

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("hostRefreshToken");
    console.log(token,'sshshhs')
    if (!token || token == undefined) {
      navigate('/host/login');
    }
  }, [navigate]);


  return newRefreshToken ? <>{element}</> : null;
};

export default HostLoginProtector;
